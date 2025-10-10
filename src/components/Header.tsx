import React, { useState, useEffect, useCallback, useMemo } from "react";
// Import needed types for TypeScript
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import "./topbar.css";

// --- Type Definitions (Interfaces) ---
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface TopBarProps {
  showTopBar: boolean;
}

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: SetState<boolean>;
}

interface IconSetProps extends MobileMenuProps {
  isSearchOpen: boolean;
  setIsSearchOpen: SetState<boolean>;
}

interface MobileSearchOverlayProps {
  isSearchOpen: boolean;
  setIsSearchOpen: SetState<boolean>;
}

// --- Navigation Data (Centralized) ---
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

// --- 1. TopBar Component (Memoized) ---
const TopBar: React.FC<TopBarProps> = React.memo(({ showTopBar }) => {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const sparkleCount = isDesktop ? 100 : 30;

  return (
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
  );
});

// --- 2. DesktopNav Component (FIXED for Medium Screens) ---
const DesktopNav: React.FC = () => (
    // {/* CHANGED: Made spacing responsive to tighten up on medium laptops */}
    <div className="flex items-center lg:space-x-6 xl:space-x-12">
        {/* CHANGED: Made spacing responsive here as well */}
        <nav className="flex items-center lg:space-x-4 xl:space-x-8">
            {NAV_LINKS.map((item) => (
                <a
                    key={item.name}
                    href={item.href}
                    className="text-neutral-800 text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap hover:text-luxury-gold"
                >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
                </a>
            ))}
        </nav>
        <div className="flex items-center glass rounded-full px-3 py-1.5 w-full max-w-xs group hover:shadow-lg transition-all duration-300">
            <Search className="w-4 h-4 text-neutral-400 mr-2 group-hover:text-luxury-gold transition-colors duration-300" />
            <input
                type="text"
                placeholder="Search dry fruits..."
                aria-label="Search premium dry fruits"
                className="bg-transparent flex-1 outline-none text-xs text-neutral-700 placeholder-neutral-400"
            />
        </div>
    </div>
);


// --- 3. MobileMenu Component ---
const MobileMenu: React.FC<MobileMenuProps> = ({ isMenuOpen, setIsMenuOpen }) => {
    if (!isMenuOpen) return null;

    return (
        <div id="mobile-menu" className="lg:hidden py-4 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-3">
                {NAV_LINKS.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className="text-neutral-700 hover:text-luxury-gold font-medium transition-colors duration-300 py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

// --- 4. IconSet Component (FIXED for Mobile) ---
const IconSet: React.FC<IconSetProps> = ({ isMenuOpen, setIsMenuOpen, isSearchOpen, setIsSearchOpen }) => {
    const iconData = useMemo(() => ([
        { icon: Heart, count: null, to: "/wishlist", label: "Wishlist" },
        { icon: User, count: null, to: "/profile", label: "Profile" },
        { icon: ShoppingCart, count: 0, to: "/cart", label: "Shopping Cart" },
    ]), []);

    const handleSearchToggle = () => {
        if (isMenuOpen) setIsMenuOpen(false); 
        setIsSearchOpen(true);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isSearchOpen) setIsSearchOpen(false); 
    };

    return (
        // {/* CHANGED: Responsive spacing to tighten icons on small mobile screens */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <button 
                className="lg:hidden p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
                aria-label="Search"
                onClick={handleSearchToggle}
            >
                <Search className="w-5 h-5 text-neutral-700 hover:text-luxury-gold transition-colors duration-300" />
            </button>

            {iconData.map(({ icon: Icon, count, to, label }, index) => (
                <Link
                    key={index}
                    to={to}
                    aria-label={label} 
                    className={`p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 relative group`}
                >
                    <Icon className="w-5 h-5 text-neutral-700 group-hover:text-luxury-gold transition-colors duration-300" />
                    {count !== null && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium shadow-lg">
                            {count}
                        </span>
                    )}
                </Link>
            ))}

            <button
                className="lg:hidden p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
                onClick={handleMenuToggle}
                aria-expanded={isMenuOpen} 
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
                <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
    );
};


// --- 5. MobileSearchOverlay Component ---
const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({ isSearchOpen, setIsSearchOpen }) => {
    if (!isSearchOpen) return null;

    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col p-4 sm:p-8 transition-opacity duration-300">
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
            autoFocus 
            className="bg-transparent flex-1 outline-none text-lg text-neutral-700 placeholder-neutral-400 min-w-0"
          />
        </div>

        <div className="mt-8">
            <p className="text-sm text-neutral-500">Popular Searches:</p>
        </div>
      </div>
    );
};

// --- FINAL HEADER COMPONENT (REFACTORED) ---
const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showTopBar, setShowTopBar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const SCROLL_THRESHOLD = 50;

    // --- Keyboard Accessibility Hook ---
    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (isMenuOpen) setIsMenuOpen(false);
            if (isSearchOpen) setIsSearchOpen(false);
        }
    }, [isMenuOpen, isSearchOpen]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    // --- Scroll Behavior Hook ---
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


    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? "glass backdrop-blur-xl shadow-luxury"
                    : "bg-white/95 backdrop-blur-sm"
            }`}
        >
            <MobileSearchOverlay isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
            
            <TopBar showTopBar={showTopBar} />
            
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4 lg:py-6">
                    
                    {/* --- Left Zone --- */}
                    <div className="flex justify-start lg:flex-1">
                        <Link to="/" className="flex items-center whitespace-nowrap group">
                            <img
                                src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
                                alt="Tamoor Logo"
                                loading="eager" 
                                // {/* CHANGED: Made logo size responsive to prevent mobile overflow */}
                                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mr-1 transition-transform duration-300 group-hover:scale-110"
                            />
                            <h1 
                                // {/* CHANGED: Made text size responsive to prevent mobile overflow */}
                                className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tamoor-gradient mr-1"
                            >
                                TAMOOR
                            </h1>
                            <span className="hidden sm:inline-block text-xs lg:text-sm text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-1 py-0.5 rounded-full">
                                Premium
                            </span>
                        </Link>
                    </div>

                    {/* --- Center Zone (Desktop Only) --- */}
                    <div className="hidden lg:flex justify-center">
                        <DesktopNav />
                    </div>
                    
                    {/* --- Right Zone --- */}
                    <div className="flex justify-end lg:flex-1">
                        <IconSet 
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                            isSearchOpen={isSearchOpen}
                            setIsSearchOpen={setIsSearchOpen}
                        />
                    </div>

                </div>

                <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            </div>
        </header>
    );
};

export default Header;