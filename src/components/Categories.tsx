import React, { useEffect, useRef } from 'react';

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
              }, index * 100);
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
      name: 'Premium Nuts',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      count: '120+ Products',
      gradient: 'from-amber-50 to-orange-50',
      hoverGradient: 'group-hover:from-amber-100 group-hover:to-orange-100',
      icon: '🥜'
    },
    {
      name: 'Dried Fruits',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      count: '85+ Products',
      gradient: 'from-purple-50 to-pink-50',
      hoverGradient: 'group-hover:from-purple-100 group-hover:to-pink-100',
      icon: '🍇'
    },
    {
      name: 'Seeds & Berries',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      count: '65+ Products',
      gradient: 'from-blue-50 to-indigo-50',
      hoverGradient: 'group-hover:from-blue-100 group-hover:to-indigo-100',
      icon: '🫐'
    },
    {
      name: 'Trail Mixes',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      count: '45+ Products',
      gradient: 'from-green-50 to-emerald-50',
      hoverGradient: 'group-hover:from-green-100 group-hover:to-emerald-100',
      icon: '🥗'
    },
    {
      name: 'Gift Hampers',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      count: '30+ Products',
      gradient: 'from-red-50 to-rose-50',
      hoverGradient: 'group-hover:from-red-100 group-hover:to-rose-100',
      icon: '🎁'
    },
    {
      name: 'Organic Range',
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=400',
      count: '75+ Products',
      gradient: 'from-lime-50 to-green-50',
      hoverGradient: 'group-hover:from-lime-100 group-hover:to-green-100',
      icon: '🌱'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-luxury-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 text-luxury-gold mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-luxury-gold"></div>
            <span className="text-sm font-medium tracking-wider uppercase">Categories</span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
          </div>
          <h2 className="text-5xl font-display font-bold text-neutral-800 mb-6">
            Shop by <span className="luxury-gradient">Categories</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Explore our carefully curated selection of premium dry fruits and nuts, 
            organized by categories for your convenience and delight.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="category-card group cursor-pointer opacity-0"
            >
              <div className={`luxury-card neomorphism rounded-3xl p-8 text-center bg-gradient-to-br ${category.gradient} ${category.hoverGradient} transition-all duration-500`}>
                <div className="relative overflow-hidden rounded-2xl mb-6">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl group-hover:scale-125 transition-transform duration-300">
                      {category.icon}
                    </div>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-lg mb-3 text-neutral-800 group-hover:text-luxury-gold transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-neutral-500 font-medium">{category.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg">
            Explore All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;