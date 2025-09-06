import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

interface PrivacySettingsData {
  id: number;
  gdpr_compliance: boolean;
  privacy_policy_url: string | null;
  cookie_consent_enabled: boolean;
}

const PrivacySettings = () => {
  const [settings, setSettings] = useState<PrivacySettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from<'privacy_settings', PrivacySettingsData>('privacy_settings')
          .select('*')
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') throw error;

        setSettings(
          data || {
            id: 0,
            gdpr_compliance: true,
            privacy_policy_url: '',
            cookie_consent_enabled: true,
          },
        );
      } catch {
        toast.error('Failed to load privacy settings');
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
      if (settings.id === 0) {
        const { error } = await supabase.from('privacy_settings').insert([settings]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('privacy_settings').update(settings).eq('id', settings.id);
        if (error) throw error;
      }
      toast.success('Privacy settings updated');
    } catch {
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading Privacy Settings...</p>;

  return (
    <div className="space-y-6">
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings?.gdpr_compliance || false}
          onChange={(e) => setSettings((s) => s && { ...s, gdpr_compliance: e.target.checked })}
        />
        <span>GDPR Compliance Enabled</span>
      </label>

      <div>
        <label className="block font-semibold mb-1" htmlFor="privacy_policy_url">
          Privacy Policy URL
        </label>
        <input
          id="privacy_policy_url"
          type="url"
          className="w-full p-3 rounded border border-gray-300"
          value={settings?.privacy_policy_url || ''}
          onChange={(e) => setSettings((s) => s && { ...s, privacy_policy_url: e.target.value })}
        />
      </div>

      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings?.cookie_consent_enabled || false}
          onChange={(e) => setSettings((s) => s && { ...s, cookie_consent_enabled: e.target.checked })}
        />
        <span>Cookie Consent Enabled</span>
      </label>

      <button onClick={updateSettings} disabled={saving} className="btn-premium mt-4 w-full">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default PrivacySettings;
