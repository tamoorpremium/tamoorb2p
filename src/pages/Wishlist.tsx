import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useCart } from '../context/CartContext';
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { setCartItems, cartItems } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [popup, setPopup] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showPopup = (text: string, type: 'success' | 'error' = 'success') => {
    setPopup({ text, type });
    setTimeout(() => setPopup(null), 3000);
  };

  // For weight modal reuse from products page
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | 'custom'>(500);
  const [customWeight, setCustomWeight] = useState(50);

  // Fetch wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setErrorMsg('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('You must be logged in to view your wishlist.');
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            original_price,
            rating,
            reviews,
            image,
            category_id,
            badge,
            badge_color,
            description,
            measurement_unit,
            default_piece_weight
          )
        `)
        .eq('user_id', user.id);
      console.log('WISHLIST RESPONSE:', data, error);

      if (error) {
        setErrorMsg('Failed to load wishlist: ' + error.message);
        setWishlistItems([]);
      } else {
        const formatted = (data || [])
          .filter(w => w.products && (Array.isArray(w.products) ? w.products.length > 0 : true)) // filter out empty or null
          .map(w => {
            // Extract product object safely if it's an array
            const product = Array.isArray(w.products) ? w.products[0] : w.products;

            return {
              id: product.id,
              name: product.name,
              price: product.price,
              original_price: product.original_price,
              rating: product.rating,
              reviews: product.reviews,
              badge: product.badge,
              badge_color: product.badge_color,
              description: product.description,
              image: product.image,
              category: product.category_id,
              measurement_unit: product.measurement_unit,
              default_piece_weight: product.default_piece_weight,
              wishlistId: w.id,
            };
          });

        setWishlistItems(formatted);
      }
      setLoading(false);
    };
    fetchWishlist();
  }, []);

  // Toggle Wishlist (remove or add)
  const toggleWishlist = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      await supabase.from("wishlists").delete().eq("id", existing.id);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      showPopup("✅ Item removed from wishlist", "success");
    } else {
      const { data, error } = await supabase.from("wishlists").insert([{ user_id: user.id, product_id: productId }]).select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            original_price,
            rating,
            reviews,
            image,
            category_id,
            badge,
            badge_color,
            description,
            measurement_unit
          )
        `);
      if (!error && data && data.length > 0) {
        const w = data[0];
        const product = Array.isArray(w.products) ? w.products[0] : w.products;

        // Add a runtime check to make sure product exists and is an object:
        if (!product || typeof product !== 'object') {
          // Handle invalid case (skip)
          return null;
        }

        setWishlistItems(prev => [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            rating: product.rating,
            reviews: product.reviews,
            badge: product.badge,
            badge_color: product.badge_color,
            description: product.description,
            image: product.image,
            category: product.category_id,
            measurement_unit: product.measurement_unit,
            wishlistId: w.id,
          },
        ]);
      }
    }
  };

  // Helper: move product from wishlist to cart in Supabase and update state
  const moveProductFromWishlistToCart = async (product: any, weight: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "/auth?message=loginRequired&redirect=/wishlist";
    return;
  }

  // Delete from wishlist
  await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);

  // Determine weight to store
  const weightToStore = (product.measurement_unit === 'pieces' && product.default_piece_weight)
    ? product.default_piece_weight
    : weight;

  // Calculate unit_price based on weight
  const unitPrice = (product.measurement_unit === 'pieces')
    ? product.price
    : Math.round((product.price / 1000) * Number(weightToStore)); // price per selected grams/kg

  // Upsert into cart with unit_price
  const { error } = await supabase.from('cart').upsert({
    user_id: user.id,
    product_id: product.id,
    quantity: 1,
    weight: weightToStore,
    unit_price: unitPrice, // added
  });

  if (error) {
    showPopup('❌ Failed to move product to cart', 'error');
    console.error('Error moving to cart:', error.message);
    return;
  }

  // Update cart context state
  const exists = cartItems.find(ci => ci.id === product.id && ci.weight === weightToStore);
  if (!exists) {
    setCartItems([...cartItems, {
      id: product.id,
      quantity: 1,
      price: unitPrice,      // updated to reflect weight
      unit_price: unitPrice, // added
      name: product.name,
      image: product.image,
      weight: weightToStore,
    }]);
  }

  // Refresh wishlist state after removal
  setWishlistItems(prev => prev.filter(item => item.id !== product.id));

  showPopup('🛒 Product moved to cart successfully!', 'success');
};


  // Handler called when user clicks "Add to Cart" on wishlist item
  const handleWishlistAddToCart = async (product: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth?message=loginRequired&redirect=/wishlist";
      return;
    }

    // Fetch current cart
    const { data: cartItemsData } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id);

    if (product.measurement_unit === 'kilograms') {
      // Open weight selection modal like in Products page
      setSelectedProduct(product);
      setShowQuantityModal(true);

      // We'll handle adding to cart after user confirms weight in modal
    } else if (product.measurement_unit === 'piece' || product.measurement_unit === 'pieces') {
      // Use actual default_piece_weight when moving to cart
      const actualWeight = product.default_piece_weight || 'default';
      const exists = (cartItemsData || []).some((item) =>
        item.product_id === product.id && item.weight === actualWeight
      );
      if (exists) {
        showPopup("Product already exists in cart", "error");
      } else {
        await moveProductFromWishlistToCart(product, actualWeight);
      }
    } else {
      // fallback, treat as kilograms for safety
      setSelectedProduct(product);
      setShowQuantityModal(true);
    }
  };

  // Function to be called on Quantity Modal confirm (like in products page)
  const handleConfirmWeightAndAddToCart = async () => {
  if (!selectedProduct) return;

  // Determine weight string to save
  let weightStr = '';
  if (selectedProduct.measurement_unit === 'pieces' || selectedProduct.measurement_unit === 'piece') {
    weightStr = selectedProduct.default_piece_weight || 'default';
  } else if (selectedWeight === 'custom') {
    weightStr = customWeight.toString();
  } else {
    weightStr = selectedWeight.toString();
  }

  // Check if already in cart with same weight
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: cartItemsData } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user.id);

  const exists = (cartItemsData || []).some(item =>
    item.product_id === selectedProduct.id && item.weight === weightStr
  );

  if (exists) {
    showPopup("Product already exists with same weight in cart", "error");
    setShowQuantityModal(false);
    setSelectedProduct(null);
    return;
  }

  // Calculate unit_price based on weight
  let unitPrice = selectedProduct.price; // price per kg or per piece
  if (selectedProduct.measurement_unit === 'kilograms' || selectedProduct.measurement_unit === 'grams') {
    const weightNum = weightStr === 'custom' ? customWeight : Number(weightStr);
    unitPrice = Math.round((selectedProduct.price / 1000) * weightNum); // total price for selected weight
  }

  // Move product to cart with unit_price
  await moveProductFromWishlistToCart(selectedProduct, weightStr);

  setShowQuantityModal(false);
  setSelectedProduct(null);
  setSelectedWeight(500);
  setCustomWeight(50);
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">

      {/* Wishlist header and count */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-neutral-800 mb-4">
            My <span className="tamoor-gradient">Wishlist</span>
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {/* Wishlist items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((product, index) => (
            <div
              key={product.id}
              className="luxury-card neomorphism rounded-3xl overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className={`absolute top-6 left-6 ${product.badge_color || 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light'} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}>
                  {product.badge || ''}
                </div>

                <div className="absolute top-6 right-6">
                  <button onClick={() => toggleWishlist(product.id)} className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300">
                    <Heart className={`w-6 h-6 ${wishlistItems.some((w) => w.id === product.id) ? 'text-red-500 fill-red-500' : 'text-red-500'}`} />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="font-display font-semibold text-xl text-neutral-800 mb-3 group-hover:text-luxury-gold transition-colors duration-300">{product.name}</h3>
                <p className="text-neutral-600 text-sm mb-4 font-medium">{product.description}</p>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-luxury-gold fill-current' : 'text-neutral-300'}`} />
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-neutral-600 font-medium">{product.rating} ({product.reviews} reviews)</span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-display font-bold tamoor-gradient">₹{product.price}</span>
                    <span className="text-lg text-neutral-400 line-through font-medium">₹{product.original_price}</span>
                  </div>
                  <div className="text-sm text-luxury-sage font-semibold bg-luxury-sage/10 px-3 py-1 rounded-full">Save ₹{product.original_price - product.price}</div>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => handleWishlistAddToCart(product)} className="flex-1 btn-premium text-white py-3 rounded-full font-semibold text-sm flex items-center justify-center group/btn">
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                    Add to Cart
                  </button>
                  <button onClick={() => toggleWishlist(product.id)} className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all duration-300 hover:scale-110">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity Selection Modal */}
      {showQuantityModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-neutral-800">
                Select Quantity
              </h3>
              <button onClick={() => setShowQuantityModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-all duration-300">
                X
              </button>
            </div>
            <div className="mb-6">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-32 object-cover rounded-2xl mb-4" />
              <h4 className="font-display font-semibold text-lg">{selectedProduct.name}</h4>
              <p className="text-neutral-600">{selectedProduct.description}</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Weight Options</label>
                <div className="grid grid-cols-2 gap-3">
                  {[200, 250, 500, 1000].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedWeight(value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedWeight === value ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' : 'border-neutral-200 hover:border-luxury-gold/50'
                      }`}
                    >
                      {value < 1000 ? `${value}g` : '1 kg'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedWeight('custom')}
                  className={`w-full mt-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                    selectedWeight === 'custom' ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' : 'border-neutral-200 hover:border-luxury-gold/50'
                  }`}
                >
                  Custom Weight (Min 50g)
                </button>
                {selectedWeight === 'custom' && (
                  <div className="mt-3 flex items-center space-x-3">
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
                    <span className="text-sm text-neutral-600">grams</span>
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
                  ₹{Math.round((selectedProduct.price / 1000) * (selectedWeight === 'custom' ? customWeight : selectedWeight as number))}
                </div>
                <button
                  onClick={handleConfirmWeightAndAddToCart}
                  className="w-full btn-premium text-white px-8 py-3 rounded-full font-semibold text-lg flex items-center justify-center group/btn"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className={`fixed inset-0 flex items-start justify-center z-50`}>
          <div className={`mt-32 px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold animate-slide-up transition-all duration-300 ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
            {popup.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
