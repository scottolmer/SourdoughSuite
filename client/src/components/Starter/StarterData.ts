import { StarterProductProps } from './StarterProductTemplate';

export const starterProducts: StarterProductProps[] = [
  {
    id: "koji-starter",
    name: "Koji Starter",
    description: "Inspired by traditional Japanese fermentation techniques, our Koji Starter creates naturally sweet flavors with complex umami undertones. Ideal for bakers seeking to create enriched doughs with exceptional tenderness.",
    price: 18.99,
    origin: [
      "Inspired by traditional Japanese fermentation techniques using Aspergillus oryzae",
      "Cultivated on a blend of rice and wheat substrates",
      "Exceptional enzymatic activity that breaks down starches and proteins",
      "Creates naturally sweet flavors with complex umami undertones"
    ],
    flavorProfile: [
      "Subtle sweetness without added sugar",
      "Distinctive malty notes with hints of nuts and caramel",
      "Less acidic than traditional sourdough",
      "Creates an exceptionally tender and moist crumb"
    ],
    idealUses: [
      "Enriched doughs like brioche and babka",
      "Asian-inspired breads such as milk bread or toasted rice loaves",
      "Any recipe that would benefit from enhanced sweetness and tenderness",
      "Pairs beautifully with nuts, dried fruits, and mild cheeses"
    ],
    careNotes: [
      "Thrives in slightly warmer environments (75-80°F)",
      "Best maintained with daily feedings at 1:1:1 ratio",
      "Benefits from inclusion of 10% whole wheat flour in feeding"
    ],
    imageUrl: "/images/starters/koji-starter.png"
  },
  {
    id: "traditional-rye-starter",
    name: "Traditional Rye Sourdough Starter",
    description: "Our traditional rye starter creates bread with deep, earthy flavors and a dense, hearty crumb. Cultivated with a blend of rye and wheat flours, this starter produces the classic European-style breads with complex flavor profiles and excellent keeping qualities.",
    price: 22.00,
    origin: [
      "Cultivated with a traditional blend of rye and wheat flours",
      "Contains robust wild yeasts and bacteria naturally found in rye flour",
      "Creates deep, earthy flavors with complex umami undertones",
      "Produces dense, hearty crumb characteristic of European-style breads"
    ],
    flavorProfile: [
      "Deep, earthy flavors with robust complexity",
      "Dense, hearty crumb with excellent keeping qualities",
      "Rich rye character that complements whole grains",
      "Complex flavor profile that develops over time"
    ],
    idealUses: [
      "Traditional European-style rye breads",
      "Dense, hearty loaves with complex flavors",
      "Pumpernickel and dark grain breads",
      "Breads that pair with savory dishes and strong cheeses"
    ],
    careNotes: [
      "Best fed every 12-18 hours for optimal fermentation",
      "Thrives with a blend of rye and wheat flour (70/30 ratio)",
      "Performs well at standard room temperature (68-75°F)",
      "Medium maintenance level with excellent flavor development"
    ],
    imageUrl: "/images/starters/rye-starter.jpg"
  },
  {
    id: "san-francisco-starter",
    name: "San Francisco Style Starter",
    description: "Our traditional culture featuring the classic Lactobacillus sanfranciscensis bacteria delivers the perfect balance of acetic and lactic acids. This is the gold standard for artisan bread with that quintessential sourdough tang.",
    price: 15.99,
    origin: [
      "Traditional culture featuring the classic Lactobacillus sanfranciscensis bacteria",
      "Developed through extensive wild fermentation techniques",
      "Creates the perfect balance of acetic and lactic acids",
      "Stable and reliable fermentation characteristics"
    ],
    flavorProfile: [
      "Robust, classic sourdough tang",
      "Perfect balance of acidity without being overwhelming",
      "Clean, bright flavor with pleasant yogurt-like notes",
      "Creates exceptional open crumb structure and crackling crust"
    ],
    idealUses: [
      "Traditional artisan bread with open crumb",
      "Classic crusty batards and boules",
      "Country-style loaves with intricate scoring",
      "Rustic breads that highlight sourdough flavor"
    ],
    careNotes: [
      "Performs well across a range of temperatures (65-75°F)",
      "Can be refrigerated for up to 2 weeks between feedings",
      "Feeds well on 1:2:2 ratio (starter:flour:water)",
      "Develops best flavor with longer fermentation times"
    ],
    imageUrl: "/images/starters/san-francisco-starter.png"
  },
  {
    id: "house-blend-starter",
    name: "House Blend Starter",
    description: "Our signature blend combines elements from our three specialty starters, carefully balanced to offer versatility and reliability. The ideal starter for bakers who want one culture that does everything well.",
    price: 14.99,
    origin: [
      "Our signature blend combining elements from our three specialty starters",
      "Carefully balanced to offer versatility and reliability",
      "Features complementary strains from Koji, Kombucha, and San Francisco cultures",
      "Designed to provide consistent results for all baking applications"
    ],
    flavorProfile: [
      "Balanced complexity with moderate tang",
      "Subtle sweet notes with a pleasant acidity",
      "Adaptable flavor that works with any bread style",
      "Creates excellent crust and crumb structure in all applications"
    ],
    idealUses: [
      "Perfect for beginners or all-purpose baking",
      "Versatile enough for any recipe from sandwich loaves to artisan bread",
      "Excellent foundation for experimentation with different flours and techniques",
      "The ideal starter for bakers who want one culture that does everything well"
    ],
    careNotes: [
      "Most forgiving of all our starters",
      "Adaptable to various kitchen temperatures (65-78°F)",
      "Can use all-purpose flour for feeding, though some whole grain improves flavor",
      "Maintains well on a once-daily feeding schedule with 1:2:2 ratio",
      "Can be refrigerated for up to 2 weeks when not in regular use"
    ],
    imageUrl: "/images/starters/house-blend-starter.png"
  }
];