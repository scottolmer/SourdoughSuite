import React, { useState } from 'react';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, ChefHat, AlertCircle, Clock, Thermometer, Scale, HelpCircle, BookOpen, Users, Zap } from "lucide-react";
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const faqData: FAQItem[] = [
  // Starter Basics
  {
    id: "what-is-sourdough-starter",
    question: "What is a sourdough starter?",
    answer: "A sourdough starter is a live culture of flour and water that captures wild yeast and beneficial bacteria from the environment. This fermented mixture acts as a natural leavening agent for bread, creating the characteristic tangy flavor and airy texture of sourdough bread. The starter contains Lactobacillus bacteria and wild yeasts that work together to ferment the flour and produce carbon dioxide gas, which makes the bread rise.",
    category: "Starter Basics",
    tags: ["starter", "fermentation", "yeast", "bacteria"],
    difficulty: "Beginner"
  },
  {
    id: "how-to-make-starter",
    question: "How do I make my own sourdough starter from scratch?",
    answer: "To create a starter from scratch: Mix 50g whole wheat or rye flour with 50g water in a clean jar. Stir well and cover loosely. Leave at room temperature (70-75°F). Daily for 5-7 days, discard half and feed with 50g flour + 50g water. You'll see bubbles forming and a pleasant, slightly sour smell developing. After 5-7 days, your starter should double in size within 4-8 hours of feeding, indicating it's ready to use.",
    category: "Starter Basics",
    tags: ["homemade", "creation", "feeding", "timing"],
    difficulty: "Beginner"
  },
  {
    id: "starter-ready-signs",
    question: "How do I know when my starter is ready to use?",
    answer: "Your starter is ready when it: 1) Doubles in size within 4-8 hours after feeding, 2) Has a pleasant, slightly tangy smell (not vinegary or alcoholic), 3) Shows consistent bubble activity throughout, 4) Passes the float test (a spoonful floats in water), and 5) Has been maintaining this pattern for at least 2-3 consecutive feedings. A mature starter should be predictable in its rise and fall cycle.",
    category: "Starter Basics",
    tags: ["readiness", "timing", "float test", "activity"],
    difficulty: "Beginner"
  },
  
  // Feeding & Maintenance
  {
    id: "feeding-schedule",
    question: "How often should I feed my sourdough starter?",
    answer: "Feeding frequency depends on storage and usage: Room temperature starters need daily feeding (every 12-24 hours). Refrigerated starters can be fed weekly. If baking frequently, feed daily and keep at room temperature. For long-term storage, feed weekly and refrigerate. Always feed before the starter peaks and begins to fall to maintain healthy yeast activity.",
    category: "Feeding & Maintenance",
    tags: ["feeding", "schedule", "refrigeration", "frequency"],
    difficulty: "Beginner"
  },
  {
    id: "feeding-ratios",
    question: "What ratio should I use when feeding my starter?",
    answer: "Common feeding ratios: 1:1:1 (equal parts starter, flour, water) for daily maintenance. 1:2:2 for less frequent feeding or to slow fermentation. 1:3:3 for very active starters or warm environments. 1:5:5 for weekly refrigerated maintenance. Start with 1:1:1 and adjust based on your starter's activity level and your baking schedule.",
    category: "Feeding & Maintenance",
    tags: ["ratios", "flour", "water", "proportions"],
    difficulty: "Intermediate"
  },
  {
    id: "discard-usage",
    question: "What can I do with sourdough discard?",
    answer: "Sourdough discard is perfect for: Pancakes, waffles, crackers, pizza dough, muffins, quick breads, pasta, flatbreads, fritters, and even cookies. Discard adds tangy flavor and helps reduce waste. You can also compost it or give it to friends. Store discard in the refrigerator for up to one week or freeze for longer storage.",
    category: "Feeding & Maintenance",
    tags: ["discard", "recipes", "waste reduction", "storage"],
    difficulty: "Beginner"
  },
  
  // Troubleshooting
  {
    id: "starter-not-rising",
    question: "Why isn't my starter rising?",
    answer: "Common causes: Temperature too cold (below 65°F) - move to warmer spot. Flour lacks nutrients - try adding whole wheat or rye flour. Starter needs more time - young starters can take 7-14 days. Over-feeding - reduce flour/water amounts. Chlorinated water - use filtered water. Old flour - use fresh, unbleached flour. Be patient; starters develop at different rates.",
    category: "Troubleshooting",
    tags: ["rising", "temperature", "flour type", "timing"],
    difficulty: "Intermediate"
  },
  {
    id: "hooch-liquid",
    question: "What is the liquid on top of my starter?",
    answer: "The dark liquid is called 'hooch' - it's alcohol produced by the yeast when the starter is hungry. It's completely safe. You can either stir it in for extra sour flavor or pour it off for milder taste. Hooch indicates your starter needs feeding. Regular hooch formation means you should feed more frequently or use a higher flour-to-water ratio.",
    category: "Troubleshooting",
    tags: ["hooch", "alcohol", "hungry starter", "feeding"],
    difficulty: "Beginner"
  },
  {
    id: "mold-identification",
    question: "How do I know if my starter has gone bad?",
    answer: "Bad signs: Fuzzy mold (any color) on surface - discard immediately. Foul, rotten smell (not just sour). Pink or orange streaks. If you see any mold, don't try to save it. Good starters smell tangy, fruity, or yeasty. Some separation and hooch are normal. When in doubt, start fresh - it's safer than risking illness.",
    category: "Troubleshooting",
    tags: ["mold", "spoilage", "safety", "smell"],
    difficulty: "Beginner"
  },
  
  // Baking Process
  {
    id: "autolyse-process",
    question: "What is autolyse and why is it important?",
    answer: "Autolyse is mixing flour and water, then resting 20-60 minutes before adding starter and salt. This process: Hydrates flour proteins, begins gluten development naturally, improves dough extensibility, reduces kneading time, and enhances final bread texture. Longer autolyse (up to 6 hours) can improve flavor and structure, especially with whole grain flours.",
    category: "Baking Process",
    tags: ["autolyse", "gluten", "technique", "timing"],
    difficulty: "Intermediate"
  },
  {
    id: "bulk-fermentation",
    question: "How long should bulk fermentation take?",
    answer: "Bulk fermentation typically takes 4-6 hours at 75-78°F, but varies with: Temperature (warmer = faster), starter strength, flour type, and hydration level. Look for visual cues: 50-70% size increase, jiggly dough, smooth surface, and passing the poke test. Don't rely solely on time - observe your dough's behavior and adjust accordingly.",
    category: "Baking Process",
    tags: ["bulk fermentation", "timing", "temperature", "visual cues"],
    difficulty: "Intermediate"
  },
  {
    id: "shaping-technique",
    question: "How do I properly shape sourdough bread?",
    answer: "Shaping steps: 1) Pre-shape into loose round, rest 20-30 minutes. 2) Final shape by creating tension on dough surface. 3) For boules: pull edges to center, flip seam-side down. 4) For batards: flatten gently, fold in thirds, roll with seam underneath. 5) Place seam-side up in banneton or seam-side down on parchment. Proper tension creates good oven spring.",
    category: "Baking Process",
    tags: ["shaping", "tension", "boule", "batard"],
    difficulty: "Advanced"
  },
  
  // Hydration & Ingredients
  {
    id: "hydration-levels",
    question: "What hydration level should I use for my bread?",
    answer: "Hydration recommendations: Beginners: 65-70% (easier to handle). Intermediate: 70-80% (good balance). Advanced: 80%+ (very open crumb, sticky dough). Higher hydration creates more open crumb but requires better technique. Start lower and increase as your skills develop. Whole grain flours can handle higher hydration than white flour.",
    category: "Hydration & Ingredients",
    tags: ["hydration", "water content", "skill level", "crumb structure"],
    difficulty: "Intermediate"
  },
  {
    id: "flour-types",
    question: "What's the best flour for sourdough bread?",
    answer: "Flour recommendations: Bread flour (12-14% protein) for strong structure. All-purpose flour (10-12% protein) works but may be less chewy. Whole wheat adds flavor and nutrition but can make denser bread. Rye flour creates complex flavors and helps fermentation. Mix different flours for complexity. Always use unbleached flour for best fermentation results.",
    category: "Hydration & Ingredients",
    tags: ["flour types", "protein content", "bread flour", "whole grain"],
    difficulty: "Beginner"
  },
  
  // Storage & Preservation
  {
    id: "bread-storage",
    question: "How should I store my sourdough bread?",
    answer: "Storage methods: Room temperature: Cut-side down on cutting board, cover with kitchen towel (1-2 days). Paper bag for crusty crust (2-3 days). Plastic bag for softer crust (3-4 days). Freeze: Slice before freezing, store in freezer bags up to 3 months. Never refrigerate bread - it goes stale faster. Toast day-old bread for best texture.",
    category: "Storage & Preservation",
    tags: ["storage", "freshness", "freezing", "staling"],
    difficulty: "Beginner"
  },
  {
    id: "starter-vacation",
    question: "How do I maintain my starter when traveling?",
    answer: "Travel options: Short trips (1-2 weeks): Feed well, refrigerate. Longer trips: Dry your starter by spreading thin layer on parchment, let dry completely, store in airtight container. Rehydrate with equal parts dried starter and water, then resume normal feeding. Alternatively, ask a friend to maintain it or create backup starters before leaving.",
    category: "Storage & Preservation",
    tags: ["travel", "drying", "backup", "refrigeration"],
    difficulty: "Intermediate"
  },

  // Advanced Techniques
  {
    id: "starter-backup-methods",
    question: "What are the best ways to backup my sourdough starter?",
    answer: "Create backups to protect your starter: Dry method: Spread thin layer of active starter on parchment, air dry 24-48 hours, store in airtight container for up to 1 year. Fresh backup: Maintain a second jar with small amounts. Share with friends who can return some if needed. Freeze method: Mix starter with equal parts flour, freeze in ice cube trays, use within 6 months. Create backups when your starter is most active and healthy.",
    category: "Advanced Techniques",
    tags: ["backup", "preservation", "insurance", "drying method"],
    difficulty: "Intermediate"
  },
  {
    id: "starter-adaptation-tips",
    question: "How do I help my starter adapt to a new environment?",
    answer: "Adaptation typically takes 5-10 days. Your starter needs time to adjust to your local environment, water, flour, and temperature. During this period: Feed consistently with your preferred flour blend. Maintain stable temperature (70-75°F). Use filtered water if your tap water is heavily chlorinated. Don't worry if activity seems slow initially - this is normal. The starter will gradually adapt and perform better as local microbes integrate.",
    category: "Advanced Techniques",
    tags: ["adaptation", "environment", "timeline", "adjustment"],
    difficulty: "Intermediate"
  },
  {
    id: "starter-performance-troubleshooting",
    question: "Why is my starter's performance inconsistent?",
    answer: "Performance changes are normal and often temporary: Environmental factors (temperature, humidity) affect activity. Different flour brands can impact fermentation. Seasonal changes influence yeast behavior. Feeding schedule adjustments may be needed. To restore performance: Return to consistent feeding schedule, ensure proper hydration levels, check expiration dates on flour, maintain optimal temperature range. Most issues resolve with consistent care.",
    category: "Advanced Techniques",
    tags: ["performance", "consistency", "troubleshooting", "maintenance"],
    difficulty: "Intermediate"
  }
];

