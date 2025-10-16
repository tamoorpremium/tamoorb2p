import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Facebook, Instagram, Twitter, Youtube, Linkedin, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const form = e.target as HTMLFormElement;
      form.classList.add('animate-pulse');
      setTimeout(() => form.classList.remove('animate-pulse'), 500);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.from('contact_messages').insert([formData]);
      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Message sent successfully! ✅");
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err: any) {
      toast.error("Something went wrong. Please try again.");
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 99009 99786', '+91 72599 66388'],
      description: 'Mon-Sat 10AM-10PM IST'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['inquiry@tamoor.in', 'support@tamoor.in'],
      description: 'We reply within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Rahmania Complex , Doddapete', 'Kolar, India 563101'],
      description: 'Our flagship store'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon-Fri: 10AM-11PM', 'Sat-Sun: 10AM-10PM'],
      description: 'Sunday: Voila!! We Are open on Sundays as well'
    }
  ];

  const faqs = [
    { q: 'How to place a bulk order?', a: 'You can contact us directly via phone/email or select "Bulk Order" in the contact form.' },
    { q: 'What are your shipping policies?', a: 'We deliver PAN-India within 2–5 working days. Free shipping on premium orders above ₹2000.' },
    { q: 'How to track my order?', a: 'You can log in to your profile and view order tracking details anytime.' },
    { q: 'Return and refund policy', a: 'We offer a 7-day return policy if the package is unopened and tamper-free.' },
    { q: 'Product quality guarantee', a: 'All our products are 100% premium-grade, hygienically packed, and lab tested.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-luxury-gold rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-sage rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 text-luxury-gold mb-6">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-luxury-gold"></div>
              <span className="text-sm font-medium tracking-wider uppercase">Get in Touch</span>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-800 mb-6">
              Contact <span className="tamoor-gradient font-serif font-extrabold">TAMOOR</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Have questions about our premium dry fruits? Need personalized recommendations? 
              Our expert team is here to help you find the perfect products.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="luxury-card neomorphism rounded-3xl p-8 text-center group hover:shadow-luxury-lg transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-light flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform duration-300">
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4 group-hover:text-luxury-gold transition-colors duration-300">
                  {info.title}
                </h3>
                <div className="space-y-2 mb-3">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-neutral-700 font-medium">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-neutral-500 text-sm font-medium">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="luxury-card glass rounded-3xl p-8">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">
                Send us a Message
              </h2>
              
              {isSubmitted ? (
                <div className="text-center py-12 animate-slide-up">
                  <CheckCircle className="w-16 h-16 text-luxury-sage mx-auto mb-6" />
                  <h3 className="text-2xl font-display font-bold text-luxury-sage mb-4">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-neutral-600 font-medium">
                    Thank you for contacting TAMOOR. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 ${
                          errors.name ? 'ring-2 ring-red-500' : ''
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
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
                      className={`w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 ${
                        errors.email ? 'ring-2 ring-red-500' : ''
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300"
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="bulk-order">Bulk Order</option>
                      <option value="quality-concern">Quality Concern</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full p-4 neomorphism-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all duration-300 resize-none ${
                        errors.message ? 'ring-2 ring-red-500' : ''
                      }`}
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Embedded Map */}
              <div className="luxury-card glass rounded-3xl overflow-hidden">
                <iframe
                  title="Tamoor Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31109.464049768034!2d78.11343050470784!3d13.136126749302781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3badf1f1e6c7240b%3A0xce99d2f2ed53f683!2sTamoor%20Dry%20Fruits!5e0!3m2!1sen!2sin!4v1726746920000!5m2!1sen!2sin"
                  className="w-full h-80 border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>


             {/* FAQ Quick Links */}
<div className="luxury-card glass rounded-3xl p-8">
  <h3 className="text-2xl font-display font-bold text-neutral-800 mb-6">
    Quick Help
  </h3>
  <div className="space-y-4">
    {[
      {
        q: "How do I place an order on Tamoor?",
        a: "Simply browse our products, add items to your cart, and proceed to checkout. You can pay securely using UPI, cards, or net banking."
      },
      {
        q: "Can I checkout without creating an account?",
        a: "No, login is required for checkout to ensure order tracking and loyalty benefits. You can sign up within seconds using your email or phone."
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "Currently, we only accept prepaid orders through secure online payments."
      },
      {
        q: "How long does delivery usually take?",
        a: "We deliver PAN-India within 2–5 business days. Express shipping is available for select locations."
      },
      {
        q: "Do you ship internationally?",
        a: "At present, Tamoor ships only within India. International shipping will be introduced soon."
      },
      {
        q: "Are Tamoor dry fruits organic or premium grade?",
        a: "All our products are carefully handpicked, premium grade, and undergo strict quality checks. Organic options are also available."
      },
      {
        q: "Do you offer gift packaging?",
        a: "Yes! We provide luxury gift boxes and bulk gifting options for corporate and personal occasions."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, credit/debit cards, net banking, and wallet payments. All transactions are encrypted and secure."
      },
      {
        q: "Can I get a GST invoice for my order?",
        a: "Yes, every order comes with a GST invoice, which you can also download from your profile after purchase."
      },
      {
        q: "What are loyalty points and how do I use them?",
        a: "You earn loyalty points on every order. These can be redeemed at checkout for discounts on future purchases."
      },
      {
        q: "What is your return/refund policy?",
        a: "If you receive a damaged or incorrect product, you can request a return or refund within 7 days of delivery."
      },
      {
        q: "How do I track my order?",
        a: "You can track your order in real-time from your profile page under 'Order History'. A tracking link is also shared via email."
      }
    ].map((faq, index) => (
      <details
        key={index}
        className="group p-4 rounded-xl hover:bg-white/20 transition-all duration-300"
      >
        <summary className="cursor-pointer font-medium text-neutral-700 group-hover:text-luxury-gold">
          {faq.q}
        </summary>
        <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
          {faq.a}
        </p>
      </details>
    ))}
  </div>
</div>

            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-gradient-to-br from-neutral-900 via-neutral-800 to-luxury-charcoal text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-6">
            Connect with <span className="tamoor-gradient font-serif font-extrabold">TAMOOR</span>
          </h2>
          <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">
            Follow us on social media for the latest updates, recipes, and exclusive offers
          </p>
          
          <div className="flex justify-center space-x-6">
            {[
              { name: 'Facebook', icon: Facebook, color: 'hover:text-blue-400', url: 'https://www.facebook.com/people/Tamoor-Kolar/61572179471006/' },
              { name: 'Instagram', icon: Instagram, color: 'hover:text-pink-400', url: 'https://www.instagram.com/tamoor_kolar/#' },
              { name: 'Twitter', icon: Twitter, color: 'hover:text-blue-300', url: 'https://twitter.com' },
              { name: 'YouTube', icon: Youtube, color: 'hover:text-red-400', url: 'https://youtube.com' },
              { name: 'LinkedIn', icon: Linkedin, color: 'hover:text-blue-500', url: 'https://linkedin.com' }
            ].map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-16 h-16 glass rounded-full flex items-center justify-center text-2xl ${social.color} transition-all duration-300 hover:scale-110 hover:rotate-12`}
              >
                <social.icon className="w-7 h-7" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Contact;
