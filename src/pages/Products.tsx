import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Filter, Grid, List, Star, Heart, Eye, ShoppingCart, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { Listbox } from "@headlessui/react"
import { useLocation, Link , useNavigate } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import godivab from '../assets/proher/godivab.webp';
import butlers from '../assets/proher/butlers.webp';
import cadbury from '../assets/proher/cadbury.webp';
import chocolate from '../assets/proher/choc3.webp';
import ferrero from '../assets/proher/Ferrero.webp';
import gifting from '../assets/proher/Gifting.webp';
import hershey from '../assets/proher/hers.webp';
import kinder from '../assets/proher/kinder.webp';
import kunafa from '../assets/proher/kun.webp';
import lindt from '../assets/proher/Lindt.webp';
import milka from '../assets/proher/Milka.webp';
import mrbeast from '../assets/proher/mr.webp';
import reeses from '../assets/proher/Reese.webp';
import rhine from '../assets/proher/rhime.webp';
import toblerone from '../assets/proher/Toblerone.webp';
import wedel from '../assets/proher/wedel.webp';
import white from '../assets/proher/whit.webp';
import { Helmet } from 'react-helmet-async'; // <-- 1. Import Helmet



    // 1. Define the structure of a single banner
    interface BannerConfig {
    image: string;
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    subtitle: string;
    }

    // 2. Define the map. It MUST have a 'default', and can have any other string key
    type BannerMap = {
    default: BannerConfig;
    [key: string]: BannerConfig; // This line fixes your 'implicit any' error
    }

    // 3. Now, apply this type to your constant
    const categoryBanners: BannerMap = {
    default: {
        image: "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/prodherd%20(1).webp",
        titlePrefix: "Premium",
        titleHighlight: "TAMOOR",
        titleSuffix: "Collection",
        subtitle: "Discover our complete range of luxury dry fruits and nuts..."
    },
    "Dry Fruits": { 
        image: "https://example.com/your-dry-fruits-banner.webp", // <-- UPDATE THIS URL
        titlePrefix: "Our Finest",
        titleHighlight: "Dry Fruits",
        titleSuffix: "",
        subtitle: "Handpicked and curated for the finest taste experience."
    },
    "Godiva": {
        image: godivab, // <-- UPDATE THIS URL
        titlePrefix: "Luxurious",
        titleHighlight: "Chocolates",
        titleSuffix: "by TAMOOR",
        subtitle: "Indulge in our decadent, handcrafted chocolate collection."
    },
    "Toblerone": {
        image: toblerone, // <-- UPDATE THIS URL
        titlePrefix: "Luxurious",
        titleHighlight: "Chocolates",
        titleSuffix: "by TAMOOR",
        subtitle: "Indulge in our decadent, handcrafted chocolate collection."
    },
    "Lindt": {
        image: lindt, // <-- UPDATE THIS URL
        titlePrefix: "",
        titleHighlight: "",
        titleSuffix: "",
        subtitle: ""
    },
    "Chocolates": {
        image: chocolate, // <-- UPDATE THIS URL
        titlePrefix: "Luxurious",
        titleHighlight: "Chocolates",
        titleSuffix: "by TAMOOR",
        subtitle: "Indulge in our decadent, handcrafted chocolate collection."
    },
    };

