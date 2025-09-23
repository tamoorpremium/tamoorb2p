import React, { useState, useEffect } from 'react';
import { ChevronRight, CreditCard, Truck, MapPin, Check, Lock } from 'lucide-react';
import { CartItem, useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Products from './Products';
import { useRazorpay } from '../hooks/useRazorpay';  // Adjust the path if needed
import { useLocation } from 'react-router-dom';

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

  console.log("💰 Context totals:", { subtotal, discount, shipping, finalTotal, promo });

  //const [localPromoCode, setLocalPromoCode] = useState(promo);

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
    if (!editingAddressId) return;

    // Make sure country_code is included
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
      setErrorMsg('Failed to update address: ' + error.message);
    } else {
      // Update savedAddresses state with edited data
      setSavedAddresses(prev =>
        prev.map(item => (item.id === editingAddressId ? { ...item, ...updateData } : item))
      );
      setEditingAddressId(null);
      setErrorMsg('');
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

  if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
  if (!formData.email.trim()) newErrors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email is invalid";
  if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
  else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits";

  if (!formData.countryCode.trim()) newErrors.countryCode = "Country code is required";
  else if (!/^\+\d{1,4}$/.test(formData.countryCode)) newErrors.countryCode = "Country code is invalid";


  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

//const onPlaceOrderClicked = () => {
  //if (!validateForm()) return;
  //handleRazorpayPayment();
//};

const onPlaceOrderClicked = async () => {
  if (!validateForm()) return;

  if (formData.paymentMethod === "card" || formData.paymentMethod === "upi") {
    // Proceed with payment gateway
    handleRazorpayPayment();
  } else if (formData.paymentMethod === "cod") {
    console.log("COD selected: Starting order creation");

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
      // email: customerEmail, // Uncomment in production
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
};





// Define a type or interface for your cart item if available, otherwise use `any` temporarily:
const calculateItemPrice = (item: CartItem) => {
  return Math.round(item.unit_price * item.quantity * 100) / 100;
};



const handleAddressSelect = (id: number) => {
  setSelectedAddressId(id);
  const addr = savedAddresses.find(a => a.id === id);
  if (addr) {
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
    setAddingNewAddress(false);
  }
};

const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewAddress(prev => ({ ...prev, [name]: value }));
};

const handleSaveNewAddress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setErrorMsg('User not logged in.');
    return;
  }

  // Save new address with country_code and phone as separate columns
  const { data, error } = await supabase.from('addresses').insert([
    { 
      user_id: user.id,
      full_name: newAddress.full_name,
      email: newAddress.email,
      country_code: newAddress.country_code || '+91', // default if empty
      phone: newAddress.phone,
      address: newAddress.address,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode
    }
  ]).select().single();

  if (error) {
    setErrorMsg('Failed to save new address: ' + error.message);
  } else if (data) {
    setSavedAddresses(prev => [...prev, data]);
    setSelectedAddressId(data.id);
    setAddingNewAddress(false);

    // Update formData with both country_code and phone
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

    setNewAddress({
      full_name: '',
      email: '',
      country_code: '+91', // reset to default
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });

    setErrorMsg('');
  }
};



  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
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
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-neutral-800 mb-4">
            Secure <span className="tamoor-gradient">Checkout</span>
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            Complete your order with our secure checkout process
          </p>
        </div>

        {/* Progress Bar */}
        <div className="luxury-card glass rounded-3xl p-8 mb-12">
          <div className="flex flex-wrap items-center justify-between">
            {[{ id: 1, name: 'Address', icon: MapPin }, { id: 2, name: 'Delivery', icon: Truck },{ id: 3, name: 'Review', icon: Check }, { id: 4, name: 'Payment', icon: CreditCard }].map((step, i, arr) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentStep >= step.id ? 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white shadow-lg' : 'bg-neutral-200 text-neutral-500'}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <div className={`font-display font-semibold ${currentStep >= step.id ? 'text-luxury-gold' : 'text-neutral-500'}`}>
                    {step.name}
                  </div>
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-6 h-6 text-neutral-300 mx-3 sm:mx-8" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="luxury-card glass rounded-3xl p-8">

          {/* Step 1: Address */}
              {currentStep === 1 && (
                <div className="animate-slide-up">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">Delivery Address</h2>

                  {/* Saved Addresses Radio Buttons */}
                  {savedAddresses.length === 0 && <p>No saved addresses found.</p>}

                  {savedAddresses.map(addr => (
                    <div key={addr.id} className="mb-4 border p-3 rounded">
                      {editingAddressId === addr.id ? (
                        <div>
                          {/* Edit Address Form */}
                        <div className="border p-6 rounded-xl shadow-lg">
                          <input
                            name="full_name"
                            value={editAddressData.full_name}
                            onChange={handleEditAddressChange}
                            className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                            placeholder="Full Name"
                          />
                          <input
                            name="email"
                            value={editAddressData.email}
                            onChange={handleEditAddressChange}
                            className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                            placeholder="Email"
                          />
                          <div className="flex space-x-2 mb-4">
                            <input
                              name="country_code"
                              value={editAddressData.country_code}
                              onChange={handleEditAddressChange}
                              placeholder="+91"
                              className="p-4 neomorphism-inset rounded-xl w-24 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                            />
                            <input
                              name="phone"
                              value={editAddressData.phone}
                              onChange={handleEditAddressChange}
                              placeholder="Phone"
                              className="p-4 neomorphism-inset rounded-xl flex-grow focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                            />
                          </div>
                          <input
                            name="address"
                            value={editAddressData.address}
                            onChange={handleEditAddressChange}
                            className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                            placeholder="Address"
                          />
                          <input
                            name="city"
                            value={editAddressData.city}
                            onChange={handleEditAddressChange}
                            className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                            placeholder="City"
                          />
                          <select
                            name="state"
                            value={editAddressData.state}
                            onChange={handleEditAddressChange}
                            className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                          >
                            <option value="">Select State</option>
                            <option value="maharashtra">Maharashtra</option>
                            <option value="delhi">Delhi</option>
                            <option value="karnataka">Karnataka</option>
                            <option value="gujarat">Gujarat</option>
                          </select>
                          <input
                            name="pincode"
                            value={editAddressData.pincode}
                            onChange={handleEditAddressChange}
                            className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                            placeholder="PIN Code"
                          />

                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-3">
                            <button
                              type="button"
                              className="btn-premium text-white px-6 py-3 rounded-full font-semibold flex-grow"
                              onClick={handleUpdateAddress}
                            >
                              Update Address
                            </button>
                            <button
                              type="button"
                              className="btn-outline-danger px-6 py-3 rounded-full font-semibold flex-grow"
                              onClick={handleDeleteAddress}
                            >
                              Delete Address
                            </button>
                            <button
                              type="button"
                              className="px-6 py-3 rounded-full text-gray-600 hover:text-gray-900 flex-grow"
                              onClick={() => setEditingAddressId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={selectedAddressId === addr.id}
                              onChange={() => handleAddressSelect(addr.id)}
                              className="mr-2"
                            />
                            <span className="break-words">{addr.full_name}, {addr.address}, {addr.city}, {addr.state} - {addr.pincode}</span>
                          </label>

                          <div className="flex items-center space-x-2">
                            {defaultAddressId === addr.id ? (
                              <span className="text-green-600 font-semibold">Default</span>
                            ) : (
                              <button
                                type="button"
                                className="px-4 py-2 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white rounded-full font-semibold shadow-lg hover:brightness-110 transition duration-300 focus:outline-none focus:ring-2 focus:ring-luxury-gold/80"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (!userId) return;

                                  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);

                                  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addr.id);

                                  if (!error) {
                                    setDefaultAddressId(addr.id);
                                  } else {
                                    setErrorMsg('Failed to set default address: ' + error.message);
                                  }
                                }}
                              >
                                Set as Default
                              </button>
                            )}

                            <button
                              type="button"
                              className="ml-2 px-4 py-2 bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white rounded-full font-semibold shadow-lg hover:brightness-110 transition duration-300 focus:outline-none focus:ring-2 focus:ring-luxury-gold/80"
                              onClick={() => handleEditClick(addr)}
                            >
                              Edit
                            </button>

                          </div>
                        </div>
                      )}
                    </div>
                  ))}


                  

                  {/* Toggle Add New Address Form */}
                  <button
                    type="button"
                    className="mb-6 btn-premium text-white px-6 py-3 rounded-full font-semibold"
                    onClick={() => setAddingNewAddress(!addingNewAddress)}
                  >
                    {addingNewAddress ? 'Cancel New Address' : 'Add New Address'}
                  </button>

                  {/* Styled New Address Form - Only visible when addingNewAddress is true */}
                  {addingNewAddress && (
                    <div className="border p-6 rounded-xl shadow-lg">
                      <input
                        name="full_name"
                        placeholder="Full Name"
                        value={newAddress.full_name}
                        onChange={handleNewAddressChange}
                        className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                      />
                      <input
                        name="email"
                        placeholder="Email"
                        value={newAddress.email}
                        onChange={handleNewAddressChange}
                        className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                      />
                      <div className="flex space-x-2 mb-4">
                        <input
                          name="country_code"
                          value={newAddress.country_code}
                          onChange={handleNewAddressChange}
                          placeholder="+91"
                          className="p-4 neomorphism-inset rounded-xl w-24 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        />
                        <input
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleNewAddressChange}
                          placeholder="Phone"
                          className="p-4 neomorphism-inset rounded-xl flex-grow focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        />
                      </div>

                      <input
                        name="address"
                        placeholder="Address"
                        value={newAddress.address}
                        onChange={handleNewAddressChange}
                        className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                      />
                      <input
                        name="city"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={handleNewAddressChange}
                        className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                      />
                      <select
                        name="state"
                        value={newAddress.state}
                        onChange={handleNewAddressChange}
                        className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                      >
                        <option value="">Select State</option>
                        <option value="maharashtra">Maharashtra</option>
                        <option value="delhi">Delhi</option>
                        <option value="karnataka">Karnataka</option>
                        <option value="gujarat">Gujarat</option>
                      </select>
                      <input
                        name="pincode"
                        placeholder="PIN Code"
                        value={newAddress.pincode}
                        onChange={handleNewAddressChange}
                        className="mb-4 p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 w-full"
                      />
                      <button
                        type="button"
                        className="btn-premium text-white px-6 py-3 rounded-full font-semibold w-full"
                        onClick={handleSaveNewAddress}
                      >
                        Save Address
                      </button>
                    </div>
                  )}
                </div>
              )}



              {/* Step 2: Delivery */}
              {currentStep === 2 && (
                <div className="animate-slide-up">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">Delivery Options</h2>
                  <div className="space-y-4">
                    {deliveryOptions.map(option => (
                      <div
                        key={option.id}
                        className={`neomorphism rounded-2xl p-6 cursor-pointer transition-all duration-300
                          ${formData.deliveryOption === option.id ? 'ring-2 ring-luxury-gold bg-luxury-gold/5' : 'hover:shadow-lg'}
                          ${!option.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={() => option.enabled && setFormData(prev => ({ ...prev, deliveryOption: option.id }))}
                      >
                        <div className="flex flex-wrap items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300
                              ${formData.deliveryOption === option.id ? 'border-luxury-gold bg-luxury-gold' : 'border-neutral-300'}
                            `}>
                              {formData.deliveryOption === option.id && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                            </div>
                            <div>
                              <h3 className="font-display font-semibold text-lg text-neutral-800">{option.name}</h3>
                              <p className="text-neutral-600 font-medium">{option.comment || "Available"}</p>
                              <p className="text-sm text-neutral-500">{option.deliveryTime}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-display font-bold tamoor-gradient">
                              {option.price === 0 ? 'FREE' : `₹${option.price}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div className="animate-slide-up">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">Payment Method</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[{ id: 'card', name: 'Credit/Debit Card', icon: '💳' }, 
                        { id: 'upi', name: 'UPI Payment', icon: '📱' }, 
                        { id: 'cod', name: 'Cash on Delivery', icon: '💰' }]
                        .map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                            className={`glass rounded-2xl p-6 w-full max-w-xs mx-auto sm:max-w-none cursor-pointer text-center transition-all duration-300 outline-none focus:outline-none
                        ${
                          formData.paymentMethod === method.id
                            ? 'ring-2 ring-red-600 bg-red-700 text-luxury-gold shadow-rose-600'
                            : 'hover:shadow-2xl bg-white/10 text-green-900'
                            //</div>? 'ring-2 ring-luxury-gold bg-white/30 text-luxury-gold shadow-lg'
                            //: 'hover:shadow-lg bg-white/10 text-neutral-800'
                        }
                      `}>
                            <div className="text-4xl mb-3 select-none">{method.icon}</div>
                            <div className="font-display font-semibold select-none">{method.name}</div>
                          </button>
                      ))}
                    </div>

                   {/* {formData.paymentMethod === 'card' && (
                      <div className="neomorphism rounded-2xl p-6 animate-slide-up">
                        <h3 className="font-display font-semibold text-lg mb-6">Card Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Card Number *</label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Expiry Date *</label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">CVV *</label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Name on Card *</label>
                            <input
                              type="text"
                              name="nameOnCard"
                              value={formData.nameOnCard}
                              onChange={handleInputChange}
                              className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                            />
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="animate-slide-up">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-800 mb-8">Review Your Order</h2>
                  <div className="space-y-6">
                    <div className="neomorphism rounded-2xl p-6">
                      <h3 className="font-display font-semibold text-lg mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={`${item.id}-${item.weight}`} className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                              <div>
                                <h4 className="font-display font-semibold text-neutral-800">{item.name}</h4>
                                <p className="text-neutral-600 text-sm">{item.weight} × {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-lg font-display font-bold tamoor-gradient">
                              ₹{calculateItemPrice(item).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="neomorphism rounded-2xl p-6">
                      <h3 className="font-display font-semibold text-lg mb-4">Delivery Address</h3>
                      <div className="text-neutral-700">
                        <p className="font-medium">{formData.fullName}</p>
                        <p>{formData.address}</p>
                        <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                        <p>{formData.countryCode} {formData.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="px-8 py-4 glass rounded-full font-semibold text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                >
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button onClick={handleNextStep} className="btn-premium text-white px-8 py-4 rounded-full font-semibold">Continue</button>
                ) : (
                  <button 
                    onClick={onPlaceOrderClicked} 
                    disabled={isProcessing}
                    className="btn-premium text-white px-8 py-4 rounded-full font-semibold"
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
<div className="lg:col-span-1">
  <div className="luxury-card glass rounded-3xl p-8 sticky top-32">
    <h3 className="font-display font-semibold text-xl mb-6">Order Summary</h3>
    <div className="space-y-4 mb-6">
      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-neutral-600 font-medium">Subtotal</span>
        <span className="font-semibold">₹{subtotalFromCart.toFixed(2)}</span>
      </div>

      {/* Discount */}
      {discountFromCart > 0 && (
        <div className="flex justify-between text-green-600 font-medium">
          <span>
            Discount {promoCodeFromCart ? `(${promoCodeFromCart.code})` : ""}
          </span>
          <span>-₹{discountFromCart.toFixed(2)}</span>
        </div>
      )}

      {/* Delivery */}
      <div className="flex justify-between">
        <span className="text-neutral-600 font-medium">Delivery</span>
        <span className="font-semibold">
          {deliveryOptions.find(opt => opt.id === formData.deliveryOption)?.price === 0
            ? "FREE"
            : `₹${deliveryPrice}`}
        </span>
      </div>
    </div>

    {/* Final Total */}
    <div className="border-t border-white/20 pt-4 mb-8">
      <div className="flex justify-between items-center">
        <span className="text-xl font-display font-semibold">Total</span>
        <span className="text-2xl sm:text-3xl font-display font-bold tamoor-gradient">
          ₹{displayTotal.toFixed(2)}
        </span>
      </div>
    </div>

    {/* Secure Info */}
    <div className="text-center">
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 text-neutral-500 mb-4">
        <span>🔒 Secure Payment</span>
        <span>📦 Fast Delivery</span>
      </div>
      <p className="text-xs text-neutral-500">
        Your payment information is encrypted and secure
      </p>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;