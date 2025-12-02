import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Calculator, 
  Clock, 
  FlaskConical, 
  Sparkles, 
  Timer, 
  Thermometer,
  Scale,
  ChevronUp,
  ChevronDown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuickTool {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'calculator' | 'generator' | 'tracker' | 'timer';
  isNew?: boolean;
  isPremium?: boolean;
}

const quickTools: QuickTool[] = [
  {
    id: 'recipe-generator',
    label: 'Recipe Generator',
    href: '/ai-recipe-generator',
    icon: Sparkles,
    description: 'Generate custom recipes with AI',
    category: 'generator',
    isNew: true
  },
  {
    id: 'timeline-calculator',
    label: 'Timeline',
    href: '/tools/timeline-calculator',
    icon: Clock,
    description: 'Calculate baking timeline',
    category: 'calculator'
  },
  {
    id: 'bakers-calculator',
    label: 'Baker\'s Calculator',
    href: '/tools/bakers-calculator',
    icon: Calculator,
    description: 'Convert measurements and ratios',
    category: 'calculator'
  },
  {
    id: 'dough-temp',
    label: 'Dough Temp',
    href: '/tools/dough-temperature-calculator',
    icon: Thermometer,
    description: 'Calculate ideal dough temperature',
    category: 'calculator'
  },
  {
    id: 'starter-quiz',
    label: 'Starter Quiz',
    href: '/starter/quiz',
    icon: FlaskConical,
    description: 'Find your perfect starter',
    category: 'generator'
  },
  {
    id: 'hydration-converter',
    label: 'Hydration',
    href: '/tools/hydration-converter',
    icon: Scale,
    description: 'Convert hydration percentages',
    category: 'calculator'
  }
];

interface QuickAccessToolbarProps {
  className?: string;
  variant?: 'floating' | 'embedded';
  showLabels?: boolean;
}

export function QuickAccessToolbar({ 
  className, 
  variant = 'floating', 
  showLabels = true 
}: QuickAccessToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (variant !== 'floating') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, variant]);

  if (variant === 'floating') {
    return (
      <TooltipProvider>
        <div className={cn(
          "fixed bottom-32 right-4 z-40 transition-all duration-300",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
          className
        )}>
          <Card className="p-2 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              {/* Toggle button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-10 w-10 p-0 hover:bg-amber-50"
              >
                <Zap className="h-4 w-4 text-amber-600" />
              </Button>

              {/* Expanded tools */}
              {isExpanded && (
                <div className="flex flex-col space-y-1">
                  {quickTools.slice(0, 4).map((tool) => (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <Link href={tool.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 hover:bg-amber-50 relative"
                          >
                            <tool.icon className="h-4 w-4 text-gray-600" />
                            {tool.isNew && (
                              <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-amber-500">
                                <span className="sr-only">New</span>
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="font-medium">{tool.label}</p>
                        <p className="text-xs text-gray-500">{tool.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  
                  <div className="border-t pt-1">
                    <Link href="/tools">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full text-xs text-amber-600 hover:bg-amber-50"
                      >
                        All Tools
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  // Embedded variant
  return (
    <div className={cn("w-full", className)}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900">Quick Tools</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        <div className={cn(
          "grid transition-all duration-300 overflow-hidden",
          isExpanded 
            ? "grid-rows-[1fr] opacity-100" 
            : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pb-3">
              {quickTools.map((tool) => (
                <Link key={tool.id} href={tool.href}>
                  <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="relative mb-2">
                      <tool.icon className="h-6 w-6 text-gray-600 group-hover:text-amber-600 transition-colors" />
                      {tool.isNew && (
                        <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-amber-500">
                          <span className="sr-only">New</span>
                        </Badge>
                      )}
                    </div>
                    {showLabels && (
                      <span className="text-xs font-medium text-center text-gray-700 group-hover:text-gray-900">
                        {tool.label}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {quickTools.slice(0, 3).map((tool) => (
                <Link key={tool.id} href={tool.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-amber-50"
                  >
                    <tool.icon className="h-4 w-4 text-gray-600" />
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-8 w-8 p-0 hover:bg-amber-50"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}