import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid, List, Star, Heart, Eye, ShoppingCart, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { Listbox } from "@headlessui/react"
import { useLocation, Link } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';

const Products = () => {
    // All your existing state variables are preserved
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [selectedWeight, setSelectedWeight] = useState<number | 'custom'>(500);
    const [customWeight, setCustomWeight] = useState(50);
    const [quantity, setQuantity] = useState(1);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [productsPerPage] = useState(20);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [wishlistMessage, setWishlistMessage] = useState<{ text: string; type: 'success' | 'remove' } | null>(null);
    const [cartMessage, setCartMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [openParentCategory, setOpenParentCategory] = useState<string | number | null>(null);
    
    // All your existing functions and hooks are preserved
    const getCategoryIdsToFilter = (selected: string | number) => {
        if (selected === "all") return categories.map((c) => c.id);
        const parent = categories.find((c) => c.id === selected);
        if (parent?.children?.length > 0) {
            return [parent.id, ...parent.children.map((ch: any) => ch.id)];
        }
        return [selected];
    };

    useEffect(() => {
        const isModalOpen = showQuantityModal || wishlistMessage || cartMessage;
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showQuantityModal, wishlistMessage, cartMessage]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });

            if (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
                return;
            }

            const parentCategories = data.filter((cat: any) => !cat.parent_id);
            const childCategories = data.filter((cat: any) => cat.parent_id);

            const categoriesTree = parentCategories.map((parent: any) => ({
                ...parent,
                children: childCategories.filter((child: any) => child.parent_id === parent.id),
            }));

            setCategories([{ id: "all", name: "All Products", children: [] }, ...categoriesTree]);
        };
        fetchCategories();
    }, []);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const categoryIdParam = params.get("categoryId");

    useEffect(() => {
        if (categoryIdParam) {
            setSelectedCategory(Number(categoryIdParam));
        }
    }, [categoryIdParam]);

    const weightOptions = [
        { label: '200g', value: 200 },
        { label: '250g', value: 250 },
        { label: '500g', value: 500 },
        { label: '1 kg', value: 1000 }
    ];

    useEffect(() => {
        setSearchParams({ page: currentPage.toString() });
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [currentPage, setSearchParams]);

    const handlePageChange = (page: number) => {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        const newPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(newPage);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (newCategory: string | number) => {
        setSelectedCategory(newCategory);
        setCurrentPage(1);
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPriceRange([priceRange[0], parseInt(event.target.value)]);
        setCurrentPage(1);
    };

    const handleSortByChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSelectedCategory("all");
        setSortBy("featured");
        setPriceRange([0, 10000]);
        setSearchTerm('');
        setCurrentPage(1);
    };

    // --- MAIN MODIFICATION AREA 1 ---
    useEffect(() => {
        const fetchProductsAndWishlist = async () => {
            setLoading(true);
            try {
                const categoryIds = getCategoryIdsToFilter(selectedCategory);

                let query = supabase
                    .from('products')
                    .select('*', { count: 'exact' })
                    // --- CHANGE 1: CRITICAL FILTER ADDED ---
                    // This ensures that only products marked as 'is_active' in the database
                    // are ever fetched for the customer-facing page.
                    .eq('is_active', true)
                    .ilike('name', `%${searchTerm}%`)
                    .gte('price', priceRange[0])
                    .lte('price', priceRange[1]);

                if (selectedCategory !== 'all' && categoryIds.length > 0) {
                    query = query.in('category_id', categoryIds);
                }

                if (sortBy === 'price-low') query = query.order('price', { ascending: true });
                else if (sortBy === 'price-high') query = query.order('price', { ascending: false });
                else if (sortBy === 'rating') query = query.order('rating', { ascending: false });
                else if (sortBy === 'newest') query = query.order('created_at', { ascending: false });

                const { data: productsData, count, error } = await query.range(
                    (currentPage - 1) * productsPerPage,
                    currentPage * productsPerPage - 1
                );

                if (error) {
                    console.error('Error fetching products:', error.message);
                    setProducts([]);
                    setTotalProducts(0);
                } else {
                    setProducts(productsData || []);
                    setTotalProducts(count || 0);
                }

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: wishlist } = await supabase
                        .from('wishlists')
                        .select('product_id')
                        .eq('user_id', user.id);

                    if (wishlist) {
                        setWishlistIds(wishlist.map((w) => w.product_id));
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setProducts([]);
                setTotalProducts(0);
            }
            setLoading(false);
        };

        fetchProductsAndWishlist();
    }, [currentPage, selectedCategory, searchTerm, priceRange, sortBy]);

    // All your existing handler functions are preserved
    const toggleWishlist = async (productId: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = "/auth?message=loginRequired&redirect=/products";
            return;
        }
        const isInWishlist = wishlistIds.includes(productId);
        if (isInWishlist) {
            await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
            setWishlistIds((prev) => prev.filter((id) => id !== productId));
            setWishlistMessage({ text: "Item removed from wishlist ❌", type: "remove" });
        } else {
            const { error } = await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
            if (!error) {
                setWishlistIds((prev) => [...prev, productId]);
                setWishlistMessage({ text: "Item added to wishlist ✅", type: "success" });
            }
        }
        setTimeout(() => setWishlistMessage(null), 3000);
    };

    const handleAddCartDirect = async (product: any, qty: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = "/auth?message=loginRequired&redirect=/products";
            return;
        }
        const weightValue = product.measurement_unit === 'pieces' ? (product.default_piece_weight ? product.default_piece_weight : 'default') : null;
        const unitPrice = product.measurement_unit === 'kilograms' ? Math.round((product.price / 1000) * (product.default_weight || 500)) : product.price;
        const { error } = await supabase.from("cart").upsert({ user_id: user.id, product_id: product.id, quantity: qty, weight: weightValue, unit_price: unitPrice });
        if (error) {
            setCartMessage({ text: "❌ Failed to add item to cart", type: "error" });
        } else {
            setCartMessage({ text: "✅ Item added to cart successfully!", type: "success" });
        }
        setTimeout(() => setCartMessage(null), 3000);
    };

    const handleAddCart = async () => {
        if (!selectedProduct) return;
        const qty = quantity > 0 ? quantity : 1;
        let weight: string;
        if (selectedProduct.measurement_unit === 'pieces') {
            weight = selectedProduct.default_piece_weight ? selectedProduct.default_piece_weight : 'default';
        } else if (selectedWeight === 'custom') {
            weight = customWeight.toString();
        } else {
            weight = selectedWeight.toString();
        }
        const unitPrice = selectedProduct.measurement_unit === 'kilograms' ? Math.round((selectedProduct.price / 1000) * (selectedWeight === 'custom' ? customWeight : selectedWeight as number)) : selectedProduct.price;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            localStorage.setItem("pendingProduct", JSON.stringify({ id: selectedProduct.id, quantity: qty, weight, name: selectedProduct.name, price: selectedProduct.price, image: selectedProduct.image }));
            window.location.href = "/auth?message=loginRequired&redirect=/products";
            return;
        }
        console.log('Upserting cart item with weight:', weight);
        const { error } = await supabase.from("cart").upsert({ user_id: user.id, product_id: selectedProduct.id, quantity: qty, weight, unit_price: unitPrice });
        if (error) {
            console.error("Error adding to cart:", error);
            setCartMessage({ text: "❌ Failed to add item to cart", type: "error" });
        } else {
            setCartMessage({ text: "✅ Item added to cart successfully!", type: "success" });
        }
        setTimeout(() => setCartMessage(null), 3000);
        setShowQuantityModal(false);
        setSelectedProduct(null);
        setQuantity(1);
        setSelectedWeight(500);
        setCustomWeight(50);
    };

    useEffect(() => {
        if (!sectionRef.current || loading) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0');
                    entry.target.classList.add('animate-slide-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        const cards = sectionRef.current.querySelectorAll('.product-card.opacity-0');
        cards.forEach((card) => {
            observer.observe(card);
        });
        return () => observer.disconnect();
    }, [products, loading]);

    // The entire JSX structure and all its functionality is preserved below.
    return (
        <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white">
            {/* Hero Section */}
            <section
                className={`pt-14 sm:pt-24 sm:pb-12 pb-4 relative`}
                style={{
                    backgroundImage: `
              linear-gradient(to bottom right, rgba(0,0,0,0.7), rgba(250,245,240,0)),
              url('https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/prodherd.jpg')
            `,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-400 mb-6">
                            Premium <span className="tamoor-gradient font-extrabold font-serif">TAMOOR</span> Collection
                        </h1>
                        <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed font-serif">
                            Discover our complete range of luxury dry fruits and nuts, carefully curated for the finest taste experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters & Search - No changes here */}
            <section className="sticky top-0 lg:top-20 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 py-6 shadow-md rounded-b-2xl">
                {/* ... all your filter UI is exactly the same ... */}
                 <div className="container mx-auto px-4">
       <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-between">
           {/* Search Bar */}
           <div className="w-full lg:flex-1 lg:max-w-md">
               <div className="relative">
                   <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                   <input
                       type="text"
                       placeholder="Search premium dry fruits..."
                       value={searchTerm}
                       onChange={handleSearchChange}
                       className="w-full pl-12 pr-4 py-3 glass rounded-full text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base"
                   />
               </div>
           </div>

           {/* Filter & Grid/List */}
           <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
               <button
                   onClick={() => setShowFilters(!showFilters)}
                   className="flex items-center space-x-2 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-white/20 transition-all duration-300 relative text-sm sm:text-base"
               >
                   <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                   <span className="font-medium">Filters</span>

                   {(selectedCategory !== "all" || sortBy !== "featured" || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                       <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-luxury-gold text-white">
                           Active
                       </span>
                   )}
               </button>

               {(selectedCategory !== "all" || sortBy !== "featured" || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                   <button
                       onClick={handleClearFilters}
                       className="text-sm text-red-500 hover:underline"
                   >
                       Clear All
                   </button>
               )}

               <div className="flex items-center space-x-2 flex-wrap glass rounded-full p-1">
                   <button
                       onClick={() => setViewMode("grid")}
                       className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/20 ${viewMode === "grid" ? "bg-luxury-gold text-white" : "text-neutral-600"
                           }`}
                   >
                       <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                   </button>
                   <button
                       onClick={() => setViewMode("list")}
                       className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/20 ${viewMode === "list" ? "bg-luxury-gold text-white" : "text-neutral-600"
                           }`}
                   >
                       <List className="w-4 h-4 sm:w-5 sm:h-5" />
                   </button>
               </div>
           </div>
       </div>

       {/* Filter Panel */}
       {showFilters && (
           <div className="mt-6 glass rounded-2xl p-4 sm:p-6 flex flex-col shadow-2xl border border-white/30 max-h-[75vh] animate-slide-up">
               
               <div className="flex-1 overflow-y-auto pr-3 -mr-3 space-y-6 md:space-y-0">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       
                       {/* Categories */}
                       <div className="space-y-4">
                           <h3 className="font-display font-semibold text-lg pb-2 border-b border-white/20">Categories</h3>
                           <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                               {categories.map((category) => (
                                   <div key={category.id}>
                                       <div className="flex items-center justify-between">
                                           <button
                                               onClick={() => handleCategoryChange(category.id)}
                                               className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${selectedCategory === category.id ? "bg-luxury-gold text-white" : "hover:bg-white/20"
                                                   }`}
                                           >
                                               {category.name}
                                           </button>
                                           {category.children?.length > 0 && (
                                               <button
                                                   onClick={() =>
                                                       setOpenParentCategory(
                                                           openParentCategory === category.id ? null : category.id
                                                       )
                                                   }
                                                   className="ml-2 text-sm text-neutral-400 hover:text-neutral-600 p-1"
                                               >
                                                   {openParentCategory === category.id ? "▲" : "▼"}
                                               </button>
                                           )}
                                       </div>

                                       {category.children?.length > 0 && openParentCategory === category.id && (
                                           <div className="ml-4 mt-1 space-y-1 pl-3 border-l-2 border-luxury-gold/20">
                                               {category.children.map((child: any) => (
                                                   <button
                                                       key={child.id}
                                                       onClick={() => handleCategoryChange(child.id)}
                                                       className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${selectedCategory === child.id ? "bg-luxury-gold text-white" : "hover:bg-white/10"
                                                           }`}
                                                   >
                                                       {child.name}
                                                   </button>
                                               ))}
                                           </div>
                                       )}
                                   </div>
                               ))}
                           </div>
                       </div>

                       {/* Price & Sort Column */}
                       <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                           {/* Price Range */}
                           <div className="space-y-4">
                               <h3 className="font-display font-semibold text-lg pb-2 border-b border-white/20">Price Range</h3>
                               <div className="pt-2">
                                   <div className="flex items-center justify-between text-sm font-medium">
                                       <span>₹{priceRange[0]}</span>
                                       <span>₹{priceRange[1]}</span>
                                   </div>
                                   <input
                                       type="range"
                                       min="0"
                                       max="10000"
                                       value={priceRange[1]}
                                       onChange={handlePriceChange}
                                       className="w-full mt-2 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                   />
                               </div>
                           </div>

                           {/* Sort By */}
                           <div className="relative space-y-4">
                               <h3 className="font-display font-semibold text-lg pb-2 border-b border-white/20">Sort By</h3>
                               <Listbox value={sortBy} onChange={handleSortByChange}>
                                   <Listbox.Button className="w-full py-3 px-4 glass rounded-lg text-left cursor-pointer text-sm sm:text-base ring-1 ring-inset ring-white/30 hover:ring-luxury-gold/50 transition">
                                       {sortBy === "featured" && "Featured"}
                                       {sortBy === "price-low" && "Price: Low to High"}
                                       {sortBy === "price-high" && "Price: High to Low"}
                                       {sortBy === "rating" && "Highest Rated"}
                                       {sortBy === "newest" && "Newest First"}
                                   </Listbox.Button>
                                   <Listbox.Options className="absolute mt-2 w-full glass rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto text-sm sm:text-base p-2">
                                       <Listbox.Option className="ui-active:bg-luxury-gold/20 ui-active:text-luxury-gold-dark ui-selected:font-bold p-2 rounded-md cursor-pointer" value="featured">Featured</Listbox.Option>
                                       <Listbox.Option className="ui-active:bg-luxury-gold/20 ui-active:text-luxury-gold-dark ui-selected:font-bold p-2 rounded-md cursor-pointer" value="price-low">Price: Low to High</Listbox.Option>
                                       <Listbox.Option className="ui-active:bg-luxury-gold/20 ui-active:text-luxury-gold-dark ui-selected:font-bold p-2 rounded-md cursor-pointer" value="price-high">Price: High to Low</Listbox.Option>
                                       <Listbox.Option className="ui-active:bg-luxury-gold/20 ui-active:text-luxury-gold-dark ui-selected:font-bold p-2 rounded-md cursor-pointer" value="rating">Highest Rated</Listbox.Option>
                                       <Listbox.Option className="ui-active:bg-luxury-gold/20 ui-active:text-luxury-gold-dark ui-selected:font-bold p-2 rounded-md cursor-pointer" value="newest">Newest First</Listbox.Option>
                                   </Listbox.Options>
                               </Listbox>
                           </div>
                       </div>
                   </div>
               </div>

               <div className="pt-4 mt-4 border-t border-white/20 flex-shrink-0">
                   <button
                       onClick={() => setShowFilters(false)}
                       className="w-full py-3 rounded-xl bg-luxury-gold text-white font-semibold shadow-md hover:bg-luxury-gold-dark transition-all duration-300 transform hover:scale-105"
                   >
                       Apply Filters
                   </button>
               </div>
           </div>
       )}
   </div>
            </section>

            {/* Products Grid */}
            <section ref={sectionRef} className="py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex items-center justify-between">
                        <p className="text-neutral-600 font-medium">
                            Showing {(currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center text-neutral-500 py-12 font-medium">Loading products...</div>
                    ) : (
                        <div
                            className={`grid gap-4 ${viewMode === "grid"
                                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
                                : "grid-cols-1"
                                }`}
                        >
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="block"
                                >
                                    <div
                                        className={`product-card luxury-card neomorphism rounded-3xl overflow-hidden group ${viewMode === "list" ? "flex flex-col md:flex-row" : ""
                                            }`}
                                    >
                                        {/* Product Image */}
                                        <div
                                            className={`relative overflow-hidden ${viewMode === "list" ? "md:w-1/3" : ""
                                                }`}
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className={`w-full ${viewMode === "list"
                                                    ? "h-40 md:h-full object-cover"
                                                    : "h-40 sm:h-56 md:h-72 object-cover"
                                                    } sm:group-hover:scale-110 transition-transform duration-700`}
                                            />

                                            {/* --- CHANGE 2a: OUT OF STOCK BADGE --- */}
                                            {/* This badge will now appear over the image if the product is out of stock */}
                                            {!product.is_in_stock && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg shadow-red-500/50">OUT OF STOCK</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"></div>

                                            <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex flex-col space-y-2 sm:space-y-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-2 sm:group-hover:translate-x-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(product.id);
                                                    }}
                                                    className="p-2 sm:p-3 glass rounded-full hover:bg-white/20 transition-all duration-300"
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistIds.includes(product.id)
                                                            ? "text-red-500 fill-red-500"
                                                            : "text-white hover:text-red-400"
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div
                                            className={`${viewMode === "list"
                                                ? "md:w-2/3 md:pl-6 flex flex-col justify-between"
                                                : "p-4 sm:p-6"
                                                }`}
                                        >
                                            <div className="space-y-2 sm:space-y-3">
                                                <h3 className="font-display font-semibold text-sm sm:text-xl text-neutral-800 group-hover:text-luxury-gold transition-colors duration-300">
                                                    {product.name}
                                                </h3>
                                                <p className="hidden sm:block text-neutral-600 text-sm font-medium">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center text-[10px] sm:text-sm">
                                                    <div className="flex items-center space-x-0.5 sm:space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-2.5 h-2.5 sm:w-4 sm:h-4 ${i < Math.floor(product.rating)
                                                                    ? "text-luxury-gold fill-current"
                                                                    : "text-neutral-300"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="ml-1 sm:ml-3 text-neutral-600 font-medium text-[10px] sm:text-sm">
                                                        {product.rating} ({product.reviews})
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-lg sm:text-2xl font-display font-bold tamoor-gradient">
                                                        ₹{product.price} /{" "}
                                                        {product.measurement_unit === "kilograms" ? "kg" : "pcs"}
                                                    </span>
                                                    <span className="text-sm sm:text-lg text-neutral-400 line-through font-medium">
                                                        ₹{product.original_price}
                                                    </span>
                                                    <span className="text-xs sm:text-sm text-luxury-sage font-semibold bg-luxury-sage/10 px-2 py-1 rounded-full">
                                                        Save ₹{product.original_price - product.price}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* --- CHANGE 2b: CONDITIONAL ADD TO CART BUTTON --- */}
                                            {/* This block now checks `is_in_stock`. If true, it shows your original button. */}
                                            {/* If false, it shows a disabled "Out of Stock" button. */}
                                            {product.is_in_stock ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (product.measurement_unit === "kilograms") {
                                                            setSelectedProduct(product);
                                                            setShowQuantityModal(true);
                                                        } else {
                                                            handleAddCartDirect(product, 1);
                                                        }
                                                    }}
                                                    className="w-full btn-premium text-white py-1 px-0.5 sm:py-4 sm:px-4 rounded-full font-extrabold text-[8px] sm:text-lg flex items-center justify-center gap-1 sm:gap-3 mt-2 sm:mt-4"
                                                >
                                                    <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5" />
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full bg-neutral-300 text-neutral-500 py-1 px-0.5 sm:py-4 sm:px-4 rounded-full font-extrabold text-[8px] sm:text-lg flex items-center justify-center gap-1 sm:gap-3 mt-2 sm:mt-4 cursor-not-allowed"
                                                >
                                                    Out of Stock
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination - No changes here */}
                    {totalProducts > productsPerPage && (
                        <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
                            {/* 'Prev' Button */}
                            <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg border transition-all duration-300 ${
                                currentPage === 1
                                ? "bg-neutral-200 text-neutral-500 cursor-default"
                                : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
                            }`}
                            >
                            Prev
                            </button>

                            {/* Page Number Buttons */}
                            {Array.from({ length: Math.ceil(totalProducts / productsPerPage) }, (_, i) => {
                            const page = i + 1;
                            const totalPages = Math.ceil(totalProducts / productsPerPage);
                            if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                                return (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(page)}
                                    disabled={currentPage === page}
                                    className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                                    currentPage === page
                                        ? "bg-luxury-gold text-white border-luxury-gold cursor-default"
                                        : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
                                    }`}
                                >
                                    {page}
                                </button>
                                );
                            }
                            if (page === currentPage - 3 || page === currentPage + 3) {
                                return <span key={i} className="px-2 text-neutral-400">...</span>;
                            }
                            return null;
                            })}

                            {/* 'Next' Button */}
                            <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
                            className={`px-3 py-1 rounded-lg border transition-all duration-300 ${
                                currentPage === Math.ceil(totalProducts / productsPerPage)
                                ? "bg-neutral-200 text-neutral-500 cursor-default"
                                : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
                            }`}
                            >
                            Next
                            </button>
                        </div>
                        )}
                </div>
            </section>

            {/* All your modals and popups are preserved exactly as they were */}
            {showQuantityModal && selectedProduct && createPortal(
                /* ... your entire modal JSX ... */
                 (() => {
                const grams = selectedWeight === 'custom' ? customWeight : selectedWeight;
                const pricePerGram = selectedProduct.price / 1000;
                const dynamicPrice = Math.round(pricePerGram * grams);
                return (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="glass rounded-3xl p-4 sm:p-8 max-w-md w-full animate-slide-up flex flex-col max-h-[90vh]">

                            <div className="flex-shrink-0 flex items-center justify-between mb-4 sm:mb-6">
                                <h3 className="text-xl sm:text-2xl font-display font-bold text-amber-500">
                                    Select Quantity
                                </h3>
                                <button
                                    onClick={() => setShowQuantityModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                <div className="mb-6">
                                    <img
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                        className="w-full h-32 object-cover rounded-2xl mb-4"
                                    />
                                    <h4 className="font-display font-semibold text-lg text-luxury-gold-light">{selectedProduct.name}</h4>
                                    <p className="text-lime-400 text-sm">{selectedProduct.description}</p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-luxury-gold-light mb-3">
                                            Weight Options
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {weightOptions.map(({ label, value }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setSelectedWeight(value)}
                                                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${selectedWeight === value
                                                            ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                                                            : 'border-neutral-200 hover:border-luxury-gold/50'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setSelectedWeight('custom')}
                                            className={`w-full mt-3 p-3 rounded-lg border-2 transition-all duration-300 ${selectedWeight === 'custom'
                                                    ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                                                    : 'border-neutral-200 hover:border-luxury-gold/50'
                                                }`}
                                        >
                                            Custom Weight (Min 50g)
                                        </button>
                                        {selectedWeight === 'custom' && (
                                            <div className="flex items-center justify-between gap-2 mt-4">
                                                <button
                                                    onClick={() => setCustomWeight(Math.max(50, customWeight - 50))}
                                                    className="p-2 glass rounded-lg hover:bg-white/20"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={customWeight}
                                                    onChange={(e) => setCustomWeight(Math.max(50, parseInt(e.target.value) || 50))}
                                                    className="flex-1 p-2 glass rounded-lg text-center"
                                                    min="50"
                                                />
                                                <span className="text-sm text-neutral-800">grams</span>
                                                <button
                                                    onClick={() => setCustomWeight(customWeight + 50)}
                                                    className="p-2 glass rounded-lg hover:bg-white/20"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-white/20 mt-4">
                            <div className="text-2xl font-display font-bold tamoor-gradient">
                                ₹{dynamicPrice}
                      </div>
                      <button
                          onClick={handleAddCart}
                          className="btn-premium text-white px-6 py-3 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center group/btn"
                      >
                          <ShoppingCart className="w-5 h-5 mr-2 sm:mr-3 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Add to Cart
                      </button>
                  </div>

              </div>
          </div>
      );
  })(),
  document.getElementById('modal-root')!
            )}
            {wishlistMessage && createPortal(
                 <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none">
                     <div
                         className={`mt-32 px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold animate-slide-up transition-all duration-300 ${wishlistMessage.type === "success" ? "bg-green-500" : "bg-red-500"
                             } text-white`}
                     >
                         {wishlistMessage.text}
                     </div>
                 </div>,
                 document.getElementById('modal-root')!
            )}
            {cartMessage && createPortal(
                 <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none">
                     <div
                         className={`mt-32 px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold animate-slide-up transition-all duration-300 ${cartMessage.type === "success" ? "bg-green-500" : "bg-red-500"
                             } text-white`}
                     >
                         {cartMessage.text}
                     </div>
                 </div>,
                 document.getElementById('modal-root')!
            )}
        </div>
    );
};

export default Products;
