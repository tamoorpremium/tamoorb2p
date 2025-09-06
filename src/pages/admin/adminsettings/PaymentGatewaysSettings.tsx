import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

interface PaymentGateway {
  id: number;
  name: string;
  credentials: Record<string, string>; // Stored as JSON, e.g. { key_id, key_secret }
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${
        enabled
          ? 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]'
          : 'bg-[#FF073A] shadow-[0_0_8px_#FF073A]'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
          enabled ? 'right-0.5' : 'left-0.5'
        } shadow`}
      />
    </button>
  );
};


const maskSecret = (secret: string) => {
  if (!secret) return '';
  return '*'.repeat(secret.length > 8 ? secret.length - 4 : secret.length);
};

const PaymentGatewaysSettings = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setGateways(data || []);
    } catch (err) {
      toast.error('Failed to load payment gateways');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateGateway = async (id: number, changes: Partial<PaymentGateway>) => {
    setSavingId(id);
    try {
      const updatePayload = {
        ...changes,
        credentials: typeof changes.credentials === 'object' ? changes.credentials : undefined,
      };
      const { error } = await supabase
        .from('payment_gateways')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      toast.success('Payment gateway updated');
      await fetchGateways();
    } catch (err) {
      toast.error('Failed to update payment gateway');
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCredentialsChange = (
    id: number,
    field: 'key_id' | 'key_secret',
    value: string
  ) => {
    setGateways((prevGateways) =>
      prevGateways.map((gateway) =>
        gateway.id === id
          ? {
              ...gateway,
              credentials: {
                ...gateway.credentials,
                [field]: value,
              },
            }
          : gateway
      )
    );
  };

  const toggleEnabledLocally = (id: number, enabled: boolean) => {
    setGateways((prevGateways) =>
      prevGateways.map((gateway) =>
        gateway.id === id ? { ...gateway, enabled } : gateway
      )
    );
  };

  if (loading) return <div>Loading Payment Gateways...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {gateways.map((gateway) => (
        <div key={gateway.id} className="border rounded p-4 bg-white/30 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{gateway.name}</h3>
            <ToggleSwitch
              enabled={gateway.enabled}
              disabled={savingId === gateway.id}
              onChange={(val) => toggleEnabledLocally(gateway.id, val)}
            />
          </div>

          {/* Credentials input for Razorpay */}
          {gateway.name.toLowerCase() === 'razorpay' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1" htmlFor={`key_id_${gateway.id}`}>
                  Key ID
                </label>
                <input
                  id={`key_id_${gateway.id}`}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={gateway.credentials?.key_id || ''}
                  onChange={(e) =>
                    handleCredentialsChange(gateway.id, 'key_id', e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  className="block font-semibold mb-1"
                  htmlFor={`key_secret_${gateway.id}`}
                >
                  Key Secret
                </label>
                <input
                  id={`key_secret_${gateway.id}`}
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={gateway.credentials?.key_secret || ''}
                  placeholder={maskSecret(gateway.credentials?.key_secret || '')}
                  onChange={(e) =>
                    handleCredentialsChange(gateway.id, 'key_secret', e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Update Button */}
          <button
            onClick={() =>
              updateGateway(gateway.id, {
                credentials: gateway.credentials,
                enabled: gateway.enabled,
              })
            }
            disabled={savingId === gateway.id}
            className="mt-4 px-4 py-2 bg-yellow-400 text-white font-semibold rounded shadow hover:bg-yellow-500 transition"
          >
            {savingId === gateway.id ? 'Saving...' : 'Update'}
          </button>
        </div>
      ))}

      {gateways.length === 0 && (
        <p className="text-center text-gray-500">No payment gateways configured.</p>
      )}

      <style>{`
        .shadow-glass {
          box-shadow:
            inset 0 0 10px 2px rgba(255, 215, 0, 0.4),
            0 4px 10px rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default PaymentGatewaysSettings;
