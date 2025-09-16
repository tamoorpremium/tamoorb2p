import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCart } from "../context/CartContext";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deliveryOption: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

interface CartItem {
  id: number;
  quantity: number;
  price: number;
}


export const useRazorpay = (
  formData: FormData,
  cartItems: CartItem[],
  userId: string | null,
  displayTotal: number,
  navigate: (url: string) => void,
  subtotal: number,
  discount: number,
  delivery_fee: number,
  promoCode: string | null
) => {
  const [rpErrorMsg, setRpErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { setPromo } = useCart();

  const getAccessToken = async () => {
    console.log('[useRazorpay] 🔑 Fetching access token from Supabase...');
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error('[useRazorpay] ❌ Error fetching session:', error);
    if (!data?.session) console.warn('[useRazorpay] ⚠️ No active session found');
    return error || !data?.session ? null : data.session.access_token;
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    console.log(`[useRazorpay] 🔄 Updating order status to "${status}" for order ID:`, orderId);
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) console.error('[useRazorpay] ❌ Failed to update order status:', error);
    else console.log('[useRazorpay] ✅ Order status updated successfully.');
  };

  const handleRazorpayPayment = async () => {
    console.log('[useRazorpay] 🚀 handleRazorpayPayment called');
    if (isProcessing) {
      console.log('[useRazorpay] ⏳ Already processing payment, exiting.');
      return;
    }
    if (!userId) {
      console.error('[useRazorpay] ❌ No userId found. User must be logged in.');
      setRpErrorMsg('User not logged in');
      return;
    }

    setIsProcessing(true);
    console.log('[useRazorpay] ⚙️ Processing started. Preparing Razorpay...');

    try {
      // Load Razorpay script if not loaded
      if (!document.getElementById('razorpay-script')) {
        console.log('[useRazorpay] 📥 Loading Razorpay script...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.id = 'razorpay-script';
        document.body.appendChild(script);
        await new Promise(resolve => (script.onload = resolve));
        console.log('[useRazorpay] ✅ Razorpay script loaded successfully.');
      }

      const token = await getAccessToken();
      if (!token) {
        console.error('[useRazorpay] ❌ Failed to fetch access token. Aborting.');
        setRpErrorMsg('Session expired. Please login again.');
        setIsProcessing(false);
        return;
      }
      console.log('[useRazorpay] 🔑 Access token retrieved successfully.');

      // Call backend to create full order
      console.log('[useRazorpay] 📝 Creating full order with backend...');
      const addressObj = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };
      const paymentDetails = {
        cardNumber: formData.cardNumber ? '****' : '', // mask card
        expiryDate: formData.expiryDate,
        cvv: formData.cvv ? '***' : '',
        nameOnCard: formData.nameOnCard,
      };

      console.log('[useRazorpay] 🛒 Cart Items:', cartItems);
      console.log('[useRazorpay] 📦 Address:', addressObj);
      console.log('[useRazorpay] 💳 Payment Details:', paymentDetails);

      const res = await fetch('https://bvnjxbbwxsibslembmty.functions.supabase.co/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
        amount: displayTotal,
  subtotal,
  discount,
  delivery_fee,
  promo_code: promoCode,
        user_id: userId,
        address: addressObj,
        delivery_option: formData.deliveryOption,
        payment_method: formData.paymentMethod,
        payment_details: paymentDetails,
        cart_items: cartItems,
      }),

      });
      console.log('[useRazorpay] 📡 Backend create-order request sent.');

      const data = await res.json();
      console.log('[useRazorpay] 📩 Backend response:', data);

      if (data.error) {
        console.error('[useRazorpay] ❌ Failed to create order:', data.error);
        setRpErrorMsg(`Failed to create order: ${data.error}`);
        setIsProcessing(false);
        return;
      }

      console.log('[useRazorpay] ✅ Order created. Opening Razorpay checkout...');
      const options = {
        key: 'rzp_test_RA3gvGsfTCGIZB', // replace with live key in prod
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
        name: 'Tamoor Premium Dry Fruits',
        description: 'Order Payment',
        prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
        theme: { color: '#39FF14' },
        handler: async (response: any) => {
          console.log('[useRazorpay] 🎯 Razorpay payment handler triggered with response:', response);
          const verifyToken = await getAccessToken();
          if (!verifyToken) {
            console.error('[useRazorpay] ❌ Session expired during payment verification.');
            setRpErrorMsg('Session expired during payment verification.');
            setIsProcessing(false);
            return;
          }

          console.log('[useRazorpay] 🔍 Verifying payment with backend...');
          const verifyRes = await fetch('https://bvnjxbbwxsibslembmty.functions.supabase.co/verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${verifyToken}` },
            body: JSON.stringify({
              ...response,
              internal_order_id: data.internal_order_id,
            }),
          });
          const verifyData = await verifyRes.json();
          console.log('[useRazorpay] 📩 Verify payment response:', verifyData);

          if (verifyData.success) {
            console.log('[useRazorpay] ✅ Payment verified successfully. Updating status to paid...');
            await updateOrderStatus(data.internal_order_id, 'paid');
            // 🔑 Reset promo + checkoutData after success
            localStorage.removeItem("checkoutData");
            setPromo(null);

            // Trigger confirmation email
            try {
              const { data: emailData, error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
                body: JSON.stringify({
                  orderId: data.internal_order_id,
                  email: "tamoorpremium@gmail.com", // TESTING EMAIL
                  // email: formData.email, // Uncomment in production to send to actual customer
                }),
              });

              if (emailError) console.error('❌ Failed to send confirmation email:', emailError);
              else console.log('✅ Confirmation email triggered:', emailData);
            } catch (err) {
              console.error('❌ Unexpected error sending confirmation email:', err);
            }

            console.log('[useRazorpay] 🛒 Navigating to confirmation page...');
            navigate(`/order-confirmation?orderId=${data.internal_order_id}`);
          } else {
            console.error('[useRazorpay] ❌ Payment verification failed:', verifyData.error);
            setRpErrorMsg(`Payment verification failed: ${verifyData.error}`);
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: () => {
            console.warn('[useRazorpay] ⚠️ Payment modal dismissed by user.');
            setRpErrorMsg('Payment cancelled.');
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      console.log('[useRazorpay] 💳 Razorpay modal opened.');

    } catch (error: any) {
      console.error('[useRazorpay] ❌ Unexpected error occurred:', error);
      setRpErrorMsg('Unexpected error: ' + (error?.message || error));
      setIsProcessing(false);
    }
  };

  return { rpErrorMsg, isProcessing, handleRazorpayPayment };
};
