import React, { useState } from 'react';

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

const tabs = [
  { id: 'store', name: 'Store', component: StoreSettings },
  { id: 'payment', name: 'Payments', component: PaymentGatewaysSettings },
  { id: 'shipping', name: 'Shipping', component: ShippingSettings },
  { id: 'users', name: 'Admin Users', component: AdminUsers },
  { id: 'order', name: 'Orders', component: OrderSettings },
  { id: 'userRoles', name: 'User Roles', component: UserRolesSettings },
  { id: 'notifications', name: 'Notifications', component: NotificationSettings },
  { id: 'integration', name: 'Integrations', component: IntegrationSettings },
  { id: 'privacy', name: 'Privacy', component: PrivacySettings },
  { id: 'promo', name: 'Promo Codes', component: PromoCodesAdmin },
  { id: 'emailAutomation', name: 'Email Automation', component: EmailAutomation },
  { id: 'emailTemplates', name: 'Email Templates', component: EmailTemplates },
];

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('store');
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="luxury-card glass p-4 sm:p-6 rounded-3xl shadow-xl max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-tamoor-charcoal">
        Settings
      </h1>

      {/* Tabs: Scrollable on mobile */}
      <nav className="flex overflow-x-auto no-scrollbar border-b border-gray-300 mb-4 sm:mb-6">
        <div className="flex space-x-3 sm:space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap pb-2 text-sm sm:text-base font-semibold border-b-4 ${
                activeTab === tab.id
                  ? 'border-tamoor-gold text-tamoor-charcoal'
                  : 'border-transparent text-gray-600 hover:text-tamoor-charcoal'
              } transition`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </nav>

      <div>
        {ActiveComponent ? <ActiveComponent /> : <p>Select a settings category.</p>}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
