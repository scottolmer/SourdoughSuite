import { Product } from "@shared/schema";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: number;
  className?: string;
}

export function ProductGrid({ 
  products, 
  isLoading = false, 
  columns = 3,
  className = ""
}: ProductGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[columns] || "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  if (isLoading) {
    return (
      <div className={`grid ${gridClasses} gap-6 md:gap-8 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[400px] animate-pulse bg-[#F5F5F5] rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-[#F8F8F8] rounded-lg">
        <h3 className="text-xl font-medium text-[#2B2B2B]">No products found</h3>
        <p className="text-[#6E6E6E] mt-2 max-w-md mx-auto">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses} gap-6 md:gap-8 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}