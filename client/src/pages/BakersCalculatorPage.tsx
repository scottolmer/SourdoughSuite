import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BakersPercentageCalculator from '../components/BreadTools/BakersPercentageCalculator';
import { MobileLayout } from '@/components/mobile-layout/MobileLayout';
import ToolsMenu from '@/components/tools/ToolsMenu';
import { SEO } from '@/components/SEO';
import { Separator } from '@/components/ui/separator';

export default function BakersCalculatorPage() {
  return (
    <>
      <SEO 
        title="Baker's Percentage Calculator - Professional Bread Formula Tool"
        description="Convert and scale bread recipes using baker's percentages. Professional calculator for precise ingredient ratios and formula development."
        keywords={["baker's percentage calculator", "bread recipe calculator", "bread formula calculator", "baker's math", "recipe scaling calculator"]}
        canonicalUrl="https://bakehousebreads.com/tools/bakers-calculator"
      />
      <MobileLayout title="Baker's Percentage Calculator">
        <div className="space-y-6">
          {/* SEO-Optimized Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Baker's Percentage Calculator</h1>
            
            {/* Featured Snippet Bait - Baker's Percentage Formula */}
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-purple-900">Baker's Percentage Formula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-purple-900">
                  **Baker's % = (Ingredient Weight ÷ Total Flour Weight) × 100**
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-semibold">Flour = 100%</div>
                    <div className="text-xs">Always the base</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-semibold">Water = 65-80%</div>
                    <div className="text-xs">Typical hydration</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-semibold">Salt = 1.8-2.2%</div>
                    <div className="text-xs">Standard range</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-semibold">Starter = 10-20%</div>
                    <div className="text-xs">Sourdough recipes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Why Baker's Percentages Matter */}
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Baker's percentages are the professional standard for recipe development and scaling. This calculator 
                converts between weights and percentages, enabling precise formula adjustments and consistent results 
                across any batch size. Essential for commercial bakeries and serious home bakers.
              </p>
              
              <p className="text-muted-foreground">
                Use this tool when developing new recipes, scaling existing formulas for different yields, or 
                converting traditional recipes to professional format. The calculator handles multiple flour types 
                and complex ingredient ratios with mathematical precision.
              </p>
            </div>
          </div>
        
        <ToolsMenu activeToolPath="/tools/bakers-calculator" showAllTools={false} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <BakersPercentageCalculator />
          </div>
          
          <Separator className="xl:hidden my-8" />
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About Baker's Percentages</CardTitle>
                <CardDescription>Understanding the baker's percentage system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Baker's percentages express ingredient weights as a percentage of the total flour weight, which is always 100%.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Easily scale recipes up or down</li>
                    <li>Quickly understand the composition of a dough</li>
                    <li>Compare different recipes with precision</li>
                    <li>Communicate recipes in standardized format</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Example:</h4>
                  <div className="space-y-1 text-sm">
                    <p>If a recipe contains:</p>
                    <p>• 1000g flour (100%)</p>
                    <p>• 700g water (70%)</p>
                    <p>• 20g salt (2%)</p>
                    <p>The hydration is 70%, and total dough weight is 1720g.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hydration Levels</CardTitle>
                <CardDescription>How water content affects your bread</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Low (50-65%)</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Firm Dough</span>
                  </div>
                  <p className="text-sm">Produces dense, chewy breads. Easier to handle for beginners. Good for sandwich loaves and rolls.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Medium (65-75%)</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Balanced</span>
                  </div>
                  <p className="text-sm">Great all-purpose hydration. Produces bread with good volume and moderate open crumb structure.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">High (75-85%)</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Wet Dough</span>
                  </div>
                  <p className="text-sm">Creates very open crumb with large holes. More challenging to handle. Produces rustic artisan breads.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Very High (85%+)</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Advanced</span>
                  </div>
                  <p className="text-sm">Extremely wet doughs for ciabatta, focaccia, etc. Requires advanced handling techniques and experience.</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Step-by-Step Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>### How to Use Baker's Percentages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3">
                  <li>**Set flour to 100%** - Total flour weight is always the baseline</li>
                  <li>**Calculate other ingredients** - Divide each ingredient by flour weight, multiply by 100</li>
                  <li>**Scale recipes easily** - Use percentages to calculate ingredients for any flour amount</li>
                  <li>**Compare formulas** - Percentages make it easy to compare different recipes</li>
                  <li>**Maintain consistency** - Use the same percentages for identical results</li>
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
                      <li>Scale recipes for production batches</li>
                      <li>Maintain consistency across shifts</li>
                      <li>Calculate ingredient costs accurately</li>
                      <li>Share formulas in standard format</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recipe Development</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Convert traditional recipes to professional format</li>
                      <li>Experiment with hydration levels</li>
                      <li>Adjust ingredient ratios systematically</li>
                      <li>Create scaled test batches</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">### What is baker's percentage and why use it?</h3>
                  <p className="text-sm text-muted-foreground">
                    Baker's percentage expresses each ingredient as a percentage of the total flour weight. This makes 
                    scaling recipes easy and provides a universal language for sharing bread formulas professionally.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### How do I convert a regular recipe to baker's percentages?</h3>
                  <p className="text-sm text-muted-foreground">
                    Add up all flour weights to get 100%. Divide each other ingredient by the total flour weight and 
                    multiply by 100. For example: 500g water ÷ 1000g flour × 100 = 50% hydration.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### Can I use baker's percentages for enriched doughs?</h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! Baker's percentages work for all bread types including brioche, challah, and sweet breads. 
                    The system handles eggs, butter, sugar, and other enrichments as additional percentage values.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### What's the typical hydration percentage for different breads?</h3>
                  <p className="text-sm text-muted-foreground">
                    White bread: 65-70%, whole wheat: 70-75%, sourdough: 70-80%, ciabatta: 75-85%, focaccia: 80-90%. 
                    Use our <a href="/tools/hydration-converter" className="text-blue-600 hover:underline">Hydration Calculator</a> 
                    to explore different hydration levels.
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
                  <a href="/tools/hydration-converter" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Hydration Calculator</div>
                    <div className="text-sm text-muted-foreground">Calculate water-to-flour ratios</div>
                  </a>
                  <a href="/tools/recipe-validator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Recipe Validator</div>
                    <div className="text-sm text-muted-foreground">AI-powered recipe analysis</div>
                  </a>
                  <a href="/tools/timeline-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Timeline Calculator</div>
                    <div className="text-sm text-muted-foreground">Plan your baking schedule</div>
                  </a>
                  <a href="/tools/dough-temperature-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Temperature Calculator</div>
                    <div className="text-sm text-muted-foreground">Calculate desired dough temperature</div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
    </>
  );
}