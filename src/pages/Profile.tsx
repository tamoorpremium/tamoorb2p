import React, { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, Edit3, Save, X, Star, Truck } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { LogOut } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({
    full_name: '',
    address_email: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch user profile + orders + wishlist
  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      setLoading(true);
      setErrorMsg('');

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("User not found. Please sign in.");
        setLoading(false);
        return;
      }

      // Base info from Supabase auth
      let baseInfo = {
        full_name: user.user_metadata?.full_name || '',
        address_email: user.email || '',
        phone: '',
        address_line: '',
        city: '',
        state: '',
        pincode: ''
      };

      // Default address
      const { data: defaultAddress } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (defaultAddress) {
        baseInfo = {
          ...baseInfo,
          full_name: defaultAddress.full_name || baseInfo.full_name,
          address_email: defaultAddress.email || baseInfo.address_email,
          phone: defaultAddress.phone || '',
          address_line: defaultAddress.address || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.pincode || ''
        };
      }

      // Profile info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        baseInfo = {
          ...baseInfo,
          full_name: profileData.full_name || baseInfo.full_name,
          phone: profileData.phone || baseInfo.phone,
        };
      }

      setUserInfo(baseInfo);

      // Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });

      if (ordersError) {
        setErrorMsg("Could not fetch orders: " + ordersError.message);
      } else {
        setOrders((ordersData || []).map(order => ({
          id: order.id,
          date: order.placed_at ? order.placed_at.slice(0, 10) : '',
          status: order.status || '',
          total: order.total || 0,
          items: order.items || [],
          statusColor:
            order.status === 'Delivered'
              ? 'text-luxury-sage bg-luxury-sage/10'
              : order.status === 'In Transit' || order.status === 'shipped'
              ? 'text-blue-600 bg-blue-100'
              : order.status === 'Processing'
              ? 'text-orange-600 bg-orange-100'
              : order.status === 'pending'
              ? 'text-pink-600 bg-pink-100'
              : 'text-neutral-600 bg-neutral-100'
        })));
      }

      // Wishlist
      setWishlistLoading(true);
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            image,
            rating,
            measurement_unit,
            default_piece_weight
          )
        `)
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error("Wishlist fetch error:", wishlistError.message);
        setWishlistItems([]);
      } else {
        const formatted = (wishlistData || []).map(w => {
          const product = Array.isArray(w.products) ? w.products[0] : w.products;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            rating: product.rating,
            image: product.image,
            measurement_unit: product.measurement_unit,
            default_piece_weight: product.default_piece_weight,
            wishlistId: w.id,
          };
        });
        setWishlistItems(formatted);
      }
      setWishlistLoading(false);

      setLoading(false);
    };

    fetchProfileAndOrders();
  }, []);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const handleSave = async () => {
    setIsEditing(false);
    setErrorMsg('');
    setSuccessMsg('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('User not found. Please login.');
      return;
    }

    await supabase
      .from('addresses')
      .update({
        full_name: userInfo.full_name,
        email: userInfo.address_email,
        phone: userInfo.phone,
        address: userInfo.address_line,
        city: userInfo.city,
        state: userInfo.state,
        pincode: userInfo.pincode,
      })
      .eq('user_id', user.id)
      .eq('is_default', true);

    await supabase
      .from('profiles')
      .update({
        full_name: userInfo.full_name,
        phone: userInfo.phone,
      })
      .eq('id', user.id);

    setSuccessMsg('Profile and address updated successfully!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">Loading profile...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500 font-bold">{errorMsg}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <div className="container mx-auto px-4 pb-20">
        {/* Heading */}
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
                  {userInfo?.full_name}
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
            {/* Profile Info */}
            {activeTab === 'profile' && (
              <div className="luxury-card glass rounded-3xl p-8">
                {/* ... profile form unchanged ... */}
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="luxury-card glass rounded-3xl p-8">
                  <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                    Order History
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-neutral-500">No orders placed yet.</div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="neomorphism rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-display font-semibold text-lg text-neutral-800">
                                Order #{order.id}
                              </h3>
                              <p className="text-neutral-600 font-medium">
                                Placed on {order.date}
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="luxury-card glass rounded-3xl p-8">
                <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                  My Wishlist
                </h2>
                {wishlistLoading ? (
                  <div className="text-neutral-500">Loading wishlist...</div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-neutral-500">No items in your wishlist yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="neomorphism rounded-2xl overflow-hidden group">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">
                            {item.name}
                          </h3>
                          <div className="flex items-center mb-4">
                            <Star className="w-4 h-4 text-luxury-gold fill-current" />
                            <span className="ml-2 text-sm text-neutral-600 font-medium">
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-display font-bold tamoor-gradient">
                              ₹{item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings tab unchanged */}
            {activeTab === 'settings' && (
              <div className="luxury-card glass rounded-3xl p-8">
                {/* ... your settings UI ... */}
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center space-x-2 p-3 rounded-2xl bg-white/20 backdrop-blur-md text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-colors duration-300 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
