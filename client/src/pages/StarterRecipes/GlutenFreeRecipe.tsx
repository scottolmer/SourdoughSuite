import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, AlertTriangle } from "lucide-react";
import { SEO } from "@/components/SEO";

export function GlutenFreeRecipe() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Starter School', href: '/starter-school' },
    { label: 'Gluten Free Recipe' }
  ];

  return (
    <MobileLayout 
      title="Gluten Free Starter" 
      showBackButton 
      backHref="/starter-school"
      breadcrumbs={breadcrumbs}
    >
      <SEO
        title="Gluten-Free Sourdough Starter Recipe | Starter School"
        description="Create a gluten-free sourdough starter using rice flour and alternative grain blends. Perfect for celiac-friendly baking."
        keywords={['gluten free sourdough starter', 'rice flour starter', 'celiac friendly starter', 'gluten free bread']}
      />
      
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
              <ChefHat className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gluten Free Starter</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-red-600 border-red-600">Advanced</Badge>
                <Badge variant="outline">Mild, slightly sweet</Badge>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            A carefully crafted gluten-free starter using rice flour and alternative grain blends. Perfect for those with celiac disease or gluten sensitivity who want to enjoy sourdough bread.
          </p>
        </section>

        {/* Important Notice */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Important for Celiac Safety</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Ensure all equipment and ingredients are certified gluten-free and haven't been cross-contaminated with wheat products.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Time</p>
              <p className="text-xs text-muted-foreground">7-10 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-red-600" />
              <p className="text-sm font-medium">Difficulty</p>
              <p className="text-xs text-muted-foreground">Advanced</p>
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
              <p className="font-medium">Gluten-Free Flour Blend:</p>
              <ul className="space-y-1 text-sm">
                <li>• 30g brown rice flour</li>
                <li>• 15g white rice flour</li>
                <li>• 5g tapioca starch</li>
                <li>• 50g filtered water (room temperature)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Alternative Single-Flour Option:</p>
              <ul className="space-y-1 text-sm">
                <li>• 50g brown rice flour</li>
                <li>• 50g filtered water</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">For Daily Feeding:</p>
              <ul className="space-y-1 text-sm">
                <li>• 50g gluten-free flour blend (as above)</li>
                <li>• 50g filtered water</li>
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
                  Mix your chosen flour blend with water in a clean glass jar. Stir well, cover loosely, and leave at room temperature. Gluten-free starters take longer to establish.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium">Days 2-10: Daily Feeding</h3>
                <p className="text-sm text-muted-foreground">
                  Each day, discard half the starter and add 50g fresh flour blend and 50g water. Be patient - gluten-free starters can take 7-10 days to become fully active.
                </p>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-medium">Maturity Test</h3>
                <p className="text-sm text-muted-foreground">
                  Your starter is ready when it doubles in size within 6-8 hours of feeding and has a mild, slightly sweet aroma. This typically happens by day 7-10.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Gluten-Free Starter Specifics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Longer Timeline</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Gluten-free starters take longer to establish due to different fermentation patterns
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Flour Blend Benefits</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Using a blend of rice flours and starches creates better structure and fermentation
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Consistency</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Gluten-free starters are typically thinner and less structured than wheat starters
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Feeding Schedule</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                May need more frequent feedings (every 12-18 hours) during active use
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="font-medium text-sm">Slow fermentation:</p>
              <p className="text-xs text-muted-foreground">
                Try adding a pinch of organic cane sugar or increasing feeding frequency
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">Thin consistency:</p>
              <p className="text-xs text-muted-foreground">
                Normal for gluten-free starters. Add a bit more flour if needed for thickness
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">Lack of rise:</p>
              <p className="text-xs text-muted-foreground">
                Ensure consistent temperature (75-80°F) and consider adding xanthan gum for structure
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}

export default GlutenFreeRecipe;