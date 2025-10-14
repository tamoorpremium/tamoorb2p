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
import raisins from "../assets/categories/raisincat.jpg";
import anjeer from "../assets/categories/anjeercat.jpg";
import apricot from "../assets/categories/apricotcat.jpg";
import dates from "../assets/categories/datecat.jpg";
import prunes from "../assets/categories/prunecat.jpg";
import cranberry from "../assets/categories/crancat.jpg";
import blueberry from "../assets/categories/blueberrycat.jpg";
import black from "../assets/categories/blackcat.jpg";
import pumpkin from "../assets/categories/pumpcat.jpg";
import sunflower from "../assets/categories/suncat.jpg";
import chia from "../assets/categories/chiaseedscat.jpg";
import flax from "../assets/categories/flaxcat.jpg";
import mixseeds from "../assets/categories/seedsmixcat.jpg";
import mixes from "../assets/categories/nutsmix.jpg";
import trail from "../assets/categories/trailmix.jpg";
import exotic from "../assets/categories/berries.jpg";
import salted from "../assets/categories/saltedmixcat.jpg";
import roasted from "../assets/categories/roastedmixcat.jpg";
import darkc from "../assets/categories/darkcat.jpg";
import milkc from "../assets/categories/milkcat.jpg";
import whitec from "../assets/categories/whitecat.jpg";
import barc from "../assets/categories/cbar.jpg";
import trufc from "../assets/categories/truffls.jpg";
import ccn from "../assets/categories/ccncat.jpg";
import hpc from "../assets/categories/cpowdercat.jpg";
import swissc from "../assets/categories/swisscat.jpg";
import belgianc from "../assets/categories/belgiumcat.jpg";
import giftc from "../assets/categories/giftboxcat.jpg";
import importedc from "../assets/categories/importedcat.jpg";
import sugarc from "../assets/categories/sugarfreecat.jpg";
import birham from "../assets/categories/birthham.jpg";
import anniham from "../assets/categories/anniham.jpg";
import wedham from "../assets/categories/wedham.jpg";
import festham from "../assets/categories/festham.jpg";
import corham from "../assets/categories/corham.jpeg";
import dryham from "../assets/categories/dryham.jpg";
import choham from "../assets/categories/chocham.jpg";
import mixham from "../assets/categories/mixham.jpg";
import healham from "../assets/categories/healham.jpg";
import woodham from "../assets/categories/woodenham.jpg";
import baskham from "../assets/categories/baskethampers.jpg";
import desham from "../assets/categories/desham.jpg";
import fruitj from "../assets/categories/fruitjcat.jpg";
import impj from "../assets/categories/impjcat.jpg";
import specialj from "../assets/categories/spejcat.jpg";
import softj from "../assets/categories/softjcat.jpg";
import healthj from "../assets/categories/heljcat.jpg";






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
  "raisins-kishmish": raisins,
  "figs-anjeer": anjeer,
  "apricots-khubani": apricot,
  "dates-khajoor": dates,
  "prunes-dried-plums": prunes,
  "cranberries": cranberry,
  "blueberries": blueberry,
  "black-currants": black,

  // Seeds & Others
  "pumpkin-seeds": pumpkin,
  "sunflower-seeds": sunflower,
  "chia-seeds": chia,
  "flax-seeds": flax,
  "mixed-seeds": mixseeds,
  "mixes": mixes,
  "trail-mix": trail,
  "exotic-mix": exotic,
  "salted-mix": salted,
  "roasted-mix": roasted,

  // Chocolate
  "dark-chocolate": darkc,
  "milk-chocolate": milkc,
  "white-chocolate": whitec,
  "chocolate-bars": barc,
  "chocolate-truffles": trufc,
  "chocolate-covered-nuts-fruits": ccn,
  "hot-chocolate-powder": hpc,
  "swiss-chocolates": swissc,
  "belgian-chocolates": belgianc,
  "luxury-chocolate-gift-packs": giftc,
  "imported-chocolates": importedc,
  "sugarfree-chocolates": sugarc,

  // Gift Hampers
  "birthday-hampers": birham,
  "anniversary-hampers": anniham,
  "wedding-hampers": wedham,
  "festival-hampers": festham,
  "corporate-hampers": corham,
  "dry-fruit-hampers": dryham,
  "chocolate-hampers": choham,
  "mixed-hampers": mixham,
  "healthy-hampers": healham,
  "premium-wooden-box": woodham,
  "basket-hampers": baskham,
  "designer-hampers": desham,

  // Juices
  "fruit-juices": fruitj,
  "special-juices": specialj,
  "imported-juices": impj,
  "soft-drinks": softj,
  "health-detox": healthj,
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