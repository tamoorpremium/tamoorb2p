import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.category-card');
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      id: 'premium-nuts',
      name: 'Premium Nuts',
      description: 'Handpicked almonds, cashews, pistachios, and walnuts from the finest orchards worldwide',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '45+ Products',
      gradient: 'from-amber-500/20 to-orange-500/20',
      hoverGradient: 'group-hover:from-amber-500/30 group-hover:to-orange-500/30',
      icon: '🥜',
      features: ['Rich in Protein', 'Heart Healthy', 'Premium Quality']
    },
    {
      id: 'dried-fruits',
      name: 'Exotic Dried Fruits',
      description: 'Sun-dried dates, figs, apricots, and raisins bursting with natural sweetness',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '38+ Products',
      gradient: 'from-purple-500/20 to-pink-500/20',
      hoverGradient: 'group-hover:from-purple-500/30 group-hover:to-pink-500/30',
      icon: '🍇',
      features: ['Natural Sweetness', 'High Fiber', 'Antioxidant Rich']
    },
    {
      id: 'seeds-berries',
      name: 'Superfood Seeds & Berries',
      description: 'Nutrient-dense chia seeds, flax seeds, goji berries, and cranberries',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '28+ Products',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      hoverGradient: 'group-hover:from-blue-500/30 group-hover:to-indigo-500/30',
      icon: '🫐',
      features: ['Omega-3 Rich', 'Superfood Power', 'Energy Boost']
    },
    {
      id: 'trail-mixes',
      name: 'Artisan Trail Mixes',
      description: 'Carefully crafted blends of nuts, fruits, and seeds for the perfect snack',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '22+ Products',
      gradient: 'from-green-500/20 to-emerald-500/20',
      hoverGradient: 'group-hover:from-green-500/30 group-hover:to-emerald-500/30',
      icon: '🥗',
      features: ['Perfect Balance', 'On-the-Go', 'Custom Blends']
    },
    {
      id: 'gift-hampers',
      name: 'Luxury Gift Hampers',
      description: 'Elegantly packaged premium collections perfect for gifting',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '15+ Products',
      gradient: 'from-red-500/20 to-rose-500/20',
      hoverGradient: 'group-hover:from-red-500/30 group-hover:to-rose-500/30',
      icon: '🎁',
      features: ['Premium Packaging', 'Gift Ready', 'Curated Selection']
    },
    {
      id: 'organic-range',
      name: 'Certified Organic',
      description: 'USDA certified organic dry fruits and nuts, naturally grown without chemicals',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '32+ Products',
      gradient: 'from-lime-500/20 to-green-500/20',
      hoverGradient: 'group-hover:from-lime-500/30 group-hover:to-green-500/30',
      icon: '🌱',
      features: ['USDA Certified', 'Chemical Free', 'Sustainable']
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
              <span className="text-sm font-medium tracking-wider uppercase">Categories</span>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-800 mb-6">
              Explore <span className="tamoor-gradient">TAMOOR</span> Categories
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Discover our carefully curated categories of premium dry fruits and nuts, 
              each selected for exceptional quality and taste.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section ref={sectionRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="category-card luxury-card neomorphism rounded-3xl overflow-hidden group cursor-pointer opacity-0"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} ${category.hoverGradient} transition-all duration-500`}></div>
                  
                  {/* Category Icon */}
                  <div className="absolute top-8 left-8">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center text-3xl group-hover:scale-125 transition-transform duration-300">
                      {category.icon}
                    </div>
                  </div>

                  {/* Product Count */}
                  <div className="absolute top-8 right-8">
                    <div className="glass px-4 py-2 rounded-full text-sm font-semibold text-white">
                      {category.count}
                    </div>
                  </div>

                  {/* Category Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {category.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <button className="flex items-center space-x-2 text-white font-semibold group/btn">
                        <span>Explore Category</span>
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-display font-bold text-neutral-800 mb-4 group-hover:text-luxury-gold transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed font-medium mb-6">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500 font-medium">{category.count}</span>
                    <button className="btn-premium text-white px-6 py-2 rounded-full font-semibold text-sm">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-luxury-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-luxury-gold rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-sage rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Browse our complete collection or contact our experts for personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-premium text-white px-8 py-4 rounded-full font-semibold text-lg">
              View All Products
            </button>
            <button className="glass text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Contact Expert
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;