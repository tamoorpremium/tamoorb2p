import React, { useEffect, useRef } from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

const FeaturedProducts = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.product-card');
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

  const products = [
    {
      id: 1,
      name: 'Himalayan Premium Almonds',
      price: 1299,
      originalPrice: 1599,
      rating: 4.9,
      reviews: 245,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Best Seller',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      description: 'Rich in vitamin E and healthy fats'
    },
    {
      id: 2,
      name: 'Roasted Cashews Premium',
      price: 1599,
      originalPrice: 1899,
      rating: 4.8,
      reviews: 189,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light',
      description: 'Buttery smooth and perfectly roasted'
    },
    {
      id: 3,
      name: 'Turkish Pistachios',
      price: 1899,
      originalPrice: 2299,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Limited',
      badgeColor: 'bg-gradient-to-r from-red-500 to-rose-500',
      description: 'Heart-healthy and deliciously crunchy'
    },
    {
      id: 4,
      name: 'Medjool Dates Premium',
      price: 899,
      originalPrice: 1199,
      rating: 4.6,
      reviews: 203,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Organic',
      badgeColor: 'bg-gradient-to-r from-luxury-sage to-luxury-sage-dark',
      description: 'Nature\'s sweetest superfood'
    },
    {
      id: 5,
      name: 'Mixed Dry Fruits Luxury',
      price: 1499,
      originalPrice: 1799,
      rating: 4.8,
      reviews: 312,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Popular',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      description: 'Perfect blend of premium nuts'
    },
    {
      id: 6,
      name: 'Walnuts Halves Premium',
      price: 1399,
      originalPrice: 1699,
      rating: 4.5,
      reviews: 178,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Fresh',
      badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-500',
      description: 'Brain food with omega-3 goodness'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 text-luxury-gold mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-luxury-gold"></div>
            <span className="text-sm font-medium tracking-wider uppercase">Featured</span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
          </div>
          <h2 className="text-5xl font-display font-bold text-neutral-800 mb-6">
            Premium <span className="luxury-gradient">Collection</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Handpicked premium dry fruits and nuts that our customers love the most. 
            Each product is carefully selected for its exceptional quality and taste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card luxury-card neomorphism rounded-3xl overflow-hidden group opacity-0"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge */}
                <div className={`absolute top-6 left-6 ${product.badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}>
                  {product.badge}
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-6 right-6 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  <button className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300">
                    <Heart className="w-5 h-5 text-white hover:text-red-400" />
                  </button>
                  <button className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300">
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="font-display font-semibold text-xl text-neutral-800 mb-3 group-hover:text-luxury-gold transition-colors duration-300">
                  {product.name}
                </h3>
                
                <p className="text-neutral-600 text-sm mb-4 font-medium">
                  {product.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-luxury-gold fill-current'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-neutral-600 font-medium">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-display font-bold luxury-gradient">
                      ₹{product.price}
                    </span>
                    <span className="text-lg text-neutral-400 line-through font-medium">
                      ₹{product.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-luxury-sage font-semibold bg-luxury-sage/10 px-3 py-1 rounded-full">
                    Save ₹{product.originalPrice - product.price}
                  </div>
                </div>

                <button className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group/btn">
                  <ShoppingCart className="w-5 h-5 mr-3 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg">
            View Complete Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;