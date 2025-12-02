import { SEO } from "@/components/SEO";
import { MobileLayout } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Clock, TrendingUp } from "lucide-react";

export function BestFeedingRatio111vs122Page() {
  return (
    <>
      <SEO
        title="1:1:1 vs 1:2:2 Sourdough Starter Feeding Ratio - Complete Comparison"
        description="Compare 1:1:1 vs 1:2:2 starter feeding ratios. Learn when to use each ratio for optimal sourdough starter health and baking performance."
        keywords={["1:1:1 vs 1:2:2 feeding ratio", "best starter feeding ratio", "sourdough feeding ratio comparison", "starter ratio guide"]}
        canonicalUrl="https://bakehousebreads.com/starter-school/best-feeding-ratio-1-1-1-vs-1-2-2"
        faqSchema={[
          {
            question: "What is the difference between 1:1:1 and 1:2:2 feeding ratios?",
            answer: "1:1:1 uses equal parts starter, flour, and water for maintenance, while 1:2:2 uses double the flour and water. 1:1:1 is for daily maintenance, 1:2:2 builds strength for active baking."
          },
          {
            question: "When should I use 1:1:1 feeding ratio?",
            answer: "Use 1:1:1 for daily maintenance, consistent starter health, and when baking 1-2 times per week. It provides steady fermentation without overfeeding."
          },
          {
            question: "When should I use 1:2:2 feeding ratio?",
            answer: "Use 1:2:2 when preparing for active baking, in cooler temperatures, or building starter strength. It provides extra nutrition for stronger fermentation activity."
          },
          {
            question: "Which ratio is better for beginners?",
            answer: "1:1:1 is better for beginners because it's easier to manage, more forgiving, and provides consistent results. Switch to 1:2:2 when you need stronger starter activity."
          }
        ]}
      />
      <MobileLayout title="Feeding Ratio Guide" showBackButton>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Featured Snippet Answer */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">1:1:1 vs 1:2:2 Sourdough Starter Feeding Ratios</h1>
              <div className="bg-white border-l-4 border-amber-500 rounded-r-lg p-6 mb-6 shadow-sm">
                <p className="font-semibold text-xl mb-3 text-amber-900">Quick Comparison:</p>
                <p className="text-gray-800 text-lg leading-relaxed">
                  1:1:1 uses equal parts starter, flour, and water for maintenance, while 1:2:2 uses double the flour 
                  and water. 1:1:1 is for daily maintenance, 1:2:2 builds strength for active baking.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">Ratio Guide</Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">5 min read</Badge>
              </div>
            </div>
          </div>

          {/* Direct Ratio Comparison */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Visual Ratio Comparison</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 1:1:1 Ratio */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-800">1:1:1 Ratio</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Starter:</span>
                    <span className="font-bold text-blue-700">50g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Flour:</span>
                    <span className="font-bold text-blue-700">50g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Water:</span>
                    <span className="font-bold text-blue-700">50g</span>
                  </div>
                  <hr className="border-blue-300" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-blue-800">150g</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Best For:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Daily maintenance</li>
                    <li>• Consistent starter health</li>
                    <li>• 1-2 bakes per week</li>
                    <li>• Beginner bakers</li>
                    <li>• Stable fermentation</li>
                  </ul>
                </div>
              </div>

              {/* 1:2:2 Ratio */}
              <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">1:2:2 Ratio</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Starter:</span>
                    <span className="font-bold text-green-700">50g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Flour:</span>
                    <span className="font-bold text-green-700">100g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Water:</span>
                    <span className="font-bold text-green-700">100g</span>
                  </div>
                  <hr className="border-green-300" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-green-800">250g</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Best For:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Active baking periods</li>
                    <li>• Building starter strength</li>
                    <li>• Cool temperatures</li>
                    <li>• Professional baking</li>
                    <li>• Peak performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* When to Use Each Ratio */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">When to Use Each Ratio</h2>
            
            <div className="space-y-6">
              {/* 1:1:1 Use Cases */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Choose 1:1:1 Ratio When:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Baking Schedule:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Baking 1-2 times per week</li>
                      <li>• Weekend baker routine</li>
                      <li>• Casual bread making</li>
                      <li>• Learning sourdough basics</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Conditions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Room temperature 70-75°F</li>
                      <li>• Established mature starter</li>
                      <li>• Daily feeding routine</li>
                      <li>• Cost-conscious baking</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 1:2:2 Use Cases */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Choose 1:2:2 Ratio When:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Intensive Baking:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Baking 3+ times per week</li>
                      <li>• Professional production</li>
                      <li>• Multiple loaves needed</li>
                      <li>• Competition preparation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Special Situations:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Cool kitchen (65-70°F)</li>
                      <li>• Sluggish starter revival</li>
                      <li>• Pre-baking preparation</li>
                      <li>• Building starter strength</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison Table */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Performance Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Factor</th>
                    <th className="text-center p-3 font-semibold text-blue-800">1:1:1 Ratio</th>
                    <th className="text-center p-3 font-semibold text-green-800">1:2:2 Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Rise Time</td>
                    <td className="p-3 text-center">8-12 hours</td>
                    <td className="p-3 text-center">6-10 hours</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Peak Activity</td>
                    <td className="p-3 text-center">Moderate</td>
                    <td className="p-3 text-center">Strong</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Flour Usage</td>
                    <td className="p-3 text-center">50g per feeding</td>
                    <td className="p-3 text-center">100g per feeding</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Stability</td>
                    <td className="p-3 text-center">Very stable</td>
                    <td className="p-3 text-center">More active</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Beginner Friendly</td>
                    <td className="p-3 text-center">Excellent</td>
                    <td className="p-3 text-center">Good</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Cost Efficiency</td>
                    <td className="p-3 text-center">Higher</td>
                    <td className="p-3 text-center">Moderate</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Professional Use</td>
                    <td className="p-3 text-center">Maintenance</td>
                    <td className="p-3 text-center">Production</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Timing and Temperature Effects */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Temperature Impact on Ratios</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Cool (65-70°F)
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>1:1:1:</strong> 12-16 hours to peak</p>
                  <p><strong>1:2:2:</strong> 8-12 hours to peak</p>
                  <p className="text-blue-600 font-medium">Recommend: 1:2:2 for reliable activity</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Moderate (70-75°F)
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>1:1:1:</strong> 8-12 hours to peak</p>
                  <p><strong>1:2:2:</strong> 6-8 hours to peak</p>
                  <p className="text-green-600 font-medium">Recommend: Either ratio works well</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Warm (75-80°F)
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>1:1:1:</strong> 4-8 hours to peak</p>
                  <p><strong>1:2:2:</strong> 3-6 hours to peak</p>
                  <p className="text-red-600 font-medium">Recommend: 1:1:1 for control</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Integration */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6 text-amber-600" />
              <h2 className="text-lg font-semibold">Calculate Your Perfect Ratio</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Use our feeding calculator to determine exact amounts for any ratio and starter quantity. 
              Switch between ratios to see the differences.
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
                <h3 className="font-semibold mb-2">### When should I use 1:1:1 feeding ratio?</h3>
                <p className="text-sm text-gray-600">
                  Use 1:1:1 for daily maintenance, consistent starter health, and when baking 1-2 times per week. 
                  It provides steady fermentation without overfeeding.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### When should I use 1:2:2 feeding ratio?</h3>
                <p className="text-sm text-gray-600">
                  Use 1:2:2 when preparing for active baking, in cooler temperatures, or building starter strength. 
                  It provides extra nutrition for stronger fermentation activity.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Which ratio is better for beginners?</h3>
                <p className="text-sm text-gray-600">
                  1:1:1 is better for beginners because it's easier to manage, more forgiving, and provides 
                  consistent results. Switch to 1:2:2 when you need stronger starter activity.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Can I switch between ratios?</h3>
                <p className="text-sm text-gray-600">
                  Yes, you can switch between ratios anytime. Use 1:1:1 for maintenance and 1:2:2 when 
                  preparing for baking. Your starter will adapt to the new feeding schedule within 1-2 feedings.
                </p>
              </div>
            </div>
          </div>

          {/* Related Pages */}
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Related Starter School Pages</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/starter-school/how-to-feed-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">How to Feed Starter</div>
                <div className="text-sm text-gray-600">Complete feeding process step-by-step</div>
              </a>
              <a href="/starter-school/how-often-feed-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Frequency Guide</div>
                <div className="text-sm text-gray-600">Optimal feeding schedules for different needs</div>
              </a>
              <a href="/starter-school/why-sourdough-starter-not-rising" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Troubleshooting Guide</div>
                <div className="text-sm text-gray-600">Fix sluggish or inactive starters</div>
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

export default BestFeedingRatio111vs122Page;