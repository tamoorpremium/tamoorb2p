import React, { useState, useEffect, useMemo } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, Gift, Truck } from 'lucide-react';
import { useCart, normalizeWeight, Promo } from '../context/CartContext';
import { supabase } from '../utils/supabaseClient';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { Info,CheckCircle2, AlertCircle } from 'lucide-react'; // Added Gift, CheckCircle2, AlertCircle


const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount, setCartItems, refresh , setBilling, promo, setPromo } = useCart();
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const navigate = useNavigate();
  // Promo states
  const [promoCode, setPromoCode] = useState('');
  const [suggestedPromos, setSuggestedPromos] = useState<any[]>([]); // State for suggestions
  const [loadingPromos, setLoadingPromos] = useState(false); // Loading state for suggestions
  const [isFirstOrder, setIsFirstOrder] = useState<boolean | null>(null); // Track if user has previous orders (null = loading/unknown)
  const [loading, setLoading] = useState(false);
  //const [appliedPromo, setAppliedPromo] = useState<any>(null); // full promo object

  const getCartItemPrice = (item: { price: number; weight?: string | null; quantity: number; measurement_unit?: string | null }) => {
  let total = 0;

  if (item.measurement_unit === 'pieces') {
    total = item.price * item.quantity;
  } else if (!item.weight) {
    total = item.price * item.quantity;
  } else {
    const weightStr = item.weight.toLowerCase();
    const grams = parseInt(weightStr.replace(/\D/g, ''), 10);
    const validGrams = isNaN(grams) ? 1000 : grams;
    const pricePerGram = item.price / 1000;
    total = pricePerGram * validGrams * item.quantity;
  }

  return Math.round(total); // ✅ Always returns integer
};


  const displayWeight = (weight: string | undefined, measurementUnit?: string | undefined): string => {
    if (!weight || weight === 'default') return measurementUnit === 'pieces' ? 'piece' : '';
    if (measurementUnit === 'pieces') {
      const grams = parseInt(weight, 10);
      return isNaN(grams) ? 'piece' : `${grams} g`;
    }
    if (weight.toLowerCase().includes('g') || weight.toLowerCase().includes('kg')) return weight;
    if (measurementUnit === 'kilograms') {
      const grams = parseInt(weight, 10);
      if (grams < 1000) return `${grams} g`;
      const kgVal = grams / 1000;
      return (kgVal % 1 === 0) ? `${kgVal} kg` : `${kgVal.toFixed(1)} kg`;
    }
    return weight;
  };

  const getLocalCart = (): any[] => {
    const cartString = localStorage.getItem('cart');
    if (!cartString) return [];
    try { return JSON.parse(cartString); } catch { return []; }
  };

  const saveLocalCart = (items: any[]) => localStorage.setItem('cart', JSON.stringify(items));

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) saveLocalCart(cartItems); else localStorage.removeItem('cart');
    })();
  }, [cartItems]);

  const handleRemoveItem = async (id: number, weight: string, measurementUnit?: string) => {
    const normalizedWeight = normalizeWeight(weight, measurementUnit);
    setRemovingItem(id);
    await removeFromCart(id, normalizedWeight, measurementUnit);
    setRemovingItem(null);
    toast.info("Item removed from cart", {autoClose: 2000,});
  };

  const mergeCarts = (localCart: any[], dbCart: any[]) => {
    const merged: Record<string, any> = {};
    function normWeight(w: string | undefined, unit: string | undefined) {
      if (unit === 'pieces') return w?.trim() || 'invalid';
      return w?.trim() || 'default';
    }
    for (const item of dbCart) {
      const key = `${item.product_id}-${normWeight(item.weight, item.measurement_unit)}`;
      merged[key] = { ...item, id: item.product_id, weight: item.weight };
    }
    for (const item of localCart) {
      const key = `${item.id}-${normWeight(item.weight, item.measurement_unit)}`;
      if (merged[key]) merged[key].quantity += item.quantity;
      else merged[key] = { ...item, id: item.id };
    }
    return Object.values(merged);
  };

  useEffect(() => {
    const fetchAndMergeCart = async () => {
      setLoading(true); // Added loading state for cart fetch
      const { data: { user } } = await supabase.auth.getUser();
      const localCart = getLocalCart();

      if (user) {
        setIsFirstOrder(null); // Reset while fetching
        // --- ADDED: Fetch order count ---
        const { count: orderCount, error: orderError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true }) // Only count, don't fetch data
          .eq('user_id', user.id);

        if (orderError) {
            console.error("Error checking order history:", orderError);
            // Decide how to handle this - maybe assume not first order?
            setIsFirstOrder(false); // Safer default
        } else {
            setIsFirstOrder(orderCount === 0);
        }
        // --- END ADDED ---

        // Fetch DB Cart Items
        const { data: dbCartItems, error: cartError } = await supabase
          .from('cart')
          .select('*')
          .eq('user_id', user.id);

        if (cartError) {
          console.error("Error fetching DB cart:", cartError);
          setCartItems(localCart); // Fallback to local
          setLoading(false); // Stop loading on error
          return;
        }

        // Fetch Product Details for DB Cart Items
        let products: any[] = [];
        if (dbCartItems && dbCartItems.length > 0) {
          const productIds = dbCartItems.map(i => i.product_id);
          const { data: prodData, error: prodErr } = await supabase
            .from('products')
            .select('id, name, image, price, measurement_unit, is_in_stock, default_piece_weight') // Added is_in_stock, default_piece_weight
            .in('id', productIds);

          if (!prodErr) products = prodData || [];
          else console.error("Error fetching product details for cart:", prodErr);
        }

        // Merge DB Items with Details
        const dbWithDetails = (dbCartItems || []).map(cartItem => {
          const prod = products.find(p => p.id === cartItem.product_id) || {};
          return { ...cartItem, ...prod, id: cartItem.product_id }; // Ensure 'id' is product_id
        });

        // Merge Local and DB Carts
        const mergedCart = mergeCarts(localCart, dbWithDetails);
        setCartItems(mergedCart);
        localStorage.removeItem('cart'); // Clear local cart after merge

      } else {
        // Not logged in
        setCartItems(localCart);
        setIsFirstOrder(null); // Can't determine first order status
      }
      setLoading(false); // Stop loading after successful fetch/merge
    };

    fetchAndMergeCart();
  // IMPORTANT: setCartItems dependency might cause infinite loops if not memoized in context.
  // If you see issues, remove setCartItems or ensure it's stable in useCart.
  }, [setCartItems]); // Only run once on mount or when auth state changes (implicitly)

  // --- ADDED: Fetch Suggested Promos ---
  useEffect(() => {
    const fetchSuggestedPromos = async () => {
      // Don't fetch if we don't know the first order status yet (for logged-in users)
      // or if user is not logged in and we cannot check first_order_only promos
      // Allow fetching even if logged out, but first_order_only won't apply.
      // if (isFirstOrder === null && (await supabase.auth.getUser()).data.user) return;

      setLoadingPromos(true);
      const now = new Date().toISOString();

      try {
        let query = supabase
          .from('promo_codes')
          .select('*')
          .eq('enabled', true)
          .lte('valid_from', now)
          .gte('valid_to', now);
          // We fetch all potentially valid ones and filter client-side for usage limit and first order

        const { data, error } = await query;

        if (error) throw error;

        let potentialPromos = data || [];

        // Client-side filtering
        potentialPromos = potentialPromos.filter(promo => {
            // Check usage limit
            const usageLimitReached = promo.usage_limit !== null && promo.used_count >= promo.usage_limit;
            if (usageLimitReached) return false;

            // Check first order status ONLY if the user is logged in AND we know their status
            if (promo.first_order_only && isFirstOrder === false) {
                 return false; // User has ordered before, cannot use this
            }
            // If first_order_only is true and isFirstOrder is true or null (logged out), keep it for now.

            return true;
        });

        setSuggestedPromos(potentialPromos);

      } catch (error: any) {
        console.error("Failed to fetch suggested promos:", error);
        // Optionally show a toast, but maybe better to just show none
        setSuggestedPromos([]);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchSuggestedPromos();
  // Re-run if first order status changes (after login/order check)
  }, [isFirstOrder]);
  // --- END FETCH SUGGESTED PROMOS ---

  const handleIncreaseQuantity = (item: any) => {
    updateQuantity(
      item.id,
      normalizeWeight(item.weight, item.measurement_unit),
      item.quantity + 1,
      item.measurement_unit
    );
    toast.success("Quantity increased 🛒", { autoClose: 2000 });
  };

  const handleDecreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      updateQuantity(
        item.id,
        normalizeWeight(item.weight, item.measurement_unit),
        item.quantity - 1,
        item.measurement_unit
      );
      toast.info("Quantity decreased 🛒", { autoClose: 2000 });
    } else {
      toast.error("Minimum 1 item required ⚠️", { autoClose: 2000 });
    }
  };


  // --- UPDATED: Accepts optional code argument ---
  const handleApplyPromo = async (codeToApply?: string) => {
    // Determine the code to use, prioritizing the argument
    const codeValue = (codeToApply !== undefined ? codeToApply : promoCode).trim().toUpperCase();

    // Check if a valid code string was determined
    if (!codeValue) {
        toast.info("Please enter or select a valid promo code.", { autoClose: 2000 });
        return; // Exit if no code is available
    }

    // Indicate loading state (optional)
    // setLoadingPromoApply(true);

    try {
      const { data: promoData, error } = await supabase
        .from('promo_codes')
        .select('*')
        // Use the determined codeValue
        .ilike('code', codeValue)
        .single();

      // Check for errors or no data found
      if (error || !promoData) {
        // Handle specific error for not found vs. other DB errors if needed
        if (error && error.code === 'PGRST116') { // PostgREST code for "טים matched"
             toast.error(`Promo code "${codeValue}" not found.`, { autoClose: 2000 });
        } else {
             toast.error("Invalid or expired promo code.", { autoClose: 2000 });
             console.error("Promo fetch error:", error); // Log actual error
        }
        setPromo(null); // Clear any existing promo
        // setLoadingPromoApply(false);
        return;
      }

      // --- All Validation Checks ---
      const now = new Date();
      if (!promoData.enabled) {
          toast.error("This promo code is currently disabled.", { autoClose: 2000 }); setPromo(null); return;
      }
      if (new Date(promoData.valid_from) > now) {
          toast.error("This promo code is not yet active.", { autoClose: 2000 }); setPromo(null); return;
      }
       if (new Date(promoData.valid_to) < now) {
          toast.error("This promo code has expired.", { autoClose: 2000 }); setPromo(null); return;
      }
       if (promoData.usage_limit !== null && promoData.used_count >= promoData.usage_limit) {
           toast.error("This promo code has reached its usage limit.", { autoClose: 2000 }); setPromo(null); return;
       }
       // Ensure roundedSubtotal is calculated *before* this check runs if needed
       if (promoData.min_order_amount > roundedSubtotal) {
           toast.error(`Minimum order amount of ₹${promoData.min_order_amount} required for code "${promoData.code}".`, { autoClose: 3000 });
           setPromo(null); return;
       }

      // First Order Check (only if needed and user is logged in)
      if (promoData.first_order_only) {
        // Use the isFirstOrder state directly
        if (isFirstOrder === false) { // Check state ONLY if user is logged in (isFirstOrder won't be false otherwise)
            toast.error(`Promo "${promoData.code}" is valid only for your first order.`, { autoClose: 2500 });
            setPromo(null); return;
        } else if (isFirstOrder === null && (await supabase.auth.getUser()).data.user) {
             // If logged in but order status is still loading, maybe prevent applying?
             toast.warn("Verifying first order status, please try again shortly.", { autoClose: 2000 });
             return; // Or let it apply optimistically and re-validate at checkout
        } else if (!(await supabase.auth.getUser()).data.user) {
             // If not logged in, cannot use first order promo
             toast.error("Please log in to use this first-order promo code.", { autoClose: 2500 });
             setPromo(null); return;
        }
      }
      // --- End Validation Checks ---


      // If all checks pass:
      const cleanPromo: Promo = { /* ... create cleanPromo object ... */
         id: promoData.id,
         code: promoData.code,
         type: promoData.type,
         value: promoData.value,
         used_count: promoData.used_count,
         usage_limit: promoData.usage_limit,
         enabled: promoData.enabled,
         valid_from: promoData.valid_from,
         valid_to: promoData.valid_to,
         first_order_only: promoData.first_order_only,
         min_order_amount: promoData.min_order_amount,
      };

      setPromo(cleanPromo);
      setPromoCode(""); // Clear the input field
      toast.success(`Promo "${cleanPromo.code}" applied!`, { autoClose: 2000 });

    } catch (err: any){
      console.error("Error applying promo:", err);
      // More specific error based on Supabase error details if available
      toast.error(`Failed to apply promo: ${err.message || 'Please try again.'}`, { autoClose: 2500 });
      setPromo(null);
    } finally {
      // setLoadingPromoApply(false);
    }
  };



  const roundedSubtotal = Math.round(cartTotal);
  const discount = React.useMemo(() => {
  if (!promo) return 0;

  let d = 0;
  if (promo.type === "percentage") {
    d = roundedSubtotal * (promo.value / 100);
  } else if (promo.type === "fixed") {
    d = promo.value;
  }

  // cap discount at subtotal
  if (d > roundedSubtotal) d = roundedSubtotal;

  return Math.round(d); // ✅ round off
}, [promo, roundedSubtotal]);

