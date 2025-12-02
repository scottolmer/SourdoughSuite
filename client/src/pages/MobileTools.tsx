import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Calculator, 
  Clock, 
  Scale, 
  AlertTriangle, 
  ArrowLeft, 
  Share,
  Save,
  Bell
} from "lucide-react";

export default function MobileTools() {
  const [, navigate] = useLocation();
  
  // Hydration Calculator State
  const [flourWeight, setFlourWeight] = useState("500");
  const [hydrationPercentage, setHydrationPercentage] = useState("75");
  const [hydrationResult, setHydrationResult] = useState<{water: number, total: number} | null>(null);

  // Timeline Calculator State
  const [bakeTime, setBakeTime] = useState("8:00");
  const [roomTemp, setRoomTemp] = useState("72");
  const [starterActivity, setStarterActivity] = useState("3");
  const [timeline, setTimeline] = useState<Array<{step: string, time: string}>>([]);

  // Ratio Calculator State
  const [batchSize, setBatchSize] = useState("2");
  const [ratioResults, setRatioResults] = useState<{[key: string]: number} | null>(null);

  // Troubleshooting State
  const [selectedIssue, setSelectedIssue] = useState("");
  const [troubleshootingAdvice, setTroubleshootingAdvice] = useState("");

  // Hydration Calculator Logic
  const calculateHydration = () => {
    const flour = parseFloat(flourWeight);
    const hydration = parseFloat(hydrationPercentage);
    if (flour && hydration) {
      const water = (flour * hydration) / 100;
      const total = flour + water;
      setHydrationResult({ water: Math.round(water), total: Math.round(total) });
    }
  };

  // Timeline Calculator Logic
  const calculateTimeline = () => {
    const bakeHour = parseInt(bakeTime.split(':')[0]);
    const activity = parseInt(starterActivity);
    const temp = parseInt(roomTemp);
    
    // Adjust timing based on temperature and starter activity
    const tempAdjustment = (temp - 70) * 0.5; // Hours adjustment per degree
    const activityAdjustment = (5 - activity) * 2; // Hours adjustment for starter strength
    
    const totalTime = 12 + tempAdjustment + activityAdjustment;
    
    const steps = [
      { step: "Start mixing", time: formatTime(bakeHour - totalTime) },
      { step: "Begin bulk fermentation", time: formatTime(bakeHour - totalTime + 0.5) },
      { step: "Shape dough", time: formatTime(bakeHour - 9) },
      { step: "Final proof complete", time: formatTime(bakeHour - 0.5) },
      { step: "Begin baking", time: bakeTime + ":00" }
    ];
    
    setTimeline(steps);
  };

  const formatTime = (hour: number) => {
    const adjustedHour = ((hour % 24) + 24) % 24;
    const period = adjustedHour < 12 ? 'AM' : 'PM';
    const displayHour = adjustedHour === 0 ? 12 : adjustedHour > 12 ? adjustedHour - 12 : adjustedHour;
    return `${Math.floor(displayHour)}:${String(Math.round((adjustedHour % 1) * 60)).padStart(2, '0')} ${period}`;
  };

  // Ratio Calculator Logic
  const calculateRatios = () => {
    const loaves = parseInt(batchSize);
    const baseFlour = 400 * loaves; // 400g per loaf
    
    const results = {
      flour: baseFlour,
      water: Math.round(baseFlour * 0.75), // 75% hydration
      salt: Math.round(baseFlour * 0.02), // 2% salt
      starter: Math.round(baseFlour * 0.20), // 20% starter
    };
    
    results.total = results.flour + results.water + results.salt + results.starter;
    setRatioResults(results);
  };

  // Troubleshooting Logic
  const getTroubleshootingAdvice = () => {
    const advice = {
      "dense": "Dense loaves are usually under-fermented. Try: longer bulk fermentation, warmer temperature (78-82°F), or more active starter.",
      "no-rise": "Check starter activity, temperature, and timing. Ensure starter passes float test and fermentation environment is 75-80°F.",
      "too-sour": "Reduce fermentation time, use cooler temperatures, or adjust starter feeding ratio to reduce acidity.",
      "gummy": "Interior gumminess indicates under-baked bread. Bake until internal temperature reaches 205-210°F."
    };
    
    setTroubleshootingAdvice(advice[selectedIssue as keyof typeof advice] || "Select an issue to get troubleshooting advice.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/mobile")}
            className="p-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">Bread Tools</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <Tabs defaultValue="hydration" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="hydration" className="text-xs">
              <Calculator className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <Clock className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="ratios" className="text-xs">
              <Scale className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="text-xs">
              <AlertTriangle className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          {/* Hydration Calculator */}
          <TabsContent value="hydration">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Hydration Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flour">Flour Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="flour"
                      type="number"
                      value={flourWeight}
                      onChange={(e) => setFlourWeight(e.target.value)}
                      placeholder="500"
                    />
                    <Select defaultValue="grams">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">g</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hydration">Hydration %</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hydration"
                      type="number"
                      value={hydrationPercentage}
                      onChange={(e) => setHydrationPercentage(e.target.value)}
                      placeholder="75"
                    />
                    <div className="w-20 flex items-center justify-center text-sm text-muted-foreground">
                      %
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateHydration} className="flex-1">
                    Calculate
                  </Button>
                  <Button variant="outline" size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                {hydrationResult && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Results:</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Water Needed:</span>
                        <span className="font-medium">{hydrationResult.water}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Dough:</span>
                        <span className="font-medium">{hydrationResult.total}g</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Calculator */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                  Fermentation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bake-time">Target Bake Time</Label>
                  <Input
                    id="bake-time"
                    type="time"
                    value={bakeTime}
                    onChange={(e) => setBakeTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room-temp">Room Temperature</Label>
                  <div className="flex gap-2">
                    <Input
                      id="room-temp"
                      type="number"
                      value={roomTemp}
                      onChange={(e) => setRoomTemp(e.target.value)}
                      placeholder="72"
                    />
                    <div className="w-16 flex items-center justify-center text-sm text-muted-foreground">
                      °F
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Starter Activity</Label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setStarterActivity(level.toString())}
                        className={`w-8 h-8 rounded-full border-2 ${
                          parseInt(starterActivity) >= level 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={calculateTimeline} className="flex-1">
                    Calculate Timeline
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>

                {timeline.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Your Timeline:</h3>
                    <div className="space-y-2">
                      {timeline.map((step, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{step.step}:</span>
                          <span className="font-medium">{step.time}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      Set Reminders
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ratios Calculator */}
          <TabsContent value="ratios">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-purple-600" />
                  Baker's Percentages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Select value={batchSize} onValueChange={setBatchSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 loaf</SelectItem>
                      <SelectItem value="2">2 loaves</SelectItem>
                      <SelectItem value="3">3 loaves</SelectItem>
                      <SelectItem value="4">4 loaves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateRatios} className="w-full">
                  Calculate Ingredients
                </Button>

                {ratioResults && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Ingredients:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Flour: 100%</span>
                        <span className="font-medium">{ratioResults.flour}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water: 75%</span>
                        <span className="font-medium">{ratioResults.water}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salt: 2%</span>
                        <span className="font-medium">{ratioResults.salt}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Starter: 20%</span>
                        <span className="font-medium">{ratioResults.starter}g</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{ratioResults.total}g</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        Save Recipe
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Scale Recipe
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Bread Troubleshooter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>What's the issue?</Label>
                  <div className="space-y-2">
                    {[
                      { value: "dense", label: "Dense/heavy loaf" },
                      { value: "no-rise", label: "Didn't rise enough" },
                      { value: "too-sour", label: "Too sour/not sour enough" },
                      { value: "gummy", label: "Gummy interior" }
                    ].map((issue) => (
                      <button
                        key={issue.value}
                        onClick={() => setSelectedIssue(issue.value)}
                        className={`w-full p-3 text-left rounded-lg border ${
                          selectedIssue === issue.value 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {issue.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={getTroubleshootingAdvice} 
                  disabled={!selectedIssue}
                  className="w-full"
                >
                  Diagnose Problem
                </Button>

                {troubleshootingAdvice && selectedIssue && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Solution:</h3>
                    <p className="text-sm">{troubleshootingAdvice}</p>
                    <Button size="sm" variant="outline" className="w-full mt-3">
                      View Research
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}