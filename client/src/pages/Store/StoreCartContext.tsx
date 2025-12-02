import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  slug?: string;
}

interface StoreProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  slug: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

interface StoreCartContextType {
  cartItems: CartItem[];
  addToCart: (product: StoreProduct, quantity: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

const StoreCartContext = createContext<StoreCartContextType | undefined>(undefined);

export function StoreCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('store-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('store-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: StoreProduct, quantity: number = 1) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...currentItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        description: product.description,
        category: product.category,
        slug: product.slug
      }];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <StoreCartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotalPrice
    }}>
      {children}
    </StoreCartContext.Provider>
  );
}

export function useStoreCart() {
  const context = useContext(StoreCartContext);
  if (context === undefined) {
    throw new Error('useStoreCart must be used within a StoreCartProvider');
  }
  return context;
}