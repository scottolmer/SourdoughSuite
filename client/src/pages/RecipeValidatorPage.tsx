import React from 'react';
import { MobileLayout } from '@/components/mobile-layout/MobileLayout';
import ToolsMenu from '@/components/tools/ToolsMenu';
import { SEO } from '@/components/SEO';
import { generateWebApplicationSchema, generateWebpageSEO } from '@/lib/schema';
// Importing the Recipe Success Predictor component
const RecipeSuccessPredictor = React.lazy(() => import('../components/BreadTools/RecipeSuccessPredictor'));

export default function RecipeValidatorPage() {
  // Define our app feature for schema.org structured data
  const recipeValidatorApp = {
    name: "Recipe Success Predictor",
    description: "Get realistic success probability predictions for sourdough recipes based on hydration complexity and your skill level. Know what you're getting into before you start baking.",
    slug: "recipe-validator",
    category: "FoodAndDrinkApplication",
    features: [
      "Success probability calculation",
      "Hydration complexity analysis", 
      "Skill-level matching",
      "Risk factor identification",
      "Personalized difficulty assessment"
    ],
    screenshots: [
      "/images/tools/recipe-validator-screenshot-1.jpg",
      "/images/tools/recipe-validator-screenshot-2.jpg"
    ],
    ratings: {
      average: 4.8,
      count: 156
    }
  };

  // Generate schema.org data
  const appSchema = generateWebApplicationSchema(recipeValidatorApp);
  
  // Generate full SEO metadata
  const seoData = generateWebpageSEO({
    title: "Recipe Success Predictor - Realistic Baking Difficulty Assessment | Bakehouse Breads", 
    description: "Get realistic success probability predictions for sourdough recipes based on hydration complexity and your skill level. Know before you bake.",
    canonicalUrl: "/tools/recipe-validator",
    keywords: ["recipe success predictor", "sourdough difficulty", "baking success rate", "recipe complexity analyzer", "hydration assessment"],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Tools", url: "/tools" },
      { name: "Recipe Success Predictor", url: "/tools/recipe-validator" }
    ]
  }, appSchema);

  return (
    <>
      <SEO 
        title="Recipe Success Predictor - Realistic Baking Difficulty Assessment"
        description="Get realistic success probability predictions for sourdough recipes based on hydration complexity and your skill level. Know before you bake."
        canonicalUrl="/tools/recipe-validator"
        keywords={["recipe success predictor", "sourdough difficulty", "baking success rate", "recipe complexity analyzer", "hydration assessment"]}
        structuredData={seoData}
      />
      <MobileLayout title="Recipe Success Predictor">
        <div className="space-y-6 pb-16">
          {/* SEO-Optimized Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Bread Recipe Analyzer</h1>
            
            {/* Featured Snippet Bait */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-900 mb-3">
                **AI-powered recipe validation analyzes hydration, salt levels, starter ratios, and fermentation timing to optimize your bread recipes for professional results.**
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded">
                  <div className="font-semibold">Hydration Analysis</div>
                  <div className="text-xs">65-85% optimal range</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-semibold">Salt Verification</div>
                  <div className="text-xs">1.8-2.2% of flour weight</div>
                </div>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                This professional recipe validator uses AI to analyze bread formulas, check ingredient ratios, 
                and provide scientific improvement suggestions. Upload recipes from any website or manually enter 
                ingredients for instant expert analysis.
              </p>
              
              <p className="text-muted-foreground">
                Perfect for bakers wanting to understand recipe science, troubleshoot failed loaves, or optimize 
                existing formulas. Our AI checks thousands of variables that manual calculation might miss.
              </p>
            </div>
          </div>
          
          <ToolsMenu activeToolPath="/tools/recipe-validator" showAllTools={false} />
          
          <React.Suspense fallback={<div>Loading success predictor...</div>}>
            <RecipeSuccessPredictor />
          </React.Suspense>
          
          {/* How It Works Section */}
          <div className="space-y-6 mt-8">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">### How to Analyze Your Bread Recipe</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>**Enter your recipe** - Paste URL, upload image, or type ingredients manually</li>
                <li>**AI extraction** - Our system automatically identifies ingredients and quantities</li>
                <li>**Scientific analysis** - Algorithm checks hydration, salt, starter ratios, and timing</li>
                <li>**Get recommendations** - Receive specific suggestions for improvement</li>
                <li>**Apply changes** - Use recommendations to refine your recipe</li>
              </ol>
            </div>
            
            {/* What Our AI Checks */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Analysis Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Ingredient Ratios</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Hydration percentage accuracy</li>
                    <li>Salt level optimization (1.8-2.2%)</li>
                    <li>Starter ratio validation</li>
                    <li>Flour type compatibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Technique Validation</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Fermentation timing assessment</li>
                    <li>Mixing method evaluation</li>
                    <li>Temperature considerations</li>
                    <li>Shaping technique suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">### What makes this different from other recipe analyzers?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI understands bread science principles and can extract recipes from any URL or image. 
                    It checks scientific ratios, not just basic math, and provides actionable improvement suggestions.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### Can it analyze recipes from any website?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Simply paste the URL and our system extracts ingredients and instructions automatically. 
                    Works with most popular recipe websites and blogs.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### What if my recipe doesn't follow standard ratios?</h3>
                  <p className="text-sm text-muted-foreground">
                    The analyzer explains why certain ratios work and suggests modifications. It accounts for 
                    different bread styles, flour types, and regional variations in bread making.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### How accurate is the AI analysis?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI is trained on thousands of tested bread recipes and professional baking principles. 
                    It provides scientifically-backed suggestions with confidence ratings for each recommendation.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Related Tools */}
            <div className="bg-gray-50 border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Related Professional Tools</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <a href="/tools/hydration-converter" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Hydration Calculator</div>
                  <div className="text-sm text-muted-foreground">Calculate precise water-to-flour ratios</div>
                </a>
                <a href="/tools/bakers-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Baker's Calculator</div>
                  <div className="text-sm text-muted-foreground">Convert and scale bread formulas</div>
                </a>
                <a href="/tools/timeline-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Timeline Calculator</div>
                  <div className="text-sm text-muted-foreground">Plan your baking schedule</div>
                </a>
                <a href="/tools/troubleshooter" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">AI Troubleshooter</div>
                  <div className="text-sm text-muted-foreground">Diagnose baking problems</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    </>
  );
}