import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient"; // <= Make sure this path is correct

// Import needed icons
import { 
    Search, 
    ShoppingCart, 
    User, 
    Menu, 
    X, 
    Heart, 
    Loader2, 
    Package, 
    Tag 
} from "lucide-react";

import "./topbar.css";

// --- Type Definitions (Interfaces) ---
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
interface TopBarProps {}
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
// MODIFIED: Type for our unified search results now includes categoryId
type SearchResult = {
  id: number;
  name: string;
  type: 'product' | 'category';
  categoryId?: number; // Optional: only products will have this
};


// --- Navigation Data (Centralized) ---
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];


// ===================================================================
// --- SearchBar Component (MODIFIED) ---
// ===================================================================
const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);
  
    // Debounced search logic
    useEffect(() => {
      if (query.trim() === '') {
        setResults([]);
        return;
      }
  
      const searchProductsAndCategories = async () => {
        setIsLoading(true);
  
        // MODIFIED: The product query now also selects the 'category_id'
        const fetchProducts = supabase
          .from('products')
          .select('id, name, category_id') 
          .ilike('name', `%${query}%`)
          .limit(5);
  
        const fetchCategories = supabase
          .from('categories')
          .select('id, name')
          .ilike('name', `%${query}%`)
          .limit(3);
  
        const [productResponse, categoryResponse] = await Promise.all([
          fetchProducts,
          fetchCategories,
        ]);
  
        // The mapping now correctly handles 'category_id'
        const products = productResponse.data?.map(p => ({ ...p, categoryId: p.category_id, type: 'product' as const })) || [];
        const categories = categoryResponse.data?.map(c => ({ ...c, type: 'category' as const })) || [];
        
        setResults([...products, ...categories]);
        setIsLoading(false);
      };
  
      const timerId = setTimeout(() => {
        searchProductsAndCategories();
      }, 300);
  
      return () => clearTimeout(timerId);
    }, [query]);
  
    // MODIFIED: Navigation handler logic is updated for products
    const handleSelect = (item: SearchResult) => {
      setQuery('');
      setResults([]);
      setIsFocused(false);
  
      if (item.type === 'category') {
        navigate(`/products?categoryId=${item.id}`);
      } else { // This block handles 'product' type
        if (item.categoryId) {
          // If the product has a category, navigate to that category page
          navigate(`/products?categoryId=${item.categoryId}`);
        } else {
          // Fallback: If a product has no category, navigate via search term
          navigate(`/products?search=${encodeURIComponent(item.name)}`);
        }
      }
    };
  
    // Click outside handler to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
      <div className="relative w-full" ref={searchRef}>
        <div className="flex items-center glass rounded-full px-3 py-1.5 w-full shadow-sm focus-within:ring-2 focus-within:ring-luxury-gold transition-all duration-300">
          <Search className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search products & categories..."
            className="bg-transparent flex-1 outline-none text-sm text-neutral-700 placeholder-neutral-400 min-w-0"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
        </div>
  
        {isFocused && (query.length > 0 || isLoading) && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in">
            {isLoading && results.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">Searching...</div>
            ) : results.length > 0 ? (
              <ul>
                {results.map((item) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-luxury-gold/10 transition-colors duration-200"
                  >
                    {item.type === 'product' ? (
                       <Package className="w-4 h-4 mr-3 text-neutral-500" />
                    ) : (
                       <Tag className="w-4 h-4 mr-3 text-neutral-500" />
                    )}
                    <span className="text-neutral-700">{item.name}</span>
                    <span className="ml-auto text-xs text-neutral-400 capitalize">{item.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              !isLoading && <div className="p-4 text-center text-neutral-500">No results found.</div>
            )}
          </div>
        )}
      </div>
    );
};
// ===================================================================
// --- END: SearchBar Component ---
// ===================================================================


// --- 1. TopBar Component (Unchanged) ---
const TopBar: React.FC<TopBarProps> = React.memo(() => {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const sparkleCount = isDesktop ? 100 : 30;

  return (
    <div
      className="metallic-bar w-full h-10 flex items-center relative overflow-hidden"
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

// --- 2. DesktopNav Component (Unchanged) ---
const DesktopNav: React.FC = () => (
    <nav className="flex items-center space-x-8">
        {NAV_LINKS.map((item) => (
            <a
                key={item.name}
                href={item.href}
                className="text-neutral-800 text-sm lg:text-base font-bold transition-all duration-300 relative group whitespace-nowrap hover:text-luxury-gold"
            >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
            </a>
        ))}
    </nav>
);

// --- 3. MobileMenu Component (Unchanged) ---
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

// --- 4. IconSet Component (Unchanged) ---
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
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
        <button
            className="lg:hidden p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300"
            aria-label="Search"
            onClick={handleSearchToggle}
        >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 hover:text-luxury-gold transition-colors duration-300" />
        </button>

        {iconData.map(({ icon: Icon, count, to, label }, index) => (
            <Link
                key={index}
                to={to}
                aria-label={label}
                className={`p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 relative group`}
            >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 group-hover:text-luxury-gold transition-colors duration-300" />
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
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
    </div>
    );
};

// --- 5. MobileSearchOverlay Component (Unchanged) ---
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
        <div className="mt-6">
            <SearchBar />
        </div>
      </div>
    );
};

// --- FINAL HEADER COMPONENT (Unchanged) ---
const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showTopBar, setShowTopBar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const SCROLL_THRESHOLD = 50;

    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            if (isMenuOpen) setIsMenuOpen(false);
            if (isSearchOpen) setIsSearchOpen(false);
          }
        },
        [isMenuOpen, isSearchOpen]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [handleEscape]);

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
            className="sticky top-0 z-50 overflow-visible"
        >
            <MobileSearchOverlay
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
            />

            <div
                className={`transition-transform duration-300 ease-in-out ${
                showTopBar ? "translate-y-0" : "-translate-y-10"
                }`}
            >
                <TopBar />

                <div
                className={`w-full px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
                    isScrolled
                    ? "glass backdrop-blur-xl shadow-luxury"
                    : "bg-white/95 backdrop-blur-sm"
                }`}
                >
                <div className="flex items-center justify-between py-4 lg:py-6">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center whitespace-nowrap group">
                            <img
                                src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png"
                                alt="Tamoor Logo"
                                loading="eager"
                                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mr-1 transition-transform duration-300 group-hover:scale-110"
                            />
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tamoor-gradient mr-1">
                                TAMOOR
                            </h1>
                            <span className="hidden sm:inline-block text-xs lg:text-sm text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-1 py-0.5 rounded-full">
                                Premium
                            </span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex justify-center">
                        <DesktopNav />
                    </div>

                    <div className="hidden lg:flex items-center justify-end space-x-4">
                        <div className="w-64">
                            <SearchBar />
                        </div>
                        <IconSet
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                            isSearchOpen={isSearchOpen}
                            setIsSearchOpen={setIsSearchOpen}
                        />
                    </div>

                    <div className="lg:hidden">
                        <IconSet
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                            isSearchOpen={isSearchOpen}
                            setIsSearchOpen={setIsSearchOpen}
                        />
                    </div>
                </div>

                <MobileMenu
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />
                </div>
            </div>
        </header>
    );
};

export default Header;