
import React, { useState, useEffect, useMemo } from 'react';
import { Contact, ContactFilters, NewContact, City } from '../types';
import { contactService } from '../services/contactService';
import { cityService } from '../services/cityService';
import { Button } from './Button';
import { ContactForm } from './ContactForm';
import { CityManager } from './CityManager';
import * as XLSX from 'xlsx';

export const Dashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContactFilters>({
    searchQuery: '',
    city: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contactData, cityData] = await Promise.all([
        contactService.getAllContacts(),
        cityService.getAllCities()
      ]);
      setContacts(contactData);
      setCities(cityData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const q = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        (contact.name?.toLowerCase().includes(q) ?? false) ||
        (contact.email?.toLowerCase().includes(q) ?? false) ||
        (contact.phoneNumber?.includes(q) ?? false) ||
        (contact.faxNumber?.includes(q) ?? false) ||
        (contact.notes?.toLowerCase().includes(q) ?? false);
      
      const matchesCity = filters.city === '' || contact.city === filters.city;

      return matchesSearch && matchesCity;
    });
  }, [contacts, filters]);

  const stats = useMemo(() => {
    const uniqueCities = new Set(contacts.filter(c => c.city).map(c => c.city)).size;
    return {
      total: contacts.length,
      cities: uniqueCities,
      recent: contacts.filter(c => Date.now() - c.createdAt < 86400000).length
    };
  }, [contacts]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddOrEdit = async (data: NewContact) => {
    if (editingContact) {
      await contactService.updateContact(editingContact.id, data);
    } else {
      await contactService.createContact(data);
    }
    await fetchData();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Archive this record? Permanent deletion will follow.')) {
      await contactService.deleteContact(id);
      await fetchData();
    }
  };

  const openModal = (contact?: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingContact(undefined);
    setIsModalOpen(false);
  };

  const exportToExcel = () => {
    const exportData = filteredContacts.map(c => ({
      'Name': c.name || '',
      'Email': c.email || '',
      'Phone': c.phoneNumber || '',
      'Fax': c.faxNumber || '',
      'City': c.city || '',
      'Notes': c.notes || '',
      'Created': new Date(c.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Directory");
    XLSX.writeFile(workbook, `ContactHub_v2_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700">
      
      {/* Dynamic Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Operational <span className="text-indigo-600">Directory</span>
          </h1>
          <p className="mt-2 text-slate-500 font-medium">Manage communication nodes and personnel intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="glass" onClick={() => setIsCityModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9m0-9.192l-4.243 4.243m0-9.192L5.828 10.9m11.829 5.757L13.414 20.9l-4.243-4.243m11.829-5.757l-4.243-4.243" />
            </svg>
            Territories
          </Button>
          <Button variant="secondary" onClick={exportToExcel}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </Button>
          <Button onClick={() => openModal()} className="h-12 px-6 shadow-indigo-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Entry
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Assets', value: stats.total, color: 'indigo' },
          { label: 'Territories', value: stats.cities, color: 'emerald' },
          { label: 'Active 24h', value: stats.recent, color: 'orange' },
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-3xl border-white/40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-3xl font-black text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Control Surface */}
      <div className="glass p-2 rounded-2xl mb-8 flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Search assets by name, email, or number..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-white/50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-medium"
          />
        </div>
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="px-4 py-3 bg-white/50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm font-bold appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="">Global Territory</option>
          {cities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
        </select>
        <Button variant="ghost" onClick={() => setFilters({ searchQuery: '', city: '' })} className="text-slate-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </Button>
      </div>

      {/* Data Table */}
      <div className="glass rounded-3xl overflow-hidden border-white/20">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Lines</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Territory</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Registry...</td></tr>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="group hover:bg-white/40 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                          {contact.name?.charAt(0) || '#'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{contact.name || 'Unnamed'}</p>
                          {contact.email && (
                            <div className="flex items-center gap-1 group/copy cursor-pointer mt-0.5" onClick={() => handleCopy(contact.email!, contact.id + '-e')}>
                              <span className="text-[11px] text-slate-500 font-medium group-hover/copy:text-indigo-600 transition-colors">{contact.email}</span>
                              {copiedId === contact.id + '-e' && <span className="text-[9px] text-emerald-500 font-bold ml-1">COPIED</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {contact.phoneNumber && (
                          <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopy(contact.phoneNumber!, contact.id + '-p')}>
                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded">TEL</span>
                            <span className="text-xs font-mono font-bold text-slate-600 group-hover/copy:text-indigo-600">{contact.phoneNumber}</span>
                          </div>
                        )}
                        {contact.faxNumber && (
                          <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopy(contact.faxNumber!, contact.id + '-f')}>
                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded">FAX</span>
                            <span className="text-xs font-mono font-bold text-slate-600 group-hover/copy:text-indigo-600">{contact.faxNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {contact.city ? (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                          {contact.city}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-slate-500 font-medium max-w-[200px] truncate">{contact.notes || <span className="text-slate-200 italic">No context provided</span>}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => openModal(contact)} className="!p-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(contact.id)} className="!p-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-32 text-center text-slate-400 italic">No records found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={closeModal}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 z-10">
            <div className="px-10 py-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingContact ? 'Edit Asset' : 'New Asset Entry'}</h3>
                <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <ContactForm initialData={editingContact} onSubmit={handleAddOrEdit} onCancel={closeModal} />
            </div>
          </div>
        </div>
      )}

      {isCityModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCityModalOpen(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 z-10">
            <div className="px-10 py-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Territories</h3>
                <button onClick={() => setIsCityModalOpen(false)} className="text-slate-300 hover:text-slate-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <CityManager onClose={() => setIsCityModalOpen(false)} onCitiesChanged={fetchData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
