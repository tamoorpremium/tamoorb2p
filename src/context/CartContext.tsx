import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useMemo, useCallback } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  unit_price: number; // price per weight/unit
  image: string;
  quantity: number;
  weight: string;
  measurement_unit?: string;
}

export interface Promo {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  used_count: number;
  usage_limit?: number;
  enabled?: boolean;
  valid_from?: string;
  valid_to?: string;
  first_order_only?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (id: number, weight: string, measurementUnit?: string) => Promise<void>;
  updateQuantity: (id: number, weight: string, quantity: number, measurementUnit?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  //new feilds
  subtotal: number;
  discount: number;
  shipping: number;
  finalTotal: number;
  promo: Promo | null;
  setPromo: React.Dispatch<React.SetStateAction<Promo | null>>;
  setBilling: (billing: {
    subtotal: number;
    discount: number;
    shipping: number;
    finalTotal: number;
    promo: Promo | null;
  }) => void;

  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Improved normalizeWeight fallback to avoid ambiguous "piece" string as key
export const normalizeWeight = (weight?: string | null, measurementUnit?: string | null): string => {
  if (!weight || weight === 'default') {
    // Return 'default' for missing weight regardless of unit (simplifies uniqueness)
    return 'default';
  }
  if (measurementUnit === 'pieces') {
    // Return exact fixed piece weight string
    return weight.trim();
  }
  return weight.trim();
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [promo, setPromo] = useState<Promo | null>(null);

  const setBilling = ({
    subtotal,
    discount,
    shipping,
    finalTotal,
    promo
  }: {
    subtotal: number;
    discount: number;
    shipping: number;
    finalTotal: number;
    promo: Promo | null;
  }) => {
    setSubtotal(subtotal);
    setDiscount(discount);
    setShipping(shipping);
    setFinalTotal(finalTotal);
    setPromo(promo);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Price calculation: fixed piece price vs weighted kilogram price
  const getCartItemPrice = (item: CartItem) => {
    // Use unit_price directly (calculated at fetch/upsert time)
    return (item.unit_price ?? item.price) * item.quantity;
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + getCartItemPrice(item), 0);

  const refresh = useCallback(async () => { // <-- Wrap in useCallback
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setCartItems([]);
      return;
    }

    const { data: cartData, error } = await supabase
      .from('cart')
      .select('*, products ( name, price, image, measurement_unit )')
      .eq('user_id', user.id);

    if (error) {
      console.error('refresh error:', error);
      setCartItems([]);
      return;
    }

    // ... (rest of your refresh function is perfect) ...
    const formatted = cartData.map((item: any) => {
        const weightStr = item.weight || 'default';
        let unitPrice = item.products.price;
        if (item.products.measurement_unit !== 'pieces') {
            const grams = parseInt(weightStr.replace(/\D/g, ''), 10) || 1000;
            unitPrice = Math.round((item.products.price / 1000) * grams);
        }
        return {
            id: item.product_id,
            quantity: item.quantity,
            weight: weightStr,
            name: item.products.name,
            price: item.products.price,
            unit_price: unitPrice,
            image: item.products.image,
            measurement_unit: item.products.measurement_unit,
        };
    });
    setCartItems(formatted);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]); // <-- Make sure to pass 'refresh' here now

  // --- ADD THIS NEW BLOCK ---
  useEffect(() => {
    // This listens for the 'cartUpdated' signal from anywhere in the app
    const handleCartUpdate = () => {
      console.log('Cart signal received! Refreshing count.');
      refresh();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    // Clean up the listener
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [refresh]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      alert('Please login to add to cart');
      return;
    }

    const standardizedWeight = normalizeWeight(item.weight, item.measurement_unit);

    // --- OPTIMISTIC UPDATE ---
    // 1. Check local state first
    const existingItem = cartItems.find(
      (ci) => ci.id === item.id && ci.weight === standardizedWeight
    );

    let newQuantity: number;
    let updatedCart: CartItem[];

    if (existingItem) {
      newQuantity = existingItem.quantity + quantity;
      updatedCart = cartItems.map((ci) =>
        ci.id === item.id && ci.weight === standardizedWeight
          ? { ...ci, quantity: newQuantity }
          : ci
      );
    } else {
      newQuantity = quantity;
      // Ensure the new item has the correct unit_price
      const unitPrice = item.unit_price ?? item.price;
      updatedCart = [
        ...cartItems,
        { ...item, quantity: newQuantity, weight: standardizedWeight, unit_price: unitPrice },
      ];
    }

    // 2. Update state *immediately*
    setCartItems(updatedCart);
    // --- END OPTIMISTIC UPDATE ---

    // 3. Update database in the background
    const { error } = await supabase.from('cart').upsert({
      user_id: user.id,
      product_id: item.id,
      quantity: newQuantity,
      weight: standardizedWeight,
    });

    if (error) {
      console.error('Error upserting cart item, refreshing to sync:', error);
      // On error, roll back by refreshing from the database
      refresh();
    }
    // DO NOT call refresh() on success
  };

  const removeFromCart = async (id: number, weight: string, measurementUnit?: string) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      alert('Please login to modify cart');
      return;
    }

    const normalizedWeight = normalizeWeight(weight, measurementUnit);

    // --- OPTIMISTIC UPDATE ---
    const newCartItems = cartItems.filter(
      (ci) => !(ci.id === id && ci.weight === normalizedWeight)
    );
    setCartItems(newCartItems);
    // --- END OPTIMISTIC UPDATE ---

    // 2. Update database in the background
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('weight', normalizedWeight);

    if (error) {
      console.error('Error removing from cart, refreshing to sync:', error);
      // On error, roll back by refreshing
      refresh();
    }
    // DO NOT call refresh() on success
  };

  const updateQuantity = async (
    id: number,
    weight: string,
    quantity: number,
    measurementUnit?: string
  ) => {
    // This will now call your new *optimistic* remove function
    if (quantity <= 0) {
      await removeFromCart(id, weight, measurementUnit);
      return;
    }

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      alert('Please login to modify cart');
      return;
    }

    // --- OPTIMISTIC UPDATE ---
    let itemToUpdate: CartItem | undefined;
    const newCartItems = cartItems.map((ci) => {
      // Use the exact 'weight' string from the item, not a normalized one
      if (ci.id === id && ci.weight === weight) {
        itemToUpdate = { ...ci, quantity: quantity };
        return itemToUpdate;
      }
      return ci;
    });

    // 1. Update state *immediately*
    setCartItems(newCartItems);
    // --- END OPTIMISTIC UPDATE ---

    if (!itemToUpdate) {
      console.error('Cart item not found for optimistic update!');
      return; // Should not happen if UI is synced
    }

    // 2. Update database in the background
    const { error } = await supabase
      .from('cart')
      .update({ quantity, unit_price: itemToUpdate.unit_price })
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('weight', weight); // Use the exact weight

    if (error) {
      console.error('Error updating quantity, refreshing to sync:', error);
      // On error, roll back by refreshing
      refresh();
    }
    // DO NOT call refresh() on success
  };

