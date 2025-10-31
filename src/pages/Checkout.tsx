import React, { useState, useEffect } from 'react';
import { ChevronRight, CreditCard, Truck, MapPin, Check, Lock } from 'lucide-react';
import { CartItem, useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Products from './Products';
import { useRazorpay } from '../hooks/useRazorpay';  // Adjust the path if needed
import { useLocation } from 'react-router-dom';
import countryPhoneData from '../utils/countryCodes.json';


// Define interface for the Supabase cart response with joined products
interface CartItemWithProduct {
  product_id: number;
  quantity: number;
  weight: string;
  unit_price: number;
  products: {
    id: number;
    name: string;
    price: number;
    measurement_unit?: string;
    image: string;
  } | null;
}

const Checkout = () => {
  const location = useLocation();

  const { cartItems, cartTotal, setCartItems } = useCart();
  const { subtotal, discount, shipping, finalTotal, promo, setPromo } = useCart();

  const subtotalFromCart = subtotal;
  const discountFromCart = discount;
  const finalTotalFromCart = finalTotal;
  const promoCodeFromCart = promo;
  const [addressError, setAddressError] = useState('');

  console.log("💰 Context totals:", { subtotal, discount, shipping, finalTotal, promo });

  //const [localPromoCode, setLocalPromoCode] = useState(promo);

  const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

  const roundedSubtotal = Math.round(cartTotal);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    deliveryOption: 'standard',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '', 
    email: '', 
    country_code: '+91',
    phone: '', 
    address: '', 
    city: '', 
    state: '', 
    pincode: ''
  });

  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [isRestored, setIsRestored] = useState(false);

  // ✅ Restore checkout data (form + address + promo) but NOT totals (context handles that)
// ✅ Restore checkout data (form + address + cart + promo)
// ✅ Restore from localStorage
useEffect(() => {
  const stored = localStorage.getItem("cartData");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.cartItems) setCartItems(parsed.cartItems);
    if (parsed.promo) setPromo(parsed.promo); // must be full object
  }
}, []);

// ✅ Save cart + promo to localStorage
useEffect(() => {
  localStorage.setItem("cartData", JSON.stringify({ cartItems, promo }));
}, [cartItems, promo]);



  

  useEffect(() => {
    const fetchShippingMethods = async () => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Failed to fetch shipping methods:", error.message);
        return;
      }

      if (data) {
        const options = data.map((method: any) => {
          // Price from rates JSON
          let price = method.rates?.base ?? 0;

          // Delivery estimate from rates JSON fallback to column
          let deliveryTime = method.rates?.delivery_estimate ?? method.delivery_estimate ?? "";

          // Comment from rates JSON fallback to column
          let comment = method.rates?.comment ?? method.comment ?? "";

          // Disabled
          const enabled = method.enabled;

          // Free standard delivery example
          if (method.type === "standard" && finalTotalFromCart > 999) {
            price = 0;
          }

          return {
            id: method.type,
            name: method.name,
            price,
            comment,
            deliveryTime,
            enabled,
          };
        });

        setDeliveryOptions(options);

        if (options.length > 0) {
          setFormData(prev => ({ ...prev, deliveryOption: options[0].id }));
        }
      }
    };

    fetchShippingMethods();
  }, [finalTotalFromCart]);





