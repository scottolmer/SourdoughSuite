import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Calculator, 
  ClipboardCheck, 
  Clock, 
  MessageCircle, 
  Zap, 
  Wrench, 
  Users, 
  ArrowRightLeft, 
  Settings,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { generateOrganizationSchema } from "@/lib/schema";

// All available tools data
const ALL_TOOLS = [
  {
    id: "hydration-calculator",
    title: "Hydration Calculator",
    description: "Calculate precise water-to-flour ratios for optimal dough consistency",
    icon: Calculator,
    href: "/tools/hydration-converter",
    category: "Essential",
    color: "blue",
    featured: true
  },
  {
    id: "timeline-calculator", 
    title: "Timeline Calculator",
    description: "Plan perfect fermentation schedules with constraint-based timing",
    icon: Clock,
    href: "/tools/timeline-calculator", 
    category: "Essential",
    color: "green",
    featured: true
  },
  {
    id: "recipe-validator",
    title: "Recipe Success Predictor", 
    description: "Get realistic success probability based on hydration and your skill level",
    icon: ClipboardCheck,
    href: "/tools/recipe-validator",
    category: "Essential", 
    color: "purple",
    featured: true
  },
  {
    id: "bakers-calculator",
    title: "Baker's Calculator",
    description: "Convert baker's percentages and scale recipes up or down",
    icon: Settings,
    href: "/tools/bakers-calculator",
    category: "Essential",
    color: "orange",
    featured: true
  },
  {
    id: "scaling-calculator",
    title: "Recipe Scaling Calculator",
    description: "Scale recipes by weight or pan size while maintaining proper ratios",
    icon: Settings,
    href: "/tools/scaling-calculator",
    category: "Essential",
    color: "indigo",
    featured: true
  },
  {
    id: "professional-command-center",
    title: "Professional Baker's Command Center",
    description: "Advanced production management, batch tracking, and business analytics",
    icon: TrendingUp,
    href: "/professional-command-center",
    category: "Professional",
    color: "emerald",
    featured: true,
    badge: "NEW"
  },
  {
    id: "mobile-production",
    title: "Mobile Production Dashboard",
    description: "Quick batch updates and kitchen-friendly production tracking",
    icon: Users,
    href: "/mobile-production",
    category: "Professional",
    color: "slate",
    featured: false,
    badge: "MOBILE"
  },


  {
    id: "ingredient-substitution",
    title: "Ingredient Substitution",
    description: "Smart ingredient replacement suggestions that maintain recipe balance",
    icon: Zap,
    href: "/tools/ingredient-substitution",
    category: "Analysis",
    color: "orange", 
    featured: false
  },
  {
    id: "troubleshooter",
    title: "Baking Troubleshooter",
    description: "Diagnose baking problems and get expert solutions",
    icon: Wrench,
    href: "/tools/troubleshooter", 
    category: "Analysis",
    color: "red",
    featured: false
  },

  {
    id: "unit-converter",
    title: "Unit Converter", 
    description: "Convert between common baking measurements",
    icon: ArrowRightLeft,
    href: "/tools/converter",
    category: "Utilities",
    color: "gray",
    featured: false
  },
  {
    id: "dough-temperature-calculator",
    title: "Dough Temperature Calculator",
    description: "Calculate optimal dough temperature for perfect fermentation",
    icon: Calculator,
    href: "/tools/dough-temperature-calculator",
    category: "Advanced",
    color: "cyan",
    featured: false
  }
];

