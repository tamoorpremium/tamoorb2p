// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { User, Package, IndianRupeeIcon, BarChart3, Users, AlertTriangle, Star, TrendingUp, TrendingDown, Clock, UserCheck, TicketPercent, ClipboardList } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';

// --- CONSTANTS ---
const CHART_COLORS = ['#38BDF8', '#34D399', '#FBBF24', '#818CF8', '#F472B6', '#2DD4BF'];
const AXIS_STYLE = { fill: '#94a3b8', fontSize: 12 };
const TooltipStyle = { contentStyle: { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }, labelStyle: { color: '#f1f5f9' }};


// --- Helper Components ---
interface TrendData { name: string; value: number; }
interface EnhancedKPICardProps { title: string; value: string; trend: TrendData[]; icon: React.ReactNode; trendColor: string; }

const EnhancedKPICard: React.FC<EnhancedKPICardProps> = ({ title, value, trend, icon, trendColor }) => (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10">
        <div className="flex justify-between items-start">
            <div className="flex flex-col"><p className="text-slate-400 text-sm font-medium">{title}</p><p className="text-3xl font-bold text-gray-100 mt-1">{value}</p></div>
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">{icon}</div>
        </div>
        <div className="mt-4 h-16 w-full">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}><Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#f1f5f9' }} itemStyle={{ color: trendColor }} /><Line type="monotone" dataKey="value" stroke={trendColor} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>
        </div>
    </div>
);


