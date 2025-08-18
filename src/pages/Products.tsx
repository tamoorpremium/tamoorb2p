import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid, List, Star, Heart, Eye, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState('500g');
  const [customWeight, setCustomWeight] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'All Products', count: 156 },
    { id: 'nuts', name: 'Premium Nuts', count: 45 },
    { id: 'dried-fruits', name: 'Dried Fruits', count: 38 },
    { id: 'seeds', name: 'Seeds & Berries', count: 28 },
    { id: 'trail-mix', name: 'Trail Mixes', count: 22 },
    { id: 'organic', name: 'Organic Range', count: 23 }
  ];

  const products = [
    {
      id: 1,
      name: 'Himalayan Premium Almonds',
      price: 1299,
      originalPrice: 1599,
      rating: 4.9,
      reviews: 245,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'nuts',
      badge: 'Best Seller',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      description: 'Rich in vitamin E and healthy fats, sourced from Kashmir valleys'
    },
    {
      id: 2,
      name: 'Roasted Cashews Premium',
      price: 1599,
      originalPrice: 1899,
      rating: 4.8,
      reviews: 189,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'nuts',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light',
      description: 'Buttery smooth and perfectly roasted to perfection'
    },
    {
      id: 3,
      name: 'Turkish Pistachios',
      price: 1899,
      originalPrice: 2299,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'nuts',
      badge: 'Limited',
      badgeColor: 'bg-gradient-to-r from-red-500 to-rose-500',
      description: 'Heart-healthy and deliciously crunchy imported pistachios'
    },
    {
      id: 4,
      name: 'Medjool Dates Premium',
      price: 899,
      originalPrice: 1199,
      rating: 4.6,
      reviews: 203,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'dried-fruits',
      badge: 'Organic',
      badgeColor: 'bg-gradient-to-r from-luxury-sage to-luxury-sage-dark',
      description: 'Nature\'s sweetest superfood, naturally sun-dried'
    },
    {
      id: 5,
      name: 'Mixed Dry Fruits Luxury',
      price: 1499,
      originalPrice: 1799,
      rating: 4.8,
      reviews: 312,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'trail-mix',
      badge: 'Popular',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      description: 'Perfect blend of premium nuts and dried fruits'
    },
    {
      id: 6,
      name: 'Walnuts Halves Premium',
      price: 1399,
      originalPrice: 1699,
      rating: 4.5,
      reviews: 178,
      image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'nuts',
      badge: 'Fresh',
      badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-500',
      description: 'Brain food with omega-3 goodness, fresh harvest'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddToCart = () => {
    if (selectedProduct) {
      const weight = selectedWeight === 'custom' ? `${customWeight}g` : selectedWeight;
      addToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        weight
      });
      setShowQuantityModal(false);
      setSelectedProduct(null);
    }
  };

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
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-neutral-800 mb-6">
              Premium <span className="tamoor-gradient">TAMOOR</span> Collection
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Discover our complete range of luxury dry fruits and nuts, carefully curated for the finest taste experience.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="sticky top-20 z-40 glass backdrop-blur-xl border-b border-white/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search premium dry fruits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 glass rounded-full text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 glass px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters</span>
              </button>

              <div className="flex items-center space-x-2 glass rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-luxury-gold text-white' : 'text-neutral-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-luxury-gold text-white' : 'text-neutral-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 glass rounded-2xl p-6 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                          selectedCategory === category.id
                            ? 'bg-luxury-gold text-white'
                            : 'hover:bg-white/20'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm opacity-70 ml-2">({category.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-display font-semibold text-lg mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">₹{priceRange[0]}</span>
                      <span className="text-sm">₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-display font-semibold text-lg mb-4">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section ref={sectionRef} className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-neutral-600 font-medium">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
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

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowQuantityModal(true);
                    }}
                    className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group/btn"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3 group-hover/btn:rotate-12 transition-transform duration-300" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quantity Selection Modal */}
      {showQuantityModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-neutral-800">
                Select Quantity
              </h3>
              <button
                onClick={() => setShowQuantityModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-32 object-cover rounded-2xl mb-4"
              />
              <h4 className="font-display font-semibold text-lg">{selectedProduct.name}</h4>
              <p className="text-neutral-600">{selectedProduct.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Weight Options
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['200g', '250g', '500g', '1kg'].map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedWeight === weight
                          ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                          : 'border-neutral-200 hover:border-luxury-gold/50'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setSelectedWeight('custom')}
                  className={`w-full mt-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                    selectedWeight === 'custom'
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                      : 'border-neutral-200 hover:border-luxury-gold/50'
                  }`}
                >
                  Custom Weight (Min 50g)
                </button>

                {selectedWeight === 'custom' && (
                  <div className="mt-3 flex items-center space-x-3">
                    <button
                      onClick={() => setCustomWeight(Math.max(50, customWeight - 50))}
                      className="p-2 glass rounded-lg hover:bg-white/20"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={customWeight}
                      onChange={(e) => setCustomWeight(Math.max(50, parseInt(e.target.value) || 50))}
                      className="flex-1 p-2 glass rounded-lg text-center"
                      min="50"
                    />
                    <span className="text-sm text-neutral-600">grams</span>
                    <button
                      onClick={() => setCustomWeight(customWeight + 50)}
                      className="p-2 glass rounded-lg hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="text-2xl font-display font-bold tamoor-gradient">
                  ₹{selectedProduct.price}
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn-premium text-white px-8 py-3 rounded-full font-semibold"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;