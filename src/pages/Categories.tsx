// Before you start, make these two small additions to your project files:

// 1. In your `tailwind.config.js` file, add the keyframes and animation extensions:
/*
  // tailwind.config.js
  module.exports = {
    // ... your other config
    theme: {
      extend: {
        keyframes: {
          'fade-in': {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        animation: {
          'fade-in': 'fade-in 0.5s ease-out forwards',
        },
      },
    },
    plugins: [],
  }
*/

// 2. In your global CSS file (e.g., `index.css`), add the following layer utilities:
/*
  // index.css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  @layer utilities {
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none; // IE and Edge
      scrollbar-width: none; // Firefox
    }
    .text-shadow-md {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }
  }
*/


import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../utils/supabaseClient';
import almonds from "../assets/categories/almondcat.jpg";
import cashews from "../assets/categories/cashewcat.jpg";
import pista from "../assets/categories/pistacat.jpg";
import walnut from "../assets/categories/walnutcat.jpg";
import hazlnuts from "../assets/categories/hazelcat.jpg";
import pecans from "../assets/categories/pecans.jpg";
import macadamia from "../assets/categories/macadamiacat.jpg";
import pinenuts from "../assets/categories/pinecat.jpg";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

// --- UPDATED: More relevant and specific image URLs ---
const subcategoryImages: Record<string, string> = {
  // Premium Nuts
  "almonds-badam": almonds,
  "cashews-kaju": cashews,
  "pistachios-pista": pista,
  "walnuts-akhrot": walnut,
  "hazelnuts": hazlnuts,
  "pecans": pecans,
  "macadamia": macadamia,
  "pine-nuts-chilgoza": pinenuts,

  // Dried Fruits
  "raisins-kishmish": "https://images.unsplash.com/photo-1596590213134-d193153c3e87?q=80&w=1974&auto=format&fit=crop",
  "figs-anjeer": "https://images.unsplash.com/photo-1593282247775-305f818a52a9?q=80&w=1974&auto=format&fit=crop",
  "apricots-khubani": "https://images.unsplash.com/photo-1631081519416-01584285d886?q=80&w=1974&auto=format&fit=crop",
  "dates-khajoor": "https://images.unsplash.com/photo-1609182315899-73d8b365e89d?q=80&w=2080&auto=format&fit=crop",
  "prunes-dried-plums": "https://images.unsplash.com/photo-1620700753985-112e4c46f04c?q=80&w=1974&auto=format&fit=crop",
  "cranberries": "https://images.unsplash.com/photo-1542841845-835b4a78107c?q=80&w=1974&auto=format&fit=crop",
  "blueberries": "https://images.unsplash.com/photo-1498569107929-89a1c1a6a1f8?q=80&w=2070&auto=format&fit=crop",
  "black-currants": "https://images.unsplash.com/photo-1596590213134-d193153c3e87?q=80&w=1974&auto=format&fit=crop", // Using raisins as a close visual substitute

  // Seeds & Others
  "pumpkin-seeds": "https://images.unsplash.com/photo-1600053936815-c2a265f02abf?q=80&w=1974&auto=format&fit=crop",
  "sunflower-seeds": "https://images.unsplash.com/photo-1649129290159-1589c3a32194?q=80&w=1974&auto=format&fit=crop",
  "chia-seeds": "https://images.unsplash.com/photo-1542365287-d42851a14a73?q=80&w=1974&auto=format&fit=crop",
  "flax-seeds": "https://images.unsplash.com/photo-1547999335-8a2b534a413d?q=80&w=1974&auto=format&fit=crop",
  "mixed-seeds": "https://images.unsplash.com/photo-1620700753985-112e4c46f04c?q=80&w=1974&auto=format&fit=crop", // Using a general mix image
  "mixes": "https://images.unsplash.com/photo-1558231713-26a11e4e2920?q=80&w=1974&auto=format&fit=crop",
  "trail-mix": "https://images.unsplash.com/photo-1581347941097-f58a36c7a40b?q=80&w=1974&auto=format&fit=crop",
  "exotic-mix": "https://images.unsplash.com/photo-1610421258288-51e604169d2f?q=80&w=1974&auto=format&fit=crop",
  "salted-mix": "https://images.unsplash.com/photo-1601924352235-99d0c5e97uer?q=80&w=2070&auto=format&fit=crop",
  "roasted-mix": "https://images.unsplash.com/photo-1599399120612-e7894a4c6a46?q=80&w=1974&auto=format&fit=crop",

  // Chocolate
  "dark-chocolate": "https://images.unsplash.com/photo-1593284984131-9a3a93feb80e?q=80&w=1974&auto=format&fit=crop",
  "milk-chocolate": "https://images.unsplash.com/photo-1623805322986-e9b4ce48c34f?q=80&w=1974&auto=format&fit=crop",
  "white-chocolate": "https://images.unsplash.com/photo-1602351447937-745cb72f6c2f?q=80&w=1974&auto=format&fit=crop",
  "chocolate-bars": "https://images.unsplash.com/photo-1558535441-85b9f7a7a46f?q=80&w=1974&auto=format&fit=crop",
  "chocolate-truffles": "https://images.unsplash.com/photo-1584370848010-d7f9d45a4a42?q=80&w=1974&auto=format&fit=crop",
  "chocolate-covered-nuts-fruits": "https://images.unsplash.com/photo-1615557929837-c140464a9355?q=80&w=1974&auto=format&fit=crop",
  "hot-chocolate-powder": "https://images.unsplash.com/photo-1542345339-f06a1f813936?q=80&w=1974&auto=format&fit=crop",
  "swiss-chocolates": "https://images.unsplash.com/photo-1511381939415-e340a6479905?q=80&w=2070&auto=format&fit=crop",
  "belgian-chocolates": "https://images.unsplash.com/photo-1566453883393-9c5950538a2b?q=80&w=1974&auto=format&fit=crop",
  "luxury-chocolate-gift-packs": "https://images.unsplash.com/photo-1579558965939-8e9a288a38b5?q=80&w=1974&auto=format&fit=crop",
  "imported-chocolates": "https://images.unsplash.com/photo-1571113394142-990832049e1b?q=80&w=1974&auto=format&fit=crop",
  "sugarfree-chocolates": "https://images.unsplash.com/photo-1627485352697-4022842101e4?q=80&w=1974&auto=format&fit=crop",

  // Gift Hampers
  "birthday-hampers": "https://images.unsplash.com/photo-1599458362584-77aab1a8a29a?q=80&w=1974&auto=format&fit=crop",
  "anniversary-hampers": "https://images.unsplash.com/photo-1611213025260-204a0808c1c2?q=80&w=1974&auto=format&fit=crop",
  "wedding-hampers": "https://images.unsplash.com/photo-1622241634707-30756434430f?q=80&w=1974&auto=format&fit=crop",
  "festival-hampers": "https://images.unsplash.com/photo-1604169115220-4a84918231a2?q=80&w=1974&auto=format&fit=crop", // Diwali theme
  "corporate-hampers": "https://images.unsplash.com/photo-1633113089632-47400d3a5a2a?q=80&w=2070&auto=format&fit=crop",
  "dry-fruit-hampers": "https://images.unsplash.com/photo-1604353434113-5a507a21381d?q=80&w=1974&auto=format&fit=crop",
  "chocolate-hampers": "https://images.unsplash.com/photo-1579558965939-8e9a288a38b5?q=80&w=1974&auto=format&fit=crop",
  "mixed-hampers": "https://images.unsplash.com/photo-1576801386621-e789b70b42c6?q=80&w=1974&auto=format&fit=crop",
  "healthy-hampers": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop",
  "premium-wooden-box": "https://images.unsplash.com/photo-1604353434049-57e05a303867?q=80&w=1974&auto=format&fit=crop",
  "basket-hampers": "https://images.unsplash.com/photo-1568181283152-a5951f53524b?q=80&w=1974&auto=format&fit=crop",
  "designer-hampers": "https://images.unsplash.com/photo-1622241634707-30756434430f?q=80&w=1974&auto=format&fit=crop",

  // Juices
  "fruit-juices": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1974&auto=format&fit=crop",
  "special-juices": "https://images.unsplash.com/photo-1621263764928-df1444c53853?q=80&w=1974&auto=format&fit=crop",
  "imported-juices": "https://images.unsplash.com/photo-1613278277239-a1b32729a531?q=80&w=1974&auto=format&fit=crop",
  "soft-drinks": "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1964&auto=format&fit=crop",
  "health-detox": "https://images.unsplash.com/photo-1544196722-e7b3a4a75417?q=80&w=1974&auto=format&fit=crop",
};


