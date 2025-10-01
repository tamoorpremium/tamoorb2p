import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../utils/supabaseClient';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}


const subcategoryImages: Record<string, string> = {
  // Premium Nuts
  "almonds-badam": "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=600",
  "cashews-kaju": "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600",
  "pistachios-pista": "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=600",
  "walnuts-akhrot": "https://images.pexels.com/photos/117097/pexels-photo-117097.jpeg?auto=compress&cs=tinysrgb&w=600",
  "hazelnuts": "https://images.pexels.com/photos/1414873/pexels-photo-1414873.jpeg?auto=compress&cs=tinysrgb&w=600",
  "pecans": "https://images.pexels.com/photos/46252/pecans-nuts-healthy-food-46252.jpeg?auto=compress&cs=tinysrgb&w=600",
  "macadamia": "https://images.pexels.com/photos/1315187/pexels-photo-1315187.jpeg?auto=compress&cs=tinysrgb&w=600",
  "pine-nuts-chilgoza": "https://images.pexels.com/photos/46063/pine-nuts-food-46063.jpeg?auto=compress&cs=tinysrgb&w=600",

  // Dried Fruits
  "raisins-kishmish": "https://images.pexels.com/photos/66463/grapes-purple-raisin-dried-66463.jpeg?auto=compress&cs=tinysrgb&w=600",
  "figs-anjeer": "https://images.pexels.com/photos/41123/figs-fig-fruits-41123.jpeg?auto=compress&cs=tinysrgb&w=600",
  "apricots-khubani": "https://images.pexels.com/photos/247466/pexels-photo-247466.jpeg?auto=compress&cs=tinysrgb&w=600",
  "dates-khajoor": "https://images.pexels.com/photos/164631/pexels-photo-164631.jpeg?auto=compress&cs=tinysrgb&w=600",
  "prunes-dried-plums": "https://images.pexels.com/photos/17528/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
  "cranberries": "https://images.pexels.com/photos/357585/pexels-photo-357585.jpeg?auto=compress&cs=tinysrgb&w=600",
  "blueberries": "https://images.pexels.com/photos/340874/pexels-photo-340874.jpeg?auto=compress&cs=tinysrgb&w=600",
  "black-currants": "https://images.pexels.com/photos/708264/pexels-photo-708264.jpeg?auto=compress&cs=tinysrgb&w=600",

  // Seeds & Others
  "pumpkin-seeds": "https://images.pexels.com/photos/2113567/pexels-photo-2113567.jpeg?auto=compress&cs=tinysrgb&w=600",
  "sunflower-seeds": "https://images.pexels.com/photos/247241/pexels-photo-247241.jpeg?auto=compress&cs=tinysrgb&w=600",
  "chia-seeds": "https://images.pexels.com/photos/66295/pexels-photo-66295.jpeg?auto=compress&cs=tinysrgb&w=600",
  "flax-seeds": "https://images.pexels.com/photos/196643/pexels-photo-196643.jpeg?auto=compress&cs=tinysrgb&w=600",
  "mixed-seeds": "https://images.pexels.com/photos/357574/pexels-photo-357574.jpeg?auto=compress&cs=tinysrgb&w=600",
  "mixes": "https://images.pexels.com/photos/357581/pexels-photo-357581.jpeg?auto=compress&cs=tinysrgb&w=600",
  "trail-mix": "https://images.pexels.com/photos/357580/pexels-photo-357580.jpeg?auto=compress&cs=tinysrgb&w=600",
  "exotic-mix": "https://images.pexels.com/photos/357583/pexels-photo-357583.jpeg?auto=compress&cs=tinysrgb&w=600",
  "salted-mix": "https://images.pexels.com/photos/357579/pexels-photo-357579.jpeg?auto=compress&cs=tinysrgb&w=600",
  "roasted-mix": "https://images.pexels.com/photos/357578/pexels-photo-357578.jpeg?auto=compress&cs=tinysrgb&w=600",

  // Chocolate
  "dark-chocolate": "https://images.pexels.com/photos/520551/pexels-photo-520551.jpeg?auto=compress&cs=tinysrgb&w=600",
  "milk-chocolate": "https://images.pexels.com/photos/302478/pexels-photo-302478.jpeg?auto=compress&cs=tinysrgb&w=600",
  "white-chocolate": "https://images.pexels.com/photos/302479/pexels-photo-302479.jpeg?auto=compress&cs=tinysrgb&w=600",
  "chocolate-bars": "https://images.pexels.com/photos/302481/pexels-photo-302481.jpeg?auto=compress&cs=tinysrgb&w=600",
  "chocolate-truffles": "https://images.pexels.com/photos/302482/pexels-photo-302482.jpeg?auto=compress&cs=tinysrgb&w=600",
  "chocolate-covered-nuts-fruits": "https://images.pexels.com/photos/302484/pexels-photo-302484.jpeg?auto=compress&cs=tinysrgb&w=600",
  "hot-chocolate-powder": "https://images.pexels.com/photos/302485/pexels-photo-302485.jpeg?auto=compress&cs=tinysrgb&w=600",
  "swiss-chocolates": "https://images.pexels.com/photos/302486/pexels-photo-302486.jpeg?auto=compress&cs=tinysrgb&w=600",
  "belgian-chocolates": "https://images.pexels.com/photos/302487/pexels-photo-302487.jpeg?auto=compress&cs=tinysrgb&w=600",
  "luxury-chocolate-gift-packs": "https://images.pexels.com/photos/302488/pexels-photo-302488.jpeg?auto=compress&cs=tinysrgb&w=600",
  "imported-chocolates": "https://images.pexels.com/photos/302489/pexels-photo-302489.jpeg?auto=compress&cs=tinysrgb&w=600",
  "sugarfree-chocolates": "https://images.pexels.com/photos/302490/pexels-photo-302490.jpeg?auto=compress&cs=tinysrgb&w=600",

  // Gift Hampers
  "birthday-hampers": "https://images.pexels.com/photos/210551/pexels-photo-210551.jpeg?auto=compress&cs=tinysrgb&w=600",
  "anniversary-hampers": "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600",
  "wedding-hampers": "https://images.pexels.com/photos/295919/pexels-photo-295919.jpeg?auto=compress&cs=tinysrgb&w=600",
  "festival-hampers": "https://images.pexels.com/photos/302292/pexels-photo-302292.jpeg?auto=compress&cs=tinysrgb&w=600",
  "corporate-hampers": "https://images.pexels.com/photos/302291/pexels-photo-302291.jpeg?auto=compress&cs=tinysrgb&w=600",
  "dry-fruit-hampers": "https://images.pexels.com/photos/302290/pexels-photo-302290.jpeg?auto=compress&cs=tinysrgb&w=600",
  "chocolate-hampers": "https://images.pexels.com/photos/302289/pexels-photo-302289.jpeg?auto=compress&cs=tinysrgb&w=600",
  "mixed-hampers": "https://images.pexels.com/photos/302288/pexels-photo-302288.jpeg?auto=compress&cs=tinysrgb&w=600",
  "healthy-hampers": "https://images.pexels.com/photos/302287/pexels-photo-302287.jpeg?auto=compress&cs=tinysrgb&w=600",
  "premium-wooden-box": "https://images.pexels.com/photos/302286/pexels-photo-302286.jpeg?auto=compress&cs=tinysrgb&w=600",
  "basket-hampers": "https://images.pexels.com/photos/302285/pexels-photo-302285.jpeg?auto=compress&cs=tinysrgb&w=600",
  "designer-hampers": "https://images.pexels.com/photos/302284/pexels-photo-302284.jpeg?auto=compress&cs=tinysrgb&w=600",

  // Juices
  "fruit-juices": "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=600",
  "special-juices": "https://images.pexels.com/photos/96975/pexels-photo-96975.jpeg?auto=compress&cs=tinysrgb&w=600",
  "imported-juices": "https://images.pexels.com/photos/96976/pexels-photo-96976.jpeg?auto=compress&cs=tinysrgb&w=600",
  "soft-drinks": "https://images.pexels.com/photos/96977/pexels-photo-96977.jpeg?auto=compress&cs=tinysrgb&w=600",
  "health-detox": "https://images.pexels.com/photos/96978/pexels-photo-96978.jpeg?auto=compress&cs=tinysrgb&w=600",
};


