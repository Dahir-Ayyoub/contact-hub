
import { City } from '../types';
import { query, execute } from './db';

export const cityService = {
  async getAllCities(): Promise<City[]> {
    const results = await query("SELECT * FROM cities ORDER BY name ASC");
    return results as City[];
  },

  async addCity(name: string): Promise<City> {
    const id = crypto.randomUUID();
    await execute("INSERT INTO cities (id, name) VALUES (?, ?)", [id, name]);
    return { id, name };
  },

  async updateCity(id: string, name: string): Promise<City> {
    await execute("UPDATE cities SET name = ? WHERE id = ?", [name, id]);
    return { id, name };
  },

  async deleteCity(id: string): Promise<void> {
    await execute("DELETE FROM cities WHERE id = ?", [id]);
  }
};
