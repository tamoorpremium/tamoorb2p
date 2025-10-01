import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid, List, Star, Heart, Eye, ShoppingCart, X } from 'lucide-react';
//import { useCart } from '../context/CartContext';
import { supabase } from '../utils/supabaseClient';
import { Listbox } from "@headlessui/react"
import { useLocation, useNavigate, Link } from "react-router-dom";



const Products = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20); // can adjust to 30 if needed
  const [totalProducts, setTotalProducts] = useState(0);

  //const { addToCart } = useCart();


  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistMessage, setWishlistMessage] = useState<{ text: string; type: 'success' | 'remove' } | null>(null);
  const [cartMessage, setCartMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [showBar, setShowBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

 interface Category {
  id: number | string;
  name: string;
  children?: Category[];
}

const [openParentCategory, setOpenParentCategory] = useState<string | number | null>(null);


const getCategoryIdsToFilter = (selected: string | number) => {
  if (selected === "all") return categories.map((c) => c.id);

  // if parent category → include its children
  const parent = categories.find((c) => c.id === selected);
  if (parent?.children?.length > 0) {
    return [parent.id, ...parent.children.map((ch: any) => ch.id)];
  }

  // if subcategory → return just itself
  return [selected];
};




 const [categories, setCategories] = useState<any[]>([]);

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

    // Build hierarchical structure
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
const subcategorySlug = params.get("subcategory");

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

{/*
useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setShowBar(false); // scrolling down → hide
    } else {
      setShowBar(true);  // scrolling up → show
    }
    setLastScrollY(window.scrollY);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);
*/}
  // Fetch products from Supabase

useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, selectedCategory, priceRange, sortBy]);


useEffect(() => {
  const fetchProductsAndWishlist = async () => {
    setLoading(true);

    try {
      // 1️⃣ Build filter conditions
      const categoryIds = getCategoryIdsToFilter(selectedCategory);

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .ilike('name', `%${searchTerm}%`) // search
        .gte('price', priceRange[0])      // min price
        .lte('price', priceRange[1]);     // max price

      // Only apply category filter if categoryIds has values and not "all"
      if (selectedCategory !== 'all' && categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }

      // Optional: add sorting
      if (sortBy === 'price-low') query = query.order('price', { ascending: true });
      else if (sortBy === 'price-high') query = query.order('price', { ascending: false });
      else if (sortBy === 'rating') query = query.order('rating', { ascending: false });
      else if (sortBy === 'newest') query = query.order('created_at', { ascending: false });

      // 2️⃣ Fetch paginated products
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

      // 3️⃣ Fetch wishlist if user is logged in
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
}, [currentPage, selectedCategory, searchTerm, priceRange, sortBy]); // dependencies updated



const toggleWishlist = async (productId: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "/auth?message=loginRequired&redirect=/products";
    return;
  }


  const isInWishlist = wishlistIds.includes(productId);


  if (isInWishlist) {
    // ✅ remove from wishlist
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);


    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    setWishlistMessage({ text: "Item removed from wishlist ❌", type: "remove" });
  } else {
    // ✅ add to wishlist
    const { error } = await supabase.from("wishlists").insert({
      user_id: user.id,
      product_id: productId,
    });


    if (!error) {
      setWishlistIds((prev) => [...prev, productId]);
      setWishlistMessage({ text: "Item added to wishlist ✅", type: "success" });
    }
  }


  // Auto-hide popup after 3s
  setTimeout(() => setWishlistMessage(null), 3000);
};



const calculateUnitPrice = (product: any, weight: number | 'custom', customWeight?: number) => {
  let grams: number;

  if (weight === 'custom') grams = customWeight || 50;
  else grams = weight as number;

  // Convert product price per kg to price per gram
  const pricePerGram = product.price / 1000;
  const unitPrice = Math.round(pricePerGram * grams * 100) / 100; // round to 2 decimals
  return unitPrice;
};



const handleAddCartDirect = async (product: any, qty: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirect to login with message and redirect
    window.location.href = "/auth?message=loginRequired&redirect=/products";
    return;
  }

  const weightValue = product.measurement_unit === 'pieces' 
    ? (product.default_piece_weight ? product.default_piece_weight : 'default') 
    : null;

  // ------------------ ADDED: Calculate dynamic unit price ------------------
  const unitPrice =
    product.measurement_unit === 'kilograms'
      ? Math.round((product.price / 1000) * (product.default_weight || 500)) // default 500g if no weight
      : product.price; // for pieces, use product.price
  // ------------------------------------------------------------------------

  const { error } = await supabase.from("cart").upsert({
    user_id: user.id,
    product_id: product.id,
    quantity: qty,
    weight: weightValue,
    unit_price: unitPrice, // ------------------ ADDED ------------------
  });

  if (error) {
    setCartMessage({ text: "❌ Failed to add item to cart", type: "error" });
  } else {
    setCartMessage({ text: "✅ Item added to cart successfully!", type: "success" });
  }

  setTimeout(() => setCartMessage(null), 3000);
};

