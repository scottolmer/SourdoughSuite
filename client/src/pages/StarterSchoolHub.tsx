import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileLayout } from "@/components/mobile-layout";
import { Link } from "wouter";
import { 
  BookOpen, 
  Calculator, 
  Clock, 
  Thermometer, 
  AlertTriangle, 
  Users, 
  Search, 
  Star,
  TrendingUp,
  HelpCircle,
  Beaker,
  ClipboardCheck,
  ArrowRight
} from "lucide-react";
import { SEO } from "@/components/SEO";

export function StarterSchoolHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Educational modules organized by category
  const essentialModules = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Complete beginner guide to creating your first sourdough starter',
      icon: BookOpen,
      href: '/starter-school/getting-started',
      difficulty: 'Beginner',
      duration: '15 min read',
      status: 'Essential',
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'daily-care',
      title: 'Daily Care & Feeding',
      description: 'Master feeding schedules, ratios, and maintenance routines',
      icon: Clock,
      href: '/starter-school/daily-care',
      difficulty: 'Beginner',
      duration: '20 min read',
      status: 'Essential',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      description: 'Solve common problems with expert guidance',
      icon: AlertTriangle,
      href: '/starter-school/troubleshooting',
      difficulty: 'All Levels',
      duration: '25 min read',
      status: 'Essential',
      color: 'bg-red-50 text-red-600'
    }
  ];

  const advancedModules = [
    {
      id: 'temperature-guide',
      title: 'Temperature & Environment',
      description: 'Understanding environmental factors for optimal fermentation',
      icon: Thermometer,
      href: '/starter-school/temperature-guide',
      difficulty: 'Intermediate',
      duration: '30 min read',
      status: 'Advanced',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      id: 'feeding-calculator',
      title: 'Feeding Calculator',
      description: 'Calculate precise feeding ratios for any situation',
      icon: Calculator,
      href: '/tools/feeding-calculator',
      difficulty: 'All Levels',
      duration: 'Interactive Tool',
      status: 'Tool',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'starter-quiz',
      title: 'Starter Selection Quiz',
      description: 'Find the perfect starter type for your needs',
      icon: Beaker,
      href: '/starter-quiz',
      difficulty: 'Beginner',
      duration: '5 min quiz',
      status: 'Quiz',
      color: 'bg-amber-50 text-amber-600'
    }
  ];

  const resourceModules = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Comprehensive answers to common starter questions',
      icon: HelpCircle,
      href: '/faq',
      difficulty: 'All Levels',
      duration: 'Reference',
      status: 'Reference',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'starter-tracker',
      title: 'Health Tracker',
      description: 'Monitor and track your starter\'s health over time',
      icon: TrendingUp,
      href: '/tools/starter-tracker',
      difficulty: 'Intermediate',
      duration: 'Interactive Tool',
      status: 'Tool',
      color: 'bg-teal-50 text-teal-600'
    },
    {
      id: 'maintenance-schedule',
      title: 'Maintenance Schedule',
      description: 'Create personalized feeding schedules',
      icon: ClipboardCheck,
      href: '/starter/schedule',
      difficulty: 'Intermediate',
      duration: 'Interactive Tool',
      status: 'Tool',
      color: 'bg-pink-50 text-pink-600'
    }
  ];

  const allModules = [...essentialModules, ...advancedModules, ...resourceModules];

  const filteredModules = allModules.filter(module => 
    !searchQuery || 
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Essential': return 'bg-green-100 text-green-700';
      case 'Advanced': return 'bg-orange-100 text-orange-700';
      case 'Tool': return 'bg-purple-100 text-purple-700';
      case 'Quiz': return 'bg-amber-100 text-amber-700';
      case 'Reference': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ModuleCard = ({ module }: { module: typeof essentialModules[0] }) => (
    <Link href={module.href}>
      <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${module.color} flex-shrink-0`}>
              <module.icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg leading-tight">{module.title}</h3>
                <Badge className={`text-xs ${getStatusColor(module.status)}`}>
                  {module.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                {module.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {module.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {module.duration}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <MobileLayout title="Master Starter Care" showBackButton>
      <SEO
        title="Starter School Hub | Complete Sourdough Education Center"
        description="Master sourdough starter care with our comprehensive educational hub. From beginner basics to advanced techniques, tools, and troubleshooting guides."
        keywords={['starter school', 'sourdough education', 'starter care', 'fermentation guide', 'sourdough learning']}
      />
      
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6 border border-amber-200 dark:border-amber-800">
          <div className="text-center">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full inline-block mb-4">
              <BookOpen className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Master Starter Care</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Your comprehensive guide to mastering sourdough starter care. From creating your first starter to advanced troubleshooting techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/starter-school/getting-started">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Start Learning
                </Button>
              </Link>
              <Link href="/starter-quiz">
                <Button variant="outline">
                  Take Quiz
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons, tools, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Learning Modules */}
        <Tabs defaultValue="essential" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="essential">Essential</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="essential" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-semibold">Essential Learning Path</h2>
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Start Here
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {essentialModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Advanced Techniques</h2>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Next Level
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Tools & Resources</h2>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Interactive
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourceModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Start Guide */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              New to Sourdough?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Follow our recommended learning path for the best experience:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-semibold text-xs">1</div>
                <span>Start with "Getting Started" to create your first starter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-semibold text-xs">2</div>
                <span>Learn "Daily Care & Feeding" for maintenance routines</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-semibold text-xs">3</div>
                <span>Use tools like the Feeding Calculator for precision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-semibold text-xs">4</div>
                <span>Reference the FAQ and Troubleshooting guides as needed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}