// --- Main Dashboard Component ---
const AdminDashboard: React.FC = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [revenueKpi, setRevenueKpi] = useState({ value: 0, trend: [] as TrendData[] });
    const [ordersKpi, setOrdersKpi] = useState({ value: 0, trend: [] as TrendData[] });
    const [usersKpi, setUsersKpi] = useState({ value: 0, trend: [] as TrendData[] });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [ordersStatusData, setOrdersStatusData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [slowProducts, setSlowProducts] = useState<any[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
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
            
            // NOTE: Add a .range() filter here in the future based on filterRange state for performance
            const { data: usersData } = await supabase.from('profiles').select('*');
            const { data: ordersData } = await supabase.from('orders').select(`id, placed_at, status, total, user_id, promo_code, order_items (id, quantity, products (id,name,rating,reviews))`);
            const { data: productsData } = await supabase.from('products').select('id,name,stock_quantity,stock_unit').lt('stock_quantity', 10);
            const { data: shipmentsData } = await supabase.from('shipments').select('*');

            const successfulOrders = (ordersData || []).filter(o => ['confirmed', 'paid'].includes(o.status));

            const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const totalOrders = successfulOrders.length;
            const totalUsers = (usersData || []).length;
            const generateRealTrend = (data: any[], dateField: string, valueField?: string) => {
                const trend: Record<string, number> = {};
                for (let i = 6; i >= 0; i--) { trend[format(subDays(new Date(), i), 'yyyy-MM-dd')] = 0; }
                data.forEach(item => {
                    const date = format(new Date(item[dateField]), 'yyyy-MM-dd');
                    if (trend[date] !== undefined) { trend[date] += valueField ? item[valueField] : 1; }
                });
                return Object.entries(trend).map(([name, value]) => ({ name, value }));
            };
            setRevenueKpi({ value: totalRevenue, trend: generateRealTrend(successfulOrders, 'placed_at', 'total') });
            setOrdersKpi({ value: totalOrders, trend: generateRealTrend(successfulOrders, 'placed_at') });
            setUsersKpi({ value: totalUsers, trend: generateRealTrend(usersData || [], 'created_at') });

            const trendData: Record<string, { revenue: number; orders: number }> = {};
            successfulOrders.forEach(order => {
                const date = format(new Date(order.placed_at), 'yyyy-MM-dd');
                if (!trendData[date]) trendData[date] = { revenue: 0, orders: 0 };
                trendData[date].revenue += order.total || 0;
                trendData[date].orders += 1;
            });
            setRevenueData(Object.entries(trendData).map(([date, val]) => ({ date, ...val })));

            const sortedRecentOrders = [...successfulOrders].sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime()).slice(0, 5);
            setRecentOrders(sortedRecentOrders);

            const statusCounts: Record<string, number> = {};
            (ordersData || []).forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
            setOrdersStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

            const productCounts: Record<string, { qty: number; rating: number; reviews: number }> = {};
            successfulOrders.forEach(order => order.order_items?.forEach((item: any) => {
                const name = item.products?.name || 'Unknown';
                if (!productCounts[name]) productCounts[name] = { qty: 0, rating: item.products?.rating || 0, reviews: item.products?.reviews || 0 };
                productCounts[name].qty += item.quantity;
            }));
            const sortedProducts = Object.entries(productCounts).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.qty - a.qty);
            setTopProducts(sortedProducts.slice(0, 5));
            setSlowProducts(sortedProducts.slice(-5).reverse());

            setLowStockProducts(productsData || []);
            if ((productsData || []).length > 0) toast.warn(`${productsData?.length} products are low in stock!`);
            setRecentUsers((usersData || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
            
            const shipmentStatusCounts: Record<string, number> = {};
            const delayedOrders = (shipmentsData || []).filter(s => s.status !== 'delivered' && differenceInDays(new Date(), new Date(s.created_at)) > 7);
            (shipmentsData || []).forEach(s => { shipmentStatusCounts[s.status] = (shipmentStatusCounts[s.status] || 0) + 1; });
            if (delayedOrders.length > 0) toast.error(`${delayedOrders.length} shipment(s) are delayed!`);
            setShipmentsStatusData(Object.entries(shipmentStatusCounts).map(([name, value]) => ({ name, value })));
            
            const loginData: Record<string, number> = {};
            (usersData || []).forEach(user => {
                if (!user.last_login) return;
                const date = format(new Date(user.last_login), 'yyyy-MM-dd');
                loginData[date] = (loginData[date] || 0) + 1;
            });
            setUserEngagement(Object.entries(loginData).map(([date, logins]) => ({ date, logins })));

            const heatmapData: Record<string, number> = {};
            const promoMap: Record<string, { usage_count: number; revenue: number }> = {};
            successfulOrders.forEach(order => {
                const date = format(new Date(order.placed_at), 'yyyy-MM-dd');
                heatmapData[date] = (heatmapData[date] || 0) + (order.total || 0);
                if (order.promo_code) {
                    if (!promoMap[order.promo_code]) promoMap[order.promo_code] = { usage_count: 0, revenue: 0 };
                    promoMap[order.promo_code].usage_count += 1;
                    promoMap[order.promo_code].revenue += order.total || 0;
                }
            });
            setRevenueHeatmapData(Object.entries(heatmapData).map(([date, total]) => ({ date, total })));
            setPromoUsageData(Object.entries(promoMap).map(([promo_code, data]) => ({ promo_code, ...data })));
            
            setLoading(false);
        };
        fetchDashboardData();
    }, [filterRange]);
    
    if (loading) return (<div className="w-full h-full flex items-center justify-center"><span className="text-xl font-semibold text-gray-200">Loading Command Center...</span></div>);

    return (
        <div className="flex-grow w-full max-w-screen-2xl mx-auto space-y-8">
            <ToastContainer theme="dark" position="bottom-right" />
            <header className="flex flex-col sm:flex-row justify-between sm:items-center">
                <h1 className="text-3xl font-bold mb-4 sm:mb-0">Dashboard Overview</h1>
                <div className="flex flex-wrap gap-4">
                    <DatePicker selected={filterRange.start} onChange={(date: Date | null) => date && setFilterRange({ ...filterRange, start: date })} selectsStart startDate={filterRange.start} endDate={filterRange.end} className="bg-slate-800/50 text-white border border-slate-700 rounded-lg p-2 focus:ring-cyan-400 focus:border-cyan-400" />
                    <DatePicker selected={filterRange.end} onChange={(date: Date | null) => date && setFilterRange({ ...filterRange, end: date })} selectsEnd startDate={filterRange.start} endDate={filterRange.end} className="bg-slate-800/50 text-white border border-slate-700 rounded-lg p-2 focus:ring-cyan-400 focus:border-cyan-400" />
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card-animation" style={{animationDelay: '100ms'}}><EnhancedKPICard title="Total Revenue" value={`₹${revenueKpi.value.toLocaleString('en-IN')}`} trend={revenueKpi.trend} icon={<IndianRupeeIcon className="w-6 h-6 text-emerald-400" />} trendColor="#34D399" /></div>
                <div className="card-animation" style={{animationDelay: '200ms'}}><EnhancedKPICard title="Total Orders" value={ordersKpi.value.toLocaleString()} trend={ordersKpi.trend} icon={<Package className="w-6 h-6 text-sky-400" />} trendColor="#38BDF8" /></div>
                <div className="card-animation" style={{animationDelay: '300ms'}}><EnhancedKPICard title="Total Users" value={usersKpi.value.toLocaleString()} trend={usersKpi.trend} icon={<User className="w-6 h-6 text-indigo-400" />} trendColor="#818CF8" /></div>
            </div>
            <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '400ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300">Revenue vs Orders Trend</h2><ResponsiveContainer width="100%" height={250}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="#475569" /><XAxis dataKey="date" tick={AXIS_STYLE} /><YAxis tick={AXIS_STYLE} /><Tooltip {...TooltipStyle} /><Legend wrapperStyle={{ color: '#cbd5e1' }} /><Line type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS[1]} strokeWidth={2} /><Line type="monotone" dataKey="orders" name="Orders" stroke={CHART_COLORS[0]} strokeWidth={2} /></LineChart></ResponsiveContainer></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '500ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300 flex items-center gap-2"><TrendingUp size={20}/>Fast-Moving Products</h2><ProductTable products={topProducts} /></div>
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '600ms'}}><h2 className="font-bold text-xl mb-4 text-rose-400 flex items-center gap-2"><TrendingDown size={20}/>Slow-Moving Products</h2><ProductTable products={slowProducts} /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '700ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300">Order Status</h2><StatusPieChart data={ordersStatusData} /></div>
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '800ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300">Delivery Status</h2><StatusPieChart data={shipmentsStatusData} /></div>
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '900ms'}}><h2 className="font-bold text-xl mb-4 text-amber-400 flex items-center gap-2"><AlertTriangle size={20}/>Inventory Alerts</h2>{lowStockProducts.length > 0 ? (<ul className="space-y-2 text-sm">{lowStockProducts.map(p => <li key={p.id} className="p-2 bg-amber-500/10 rounded-md flex justify-between"><span>{p.name}</span> <span className="font-bold">{p.stock_quantity} units</span></li>)}</ul>) : <p className="text-slate-400">All products are sufficiently stocked.</p>}</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '1000ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300 flex items-center gap-2"><Clock size={20}/>User Engagement (Logins)</h2><ResponsiveContainer width="100%" height={200}><LineChart data={userEngagement}><CartesianGrid strokeDasharray="3 3" stroke="#475569" /><XAxis dataKey="date" tick={AXIS_STYLE} /><YAxis tick={AXIS_STYLE} allowDecimals={false} /><Tooltip {...TooltipStyle} /><Line type="monotone" dataKey="logins" name="Logins" stroke={CHART_COLORS[3]} strokeWidth={2} /></LineChart></ResponsiveContainer></div>
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '1100ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300 flex items-center gap-2"><UserCheck size={20}/>Recent Signups</h2>{recentUsers.length > 0 ? (<ul className="space-y-2 text-sm">{recentUsers.map(u => <li key={u.id} className="p-2 bg-sky-500/10 rounded-md flex justify-between"><span>{u.full_name || u.email}</span> <span className="text-slate-400">{format(new Date(u.created_at), 'dd MMM')}</span></li>)}</ul>) : <p className="text-slate-400">No new users in this period.</p>}</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '1200ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300">Revenue Heatmap</h2><div className="flex flex-wrap gap-1">{revenueHeatmapData.map(day => (<div key={day.date} className="h-5 w-5 rounded-sm" style={{ backgroundColor: `rgba(52, 211, 153, ${Math.min(day.total / 5000, 1)})` }} title={`${day.date}: ₹${day.total.toFixed(2)}`} />))}</div><p className="mt-2 text-sm text-slate-400">Darker green represents higher daily revenue.</p></div>
              <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '1300ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300 flex items-center gap-2"><TicketPercent size={20}/>Promo Code Usage</h2><PromoTable promos={promoUsageData} /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '1400ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300 flex items-center gap-2"><BarChart3 size={20}/>Top Products (by Quantity)</h2><TopProductsChart data={topProducts} /></div>
                <div className="card-animation bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl" style={{animationDelay: '1500ms'}}><h2 className="font-bold text-xl mb-4 text-cyan-300 flex items-center gap-2"><ClipboardList size={20}/>Recent Orders</h2><RecentOrdersTable orders={recentOrders} /></div>
            </div>
        </div>
    );
};

