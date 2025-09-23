import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { isValidEmail, isValidPhone, countryCodes, CountryCode } from "../utils/validators";
import googleimg from "../assets/icons/google.svg"
import appleimg from "../assets/icons/apple.svg"
import twitterimg from "../assets/icons/twitter.svg"
import facebookimg from "../assets/icons/facebook.svg"

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
    phone: '',
    country: countryCodes.find(c => c.code === "+91") as CountryCode,
  });

  const [resetEmail, setResetEmail] = useState('');
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [resetPhone, setResetPhone] = useState('');
  const [resetCountry, setResetCountry] = useState(countryCodes.find(c => c.code === '+91')!);
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

  const handleCountryChange = (code: string) => {
    const country = countryCodes.find(c => c.code === code);
    if (country) setFormData(prev => ({ ...prev, country }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Trim phone automatically
    if (name === 'phone' || name === 'resetPhone') {
      value = value.replace(/\s+/g, ''); // remove spaces
    }

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

    // Full name required only for registration
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    // Email validation
    if (!isLogin) {
      // Registration: email required
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email address';
    } else {
      // Login: email optional, but if entered must be valid
      if (formData.email.trim() && !isValidEmail(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      // Ensure at least email or phone is entered
      if (!formData.email.trim() && !formData.phone.trim()) {
        newErrors.email = 'Please enter email or phone number';
      }
    }

    // Phone validation (optional)
    if (formData.phone.trim()) {
      if (!formData.country || !isValidPhone(`${formData.country.code}${formData.phone.trim()}`, formData.country)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }

    // Password validation
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    // Confirm password for registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
    let loginEmail = formData.email.trim();

    // If phone is provided and email is empty, fetch the email from profiles
    if (!loginEmail && formData.phone.trim()) {
      const phoneDigits = formData.phone.trim().replace(/\D/g, '');
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', phoneDigits)
        .eq('country_code', formData.country.code)
        .single();

      if (error || !data?.email) {
        setErrorMsg('No account linked with this phone number and country code.');
        setIsLoading(false);
        return;
      }

      loginEmail = data.email;
    }

    if (!loginEmail) {
      setErrorMsg('Please enter email or phone number.');
      setIsLoading(false);
      return;
    }

    // Perform login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
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
    // Registration - email required, phone optional
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      setErrorMsg('Email is required for registration.');
      setIsLoading(false);
      return;
    }

    const fullPhone = formData.phone ? formData.phone.trim().replace(/\D/g, '') : null;

    const { data, error } = await supabase.auth.signUp({
      email: emailTrimmed,
      password: formData.password,
    });

    if (error) setErrorMsg(error.message);
    else if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: emailTrimmed,
        full_name: formData.name.trim(),
        phone: fullPhone,                       // store digits only or null
        country_code: formData.country.code,    // separate column
        created_at: new Date(),
      });

      if (profileError) setErrorMsg('Error creating profile: ' + profileError.message);
      else {
        setSuccessMsg('Registration successful! Redirecting to profile completion...');
        await syncLocalCartToSupabase(data.user.id);
        setTimeout(() =>
          navigate('/profile-completion', {
            state: { email: emailTrimmed, phone: fullPhone, name: formData.name.trim(), redirectAfter: redirect }
          }), 1200
        );
      }
    } else {
      setSuccessMsg('Registration request sent! Check your email to activate account.');
    }
  }

  setIsLoading(false);
};



  // Inside Auth component, for forgot password section


  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setResetLoading(true);

    let emailToReset = '';

    if (resetMethod === 'email') {
      if (!resetEmail.trim()) {
        setErrorMsg('Please enter your email.');
        setResetLoading(false);
        return;
      }
      emailToReset = resetEmail.trim();
    } else {
      // Phone method
      if (!resetPhone.trim() || !resetCountry) {
        setErrorMsg('Please enter your phone number.');
        setResetLoading(false);
        return;
      }
      const fullPhone = `${resetCountry.code}${resetPhone.trim()}`;
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', fullPhone)
        .single();
      if (error || !data?.email) {
        setErrorMsg('No account linked with this phone number.');
        setResetLoading(false);
        return;
      }
      emailToReset = data.email;
    }

    // Trigger Supabase reset
    const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
      redirectTo: window.location.origin + '/auth',
    });

    if (error) setErrorMsg(error.message);
    else setSuccessMsg('Password reset email sent!');

    setResetLoading(false);
  };

  const handleOAuthSignIn = async (provider: Provider) => {
  const enableOAuth = import.meta.env.VITE_ENABLE_OAUTH;
  console.log('OAuth enabled:', enableOAuth);

  if (!enableOAuth || enableOAuth !== 'true') {
    setErrorMsg(`OAuth login with ${provider} is disabled in development.`);
    return;
  }

  setIsLoading(true);
  try {
    console.log('Starting OAuth login with', provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/profile', // Make sure this URL is added in Supabase OAuth redirect URLs
      },
    });

    if (error) throw error;
    console.log('OAuth signIn response:', data);
    setInfoMsg('Redirecting to ' + provider + ' login...');
  } catch (err: any) {
    console.error('OAuth login error:', err);
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

            {/* …rest of the form (email, phone, password, confirm password, reset, OAuth buttons, submit) stays the same… */}


            {/* …rest of the form (email, phone, password, confirm password, reset, OAuth buttons, submit) stays the same… */}


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

            {/* Phone + Country */}
            <div className="w-full">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number {isLogin ? '(optional)' : ''}
              </label>
              <div className="flex gap-2 w-full">
                <select
                  value={formData.country?.code}
                  onChange={e => handleCountryChange(e.target.value)}
                  className="p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50 flex-shrink-0 w-32"
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full sm:flex-1 p-4 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 ${
                    errors.phone ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder={isLogin ? 'Phone number (optional)' : 'Phone number'}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.phone}</p>}
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

            {/* Forgot Password */}
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
                {/* Method selection */}
                <p className="font-medium mb-2">Reset Password Via:</p>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="email"
                      checked={resetMethod === 'email'}
                      onChange={() => setResetMethod('email')}
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="phone"
                      checked={resetMethod === 'phone'}
                      onChange={() => setResetMethod('phone')}
                    />
                    Phone
                  </label>
                </div>

                {/* Input fields */}
                {resetMethod === 'email' ? (
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-4 pr-4 py-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 mb-2"
                  />
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={resetCountry.code}
                      onChange={(e) => {
                        const country = countryCodes.find(c => c.code === e.target.value);
                        if (country) setResetCountry(country);
                      }}
                      className="p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50 flex-shrink-0 w-32"
                    >
                      {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full sm:flex-1 p-4 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                    />
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="mt-4 w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>

                {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
                {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
              </div>
            )}


            {/* OAuth Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                className="btn-social-google flex items-center justify-center gap-2"
              >
                <img src= {googleimg} alt="Google" className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('facebook')}
                className="btn-social-facebook flex items-center justify-center gap-2"
              >
                <img src= {facebookimg} alt="Facebook" className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('apple')}
                className="btn-social-apple flex items-center justify-center gap-2"
              >
                <img src= {appleimg} alt="Apple" className="w-6 h-6" />
              </button>
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
