import React, { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, Edit3, Save, X, Star, Truck, Phone } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { logout } from "../utils/logout";
import countryPhoneData from '../utils/countryCodes.json';



type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  id: number;
  date: string;
  status: string;
  statusColor: string;
  total: number;
  items: OrderItem[];
};


const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({
    full_name: '',
    address_email: '',
    country_code: '+91',
    phone_number: '',
    address_line: '',
    city: '',
    state: '',
    pincode: ''
  });

  

const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [notificationToggles, setNotificationToggles] = useState<boolean[]>([
  false, false, false, false,]);
  const combinedPhone = `${userInfo.country_code}${userInfo.phone_number}`.trim();


  // Fetch user profile and orders on mount
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

    // Default base info from supabase auth
    let baseInfo = {
  full_name: user.user_metadata?.full_name || '',
  address_email: user.email || '',
  country_code: '+91',
  phone_number: '',
  address_line: '',
  city: '',
  state: '',
  pincode: ''
};

// Fetch default address
const { data: defaultAddress, error: addrError } = await supabase
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
    country_code: defaultAddress.country_code || '+91',
    phone_number: defaultAddress.phone || '',
    address_line: defaultAddress.address || '',
    city: defaultAddress.city || '',
    state: defaultAddress.state || '',
    pincode: defaultAddress.pincode || ''
  };
}

// Fetch profile row for name and phone
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('full_name, country_code, phone')
  .eq('id', user.id)
  .maybeSingle();

if (profileData) {
  baseInfo = {
    ...baseInfo,
    full_name: profileData.full_name || baseInfo.full_name,
    country_code: profileData.country_code || '+91',
    phone_number: profileData.phone|| '',
  };
}

setUserInfo(baseInfo);



    // Fetch orders
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
            : order.status === 'In Transit'
            ? 'text-blue-600 bg-blue-100'
            : order.status === 'shipped'
            ? 'text-blue-600 bg-blue-100'
            : order.status === 'Processing'
            ? 'text-orange-600 bg-orange-100'
            : order.status === 'pending'
            ? 'text-pink-600 bg-pink-100'
            : 'text-neutral-600 bg-neutral-100'
      })));
    }

        // Fetch wishlist
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

  // Placeholder wishlist
  


  const [successMsg, setSuccessMsg] = useState('');

const handleSave = async () => {
  setIsEditing(false);
  setErrorMsg('');
  setSuccessMsg('');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setErrorMsg('User not found. Please login.');
    return;
  }

  // Trim inputs
  let country_code = (userInfo.country_code || '+91').trim();
  let phone_number = (userInfo.phone_number || '').trim();

  // ✅ Country code validation
  const country = countryPhoneData.find(c => c.code === country_code);
  if (!country) {
    setErrorMsg('Invalid country code');
    return;
  }

  // ✅ Phone number must be numeric
  if (!/^\d+$/.test(phone_number)) {
    setErrorMsg('Phone number must contain only digits');
    return;
  }

  // ✅ Phone number length check
  if (phone_number.length < country.minLength || phone_number.length > country.maxLength) {
    setErrorMsg(
      `Phone number must be between ${country.minLength} and ${country.maxLength} digits for ${country.name}`
    );
    return;
  }

  // Check if default address exists
  const { data: existingAddress, error: fetchError } = await supabase
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .maybeSingle();

  if (fetchError) {
    setErrorMsg('Failed to check addresses: ' + fetchError.message);
    return;
  }

  let addrError;
  if (existingAddress) {
    // Update existing default address
    const { error } = await supabase
      .from('addresses')
      .update({
        full_name: userInfo.full_name,
        email: userInfo.address_email,
        country_code,
        phone: phone_number, // combine in schema column
        address: userInfo.address_line,
        city: userInfo.city,
        state: userInfo.state,
        pincode: userInfo.pincode,
      })
      .eq('id', existingAddress.id);
    addrError = error;
  } else {
    // Insert new default address
    const { error } = await supabase
      .from('addresses')
      .insert([{
        user_id: user.id,
        full_name: userInfo.full_name,
        email: userInfo.address_email,
        country_code,
        phone: phone_number, // combine in schema column
        address: userInfo.address_line,
        city: userInfo.city,
        state: userInfo.state,
        pincode: userInfo.pincode,
        is_default: true,
      }]);
    addrError = error;
  }

  if (addrError) {
    setErrorMsg('Failed to save address: ' + addrError.message);
    return;
  }

  // Update profiles table for consistency
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      full_name: userInfo.full_name,
      country_code,
      phone: phone_number,
    })
    .eq('id', user.id);

  if (profileUpdateError) {
    setErrorMsg('Failed to update profile info: ' + profileUpdateError.message);
    return;
  }

  setSuccessMsg('Profile and address saved successfully!');
};







