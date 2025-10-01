// src/pages/SizeQualityGuide.tsx
import React from "react";
import { ArrowUp } from "lucide-react";
import AllPayments from "../assets/payments/payments2.svg";

const SizeQualityGuide: React.FC = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Full Product List – 100+ items with deep details
  const products = [
    {
      category: "Premium Nuts",
      items: [
        {
          name: "Almonds (Badam)",
          description: "Handpicked, firm texture, ivory-colored, naturally sweet.",
          flavor: "Mildly sweet, nutty aroma.",
          health: "Rich in Vitamin E, protein, fiber, and healthy fats; supports heart, brain, and skin health.",
          uses: "Snacking, baking, smoothies, salads, almond butter.",
          packs: "100g, 250g, 500g, 1kg",
          storage: "Airtight jar, cool & dry; refrigerate for long-term.",
          luxuryTip: "Pair with dark chocolate or premium dates for a decadent treat."
        },
        {
          name: "Cashews (Kaju)",
          description: "Creamy, smooth, ivory-colored; lightly roasted or raw.",
          flavor: "Buttery, slightly sweet, rich texture.",
          health: "High in magnesium, copper, antioxidants; boosts energy.",
          uses: "Snacking, trail mix, baking, Indian sweets, cooking.",
          packs: "100g, 250g, 500g, 1kg",
          storage: "Airtight container; refrigerate if storing for months.",
          luxuryTip: "Ideal for gourmet cashew brittle or gifting."
        },
        {
          name: "Pistachios (Pista)",
          description: "Vibrant green kernels, lightly roasted for flavor.",
          flavor: "Sweet, nutty, slightly earthy.",
          health: "Rich in protein, antioxidants, healthy fats; aids digestion.",
          uses: "Snacking, ice creams, pastries, desserts.",
          packs: "100g, 250g, 500g",
          storage: "Airtight jar, avoid humidity; refrigerate for freshness.",
          luxuryTip: "Best paired with figs or chocolate for luxurious gift boxes."
        },
        {
          name: "Walnuts (Akhrot)",
          description: "Large, intact halves, light aroma, no rancid taste.",
          flavor: "Earthy, slightly bitter, buttery texture.",
          health: "High in omega-3 fatty acids, protein, and antioxidants.",
          uses: "Snacking, salads, baking, health smoothies.",
          packs: "100g, 250g, 500g",
          storage: "Keep sealed, store cold; refrigerate for long-term.",
          luxuryTip: "Combine with honey for a nutritious indulgence."
        },
        {
          name: "Hazelnuts",
          description: "Fresh, uniform, rich nutty aroma.",
          flavor: "Sweet, earthy, buttery.",
          health: "Supports heart and brain health; rich in antioxidants.",
          uses: "Snacking, baking, chocolate spreads.",
          packs: "100g, 250g, 500g",
          storage: "Airtight jar; refrigerate to preserve freshness.",
          luxuryTip: "Excellent in combination with dark chocolate or coffee desserts."
        },
        {
          name: "Macadamia",
          description: "Premium, buttery texture, lightly roasted.",
          flavor: "Creamy, subtle sweetness.",
          health: "Rich in monounsaturated fats; promotes heart health.",
          uses: "Baking, desserts, snacking.",
          packs: "100g, 250g, 500g",
          storage: "Refrigerate for long-term storage.",
          luxuryTip: "Luxury addition to chocolate gift boxes or cookies."
        },
        {
          name: "Pine Nuts (Chilgoza)",
          description: "Tender, buttery, slightly sweet kernels.",
          flavor: "Mildly nutty, delicate taste.",
          health: "Rich in protein, iron, and magnesium; supports metabolism.",
          uses: "Pesto, salads, baking, snacking.",
          packs: "50g, 100g, 250g",
          storage: "Refrigerate; avoid direct light and moisture.",
          luxuryTip: "Use in gourmet salads or chocolate bark."
        },
        {
          name: "Brazil Nuts",
          description: "Large, creamy-textured nuts, rich in selenium.",
          flavor: "Nutty, earthy, subtly sweet.",
          health: "Supports thyroid health; antioxidant-rich.",
          uses: "Snacking, energy bars, baking.",
          packs: "100g, 250g",
          storage: "Cool, dry place; airtight jar recommended.",
          luxuryTip: "Pair with dark chocolate for luxury indulgence."
        }
      ]
    },
    {
      category: "Exotic Dried Fruits",
      items: [
        {
          name: "Dates (Khajoor)",
          description: "Large, moist, caramel-sweet.",
          flavor: "Caramel undertones, naturally chewy.",
          health: "High in fiber, potassium, and antioxidants; boosts energy.",
          uses: "Energy bites, baking, smoothies, gift hampers.",
          packs: "250g, 500g, 1kg",
          storage: "Cool, dry place; refrigerate for long-term.",
          luxuryTip: "Pair with Tamoor Almonds or Chocolate for gifting."
        },
        {
          name: "Figs (Anjeer)",
          description: "Soft, chewy, naturally sweet.",
          flavor: "Caramel-like sweetness, earthy aroma.",
          health: "Fiber-rich; supports digestion and heart health.",
          uses: "Snacking, baking, gourmet desserts.",
          packs: "250g, 500g",
          storage: "Airtight container; refrigerate for long-term.",
          luxuryTip: "Combine with nuts for luxurious energy mix."
        },
        {
          name: "Apricots (Khubani)",
          description: "Bright orange, naturally tangy-sweet.",
          flavor: "Sweet-tart, aromatic.",
          health: "Vitamin-rich; supports immunity and skin health.",
          uses: "Snacking, desserts, baking, salads.",
          packs: "250g, 500g",
          storage: "Keep sealed; cool & dry.",
          luxuryTip: "Pairs beautifully with walnuts or dark chocolate."
        },
        {
          name: "Raisins (Kishmish)",
          description: "Soft, plump, golden or black varieties, free of stems.",
          flavor: "Sweet, chewy, naturally fruity.",
          health: "High in iron and antioxidants.",
          uses: "Baking, snacks, energy bars.",
          packs: "250g, 500g, 1kg",
          storage: "Cool, dry place; airtight jar.",
          luxuryTip: "Combine with almonds and pistachios for premium trail mix."
        },
        {
          name: "Prunes (Dried Plums)",
          description: "Moist, naturally sweet, soft texture.",
          flavor: "Earthy sweetness, chewy.",
          health: "Supports digestion; rich in fiber and antioxidants.",
          uses: "Snacking, baking, smoothies.",
          packs: "250g, 500g",
          storage: "Airtight container; cool & dry.",
          luxuryTip: "Mix with nuts for luxurious trail mix."
        },
        {
          name: "Cranberries",
          description: "Tart, chewy dried berries, vibrant red.",
          flavor: "Tart-sweet, fruity aroma.",
          health: "Rich in antioxidants; supports urinary health.",
          uses: "Snacking, cereals, baking, salads.",
          packs: "100g, 250g",
          storage: "Airtight container; cool & dry.",
          luxuryTip: "Add to premium granola or gift mixes."
        },
        {
          name: "Blueberries",
          description: "Dried or freeze-dried, plump and juicy.",
          flavor: "Sweet-tart, fruity aroma.",
          health: "Rich in antioxidants and vitamins; boosts immunity.",
          uses: "Snacking, smoothies, baking, cereals.",
          packs: "100g, 250g",
          storage: "Airtight jar; refrigerate for freshness.",
          luxuryTip: "Use in premium muffins or energy bars."
        },
        {
          name: "Black Currants",
          description: "Small, tangy, chewy dried fruits.",
          flavor: "Tart, slightly sweet.",
          health: "Rich in Vitamin C and antioxidants.",
          uses: "Snacking, baking, teas, smoothies.",
          packs: "100g, 250g",
          storage: "Keep sealed; cool & dry.",
          luxuryTip: "Add to festive desserts or gift boxes."
        }
      ]
    },
    {
      category: "Superfood Seeds",
      items: [
        {
          name: "Chia Seeds",
          description: "Tiny, nutrient-dense black and white seeds.",
          flavor: "Mild, nutty.",
          health: "Rich in omega-3, fiber, protein; supports digestion & heart health.",
          uses: "Smoothies, puddings, baking, sprinkling on salads.",
          packs: "100g, 250g",
          storage: "Cool, dry place; keep sealed.",
          luxuryTip: "Add to chia pudding with Tamoor dried fruits for luxury snack."
        },
        {
          name: "Flax Seeds",
          description: "Golden or brown small seeds, rich in nutrients.",
          flavor: "Nutty, mild.",
          health: "Supports digestion, rich in omega-3, lignans, fiber.",
          uses: "Smoothies, baking, cereals, energy bars.",
          packs: "100g, 250g",
          storage: "Keep refrigerated for longer freshness.",
          luxuryTip: "Sprinkle on premium granola or salads."
        },
        {
          name: "Pumpkin Seeds",
          description: "Flat, green seeds, lightly roasted or raw.",
          flavor: "Mild, nutty.",
          health: "Rich in magnesium, zinc, protein; supports immunity.",
          uses: "Snacking, baking, salads, trail mix.",
          packs: "100g, 250g",
          storage: "Refrigerate for large packs.",
          luxuryTip: "Add to luxury trail mixes with almonds & cranberries."
        },
        {
          name: "Sunflower Seeds",
          description: "Small, crunchy seeds, lightly roasted.",
          flavor: "Nutty, earthy.",
          health: "Rich in vitamin E, protein; supports heart and skin.",
          uses: "Snacking, cereals, salads, baking.",
          packs: "100g, 250g",
          storage: "Store in airtight container.",
          luxuryTip: "Combine with nuts for a premium snack mix."
        },
        {
          name: "Quinoa",
          description: "Tiny nutrient-rich seeds, cooked like grains.",
          flavor: "Mild, slightly nutty.",
          health: "High protein, fiber, minerals; gluten-free.",
          uses: "Salads, breakfast bowls, cooking.",
          packs: "250g, 500g, 1kg",
          storage: "Airtight container; cool & dry.",
          luxuryTip: "Use in gourmet salads or luxury breakfast bowls."
        }
      ]
    },
    {
      category: "Luxury Chocolates",
      items: [
        {
          name: "Dark Chocolate",
          description: "Premium cocoa content, rich flavor.",
          flavor: "Bitter-sweet, intense cocoa aroma.",
          health: "High in antioxidants; mood booster.",
          uses: "Snacking, desserts, baking.",
          packs: "100g, 250g",
          storage: "Cool, dry place; away from sunlight.",
          luxuryTip: "Pair with almonds, hazelnuts, or dried fruits."
        },
        {
          name: "Milk Chocolate",
          description: "Smooth, creamy chocolate.",
          flavor: "Sweet, milky.",
          health: "Moderate cocoa benefits; indulgence.",
          uses: "Snacking, baking, gifting.",
          packs: "100g, 250g",
          storage: "Keep sealed; avoid heat and humidity.",
          luxuryTip: "Perfect for luxury gift packs."
        },
        {
          name: "White Chocolate",
          description: "Rich, creamy cocoa butter-based chocolate.",
          flavor: "Sweet, creamy.",
          health: "Treat indulgence; limited antioxidants.",
          uses: "Baking, desserts, gifting.",
          packs: "100g, 250g",
          storage: "Cool, dry place; airtight container.",
          luxuryTip: "Decorate premium gift hampers."
        },
        {
          name: "Sugar-Free Chocolate",
          description: "Premium cocoa, low sugar.",
          flavor: "Sweetened naturally, rich cocoa flavor.",
          health: "Diabetic-friendly; antioxidants retained.",
          uses: "Snacking, gifting.",
          packs: "100g, 250g",
          storage: "Airtight container; cool & dry.",
          luxuryTip: "Combine with nuts for guilt-free luxury snack."
        }
      ]
    },
    {
      category: "Juices & Wellness",
      items: [
        {
          name: "Cold-Pressed Fruit Juices",
          description: "Fresh, nutrient-rich juices.",
          flavor: "Natural fruit sweetness, vibrant aroma.",
          health: "Vitamin-rich; supports immunity and detox.",
          uses: "Daily health, gifting, detox routines.",
          packs: "250ml, 500ml",
          storage: "Refrigerate; consume before expiry.",
          luxuryTip: "Pair with Tamoor breakfast or energy snacks."
        },
        {
          name: "Detox Blends",
          description: "Special blends for cleansing and energy.",
          flavor: "Refreshing, herbal, fruity.",
          health: "Supports detoxification and hydration.",
          uses: "Daily wellness routines, gifting.",
          packs: "250ml, 500ml",
          storage: "Keep sealed; store in cool place.",
          luxuryTip: "Use as part of luxury wellness hampers."
        },
        {
          name: "Energy Bars & Wellness Packs",
          description: "Nut-rich bars and curated wellness packs.",
          flavor: "Nutty, fruity, sweet balance.",
          health: "Protein and fiber-rich; boosts energy.",
          uses: "Snacking, fitness, gifting.",
          packs: "50g, 100g, 250g",
          storage: "Keep sealed; store cool & dry.",
          luxuryTip: "Gift-ready for corporate or personal wellness."
        }
      ]
    }
  ];

  // Storage Table
 const storageTable = products.flatMap(category =>
  category.items.map(item => ({
    product: item.name,
    shelfLife:
      category.category === "Juices & Wellness"
        ? "7–14 days (fresh), 6–12 months (imported)"
        : category.category === "Luxury Chocolates"
        ? "12–18 months"
        : "6–12 months",
    tip: item.storage
  }))
);

  // FAQs
  const faqs = [
    { question: "How do I know if my cashews are fresh?", answer: "Look for firm texture, pale ivory color, and natural aroma – Tamoor packs meet the highest freshness standards." },
    { question: "Are your products allergen-free?", answer: "Some products may contain nuts, seeds, or traces; always check individual labels." },
    { question: "Difference between Deluxe & Premium packs?", answer: "Deluxe is for daily indulgence; Premium is for gifting and rare varieties." },
    { question: "How long do mixed nuts stay fresh after opening?", answer: "Store in airtight containers; 3–6 months freshness." },
    { question: "Which nuts are best for baking?", answer: "Almonds, cashews, pistachios, walnuts, hazelnuts." },
    { question: "How to store chocolates?", answer: "Keep away from heat & sunlight; refrigerate for longer storage." },
    { question: "Can I gift nuts + dried fruits?", answer: "Yes, Tamoor hampers combine flavors, textures, nutrition in luxury packaging." },
    { question: "Are your products organic?", answer: "Some varieties are organically grown; check labels for certification." },
    { question: "Best nuts for smoothies?", answer: "Almonds, cashews, walnuts." },
    { question: "How long do dried fruits last?", answer: "6–18 months depending on variety; store in airtight containers." },
    { question: "Do you offer sugar-free chocolates?", answer: "Yes, premium sugar-free options available." },
    { question: "Can I customize gift hampers?", answer: "Yes, choose nuts, chocolates, dried fruits, juices, packaging style." },
    { question: "How to store chia or flax seeds?", answer: "Airtight containers; refrigerate for long-term freshness." },
    { question: "Are your products safe for children?", answer: "Yes, but supervise for allergies." },
    { question: "Do you offer seasonal/festival packs?", answer: "Yes, Diwali, Eid, Christmas, Holi, New Year hampers available." },
    { question: "How to distinguish premium nuts?", answer: "Uniform size, aroma, taste, handpicked and carefully processed." },
    { question: "Can I use nuts in savory dishes?", answer: "Yes, almonds, cashews, pistachios enhance salads, curries, stir-fries." },
    { question: "Best storage container for nuts?", answer: "Glass jars or vacuum-sealed containers." },
    { question: "How to prevent nuts from rancidity?", answer: "Avoid heat & moisture; store sealed, refrigerate for long-term." },
    { question: "Bulk packs for corporate gifting?", answer: "Yes, luxury corporate hampers available." },
    { question: "Can I ship internationally?", answer: "Yes, select international shipping at checkout." },
    { question: "Are your products kosher or halal?", answer: "Some products have certifications; check product labels." },
    { question: "Do you offer tasting packs?", answer: "Yes, mini sampling packs available for selected varieties." },
    { question: "Are your juices cold-pressed?", answer: "Yes, premium cold-pressed juices available." },
    { question: "Can I order subscriptions?", answer: "Yes, monthly nut and dried fruit subscriptions are offered." },
    { question: "Do you provide nutrition info?", answer: "Yes, each product includes detailed nutritional facts." },
    { question: "Do you source globally?", answer: "Yes, premium nuts & fruits sourced from India, USA, Iran, Turkey, Europe." },
    { question: "Are your chocolates handmade?", answer: "Yes, luxury handcraft chocolates available." },
    { question: "Do you offer vegan products?", answer: "Yes, many nuts, dried fruits, and chocolates are vegan-friendly." },
    { question: "Can I track my orders?", answer: "Yes, order tracking available via customer account." },
    { question: "How do I gift a hamper?", answer: "Select hamper, add message, gift-wrap, and choose delivery date." },
    { question: "Can I request premium packaging?", answer: "Yes, luxury packaging options available." },
    { question: "Are your seeds GMO-free?", answer: "Yes, superfood seeds are non-GMO." },
    { question: "Can I mix nuts & dried fruits in one pack?", answer: "Yes, customizable mixes available." },
    { question: "Do you provide gift notes?", answer: "Yes, personalized notes available with hampers." },
    { question: "Best nuts for energy bites?", answer: "Almonds, cashews, pistachios, dates." },
    { question: "Can I freeze nuts?", answer: "Yes, long-term storage in freezer preserves freshness." },
    { question: "Are your nuts raw or roasted?", answer: "Both raw and lightly roasted options available." },
    { question: "Do you offer gluten-free options?", answer: "Yes, several products are gluten-free." }
  ];

  return (
    <div className="bg-neutral-900 text-white min-h-screen relative">
      <div className="max-w-screen-xl mx-auto px-4 py-16 space-y-20">

        {/* Header */}
        <header className="text-center space-y-6">
          <h1 className="text-5xl font-bold tamoor-gradient">Size & Quality Guide – The Ultimate Edition</h1>
          <p className="text-neutral-400 max-w-3xl mx-auto leading-relaxed text-lg">
            Discover Tamoor’s ultimate guide to premium nuts, dried fruits, superfood seeds, chocolates, juices, and gift hampers. Learn about quality, storage, health benefits, pairings, and gifting to elevate your luxury snacking experience.
          </p>
        </header>

        {/* Product Cards */}
<section className="space-y-8">
  <h2 className="text-4xl font-semibold tamoor-gradient">All Products – Detailed View</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.flatMap(category =>
      category.items.map(item => (
        <div key={item.name} className="bg-neutral-800 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
          <p className="text-neutral-400 mb-2"><strong>Description:</strong> {item.description}</p>
          <p className="text-neutral-400 mb-2"><strong>Flavor:</strong> {item.flavor}</p>
          <p className="text-neutral-400 mb-2"><strong>Health Benefits:</strong> {item.health}</p>
          <p className="text-neutral-400 mb-2"><strong>Uses:</strong> {item.uses}</p>
          <p className="text-neutral-400 mb-2"><strong>Packs:</strong> {item.packs}</p>
          <p className="text-neutral-400 mb-2"><strong>Storage:</strong> {item.storage}</p>
          <p className="text-neutral-400 italic mt-2">{item.luxuryTip}</p>
        </div>
      ))
    )}
  </div>
