import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark overflow-hidden">
      {/* Parallax background elements */}
      <div className="absolute inset-0 parallax">
        <div 
          className="parallax-layer opacity-20"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-luxury-gold/20 to-luxury-sage/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-luxury-sage/20 to-luxury-gold/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-luxury-gold/10 to-luxury-sage/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center space-x-3 text-luxury-gold group">
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-medium tracking-wide uppercase">Premium Quality Guaranteed</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-display font-bold leading-tight">
              <span className="text-neutral-800">Premium</span>
              <br />
              <span className="tamoor-gradient">TAMOOR</span>
              <br />
              <span className="text-neutral-600 text-5xl lg:text-6xl">Luxury Dry Fruits</span>
            </h1>
            
            <p className="text-xl text-neutral-600 leading-relaxed max-w-lg font-medium">
              Experience TAMOOR's curated collection of the world's finest dry fruits and nuts, 
              handpicked from premium orchards and delivered with luxury packaging.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg flex items-center justify-center group">
                Explore Collection
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="neomorphism text-neutral-700 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-neomorphism-inset transition-all duration-300">
                View Catalog
              </button>
            </div>
            
            <div className="flex items-center space-x-12 pt-8">
              {[
                { value: '500+', label: 'Premium Products', icon: '🌟' },
                { value: '50K+', label: 'Happy Customers', icon: '❤️' },
                { value: '4.9★', label: 'Customer Rating', icon: '⭐' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl font-display font-bold luxury-gradient mb-1 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-neutral-500 text-sm font-medium flex items-center justify-center gap-1">
                    <span>{stat.icon}</span>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Premium product showcase */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8">
                {[
                  { 
                    emoji: '🥜', 
                    name: 'Himalayan Almonds', 
                    desc: 'Rich in omega-3 & vitamin E', 
                    price: '₹1,299',
                    gradient: 'from-amber-100 to-orange-100',
                    image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400'
                  },
                  { 
                    emoji: '🌰', 
                    name: 'Premium Cashews', 
                    desc: 'Buttery smooth & creamy', 
                    price: '₹1,599',
                    gradient: 'from-rose-100 to-pink-100',
                    image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400'
                  }
                ].map((product, index) => (
                  <div 
                    key={index}
                    className={`luxury-card glass rounded-3xl p-8 bg-gradient-to-br ${product.gradient} group cursor-pointer`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl mb-6">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {product.emoji}
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800 group-hover:text-luxury-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 font-medium">{product.desc}</p>
                    <div className="luxury-gradient font-display font-bold text-lg">{product.price}/kg</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-8 mt-16">
                {[
                  { 
                    emoji: '🥥', 
                    name: 'Turkish Pistachios', 
                    desc: 'Heart-healthy superfood', 
                    price: '₹1,899',
                    gradient: 'from-emerald-100 to-green-100',
                    image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400'
                  },
                  { 
                    emoji: '🍇', 
                    name: 'Medjool Dates', 
                    desc: 'Nature\'s candy', 
                    price: '₹899',
                    gradient: 'from-purple-100 to-indigo-100',
                    image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400'
                  }
                ].map((product, index) => (
                  <div 
                    key={index}
                    className={`luxury-card glass rounded-3xl p-8 bg-gradient-to-br ${product.gradient} group cursor-pointer`}
                    style={{ animationDelay: `${(index + 2) * 0.2}s` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl mb-6">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {product.emoji}
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800 group-hover:text-luxury-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 font-medium">{product.desc}</p>
                    <div className="luxury-gradient font-display font-bold text-lg">{product.price}/kg</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;