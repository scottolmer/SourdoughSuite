import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Calculator, 
  Clock, 
  Scale, 
  AlertTriangle,
  Search,
  Microscope,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Menu
} from "lucide-react";
import { MobileGreeting } from "@/components/MobileGreeting";
import { MobileToolCard } from "@/components/MobileToolCard";
import { MobileTopicCard } from "@/components/MobileTopicCard";

interface Topic {
  id: number;
  name: string;
  description: string;
  slug: string;
  sourceCount: number;
  confidenceScore: number;
}

export default function MobileHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/research/topics"],
  });

  const quickTools = [
    {
      name: "Hydration Calculator",
      description: "Calculate precise water-to-flour ratios",
      icon: Calculator,
      href: "/mobile-tools#hydration",
      color: "bg-blue-500"
    },
    {
      name: "Fermentation Timeline", 
      description: "Plan fermentation schedules",
      icon: Clock,
      href: "/mobile-tools#timeline",
      color: "bg-green-500"
    },
    {
      name: "Baker's Percentages",
      description: "Convert ratios to ingredient weights",
      icon: Scale,
      href: "/mobile-tools#ratios",
      color: "bg-purple-500"
    },
    {
      name: "Troubleshooting Wizard",
      description: "Diagnose common bread issues",
      icon: AlertTriangle,
      href: "/mobile-tools#troubleshooting",
      color: "bg-orange-500"
    }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/mobile-research?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleToolClick = (href: string) => {
    navigate(href);
  };

  const handleTopicClick = (slug: string) => {
    navigate(`/mobile-research?topic=${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Microscope className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-semibold">Bakehouse Research</h1>
            </div>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search research & tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 text-sm"
              />
            </div>
            <Button onClick={handleSearch} size="sm">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Tools Section - Hidden per user request */}
        {/* <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quick Tools</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/mobile-tools")}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickTools.map((tool) => (
              <Card 
                key={tool.href}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleToolClick(tool.href)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold">50+</div>
              <div className="text-xs text-muted-foreground">Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold">{topics.length}</div>
              <div className="text-xs text-muted-foreground">Topics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calculator className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold">4</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Topics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="text-red-500">🔥</div>
              <span className="font-medium text-gray-900">Sourdough Troubleshooting</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="text-green-500">📈</div>
              <span className="font-medium text-gray-900">Temperature Control</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-yellow-500">⭐</div>
              <span className="font-medium text-gray-900">Beginner Guides</span>
            </div>
          </div>
        </div>

        {/* Research Topics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Research Topics</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/mobile-research")}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {topics.slice(0, 4).map((topic) => (
              <Card 
                key={topic.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTopicClick(topic.slug)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {topic.sourceCount} articles
                        </Badge>
                        <span className="text-xs text-muted-foreground">Updated</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => navigate("/mobile-research")}
          >
            <Microscope className="h-4 w-4" />
            Explore Research Hub
          </Button>
          <Button 
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => navigate("/mobile-tools")}
          >
            <Calculator className="h-4 w-4" />
            Open Calculator Tools
          </Button>
        </div>
      </div>
    </div>
  );
}