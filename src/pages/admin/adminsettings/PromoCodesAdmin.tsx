import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { Trash2, X, Edit, Plus, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface PromoCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  valid_from: string;
  valid_to: string;
  enabled: boolean;
  usage_limit?: number | null;
  used_count: number;
  first_order_only: boolean;
}

const PromoCodesAdmin: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order_amount: 0,
    valid_from: new Date(),
    valid_to: new Date(),
    enabled: true,
    usage_limit: 0,
    first_order_only: false,
  });

  /** Fetch all promo codes */
  const fetchPromoCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setPromoCodes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  /** Toggle enable/disable */
  const toggleEnable = async (id: number, enabled: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ enabled: !enabled, updated_at: new Date() })
      .eq('id', id);
    if (!error) fetchPromoCodes();
  };

  /** Delete promo */
  const deletePromo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) fetchPromoCodes();
  };

  /** Open modal for create/edit */
  const openModal = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setForm({
        code: promo.code,
        type: promo.type,
        value: promo.value,
        min_order_amount: promo.min_order_amount,
        valid_from: new Date(promo.valid_from),
        valid_to: new Date(promo.valid_to),
        enabled: promo.enabled,
        usage_limit: promo.usage_limit || 0,
        first_order_only: promo.first_order_only,
      });
    } else {
      setEditingPromo(null);
      setForm({
        code: '',
        type: 'percentage',
        value: 0,
        min_order_amount: 0,
        valid_from: new Date(),
        valid_to: new Date(),
        enabled: true,
        usage_limit: 0,
        first_order_only: false,
      });
    }
    setShowModal(true);
  };

  /** Handle form input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
    } else if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      setForm((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  /** Handle date changes */
  const handleDateChange = (date: Date, field: 'valid_from' | 'valid_to') => {
    setForm((prev) => ({ ...prev, [field]: date }));
  };

  /** Submit form for create/edit */
  const handleSubmit = async () => {
    if (!form.code) return alert('Code is required');
    if (form.value <= 0) return alert('Value must be greater than 0');
    if (form.valid_to < form.valid_from) return alert('Valid To must be after Valid From');

    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_order_amount: Number(form.min_order_amount),
      valid_from: form.valid_from,
      valid_to: form.valid_to,
      enabled: form.enabled,
      usage_limit: form.usage_limit > 0 ? Number(form.usage_limit) : null,
      first_order_only: form.first_order_only,
      updated_at: new Date(),
    };

    if (editingPromo) {
      const { error } = await supabase
        .from('promo_codes')
        .update(payload)
        .eq('id', editingPromo.id);
      if (!error) {
        fetchPromoCodes();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase.from('promo_codes').insert(payload as any);
      if (!error) {
        fetchPromoCodes();
        setShowModal(false);
      }
    }
  };

  const inputClasses = "w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";
  const selectClasses = `${inputClasses} appearance-none`;

  return (
    <div className="animate-fadeIn">
      <style>{`
        .react-datepicker { background-color: #0f172a; border: 1px solid #334155; }
        .react-datepicker__header { background-color: #1e293b; border-bottom: 1px solid #334155; }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header, .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name { color: #cbd5e1; }
        .react-datepicker__day:hover { background-color: #334155; }
        .react-datepicker__day--selected { background-color: #f59e0b; color: #020617; }
        .react-datepicker__navigation-icon::before { border-color: #cbd5e1; }
      `}</style>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">Manage Promo Codes</h2>
          <p className="text-slate-400 mt-1">Create, edit, and track promotional discounts.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition-all duration-200"
        >
          <Plus size={18} /> Add New Code
        </button>
      </header>
      
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/60">
              <tr>
                <th scope="col" className="px-6 py-3">Code</th>
                <th scope="col" className="px-6 py-3">Value</th>
                <th scope="col" className="px-6 py-3">Min. Order</th>
                <th scope="col" className="px-6 py-3">Validity</th>
                <th scope="col" className="px-6 py-3">Usage</th>
                <th scope="col" className="px-6 py-3 text-center">Enabled</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center p-6"><Loader2 className="animate-spin text-cyan-400 mx-auto" /></td></tr>
              ) : promoCodes.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-6 text-slate-500">No promo codes found.</td></tr>
              ) : (
                promoCodes.map((promo) => (
                  <tr key={promo.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono font-bold text-yellow-400">{promo.code}</td>
                    <td className="px-6 py-4">{promo.type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}</td>
                    <td className="px-6 py-4">₹{promo.min_order_amount}</td>
                    <td className="px-6 py-4">{new Date(promo.valid_from).toLocaleDateString()} - {new Date(promo.valid_to).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{promo.used_count} / {promo.usage_limit ?? '∞'}</td>
                    <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleEnable(promo.id, promo.enabled)}
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${promo.enabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}
                        >
                          {promo.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => openModal(promo)} className="text-slate-400 hover:text-cyan-400 transition"><Edit size={16} /></button>
                        <button onClick={() => deletePromo(promo.id)} className="text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-2xl shadow-xl relative animate-fadeIn">
            <h2 className="text-xl font-bold mb-6 text-yellow-400">{editingPromo ? 'Edit' : 'Add'} Promo Code</h2>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><X size={20} /></button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Promo Code</label><input type="text" name="code" value={form.code} onChange={handleChange} className={inputClasses} placeholder="e.g., WELCOME10" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Type</label><select name="type" value={form.type} onChange={handleChange} className={selectClasses}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Value ({form.type === 'percentage' ? '%' : '₹'})</label><input type="number" name="value" value={form.value} onChange={handleChange} className={inputClasses} /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Min. Order Amount (₹)</label><input type="number" name="min_order_amount" value={form.min_order_amount} onChange={handleChange} className={inputClasses} /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Usage Limit (0 for unlimited)</label><input type="number" name="usage_limit" value={form.usage_limit} onChange={handleChange} className={inputClasses} /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Valid From</label><DatePicker selected={form.valid_from} onChange={(d) => handleDateChange(d!, 'valid_from')} className={inputClasses} /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Valid To</label><DatePicker selected={form.valid_to} onChange={(d) => handleDateChange(d!, 'valid_to')} className={inputClasses} /></div>
              
              <div className="md:col-span-2 flex items-center justify-between bg-slate-800/50 p-3 rounded-lg mt-2">
                <span className="font-medium text-slate-200">First Order Only?</span>
                <label className="flex items-center cursor-pointer"><input type="checkbox" name="first_order_only" checked={form.first_order_only} onChange={handleChange} className="sr-only peer" /><div className="relative w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div></label>
              </div>
              <div className="md:col-span-2 flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                <span className="font-medium text-slate-200">Enabled</span>
                <label className="flex items-center cursor-pointer"><input type="checkbox" name="enabled" checked={form.enabled} onChange={handleChange} className="sr-only peer" /><div className="relative w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div></label>
              </div>

              <div className="flex justify-end mt-6 gap-3 md:col-span-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition font-semibold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="px-6 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition flex items-center gap-2">
                  {editingPromo ? 'Update Code' : 'Create Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodesAdmin;
