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
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from '../utils/supabaseClient';
import almonds from "../assets/categories/almondcat.webp";
import cashews from "../assets/categories/cashewcat.webp";
import pista from "../assets/categories/pistacat.webp";
import walnut from "../assets/categories/walnutcat.webp";
import hazlnuts from "../assets/categories/hazelcat.webp";
import pecans from "../assets/categories/pecans.webp";
import macadamia from "../assets/categories/macadamiacat.webp";
import pinenuts from "../assets/categories/pinecat.webp";
import raisins from "../assets/categories/raisincat.webp";
import anjeer from "../assets/categories/anjeercat.webp";
import apricot from "../assets/categories/apricotcat.webp";
import dates from "../assets/categories/datecat.webp";
import prunes from "../assets/categories/prunecat.webp";
import cranberry from "../assets/categories/crancat.webp";
import blueberry from "../assets/categories/blueberrycat.webp";
import black from "../assets/categories/blackcat.webp";
import pumpkin from "../assets/categories/pumpcat.webp";
import sunflower from "../assets/categories/suncat.webp";
import chia from "../assets/categories/chiaseedscat.webp";
import flax from "../assets/categories/flaxcat.webp";
import mixseeds from "../assets/categories/seedsmixcat.webp";
import mixes from "../assets/categories/nutsmix.webp";
import trail from "../assets/categories/trailmix.webp";
import exotic from "../assets/categories/berries.webp";
import salted from "../assets/categories/saltedmixcat.webp";
import roasted from "../assets/categories/roastedmixcat.webp";
import darkc from "../assets/categories/darkcat.webp";
import milkc from "../assets/categories/milkcat.webp";
import whitec from "../assets/categories/whitecat.webp";
import barc from "../assets/categories/cbar.webp";
import trufc from "../assets/categories/truffls.webp";
import ccn from "../assets/categories/ccncat.webp";
import hpc from "../assets/categories/cpowdercat.webp";
import swissc from "../assets/categories/swisscat.webp";
import belgianc from "../assets/categories/belgiumcat.webp";
import giftc from "../assets/categories/giftboxcat.webp";
import importedc from "../assets/categories/importedcat.webp";
import sugarc from "../assets/categories/sugarfreecat.webp";
import birham from "../assets/categories/birthham.webp";
import anniham from "../assets/categories/anniham.webp";
import wedham from "../assets/categories/wedham.webp";
import festham from "../assets/categories/festham.webp";
import corham from "../assets/categories/corham.webp";
import dryham from "../assets/categories/dryham.webp";
import choham from "../assets/categories/chocham.webp";
import mixham from "../assets/categories/mixham.webp";
import healham from "../assets/categories/healham.webp";
import woodham from "../assets/categories/woodenham.webp";
import baskham from "../assets/categories/baskethampers.webp";
import desham from "../assets/categories/desham.webp";
import fruitj from "../assets/categories/fruitjcat.webp";
import impj from "../assets/categories/impjcat.webp";
import specialj from "../assets/categories/spejcat.webp";
import softj from "../assets/categories/softjcat.webp";
import healthj from "../assets/categories/heljcat.webp";
import brazil from "../assets/categories/brazil.webp"
import kiwi from "../assets/categories/kiwi.webp";
import plums from "../assets/categories/blackp.webp";
import amla from "../assets/categories/amla.webp";
import ginger from "../assets/categories/ginger.webp";
import lemon from "../assets/categories/lemon.webp";
import makhana from "../assets/categories/makha.webp";
import rasp from "../assets/categories/rasp.webp";
import blackberry from "../assets/categories/blackber.webp";
import strawberry from "../assets/categories/straw.webp";
import cherry from "../assets/categories/cherry.webp";
import chikki from "../assets/categories/chikki.webp";
import mouth from "../assets/categories/mukhwa.webp";
import toble from "../assets/categories/tobcat.webp";
import cadbury from "../assets/categories/cadcat.webp";
import godiva from "../assets/categories/godcat.webp";
import lindt from "../assets/categories/lindtcat.webp";
import whit from "../assets/categories/whitcat.webp";
import rhine from "../assets/categories/rhinecat2.webp";
import beast from "../assets/categories/beastcat.webp";
import kinder from "../assets/categories/kincat.webp";
import ferrero from "../assets/categories/fercat.webp";
import milka from "../assets/categories/milkacat.webp";
import hershey from "../assets/categories/herscat.webp";
import raf from "../assets/categories/raf.webp";
import wedel from "../assets/categories/wedel.jpg";
import neu from "../assets/categories/Neuhaus Chocolate.webp";
import cng from "../assets/categories/candiesgums.webp";
import cnb from "../assets/categories/Import.webp";
import sns from "../assets/categories/Sauces_and_Spreads.webp";
import cocoa from "../assets/categories/Cocoa.webp";
import kunafa from "../assets/categories/Lindt_Kunafa.jpg";
import coffee from "../assets/categories/DavidoffFineCreama.webp";
import flower from "../assets/categories/floral.jpeg";
import contain from "../assets/categories/cantain.jpeg";
import nature from "../assets/categories/nature.jpeg";
import premium from "../assets/categories/premium.jpeg";
import fest from "../assets/categories/fest.jpeg";
import toy from "../assets/categories/toy.jpeg";
import { Helmet } from 'react-helmet-async'; // <-- 1. Import Helmet



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
  "brazil-nuts": brazil,

  // Dried Fruits
  "raisins-kishmish": raisins,
  "figs-anjeer": anjeer,
  "apricots-khubani": apricot,
  "dates-khajoor": dates,
  "prunes-dried-plums": prunes,
  "cranberries": cranberry,
  "blueberries": blueberry,
  "black-currants": black,
  "raspberries": rasp,
  "blackberries": blackberry,
  "cherries":cherry,
  "strawberries":strawberry,
  "kiwi" : kiwi,
  "amla" : amla,
  "plums": plums,
  "ginger":ginger,
  "lemon":lemon,

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
  "makhana":makhana,
  

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
  "godiva" : godiva,
  "toblerone" : toble,
  "lindt" : lindt,
  "mr-beast" : beast,
  "cadbury" : cadbury,
  "milka" : milka,
  "ferrero-rocher" : ferrero,
  "kinder-joy" : kinder,
  "hersheys" : hershey,
  "whittakers" : whit,
  "rhine-valley" : rhine,
  "raffaello" : raf,
  "wedel" : wedel,
  "neuhaus" : neu,
  "cookies-and-biscuits" : cnb,
  "sauces-and-spreads" : sns,
  "cocoa-melts" : cocoa,
  "kunafa-chocolates" : kunafa,
  "coffee" : coffee,
  "candies-gums-and-mints" : cng,

  //candles

  "floral-candles" : flower,
  "container-candles" : contain,
  "toy-candles" : toy,
  "premium-candles" : premium,
  "festive-candles" : fest,
  "nature-shape" : nature,


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
  "mouth-freshners" :mouth,
  "chikkis" : chikki,
};