function getColorClasses(color: string) {
  const colors = {
    blue: { bg: "bg-blue-600", from: "from-blue-50", to: "to-blue-100", border: "border-blue-200", text: "text-blue-900", textLight: "text-blue-700" },
    green: { bg: "bg-green-600", from: "from-green-50", to: "to-green-100", border: "border-green-200", text: "text-green-900", textLight: "text-green-700" },
    purple: { bg: "bg-purple-600", from: "from-purple-50", to: "to-purple-100", border: "border-purple-200", text: "text-purple-900", textLight: "text-purple-700" },
    orange: { bg: "bg-orange-600", from: "from-orange-50", to: "to-orange-100", border: "border-orange-200", text: "text-orange-900", textLight: "text-orange-700" },
    indigo: { bg: "bg-indigo-600", from: "from-indigo-50", to: "to-indigo-100", border: "border-indigo-200", text: "text-indigo-900", textLight: "text-indigo-700" },
    red: { bg: "bg-red-600", from: "from-red-50", to: "to-red-100", border: "border-red-200", text: "text-red-900", textLight: "text-red-700" },
    emerald: { bg: "bg-emerald-600", from: "from-emerald-50", to: "to-emerald-100", border: "border-emerald-200", text: "text-emerald-900", textLight: "text-emerald-700" },
    gray: { bg: "bg-gray-600", from: "from-gray-50", to: "to-gray-100", border: "border-gray-200", text: "text-gray-900", textLight: "text-gray-700" },
    cyan: { bg: "bg-cyan-600", from: "from-cyan-50", to: "to-cyan-100", border: "border-cyan-200", text: "text-cyan-900", textLight: "text-cyan-700" }
  };
  return colors[color as keyof typeof colors] || colors.blue;
}

export function HomePage() {
  const allTools = ALL_TOOLS;

  return (
    <MobileLayout title="Professional Baking Tools">
      <SEO
        title="Professional Baking Tools | Sourdough Suite | Scientific Calculators"
        description="Complete suite of professional baking calculators and tools. Hydration calculator, timeline planner, recipe validator, and more for perfect results."
        keywords={['baking tools', 'hydration calculator', 'timeline calculator', 'recipe validator', 'professional baking tools', 'sourdough calculators', 'baking calculator suite', 'bread tools']}
        structuredData={generateOrganizationSchema()}
      />
      <div className="space-y-8">
        {/* Hero Section - Tools-First */}
        <section className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-6 lg:p-12 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm font-medium">
              Professional Tools
            </Badge>
          </div>
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6 text-center">
            Professional Baking Tools
          </h1>
          <p className="text-muted-foreground text-lg lg:text-xl xl:text-2xl max-w-3xl mx-auto mb-6 lg:mb-8 text-center">
            Complete suite of scientific calculators and tools for professional bakers. Get precise results every time.
          </p>
          <div className="flex justify-center">
            <Link href="/tools">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                View All Tools
              </Button>
            </Link>
          </div>
        </section>

        {/* Essential Tools - All Tools */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Essential Tools</h2>
            <p className="text-muted-foreground">Professional baking calculators and utilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTools.map((tool) => {
              const colorClasses = getColorClasses(tool.color);
              return (
                <Link key={tool.id} href={tool.href}>
                  <MobileCard className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <div className="p-4 space-y-3">
                      <div className={`${colorClasses.bg} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </MobileCard>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Get Started Section */}
        <section className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-900 rounded-lg p-6 lg:p-8 border border-green-200 dark:border-green-800">
          <div className="text-center space-y-4">
            <Calculator className="h-12 w-12 mx-auto text-green-600" />
            <h3 className="text-2xl font-bold">Ready to Improve Your Baking?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our tools are used by professional bakers and home enthusiasts worldwide. 
              Join thousands who've improved their bread with scientific precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/tools">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Start Calculating
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  View All Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Our Tools Work */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Why Our Tools Work</h2>
            <p className="text-muted-foreground">Built for precision and professional results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <TrendingUp className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Proven Results</h3>
              <p className="text-sm text-muted-foreground">
                Tested by professional bakers and trusted by commercial kitchens
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <Calculator className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Scientific Precision</h3>
              <p className="text-sm text-muted-foreground">
                Every calculation follows established bread science principles
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <CheckCircle className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Professional Grade</h3>
              <p className="text-sm text-muted-foreground">
                Designed for consistency and accuracy in commercial environments
              </p>
            </div>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}