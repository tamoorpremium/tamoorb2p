import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Gift, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const handleRemoveItem = (id: number) => {
    setRemovingItem(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItem(null);
    }, 300);
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'tamoor15') {
      setAppliedPromo('TAMOOR15');
      setPromoCode('');
    }
  };

  const discount = appliedPromo ? cartTotal * 0.15 : 0;
  const shipping = cartTotal > 499 ? 0 : 49;
  const finalTotal = cartTotal - discount + shipping;

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
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-neutral-800 mb-4">
            Shopping <span className="tamoor-gradient">Cart</span>
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className={`luxury-card glass rounded-3xl p-8 transition-all duration-300 ${
                  removingItem === item.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center space-x-6">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-xl text-neutral-800 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-neutral-600 font-medium mb-3">
                      Weight: {item.weight}
                    </p>
                    <div className="text-2xl font-display font-bold tamoor-gradient">
                      ₹{item.price}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3 neomorphism rounded-full p-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <div className="luxury-card glass rounded-3xl p-8">
              <h3 className="font-display font-semibold text-xl mb-6">Promo Code</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                />
                <button
                  onClick={handleApplyPromo}
                  className="btn-premium text-white px-6 py-4 rounded-xl font-semibold"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-4 p-3 bg-luxury-sage/10 text-luxury-sage rounded-xl text-sm font-medium">
                  ✓ {appliedPromo} applied - 15% off!
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="luxury-card glass rounded-3xl p-8 sticky top-32">
              <h3 className="font-display font-semibold text-xl mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600 font-medium">Subtotal</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-luxury-sage">
                    <span className="font-medium">Discount ({appliedPromo})</span>
                    <span className="font-semibold">-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-neutral-600 font-medium flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Shipping
                  </span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                
                {shipping === 0 && (
                  <div className="text-sm text-luxury-sage font-medium flex items-center">
                    <Gift className="w-4 h-4 mr-2" />
                    Free shipping on orders above ₹499
                  </div>
                )}
              </div>

              <div className="border-t border-white/20 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-display font-semibold">Total</span>
                  <span className="text-3xl font-display font-bold tamoor-gradient">
                    ₹{finalTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              <button className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500">
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