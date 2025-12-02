import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Scale, AlertTriangle, ArrowLeft, Microscope } from "lucide-react";
import { useLocation } from "wouter";

export default function CalculatorTools() {
  const [, navigate] = useLocation();
  
  // Hydration Calculator State
  const [flourWeight, setFlourWeight] = useState("");
  const [waterWeight, setWaterWeight] = useState("");
  const [hydrationResult, setHydrationResult] = useState<number | null>(null);

  // Timeline Calculator State
  const [targetBakeTime, setTargetBakeTime] = useState("");
  const [fermentationHours, setFermentationHours] = useState("12");
  const [timelineSteps, setTimelineSteps] = useState<Array<{step: string, time: string}>>([]);

  // Ratio Calculator State
  const [totalFlour, setTotalFlour] = useState("");
  const [saltPercentage, setSaltPercentage] = useState("2");
  const [starterPercentage, setStarterPercentage] = useState("20");
  const [ratioResults, setRatioResults] = useState<{[key: string]: number} | null>(null);

  // Troubleshooting State
  const [selectedIssue, setSelectedIssue] = useState("");
  const [troubleshootingAdvice, setTroubleshootingAdvice] = useState("");

  // Hydration Calculator Logic
  const calculateHydration = () => {
    const flour = parseFloat(flourWeight);
    const water = parseFloat(waterWeight);
    if (flour && water) {
      const hydration = (water / flour) * 100;
      setHydrationResult(Math.round(hydration * 10) / 10);
    }
  };

  const calculateWaterFromHydration = (targetHydration: number) => {
    const flour = parseFloat(flourWeight);
    if (flour) {
      const water = (flour * targetHydration) / 100;
      setWaterWeight(water.toString());
      setHydrationResult(targetHydration);
    }
  };

  // Timeline Calculator Logic
  const calculateTimeline = () => {
    if (!targetBakeTime) return;
    
    const bakeTime = new Date(`2024-01-01T${targetBakeTime}`);
    const fermentHours = parseInt(fermentationHours);
    
    const steps = [
      { 
        step: "Final Shaping", 
        time: new Date(bakeTime.getTime() - 2 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      },
      { 
        step: "Final Fermentation Ends", 
        time: new Date(bakeTime.getTime() - 1 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      },
      { 
        step: "Bulk Fermentation Ends", 
        time: new Date(bakeTime.getTime() - 3 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      },
      { 
        step: "Mix Dough", 
        time: new Date(bakeTime.getTime() - (fermentHours + 3) * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      },
      { 
        step: "Feed Starter", 
        time: new Date(bakeTime.getTime() - (fermentHours + 8) * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    ];
    
    setTimelineSteps(steps);
  };

  // Ratio Calculator Logic
  const calculateRatios = () => {
    const flour = parseFloat(totalFlour);
    const salt = parseFloat(saltPercentage);
    const starter = parseFloat(starterPercentage);
    
    if (flour) {
      const results = {
        flour: flour,
        water: flour * 0.75, // 75% hydration default
        salt: flour * (salt / 100),
        starter: flour * (starter / 100),
        total: flour * (1 + 0.75 + salt/100 + starter/100)
      };
      setRatioResults(results);
    }
  };

  // Troubleshooting Logic
  const getTroubleshootingAdvice = (issue: string) => {
    const advice = {
      "dense-bread": "Dense bread is often caused by insufficient fermentation, over-proofing, or weak starter. Check your starter activity and extend bulk fermentation time.",
      "flat-bread": "Flat bread typically results from weak gluten development or over-proofing. Increase mixing time and monitor proofing carefully.",
      "gummy-crumb": "Gummy texture indicates the bread was cut too soon or under-baked. Let bread cool completely (2+ hours) before slicing.",
      "no-oven-spring": "Poor oven spring suggests weak starter, insufficient steam, or incorrect shaping. Ensure your starter is active and create steam in the oven.",
      "sour-taste": "Overly sour bread results from extended fermentation at warm temperatures. Reduce fermentation time or use cooler temperatures."
    };
    
    setTroubleshootingAdvice(advice[issue as keyof typeof advice] || "Select an issue to get troubleshooting advice.");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/research")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research
        </Button>
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Bread Science Calculator Tools</h1>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Professional-grade calculators for precise bread baking with scientific accuracy
      </p>

      <Tabs defaultValue="hydration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hydration">
            <Calculator className="h-4 w-4 mr-2" />
            Hydration
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="ratios">
            <Scale className="h-4 w-4 mr-2" />
            Ratios
          </TabsTrigger>
          <TabsTrigger value="troubleshooting">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Troubleshooting
          </TabsTrigger>
        </TabsList>

        {/* Hydration Calculator */}
        <TabsContent value="hydration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hydration Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="flour">Flour Weight (g)</Label>
                  <Input
                    id="flour"
                    type="number"
                    value={flourWeight}
                    onChange={(e) => setFlourWeight(e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="water">Water Weight (g)</Label>
                  <Input
                    id="water"
                    type="number"
                    value={waterWeight}
                    onChange={(e) => setWaterWeight(e.target.value)}
                    placeholder="375"
                  />
                </div>
              </div>
              
              <Button onClick={calculateHydration} className="w-full">
                Calculate Hydration
              </Button>
              
              {hydrationResult && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg p-3">
                    {hydrationResult}% Hydration
                  </Badge>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => calculateWaterFromHydration(65)}>
                  65% Hydration
                </Button>
                <Button variant="outline" size="sm" onClick={() => calculateWaterFromHydration(75)}>
                  75% Hydration
                </Button>
                <Button variant="outline" size="sm" onClick={() => calculateWaterFromHydration(85)}>
                  85% Hydration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Calculator */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fermentation Timeline Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bake-time">Target Bake Time</Label>
                  <Input
                    id="bake-time"
                    type="time"
                    value={targetBakeTime}
                    onChange={(e) => setTargetBakeTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fermentation">Bulk Fermentation (hours)</Label>
                  <Select value={fermentationHours} onValueChange={setFermentationHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="16">16 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={calculateTimeline} className="w-full">
                Calculate Timeline
              </Button>
              
              {timelineSteps.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Baking Schedule:</h3>
                  {timelineSteps.map((step, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{step.step}</span>
                      <Badge variant="outline">{step.time}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ratio Calculator */}
        <TabsContent value="ratios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Baker's Percentage Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="total-flour">Total Flour (g)</Label>
                  <Input
                    id="total-flour"
                    type="number"
                    value={totalFlour}
                    onChange={(e) => setTotalFlour(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="salt-percent">Salt %</Label>
                  <Input
                    id="salt-percent"
                    type="number"
                    value={saltPercentage}
                    onChange={(e) => setSaltPercentage(e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label htmlFor="starter-percent">Starter %</Label>
                  <Input
                    id="starter-percent"
                    type="number"
                    value={starterPercentage}
                    onChange={(e) => setStarterPercentage(e.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>
              
              <Button onClick={calculateRatios} className="w-full">
                Calculate Ingredients
              </Button>
              
              {ratioResults && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Ingredient Weights:</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Flour:</span>
                        <span>{ratioResults.flour}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water:</span>
                        <span>{ratioResults.water}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salt:</span>
                        <span>{ratioResults.salt}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Starter:</span>
                        <span>{ratioResults.starter}g</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total:</span>
                        <span>{ratioResults.total}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Wizard */}
        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bread Troubleshooting Wizard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="issue">Select Issue</Label>
                <Select value={selectedIssue} onValueChange={(value) => {
                  setSelectedIssue(value);
                  getTroubleshootingAdvice(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a common bread issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dense-bread">Dense, Heavy Bread</SelectItem>
                    <SelectItem value="flat-bread">Flat, No Rise</SelectItem>
                    <SelectItem value="gummy-crumb">Gummy Interior</SelectItem>
                    <SelectItem value="no-oven-spring">No Oven Spring</SelectItem>
                    <SelectItem value="sour-taste">Too Sour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {troubleshootingAdvice && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Troubleshooting Advice:</h3>
                  <p className="text-sm">{troubleshootingAdvice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-8">
        <Button 
          onClick={() => navigate("/research-hub")}
          className="flex items-center gap-2 mx-auto"
        >
          <Microscope className="h-4 w-4" />
          Explore Research Hub
        </Button>
      </div>
    </div>
  );
}