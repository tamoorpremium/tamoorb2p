import React, { useEffect, useRef } from "react";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import almondsVideo from "../assets/videos/almonds.mov";
import cashewsVideo from "../assets/videos/cashews.mp4";
import pistaVideo from "../assets/videos/pista.mov";
import wallnutsVideo from "../assets/videos/wallnut.mp4";
import mixnutsVideo from "../assets/videos/mixnuts.mov";
import mixbowlVideo from "../assets/videos/mixbowlrotate.mp4";
import medjoolVideo from "../assets/videos/medjool.mov";
import candlesVideo from "../assets/videos/candles.mp4";
import giftsVideo from "../assets/videos/gift.mov";

const FeaturedProducts = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".product-card");
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("animate-slide-up");
                card.classList.remove("opacity-0");
                card.classList.add("opacity-100");
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 } // 👈 more reliable for mobile
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const products = [
  {
    id: 1,
    name: "California Premium Almonds",
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviews: 2245,
    image: "https://images.pexels.com/photos/137119/pexels-photo-137119.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: almondsVideo, // local video
    badge: "Best Seller",
    badgeColor: "bg-gradient-to-r from-green-500 to-emerald-500",
    description: "Rich in vitamin E and healthy fats",
  },
  {
    id: 2,
    name: "Roasted Cashews Premium",
    price: 1599,
    originalPrice: 1899,
    rating: 4.8,
    reviews: 189,
    image: "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: cashewsVideo, // local video
    badge: "Premium",
    badgeColor: "bg-gradient-to-r from-luxury-gold to-luxury-gold-light",
    description: "Buttery smooth and perfectly roasted",
  },
  {
    id: 3,
    name: "California Pistachios Jumbo",
    price: 1899,
    originalPrice: 2299,
    rating: 4.7,
    reviews: 156,
    image: "https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: pistaVideo, // local video
    badge: "Limited",
    badgeColor: "bg-gradient-to-r from-red-500 to-rose-500",
    description: "Heart-healthy and deliciously crunchy",
  },
  {
    id: 4,
    name: "Medjool Dates Premium",
    price: 899,
    originalPrice: 1199,
    rating: 4.6,
    reviews: 203,
    image: "https://images.pexels.com/photos/461431/pexels-photo-461431.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: medjoolVideo, // no video yet, safe fallback
    badge: "Organic",
    badgeColor: "bg-gradient-to-r from-luxury-sage to-luxury-sage-dark",
    description: "Nature's sweetest superfood",
  },
  {
    id: 5,
    name: "Mixed Dry Fruits Luxury",
    price: 1499,
    originalPrice: 1799,
    rating: 4.8,
    reviews: 312,
    image: "https://images.pexels.com/photos/4113898/pexels-photo-4113898.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: mixnutsVideo, // local video
    badge: "Popular",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    description: "Perfect blend of premium nuts",
  },
  {
    id: 6,
    name: "Walnuts Halves Premium",
    price: 1399,
    originalPrice: 1699,
    rating: 4.5,
    reviews: 178,
    image: "https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: wallnutsVideo, // local video
    badge: "Fresh",
    badgeColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    description: "Brain food with omega-3 goodness",
  },
  {
    id: 7,
    name: "Seeds Mix",
    price: 899,
    originalPrice: 1199,
    rating: 4.6,
    reviews: 4093,
    image: "https://images.pexels.com/photos/461431/pexels-photo-461431.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: mixbowlVideo, // no video yet, safe fallback
    badge: "Healthy",
    badgeColor: "bg-gradient-to-r from-luxury-sage to-luxury-sage-dark",
    description: "Nature's sweetest superfood",
  },
  {
    id: 8,
    name: "Scented Candles",
    price: 299,
    originalPrice: 499,
    rating: 4.8,
    reviews: 6312,
    image: "https://images.pexels.com/photos/4113898/pexels-photo-4113898.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: candlesVideo, // local video
    badge: "Popular",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    description: "Scented Candles with luxury vibes",
  },
  {
    id: 9,
    name: "Gift Hampers",
    price: 999,
    originalPrice: 1299,
    rating: 4.8,
    reviews: 1412,
    image: "https://images.pexels.com/photos/4113898/pexels-photo-4113898.jpeg?auto=compress&cs=tinysrgb&w=500",
    video: giftsVideo, // local video
    badge: "Popular",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    description: "Perfect blend of premium nuts",
  },
];



  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 text-luxury-gold mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-luxury-gold"></div>
            <span className="text-sm font-medium tracking-wider uppercase">
              Featured
            </span>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-luxury-gold"></div>
          </div>
          <h2 className="text-5xl font-display font-bold text-neutral-800 mb-6">
            Premium <span className="luxury-gradient">Collection</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Handpicked premium dry fruits and nuts that our customers love the
            most. Each product is carefully selected for its exceptional quality
            and taste.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card luxury-card neomorphism rounded-3xl overflow-hidden group opacity-0 md:opacity-100 cursor-pointer"
              onClick={() => navigate("/products")}
            >
              {/* Media Section (Video with Fallback to Image) */}
<div className="relative overflow-hidden">
  {product.video ? (
    <video
      src={product.video}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
      poster={product.image} // fallback thumbnail before video plays
      onError={(e) => {
        // fallback to image if video fails
        const target = e.target as HTMLVideoElement;
        if (product.image) {
          target.outerHTML = `<img src="${product.image}" alt="${product.name}" class="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-700" />`;
        }
      }}
    />
  ) : (
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
    />
  )}

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

  {/* Badge */}
  <div
    className={`absolute top-6 left-6 ${product.badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}
  >
    {product.badge}
  </div>

                {/* Action Buttons */}
                <div className="absolute top-6 right-6 flex flex-col space-y-2 sm:space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0">
                  <button className="p-2 sm:p-3 glass rounded-full hover:bg-white/20 transition-all duration-300">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white hover:text-red-400" />
                  </button>
                  <button className="p-2 sm:p-3 glass rounded-full hover:bg-white/20 transition-all duration-300">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                <h3 className="font-display font-semibold text-xl text-neutral-800 mb-3 text-center sm:text-left group-hover:text-luxury-gold transition-colors duration-300">
                  {product.name}
                </h3>

                <p className="text-neutral-600 text-sm mb-4 font-medium text-center sm:text-left">
                  {product.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "text-luxury-gold fill-current"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                    <span className="ml-3 text-sm text-neutral-600 font-medium">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center justify-center sm:justify-start space-x-3">
                    <span className="text-2xl font-display font-bold luxury-gradient">
                      ₹{product.price}
                    </span>
                    <span className="text-lg text-neutral-400 line-through font-medium">
                      ₹{product.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-luxury-sage font-semibold bg-luxury-sage/10 px-3 py-1 rounded-full text-center sm:text-left">
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

        {/* View All Button */}
        <div className="text-center mt-16">
          <button
            className="btn-premium text-white px-10 py-4 rounded-full font-semibold text-lg"
            onClick={() => navigate("/products")}
          >
            View Complete Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