// --- Helper Components for Tables & Charts ---
const ProductTable: React.FC<{ products: any[] }> = ({ products }) => (<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2 text-slate-400 font-semibold">Product</th><th className="p-2 text-slate-400 font-semibold">Sold</th><th className="p-2 text-slate-400 font-semibold">Rating</th></tr></thead><tbody>{products.map(p => (<tr key={p.name} className="hover:bg-slate-800/50 border-b border-slate-800"><td className="p-2">{p.name}</td><td className="p-2">{p.qty}</td><td className="p-2 flex items-center gap-1">{p.rating} <Star size={12} className="text-amber-400"/></td></tr>))}</tbody></table></div>);
const StatusPieChart: React.FC<{ data: any[] }> = ({ data }) => (<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>{data.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip {...TooltipStyle} /><Legend wrapperStyle={{fontSize: '12px'}}/></PieChart></ResponsiveContainer>);
const PromoTable: React.FC<{ promos: any[] }> = ({ promos }) => (<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2 text-slate-400 font-semibold">Code</th><th className="p-2 text-slate-400 font-semibold">Usage</th><th className="p-2 text-slate-400 font-semibold">Revenue</th></tr></thead><tbody>{promos.map(p => (<tr key={p.promo_code} className="hover:bg-slate-800/50 border-b border-slate-800"><td className="p-2 font-mono">{p.promo_code}</td><td className="p-2">{p.usage_count}</td><td className="p-2">₹{p.revenue.toLocaleString('en-IN')}</td></tr>))}</tbody></table></div>);
const TopProductsChart: React.FC<{ data: any[] }> = ({ data }) => (<ResponsiveContainer width="100%" height={250}><BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 50, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#475569" /><XAxis type="number" tick={AXIS_STYLE} /><YAxis dataKey="name" type="category" tick={{...AXIS_STYLE, width: 100}} width={40} /><Tooltip {...TooltipStyle} /><Bar dataKey="qty" name="Quantity Sold" radius={[0, 4, 4, 0]}>{data.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>);
const RecentOrdersTable: React.FC<{ orders: any[] }> = ({ orders }) => {
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'paid': return 'text-emerald-300 bg-emerald-500/10';
            case 'confirmed': return 'text-sky-300 bg-sky-500/10';
            default: return 'text-slate-300 bg-slate-500/10';
        }
    };
    return (<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2 text-slate-400 font-semibold">Order ID</th><th className="p-2 text-slate-400 font-semibold">Date</th><th className="p-2 text-slate-400 font-semibold">Total</th><th className="p-2 text-slate-400 font-semibold">Status</th></tr></thead><tbody>{orders.map(o => (<tr key={o.id} className="hover:bg-slate-800/50 border-b border-slate-800"><td className="p-2 font-mono text-xs">#{o.id.toString().slice(-6)}</td><td className="p-2">{format(new Date(o.placed_at), 'dd MMM, yyyy')}</td><td className="p-2">₹{o.total.toLocaleString('en-IN')}</td><td className="p-2"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(o.status)}`}>{o.status}</span></td></tr>))}</tbody></table></div>);
};

export default AdminDashboard;