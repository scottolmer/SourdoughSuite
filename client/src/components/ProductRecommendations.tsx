import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";

interface ProductRecommendationsProps {
  category?: string;
  tags?: string[];
  relatedEntityType?: string;
  relatedEntityId?: number;
  maxProducts?: number;
}

export default function ProductRecommendations({ 
  category, 
  tags = [], 
  relatedEntityType,
  relatedEntityId,
  maxProducts = 3 
}: ProductRecommendationsProps) {
  // Simplified: Just fetch featured starters for v1.0
  const { data: starters, isLoading } = useQuery({
    queryKey: ['/api/starters'],
    queryFn: async () => {
      const response = await fetch('/api/starters');
      return await response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Products</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // v1.0: Show featured starters as product recommendations
  const recommendations = starters?.filter((starter: any) => starter.featured).slice(0, maxProducts) || [];

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-900">
          Essential Baking Tools & Starters
        </h3>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Curated Selection
        </Badge>
      </div>
      
      <p className="text-sm text-amber-700 mb-4">
        Enhance your baking journey with these carefully selected products that complement this article's techniques.
      </p>

      <div className="grid gap-4">
        {recommendations.map((item: any) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {item.imageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.price && (
                        <span className="font-semibold text-green-600 text-sm">
                          {item.price}
                        </span>
                      )}
                      {item.rating && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 ml-1">
                            {item.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/starters/${item.slug || item.id}`}>
                      <Button size="sm" variant="outline" className="h-7 px-3">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {item.price ? 'Buy' : 'Learn More'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/shop">
          <Button variant="outline" size="sm" className="bg-white">
            Browse All Products
          </Button>
        </Link>
      </div>
    </div>
  );
}