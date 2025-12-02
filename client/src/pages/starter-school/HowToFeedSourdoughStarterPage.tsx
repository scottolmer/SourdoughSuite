import { SEO } from "@/components/SEO";
import { MobileLayout } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Clock, Scale, ArrowRight } from "lucide-react";

export function HowToFeedSourdoughStarterPage() {
  return (
    <>
      <SEO
        title="How to Feed Sourdough Starter - Complete Feeding Guide"
        description="Learn the complete process of feeding sourdough starter with proper ratios, timing, and techniques. Step-by-step guide for healthy starter maintenance."
        keywords={["how to feed sourdough starter", "sourdough starter feeding guide", "starter feeding ratio", "maintain sourdough starter"]}
        canonicalUrl="https://bakehousebreads.com/starter-school/how-to-feed-sourdough-starter"
        faqSchema={[
          {
            question: "How to feed sourdough starter?",
            answer: "Feed sourdough starter by discarding all but 50g, then adding equal parts flour and water (1:1:1 ratio) for daily maintenance, or use 1:2:2 ratio for active baking preparation. Mix thoroughly and let ferment 8-12 hours at room temperature."
          },
          {
            question: "What ratio should I use to feed my starter?",
            answer: "Use 1:1:1 ratio (equal parts starter, flour, water) for daily maintenance, 1:2:2 for active baking, or 1:5:5 before refrigerator storage. The ratio depends on starter activity and usage frequency."
          },
          {
            question: "How often should I feed my sourdough starter?",
            answer: "Feed daily if kept at room temperature, every 3-7 days if refrigerated. Active baking periods require daily feeding with stronger ratios like 1:2:2."
          },
          {
            question: "What temperature water should I use for feeding?",
            answer: "Use room temperature water (68-75°F) for regular feeding. Slightly warm water (80-85°F) can accelerate fermentation in cool environments, while cooler water slows activity."
          }
        ]}
      />
      <MobileLayout title="How to Feed Starter" showBackButton>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Featured Snippet Optimized Answer */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">How to Feed Sourdough Starter</h1>
              <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-6 mb-6 shadow-sm">
                <p className="font-semibold text-xl mb-3 text-blue-900">Quick Answer:</p>
                <p className="text-gray-800 text-lg leading-relaxed">
                  Feed sourdough starter by discarding all but 50g, then adding equal parts flour and water (1:1:1 ratio) 
                  for daily maintenance, or use 1:2:2 ratio for active baking preparation. Mix thoroughly and let ferment 
                  8-12 hours at room temperature.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">Essential Skill</Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">3 min read</Badge>
              </div>
            </div>
          </div>

          {/* Step-by-Step Process */}
          <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-gray-900">Complete Feeding Process</h2>
            
            <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 md:p-8 border border-blue-200">
                <div className="flex items-start gap-6">
                  <div className="bg-blue-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 font-bold text-white text-lg md:text-xl shadow-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl md:text-2xl mb-4 text-blue-900">Discard Excess Starter</h3>
                    <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                      Remove all but 50g of your existing starter. Save the discard for recipes or composting. 
                      This prevents the jar from overflowing and maintains proper fermentation balance.
                    </p>
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-sm">
                      <p className="text-amber-800 font-medium">
                        <strong>Pro Tip:</strong> Weigh your empty jar first, then add 50g starter for precision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-blue-800">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Choose Your Feeding Ratio</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="font-bold text-lg text-blue-600">1:1:1</div>
                      <div className="text-sm text-gray-600">Daily Maintenance</div>
                      <div className="text-xs mt-1">50g each: starter, flour, water</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="font-bold text-lg text-green-600">1:2:2</div>
                      <div className="text-sm text-gray-600">Active Baking</div>
                      <div className="text-xs mt-1">50g starter + 100g flour + 100g water</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="font-bold text-lg text-purple-600">1:5:5</div>
                      <div className="text-sm text-gray-600">Storage Prep</div>
                      <div className="text-xs mt-1">50g starter + 250g flour + 250g water</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-blue-800">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Add Flour</h3>
                  <p className="text-gray-600 mb-2">
                    Add the calculated amount of flour to your starter. All-purpose flour works well for maintenance, 
                    while bread flour provides extra strength for active baking periods.
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>All-purpose flour: Consistent, reliable results</li>
                    <li>Bread flour: Higher protein, stronger fermentation</li>
                    <li>Whole wheat: Faster fermentation, more nutrients</li>
                    <li>Rye flour: Very active, boosts sluggish starters</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-blue-800">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Add Water and Mix</h3>
                  <p className="text-gray-600 mb-2">
                    Add room temperature water (68-75°F) and mix thoroughly until no dry flour remains. 
                    The consistency should be thick but stirrable, similar to thick pancake batter.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Water Temperature Guide:</strong> Room temp for regular feeding, slightly warm (80°F) 
                      to boost activity, cool water to slow fermentation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-blue-800">
                  5
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cover and Ferment</h3>
                  <p className="text-gray-600 mb-2">
                    Cover loosely with a lid or cloth to allow gas to escape. Let sit at room temperature for 
                    8-12 hours until doubled in size and showing peak activity.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2">Signs of Peak Activity:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Doubled in size</li>
                        <li>• Bubbles throughout</li>
                        <li>• Pleasant, tangy aroma</li>
                        <li>• Passes the float test</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2">Timing Guidelines:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 70°F: 10-12 hours</li>
                        <li>• 75°F: 6-8 hours</li>
                        <li>• 80°F: 4-6 hours</li>
                        <li>• Cool temps: 12+ hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Feeding Problems */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Common Feeding Issues</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-semibold text-red-800">Starter Not Rising After Feeding</h3>
                <p className="text-sm text-gray-600">
                  Usually caused by inactive starter, wrong temperature, or old flour. Try warm location, fresh flour, 
                  or add a pinch of whole wheat flour to boost activity.
                </p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <h3 className="font-semibold text-yellow-800">Liquid (Hooch) on Top</h3>
                <p className="text-sm text-gray-600">
                  Normal sign of hunger. Stir in or pour off, then feed normally. Increase feeding frequency 
                  if hooch appears regularly.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-green-800">Too Thick or Thin Consistency</h3>
                <p className="text-sm text-gray-600">
                  Adjust water content gradually. Thick starter ferments slower but develops more flavor. 
                  Thin starter ferments faster but may become overly acidic.
                </p>
              </div>
            </div>
          </div>

          {/* Calculator Integration */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Calculate Perfect Feeding Amounts</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Use our professional feeding calculator to determine exact flour and water amounts for any starter 
              quantity and feeding ratio.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                <a href="/tools/starter-feeding-calculator">
                  <Calculator className="h-4 w-4 mr-2" />
                  Feeding Calculator
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/tools/timeline-calculator">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline Calculator
                </a>
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">### What ratio should I use to feed my starter?</h3>
                <p className="text-sm text-gray-600">
                  Use 1:1:1 ratio (equal parts starter, flour, water) for daily maintenance, 1:2:2 for active baking, 
                  or 1:5:5 before refrigerator storage. The ratio depends on starter activity and usage frequency.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How often should I feed my sourdough starter?</h3>
                <p className="text-sm text-gray-600">
                  Feed daily if kept at room temperature, every 3-7 days if refrigerated. Active baking periods 
                  require daily feeding with stronger ratios like 1:2:2.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### What temperature water should I use for feeding?</h3>
                <p className="text-sm text-gray-600">
                  Use room temperature water (68-75°F) for regular feeding. Slightly warm water (80-85°F) can 
                  accelerate fermentation in cool environments, while cooler water slows activity.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Can I use tap water to feed my starter?</h3>
                <p className="text-sm text-gray-600">
                  Yes, but let chlorinated tap water sit overnight or use filtered water. Chlorine can inhibit 
                  fermentation. Well water or spring water work excellently for starter feeding.
                </p>
              </div>
            </div>
          </div>

          {/* Related Pages */}
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Related Starter School Pages</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/starter-school/how-often-feed-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Frequency Guide</div>
                <div className="text-sm text-gray-600">Learn optimal feeding schedules for different situations</div>
              </a>
              <a href="/starter-school/best-feeding-ratio-1-1-1-vs-1-2-2" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">1:1:1 vs 1:2:2 Ratios</div>
                <div className="text-sm text-gray-600">Compare feeding ratios for different baking needs</div>
              </a>
              <a href="/starter-school/why-sourdough-starter-not-rising" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Troubleshooting Guide</div>
                <div className="text-sm text-gray-600">Fix common starter feeding problems</div>
              </a>
              <a href="/starter-school/what-is-hooch-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Understanding Hooch</div>
                <div className="text-sm text-gray-600">Learn about liquid formation on starter</div>
              </a>
            </div>
          </div>
        </div>
      </MobileLayout>
    </>
  );
}

export default HowToFeedSourdoughStarterPage;