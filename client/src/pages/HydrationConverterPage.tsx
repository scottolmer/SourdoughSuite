import React from 'react';
import FixedHydrationConverter from '@/components/BreadTools/FixedHydrationConverter';
import { MobileLayout } from "@/components/mobile-layout";
import ToolsMenu from '@/components/tools/ToolsMenu';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HydrationConverterPage() {
  return (
    <>
      <SEO 
        title="Sourdough Hydration Calculator - Professional Baking Tool"
        description="Calculate precise water-to-flour ratios for optimal dough consistency. Professional hydration calculator with starter adjustment features for bakers."
        keywords={["sourdough hydration calculator", "bread hydration calculator", "dough water content calculator", "hydration percentage", "bread calculator"]}
        canonicalUrl="https://bakehousebreads.com/tools/hydration-converter"
      />
      <MobileLayout title="Sourdough Hydration Calculator">
        <div className="space-y-6 max-w-full">
          {/* SEO-Optimized Header Section */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Sourdough Hydration Calculator</h1>
            
            {/* Featured Snippet Bait - TL;DR Formula Table */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-blue-900">Quick Hydration Formula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-blue-900">
                  **Hydration % = (Water Weight ÷ Flour Weight) × 100**
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-semibold">Low (50-65%)</div>
                    <div className="text-xs">Dense, chewy</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-semibold">Medium (65-75%)</div>
                    <div className="text-xs">Balanced crumb</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-semibold">High (75-85%)</div>
                    <div className="text-xs">Open, airy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Why This Calculation Matters */}
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hydration is the foundation of bread structure. This professional calculator helps you achieve 
                precise water-to-flour ratios, accounting for starter hydration and multiple flour types. 
                Perfect for bakers who want consistent, predictable results every time.
              </p>
              
              <p className="text-muted-foreground">
                Use this tool when developing new recipes, scaling existing formulas, or adjusting dough 
                consistency. The calculator includes advanced features for sourdough starters and 
                mixed flour compositions that simple calculators can't handle.
              </p>
            </div>
          </div>
          
          <ToolsMenu activeToolPath="/tools/hydration-converter" showAllTools={false} />

          <FixedHydrationConverter />
          
          <Separator className="my-8" />
          
          {/* Step-by-Step Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>### How to Calculate Bread Hydration Percentage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>**Weigh your flour(s)** - Add all flour weights together for total flour weight</li>
                <li>**Weigh your water** - Include water from starter if using sourdough</li>
                <li>**Apply the formula** - Divide water weight by flour weight, multiply by 100</li>
                <li>**Account for starter** - Our calculator automatically adjusts for starter hydration</li>
                <li>**Interpret results** - Use hydration guides to predict dough behavior</li>
              </ol>
            </CardContent>
          </Card>
          
          {/* Professional Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Commercial Bakeries</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Standardize recipes across batches</li>
                    <li>Scale formulas for production</li>
                    <li>Maintain consistent crumb structure</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Home Bakers</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Convert recipes between formats</li>
                    <li>Adjust for different flour types</li>
                    <li>Experiment with hydration levels</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* FAQ Section with Schema */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">### What is the ideal hydration for sourdough bread?</h3>
                <p className="text-sm text-muted-foreground">
                  Most sourdough breads work well between 70-80% hydration. Beginners should start around 70% 
                  for easier handling, while experienced bakers can go up to 85% for more open crumb structure.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How does starter hydration affect the calculation?</h3>
                <p className="text-sm text-muted-foreground">
                  Starter contains both flour and water. A 100% hydration starter (equal parts flour and water) 
                  contributes both to your flour and water totals. Our calculator accounts for this automatically.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Can I use this for different flour types?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Different flours absorb water differently. Whole wheat requires 5-10% more hydration than 
                  white flour, while rye can handle even higher hydration levels.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Why is my high hydration dough too sticky?</h3>
                <p className="text-sm text-muted-foreground">
                  High hydration doughs require different handling techniques. Use wet hands, stretch and folds 
                  instead of kneading, and allow proper gluten development time. Consider using our 
                  <a href="/tools/timeline-calculator" className="text-blue-600 hover:underline ml-1">Timeline Calculator</a> 
                  for proper fermentation scheduling.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Related Tools */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Related Professional Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <a href="/tools/bakers-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Baker's Percentage Calculator</div>
                  <div className="text-sm text-muted-foreground">Convert and scale bread formulas</div>
                </a>
                <a href="/tools/timeline-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Timeline Calculator</div>
                  <div className="text-sm text-muted-foreground">Plan your baking schedule</div>
                </a>
                <a href="/tools/recipe-validator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Recipe Validator</div>
                  <div className="text-sm text-muted-foreground">AI-powered recipe analysis</div>
                </a>
                <a href="/tools/dough-temperature-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Temperature Calculator</div>
                  <div className="text-sm text-muted-foreground">Calculate desired dough temperature</div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    </>
  );
}