const categories = faqData.reduce((acc: string[], faq) => {
  if (!acc.includes(faq.category)) {
    acc.push(faq.category);
  }
  return acc;
}, []);

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || faq.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Starter Basics': return <ChefHat className="h-4 w-4" />;
      case 'Feeding & Maintenance': return <Clock className="h-4 w-4" />;
      case 'Troubleshooting': return <AlertCircle className="h-4 w-4" />;
      case 'Baking Process': return <Thermometer className="h-4 w-4" />;
      case 'Hydration & Ingredients': return <Scale className="h-4 w-4" />;
      case 'Storage & Preservation': return <BookOpen className="h-4 w-4" />;
      case 'Advanced Techniques': return <BookOpen className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <MobileLayout title="Sourdough FAQ" showBackButton backHref="/">
      <SEO
        title="Sourdough FAQ - Common Questions Answered | Bakehouse Breads"
        description="Get answers to the most common sourdough questions. From starter maintenance to troubleshooting, find expert guidance for your sourdough baking journey."
        canonicalUrl="/faq"
        keywords={['sourdough FAQ', 'sourdough questions', 'starter troubleshooting', 'sourdough help', 'baking tips', 'sourdough maintenance']}
        ogType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "FAQ", url: "/faq" }
        ]}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <section className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800 p-6 border">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Expert Guidance
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Sourdough FAQ</h1>
          <p className="text-muted-foreground text-center">
            Find answers to common sourdough questions from starter care to baking techniques
          </p>
        </section>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search FAQs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions, answers, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredFAQs.length} Question{filteredFAQs.length !== 1 ? 's' : ''} Found
            </h2>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Users className="h-3 w-3 mr-1" />
              Community Driven
            </Badge>
          </div>
          
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No questions found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                }} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" className="space-y-3">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex items-center gap-2 text-blue-600 mt-0.5">
                        {getCategoryIcon(faq.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base pr-4 leading-relaxed">
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(faq.difficulty)}`}>
                            {faq.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4">
                    <div className="pl-9">
                      <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                        {faq.answer}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-6 w-6 text-amber-600" />
              <h3 className="font-semibold">Still Need Help?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Can't find what you're looking for? Explore our resources or get personalized guidance.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/blog">Read Our Guides</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/starter-school">Starter School</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}