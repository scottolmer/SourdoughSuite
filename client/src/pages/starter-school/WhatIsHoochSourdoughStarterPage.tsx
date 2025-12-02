import { SEO } from "@/components/SEO";
import { MobileLayout } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, AlertCircle, CheckCircle, Info } from "lucide-react";

export function WhatIsHoochSourdoughStarterPage() {
  return (
    <>
      <SEO
        title="What Is Hooch on Sourdough Starter - Complete Guide"
        description="Learn about hooch liquid on sourdough starter. Understand what causes hooch, whether it's safe, and how to prevent or manage liquid formation on starter."
        keywords={["what is hooch sourdough starter", "liquid on sourdough starter", "starter hooch safe", "sourdough starter alcohol liquid"]}
        canonicalUrl="https://sourdoughsuite.com/starter-school/what-is-hooch-sourdough-starter"
        faqSchema={[
          {
            question: "What is hooch on sourdough starter?",
            answer: "Hooch is a liquid layer that forms on sourdough starter when it's hungry or unfed. It's alcohol produced by yeast fermentation and is completely normal and safe. It appears as clear, brown, or gray liquid on top or throughout the starter."
          },
          {
            question: "Is hooch on sourdough starter safe?",
            answer: "Yes, hooch is completely safe. It's ethyl alcohol produced by natural fermentation. You can stir it in for tangier flavor or pour it off before feeding. It will not harm you or your starter."
          },
          {
            question: "Should I stir in hooch or pour it off?",
            answer: "Both options are safe. Stir it in for more sour flavor, or pour it off for milder taste. Either way, feed your starter normally after dealing with the hooch."
          },
          {
            question: "How do I prevent hooch on my starter?",
            answer: "Feed more frequently, use higher ratios (1:2:2 instead of 1:1:1), or refrigerate between uses. Hooch forms when starter runs out of food, so more frequent feeding prevents it."
          }
        ]}
      />
      <MobileLayout title="Understanding Hooch" showBackButton>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Featured Snippet Answer */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">What Is Hooch on Sourdough Starter?</h1>
              <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-6 mb-6 shadow-sm">
                <p className="font-semibold text-xl mb-3 text-blue-900">Quick Answer:</p>
                <p className="text-gray-800 text-lg leading-relaxed">
                  Hooch is a liquid layer that forms on sourdough starter when it's hungry or unfed. It's alcohol produced 
                  by yeast fermentation and is completely normal and safe. It appears as clear, brown, or gray liquid on 
                  top or throughout the starter.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">Normal Occurrence</Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">3 min read</Badge>
              </div>
            </div>
          </div>

          {/* What Hooch Looks Like */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Identifying Hooch</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Clear Hooch</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Appearance:</strong> Water-like, transparent</p>
                  <p><strong>Location:</strong> Usually on top</p>
                  <p><strong>Meaning:</strong> Recent hunger, mild acidity</p>
                  <p><strong>Action:</strong> Stir in or pour off</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Brown Hooch</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Appearance:</strong> Light to dark brown</p>
                  <p><strong>Location:</strong> Top layer or mixed in</p>
                  <p><strong>Meaning:</strong> Longer unfed period</p>
                  <p><strong>Action:</strong> Pour off before feeding</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Gray Hooch</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Appearance:</strong> Gray or blackish</p>
                  <p><strong>Location:</strong> Throughout starter</p>
                  <p><strong>Meaning:</strong> Very hungry, needs attention</p>
                  <p><strong>Action:</strong> Pour off, feed immediately</p>
                </div>
              </div>
            </div>
          </div>

          {/* What Causes Hooch */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">What Causes Hooch Formation</h2>
            
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Primary Cause: Starter Hunger
                </h3>
                <p className="text-sm text-amber-700">
                  When your starter runs out of flour to consume, yeast begins fermenting its own byproducts, 
                  producing alcohol (hooch) as a waste product. This is completely natural fermentation behavior.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Contributing Factors:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Infrequent feeding schedule</li>
                    <li>• Low feeding ratios (not enough fresh flour)</li>
                    <li>• Warm temperatures (faster consumption)</li>
                    <li>• Very active, mature starter</li>
                    <li>• High hydration levels</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-800 mb-2">Why It Happens:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Yeast ferments available sugars</li>
                    <li>• Produces ethyl alcohol as byproduct</li>
                    <li>• Alcohol separates from dough</li>
                    <li>• Forms protective liquid layer</li>
                    <li>• Natural preservation mechanism</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Is Hooch Safe */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Is Hooch Safe?</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-bold text-green-800">Yes, Hooch is Completely Safe</h3>
              </div>
              <p className="text-sm text-green-700">
                Hooch is ethyl alcohol produced by natural fermentation - the same alcohol in wine and beer. 
                It will not harm you or your starter. Many bakers intentionally develop hooch for flavor.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-blue-800">What Hooch Contains:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Ethyl alcohol:</strong> Safe drinking alcohol (3-12% ABV)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Organic acids:</strong> Acetic and lactic acid for preservation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Esters:</strong> Flavor compounds from fermentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Water:</strong> From starter hydration</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-purple-800">Safety Benefits:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>Natural preservative:</strong> Alcohol inhibits harmful bacteria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>pH protection:</strong> Acidic environment prevents spoilage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>Self-regulating:</strong> Healthy microbes dominate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>Historical precedent:</strong> Used for centuries</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Handle Hooch */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">How to Handle Hooch</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-3">Option 1: Stir It In</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">When to Stir In:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Clear or light brown hooch</li>
                      <li>• You want tangier bread</li>
                      <li>• Hooch smells pleasant</li>
                      <li>• Small amounts only</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Adds complex sour flavors</li>
                      <li>• Increases acidity</li>
                      <li>• Zero waste approach</li>
                      <li>• Traditional method</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-bold text-amber-800 mb-3">Option 2: Pour It Off</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">When to Pour Off:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Dark brown or gray hooch</li>
                      <li>• Strong alcohol smell</li>
                      <li>• Large amounts present</li>
                      <li>• Prefer milder flavor</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Milder bread flavor</li>
                      <li>• Fresh start for starter</li>
                      <li>• Removes excess alcohol</li>
                      <li>• Easier to work with</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">After Handling Hooch:</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Feed your starter with fresh flour and water</li>
                <li>Use normal feeding ratio (1:1:1 or 1:2:2)</li>
                <li>Mix thoroughly until no dry spots remain</li>
                <li>Continue regular feeding schedule</li>
              </ol>
            </div>
          </div>

          {/* Prevention Strategies */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Preventing Hooch Formation</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-800 mb-3">Feeding Adjustments:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Increase Feeding Frequency:</strong>
                      <p className="text-sm text-gray-600">Feed daily instead of every 2-3 days</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Use Higher Ratios:</strong>
                      <p className="text-sm text-gray-600">Switch from 1:1:1 to 1:2:2 for more food</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Consistent Schedule:</strong>
                      <p className="text-sm text-gray-600">Feed at same time each day</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Storage Solutions:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Refrigerate Between Uses:</strong>
                      <p className="text-sm text-gray-600">Slows fermentation and hooch formation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Control Temperature:</strong>
                      <p className="text-sm text-gray-600">Cooler environments slow activity</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Pre-Storage Feeding:</strong>
                      <p className="text-sm text-gray-600">Use 1:5:5 ratio before refrigerating</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* When to Worry */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">When to Be Concerned</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Normal Hooch (Safe)
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Clear, brown, or gray liquid</li>
                  <li>• Alcoholic or vinegar smell</li>
                  <li>• Separates cleanly from starter</li>
                  <li>• Starter still bubbles after feeding</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Warning Signs (Investigate)
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Fuzzy mold growth (white, green, or black)</li>
                  <li>• Putrid, rotten smell</li>
                  <li>• Pink or orange coloration</li>
                  <li>• No response to feeding after 3-4 attempts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calculator Integration */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Adjust Feeding to Prevent Hooch</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Use our feeding calculator to determine stronger feeding ratios that reduce hooch formation, 
              or plan feeding schedules that prevent hunger.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button asChild className="w-full">
                <a href="/tools/starter-feeding-calculator">
                  <Droplets className="h-4 w-4 mr-2" />
                  Feeding Calculator
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/tools/timeline-calculator">
                  <AlertCircle className="h-4 w-4 mr-2" />
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
                <h3 className="font-semibold mb-2">### Is hooch on sourdough starter safe?</h3>
                <p className="text-sm text-gray-600">
                  Yes, hooch is completely safe. It's ethyl alcohol produced by natural fermentation. You can stir 
                  it in for tangier flavor or pour it off before feeding. It will not harm you or your starter.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Should I stir in hooch or pour it off?</h3>
                <p className="text-sm text-gray-600">
                  Both options are safe. Stir it in for more sour flavor, or pour it off for milder taste. 
                  Either way, feed your starter normally after dealing with the hooch.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How do I prevent hooch on my starter?</h3>
                <p className="text-sm text-gray-600">
                  Feed more frequently, use higher ratios (1:2:2 instead of 1:1:1), or refrigerate between uses. 
                  Hooch forms when starter runs out of food, so more frequent feeding prevents it.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### What does hooch taste like?</h3>
                <p className="text-sm text-gray-600">
                  Hooch tastes like mild alcohol with vinegar notes. Clear hooch is less intense, while darker 
                  hooch has stronger, more acidic flavors. Many bakers enjoy the complexity it adds to bread.
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
                <div className="text-sm text-gray-600">Complete feeding process and techniques</div>
              </a>
              <a href="/starter-school/how-often-feed-sourdough-starter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Frequency Guide</div>
                <div className="text-sm text-gray-600">Prevent hooch with proper scheduling</div>
              </a>
              <a href="/starter-school/best-feeding-ratio-1-1-1-vs-1-2-2" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Feeding Ratio Guide</div>
                <div className="text-sm text-gray-600">Choose ratios that prevent hunger</div>
              </a>
              <a href="/starter-school/why-sourdough-starter-not-rising" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Troubleshooting Guide</div>
                <div className="text-sm text-gray-600">Fix starter problems and issues</div>
              </a>
            </div>
          </div>
        </div>
      </MobileLayout>
    </>
  );
}

export default WhatIsHoochSourdoughStarterPage;