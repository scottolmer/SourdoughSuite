import { SEO } from "@/components/SEO";
import { MobileLayout } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Clock, Thermometer, ArrowRight } from "lucide-react";

export function HowOftenFeedSourdoughStarterPage() {
  return (
    <>
      <SEO
        title="How Often Should I Feed My Sourdough Starter - Feeding Schedule Guide"
        description="Learn optimal sourdough starter feeding schedules for different storage methods and baking frequency. Daily, weekly, and storage feeding schedules explained."
        keywords={["how often feed sourdough starter", "sourdough starter feeding schedule", "daily feeding vs weekly", "starter maintenance frequency"]}
        canonicalUrl="https://sourdoughsuite.com/starter-school/how-often-feed-sourdough-starter"
        faqSchema={[
          {
            question: "How often should I feed my sourdough starter?",
            answer: "Feed daily if kept at room temperature, every 3-7 days if refrigerated. Active baking periods require daily feeding, while long-term storage can extend to weekly or monthly feedings."
          },
          {
            question: "Can I feed my starter once a week?",
            answer: "Yes, weekly feeding works for refrigerated starters. Feed before refrigerating, then feed again when removing for baking. This schedule works well for occasional bakers."
          },
          {
            question: "What happens if I skip feeding my starter?",
            answer: "Missing 1-2 feedings won't harm a healthy starter, but it may develop hooch (liquid) and become less active. Multiple missed feedings can weaken the starter and require revival."
          },
          {
            question: "Should I feed my starter twice a day?",
            answer: "Twice-daily feeding is only needed in very warm conditions (85°F+) or when building starter strength for intensive baking. Most home bakers need only once-daily feeding."
          }
        ]}
      />
      <MobileLayout title="Feeding Schedule" showBackButton>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Featured Snippet Answer */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">How Often Should I Feed My Sourdough Starter?</h1>
              <div className="bg-white border-l-4 border-green-500 rounded-r-lg p-6 mb-6 shadow-sm">
                <p className="font-semibold text-xl mb-3 text-green-900">Quick Answer:</p>
                <p className="text-gray-800 text-lg leading-relaxed">
                  Feed daily if kept at room temperature, every 3-7 days if refrigerated. Active baking periods 
                  require daily feeding, while long-term storage can extend to weekly or monthly feedings.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">Maintenance Guide</Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">4 min read</Badge>
              </div>
            </div>
          </div>

          {/* Feeding Schedule Matrix */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Feeding Schedules by Storage Method</h2>
            
            <div className="grid gap-6">
              {/* Room Temperature */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-lg">Room Temperature (68-75°F)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Daily Feeding Required</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Feed every 12-24 hours</li>
                      <li>• Use 1:1:1 ratio for maintenance</li>
                      <li>• Best for active bakers</li>
                      <li>• Strongest starter activity</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2">When to Use:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Baking 2+ times per week</li>
                      <li>• Building new starter</li>
                      <li>• Peak fermentation needed</li>
                      <li>• Professional baking</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Refrigerated */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">Refrigerated (35-40°F)</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Weekly Feeding Schedule</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Feed before refrigerating</li>
                      <li>• Feed again when using</li>
                      <li>• Can extend to 10-14 days</li>
                      <li>• Use 1:2:2 or 1:5:5 ratios</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">Perfect For:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Weekend bakers</li>
                      <li>• Occasional bread making</li>
                      <li>• Vacation preparations</li>
                      <li>• Low-maintenance approach</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Long-term Storage */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-lg">Long-term Storage</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Monthly Feeding</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Feed with 1:10:10 ratio</li>
                      <li>• Can survive 4-6 weeks</li>
                      <li>• May develop hooch</li>
                      <li>• Requires revival period</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-700 mb-2">Revival Process:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 2-3 daily feedings needed</li>
                      <li>• Start with 1:1:1 ratio</li>
                      <li>• Monitor for activity</li>
                      <li>• Test with float test</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feeding Frequency by Baking Pattern */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Feeding Schedule by Baking Frequency</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Daily Baker (5+ loaves/week)</h3>
                <p className="text-sm text-green-700 mb-2">Feed twice daily with 1:2:2 ratio</p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Morning: 8 AM feeding</li>
                  <li>• Evening: 8 PM feeding</li>
                  <li>• Peak activity within 4-6 hours</li>
                  <li>• Professional baker schedule</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Active Baker (2-4 loaves/week)</h3>
                <p className="text-sm text-blue-700 mb-2">Feed daily with 1:1:1 ratio</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Daily feeding at consistent time</li>
                  <li>• Room temperature storage</li>
                  <li>• Ready for baking anytime</li>
                  <li>• Strongest starter health</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Weekend Baker (1 loaf/week)</h3>
                <p className="text-sm text-purple-700 mb-2">Feed weekly with refrigeration</p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Sunday: Feed and refrigerate</li>
                  <li>• Friday: Remove and feed for weekend baking</li>
                  <li>• Use 1:5:5 ratio for storage feeding</li>
                  <li>• Most common home schedule</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Occasional Baker (Monthly)</h3>
                <p className="text-sm text-gray-700 mb-2">Monthly feeding with revival process</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Feed with 1:10:10 ratio before storage</li>
                  <li>• 2-3 day revival process before baking</li>
                  <li>• Check for mold before revival</li>
                  <li>• May need multiple feedings to restore</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Environmental Factors Affecting Feeding</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-red-600">Increase Feeding Frequency:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span><strong>Hot weather (80°F+):</strong> Feed twice daily or refrigerate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span><strong>High humidity:</strong> Accelerates fermentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span><strong>Active starter:</strong> Young, vigorous cultures need more food</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span><strong>Whole grain flours:</strong> Higher enzyme activity</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-blue-600">Decrease Feeding Frequency:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Cold weather (65°F-):</strong> Slower fermentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Low humidity:</strong> Reduced microbial activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>Mature starter:</strong> Established cultures are more stable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>All-purpose flour:</strong> Slower fermentation than whole grains</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calculator Integration */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold">Plan Your Feeding Schedule</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Use our timeline calculator to plan feeding schedules around your baking routine, ensuring 
              your starter is ready when you need it.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                <a href="/tools/timeline-calculator">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline Calculator
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/tools/starter-feeding-calculator">
                  <Calculator className="h-4 w-4 mr-2" />
                  Feeding Calculator
                </a>
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">### Can I feed my starter once a week?</h3>
                <p className="text-sm text-gray-600">
                  Yes, weekly feeding works for refrigerated starters. Feed before refrigerating, then feed 
                  again when removing for baking. This schedule works well for occasional bakers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### What happens if I skip feeding my starter?</h3>
                <p className="text-sm text-gray-600">
                  Missing 1-2 feedings won't harm a healthy starter, but it may develop hooch (liquid) and 
                  become less active. Multiple missed feedings can weaken the starter and require revival.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Should I feed my starter twice a day?</h3>
                <p className="text-sm text-gray-600">
                  Twice-daily feeding is only needed in very warm conditions (85°F+) or when building starter 
                  strength for intensive baking. Most home bakers need only once-daily feeding.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How do I know if my feeding schedule is working?</h3>
                <p className="text-sm text-gray-600">
                  A good feeding schedule produces predictable doubling times, pleasant aroma, and consistent 
                  bubbling activity. Adjust frequency if you see excessive hooch or lack of rise.
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
                <div className="text-sm text-gray-600">Complete feeding process and ratios</div>
              </a>
              <a href="/starter-school/best-feeding-ratio-1-1-1-vs-1-2-2" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Ratio Guide</div>
                <div className="text-sm text-gray-600">Choose the right ratio for your schedule</div>
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

export default HowOftenFeedSourdoughStarterPage;