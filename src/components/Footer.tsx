import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import AllPayments from "../assets/payments/payments2.svg";
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const certifications = [
    "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/fssai-removebg-preview.png",
    "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/iso-removebg-preview.png",
    "https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/msme-removebg-preview.png"
  ];

  return (
    <footer className="bg-neutral-900 text-white relative overflow-x-hidden">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-20">

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Company Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-display font-bold tamoor-gradient mb-4">TAMOOR</h3>
              <p className="text-neutral-400 leading-relaxed font-medium">
                Your trusted destination for the world's finest dry fruits and nuts, curated with passion and delivered with luxury excellence.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-neutral-400 hover:text-luxury-gold transition-colors duration-300 group">
                <MapPin className="w-5 h-5 mr-4 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Rahmania Complex, Doddapete, Kolar, India 563101</span>
              </div>
              <div className="flex items-center text-neutral-400 hover:text-luxury-gold transition-colors duration-300 group">
                <Phone className="w-5 h-5 mr-4 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">+91 72599 66388</span>
              </div>
              <div className="flex items-center text-neutral-400 hover:text-luxury-gold transition-colors duration-300 group">
                <Mail className="w-5 h-5 mr-4 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">tamoorpremium@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-display font-semibold mb-8 text-white">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block"
                >
                  Premium Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block"
                >
                  Blog & Recipes
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block"
                >
                  FAQ & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Premium Categories */}
          <div>
            <h4 className="text-xl font-display font-semibold mb-8 text-white">Premium Categories</h4>
            <ul className="space-y-4">
              <li><Link to="/products?categoryId=1" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Premium Nuts</Link></li>
              <li><Link to="/products?categoryId=10" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Dried Fruits</Link></li>
              <li><Link to="/products?categoryId=19" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Seeds & Others</Link></li>
              <li><Link to="/products?categoryId=30" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Chocolates</Link></li>
              <li><Link to="/products?categoryId=43" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Premium Gift Hampers</Link></li>
              <li><Link to="/products?categoryId=63" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Scented Candles</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xl font-display font-semibold mb-8 text-white">Customer Care</h4>
            <ul className="space-y-4">
              <li><Link to="/order-tracking" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Order Tracking</Link></li>
              <li><Link to="/shipping-policy" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Premium Shipping</Link></li>
              <li><Link to="/returns-policy" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Easy Returns</Link></li>
              <li><Link to="/size-quality" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Size & Quality Guide</Link></li>
              <li><Link to="/privacy" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-400 hover:text-luxury-gold transition-colors duration-300 font-medium hover:translate-x-1 transform inline-block">Terms of Service</Link></li>
            </ul>
          </div>

        </div> {/* End of Grid */}

        {/* Social Media & Payments */}
        <div className="border-t border-neutral-800 mt-16 pt-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 flex-wrap">
            <div className="flex items-center flex-wrap gap-4">
              <span className="text-neutral-400 font-medium">Connect with us:</span>
              <div className="flex gap-3 flex-wrap">
                {[
                  { icon: Facebook, color: 'hover:text-blue-500', bg: 'hover:bg-blue-500/10', link: 'https://www.facebook.com/people/Tamoor-Kolar/61572179471006/' },
                  { icon: Twitter, color: 'hover:text-blue-400', bg: 'hover:bg-blue-400/10', link: '#' },
                  { icon: Instagram, color: 'hover:text-pink-500', bg: 'hover:bg-pink-500/10', link: 'https://www.instagram.com/tamoor_kolar/#' },
                  { icon: Youtube, color: 'hover:text-red-500', bg: 'hover:bg-red-500/10', link: '#' },
                ].map(({ icon: Icon, color, bg, link }, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-neutral-400 ${color} ${bg} transition-all duration-300 p-3 rounded-full hover:scale-110 transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 font-medium">Secure payments:</span>
              <div className="w-56 md:w-72 lg:w-96 xl:w-[28rem]">
                <img src={AllPayments} alt="All payment methods" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>


        {/* Certifications / Awards */}
        <div className="border-t border-neutral-800 mt-12 pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap">
            <section className="py-12">
              <div className="container mx-auto px-4 flex items-center justify-center gap-8 flex-wrap">
                {certifications.map((logo, i) => (
                  <img key={i} src={logo} alt={`Certification ${i + 1}`} className="h-16 md:h-20 lg:h-24 object-contain transition-transform duration-300 hover:scale-105" />
                ))}
              </div>
            </section>
            <button onClick={scrollToTop} className="btn-premium text-white p-3 rounded-full hover:scale-110 transition-all duration-300">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
          <p className="text-neutral-400 font-medium">
            © 2025 TAMOOR. All rights reserved. Crafted with ❤️ for luxury healthy living.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
 