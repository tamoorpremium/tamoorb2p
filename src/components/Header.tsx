import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// --- Type Definitions ---
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
interface TopBarProps { showTopBar: boolean; }
interface MobileMenuProps { isMenuOpen: boolean; setIsMenuOpen: SetState<boolean>; }
interface IconSetProps extends MobileMenuProps { isSearchOpen: boolean; setIsSearchOpen: SetState<boolean>; }
interface MobileSearchOverlayProps { isSearchOpen: boolean; setIsSearchOpen: SetState<boolean>; }

// --- Constants ---
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];
const SCROLL_THRESHOLD = 50;

// =================================================================================
// 0. EMBEDDED STYLES COMPONENT
// Contains your original top bar CSS and helper styles for the main header.
// =================================================================================
const HeaderStyles = () => (
  <style>{`
    /* ======================================================================== */
    /* STYLES FOR MAIN HEADER (BELOW TOP BAR)                                   */
    /* ======================================================================== */
    body.no-scroll { overflow: hidden; }
    .tamoor-gradient {
      background: linear-gradient(45deg, #b48a3c, #f2d78e, #b48a3c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
    }
    .glass {
      background-color: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .shadow-luxury { box-shadow: 0 8px 32px 0 rgba(135, 115, 69, 0.15); }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }

    /* ======================================================================== */
    /* YOUR ORIGINAL TOP BAR STYLES (VERBATIM)                                  */
    /* ======================================================================== */
    @keyframes metallicShine {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    .metallic-bar {
        background: linear-gradient(120deg, #0a1a40, #123b70, #1a4d9c, #249eff, #1a4d9c, #123b70, #0a1a40);
        background-size: 400% 400%;
        animation: metallicShine 20s ease infinite;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 0 20px rgba(34, 114, 215, 0.4), 0 0 12px rgba(34, 114, 215, 0.6);
    }
    .metallic-bar::after {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        animation: shineMove 6s infinite;
    }
    @keyframes shineMove {
        0% { left: -100%; }
        50% { left: 120%; }
        100% { left: 120%; }
    }
    @keyframes sparkleFloat {
        from { transform: translateY(0) scale(1); opacity: 1; }
        to { transform: translateY(-60px) scale(0.3); opacity: 0; }
    }
    .metallic-bar .sparkle {
        position: absolute;
        background: radial-gradient(circle, #fff 40%, rgba(255,255,255,0) 70%);
        border-radius: 50%;
        opacity: 0.8;
        animation: sparkleFloat 6s linear infinite;
        pointer-events: none;
        filter: drop-shadow(0 0 6px #66aaff) drop-shadow(0 0 10px #3399ff);
    }
    .sparkle:nth-child(1)  { width: 3px; height: 3px; top: 10%; left: 5%; animation-delay: 0s; }
    .sparkle:nth-child(2)  { width: 2px; height: 2px; top: 30%; left: 12%; animation-delay: 1s; }
    .sparkle:nth-child(3)  { width: 4px; height: 4px; top: 60%; left: 20%; animation-delay: 2s; }
    .sparkle:nth-child(4)  { width: 3px; height: 3px; top: 80%; left: 30%; animation-delay: 3s; }
    .sparkle:nth-child(5)  { width: 5px; height: 5px; top: 15%; left: 40%; animation-delay: 4s; }
    .sparkle:nth-child(6)  { width: 2px; height: 2px; top: 50%; left: 50%; animation-delay: 5s; }
    .sparkle:nth-child(7)  { width: 4px; height: 4px; top: 70%; left: 60%; animation-delay: 6s; }
    .sparkle:nth-child(8)  { width: 3px; height: 3px; top: 20%; left: 70%; animation-delay: 7s; }
    .sparkle:nth-child(9)  { width: 2px; height: 2px; top: 40%; left: 80%; animation-delay: 8s; }
    .sparkle:nth-child(10) { width: 4px; height: 4px; top: 65%; left: 90%; animation-delay: 9s; }
    .sparkle:nth-child(11) { width: 3px; height: 3px; top: 25%; left: 15%; animation-delay: 2.5s; }
    .sparkle:nth-child(12) { width: 2px; height: 2px; top: 75%; left: 25%; animation-delay: 3.5s; }
    .sparkle:nth-child(13) { width: 5px; height: 5px; top: 35%; left: 35%; animation-delay: 4.5s; }
    .sparkle:nth-child(14) { width: 2px; height: 2px; top: 55%; left: 45%; animation-delay: 5.5s; }
    .sparkle:nth-child(15) { width: 4px; height: 4px; top: 10%; left: 55%; animation-delay: 6.5s; }
    .sparkle:nth-child(16) { width: 3px; height: 3px; top: 45%; left: 65%; animation-delay: 7.5s; }
    .sparkle:nth-child(17) { width: 2px; height: 2px; top: 85%; left: 75%; animation-delay: 8.5s; }
    .sparkle:nth-child(18) { width: 4px; height: 4px; top: 15%; left: 85%; animation-delay: 9.5s; }
    .sparkle:nth-child(19) { width: 3px; height: 3px; top: 35%; left: 95%; animation-delay: 10.5s; }
    .sparkle:nth-child(20) { width: 2px; height: 2px; top: 65%; left: 8%; animation-delay: 11.5s; }
    .sparkle:nth-child(21) { width: 3px; height: 3px; top: 18%; left: 28%; animation-delay: 1.2s; }
    .sparkle:nth-child(22) { width: 2px; height: 2px; top: 58%; left: 38%; animation-delay: 2.2s; }
    .sparkle:nth-child(23) { width: 5px; height: 5px; top: 78%; left: 48%; animation-delay: 3.2s; }
    .sparkle:nth-child(24) { width: 2px; height: 2px; top: 28%; left: 58%; animation-delay: 4.2s; }
    .sparkle:nth-child(25) { width: 4px; height: 4px; top: 48%; left: 68%; animation-delay: 5.2s; }
    .sparkle:nth-child(26) { width: 3px; height: 3px; top: 88%; left: 78%; animation-delay: 6.2s; }
    .sparkle:nth-child(27) { width: 2px; height: 2px; top: 38%; left: 88%; animation-delay: 7.2s; }
    .sparkle:nth-child(28) { width: 4px; height: 4px; top: 68%; left: 98%; animation-delay: 8.2s; }
    .sparkle:nth-child(29) { width: 3px; height: 3px; top: 22%; left: 18%; animation-delay: 9.2s; }
    .sparkle:nth-child(30) { width: 2px; height: 2px; top: 52%; left: 28%; animation-delay: 10.2s; }
    .sparkle:nth-child(31) { width: 3px; height: 3px; top: 12%; left: 8%; animation-delay: 0.5s; }
    .sparkle:nth-child(32) { width: 2px; height: 2px; top: 42%; left: 18%; animation-delay: 1.5s; }
    .sparkle:nth-child(33) { width: 4px; height: 4px; top: 72%; left: 28%; animation-delay: 2.5s; }
    .sparkle:nth-child(34) { width: 3px; height: 3px; top: 85%; left: 35%; animation-delay: 3.5s; }
    .sparkle:nth-child(35) { width: 5px; height: 5px; top: 20%; left: 45%; animation-delay: 4.5s; }
    .sparkle:nth-child(36) { width: 2px; height: 2px; top: 50%; left: 55%; animation-delay: 5.5s; }
    .sparkle:nth-child(37) { width: 4px; height: 4px; top: 75%; left: 65%; animation-delay: 6.5s; }
    .sparkle:nth-child(38) { width: 3px; height: 3px; top: 18%; left: 75%; animation-delay: 7.5s; }
    .sparkle:nth-child(39) { width: 2px; height: 2px; top: 40%; left: 85%; animation-delay: 8.5s; }
    .sparkle:nth-child(40) { width: 4px; height: 4px; top: 65%; left: 95%; animation-delay: 9.5s; }
    .sparkle:nth-child(41) { width: 3px; height: 3px; top: 28%; left: 10%; animation-delay: 1.0s; }
    .sparkle:nth-child(42) { width: 2px; height: 2px; top: 48%; left: 20%; animation-delay: 2.0s; }
    .sparkle:nth-child(43) { width: 5px; height: 5px; top: 68%; left: 30%; animation-delay: 3.0s; }
    .sparkle:nth-child(44) { width: 2px; height: 2px; top: 38%; left: 40%; animation-delay: 4.0s; }
    .sparkle:nth-child(45) { width: 4px; height: 4px; top: 58%; left: 50%; animation-delay: 5.0s; }
    .sparkle:nth-child(46) { width: 3px; height: 3px; top: 88%; left: 60%; animation-delay: 6.0s; }
    .sparkle:nth-child(47) { width: 2px; height: 2px; top: 48%; left: 70%; animation-delay: 7.0s; }
    .sparkle:nth-child(48) { width: 4px; height: 4px; top: 68%; left: 80%; animation-delay: 8.0s; }
    .sparkle:nth-child(49) { width: 3px; height: 3px; top: 22%; left: 90%; animation-delay: 9.0s; }
    .sparkle:nth-child(50) { width: 2px; height: 2px; top: 52%; left: 98%; animation-delay: 10.0s; }

    :root { --scroll-duration: 60s; }
    @keyframes scroll {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
    }
    .animate-scroll {
        display: flex;
        width: max-content;
        animation: scroll var(--scroll-duration) linear infinite;
        z-index: 10;
        position: relative;
    }
    .animate-scroll > span { margin-right: 4rem; }
    .futuristic-text {
        color: #eaf3ff;
        text-shadow: 0 0 4px #4a90e2, 0 0 10px #2272d7, 0 0 20px #1a4d9c, 0 0 30px rgba(34,114,215,0.6);
        font-weight: 700;
        animation: shimmer 2s infinite alternate;
        white-space: nowrap;
        flex-shrink: 0;
    }
    @keyframes shimmer {
        0% { opacity: 0.8; text-shadow: 0 0 3px #66aaff, 0 0 6px #3399ff, 0 0 12px #2272d7; }
        50% { opacity: 1; text-shadow: 0 0 6px #99ccff, 0 0 12px #66aaff, 0 0 18px #3399ff; }
        100% { opacity: 0.9; text-shadow: 0 0 3px #66aaff, 0 0 6px #3399ff, 0 0 12px #2272d7; }
    }
  `}</style>
);


