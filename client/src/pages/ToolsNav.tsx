import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  Calculator, 
  Clock, 
  Scale, 
  AlertTriangle,
  ArrowLeft,
  Microscope
} from "lucide-react";

export default function ToolsNav() {
  const [, navigate] = useLocation();

  const tools = [
    {
      name: "Hydration Calculator",
      description: "Calculate precise water-to-flour ratios for optimal dough consistency",
      icon: Calculator,
      href: "/tools#hydration"
    },
    {
      name: "Timeline Calculator", 
      description: "Plan fermentation schedules working backward from desired bake time",
      icon: Clock,
      href: "/tools#timeline"
    },
    {
      name: "Baker's Percentages",
      description: "Convert baker's percentages to actual ingredient weights",
      icon: Scale,
      href: "/tools#ratios"
    },
    {
      name: "Troubleshooting Wizard",
      description: "Diagnose common bread issues with expert guidance",
      icon: AlertTriangle,
      href: "/tools#troubleshooting"
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/research")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research
        </Button>
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Calculation Tools</h1>
        </div>
      </div>

      <p className="text-muted-foreground mb-8">
        Professional-grade calculators for precise bread baking with scientific accuracy
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {tools.map((tool) => (
          <Card 
            key={tool.href}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(tool.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <tool.icon className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">{tool.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={() => navigate("/research-hub")}
          className="flex items-center gap-2 mx-auto"
        >
          <Microscope className="h-4 w-4" />
          Explore Research Hub
        </Button>
      </div>
    </div>
  );
}