
import { Contact, NewContact } from '../types';
import { query, execute } from './db';

export const contactService = {
  async getAllContacts(): Promise<Contact[]> {
    const results = await query("SELECT * FROM contacts ORDER BY createdAt DESC");
    return results.map(r => ({
      ...r,
      name: r.name || undefined,
      email: r.email || undefined,
      phoneNumber: r.phoneNumber || undefined,
      faxNumber: r.faxNumber || undefined,
      city: r.city || undefined,
      notes: r.notes || undefined
    })) as Contact[];
  },

  async createContact(contact: NewContact): Promise<Contact> {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    await execute(
      "INSERT INTO contacts (id, name, email, phoneNumber, faxNumber, city, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id, 
        contact.name || null, 
        contact.email || null,
        contact.phoneNumber || null, 
        contact.faxNumber || null, 
        contact.city || null, 
        contact.notes || null, 
        createdAt
      ]
    );
    return { ...contact, id, createdAt };
  },

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const rows = await query("SELECT * FROM contacts WHERE id = ?", [id]);
    const current = rows[0] as Contact;
    if (!current) throw new Error('Contact not found');

    const merged = { ...current, ...updates };
    await execute(
      "UPDATE contacts SET name = ?, email = ?, phoneNumber = ?, faxNumber = ?, city = ?, notes = ? WHERE id = ?",
      [
        merged.name || null, 
        merged.email || null,
        merged.phoneNumber || null, 
        merged.faxNumber || null, 
        merged.city || null, 
        merged.notes || null, 
        id
      ]
    );
    return merged as Contact;
  },

  async deleteContact(id: string): Promise<void> {
    await execute("DELETE FROM contacts WHERE id = ?", [id]);
  }
};
