// src/pages/BlogRecipesExpanded.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Recipe = {
  name: string;
  difficulty: string;
  time: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
};

type BlogPost = {
  title: string;
  author: string;
  date: string;
  snippet: string;
  content: string;
};

// Inside your component:



// Full 50 Luxurious Tamoor Recipes
export const recipes : Recipe[] = [
  {
    name: "Golden Pistachio Baklava",
    difficulty: "Medium",
    time: "45 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["200g pistachios, chopped", "250g phyllo dough", "100g butter, melted", "100g sugar", "1 tsp cinnamon", "50ml honey", "50ml water"],
    steps: [
      "Preheat oven to 180°C (356°F).",
      "Layer phyllo dough sheets in a greased pan, brushing each layer with melted butter.",
      "Sprinkle chopped pistachios and cinnamon evenly over layers.",
      "Continue layering until all ingredients are used.",
      "Cut baklava into diamond shapes.",
      "Bake for 25-30 minutes until golden.",
      "Boil sugar, honey, and water to make syrup.",
      "Pour syrup over hot baklava and let it absorb.",
      "Serve at room temperature."
    ]
  },
  {
    name: "Chocolate Cashew Tart",
    difficulty: "Medium",
    time: "40 min",
    tags: ["Dessert"],
    ingredients: ["200g cashews, roasted", "150g dark chocolate", "100g butter", "100g sugar", "2 eggs", "1 tsp vanilla extract"],
    steps: [
      "Preheat oven to 175°C (347°F).",
      "Blend cashews into a fine powder.",
      "Mix with butter and sugar to make tart base.",
      "Press into tart pan and bake for 10 min.",
      "Melt chocolate and mix with eggs and vanilla.",
      "Pour chocolate mixture over baked base.",
      "Bake for 20 min until set.",
      "Cool, garnish with roasted cashews.",
      "Serve chilled."
    ]
  },
  {
    name: "Saffron Almond Milk Pudding",
    difficulty: "Easy",
    time: "25 min",
    tags: ["Dessert", "Healthy"],
    ingredients: ["500ml almond milk", "50g sugar", "2 tbsp cornstarch", "1/4 tsp saffron strands", "1 tsp rose water", "Chopped almonds for garnish"],
    steps: [
      "Soak saffron in 2 tbsp warm almond milk.",
      "Mix cornstarch with a little almond milk to make slurry.",
      "Boil remaining almond milk with sugar.",
      "Add saffron and cornstarch mixture gradually, stirring continuously.",
      "Cook until thickened.",
      "Remove from heat, add rose water, pour into serving bowls.",
      "Garnish with chopped almonds.",
      "Chill for 1 hour before serving."
    ]
  },
  {
    name: "Tamoor Trail Mix Energy Bites",
    difficulty: "Easy",
    time: "15 min",
    tags: ["Healthy", "Snack"],
    ingredients: ["100g cashews", "100g almonds", "50g dates, pitted", "50g raisins", "2 tbsp honey", "1 tsp cocoa powder"],
    steps: [
      "Blend nuts and dates in a food processor until coarse mixture.",
      "Add honey and cocoa powder, blend slightly.",
      "Roll mixture into small bite-sized balls.",
      "Place on tray and chill for 10 min.",
      "Serve as healthy energy snacks."
    ]
  },
  {
    name: "Honey-Glazed Walnut Cookies",
    difficulty: "Easy",
    time: "30 min",
    tags: ["Dessert", "Snack"],
    ingredients: ["200g flour", "100g butter", "80g sugar", "1 egg", "100g walnuts, chopped", "2 tbsp honey"],
    steps: [
      "Preheat oven to 180°C (356°F).",
      "Cream butter and sugar until fluffy.",
      "Add egg and mix well.",
      "Fold in flour and chopped walnuts to form dough.",
      "Shape into small cookies on baking tray.",
      "Bake for 12-15 minutes until golden.",
      "Brush with honey while warm.",
      "Cool before serving."
    ]
  },
  {
    name: "Pistachio Rose Cupcakes",
    difficulty: "Medium",
    time: "35 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["150g flour", "100g sugar", "100g butter", "2 eggs", "50g pistachios, ground", "1 tsp rose water", "Buttercream frosting"],
    steps: [
      "Preheat oven to 175°C (347°F).",
      "Cream butter and sugar, add eggs one at a time.",
      "Fold in flour and ground pistachios.",
      "Add rose water.",
      "Pour batter into cupcake liners.",
      "Bake for 20-25 minutes.",
      "Cool and decorate with buttercream frosting and chopped pistachios."
    ]
  },
  {
    name: "Almond Chai Latte",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "1 tsp black tea leaves", "1 tsp honey", "1/4 tsp cinnamon", "1/4 tsp cardamom powder"],
    steps: [
      "Boil almond milk with cinnamon and cardamom.",
      "Steep tea leaves for 2-3 min.",
      "Strain into cup, add honey.",
      "Serve hot."
    ]
  },
  {
    name: "Cashew Caramel Fudge",
    difficulty: "Medium",
    time: "30 min",
    tags: ["Dessert"],
    ingredients: ["200g cashews", "150g sugar", "100g butter", "50ml cream", "1 tsp vanilla extract"],
    steps: [
      "Toast cashews lightly.",
      "Melt sugar and butter to make caramel.",
      "Add cream and vanilla, stir well.",
      "Mix in cashews.",
      "Pour into lined tray, cool and cut into squares."
    ]
  },
  {
    name: "Spiced Nut Mix for Gifting",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Snack", "Gift Ideas"],
    ingredients: ["100g almonds", "100g cashews", "50g walnuts", "1 tsp chili powder", "1 tsp honey", "Pinch of salt"],
    steps: [
      "Preheat oven to 180°C (356°F).",
      "Mix nuts with honey, chili, and salt.",
      "Spread on baking tray and roast for 10-12 minutes.",
      "Cool and pack in decorative jars for gifting."
    ]
  },
  {
    name: "Honey Almond Granola",
    difficulty: "Easy",
    time: "25 min",
    tags: ["Healthy", "Breakfast"],
    ingredients: ["150g rolled oats", "100g almonds, chopped", "50g honey", "30g dried cranberries", "1 tsp cinnamon", "1 tbsp coconut oil"],
    steps: [
      "Preheat oven to 175°C (347°F).",
      "Mix oats, almonds, cinnamon, and coconut oil.",
      "Spread on baking tray and bake for 15-20 minutes.",
      "Cool and mix with cranberries.",
      "Serve with yogurt or milk."
    ]
  },
  {
    name: "Chocolate Almond Bark",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["200g dark chocolate", "100g almonds, toasted", "1 tbsp honey", "Pinch sea salt"],
    steps: [
      "Melt chocolate over a double boiler.",
      "Stir in honey and toasted almonds.",
      "Spread on parchment paper in a thin layer.",
      "Sprinkle sea salt on top.",
      "Chill until set and break into pieces."
    ]
  },
  {
    name: "Coconut Cashew Energy Bars",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Healthy", "Snack"],
    ingredients: ["100g cashews", "50g shredded coconut", "50g dates", "2 tbsp honey", "1 tsp vanilla extract"],
    steps: [
      "Blend cashews, coconut, and dates in food processor.",
      "Add honey and vanilla, pulse to combine.",
      "Press mixture into lined tray.",
      "Chill for 15 min, cut into bars.",
      "Serve as energy snacks."
    ]
  },
  {
    name: "Almond Butter Chocolate Cups",
    difficulty: "Medium",
    time: "30 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "50g almond butter", "1 tsp honey", "Pinch salt"],
    steps: [
      "Melt chocolate and pour into silicone molds.",
      "Freeze for 5 minutes.",
      "Add almond butter mixed with honey on top.",
      "Cover with more chocolate.",
      "Chill until firm, serve cold."
    ]
  },
  {
    name: "Rose Pistachio Smoothie",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "50g pistachios", "1 tsp rose water", "1 tbsp honey", "Ice cubes"],
    steps: [
      "Blend all ingredients until smooth.",
      "Serve chilled with crushed pistachios on top."
    ]
  },
  {
    name: "Cashew Coffee Fudge",
    difficulty: "Medium",
    time: "25 min",
    tags: ["Dessert", "Snack"],
    ingredients: ["150g cashews", "100g sugar", "50g butter", "1 tsp instant coffee", "50ml cream"],
    steps: [
      "Toast cashews lightly.",
      "Melt butter and sugar with coffee and cream.",
      "Stir in cashews.",
      "Pour into lined tray, cool and cut into squares."
    ]
  },
  {
    name: "Almond Date Rolls",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Healthy", "Snack"],
    ingredients: ["100g almonds", "100g dates", "1 tsp cinnamon", "1 tsp coconut flakes"],
    steps: [
      "Blend almonds and dates until sticky mixture forms.",
      "Roll into small cylinders.",
      "Coat with coconut flakes.",
      "Serve as healthy snack."
    ]
  },
  {
    name: "Chocolate Walnut Brownies",
    difficulty: "Medium",
    time: "35 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "100g butter", "100g sugar", "2 eggs", "100g flour", "50g walnuts"],
    steps: [
      "Preheat oven to 180°C.",
      "Melt chocolate and butter together.",
      "Mix in sugar and eggs.",
      "Fold in flour and walnuts.",
      "Bake for 25-30 minutes, cool and cut."
    ]
  },
  {
    name: "Spiced Almond Tea",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "1 tsp black tea", "1/4 tsp cinnamon", "1/4 tsp cardamom", "1 tsp honey"],
    steps: [
      "Heat almond milk with spices.",
      "Steep tea for 2-3 minutes.",
      "Add honey and strain.",
      "Serve hot."
    ]
  },
  {
    name: "Cashew Vanilla Cookies",
    difficulty: "Easy",
    time: "25 min",
    tags: ["Dessert", "Snack"],
    ingredients: ["200g flour", "100g butter", "80g sugar", "1 egg", "50g cashews, chopped", "1 tsp vanilla extract"],
    steps: [
      "Preheat oven to 180°C.",
      "Cream butter and sugar, add egg and vanilla.",
      "Mix in flour and cashews.",
      "Shape into cookies, bake 12-15 minutes.",
      "Cool before serving."
    ]
  },
  {
    name: "Pistachio Mango Tart",
    difficulty: "Medium",
    time: "45 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["150g flour", "100g butter", "50g sugar", "2 eggs", "100g pistachio paste", "1 mango, sliced"],
    steps: [
      "Prepare tart base with flour, butter, sugar, and eggs.",
      "Bake for 15 minutes.",
      "Spread pistachio paste over base.",
      "Arrange mango slices on top.",
      "Chill and serve."
    ]
  },
  {
    name: "Almond Berry Parfait",
    difficulty: "Easy",
    time: "15 min",
    tags: ["Dessert", "Healthy"],
    ingredients: ["200ml yogurt", "50g almonds, chopped", "100g mixed berries", "1 tbsp honey"],
    steps: [
      "Layer yogurt, berries, and almonds in glasses.",
      "Drizzle honey on top.",
      "Serve chilled."
    ]
  },
  {
    name: "Honey Cashew Granola Bars",
    difficulty: "Easy",
    time: "25 min",
    tags: ["Healthy", "Snack"],
    ingredients: ["150g oats", "100g cashews", "50g honey", "30g dried fruits", "1 tsp cinnamon"],
    steps: [
      "Mix all ingredients and press into lined tray.",
      "Bake at 175°C for 15-20 minutes.",
      "Cool and cut into bars."
    ]
  },
  {
    name: "Chocolate Pistachio Fudge",
    difficulty: "Medium",
    time: "30 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "100g pistachios", "50g butter", "50ml cream", "1 tsp vanilla"],
    steps: [
      "Melt chocolate with butter and cream.",
      "Add pistachios and vanilla.",
      "Pour into lined tray, cool and cut into squares."
    ]
  },
  {
    name: "Cashew Cinnamon Rolls",
    difficulty: "Medium",
    time: "50 min",
    tags: ["Dessert"],
    ingredients: ["200g flour", "100g butter", "50g sugar", "1 egg", "50g cashews, chopped", "1 tsp cinnamon"],
    steps: [
      "Prepare dough with flour, butter, sugar, and egg.",
      "Roll dough, sprinkle cinnamon and cashews.",
      "Roll up, cut into pieces, bake at 180°C for 25-30 min.",
      "Cool and glaze with honey."
    ]
  },
  {
    name: "Almond Matcha Latte",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "1 tsp matcha powder", "1 tsp honey"],
    steps: [
      "Heat almond milk.",
      "Whisk in matcha and honey.",
      "Serve warm."
    ]
  },
  {
    name: "Rose Cashew Cookies",
    difficulty: "Easy",
    time: "30 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["200g flour", "100g butter", "80g sugar", "1 egg", "50g cashews", "1 tsp rose water"],
    steps: [
      "Preheat oven to 180°C.",
      "Cream butter, sugar, and egg with rose water.",
      "Mix in flour and cashews.",
      "Shape cookies and bake 12-15 minutes."
    ]
  },
  {
    name: "Honey Pistachio Muffins",
    difficulty: "Medium",
    time: "35 min",
    tags: ["Dessert"],
    ingredients: ["150g flour", "100g sugar", "50g butter", "2 eggs", "50g pistachios", "2 tbsp honey"],
    steps: [
      "Mix flour, sugar, and butter.",
      "Add eggs and honey.",
      "Fold in pistachios.",
      "Bake at 175°C for 20-25 min."
    ]
  },
  {
    name: "Almond Coconut Ladoo",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["100g almonds", "50g coconut", "2 tbsp condensed milk", "1 tsp cardamom powder"],
    steps: [
      "Grind almonds and coconut.",
      "Mix with condensed milk and cardamom.",
      "Roll into small balls.",
      "Chill before serving."
    ]
  },
  {
    name: "Chocolate Cashew Bark",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["150g dark chocolate", "50g cashews", "1 tsp honey", "Pinch sea salt"],
    steps: [
      "Melt chocolate, stir in honey and cashews.",
      "Spread on parchment paper.",
      "Sprinkle sea salt.",
      "Chill until set, break into pieces."
    ]
  },
  {
    name: "Pistachio Almond Fudge",
    difficulty: "Medium",
    time: "30 min",
    tags: ["Dessert"],
    ingredients: ["100g pistachios", "100g almonds", "150g sugar", "50g butter", "50ml cream"],
    steps: [
      "Toast nuts lightly.",
      "Melt sugar and butter with cream.",
      "Add nuts, pour into lined tray.",
      "Cool and cut into squares."
    ]
  },
  {
    name: "Cashew Chocolate Truffles",
    difficulty: "Medium",
    time: "25 min",
    tags: ["Dessert"],
    ingredients: ["150g cashews", "100g dark chocolate", "1 tsp honey", "1 tsp cocoa powder"],
    steps: [
      "Blend cashews and chocolate until smooth.",
      "Add honey, roll into small balls.",
      "Dust with cocoa powder.",
      "Chill before serving."
    ]
  },
  {
    name: "Honey Almond Tea Cake",
    difficulty: "Medium",
    time: "45 min",
    tags: ["Dessert"],
    ingredients: ["150g flour", "100g butter", "80g sugar", "2 eggs", "50g almonds, chopped", "2 tbsp honey"],
    steps: [
      "Cream butter and sugar.",
      "Add eggs and honey.",
      "Fold in flour and almonds.",
      "Bake at 175°C for 25-30 min."
    ]
  },
  {
    name: "Rose Almond Pudding",
    difficulty: "Easy",
    time: "25 min",
    tags: ["Dessert", "Healthy"],
    ingredients: ["500ml almond milk", "50g sugar", "2 tbsp cornstarch", "1 tsp rose water", "Chopped almonds for garnish"],
    steps: [
      "Mix cornstarch with almond milk.",
      "Boil remaining milk with sugar.",
      "Add cornstarch mixture and cook until thickened.",
      "Add rose water, pour into bowls, garnish with almonds.",
      "Chill before serving."
    ]
  },
  {
    name: "Chocolate Almond Mousse",
    difficulty: "Medium",
    time: "35 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "100ml cream", "50g almonds, ground", "1 tsp vanilla extract"],
    steps: [
      "Melt chocolate.",
      "Whip cream until soft peaks form.",
      "Fold in chocolate and ground almonds.",
      "Pour into cups, chill for 30 min.",
      "Serve cold."
    ]
  },
  {
    name: "Almond Pistachio Halwa",
    difficulty: "Medium",
    time: "40 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["100g almonds", "50g pistachios", "100g sugar", "50g ghee", "200ml milk", "1/4 tsp cardamom powder"],
    steps: [
      "Grind almonds and pistachios.",
      "Heat ghee, add ground nuts and cook 5 min.",
      "Add milk and sugar, cook until thick.",
      "Add cardamom, serve warm."
    ]
  },
  {
    name: "Cashew Butter Smoothie",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "2 tbsp cashew butter", "1 tbsp honey", "Ice cubes"],
    steps: [
      "Blend all ingredients until smooth.",
      "Serve chilled."
    ]
  },
  {
    name: "Chocolate Pistachio Cups",
    difficulty: "Medium",
    time: "30 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "50g pistachios", "1 tsp honey", "Pinch salt"],
    steps: [
      "Melt chocolate, pour into silicone cups.",
      "Add pistachios and honey.",
      "Chill until set."
    ]
  },
  {
    name: "Almond Date Squares",
    difficulty: "Medium",
    time: "35 min",
    tags: ["Dessert", "Healthy"],
    ingredients: ["150g almonds", "100g dates", "50g flour", "50g butter", "1 tsp cinnamon"],
    steps: [
      "Blend almonds and dates.",
      "Mix in flour, butter, and cinnamon.",
      "Press into tray, bake at 175°C for 15-20 min.",
      "Cool and cut into squares."
    ]
  },
  {
    name: "Honey Walnut Brownies",
    difficulty: "Medium",
    time: "40 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "100g butter", "80g sugar", "2 eggs", "50g walnuts", "2 tbsp honey"],
    steps: [
      "Melt chocolate and butter.",
      "Mix in sugar, eggs, and honey.",
      "Fold in walnuts.",
      "Bake at 180°C for 25-30 min.",
      "Cool and cut."
    ]
  },
  {
    name: "Rose Pistachio Energy Balls",
    difficulty: "Easy",
    time: "15 min",
    tags: ["Snack", "Healthy"],
    ingredients: ["100g pistachios", "50g dates", "1 tsp rose water", "1 tbsp honey"],
    steps: [
      "Blend pistachios and dates.",
      "Add rose water and honey, roll into balls.",
      "Chill before serving."
    ]
  },
  {
    name: "Almond Coconut Smoothie",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "50g almonds", "2 tbsp shredded coconut", "1 tbsp honey", "Ice cubes"],
    steps: [
      "Blend all ingredients until smooth.",
      "Serve chilled."
    ]
  },
  {
    name: "Cashew Honey Tart",
    difficulty: "Medium",
    time: "40 min",
    tags: ["Dessert"],
    ingredients: ["150g flour", "100g butter", "50g sugar", "2 eggs", "100g cashews", "2 tbsp honey"],
    steps: [
      "Prepare tart base, bake 15 min.",
      "Mix cashews with honey, pour on base.",
      "Bake 10 more minutes.",
      "Cool and serve."
    ]
  },
  {
    name: "Chocolate Almond Truffle Cake",
    difficulty: "Hard",
    time: "60 min",
    tags: ["Dessert"],
    ingredients: ["200g dark chocolate", "100g flour", "100g butter", "100g sugar", "2 eggs", "50g almonds, chopped"],
    steps: [
      "Preheat oven to 180°C.",
      "Melt chocolate and butter, mix with sugar.",
      "Add eggs, fold in flour and almonds.",
      "Bake for 25-30 min, cool before serving."
    ]
  },
  {
    name: "Honey Pistachio Cake",
    difficulty: "Medium",
    time: "50 min",
    tags: ["Dessert"],
    ingredients: ["150g flour", "100g butter", "50g sugar", "2 eggs", "50g pistachios", "2 tbsp honey"],
    steps: [
      "Cream butter and sugar.",
      "Add eggs and honey.",
      "Fold in flour and pistachios.",
      "Bake at 175°C for 25-30 min."
    ]
  },
  {
    name: "Almond Date Smoothie",
    difficulty: "Easy",
    time: "10 min",
    tags: ["Drinks", "Healthy"],
    ingredients: ["200ml almond milk", "3 dates", "50g almonds", "1 tsp honey", "Ice cubes"],
    steps: [
      "Blend all ingredients until smooth.",
      "Serve chilled."
    ]
  },
  {
    name: "Cashew Caramel Tart",
    difficulty: "Medium",
    time: "45 min",
    tags: ["Dessert"],
    ingredients: ["150g flour", "100g butter", "50g sugar", "2 eggs", "100g cashews", "50ml caramel sauce"],
    steps: [
      "Prepare tart base, bake 15 min.",
      "Mix cashews with caramel, pour on base.",
      "Bake 10 more minutes.",
      "Cool and serve."
    ]
  },
  {
    name: "Chocolate Pistachio Brownies",
    difficulty: "Medium",
    time: "40 min",
    tags: ["Dessert"],
    ingredients: ["150g dark chocolate", "100g butter", "80g sugar", "2 eggs", "50g pistachios"],
    steps: [
      "Melt chocolate and butter.",
      "Mix in sugar and eggs.",
      "Fold in pistachios.",
      "Bake at 180°C for 25-30 min.",
      "Cool and cut."
    ]
  },
  {
    name: "Rose Cashew Ladoo",
    difficulty: "Easy",
    time: "20 min",
    tags: ["Dessert", "Gift Ideas"],
    ingredients: ["100g cashews", "50g condensed milk", "1 tsp rose water", "1 tsp cardamom"],
    steps: [
      "Grind cashews.",
      "Mix with condensed milk, rose water, and cardamom.",
      "Roll into balls.",
      "Chill before serving."
    ]
  },
  {
    name: "Almond Pistachio Fudge",
    difficulty: "Medium",
    time: "30 min",
    tags: ["Dessert"],
    ingredients: ["100g almonds", "100g pistachios", "150g sugar", "50g butter", "50ml cream"],
    steps: [
      "Toast nuts lightly.",
      "Melt sugar and butter with cream.",
      "Add nuts, pour into tray.",
      "Cool and cut into squares."
    ]
  },
  {
    name: "Cashew Chocolate Mousse",
    difficulty: "Medium",
    time: "35 min",
    tags: ["Dessert"],
    ingredients: ["150g cashews", "100g dark chocolate", "100ml cream", "1 tsp vanilla"],
    steps: [
      "Blend cashews and chocolate.",
      "Whip cream and fold into mixture.",
      "Pour into cups, chill 30 min.",
      "Serve cold."
    ]
  }
];


