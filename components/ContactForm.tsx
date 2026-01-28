
import React, { useState, useEffect } from 'react';
import { NewContact, Contact, City } from '../types';
import { PHONE_REGEX, FAX_REGEX, EMAIL_REGEX } from '../constants';
import { cityService } from '../services/cityService';
import { Button } from './Button';

interface ContactFormProps {
  initialData?: Contact;
  onSubmit: (data: NewContact) => Promise<void>;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState<NewContact>({
    name: '',
    email: '',
    phoneNumber: '',
    faxNumber: '',
    city: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewContact, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    cityService.getAllCities().then(setCities);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        faxNumber: initialData.faxNumber || '',
        city: initialData.city || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Partial<Record<keyof NewContact, string>> = {};
    if (formData.phoneNumber && !PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Must be exactly 10 digits';
    }
    if (formData.faxNumber && !FAX_REGEX.test(formData.faxNumber)) {
      newErrors.faxNumber = 'Must be exactly 10 digits';
    }
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try { await onSubmit(formData); } finally { setIsSubmitting(false); }
  };

  const handleNumericInput = (field: keyof NewContact, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, [field]: sanitized });
  };

  const inputClasses = (error?: string) => `
    w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl transition-all duration-300 outline-none text-slate-900 font-medium
    ${error ? 'border-rose-400 ring-4 ring-rose-100' : 'border-slate-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100'}
  `;

  const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Row: Name and Fax (as requested) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className={labelClasses}>Legal Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClasses()}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClasses}>Fax Protocol</label>
          <input
            type="text"
            value={formData.faxNumber}
            onChange={(e) => handleNumericInput('faxNumber', e.target.value)}
            className={inputClasses(errors.faxNumber)}
            placeholder="10-digit number"
            maxLength={10}
          />
          {errors.faxNumber && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1 mt-1">{errors.faxNumber}</p>}
        </div>
      </div>

      {/* Second Row: Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className={labelClasses}>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClasses(errors.email)}
            placeholder="john@enterprise.com"
          />
          {errors.email && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1 mt-1">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelClasses}>Phone Line</label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => handleNumericInput('phoneNumber', e.target.value)}
            className={inputClasses(errors.phoneNumber)}
            placeholder="10-digit number"
            maxLength={10}
          />
          {errors.phoneNumber && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1 mt-1">{errors.phoneNumber}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClasses}>Geographic Territory</label>
        <select
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className={inputClasses()}
        >
          <option value="">Select Territory</option>
          {cities.map((city) => <option key={city.id} value={city.name}>{city.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className={labelClasses}>Asset Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={`${inputClasses()} h-28 resize-none`}
          placeholder="Relevant context or relationship history..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting} className="px-10">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {initialData ? 'Update Record' : 'Create Record'}
        </Button>
      </div>
    </form>
  );
};
