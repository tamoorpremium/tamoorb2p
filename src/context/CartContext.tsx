import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id && item.weight === newItem.weight);
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id && item.weight === newItem.weight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });

    // Animate cart button
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
      cartButton.classList.add('animate-burst');
      setTimeout(() => cartButton.classList.remove('animate-burst'), 300);
    }

    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.classList.add('animate-pulse');
      setTimeout(() => cartCount.classList.remove('animate-pulse'), 500);
    }
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};