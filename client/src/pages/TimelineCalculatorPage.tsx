import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleTimelineCalculator from '../components/BreadTools/SimpleTimelineCalculator';
import { MobileLayout } from '@/components/mobile-layout/MobileLayout';
import ToolsMenu from '@/components/tools/ToolsMenu';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Separator } from '@/components/ui/separator';

export default function TimelineCalculatorPage() {
  const [location] = useLocation();
  const [_, navigate] = useLocation();
  const [recipeName, setRecipeName] = useState<string | null>(null);
  const [prefilledTimes, setPrefilledTimes] = useState<Array<{id: string, hours: number, minutes: number}> | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  
  // Parse URL parameters to extract recipe data
  useEffect(() => {
    // Only run once on initial load to avoid infinite loops
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    
    // Extract recipe name from URL if present
    const recipeNameParam = searchParams.get('recipe');
    if (recipeNameParam) {
      setRecipeName(decodeURIComponent(recipeNameParam));
    }
    
    // Extract recipe ID from URL if present
    const recipeIdParam = searchParams.get('id');
    if (recipeIdParam) {
      setRecipeId(recipeIdParam);
    }
    
    // Extract timing data from URL if present
    const timesParam = searchParams.get('times');
    if (timesParam) {
      try {
        const timesData = JSON.parse(decodeURIComponent(timesParam));
        if (Array.isArray(timesData)) {
          setPrefilledTimes(timesData);
        }
      } catch (error) {
        console.error("Failed to parse timeline data from URL:", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <>
      <SEO 
        title="Bread Baking Timeline Calculator - Smart Scheduling Tool"
        description="Plan your bread baking schedule with our smart timeline calculator. Features sleep detection, refrigerated proofing, and professional timing for perfect results."
        keywords={["bread baking timeline calculator", "baking schedule calculator", "fermentation timeline", "bread timing calculator", "sourdough schedule"]}
        canonicalUrl="https://bakehousebreads.com/tools/timeline-calculator"
      />
      <MobileLayout title="Baking Timeline Calculator">
        <div className="space-y-6">
          {/* SEO-Optimized Header */}
          <div className="space-y-4">
            {recipeName && recipeId && (
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => navigate(`/ai/recipes/${recipeId}`)}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {recipeName}
                </button>
              </div>
            )}
            
            <h1 className="text-3xl font-bold tracking-tight">Bread Baking Timeline Calculator</h1>
            
            {/* Featured Snippet Bait - Timeline Planning */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-green-900">Smart Baking Schedule Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-green-900">
                  **Plan backwards from your desired finish time with automatic sleep detection, refrigerated proofing options, and professional timing precision.**
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-semibold">Sleep Detection</div>
                    <div className="text-xs">Avoids midnight steps</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-semibold">Fridge Timing</div>
                    <div className="text-xs">Flexible scheduling</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Why Timeline Planning Matters */}
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Professional baking requires precise timing coordination. Our timeline calculator works backwards from 
                your target finish time, automatically scheduling mixing, fermentation, shaping, and baking stages. 
                Features smart sleep detection to avoid inconvenient timing.
              </p>
              
              <p className="text-muted-foreground">
                Perfect for busy schedules, weekend baking, or commercial production planning. The calculator handles 
                refrigerated bulk fermentation, overnight proofing, and multi-day bread schedules with professional 
                accuracy used in commercial bakeries worldwide.
              </p>
            </div>
          </div>
        
        <ToolsMenu activeToolPath="/tools/timeline-calculator" showAllTools={false} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SimpleTimelineCalculator 
              recipeName={recipeName || undefined}
              recipeId={recipeId || undefined}
              prefilledTimes={prefilledTimes || undefined}
            />
          </div>
          
          <Separator className="lg:hidden my-8" />
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Timeline Calculator</CardTitle>
                <CardDescription>Understanding the bread making timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Bread making is a time-sensitive process with multiple stages that must be coordinated.
                  Our Timeline Calculator helps you plan backwards from your desired finish time.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Precisely time your baking to finish when needed</li>
                    <li>Visualize each stage of the bread making process</li>
                    <li>Automatically adjust for refrigerated proofing</li>
                    <li>Export your schedule to your calendar</li>
                    <li>Work with common bread types or customize your own</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Pro Tips:</h4>
                  <div className="space-y-1 text-sm">
                    <p>• Refrigerated proofing can extend timing flexibility by 8-24 hours</p>
                    <p>• Room temperature affects fermentation - adjust times seasonally</p>
                    <p>• Always add a buffer of 30-60 minutes for unexpected delays</p>
                    <p>• Watch the dough, not just the clock - look for proper fermentation signs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Step-by-Step Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>### How to Plan Your Baking Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3">
                  <li>**Set your target finish time** - When you want fresh bread ready to serve</li>
                  <li>**Choose your bread type** - Select from common recipes or customize timing</li>
                  <li>**Configure sleep hours** - Calculator avoids steps during your sleep window</li>
                  <li>**Add refrigerated options** - Use cold fermentation for flexible scheduling</li>
                  <li>**Get your schedule** - Receive precise start times for each baking stage</li>
                </ol>
              </CardContent>
            </Card>
            
            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Timeline Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Smart Scheduling</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Sleep detection avoids inconvenient timing</li>
                      <li>Refrigerated bulk fermentation options</li>
                      <li>Temperature-adjusted fermentation rates</li>
                      <li>Multi-day bread scheduling</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Professional Use Cases</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Weekend baking coordination</li>
                      <li>Commercial production planning</li>
                      <li>Event catering schedules</li>
                      <li>Bakery shift coordination</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Unique Feature:</strong> Our sleep detection algorithm is the only calculator that 
                    automatically adjusts timing to avoid fermentation steps during your sleep hours.
                  </p>
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
                  <h3 className="font-semibold mb-2">### How accurate are the fermentation timings?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our timings are based on standard room temperature (70-75°F) conditions. Actual fermentation 
                    depends on temperature, humidity, and starter strength. Always watch the dough for visual cues 
                    alongside timing guidance.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### Can I adjust the timeline for cold fermentation?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! The calculator includes options for refrigerated bulk fermentation and overnight proofing. 
                    Cold fermentation extends timing flexibility by 8-24 hours while improving flavor development.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### What makes this different from other timeline tools?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our calculator is the only one with built-in sleep detection, preventing schedules that require 
                    middle-of-the-night steps. It also includes professional features like temperature adjustments 
                    and commercial batch planning.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">### How do I use this for sourdough bread?</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the sourdough option and enter your starter's typical rise time. The calculator accounts 
                    for starter feeding, autolyse, bulk fermentation, and final proof timing. Use our 
                    <a href="/tools/dough-temperature-calculator" className="text-blue-600 hover:underline ml-1">Temperature Calculator</a> 
                    for optimal fermentation conditions.
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
                  <a href="/tools/dough-temperature-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Temperature Calculator</div>
                    <div className="text-sm text-muted-foreground">Calculate ideal fermentation temperature</div>
                  </a>
                  <a href="/tools/recipe-validator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Recipe Validator</div>
                    <div className="text-sm text-muted-foreground">Analyze recipes before timing</div>
                  </a>
                  <a href="/tools/bakers-calculator" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Baker's Calculator</div>
                    <div className="text-sm text-muted-foreground">Scale recipes for batch planning</div>
                  </a>
                  <a href="/tools/hydration-converter" className="block p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                    <div className="font-semibold">Hydration Calculator</div>
                    <div className="text-sm text-muted-foreground">Optimize dough consistency</div>
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