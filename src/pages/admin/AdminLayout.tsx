// src/layouts/AdminLayout.tsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../utils/logout";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList, // 🆕 for Requests tab
} from "lucide-react";
import { toast } from "react-toastify";

const tabs = [
  { id: "dashboard", name: "Dashboard", icon: Home, path: "/admin/dashboard" },
  { id: "products", name: "Products", icon: Package, path: "/admin/products" },
  {
    id: "categories",
    name: "Categories",
    icon: Package,
    path: "/admin/categories",
  },
  { id: "orders", name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { id: "users", name: "Users", icon: Users, path: "/admin/users" },

  // 🆕 Requests Tab
  { id: "requests", name: "Requests", icon: ClipboardList, path: "/admin/requests" },

  { id: "settings", name: "Settings", icon: Settings, path: "/admin/settings" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout(navigate); // SPA redirect using navigate
  };

  const SidebarContent = () => (
    <nav className="flex flex-col space-y-3 h-full">
      {tabs.map((tab) => (
        <NavLink
          to={tab.path}
          key={tab.id}
          className={({ isActive }) =>
            `flex items-center space-x-4 px-4 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 
            ${
              isActive
                ? "bg-gradient-to-r from-tamoor-gold to-tamoor-gold-light text-white shadow-[0_0_15px_rgba(212,175,55,0.6)]"
                : "text-tamoor-charcoal hover:bg-white/10 hover:text-tamoor-gold hover:shadow-[0_0_8px_rgba(212,175,55,0.4)]"
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <tab.icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
          <span>{tab.name}</span>
        </NavLink>
      ))}

      {/* 🚪 Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-4 px-4 py-3 mt-auto rounded-2xl font-semibold text-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      >
        <LogOut className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
        <span>Logout</span>
      </button>
    </nav>
  );

  return (
    <div className="bg-dashboard-gradient1 min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* 🔹 Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 w-full box-border bg-luxury-gold-dark backdrop-blur-md text-black shadow-lg">
        <h1 className="text-lg font-bold tracking-wide text-tamoor-gold">
          Admin Panel
        </h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-white/10 hover:bg-tamoor-gold hover:text-black transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* 🔹 Desktop Sidebar */}
      <aside className="hidden md:flex text-luxury-gold-light luxury-card glass w-72 p-6 flex-col space-y-6 sticky top-4 m-6 rounded-3xl shadow-2xl h-[calc(100vh-3rem)] border border-white/20">
        <SidebarContent />
      </aside>

      {/* 🔹 Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative text-luxury-gold-dark bg-gradient-to-b from-black via-gray-900 to-gray-800 w-full max-w-xs p-6 flex flex-col z-50 shadow-2xl rounded-r-3xl border-r-2 border-tamoor-gold transform animate-slideIn">
            <button
              className="absolute top-4 right-4 text-white hover:text-tamoor-gold"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* 🔹 Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
