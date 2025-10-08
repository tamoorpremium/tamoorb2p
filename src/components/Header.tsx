import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import "./topbar.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // NEW STATE for search overlay
  const SCROLL_THRESHOLD = 50;

  // Scroll behavior for hide/show topbar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentScrollY - lastScrollY;

          if (delta > SCROLL_THRESHOLD && showTopBar && currentScrollY > 50) {
            setShowTopBar(false);
          } else if (delta < -SCROLL_THRESHOLD && !showTopBar) {
            setShowTopBar(true);
          }

          setIsScrolled(currentScrollY > 20);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, showTopBar]);

  // Use a constant variable for media query check for clarity
  const isLargeScreen = typeof window !== 'undefined' && window.innerWidth >= 1280;
  const sparkleCount = isLargeScreen ? 100 : 30;


  // Component for the Full-Screen Search Overlay
  const MobileSearchOverlay = () => {
    if (!isSearchOpen) return null;

    return (
      <div 
        className="fixed inset-0 bg-white z-[60] flex flex-col p-4 sm:p-8 transition-opacity duration-300"
      >
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-800">Search Products</h2>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-full"
            aria-label="Close search"
          >
            <X className="w-6 h-6 text-neutral-700" />
          </button>
        </div>
        
        <div className="flex items-center glass rounded-full px-4 py-3 w-full mt-6 shadow-md">
          <Search className="w-6 h-6 text-neutral-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search premium dry fruits..."
            aria-label="Search"
            // Auto-focus the input when the overlay opens for better UX
            autoFocus 
            className="bg-transparent flex-1 outline-none text-lg text-neutral-700 placeholder-neutral-400 min-w-0"
          />
        </div>

        {/* You can add recent searches or popular categories here */}
        <div className="mt-8">
            <p className="text-sm text-neutral-500">Popular Searches:</p>
            {/* Add quick links here if needed */}
        </div>
      </div>
    );
  };


  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass backdrop-blur-xl shadow-luxury"
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      {/* 1. Insert the search overlay */}
      <MobileSearchOverlay />
      
      {/* Futuristic Top Bar (content unchanged) */}
      <div
        className={`metallic-bar w-full relative overflow-hidden py-2 transition-transform duration-300 ease-in-out ${
          showTopBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative overflow-hidden">
          {Array.from({ length: sparkleCount }).map((_, i) => {
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
              <span key={i} className="futuristic-text mx-8 text-sm font-bold">
                {i % 2 === 0
                  ? "✨ Free shipping on orders above ₹999!"
                  : "⚡ Use Code: WELCOME10 & Unlock 10% Savings On Your First Order! 🎉"}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-full w-full mx-auto px-4 overflow-x-hidden">
        <div className="flex items-center justify-between py-4">

          {/* LOGO CONTAINER */}
          <div className="flex items-center flex-shrink-0 xl:ml-20">
            <Link to="/home" className="flex items-center whitespace-nowrap group">
              <img
                src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
                alt="Tamoor Logo"
                loading="eager" 
                className="w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 object-contain mr-2 transition-transform duration-300 group-hover:scale-110"
              />
              <h1 className="text-3xl md:text-4xl xl:text-6xl font-serif font-bold tamoor-gradient mr-2">
                TAMOOR
              </h1>
              <span className="hidden sm:inline-block text-xs xl:text-base text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-2 xl:px-3 py-0.5 xl:py-1 rounded-full">
                Premium
              </span>
            </Link>
          </div>


          {/* DESKTOP NAVIGATION & SEARCH BAR GROUP */}
          <div className="hidden xl:flex items-center space-x-8 flex-grow justify-end min-w-0">
            
            {/* Desktop Navigation (unchanged) */}
            <nav className="flex items-center space-x-8 flex-shrink-0">
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
                  className="text-neutral-800 hover:text-luxury-gold font-semibold transition-all duration-300 relative group whitespace-nowrap"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Desktop Search Bar (unchanged) */}
            <div className="flex items-center glass rounded-full px-4 py-2 w-full max-w-xs flex-shrink group hover:shadow-lg transition-all duration-300">
              <Search className="w-5 h-5 text-neutral-400 mr-3 group-hover:text-luxury-gold transition-colors duration-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search premium dry fruits..."
                aria-label="Search premium dry fruits"
                className="bg-transparent flex-1 outline-none text-sm text-neutral-700 placeholder-neutral-400 min-w-0"
              />
            </div>
          </div>


          {/* RIGHT ICONS & MENU BUTTON */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0 xl:mr-24">
            
            {/* Search Icon - NOW Toggles the search overlay */}
            <button 
                className="xl:hidden p-1 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 flex-shrink-0"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)} // Toggles the new state
            >
              <Search className="w-4 h-4 sm:w-7 sm:h-7 text-neutral-700 hover:text-luxury-gold transition-colors duration-300" />
            </button>

            {/* Common Icons (Wishlist, User, Cart) - unchanged */}
            {[
              { icon: Heart, count: null, to: "/wishlist", label: "Wishlist" },
              { icon: User, count: null, to: "/profile", label: "Profile" },
              { icon: ShoppingCart, count: 0, to: "/cart", label: "Shopping Cart" },
            ].map(({ icon: Icon, count, to, label }, index) => (
              <Link
                key={index}
                to={to}
                aria-label={label} 
                className={`p-1 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 relative group flex-shrink-0 ${
                  index === 2 ? "cart-button" : ""
                }`}
              >
                <Icon className="w-4 h-4 sm:w-7 sm:h-7 text-neutral-700 group-hover:text-luxury-gold transition-colors duration-300" />
                {count !== null && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                    {count}
                  </span>
                )}
              </Link>
            ))}

            {/* Mobile Menu Button - unchanged */}
            <button
              className="xl:hidden p-2 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen} 
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Removed internal search bar as it's now in the overlay */}
        {isMenuOpen && (
          <div id="mobile-menu" className="xl:hidden py-6 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-6">
              {/* Navigation links for mobile menu */}
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