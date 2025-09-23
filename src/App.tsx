// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { supabase } from './utils/supabaseClient';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Wishlist from './pages/Wishlist';
import Auth from './pages/Auth';
import AuthProtectedRoute from './components/AuthProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
//import { RequestPasswordReset } from './pages/RequestPasswordReset';
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductEdit from './pages/admin/AdminProductEdit';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import LoginPage from './pages/admin/AdminLogin';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AdminCategoriesList from './pages/admin/AdminCategoriesList';
import AdminCategoryAdd from './pages/admin/AdminCategoryAdd';
import AdminCategoryEdit from './pages/admin/AdminCategoryEdit';
import AdminUsers from './pages/admin/adminsettings/AdminUsers';
import SettingsPage from './pages/admin/AdminSettings';
import { User } from '@supabase/supabase-js';
import OrderTracking from './pages/OrderTracking';
import ProductDetails from './pages/ProductDetails';
import FancyPageTransition from "./components/FancyPageTransition";
import AdminRequests from './pages/admin/AdminRequests';
import ProfileCompletion from './pages/ProfileCompletion';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnsRefundPolicy from './pages/ReturnsRefundPolicy';
import Shipping from './pages/Shipping';
import SizeQualityGuide from './pages/SizeQualityGuide';
import FaqSupport from './pages/FaqSupport';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        // ✅ Check existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('🔄 Existing session:', session);

        if (session?.user) {
          const user: User = session.user;
          const role = (user.user_metadata as any)?.role ?? null;
          console.log('🔎 Role from user_metadata:', role);

          if (role) {
            localStorage.setItem('userRole', role);
            localStorage.setItem('token', session.access_token);
          }
        }

        // ✅ Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('🔄 Auth state changed:', _event, session);

          if (session?.user) {
            const user: User = session.user;
            const role = (user.user_metadata as any)?.role ?? null;
            console.log('🔎 Updated role from user_metadata:', role);

            if (role) {
              localStorage.setItem('userRole', role);
              localStorage.setItem('token', session.access_token);
            }
          } else {
            localStorage.removeItem('userRole');
            localStorage.removeItem('token');
          }
        });

        return () => listener.subscription.unsubscribe();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <CartProvider>
      <Router>
        <FancyPageTransition>
        <div className="min-h-screen">
          <Header />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            draggable
            pauseOnHover
            theme="colored"
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/profile-completion" element={<ProfileCompletion />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/returns-policy" element={<ReturnsRefundPolicy />} />
            <Route path="/shipping-policy" element={<Shipping />} />
            <Route path="/size-quality" element={<SizeQualityGuide />} />
            <Route path="/faq" element={<FaqSupport />} />

            {/* Protected user routes */}
            <Route
              path="/profile"
              element={
                <AuthProtectedRoute>
                  <Profile />
                </AuthProtectedRoute>
              }
            />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />

            {/* Admin routes with role-based protection */}
            <Route
              path="/admin/*"
              element={
                <RoleProtectedRoute requiredRoles={['superadmin', 'productmanager', 'ordermanager']}>
                  <AdminLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductEdit />} />
              <Route path="products/:id" element={<ProductEdit />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetails />} />
              <Route path="categories" element={<AdminCategoriesList />} />
              <Route path="categories/new" element={<AdminCategoryAdd />} />
              <Route path="categories/:id" element={<AdminCategoryEdit />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="requests" element={<AdminRequests />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
        </FancyPageTransition>
      </Router>
    </CartProvider>
  );
}

export default App;
