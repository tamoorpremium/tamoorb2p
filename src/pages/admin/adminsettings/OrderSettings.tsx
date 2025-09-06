import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

interface OrderSettingsData {
  id: number;
  default_order_status: string;
  inventory_alert_threshold: number;
  returns_policy: string | null;
  auto_refund_enabled: boolean;
}

const OrderSettings = () => {
  const [settings, setSettings] = useState<OrderSettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from<'order_settings', OrderSettingsData>('order_settings')
          .select('*')
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') throw error;

        setSettings(
          data || {
            id: 0,
            default_order_status: 'pending',
            inventory_alert_threshold: 10,
            returns_policy: '',
            auto_refund_enabled: false,
          },
        );
      } catch {
        toast.error('Error fetching order settings');
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
        const { error } = await supabase.from('order_settings').insert([settings]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('order_settings').update(settings).eq('id', settings.id);
        if (error) throw error;
      }
      toast.success('Order settings saved successfully');
    } catch {
      toast.error('Error saving order settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading Order Settings...</p>;

  return (
    <div className="space-y-6">
      <label className="block font-semibold">Default Order Status</label>
      <input
        type="text"
        value={settings?.default_order_status || ''}
        onChange={(e) => setSettings((s) => s && { ...s, default_order_status: e.target.value })}
        className="w-full p-3 border rounded border-gray-300"
      />

      <label className="block font-semibold">Inventory Alert Threshold</label>
      <input
        type="number"
        value={settings?.inventory_alert_threshold || 10}
        onChange={(e) => setSettings((s) => s && { ...s, inventory_alert_threshold: +e.target.value })}
        className="w-full p-3 border rounded border-gray-300"
      />

      <label className="block font-semibold">Returns Policy</label>
      <textarea
        value={settings?.returns_policy || ''}
        onChange={(e) => setSettings((s) => s && { ...s, returns_policy: e.target.value })}
        rows={4}
        className="w-full p-3 border rounded border-gray-300"
      />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={settings?.auto_refund_enabled || false}
          onChange={(e) => setSettings((s) => s && { ...s, auto_refund_enabled: e.target.checked })}
        />
        <span>Automatic Refund Enabled</span>
      </label>

      <button onClick={updateSettings} disabled={saving} className="btn-premium mt-4 w-full">
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default OrderSettings;
