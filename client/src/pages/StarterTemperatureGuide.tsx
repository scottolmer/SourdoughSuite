import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Thermometer, 
  Droplets,
  Wind,
  Sun,
  Snowflake,
  Home,
  Timer,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";

export function StarterTemperatureGuide() {
  const temperatureZones = [
    {
      range: "65-70°F (18-21°C)",
      zone: "Cool",
      activity: "Slow & Steady",
      timing: "12-24 hours to double",
      flavor: "More tangy, acetic acid dominant",
      benefits: ["Better flavor development", "More control over timing", "Less maintenance"],
      challenges: ["Longer fermentation", "May seem inactive", "Requires patience"],
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      range: "70-75°F (21-24°C)",
      zone: "Ideal",
      activity: "Balanced & Predictable",
      timing: "6-12 hours to double",
      flavor: "Balanced tang, complex flavors",
      benefits: ["Consistent performance", "Good flavor balance", "Manageable schedule"],
      challenges: ["Requires stable environment", "Moderate attention needed"],
      color: "text-green-600 bg-green-50 border-green-200"
    },
    {
      range: "75-80°F (24-27°C)",
      zone: "Warm",
      activity: "Fast & Active",
      timing: "4-8 hours to double",
      flavor: "Milder, lactic acid prominent",
      benefits: ["Quick results", "Very active bubbling", "Great for beginners"],
      challenges: ["Requires frequent feeding", "Can overferment quickly", "Less complex flavor"],
      color: "text-orange-600 bg-orange-50 border-orange-200"
    },
    {
      range: "80°F+ (27°C+)",
      zone: "Hot",
      activity: "Hyperactive",
      timing: "2-4 hours to double",
      flavor: "Very mild, can become alcoholic",
      benefits: ["Extremely fast development", "High yeast activity"],
      challenges: ["Hard to control", "Risk of overheating", "May kill beneficial bacteria"],
      color: "text-red-600 bg-red-50 border-red-200"
    }
  ];

  const seasonalTips = [
    {
      season: "Summer",
      icon: Sun,
      temp: "Higher temperatures",
      adjustments: [
        "Move starter to cooler spots (basement, AC room)",
        "Use refrigerator for storage more often",
        "Reduce starter amount in feedings (1:3:3 ratio)",
        "Feed more frequently to prevent over-fermentation",
        "Use cooler water in feedings"
      ]
    },
    {
      season: "Winter", 
      icon: Snowflake,
      temp: "Lower temperatures",
      adjustments: [
        "Find warm spots (top of refrigerator, near heater)",
        "Use slightly warm water in feedings",
        "Increase starter proportion (1:1:1 ratio)",
        "Be patient with longer fermentation times",
        "Consider proofing box or oven light for warmth"
      ]
    }
  ];

  const environmentFactors = [
    {
      factor: "Humidity",
      icon: Droplets,
      optimal: "50-70%",
      effects: {
        high: "Surface may dry less, potential mold risk",
        low: "Surface dries quickly, may form skin"
      },
      solutions: {
        high: "Ensure good air circulation, loose covering",
        low: "Use damp cloth over container, avoid tight lids"
      }
    },
    {
      factor: "Air Circulation",
      icon: Wind,
      optimal: "Gentle, consistent",
      effects: {
        high: "Too much airflow can dry out starter",
        low: "Stagnant air can promote unwanted bacteria"
      },
      solutions: {
        high: "Shield from direct drafts and fans",
        low: "Move to area with gentle air movement"
      }
    },
    {
      factor: "Light",
      icon: Sun,
      optimal: "Indirect light",
      effects: {
        high: "Can heat container, affect temperature stability",
        low: "Not harmful, but harder to observe changes"
      },
      solutions: {
        high: "Move away from windows, use opaque covering",
        low: "Place in area where you can easily check progress"
      }
    }
  ];

  const controlMethods = [
    {
      method: "Oven Light Method",
      temp: "75-85°F",
      description: "Use oven light to create warm environment",
      steps: [
        "Turn on oven light only (not heat)",
        "Place starter inside with door slightly cracked",
        "Monitor temperature with thermometer",
        "Adjust door opening for temperature control"
      ],
      pros: ["Consistent warmth", "Easy to control"],
      cons: ["Risk of overheating", "Occupies oven"]
    },
    {
      method: "Heating Pad Method",
      temp: "70-80°F",
      description: "Use seed mat or heating pad for gentle warmth",
      steps: [
        "Set heating pad to lowest setting",
        "Place towel over pad",
        "Set starter container on towel",
        "Monitor temperature regularly"
      ],
      pros: ["Very gentle heat", "Precise control"],
      cons: ["Requires equipment", "Constant electricity use"]
    },
    {
      method: "Warm Water Bath",
      temp: "75-80°F",
      description: "Surround container with warm water",
      steps: [
        "Fill larger container with warm water",
        "Place starter jar in water bath",
        "Refresh warm water as needed",
        "Ensure water doesn't reach lid level"
      ],
      pros: ["No equipment needed", "Gentle heat"],
      cons: ["Requires frequent refreshing", "Risk of water intrusion"]
    }
  ];

  return (
    <MobileLayout title="Temperature & Environment" showBackButton>
      <SEO
        title="Sourdough Starter Temperature Guide | Environment Control for Healthy Starters | Bakehouse Breads"
        description="Master temperature and environmental control for optimal sourdough starter health. Learn ideal conditions, seasonal adjustments, and temperature control methods."
        keywords={['sourdough starter temperature', 'starter environment', 'fermentation temperature', 'starter temperature control', 'seasonal starter care', 'optimal fermentation conditions']}
      />
      
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
              <Thermometer className="h-6 w-6 text-orange-600" />
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Environment Control
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Temperature & Environment
          </h1>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Temperature is the most critical factor in starter health and activity. Learn to create optimal 
            conditions and adapt to seasonal changes for consistent results.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-orange-600" />
              <span>70-75°F ideal</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-blue-600" />
              <span>50-70% humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-gray-600" />
              <span>Gentle airflow</span>
            </div>
          </div>
        </section>

        {/* Temperature Zones */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Temperature Zones</h2>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Impact Guide
            </Badge>
          </div>
          
          <div className="space-y-4">
            {temperatureZones.map((zone, index) => (
              <MobileCard key={index} className={`p-4 border ${zone.color}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{zone.range}</h3>
                      <p className="text-sm font-medium">{zone.zone} Zone</p>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${zone.color}`}>
                      {zone.activity}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Timing:</p>
                      <p className="text-muted-foreground">{zone.timing}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Flavor:</p>
                      <p className="text-muted-foreground">{zone.flavor}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-green-600 mb-1">Benefits:</p>
                      <ul className="space-y-1">
                        {zone.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-orange-600 mb-1">Challenges:</p>
                      <ul className="space-y-1">
                        {zone.challenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{challenge}</span>
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

        {/* Seasonal Adjustments */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Seasonal Adjustments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalTips.map((season, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <season.icon className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-medium">{season.season}</h3>
                      <p className="text-sm text-muted-foreground">{season.temp}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm mb-2">Adjustments:</p>
                    <ul className="space-y-1">
                      {season.adjustments.map((adjustment, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{adjustment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Environmental Factors */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Environmental Factors</h2>
          
          <div className="space-y-4">
            {environmentFactors.map((factor, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <factor.icon className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{factor.factor}</h3>
                      <p className="text-sm text-muted-foreground">Optimal: {factor.optimal}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-orange-600 mb-2">Effects:</p>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">High:</span> {factor.effects.high}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Low:</span> {factor.effects.low}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-green-600 mb-2">Solutions:</p>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">High:</span> {factor.solutions.high}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Low:</span> {factor.solutions.low}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Temperature Control Methods */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Temperature Control Methods</h2>
          
          <div className="space-y-4">
            {controlMethods.map((method, index) => (
              <MobileCard key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{method.method}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {method.temp}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  
                  <div>
                    <p className="font-medium text-sm mb-2">Steps:</p>
                    <ol className="space-y-1">
                      {method.steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="font-medium text-primary">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-green-600 mb-1">Pros:</p>
                      <ul className="space-y-1">
                        {method.pros.map((pro, idx) => (
                          <li key={idx} className="text-muted-foreground">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-orange-600 mb-1">Cons:</p>
                      <ul className="space-y-1">
                        {method.cons.map((con, idx) => (
                          <li key={idx} className="text-muted-foreground">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </section>

        {/* Quick Reference */}
        <section className="rounded-lg bg-muted p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Finding the Right Spot</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-background rounded-lg p-3">
              <h3 className="font-medium mb-2 text-green-600">Good Locations</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Top of refrigerator</li>
                <li>• Kitchen counter (stable temp)</li>
                <li>• Pantry shelf</li>
                <li>• Microwave (off, just storage)</li>
              </ul>
            </div>
            
            <div className="bg-background rounded-lg p-3">
              <h3 className="font-medium mb-2 text-orange-600">Avoid</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Direct sunlight</li>
                <li>• Near heat sources</li>
                <li>• Drafty areas</li>
                <li>• Temperature fluctuations</li>
              </ul>
            </div>
            
            <div className="bg-background rounded-lg p-3">
              <h3 className="font-medium mb-2 text-blue-600">Monitor</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use thermometer strip</li>
                <li>• Check doubling time</li>
                <li>• Note activity changes</li>
                <li>• Track daily temperature</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/starter-school/troubleshooting">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Troubleshooting Guide</h3>
                    <p className="text-xs text-muted-foreground">Solve temperature-related problems</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
            
            <Link href="/tools/starter-tracker">
              <MobileCard className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Starter Health Tracker</h3>
                    <p className="text-xs text-muted-foreground">Monitor temperature and activity</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </MobileCard>
            </Link>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}