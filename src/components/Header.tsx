import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import "./topbar.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

  // Reduce sparkles on mobile
  const sparkleCount = window.innerWidth < 768 ? 30 : 100;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass backdrop-blur-xl shadow-luxury"
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      {/* Futuristic Top Bar (This is fine as it's fully contained) */}
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

          {/*             LOGO CONTAINER 
            Now using one component that scales, reducing complexity.
          */}
          <div className="flex items-center flex-shrink-0 xl:ml-20">
            <Link to="/home" className="flex items-center whitespace-nowrap group">
              <img
                src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
                alt="Tamoor Logo"
                className="w-10 h-10 md:w-12 md:h-12 xl:w-16 xl:h-16 object-contain mr-2 transition-transform duration-300 group-hover:scale-110"
              />
              <h1 className="text-3xl md:text-4xl xl:text-6xl font-serif font-bold tamoor-gradient mr-2">
                TAMOOR
              </h1>
              {/* Premium tag visible from sm screens onwards, larger on desktop */}
              <span className="hidden sm:inline-block text-xs xl:text-base text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-2 xl:px-3 py-0.5 xl:py-1 rounded-full">
                Premium
              </span>
            </Link>
          </div>


          {/*             DESKTOP NAVIGATION & SEARCH BAR GROUP 
            Hidden until the XL breakpoint (1280px) to prevent tablet overflow.
          */}
          <div className="hidden xl:flex items-center space-x-8 flex-grow justify-end min-w-0">
            
            {/* Desktop Navigation */}
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

            {/* Search Bar */}
            <div className="flex items-center glass rounded-full px-4 py-2 w-full max-w-xs flex-shrink group hover:shadow-lg transition-all duration-300">
              <Search className="w-5 h-5 text-neutral-400 mr-3 group-hover:text-luxury-gold transition-colors duration-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search premium dry fruits..."
                className="bg-transparent flex-1 outline-none text-sm text-neutral-700 placeholder-neutral-400 min-w-0"
              />
            </div>
          </div>


          {/*             RIGHT ICONS & MENU BUTTON 
            Must be flex-shrink-0 to guarantee visibility.
          */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0 xl:mr-24">
            
            {/* Search Icon (Visible on Tablet/MD screens to replace search bar) */}
            <button className="xl:hidden p-1 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 flex-shrink-0">
              <Search className="w-4 h-4 sm:w-7 sm:h-7 text-neutral-700 hover:text-luxury-gold transition-colors duration-300" />
            </button>

            {/* Common Icons (Wishlist, User, Cart) */}
            {[
              { icon: Heart, count: null, to: "/wishlist" },
              { icon: User, count: null, to: "/profile" },
              { icon: ShoppingCart, count: 0, to: "/cart" },
            ].map(({ icon: Icon, count, to }, index) => (
              <Link
                key={index}
                to={to}
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

            {/* Mobile Menu Button - Visible up to large screens */}
            <button
              className="xl:hidden p-2 sm:p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (Visible up to large screens) */}
        {isMenuOpen && (
          <div className="xl:hidden py-6 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-6">
              {/* Search bar for mobile menu */}
              <div className="flex items-center glass rounded-full px-4 py-2 w-full">
                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search premium dry fruits..."
                  className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400"
                />
              </div>
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