import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Clock, 
  Thermometer, 
  Scale, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Beaker,
  Eye,
  Timer
} from "lucide-react";
import { SEO } from "@/components/SEO";

export function StarterDailyCare() {
  const feedingSchedules = [
    {
      frequency: "Daily (Active)",
      ratio: "1:1:1",
      description: "Equal parts starter, flour, and water",
      temp: "70-75°F",
      timing: "12 hours apart",
      bestFor: "Regular baking, peak activity"
    },
    {
      frequency: "Twice Daily (Very Active)",
      ratio: "1:2:2", 
      description: "1 part starter to 2 parts each flour and water",
      temp: "75-80°F",
      timing: "8-12 hours apart",
      bestFor: "Hot weather, very active starter"
    },
    {
      frequency: "Weekly (Maintenance)",
      ratio: "1:5:5",
      description: "Large feeding for refrigerated storage",
      temp: "Room temp, then fridge",
      timing: "Weekly",
      bestFor: "Occasional baking, storage"
    }
  ];

  const dailySteps = [
    {
      step: 1,
      title: "Observe & Assess",
      description: "Check starter's appearance, smell, and activity level",
      details: ["Look for bubbles and volume change", "Smell should be tangy, not putrid", "Note liquid separation (hooch)"],
      icon: Eye
    },
    {
      step: 2,
      title: "Discard Portion", 
      description: "Remove about half of your starter before feeding",
      details: ["Save discard for recipes", "Maintains manageable quantity", "Concentrates fresh nutrients"],
      icon: ArrowRight
    },
    {
      step: 3,
      title: "Weigh & Mix",
      description: "Add flour and water according to your ratio",
      details: ["Use kitchen scale for accuracy", "Mix thoroughly until no dry flour remains", "Scrape down sides of container"],
      icon: Scale
    },
    {
      step: 4,
      title: "Mark & Wait",
      description: "Mark the level and track doubling time",
      details: ["Use rubber band or tape to mark", "Note feeding time", "Observe peak activity"],
      icon: Timer
    }
  ];

  const healthIndicators = [
    {
      indicator: "Doubling in 4-8 hours",
      status: "healthy",
      description: "Consistent, predictable rise pattern"
    },
    {
      indicator: "Pleasant tangy aroma",
      status: "healthy", 
      description: "Acidic but not harsh or alcoholic"
    },
    {
      indicator: "Bubbly, active surface",
      status: "healthy",
      description: "Lots of small to medium bubbles"
    },
    {
      indicator: "Liquid on top (hooch)",
      status: "normal",
      description: "Sign starter is hungry, feed more often"
    },
    {
      indicator: "Slow rising (12+ hours)",
      status: "sluggish",
      description: "May need warmer temperature or fresh flour"
    },
    {
      indicator: "No activity after 24 hours",
      status: "inactive",
      description: "Likely needs temperature adjustment or revival"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'sluggish': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'inactive': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <MobileLayout title="Daily Care & Feeding" showBackButton>
      <SEO
        title="Daily Sourdough Starter Care Guide | Feeding Schedules & Maintenance | Bakehouse Breads"
        description="Master daily sourdough starter care with proper feeding ratios, schedules, and health monitoring. Learn to maintain an active, healthy starter."
        keywords={['sourdough starter feeding', 'starter maintenance', 'feeding schedule', 'starter care routine', 'sourdough ratios', 'starter health']}
      />
      
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Daily Routine
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Daily Care & Feeding
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Establish a consistent routine that keeps your starter healthy, active, and ready for baking. 
            Learn the feeding ratios and schedules that work for your lifestyle.
          </p>
        </section>

        {/* Feeding Schedules */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Feeding Schedules</h2>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Choose Your Rhythm
            </Badge>
          </div>
          
          <div className="space-y-4">
            {feedingSchedules.map((schedule, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{schedule.frequency}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {schedule.ratio}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {schedule.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span className="text-muted-foreground">{schedule.temp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span className="text-muted-foreground">{schedule.timing}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-primary">Best for:</p>
                      <p className="text-xs text-muted-foreground">{schedule.bestFor}</p>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Daily Routine Steps */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Daily Feeding Routine</h2>
          
          <div className="space-y-4">
            {dailySteps.map((step) => (
              <MobileCard key={step.step} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <ul className="space-y-1">
                      {step.details.map((detail, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Health Indicators */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Health Indicators</h2>
          </div>
          
          <div className="space-y-3">
            {healthIndicators.map((indicator, index) => (
              <MobileCard key={index} className={`p-4 border ${getStatusColor(indicator.status)}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{indicator.indicator}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs capitalize ${getStatusColor(indicator.status)}`}
                    >
                      {indicator.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{indicator.description}</p>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Quick Reference */}
        <section className="rounded-lg bg-muted p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Reference</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-background rounded-lg p-3">
              <h3 className="font-medium mb-2">Active Starter</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Feed daily</li>
                <li>• 1:1:1 ratio</li>
                <li>• Room temperature</li>
                <li>• Doubles in 4-8 hours</li>
              </ul>
            </div>
            
            <div className="bg-background rounded-lg p-3">
              <h3 className="font-medium mb-2">Maintenance</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Feed weekly</li>
                <li>• 1:5:5 ratio</li>
                <li>• Refrigerate</li>
                <li>• Activate before use</li>
              </ul>
            </div>
            
            <div className="bg-background rounded-lg p-3">
              <h3 className="font-medium mb-2">Signs to Feed</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Peaked and falling</li>
                <li>• Liquid on top</li>
                <li>• 8-12 hours since last feed</li>
                <li>• Tangy but not harsh</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/starter-school/temperature-guide">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Temperature & Environment</h3>
                    <p className="text-xs text-muted-foreground">Optimize conditions for your starter</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/tools/feeding-calculator">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Feeding Calculator</h3>
                    <p className="text-xs text-muted-foreground">Calculate precise ratios</p>
                  </div>
                  <Scale className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}