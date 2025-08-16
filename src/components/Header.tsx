import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass backdrop-blur-xl shadow-luxury' 
        : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-neutral-200/50">
          <div className="text-neutral-600 font-medium">
            ✨ Free shipping on orders above ₹499
          </div>
          <div className="flex items-center space-x-6 text-neutral-600">
            <button className="hover:text-luxury-gold transition-colors duration-300">Track Order</button>
            <button className="hover:text-luxury-gold transition-colors duration-300">Help</button>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center group">
            <h1 className="text-3xl font-display font-bold luxury-gradient">
              NutriLux
            </h1>
            <span className="ml-2 text-sm text-luxury-gold font-medium bg-luxury-gold/10 px-2 py-1 rounded-full">
              Premium
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Products', 'Categories', 'About', 'Contact'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-neutral-700 hover:text-luxury-gold font-medium transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex items-center glass rounded-full px-6 py-3 w-80 group hover:shadow-lg transition-all duration-300">
            <Search className="w-5 h-5 text-neutral-400 mr-3 group-hover:text-luxury-gold transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search premium dry fruits..."
              className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-2">
            {[
              { icon: Heart, count: null },
              { icon: User, count: null },
              { icon: ShoppingCart, count: 3 }
            ].map(({ icon: Icon, count }, index) => (
              <button 
                key={index}
                className="p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 relative group luxury-card"
              >
                <Icon className="w-6 h-6 text-neutral-600 group-hover:text-luxury-gold transition-colors duration-300" />
                {count && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                    {count}
                  </span>
                )}
              </button>
            ))}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center glass rounded-full px-6 py-3">
                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search premium dry fruits..."
                  className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400"
                />
              </div>
              {['Home', 'Products', 'Categories', 'About', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href="#" 
                  className="text-neutral-700 hover:text-luxury-gold font-medium transition-colors duration-300 py-2"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;