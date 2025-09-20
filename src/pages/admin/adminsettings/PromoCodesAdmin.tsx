import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { Trash2, X, Edit } from 'lucide-react';
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
    type: 'percentage',
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
      const { error } = await supabase.from('promo_codes').insert(payload);
      if (!error) {
        fetchPromoCodes();
        setShowModal(false);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-tamoor-charcoal">Promo Codes Admin</h1>
      <button
        className="mb-4 px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white rounded-lg shadow-md hover:scale-105 transition transform"
        onClick={() => openModal()}
      >
        + Add Promo Code
      </button>

      {/* Promo Codes Table */}
      <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Code</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Type</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Value</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Min Order</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Valid From</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Valid To</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">First Order</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Enabled</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Usage</th>
            <th className="p-3 sm:p-2 text-xs sm:text-sm border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10} className="text-center p-4">Loading...</td>
            </tr>
          ) : promoCodes.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center p-4">No promo codes found.</td>
            </tr>
          ) : (
            promoCodes.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">{promo.code}</td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border capitalize">{promo.type}</td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">{promo.value}</td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">{promo.min_order_amount}</td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">{new Date(promo.valid_from).toLocaleDateString()}</td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">{new Date(promo.valid_to).toLocaleDateString()}</td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">
                  {promo.first_order_only ? <span className="text-yellow-700 font-semibold">Yes</span> : 'No'}
                </td>
                <td className="p-2 sm:p-1 text-xs sm:text-sm border">
                  <button
                    className={`px-3 py-1 rounded-full text-white ${promo.enabled ? 'bg-green-500' : 'bg-gray-400'}`}
                    onClick={() => toggleEnable(promo.id, promo.enabled)}
                  >
                    {promo.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="p-2 border text-center">
                  {promo.usage_limit ? `${promo.used_count} / ${promo.usage_limit}` : `${promo.used_count}`}
                </td>
                <td className="p-2 border flex flex-col sm:flex-row justify-center gap-2">
                  <button onClick={() => openModal(promo)} className="text-blue-500 hover:text-blue-700">
                    <Edit />
                  </button>
                  <button onClick={() => deletePromo(promo.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl w-full max-w-lg shadow-xl relative animate-slide-in">
            <h2 className="text-2xl font-bold mb-4 text-tamoor-charcoal">{editingPromo ? 'Edit' : 'Add'} Promo Code</h2>
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-red-500 transition"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Promo Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g., WELCOME10"
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                />
                <span className="text-sm text-gray-500 mt-1">Unique code for users</span>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Value</label>
                <input
                  type="number"
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Minimum Order</label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={form.min_order_amount}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Valid From</label>
                <DatePicker
                  selected={form.valid_from}
                  onChange={(date) => handleDateChange(date!, 'valid_from')}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Valid To</label>
                <DatePicker
                  selected={form.valid_to}
                  onChange={(date) => handleDateChange(date!, 'valid_to')}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">Usage Limit (Optional)</label>
                <input
                  type="number"
                  name="usage_limit"
                  value={form.usage_limit}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col justify-center gap-2 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="first_order_only"
                    checked={form.first_order_only}
                    onChange={handleChange}
                    className="accent-yellow-500 w-5 h-5"
                  />
                  First Order Only
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={form.enabled}
                    onChange={handleChange}
                    className="accent-yellow-500 w-5 h-5"
                  />
                  Enabled
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition transform"
              >
                {editingPromo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodesAdmin;