// =================================================================================
// 1. TOP BAR COMPONENT (REVERTED TO STATIC SPARKLES)
// =================================================================================
const TopBar: React.FC<TopBarProps> = React.memo(({ showTopBar }) => {
  return (
    <div className={`metallic-bar w-full transition-transform duration-300 ease-in-out ${showTopBar ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="relative overflow-hidden py-2.5">
        {/* Render 50 empty divs for your CSS to target with :nth-child */}
        {Array.from({ length: 50 }).map((_, i) => <div key={i} className="sparkle" />)}
        <div className="animate-scroll whitespace-nowrap flex">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="futuristic-text text-sm font-bold">
              {i % 2 === 0 ? "✨ Free shipping on orders above ₹999!" : "⚡ Use Code: WELCOME10 & Unlock 10% Savings! 🎉"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

// =================================================================================
// 2. LOGO COMPONENT (SIZES INCREASED)
// =================================================================================
const Logo: React.FC = () => (
  <div className="flex-shrink-0">
    <Link to="/" className="flex items-center whitespace-nowrap group">
      <img src="https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/logo.png" alt="Tamoor Logo" loading="eager" className="h-12 w-12 md:h-14 md:w-14 object-contain mr-2 transition-transform duration-300 group-hover:scale-110"/>
      <h1 className="text-4xl md:text-5xl font-serif font-bold tamoor-gradient mr-2">TAMOOR</h1>
      <span className="hidden sm:inline-block text-sm text-[--luxury-gold] font-serif font-medium bg-[#f2d78e]/20 px-2 py-1 rounded-full">Premium</span>
    </Link>
  </div>
);

// =================================================================================
// 3. DESKTOP NAVIGATION COMPONENT (SIZES INCREASED)
// =================================================================================
const DesktopNav: React.FC = () => (
  <nav className="hidden lg:flex items-center justify-center flex-grow">
    <div className="flex items-center space-x-10">
      {NAV_LINKS.map((item) => (
        <a key={item.name} href={item.href} className="text-neutral-800 text-base font-semibold transition-all duration-300 relative group whitespace-nowrap hover:text-[--luxury-gold]">
          {item.name}
          <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-gradient-to-r from-[--luxury-gold] to-[#f2d78e] transition-all duration-300 group-hover:w-full"></span>
        </a>
      ))}
    </div>
  </nav>
);

// =================================================================================
// 4. ACTION ICONS COMPONENT (SIZES INCREASED)
// =================================================================================
const IconSet: React.FC<IconSetProps> = ({ isMenuOpen, setIsMenuOpen, isSearchOpen, setIsSearchOpen }) => {
    const iconData = useMemo(() => ([
        { icon: Heart, count: null, to: "/wishlist", label: "Wishlist" },
        { icon: User, count: null, to: "/profile", label: "Profile" },
        { icon: ShoppingCart, count: 0, to: "/cart", label: "Shopping Cart" },
    ]), []);
    const handleSearchToggle = useCallback(() => { if (isMenuOpen) setIsMenuOpen(false); setIsSearchOpen(true); }, [isMenuOpen, setIsMenuOpen, setIsSearchOpen]);
    const handleMenuToggle = useCallback(() => { if (isSearchOpen) setIsSearchOpen(false); setIsMenuOpen(prev => !prev); }, [isSearchOpen, setIsSearchOpen, setIsMenuOpen]);

    return (
        <div className="flex items-center space-x-2 md:space-x-3">
            <button className="lg:hidden p-2 hover:bg-[#b48a3c]/10 rounded-full transition-colors duration-300" aria-label="Open search" onClick={handleSearchToggle}><Search className="w-6 h-6 text-neutral-700" /></button>
            {iconData.map(({ icon: Icon, count, to, label }, index) => (
                <Link key={index} to={to} aria-label={label} className="p-2 hover:bg-[#b48a3c]/10 rounded-full transition-colors duration-300 relative group">
                    <Icon className="w-6 h-6 text-neutral-700 group-hover:text-[--luxury-gold] transition-colors" />
                    {count !== null && (<span className="absolute -top-1 -right-1 bg-gradient-to-r from-[--luxury-gold] to-[#f2d78e] text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">{count}</span>)}
                </Link>
            ))}
            <button className="lg:hidden p-2 hover:bg-[#b48a3c]/10 rounded-full transition-colors duration-300" onClick={handleMenuToggle} aria-expanded={isMenuOpen} aria-controls="mobile-menu" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
                {isMenuOpen ? <X className="w-7 h-7 text-neutral-700" /> : <Menu className="w-7 h-7 text-neutral-700" />}
            </button>
        </div>
    );
};

// =================================================================================
// 5. RIGHT-SIDE ACTIONS (SIZES INCREASED)
// =================================================================================
const RightActions: React.FC<IconSetProps> = (props) => (
    <div className="flex items-center justify-end flex-shrink-0">
        <div className="hidden lg:flex items-center glass rounded-full px-4 py-2 w-full max-w-xs group hover:shadow-lg transition-shadow duration-300 mr-4">
            <Search className="w-5 h-5 text-neutral-500 mr-3 group-hover:text-[--luxury-gold] transition-colors" />
            <input type="text" placeholder="Search dry fruits..." aria-label="Search premium dry fruits" className="bg-transparent flex-1 outline-none text-sm text-neutral-800 placeholder-neutral-500"/>
        </div>
        <IconSet {...props} />
    </div>
);

// =================================================================================
// 6. MOBILE NAVIGATION MENU (SIZES INCREASED)
// =================================================================================
const MobileMenu: React.FC<MobileMenuProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  if (!isMenuOpen) return null;
  return (
    <div id="mobile-menu" className="lg:hidden py-4 border-t border-neutral-200/50 animate-slide-up">
      <div className="flex flex-col space-y-4">
        {NAV_LINKS.map((item) => (<Link key={item.name} to={item.href} className="text-neutral-800 hover:text-[--luxury-gold] text-lg font-semibold transition-colors duration-300 py-2 text-center" onClick={() => setIsMenuOpen(false)}>{item.name}</Link>))}
      </div>
    </div>
  );
};

// =================================================================================
// 7. MOBILE SEARCH OVERLAY (SIZES INCREASED)
// =================================================================================
const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({ isSearchOpen, setIsSearchOpen }) => {
  if (!isSearchOpen) return null;
  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col p-5 sm:p-8 transition-opacity duration-300 animate-slide-up">
      <div className="flex items-center justify-between pb-5 border-b border-neutral-200">
        <h2 className="text-2xl font-bold text-neutral-800">Search Products</h2>
        <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full" aria-label="Close search"><X className="w-7 h-7 text-neutral-700" /></button>
      </div>
      <div className="flex items-center glass rounded-full px-4 py-3 w-full mt-8 shadow-md">
        <Search className="w-6 h-6 text-neutral-500 mr-4" />
        <input type="text" placeholder="Search..." aria-label="Search" autoFocus className="bg-transparent flex-1 outline-none text-lg text-neutral-800 placeholder-neutral-500"/>
      </div>
      <div className="mt-8 text-center"><p className="text-base text-neutral-600">Popular: Almonds, Cashews, Dates...</p></div>
    </div>
  );
};

// =================================================================================
// FINAL HEADER COMPONENT (Main Orchestrator)
// =================================================================================
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen, isSearchOpen]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') { setIsMenuOpen(false); setIsSearchOpen(false); }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) { setShowTopBar(false); }
          else { setShowTopBar(true); }
          setIsScrolled(currentScrollY > 20);
          setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <HeaderStyles />
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "glass backdrop-blur-xl shadow-luxury" : "bg-white/95"}`}>
        <MobileSearchOverlay isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
        <TopBar showTopBar={showTopBar} />
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4 lg:py-5">
            <Logo />
            <DesktopNav />
            <RightActions isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}/>
          </div>
          <MobileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </div>
      </header>
    </>
  );
};

export default Header;