const subcategoryBadges: Record<string, string> = {
  "almonds-badam": "Premium",
  "cashews-kaju": "Bestseller",
  "pistachios-pista": "New",
  "walnuts-akhrot": "Luxury",
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });
      if (error) console.log(error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Animate cards on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".category-card");
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("animate-slide-up");
                card.classList.remove("opacity-0");
                card.classList.add("opacity-100");
              }, index * 300);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const parents = categories.filter((cat) => cat.parent_id === null);
  const getSubcategories = (parentId: number) =>
    categories.filter((cat) => cat.parent_id === parentId);

  return (
    <section ref={sectionRef} className="py-12 sm:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-16 text-center">
          Explore <span className="luxury-gradient font-serif font-extrabold">TAMOOR</span> Categories
        </h1>

        {parents.map((parent) => {
          const subcategories = getSubcategories(parent.id);
          if (!subcategories.length) return null;

          return (
            <div key={parent.id} className="mb-20">
              {/* Parent Heading with Divider */}
              <div className="flex items-center mb-12">
                <div className="flex-1 h-1 bg-luxury-gold-light"></div>
                <h2 className="px-6 text-2xl sm:text-3xl md:text-4xl font-bold text-luxury-sage-dark">
                  {parent.name}
                </h2>
                <div className="flex-1 h-1 bg-luxury-gold-light"></div>
              </div>

              {/* Subcategory Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="category-card luxury-card neomorphism rounded-2xl md:rounded-3xl overflow-hidden group opacity-100 cursor-pointer"
                    onClick={() => navigate(`/products?categoryId=${sub.id}`)}
                  >

                    {/* Media Section */}
                    <div className="relative overflow-hidden">
                      <img
                        src={subcategoryImages[sub.slug] || "https://via.placeholder.com/400x300"}
                        alt={sub.name}
                        className="w-full h-40 sm:h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                      {/* Badge */}
                      {subcategoryBadges[sub.slug] && (
                        <span className="absolute top-4 left-4 bg-luxury-gold text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {subcategoryBadges[sub.slug]}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 md:p-6 text-center">
                      <h3 className="font-display font-semibold text-sm sm:text-base md:text-xl mb-2 sm:mb-3 text-neutral-800 group-hover:text-luxury-gold transition-colors duration-300">
                        {sub.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products?categoryId=${sub.id}`);
                        }}
                        className="w-full btn-premium text-white py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
