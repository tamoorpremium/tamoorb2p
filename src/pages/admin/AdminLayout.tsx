import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';   // ✅ use react-toastify

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { id: 'products', name: 'Products', icon: Package, path: '/admin/products' },
  { id: 'categories', name: 'Categories', icon: Package, path: '/admin/categories' },
  { id: 'orders', name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'users', name: 'Users', icon: Users, path: '/admin/users' },
  { id: 'settings', name: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully');  // ✅ toastify
    navigate('/login');
  };

  return (
    <div className="bg-dashboard-gradient1 min-h-screen flex">
      {/* Sidebar */}
      <aside className="luxury-card glass w-72 p-6 flex flex-col space-y-6 sticky top-4 m-6 rounded-3xl shadow-xl">
        <nav className="flex flex-col space-y-3">
          {tabs.map((tab) => (
            <NavLink
              to={tab.path}
              key={tab.id}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-tamoor-gold text-white shadow-[0_0_10px_rgba(255,215,0,0.7)]'
                    : 'text-tamoor-charcoal hover:bg-white/20 hover:text-tamoor-gold'
                }`
              }
            >
              <tab.icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
              <span>{tab.name}</span>
            </NavLink>
          ))}

          {/* 🚪 Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 px-4 py-3 rounded-xl font-semibold text-lg text-tamoor-charcoal hover:bg-red-500 hover:text-white transition-all duration-300 mt-6"
          >
            <LogOut className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
