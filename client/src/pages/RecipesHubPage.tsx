import React from 'react';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Brain, Sparkles, Search, Wand2, MessageSquare, ChefHat, ArrowRight, Bot } from "lucide-react";
import { SEO } from '@/components/SEO';
import { generateWebpageSEO } from '@/lib/schema';

/**
 * AI Recipe Discovery Hub - Intelligent recipe creation and discovery platform
 */
export default function RecipesHubPage() {
  const aiRecipeTools = [
    {
      title: "AI Recipe Generator",
      description: "Create personalized recipes using advanced AI technology that adapts to your preferences",
      icon: Brain,
      href: "/ai-recipe-generator",
      color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      badge: "AI Powered",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      title: "AI Chat Assistant",
      description: "Get real-time baking guidance, troubleshooting, and technique advice from your AI assistant",
      icon: MessageSquare,
      href: "/tools/chat",
      color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      badge: "Conversational AI",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      title: "Smart Recipe Discovery",
      description: "AI-curated recipe recommendations based on your skill level and preferences",
      icon: Search,
      href: "/recipes/discover",
      color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
      badge: "Personalized",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      title: "Recipe Enhancement AI",
      description: "Improve existing recipes with AI-powered analysis and optimization suggestions",
      icon: Wand2,
      href: "/tools/recipe-validator",
      color: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
      badge: "Smart Analysis",
      badgeColor: "bg-orange-100 text-orange-700"
    },
  ];
  
  const aiCategories = [
    {
      title: "AI-Generated Recipes",
      description: "Explore recipes created by our AI based on trending techniques and flavors",
      icon: Bot,
      href: "/recipes/ai-generated",
      color: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
      badge: "AI Created",
      badgeColor: "bg-emerald-100 text-emerald-700"
    },
    {
      title: "Personalized Collection",
      description: "AI-curated recipes tailored to your baking history and preferences",
      icon: ChefHat,
      href: "/recipes/personalized",
      color: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800",
      badge: "Smart Curation",
      badgeColor: "bg-indigo-100 text-indigo-700"
    },
    {
      title: "Trending AI Recipes",
      description: "Popular recipes generated and refined by our AI community",
      icon: Sparkles,
      href: "/recipes/trending",
      color: "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800",
      badge: "Trending",
      badgeColor: "bg-pink-100 text-pink-700"
    },
  ];

  // Generate SEO data
  const seoData = generateWebpageSEO({
    title: 'AI Recipe Discovery Hub | Intelligent Baking Assistant',
    description: 'Advanced AI-powered recipe creation, discovery, and optimization. Get personalized baking guidance with intelligent recipe generation.',
    canonicalUrl: '/recipes',
    type: 'website',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'AI Recipes', href: '/recipes' }
    ]
  });

  // Create breadcrumbs for recipes page
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'AI Recipes', href: '/recipes' }
  ];

  return (
    <>
      <SEO 
        title="AI Recipe Discovery Hub | Intelligent Baking Assistant"
        description="Advanced AI-powered recipe creation, discovery, and optimization. Get personalized baking guidance with intelligent recipe generation."
        canonicalUrl="/recipes"
        structuredData={seoData}
      />
      <MobileLayout
        title="AI Recipe Hub"
        breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* AI-Powered Header */}
          <section className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                AI-Powered Recipe Discovery
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">AI Recipe Discovery Hub</h1>
            <p className="text-muted-foreground text-center">
              Intelligent recipe creation, personalized recommendations, and AI-powered baking guidance
            </p>
            <div className="mt-4 flex justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/ai/recipe-generator">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Recipe
                </Link>
              </Button>
            </div>
          </section>

          {/* AI Recipe Tools */}
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Recipe Tools</h2>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Powered by AI
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {aiRecipeTools.map((tool) => (
                <Card 
                  key={tool.href} 
                  className={`overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] border-2 ${tool.color}`}
                >
                  <Link href={tool.href}>
                    <CardContent className="p-0">
                      <div className="flex items-start p-4 group">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mr-4 transition-all duration-300 group-hover:scale-110">
                          <tool.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{tool.title}</h3>
                            <Badge variant="secondary" className={`text-xs ${tool.badgeColor}`}>
                              {tool.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground self-center transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            
            {/* AI Recipe Categories */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Recipe Collections</h2>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Smart Curation
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {aiCategories.map((category) => (
                <Card 
                  key={category.href} 
                  className={`overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] border-2 ${category.color}`}
                >
                  <Link href={category.href}>
                    <CardContent className="p-0">
                      <div className="flex items-start p-4 group">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mr-4 transition-all duration-300 group-hover:scale-110">
                          <category.icon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{category.title}</h3>
                            <Badge variant="secondary" className={`text-xs ${category.badgeColor}`}>
                              {category.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground self-center transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </MobileLayout>
    </>
  );
}