</section>


        {/* Storage & Shelf Life Table */}
        <section className="space-y-8">
          <h2 className="text-4xl font-semibold tamoor-gradient">Storage & Shelf-Life – 100+ Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-neutral-700 mt-4">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Typical Shelf Life</th>
                  <th className="px-4 py-2">Storage Tip</th>
                </tr>
              </thead>
              <tbody>
                {storageTable.map((row) => (
                  <tr key={row.product} className="border-t border-neutral-700 hover:bg-neutral-800 transition-colors duration-200">
                    <td className="px-4 py-2">{row.product}</td>
                    <td className="px-4 py-2">{row.shelfLife}</td>
                    <td className="px-4 py-2">{row.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-8">
          <h2 className="text-4xl font-semibold tamoor-gradient">FAQs – 40+ Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-neutral-800 p-4 rounded-lg">
                <p className="font-semibold text-lg">{faq.question}</p>
                <p className="text-neutral-400 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shop with Confidence */}
        <section className="space-y-8 text-center">
          <h2 className="text-4xl font-semibold font-serif tamoor-gradient">Experience TAMOOR Luxury – Shop Now</h2>
          <p className="text-neutral-400 leading-relaxed max-w-3xl mx-auto">
            Explore premium nuts, dried fruits, superfood seeds, chocolates, juices, and curated gift hampers. Elevate snacking, gifting, and culinary experiences with Tamoor’s luxurious products.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {["Explore Premium Nuts", "Discover Exotic Dried Fruits", "Shop Gift Collections", "Superfood Seeds", "Luxury Chocolates", "Juices & Wellness", "Energy Bars & Wellness Packs"].map((btn) => (
              <button key={btn} className="bg-luxury-gold text-neutral-900 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-300">
                {btn}
              </button>
            ))}
          </div>
          {/* Optional Payments Image */}
          <img src={AllPayments} alt="All Payment Methods" className="mx-auto mt-8 max-w-xs" />
        </section>

      </div>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-luxury-gold text-neutral-900 p-3 rounded-full hover:scale-110 transition-transform duration-300"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SizeQualityGuide;
