import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark overflow-hidden">
{/* Parallax layer */}
<div
  className="parallax-layer absolute inset-0 overflow-hidden"
  style={{
    transform: `translateY(${scrollY * 0.5}px)`,
    width: '100%',
    height: '100%',
    background: isLargeScreen
      ? "linear-gradient(135deg, #fff3cc 30%, #ffcc00 60%, #d4af37 85%, #b8860b 100%)"
      : "linear-gradient(135deg, #fff3cc 20%, #ffcc00 40%, #d4af37 70%, #b8860b 100%)",
  }}
>
  {/* Shimmer overlay */}
  <div
    className="absolute inset-0 animate-shimmer pointer-events-none"
    style={{
      background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
      backgroundSize: '200% 100%',
    }}
  ></div>

  {/* Floating circles */}
  <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-luxury-gold/20 to-luxury-sage/20 rounded-full blur-3xl animate-float"></div>
  <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-luxury-sage/20 to-luxury-gold/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-luxury-gold/10 to-luxury-sage/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
</div>



      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center space-x-3 text-luxury-gold group">
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-medium tracking-wide uppercase">Premium Quality Guaranteed</span>
            </div>
            
            <h1 className="leading-tight">
              {/* Brand Name with extra-large size and gradient */}
              <span className="font-lobster tamoor-gradient text-7xl sm:text-8xl lg:text-9xl font-bold">
                TAMOOR
              </span>
              <br />

              {/* Descriptor */}
              <span className="font-eagle text-neutral-800 text-4xl sm:text-5xl lg:text-6xl pl-2 sm:pl-4 lg:pl-6">
                  Premium
              </span>
              <br />

              {/* Subtitle */}
              <span className="font-eagle text-neutral-600 text-2xl sm:text-3xl lg:text-5xl pl-4 sm:pl-6 lg:pl-8">
                                    -Luxury Dry Fruits
              </span>
            </h1>

            <p className="text-l text-neutral-600 leading-relaxed max-w-lg font-medium">
              Experience TAMOOR's curated collection of the world's finest dry fruits and nuts, 
              handpicked from premium orchards and delivered with luxury packaging.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
              <button className="btn-premium text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg flex items-center justify-center group">
                Explore Collection
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="neomorphism text-neutral-700 px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:shadow-neomorphism-inset transition-all duration-300">
                View Catalog
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-8 justify-center sm:justify-start">
              {[
                { value: '500+', label: 'Premium Products', icon: '🌟' },
                { value: '50K+', label: 'Happy Customers', icon: '❤️' },
                { value: '4.8★', label: 'Customer Rating', icon: '⭐' }
              ].map((stat, index) => (
                <div key={index} className="text-center group min-w-[100px]">
                  <div className="text-2xl sm:text-4xl font-display font-bold stat-gradient mb-1 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-neutral-700 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
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
                    name: 'California Almonds', 
                    desc: 'Rich in omega-3 & vitamin E', 
                    price: 'Starts from ₹999',
                    gradient: 'from-amber-100 to-orange-100',
                    image: 'https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/almond.jpg'
                  },
                  { 
                    emoji: '🌰', 
                    name: 'Premium Cashews', 
                    desc: 'Buttery smooth & creamy', 
                    price: 'Starts from ₹1,099',
                    gradient: 'from-rose-100 to-pink-100',
                    image: 'https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/cashew.jpg'
                  }
                ].map((product, index) => (
                  <div 
                    key={index}
                    className={`luxury-card glass rounded-3xl p-4 sm:p-8 bg-gradient-to-br ${product.gradient} group cursor-pointer`}
                  >
                    <div className="relative overflow-hidden rounded-2xl mb-4 sm:mb-6">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-28 sm:h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {product.emoji}
                    </div>
                    <h3 className="font-display font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-neutral-800 group-hover:text-luxury-red-mid transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-neutral-600 text-xs sm:text-sm mb-3 sm:mb-4 font-medium">{product.desc}</p>
                    <div className="stat-gradient font-display font-bold text-base sm:text-lg">{product.price}/kg</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-8 mt-16">
                {[
                  { 
                    emoji: '🥥', 
                    name: 'California Pistachios', 
                    desc: 'Heart-healthy superfood', 
                    price: 'Starts from ₹1,399',
                    gradient: 'from-emerald-100 to-green-100',
                    image: 'https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/pista.jpg'
                  },
                  { 
                    emoji: '🍇', 
                    name: 'Safawi Dates', 
                    desc: 'Nature\'s candy', 
                    price: 'Starts from ₹799',
                    gradient: 'from-purple-100 to-indigo-100',
                    image: 'https://bvnjxbbwxsibslembmty.supabase.co/storage/v1/object/public/product-images/medjool.jpg'
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
                    <h3 className="font-display font-semibold text-xl mb-3 text-neutral-800 group-hover:text-luxury-red-mid transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 font-medium">{product.desc}</p>
                    <div className="stat-gradient font-display font-bold text-lg">{product.price}/kg</div>
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
