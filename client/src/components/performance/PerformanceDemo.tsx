import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/OptimizedImage';
import { debounce, prefetchRouteData } from '@/utils/performanceOptimizations';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics';

/**
 * Component to demonstrate various performance optimizations
 */
export const PerformanceDemo: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Fetch some data using React Query with performance optimizations
  const { data: starters = [] } = useQuery<any[]>({
    queryKey: ['/api/starters'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Debounced search handler
  const handleSearch = debounce((value: string) => {
    console.log('Searching for:', value);
    // In a real app, this would trigger a query with the search term
  }, 300);
  
  // Handle search input changes
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };
  
  // Prefetch recipe data when component mounts
  useEffect(() => {
    prefetchRouteData('/api/recipes')
      .then(() => console.log('Prefetched recipe data'))
      .catch(error => console.error('Failed to prefetch:', error));
  }, []);
  
  // Example function to track user engagement
  const handleCardClick = (id: number) => {
    trackEvent('starter_card_click', 'user_engagement', id.toString());
    toast({
      title: 'Performance Demo',
      description: 'Clicked on starter card - this event is being tracked in analytics',
    });
  };
  
  return (
    <div className="space-y-6 p-4 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Performance Optimizations Demo</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          This component demonstrates several performance optimization techniques including:
        </p>
        <ul className="list-disc list-inside text-xs md:text-sm text-muted-foreground ml-2 md:ml-4 mt-2">
          <li>Code-splitting and lazy loading</li>
          <li>Optimized image loading with responsive srcsets</li>
          <li>Data prefetching</li>
          <li>Debounced search input</li>
          <li>React Query caching</li>
          <li>Analytics integration</li>
        </ul>
      </div>
      
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search starters... (with debounce)"
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full max-w-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {starters.length > 0 ? (
          starters.slice(0, 3).map((starter: any, index: number) => (
            <Card key={starter.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="h-48 w-full overflow-hidden">
                  <OptimizedImage
                    src={starter.imageUrl || '/images/starters/default-starter.jpg'}
                    alt={starter.name}
                    className="w-full h-full"
                    objectFit="cover"
                    priority={index === 0} // Only prioritize the first image
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle>{starter.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {starter.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleCardClick(starter.id)}
                >
                  View Details
                </Button>
                <Link href={`/starter-product/${starter.id}`} onClick={() => prefetchRouteData(['/api/starters', starter.id.toString()])}>
                  <Button variant="default">Learn More</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            Loading starter data...
          </div>
        )}
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={() => {
            toast({
              title: 'Data Prefetched',
              description: 'Recipe data has been prefetched for faster navigation',
            });
            prefetchRouteData('/api/recipes');
            trackEvent('prefetch_recipes', 'performance', 'manual_prefetch');
          }}
        >
          Manually Prefetch Recipe Data
        </Button>
      </div>
    </div>
  );
};