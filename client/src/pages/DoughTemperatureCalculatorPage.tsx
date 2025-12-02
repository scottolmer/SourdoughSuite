import React from 'react';
import DoughTemperatureCalculator from '@/components/BreadTools/DoughTemperatureCalculator';
import { MobileLayout } from "@/components/mobile-layout";
import ToolsMenu from '@/components/tools/ToolsMenu';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function DoughTemperatureCalculatorPage() {
  return (
    <>
      <SEO 
        title="Dough Temperature Calculator - Professional Bread Making Tool"
        description="Calculate ideal water temperature for consistent fermentation. Professional DDT (Desired Dough Temperature) calculator with friction factor analysis."
        keywords={["dough temperature calculator", "DDT calculator", "desired dough temperature", "water temperature calculator", "bread fermentation temperature"]}
        canonicalUrl="https://bakehousebreads.com/tools/dough-temperature-calculator"
      />
      <MobileLayout title="Dough Temperature Calculator">
        <div className="space-y-6 max-w-full">
          {/* SEO-Optimized Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Dough Temperature Calculator</h1>
            
            {/* Featured Snippet Bait - DDT Formula */}
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-orange-900">DDT Formula (Desired Dough Temperature)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-orange-900">
                  **Water Temperature = DDT × 3 - (Flour Temp + Room Temp + Friction Factor)**
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-semibold">Lean Dough</div>
                    <div className="text-xs">75-78°F DDT</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-semibold">Enriched Dough</div>
                    <div className="text-xs">76-80°F DDT</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-semibold">Sourdough</div>
                    <div className="text-xs">78-82°F DDT</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Why DDT Matters */}
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Consistent dough temperature is crucial for predictable fermentation timing. This professional 
                calculator determines the exact water temperature needed to achieve your desired dough temperature, 
                accounting for flour temperature, room temperature, and friction from mixing.
              </p>
              
              <p className="text-muted-foreground">
                Used by commercial bakeries worldwide to maintain consistency across batches. The calculator 
                includes friction factor analysis for different mixing methods and dough types, ensuring 
                professional-level temperature control.
              </p>
            </div>
          </div>
          
          <ToolsMenu activeToolPath="/tools/dough-temperature-calculator" showAllTools={false} />

          <DoughTemperatureCalculator />
          
          <Separator className="my-8" />
          
          {/* Step-by-Step Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>### How to Calculate Desired Dough Temperature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li>**Determine target DDT** - Choose based on dough type (75-82°F typical range)</li>
                <li>**Measure flour temperature** - Use thermometer to check flour storage temperature</li>
                <li>**Check room temperature** - Ambient temperature where mixing occurs</li>
                <li>**Estimate friction factor** - 8-12°F for hand mixing, 20-30°F for machine mixing</li>
                <li>**Calculate water temperature** - Use DDT formula to find precise water temperature</li>
              </ol>
            </CardContent>
          </Card>
          
          {/* Understanding Friction Factor */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding Friction Factor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Hand Mixing</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Minimal friction: 8-12°F increase</li>
                    <li>Gentle kneading techniques</li>
                    <li>Suitable for artisan breads</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Machine Mixing</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Higher friction: 20-30°F increase</li>
                    <li>Stand mixer or spiral mixer</li>
                    <li>Commercial production methods</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Pro Tip:</strong> Record actual dough temperatures and adjust friction factor 
                  based on your specific equipment and mixing technique for maximum accuracy.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Temperature Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Temperature Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">White Bread (Lean Dough)</div>
                    <div className="text-sm text-muted-foreground">Standard sandwich loaves, baguettes</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">75-78°F</div>
                    <div className="text-xs text-muted-foreground">(24-26°C)</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">Enriched Dough</div>
                    <div className="text-sm text-muted-foreground">Brioche, challah, sweet breads</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">76-80°F</div>
                    <div className="text-xs text-muted-foreground">(24-27°C)</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">Sourdough</div>
                    <div className="text-sm text-muted-foreground">Natural fermentation breads</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">78-82°F</div>
                    <div className="text-xs text-muted-foreground">(26-28°C)</div>
                  </div>
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
                <h3 className="font-semibold mb-2">### Why is dough temperature so important?</h3>
                <p className="text-sm text-muted-foreground">
                  Consistent dough temperature ensures predictable fermentation timing. A 5°F difference 
                  can change fermentation time by 25-30%, making it impossible to maintain consistent schedules.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### What if I don't have a thermometer?</h3>
                <p className="text-sm text-muted-foreground">
                  Investing in a digital thermometer is essential for serious baking. However, room temperature 
                  is typically 68-72°F, and flour stored indoors matches room temperature within a few degrees.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How do I determine my mixer's friction factor?</h3>
                <p className="text-sm text-muted-foreground">
                  Make a test batch with water at room temperature. Measure final dough temperature, then calculate 
                  backward using the DDT formula. This gives you your specific friction factor for future calculations.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Can I use this for no-knead recipes?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! No-knead recipes have minimal friction (2-5°F). The calculator helps you achieve the right 
                  starting temperature for optimal fermentation timing. Use our 
                  <a href="/tools/timeline-calculator" className="text-blue-600 hover:underline ml-1">Timeline Calculator</a> 
                  for planning no-knead fermentation schedules.
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
                <a href="/tools/timeline-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Timeline Calculator</div>
                  <div className="text-sm text-muted-foreground">Plan fermentation schedules</div>
                </a>
                <a href="/tools/hydration-converter" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Hydration Calculator</div>
                  <div className="text-sm text-muted-foreground">Calculate water-to-flour ratios</div>
                </a>
                <a href="/tools/bakers-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Baker's Calculator</div>
                  <div className="text-sm text-muted-foreground">Convert baker's percentages</div>
                </a>
                <a href="/tools/recipe-validator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="font-semibold">Recipe Validator</div>
                  <div className="text-sm text-muted-foreground">AI-powered recipe analysis</div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    </>
  );
}