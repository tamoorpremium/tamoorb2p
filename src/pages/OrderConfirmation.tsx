import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, MapPin, Calendar, ArrowRight } from 'lucide-react';

const OrderConfirmation = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const orderDetails = {
    orderId: 'TAMOOR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toLocaleDateString(),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    total: 2499,
    items: [
      { name: 'Himalayan Premium Almonds', quantity: 1, weight: '500g', price: 1299 },
      { name: 'Turkish Pistachios', quantity: 1, weight: '250g', price: 1200 }
    ],
    address: {
      name: 'Arjun Sharma',
      line1: '123 Premium Plaza',
      line2: 'Mumbai, Maharashtra - 400001',
      phone: '+91 98765 43210'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="animate-confetti absolute w-2 h-2 bg-luxury-gold rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 pb-20 relative z-20">
        {/* Success Hero */}
        <div className="text-center mb-16">
          <div className="luxury-card glass rounded-3xl p-16 max-w-4xl mx-auto animate-slide-up">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-luxury-sage to-luxury-sage-dark flex items-center justify-center shadow-luxury animate-pulse">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-800 mb-6">
              Order <span className="tamoor-gradient">Confirmed!</span>
            </h1>
            
            <p className="text-2xl text-neutral-600 mb-8 font-medium">
              Thank you for choosing TAMOOR Premium
            </p>
            
            <div className="inline-flex items-center space-x-4 bg-luxury-sage/10 text-luxury-sage px-8 py-4 rounded-full font-semibold text-lg">
              <Package className="w-6 h-6" />
              <span>Order ID: {orderDetails.orderId}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Details */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="luxury-card glass rounded-3xl p-8 animate-slide-up">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                Order Summary
              </h2>
              
              <div className="space-y-6">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between neomorphism rounded-2xl p-6">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-neutral-800">
                        {item.name}
                      </h3>
                      <p className="text-neutral-600 font-medium">
                        {item.weight} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-xl font-display font-bold tamoor-gradient">
                      ₹{item.price}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-white/20 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-display font-semibold text-neutral-800">
                      Total Paid
                    </span>
                    <span className="text-3xl font-display font-bold tamoor-gradient">
                      ₹{orderDetails.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="luxury-card glass rounded-3xl p-8 animate-slide-up">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                Delivery Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-light flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">
                      Delivery Address
                    </h3>
                    <div className="text-neutral-600 font-medium">
                      <p>{orderDetails.address.name}</p>
                      <p>{orderDetails.address.line1}</p>
                      <p>{orderDetails.address.line2}</p>
                      <p>{orderDetails.address.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">
                      Estimated Delivery
                    </h3>
                    <p className="text-neutral-600 font-medium">
                      {orderDetails.estimatedDelivery}
                    </p>
                    <p className="text-sm text-neutral-500">
                      5-7 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-8">
            {/* Order Tracking */}
            <div className="luxury-card glass rounded-3xl p-8 animate-slide-up">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                What's Next?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 neomorphism rounded-2xl">
                  <div className="w-3 h-3 bg-luxury-sage rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-display font-semibold text-neutral-800">
                      Order Confirmed
                    </h3>
                    <p className="text-sm text-neutral-600">
                      We've received your order and payment
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 opacity-60">
                  <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
                  <div>
                    <h3 className="font-display font-semibold text-neutral-800">
                      Processing
                    </h3>
                    <p className="text-sm text-neutral-600">
                      We're preparing your premium dry fruits
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 opacity-60">
                  <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
                  <div>
                    <h3 className="font-display font-semibold text-neutral-800">
                      Shipped
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Your order is on its way
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 opacity-60">
                  <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
                  <div>
                    <h3 className="font-display font-semibold text-neutral-800">
                      Delivered
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Enjoy your premium TAMOOR products!
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg mt-8 flex items-center justify-center group">
                <Truck className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                Track Your Order
              </button>
            </div>

            {/* Support & Actions */}
            <div className="luxury-card glass rounded-3xl p-8 animate-slide-up">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                Need Help?
              </h2>
              
              <div className="space-y-4">
                <button className="w-full p-4 text-left hover:bg-white/20 rounded-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-700">Contact Customer Support</span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>

                <button className="w-full p-4 text-left hover:bg-white/20 rounded-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-700">View Order Details</span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>

                <button className="w-full p-4 text-left hover:bg-white/20 rounded-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-700">Continue Shopping</span>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="luxury-card glass rounded-3xl p-8 animate-slide-up">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">
                  Confirmation Email Sent
                </h3>
                <p className="text-neutral-600 text-sm font-medium">
                  We've sent order details to your email address
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;