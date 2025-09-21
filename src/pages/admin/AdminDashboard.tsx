// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { User, Package, IndianRupeeIcon } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import RecentOrdersList from '../../components/dashboard/RecentOrdersList';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { format, differenceInDays } from 'date-fns';

interface KPI {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersStatusData, setOrdersStatusData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [slowProducts, setSlowProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [userEngagement, setUserEngagement] = useState<any[]>([]);
  const [shipmentsStatusData, setShipmentsStatusData] = useState<any[]>([]);
  const [revenueHeatmapData, setRevenueHeatmapData] = useState<any[]>([]);
  const [promoUsageData, setPromoUsageData] = useState<any[]>([]);
  const [filterRange, setFilterRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // --- Users & Recent Signups ---
      const { data: usersData } = await supabase.from('profiles').select('*');
      setRecentUsers(
        (usersData || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      );

      // --- Orders ---
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          placed_at,
          status,
          total,
          user_id,
          promo_code,
          delivery_option,
          payment_method,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (id,name,category_id,rating,reviews)
          )
        `);

      const successfulOrders = (ordersData || []).filter(o => ['confirmed','paid'].includes(o.status));

      // --- Recent Orders ---
      setRecentOrders(
        successfulOrders
          .sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime())
          .slice(0, 5)
          .map(o => ({ ...o, statusColor: o.status === 'confirmed' ? 'bg-blue-600' : 'bg-green-600' }))
      );

      // --- KPIs ---
      setKpis([
        { title: 'Total Users', value: usersData?.length || 0, icon: <User className="w-6 h-6 text-tamoor-gold-light" />, colorClass: 'bg-pink-600' },
        { title: 'Total Orders', value: successfulOrders.length, icon: <Package className="w-6 h-6 text-white" />, colorClass: 'bg-blue-600' },
        { title: 'Revenue', value: successfulOrders.reduce((sum, o) => sum + (o.total || 0), 0), icon: <IndianRupeeIcon className="w-6 h-6 text-white" />, colorClass: 'bg-green-600' },
      ]);

      // --- Revenue vs Orders Trend ---
      const trendData: Record<string, { revenue: number; orders: number }> = {};
      successfulOrders.forEach(order => {
        const date = format(new Date(order.placed_at), 'yyyy-MM-dd');
        if (!trendData[date]) trendData[date] = { revenue: 0, orders: 0 };
        trendData[date].revenue += order.total || 0;
        trendData[date].orders += 1;
      });
      setRevenueData(Object.entries(trendData).map(([date, val]) => ({ date, revenue: val.revenue, orders: val.orders })));

      // --- Orders by Status Pie Chart ---
      const statusCounts: Record<string, number> = { confirmed: 0, paid: 0, cancelled: 0, pending: 0, packed: 0 };
      (ordersData || []).forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
      setOrdersStatusData(Object.entries(statusCounts).map(([status, value]) => ({ status, value })));

      // --- Top & Slow-Moving Products ---
      const productCounts: Record<string, { qty: number; rating: number; reviews: number }> = {};
      successfulOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const name = item.products?.name || 'Unknown';
          if (!productCounts[name]) productCounts[name] = { qty: 0, rating: item.products?.rating || 0, reviews: item.products?.reviews || 0 };
          productCounts[name].qty += item.quantity;
        });
      });
      const sortedProducts = Object.entries(productCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.qty - a.qty);
      setTopProducts(sortedProducts.slice(0, 5));
      setSlowProducts(sortedProducts.slice(-5));

      // --- Low Stock Products ---
      const { data: productsData } = await supabase.from('products').select('id,name,stock_quantity,stock_unit').lt('stock_quantity', 5);
      setLowStockProducts(productsData || []);
      if ((productsData || []).length > 0) toast.warn('Some products are low in stock!');

      // --- Shipments Status & Delayed Orders ---
      const { data: shipmentsData } = await supabase.from('shipments').select('*');
      const shipmentStatusCounts: Record<string, number> = {};
      const delayedOrders: any[] = [];
      (shipmentsData || []).forEach(s => {
        shipmentStatusCounts[s.status] = (shipmentStatusCounts[s.status] || 0) + 1;
        if (s.status !== 'delivered' && differenceInDays(new Date(), new Date(s.created_at)) > 7) delayedOrders.push(s);
      });
      if (delayedOrders.length) toast.error('Some shipments are delayed!');
      setShipmentsStatusData(Object.entries(shipmentStatusCounts).map(([status, value]) => ({ status, value })));

      // --- User Engagement (Daily Logins / Active Users) ---
      const loginData: Record<string, number> = {};
      (usersData || []).forEach(user => {
        if (!user.last_login) return;
        const date = format(new Date(user.last_login), 'yyyy-MM-dd');
        loginData[date] = (loginData[date] || 0) + 1;
      });
      setUserEngagement(Object.entries(loginData).map(([date, logins]) => ({ date, logins })));

      // --- Revenue Heatmap ---
      const heatmapData: Record<string, number> = {};
      successfulOrders.forEach(order => {
        const date = format(new Date(order.placed_at), 'yyyy-MM-dd');
        heatmapData[date] = (heatmapData[date] || 0) + (order.total || 0);
      });
      setRevenueHeatmapData(Object.entries(heatmapData).map(([date, total]) => ({ date, total })));

      // --- Promo Code Usage ---
      const promoMap: Record<string, { usage_count: number; revenue: number }> = {};
      (successfulOrders || []).forEach(order => {
        if (!order.promo_code) return;
        if (!promoMap[order.promo_code]) promoMap[order.promo_code] = { usage_count: 0, revenue: 0 };
        promoMap[order.promo_code].usage_count += 1;
        promoMap[order.promo_code].revenue += order.total || 0;
      });
      setPromoUsageData(Object.entries(promoMap).map(([code, data]) => ({ promo_code: code, ...data })));

      setLoading(false);
    };

    fetchDashboardData();
  }, [filterRange]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient1">
      <span className="text-xl font-semibold text-white">Loading Dashboard...</span>
    </div>
  );

  const COLORS = ['#1D4ED8', '#10B981', '#EF4444', '#FBBF24', '#EC4899'];
  const AXIS_STYLE = { fill: '#FBBF24', fontSize: 14 };
  const BAR_COLORS = ['#FBBF24', '#EC4899', '#10B981', '#1D4ED8', '#EF4444'];

  return (
    <div className="min-h-screen bg-dashboard-gradient1 text-tamoor-charcoal flex flex-col overflow-x-hidden">
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6 sm:mb-8 md:mb-12 px-4 md:px-12">
        Admin <span className="tamoor-gradient">Dashboard</span>
      </h1>

      {/* Date Range Picker */}
      <div className="flex space-x-4 mb-6 px-4 md:px-12">
        <DatePicker
          selected={filterRange.start}
          onChange={(date: Date | null) => date && setFilterRange({ ...filterRange, start: date })}
          selectsStart
          startDate={filterRange.start}
          endDate={filterRange.end}
        />
        <DatePicker
          selected={filterRange.end}
          onChange={(date: Date | null) => date && setFilterRange({ ...filterRange, end: date })}
          selectsEnd
          startDate={filterRange.start}
          endDate={filterRange.end}
        />
      </div>

      <div className="flex-grow px-4 md:px-12 max-w-screen-2xl w-full space-y-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
          {kpis.map(kpi => <KPICard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.colorClass} />)}
        </div>

        {/* Revenue vs Orders Trend */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Revenue vs Orders Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="orders" stroke="#1D4ED8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fast-Moving / Slow-Moving Products */}
        <div className="luxury-card glass p-6 shadow-xl overflow-x-auto">
          <h2 className="font-bold text-xl mb-4">Fast-Moving Products</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Product</th>
                <th className="border-b p-2">Quantity Sold</th>
                <th className="border-b p-2">Rating</th>
                <th className="border-b p-2">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p.name}>
                  <td className="border-b p-2">{p.name}</td>
                  <td className="border-b p-2">{p.qty}</td>
                  <td className="border-b p-2">{p.rating}</td>
                  <td className="border-b p-2">{p.reviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="luxury-card glass p-6 shadow-xl overflow-x-auto">
          <h2 className="font-bold text-xl mb-4">Slow-Moving Products</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Product</th>
                <th className="border-b p-2">Quantity Sold</th>
                <th className="border-b p-2">Rating</th>
                <th className="border-b p-2">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {slowProducts.map(p => (
                <tr key={p.name}>
                  <td className="border-b p-2">{p.name}</td>
                  <td className="border-b p-2">{p.qty}</td>
                  <td className="border-b p-2">{p.rating}</td>
                  <td className="border-b p-2">{p.reviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Products */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Low Stock / Inventory Alerts</h2>
          {lowStockProducts.length ? (
            <ul className="list-disc ml-6">{lowStockProducts.map(p => <li key={p.id}>{p.name} - {p.stock_quantity} {p.stock_unit}</li>)}</ul>
          ) : <p>All products sufficiently stocked.</p>}
        </div>

        {/* Recent Users */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Recent Users / New Signups</h2>
          <ul className="list-disc ml-6">{recentUsers.map(u => <li key={u.id}>{u.full_name || u.email} ({format(new Date(u.created_at), 'dd/MM/yyyy')})</li>)}</ul>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ordersStatusData} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {ordersStatusData.map((entry, index) => {
                  const color = entry.status === 'packed' ? '#EC4899' : COLORS[index % COLORS.length];
                  return <Cell key={index} fill={color} />;
                })}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Shipments Status Pie Chart */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Order Fulfillment / Delivery Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={shipmentsStatusData} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {shipmentsStatusData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Bar Chart */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={AXIS_STYLE} />
              <YAxis dataKey="name" type="category" tick={AXIS_STYLE} />
              <Tooltip />
              <Bar dataKey="qty">
                {topProducts.map((entry, index) => (
                  <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="w-full overflow-x-hidden">
          <RecentOrdersList orders={recentOrders} />
        </div>

        {/* Revenue Heatmap */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">Revenue Heatmap / Calendar</h2>
          <div className="grid grid-cols-7 gap-1">
            {revenueHeatmapData.map(day => {
              const intensity = Math.min(day.total / 1000, 1);
              return (
                <div
                  key={day.date}
                  className="h-6 w-6 rounded cursor-pointer"
                  style={{ backgroundColor: `rgba(16,185,129,${intensity})` }}
                  title={`${day.date}: ₹${day.total}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-sm text-gray-300">Darker green = higher revenue</p>
        </div>

        {/* User Engagement */}
        <div className="luxury-card glass p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4">User Engagement (Daily Logins)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip />
              <Line type="monotone" dataKey="logins" stroke="#FBBF24" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
