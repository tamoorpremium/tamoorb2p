import React, { useState } from 'react';
import { User, Package, Heart, Settings, Edit3, Save, X, Star, Truck } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Arjun Sharma',
    email: 'arjun.sharma@email.com',
    phone: '+91 98765 43210',
    address: '123 Premium Plaza, Mumbai, India 400001'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const orders = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 2499,
      items: ['Himalayan Almonds', 'Premium Cashews', 'Medjool Dates'],
      statusColor: 'text-luxury-sage bg-luxury-sage/10'
    },
    {
      id: 'ORD002',
      date: '2024-01-10',
      status: 'In Transit',
      total: 1899,
      items: ['Turkish Pistachios', 'Mixed Trail Mix'],
      statusColor: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'ORD003',
      date: '2024-01-05',
      status: 'Processing',
      total: 3299,
      items: ['Luxury Gift Hamper', 'Organic Walnuts'],
      statusColor: 'text-orange-600 bg-orange-100'
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: 'Premium Brazil Nuts',
      price: 1799,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Organic Goji Berries',
      price: 999,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-neutral-800 mb-4">
            My <span className="tamoor-gradient">Account</span>
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            Manage your profile and track your orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="luxury-card glass rounded-3xl p-6 sticky top-32">
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-light flex items-center justify-center shadow-luxury">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-display font-semibold text-xl text-neutral-800">
                  {userInfo.name}
                </h3>
                <p className="text-neutral-600 font-medium">Premium Member</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-luxury-gold text-white shadow-lg'
                        : 'hover:bg-white/20 text-neutral-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="luxury-card glass rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-display font-bold text-neutral-800">
                    Profile Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 btn-premium text-white px-6 py-3 rounded-full font-semibold"
                  >
                    {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={userInfo.address}
                      onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60 resize-none"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 btn-premium text-white px-8 py-3 rounded-full font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="luxury-card glass rounded-3xl p-8">
                  <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                    Order History
                  </h2>
                  
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="neomorphism rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-display font-semibold text-lg text-neutral-800">
                              Order #{order.id}
                            </h3>
                            <p className="text-neutral-600 font-medium">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${order.statusColor}`}>
                              <Truck className="w-4 h-4 mr-2" />
                              {order.status}
                            </div>
                            <div className="text-2xl font-display font-bold tamoor-gradient mt-2">
                              ₹{order.total}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-neutral-200 pt-4">
                          <p className="text-neutral-600 font-medium mb-2">Items:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, index) => (
                              <span key={index} className="bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-sm font-medium">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="luxury-card glass rounded-3xl p-8">
                <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                  My Wishlist
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="neomorphism rounded-2xl overflow-hidden group">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <button className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 transition-all duration-300">
                          <Heart className="w-5 h-5 text-red-500 fill-current" />
                        </button>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(item.rating)
                                    ? 'text-luxury-gold fill-current'
                                    : 'text-neutral-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-neutral-600 font-medium">
                            {item.rating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-display font-bold tamoor-gradient">
                            ₹{item.price}
                          </span>
                          <button className="btn-premium text-white px-6 py-2 rounded-full font-semibold text-sm">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="luxury-card glass rounded-3xl p-8">
                <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                  Account Settings
                </h2>
                
                <div className="space-y-8">
                  <div className="neomorphism rounded-2xl p-6">
                    <h3 className="font-display font-semibold text-lg mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        'Email notifications for orders',
                        'SMS updates for delivery',
                        'Marketing emails and offers',
                        'New product announcements'
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-neutral-700 font-medium">{setting}</span>
                          <button className="w-12 h-6 bg-luxury-gold rounded-full relative transition-all duration-300">
                            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all duration-300"></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="neomorphism rounded-2xl p-6">
                    <h3 className="font-display font-semibold text-lg mb-4">Privacy</h3>
                    <div className="space-y-4">
                      <button className="w-full text-left p-4 hover:bg-white/20 rounded-xl transition-all duration-300">
                        Change Password
                      </button>
                      <button className="w-full text-left p-4 hover:bg-white/20 rounded-xl transition-all duration-300">
                        Download My Data
                      </button>
                      <button className="w-full text-left p-4 hover:bg-red-50 text-red-600 rounded-xl transition-all duration-300">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;