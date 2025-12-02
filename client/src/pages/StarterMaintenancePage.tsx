import { useState, useEffect } from "react";
import { Link } from "wouter";
import { MobileLayout, MobileCard, MobileBottomSheet } from "@/components/mobile-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useStarters } from "@/hooks/use-starters";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  AlertTriangle, 
  Calendar, 
  Camera, 
  Clock, 
  HelpCircle,
  Loader2, 
  Plus, 
  RefreshCw, 
  ThumbsUp, 
  Thermometer,
  Wheat
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function StarterMaintenancePage() {
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<null | {
    status: "healthy" | "needs-attention" | "critical";
    advice: string[];
  }>(null);
  
  // Fetch starters using the custom hook
  const { data: starters, isLoading: isLoadingStarters, error: startersError } = useStarters();
  
  // Fetch FAQs
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadFaqs() {
      setIsLoadingFaqs(true);
      try {
        const response = await fetch('/api/faqs/category/sourdough');
        if (response.ok) {
          const data = await response.json();
          setFaqs(data);
        }
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setIsLoadingFaqs(false);
      }
    }
    
    loadFaqs();
  }, []);

  // Form state
  const [assessmentForm, setAssessmentForm] = useState({
    lastFed: "today",
    appearance: "",
    smell: "",
    bubbles: 5,
    temperature: 72,
    notes: ""
  });

  // Function to handle assessment submission
  const handleSubmitAssessment = () => {
    setIsSubmitting(true);
    
    // Simulate API call to n8n workflow
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Mock assessment result
      setAssessmentResult({
        status: "healthy",
        advice: [
          "Your starter is healthy and active.",
          "Continue with your current feeding schedule.",
          "Consider using it for baking within the next 24 hours for optimal performance.",
          "The bubble activity indicates good yeast development."
        ]
      });
    }, 2000);
  };
  
  // Removed handleSetFeedingReminder function - will be added back when native app support is ready

  // Create breadcrumbs for this page
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Starter', href: '/starter' },
    { label: 'Maintenance' } // Current page should not have href
  ];

  return (
    <MobileLayout 
      title="Starter Care" 
      showBackButton 
      backHref="/starter"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6">
          <h1 className="text-2xl font-bold mb-2">Starter Maintenance</h1>
          <p className="text-muted-foreground">
            Keep your sourdough starter healthy with expert care and advice
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <Link href="/starter/schedule">
            <MobileCard className="cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Log Feeding</h3>
                  <p className="text-sm text-muted-foreground">
                    Quickly record your starter feeding
                  </p>
                </div>
              </div>
            </MobileCard>
          </Link>
        
          <MobileCard
            onClick={() => setAssessmentOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Thermometer className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Starter Health Check</h3>
                <p className="text-sm text-muted-foreground">
                  Assess your starter's health and get personalized advice
                </p>
              </div>
            </div>
          </MobileCard>

          <Link href="/starter/calculator">
            <MobileCard className="cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Feeding Calculator</h3>
                  <p className="text-sm text-muted-foreground">
                    Calculate the perfect feeding ratios
                  </p>
                </div>
              </div>
            </MobileCard>
          </Link>
          
          {/* Coming Soon Notice for Feeding Reminders */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Feeding Reminders</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Coming soon in our mobile app! Set automated reminders for your feeding schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-4">
          <h2 className="text-xl font-semibold mb-3">Sourdough Starters</h2>
          
          <div className="space-y-4 mt-4">
            {/* Load starters dynamically from the API */}
            {isLoadingStarters ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading your starters...</p>
              </div>
            ) : startersError ? (
              <div className="text-center py-4 text-destructive">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                <p>Failed to load starters</p>
              </div>
            ) : starters && starters.length > 0 ? (
              starters.map((starter: any) => (
                <div key={starter.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{starter.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/starter/schedule?id=${starter.id}`}>
                      <Button size="sm" variant="default">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Log Feeding
                      </Button>
                    </Link>
                    <Link to={`/starter/feeding-calculator/${starter.id}`}>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Calculator
                      </Button>
                    </Link>
                    <Link to={`/starter/feeding-log/${starter.id}`}>
                      <Button size="sm" variant="secondary">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Feeding Log
                      </Button>
                    </Link>
                    <Link to={`/starter/health-log/${starter.id}`}>
                      <Button size="sm" variant="outline">
                        <Thermometer className="h-4 w-4 mr-1.5" />
                        Health Log
                      </Button>
                    </Link>
                    <Link to={`/starter/baking-log/${starter.id}`}>
                      <Button size="sm" variant="outline">
                        <Wheat className="h-4 w-4 mr-1.5" />
                        Baking Journal
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border rounded-lg">
                <p className="text-muted-foreground mb-3">No starters found.</p>
                <Link to="/starter/quiz">
                  <Button size="sm" variant="default">
                    Take Starter Quiz
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <Link to="/admin/faqs">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                <HelpCircle className="h-4 w-4 mr-1.5" />
                Manage FAQs
              </Button>
            </Link>
          </div>
          
          {isLoadingFaqs ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center p-6 border rounded-lg">
              <p className="text-muted-foreground">No FAQs available yet.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="border rounded-lg">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-amber-50/50 font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          {/* Display sample FAQs if no FAQs are loaded from the API */}
          {!isLoadingFaqs && faqs.length === 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Sample FAQs</h3>
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="sample-1">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-amber-50/50 font-medium">
                    How often should I feed my sourdough starter?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                    For an active starter that's kept at room temperature, feeding once or twice daily is ideal. 
                    If your starter is refrigerated, weekly feedings are sufficient. Always let refrigerated 
                    starters come to room temperature before feeding.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sample-2">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-amber-50/50 font-medium">
                    What's that liquid on top of my starter?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                    That's "hooch" - an alcohol byproduct from fermentation. It typically appears when a starter is 
                    hungry and indicates it's time for a feeding. You can either pour it off or stir it back in, 
                    which will give a more tangy flavor to your bread.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sample-3">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-amber-50/50 font-medium">
                    How do I know if my starter is ready to use?
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                    A mature starter should double in volume within 4-8 hours after feeding and be bubbly throughout. 
                    The float test is a good indicator: drop a small spoonful into water - if it floats, it's ready to use!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </section>
      </div>

      {/* Starter Assessment Bottom Sheet */}
      <MobileBottomSheet
        open={assessmentOpen}
        onOpenChange={setAssessmentOpen}
        title="Starter Health Check"
        description={assessmentResult ? "Assessment Results" : "Tell us about your starter's condition"}
      >
        {!assessmentResult ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="last-fed">When was your starter last fed?</Label>
              <RadioGroup
                value={assessmentForm.lastFed}
                onValueChange={(value) => setAssessmentForm({...assessmentForm, lastFed: value})}
                className="grid grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="today" id="today" className="peer sr-only" />
                  <Label
                    htmlFor="today"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Today
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="yesterday" id="yesterday" className="peer sr-only" />
                  <Label
                    htmlFor="yesterday"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Yesterday
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="older" id="older" className="peer sr-only" />
                  <Label
                    htmlFor="older"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Older
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Bubble Activity (1-10)</Label>
                <span className="text-sm text-muted-foreground">{assessmentForm.bubbles}/10</span>
              </div>
              <Slider
                value={[assessmentForm.bubbles]}
                onValueChange={(value) => setAssessmentForm({...assessmentForm, bubbles: value[0]})}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Few Bubbles</span>
                <span>Very Bubbly</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Room Temperature (°F)</Label>
                <span className="text-sm text-muted-foreground">{assessmentForm.temperature}°F</span>
              </div>
              <Slider
                value={[assessmentForm.temperature]}
                onValueChange={(value) => setAssessmentForm({...assessmentForm, temperature: value[0]})}
                min={60}
                max={85}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appearance">Appearance</Label>
              <Input
                id="appearance"
                placeholder="e.g. bubbly, flat, liquid on top..."
                value={assessmentForm.appearance}
                onChange={(e) => setAssessmentForm({...assessmentForm, appearance: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smell">Smell</Label>
              <Input
                id="smell"
                placeholder="e.g. fruity, yogurt-like, vinegary..."
                value={assessmentForm.smell}
                onChange={(e) => setAssessmentForm({...assessmentForm, smell: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other observations..."
                value={assessmentForm.notes}
                onChange={(e) => setAssessmentForm({...assessmentForm, notes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Add Photo (Optional)</Label>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Check Starter Health"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${
              assessmentResult.status === "healthy" 
                ? "bg-green-100 dark:bg-green-900/20" 
                : assessmentResult.status === "needs-attention"
                ? "bg-amber-100 dark:bg-amber-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}>
              <div className="flex items-center gap-3">
                {assessmentResult.status === "healthy" ? (
                  <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className={`h-5 w-5 ${
                    assessmentResult.status === "needs-attention"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`} />
                )}
                <div className="font-medium">
                  {assessmentResult.status === "healthy" 
                    ? "Your starter is healthy" 
                    : assessmentResult.status === "needs-attention"
                    ? "Your starter needs some attention"
                    : "Your starter needs immediate care"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Expert Recommendations:</h3>
              <ul className="space-y-2">
                {assessmentResult.advice.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                      <ThumbsUp className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm">{advice}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full">
              Schedule Next Feeding
            </Button>
          </div>
        )}
      </MobileBottomSheet>

      {/* Removed Feeding Reminder Bottom Sheet, will be added back when native app support is ready */}
    </MobileLayout>
  );
}