const [defaultAddressId, setDefaultAddressId] = useState<number | null>(null);

  //const deliveryOptions = [
    //{ id: 'standard', name: 'Standard Delivery', time: '5-7 business days', price: roundedSubtotal > 499 ? 0 : 49, description: 'Free delivery on orders above ₹499' },
    //{ id: 'express', name: 'Express Delivery', time: '2-3 business days', price: 99, description: 'Faster delivery for urgent orders' },
    //{ id: 'premium', name: 'Premium Delivery', time: 'Next day delivery', price: 199, description: 'Get your order tomorrow' }
  //];

  const [userId, setUserId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [editAddressData, setEditAddressData] = useState({
    full_name: '',
    email: '',
    country_code: '+91',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleEditClick = (addr: any) => {
    setEditingAddressId(addr.id);
    setEditAddressData({
      full_name: addr.full_name,
      email: addr.email,
      country_code: addr.country_code || '+91', // added
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
  };

  const handleEditAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateAddress = async () => {
  // Prevent multiple clicks if already submitting or if no address is being edited
  if (!editingAddressId || isSubmittingAddress) return;

  // Start the loading state immediately
  setIsSubmittingAddress(true);

  try {
    const updateData = {
      full_name: editAddressData.full_name,
      email: editAddressData.email,
      country_code: editAddressData.country_code || '+91',
      phone: editAddressData.phone,
      address: editAddressData.address,
      city: editAddressData.city,
      state: editAddressData.state,
      pincode: editAddressData.pincode
    };

    const { error } = await supabase.from('addresses').update(updateData).eq('id', editingAddressId);

    if (error) {
      throw error;
    }

    // Update the address list in the UI
    setSavedAddresses(prev =>
      prev.map(item => (item.id === editingAddressId ? { ...item, ...updateData } : item))
    );

    // ✅ THIS IS THE CRITICAL FIX ✅
    // If the address being edited is the one currently selected, update the main formData too.
    if (selectedAddressId === editingAddressId) {
      setFormData(prev => ({
        ...prev,
        fullName: updateData.full_name,
        email: updateData.email,
        countryCode: updateData.country_code,
        phone: updateData.phone,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        pincode: updateData.pincode
      }));
    }

    setEditingAddressId(null); // Exit editing mode
    setErrorMsg(''); // Clear any previous errors

  } catch (error: any) {
    setErrorMsg('Failed to update address: ' + error.message);
  } finally {
    // IMPORTANT: Always stop the loading state
    setIsSubmittingAddress(false);
  }
};


  const handleDeleteAddress = async () => {
    if (!editingAddressId) return;

    const { error } = await supabase.from('addresses').delete().eq('id', editingAddressId);

    if (error) {
      setErrorMsg('Failed to delete address: ' + error.message);
    } else {
      setSavedAddresses(prev => prev.filter(item => item.id !== editingAddressId));
      if (selectedAddressId === editingAddressId) {
        setSelectedAddressId(null);
        setFormData(prev => ({
          ...prev,
          fullName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        }));
      }
      setEditingAddressId(null);
      setErrorMsg('');
    }
  };



  // Load user's backend cart on mount and set cartItems in context
  useEffect(() => {
  const loadUserCart = async () => {
    setLoadingCart(true);
    setErrorMsg('');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMsg('User not logged in. Please sign in to continue checkout.');
      setLoadingCart(false);
      return;
    }

    // Set userId state here
    setUserId(user.id);

    const { data, error: cartError } = await supabase
    .from('cart')
    .select(`
      product_id,
      quantity,
      weight,
      unit_price,
      products (
        id,
        name,
        image,
        measurement_unit
      )
    `)
    .eq('user_id', user.id);

    console.log('Checkout Supabase data:', data)

    // Fetch saved addresses
    const { data: addressesData, error: addrError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id);

    if (!addrError && addressesData) {
      setSavedAddresses(addressesData);
      const defaultAddr = addressesData.find(addr => addr.is_default);
      if (defaultAddr) {
        setDefaultAddressId(defaultAddr.id);
        setSelectedAddressId(defaultAddr.id);
        const addr = defaultAddr;
        setFormData(prev => ({
          ...prev,
          fullName: addr.full_name,
          email: addr.email,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode
        }));
      } else if (addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
        // optionally set formData here too
      }
    }

    if (cartError) {
      setErrorMsg('Failed to load your cart items: ' + cartError.message);
    } else if (data) {
      const backendCart = (data as unknown) as CartItemWithProduct[];
      const formattedCart = backendCart.map(item => {
        const product = item.products;
        console.log('Processed cart item product:', product);
        console.log('First item raw:', backendCart);
        console.log('Type of products:', typeof backendCart[0].products);
        if (backendCart.length > 0) {
          console.log('Is array?', Array.isArray(backendCart[0].products));
        } else {
          console.log('backendCart is empty');
        }

        return {
          id: item.product_id,
          quantity: item.quantity,
          weight: item.weight ?? '',
          name: product?.name ?? 'No Name',
          unit_price: item.unit_price ?? 0,
          price: item.unit_price ?? 0,
          image: product?.image ?? '',
          measurement_unit: product?.measurement_unit ?? '',
        };
      });
      console.log('Formatted Cart:', formattedCart);
      setCartItems(formattedCart);
    }
    setLoadingCart(false);
  };

  loadUserCart();
}, [setCartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const deliveryPrice = deliveryOptions.find(opt => opt.id === formData.deliveryOption)?.price || 0;
  //const finalTotal = roundedSubtotal + deliveryPrice;
const displayTotal = finalTotalFromCart + deliveryPrice; // ✅ correct  

const {
  rpErrorMsg,
  isProcessing,
  handleRazorpayPayment,
} = useRazorpay( formData,
  cartItems,
  userId,
  displayTotal,
  navigate,
  subtotalFromCart,
  discountFromCart,
  deliveryPrice,
  promo?.code ?? null
);;


const [errors, setErrors] = useState<{ [key: string]: string }>({});

const validateForm = (): boolean => {
  const newErrors: { [key: string]: string } = {};

  // --- Full Name & Email Validations (Unchanged) ---
  if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    newErrors.email = "Email is invalid";
  }
  if (!formData.countryCode.trim()) {
     newErrors.countryCode = "Country code is required";
  }

  // --- NEW Dynamic Phone Validation Logic ---
  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required";
  } else {
    // 1. Find the selected country from your JSON data
    const selectedCountry = countryPhoneData.find(
      (country) => country.code === formData.countryCode
    );

    if (selectedCountry) {
      const phone = formData.phone.trim();
      const { minLength, maxLength, name } = selectedCountry;

      // 2. Check if the input contains only digits
      if (!/^\d+$/.test(phone)) {
        newErrors.phone = "Phone number must contain only digits.";
      } 
      // 3. Check if the length is within the allowed range
      else if (phone.length < minLength || phone.length > maxLength) {
        // 4. Create a helpful, dynamic error message
        if (minLength === maxLength) {
          newErrors.phone = `Phone number for ${name} must be exactly ${minLength} digits.`;
        } else {
          newErrors.phone = `Phone number for ${name} must be between ${minLength} and ${maxLength} digits.`;
        }
      }
    }
    // Optional: Fallback for a country code not in your list
    else if (!/^\d{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Add this new state variable near your other useState hooks
const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
//const onPlaceOrderClicked = () => {
  //if (!validateForm()) return;
  //handleRazorpayPayment();
//};

// Add this near your other useState hooks
const [isPlacingOrder, setIsPlacingOrder] = useState(false);

const onPlaceOrderClicked = async () => {
  // 1. Prevent multiple clicks if an order is already being placed
  if (isPlacingOrder || isProcessing) return;

  if (!validateForm()) return;

  // 2. Start the loading state immediately to disable the button
  setIsPlacingOrder(true);

  try {
    if (formData.paymentMethod === "card" || formData.paymentMethod === "upi") {
      // Turn off our custom loader; Razorpay's `isProcessing` state will handle the button
      setIsPlacingOrder(false); 
      handleRazorpayPayment();
      return; // Exit the function since Razorpay takes over
    } 
    
    if (formData.paymentMethod === "cod") {
      console.log("COD selected: Starting order creation");

      // This is your original, unchanged try/catch block for the COD logic
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user) {
          console.log("User not logged in");
          setErrorMsg("User not logged in.");
          return;
        }
        console.log("User ID:", user.id);

        const userId = user.id;
        const deliveryPrice = deliveryOptions.find(opt => opt.id === formData.deliveryOption)?.price || 0;
        const totalAmount = finalTotalFromCart + deliveryPrice;

        console.log("Creating order with total amount:", totalAmount);

        // Insert order record
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([{
            user_id: userId,
            payment_method: formData.paymentMethod,
            delivery_option: formData.deliveryOption,
            status: "confirmed",
            subtotal: subtotalFromCart,
            discount: discountFromCart,
            promo_code: promo?.code ?? null,
            delivery_fee: deliveryPrice,
            total: displayTotal,
            address: {
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
            },
            payment_details: null,
          }])
          .select()
          .single();

        if (orderError) {
          console.error("Order insert error:", orderError);
          throw orderError;
        }

        console.log("Order created successfully with ID:", orderData.id);

        // Insert order_items records with dynamic prices
        const orderItems = cartItems.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          weight: item.weight,
          price: calculateItemPrice(item),
        }));

        console.log("Inserting order items with dynamic prices:", orderItems);

        const { error: orderItemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (orderItemsError) {
          console.error("Order items insert error:", orderItemsError);
          throw orderItemsError;
        }

        console.log("Order items inserted successfully");

        // Clear cart after order creation
        const { error: cartClearError } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', userId);

        if (cartClearError) {
          console.error("Cart clear error:", cartClearError);
          throw cartClearError;
        }

        console.log("Cart cleared successfully");
        setCartItems([]);

        // ✅ Increment promo usage only if order + items + cart clear succeeded
        if (promo) {
          try {
            const { error: promoError } = await supabase
              .from("promo_codes")
              .update({
                used_count: (promo.used_count ?? 0) + 1, // fallback in case null
              })
              .eq("id", promo.id);

            if (promoError) {
              console.error("Promo usage update error:", promoError);
            } else {
              console.log("✅ Promo usage incremented for COD order");
            }
          } catch (err) {
            console.error("Unexpected error updating promo usage:", err);
          }
        }

        // 🔥 Trigger shipment creation for COD
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) {
          console.error("No auth token found for COD shipment");
          throw new Error("Not authenticated");
        }

        const shipmentRes = await fetch(
          "https://bvnjxbbwxsibslembmty.functions.supabase.co/create-shipment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ order_id: orderData.id }),
          }
        );

        if (!shipmentRes.ok) {
          const errText = await shipmentRes.text();
          throw new Error("Shipment creation failed: " + errText);
        }

        const shipmentData = await shipmentRes.json();
        console.log("✅ Shipment created for COD order:", shipmentData);

        // Navigate to order confirmation page
        localStorage.removeItem('checkoutData');
        setPromo(null)

        // After order is created successfully
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: JSON.stringify({
              orderId: orderData.id,
              email: "tamoorpremium@gmail.com", // TESTING
              //email: customerEmail, // Uncomment in production
            }),
          });
        } catch (err) {
          console.error('❌ COD confirmation email failed:', err);
        }

        console.log("Redirecting to order confirmation page");
        navigate(`/order-confirmation?orderId=${orderData.id}`);

      } catch (error: unknown) {
        console.error("Order creation error:", error);
        if (error instanceof Error) {
          setErrorMsg("Failed to create order: " + error.message);
        } else if (typeof error === "string") {
          setErrorMsg(error);
        } else if (typeof error === "object" && error !== null && "message" in error) {
          // @ts-ignore
          setErrorMsg("Failed to create order: " + error.message);
        } else {
          setErrorMsg("An unexpected error occurred");
        }
      }
    }
  } finally {
    // 3. IMPORTANT: Always stop the loading state when the process is finished or fails
    setIsPlacingOrder(false);
  }
};


