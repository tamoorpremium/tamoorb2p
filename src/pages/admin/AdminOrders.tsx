import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Download, ChevronsUpDown, Filter, Edit } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';
import dayjs from 'dayjs';

// --- All your interfaces and constants are preserved ---
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
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  paid: 'bg-green-500/20 text-green-300 border-green-500/30',
  processing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  packed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  shipped: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  delivered: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const SHIPMENT_STATUS_COLORS: Record<string, string> = {
    Packed: 'bg-purple-500/20 text-purple-300',
    Picked: 'bg-blue-500/20 text-blue-300',
    Shipped: 'bg-orange-500/20 text-orange-300',
    'Out for Delivery': 'bg-yellow-500/20 text-yellow-300',
    'Arriving Early': 'bg-green-500/20 text-green-300',
    'Delivery Delayed': 'bg-red-500/20 text-red-300',
    Delivered: 'bg-teal-500/20 text-teal-300',
    'Not Shipped': 'bg-gray-700 text-gray-400',
};

const ORDER_STATUSES = ['pending', 'confirmed', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const SORT_OPTIONS = ['Date Desc', 'Date Asc', 'Total Desc', 'Total Asc', 'Status A-Z', 'Status Z-A'];

const AdminOrders: React.FC = () => {
  // --- All your state management and logic remains identical ---
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
  const [appliedFilters, setAppliedFilters] = useState({ searchTerm: '', statusFilter: '', dateFrom: '', dateTo: '' });

  const navigate = useNavigate();

  const fetchOrders = async (currentAppliedFilters = appliedFilters, currentPage = page, currentSortBy = sortBy) => {
    setLoading(true);
    try {
      const { searchTerm, statusFilter, dateFrom, dateTo } = currentAppliedFilters;

      let query = supabase
        .from('orders')
        .select('id, user_id, placed_at, status, total, address, shipments!left(tracking_status)', { count: 'exact' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // Apply sorting at the database level where possible
      if (currentSortBy === 'Date Asc') query = query.order('placed_at', { ascending: true });
      else if (currentSortBy === 'Date Desc') query = query.order('placed_at', { ascending: false });
      else if (currentSortBy === 'Total Asc') query = query.order('total', { ascending: true });
      else if (currentSortBy === 'Total Desc') query = query.order('total', { ascending: false });
      else query = query.order('placed_at', { ascending: false }); // Default sort

      if (statusFilter) query = query.eq('status', statusFilter);
      if (searchTerm.trim()) {
        query = query.or(`id::text.ilike.%${searchTerm}%,address->>full_name.ilike.%${searchTerm}%,address->>phone.ilike.%${searchTerm}%`);
      }
      if (dateFrom) query = query.gte('placed_at', `${dateFrom}T00:00:00`);
      if (dateTo) query = query.lte('placed_at', `${dateTo}T23:59:59`);
      
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
        shipment_status: order.shipments?.tracking_status || 'Not Shipped',
        selected: selectedOrders.includes(order.id),
      }));

      // Handle client-side sorting for status
      if (currentSortBy === 'Status A-Z') mappedOrders.sort((a, b) => a.status.localeCompare(b.status));
      if (currentSortBy === 'Status Z-A') mappedOrders.sort((a, b) => b.status.localeCompare(a.status));

      setOrders(mappedOrders);
      setTotalOrders(count || 0);
    } catch (err: any) {
      toast.error(`Failed to fetch orders: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    const newFilters = { searchTerm: searchInput, statusFilter, dateFrom, dateTo };
    setAppliedFilters(newFilters);
    setPage(1); // Reset to first page on new filter application
    fetchOrders(newFilters, 1, sortBy);
  };
  
  useEffect(() => {
    // This effect now triggers a refetch when filters change.
    // The main fetch is handled by `applyFilters` and pagination/sort effects.
    const newFilters = { searchTerm: searchInput, statusFilter, dateFrom, dateTo };
    setAppliedFilters(newFilters);
  }, [searchInput, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders(appliedFilters, page, sortBy);
  }, [page, sortBy, appliedFilters]);
  
  useEffect(() => {
    setOrders(prevOrders => prevOrders.map(o => ({...o, selected: selectedOrders.includes(o.id)})));
  }, [selectedOrders]);


  const totalPages = Math.ceil(totalOrders / pageSize);

  const toggleSelectOrder = (id: number) => {
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const updateSelectedOrdersStatus = async (newStatus: string) => {
    if (selectedOrders.length === 0) return toast.warn('No orders selected');
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).in('id', selectedOrders);
      if (error) throw error;

      toast.success(`Updated ${selectedOrders.length} orders to ${newStatus}`);
      setSelectedOrders([]);
      fetchOrders(appliedFilters, page, sortBy); // Refetch data
    } catch (err) {
      console.error(err);
      toast.error('Failed to update orders');
    }
  };

  const exportCSV = () => {
    if (selectedOrders.length === 0) return toast.warn('No orders selected');
    const csvRows = [
      ['Order ID', 'Name', 'Phone', 'Date', 'Status', 'Total', 'Shipment Status'],
      ...orders.filter((o) => selectedOrders.includes(o.id)).map((o) => [o.id, `"${o.user_name}"`, o.user_phone, dayjs(o.placed_at).format('YYYY-MM-DD HH:mm'), o.status, o.total.toFixed(2), o.shipment_status || 'N/A']),
    ];
    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-yellow-400/20">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-yellow-400 mb-4 sm:mb-0">
            Manage Orders
          </h1>
      </header>
      
      <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 mb-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="relative lg:col-span-2 xl:col-span-2">
                  <input type="text" className="w-full rounded-lg py-2 pl-10 pr-4 bg-gray-900/70 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Search ID, Name, Phone..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <select className="w-full rounded-lg py-2 px-4 bg-gray-900/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg py-2 px-4 bg-gray-900/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg py-2 px-4 bg-gray-900/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <button onClick={applyFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105 font-bold">
                <Filter size={18}/> Apply
              </button>
          </div>
      </div>
      
      <div className="p-4 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-300">Sort by:</label>
            <select className="rounded-lg py-1 px-2 bg-gray-700 text-white focus:outline-none text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <span className="text-sm font-semibold text-yellow-300">{selectedOrders.length} selected</span>
              <select className="rounded-lg py-1 px-2 bg-gray-700 text-white focus:outline-none text-sm" onChange={(e) => updateSelectedOrdersStatus(e.target.value)} value="">
                <option value="" disabled>Update Status...</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition">
                <Download size={14}/> Export
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-yellow-400/10">
              <tr className="text-yellow-300 uppercase tracking-wider text-xs">
                <th className="p-3"><input type="checkbox" className="bg-gray-800 border-gray-600 rounded" checked={selectedOrders.length === orders.length && orders.length > 0} onChange={(e) => setSelectedOrders(e.target.checked ? orders.map(o => o.id) : [])} /></th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Shipment</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-400/10">
              {loading ? Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={8} className="p-4"><div className="h-8 bg-gray-800/50 rounded"></div></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">No orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className={`hover:bg-yellow-400/5 transition-colors ${order.selected ? 'bg-yellow-400/10' : ''}`}>
                  <td className="p-3"><input type="checkbox" className="bg-gray-800 border-gray-600 rounded" checked={order.selected || false} onChange={() => toggleSelectOrder(order.id)} /></td>
                  <td className="p-3"><div className="font-bold text-gray-100 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>#{order.id}</div></td>
                  <td className="p-3">
                    <div className="font-semibold text-gray-200">{order.user_name}</div>
                    <div className="text-sm text-gray-400">{order.user_phone}</div>
                  </td>
                  <td className="p-3 text-sm text-gray-400">{dayjs(order.placed_at).format('DD MMM YYYY, hh:mm A')}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>{order.status}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SHIPMENT_STATUS_COLORS[order.shipment_status!] || 'bg-gray-700 text-gray-400'}`}>{order.shipment_status}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-lg text-white">₹{order.total.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                        <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="p-2 bg-yellow-400/80 text-gray-900 rounded-full hover:bg-yellow-400 hover:scale-110 transition-all" title="View Details"><Edit size={16} /></button>
                        {order.status !== 'cancelled' && (
                           <button 
                             onClick={async () => {
                                await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                                toast.success(`Order #${order.id} cancelled`);
                                fetchOrders(appliedFilters, page, sortBy);
                             }}
                             className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all" title="Cancel Order"
                           >
                             <Trash2 size={16} />
                           </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-600/70">Prev</button>
            <span className="px-3 py-1 text-sm font-semibold">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-600/70">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

