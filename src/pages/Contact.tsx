import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Add shake animation to form
      const form = e.target as HTMLFormElement;
      form.classList.add('animate-pulse');
      setTimeout(() => form.classList.remove('animate-pulse'), 500);
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 87654 32109'],
      description: 'Mon-Sat 9AM-7PM IST'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['hello@tamoor.com', 'support@tamoor.com'],
      description: 'We reply within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Premium Plaza', 'Mumbai, India 400001'],
      description: 'Our flagship store'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon-Fri: 9AM-7PM', 'Sat: 10AM-6PM'],
      description: 'Sunday: Closed'
    }
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
              Contact <span className="tamoor-gradient">TAMOOR</span>
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
                    className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group"
                  >
                    <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Embedded Map */}
              <div className="luxury-card glass rounded-3xl overflow-hidden">
                <div className="h-80 bg-gradient-to-br from-luxury-gold/20 to-luxury-sage/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-luxury-gold mx-auto mb-4" />
                    <h3 className="text-xl font-display font-bold text-neutral-800 mb-2">
                      Visit Our Store
                    </h3>
                    <p className="text-neutral-600 font-medium">
                      Interactive map coming soon
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="luxury-card glass rounded-3xl p-8">
                <h3 className="text-2xl font-display font-bold text-neutral-800 mb-6">
                  Quick Help
                </h3>
                <div className="space-y-4">
                  {[
                    'How to place a bulk order?',
                    'What are your shipping policies?',
                    'How to track my order?',
                    'Return and refund policy',
                    'Product quality guarantee'
                  ].map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-4 hover:bg-white/20 rounded-xl transition-all duration-300 group"
                    >
                      <span className="text-neutral-700 font-medium group-hover:text-luxury-gold">
                        {question}
                      </span>
                    </button>
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
            Connect with <span className="tamoor-gradient">TAMOOR</span>
          </h2>
          <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">
            Follow us on social media for the latest updates, recipes, and exclusive offers
          </p>
          
          <div className="flex justify-center space-x-6">
            {[
              { name: 'Facebook', icon: '📘', color: 'hover:text-blue-400' },
              { name: 'Instagram', icon: '📷', color: 'hover:text-pink-400' },
              { name: 'Twitter', icon: '🐦', color: 'hover:text-blue-300' },
              { name: 'YouTube', icon: '📺', color: 'hover:text-red-400' },
              { name: 'LinkedIn', icon: '💼', color: 'hover:text-blue-500' }
            ].map((social, index) => (
              <button
                key={index}
                className={`w-16 h-16 glass rounded-full flex items-center justify-center text-2xl ${social.color} transition-all duration-300 hover:scale-110 hover:rotate-12`}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;