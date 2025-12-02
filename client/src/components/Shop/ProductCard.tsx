import { useState } from "react";
import { useCart, type Product } from "@/context/CartContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem(product);
      setIsAdding(false);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }, 300);
  };

  const formatPrice = (price: number) => {
    // Convert from cents to dollars
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="block relative pt-[75%] overflow-hidden bg-[#F8F8F8]">
        <Link href={`/products/${product.slug}`}>
          <div className="cursor-pointer absolute inset-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-[#F5F5F5] flex items-center justify-center text-[#9E9E9E]">
                No Image
              </div>
            )}
          </div>
        </Link>
        {product.featured && (
          <Badge className="absolute top-3 right-3 bg-[#D97706] hover:bg-[#B45309]">
            Featured
          </Badge>
        )}
        {!product.inStock && (
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
            <Link href={`/products/${product.slug}`}>
              <div className="hover:text-[#D97706] transition-colors cursor-pointer line-clamp-2">
                {product.name}
              </div>
            </Link>
          </CardTitle>
          <span className="font-mono text-lg font-semibold text-[#D97706] whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <CardDescription className="line-clamp-2 h-10 mt-1 text-[#6E6E6E]">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-grow">
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.tags && (Array.isArray(product.tags)) && product.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-[#F0F0F0] text-[#6E6E6E] hover:bg-[#E0E0E0]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-1">
        <Button 
          onClick={handleAddToCart} 
          disabled={isAdding || !product.inStock}
          className="w-full"
          variant={product.inStock ? "default" : "outline"}
        >
          {isAdding ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}