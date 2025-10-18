import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import { Loader2 } from 'lucide-react';

interface OrderSettingsData {
  id: number;
  default_order_status: string;
  inventory_alert_threshold: number;
  returns_policy: string | null;
  auto_refund_enabled: boolean;
}

const OrderSettings = () => {
  const [settings, setSettings] = useState<OrderSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('order_settings')
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
      } catch (err: any) {
        toast.error('Error fetching order settings');
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingsChange = (field: keyof OrderSettingsData, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const updateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const { id, ...updateData } = settings;
      if (id === 0) {
        // Create new settings
        const { error } = await supabase.from('order_settings').insert([updateData]);
        if (error) throw error;
      } else {
        // Update existing settings
        const { error } = await supabase.from('order_settings').update(updateData).eq('id', id);
        if (error) throw error;
      }
      toast.success('Order settings saved successfully');
    } catch (err: any) {
      toast.error('Error saving order settings');
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }
  
  if (!settings) return null;

  return (
    <div className="animate-fadeIn">
      <ToastContainer position="top-center" theme="dark" />
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-400">Order & Inventory</h2>
        <p className="text-slate-400 mt-1">Configure default behaviors for orders and stock management.</p>
      </header>
      
      <form onSubmit={updateSettings} className="space-y-8 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="default_order_status">
            Default Order Status
          </label>
          <select
            id="default_order_status"
            value={settings.default_order_status}
            onChange={(e) => handleSettingsChange('default_order_status', e.target.value)}
            className={`${inputClasses} appearance-none`}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">The initial status assigned to new orders.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="inventory_alert_threshold">
            Inventory Alert Threshold
          </label>
          <input
            id="inventory_alert_threshold"
            type="number"
            value={settings.inventory_alert_threshold}
            onChange={(e) => handleSettingsChange('inventory_alert_threshold', +e.target.value)}
            className={inputClasses}
          />
          <p className="text-xs text-slate-500 mt-2">Receive a warning when a product's stock drops to this level.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="returns_policy">
            Returns Policy
          </label>
          <textarea
            id="returns_policy"
            value={settings.returns_policy || ''}
            onChange={(e) => handleSettingsChange('returns_policy', e.target.value)}
            rows={5}
            className={inputClasses}
            placeholder="e.g., Returns are accepted within 30 days of purchase..."
          />
           <p className="text-xs text-slate-500 mt-2">This policy will be displayed to customers on product pages and at checkout.</p>
        </div>
        
        <div className="border-t border-slate-800 my-8"></div>
        
        <div>
            <h3 className="text-lg font-bold text-yellow-400">Automation</h3>
            <div className="mt-4 bg-slate-900/30 border border-slate-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-slate-100">Automatic Refunds</h4>
                    <p className="text-sm text-slate-400">Enable or disable automatic refunds for cancelled orders.</p>
                </div>
                <label htmlFor="auto_refund_enabled" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id="auto_refund_enabled" 
                            className="sr-only peer" 
                            checked={settings.auto_refund_enabled}
                            onChange={(e) => handleSettingsChange('auto_refund_enabled', e.target.checked)}
                        />
                        <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div>
                    </div>
                </label>
            </div>
        </div>

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

export default OrderSettings;
