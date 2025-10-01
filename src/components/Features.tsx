import React, { useEffect, useRef } from 'react';
import { Truck, Shield, Award, Headphones, Leaf, Clock } from 'lucide-react';

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-slide-up');
                card.classList.remove('opacity-0');
                card.classList.add('opacity-100');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 } // 👈 better reliability for mobile
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Truck,
      title: 'Free Premium Delivery',
      description: 'Complimentary shipping on orders above ₹999',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: '100% premium quality with money-back guarantee',
      gradient: 'from-luxury-sage to-luxury-sage-dark',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: Award,
      title: 'Premium Sourcing',
      description: "Directly sourced from the world's finest farms",
      gradient: 'from-luxury-gold to-luxury-gold-light',
      bgGradient: 'from-amber-50 to-yellow-50'
    },
    {
      icon: Headphones,
      title: '24/7 Concierge',
      description: 'Dedicated customer service for premium experience',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      icon: Leaf,
      title: 'Sustainably Sourced',
      description: 'Eco-friendly practices and ethical sourcing',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: Clock,
      title: 'Fresh Guarantee',
      description: 'Maximum freshness with optimal storage',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-luxury-cream to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 text-luxury-gold mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-luxury-gold"></div>
            <span className="text-sm font-medium tracking-wider uppercase">Why Choose Us</span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-800 mb-6">
            The <span className="luxury-gradient font-serif">TAMOOR</span> Promise
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
            We're committed to delivering the finest quality dry fruits with exceptional service,
            sustainable practices, and an unmatched premium experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group text-center opacity-0"
            >
              <div
                className={`luxury-card neomorphism rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-br ${feature.bgGradient} hover:shadow-luxury-lg transition-all duration-500`}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-8 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-semibold text-neutral-800 mb-4 group-hover:text-luxury-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed font-medium text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trusted Badges */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-neutral-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-luxury-gold rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Trusted by 50,000+ customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 bg-luxury-sage rounded-full animate-pulse"
                style={{ animationDelay: '0.5s' }}
              ></div>
              <span className="text-sm font-medium">ISO certified facilities</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 bg-luxury-gold rounded-full animate-pulse"
                style={{ animationDelay: '1s' }}
              ></div>
              <span className="text-sm font-medium">Award-winning quality</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
