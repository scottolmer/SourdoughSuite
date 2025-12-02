import React from 'react';
import { useParams, useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import StarterProductTemplate from '@/components/Starter/StarterProductTemplate';
import { starterProducts } from '@/components/Starter/StarterData';
import { SEO } from '@/components/SEO';
import { generateProductSchema, generateWebpageSEO } from '@/lib/schema';

export default function StarterProduct() {
  const [, params] = useRoute('/starter-product/:id');
  const slug = params?.id;
  const { data: starters } = useQuery<any[]>({
    queryKey: ["/api/starters"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle numeric ID and slug format
  let starter;
  let id = '';
  
  if (starters && starters.length > 0) {
    // Check if the ID is numeric
    if (slug && !isNaN(Number(slug))) {
      id = slug;
      starter = starters.find(s => s.id.toString() === slug);
    } else {
      // Find by slug with flexible matching
      starter = starters.find(s => {
        if (s.slug === slug) return true;
        
        // Handle common slug variations
        if (!slug) return false;
        const normalizedSlug = slug.toLowerCase().replace(/[-_\s]+/g, '-');
        const normalizedStarterSlug = s.slug?.toLowerCase().replace(/[-_\s]+/g, '-');
        
        // Check for partial matches for common variations
        if (normalizedStarterSlug && normalizedSlug) {
          // San Francisco variations
          if ((normalizedSlug.includes('san-francisco') && normalizedStarterSlug.includes('san-francisco')) ||
              (normalizedSlug.includes('sf') && normalizedStarterSlug.includes('san-francisco'))) {
            return true;
          }
          
          // Check if slug is a substring of the starter slug or vice versa
          if (normalizedStarterSlug.includes(normalizedSlug) || normalizedSlug.includes(normalizedStarterSlug)) {
            return true;
          }
        }
        
        return false;
      });
      
      if (starter) {
        id = starter.id.toString();
      }
    }
  } else {
    // Fallback to static data if API fails
    if (slug && !isNaN(Number(slug))) {
      id = slug;
      starter = starterProducts.find(product => product.id === id);
    } else {
      // Find by slug in static data
      starter = starterProducts.find(product => 
        product.slug === slug || 
        product.name.toLowerCase().replace(/\s+/g, '-') === slug
      );
      if (starter) {
        id = String(starter.id);
      }
    }
  }
  
  // If trying to access homemade starter (id: 1), show a message
  if (id === '1' || slug === 'homemade-starter') {
    return (
      <>
        <SEO 
          title="Homemade Starter - Bakehouse Breads"
          description="Track and maintain your homemade sourdough starter with our specialized tools. Learn how to care for your starter and achieve consistent baking results."
          canonicalUrl="/starter-product/homemade-starter"
          keywords={["homemade sourdough starter", "sourdough starter maintenance", "track sourdough starter"]}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Homemade Starter</h1>
            <p className="mb-4">Your homemade starter is not available for purchase. It's created and maintained by you!</p>
            <p className="mb-6">You can track and maintain your homemade starter in the Starter Maintenance tools.</p>
            <div className="flex justify-center gap-4">
              <Link href="/starter/maintenance">
                <span className="px-4 py-2 bg-amber-600 text-white rounded-md cursor-pointer hover:bg-amber-700">
                  Go to Maintenance
                </span>
              </Link>
              <Link href="/shop">
                <span className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                  View Shop
                </span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  if (!starter) {
    return (
      <>
        <SEO 
          title="Starter Not Found - Bakehouse Breads"
          description="We couldn't find the sourdough starter you're looking for. Explore our collection of unique sourdough starters in our shop."
          canonicalUrl="/shop"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Starter not found</h1>
            <p className="mt-2">The requested starter does not exist.</p>
          </div>
        </div>
      </>
    );
  }
  
  // Determine the best slug to use in URLs
  const displaySlug = starter.slug || slug || starter.id;
  
  // Generate structured data for this product
  const productSchema = generateProductSchema({
    name: starter.name,
    description: starter.description,
    id: starter.id,
    imageUrl: starter.imageUrl?.replace('.png', '.jpg'),
    price: typeof starter.price === 'number' ? starter.price.toFixed(2) : starter.price,
    slug: displaySlug,
    keywords: getKeywordsForStarter(starter)
  });

  const seoData = generateWebpageSEO({
    title: `${starter.name} - Premium Sourdough Starter | Bakehouse Breads`,
    description: starter.description,
    canonicalUrl: `/starter-product/${displaySlug}`,
    type: 'product',
    keywords: getKeywordsForStarter(starter),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: starter.name, url: `/starter-product/${displaySlug}` }
    ]
  }, productSchema);
  
  return (
    <>
      <SEO 
        title={`${starter.name} - Premium Sourdough Starter | Bakehouse Breads`}
        description={starter.description}
        canonicalUrl={`/starter-product/${displaySlug}`}
        keywords={getKeywordsForStarter(starter)}
        structuredData={seoData}
        ogType="product"
        ogImage={starter.imageUrl?.replace('.png', '.jpg')}
        price={typeof starter.price === 'string' ? starter.price : `$${starter.price}`}
        availability="InStock"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: starter.name, url: `/starter-product/${displaySlug}` }
        ]}
      />
      <StarterProductTemplate {...starter} />
    </>
  );
}

// Helper function to generate relevant keywords based on starter properties
function getKeywordsForStarter(starter: any): string[] {
  const baseKeywords = ["sourdough starter", "artisan bread", "baking", "fermentation"];
  const nameKeywords = starter.name.toLowerCase().split(' ').filter((word: string) => word.length > 3);
  
  // Add flavor profile keywords
  let flavorKeywords: string[] = [];
  
  // Handle different formats of flavor profile data
  if (starter.flavorProfile) {
    if (Array.isArray(starter.flavorProfile)) {
      // If it's already an array, use it
      flavorKeywords = starter.flavorProfile
        .join(' ')
        .toLowerCase()
        .split(' ')
        .filter((word: string) => 
          word.length > 3 && 
          !baseKeywords.includes(word) && 
          !nameKeywords.includes(word)
        );
    } else if (typeof starter.flavorProfile === 'object') {
      // If it's an object (like from API), use the keys
      flavorKeywords = Object.keys(starter.flavorProfile)
        .join(' ')
        .toLowerCase()
        .split(' ')
        .filter((word: string) => 
          word.length > 3 && 
          !baseKeywords.includes(word) && 
          !nameKeywords.includes(word)
        );
    } else if (typeof starter.flavorProfile === 'string') {
      // If it's a string, split it
      flavorKeywords = starter.flavorProfile
        .toLowerCase()
        .split(' ')
        .filter((word: string) => 
          word.length > 3 && 
          !baseKeywords.includes(word) && 
          !nameKeywords.includes(word)
        );
    }
  }
  
  // Create a unique set of keywords
  const allKeywords = [...baseKeywords, ...nameKeywords, ...flavorKeywords];
  const uniqueKeywords = Array.from(new Set(allKeywords));
  
  return uniqueKeywords.slice(0, 10); // Limit to top 10 most relevant keywords
}