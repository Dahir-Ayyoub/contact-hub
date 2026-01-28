
import React, { useState, useEffect } from 'react';
import { City } from '../types';
import { cityService } from '../services/cityService';
import { Button } from './Button';

interface CityManagerProps {
  onClose: () => void;
  onCitiesChanged: () => void;
}

export const CityManager: React.FC<CityManagerProps> = ({ onClose, onCitiesChanged }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [newCityName, setNewCityName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const data = await cityService.getAllCities();
      setCities(data);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await cityService.addCity(newCityName.trim());
      setNewCityName('');
      await fetchCities();
      onCitiesChanged();
    } catch (error) {
      alert("Failed to add city. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isProcessing) return;
    if (window.confirm('Delete this city? Contacts already assigned to it will retain the city name, but it will be removed from filters.')) {
      setIsProcessing(true);
      try {
        await cityService.deleteCity(id);
        await fetchCities();
        onCitiesChanged();
      } catch (error) {
        alert("Failed to delete city.");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const startEdit = (city: City) => {
    setEditingId(city.id);
    setEditName(city.name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      await cityService.updateCity(id, editName.trim());
      setEditingId(null);
      await fetchCities();
      onCitiesChanged();
    } catch (error) {
      alert("Failed to update city.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newCityName}
          onChange={(e) => setNewCityName(e.target.value)}
          placeholder="New city name..."
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-50"
        />
        <Button type="submit" size="sm" isLoading={isProcessing}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add
        </Button>
      </form>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cities.length > 0 ? (
          cities.map(city => (
            <div key={city.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
              {editingId === city.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={isProcessing}
                    className="flex-1 px-2 py-1 bg-white border border-indigo-300 rounded-lg outline-none text-sm"
                  />
                  <button onClick={() => saveEdit(city.id)} disabled={isProcessing} className="text-green-600 hover:text-green-700 font-bold text-xs uppercase disabled:opacity-50">Save</button>
                  <button onClick={() => setEditingId(null)} disabled={isProcessing} className="text-slate-400 hover:text-slate-500 font-bold text-xs uppercase">X</button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">{city.name}</span>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(city)} disabled={isProcessing} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold disabled:opacity-50">Edit</button>
                    <button onClick={() => handleDelete(city.id)} disabled={isProcessing} className="text-red-600 hover:text-red-800 text-xs font-semibold disabled:opacity-50">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-8 text-sm italic">No regions defined. Add one above.</p>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </Button>
      </div>
    </div>
  );
};
