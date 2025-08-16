import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-900 text-white relative">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-display font-bold luxury-gradient mb-4">
                NutriLux Premium
              </h3>
              <p className="text-neutral-400 leading-relaxed font-medium">
                Your trusted destination for the world's finest dry fruits and nuts, 
                curated with passion and delivered with excellence.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-neutral-400 hover:text-luxury-gold transition-colors duration-300 group">
                <MapPin className="w-5 h-5 mr-4 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">123 Premium Plaza, Mumbai, India 400001</span>
              </div>
              <div className="flex items-center text-neutral-400 hover:text-luxury-gold transition-colors duration-300 group">
                <Phone className="w-5 h-5 mr-4 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">+91 98765 43210</span>
              </div>
              <div className="flex items-center text-neutral-400 hover:text-luxury-gold transition-colors duration-300 group">
                <Mail className="w-5 h-5 mr-4 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">hello@nutriluxpremium.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-display font-semibold mb-8 text-white">Quick Links</h4>
            <ul className="space-y-4">
              {['About Us', 'Our Story', 'Premium Collection', 'Blog & Recipes', 'Contact Us', 'FAQ & Support'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-display font-semibold mb-8 text-white">Premium Categories</h4>
            <ul className="space-y-4">
              {['Luxury Nuts', 'Exotic Dried Fruits', 'Superfood Seeds', 'Artisan Trail Mixes', 'Gift Collections', 'Organic Selection'].map((category) => (
                <li key={category}>
                  <a href="#" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xl font-display font-semibold mb-8 text-white">Customer Care</h4>
            <ul className="space-y-4">
              {['Order Tracking', 'Premium Shipping', 'Easy Returns', 'Size & Quality Guide', 'Privacy Policy', 'Terms of Service'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Awards */}
        <div className="border-t border-neutral-800 mt-16 pt-12">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
            <div className="flex items-center space-x-8">
              <span className="text-neutral-400 font-medium">Connect with us:</span>
              <div className="flex space-x-4">
                {[
                  { icon: Facebook, color: 'hover:text-blue-500', bg: 'hover:bg-blue-500/10' },
                  { icon: Twitter, color: 'hover:text-blue-400', bg: 'hover:bg-blue-400/10' },
                  { icon: Instagram, color: 'hover:text-pink-500', bg: 'hover:bg-pink-500/10' },
                  { icon: Youtube, color: 'hover:text-red-500', bg: 'hover:bg-red-500/10' }
                ].map(({ icon: Icon, color, bg }, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`text-neutral-400 ${color} ${bg} transition-all duration-300 p-3 rounded-full hover:scale-110 transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <span className="text-neutral-400 font-medium">Secure payments:</span>
              <div className="flex space-x-3">
                {['💳', '🏦', '📱', '💰'].map((emoji, index) => (
                  <div key={index} className="w-12 h-12 glass rounded-lg flex items-center justify-center text-lg hover:scale-110 transition-transform duration-300">
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Awards & Certifications */}
        <div className="border-t border-neutral-800 mt-12 pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-8">
              <span className="text-neutral-400 font-medium">Certified by:</span>
              <div className="flex space-x-4">
                {['🏆 ISO 9001', '🌱 Organic', '⭐ Premium', '🛡️ Safe'].map((cert, index) => (
                  <div key={index} className="text-sm text-neutral-400 font-medium bg-neutral-800 px-4 py-2 rounded-full">
                    {cert}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={scrollToTop}
              className="btn-premium text-white p-3 rounded-full hover:scale-110 transition-all duration-300"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
          <p className="text-neutral-400 font-medium">
            © 2024 NutriLux Premium. All rights reserved. Crafted with ❤️ for healthy luxury living.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;