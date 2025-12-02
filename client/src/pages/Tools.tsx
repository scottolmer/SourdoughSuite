import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Brain, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Zap, 
  Clock,
  MessageCircle,
  BookOpen,
  Settings,
  ArrowRight,
  Wrench,
  ArrowRightLeft,
  Calculator,
  Thermometer
} from "lucide-react";
import { SEO } from "@/components/SEO";

const AI_TOOLS = [
  {
    id: "ai-recipe-generator",
    title: "AI Recipe Generator",
    description: "Create personalized recipes using advanced AI technology that adapts to your preferences and skill level",
    icon: Sparkles,
    href: "/ai-recipe-generator",
    category: "Recipe Creation",
    difficulty: "All Levels",
    estimatedTime: "2-5 minutes",
    isNew: true,
    color: "blue"
  },

  {
    id: "ai-chat-assistant",
    title: "AI Baking Assistant",
    description: "Chat with our AI expert for instant answers, troubleshooting, and personalized baking advice",
    icon: MessageCircle,
    href: "/tools/chat",
    category: "Support",
    difficulty: "All Levels",
    estimatedTime: "Real-time",
    color: "purple"
  },
  {
    id: "ingredient-substitution",
    title: "Smart Ingredient Substitution",
    description: "AI-powered ingredient replacement suggestions that maintain recipe balance and flavor",
    icon: Zap,
    href: "/tools/ingredient-substitution",
    category: "Problem Solving",
    difficulty: "Intermediate",
    estimatedTime: "1-3 minutes",
    color: "orange"
  },
  {
    id: "baking-troubleshooter",
    title: "AI Troubleshooter",
    description: "Diagnose baking problems and get expert solutions powered by machine learning",
    icon: Wrench,
    href: "/tools/troubleshooter",
    category: "Problem Solving",
    difficulty: "All Levels",
    estimatedTime: "2-4 minutes",
    color: "red"
  },
  {
    id: "timeline-calculator",
    title: "Smart Timeline Calculator",
    description: "AI-optimized baking schedules that adapt to your availability and recipe requirements",
    icon: Clock,
    href: "/tools/timeline-calculator",
    category: "Planning",
    difficulty: "Beginner",
    estimatedTime: "3-5 minutes",
    color: "indigo"
  }
];

const TRADITIONAL_TOOLS = [
  {
    id: "recipe-validator",
    title: "Recipe Validator",
    description: "Analyze recipe ratios, hydration levels, and ingredient balance for optimal results",
    icon: CheckCircle,
    href: "/tools/recipe-validator",
    category: "Analysis",
    difficulty: "Intermediate",
    estimatedTime: "3-5 minutes"
  },
  {
    id: "bakers-calculator",
    title: "Baker's Calculator",
    description: "Convert baker's percentages and scale recipes up or down with precision",
    icon: Calculator,
    href: "/tools/bakers-calculator",
    category: "Calculation",
    difficulty: "Intermediate",
    estimatedTime: "2-4 minutes"
  },
  {
    id: "dough-temperature-calculator",
    title: "Dough Temperature Calculator",
    description: "Calculate optimal water temperature for perfect dough consistency",
    icon: Thermometer,
    href: "/tools/dough-temperature-calculator",
    category: "Calculation",
    difficulty: "Advanced",
    estimatedTime: "2-3 minutes"
  },
  {
    id: "starter-feeding-calculator",
    title: "Starter Feeding Calculator",
    description: "Calculate precise starter feeding ratios and schedules",
    icon: Calculator,
    href: "/tools/starter-feeding-calculator",
    category: "Sourdough",
    difficulty: "Beginner",
    estimatedTime: "2-3 minutes"
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between common baking measurements like ounces to grams, cups to milliliters",
    icon: ArrowRight,
    href: "/tools/converter",
    category: "Calculation",
    difficulty: "Beginner",
    estimatedTime: "1-2 minutes"
  }

];

function getColorClasses(color: string) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    green: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    purple: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
    orange: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
    red: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    indigo: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
  };
  return colors[color as keyof typeof colors] || colors.blue;
}

export default function Tools() {
  return (
    <MobileLayout title="AI Baking Tools">
      <SEO
        title="AI Baking Tools | Smart Recipe Creation & Baking Assistance"
        description="Comprehensive suite of AI-powered baking tools including recipe generators, content creators, troubleshooters, and intelligent assistants for all skill levels."
        keywords={['AI baking tools', 'recipe generator', 'baking assistant', 'smart kitchen tools', 'AI content generator', 'baking troubleshooter']}
      />
      
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 pb-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Baking Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Baking Tools</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Advanced AI technology that adapts to your skill level and helps you create perfect baked goods every time
          </p>
        </div>

        {/* AI-Powered Tools Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI-Powered Tools</h2>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {AI_TOOLS.map((tool) => (
              <Link key={tool.id} href={tool.href}>
                <div className="group">
                  <MobileCard className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border hover:border-primary/20 bg-gradient-to-br from-background to-muted/30">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl ${getColorClasses(tool.color)} shadow-sm`}>
                          <tool.icon className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col gap-1">
                          {tool.isNew && (
                            <Badge variant="default" className="bg-green-500 text-white text-xs font-medium">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-xl leading-tight">{tool.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            {tool.difficulty}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {tool.estimatedTime}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover:translate-x-2" />
                      </div>
                    </div>
                  </MobileCard>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Traditional Tools Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Traditional Tools</h2>
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              Manual Input
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {TRADITIONAL_TOOLS.map((tool) => (
              <Link key={tool.id} href={tool.href}>
                <MobileCard className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <tool.icon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {tool.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tool.estimatedTime}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-600 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </MobileCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Scientific Foundation Section */}
        <section className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-900 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Built on Scientific Research</h3>
            <p className="text-sm text-muted-foreground">
              Every calculator is backed by peer-reviewed studies. Explore the research behind our tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link href="/research">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Research
                </Button>
              </Link>
              <Link href="/tools/chat">
                <Button variant="outline" className="w-full sm:w-auto">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask Questions
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}