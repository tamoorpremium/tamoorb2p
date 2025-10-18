// src/pages/admin/adminsettings/ShippingSettings.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import { Loader2, Save, Undo2 } from 'lucide-react';

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
  // Store the original data from the database
  const [originalMethods, setOriginalMethods] = useState<ShippingMethod[]>([]);
  // Store the data that the user is editing
  const [editableMethods, setEditableMethods] = useState<ShippingMethod[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('id');
      if (error) throw error;
      const fetchedData = data || [];
      setOriginalMethods(fetchedData);
      // Deep copy to prevent originalMethods from being mutated
      setEditableMethods(JSON.parse(JSON.stringify(fetchedData))); 
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

  // Memoize to prevent re-calculating on every render
  const hasChanges = useMemo(() => {
    return editableMethods.reduce((acc, method) => {
      const original = originalMethods.find(o => o.id === method.id);
      acc[method.id] = JSON.stringify(method) !== JSON.stringify(original);
      return acc;
    }, {} as Record<number, boolean>);
  }, [editableMethods, originalMethods]);

  const handleInputChange = (id: number, field: keyof ShippingMethod, value: any) => {
    setEditableMethods(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };
  
  const handleResetChanges = (id: number) => {
    const original = originalMethods.find(o => o.id === id);
    if (original) {
      setEditableMethods(prev => 
        prev.map(m => (m.id === id ? JSON.parse(JSON.stringify(original)) : m))
      );
      toast.info('Changes have been reset.');
    }
  };

  const handleSaveChanges = async (id: number) => {
    const methodToSave = editableMethods.find(m => m.id === id);
    if (!methodToSave) return;

    setSavingId(id);
    try {
      // Destructure id to avoid sending it in the update payload
      const { id: methodId, ...updateData } = methodToSave;
      const { error } = await supabase
        .from('shipping_methods')
        .update(updateData)
        .eq('id', methodId);
        
      if (error) throw error;

      // Update the originalMethods state to reflect the new saved state
      setOriginalMethods(prev => 
        prev.map(m => (m.id === id ? JSON.parse(JSON.stringify(methodToSave)) : m))
      );
      toast.success(`${methodToSave.name} updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save changes.');
    } finally {
      setSavingId(null);
    }
  };

  const toggleEnabled = async (id: number, current: boolean) => {
    setSavingId(id);
    const newEnabledState = !current;
    try {
        const { error } = await supabase
            .from('shipping_methods')
            .update({ enabled: newEnabledState })
            .eq('id', id);

        if (error) throw error;
        
        const updatedMethod = { ...editableMethods.find(m => m.id === id)!, enabled: newEnabledState };
        setEditableMethods(prev => prev.map(m => m.id === id ? updatedMethod : m));
        setOriginalMethods(prev => prev.map(m => m.id === id ? updatedMethod : m));
        toast.success(`Method ${newEnabledState ? 'enabled' : 'disabled'}`);
    } catch (err) {
        console.error(err);
        toast.error('Failed to update status');
    } finally {
        setSavingId(null);
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

  return (
    <div className="animate-fadeIn">
      <ToastContainer
        position="top-center" // <-- Changed from "bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <header className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-400">Shipping Methods</h2>
        <p className="text-slate-400 mt-1">Configure shipping rates and delivery options for customers.</p>
      </header>

      <div className="space-y-6">
        {editableMethods.map((method) => (
          <div key={method.id} className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-100">{method.name}</h3>
                <p className="text-sm text-slate-400 capitalize">{method.type} Shipping</p>
              </div>
              <label htmlFor={`toggle-${method.id}`} className="flex items-center cursor-pointer">
                  <div className="relative">
                      <input 
                          type="checkbox" 
                          id={`toggle-${method.id}`}
                          className="sr-only peer" 
                          checked={method.enabled}
                          disabled={savingId === method.id}
                          onChange={() => toggleEnabled(method.id, method.enabled)}
                      />
                      <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div>
                  </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor={`rate-${method.id}`}>
                  Base Rate (INR)
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">₹</span>
                    <input
                      id={`rate-${method.id}`}
                      type="number"
                      value={method.rates.base}
                      onChange={(e) => handleInputChange(method.id, 'rates', { base: Number(e.target.value) })}
                      className={`${inputClasses} pl-8`}
                      placeholder="e.g., 50"
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor={`estimate-${method.id}`}>
                  Delivery Estimate
                </label>
                <input
                  id={`estimate-${method.id}`}
                  type="text"
                  value={method.delivery_estimate}
                  onChange={(e) => handleInputChange(method.id, 'delivery_estimate', e.target.value)}
                  className={inputClasses}
                  placeholder="e.g., 3-5 business days"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor={`comment-${method.id}`}>
                  Customer Comment
                </label>
                <input
                  id={`comment-${method.id}`}
                  type="text"
                  value={method.comment || ''}
                  onChange={(e) => handleInputChange(method.id, 'comment', e.target.value)}
                  className={inputClasses}
                  placeholder="e.g., Currently unavailable in your area"
                />
              </div>
            </div>

            {hasChanges[method.id] && (
               <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-slate-800">
                  <button 
                     onClick={() => handleResetChanges(method.id)}
                     disabled={savingId === method.id}
                     className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all duration-200"
                  >
                     <Undo2 size={16} /> Reset
                  </button>
                  <button
                    onClick={() => handleSaveChanges(method.id)}
                    disabled={savingId === method.id}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition-all duration-200 disabled:bg-yellow-400/50"
                  >
                    {savingId === method.id ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                    {savingId === method.id ? 'Saving...' : 'Save Changes'}
                  </button>
               </div>
            )}
          </div>
        ))}

        {editableMethods.length === 0 && !loading && (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-xl">
             <p className="text-slate-400">No shipping methods found.</p>
             <p className="text-sm text-slate-500 mt-1">Please add shipping methods in your database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingSettings;