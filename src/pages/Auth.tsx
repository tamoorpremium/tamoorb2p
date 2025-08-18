import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log(isLogin ? 'Login' : 'Register', formData);
    }, 2000);
  };

  const socialLogins = [
    { name: 'Google', icon: '🔍', color: 'hover:bg-red-50 hover:text-red-600' },
    { name: 'Facebook', icon: '📘', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { name: 'Apple', icon: '🍎', color: 'hover:bg-gray-50 hover:text-gray-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold tamoor-gradient mb-4">
            TAMOOR
          </h1>
          <p className="text-neutral-600 font-medium">
            Premium Dry Fruits & Nuts
          </p>
        </div>

        {/* Auth Card */}
        <div className="luxury-card glass rounded-3xl p-8">
          {/* Tab Switcher */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
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
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
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
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password
                </label>
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
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-luxury-gold bg-gray-100 border-gray-300 rounded focus:ring-luxury-gold focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-neutral-600 font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-luxury-gold hover:text-luxury-gold-dark font-medium transition-colors duration-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

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
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-neutral-200"></div>
            <span className="px-4 text-sm text-neutral-500 font-medium">or continue with</span>
            <div className="flex-1 border-t border-neutral-200"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-4">
            {socialLogins.map((social, index) => (
              <button
                key={index}
                className={`p-4 neomorphism rounded-xl text-center transition-all duration-300 hover:scale-105 ${social.color} group`}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {social.icon}
                </div>
                <div className="text-xs font-medium">{social.name}</div>
              </button>
            ))}
          </div>

          {/* Terms */}
          {!isLogin && (
            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-500">
                By creating an account, you agree to our{' '}
                <button className="text-luxury-gold hover:text-luxury-gold-dark font-medium">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-luxury-gold hover:text-luxury-gold-dark font-medium">
                  Privacy Policy
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-neutral-500">
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