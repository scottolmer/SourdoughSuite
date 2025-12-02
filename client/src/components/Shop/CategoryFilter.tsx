import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-stone-800 mb-3">Categories</h2>
      <ScrollArea className="whitespace-nowrap pb-2">
        <div className="flex space-x-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className={selectedCategory === null 
              ? "bg-amber-600 hover:bg-amber-700" 
              : "hover:bg-amber-50"}
            onClick={() => onSelectCategory(null)}
          >
            All Products
          </Button>
          
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={selectedCategory === category 
                ? "bg-amber-600 hover:bg-amber-700" 
                : "hover:bg-amber-50"}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}