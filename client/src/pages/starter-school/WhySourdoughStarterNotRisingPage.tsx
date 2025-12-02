import { SEO } from "@/components/SEO";
import { MobileLayout } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Thermometer, Scale, Clock, Zap } from "lucide-react";

export function WhySourdoughStarterNotRisingPage() {
  return (
    <>
      <SEO
        title="Why Is My Sourdough Starter Not Rising - Troubleshooting Guide"
        description="Fix sluggish sourdough starter that won't rise. Common causes and solutions for inactive starter including temperature, feeding, and flour issues."
        keywords={["why sourdough starter not rising", "starter not rising troubleshoot", "sluggish sourdough starter", "inactive starter fix"]}
        canonicalUrl="https://sourdoughsuite.com/starter-school/why-sourdough-starter-not-rising"
        faqSchema={[
          {
            question: "Why is my sourdough starter not rising?",
            answer: "Common causes include cold temperature, inactive yeast, old flour, wrong feeding ratio, or chlorinated water. Most issues resolve with consistent feeding, proper temperature (75-80°F), and fresh flour."
          },
          {
            question: "How do I fix a sluggish sourdough starter?",
            answer: "Feed with whole wheat or rye flour for 2-3 feedings, maintain 75-80°F temperature, use filtered water, and try 1:1:1 ratio. Add a pinch of organic fruit juice for extra microorganisms."
          },
          {
            question: "How long should starter take to double in size?",
            answer: "Healthy starter should double in 4-12 hours depending on temperature and feeding ratio. 6-8 hours at 75°F with 1:1:1 ratio is typical for mature starters."
          },
          {
            question: "Can I revive a completely dead starter?",
            answer: "If no mold is present, try 5-7 days of daily feeding with fresh flour and filtered water. Switch to whole wheat flour temporarily and maintain warm temperature (80°F)."
          }
        ]}
      />
      <MobileLayout title="Starter Troubleshooting" showBackButton>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Featured Snippet Answer */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">Why Is My Sourdough Starter Not Rising?</h1>
              <div className="bg-white border-l-4 border-red-500 rounded-r-lg p-6 mb-6 shadow-sm">
                <p className="font-semibold text-xl mb-3 text-red-900">Quick Diagnosis:</p>
                <p className="text-gray-800 text-lg leading-relaxed">
                  Common causes include cold temperature, inactive yeast, old flour, wrong feeding ratio, or chlorinated water. 
                  Most issues resolve with consistent feeding, proper temperature (75-80°F), and fresh flour.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">Troubleshooting</Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">6 min read</Badge>
              </div>
            </div>
          </div>

          {/* Common Causes Diagnostic */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Diagnostic Checklist</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Thermometer className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-2">Temperature Too Cold</h3>
                  <p className="text-sm text-amber-700 mb-2">
                    <strong>Problem:</strong> Starter kept below 70°F ferments very slowly
                  </p>
                  <p className="text-xs text-amber-600">
                    <strong>Solution:</strong> Move to warmer location (75-80°F) or use proofing box
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 mb-2">Wrong Feeding Ratio</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Problem:</strong> Too much starter relative to fresh flour and water
                  </p>
                  <p className="text-xs text-blue-600">
                    <strong>Solution:</strong> Try 1:2:2 ratio (more flour/water) for stronger feeding
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-800 mb-2">Old or Poor Quality Flour</h3>
                  <p className="text-sm text-purple-700 mb-2">
                    <strong>Problem:</strong> Flour lacks nutrients needed for fermentation
                  </p>
                  <p className="text-xs text-purple-600">
                    <strong>Solution:</strong> Switch to fresh, high-quality flour or add whole wheat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="bg-green-100 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-2">Chlorinated Water</h3>
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Problem:</strong> Chlorine kills beneficial bacteria and yeast
                  </p>
                  <p className="text-xs text-green-600">
                    <strong>Solution:</strong> Use filtered water or let tap water sit 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revival Protocol */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">7-Day Revival Protocol</h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-3">Days 1-3: Emergency Revival</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Daily Actions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Discard all but 25g starter</li>
                      <li>• Feed with 25g whole wheat flour</li>
                      <li>• Add 25g filtered water</li>
                      <li>• Keep at 80°F if possible</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Look For:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Small bubbles appearing</li>
                      <li>• Slight expansion</li>
                      <li>• Tangy aroma developing</li>
                      <li>• Any sign of activity</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-3">Days 4-5: Building Strength</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Adjusted Feeding:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Switch to 1:1:1 ratio</li>
                      <li>• Mix 50% all-purpose, 50% whole wheat</li>
                      <li>• Continue 80°F temperature</li>
                      <li>• Feed every 24 hours</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Expected Results:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Consistent bubbling</li>
                      <li>• 50-75% size increase</li>
                      <li>• Predictable timing</li>
                      <li>• Pleasant sour smell</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-800 mb-3">Days 6-7: Testing Readiness</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Final Tests:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Float test in water</li>
                      <li>• Double in size test</li>
                      <li>• Consistent 6-8 hour rise</li>
                      <li>• Strong, pleasant aroma</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Ready for Baking:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Passes float test</li>
                      <li>• Doubles within 8 hours</li>
                      <li>• No off odors</li>
                      <li>• Active bubbling throughout</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Optimization */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Temperature Solutions</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-600 mb-3">Cold Kitchen (65-70°F)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Problem:</strong> Very slow fermentation</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Oven with light on</li>
                    <li>• Top of refrigerator</li>
                    <li>• Heating pad on low</li>
                    <li>• Use 1:2:2 feeding ratio</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-green-600 mb-3">Ideal Range (75-80°F)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Result:</strong> 6-8 hour doubling</p>
                  <p><strong>Maintenance:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Consistent daily feeding</li>
                    <li>• 1:1:1 ratio works well</li>
                    <li>• Predictable timing</li>
                    <li>• Strongest activity</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-red-600 mb-3">Hot Kitchen (85°F+)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Problem:</strong> Too fast fermentation</p>
                  <p><strong>Solutions:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• Refrigerate between feeds</li>
                    <li>• Feed twice daily</li>
                    <li>• Use higher ratios (1:5:5)</li>
                    <li>• Cool water for feeding</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Boost Techniques */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Quick Boost Techniques</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-800 mb-3">Natural Boosters:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <strong>Whole Wheat Flour:</strong>
                      <p className="text-sm text-gray-600">Higher nutrients and enzymes boost activity</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <strong>Rye Flour:</strong>
                      <p className="text-sm text-gray-600">Very high enzyme activity, use sparingly</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <div>
                      <strong>Organic Fruit Juice:</strong>
                      <p className="text-sm text-gray-600">1 tsp apple or grape juice adds microorganisms</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Environmental Fixes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>
                      <strong>Proofing Box:</strong>
                      <p className="text-sm text-gray-600">Consistent 80°F temperature control</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>
                      <strong>Fresh Flour:</strong>
                      <p className="text-sm text-gray-600">Replace old flour with recently milled</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>
                      <strong>Filtered Water:</strong>
                      <p className="text-sm text-gray-600">Eliminate chlorine and chemical inhibitors</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calculator Integration */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-semibold">Troubleshoot with Tools</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Use our AI troubleshooter for personalized diagnosis or feeding calculator to adjust ratios 
              for stronger starter activity.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                <a href="/tools/troubleshooter">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  AI Troubleshooter
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/tools/starter-feeding-calculator">
                  <Scale className="h-4 w-4 mr-2" />
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
                <h3 className="font-semibold mb-2">### How do I fix a sluggish sourdough starter?</h3>
                <p className="text-sm text-gray-600">
                  Feed with whole wheat or rye flour for 2-3 feedings, maintain 75-80°F temperature, use filtered water, 
                  and try 1:1:1 ratio. Add a pinch of organic fruit juice for extra microorganisms.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How long should starter take to double in size?</h3>
                <p className="text-sm text-gray-600">
                  Healthy starter should double in 4-12 hours depending on temperature and feeding ratio. 6-8 hours 
                  at 75°F with 1:1:1 ratio is typical for mature starters.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Can I revive a completely dead starter?</h3>
                <p className="text-sm text-gray-600">
                  If no mold is present, try 5-7 days of daily feeding with fresh flour and filtered water. Switch 
                  to whole wheat flour temporarily and maintain warm temperature (80°F).
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Should I throw away my starter if it's not rising?</h3>
                <p className="text-sm text-gray-600">
                  Don't give up unless you see mold. Most sluggish starters can be revived with proper feeding, 
                  temperature control, and patience. Try the 7-day revival protocol above.
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
              <a href="/starter-school/how-often-feed-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Frequency Guide</div>
                <div className="text-sm text-gray-600">Optimal feeding schedules</div>
              </a>
              <a href="/starter-school/best-feeding-ratio-1-1-1-vs-1-2-2" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Ratio Guide</div>
                <div className="text-sm text-gray-600">1:1:1 vs 1:2:2 comparison</div>
              </a>
              <a href="/starter-school/what-is-hooch-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Understanding Hooch</div>
                <div className="text-sm text-gray-600">Learn about liquid formation</div>
              </a>
            </div>
          </div>
        </div>
      </MobileLayout>
    </>
  );
}

export default WhySourdoughStarterNotRisingPage;