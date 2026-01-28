
export interface Contact {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  faxNumber?: string;
  city?: string;
  notes?: string;
  createdAt: number;
}

export interface City {
  id: string;
  name: string;
}

export type NewContact = Omit<Contact, 'id' | 'createdAt'>;

export interface ContactFilters {
  searchQuery: string;
  city: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: string;
}
