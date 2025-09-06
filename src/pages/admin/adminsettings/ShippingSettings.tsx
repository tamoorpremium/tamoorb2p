// src/pages/admin/adminsettings/ShippingSettings.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';

interface ShippingMethod {
  id: number;
  name: string;
  type: string;
  rates: { base: number };
  delivery_estimate: string;
  enabled: boolean;
  comment?: string;
}

const ShippingSettings: React.FC = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('id');
      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch shipping methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const toggleEnabled = async (id: number, current: boolean) => {
    try {
      const { error } = await supabase
        .from('shipping_methods')
        .update({ enabled: !current })
        .eq('id', id);
      if (error) throw error;
      setMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, enabled: !current } : m))
      );
      toast.success(`Shipping method ${!current ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const updateField = async (id: number, field: keyof ShippingMethod, value: any) => {
    try {
      const { error } = await supabase
        .from('shipping_methods')
        .update({ [field]: value })
        .eq('id', id);
      if (error) throw error;
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
      toast.success('Updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {loading ? (
        <p>Loading shipping methods...</p>
      ) : (
        methods.map((method) => (
          <div
            key={method.id}
            className="flex flex-wrap items-center justify-between p-4 bg-white/30 rounded-xl shadow mb-2"
          >
            <div className="flex-1 min-w-[200px]">
              <p className="font-semibold text-lg">{method.name} ({method.type})</p>
              <input
                type="number"
                value={method.rates.base}
                onChange={(e) =>
                  updateField(method.id, 'rates', { base: Number(e.target.value) })
                }
                className="mt-1 rounded border px-2 py-1 w-32"
                placeholder="Base Rate"
              />
              <input
                type="text"
                value={method.delivery_estimate}
                onChange={(e) => updateField(method.id, 'delivery_estimate', e.target.value)}
                className="mt-1 rounded border px-2 py-1 w-48 ml-2"
                placeholder="Delivery Estimate"
              />
              {!method.enabled && (
                <input
                  type="text"
                  value={method.comment || ''}
                  onChange={(e) => updateField(method.id, 'comment', e.target.value)}
                  className="mt-1 rounded border px-2 py-1 w-48 ml-2"
                  placeholder="Comment (disabled)"
                />
              )}
            </div>

            <button
              onClick={() => toggleEnabled(method.id, method.enabled)}
              className={`ml-4 px-4 py-2 rounded-full font-semibold transition-colors ${
                method.enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {method.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ShippingSettings;
