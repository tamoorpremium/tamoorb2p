// src/pages/PaymentFailed.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, ShoppingCart } from 'lucide-react';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const errorMessage = queryParams.get('error') || 'An unknown error occurred.';
  const orderId = queryParams.get('orderId'); // We'll get this from the hook

  const handleRetry = () => {
    // Simply navigate back to the checkout page.
    // Your CartContext will still have all the items.
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32 flex items-center justify-center">
      <div className="container mx-auto px-4 pb-20">
        <div className="luxury-card glass rounded-3xl p-6 sm:p-10 max-w-lg mx-auto text-center animate-slide-up">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-800 mb-4">
            Payment Failed!
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-600 mb-6 font-medium">
            {/* Display the specific error message from Razorpay */}
            {errorMessage}
          </p>
          
          {orderId && (
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm mb-8">
              Order ID: TAMOOR-{orderId}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRetry}
              className="btn-premium text-white px-6 py-3 rounded-full font-semibold w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 glass rounded-full font-semibold text-neutral-700 w-full hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Back to Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;