const handleLogout = async () => {
  await logout(navigate); // SPA redirect using navigate
};

  // Helper function to render the content of the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800">
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center self-start sm:self-center space-x-2 btn-premium text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
              >
                {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                <input type="text" value={userInfo.full_name || ''} onChange={e => setUserInfo({ ...userInfo, full_name: e.target.value })} disabled={!isEditing} className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                <input type="email" value={userInfo.address_email || ''} onChange={e => setUserInfo({ ...userInfo, address_email: e.target.value })} disabled={!isEditing} className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <input type="text" value={userInfo.country_code || ''} onChange={e => setUserInfo({ ...userInfo, country_code: e.target.value })} disabled={!isEditing} placeholder="+91" className="w-1/3 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
                  <input type="tel" value={userInfo.phone_number || ''} onChange={e => setUserInfo({ ...userInfo, phone_number: e.target.value })} disabled={!isEditing} placeholder="9900990099" className="w-2/3 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Address</label>
                <textarea value={userInfo.address_line || ''} onChange={(e) => setUserInfo({ ...userInfo, address_line: e.target.value })} disabled={!isEditing} rows={3} placeholder="Street address, building, etc." className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60 resize-none mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" value={userInfo.city || ''} onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })} disabled={!isEditing} placeholder="City" className="p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
                  <input type="text" value={userInfo.state || ''} onChange={(e) => setUserInfo({ ...userInfo, state: e.target.value })} disabled={!isEditing} placeholder="State" className="p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
                </div>
                <input type="text" value={userInfo.pincode || ''} onChange={(e) => setUserInfo({ ...userInfo, pincode: e.target.value })} disabled={!isEditing} placeholder="PIN Code" className="w-full mt-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 disabled:opacity-60" />
              </div>
            </div>
            {isEditing && (
              <div className="mt-8 flex justify-end">
                <button onClick={handleSave} className="flex items-center space-x-2 btn-premium text-white px-8 py-3 rounded-full font-semibold">
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
            {successMsg && <div className="mt-4 text-green-600 font-semibold animate-pulse">{successMsg}</div>}
          </div>
        );
      case 'orders':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">Order History</h2>
            {orders.length === 0 ? (<div className="text-neutral-500 text-center py-10">No orders placed yet.</div>) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} onClick={() => navigate(`/order-tracking/${order.id}`)} className="neomorphism rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="w-full sm:w-auto">
                        <h3 className="font-display font-semibold text-base sm:text-lg text-neutral-800">Order #{order.id}</h3>
                        <p className="text-neutral-600 font-medium text-sm">Placed on {order.date}</p>
                      </div>
                      <div className="w-full sm:w-auto flex sm:flex-col items-center justify-between">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${order.statusColor}`}>
                          <Truck className="w-4 h-4 mr-2" />
                          {order.status}
                        </div>
                        <div className="text-xl sm:text-2xl font-display font-bold tamoor-gradient sm:mt-2">
                          ₹{order.total}
                        </div>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-neutral-200 pt-4 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-xs sm:text-sm font-medium">{item.name} × {item.quantity}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'wishlist':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">My Wishlist</h2>
            {wishlistLoading ? (<div className="text-neutral-500">Loading wishlist...</div>) : 
            wishlistItems.length === 0 ? (<div className="text-neutral-500 text-center py-10">No items in your wishlist yet.</div>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="neomorphism rounded-2xl overflow-hidden group">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                      <button className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 transition-all duration-300">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      </button>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2 truncate">{item.name}</h3>
                      <div className="flex items-center mb-4">
                        <Star className="w-4 h-4 text-luxury-gold fill-current" />
                        <span className="ml-2 text-sm text-neutral-600 font-medium">{item.rating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-display font-bold tamoor-gradient">₹{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">Account Settings</h2>
            <div className="space-y-6">
              <div className="neomorphism rounded-2xl p-4 sm:p-6">
                <h3 className="font-display font-semibold text-lg mb-4">Notifications</h3>
                <div className="space-y-4">
                  {['Email for orders', 'SMS for delivery', 'Marketing emails', 'New product news'].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-neutral-700 font-medium text-sm sm:text-base">{setting}</span>
                      <button onClick={() => { const u = [...notificationToggles]; u[index] = !u[index]; setNotificationToggles(u); }} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notificationToggles[index] ? 'bg-luxury-gold' : 'bg-neutral-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${notificationToggles[index] ? 'left-6' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="neomorphism rounded-2xl p-4 sm:p-6">
                <h3 className="font-display font-semibold text-lg mb-4">Privacy</h3>
                <div className="space-y-2">
                  <button onClick={() => navigate("/reset-password")} className="w-full text-left font-medium p-3 hover:bg-white/20 rounded-xl transition">Change Password</button>
                  <button onClick={() => toast.info("⚠️ Account deletion is not supported yet.", { autoClose: 3000 })} className="w-full text-left font-medium p-3 hover:bg-red-50 text-red-600 rounded-xl transition">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32">
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-neutral-800 mb-4">
            My <span className="tamoor-gradient">Account</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 font-medium">
            Manage your profile and track your orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="luxury-card glass rounded-3xl p-6 sticky top-28">
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-light flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-display font-semibold text-xl text-neutral-800 truncate">{userInfo?.name || 'User'}</h3>
                <p className="text-neutral-600 font-medium text-sm">Premium Member</p>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-luxury-gold text-white shadow-lg' : 'hover:bg-white/20 text-neutral-700'}`}>
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Mobile Tab Navigation (Hidden on desktop) */}
            <div className="block lg:hidden mb-6">
              <div className="border-b border-neutral-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                        activeTab === tab.id
                          ? 'border-luxury-gold text-luxury-gold'
                          : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Card */}
            <div className="luxury-card glass rounded-3xl p-6 sm:p-8">
              {renderContent()}
            </div>
            
            {/* Logout Button */}
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
