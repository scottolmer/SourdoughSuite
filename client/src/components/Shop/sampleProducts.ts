import { Product } from '@/context/CartContext';

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "San Francisco Sourdough Starter",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1586444248902-2fedb28f95dc?q=80&w=800",
    description: "Our signature San Francisco sourdough starter, cultivated from a century-old culture. Known for its distinctive tangy flavor and exceptional rise.",
    tags: ["starter", "premium", "bestseller"],
    inventory: 30,
    slug: "san-francisco-sourdough-starter"
  },
  {
    id: 2,
    name: "Ancient Grain Sourdough Boule",
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1555951015-6da899b5e0b0?q=80&w=800",
    description: "A rustic sourdough boule made with a blend of ancient grains including einkorn, spelt, and emmer. Complex flavors with a golden crust and tender, open crumb.",
    tags: ["bread", "ancient-grain", "featured"],
    inventory: 15,
    slug: "ancient-grain-sourdough-boule"
  },
  {
    id: 3,
    name: "Artisanal Bread Lame",
    price: 32.50,
    imageUrl: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?q=80&w=800",
    description: "Professional-grade bread lame for creating beautiful scoring patterns on your artisanal loaves. Handcrafted wooden handle with replaceable blades.",
    tags: ["tool", "premium", "scoring"],
    inventory: 22,
    slug: "artisanal-bread-lame"
  },
  {
    id: 4,
    name: "Rye Sourdough Starter",
    price: 22.99,
    imageUrl: "https://images.unsplash.com/photo-1596849941928-7a8a5a621f9a?q=80&w=800",
    description: "Robust rye sourdough starter perfect for hearty loaves with deep flavor. Cultivated in our bakery for over 15 years.",
    tags: ["starter", "rye", "featured"],
    inventory: 18,
    slug: "rye-sourdough-starter"
  },
  {
    id: 5,
    name: "Handcrafted Banneton Basket",
    price: 39.99,
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800",
    description: "Traditional rattan banneton basket for proofing your sourdough. Creates beautiful spiral patterns while wicking away moisture for the perfect crust.",
    tags: ["tool", "premium", "proofing"],
    inventory: 12,
    slug: "handcrafted-banneton-basket"
  },
  {
    id: 6,
    name: "Whole Wheat Sourdough Starter",
    price: 21.99,
    imageUrl: "https://images.unsplash.com/photo-1597382923473-68ef8bb0b663?q=80&w=800",
    description: "A vibrant whole wheat starter culture with a mild, nutty profile. Perfect for hearty breads and pancakes.",
    tags: ["starter", "whole-wheat", "featured"],
    inventory: 25,
    slug: "whole-wheat-sourdough-starter"
  },
  {
    id: 7,
    name: "Koji Fermentation Starter Kit",
    price: 49.99,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800",
    description: "Experience the magic of koji fermentation with our complete starter kit. Includes koji spores, temperature controller, and detailed instructions.",
    tags: ["starter", "koji", "premium", "kit"],
    inventory: 8,
    slug: "koji-fermentation-starter-kit"
  },
  {
    id: 8,
    name: "Digital Baking Scale",
    price: 29.99,
    imageUrl: "https://images.unsplash.com/photo-1594064432302-51dc3c506f45?q=80&w=800",
    description: "Precision digital scale with 0.1g accuracy. Essential for consistent, reliable bakes using baker percentages.",
    tags: ["tool", "digital", "essential"],
    inventory: 20,
    slug: "digital-baking-scale"
  },
  {
    id: 9,
    name: "Bread Baker Cookbook",
    price: 35.00,
    imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800",
    description: "The essential guide to artisanal breadmaking with 75+ recipes from basic boules to complex enriched doughs. Includes in-depth tutorials on fermentation.",
    tags: ["book", "learning", "featured"],
    inventory: 17,
    slug: "bread-bakers-cookbook"
  },
  {
    id: 10,
    name: "Baking Stone for Home Oven",
    price: 58.99,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800",
    description: "Professional-grade cordierite baking stone for creating bakery-quality bread at home. Retains and distributes heat evenly for perfect crust development.",
    tags: ["tool", "premium", "essential"],
    inventory: 10,
    slug: "baking-stone-for-home-oven"
  },
  {
    id: 11,
    name: "Bakehouse Breads Apron",
    price: 42.00,
    imageUrl: "https://images.unsplash.com/photo-1588590595479-c6aa4bd57f84?q=80&w=800",
    description: "Durable, professional-quality apron made from heavy cotton canvas. Features multiple pockets and adjustable cross-back straps for comfort during long baking sessions.",
    tags: ["apparel", "bakehouse-branded", "gift"],
    inventory: 35,
    slug: "bakehouse-breads-apron"
  },
  {
    id: 12,
    name: "Sourdough Flavor Enhancer Collection",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1515942400420-2b98fe63eaa5?q=80&w=800",
    description: "A curated collection of premium ingredients to enhance your sourdough. Includes organic malt powder, barley flakes, and toasted sesame for complex flavors.",
    tags: ["ingredient", "premium", "gift-set"],
    inventory: 15,
    slug: "sourdough-flavor-enhancer-collection"
  }
];