const subcategoryBadges: Record<string, string> = {
  "almonds-badam": "Premium",
  "cashews-kaju": "Bestseller",
  "pistachios-pista": "New",
  "walnuts-akhrot": "Luxury",
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // const [activeParentId, setActiveParentId] = useState<number | null>(null); // <-- 1. REMOVED
  const [searchParams, setSearchParams] = useSearchParams(); // <-- 1. ADDED

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
        // --- 2. REMOVED logic that set default state ---
        // const firstParent = fetchedCategories.find(cat => cat.parent_id === null);
        // if (firstParent) {
        //   setActiveParentId(firstParent.id);
        // }
      }
    };
    fetchCategories();
  }, []); // This effect fetches data ONLY once.

  // --- 3. ADDED new useEffect to sync URL ---
  useEffect(() => {
    // Don't do anything until categories are loaded
    if (categories.length === 0) return;

    const allParents = categories.filter(cat => cat.parent_id === null);
    if (allParents.length === 0) return; // No parents, nothing to do

    const currentTab = searchParams.get('tab');
    const isValidTab = allParents.some(p => p.slug === currentTab);

    // If no tab is set, or the tab is invalid, set it to the first parent's slug
    if (!currentTab || !isValidTab) {
      // Use replace: true so this doesn't create a new history entry
      setSearchParams({ tab: allParents[0].slug }, { replace: true });
    }
  // This effect runs when categories load, or if the user messes with the URL
  }, [categories, searchParams, setSearchParams]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.classList.remove('animate-fade-in');
      void contentRef.current.offsetWidth;
      contentRef.current.classList.add('animate-fade-in');
    }
  }, [searchParams]); // <-- 4. CHANGED dependency from activeParentId

  // --- 5. DERIVED STATE: Get active tab from URL ---
  const parents = categories.filter((cat) => cat.parent_id === null);
  const activeTabSlug = searchParams.get('tab');
  
  // Find the parent that matches the slug, or fall back to the first parent
  const activeParent = parents.find(p => p.slug === activeTabSlug) || 
                      (parents.length > 0 ? parents[0] : null);
                      
  const activeParentId = activeParent ? activeParent.id : null;
  // --- END DERIVED STATE ---

  const getSubcategories = (parentId: number) =>
    categories.filter((cat) => cat.parent_id === parentId);

  // --- SEO Logic ---
  // const activeParent = parents.find(p => p.id === activeParentId); // <-- 5. REMOVED (now derived above)
  const pageTitle = activeParent
    ? `Explore ${activeParent.name} | TAMOOR Categories`
    : 'Explore All Categories | TAMOOR Premium Dry Fruits & Nuts';
  const pageDescription = activeParent && activeParentId // <-- 5. ADDED check
    ? `Browse all subcategories under ${activeParent.name} at TAMOOR. Find premium ${activeParent.name.toLowerCase()} like ${getSubcategories(activeParentId).slice(0, 3).map(s => s.name).join(', ')} online.`
    : 'Discover TAMOOR\'s wide range of product categories, including premium nuts, dried fruits, chocolates, gift hampers, and more. Shop online from Bangalore & Kolar.';
  // --- End SEO Logic ---

  if (!activeParent) { // <-- 6. CHANGED check from activeParentId to activeParent
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="w-16 h-16 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSubcategories = activeParentId ? getSubcategories(activeParentId) : []; // <-- 7. ADDED check

  return (
    <> {/* <-- Wrap in Fragment */}
      {/* --- 2. Add Helmet --- */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href="https://www.tamoor.in/categories" /> {/* Canonical for the main categories page */}

        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content="https://www.tamoor.in/categories" />
        <meta property="og:image" content="https://www.tamoor.in/tamoor-og-categories.jpg" /> {/* Create a specific OG image for categories */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TAMOOR" />


        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.tamoor.in/tamoor-twitter-categories.jpg" /> {/* Create a specific Twitter image */}
      </Helmet>
      {/* --- End Helmet --- */}
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
                onClick={() => setSearchParams({ tab: parent.slug })}
                className={`
                  flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ease-in-out
                  ${activeParent.id === parent.id
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
    </>
  );
};

export default Categories;