import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Trash2, Eye } from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Premium Brazil Nuts',
      price: 1799,
      originalPrice: 2199,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light',
      description: 'Rich in selenium and healthy fats'
    },
    {
      id: 2,
      name: 'Organic Goji Berries',
      price: 999,
      originalPrice: 1299,
      rating: 4.7,
      reviews: 203,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Organic',
      badgeColor: 'bg-gradient-to-r from-luxury-sage to-luxury-sage-dark',
      description: 'Superfood packed with antioxidants'
    },
    {
      id: 3,
      name: 'Himalayan Pine Nuts',
      price: 2499,
      originalPrice: 2999,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Rare',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Rare delicacy from high altitudes'
    },
    {
      id: 4,
      name: 'Premium Macadamia Nuts',
      price: 2199,
      originalPrice: 2699,
      rating: 4.6,
      reviews: 134,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Luxury',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      description: 'Buttery smooth luxury nuts'
    },
    {
      id: 5,
      name: 'Dried Mulberries',
      price: 799,
      originalPrice: 999,
      rating: 4.5,
      reviews: 178,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Natural',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      description: 'Naturally sweet and nutritious'
    },
    {
      id: 6,
      name: 'Black Mission Figs',
      price: 1399,
      originalPrice: 1699,
      rating: 4.8,
      reviews: 267,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light',
      description: 'Sweet and succulent premium figs'
    }
  ]);

  const [removingItem, setRemovingItem] = useState<number | null>(null);

  const handleRemoveFromWishlist = (id: number) => {
    setRemovingItem(id);
    setTimeout(() => {
      setWishlistItems(prev => prev.filter(item => item.id !== id));
      setRemovingItem(null);
    }, 300);
  };

  const handleMoveToCart = (item: any) => {
    // Add to cart logic here
    console.log('Moving to cart:', item);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="luxury-card glass rounded-3xl p-16">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                <Heart className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-4xl font-display font-bold text-neutral-800 mb-6">
                Your Wishlist is Empty
              </h1>
              <p className="text-xl text-neutral-600 mb-8 font-medium">
                Save your favorite TAMOOR products to your wishlist for easy access
              </p>
              <button className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg">
                Discover Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-neutral-800 mb-4">
            My <span className="tamoor-gradient">Wishlist</span>
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((product, index) => (
            <div
              key={product.id}
              className={`luxury-card neomorphism rounded-3xl overflow-hidden group transition-all duration-500 ${
                removingItem === product.id ? 'opacity-50 scale-95' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
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
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300 group/btn"
                  >
                    <Trash2 className="w-5 h-5 text-white hover:text-red-400 group-hover/btn:scale-110 transition-transform duration-300" />
                  </button>
                  <button className="p-3 glass rounded-full hover:bg-white/20 transition-all duration-300 group/btn">
                    <Eye className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform duration-300" />
                  </button>
                </div>

                {/* Wishlist Heart */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="p-3 glass rounded-full">
                    <Heart className="w-6 h-6 text-red-500 fill-current animate-pulse" />
                  </div>
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
                    <span className="text-2xl font-display font-bold tamoor-gradient">
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

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 btn-premium text-white py-3 rounded-full font-semibold text-sm flex items-center justify-center group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-16">
          <div className="luxury-card glass rounded-3xl p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-neutral-800 mb-6">
              Discover More Premium Products
            </h2>
            <p className="text-xl text-neutral-600 mb-8 font-medium">
              Explore our complete collection of luxury dry fruits and nuts
            </p>
            <button className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg">
              Browse All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;