  const clearCart = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      alert('Please login to clear cart');
      return;
    }

    // --- OPTIMISTIC UPDATE ---
    const oldCart = cartItems; // 1. Save old cart for rollback
    setCartItems([]); // 2. Update state *immediately*
    // --- END OPTIMISTIC UPDATE ---

    // 3. Update database in the background
    const { error } = await supabase.from('cart').delete().eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart, rolling back:', error);
      setCartItems(oldCart); // Rollback on error
    }
    // DO NOT call refresh() on success
  };

  // ✅ Restore from localStorage
  {/*useEffect(() => {
    const stored = localStorage.getItem("cartData");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.cartItems) setCartItems(parsed.cartItems);
      if (parsed.promo) setPromo(parsed.promo);
    }
  }, []); */}

//  ✅ Restore from localStorage
  {/*useEffect(() => {
  const stored = localStorage.getItem("cartData");
  if (!stored) return;

  const parsed = JSON.parse(stored);
  console.log("🗂️ Loaded cartData from localStorage:", parsed);

  const timeout = setTimeout(() => {
    console.log("⏱️ Timeout triggered. Current cartItems in context:", cartItems);

    if (cartItems.length === 0) {
      console.log("❌ Cart is empty → resetting promo to null");
      setPromo(null);
    } else if (parsed.promo) {
      console.log("🎟️ Restoring promo from localStorage:", parsed.promo);
      setPromo(parsed.promo);
    } else {
      console.log("⚠️ No promo to restore, leaving it as is");
    }
  }, 1000);

  return () => {
    console.log("🧹 Clearing timeout for promo reset");
    clearTimeout(timeout);
  };
}, [cartItems, setPromo]); */}


{ /* useEffect(() => {
  const stored = localStorage.getItem("cartData");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.cartItems && parsed.cartItems.length > 0) {
      setCartItems(parsed.cartItems);
      if (parsed.promo) setPromo(parsed.promo); // restore only if cart has items
    } else {
      setCartItems([]);
      setPromo(null); // no items → promo resets automatically
    }
  }
}, []);
 */}


  // ✅ Save cart + promo to localStorage
  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify({ cartItems, promo }));
  }, [cartItems, promo]);

//  useEffect(() => {
//  setPromo(null); // always reset on new session
//}, []);

  // ✅ Auto recalc billing
  useEffect(() => {
    const newSubtotal = cartItems.reduce(
      (acc, item) => acc + (item.unit_price ?? item.price) * item.quantity,
      0
    );

    let newDiscount = 0;
    if (promo && promo.enabled) {
      const now = new Date();

      const isWithinDateRange =
        (!promo.valid_from || new Date(promo.valid_from) <= now) &&
        (!promo.valid_to || new Date(promo.valid_to) >= now);

      if (isWithinDateRange) {
        if (promo.type === "percentage") {
          newDiscount = newSubtotal * (promo.value / 100);
        } else if (promo.type === "fixed") {
          newDiscount = promo.value;
        }
      }
    }

    // Prevent over-discount
    newDiscount = Math.min(newDiscount, newSubtotal);

    const newFinal = Math.max(0, newSubtotal - newDiscount);
    const newShipping = newFinal > 999 ? 0 : 49;

    setSubtotal(Math.round(newSubtotal));
    setDiscount(Math.round(newDiscount));
    setShipping(newShipping); // Shipping is already an integer
    setFinalTotal(Math.round(newFinal));

    console.log("💰 Recalculated billing:", {
      newSubtotal: Math.round(newSubtotal),
      newDiscount: Math.round(newDiscount),
      newShipping,
      newFinal: Math.round(newFinal),
      promo,
    });
  }, [cartItems, promo]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        refresh,
        subtotal,
        discount,
        shipping,
        finalTotal,
        promo,
        setPromo,
        setBilling,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
