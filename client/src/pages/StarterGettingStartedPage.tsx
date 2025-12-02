import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Clock, 
  Thermometer, 
  Droplets, 
  Scale, 
  AlertCircle,
  CheckCircle,
  BookOpen,
  Beaker
} from "lucide-react";
import { SEO } from "@/components/SEO";

export function StarterGettingStartedPage() {
  const supplies = [
    { name: "Glass or plastic container", reason: "Non-reactive material that allows observation" },
    { name: "Kitchen scale", reason: "Accurate measurements are crucial for consistency" },
    { name: "Wooden or plastic spoon", reason: "Avoid metal which can react with acids" },
    { name: "Clean water", reason: "Filtered or dechlorinated water works best" },
    { name: "Flour (unbleached)", reason: "All-purpose or bread flour provides good results" }
  ];

  const dayByDayGuide = [
    {
      day: "Day 1",
      title: "The Beginning",
      description: "Mix equal parts flour and water (50g each) in your container. Stir well, cover loosely, leave at room temperature.",
      expectations: "No visible activity expected",
      temp: "70-75°F ideal"
    },
    {
      day: "Day 2-3",
      title: "First Signs",
      description: "Discard half, add 50g flour + 50g water. You may see small bubbles and smell slightly sweet.",
      expectations: "Light bubbling, pleasant aroma",
      temp: "Maintain consistent temperature"
    },
    {
      day: "Day 4-5",
      title: "Growth Phase",
      description: "Continue daily feedings. Starter should begin doubling in size within 4-8 hours of feeding.",
      expectations: "More bubbles, tangy smell developing",
      temp: "Starter becomes more responsive"
    },
    {
      day: "Day 6-7",
      title: "Maturation",
      description: "Starter should reliably double within 4-6 hours. Ready for baking when it passes the float test.",
      expectations: "Consistent rising, pleasant sour aroma",
      temp: "Ready for first bread"
    }
  ];

  const troubleTips = [
    {
      problem: "No activity after 3 days",
      solution: "Try warmer location (78-82°F) or switch to whole wheat flour"
    },
    {
      problem: "Liquid on top (hooch)",
      solution: "Normal! Stir in or pour off, then feed as usual"
    },
    {
      problem: "Mold (fuzzy spots)",
      solution: "Discard immediately and start over. Ensure clean utensils"
    },
    {
      problem: "Too sour smell",
      solution: "Feed more frequently or use less mature starter"
    }
  ];

  return (
    <MobileLayout title="Getting Started" showBackButton>
      <SEO
        title="How to Create a Sourdough Starter | Complete Beginner Guide | Bakehouse Breads"
        description="Learn to create your first sourdough starter from scratch. Complete 7-day guide with daily instructions, troubleshooting tips, and expert advice."
        keywords={['how to make sourdough starter', 'create sourdough starter', 'sourdough starter recipe', 'beginner sourdough guide', 'starter from scratch', 'wild yeast cultivation']}
      />
      
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Beginner Friendly
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Create Your First Sourdough Starter
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Master the ancient art of wild yeast cultivation. In just 7 days, you'll have a thriving 
            sourdough starter ready to create amazing bread.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span>7 days</span>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-green-600" />
              <span>70-75°F</span>
            </div>
            <div className="flex items-center gap-1">
              <Scale className="h-4 w-4 text-green-600" />
              <span>100g total</span>
            </div>
          </div>
        </section>

        {/* What You'll Need */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What You'll Need</h2>
          
          <div className="space-y-3">
            {supplies.map((supply, index) => (
              <MobileCard key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">{supply.name}</h3>
                    <p className="text-sm text-muted-foreground">{supply.reason}</p>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Day-by-Day Guide */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">7-Day Creation Process</h2>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Step by Step
            </Badge>
          </div>
          
          <div className="space-y-4">
            {dayByDayGuide.map((day, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{day.day}</h3>
                      <p className="text-sm font-medium text-blue-600">{day.title}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {day.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">{day.expectations}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-orange-500" />
                      <span className="text-muted-foreground">{day.temp}</span>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Key Recipe */}
        <section className="rounded-lg bg-muted p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Basic Feeding Recipe</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">50g</div>
              <div className="text-sm text-muted-foreground">Starter</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">50g</div>
              <div className="text-sm text-muted-foreground">Flour</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">50g</div>
              <div className="text-sm text-muted-foreground">Water</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This 1:1:1 ratio by weight is perfect for beginners. Always discard half before feeding.
          </p>
        </section>

        {/* Common Issues */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Common Issues & Solutions</h2>
          </div>
          
          <div className="space-y-3">
            {troubleTips.map((tip, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-orange-600">{tip.problem}</h3>
                  <p className="text-sm text-muted-foreground">{tip.solution}</p>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/starter-school/daily-care">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Daily Care & Feeding</h3>
                    <p className="text-xs text-muted-foreground">Learn maintenance routines</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/shop">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Buy Ready Starter</h3>
                    <p className="text-xs text-muted-foreground">Skip the wait, start baking</p>
                  </div>
                  <Beaker className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="rounded-lg bg-amber-50 dark:bg-amber-950 p-6 border border-amber-200 dark:border-amber-800">
          <h2 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">Pro Tips for Success</h2>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <li>• Use the same time each day for feedings to establish routine</li>
            <li>• Mark your container to track doubling progress</li>
            <li>• Keep a starter journal to track patterns and improvements</li>
            <li>• Room temperature matters more than exact timing</li>
            <li>• Trust the process - every starter develops at its own pace</li>
          </ul>
        </section>
      </div>
    </MobileLayout>
  );
}