import { useQuery } from "@tanstack/react-query";
import { MobileCard } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Brain, Sparkles, TrendingUp, User, Clock, ChefHat } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PersonalizedContent {
  heroMessage: string;
  recommendedTools?: Array<{
    id: string;
    name: string;
    description: string;
    relevanceScore: number;
    aiReason: string;
  }>;
  featuredRecipes?: Array<{
    id: string;
    name: string;
    difficulty: string;
    relevanceScore: number;
    aiReason: string;
  }>;
  blogArticles?: Array<{
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
    aiReason: string;
  }>;
  smartNotifications?: Array<{
    message: string;
    type: string;
    priority: number;
  }>;
  nextActions?: Array<{
    action: string;
    description: string;
    link: string;
    confidence: number;
  }>;
}

export function AIPersonalizedHomepage() {
  // Get or create a stable session ID for this browser session
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('currentSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}`;
      sessionStorage.setItem('currentSessionId', sessionId);
    }
    return sessionId;
  };

  // Generate user session data for AI personalization
  const sessionData = {
    sessionId: getSessionId(),
    visitCount: parseInt(localStorage.getItem('visitCount') || '1'),
    timeOnSite: 0,
    pagesVisited: ['/'],
    toolsUsed: JSON.parse(localStorage.getItem('toolsUsed') || '[]'),
    searchQueries: JSON.parse(localStorage.getItem('searchQueries') || '[]'),
    skillLevel: localStorage.getItem('skillLevel') || 'intermediate',
    interests: JSON.parse(localStorage.getItem('interests') || '["sourdough", "artisan bread"]')
  };

  const { data: personalizedContent, isLoading, error } = useQuery<PersonalizedContent>({
    queryKey: ['/api/ai/personalized-homepage'],
    queryFn: () => apiRequest('/api/ai/personalized-homepage', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }),
    staleTime: 15 * 60 * 1000, // 15 minutes to reduce API calls
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fallback content when AI is unavailable
  const fallbackContent: PersonalizedContent = {
    heroMessage: "Welcome to Bakehouse Breads! Discover the art of sourdough baking with our expert guidance and tools.",
    recommendedTools: [
      {
        id: "sourdough-starter-guide",
        name: "Sourdough Starter Guide",
        description: "Learn how to create and maintain a thriving sourdough starter.",
        relevanceScore: 95,
        aiReason: "Essential starting point for sourdough baking"
      },
      {
        id: "hydration-calculator",
        name: "Hydration Calculator",
        description: "Calculate the perfect water-to-flour ratio for consistent results.",
        relevanceScore: 85,
        aiReason: "Understanding hydration is key to sourdough success"
      }
    ],
    featuredRecipes: [
      {
        id: "beginner-sourdough",
        name: "Beginner's Sourdough Loaf",
        difficulty: "beginner",
        relevanceScore: 90,
        aiReason: "Perfect first recipe for new bakers"
      },
      {
        id: "sourdough-pancakes",
        name: "Sourdough Pancakes",
        difficulty: "beginner",
        relevanceScore: 80,
        aiReason: "Easy way to use discard starter"
      }
    ],
    blogArticles: [
      {
        id: "getting-started",
        title: "Getting Started with Sourdough",
        excerpt: "Everything you need to know to begin your sourdough journey.",
        relevanceScore: 85,
        aiReason: "Foundational knowledge for beginners"
      }
    ],
    smartNotifications: [
      {
        message: "Welcome to sourdough baking! Start with creating your starter.",
        type: "tip",
        priority: 1
      }
    ],
    nextActions: [
      {
        action: "Create Your Starter",
        description: "Begin your sourdough journey by creating a healthy starter.",
        link: "/starter-guide",
        confidence: 95
      }
    ]
  };

  const content = error ? fallbackContent : (personalizedContent || fallbackContent);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
          <span className="text-sm text-muted-foreground">AI is personalizing your experience...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Personalized Greeting */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-5 w-5 text-blue-600" />
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Personalized for You
          </Badge>
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          {content.heroMessage}
        </p>
      </div>

      {/* Recommended Tools */}
      {content.recommendedTools && content.recommendedTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommended Tools</h3>
            <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Picked
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.recommendedTools.map((tool) => (
              <MobileCard key={tool.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">{tool.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                  <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
                    {tool.aiReason}
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </div>
      )}

      {/* Featured Recipes */}
      {content.featuredRecipes && content.featuredRecipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Featured Recipes</h3>
            <Badge variant="secondary" className="text-amber-600 bg-amber-50">
              <ChefHat className="h-3 w-3 mr-1" />
              For You
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.featuredRecipes.map((recipe) => (
              <MobileCard key={recipe.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">{recipe.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {recipe.difficulty}
                    </Badge>
                    <span>{recipe.relevanceScore}% match</span>
                  </div>
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    {recipe.aiReason}
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </div>
      )}

      {/* Blog Articles */}
      {content.blogArticles && content.blogArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommended Reading</h3>
            <Badge variant="secondary" className="text-blue-600 bg-blue-50">
              <TrendingUp className="h-3 w-3 mr-1" />
              AI Curated
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.blogArticles.map((article) => (
              <MobileCard key={article.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <h4 className="font-medium mb-2">{article.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{article.excerpt}</p>
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    {article.aiReason}
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </div>
      )}

      {/* Next Actions */}
      {content.nextActions && content.nextActions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suggested Next Steps</h3>
            <Badge variant="secondary" className="text-purple-600 bg-purple-50">
              <Brain className="h-3 w-3 mr-1" />
              AI Guided
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.nextActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <MobileCard className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium mb-1">{action.action}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {action.confidence}%
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      Get Started
                    </Button>
                  </div>
                </MobileCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Smart Notifications */}
      {content.smartNotifications && content.smartNotifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Smart Tips</h3>
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Tips
            </Badge>
          </div>
          <div className="space-y-2">
            {content.smartNotifications.map((notification, index) => (
              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}