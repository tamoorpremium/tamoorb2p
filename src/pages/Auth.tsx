import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

type Provider = 'google' | 'facebook' | 'apple';

const getLocalCart = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error parsing local cart:', error);
    return [];
  }
};

const clearLocalCart = () => {
  try {
    localStorage.removeItem('cart');
  } catch (error) {
    console.error('Error clearing local cart:', error);
  }
};

const getPendingProduct = () => {
  try {
    const p = localStorage.getItem('pendingProduct');
    return p ? JSON.parse(p) : null;
  } catch {
    return null;
  }
};

const clearPendingProduct = () => {
  try {
    localStorage.removeItem('pendingProduct');
  } catch {}
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/profile';
  const message = params.get('message');

  useEffect(() => {
    if (message === 'loginRequired') {
      setInfoMsg('To add products into the cart, you must first login.');
    }
  }, [message]);

  useEffect(() => {
    const processPending = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const pendingProduct = getPendingProduct();
        if (pendingProduct && pendingProduct.id) {
          const { error } = await supabase.from('cart').upsert({
            user_id: user.id,
            product_id: pendingProduct.id,
            quantity: pendingProduct.quantity,
            weight: pendingProduct.weight
          });
          if (error) console.error('Error adding pending product:', error);
          clearPendingProduct();
        }
      }
    };
    processPending();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));

  if (errors[name]) {
    setErrors((prev: typeof errors) => ({ ...prev, [name]: '' }));
  }

  setErrorMsg('');
  setSuccessMsg('');
  setInfoMsg('');
};


  const validateForm = () => {
    const newErrors: any = {};

    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!isLogin && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const syncLocalCartToSupabase = async (userId: string) => {
    const localCart = getLocalCart();
    for (const item of localCart) {
      const { error } = await supabase.from('cart').upsert({
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity,
        weight: item.weight,
      });
      if (error) console.error('Error syncing cart item:', error);
    }
    clearLocalCart();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setInfoMsg('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) setErrorMsg(error.message);
      else if (!data?.user) setErrorMsg('No user found or activation required.');
      else {
        setSuccessMsg('Sign in successful! Syncing cart...');
        await syncLocalCartToSupabase(data.user.id);
        setSuccessMsg('Sign in successful! Redirecting...');
        setTimeout(() => navigate(redirect), 1200);
      }

    } else {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error) setErrorMsg(error.message);
      else if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: formData.name,
          email: formData.email,
          created_at: new Date(),
        });
        if (profileError) setErrorMsg('Error creating profile: ' + profileError.message);
        else {
          setSuccessMsg('Registration successful! Syncing cart...');
          await syncLocalCartToSupabase(data.user.id);
          setSuccessMsg('Registration successful! Redirecting...');
          setTimeout(() => navigate(redirect), 1200);
        }
      } else {
        setSuccessMsg('Registration request sent! Check your email to activate account.');
      }
    }

    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return setErrorMsg('Please enter your email for reset.');
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/auth',
    });
    if (error) setErrorMsg(error.message);
    else {
      setSuccessMsg('Password reset email sent!');
      setResetEmail('');
    }
    setResetLoading(false);
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    // Disable in dev environment
    if (!process.env.REACT_APP_ENABLE_OAUTH) {
      setErrorMsg(`OAuth login with ${provider} is disabled in development.`);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/auth' },
      });
      if (error) throw error;
      setInfoMsg('Redirecting to ' + provider + ' login...');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'OAuth login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-display font-bold tamoor-gradient mb-4">TAMOOR</h1>
          <p className="text-neutral-600 font-medium">Premium Dry Fruits & Nuts</p>
        </div>

        <div className="luxury-card glass rounded-3xl p-8">
          <div className="flex mb-8 neomorphism rounded-full p-2">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white shadow-lg'
                  : 'text-neutral-600 hover:text-luxury-gold'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white shadow-lg'
                  : 'text-neutral-600 hover:text-luxury-gold'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 ${
                      errors.name ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 ${
                    errors.email ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 ${
                    errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-luxury-gold transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 ${
                      errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.confirmPassword}</p>}
              </div>
            )}

            {isLogin && (
              <p
                className="text-blue-500 cursor-pointer text-right mt-2 hover:underline"
                onClick={() => setShowReset(!showReset)}
              >
                Forgot Password?
              </p>
            )}

            {showReset && (
              <div className="mt-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-4 pr-4 py-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 mb-2"
                  placeholder="Enter your email for reset"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <button onClick={() => handleOAuthSignIn('google')} className="btn-social-google">Google</button>
              <button onClick={() => handleOAuthSignIn('facebook')} className="btn-social-facebook">Facebook</button>
              <button onClick={() => handleOAuthSignIn('apple')} className="btn-social-apple">Apple</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 active:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>

            {errorMsg && <div className="text-red-500 text-center mt-4">{errorMsg}</div>}
            {successMsg && <div className="text-green-600 text-center mt-4">{successMsg}</div>}
            {infoMsg && <div className="text-yellow-600 text-center mt-4">{infoMsg}</div>}
          </form>
        </div>

        <div className="text-center mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-neutral-500">
            <span>🔒 Secure & Encrypted</span>
            <span>⚡ Instant Access</span>
            <span>🎁 Welcome Bonus</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
