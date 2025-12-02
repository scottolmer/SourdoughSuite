import { Button } from "@/components/ui/button";
import { useCart, Product } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);
    
    // Provide visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <Button
      onClick={handleAddToCart}
      className={`mt-2 ${isAdding ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'} text-white px-4 py-2 rounded transition-colors duration-300 flex items-center justify-center gap-2 w-full`}
      disabled={isAdding}
    >
      <ShoppingCart className="w-4 h-4" />
      {isAdding ? "Added!" : "Add to Cart"}
    </Button>
  );
}