// Featured blog posts data
const featuredPosts: BlogPost[] = [
  {
    title: "The Art of Roasting Cashews Perfectly",
    author: "Tamoor Kitchen",
    date: "Sep 20, 2025",
    snippet: "Discover the secrets to roasting cashews that retain crunch and flavor while elevating your gourmet snacks…",
    content: `
Roasting cashews is more than just heating nuts — it's an art. At Tamoor Kitchen, we ensure each cashew
is roasted to perfection, enhancing its natural sweetness and crunch without any bitterness.

Step 1: Select premium cashews, ensuring uniform size for even roasting.
Step 2: Roast on medium heat in a dry pan or oven until golden brown, stirring frequently.
Step 3: Add a pinch of sea salt or spices for a gourmet twist.
Step 4: Let them cool completely before storing in airtight containers.

Did You Know? Cashews are not only delicious but also rich in heart-healthy fats, protein, and essential minerals.
Use them in desserts, trail mixes, or enjoy as a standalone luxury snack.
    `,
  },
  {
    title: "5 Luxury Nut Mixes for Festive Gifting",
    author: "Tamoor Lifestyle",
    date: "Sep 18, 2025",
    snippet: "Impress your loved ones with handcrafted nut mixes that combine taste, elegance, and health benefits.",
    content: `
Elevate your festive gifting with Tamoor’s curated nut mixes. Each mix is designed to balance flavor, texture, and health.

1. Royal Cashew & Pistachio Blend – Sweet and nutty, perfect for celebrations.
2. Almond Cranberry Crunch – A tangy-sweet combination that delights every palate.
3. Honey-Glazed Walnut Mix – A crunchy luxury treat.
4. Spiced Trail Mix – For the health-conscious, with subtle exotic spices.
5. Chocolate-Dipped Nut Medley – Indulgent, decadent, and gift-ready.

Tip: Package these in elegant jars with gold ribbons for a sophisticated gifting experience.
Each mix preserves freshness and aroma, ensuring your gift is truly memorable.
    `,
  },
  {
    title: "Almond Milk Recipes You’ll Love",
    author: "Tamoor Health",
    date: "Sep 15, 2025",
    snippet: "Turn simple almonds into creamy, decadent beverages and desserts for every occasion.",
    content: `
Almond milk is a luxurious, dairy-free alternative that can be enjoyed plain or used in gourmet recipes.

Recipe Ideas:
- Saffron Almond Milk Pudding – Creamy, aromatic dessert perfect for festive occasions.
- Almond Chai Latte – Infuse your latte with almond milk for a nutty, aromatic flavor.
- Chocolate Almond Smoothie – A decadent yet healthy treat.
- Almond Ice Cream – Luxurious dessert for hot summer days.

Health Tip: Almond milk is rich in vitamin E, antioxidants, and healthy fats, making it ideal for daily consumption.
Enhance the taste with natural sweeteners like honey, dates, or maple syrup for a wholesome, gourmet experience.
    `,
  },
];


