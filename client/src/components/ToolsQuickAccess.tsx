import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Calculator, Clock, Scale, Wrench } from "lucide-react";

interface ToolsQuickAccessProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ToolsQuickAccess({ 
  title = "Quick Tools", 
  description = "Jump to commonly used calculators",
  compact = false 
}: ToolsQuickAccessProps) {
  const tools = [
    {
      name: "Hydration Calculator",
      href: "/tools/hydration-calculator",
      icon: Calculator,
      color: "bg-blue-500",
      description: "Water-to-flour ratios"
    },
    {
      name: "Timeline Calculator", 
      href: "/tools/timeline-calculator",
      icon: Clock,
      color: "bg-green-500",
      description: "Fermentation schedules"
    },
    {
      name: "Recipe Validator",
      href: "/tools/recipe-validator", 
      icon: Scale,
      color: "bg-purple-500",
      description: "Scientific validation"
    },
    {
      name: "All Tools",
      href: "/tools",
      icon: Wrench,
      color: "bg-orange-500", 
      description: "Complete toolbox"
    }
  ];

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {tools.map((tool) => (
          <Link key={tool.name} href={tool.href}>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <tool.icon className="h-4 w-4" />
              {tool.name}
            </Button>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href}>
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
              >
                <div className={`${tool.color} p-2 rounded-lg text-white`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}