// Filter and sort products
const filteredProducts = products
  .filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    let categoryIds: (string | number)[] = [];

    if (selectedCategory === 'all' || selectedCategory === null) {
      categoryIds = []; // no filter on category
    } else {
      categoryIds = getCategoryIdsToFilter(selectedCategory);
    }

    const matchesCategory =
      selectedCategory === 'all' || categoryIds.includes(product.category_id);

    // Price range filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

    // Only include products that match all conditions
    return matchesSearch && matchesCategory && matchesPrice;
  })
  .sort((a, b) => {
    // Sorting logic unchanged
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });



const handleAddCart = async () => {
  if (!selectedProduct) return;

  const qty = quantity > 0 ? quantity : 1;

  // Always assign weight as string
  let weight: string;

  if (selectedProduct.measurement_unit === 'pieces') {
    weight = selectedProduct.default_piece_weight ? selectedProduct.default_piece_weight : 'default';  // use fixed piece weight string or fallback
  } else if (selectedWeight === 'custom') {
    weight = customWeight.toString(); // convert custom numeric weight to string
  } else {
    weight = selectedWeight.toString(); // convert number weight to string
  }

  // ------------------ ADDED: Calculate dynamic unit price ------------------
  const unitPrice =
    selectedProduct.measurement_unit === 'kilograms'
      ? Math.round((selectedProduct.price / 1000) * (selectedWeight === 'custom' ? customWeight : selectedWeight as number))
      : selectedProduct.price; // for pieces, just use product.price
  // ------------------------------------------------------------------------

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    localStorage.setItem(
      "pendingProduct",
      JSON.stringify({
        id: selectedProduct.id,
        quantity: qty,
        weight,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
      })
    );
    window.location.href = "/auth?message=loginRequired&redirect=/products";
    return;
  }

  console.log('Upserting cart item with weight:', weight);

  const { error } = await supabase.from("cart").upsert({
    user_id: user.id,
    product_id: selectedProduct.id,
    quantity: qty,
    weight,
    unit_price: unitPrice, // ------------------ ADDED ------------------
  });

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
  if (!sectionRef.current) return;

  const cards = sectionRef.current.querySelectorAll('.product-card');

  // Make all cards visible immediately (avoids "0 products" issue)
  cards.forEach((card) => {
    card.classList.remove('opacity-0');
    card.classList.add('opacity-100');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.product-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-slide-up');
            }, index * 100);
          });
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(sectionRef.current);

  return () => observer.disconnect();
}, [filteredProducts]);


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


    {/* Filters & Search */}
    <section
      className="sticky top-0 lg:top-20 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 py-6 shadow-md rounded-b-2xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search premium dry fruits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

              {(selectedCategory || sortBy !== "featured" || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-luxury-gold text-white">
                  Active
                </span>
              )}
            </button>

            {(selectedCategory !== "all" || sortBy !== "featured" || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSortBy("featured");
                  setPriceRange([0, 10000]);
                }}
                className="text-sm text-red-500 hover:underline"
              >
                Clear All
              </button>
            )}

            <div className="flex items-center space-x-2 flex-wrap glass rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/20 ${
                  viewMode === "grid" ? "bg-luxury-gold text-white" : "text-neutral-600"
                }`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/20 ${
                  viewMode === "list" ? "bg-luxury-gold text-white" : "text-neutral-600"
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 glass rounded-2xl p-6 flex flex-col overflow-hidden transition-all duration-500 max-h-[70vh] animate-slide-up">
            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                            selectedCategory === category.id ? "bg-luxury-gold text-white" : "hover:bg-white/20"
                          }`}
                        >
                          <span className="font-medium">{category.name}</span>
                        </button>
                        {category.children?.length > 0 && (
                          <button
                            onClick={() =>
                              setOpenParentCategory(
                                openParentCategory === category.id ? null : category.id
                              )
                            }
                            className="ml-2 text-sm text-neutral-400 hover:text-neutral-600"
                          >
                            {openParentCategory === category.id ? "▲" : "▼"}
                          </button>
                        )}
                      </div>

                      {category.children?.length > 0 && openParentCategory === category.id && (
                        <div className="ml-4 mt-1 space-y-1">
                          {category.children.map((child: any) => (
                            <button
                              key={child.id}
                              onClick={() => setSelectedCategory(child.id)}
                              className={`w-full text-left px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                                selectedCategory === child.id ? "bg-luxury-gold text-white" : "hover:bg-white/10"
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

              {/* Price Range */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="relative">
                <h3 className="font-display font-semibold text-lg mb-4">Sort By</h3>
                <Listbox value={sortBy} onChange={setSortBy}>
                  <Listbox.Button className="w-full py-3 px-3 glass rounded-lg text-left cursor-pointer text-sm">
                    {sortBy === "featured" && "Featured"}
                    {sortBy === "price-low" && "Price: Low to High"}
                    {sortBy === "price-high" && "Price: High to Low"}
                    {sortBy === "rating" && "Highest Rated"}
                    {sortBy === "newest" && "Newest First"}
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-2 w-full glass rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto text-sm">
                    <Listbox.Option value="featured">Featured</Listbox.Option>
                    <Listbox.Option value="price-low">Price: Low to High</Listbox.Option>
                    <Listbox.Option value="price-high">Price: High to Low</Listbox.Option>
                    <Listbox.Option value="rating">Highest Rated</Listbox.Option>
                    <Listbox.Option value="newest">Newest First</Listbox.Option>
                  </Listbox.Options>
                </Listbox>
              </div>
            </div>

            {/* Apply button */}
            <div className="pt-4 border-t border-white/20">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 rounded-xl bg-luxury-gold text-white font-semibold shadow-md hover:bg-luxury-gold-dark transition"
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
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="block"
            >
              <div
                className={`product-card luxury-card neomorphism rounded-3xl overflow-hidden group opacity-0 ${
                  viewMode === "list" ? "flex flex-col md:flex-row" : ""
                }`}
              >
                {/* Product Image */}
                <div
                  className={`relative overflow-hidden ${
                    viewMode === "list" ? "md:w-1/3" : ""
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full ${
                      viewMode === "list"
                        ? "h-40 md:h-full object-cover"
                        : "h-40 sm:h-56 md:h-72 object-cover"
                    } sm:group-hover:scale-110 transition-transform duration-700`}
                  />

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
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          wishlistIds.includes(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-white hover:text-red-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="p-2 sm:p-3 glass rounded-full hover:bg-white/20 transition-all duration-300"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div
                  className={`${
                    viewMode === "list"
                      ? "md:w-2/3 md:pl-6 flex flex-col justify-between"
                      : "p-4 sm:p-6"
                  }`}
                >
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-display font-semibold text-sm sm:text-xl text-neutral-800 group-hover:text-luxury-gold transition-colors duration-300">
                      {product.name}
                    </h3>

                    {/* Hide description on mobile */}
                    <p className="hidden sm:block text-neutral-600 text-sm font-medium">
                      {product.description}
                    </p>

                    {/* Stars + rating */}
                    <div className="flex items-center text-[10px] sm:text-sm">
                      <div className="flex items-center space-x-0.5 sm:space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 sm:w-4 sm:h-4 ${
                              i < Math.floor(product.rating)
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

                    {/* Price + original + discount */}
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

                  {/* Add to Cart button */}
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalProducts > productsPerPage && (
        <div className="mt-4 flex justify-center items-center space-x-2">

          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg border transition-all duration-300 ${
              currentPage === 1
                ? "bg-neutral-200 text-neutral-500 cursor-default"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
            }`}
          >
            Prev
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.ceil(totalProducts / productsPerPage) }, (_, i) => {
            const page = i + 1;

            // Show first, last, and pages around current page
            if (page === 1 || page === Math.ceil(totalProducts / productsPerPage) || (page >= currentPage - 2 && page <= currentPage + 2)) {
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(page)}
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

            // Add "..." for skipped pages
            if (page === currentPage - 3 || page === currentPage + 3) {
              return <span key={i} className="px-2 text-neutral-400">...</span>;
            }

            return null;
          })}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(Math.min(Math.ceil(totalProducts / productsPerPage), currentPage + 1))}
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

    {/* Quantity Selection Modal will be continued in the next part */}
        {/* Quantity Selection Modal */}
    {showQuantityModal && selectedProduct && (() => {
      // Convert selectedWeight or customWeight to grams number
      const grams = selectedWeight === 'custom' ? customWeight : selectedWeight;

      // Calculate price per gram and total dynamic price
      const pricePerGram = selectedProduct.price / 1000;
      const dynamicPrice = Math.round(pricePerGram * grams);

      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-amber-500">
                Select Quantity
              </h3>
              <button
                onClick={() => setShowQuantityModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-32 object-cover rounded-2xl mb-4"
              />
              <h4 className="font-display font-semibold text-lg text-luxury-gold-light">{selectedProduct.name}</h4>
              <p className="text-lime-400">{selectedProduct.description}</p>
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
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedWeight === value
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
                  className={`w-full mt-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                    selectedWeight === 'custom'
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                      : 'border-neutral-200 hover:border-luxury-gold/50'
                  }`}
                >
                  Custom Weight (Min 50g)
                </button>
                {selectedWeight === 'custom' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="text-2xl font-display font-bold tamoor-gradient">
                  ₹{dynamicPrice}
                </div>
                <button
                  onClick={handleAddCart}
                  className="w-full btn-premium text-white px-8 py-3 rounded-full font-semibold text-lg flex items-center justify-center group/btn"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Wishlist Message Popup */}
    {wishlistMessage && (
      <div className="fixed inset-0 flex items-start justify-center z-50">
        <div
          className={`mt-32 px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold animate-slide-up transition-all duration-300 ${
            wishlistMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {wishlistMessage.text}
        </div>
      </div>
    )}

    {/* Cart Message Popup */}
    {cartMessage && (
      <div className="fixed inset-0 flex items-start justify-center z-50">
        <div
          className={`mt-32 px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold animate-slide-up transition-all duration-300 ${
            cartMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {cartMessage.text}
        </div>
      </div>
    )}
  </div>
);
};

export default Products;