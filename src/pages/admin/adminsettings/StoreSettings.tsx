import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

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
  const [loading, setLoading] = useState(false);
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
        if (error && error.code !== 'PGRST116') throw error;

        setSettings(
          data || {
            id: 0,
            store_name: '',
            logo_url: '',
            primary_color: '#000000',
            secondary_color: '#FFFFFF',
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

  const updateSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updateData: Partial<StoreSettingsData> = {
        store_name: settings.store_name,
        logo_url: settings.logo_url,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        default_currency: settings.default_currency,
        locale: settings.locale,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        operational_status: settings.operational_status,
      };

      if (settings.id === 0) {
        const { data, error } = await supabase
          .from('store_settings')
          .insert([updateData])
          .select()
          .single();
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        if (data) setSettings(data);
      } else {
        const { data, error } = await supabase
          .from('store_settings')
          .update(updateData)
          .eq('id', settings.id)
          .select()
          .single();
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        if (data) setSettings(data);
      }
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message || error}`);
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading Settings...</p>;

  return (
    <div className="space-y-6">
      {/* Store Name */}
      <div>
        <label className="block font-semibold mb-1" htmlFor="store_name">
          Store Name
        </label>
        <input
          id="store_name"
          type="text"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.store_name || ''}
          onChange={(e) => setSettings((s) => (s ? { ...s, store_name: e.target.value } : s))}
        />
      </div>

      {/* Logo URL */}
      <div>
        <label className="block font-semibold mb-1" htmlFor="logo_url">
          Logo URL
        </label>
        <input
          id="logo_url"
          type="text"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.logo_url || ''}
          onChange={(e) => setSettings((s) => (s ? { ...s, logo_url: e.target.value } : s))}
          placeholder="https://example.com/logo.png"
        />
      </div>

      {/* Colors */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1" htmlFor="primary_color">
            Primary Color
          </label>
          <input
            id="primary_color"
            type="color"
            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            value={settings?.primary_color || '#000000'}
            onChange={(e) => setSettings((s) => (s ? { ...s, primary_color: e.target.value } : s))}
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1" htmlFor="secondary_color">
            Secondary Color
          </label>
          <input
            id="secondary_color"
            type="color"
            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            value={settings?.secondary_color || '#ffffff'}
            onChange={(e) => setSettings((s) => (s ? { ...s, secondary_color: e.target.value } : s))}
          />
        </div>
      </div>

      {/* Other inputs */}
      <div>
        <label className="block font-semibold mb-1" htmlFor="default_currency">
          Default Currency
        </label>
        <input
          id="default_currency"
          type="text"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.default_currency || 'INR'}
          onChange={(e) => setSettings((s) => (s ? { ...s, default_currency: e.target.value } : s))}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1" htmlFor="locale">
          Locale / Timezone
        </label>
        <input
          id="locale"
          type="text"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.locale || 'en-IN'}
          onChange={(e) => setSettings((s) => (s ? { ...s, locale: e.target.value } : s))}
          placeholder="en-IN"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1" htmlFor="contact_email">
          Contact Email
        </label>
        <input
          id="contact_email"
          type="email"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.contact_email || ''}
          onChange={(e) => setSettings((s) => (s ? { ...s, contact_email: e.target.value } : s))}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1" htmlFor="contact_phone">
          Contact Phone
        </label>
        <input
          id="contact_phone"
          type="tel"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.contact_phone || ''}
          onChange={(e) => setSettings((s) => (s ? { ...s, contact_phone: e.target.value } : s))}
        />
      </div>
      <div className="flex items-center space-x-3">
        <input
          id="operational_status"
          type="checkbox"
          checked={settings?.operational_status || false}
          onChange={(e) => setSettings((s) => (s ? { ...s, operational_status: e.target.checked } : s))}
          className="w-5 h-5"
        />
        <label htmlFor="operational_status" className="font-semibold">
          Store Operational (Open)
        </label>
      </div>

      <button onClick={updateSettings} disabled={saving} className="btn-premium mt-6 w-full">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default StoreSettings;