const finalTotal = React.useMemo(() => {
  return Math.round(roundedSubtotal - discount);
}, [roundedSubtotal, discount]);

const shipping = finalTotal > 999 ? 0 : 49;

const shiptotal = finalTotal + shipping; // ✅ also an integer now


  const handleProceedToCheckout = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login if not authenticated
      navigate('/auth?redirect=/checkout');
      return;
    }

    // Get DB cart and local cart
    const { data: dbCartItems } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id);

    const localCart = getLocalCart();
    const mergedCart = mergeCarts(localCart, dbCartItems || []);

    // Sync cart to DB
    await Promise.all(
      mergedCart.map(item =>
        supabase.from('cart').upsert({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity,
          weight: item.weight,
        })
      )
    );

    // Remove local cart
    localStorage.removeItem('cart');

    // Increment promo usage count if applied
    //if (promo) {
      //const { error } = await supabase
        //.from('promo_codes')
        //.update({ used_count: promo.used_count + 1 })
        //.eq('id', promo.id);
      //if (error) console.error('Failed to update promo usage count:', error);
    //}

    // Update billing context
    setBilling({
      subtotal: roundedSubtotal,
      discount,
      shipping,
      finalTotal,
      promo: promo ?? null,
    });

    // Navigate to checkout
    navigate('/checkout');
  } catch (err) {
    console.error('Error during checkout:', err);
    toast.error('Something went wrong during checkout. Please try again.');
  }
};


   // Empty Cart View
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Responsive padding for the card */}
            <div className="luxury-card glass rounded-3xl p-8 sm:p-12 lg:p-16">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-sage/20 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-luxury-gold" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-800 mb-6">
                Your Cart is Empty
              </h1>
              <p className="text-base sm:text-xl text-neutral-600 mb-8 font-medium">
                Discover our premium collection of luxury dry fruits and nuts
              </p>
              <button className="btn-premium text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg">
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart View with Items
  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32">
      <div className="container mx-auto px-4 pb-20">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-neutral-800 mb-4">
            Shopping <span className="tamoor-gradient">Cart</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 font-medium">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Main Layout using Flexbox for Mobile-First approach */}
        <div className="flex flex-col lg:flex-row lg:gap-12">
          
          {/* Order Summary & Promo (First in code for mobile, moved right on desktop via lg:order-last) */}
          <div className="lg:w-1/3 lg:order-last">
            <div className="lg:sticky top-28 space-y-6">
              {/* Promo Code */}
              {/* Promo Code */}
              <div className="luxury-card glass rounded-3xl p-6 sm:p-8">
                <h3 className="font-display font-semibold text-xl mb-4">Promo Code</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* ... Input and Apply Button ... */}
                   <input
                     type="text"
                     value={promoCode}
                     onChange={(e) => setPromoCode(e.target.value)}
                     placeholder="Enter promo code"
                     className="flex-1 p-3 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base"
                   />
                   <button
                     onClick={() => handleApplyPromo()}
                     className="btn-premium text-white px-6 py-3 rounded-xl font-semibold"
                   >
                     Apply
                   </button>
                </div>
                {promo && (
                    // ... Applied Promo display ...
                     <div className="flex justify-between items-center text-green-700 mt-3 text-sm">
                       <span className="font-medium">Discount ({promo.code})</span>
                       <div className="flex items-center space-x-2">
                         <span className="font-semibold">-₹{discount}</span>
                         <button
                           onClick={() => {
                             setPromo(null);
                             toast.info("Promo code removed", { autoClose: 2000 });
                           }}
                           className="text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                         >
                           Remove
                         </button>
                       </div>
                     </div>
                )}

                {/* --- ADDED: Promo Suggestions --- */}
                {loadingPromos && (
                    <div className="text-center text-sm text-neutral-500 mt-4 animate-pulse">Loading offers...</div>
                )}
                {!loadingPromos && suggestedPromos.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/20 space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-1 mb-2">
                      <Gift size={15} /> Available Offers:
                    </h4>
                    {/* Use flex-wrap for better mobile layout */}
                    <div className="flex flex-wrap gap-2">
                      {suggestedPromos.map(p => {
                        const meetsMinOrder = p.min_order_amount <= roundedSubtotal;
                        const description = p.type === 'percentage' ? `${p.value}% OFF` : `₹${p.value} OFF`;
                        const minOrderText = p.min_order_amount > 0 ? ` (Min. ₹${p.min_order_amount})` : '';
                        const firstOrderText = p.first_order_only && isFirstOrder !== false ? ' (First Order)' : '';
                        const isApplied = promo && promo.code === p.code;

                        return (
                          <div key={p.id}> {/* Wrap button in div if more complex content needed */}
                             <button
                               onClick={() => {
                                 if (meetsMinOrder) {
                                   // Directly apply if eligible
                                   //setPromoCode(p.code); // Set code in state (optional, but can be useful)
                                   handleApplyPromo(p.code);   // Trigger apply logic immediately
                                 } else {
                                   // Optionally, show a message or do nothing
                                   toast.info(`Add ₹${Math.round(p.min_order_amount - roundedSubtotal)} more to use this code.`, { autoClose: 2500 });
                                 }
                               }}
                               // Tooltip showing more details on hover (desktop)
                               title={`${description}${minOrderText}${firstOrderText}`}
                               className={`
                               flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border
                               transition-all duration-200 group
                               ${
                                 isApplied // Check if this is the currently applied promo
                                   ? 'bg-violet-200 border-violet-400 text-violet-800 cursor-default' // Lavender style for applied
                                   : meetsMinOrder // Otherwise, check eligibility
                                   ? 'bg-green-100/70 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400 cursor-pointer' // Green for eligible
                                   : 'bg-gray-100/70 border-gray-300 text-gray-500 cursor-help' // Gray for ineligible
                               }
                             `}
                             disabled={isApplied || (!meetsMinOrder && !isApplied)}
                            >
                                {/* --- Conditionally show icon based on applied status first --- */}
                              {isApplied ? <CheckCircle2 size={12} className="text-violet-600"/> : (meetsMinOrder ? <CheckCircle2 size={12} className="text-green-600"/> : <AlertCircle size={12} className="text-orange-500"/>)}
                              <span className="font-bold">{p.code}</span>
                              <span className="hidden sm:inline">- {description}{minOrderText}</span>
                              {/* --- Show "Applied" text instead of "Tap to Apply" --- */}
                              {isApplied ? <span className="text-[10px] font-bold">(Applied)</span> : (meetsMinOrder && <span className="opacity-0 group-hover:opacity-100 text-[10px]">(Tap to Apply)</span>)}
                           </button>
                             {/* Message for mobile if needed, or rely on tooltip/cursor */}
                             {!meetsMinOrder && p.min_order_amount > 0 && (
                                <p className="text-xs text-orange-600 mt-1 pl-1 sm:hidden">
                                    Add ₹{Math.round(p.min_order_amount - roundedSubtotal)} more.
                                </p>
                             )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!loadingPromos && suggestedPromos.length === 0 && (
                   <p className="text-xs text-neutral-500 mt-3 text-center">No applicable offers found right now.</p>
                )}
                {/* --- END PROMO SUGGESTIONS --- */}
                {/* --- END PROMO SUGGESTIONS --- */}

              </div>

              {/* Order Summary */}
              <div className="luxury-card glass rounded-3xl p-6 sm:p-8">
                <h3 className="font-display font-semibold text-xl mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6 text-base">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 font-medium">Subtotal</span>
                    <span className="font-semibold">₹{roundedSubtotal}</span>
                  </div>
                  {promo && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Discount ({promo.code})</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-medium flex items-center">
                      <Truck className="w-4 h-4 mr-2" /> Shipping
                    </span>
                    <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  {shipping === 0 && (
                    <div className="text-sm text-green-700 font-medium flex items-center gap-2">
                      <Gift className="w-4 h-4" /> Free shipping on orders above ₹999
                    </div>
                  )}
                </div>

                <div className="border-t border-white/20 pt-4 mb-6 flex justify-between items-center">
                  <span className="text-xl font-display font-semibold">Total</span>
                  <span className="text-3xl font-display font-bold tamoor-gradient">₹{shiptotal}</span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-6 text-center">
                  <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-neutral-500">
                    <span>🔒 Secure Checkout</span>
                    <span>📦 Fast Delivery</span>
                    <span>↩️ Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Items (Second in code, appears below summary on mobile) */}
          <div className="lg:w-2/3 space-y-6 mt-8 lg:mt-0">
            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className={`luxury-card glass rounded-3xl p-4 sm:p-6 transition-all duration-300 ${removingItem === item.id ? 'opacity-50 scale-95' : ''}`}
              >
                {/* FIXED: Simplified and more robust flex layout for each item */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Image & Details Container */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base sm:text-lg text-neutral-800 mb-1 truncate">{item.name}</h3>
                      <p className="text-neutral-600 text-sm mb-2">Weight: {displayWeight(item.weight, item.measurement_unit)}</p>
                      <div className="text-xl sm:text-2xl font-display font-bold tamoor-gradient">₹{getCartItemPrice(item)}</div>
                    </div>
                  </div>

                  {/* Actions Container */}
                  <div className="flex items-center self-end sm:self-center space-x-4 flex-shrink-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-1 neomorphism rounded-full p-1">
                      <button onClick={() => handleDecreaseQuantity(item)} className="p-2 hover:bg-white/20 rounded-full transition">
                        <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <span className="min-w-[2rem] sm:min-w-[2.5rem] text-center font-semibold text-base sm:text-lg">{item.quantity}</span>
                      <button onClick={() => handleIncreaseQuantity(item)} className="p-2 hover:bg-white/20 rounded-full transition">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, normalizeWeight(item.weight, item.measurement_unit), item.measurement_unit)}
                      className="p-3 text-red-500 rounded-full transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
