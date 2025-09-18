import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './topbar.css';



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
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass backdrop-blur-xl shadow-luxury"
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-full w-full mx-auto px-4 overflow-x-hidden">
        {/* Futuristic Top Bar */}
       <div className="relative overflow-hidden py-2 border-b border-neutral-200/50">
  <div className="relative overflow-hidden">
    <div className="animate-scroll">
      {/* Duplicate enough times for seamless loop */}
      {Array(10).fill(
        <span className="futuristic-text mx-8 text-sm font-bold">
          ✨ Free shipping on orders above ₹999
        </span>
      )}
    </div>
  </div>
</div>





       {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Mobile Logo (visible only on small screens) */}
          <div className="flex items-center sm:hidden group">
            <img
              src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
              alt="Tamoor Logo"
              className="w-10 h-10 object-contain mr-2 transition-transform duration-300 group-hover:scale-110"
            />
            <h1 className="text-3xl font-display font-bold tamoor-gradient">
              TAMOOR
            </h1>
          </div>

          {/* Desktop Logo (hidden on small screens, visible from sm+) */}
          <div className="hidden sm:flex items-start group ml-20">
            <img
              src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
              alt="Tamoor Logo"
              className="w-16 h-16 object-contain mr-3 transition-transform duration-300 group-hover:scale-110"
            />
            <h1 className="text-5xl sm:text-6xl font-display font-bold tamoor-gradient">
              TAMOOR
            </h1>
            <span className="ml-3 text-sm sm:text-base text-luxury-gold font-medium bg-luxury-gold/10 px-3 py-1 rounded-full">
              Premium
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-8">
            {[
              { name: "Home", href: "/" },
              { name: "Products", href: "/products" },
              { name: "Categories", href: "/categories" },
              { name: "About", href: "/about" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-neutral-800 hover:text-luxury-gold font-semibold transition-all duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex items-center glass rounded-full px-4 py-2 w-full max-w-sm group hover:shadow-lg transition-all duration-300">
            <Search className="w-5 h-5 text-neutral-400 mr-3 group-hover:text-luxury-gold transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search premium dry fruits..."
              className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:mr-24">
            {[
              { icon: Heart, count: null, to: "/wishlist" },
              { icon: User, count: null, to: "/profile" },
              { icon: ShoppingCart, count: 0, to: "/cart" },
            ].map(({ icon: Icon, count, to }, index) => (
              <Link
                key={index}
                to={to}
                className={`p-1 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 relative group luxury-card ${
                  index === 2 ? "cart-button" : ""
                }`}
              >
                <Icon className="w-4 h-4 sm:w-7 sm:h-7 text-neutral-700 group-hover:text-luxury-gold transition-colors duration-300" />
                {count !== null && (
                  <span className="cart-count absolute -top-2 -right-2 sm:-top-1 sm:-right-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white text-xs sm:text-sm rounded-full w-7 h-7 flex items-center justify-center font-medium shadow-lg ">
                    {count}
                  </span>
                )}
              </Link>
            ))}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
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
              <div className="flex items-center glass rounded-full px-4 py-2 w-full">
                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search premium dry fruits..."
                  className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400"
                />
              </div>
              {[
                { name: "Home", href: "/" },
                { name: "Products", href: "/products" },
                { name: "Categories", href: "/categories" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-neutral-700 hover:text-luxury-gold font-medium transition-colors duration-300 py-2"
                >
                  {item.name}
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