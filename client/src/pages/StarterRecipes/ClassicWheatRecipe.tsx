import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import { SEO } from "@/components/SEO";

export function ClassicWheatRecipe() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Starter School', href: '/starter-school' },
    { label: 'Classic Wheat Recipe' }
  ];

  return (
    <MobileLayout 
      title="Classic Wheat Starter" 
      showBackButton 
      backHref="/starter-school"
      breadcrumbs={breadcrumbs}
    >
      <SEO
        title="Classic Wheat Sourdough Starter Recipe | Starter School"
        description="Learn how to create and maintain a classic wheat sourdough starter with our detailed recipe and care instructions. Perfect for beginners."
        keywords={['wheat sourdough starter', 'classic starter recipe', 'sourdough starter guide', 'all-purpose flour starter']}
      />
      
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
              <ChefHat className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Classic Wheat Starter</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-green-600 border-green-600">Easy</Badge>
                <Badge variant="outline">Mild, classic tang</Badge>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            The traditional all-purpose flour starter that's perfect for beginners. This reliable starter produces consistent results and forms the foundation for classic sourdough breads.
          </p>
        </section>

        {/* Recipe Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Time</p>
              <p className="text-xs text-muted-foreground">5-7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Difficulty</p>
              <p className="text-xs text-muted-foreground">Beginner</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="h-5 w-5 mx-auto mb-2 text-amber-600" />
              <p className="text-sm font-medium">Yield</p>
              <p className="text-xs text-muted-foreground">1 starter</p>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">For Day 1:</p>
              <ul className="space-y-1 text-sm">
                <li>• 50g all-purpose flour (unbleached)</li>
                <li>• 50g water (room temperature, filtered)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">For Daily Feeding:</p>
              <ul className="space-y-1 text-sm">
                <li>• 50g all-purpose flour</li>
                <li>• 50g water</li>
                <li>• 50g starter (from previous day)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium">Day 1: Initial Mix</h3>
                <p className="text-sm text-muted-foreground">
                  Mix 50g flour and 50g water in a clean glass jar. Stir well, cover loosely, and leave at room temperature (70-75°F). You should see small bubbles forming within 24-48 hours.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium">Days 2-7: Daily Feeding</h3>
                <p className="text-sm text-muted-foreground">
                  Each day, discard half the starter and add 50g fresh flour and 50g water. Stir well and cover loosely. The starter should double in size within 4-8 hours when fully active.
                </p>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-medium">Maturity Test</h3>
                <p className="text-sm text-muted-foreground">
                  Your starter is ready when it consistently doubles in size within 4-8 hours of feeding and has a pleasant, tangy aroma. This typically happens by day 5-7.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Care Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Care & Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Daily Feeding</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Feed every 24 hours at room temperature, or every 3-7 days when refrigerated
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Temperature</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Ideal range: 70-75°F (21-24°C) for optimal activity
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Storage</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Glass jar with loose lid, can be refrigerated for up to 1 week between feedings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}

export default ClassicWheatRecipe;