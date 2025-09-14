import React, { useState } from 'react';

// Subsections for settings:
import StoreSettings from './adminsettings/StoreSettings';
import PaymentGatewaysSettings from './adminsettings/PaymentGatewaysSettings';
import ShippingSettings from './adminsettings/ShippingSettings';
import AdminUsers from './adminsettings/AdminUsers'; // adjust path
import OrderSettings from './adminsettings/OrderSettings';
import UserRolesSettings from './adminsettings/UserRolesSettings';
import NotificationSettings from './adminsettings/NotificationSettings';
import IntegrationSettings from './adminsettings/IntegrationSettings';
import PrivacySettings from './adminsettings/PrivacySettings';
import PromoCodesAdmin from './adminsettings/PromoCodesAdmin'; // adjust path if needed
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
  { id: 'promo', name: 'Promo Codes', component: PromoCodesAdmin }, // <-- new tab
  { id: 'emailAutomation', name: 'Email Automation', component: EmailAutomation }, // new tab
  { id: 'emailTemplates', name: 'Email Templates', component: EmailTemplates },
];

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('store');

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="luxury-card glass p-6 rounded-3xl shadow-xl max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-tamoor-charcoal">Settings</h1>

      <nav className="flex space-x-4 mb-6 border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 font-semibold border-b-4 ${
              activeTab === tab.id ? 'border-tamoor-gold text-tamoor-charcoal' : 'border-transparent text-gray-600 hover:text-tamoor-charcoal'
            } transition`}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      <div>
        {ActiveComponent ? <ActiveComponent /> : <p>Select a settings category.</p>}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
