import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Trash, Minus, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CartProps {
  isMobile?: boolean;
}

export default function Cart({ isMobile = false }: CartProps) {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCart();

  const totalItems = getTotalItems();

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {isMobile ? (
          <button className="relative focus:outline-none">
            <ShoppingCart className="h-6 w-6 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </span>
            )}
          </button>
        ) : (
          <Button variant="outline" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {totalItems}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {totalItems === 0 
              ? "Your cart is empty." 
              : `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart.`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-grow overflow-auto py-4">
          {items.length === 0 ? (
            <div className="py-8 text-center text-stone-500">
              Your cart is empty. Add some delicious bread to get started!
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(item => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-16 h-16">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded" 
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-stone-800">{item.name}</h4>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-amber-600">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border rounded-l"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 py-1 border-t border-b">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border rounded-r"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {items.length > 0 && (
          <>
            <Separator />
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-medium pt-2">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="pt-4 space-y-2">
                <Button onClick={handleCheckout} className="w-full bg-amber-600 hover:bg-amber-700">
                  Checkout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearCart} 
                  className="w-full text-red-500 border-red-200 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}