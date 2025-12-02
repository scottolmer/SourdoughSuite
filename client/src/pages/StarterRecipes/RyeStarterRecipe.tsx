import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import { SEO } from "@/components/SEO";

export function RyeStarterRecipe() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Starter School', href: '/starter-school' },
    { label: 'Rye Starter Recipe' }
  ];

  return (
    <MobileLayout 
      title="Rye Starter" 
      showBackButton 
      backHref="/starter-school"
      breadcrumbs={breadcrumbs}
    >
      <SEO
        title="Rye Sourdough Starter Recipe | Starter School"
        description="Create a fast-acting rye sourdough starter with distinctive flavor, perfect for dark breads and European-style loaves."
        keywords={['rye sourdough starter', 'rye starter recipe', 'dark bread starter', 'European bread starter']}
      />
      
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
              <ChefHat className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rye Starter</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-orange-600 border-orange-600">Intermediate</Badge>
                <Badge variant="outline">Rich, slightly sour</Badge>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            A fast-acting starter made with rye flour that develops distinctive flavors quickly. Perfect for dark breads, pumpernickel, and European-style loaves.
          </p>
        </section>

        {/* Recipe Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Time</p>
              <p className="text-xs text-muted-foreground">3-5 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Difficulty</p>
              <p className="text-xs text-muted-foreground">Intermediate</p>
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
                <li>• 50g rye flour (dark rye preferred)</li>
                <li>• 50g water (room temperature, filtered)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">For Daily Feeding:</p>
              <ul className="space-y-1 text-sm">
                <li>• 50g rye flour</li>
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
                  Mix 50g rye flour and 50g water in a clean glass jar. Stir well, cover loosely, and leave at room temperature. Rye starters typically show activity within 12-24 hours.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium">Days 2-5: Daily Feeding</h3>
                <p className="text-sm text-muted-foreground">
                  Each day, discard half the starter and add 50g fresh rye flour and 50g water. Rye starters become active very quickly due to high enzyme activity.
                </p>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-medium">Maturity Test</h3>
                <p className="text-sm text-muted-foreground">
                  Your starter is ready when it doubles in size within 3-5 hours of feeding and has a rich, slightly sour aroma. This often happens by day 3-5.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Rye Starter Specifics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Fast Activity</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Rye flour has high enzyme activity, making it one of the fastest starters to establish
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Consistency</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Rye starters tend to be stickier and less structured than wheat starters
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Flavor Development</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Develops complex, earthy flavors quickly - perfect for dark breads and European styles
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Handling Tip</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Can be maintained with 50% rye, 50% wheat flour for easier handling while retaining flavor
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}

export default RyeStarterRecipe;