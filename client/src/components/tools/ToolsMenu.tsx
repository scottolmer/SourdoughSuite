import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, FileText, Clock, ChevronRight, Home, Thermometer, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolMenuProps {
  activeToolPath?: string;
  showAllTools?: boolean;
}

export default function ToolsMenu({ activeToolPath, showAllTools = true }: ToolMenuProps) {
  // All tools array
  const allTools = [
    {
      name: 'Baker\'s Calculator',
      description: 'Calculate baker\'s percentages',
      icon: Calculator,
      path: '/tools/bakers-calculator',
    },
    {
      name: 'Recipe Validator',
      description: 'Analyze recipes & get suggestions',
      icon: FileText,
      path: '/tools/recipe-validator',
    },
    {
      name: 'Timeline Calculator',
      description: 'Plan your baking schedule',
      icon: Clock,
      path: '/tools/timeline-calculator',
      disabled: false,
    },
    {
      name: 'Dough Temperature Calculator',
      description: 'Calculate ideal water temperature',
      icon: Thermometer,
      path: '/tools/dough-temperature-calculator',
      disabled: false,
    },
    {
      name: 'Hydration Converter',
      description: 'Convert hydration levels',
      icon: Droplet,
      path: '/tools/hydration-converter',
      disabled: false,
    },
    {
      name: 'Scaling Calculator',
      description: 'Scale recipes by weight or pan size',
      icon: Calculator,
      path: '/tools/scaling-calculator',
      disabled: false,
    },
    {
      name: 'Starter Feeding Calculator',
      description: 'Calculate starter feedings',
      icon: Calculator,
      path: '/tools/starter-feeding-calculator',
      disabled: false,
    },
  ];
  
  // Only show relevant tools depending on the context
  const tools = showAllTools ? allTools : [
    // Add a link back to main tools page
    {
      name: 'All Tools',
      description: 'Return to tools overview',
      icon: Home,
      path: '/tools',
    },
    // Only keep the tool that matches the active path
    ...allTools.filter(tool => tool.path === activeToolPath)
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-2">
        <div className="space-y-1 divide-y">
          {tools.map((tool) => {
            const Icon = tool.icon;
            
            return tool.disabled ? (
              <div
                key={tool.path}
                className="flex items-center justify-between p-2 rounded-md opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </div>
                <div className="text-xs bg-muted px-2 py-1 rounded">Coming soon</div>
              </div>
            ) : (
              <Link
                key={tool.path}
                href={tool.path}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md",
                    activeToolPath === tool.path
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted transition-colors"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}