// Recipe categories
const categories = [
  { name: "Dessert", emoji: "🍫" },
  { name: "Snack", emoji: "🍪" },
  { name: "Healthy", emoji: "🥗" },
  { name: "Gift Ideas", emoji: "🎁" },
  { name: "Drinks", emoji: "🥛" },
  { name: "Seasonal", emoji: "🍂" },
];

// Trending / Popular posts
const trendingRecipes = recipes
  .filter(r => r.tags.includes("Healthy") || r.tags.includes("Snack"))
  .slice(0, 5)
  .map(r => r.name);

const popularPosts = [
  ...featuredPosts.map(post => post.title), // Add all featured blog posts
  "Gifting Ideas for Diwali",
  "Almond Milk Benefits You Should Know",
];

const BlogRecipesExpanded: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedBlogIndex, setExpandedBlogIndex] = useState<number | null>(null);

  const handleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Placeholder for manual addition of recipes array
  const filteredRecipes: Recipe[] = selectedCategory === "All"
  ? recipes
  : recipes.filter(r => r.tags.includes(selectedCategory));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative bg-[url('/assets/hero-dryfruits.jpg')] bg-cover bg-center h-96 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-300">Luxury Flavors, Expertly Crafted</h1>
          <p className="text-lg md:text-xl mb-6">Explore Tamoor’s world of premium nuts, gourmet recipes, and culinary inspiration.</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:scale-105 transition-transform">
              Browse Recipes
            </button>
            <button className="px-6 py-3 bg-white/10 text-yellow-300 font-semibold rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-colors">
              Read Our Blog
            </button>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
