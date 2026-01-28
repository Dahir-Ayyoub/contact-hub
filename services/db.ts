
import initSqlJs from 'https://esm.sh/sql.js@1.12.0/dist/sql-wasm.js';
import { DEFAULT_CITIES } from '../constants';

let dbInstance: any = null;
let SQL: any = null;

const DB_KEY = 'contacthub_sqlite_bin_v2';
const WASM_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm';

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  try {
    console.debug("Initializing SQLite Database...");
    
    const wasmResponse = await fetch(WASM_URL);
    if (!wasmResponse.ok) throw new Error(`Failed to fetch WASM from ${WASM_URL}`);
    const wasmBinary = await wasmResponse.arrayBuffer();

    SQL = await initSqlJs({
      wasmBinary: wasmBinary
    });

    const savedData = localStorage.getItem(DB_KEY);
    if (savedData) {
      try {
        const binaryString = atob(savedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        dbInstance = new SQL.Database(bytes);
      } catch (e) {
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
    }

    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phoneNumber TEXT,
        faxNumber TEXT,
        city TEXT,
        notes TEXT,
        createdAt INTEGER
      )
    `);

    // Migration check: Add email column if it doesn't exist for returning users
    try {
      dbInstance.run("ALTER TABLE contacts ADD COLUMN email TEXT");
    } catch (e) {
      // Column likely already exists
    }

    const checkCities = dbInstance.prepare("SELECT COUNT(*) as count FROM cities");
    checkCities.step();
    const cityCount = checkCities.getAsObject().count;
    checkCities.free();

    if (cityCount === 0) {
      DEFAULT_CITIES.forEach(name => {
        dbInstance.run("INSERT INTO cities (id, name) VALUES (?, ?)", [crypto.randomUUID(), name]);
      });
      saveDB();
    }

    return dbInstance;
  } catch (error) {
    console.error("Critical SQLite Initialization Error:", error);
    throw error;
  }
};

export const saveDB = () => {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    let binary = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i]);
    }
    const base64 = btoa(binary);
    localStorage.setItem(DB_KEY, base64);
  } catch (error) {
    console.error("Database Save Error:", error);
  }
};

export const query = async (sql: string, params: any[] = []) => {
  const db = await getDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

export const execute = async (sql: string, params: any[] = []) => {
  const db = await getDB();
  db.run(sql, params);
  saveDB();
};
