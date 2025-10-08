import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './topbar.css';



const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);


  const SCROLL_THRESHOLD = 50; // minimum scroll difference to toggle

  useEffect(() => {
    let ticking = false; // to throttle scroll events

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentScrollY - lastScrollY;

          if (delta > SCROLL_THRESHOLD && showTopBar && currentScrollY > 50) {
            // scrolling down
            setShowTopBar(false);
            setLastScrollY(currentScrollY);
          } else if (delta < -SCROLL_THRESHOLD && !showTopBar) {
            // scrolling up
            setShowTopBar(true);
            setLastScrollY(currentScrollY);
          }

          // header background effect
          setIsScrolled(currentScrollY > 20);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, showTopBar]);



  return (
   <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass backdrop-blur-xl shadow-luxury"
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      {/* Futuristic Top Bar */}
      <div
        className={`metallic-bar w-full relative overflow-hidden py-2 transition-all duration-500 ${
          showTopBar ? "mt-0" : "-mt-10"
        }`}
      >
        <div className="relative overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => {
            const size = Math.floor(Math.random() * 4) + 2;
            const top = Math.floor(Math.random() * 100);
            const left = Math.floor(Math.random() * 100);
            const delay1 = (Math.random() * 10).toFixed(1) + "s";
            const delay2 = (Math.random() * 2).toFixed(1) + "s";
            return (
              <div
                key={i}
                className="sparkle absolute rounded-full bg-white opacity-80 animate-twinkle"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${top}%`,
                  left: `${left}%`,
                  animationDelay: `${delay1}, ${delay2}`,
                }}
              ></div>
            );
          })}

          <div className="animate-scroll whitespace-nowrap flex">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="futuristic-text mx-8 text-sm font-bold"
              >
                {i % 2 === 0
                  ? "✨ Free shipping on orders above ₹999!"
                  : "⚡ Use Code: WELCOME10 & Unlock 10% Savings On Your First Order! 🎉"}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-10 overflow-x-hidden">
        <div className="flex items-center justify-between py-3 sm:py-4 flex-wrap">
          {/* Mobile Logo */}
          <div className="flex items-center sm:hidden group">
            <img
              src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
              alt="Tamoor Logo"
              className="w-10 h-10 object-contain mr-2 transition-transform duration-300 group-hover:scale-110"
            />
            <h1 className="text-3xl font-serif font-bold tamoor-gradient">
              TAMOOR
            </h1>
          </div>

          {/* Desktop Logo */}
          <div className="hidden sm:flex items-center group">
            <img
              src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
              alt="Tamoor Logo"
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tamoor-gradient">
                TAMOOR
              </h1>
              <span className="mt-1 sm:mt-0 sm:ml-2 md:ml-3 text-xs sm:text-sm md:text-base text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                Premium
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
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
                className="text-neutral-800 font-semibold transition-all duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Search + Right Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 w-full max-w-[200px] sm:max-w-xs md:max-w-sm group transition-all duration-300">
              <Search className="w-5 h-5 text-neutral-400 mr-2 sm:mr-3 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search premium dry fruits..."
                className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400 text-sm sm:text-base"
              />
            </div>

            {/* Right Icons */}
            {[{ icon: Heart, count: null, to: "/wishlist" },
              { icon: User, count: null, to: "/profile" },
              { icon: ShoppingCart, count: 0, to: "/cart" },
            ].map(({ icon: Icon, count, to }, index) => (
              <Link
                key={index}
                to={to}
                className="p-2 sm:p-3 rounded-full transition-all duration-300 relative"
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-neutral-700 transition-colors duration-300" />
                {count !== null && (
                  <span className="absolute -top-2 -right-2 sm:-top-1 sm:-right-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white text-[10px] sm:text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-medium shadow-md">
                    {count}
                  </span>
                )}
              </Link>
            ))}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 sm:p-3 rounded-full transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-4">
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
                  className="text-neutral-700 font-medium transition-colors duration-300 py-2"
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