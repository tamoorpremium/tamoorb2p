//src\pages\admin\AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { User, Package, DollarSign } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import RecentOrdersList from '../../components/dashboard/RecentOrdersList';

interface KPI {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

const Dashboard = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase.from('profiles').select('id');
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*');
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders')
        .select('id, placed_at, status, total, user_id')
        .order('placed_at', { ascending: false })
        .limit(5);

      if (usersError || ordersError || recentOrdersError) {
        setLoading(false);
        return;
      }

      setKpis([
        {
          title: 'Total Users',
          value: usersData?.length || 0,
          icon: <User className="w-6 h-6" />,
          colorClass: 'bg-tamoor-gold-light',
        },
        {
          title: 'Total Orders',
          value: ordersData?.length || 0,
          icon: <Package className="w-6 h-6" />,
          colorClass: 'bg-blue-600',
        },
        {
          title: 'Revenue',
          value: ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
          icon: <DollarSign className="w-6 h-6" />,
          colorClass: 'bg-green-600',
        },
      ]);

      setRecentOrders(recentOrdersData || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient1">
        <span className="text-xl font-semibold text-white">Loading Dashboard...</span>
      </div>
    );

  return (
  <div className="min-h-screen bg-dashboard-gradient1 text-tamoor-charcoal flex flex-col">

    <h1 className="text-5xl font-display font-bold mb-12 px-6 md:px-12">
      Admin <span className="tamoor-gradient">Dashboard</span>
    </h1>

    <div className="flex-grow px-4 md:px-12 max-w-screen-2xl overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        {kpis.map((kpi) => (
          <KPICard 
            key={kpi.title} 
            title={kpi.title} 
            value={kpi.value} 
            icon={kpi.icon} 
            colorClass={kpi.colorClass} 
          />
        ))}
      </div>

      <RecentOrdersList orders={recentOrders} />
    </div>
  </div>
);
};

export default Dashboard;