const subcategoryBadges: Record<string, string> = {
  "almonds-badam": "Premium",
  "cashews-kaju": "Bestseller",
  "pistachios-pista": "New",
  "walnuts-akhrot": "Luxury",
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParentId, setActiveParentId] = useState<number | null>(null);

  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.log(error);
      } else {
        const fetchedCategories = data || [];
        setCategories(fetchedCategories);
        const firstParent = fetchedCategories.find(cat => cat.parent_id === null);
        if (firstParent) {
          setActiveParentId(firstParent.id);
        }
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.classList.remove('animate-fade-in');
      void contentRef.current.offsetWidth;
      contentRef.current.classList.add('animate-fade-in');
    }
  }, [activeParentId]);

  const parents = categories.filter((cat) => cat.parent_id === null);
  const getSubcategories = (parentId: number) =>
    categories.filter((cat) => cat.parent_id === parentId);

  if (!activeParentId) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="w-16 h-16 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSubcategories = getSubcategories(activeParentId);

  return (
    <section className="bg-white min-h-screen">
      <div className="container mx-auto px-4 pt-12 sm:pt-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neutral-800 mb-8 text-center">
          Explore <span className="luxury-gradient font-serif font-extrabold">TAMOOR</span> Categories
        </h1>

        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-4 mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {parents.map((parent) => (
              <button
                key={parent.id}
                onClick={() => setActiveParentId(parent.id)}
                className={`
                  flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ease-in-out
                  ${activeParentId === parent.id
                    ? 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-white shadow-lg'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
              >
                {parent.name}
              </button>
            ))}
          </div>
        </div>
        
        <div ref={contentRef} className="opacity-0">
          {activeSubcategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-12">
              {activeSubcategories.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/products?categoryId=${sub.id}`)}
                  className="category-card group cursor-pointer rounded-2xl overflow-hidden relative shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:shadow-neutral-300/60 transition-shadow duration-300"
                >
                  <img
                    src={subcategoryImages[sub.slug] || "https://via.placeholder.com/400x300"}
                    alt={sub.name}
                    className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {subcategoryBadges[sub.slug] && (
                    <span className="absolute top-3 left-3 bg-luxury-gold text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {subcategoryBadges[sub.slug]}
                    </span>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                    <h3 className="font-display font-bold text-base sm:text-lg text-shadow-md group-hover:text-luxury-gold-light transition-colors">
                      {sub.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-500">
              <p>No products found in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;