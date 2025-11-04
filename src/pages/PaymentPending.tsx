// src/pages/PaymentPending.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Mail, Package, AlertTriangle } from 'lucide-react';

const PaymentPending = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');
  const errorMessage = queryParams.get('error') || 'We are verifying your payment.';

  // Handler to open the user's mail client
  const handleContactSupport = () => {
    // Use the support email you have
    window.location.href = `mailto:support@tamoor.com?subject=Payment Pending Inquiry for Order TAMOOR-${orderId}`;
  };

  // Handler to navigate to the user's order history page
  const handleCheckStatus = () => {
    // 
    // You might need to change '/account/orders' to your actual route
    // for the user's order history page.
    //
    navigate('/account/orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32 flex items-center justify-center">
      <div className="container mx-auto px-4 pb-20">
        <div className="luxury-card glass rounded-3xl p-6 sm:p-10 max-w-lg mx-auto text-center animate-slide-up">
          
          {/* Use a clock or info icon for "pending" */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Clock className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-800 mb-4">
            Payment Pending
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-600 mb-6 font-medium">
            Your order has been received, but we are still confirming your payment.
          </p>
          
          <p className="text-md sm:text-lg text-red-700 mb-6 font-semibold bg-red-100 p-3 rounded-lg">
             Please DO NOT retry the payment.
          </p>

          <p className="text-neutral-600 mb-8">
            You will receive a confirmation email as soon as the payment is processed. If you don't get an email within 24 hours, please contact our support team with your Order ID. Rest Assured if the payment is failed and amount debitted from your account it will be refunded within 5-7 working days
          </p>
          
          {orderId && (
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold text-sm mb-8">
              Order ID: TAMOOR-{orderId}
            </div>
          )}

          {/* Optional: Show the technical error for support reference */}
          {errorMessage && (
            <div className="text-xs text-neutral-500 mb-8 p-3 bg-gray-100 rounded-md">
              <AlertTriangle className="w-4 h-4 inline-block mr-2" />
              <span className="font-mono">Details: {errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleContactSupport}
              className="btn-premium text-white px-6 py-3 rounded-full font-semibold w-full flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </button>
            <button
              onClick={handleCheckStatus}
              className="px-6 py-3 glass rounded-full font-semibold text-neutral-700 w-full hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Check My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;