const Products = () => {
    // All your existing state variables are preserved
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(() => {
        return sessionStorage.getItem('tamoor_searchTerm') || '';
    });
    //const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
    const [priceRange, setPriceRange] = useState(() => {
        const saved = sessionStorage.getItem('tamoor_priceRange');
        try {
            // Parse the saved JSON, or default
            return saved ? JSON.parse(saved) : [0, 10000];
        } catch (e) {
            return [0, 10000];
        }
    });
    const [sortBy, setSortBy] = useState(() => {
        return sessionStorage.getItem('tamoor_sortBy') || 'featured';
    });
    const [viewMode, setViewMode] = useState(() => {
        return sessionStorage.getItem('tamoor_viewMode') || 'grid';
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [selectedWeight, setSelectedWeight] = useState<number | 'custom'>(1000);
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
    const [openParentCategories, setOpenParentCategories] = useState<number[]>(() => {
        const saved = sessionStorage.getItem('tamoor_openParentCategories');
        try {
            // Parse the saved JSON, or default to an empty array
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const navigate = useNavigate();
    
    
    // All your existing functions and hooks are preserved
    const getCategoryIdsToFilter = (selected: string | number) => {
        if (selected === "all") return categories.map((c) => c.id);
        const parent = categories.find((c) => c.id === selected);
        if (parent?.children?.length > 0) {
            return [parent.id, ...parent.children.map((ch: any) => ch.id)];
        }
        return [selected];
    };

    // 4. Then define your state (as shown in Fix 1)
    const [currentBanner, setCurrentBanner] = useState(categoryBanners.default);
    

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

    {/*
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const categoryIdParam = params.get("categoryId");

    useEffect(() => {
        if (categoryIdParam) {
            setSelectedCategory(Number(categoryIdParam));
        }
    }, [categoryIdParam]);
        */}

    // 💡 The main fix is right here.
// Read the URL parameter immediately.
    //const [searchParams] = useSearchParams();
    // ...
    const categoryIdParam = searchParams.get("categoryId");

    // --- 1. CHANGE: From single state to array state ---
    const [selectedCategories, setSelectedCategories] = useState<number[]>(() => {
        // 1. Priority: A new category ID from the URL
        if (categoryIdParam) {
            return [Number(categoryIdParam)]; 
        }
        
        // 2. Priority: User's last saved session
        const saved = sessionStorage.getItem('tamoor_selectedCategories');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
        
        // 3. Default: Empty array (All Products)
    });


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

    const handleCategoryChange = (categoryInput: any | "all") => {
        // Handle the "All Products" button separately
        if (categoryInput === "all") {
            setSelectedCategories([]);
            setCurrentPage(1);
            return;
        }

        // --- NEW LOGIC FOR PARENT/CHILD SELECTION ---

        // Find the category object that was clicked (including searching within children)
        // This assumes your `categories` state is an array of parent categories,
        // where each parent might have a `children` array.
        const findCategoryById = (idToFind: number): any | undefined => {
            for (const parent of categories) {
                if (parent.id === idToFind) return parent;
                if (parent.children) {
                    const child = parent.children.find((ch: any) => ch.id === idToFind);
                    if (child) return child;
                }
            }
            return undefined; // Should not happen if categoryInput.id is valid
        };

        const clickedCategory = findCategoryById(categoryInput.id);

        if (!clickedCategory) {
            console.error("Clicked category not found in state:", categoryInput);
            return;
        }

        const categoryId = clickedCategory.id;
        // Check if the clicked category *itself* has children in the main categories state
        const parentCategoryData = categories.find(c => c.id === categoryId);
        const childIds = parentCategoryData?.children?.map((child: any) => child.id) || [];
        const isParent = childIds.length > 0;

        setSelectedCategories((prevSelected) => {
            const isCurrentlySelected = prevSelected.includes(categoryId);
            // Determine the action: should we select (add) or deselect (remove)?
            // If it's a parent, base the action on the parent's current state.
            // If it's a child, base the action on the child's current state.
            const shouldSelect = !isCurrentlySelected;

            let newSelected = [...prevSelected];

            if (isParent) {
                // It's a parent category
                const idsToToggle = [categoryId, ...childIds];
                if (shouldSelect) {
                    // Add parent and all children (avoid duplicates)
                    idsToToggle.forEach(id => {
                        if (!newSelected.includes(id)) {
                            newSelected.push(id);
                        }
                    });
                } else {
                    // Remove parent and all children
                    newSelected = newSelected.filter(id => !idsToToggle.includes(id));
                }
            } else {
                // It's a child category or a category with no children
                if (isCurrentlySelected) { // Same as !shouldSelect for non-parents
                    // Remove just this one
                    newSelected = newSelected.filter((item) => item !== categoryId);
                } else {
                    // Add just this one
                    newSelected.push(categoryId);
                }
            }

            return newSelected;
        });

        setCurrentPage(1);
    };

    const toggleParentCategory = (parentId: number) => {
        setOpenParentCategories((prevOpen) => {
            const isOpen = prevOpen.includes(parentId);
            if (isOpen) {
                // If it's open, close it by removing the ID
                return prevOpen.filter((id) => id !== parentId);
            } else {
                // Otherwise, open it by adding the ID
                return [...prevOpen, parentId];
            }
        });
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
        // --- MODIFICATION 3: Add resets for new tracked states ---
        setSelectedCategories([]);
        setSortBy("featured");
        setPriceRange([0, 10000]);
        setSearchTerm('');
        setViewMode('grid'); // Reset view mode
        setOpenParentCategories([]); // Reset open categories
        // --- END OF MODIFICATION 3 ---
        
        setCurrentPage(1);
    };

    useEffect(() => {
        sessionStorage.setItem('tamoor_searchTerm', searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        // We must stringify arrays
        sessionStorage.setItem('tamoor_priceRange', JSON.stringify(priceRange));
    }, [priceRange]);

    useEffect(() => {
        sessionStorage.setItem('tamoor_sortBy', sortBy);
    }, [sortBy]);

    useEffect(() => {
        sessionStorage.setItem('tamoor_viewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        // We must stringify arrays
        sessionStorage.setItem('tamoor_selectedCategories', JSON.stringify(selectedCategories));
    }, [selectedCategories]);

    useEffect(() => {
        // We must stringify arrays
        sessionStorage.setItem('tamoor_openParentCategories', JSON.stringify(openParentCategories));
    }, [openParentCategories]);

    
    const pageTitle = useMemo(() => {
        if (selectedCategories.length > 0 && categories.length > 0) {
            // Try to find the name of the first selected category
            let firstCatName = 'Products'; // Default if not found
            for (const parent of categories) {
                if (parent.id === selectedCategories[0]) {
                    firstCatName = parent.name;
                    break;
                }
                if (parent.children) {
                    const child = parent.children.find((c: any) => c.id === selectedCategories[0]);
                    if (child) {
                        firstCatName = child.name; // Use child name if child is selected
                        break;
                    }
                }
            }
             // Ensure "All Products" isn't used in title
            if (firstCatName === "All Products") firstCatName = 'Dry Fruits & Nuts';
            return `Shop Premium ${firstCatName} Online | TAMOOR`;
        }
        return 'Shop Premium Dry Fruits, Nuts & Chocolates Online | TAMOOR'; // Default title
    }, [selectedCategories, categories]);

    const pageDescription = useMemo(() => {
         if (selectedCategories.length > 0 && categories.length > 0) {
            // You could create more specific descriptions here too
             let firstCatName = 'selected items';
             // (Similar logic as pageTitle to find the category name)
             for (const parent of categories) { /* ... find name ... */ if(parent.id === selectedCategories[0]){firstCatName = parent.name; break;} if(parent.children){ const child = parent.children.find((c:any) => c.id === selectedCategories[0]); if(child){firstCatName = child.name; break;}} }
              if (firstCatName === "All Products") firstCatName = 'premium dry fruits, nuts, and chocolates';
             return `Explore and buy the finest ${firstCatName} online at TAMOOR. Premium quality, delivered across India from Bangalore & Kolar.`;
         }
        return 'Discover and shop TAMOOR\'s wide collection of premium dry fruits, nuts, almonds, dates, chocolates, and more. Freshness delivered India-wide from Bangalore & Kolar.'; // Default description
    }, [selectedCategories, categories]);

   // --- CORRECTED useEffect hook for fetching products (combining approaches) ---
  useEffect(() => {
    const fetchProductsAndWishlist = async () => {
      setLoading(true);
      try {
        let queryBuilder;

        // --- 1. Set up the base query based on whether category filter is active ---
        if (selectedCategories.length > 0) {
          // *** FILTERING BY CATEGORY: Use INNER JOIN syntax ***
          console.log("Fetching WITH category filter:", selectedCategories);
          queryBuilder = supabase
            .from('products')
            // Select product columns AND force inner join for filtering
            .select('*, product_categories!inner(category_id)', { count: 'exact' })
            // Apply the category filter on the joined table
            .in('product_categories.category_id', selectedCategories);
        } else {
          // *** NOT FILTERING BY CATEGORY: Use LEFT JOIN syntax to get category IDs ***
          console.log("Fetching WITHOUT category filter (getting category IDs)");
          queryBuilder = supabase
            .from('products')
            // Select product columns AND related category IDs (optional join)
            .select(`
              *,
              product_categories ( category_id )
            `, { count: 'exact' });
        }

        // --- 2. Chain ALL OTHER filters onto the established queryBuilder ---
        queryBuilder = queryBuilder
          .eq('is_active', true) // Filter active products
          .ilike('name', `%${searchTerm}%`) // Filter by search term
          .gte('price', priceRange[0]) // Filter by min price
          .lte('price', priceRange[1]); // Filter by max price

        // --- 3. Apply Sorting ---
        if (sortBy === 'featured') {
          queryBuilder = queryBuilder.order('priority', { ascending: true, nullsFirst: false })
                                     .order('created_at', { ascending: false });
        } else if (sortBy === 'price-low') {
          queryBuilder = queryBuilder.order('price', { ascending: true });
        } else if (sortBy === 'price-high') {
          queryBuilder = queryBuilder.order('price', { ascending: false });
        } else if (sortBy === 'rating') {
          queryBuilder = queryBuilder.order('rating', { ascending: false });
        } else if (sortBy === 'newest') {
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
        }

        // --- 4. Apply Range and Execute ---
        console.log("DEBUG: Executing query for page", currentPage);
        const { data: productsData, count, error } = await queryBuilder.range(
          (currentPage - 1) * productsPerPage,
          currentPage * productsPerPage - 1
        );

        console.log("DEBUG: Supabase response:", { productsData, count, error });

        if (error) {
          console.error('Error fetching products:', error.message);
          // Check specifically for PostgREST filtering error if join syntax was wrong
          if (error.code === '42P01' || error.message.includes("relation") || error.message.includes("does not exist")) {
             console.error("Potential issue with Supabase join/filter syntax.");
          }
          setProducts([]);
          setTotalProducts(0);
        } else {
          // Data should now have categories when needed (either via inner or left join)
          console.log("Fetched Products Data Sample:", productsData ? productsData[0] : 'No data');
          setProducts(productsData || []);
          setTotalProducts(count || 0);
        }

        // --- Fetch Wishlist (Remains the same) ---
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

      } catch (err: any) {
        console.error('Error in fetchProductsAndWishlist:', err.message || err);
        setProducts([]);
        setTotalProducts(0);
      }
      setLoading(false);
    };

    fetchProductsAndWishlist();
    // Dependency array remains the same
  }, [currentPage, selectedCategories, searchTerm, priceRange, sortBy, productsPerPage]);

    // All your existing handler functions are preserved
    const toggleWishlist = async (productId: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            //window.location.href = "/auth?message=loginRequired&redirect=/products";
            navigate("/auth?message=loginRequired&redirect=/products");
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
            //window.location.href = "/auth?message=loginRequired&redirect=/products";
            navigate("/auth?message=loginRequired&redirect=/products");
            return;
        }
        const weightValue = product.measurement_unit === 'pieces' ? (product.default_piece_weight ? product.default_piece_weight : 'default') : null;
        const unitPrice = product.measurement_unit === 'kilograms' ? Math.round((product.price / 1000) * (product.default_weight || 1000)) : product.price;
        const { error } = await supabase.from("cart").upsert({ user_id: user.id, product_id: product.id, quantity: qty, weight: weightValue, unit_price: unitPrice });
        if (error) {
            setCartMessage({ text: "❌ Failed to add item to cart", type: "error" });
        } else {
            setCartMessage({ text: "✅ Item added to cart successfully!", type: "success" });
            window.dispatchEvent(new Event('cartUpdated'));
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
            //window.location.href = "/auth?message=loginRequired&redirect=/products";
            navigate("/auth?message=loginRequired&redirect=/products");
            return;
        }
        console.log('Upserting cart item with weight:', weight);
        const { error } = await supabase.from("cart").upsert({ user_id: user.id, product_id: selectedProduct.id, quantity: qty, weight, unit_price: unitPrice });
        if (error) {
            console.error("Error adding to cart:", error);
            setCartMessage({ text: "❌ Failed to add item to cart", type: "error" });
        } else {
            setCartMessage({ text: "✅ Item added to cart successfully!", type: "success" });
            window.dispatchEvent(new Event('cartUpdated')); // <-- ADD THIS LINE
        }
        setTimeout(() => setCartMessage(null), 3000);
        setShowQuantityModal(false);
        setSelectedProduct(null);
        setQuantity(1);
        setSelectedWeight(1000);
        setCustomWeight(50);
    };

/*
useEffect(() => {
    // Don't run if categories haven't loaded
    if (categories.length === 0) return;

    // 1. Handle case with no selection -> Default banner
    if (selectedCategories.length === 0) {
      setCurrentBanner(categoryBanners.default);
      return; // Exit early
    }

    // A category IS selected, get the first one
    const firstSelectedId = selectedCategories[0];

    // Helper function to find the exact category (parent or child) by ID
    const findExactCategoryById = (idToFind: number): any | null => {
      for (const parent of categories) {
        // Check if it's the parent itself
        if (parent.id === idToFind) {
          return parent;
        }
        // Check if it's one of the children
        if (parent.children) {
          const child = parent.children.find((c: any) => c.id === idToFind);
          if (child) {
            return child; // Return the actual child object
          }
        }
      }
      return null; // Category not found
    };

     // Helper function to find the parent category given a child ID
     const findParentCategory = (childId: number): any | null => {
         for (const parent of categories) {
             // Check if this parent contains the childId in its children array
             if (parent.children && parent.children.some((c: any) => c.id === childId)) {
                 return parent; // Return the parent object
             }
         }
         return null; // No parent found (or it's a top-level category)
     };

    // Find the actual selected category object (could be parent or child)
    const exactCategory = findExactCategoryById(firstSelectedId);

    let bannerToSet = categoryBanners.default; // Start with the default

    if (exactCategory) {
      // Priority 1: Check for a banner matching the exact category's name
      if (categoryBanners[exactCategory.name]) {
        bannerToSet = categoryBanners[exactCategory.name];
        console.log(`Banner found for exact category: ${exactCategory.name}`);
      } else {
        // Priority 2: If no exact match, find the parent
        const parentCategory = findParentCategory(firstSelectedId);
        if (parentCategory && categoryBanners[parentCategory.name]) {
          // Use the parent's banner if it exists
          bannerToSet = categoryBanners[parentCategory.name];
          console.log(`No exact banner for ${exactCategory.name}, using parent banner: ${parentCategory.name}`);
        } else {
             console.log(`No banner found for ${exactCategory.name} or its parent, using default.`);
             // If no parent banner either, it remains the default set above
        }
      }
    } else {
         console.log(`Selected category ID ${firstSelectedId} not found, using default banner.`);
         // Category ID wasn't found in our list, use default
    }

    // Set the determined banner
    setCurrentBanner(bannerToSet);

  // Add categoryBanners as a dependency since the logic reads from it
  }, [selectedCategories, categories, categoryBanners]);

  */

  // --- NEW Banner Logic based on Current Page Products ---
  // --- Refactored Banner Logic (Prioritizing Child Categories) ---

// --- FINAL Combined Banner Logic (Replaces both maps and the old effect) ---
  useEffect(() => {
    // Don't run if categories haven't loaded
    if (categories.length === 0) {
       // If categories aren't loaded, just ensure default
       if (currentBanner.image !== categoryBanners.default.image) {
          setCurrentBanner(categoryBanners.default);
       }
       return;
    }

    let bannerToSet = categoryBanners.default; // Start with default
    let bannerSet = false;

    // --- LOGIC 1: Handle FILTER-BASED selection (FAST) ---
    if (selectedCategories.length > 0) {
      console.log("Running FAST banner logic (filter selected)");
      const firstSelectedId = selectedCategories[0];

      // Helper function to find the exact category (parent or child) by ID
      const findExactCategoryById = (idToFind: number): any | null => {
        for (const parent of categories) {
          if (parent.id === idToFind) return parent;
          if (parent.children) {
            const child = parent.children.find((c: any) => c.id === idToFind);
            if (child) return child;
          }
        }
        return null;
      };

      // Helper function to find the parent category given a child ID
      const findParentCategory = (childId: number): any | null => {
        for (const parent of categories) {
          if (parent.children && parent.children.some((c: any) => c.id === childId)) {
            return parent;
          }
        }
        return null;
      };

      const exactCategory = findExactCategoryById(firstSelectedId);

      if (exactCategory) {
        // Priority 1: Check for a banner matching the exact category's name
        if (categoryBanners[exactCategory.name]) {
          bannerToSet = categoryBanners[exactCategory.name];
          bannerSet = true;
          console.log(`Filter logic: Setting banner for exact category: ${exactCategory.name}`);
        } else {
          // Priority 2: If no exact match, find the parent
          const parentCategory = findParentCategory(firstSelectedId);
          if (parentCategory && categoryBanners[parentCategory.name]) {
            bannerToSet = categoryBanners[parentCategory.name];
            bannerSet = true;
            console.log(`Filter logic: No exact banner, setting for parent: ${parentCategory.name}`);
          }
        }
      }
    } 
    // --- LOGIC 2: Handle PAGE-CONTENT analysis (SLOWER) ---
    else if (!loading && products.length > 0) {
      // Only run this if NOT loading and products exist
      console.log("Running SLOW banner logic (no filter, analyzing products)");

      // --- Build maps *inside* this branch, only when needed ---
      const categoryIdToParentIdMap: Record<number, number | null> = {};
      const categoryIdToObjectMap: Record<number, any> = {};
      
      const addCategoryToMap = (category: any) => {
        if (category && typeof category.id === 'number') {
            categoryIdToObjectMap[category.id] = category;
            if (category.children) {
                category.children.forEach(addCategoryToMap);
            }
        }
      };
      categories.forEach(parent => {
          if (!parent.parent_id) {
              categoryIdToParentIdMap[parent.id] = null; // <-- CORRECTED
              if (parent.children) {
                  parent.children.forEach((child: any) => {
                      if (child && typeof child.id === 'number') {
                          categoryIdToParentIdMap[child.id] = parent.id;
                      }
                  });
              }
          }
          addCategoryToMap(parent); // Build object map at the same time
      });
      // --- End map building ---

      const specificCategoryCounts: Record<number, number> = {};
      const parentCategoryCounts: Record<number, number> = {};

      products.forEach(product => {
        if (Array.isArray(product.product_categories)) {
          product.product_categories.forEach((catRelation: { category_id: number }) => {
            const specificCatId = catRelation?.category_id;
            if (typeof specificCatId === 'number') {
              specificCategoryCounts[specificCatId] = (specificCategoryCounts[specificCatId] || 0) + 1;
              const parentId = categoryIdToParentIdMap[specificCatId];
              if (parentId !== undefined) {
                const idToCount = parentId === null ? specificCatId : parentId;
                parentCategoryCounts[idToCount] = (parentCategoryCounts[idToCount] || 0) + 1;
              }
            }
          });
        }
      });

      console.log("Page Specific Category Counts:", specificCategoryCounts);
      console.log("Page Parent Category Counts:", parentCategoryCounts);
      
      let dominantParentId: number | null = null;
      let maxParentCount = 0;
      for (const categoryIdStr in parentCategoryCounts) {
          const categoryId = parseInt(categoryIdStr, 10);
          const count = parentCategoryCounts[categoryId];
          if (count > maxParentCount) {
              maxParentCount = count;
              dominantParentId = categoryId;
          } else if (count === maxParentCount) {
              dominantParentId = null;
          }
      }

      if (dominantParentId !== null && (maxParentCount / products.length) > 0.5) {
          const dominantParentCategory = categoryIdToObjectMap[dominantParentId];
          console.log(`Dominant Parent Category: ${dominantParentCategory?.name || dominantParentId}`);

          let mostFrequentSpecificIdInGroup: number | null = null;
          let maxSpecificCountInGroup = 0;

          for (const specificIdStr in specificCategoryCounts) {
              const specificId = parseInt(specificIdStr, 10);
              if (specificId === 41) continue; // Skip "Imported"
              
              const count = specificCategoryCounts[specificId];
              const parentIdForSpecific = categoryIdToParentIdMap[specificId];

              if (parentIdForSpecific === dominantParentId || specificId === dominantParentId) {
                  if (count > maxSpecificCountInGroup) {
                      maxSpecificCountInGroup = count;
                      mostFrequentSpecificIdInGroup = specificId;
                  } else if (count === maxSpecificCountInGroup) {
                      mostFrequentSpecificIdInGroup = null;
                  }
              }
          }
          console.log("Most frequent specific ID (excluding 41) in group:", mostFrequentSpecificIdInGroup);

          const chosenSpecificId: number | null = mostFrequentSpecificIdInGroup;

          if (chosenSpecificId !== null) {
              const chosenCategory = categoryIdToObjectMap[chosenSpecificId];
              if (chosenCategory && categoryBanners[chosenCategory.name]) {
                  bannerToSet = categoryBanners[chosenCategory.name];
                  bannerSet = true;
                  console.log(`Content logic: Setting banner for subcategory: ${chosenCategory.name}`);
              }
          }
          
          if (!bannerSet && dominantParentCategory && categoryBanners[dominantParentCategory.name]) {
              bannerToSet = categoryBanners[dominantParentCategory.name];
              bannerSet = true;
              console.log(`Content logic: Setting banner for parent: ${dominantParentCategory.name}`);
          }
      } else {
          console.log("Content logic: No dominance, using default.");
      }
    }
    // --- End Logic 2 ---

    // Final check to prevent re-renders
    if (currentBanner.image !== bannerToSet.image) {
      console.log("Banner needs update. Old:", currentBanner.titleHighlight, "New:", bannerToSet.titleHighlight);
      setCurrentBanner(bannerToSet);
    }

  // This combined effect now correctly depends on all inputs
  }, [selectedCategories, products, categories, loading, currentBanner, categoryBanners]);
  // --- End Refactored Banner Logic ---

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
        <> {/* <-- Use a Fragment to wrap Helmet and your div */}
            {/* --- 2. Add Helmet Component --- */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href="https://www.tamoor.in/products" /> {/* Canonical for the main products page */}

                {/* Open Graph Tags */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content="https://www.tamoor.in/products" />
                <meta property="og:image" content="https://www.tamoor.in/tamoor-og-products.jpg" /> {/* Create a specific OG image for the products page */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="TAMOOR" />


                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://www.tamoor.in/tamoor-twitter-products.jpg" /> {/* Create a specific Twitter image */}
            </Helmet>
            {/* --- End Helmet Component --- */}
        <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white">
            {/* Hero Section */}
            {/* Hero Section */}
            <section
            // Added transition-all for a smooth image change
            className={`pt-6 pb-6 sm:pt-24 sm:pb-12 relative transition-all duration-500`}
            style={{
                backgroundImage: `
                linear-gradient(to bottom right, rgba(0,0,0,0.7), rgba(250,245,240,0)),
                url('${currentBanner.image}')
                `, // <-- USES STATE
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            >
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-1 sm:mb-12">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-neutral-400 mb-1.5 sm:mb-6">
                    {/* USES STATE */}
                    {currentBanner.titlePrefix}{' '}
                    <span className="tamoor-gradient font-extrabold font-serif">
                    {currentBanner.titleHighlight}
                    </span>
                    {' '}{currentBanner.titleSuffix}
                </h1>
                <p className="text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed font-serif">
                    {/* USES STATE */}
                    {currentBanner.subtitle}
                </p>
                </div>
            </div>
            </section>

            {/* Filters & Search - No changes here */}
            <section className="sticky top-0 lg:top-20 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 py-4 sm:py-6 shadow-md rounded-b-2xl">
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

                    {/* --- 1. THIS LINE IS UPDATED --- */}
                    {(selectedCategories.length > 0 || sortBy !== "featured" || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-luxury-gold text-white">
                            Active
                        </span>
                    )}
                </button>

                {/* --- 2. THIS LINE IS ALSO UPDATED --- */}
                {(selectedCategories.length > 0 || sortBy !== "featured" || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Clear All
                    </button>
                )}

                {/* This part was already correct */}
                <div className="flex items-center space-x-2 flex-wrap glass rounded-full p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/20 ${
                            viewMode === "grid"
                                ? "bg-luxury-gold text-green-700"
                                : "text-neutral-600"
                        }`}
                    >
                        <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:bg-white/20 ${
                            viewMode === "list"
                                ? "bg-luxury-gold text-green-700"
                                : "text-neutral-600"
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
                       {/* Categories */}
                        {/* Categories */}
                        <div className="space-y-4">
                            <h3 className="font-display font-semibold text-lg pb-2 border-b border-white/20">Categories</h3>
                            <div className="space-y-1 max-h-64 overflow-y-auto pr-2">

                                {/* Render "All Products" Button (unchanged) */}
                                {categories.filter(c => c.id === 'all').map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryChange("all")}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                                            selectedCategories.length === 0 ? "bg-luxury-gold text-white" : "hover:bg-white/20"
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}

                                {/* Map over actual parent/child categories */}
                                {categories.filter(c => c.id !== 'all').map((category) => (
                                    <div key={category.id} className="pt-1">
                                        {/* --- PARENT CATEGORY ROW --- */}
                                        <div className="flex items-center justify-between">
                                            {/* Checkbox and Name */}
                                            <label className="flex-1 flex items-center space-x-3 px-3 py-1.5 rounded-lg hover:bg-white/20 cursor-pointer mr-2"> {/* Added mr-2 */}
                                                <input
                                                    type="checkbox"
                                                    checked={ /* ... checked logic ... */
                                                        selectedCategories.includes(category.id) ||
                                                        (category.children?.length > 0 && category.children.every((child: any) => selectedCategories.includes(child.id)))
                                                    }
                                                    ref={ /* ... indeterminate ref logic ... */
                                                        el => {
                                                            if (el && category.children?.length > 0) {
                                                                const childIds = category.children.map((child: any) => child.id);
                                                                const selectedChildrenCount = childIds.filter((id: number) => selectedCategories.includes(id)).length;
                                                                el.indeterminate = selectedChildrenCount > 0 && selectedChildrenCount < childIds.length && !selectedCategories.includes(category.id);
                                                            } else if (el) {
                                                                el.indeterminate = false;
                                                            }
                                                        }
                                                    }
                                                    onChange={() => handleCategoryChange(category)}
                                                    className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold border-neutral-300 flex-shrink-0"
                                                />
                                                <span className="text-sm font-medium">
                                                    {category.name}
                                                </span>
                                            </label>

                                            {/* --- EXPAND/COLLAPSE BUTTON (Re-added) --- */}
                                            {category.children?.length > 0 && (
                                                <button
                                                    onClick={() => toggleParentCategory(category.id)} // Use new handler
                                                    className="p-1 text-neutral-400 hover:text-neutral-600 flex-shrink-0" // Added flex-shrink-0
                                                >
                                                    {openParentCategories.includes(category.id) ? "▲" : "▼"} {/* Check if ID is in the array */}
                                                </button>
                                            )}
                                        </div>

                                        {/* --- CONDITIONALLY RENDER CHILD CHECKBOXES (Re-added condition) --- */}
                                        {category.children?.length > 0 && openParentCategories.includes(category.id) && ( // Check if ID is in the array
                                            <div className="ml-4 mt-1 space-y-0.5 pl-3 border-l-2 border-luxury-gold/20">
                                                {category.children.map((child: any) => (
                                                    <label key={child.id} className="flex items-center space-x-3 px-3 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(child.id)}
                                                            onChange={() => handleCategoryChange(child)}
                                                            className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold border-neutral-300 flex-shrink-0"
                                                        />
                                                        <span className="text-sm">
                                                            {child.name}
                                                        </span>
                                                    </label>
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
            <section ref={sectionRef} className="py-6 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-4 sm:mb-8 flex items-center justify-between">
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
                                            {product.is_in_stock && product.badge && (
                                            <div
                                                className={`absolute top-1.5 left-1.5 sm:top-6 sm:left-6 ${ // Positioned tighter to the corner on mobile
                                                product.badge_color || 'bg-luxury-gold'
                                                } text-white px-2 py-0.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold shadow-lg z-10`} // Smaller padding and font on mobile
                                            >
                                                {product.badge}
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
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 text-red-500 ${ // <-- Red border is now the default
                                                            wishlistIds.includes(product.id)
                                                                ? "fill-red-500" // In wishlist: Fill the inside red
                                                                : "fill-transparent hover:fill-red-500" // Not in wishlist: Inside is transparent, but fills red on hover
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

                    {/* Pagination */}
{totalProducts > productsPerPage && (
    <div className="mt-4 flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
        {/* 'Prev' Button (Icon) */}
        <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-300 ${ // <-- Made square
                currentPage === 1
                    ? "bg-neutral-200 text-neutral-500 cursor-default"
                    : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
            }`}
        >
            <ChevronLeft className="w-4 h-4" /> {/* <-- Icon instead of text */}
        </button>

        {/* Page Number Buttons */}
        {Array.from({ length: Math.ceil(totalProducts / productsPerPage) }, (_, i) => {
            const page = i + 1;
            const totalPages = Math.ceil(totalProducts / productsPerPage);

            // Responsive Page Logic
            const showPage =
                page === 1 || // Always show 1
                page === totalPages || // Always show last page
                (page >= currentPage - 1 && page <= currentPage + 1); // Show 3 "middle" pages on mobile

            // These pages will ONLY show on 'sm' screens and up
            const showPageOnDesktop =
                (page >= currentPage - 2 && page <= currentPage + 2);

            // Responsive Ellipsis Logic
            const showEllipsis =
                page === currentPage - 2 || // Show ... before
                page === currentPage + 2;   // Show ... after

            // These ellipsis will ONLY show on 'sm' screens and up
            const showEllipsisOnDesktop =
                page === currentPage - 3 ||
                page === currentPage + 3;

            // --- RENDER LOGIC ---

            // 1. Render pages that are always visible or for desktop
            if (showPage || (showPageOnDesktop)) {
                return (
                    <button
                        key={i}
                        onClick={() => handlePageChange(page)}
                        disabled={currentPage === page}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-300 ${ // <-- Made square
                            currentPage === page
                                ? "bg-luxury-gold text-white border-luxury-gold cursor-default"
                                : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
                        } 
                        ${
                            // Hide -2 and +2 pages on mobile
                            !showPage ? "hidden sm:flex" : "flex"
                        }
                        `}
                    >
                        {page}
                    </button>
                );
            }

            // 2. Render ellipsis for mobile
            if (showEllipsis) {
                return <span key={i} className="px-1 text-neutral-400 sm:hidden">...</span>;
            }

            // 3. Render ellipsis for desktop
            if (showEllipsisOnDesktop) {
                return <span key={i} className="px-1 text-neutral-400 hidden sm:inline">...</span>;
            }
            
            return null;
        })}

        {/* 'Next' Button (Icon) */}
        <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-300 ${ // <-- Made square
                currentPage === Math.ceil(totalProducts / productsPerPage)
                    ? "bg-neutral-200 text-neutral-500 cursor-default"
                    : "bg-white text-neutral-700 border-neutral-300 hover:bg-luxury-gold/10"
            }`}
        >
            <ChevronRight className="w-4 h-4" /> {/* <-- Icon instead of text */}
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
                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                <button
                                                    onClick={() => setCustomWeight(Math.max(50, customWeight - 50))}
                                                    className="p-2 min-w-[60px] glass rounded-lg hover:bg-white/20"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={customWeight}
                                                    onChange={(e) => setCustomWeight(Math.max(50, parseInt(e.target.value) || 50))}
                                                    className="w-[150px] p-2 glass rounded-lg text-center"
                                                    min="50"
                                                />
                                                <span className="text-sm text-neutral-900">grams</span>
                                                <button
                                                    onClick={() => setCustomWeight(customWeight + 50)}
                                                    className="p-2 min-w-[60px] glass rounded-lg hover:bg-white/20"
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
        </>
    );
};

export default Products;