// Define a type or interface for your cart item if available, otherwise use `any` temporarily:
const calculateItemPrice = (item: CartItem) => {
  return Math.round(item.unit_price * item.quantity * 100) / 100;
};



const handleAddressSelect = (id: number) => {
  setSelectedAddressId(id);
  setAddingNewAddress(false);
  // Clear the error instantly when the user makes a selection
  setAddressError(''); 
};

const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewAddress(prev => ({ ...prev, [name]: value }));
};

const handleSaveNewAddress = async () => {
  // 1. Prevent multiple clicks if a submission is already in progress
  if (isSubmittingAddress) return;

  // 2. Start the loading state immediately
  setIsSubmittingAddress(true);
  setErrorMsg(''); // Clear previous errors

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // It's better to throw an error to be caught below
      throw new Error('User not logged in.');
    }

    // You can add validation logic here if you want immediate feedback for the user

    const { data, error } = await supabase.from('addresses').insert([
      { 
        user_id: user.id,
        full_name: newAddress.full_name,
        email: newAddress.email,
        country_code: newAddress.country_code || '+91',
        phone: newAddress.phone,
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode
      }
    ]).select().single();

    // If there's a database error, throw it
    if (error) {
      throw error;
    }

    // If successful, update the UI state
    if (data) {
      setSavedAddresses(prev => [...prev, data]);
      setSelectedAddressId(data.id);
      setAddingNewAddress(false);

      // Automatically fill the main form with the new address details
      setFormData(prev => ({
        ...prev,
        fullName: data.full_name,
        email: data.email,
        countryCode: data.country_code,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode
      }));

      // Reset the new address form for the next time
      setNewAddress({
        full_name: '',
        email: '',
        country_code: '+91',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
    }
  } catch (error: any) {
    // Set a user-friendly error message if anything in the try block fails
    setErrorMsg('Failed to save new address: ' + error.message);
  } finally {
    // 3. IMPORTANT: Always stop the loading state, whether the request succeeded or failed
    setIsSubmittingAddress(false);
  }
};



 const handleNextStep = () => {
    // --- Logic for Step 1 ---
    if (currentStep === 1) {
      if (!selectedAddressId) {
        setAddressError('Please select or add a delivery address to continue.');
        return; // Stop here if nothing is selected
      }

      // Find the address that matches the selected ID
      const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);

      if (selectedAddr) {
        // --- THIS IS THE FIX ---
        // Populate formData *and* set the next step in the SAME handler.
        // React will batch these updates together.
        setFormData(prev => ({
          ...prev,
          fullName: selectedAddr.full_name,
          email: selectedAddr.email,
          phone: selectedAddr.phone,
          countryCode: selectedAddr.country_code || '+91', // Ensure country code is copied
          address: selectedAddr.address,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pincode
        }));
        
        setAddressError('');
        setCurrentStep(currentStep + 1); // Move to next step

      } else {
        // This is a safety catch in case selectedAddressId is set
        // but the address isn't found in the state (e.g., a state sync issue).
        setAddressError('Address details are missing. Please select or add an address again.');
        return;
      }
      
    // --- Logic for Steps 2 & 3 ---
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  

  if (loadingCart) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading your cart...</div>;
  }

  if (errorMsg) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">{errorMsg}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-24 sm:pt-32">
      <div className="container mx-auto px-4 pb-16 sm:pb-20">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-neutral-800 mb-2 sm:mb-4">
            Secure <span className="tamoor-gradient font-serif font-extrabold">CHECKOUT</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 font-medium">
            Complete your order with our secure checkout process
          </p>
        </div>

        {/* Progress Bar */}
        <div className="luxury-card glass rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="overflow-x-auto pb-2 -mb-2">
            <div className="flex items-center justify-between min-w-max gap-3 sm:gap-6">
              {[{ id: 1, name: 'Address', icon: MapPin }, { id: 2, name: 'Delivery', icon: Truck }, { id: 3, name: 'Review', icon: Check }, { id: 4, name: 'Payment', icon: CreditCard }].map((step, i, arr) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${currentStep >= step.id ? 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white shadow-lg' : 'bg-neutral-200 text-neutral-500'}`}>
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="ml-3 sm:ml-4 text-sm sm:text-base">
                    <div className={`font-display font-semibold ${currentStep >= step.id ? 'text-luxury-gold' : 'text-neutral-500'}`}>
                      {step.name}
                    </div>
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300 mx-2 sm:mx-4 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Layout using Flexbox */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* Order Summary (First in DOM for mobile, moved right on desktop) */}
          <div className="lg:w-1/3 lg:order-last">
            <div className="lg:sticky top-28">
              <div className="luxury-card glass rounded-3xl p-6 sm:p-8 space-y-4 mb-8 lg:mb-0">
                <h3 className="font-display font-semibold text-lg sm:text-xl mb-4">Order Summary</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-base font-medium text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotalFromCart.toFixed(2)}</span>
                  </div>
                  {discountFromCart > 0 && (
                    <div className="flex justify-between text-green-600 font-medium text-sm sm:text-base">
                      <span>Discount {promoCodeFromCart ? `(${promoCodeFromCart.code})` : ""}</span>
                      <span>-₹{discountFromCart.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm sm:text-base font-medium text-neutral-600">
                    <span>Delivery</span>
                    <span className="font-semibold">
                      {deliveryOptions.find(opt => opt.id === formData.deliveryOption)?.price === 0 ? "FREE" : `₹${deliveryPrice}`}
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-xl font-display font-semibold">Total</span>
                    <span className="text-xl sm:text-2xl font-display font-bold tamoor-gradient">
                      ₹{displayTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-center text-xs sm:text-sm text-neutral-500 pt-4 space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <span>🔒 Secure Payment</span>
                    <span>📦 Fast Delivery</span>
                  </div>
                  <p>Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:w-2/3">
            <div className="luxury-card glass rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <div className="animate-slide-up space-y-4">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-800 mb-4 sm:mb-6">Delivery Address</h2>
                  {savedAddresses.length === 0 && !addingNewAddress && <p className="text-neutral-500">No saved addresses found.</p>}
                  <div className="max-h-60 overflow-y-auto space-y-3 sm:space-y-4 pr-2">
                    {savedAddresses.map(addr => (
                      <div key={addr.id} className="border border-white/20 p-3 rounded-lg">
                        {editingAddressId === addr.id ? (
                          <div className="space-y-3">
                            <input name="full_name" value={editAddressData.full_name} onChange={handleEditAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" placeholder="Full Name" />
                            <input name="email" value={editAddressData.email} onChange={handleEditAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" placeholder="Email" />
                            
                            <div className="flex items-center gap-2">
                              <select name="country_code" value={editAddressData.country_code} onChange={handleEditAddressChange} className="p-3 rounded-xl neomorphism-inset w-1/3 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base appearance-none">
                                {countryPhoneData.map(country => <option key={country.iso} value={country.code}>{country.iso} ({country.code})</option>)}
                              </select>
                              <input name="phone" value={editAddressData.phone} onChange={handleEditAddressChange} placeholder="Phone Number" className="p-3 rounded-xl neomorphism-inset w-2/3 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                            </div>
                            {errors.phone && <p className="text-red-500 text-sm font-semibold -mt-2 ml-1">{errors.phone}</p>}

                            <input name="address" value={editAddressData.address} onChange={handleEditAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" placeholder="Address" />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input name="city" value={editAddressData.city} onChange={handleEditAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" placeholder="City" />
                              <select name="state" value={editAddressData.state} onChange={handleEditAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base">
                                <option value="">Select State</option>
                                {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                              </select>
                            </div>
                            <input name="pincode" value={editAddressData.pincode} onChange={handleEditAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" placeholder="PIN Code" />
                            
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <button type="button" className="btn-premium text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold flex-1 disabled:opacity-70" onClick={handleUpdateAddress} disabled={isSubmittingAddress}>
                                {isSubmittingAddress ? 'Updating...' : 'Update'}
                              </button>
                              <button type="button" className="btn-outline-danger px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold flex-1 disabled:opacity-70" onClick={handleDeleteAddress} disabled={isSubmittingAddress}>
                                Delete
                              </button>
                              <button type="button" className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-gray-600 hover:text-gray-900 flex-1" onClick={() => setEditingAddressId(null)} disabled={isSubmittingAddress}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                            <label className="flex items-start cursor-pointer text-sm sm:text-base break-words w-full">
                              <input type="radio" name="selectedAddress" checked={selectedAddressId === addr.id} onChange={() => handleAddressSelect(addr.id)} className="mr-3 mt-1 flex-shrink-0" />
                              <span className="flex-1">{addr.full_name}, {addr.address}, {addr.city}, {addr.state} - {addr.pincode}</span>
                            </label>
                            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                              {defaultAddressId === addr.id ? (
                                <span className="text-green-600 font-semibold text-xs sm:text-sm">Default</span>
                              ) : (
                                <button type="button" className="px-3 py-1 text-xs rounded-full font-semibold text-white bg-gradient-to-r from-luxury-gold to-luxury-gold-light shadow-lg hover:brightness-110 transition" onClick={async (e) => { e.preventDefault(); if (!userId) return; await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId); const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addr.id); if (!error) setDefaultAddressId(addr.id); else setErrorMsg('Failed to set default: ' + error.message); }}>Set Default</button>
                              )}
                              <button type="button" className="px-3 py-1 text-xs rounded-full font-semibold text-white bg-gradient-to-r from-luxury-gold to-luxury-gold-light shadow-lg hover:brightness-110 transition" onClick={() => handleEditClick(addr)}>Edit</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-premium text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold" onClick={() => setAddingNewAddress(!addingNewAddress)}>
                    {addingNewAddress ? 'Cancel New Address' : 'Add New Address'}
                  </button>
                  {addingNewAddress && (
                    <div className="border border-white/20 p-4 sm:p-6 rounded-xl shadow-lg space-y-3">
                      <input name="full_name" placeholder="Full Name" value={newAddress.full_name} onChange={handleNewAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                      <input name="email" placeholder="Email" value={newAddress.email} onChange={handleNewAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                      
                      <div className="flex items-center gap-2">
                          <select name="country_code" value={newAddress.country_code} onChange={handleNewAddressChange} className="p-3 rounded-xl neomorphism-inset w-1/3 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base appearance-none">
                              {countryPhoneData.map(country => <option key={country.iso} value={country.code}>{country.iso} ({country.code})</option>)}
                          </select>
                          <input name="phone" placeholder="Phone Number" value={newAddress.phone} onChange={handleNewAddressChange} className="p-3 rounded-xl neomorphism-inset w-2/3 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                      </div>
                      {errors.phone && <p className="text-red-500 text-sm font-semibold -mt-2 ml-1">{errors.phone}</p>}

                      <input name="address" placeholder="Address" value={newAddress.address} onChange={handleNewAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input name="city" placeholder="City" value={newAddress.city} onChange={handleNewAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                        <select name="state" value={newAddress.state} onChange={handleNewAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base">
                          <option value="">Select State</option>
                          {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <input name="pincode" placeholder="PIN Code" value={newAddress.pincode} onChange={handleNewAddressChange} className="w-full p-3 rounded-xl neomorphism-inset focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 text-sm sm:text-base" />
                      <button type="button" className="btn-premium text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold w-full disabled:opacity-70" onClick={handleSaveNewAddress} disabled={isSubmittingAddress}>
                        {isSubmittingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  )}
                  {addressError && <p className="text-red-500 text-center text-sm font-semibold pt-2">{addressError}</p>}
                </div>
              )}

              {/* Step 2: Delivery */}
              {currentStep === 2 && (
                <div className="animate-slide-up space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-6 sm:mb-8">Delivery Options</h2>
                  <div className="space-y-4 max-h-72 sm:max-h-96 overflow-y-auto pr-2">
                    {deliveryOptions.map(option => (
                      <div key={option.id} className={`neomorphism rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${formData.deliveryOption === option.id ? 'ring-2 ring-luxury-gold bg-luxury-gold/5' : 'hover:shadow-lg'} ${!option.enabled ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => option.enabled && setFormData(prev => ({ ...prev, deliveryOption: option.id }))}>
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 sm:gap-0">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-300 ${formData.deliveryOption === option.id ? 'border-luxury-gold bg-luxury-gold' : 'border-neutral-300'}`}>
                              {formData.deliveryOption === option.id && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                            </div>
                            <div>
                              <h3 className="font-display font-semibold text-sm sm:text-lg text-neutral-800">{option.name}</h3>
                              <p className="text-neutral-600 font-medium text-xs sm:text-sm">{option.comment || "Available"}</p>
                              <p className="text-neutral-500 text-xs sm:text-sm">{option.deliveryTime}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm sm:text-base font-display font-bold tamoor-gradient">
                            {option.price === 0 ? 'FREE' : `₹${option.price}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="animate-slide-up space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-6 sm:mb-8">Review Your Order</h2>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="neomorphism rounded-2xl p-4 sm:p-6 space-y-4">
                      <h3 className="font-display font-semibold text-lg mb-2 sm:mb-4">Order Items</h3>
                      <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-3 sm:space-y-4 pr-2">
                        {cartItems.map((item) => (
                          <div key={`${item.id}-${item.weight}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <img src={item.image} alt={item.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl" />
                              <div>
                                <h4 className="font-display font-semibold text-neutral-800 text-sm sm:text-base">{item.name}</h4>
                                <p className="text-neutral-600 text-xs sm:text-sm">{item.weight} × {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-lg sm:text-xl font-display font-bold tamoor-gradient">
                              ₹{calculateItemPrice(item).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="neomorphism rounded-2xl p-4 sm:p-6">
                      <h3 className="font-display font-semibold text-lg mb-2 sm:mb-4">Delivery Address</h3>
                      <div className="text-neutral-700 text-sm sm:text-base space-y-1">
                        <p className="font-medium">{formData.fullName}</p>
                        <p>{formData.address}</p>
                        <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                        <p>{formData.countryCode} {formData.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div className="animate-slide-up space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {[{ id: 'card', name: 'Credit/Debit Card', icon: '💳' }, { id: 'upi', name: 'UPI Payment', icon: '📱' }, { id: 'cod', name: 'Cash on Delivery', icon: '💰' }].map((method) => (
                      <button key={method.id} type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))} className={`glass rounded-2xl p-4 sm:p-6 w-full cursor-pointer text-center transition-all duration-300 outline-none focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 ${formData.paymentMethod === method.id ? 'ring-2 ring-luxury-gold bg-luxury-gold/10 shadow-lg' : 'hover:shadow-md bg-white/10'}`}>
                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 select-none">{method.icon}</div>
                        <div className={`font-display font-semibold select-none text-sm sm:text-base ${formData.paymentMethod === method.id ? 'text-luxury-gold' : 'text-neutral-700'}`}>{method.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
                <button onClick={handlePrevStep} disabled={currentStep === 1} className="px-6 sm:px-8 py-3 sm:py-4 glass rounded-full font-semibold text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 w-full sm:w-auto">
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button onClick={handleNextStep} className="btn-premium text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold w-full sm:w-auto">
                    Continue
                  </button>
                ) : (
                  // This is the NEW, corrected button code
                  <button 
                    onClick={onPlaceOrderClicked} 
                    disabled={isProcessing || isPlacingOrder} // Disable for EITHER online payment or COD
                    className="btn-premium text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold w-full sm:w-auto disabled:opacity-70"
                  >
                    {isPlacingOrder ? "Placing Order..." : isProcessing ? "Processing..." : "Place Order"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;