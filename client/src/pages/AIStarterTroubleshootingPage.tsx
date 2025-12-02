import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, AlertTriangle, CheckCircle, Clock, 
  Thermometer, FlaskConical, Lightbulb, 
  TrendingUp, Sparkles, HelpCircle
} from "lucide-react";
import { SEO } from '@/components/SEO';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TroubleshootingResult {
  diagnosis: string;
  solutions: string[];
  preventionTips: string[];
  timelineExpectation: string;
}

export default function AIStarterTroubleshootingPage() {
  const { toast } = useToast();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [starterAge, setStarterAge] = useState<string>('');
  const [feedingSchedule, setFeedingSchedule] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [flourType, setFlourType] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');

  const symptoms = [
    { id: 'no-rise', label: 'Not rising or doubling', category: 'activity' },
    { id: 'slow-rise', label: 'Very slow rise (over 12 hours)', category: 'activity' },
    { id: 'liquid-layer', label: 'Liquid layer on top (hooch)', category: 'appearance' },
    { id: 'mold', label: 'Fuzzy mold growth', category: 'appearance' },
    { id: 'bad-smell', label: 'Unpleasant or putrid smell', category: 'smell' },
    { id: 'vinegar-smell', label: 'Very strong vinegar smell', category: 'smell' },
    { id: 'no-smell', label: 'No smell at all', category: 'smell' },
    { id: 'separation', label: 'Watery separation', category: 'consistency' },
    { id: 'too-thick', label: 'Very thick or stiff', category: 'consistency' },
    { id: 'bubbles-gone', label: 'Used to bubble but stopped', category: 'activity' },
    { id: 'pink-tint', label: 'Pink or orange discoloration', category: 'appearance' },
    { id: 'inconsistent', label: 'Inconsistent performance', category: 'activity' }
  ];

  const troubleshootMutation = useMutation({
    mutationFn: async (issueData: {
      symptoms: string[];
      starterAge: string;
      feedingSchedule: string;
      environment: string;
      flourType: string;
      additionalDetails?: string;
    }) => {
      return apiRequest('/api/ai/troubleshoot-starter', {
        method: 'POST',
        body: JSON.stringify(issueData)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "AI diagnosis and solutions generated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze starter issues. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    if (checked) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    } else {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));
    }
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one symptom.",
        variant: "destructive"
      });
      return;
    }

    if (!starterAge || !feedingSchedule || !environment || !flourType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const issueData = {
      symptoms: selectedSymptoms.map(id => symptoms.find(s => s.id === id)?.label || id),
      starterAge,
      feedingSchedule,
      environment,
      flourType,
      additionalDetails: additionalDetails.trim() || undefined
    };

    troubleshootMutation.mutate(issueData);
  };

  const groupedSymptoms = symptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, typeof symptoms>);

  const categoryLabels = {
    activity: 'Activity Issues',
    appearance: 'Visual Problems',
    smell: 'Odor Concerns', 
    consistency: 'Texture Issues'
  };

  const result = troubleshootMutation.data as TroubleshootingResult | undefined;

  return (
    <MobileLayout 
      title="AI Starter Doctor" 
      showBackButton 
      backHref="/starters"
    >
      <SEO
        title="AI Starter Troubleshooting | Bakehouse Breads"
        description="Get expert AI-powered diagnosis and solutions for your sourdough starter problems. Instant troubleshooting for common starter issues."
        canonicalUrl="/ai-troubleshooting"
        keywords={[
          'sourdough starter troubleshooting',
          'starter problems',
          'AI diagnosis',
          'starter not rising',
          'starter maintenance'
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Starters", url: "/starters" },
          { name: "AI Troubleshooting", url: "/ai-troubleshooting" }
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              AI Starter Doctor
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Describe your starter's symptoms and get expert AI-powered diagnosis and solutions using advanced ChatGPT analysis.
            </p>
          </CardHeader>
        </Card>

        {!result ? (
          <>
            {/* Symptoms Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  What symptoms are you observing?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select all symptoms that describe your starter's current condition.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm mb-2 text-blue-700">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {categorySymptoms.map((symptom) => (
                        <div key={symptom.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom.id}
                            checked={selectedSymptoms.includes(symptom.id)}
                            onCheckedChange={(checked) => 
                              handleSymptomChange(symptom.id, !!checked)
                            }
                          />
                          <Label 
                            htmlFor={symptom.id} 
                            className="text-sm cursor-pointer"
                          >
                            {symptom.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Starter Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-green-600" />
                  Starter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Starter Age</Label>
                  <RadioGroup value={starterAge} onValueChange={setStarterAge}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new">Less than 2 weeks old</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="young" id="young" />
                      <Label htmlFor="young">2 weeks to 2 months</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mature" id="mature" />
                      <Label htmlFor="mature">2+ months old</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="old" id="old" />
                      <Label htmlFor="old">Over 1 year old</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium">Feeding Schedule</Label>
                  <RadioGroup value={feedingSchedule} onValueChange={setFeedingSchedule}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Once daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="twice-daily" id="twice-daily" />
                      <Label htmlFor="twice-daily">Twice daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly (refrigerated)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="irregular" id="irregular" />
                      <Label htmlFor="irregular">Irregular/forgotten</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium">Environment</Label>
                  <RadioGroup value={environment} onValueChange={setEnvironment}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cold" id="cold" />
                      <Label htmlFor="cold">Cold (below 70°F/21°C)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="room" id="room" />
                      <Label htmlFor="room">Room temperature (70-75°F/21-24°C)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="warm" id="warm" />
                      <Label htmlFor="warm">Warm (75-80°F/24-27°C)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hot" id="hot" />
                      <Label htmlFor="hot">Hot (above 80°F/27°C)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium">Flour Type</Label>
                  <RadioGroup value={flourType} onValueChange={setFlourType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="white" id="white" />
                      <Label htmlFor="white">All-purpose or bread flour</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whole-wheat" id="whole-wheat" />
                      <Label htmlFor="whole-wheat">Whole wheat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rye" id="rye" />
                      <Label htmlFor="rye">Rye flour</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mixed flours</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="details" className="text-sm font-medium">
                    Additional Details (Optional)
                  </Label>
                  <Textarea
                    id="details"
                    placeholder="Any other observations or recent changes in your routine..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={troubleshootMutation.isPending || selectedSymptoms.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {troubleshootMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Diagnosis
                </>
              )}
            </Button>
          </>
        ) : (
          /* Results Display */
          <div className="space-y-4">
            {/* Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-red-600" />
                  AI Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{result.diagnosis}</p>
              </CardContent>
            </Card>

            {/* Solutions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recommended Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.solutions.map((solution, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{solution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prevention Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Prevention Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.preventionTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Expected Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.timelineExpectation}</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSymptoms([]);
                  setStarterAge('');
                  setFeedingSchedule('');
                  setEnvironment('');
                  setFlourType('');
                  setAdditionalDetails('');
                  troubleshootMutation.reset();
                }}
              >
                New Analysis
              </Button>
              <Button variant="outline">
                Share Results
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}