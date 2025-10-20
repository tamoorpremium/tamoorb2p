import React, { useEffect, useRef } from "react";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import almondsVideo from "../assets/videos/Almonds.mp4";
import cashewsVideo from "../assets/videos/Cashews.mp4";
import pistaVideo from "../assets/videos/Pista.mp4";
import wallnutsVideo from "../assets/videos/Wallnut.mp4";
import mixnutsVideo from "../assets/videos/Mixnuts.mp4";
import mixbowlVideo from "../assets/videos/Mixbowlrotate.mp4";
import medjoolVideo from "../assets/videos/Medjool.mp4";
import candlesVideo from "../assets/videos/Candle.mp4";
import giftsVideo from "../assets/videos/gift.mp4";

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
    id: 2,
    name: "California Premium Almonds",
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviews: 2245,
    video: almondsVideo, // local video
    badge: "Best Seller",
    badgeColor: "bg-gradient-to-r from-green-500 to-emerald-500",
    description: "Rich in vitamin E and healthy fats",
  },
  {
    id: 3,
    name: "Roasted Cashews Premium",
    price: 999,
    originalPrice: 1899,
    rating: 4.8,
    reviews: 189,
    video: cashewsVideo, // local video
    badge: "Premium",
    badgeColor: "bg-gradient-to-r from-luxury-gold to-luxury-gold-light",
    description: "Buttery smooth and perfectly roasted",
  },
  {
    id: 4,
    name: "California Pistachios Jumbo",
    price: 1199,
    originalPrice: 2299,
    rating: 4.7,
    reviews: 156,
    video: pistaVideo, // local video
    badge: "Limited",
    badgeColor: "bg-gradient-to-r from-red-500 to-rose-500",
    description: "Heart-healthy and deliciously crunchy",
  },
  {
    id: 14,
    name: "Medjool Dates Premium",
    price: 1299,
    originalPrice: 1899,
    rating: 4.6,
    reviews: 203,
    video: medjoolVideo, // no video yet, safe fallback
    badge: "Organic",
    badgeColor: "bg-gradient-to-r from-luxury-sage to-luxury-sage-dark",
    description: "Nature's sweetest superfood",
  },
  {
    id: 10,
    name: "Mixed Dry Fruits Luxury",
    price: 1399,
    originalPrice: 1799,
    rating: 4.8,
    reviews: 312,
    video: mixnutsVideo, // local video
    badge: "Popular",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    description: "Perfect blend of premium nuts",
  },
  {
    id: 5,
    name: "Walnuts Halves Premium",
    price: 999,
    originalPrice: 1699,
    rating: 4.5,
    reviews: 178,
    video: wallnutsVideo, // local video
    badge: "Fresh",
    badgeColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    description: "Brain food with omega-3 goodness",
  },
  {
    id: 19,
    name: "Seeds Mix",
    price: 799,
    originalPrice: 1199,
    rating: 4.6,
    reviews: 4093,
    video: mixbowlVideo, // no video yet, safe fallback
    badge: "Healthy",
    badgeColor: "bg-gradient-to-r from-luxury-sage to-luxury-sage-dark",
    description: "Nature's sweetest superfood",
  },
  {
    id: 63,
    name: "Scented Candles",
    price: 99,
    originalPrice: 499,
    rating: 4.8,
    reviews: 6312,
    video: candlesVideo, // local video
    badge: "Popular",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    description: "Scented Candles with luxury vibes",
  },
  {
    id: 43,
    name: "Gift Hampers",
    price: 199,
    originalPrice: 1299,
    rating: 4.8,
    reviews: 1412,
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
          {products.map((sub) => (
            <div
              key={sub.id}
              className="product-card luxury-card neomorphism rounded-3xl overflow-hidden group opacity-100 cursor-pointer"
              onClick={() => navigate(`/products?categoryId=${sub.id}`)}
            >
              {/* Media Section */}
              <div className="relative overflow-hidden">
                {sub.video && (
                <video
                  src={sub.video} // Use your .mp4 file here
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                />
              )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badge */}
                {sub.badge && (
                  <div
                    className={`absolute top-6 left-6 ${sub.badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}
                  >
                    {sub.badge}
                  </div>
                )}

                {/* Action Buttons */}
                
              </div>

              {/* Content Section */}
              <div className="p-8 text-center sm:text-left">
                <h3 className="font-display font-semibold text-xl text-neutral-800 mb-3 group-hover:text-luxury-gold transition-colors duration-300">
                  {sub.name}
                </h3>

                <p className="text-neutral-600 text-sm mb-4 font-medium">
                  {sub.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center justify-center sm:justify-start space-x-3">
                    <span className="text-2xl font-display font-bold luxury-gradient">
                      Starts from ₹{sub.price}
                    </span>
                    <span className="text-lg text-neutral-400 line-through font-medium">
                      ₹{sub.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-luxury-sage font-semibold bg-luxury-sage/10 px-3 py-1 rounded-full text-center sm:text-left">
                    Save ₹{sub.originalPrice - sub.price}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products?categoryId=${sub.id}`);
                  }}
                  className="w-full btn-premium text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center group/btn"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Explore More
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
