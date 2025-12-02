import { useUserRecipes } from '@/hooks/use-recipes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, ChevronRight } from "lucide-react";
import { Link } from 'wouter';
import { BreadRecipe } from '@shared/schema';

interface UserRecipeListProps {
  userId: number;
  onViewRecipe: (recipe: BreadRecipe) => void;
}

export default function UserRecipeList({ userId, onViewRecipe }: UserRecipeListProps) {
  const { data: recipes = [], isLoading } = useUserRecipes(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-3">No Personal Recipes Yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven't created any recipes yet. Start by creating your first custom recipe.
        </p>
        <Button asChild>
          <Link href="/tools">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Recipe
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-medium">Your Recipes</h2>
        <Button asChild>
          <Link href="/tools">
            <Plus className="mr-2 h-4 w-4" />
            Create New Recipe
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{recipe.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {recipe.isPublic ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recipe.description || "No description available"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Created: {new Date(recipe.createdAt).toLocaleDateString()}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewRecipe(recipe)}
              >
                <Eye className="h-4 w-4 mr-2" /> View Recipe
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}