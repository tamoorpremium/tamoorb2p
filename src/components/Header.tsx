import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useCart } from '../context/CartContext';

// Import needed icons, including some new ones for commands
import { 
    Search, 
    ShoppingCart, 
    User, 
    Menu, 
    X, 
    Heart, 
    Loader2, 
    Package, 
    Tag,
    ArrowRight
} from "lucide-react";

// Import BOTH CSS files
import "./topbar.css";
import "./searchbar.css"; 

// --- Type Definitions (Updated for Commands) ---
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
interface TopBarProps {}
interface MobileMenuProps { isMenuOpen: boolean; setIsMenuOpen: SetState<boolean>; }
interface IconSetProps extends MobileMenuProps { isSearchOpen: boolean; setIsSearchOpen: SetState<boolean>; }

// A unified type for all possible search results: Products, Categories, and now Actions
type SearchResultItem = { 
  id: number | string; 
  name: string; 
  type: 'product' | 'category' | 'action'; 
  categoryId?: number;
  href?: string;
  icon?: React.ElementType;
};

// --- Navigation Data ---
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

// ===================================================================
// --- 1. ENHANCED: Command Palette Component ---
// Now includes Zero-State Suggestions and Action Commands.
// ===================================================================
const CommandPalette: React.FC<{ isOpen: boolean; setIsOpen: SetState<boolean>; }> = ({ isOpen, setIsOpen }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    
    // State for dynamic placeholder
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholders = useMemo(() => [
        "Search products or type 'cart'...",
        "Try 'Diwali Gift Hampers'",
        "Trending: California Almonds",
        "Type 'wishlist' to see your items",
    ], []);

    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    
    // --- NEW: Action Commands ---
    // This is the list of commands the user can type.
    const commandActions = useMemo(() => [
        { id: 'go-to-cart', name: "Go to Shopping Cart", keywords: ["cart", "bag", "checkout"], href: "/cart", icon: ShoppingCart, type: 'action' as const },
        { id: 'go-to-wishlist', name: "View Your Wishlist", keywords: ["wishlist", "saved", "likes", "heart"], href: "/wishlist", icon: Heart, type: 'action' as const },
        { id: 'go-to-profile', name: "View Your Profile", keywords: ["profile", "account", "user"], href: "/profile", icon: User, type: 'action' as const },
    ], []);

    // Effect for cycling placeholders
    useEffect(() => {
        const intervalId = setInterval(() => {
            setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
        }, 4000);
        return () => clearInterval(intervalId);
    }, [placeholders]);

    // Focus input when palette opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // --- MODIFIED: Main Search Logic ---
    // Now includes Zero-State Suggestions and Command filtering.
    useEffect(() => {
        // --- NEW: Zero-State Suggestions ---
        if (isOpen && query.trim() === '') {
            setIsLoading(true);
            const fetchSuggestions = async () => {
                const { data } = await supabase.from('products').select('id, name, category_id').in('badge', ['Popular', 'Best Seller']).limit(4);
                const suggestions = data?.map(p => ({ ...p, categoryId: p.category_id, type: 'product' as const })) || [];
                setResults(suggestions);
                setIsLoading(false);
                setActiveIndex(0);
            };
            fetchSuggestions();
            return;
        }

        // Debounced search for products, categories, and commands
        const timerId = setTimeout(async () => {
            if (query.trim() === '') {
                setResults([]);
                return;
            }
            setIsLoading(true);

            // Filter commands based on query
            const lowerQuery = query.toLowerCase();
            const matchingCommands = commandActions.filter(cmd => cmd.keywords.some(k => k.startsWith(lowerQuery)));

            // Fetch products and categories
            const { data: productsData } = await supabase.from('products').select('id, name, category_id').ilike('name', `%${query}%`).limit(4);
            const { data: categoriesData } = await supabase.from('categories').select('id, name').ilike('name', `%${query}%`).limit(2);
            
            const products = productsData?.map(p => ({ ...p, categoryId: p.category_id, type: 'product' as const })) || [];
            const categories = categoriesData?.map(c => ({ ...c, type: 'category' as const })) || [];
            
            // Combine all results, with commands appearing first
            setResults([...matchingCommands, ...categories, ...products]);
            setIsLoading(false);
            setActiveIndex(0);
        }, 250);
        return () => clearTimeout(timerId);
    }, [query, isOpen, commandActions]);

    // Navigation function (now handles 'action' type)
    const navigateToResult = useCallback((item: SearchResultItem) => {
        setIsOpen(false);
        if (item.type === 'action') {
            if (item.href) navigate(item.href);
        } else if (item.type === 'category') {
            navigate(`/products?categoryId=${item.id}`);
        } else {
            navigate(item.categoryId ? `/products?categoryId=${item.categoryId}` : `/products?search=${encodeURIComponent(item.name)}`);
        }
    }, [navigate, setIsOpen]);
    
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') { setIsOpen(false); return; }

            if (results.length > 0) {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((prev) => (prev + 1) % results.length); } 
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((prev) => (prev - 1 + results.length) % results.length); } 
                else if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); navigateToResult(results[activeIndex]); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, activeIndex, navigateToResult, setIsOpen]);

    if (!isOpen) return null;

    // Filter results for rendering
    const actionResults = results.filter(r => r.type === 'action');
    const categoryResults = results.filter(r => r.type === 'category');
    const productResults = results.filter(r => r.type === 'product');

    return (
        <div className="command-palette-overlay" onMouseDown={() => setIsOpen(false)}>
            <div className="command-palette" onMouseDown={(e) => e.stopPropagation()}>
                <div className="command-palette-input-wrapper">
                    {isLoading ? <Loader2 className="h-5 w-5 text-neutral-500 animate-spin" /> : <Search className="h-5 w-5 text-neutral-500" />}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholders[placeholderIndex]}
                        className="command-palette-input animated-placeholder"
                    />
                </div>
                <div className="command-palette-results">
                    {isLoading && results.length === 0 ? (
                        <p className="p-4 text-center text-neutral-500">Searching...</p>
                    ) : !isLoading && results.length === 0 && query.trim() !== '' ? (
                         <p className="p-4 text-center text-neutral-500">No results found for "{query}".</p>
                    ) : (
                        <>
                            {/* Render Zero-State Header */}
                            {query.trim() === '' && results.length > 0 && <div className="command-palette-group-header">Trending Products</div>}
                            
                            {/* Render Action Commands */}
                            {actionResults.length > 0 && <div>
                                <div className="command-palette-group-header">Actions</div>
                                {actionResults.map((item, index) => {
                                    const ItemIcon = item.icon || ArrowRight;
                                    return (
                                        <div key={item.id} className="command-palette-item" data-active={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => navigateToResult(item)}>
                                            <ItemIcon className="w-4 h-4 mr-3 text-neutral-500" />
                                            <span>{item.name}</span>
                                        </div>
                                    );
                                })}
                            </div>}

                            {/* Render Categories */}
                            {categoryResults.length > 0 && <div>
                                <div className="command-palette-group-header">Categories</div>
                                {categoryResults.map((item, index) => (
                                    <div key={item.id} className="command-palette-item" data-active={activeIndex === (actionResults.length + index)} onMouseEnter={() => setActiveIndex(actionResults.length + index)} onClick={() => navigateToResult(item)}>
                                        <Tag className="w-4 h-4 mr-3 text-neutral-500" />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>}

                            {/* Render Products */}
                            {productResults.length > 0 && <div>
                                <div className="command-palette-group-header">{query.trim() === '' ? '' : 'Products'}</div>
                                {productResults.map((item, index) => (
                                    <div key={item.id} className="command-palette-item" data-active={activeIndex === (actionResults.length + categoryResults.length + index)} onMouseEnter={() => setActiveIndex(actionResults.length + categoryResults.length + index)} onClick={() => navigateToResult(item)}>
                                        <Package className="w-4 h-4 mr-3 text-neutral-500" />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>}
                        </>
                    )}
                </div>
                <div className="command-palette-footer">
                    <span>↑↓ to navigate</span>
                    <span>↵ to select</span>
                    <span>esc to close</span>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// --- The Rest of your Header file (Now properly formatted) ---
// ===================================================================

const SearchBarTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="search-trigger" onClick={onClick}>
        <Search className="w-4 h-4 mr-2"/>
        <span>Search...</span>
        <span className="ml-auto text-xs border rounded-md px-1.5 py-0.5">⌘K</span>
    </button>
);

const TopBar: React.FC<TopBarProps> = React.memo(() => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const sparkleCount = isDesktop ? 100 : 30;
    return (
        <div className="metallic-bar w-full h-10 flex items-center relative overflow-hidden">
            <div className="relative overflow-hidden">
                {Array.from({ length: sparkleCount }).map((_, i) => {
                    const size = Math.floor(Math.random() * 4) + 2;
                    const top = Math.floor(Math.random() * 100);
                    const left = Math.floor(Math.random() * 100);
                    const d1 = (Math.random() * 10).toFixed(1) + "s";
                    const d2 = (Math.random() * 2).toFixed(1) + "s";
                    return (<div key={i} className="sparkle absolute rounded-full bg-white opacity-80 animate-twinkle" style={{ width: `${size}px`, height: `${size}px`, top: `${top}%`, left: `${left}%`, animationDelay: `${d1}, ${d2}` }}></div>);
                })}
                <div className="animate-scroll whitespace-nowrap flex">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <span key={i} className="futuristic-text mx-8 text-sm font-bold">
                            {i % 2 === 0 ? "✨ Free shipping on orders above ₹999!" : "⚡ Use Code: WELCOME10 & Unlock 10% Savings On Your First Order! 🎉"}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
});

const DesktopNav: React.FC = () => (
    <nav className="flex items-center space-x-8">
        {NAV_LINKS.map(item => (
            <a key={item.name} href={item.href} className="text-neutral-800 text-sm lg:text-base font-bold transition-all duration-300 relative group whitespace-nowrap hover:text-luxury-gold">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-gold to-luxury-gold-light transition-all duration-300 group-hover:w-full"></span>
            </a>
        ))}
    </nav>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ isMenuOpen, setIsMenuOpen }) => {
    if (!isMenuOpen) return null;
    return (
        <div id="mobile-menu" className="lg:hidden py-4 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-3">
                {NAV_LINKS.map(item => (
                    <Link key={item.name} to={item.href} className="text-neutral-700 hover:text-luxury-gold font-medium transition-colors duration-300 py-2" onClick={() => setIsMenuOpen(false)}>
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

const IconSet: React.FC<IconSetProps> = ({ isMenuOpen, setIsMenuOpen, isSearchOpen, setIsSearchOpen }) => {
    const { cartCount } = useCart(); // <-- 2. Get the real cart count from the context
    const iconData = useMemo(() => ([
        { icon: Heart, count: null, to: "/wishlist", label: "Wishlist" },
        { icon: User, count: null, to: "/profile", label: "Profile" },
        { icon: ShoppingCart, count: cartCount, to: "/cart", label: "Shopping Cart" },
    ]), [cartCount]);
    
    const handleSearchToggle = () => { if (isMenuOpen) setIsMenuOpen(false); setIsSearchOpen(true); };
    const handleMenuToggle = () => { setIsMenuOpen(!isMenuOpen); if (isSearchOpen) setIsSearchOpen(false); };
    
    return (
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <button className="lg:hidden p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300" aria-label="Search" onClick={handleSearchToggle}>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 hover:text-luxury-gold transition-colors duration-300" />
            </button>
            {iconData.map(({ icon: Icon, count, to, label }, index) => (
                <Link key={index} to={to} aria-label={label} className={`p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300 relative group`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 group-hover:text-luxury-gold transition-colors duration-300" />
                    {count !== null && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium shadow-lg">{count}</span>
                    )}
                </Link>
            ))}
            <button className="lg:hidden p-2 hover:bg-luxury-gold/10 rounded-full transition-all duration-300" onClick={handleMenuToggle} aria-expanded={isMenuOpen}>
                <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
        </div>
    );
};

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showTopBar, setShowTopBar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(p => !p);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const delta = currentScrollY - lastScrollY;
                    if (delta > 50 && showTopBar && currentScrollY > 50) setShowTopBar(false);
                    else if (delta < -50 && !showTopBar) setShowTopBar(true);
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
        <>
            <CommandPalette isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
            <header className="sticky top-0 z-50 overflow-visible">
                <div className={`transition-transform duration-300 ease-in-out ${showTopBar ? "translate-y-0" : "-translate-y-10"}`}>
                    <TopBar />
                    <div className={`w-full px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isScrolled ? "glass backdrop-blur-xl shadow-luxury" : "bg-white/95 backdrop-blur-sm"}`}>
                        <div className="flex items-center justify-between py-4 lg:py-6">
                            <div className="flex-shrink-0">
                                <Link to="/" className="flex items-center whitespace-nowrap group">
                                    <img src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo%20(5).webp" alt="Tamoor Logo" loading="eager" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mr-1 transition-transform duration-300 group-hover:scale-110" />
                                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tamoor-gradient mr-1">TAMOOR</h1>
                                    <span className="hidden sm:inline-block text-xs lg:text-sm text-luxury-gold font-serif font-medium bg-luxury-gold/10 px-1 py-0.5 rounded-full">Premium</span>
                                </Link>
                            </div>
                            <div className="hidden lg:flex justify-center"><DesktopNav /></div>
                            <div className="hidden lg:flex items-center justify-end space-x-4">
                                <div className="w-64"><SearchBarTrigger onClick={() => setIsSearchOpen(true)} /></div>
                                <IconSet isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
                            </div>
                            <div className="lg:hidden">
                                <IconSet isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
                            </div>
                        </div>
                        <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;