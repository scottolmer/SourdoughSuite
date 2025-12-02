import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceDemo } from '@/components/performance/PerformanceDemo';
import { OptimizedImage } from '@/components/OptimizedImage';
import { SEO } from '@/components/SEO';

// Lazy load components for the tabs that aren't immediately visible
const LazyLoadedExample = lazy(() => 
  // Artificially delay loading for demo purposes only
  new Promise<{ default: React.ComponentType<any> }>(resolve => 
    setTimeout(() => {
      import('@/components/performance/PerformanceDemo').then(module => {
        resolve({ default: module.PerformanceDemo });
      });
    }, 1000)
  )
);

/**
 * Page demonstrating various performance optimization techniques
 */
const PerformanceOptimizationPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <SEO
        title="Performance Optimization | Bakehouse Breads"
        description="Explore the various performance optimization techniques used in our Bakehouse Breads application."
        keywords={['performance', 'optimization', 'lazy loading', 'code splitting', 'react']}
        canonicalUrl="/performance"
      />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Performance Optimization Lab</h1>
        
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">About This Page</h2>
          <p className="text-muted-foreground">
            This page serves as a demonstration of various performance optimization techniques 
            implemented in the Bakehouse Breads application. Each section showcases different 
            strategies for improving load times, reducing bundle size, and enhancing the 
            user experience through optimized loading patterns.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="mb-10">
          <TabsList className="grid w-full md:grid-cols-4 grid-cols-2 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lazy-loading">Lazy Loading</TabsTrigger>
            <TabsTrigger value="image-opt">Image Opt</TabsTrigger>
            <TabsTrigger value="data-prefetch">Data Prefetch</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Performance Optimization Overview</h3>
              <p>Our application uses several techniques to optimize performance:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Code Splitting</h4>
                  <p className="text-sm text-muted-foreground">
                    We use React.lazy and Suspense to split our code into smaller chunks that 
                    are loaded only when needed, reducing initial load time.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Image Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Images are loaded with responsive sizing, proper caching, and progressive 
                    loading techniques to improve perceived performance.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Data Prefetching</h4>
                  <p className="text-sm text-muted-foreground">
                    We prefetch data that users are likely to need next, making navigation 
                    feel instant and reducing loading states.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Debouncing & Throttling</h4>
                  <p className="text-sm text-muted-foreground">
                    User interactions like scrolling and searching are optimized to reduce 
                    unnecessary processing and API calls.
                  </p>
                </div>
              </div>
              
              <PerformanceDemo />
            </div>
          </TabsContent>
          
          <TabsContent value="lazy-loading" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Lazy Loading Demonstration</h3>
              <p className="mb-4">
                This tab demonstrates lazy loading. The component below is loaded only when this tab is selected.
                You'll see a loading spinner while it loads.
              </p>
              
              <div className="p-4 border rounded-lg">
                <Suspense 
                  fallback={
                    <div className="py-10 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading component...</span>
                    </div>
                  }
                >
                  <LazyLoadedExample />
                </Suspense>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="image-opt" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Image Optimization</h3>
              <p>
                The images below demonstrate our image optimization techniques including:
              </p>
              <ul className="list-disc list-inside mb-4">
                <li>Responsive sizing with srcset</li>
                <li>Progressive loading effects</li>
                <li>Lazy loading of off-screen images</li>
                <li>Proper alt text for accessibility</li>
              </ul>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <div className="p-2 border rounded-md">
                  <h4 className="font-semibold mb-2">Standard Image</h4>
                  <div className="overflow-hidden rounded-lg">
                    <img 
                      src="/images/starters/house-blend-starter.jpg" 
                      alt="House Blend Starter - Standard Image" 
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Standard &lt;img&gt; tag without optimizations
                  </p>
                </div>
                
                <div className="p-2 border rounded-md">
                  <h4 className="font-semibold mb-2">Optimized Image</h4>
                  <div className="overflow-hidden rounded-lg">
                    <OptimizedImage 
                      src="/images/starters/house-blend-starter.jpg"
                      alt="House Blend Starter - Optimized Image"
                      className="w-full h-auto"
                      progressive={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Using our OptimizedImage component with responsive loading
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data-prefetch" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Data Prefetching Demo</h3>
              <p>
                This demo shows how we prefetch data to make navigation feel instant.
                When you hover over the cards below, we prefetch the data for that starter.
              </p>
              
              <PerformanceDemo />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceOptimizationPage;