import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calculator, Check, Loader2, RefreshCw, Scale, Clock, Thermometer, AlertCircle, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAddFeedingLog, type FeedingLogFormData } from "@/hooks/use-feeding-logs";
import { useStarters } from "@/hooks/use-starters";
import ToolsMenu from "@/components/tools/ToolsMenu";
import { SEO } from "@/components/SEO";

export function StarterFeedingCalculatorPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const starterId = params.id ? parseInt(params.id) : undefined;
  
  // Fetch starters list for the dropdown if no starter ID provided
  const { data: starters, isLoading: isLoadingStarters } = useStarters();
  const [selectedStarterId, setSelectedStarterId] = useState<number | undefined>(starterId);
  
  const [starterAmount, setStarterAmount] = useState(50);
  const [ratio, setRatio] = useState("1:1:1"); // starter:flour:water
  const [flourType, setFlourType] = useState("all-purpose");
  const [notes, setNotes] = useState("");
  
  // Results state
  const [flourAmount, setFlourAmount] = useState(50);
  const [waterAmount, setWaterAmount] = useState(50);
  const [totalAmount, setTotalAmount] = useState(150);
  
  // Add feeding log mutation
  const { mutate, isPending } = useAddFeedingLog();
  const isAddingToLog = isPending;
  
  // Calculated automatically based on the ratio selection
  const updateCalculations = (ratio: string, starterGrams: number) => {
    let flourRatio = 1;
    let waterRatio = 1;
    
    // Parse the ratio format "1:2:3" (starter:flour:water)
    const parts = ratio.split(":");
    if (parts.length === 3) {
      const starterRatio = parseFloat(parts[0]);
      flourRatio = parseFloat(parts[1]) / starterRatio;
      waterRatio = parseFloat(parts[2]) / starterRatio;
    }
    
    const flour = Math.round(starterGrams * flourRatio);
    const water = Math.round(starterGrams * waterRatio);
    const total = starterGrams + flour + water;
    
    setFlourAmount(flour);
    setWaterAmount(water);
    setTotalAmount(total);
  };
  
  // Handle ratio changes
  const handleRatioChange = (newRatio: string) => {
    setRatio(newRatio);
    updateCalculations(newRatio, starterAmount);
  };
  
  // Handle starter amount changes
  const handleStarterChange = (value: number[]) => {
    const newStarterAmount = value[0];
    setStarterAmount(newStarterAmount);
    updateCalculations(ratio, newStarterAmount);
  };
  
  // Add current feeding to the log
  const addToFeedingLog = () => {
    if (!selectedStarterId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a starter to add to the feeding log.",
      });
      return;
    }

    // Format the date explicitly as an ISO string for the database
    const currentDate = new Date();
    const isoDateString = currentDate.toISOString();
    
    const feedingData: FeedingLogFormData = {
      starterId: selectedStarterId,
      userId: 1, // Using a default user ID for now, would use actual user ID in a real app
      flourAmount,
      waterAmount,
      starterAmount,
      flourType,
      ratio,
      feedingDate: isoDateString, // Use ISO string format for the database
      notes: notes || undefined
    };
    
    console.log("Sending feeding log data:", feedingData);
    
    mutate(feedingData, {
      onSuccess: () => {
        toast({
          title: "Feeding log added",
          description: "Your feeding log has been saved successfully.",
        });
        
        // Redirect to the feeding log page for this starter
        setTimeout(() => {
          setLocation(`/starter/feeding-log/${selectedStarterId}`);
        }, 1000);
      },
      onError: (error) => {
        console.error("Failed to add feeding log:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error 
            ? error.message 
            : "Failed to add feeding log. Please check that you've selected a valid starter and filled all required fields.",
        });
      }
    });
  };
  
  // Update calculations when component mounts
  useEffect(() => {
    updateCalculations(ratio, starterAmount);
  }, []);
  
  const getRatioDescription = (ratioValue: string) => {
    switch (ratioValue) {
      case "1:1:1": return "Equal parts - balanced for daily feeding";
      case "1:2:2": return "Standard feeding - good for active starters";
      case "1:3:3": return "For very active starters in warm weather";
      case "1:5:5": return "For strong, mature starters";
      case "1:10:10": return "For very mature starters or long storage";
      default: return "";
    }
  };

  const getFlourDescription = (flourValue: string) => {
    switch (flourValue) {
      case "all-purpose": return "Versatile, balanced nutrition";
      case "bread": return "High protein, strong gluten development";
      case "whole-wheat": return "Nutrient-rich, feeds beneficial bacteria";
      case "rye": return "High enzyme activity, boosts fermentation";
      case "custom-blend": return "Your custom flour mixture";
      default: return "";
    }
  };

  return (
    <>
      <SEO
        title="Sourdough Starter Feeding Calculator - Professional Ratio Tool"
        description="Calculate perfect feeding ratios for sourdough starter maintenance. Professional calculator with 1:1:1, 1:2:2, and custom ratios for optimal starter health."
        keywords={["sourdough starter feeding calculator", "starter feeding ratio calculator", "sourdough maintenance calculator", "starter feeding ratio", "1:1:1 vs 1:2:2 feeding"]}
        canonicalUrl="https://bakehousebreads.com/tools/starter-feeding-calculator"
      />
      <MobileLayout title="Feeding Calculator" showBackButton>
        <div className="space-y-6">
          {/* SEO-Optimized Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Sourdough Starter Feeding Calculator</h1>
            
            {/* Featured Snippet Bait - Feeding Ratio Comparison */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">Popular Starter Feeding Ratios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="font-bold text-lg text-amber-800">1:1:1</div>
                  <div className="text-sm text-amber-700">Daily Maintenance</div>
                  <div className="text-xs mt-1">Equal parts starter, flour, water</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="font-bold text-lg text-amber-800">1:2:2</div>
                  <div className="text-sm text-amber-700">Active Baking</div>
                  <div className="text-xs mt-1">Double flour and water</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="font-bold text-lg text-amber-800">1:5:5</div>
                  <div className="text-sm text-amber-700">Storage Prep</div>
                  <div className="text-xs mt-1">Long-term maintenance</div>
                </div>
              </div>
              <p className="text-sm text-amber-800 mt-4 text-center">
                <strong>Quick Guide:</strong> Use 1:1:1 for daily feeding, 1:2:2 for active baking periods, 1:5:5 before refrigerator storage.
              </p>
            </div>
            
            {/* Why Feeding Ratios Matter */}
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Proper starter feeding ratios are critical for maintaining a healthy, active sourdough culture. This 
                calculator determines precise flour and water amounts based on your starter quantity and chosen ratio, 
                ensuring optimal fermentation conditions and consistent baking performance.
              </p>
              
              <p className="text-muted-foreground">
                Professional bakers rely on consistent feeding schedules and ratios to maintain starter health across 
                different usage patterns. Use this tool for daily maintenance, pre-baking preparation, or long-term 
                storage planning with mathematically accurate ingredient calculations.
              </p>
            </div>
          </div>
        
        <ToolsMenu activeToolPath="/tools/starter-feeding-calculator" showAllTools={false} />
        
        <div className="space-y-8">
          {/* Input Section */}
          <section className="space-y-6">
            <MobileCard className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Feeding Parameters</h2>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Feeding Ratio (starter:flour:water)</Label>
                  <Select value={ratio} onValueChange={handleRatioChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1:1">1:1:1 (Equal parts)</SelectItem>
                      <SelectItem value="1:2:2">1:2:2 (Standard feeding)</SelectItem>
                      <SelectItem value="1:3:3">1:3:3 (For very active starters)</SelectItem>
                      <SelectItem value="1:5:5">1:5:5 (For strong starters)</SelectItem>
                      <SelectItem value="1:10:10">1:10:10 (For mature starters)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {getRatioDescription(ratio)}
                    </p>
                  </div>
                </div>
              </div>
            </MobileCard>
            
            <MobileCard className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Amount & Type</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm">Starter Amount</Label>
                    <Badge variant="secondary" className="font-mono">{starterAmount}g</Badge>
                  </div>
                  <Slider
                    value={[starterAmount]}
                    onValueChange={handleStarterChange}
                    min={10}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10g (minimal)</span>
                    <span>200g (large batch)</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Flour Type</Label>
                  <Select value={flourType} onValueChange={setFlourType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flour type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-purpose">All-Purpose Flour</SelectItem>
                      <SelectItem value="bread">Bread Flour</SelectItem>
                      <SelectItem value="whole-wheat">Whole Wheat Flour</SelectItem>
                      <SelectItem value="rye">Rye Flour</SelectItem>
                      <SelectItem value="custom-blend">Custom Blend</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                    <Info className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {getFlourDescription(flourType)}
                    </p>
                  </div>
                </div>
              </div>
            </MobileCard>
            
            <MobileCard className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Starter Selection & Notes</h3>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Your Starter</Label>
                  {isLoadingStarters ? (
                    <div className="flex items-center justify-center p-3 border rounded-md">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm">Loading starters...</span>
                    </div>
                  ) : (
                    <Select 
                      value={selectedStarterId?.toString()} 
                      onValueChange={(value) => setSelectedStarterId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your starter" />
                      </SelectTrigger>
                      <SelectContent>
                        {starters?.map((starter) => (
                          <SelectItem key={starter.id} value={starter.id.toString()}>
                            {starter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Required to save feeding logs and track starter health
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Feeding Notes</Label>
                  <Textarea
                    placeholder="Add observations about starter activity, environment, or changes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </MobileCard>
          </section>
          
          {/* Results Section */}
          <MobileCard className="p-4 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-emerald-200 dark:border-emerald-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold">Feeding Calculations</h2>
                  <p className="text-xs text-muted-foreground">Precise measurements for your {ratio} ratio</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                  <Label className="text-xs text-muted-foreground">Current Starter</Label>
                  <div className="font-mono text-xl font-bold text-emerald-600">{starterAmount}g</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                  <Label className="text-xs text-muted-foreground">Add Flour</Label>
                  <div className="font-mono text-xl font-bold text-amber-600">{flourAmount}g</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">{flourType.replace('-', ' ')}</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                  <Label className="text-xs text-muted-foreground">Add Water</Label>
                  <div className="font-mono text-xl font-bold text-blue-600">{waterAmount}g</div>
                  <div className="text-xs text-muted-foreground mt-1">Room temperature</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                  <Label className="text-xs text-muted-foreground">Total Result</Label>
                  <div className="font-mono text-xl font-bold text-primary">{totalAmount}g</div>
                  <div className="text-xs text-muted-foreground mt-1">Fed starter</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Info className="h-4 w-4 text-emerald-600" />
                <div className="text-sm">
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                    Expected yield: ~{Math.round(totalAmount * 0.8)}g active starter
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    After fermentation and gas production
                  </p>
                </div>
              </div>
            </div>
          </MobileCard>
          
          {/* Instructions */}
          <section className="space-y-3">
            <h2 className="font-semibold">Feeding Instructions</h2>
            
            <ol className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm">Discard all but {starterAmount}g of your starter.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm">Add {flourAmount}g of {flourType} flour to your starter.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm">Add {waterAmount}g of water (room temperature) and mix well.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-2">
                <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="text-sm">Cover loosely and let sit at room temperature for 8-12 hours.</p>
                </div>
              </li>
            </ol>
          </section>
          
          <Button 
            className="w-full" 
            onClick={addToFeedingLog}
            disabled={isAddingToLog}
          >
            {isAddingToLog ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding to Log...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Add to Feeding Log
              </>
            )}
          </Button>
        </div>
        
        {/* SEO Content Section */}
        <div className="space-y-8 mt-12">
          {/* Step-by-Step Instructions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">### How to Calculate Starter Feeding Ratios</h2>
            <ol className="list-decimal list-inside space-y-3">
              <li>**Choose your ratio** - Select 1:1:1 for daily maintenance, 1:2:2 for active baking</li>
              <li>**Weigh your starter** - Use a kitchen scale for precise measurements</li>
              <li>**Calculate ingredients** - Multiply starter weight by ratio numbers</li>
              <li>**Mix thoroughly** - Combine flour and water until no dry spots remain</li>
              <li>**Monitor fermentation** - Watch for doubling in 4-12 hours depending on temperature</li>
            </ol>
          </div>
          
          {/* Professional Applications */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Professional Feeding Strategies</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Home Baking Schedule</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Daily feeding: 1:1:1 ratio maintains consistent activity</li>
                  <li>Weekend baking: 1:2:2 ratio builds strength quickly</li>
                  <li>Vacation prep: 1:5:5 ratio extends feeding intervals</li>
                  <li>Storage feeding: Large ratios for refrigeration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Commercial Applications</h3>
                <ul className="list-disc list-inside text-sm space-y-2">
                  <li>Production scaling: Calculate ratios for large batches</li>
                  <li>Consistency management: Standardized feeding protocols</li>
                  <li>Cost optimization: Balance activity with ingredient use</li>
                  <li>Quality control: Monitor starter health metrics</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">### What is the best feeding ratio for sourdough starter?</h3>
                <p className="text-sm text-muted-foreground">
                  The best ratio depends on your usage: 1:1:1 for daily maintenance provides balanced nutrition, 
                  1:2:2 for active baking builds strength quickly, and 1:5:5 for storage extends time between feedings. 
                  Temperature and starter maturity also influence optimal ratios.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Should I use 1:1:1 or 1:2:2 feeding ratio?</h3>
                <p className="text-sm text-muted-foreground">
                  Use 1:1:1 for regular maintenance when baking once per week or less. Choose 1:2:2 when preparing 
                  for active baking, building starter strength, or in cooler temperatures. The 1:2:2 ratio provides 
                  more food and typically results in stronger fermentation activity.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### How do I calculate feeding amounts for different ratios?</h3>
                <p className="text-sm text-muted-foreground">
                  Multiply your starter weight by each ratio number. For 50g starter at 1:2:2 ratio: 50g starter + 
                  100g flour (50×2) + 100g water (50×2) = 250g total. Use our calculator above for automatic 
                  calculations with any ratio and starter amount.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">### Can I use different flour types with feeding ratios?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, all ratios work with different flours, but fermentation speed varies. Whole wheat and rye 
                  flours ferment faster due to higher enzyme activity, while all-purpose flour provides consistent 
                  results. Adjust timing expectations based on flour choice.
                </p>
              </div>
            </div>
          </div>
          
          {/* Related Tools */}
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Related Professional Tools</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/tools/hydration-converter" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Hydration Calculator</div>
                <div className="text-sm text-muted-foreground">Calculate water-to-flour ratios for dough</div>
              </a>
              <a href="/tools/timeline-calculator" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Timeline Calculator</div>
                <div className="text-sm text-muted-foreground">Plan feeding schedules with baking timeline</div>
              </a>
              <a href="/tools/recipe-validator" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Recipe Validator</div>
                <div className="text-sm text-muted-foreground">Analyze starter usage in bread recipes</div>
              </a>
              <a href="/tools/dough-temperature-calculator" className="block p-4 bg-white rounded border hover:shadow-sm transition-shadow">
                <div className="font-semibold">Temperature Calculator</div>
                <div className="text-sm text-muted-foreground">Optimize fermentation temperature</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
    </>
  );
}

export default StarterFeedingCalculatorPage;