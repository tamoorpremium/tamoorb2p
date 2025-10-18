import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface PaymentGateway {
  id: number;
  name: string;
  credentials: Record<string, string>; // e.g. { key_id, key_secret }
  enabled: boolean;
}

const PaymentGatewaysSettings = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [secretVisibility, setSecretVisibility] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('id, name, credentials, enabled')
        .order('name', { ascending: true });
      if (error) throw error;
      setGateways(data || []);
    } catch (err) {
      toast.error('Failed to load payment gateways');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGateway = async (gateway: PaymentGateway) => {
    setSavingId(gateway.id);
    try {
      const newEnabledState = !gateway.enabled;
      const { error } = await supabase
        .from('payment_gateways')
        .update({ enabled: newEnabledState })
        .eq('id', gateway.id);
      
      if (error) throw error;

      // Update local state for immediate UI feedback
      setGateways(gateways.map(g => g.id === gateway.id ? { ...g, enabled: newEnabledState } : g));
      toast.success(`${gateway.name} has been ${newEnabledState ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      toast.error(`Failed to update ${gateway.name}`);
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };
  
  const handleSaveCredentials = async (gateway: PaymentGateway) => {
    setSavingId(gateway.id);
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({ credentials: gateway.credentials })
        .eq('id', gateway.id);

      if (error) throw error;
      toast.success(`${gateway.name} credentials updated successfully!`);
    } catch (err) {
      toast.error(`Failed to update ${gateway.name} credentials.`);
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCredentialsChange = (id: number, field: string, value: string) => {
    setGateways(prev =>
      prev.map(gw =>
        gw.id === id
          ? { ...gw, credentials: { ...gw.credentials, [field]: value } }
          : gw
      )
    );
  };

  const toggleSecretVisibility = (id: number) => {
    setSecretVisibility(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const inputClasses = "w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-400">Payment Gateways</h2>
        <p className="text-slate-400 mt-1">Configure and manage your store's payment options.</p>
      </header>

      <div className="space-y-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-100">{gateway.name}</h3>
                <p className="text-sm text-slate-400">Manage API keys and settings for {gateway.name}.</p>
              </div>
              <label htmlFor={`toggle-${gateway.id}`} className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id={`toggle-${gateway.id}`}
                    className="sr-only peer" 
                    checked={gateway.enabled}
                    disabled={savingId === gateway.id}
                    onChange={() => handleToggleGateway(gateway)}
                  />
                  <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div>
                </div>
              </label>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveCredentials(gateway); }} className="space-y-4">
              {/* Credentials for Razorpay */}
              {gateway.name.toLowerCase() === 'razorpay' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor={`key_id_${gateway.id}`}>
                      Key ID
                    </label>
                    <input
                      id={`key_id_${gateway.id}`}
                      type="text"
                      className={inputClasses}
                      value={gateway.credentials?.key_id || ''}
                      onChange={(e) => handleCredentialsChange(gateway.id, 'key_id', e.target.value)}
                      placeholder="rzp_live_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor={`key_secret_${gateway.id}`}>
                      Key Secret
                    </label>
                    <div className="relative">
                      <input
                        id={`key_secret_${gateway.id}`}
                        type={secretVisibility[gateway.id] ? 'text' : 'password'}
                        className={`${inputClasses} pr-10`}
                        value={gateway.credentials?.key_secret || ''}
                        onChange={(e) => handleCredentialsChange(gateway.id, 'key_secret', e.target.value)}
                        placeholder="••••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(gateway.id)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        {secretVisibility[gateway.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingId === gateway.id}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition-all duration-200 disabled:bg-yellow-400/50 disabled:cursor-not-allowed"
                >
                  {savingId === gateway.id ? <Loader2 className="animate-spin" size={20} /> : null}
                  {savingId === gateway.id ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        ))}

        {gateways.length === 0 && !loading && (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-xl">
             <p className="text-slate-400">No payment gateways found.</p>
             <p className="text-sm text-slate-500 mt-1">Please configure gateways in your database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGatewaysSettings;