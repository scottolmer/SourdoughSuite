import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Thermometer,
  Clock,
  Droplets,
  Eye,
  Zap,
  RefreshCw
} from "lucide-react";
import { SEO } from "@/components/SEO";

export function StarterTroubleshooting() {
  const commonProblems = [
    {
      problem: "No Activity After 3+ Days",
      severity: "high",
      symptoms: ["No bubbles", "No rise", "No smell change"],
      causes: [
        "Temperature too cold (below 65°F)",
        "Chlorinated water killing microbes",
        "Old or treated flour lacking nutrients",
        "Container too small or tight lid"
      ],
      solutions: [
        "Move to warmer location (75-80°F)",
        "Switch to filtered or bottled water",
        "Try whole wheat or rye flour boost",
        "Use larger container, loose covering",
        "Add pinch of organic fruit skin for wild yeast"
      ]
    },
    {
      problem: "Mold Growth",
      severity: "critical",
      symptoms: ["Fuzzy spots (white, green, black)", "Unusual colors", "Musty smell"],
      causes: [
        "Contaminated utensils or container",
        "Too humid environment",
        "Irregular feeding schedule",
        "Temperature fluctuations"
      ],
      solutions: [
        "DISCARD ENTIRE STARTER - start fresh",
        "Sterilize all equipment with boiling water",
        "Ensure consistent feeding schedule",
        "Keep in drier location",
        "Always use clean utensils"
      ]
    },
    {
      problem: "Liquid Separation (Hooch)",
      severity: "low",
      symptoms: ["Dark liquid on top", "Alcohol smell", "Starter deflated"],
      causes: [
        "Starter is hungry and needs feeding",
        "Too long between feedings",
        "High hydration ratio",
        "Warm temperatures accelerating fermentation"
      ],
      solutions: [
        "Stir hooch back in or pour off (both OK)",
        "Feed immediately with regular ratio",
        "Increase feeding frequency",
        "Move to slightly cooler location",
        "Reduce hydration if persistent"
      ]
    },
    {
      problem: "Too Sour/Acidic",
      severity: "medium",
      symptoms: ["Harsh, vinegar-like smell", "Very tangy taste", "Bread too sour"],
      causes: [
        "Over-fermentation between feedings",
        "Too warm temperature",
        "High hydration promoting acetic acid",
        "Old starter with accumulated acids"
      ],
      solutions: [
        "Feed more frequently (twice daily)",
        "Move to cooler location (68-72°F)",
        "Use stiffer feeding ratio (1:2:1.5)",
        "Discard more starter before feeding",
        "Feed with fresh flour to dilute acids"
      ]
    },
    {
      problem: "Slow Rising",
      severity: "medium",
      symptoms: ["Takes 12+ hours to double", "Weak bubbling", "Dense texture"],
      causes: [
        "Temperature too cool",
        "Weak yeast population",
        "Poor flour quality",
        "Inconsistent feeding schedule"
      ],
      solutions: [
        "Increase temperature to 75-80°F",
        "Feed more frequently to strengthen",
        "Switch to unbleached bread flour",
        "Maintain consistent feeding times",
        "Add whole grain flour boost"
      ]
    },
    {
      problem: "Strange Smells",
      severity: "medium",
      symptoms: ["Acetone/nail polish smell", "Rotten egg odor", "Overly yeasty smell"],
      causes: [
        "Acetone: over-fermentation, too acidic",
        "Sulfur: bacterial imbalance",
        "Yeasty: normal but may indicate imbalance"
      ],
      solutions: [
        "For acetone: feed more often, cooler temp",
        "For sulfur: discard more, fresh flour feeding",
        "For yeasty: normal, continue regular feeding",
        "Maintain consistent schedule",
        "Check water quality"
      ]
    }
  ];

  const preventionTips = [
    {
      category: "Cleanliness",
      tips: [
        "Always use clean utensils and containers",
        "Wash hands thoroughly before handling",
        "Sterilize equipment weekly with boiling water",
        "Keep feeding area clean and organized"
      ]
    },
    {
      category: "Consistency",
      tips: [
        "Feed at the same time each day",
        "Use the same flour type when possible",
        "Maintain consistent ratios by weight",
        "Keep starter in the same location"
      ]
    },
    {
      category: "Environment",
      tips: [
        "Monitor temperature regularly",
        "Avoid drafty or temperature-fluctuating areas",
        "Use filtered water if tap water is chlorinated",
        "Cover loosely to allow gas exchange"
      ]
    }
  ];

  const revivalProtocol = [
    {
      step: 1,
      title: "Assess the Damage",
      description: "Check for mold, unusual colors, or extremely off smells",
      action: "If mold present, discard completely and start over"
    },
    {
      step: 2,
      title: "Remove Hooch",
      description: "Pour off any liquid separation on top",
      action: "Stir and discard top layer if discolored"
    },
    {
      step: 3,
      title: "Small Revival Feed",
      description: "Take 50g healthy starter from bottom",
      action: "Feed with 50g flour + 50g water"
    },
    {
      step: 4,
      title: "Warm Recovery",
      description: "Place in 75-80°F location",
      action: "Feed every 12 hours until actively doubling"
    },
    {
      step: 5,
      title: "Return to Normal",
      description: "Once consistently active, resume regular schedule",
      action: "Gradually return to preferred feeding routine"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <MobileLayout title="Troubleshooting Guide" showBackButton>
      <SEO
        title="Sourdough Starter Troubleshooting Guide | Common Problems & Solutions | Bakehouse Breads"
        description="Solve sourdough starter problems with our comprehensive troubleshooting guide. From mold to slow rising, get expert solutions for healthy starters."
        keywords={['sourdough starter problems', 'starter troubleshooting', 'starter mold', 'starter not rising', 'sourdough issues', 'starter revival']}
      />
      
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-900 p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              Problem Solver
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Troubleshooting Guide
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Every starter faces challenges. Learn to identify problems early and apply proven solutions 
            to get your starter back to peak health.
          </p>
        </section>

        {/* Common Problems */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Common Problems & Solutions</h2>
            <Badge variant="outline" className="text-red-600 border-red-600">
              Expert Solutions
            </Badge>
          </div>
          
          <div className="space-y-4">
            {commonProblems.map((problem, index) => (
              <MobileCard key={index} className={`p-4 border ${getSeverityColor(problem.severity)}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{problem.problem}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs capitalize ${getSeverityColor(problem.severity)}`}
                    >
                      {problem.severity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Symptoms:</h4>
                      <ul className="space-y-1">
                        {problem.symptoms.map((symptom, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <XCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Common Causes:</h4>
                      <ul className="space-y-1">
                        {problem.causes.map((cause, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Solutions:</h4>
                      <ul className="space-y-1">
                        {problem.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Revival Protocol */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Starter Revival Protocol</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Step-by-step process to revive a neglected or sluggish starter
          </p>
          
          <div className="space-y-4">
            {revivalProtocol.map((step) => (
              <MobileCard key={step.step} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <p className="text-sm font-medium text-primary">{step.action}</p>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Prevention Tips */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Prevention is Key</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preventionTips.map((category, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-primary">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="rounded-lg bg-amber-50 dark:bg-amber-950 p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">When to Start Over</h2>
          </div>
          <div className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">Start fresh if you see:</p>
            <ul className="space-y-1 ml-4">
              <li>• Any fuzzy mold growth (white, green, black, blue)</li>
              <li>• Pink or red coloration</li>
              <li>• Putrid, rotten smell that doesn't improve</li>
              <li>• No response after 5+ days of revival attempts</li>
            </ul>
            <p className="font-medium mt-3">Remember: It's safer to start over than risk your health.</p>
          </div>
        </section>

        {/* Quick Help */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Need More Help?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/starter-school/daily-care">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Review Daily Care</h3>
                    <p className="text-xs text-muted-foreground">Prevent problems with proper routine</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/shop">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Buy Proven Starter</h3>
                    <p className="text-xs text-muted-foreground">Start with healthy, established culture</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}