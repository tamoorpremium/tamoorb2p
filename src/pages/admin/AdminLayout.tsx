// src/layouts/AdminLayout.tsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/logout';
import { BarChart3, Package, ShoppingBag, Users, Settings, LogOut, Menu, X, ClipboardList } from 'lucide-react';

const navItems = [
    { name: 'Overview', icon: BarChart3, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Categories', icon: Package, path: '/admin/categories' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Requests', icon: ClipboardList, path: '/admin/requests' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout(navigate);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="text-2xl font-bold tamoor-gradient mb-6 mt-2 px-2">TAMOOR</div>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 rounded-lg text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors duration-200 ${
                                isActive ? 'bg-cyan-500/10 text-cyan-300' : ''
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-4 p-3 rounded-lg text-slate-300 bg-slate-800/50 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
            >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
            </button>
        </div>
    );

    const pageStyles = `@keyframes move-bg{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}.aurora-bg{background:radial-gradient(circle at 10% 10%,rgba(56,189,248,.15),transparent 30%),radial-gradient(circle at 90% 80%,rgba(34,211,238,.15),transparent 30%),radial-gradient(circle at 50% 50%,#14141e,#0b0b0b 80%);background-size:200% 200%;animation:move-bg 20s ease-in-out infinite}@keyframes card-enter{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.card-animation{animation:card-enter .5s ease-out forwards}`;

    return (
        <>
            <style>{pageStyles}</style>
            <div className="min-h-screen aurora-bg text-gray-200 flex">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 p-4 flex-shrink-0">
                    <div className="bg-slate-900/20 border border-slate-800 rounded-2xl h-full">
                        <SidebarContent />
                    </div>
                </aside>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-cyan-300"
                >
                    <Menu size={24} />
                </button>

                {/* Mobile Sidebar Drawer */}
                {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex">
                        <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)}></div>
                        <aside className="relative w-64 p-4 bg-slate-900 border-r border-slate-800">
                             <button
                                onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                             >
                                <X size={20} />
                             </button>
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default AdminLayout;