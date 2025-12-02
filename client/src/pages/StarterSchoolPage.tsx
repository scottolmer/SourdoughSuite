import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Beaker, 
  Clock, 
  Thermometer, 
  AlertTriangle, 
  BookOpen, 
  Calculator, 
  ClipboardCheck,
  TrendingUp,
  Zap,
  HelpCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";

export function StarterSchoolPage() {
  // Core starter care modules
  const coreModules = [
    {
      id: 1,
      title: "Getting Started",
      description: "Complete beginner's guide to creating and maintaining your first sourdough starter",
      icon: BookOpen,
      href: "/starter-school/getting-started",
      difficulty: "Beginner",
      duration: "15 min read",
      color: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600"
    },
    {
      id: 2,
      title: "Daily Care & Feeding",
      description: "Master the art of feeding schedules, ratios, and maintaining optimal starter health",
      icon: Clock,
      href: "/starter-school/daily-care",
      difficulty: "Beginner",
      duration: "20 min read",
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600"
    },
    {
      id: 3,
      title: "Temperature & Environment",
      description: "Understanding how temperature, humidity, and environment affect your starter",
      icon: Thermometer,
      href: "/starter-school/temperature-guide",
      difficulty: "Intermediate",
      duration: "25 min read",
      color: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-600"
    },
    {
      id: 4,
      title: "Troubleshooting Guide",
      description: "Solve common problems: liquid separation, mold, weak activity, and off odors",
      icon: AlertTriangle,
      href: "/starter-school/troubleshooting",
      difficulty: "All Levels",
      duration: "30 min read",
      color: "bg-red-50 dark:bg-red-950",
      iconColor: "text-red-600"
    }
  ];

  // Advanced techniques and tools
  const advancedModules = [
    {
      id: 5,
      title: "Feeding Calculator",
      description: "Calculate precise feeding ratios based on your starter's condition and needs",
      icon: Calculator,
      href: "/tools/feeding-calculator",
      type: "Tool",
      color: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600"
    },
    {
      id: 6,
      title: "Health Tracker",
      description: "Monitor starter activity, track feedings, and identify patterns",
      icon: TrendingUp,
      href: "/tools/starter-tracker",
      type: "Tool",
      color: "bg-indigo-50 dark:bg-indigo-950",
      iconColor: "text-indigo-600"
    },
    {
      id: 7,
      title: "Maintenance Schedule",
      description: "Create personalized feeding schedules based on your lifestyle",
      icon: ClipboardCheck,
      href: "/starter/schedule",
      type: "Tool",
      color: "bg-teal-50 dark:bg-teal-950",
      iconColor: "text-teal-600"
    },
    {
      id: 8,
      title: "Starter Selection Quiz",
      description: "Find the perfect starter type for your taste preferences and experience",
      icon: Beaker,
      href: "/starter-quiz",
      type: "Quiz",
      color: "bg-amber-50 dark:bg-amber-950",
      iconColor: "text-amber-600"
    }
  ];

  const starterTypes = [
    {
      name: "Classic Wheat",
      description: "Traditional all-purpose flour starter, perfect for beginners",
      difficulty: "Easy",
      flavor: "Mild, classic tang",
      href: "/starter-school/recipes/classic-wheat"
    },
    {
      name: "Whole Wheat",
      description: "Nutrient-rich with complex flavors and faster fermentation",
      difficulty: "Easy",
      flavor: "Nutty, earthy",
      href: "/starter-school/recipes/whole-wheat"
    },
    {
      name: "Rye Starter",
      description: "Fast-acting with distinctive flavor, great for dark breads",
      difficulty: "Intermediate",
      flavor: "Rich, slightly sour",
      href: "/starter-school/recipes/rye-starter"
    },
    {
      name: "Gluten Free",
      description: "Rice and alternative flour blends for gluten-free baking",
      difficulty: "Advanced",
      flavor: "Mild, slightly sweet",
      href: "/starter-school/recipes/gluten-free"
    }
  ];

  return (
    <MobileLayout title="Starter School" showBackButton>
      <SEO
        title="Starter School | Complete Sourdough Starter Care Guide | Bakehouse Breads"
        description="Master sourdough starter care with our comprehensive guide. Learn feeding, maintenance, troubleshooting, and advanced techniques for healthy, active starters."
        keywords={['sourdough starter care', 'starter feeding guide', 'sourdough maintenance', 'starter troubleshooting', 'sourdough education', 'starter health', 'fermentation guide', 'sourdough school']}
      />
      
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Expert Guidance
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Master Sourdough Starter Care
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Everything you need to know about creating, maintaining, and troubleshooting sourdough starters. 
            From beginner basics to advanced techniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/starter-school/getting-started">
              <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </Link>
            <Link href="/starter-school/hub">
              <Button variant="outline" className="w-full sm:w-auto">
                <Beaker className="h-4 w-4 mr-2" />
                Full Course Hub
              </Button>
            </Link>
          </div>
        </section>

        {/* Learning Path */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Core Learning Path</h2>
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Start Here
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Follow our structured learning path to become a sourdough starter expert
          </p>
          
          <div className="space-y-4">
            {coreModules.map((module, index) => (
              <Link key={module.id} href={module.href}>
                <MobileCard className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className={`p-2 rounded-lg ${module.color}`}>
                            <module.icon className={`h-5 w-5 ${module.iconColor}`} />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{module.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {module.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                          {module.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {module.duration}
                          </span>
                          <ArrowRight className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </MobileCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Tools & Advanced Techniques */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tools & Advanced Techniques</h2>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Interactive
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advancedModules.map((module) => (
              <Link key={module.id} href={module.href}>
                <MobileCard className="h-full cursor-pointer hover:shadow-lg transition-all duration-300">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${module.color} flex-shrink-0`}>
                        <module.icon className={`h-5 w-5 ${module.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{module.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {module.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </MobileCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Starter Types Guide */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Types of Starters</h2>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Reference
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {starterTypes.map((starter, index) => (
              <Link key={index} href={starter.href}>
                <MobileCard className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{starter.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {starter.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {starter.description}
                    </p>
                    <div className="text-xs text-amber-600 font-medium">
                      Flavor: {starter.flavor}
                    </div>
                    <div className="flex items-center text-xs text-blue-600 font-medium">
                      <span>View Recipe →</span>
                    </div>
                  </div>
                </MobileCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/starter-school/getting-started">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 text-center">
                <Zap className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <h3 className="font-medium text-sm mb-1">Start Fresh</h3>
                <p className="text-xs text-muted-foreground">Create from scratch</p>
              </MobileCard>
            </Link>
            
            <Link href="/starter-school/troubleshooting">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 text-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <h3 className="font-medium text-sm mb-1">Get Help</h3>
                <p className="text-xs text-muted-foreground">Solve problems</p>
              </MobileCard>
            </Link>
          </div>
        </section>

        {/* Starter FAQ Section */}
        <section className="rounded-lg bg-muted p-6 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Get answers to common starter questions and troubleshooting tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/faq">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <HelpCircle className="h-4 w-4 mr-2" />
                View All FAQs
              </Button>
            </Link>
            <Link href="/tools/feeding-calculator">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Calculator className="h-4 w-4 mr-2" />
                Feeding Calculator
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}