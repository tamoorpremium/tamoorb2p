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

  // Scroll behavior
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentScrollY - lastScrollY;
          if (delta > SCROLL_THRESHOLD && showTopBar && currentScrollY > 50) setShowTopBar(false);
          else if (delta < -SCROLL_THRESHOLD && !showTopBar) setShowTopBar(true);
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

  // Sparkles
  const sparkleCount = window.innerWidth < 768 ? 30 : 100;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass backdrop-blur-xl shadow-luxury"
          : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      {/* ─── Top Bar ─────────────────────────────── */}
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

      {/* ─── Mobile Layout (<640px) ─────────────────────────────── */}
      <div className="sm:hidden px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center group">
          <img
            src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
            alt="Tamoor Logo"
            className="w-10 h-10 mr-2 transition-transform duration-300 group-hover:scale-110"
          />
          <h1 className="text-3xl font-serif font-bold tamoor-gradient">
            TAMOOR
          </h1>
        </Link>

        <div className="flex items-center space-x-2">
          <Link to="/cart">
            <ShoppingCart className="w-6 h-6 text-neutral-700 hover:text-luxury-gold" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg py-4 animate-slide-up z-40">
            <div className="flex flex-col items-center space-y-4">
              {["Home", "Products", "Categories", "About", "Contact"].map((name) => (
                <Link
                  key={name}
                  to={`/${name.toLowerCase()}`}
                  className="text-neutral-700 font-medium hover:text-luxury-gold transition"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Tablet Layout (640px–1023px) ─────────────────────────────── */}
      <div className="hidden sm:flex lg:hidden items-center justify-between px-6 py-3 overflow-x-hidden">
        <Link
          to="/home"
          className="flex items-center group whitespace-nowrap overflow-hidden"
        >
          <img
            src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
            alt="Tamoor Logo"
            className="w-10 h-10 mr-2 transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
          />
          <h1 className="text-4xl font-serif font-bold tamoor-gradient mr-2 flex-shrink-0">
            TAMOOR
          </h1>
          <span className="text-xs text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-2 py-0.5 rounded-full flex-shrink-0">
            Premium
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link to="/wishlist">
            <Heart className="w-6 h-6 text-neutral-700 hover:text-luxury-gold" />
          </Link>
          <Link to="/profile">
            <User className="w-6 h-6 text-neutral-700 hover:text-luxury-gold" />
          </Link>
          <Link to="/cart">
            <ShoppingCart className="w-6 h-6 text-neutral-700 hover:text-luxury-gold" />
          </Link>
        </div>
      </div>

      {/* ─── Desktop Layout (≥1024px) ─────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-12 py-4">
        <Link to="/home" className="flex items-center group whitespace-nowrap">
          <img
            src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
            alt="Tamoor Logo"
            className="w-16 h-16 object-contain mr-3 transition-transform duration-300 group-hover:scale-110"
          />
          <h1 className="text-6xl font-serif font-bold tamoor-gradient mr-3">
            TAMOOR
          </h1>
          <span className="text-sm text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-3 py-1 rounded-full">
            Premium
          </span>
        </Link>

        <nav className="flex items-center space-x-8">
          {["Home", "Products", "Categories", "About", "Contact"].map((name) => (
            <Link
              key={name}
              to={`/${name.toLowerCase()}`}
              className="text-neutral-800 hover:text-luxury-gold font-semibold transition relative group"
            >
              {name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="glass rounded-full px-4 py-2 flex items-center w-72">
            <Search className="w-5 h-5 text-neutral-400 mr-3" />
            <input
              type="text"
              placeholder="Search premium dry fruits..."
              className="bg-transparent flex-1 outline-none text-neutral-700 placeholder-neutral-400"
            />
          </div>

          {[Heart, User, ShoppingCart].map((Icon, i) => (
            <Link
              key={i}
              to={i === 0 ? "/wishlist" : i === 1 ? "/profile" : "/cart"}
              className="p-3 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
            >
              <Icon className="w-7 h-7 text-neutral-700 hover:text-luxury-gold" />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
