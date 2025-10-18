import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface StoreSettingsData {
  id: number;
  store_name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  default_currency: string;
  locale: string;
  contact_email: string | null;
  contact_phone: string | null;
  operational_status: boolean;
}

const StoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettingsData | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .single();
        
        // PGRST116 means no rows were found, which is not an error in this case.
        if (error && error.code !== 'PGRST116') throw error;

        setSettings(
          data || {
            id: 0, // A temporary ID to indicate it's a new record
            store_name: '',
            logo_url: '',
            primary_color: '#FBBF24', // Default to your theme yellow
            secondary_color: '#06B6D4', // Default to your theme cyan
            default_currency: 'INR',
            locale: 'en-IN',
            contact_email: '',
            contact_phone: '',
            operational_status: true,
          },
        );
      } catch (err) {
        toast.error('Error fetching store settings');
        console.error('Fetch error: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingsChange = (field: keyof StoreSettingsData, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    try {
      // Exclude 'id' from the update payload
      const { id, ...updateData } = settings;

      if (id === 0) { // This is a new record, so insert it
        const { data: newData, error } = await supabase
          .from('store_settings')
          .insert([updateData])
          .select()
          .single();
        if (error) throw error;
        if (newData) setSettings(newData);
      } else { // Existing record, update it
        const { data: updatedData, error } = await supabase
          .from('store_settings')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        if (updatedData) setSettings(updatedData);
      }
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message}`);
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }
  
  if (!settings) return null; // Render nothing if settings are not loaded

  // Reusable input field styles for consistency
  const inputClasses = "w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-400">Store Identity & Branding</h2>
        <p className="text-slate-400 mt-1">Manage your store's name, branding, and contact information.</p>
      </header>
      
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="store_name">
              Store Name
            </label>
            <input
              id="store_name"
              type="text"
              className={inputClasses}
              value={settings.store_name}
              onChange={(e) => handleSettingsChange('store_name', e.target.value)}
              placeholder="e.g., Tamoor"
            />
          </div>

          {/* Logo URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="logo_url">
              Logo URL
            </label>
            <input
              id="logo_url"
              type="text"
              className={inputClasses}
              value={settings.logo_url || ''}
              onChange={(e) => handleSettingsChange('logo_url', e.target.value)}
              placeholder="https://your-cdn.com/logo.png"
            />
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="primary_color">
              Primary Color
            </label>
            <div className="relative">
              <input
                id="primary_color"
                type="color"
                className="absolute w-10 h-10 p-1 opacity-0 cursor-pointer"
                value={settings.primary_color || '#FBBF24'}
                onChange={(e) => handleSettingsChange('primary_color', e.target.value)}
              />
              <div className="flex items-center gap-3 p-3 bg-slate-900/70 border border-slate-700 rounded-lg">
                <div 
                  className="w-7 h-7 rounded-md border border-slate-600" 
                  style={{ backgroundColor: settings.primary_color || '#FBBF24' }}
                />
                <span className="font-mono text-slate-200">{settings.primary_color}</span>
              </div>
            </div>
          </div>
          
          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="secondary_color">
              Secondary Color
            </label>
            <div className="relative">
              <input
                id="secondary_color"
                type="color"
                className="absolute w-10 h-10 p-1 opacity-0 cursor-pointer"
                value={settings.secondary_color || '#06B6D4'}
                onChange={(e) => handleSettingsChange('secondary_color', e.target.value)}
              />
               <div className="flex items-center gap-3 p-3 bg-slate-900/70 border border-slate-700 rounded-lg">
                <div 
                  className="w-7 h-7 rounded-md border border-slate-600" 
                  style={{ backgroundColor: settings.secondary_color || '#06B6D4' }}
                />
                <span className="font-mono text-slate-200">{settings.secondary_color}</span>
              </div>
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="contact_email">
              Public Contact Email
            </label>
            <input
              id="contact_email"
              type="email"
              className={inputClasses}
              value={settings.contact_email || ''}
              onChange={(e) => handleSettingsChange('contact_email', e.target.value)}
              placeholder="support@example.com"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="contact_phone">
              Public Contact Phone
            </label>
            <input
              id="contact_phone"
              type="tel"
              className={inputClasses}
              value={settings.contact_phone || ''}
              onChange={(e) => handleSettingsChange('contact_phone', e.target.value)}
              placeholder="+91 12345 67890"
            />
          </div>

          {/* Default Currency */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="default_currency">
              Default Currency
            </label>
            <input
              id="default_currency"
              type="text"
              className={inputClasses}
              value={settings.default_currency}
              onChange={(e) => handleSettingsChange('default_currency', e.target.value)}
            />
          </div>
          
          {/* Locale */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="locale">
              Locale
            </label>
            <input
              id="locale"
              type="text"
              className={inputClasses}
              value={settings.locale}
              onChange={(e) => handleSettingsChange('locale', e.target.value)}
            />
          </div>
        </div>
        
        <div className="border-t border-slate-800 my-8"></div>
        
        {/* Store Status Toggle */}
        <div>
           <h3 className="text-lg font-bold text-yellow-400">Store Status</h3>
           <p className="text-slate-400 mt-1 mb-4">Temporarily open or close your store to all customers.</p>
            <label htmlFor="operational_status" className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="operational_status" 
                  className="sr-only peer" 
                  checked={settings.operational_status}
                  onChange={(e) => handleSettingsChange('operational_status', e.target.checked)}
                />
                <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div>
              </div>
              <div className="ml-4 text-slate-200 font-semibold">
                Store is currently {settings.operational_status ? 'Open' : 'Closed'}
              </div>
            </label>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition-all duration-200 disabled:bg-yellow-400/50 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="animate-spin" size={20} /> : null}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettings;