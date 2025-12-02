import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: 'recipe' | 'article' | 'starter';
  id: string;
  title: string;
  description: string;
  url: string;
  tags?: string[];
}

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search across recipes, articles, and starters
  const { data: searchResults = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const results: SearchResult[] = [];
      
      // Search recipes
      try {
        const recipesResponse = await fetch('/api/recipes');
        const recipes = await recipesResponse.json();
        
        recipes
          .filter((recipe: any) => 
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .forEach((recipe: any) => {
            results.push({
              type: 'recipe',
              id: recipe.id,
              title: recipe.name,
              description: recipe.description || '',
              url: `/recipes/${recipe.slug || recipe.id}`,
              tags: recipe.tags
            });
          });
      } catch (error) {
        console.error('Failed to search recipes:', error);
      }
      
      // Search articles
      try {
        const articlesResponse = await fetch('/api/content-articles/published');
        const articles = await articlesResponse.json();
        
        articles
          .filter((article: any) => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .forEach((article: any) => {
            results.push({
              type: 'article',
              id: article.id,
              title: article.title,
              description: article.excerpt || '',
              url: `/blog/${article.slug}`,
            });
          });
      } catch (error) {
        console.error('Failed to search articles:', error);
      }
      
      // Search starters
      try {
        const startersResponse = await fetch('/api/starters');
        const starters = await startersResponse.json();
        
        starters
          .filter((starter: any) => 
            starter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            starter.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 2)
          .forEach((starter: any) => {
            results.push({
              type: 'starter',
              id: starter.id,
              title: starter.name,
              description: starter.description || '',
              url: `/starter-product/${starter.slug || starter.id}`,
            });
          });
      } catch (error) {
        console.error('Failed to search starters:', error);
      }
      
      return results;
    },
    enabled: searchQuery.length > 2,
    staleTime: 30 * 1000, // 30 seconds
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recipe': return 'bg-orange-100 text-orange-700';
      case 'article': return 'bg-blue-100 text-blue-700';
      case 'starter': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recipe': return 'Recipe';
      case 'article': return 'Article';
      case 'starter': return 'Starter';
      default: return 'Result';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="p-4">
        {/* Search Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes, articles, starters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              autoFocus
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          {searchQuery.length > 2 ? (
            <>
              {isLoading ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center">
                      <Search className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Searching...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="text-sm text-muted-foreground px-2">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  {searchResults.map((result) => (
                    <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Link href={result.url} onClick={onClose}>
                          <div className="flex items-start gap-3">
                            <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                              {getTypeLabel(result.type)}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm line-clamp-1 mb-1">
                                {result.title}
                              </h3>
                              {result.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {result.description}
                                </p>
                              )}
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {result.tags.slice(0, 3).map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0.5">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No results found for "{searchQuery}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Type at least 3 characters to search
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground mb-3">Quick Access</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild onClick={onClose}>
              <Link href="/recipes/trending">Trending Recipes</Link>
            </Button>
            <Button variant="outline" size="sm" asChild onClick={onClose}>
              <Link href="/blog">Latest Articles</Link>
            </Button>
            <Button variant="outline" size="sm" asChild onClick={onClose}>
              <Link href="/shop">Browse Starters</Link>
            </Button>
            <Button variant="outline" size="sm" asChild onClick={onClose}>
              <Link href="/tools">Baking Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}