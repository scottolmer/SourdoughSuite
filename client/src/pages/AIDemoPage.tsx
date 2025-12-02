import React, { useState } from 'react';
import { Link } from 'wouter';
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, ChefHat, Stethoscope, Sparkles, 
  TrendingUp, AlertCircle, Play, Eye
} from "lucide-react";
import { SEO } from '@/components/SEO';

const demoFeatures = [
  {
    id: 'recipe-analysis',
    title: 'AI Recipe Analysis',
    description: 'Get expert insights, difficulty explanations, and pro tips for any sourdough recipe using ChatGPT o3 model',
    icon: Brain,
    color: 'blue',
    href: '/recipes/1', // Link to existing recipe to test analysis
    capabilities: [
      'Difficulty explanation based on hydration and techniques',
      'Key baking techniques identification', 
      'Common mistake prevention',
      'Personalized tips and variations',
      'Nutritional insights',
      'Timing optimization suggestions'
    ],
    status: 'ready'
  },
  {
    id: 'starter-doctor',
    title: 'AI Starter Doctor',
    description: 'Comprehensive troubleshooting for sourdough starter problems with expert diagnosis and solutions',
    icon: Stethoscope,
    color: 'green',
    href: '/ai-troubleshooting',
    capabilities: [
      'Symptom-based diagnosis system',
      'Environmental factor analysis',
      'Recovery timeline predictions',
      'Prevention strategies',
      'Feeding schedule optimization',
      'Temperature and flour recommendations'
    ],
    status: 'ready'
  },
  {
    id: 'recipe-generator',
    title: 'Personalized Recipe Creator',
    description: 'Generate custom sourdough recipes tailored to your skill level, preferences, and available equipment',
    icon: ChefHat,
    color: 'purple',
    href: '/ai-recipe-generator',
    capabilities: [
      'Skill-level appropriate recipes',
      'Flavor profile customization',
      'Dietary restriction accommodation',
      'Equipment-based adaptations',
      'Time constraint optimization',
      'Ingredient substitution suggestions'
    ],
    status: 'ready'
  }
];

export default function AIDemoPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'green':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-700'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 border-purple-200',
          icon: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  return (
    <MobileLayout 
      title="AI Features Demo" 
      showBackButton 
      backHref="/"
    >
      <SEO
        title="AI Features Demo | Bakehouse Breads"
        description="Explore advanced AI-powered features for sourdough baking including recipe analysis, starter troubleshooting, and personalized recipe generation using ChatGPT technology."
        canonicalUrl="/ai-demo"
        keywords={[
          'AI sourdough features',
          'ChatGPT o3 baking',
          'AI recipe analysis',
          'starter troubleshooting',
          'personalized recipes'
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              AI-Powered Sourdough Assistant
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Experience cutting-edge AI features powered by ChatGPT o3 model for expert sourdough guidance, recipe analysis, and personalized recommendations.
            </p>
          </CardHeader>
        </Card>

        {/* Feature Grid */}
        <div className="space-y-4">
          {demoFeatures.map((feature) => {
            const colors = getColorClasses(feature.color);
            const Icon = feature.icon;
            
            return (
              <Card key={feature.id} className={`${colors.bg} transition-all duration-200`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={colors.badge}>
                      {feature.status === 'ready' ? 'Ready' : 'Coming Soon'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Capabilities */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Capabilities:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {feature.capabilities.map((capability, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Sparkles className="h-3 w-3 mt-0.5 text-yellow-600 flex-shrink-0" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button asChild size="sm" className={`flex-1 ${feature.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : feature.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                      <Link href={feature.href}>
                        <Play className="h-4 w-4 mr-2" />
                        Try It Now
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFeature(
                        selectedFeature === feature.id ? null : feature.id
                      )}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {selectedFeature === feature.id && (
                    <div className="mt-4 p-4 bg-white/50 rounded-lg border">
                      <h4 className="font-medium text-sm mb-2">How it works:</h4>
                      {feature.id === 'recipe-analysis' && (
                        <div className="text-sm space-y-2">
                          <p>• Analyzes recipe ingredients, hydration, and techniques</p>
                          <p>• Provides skill-level appropriate explanations</p>
                          <p>• Suggests improvements and variations</p>
                          <p>• Identifies potential challenges and solutions</p>
                        </div>
                      )}
                      {feature.id === 'starter-doctor' && (
                        <div className="text-sm space-y-2">
                          <p>• Multi-category symptom analysis system</p>
                          <p>• Environmental factor consideration</p>
                          <p>• Personalized recovery recommendations</p>
                          <p>• Timeline expectations for improvement</p>
                        </div>
                      )}
                      {feature.id === 'recipe-generator' && (
                        <div className="text-sm space-y-2">
                          <p>• Customizes recipes based on your preferences</p>
                          <p>• Adapts to available equipment and time</p>
                          <p>• Considers dietary restrictions</p>
                          <p>• Provides skill-appropriate instructions</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* API Status */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              API Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-3">
              The AI features are fully implemented and ready to use. A valid OpenAI API key is required for live AI analysis.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>UI Components: Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>API Endpoints: Configured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>ChatGPT o3 Integration: Implemented</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>OpenAI API Key: Pending Configuration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Explore More AI Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/ai/recipe-generator">
                <ChefHat className="h-4 w-4 mr-2" />
                AI Recipe Generator
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/ai/chat">
                <Brain className="h-4 w-4 mr-2" />
                AI Chat Assistant
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/tools">
                <TrendingUp className="h-4 w-4 mr-2" />
                All Baking Tools
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}