<section className="max-w-5xl mx-auto px-4 md:px-0 my-16">
  <h2 className="text-3xl font-bold mb-6 text-yellow-300">Featured Blog Posts</h2>
  <div className="grid md:grid-cols-3 gap-6">
    {featuredPosts.map((post, index) => (
      <div
        key={index}
        className="bg-white/10 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-yellow-400/20 cursor-pointer"
        onClick={() => setExpandedBlogIndex(expandedBlogIndex === index ? null : index)}
      >
        {/* Title + Chevron */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          {expandedBlogIndex === index ? (
            <ChevronUp className="text-yellow-300" />
          ) : (
            <ChevronDown className="text-yellow-300" />
          )}
        </div>

        {/* Author & Date */}
        <p className="text-sm text-gray-300 mt-1">{post.author} | {post.date}</p>

        {/* Snippet (always visible) */}
        <p className="text-gray-200 mt-2">{post.snippet}</p>

        {/* Expanded content */}
        {expandedBlogIndex === index && (
          <div className="mt-4 text-gray-200 whitespace-pre-line">{post.content}</div>
        )}
      </div>
    ))}
  </div>
</section>

      {/* Categories Filter */}
      <section className="my-10 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              selectedCategory === "All" ? "bg-yellow-400 text-gray-900" : "bg-white/10 hover:bg-yellow-300"
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`px-4 py-2 rounded-full font-semibold ${
                selectedCategory === cat.name ? "bg-yellow-400 text-gray-900" : "bg-white/10 hover:bg-yellow-300"
              }`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </section>

        {/* Recipes Grid */}
        <section className="max-w-6xl mx-auto px-4 md:px-0 mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
            <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-yellow-400/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-yellow-400/20"
            >
                <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => handleExpand(index)}
                >
                <h2 className="text-xl font-bold">{recipe.name}</h2>
                {expandedIndex === index ? (
                    <ChevronUp className="text-yellow-300" />
                ) : (
                    <ChevronDown className="text-yellow-300" />
                )}
                </div>

                {expandedIndex === index && (
                <div className="mt-4 space-y-2">
                    <p>
                    <span className="font-semibold">Difficulty:</span> {recipe.difficulty} |{" "}
                    <span className="font-semibold">Time:</span> {recipe.time}
                    </p>
                    <p className="font-semibold">Tags: {recipe.tags.join(", ")}</p>

                    <div>
                    <h3 className="font-semibold mt-2">Ingredients:</h3>
                    <ul className="list-disc list-inside ml-4">
                        {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                        ))}
                    </ul>
                    </div>

                    <div>
                    <h3 className="font-semibold mt-2">Steps:</h3>
                    <ol className="list-decimal list-inside ml-4">
                        {recipe.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                        ))}
                    </ol>
                    </div>
                </div>
                )}
            </div>
            ))}

            {filteredRecipes.length === 0 && (
            <p className="text-center text-gray-400 mt-10 col-span-full">
                No recipes available. Add your `recipes` array above.
            </p>
            )}
        </div>
        </section>


      {/* Author Spotlight / Tips */}
      <section className="bg-white/10 backdrop-blur-md max-w-5xl mx-auto px-6 py-10 rounded-2xl mb-16">
        <h2 className="text-3xl font-bold mb-4 text-yellow-300">Tamoor’s Culinary Inspirations</h2>
        <p className="mb-6">
          Our chefs and nutritionists bring you the finest recipes using Tamoor’s premium dry fruits. From festive treats to daily indulgences, every recipe is crafted to delight.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold">Chef Ayesha Khan</h3>
            <p>Master of desserts, specializing in cashew and pistachio-based treats.</p>
          </div>
          <div>
            <h3 className="font-semibold">Chef Rajiv Sharma</h3>
            <p>Healthy snacks and energy bites expert.</p>
          </div>
        </div>
      </section>

      {/* Newsletter / Subscription */}
      <section className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 text-yellow-300">Stay Updated with Tamoor’s Culinary Secrets</h2>
        <p className="mb-6">Get exclusive recipes, cooking tips, and offers delivered straight to your inbox.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 rounded-xl w-full sm:w-auto text-gray-900"
          />
          <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-semibold rounded-xl hover:scale-105 transition-transform">
            Subscribe
          </button>
        </div>
      </section>

      {/* Trending / Popular Footer */}
        <section className="max-w-5xl mx-auto px-4 md:px-0 mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
              <h3 className="text-2xl font-semibold text-yellow-300 mb-3">Trending Recipes</h3>
              <ul className="list-disc list-inside ml-4 text-gray-200">
                {trendingRecipes.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
              <h3 className="text-2xl font-semibold text-yellow-300 mb-3">Popular Posts</h3>
              <ul className="list-disc list-inside ml-4 text-gray-200">
                {popularPosts.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

    </div>
  );
};

export default BlogRecipesExpanded;
