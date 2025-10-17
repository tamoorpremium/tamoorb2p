import React, { useState } from 'react';
import { Store, CreditCard, Truck, Users, Archive, Shield, Bell, Puzzle, Lock, Ticket, MailCheck, Mails } from 'lucide-react';

// Subsections for settings:
import StoreSettings from './adminsettings/StoreSettings';
import PaymentGatewaysSettings from './adminsettings/PaymentGatewaysSettings';
import ShippingSettings from './adminsettings/ShippingSettings';
import AdminUsers from './adminsettings/AdminUsers';
import OrderSettings from './adminsettings/OrderSettings';
import UserRolesSettings from './adminsettings/UserRolesSettings';
import NotificationSettings from './adminsettings/NotificationSettings';
import IntegrationSettings from './adminsettings/IntegrationSettings';
import PrivacySettings from './adminsettings/PrivacySettings';
import PromoCodesAdmin from './adminsettings/PromoCodesAdmin';
import EmailAutomation from './adminsettings/EmailAutomation';
import EmailTemplates from './adminsettings/EmailTemplates';

// Redesigned tabs array with icons
const tabs = [
    { id: 'store', name: 'Store', component: StoreSettings, icon: Store },
    { id: 'payment', name: 'Payments', component: PaymentGatewaysSettings, icon: CreditCard },
    { id: 'shipping', name: 'Shipping', component: ShippingSettings, icon: Truck },
    { id: 'promo', name: 'Promo Codes', component: PromoCodesAdmin, icon: Ticket },
    { id: 'users', name: 'Admin Users', component: AdminUsers, icon: Users },
    { id: 'order', name: 'Orders', component: OrderSettings, icon: Archive },
    { id: 'userRoles', name: 'User Roles', component: UserRolesSettings, icon: Shield },
    { id: 'notifications', name: 'Notifications', component: NotificationSettings, icon: Bell },
    { id: 'integration', name: 'Integrations', component: IntegrationSettings, icon: Puzzle },
    { id: 'privacy', name: 'Privacy', component: PrivacySettings, icon: Lock },
    { id: 'emailAutomation', name: 'Email Automation', component: EmailAutomation, icon: MailCheck },
    { id: 'emailTemplates', name: 'Email Templates', component: EmailTemplates, icon: Mails },
];

const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('store');
    const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
            <header className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-400/20">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-yellow-400">
                    Settings
                </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Sidebar Navigation (Desktop) */}
                <aside className="hidden md:block md:col-span-1">
                    <nav className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-yellow-400 text-gray-900 shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Dropdown Navigation (Mobile) */}
                <div className="md:hidden">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="w-full rounded-lg py-3 px-4 bg-gray-900/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-400/20"
                    >
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id}>{tab.name}</option>
                        ))}
                    </select>
                </div>

                {/* Main Content Area */}
                <main className="md:col-span-3">
                    <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg min-h-[60vh]">
                        {ActiveComponent ? <ActiveComponent /> : <p>Select a settings category.</p>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
