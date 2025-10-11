import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, Gift, Truck } from 'lucide-react';
import { useCart, normalizeWeight, Promo } from '../context/CartContext';
import { supabase } from '../utils/supabaseClient';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';


const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount, setCartItems, refresh , setBilling, promo, setPromo } = useCart();
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const navigate = useNavigate();
  // Promo states
  const [promoCode, setPromoCode] = useState('');
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
      const { data: { user } } = await supabase.auth.getUser();
      const localCart = getLocalCart();
      if (user) {
        const { data: dbCartItems, error } = await supabase.from('cart').select('*').eq('user_id', user.id);
        if (error) { setCartItems(localCart); return; }

        let products: any[] = [];
        if (dbCartItems && dbCartItems.length > 0) {
          const productIds = dbCartItems.map(i => i.product_id);
          const { data: prodData, error: prodErr } = await supabase
            .from('products')
            .select('id, name, image, price, measurement_unit')
            .in('id', productIds);
          if (!prodErr) products = prodData || [];
        }

        const dbWithDetails = dbCartItems.map(cartItem => {
          const prod = products.find(p => p.id === cartItem.product_id) || {};
          return { ...cartItem, ...prod, id: cartItem.product_id };
        });

        const mergedCart = mergeCarts(localCart, dbWithDetails);
        setCartItems(mergedCart);
        localStorage.removeItem('cart');
      } else setCartItems(localCart);
    };
    fetchAndMergeCart();
  }, [setCartItems]);

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


  const handleApplyPromo = async () => {
  if (!promoCode.trim()) return;

  try {
    const { data: promoData, error } = await supabase
      .from('promo_codes')
      .select('*')
      .ilike('code', promoCode.trim())
      .single();

    if (error || !promoData) {
      toast.error("Invalid promo code", { autoClose: 2000 });
      return;
    }

    const now = new Date();
    if (
      !promoData.enabled ||
      new Date(promoData.valid_from) > now ||
      new Date(promoData.valid_to) < now
    ) {
      toast.error("This promo code is not active or expired", { autoClose: 2000 });
      return;
    }

    if (promoData.usage_limit && promoData.used_count >= promoData.usage_limit) {
      toast.error("This promo code has reached its usage limit", { autoClose: 2000 });
      return;
    }

    if (promoData.first_order_only) {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (orders && orders.length > 0) {
        toast.error("Promo valid only for first order", { autoClose: 2000 });
        return;
      }
    }

    // ✅ Only keep the fields you actually use
    const cleanPromo: Promo = {
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
    };

    setPromo(cleanPromo);
    setPromoCode("");
    toast.success("Promo code applied!", { autoClose: 2000 });

  } catch {
    toast.error("Failed to apply promo!", { autoClose: 2000 });
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


  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="luxury-card glass rounded-3xl p-16">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-sage/20 flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-luxury-gold" />
              </div>
              <h1 className="text-4xl font-display font-bold text-neutral-800 mb-6">
                Your Cart is Empty
              </h1>
              <p className="text-xl text-neutral-600 mb-8 font-medium">
                Discover our premium collection of luxury dry fruits and nuts
              </p>
              <button className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg">
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
    <div className="container mx-auto px-4 pb-20">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-neutral-800 mb-4">
          Shopping <span className="tamoor-gradient">Cart</span>
        </h1>
        <p className="text-xl text-neutral-600 font-medium">
          {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.weight}`}
              className={`luxury-card glass rounded-3xl p-4 sm:p-6 transition-all duration-300 ${removingItem === item.id ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                {/* Item Image */}
                <div className="relative overflow-hidden rounded-2xl w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm sm:text-lg truncate text-neutral-800 mb-1 sm:mb-2">{item.name}</h3>
                  <p className="text-neutral-600 text-xs sm:text-sm mb-2">Weight: {displayWeight(item.weight, item.measurement_unit)}</p>
                  <div className="text-lg sm:text-xl font-display font-bold tamoor-gradient">₹{getCartItemPrice(item)}</div>
                </div>

                {/* Quantity & Remove */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex items-center space-x-2 neomorphism rounded-full p-1 sm:p-2">
                    <button
                      onClick={() => handleDecreaseQuantity(item)}
                      className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="min-w-[2.5rem] text-center font-semibold text-sm sm:text-lg">{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item)}
                      className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, normalizeWeight(item.weight, item.measurement_unit), item.measurement_unit)}
                    className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Promo */}
        <div className="space-y-6">
          {/* Promo Code */}
          <div className="luxury-card glass rounded-3xl p-4 sm:p-6">
            <h3 className="font-display font-semibold text-lg sm:text-xl mb-4 sm:mb-6">Promo Code</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 p-3 sm:p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
              />
              <button
                onClick={handleApplyPromo}
                className="btn-premium text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold"
              >
                Apply
              </button>
            </div>
            {promo && (
              <div className="flex justify-between items-center text-luxury-sage mt-2 sm:mt-3 text-sm sm:text-base">
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
          </div>

 {/* Order Summary */}
      <div className="luxury-card glass rounded-3xl p-4 sm:p-6 lg:sticky top-32 mb-6">
        <h3 className="font-display font-semibold text-lg sm:text-xl mb-4 sm:mb-6">Order Summary</h3>
        <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6 text-sm sm:text-base">
          <div className="flex justify-between">
            <span className="text-neutral-600 font-medium">Subtotal</span>
            <span className="font-semibold">₹{roundedSubtotal}</span>
          </div>
          {promo && (
            <div className="flex justify-between text-luxury-sage font-medium">
              <span>Discount ({promo.code})</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-neutral-600 font-medium flex items-center">
              <Truck className="w-4 h-4 mr-1 sm:mr-2" /> Shipping
            </span>
            <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          {shipping === 0 && (
            <div className="text-sm text-luxury-sage font-medium flex items-center gap-1 sm:gap-2">
              <Gift className="w-4 h-4" /> Free shipping on orders above ₹999
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-white/20 pt-4 mb-6 flex justify-between items-center">
          <span className="text-xl font-display font-semibold">Total</span>
          <span className="text-2xl sm:text-3xl font-display font-bold tamoor-gradient">₹{shiptotal}</span>
        </div>

        <button
          onClick={handleProceedToCheckout}
          className="w-full btn-premium text-white py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center"
        >
          Proceed to Checkout
        </button>

        <div className="mt-4 sm:mt-6 text-center">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-sm sm:text-base text-neutral-500">
            <span>🔒 Secure Checkout</span>
            <span>📦 Fast Delivery</span>
            <span>↩️ Easy Returns</span>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Cart;
