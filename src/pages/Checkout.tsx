import React, { useState } from 'react';
import { ChevronRight, CreditCard, Truck, MapPin, Check, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, cartTotal } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Address
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Delivery
    deliveryOption: 'standard',
    // Payment
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const steps = [
    { id: 1, name: 'Address', icon: MapPin },
    { id: 2, name: 'Delivery', icon: Truck },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Review', icon: Check }
  ];

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      time: '5-7 business days',
      price: 0,
      description: 'Free delivery on orders above ₹499'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      time: '2-3 business days',
      price: 99,
      description: 'Faster delivery for urgent orders'
    },
    {
      id: 'premium',
      name: 'Premium Delivery',
      time: 'Next day delivery',
      price: 199,
      description: 'Get your order tomorrow'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const deliveryPrice = deliveryOptions.find(opt => opt.id === formData.deliveryOption)?.price || 0;
  const finalTotal = cartTotal + deliveryPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-neutral-800 mb-4">
            Secure <span className="tamoor-gradient">Checkout</span>
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            Complete your order with our secure checkout process
          </p>
        </div>

        {/* Progress Bar */}
        <div className="luxury-card glass rounded-3xl p-8 mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white shadow-lg'
                    : 'bg-neutral-200 text-neutral-500'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <div className={`font-display font-semibold ${
                    currentStep >= step.id ? 'text-luxury-gold' : 'text-neutral-500'
                  }`}>
                    {step.name}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-neutral-300 mx-8" />
                )}
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
                  <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                    Delivery Address
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      >
                        <option value="">Select State</option>
                        <option value="maharashtra">Maharashtra</option>
                        <option value="delhi">Delhi</option>
                        <option value="karnataka">Karnataka</option>
                        <option value="gujarat">Gujarat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery */}
              {currentStep === 2 && (
                <div className="animate-slide-up">
                  <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                    Delivery Options
                  </h2>
                  
                  <div className="space-y-4">
                    {deliveryOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`neomorphism rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                          formData.deliveryOption === option.id
                            ? 'ring-2 ring-luxury-gold bg-luxury-gold/5'
                            : 'hover:shadow-lg'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, deliveryOption: option.id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                              formData.deliveryOption === option.id
                                ? 'border-luxury-gold bg-luxury-gold'
                                : 'border-neutral-300'
                            }`}>
                              {formData.deliveryOption === option.id && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-display font-semibold text-lg text-neutral-800">
                                {option.name}
                              </h3>
                              <p className="text-neutral-600 font-medium">{option.description}</p>
                              <p className="text-sm text-neutral-500">{option.time}</p>
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

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="animate-slide-up">
                  <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                    Payment Method
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                        { id: 'upi', name: 'UPI Payment', icon: '📱' },
                        { id: 'cod', name: 'Cash on Delivery', icon: '💰' }
                      ].map((method) => (
                        <div
                          key={method.id}
                          className={`neomorphism rounded-2xl p-6 cursor-pointer text-center transition-all duration-300 ${
                            formData.paymentMethod === method.id
                              ? 'ring-2 ring-luxury-gold bg-luxury-gold/5'
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                        >
                          <div className="text-4xl mb-3">{method.icon}</div>
                          <div className="font-display font-semibold text-neutral-800">
                            {method.name}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Card Details */}
                    {formData.paymentMethod === 'card' && (
                      <div className="neomorphism rounded-2xl p-6 animate-slide-up">
                        <h3 className="font-display font-semibold text-lg mb-6">Card Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Card Number *
                            </label>
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
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Expiry Date *
                            </label>
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
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              CVV *
                            </label>
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
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Name on Card *
                            </label>
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
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="animate-slide-up">
                  <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                    Review Your Order
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div className="neomorphism rounded-2xl p-6">
                      <h3 className="font-display font-semibold text-lg mb-4">Order Items</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={`${item.id}-${item.weight}`} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-xl"
                              />
                              <div>
                                <h4 className="font-display font-semibold text-neutral-800">
                                  {item.name}
                                </h4>
                                <p className="text-neutral-600 text-sm">
                                  {item.weight} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-lg font-display font-bold tamoor-gradient">
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="neomorphism rounded-2xl p-6">
                      <h3 className="font-display font-semibold text-lg mb-4">Delivery Address</h3>
                      <div className="text-neutral-700">
                        <p className="font-medium">{formData.fullName}</p>
                        <p>{formData.address}</p>
                        <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                        <p>{formData.phone}</p>
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
                  <button
                    onClick={handleNextStep}
                    className="btn-premium text-white px-8 py-4 rounded-full font-semibold"
                  >
                    Continue
                  </button>
                ) : (
                  <button className="btn-premium text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Place Order</span>
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
                <div className="flex justify-between">
                  <span className="text-neutral-600 font-medium">Subtotal</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-600 font-medium">Delivery</span>
                  <span className="font-semibold">
                    {deliveryPrice === 0 ? 'FREE' : `₹${deliveryPrice}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-display font-semibold">Total</span>
                  <span className="text-3xl font-display font-bold tamoor-gradient">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500 mb-4">
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