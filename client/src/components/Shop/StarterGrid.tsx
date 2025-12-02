import { SourdoughStarter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Function to get color for a starter based on ID
function getStarterColor(starterId: number): string {
  if (starterId === 6) return '#8B4513';  // Koji - brown
  if (starterId === 7) return '#DC143C';  // San Francisco - crimson
  if (starterId === 8) return '#654321';  // Traditional Rye - dark brown
  if (starterId === 10) return '#D2B48C'; // House Blend - tan
  if (starterId === 1) return '#556B2F';  // Homemade - olive
  return '#D2B48C'; // Default - tan
}

// Function to get image filename for a starter
function getImageFilename(starterId: number): string {
  if (starterId === 6) return 'koji-starter.jpg';
  if (starterId === 7) return 'san-francisco-starter.jpg';
  if (starterId === 8) return 'rye-starter.jpg';
  if (starterId === 10) return 'house-blend-starter.jpg';
  if (starterId === 1) return 'homemade-starter.png';
  return 'house-blend-starter.jpg'; // Default
}

interface StarterGridProps {
  starters: SourdoughStarter[];
  isLoading?: boolean;
  columns?: number;
  className?: string;
}

export function StarterGrid({ 
  starters, 
  isLoading = false, 
  columns = 3,
  className = ""
}: StarterGridProps) {
  // Debug - log starters data in grid component
  console.log("StarterGrid received starters:", starters);
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (isLoading) {
    return (
      <div className={`grid ${gridClasses} gap-6 md:gap-8 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[400px] animate-pulse bg-[#F5F5F5] rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!starters || starters.length === 0) {
    return (
      <div className="text-center py-12 bg-[#F8F8F8] rounded-lg">
        <h3 className="text-xl font-medium text-[#2B2B2B]">No starters found</h3>
        <p className="text-[#6E6E6E] mt-2 max-w-md mx-auto">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses} gap-6 md:gap-8 ${className}`}>
      {starters.map((starter) => (
        <StarterCard key={starter.id} starter={starter} />
      ))}
    </div>
  );
}

function StarterCard({ starter }: { starter: SourdoughStarter }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Convert starter to product format for cart
    const productForCart = {
      id: starter.id,
      name: starter.name,
      description: starter.description,
      price: typeof starter.price === 'string' 
        ? parseInt(starter.price.replace(/[^0-9.-]+/g,"")) * 100 
        : starter.price * 100,
      imageUrl: starter.imageUrl,
      inStock: starter.inStock,
      category: 'starter',
      slug: starter.slug,
      featured: starter.featured,
    };
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(productForCart);
      setIsAdding(false);
      
      toast({
        title: "Added to cart",
        description: `${starter.name} has been added to your cart.`,
      });
    }, 300);
  };
  
  // Extract flavors from the flavor object
  const getFlavorDisplay = (): string => {
    if (!starter.flavor) return 'N/A';
    
    if (typeof starter.flavor === 'string') {
      return starter.flavor;
    }
    
    if (typeof starter.flavor === 'object') {
      return Object.keys(starter.flavor).join(', ');
    }
    
    return 'N/A';
  };
  
  // Format price for display
  const getFormattedPrice = (): string => {
    if (typeof starter.price === 'string') {
      return starter.price;
    }
    
    if (typeof starter.price === 'number') {
      return `$${starter.price.toFixed(2)}`;
    }
    
    return '$0.00';
  };

  // Handle image error
  const handleImageError = () => {
    console.log(`Image error for ${starter.name} with URL: ${starter.imageUrl}`);
    setImageError(true);
  };
  
  // Debug image loading
  console.log(`Attempting to load image for ${starter.name}: ${starter.imageUrl}`);
  useEffect(() => {
    if (starter.imageUrl) {
      const img = new Image();
      img.src = starter.imageUrl;
      img.onload = () => console.log(`Successfully loaded image for ${starter.name}`);
      img.onerror = () => {
        console.log(`Failed to load image for ${starter.name} with URL: ${starter.imageUrl}`);
        setImageError(true);
      };
    }
  }, [starter.imageUrl, starter.name]);

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
      <div className="block relative pt-[130%] overflow-hidden bg-gradient-to-br from-[#F8F8F8] to-[#F0F0F0] rounded-t-lg">
        <Link href={`/starter-product/${starter.slug || starter.id}`}>
          <div className="cursor-pointer absolute inset-0">
            {imageError ? (
              <div 
                className="w-full h-full flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: getStarterColor(starter.id) 
                }}
              >
                <span className="text-white text-2xl lg:text-3xl font-semibold mb-2">
                  {starter.name.split(' ').map(word => word[0]).join('')}
                </span>
                <span className="text-white text-sm lg:text-base px-4 text-center">
                  {starter.name}
                </span>
              </div>
            ) : (
              <img
                src={`/images/starters/${getImageFilename(starter.id)}`}
                alt={starter.name}
                className="w-full h-full object-contain p-3 pb-8 transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError}
              />
            )}
          </div>
        </Link>
        <Badge className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 text-xs lg:text-sm">
          Coming Soon
        </Badge>
        {starter.featured && (
          <Badge className="absolute top-10 right-3 bg-[#D97706] hover:bg-[#B45309] text-xs lg:text-sm">
            Featured
          </Badge>
        )}
        {!starter.inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="outline" className="text-base font-medium py-1 px-3 border-gray-400 text-gray-700">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-medium text-[#2B2B2B]">
            <Link href={`/starter-product/${starter.slug || starter.id}`}>
              <div className="hover:text-[#D97706] transition-colors cursor-pointer line-clamp-2">
                {starter.name}
              </div>
            </Link>
          </CardTitle>
          <span className="font-mono text-lg font-semibold text-[#D97706] whitespace-nowrap">
            {getFormattedPrice()}
          </span>
        </div>
        <CardDescription className="line-clamp-2 h-10 mt-1 text-[#6E6E6E]">
          {starter.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-grow">
        <div className="mt-3">
          <p className="text-sm text-[#6E6E6E]"><strong>Flavor:</strong> {getFlavorDisplay()}</p>
          <p className="text-sm text-[#6E6E6E]"><strong>Maintenance:</strong> {starter.maintenance?.difficulty || 'N/A'}</p>
          {starter.mainFlour && (
            <p className="text-sm text-[#6E6E6E]"><strong>Main Flour:</strong> {starter.mainFlour}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-1">
        <Button 
          disabled={true}
          className="w-full bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
          variant="outline"
        >
          Coming Soon
        </Button>
      </CardFooter>
    </Card>
  );
}