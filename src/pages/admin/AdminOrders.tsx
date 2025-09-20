// src/pages/admin/AdminOrders.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';
import dayjs from 'dayjs';

interface Order {
  id: number;
  user_id: string;
  placed_at: string;
  status: string;
  total: number;
  user_name?: string;
  user_phone?: string;
  shipment_status?: string;
  selected?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400 text-gray-900',
  confirmed: 'bg-blue-500 text-white',
  paid: 'bg-green-600 text-white',
  processing: 'bg-indigo-500 text-white',
  packed: 'bg-purple-600 text-white',
  shipped: 'bg-orange-500 text-white',
  delivered: 'bg-green-800 text-white',
  cancelled: 'bg-red-600 text-white',
};

const SHIPMENT_STATUS_COLORS: Record<string, string> = {
  Packed: 'bg-purple-300 text-purple-800',
  Picked: 'bg-blue-300 text-blue-800',
  Shipped: 'bg-orange-300 text-orange-800',
  'Out for Delivery': 'bg-yellow-300 text-yellow-800',
  'Arriving Early': 'bg-green-200 text-green-900',
  'Delivery Delayed': 'bg-red-300 text-red-900',
  Delivered: 'bg-green-600 text-white',
};

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'paid',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

const SORT_OPTIONS = ['Date Desc', 'Date Asc', 'Total Desc', 'Total Asc', 'Status A-Z', 'Status Z-A'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    statusFilter: '',
    dateFrom: '',
    dateTo: '',
  });

  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { searchTerm, statusFilter, dateFrom, dateTo } = appliedFilters;

      let query = supabase
        .from('orders')
        .select('id, user_id, placed_at, status, total, address, shipments!inner(tracking_status)', { count: 'exact' })
        .order('placed_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (statusFilter) query = query.eq('status', statusFilter);
      if (searchTerm.trim()) {
        query = query.or(
          `id::text.ilike.%${searchTerm}%,address->>full_name.ilike.%${searchTerm}%,address->>phone.ilike.%${searchTerm}%`
        );
      }
      if (dateFrom) query = query.gte('placed_at', dateFrom);
      if (dateTo) query = query.lte('placed_at', dateTo);

      const { data, error, count } = await query;
      if (error) throw error;

      let mappedOrders = (data || []).map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        placed_at: order.placed_at,
        status: order.status,
        total: order.total,
        user_name: order.address?.full_name || 'N/A',
        user_phone: order.address?.phone || 'N/A',
        shipment_status: order.shipments?.tracking_status || 'N/A',
        selected: selectedOrders.includes(order.id),
      }));

      // Sorting
      mappedOrders = mappedOrders.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'Date Asc': return new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime();
          case 'Date Desc': return new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime();
          case 'Total Asc': return a.total - b.total;
          case 'Total Desc': return b.total - a.total;
          case 'Status A-Z': return a.status.localeCompare(b.status);
          case 'Status Z-A': return b.status.localeCompare(a.status);
          default: return 0;
        }
      });

      setOrders(mappedOrders);
      setTotalOrders(count || 0);
    } catch (err) {
      toast.error('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({
      searchTerm: searchInput,
      statusFilter,
      dateFrom,
      dateTo,
    });
    setPage(1);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 900000); // 15 min
    return () => clearInterval(interval);
  }, [page, sortBy, selectedOrders]);

  const totalPages = Math.ceil(totalOrders / pageSize);

  const toggleSelectOrder = (id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateSelectedOrdersStatus = async (newStatus: string) => {
    if (selectedOrders.length === 0) return toast.warn('No orders selected');
    try {
      for (const orderId of selectedOrders) {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      }
      toast.success(`Updated ${selectedOrders.length} orders to ${newStatus}`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update orders');
    }
  };

  const exportCSV = () => {
    if (selectedOrders.length === 0) return toast.warn('No orders selected');
    const csvRows = [
      ['Order ID', 'Name', 'Phone', 'Date', 'Status', 'Total', 'Shipment Status'],
      ...orders
        .filter((o) => selectedOrders.includes(o.id))
        .map((o) => [
          o.id,
          o.user_name,
          o.user_phone,
          o.placed_at,
          o.status,
          o.total.toFixed(2),
          o.shipment_status || 'N/A',
        ]),
    ];
    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="luxury-card glass p-4 sm:p-8 rounded-3xl shadow-xl max-w-full sm:max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl sm:text-4xl font-display font-bold mb-6 text-tamoor-charcoal">Orders</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 items-center">
        <div className="relative flex-1 min-w-[150px]">
          <input
            type="text"
            className="neomorphism w-full rounded-full py-3 pl-10 pr-4 text-tamoor-charcoal placeholder-tamoor-charcoal text-sm sm:text-base"
            placeholder="Search by ID, Name, Phone, Email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="absolute left-4 top-3 sm:top-3.5 text-tamoor-charcoal" />
        </div>

        <select
          className="flex-1 min-w-[120px] rounded-full py-3 px-4 border border-gray-300 text-sm sm:text-base"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="flex-1 min-w-[120px] rounded-full py-3 px-4 border border-gray-300 text-sm sm:text-base"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="flex-1 min-w-[120px] rounded-full py-3 px-4 border border-gray-300 text-sm sm:text-base"
        />

        <select
          className="flex-1 min-w-[120px] rounded-full py-3 px-4 border border-gray-300 text-sm sm:text-base"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button onClick={applyFilters} className="btn-premium py-3 px-6 text-sm sm:text-base">
          Apply Filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            className="rounded-full py-2 px-4 border border-gray-300 text-sm sm:text-base"
            onChange={(e) => updateSelectedOrdersStatus(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Update Status
            </option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="btn-premium flex items-center gap-2 text-sm sm:text-base"
          >
            Export CSV
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto sm:block">
        <table className="min-w-full table-auto border-collapse border border-slate-300 rounded-lg overflow-hidden hidden sm:table">
          <thead className="bg-tamoor-gold-light text-white">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) =>
                    setSelectedOrders(e.target.checked ? orders.map(o => o.id) : [])
                  }
                />
              </th>
              <th className="p-3">Order ID</th>
              <th className="p-3">User Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Order Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total (₹)</th>
              <th className="p-3">Shipment</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="border border-slate-300 p-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              : orders.length === 0
              ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-tamoor-charcoal">
                    No orders found.
                  </td>
                </tr>
              )
              : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/20 transition-colors">
                    <td className="border border-slate-300 p-3">
                      <input
                        type="checkbox"
                        checked={order.selected || false}
                        onChange={() => toggleSelectOrder(order.id)}
                      />
                    </td>
                    <td
                      className="border border-slate-300 p-3 cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      {order.id}
                    </td>
                    <td className="border border-slate-300 p-3">{order.user_name}</td>
                    <td className="border border-slate-300 p-3">{order.user_phone}</td>
                    <td className="border border-slate-300 p-3">
                      {new Date(order.placed_at).toLocaleDateString()}
                    </td>
                    <td className="border border-slate-300 p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          STATUS_COLORS[order.status] || 'bg-gray-400 text-gray-900'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-3">{order.total.toFixed(2)}</td>
                    <td className="border border-slate-300 p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          SHIPMENT_STATUS_COLORS[order.shipment_status!] || 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {order.shipment_status}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="btn-premium text-sm"
                      >
                        View
                      </button>
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={async () => {
                            await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                            toast.success('Order cancelled');
                            fetchOrders();
                          }}
                          className="btn-danger text-sm flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Mobile Stacked Cards */}
        <div className="sm:hidden flex flex-col gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse bg-white/10"></div>
              ))
            : orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg bg-white/10 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span><strong>ID:</strong> {order.id}</span>
                    <input
                      type="checkbox"
                      checked={order.selected || false}
                      onChange={() => toggleSelectOrder(order.id)}
                    />
                  </div>
                  <p><strong>Name:</strong> {order.user_name}</p>
                  <p><strong>Phone:</strong> {order.user_phone}</p>
                  <p><strong>Date:</strong> {new Date(order.placed_at).toLocaleDateString()}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      STATUS_COLORS[order.status] || 'bg-gray-400 text-gray-900'
                    }`}>{order.status}</span>
                  </p>
                  <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                  <p>
                    <strong>Shipment:</strong>{' '}
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      SHIPMENT_STATUS_COLORS[order.shipment_status!] || 'bg-gray-200 text-gray-800'
                    }`}>{order.shipment_status}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="btn-premium text-sm"
                    >
                      View
                    </button>
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={async () => {
                          await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                          toast.success('Order cancelled');
                          fetchOrders();
                        }}
                        className="btn-danger text-sm flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
