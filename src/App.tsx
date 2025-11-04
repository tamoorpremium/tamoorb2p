import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import EntryAnimation from './components/EntryAnimation';
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
import BlogRecipesExpanded from './pages/BlogRecipes';
import ExcelProductImport from "./pages/admin/ExcelProductImport";
import PaymentFailed from './pages/PaymentFailed';
import PaymentPending from './pages/PaymentPending';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  const [loading, setLoading] = useState(true);

  // --- MODIFIED LOGIC ---
  // This state is now initialized from a function that checks two conditions:
  // 1. Has the animation already been seen in this session?
  // 2. Is the user currently on the homepage?
  const [showAnimation, setShowAnimation] = useState(() => {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenAnimation');
    return !hasSeenAnimation && window.location.pathname === '/';
  });

  // --- NEW HOOK ---
  // This runs once when the app loads. If the user lands on any page
  // other than the homepage, it sets the flag immediately to prevent
  // the animation from playing if they navigate to the homepage later.
  useEffect(() => {
    if (window.location.pathname !== '/') {
      sessionStorage.setItem('hasSeenAnimation', 'true');
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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

  // --- MODIFIED CALLBACK ---
  // When the animation completes, we now set the flag in sessionStorage
  // so it won't play again during this session.
  const handleAnimationComplete = () => {
    sessionStorage.setItem('hasSeenAnimation', 'true');
    setShowAnimation(false);
  };

  return (
    <>
      <AnimatePresence>
        {/* The animation will now only render if our smart logic allows it */}
        {showAnimation && <EntryAnimation onAnimationComplete={handleAnimationComplete} />}
      </AnimatePresence>

      {/* The rest of your app will render once the animation is done OR if it was skipped */}
      {!showAnimation && !loading && (
        <HelmetProvider>
        <CartProvider>
          <Router>
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
            
            <FancyPageTransition>
              <div className="min-h-screen">
                <Header />
                <Routes>
                  {/* Your routes are preserved exactly as they were */}
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
                  <Route path="/blog" element={<BlogRecipesExpanded />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} /> 
                  <Route path="/payment-pending" element={<PaymentPending />} />

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
                    <Route path="excel-import" element={<ExcelProductImport />} />
                  </Route>

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Footer />
              </div>
            </FancyPageTransition>
          </Router>
        </CartProvider>
        </HelmetProvider>
      )}
    </>
  );
}

export default App;