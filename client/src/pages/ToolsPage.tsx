import React from 'react';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calculator, FileText, Clock, Wrench, ArrowRight, Thermometer, Droplet, ActivitySquare, BarChart3, FlaskConical, Beaker, TestTube, BookText, Brain, Sparkles, ArrowRightLeft, Zap } from "lucide-react";

/**
 * ToolsPage - A central page that displays all available baker's tools
 */
export default function ToolsPage() {
  const calculatorTools = [
    {
      title: "Baker's Percentage Calculator",
      description: "Calculate baker's percentages for your recipes",
      icon: Calculator,
      href: "/tools/bakers-calculator",
      color: "bg-amber-100 dark:bg-amber-950"
    },
    {
      title: "Timeline Calculator",
      description: "Plan your baking schedule",
      icon: Clock,
      href: "/tools/timeline-calculator",
      color: "bg-rose-100 dark:bg-rose-950"
    },
    {
      title: "Dough Temperature Calculator",
      description: "Calculate ideal water temperature for perfect dough",
      icon: Thermometer,
      href: "/tools/dough-temperature-calculator",
      color: "bg-cyan-100 dark:bg-cyan-950"
    },
    {
      title: "Hydration Converter",
      description: "Convert between hydration levels for different bread types",
      icon: Droplet,
      href: "/tools/hydration-converter",
      color: "bg-blue-100 dark:bg-blue-950"
    },
    {
      title: "Recipe Scaling Calculator",
      description: "Scale recipes by weight or pan size while maintaining proper ratios",
      icon: Calculator,
      href: "/tools/scaling-calculator",
      color: "bg-indigo-100 dark:bg-indigo-950"
    },
  ];
  
  const aiTools = [
    {
      title: "AI Recipe Generator",
      description: "Create personalized recipes with comprehensive customization options",
      icon: Brain,
      href: "/ai-recipe-generator",
      color: "bg-purple-100 dark:bg-purple-950"
    },
  ];

  const professionalTools = [
    {
      title: "Professional Command Center",
      description: "Enterprise production management with business intelligence",
      icon: BarChart3,
      href: "/professional-command-center",
      color: "bg-emerald-100 dark:bg-emerald-950"
    },
    {
      title: "Mobile Production Dashboard",
      description: "Kitchen-friendly batch tracking and quick updates",
      icon: ActivitySquare,
      href: "/mobile-production",
      color: "bg-slate-100 dark:bg-slate-950"
    },
  ];

  const analyzerTools = [
    {
      title: "Recipe Validator",
      description: "Analyze recipes and get AI-powered improvement suggestions",
      icon: FileText,
      href: "/tools/recipe-validator",
      color: "bg-orange-100 dark:bg-orange-950"
    },
    {
      title: "Baking Troubleshooter",
      description: "Diagnose baking problems and get expert solutions",
      icon: Wrench,
      href: "/tools/troubleshooter",
      color: "bg-red-100 dark:bg-red-950"
    },
    {
      title: "Ingredient Substitution",
      description: "Smart ingredient replacement suggestions that maintain recipe balance",
      icon: Zap,
      href: "/tools/ingredient-substitution",
      color: "bg-amber-100 dark:bg-amber-950"
    },
  ];

  const utilityTools = [
    {
      title: "Unit Converter",
      description: "Convert between common baking measurements",
      icon: ArrowRightLeft,
      href: "/tools/converter",
      color: "bg-gray-100 dark:bg-gray-950"
    },
  ];
  
  const starterTools = [
    {
      title: "Starter Feeding Calculator",
      description: "Calculate feedings for your sourdough starter",
      icon: Calculator,
      href: "/tools/starter-feeding-calculator",
      color: "bg-emerald-100 dark:bg-emerald-950"
    },
    {
      title: "Starter Health Tracker",
      description: "Monitor activity, rise height, and other vital signs of your starter",
      icon: ActivitySquare,
      href: "/starter/maintenance",
      color: "bg-purple-100 dark:bg-purple-950"
    },
    {
      title: "Baking Journal",
      description: "Track your bakes and how different starters perform with recipes",
      icon: BookText,
      href: "/baking-journal",
      color: "bg-amber-100 dark:bg-amber-950"
    },
  ];

  return (
    <MobileLayout title="Baker's Tools">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <section className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-8 md:p-12 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg mb-4 mx-auto w-fit">
              <Wrench className="h-10 w-10 md:h-12 md:w-12 text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Sourdough Suite Tools</h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Complete collection of professional baking calculators and utilities for precise sourdough crafting
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white">AI-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {aiTools.map((tool) => (
              <Card 
                key={tool.href} 
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] border-2 border-purple-200 rounded-xl h-full"
              >
                <Link href={tool.href}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`${tool.color} p-4 rounded-xl mx-auto w-fit transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                        <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="font-bold text-lg md:text-xl">{tool.title}</h3>
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">AI Powered</span>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white">Recipe Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {analyzerTools.map((tool) => (
              <Card 
                key={tool.href} 
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] rounded-xl h-full"
              >
                <Link href={tool.href}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`${tool.color} p-4 rounded-xl mx-auto w-fit transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                        <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg md:text-xl mb-2">{tool.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white">Essential Calculators ({calculatorTools.length} tools)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {calculatorTools.map((tool) => (
              <Card 
                key={tool.href} 
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] rounded-xl h-full"
              >
                <Link href={tool.href}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`${tool.color} p-4 rounded-xl mx-auto w-fit transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                        <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg md:text-xl mb-2">{tool.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white">Starter Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {starterTools.map((tool) => (
              <Card 
                key={tool.href} 
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] rounded-xl h-full"
              >
                <Link href={tool.href}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`${tool.color} p-4 rounded-xl mx-auto w-fit transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                        <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg md:text-xl mb-2">{tool.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white">Utility Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {utilityTools.map((tool) => (
              <Card 
                key={tool.href} 
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] rounded-xl h-full"
              >
                <Link href={tool.href}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`${tool.color} p-4 rounded-xl mx-auto w-fit transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                        <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg md:text-xl mb-2">{tool.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-auto transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          
          {/* Call to Action Section */}
          <section className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-8 md:p-12 text-center shadow-lg">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Need More Baking Knowledge?</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Master sourdough fundamentals with our comprehensive Starter School. Get expert guidance on feeding, troubleshooting, and advanced techniques.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
                <Button asChild className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/starter-school">
                    <BookText className="h-5 w-5 mr-3" />
                    Starter School
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full py-6 text-lg font-semibold border-2 hover:bg-blue-50 transition-colors">
                  <Link href="/starter">
                    <Sparkles className="h-5 w-5 mr-3" />
                    Starter Hub
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </MobileLayout>
  );
}