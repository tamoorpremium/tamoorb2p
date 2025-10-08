import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const OrderConfirmation = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Extract orderId from query params
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!orderId) {
      setErrorMsg('No order ID specified.');
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          setErrorMsg('Order not found.');
          setLoading(false);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, products (id, name, image)') // join product info if needed
          .eq('order_id', orderId);

        if (itemsError) {
          setErrorMsg('Failed to load order items.');
          setLoading(false);
          return;
        }

        setOrderDetails(order);
        setOrderItems(items || []);
        setLoading(false);
      } catch (error) {
        setErrorMsg('Unexpected error occurred.');
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading order details...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        {errorMsg}
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32 relative overflow-hidden">
    {/* Confetti Animation */}
    {showConfetti && (
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="animate-confetti absolute w-2 h-2 bg-luxury-gold rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    )}

    <div className="container mx-auto px-4 pb-20 relative z-20">
      {/* Success Hero */}
      <div className="text-center mb-8 sm:mb-16">
        <div className="luxury-card glass rounded-3xl p-6 sm:p-8 md:p-12 max-w-full sm:max-w-xl md:max-w-4xl mx-auto animate-slide-up">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-luxury-sage to-luxury-sage-dark flex items-center justify-center shadow-luxury animate-pulse">
            <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-neutral-800 mb-4 sm:mb-6">
            Order <span className="tamoor-gradient">Confirmed!</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 mb-6 sm:mb-8 font-medium">
            Thank you for choosing TAMOOR Premium
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-luxury-sage/10 text-luxury-sage px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-lg">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Order ID: TAMOOR-{orderDetails.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {/* Order Details */}
        <div className="space-y-6 sm:space-y-8">
          {/* Order Summary */}
          <div className="luxury-card glass rounded-3xl p-4 sm:p-6 md:p-8 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-6 sm:mb-8">
              Order Summary
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between neomorphism rounded-2xl p-4 sm:p-6"
                >
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-display font-semibold text-base sm:text-lg text-neutral-800">
                      {item.products?.name || 'Product'}
                    </h3>
                    <p className="text-neutral-600 font-medium text-sm sm:text-base">
                      {item.quantity} × {item.weight ?? ''}
                    </p>
                  </div>
                  <div className="text-lg sm:text-xl font-display font-bold tamoor-gradient mt-2 sm:mt-0">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

              <div className="border-t border-white/20 pt-4 sm:pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-display font-semibold text-neutral-800">
                    Total Paid
                  </span>
                  <span className="text-2xl sm:text-3xl font-display font-bold tamoor-gradient">
                    ₹{orderDetails.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="luxury-card glass rounded-3xl p-4 sm:p-6 md:p-8 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-6 sm:mb-8">
              Delivery Information
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-light flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base sm:text-lg text-neutral-800 mb-1 sm:mb-2">
                    Delivery Address
                  </h3>
                  <div className="text-neutral-600 font-medium text-sm sm:text-base">
                    <p>{orderDetails.address.full_name}</p>
                    <p>{orderDetails.address.address}</p>
                    <p>
                      {orderDetails.address.city}, {orderDetails.address.state} -{' '}
                      {orderDetails.address.pincode}
                    </p>
                    <p>{orderDetails.address.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base sm:text-lg text-neutral-800 mb-1 sm:mb-2">
                    Estimated Delivery
                  </h3>
                  <p className="text-neutral-600 font-medium text-sm sm:text-base">
                    {new Date(orderDetails.placed_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-500">5-7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps & Support */}
        <div className="space-y-6 sm:space-y-8">
          {/* What's Next */}
          <div className="luxury-card glass rounded-3xl p-4 sm:p-6 md:p-8 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-6 sm:mb-8">
              What's Next?
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {['Order Confirmed', 'Processing', 'Shipped', 'Delivered'].map((label, i) => {
                const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                const currentStatusIndex = statusSteps.indexOf(orderDetails?.status ?? 'pending');
                const isActive = i <= currentStatusIndex;
                const descriptions = [
                  "We've received your order and payment",
                  "We're preparing your premium dry fruits",
                  "Your order is on its way",
                  "Enjoy your premium TAMOOR products!"
                ];
                return (
                  <div
                    key={label}
                    className={`flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 rounded-2xl ${
                      isActive ? 'neomorphism' : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-1 sm:mt-0 ${
                        isActive ? 'bg-luxury-sage animate-pulse' : 'bg-neutral-300'
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-display font-semibold text-neutral-800 text-sm sm:text-base">{label}</h3>
                      <p className="text-xs sm:text-sm text-neutral-600">{descriptions[i]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className={`w-full sm:w-auto btn-premium text-white py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg mt-6 flex items-center justify-center group ${
                orderDetails?.tracking_url ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!orderDetails?.tracking_url}
              onClick={() => {
                if (orderDetails?.tracking_url) window.open(orderDetails.tracking_url, '_blank');
              }}
            >
              <Truck className="w-5 h-5 mr-2 sm:mr-3 group-hover:translate-x-1 transition-transform duration-300" />
              Track Your Order
            </button>
          </div>

          {/* Support & Email */}
          <div className="luxury-card glass rounded-3xl p-4 sm:p-6 md:p-8 animate-slide-up space-y-4">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-4 sm:mb-6">
              Need Help?
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <button
                className="w-full p-3 sm:p-4 text-left hover:bg-white/20 rounded-xl transition-all duration-300 group"
                onClick={() => window.open('mailto:support@tamoor.com')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700 text-sm sm:text-base">Contact Customer Support</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>

              <button
                className="w-full p-3 sm:p-4 text-left hover:bg-white/20 rounded-xl transition-all duration-300 group"
                onClick={() => navigate(`/order-details?orderId=${orderDetails?.id}`)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700 text-sm sm:text-base">View Order Details</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>

              <button
                className="w-full p-3 sm:p-4 text-left hover:bg-white/20 rounded-xl transition-all duration-300 group"
                onClick={() => navigate('/products')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700 text-sm sm:text-base">Continue Shopping</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </div>

            {/* Email Confirmation */}
            <div className="text-center mt-4 sm:mt-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">📧</span>
              </div>
              <h3 className="font-display font-semibold text-sm sm:text-lg text-neutral-800 mb-1 sm:mb-2">
                Confirmation Email Sent
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                We've sent order details to your email address: {orderDetails?.address?.email || 'your email'}
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