import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCart, addToCart, updateCartItem, removeFromCart, createCheckoutSession } from '../api/apiClient';
import { useUser } from './UserContext';

// Define types for cart data
export interface CartItem {
  id: number;
  productId: number;
  productType: 'starter' | 'product' | 'recipe';
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  expiresAt: string;
}

interface ShopContextType {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateItem: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  shippingAddress: ShippingAddress | null;
  updateShippingAddress: (address: ShippingAddress) => Promise<void>;
  checkout: () => Promise<CheckoutSession>;
  clearError: () => void;
}

// Create context with default values
const ShopContext = createContext<ShopContextType>({
  cart: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  error: null,
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  shippingAddress: null,
  updateShippingAddress: async () => {},
  checkout: async () => ({ id: '', url: '', expiresAt: '' }),
  clearError: () => {},
});

// Shop provider component
export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useUser();

  // Calculate derived values
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Load cart data on component mount and when login state changes
  useEffect(() => {
    const loadCartData = async () => {
      try {
        setIsLoading(true);
        
        if (isLoggedIn) {
          // If logged in, fetch cart from server
          const serverCart = await fetchCart();
          setCart(serverCart);
        } else {
          // If not logged in, check local storage
          const storedCart = await AsyncStorage.getItem('cart');
          if (storedCart) {
            setCart(JSON.parse(storedCart));
          }
        }
        
        // Load shipping address
        const storedAddress = await AsyncStorage.getItem('shippingAddress');
        if (storedAddress) {
          setShippingAddress(JSON.parse(storedAddress));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load cart');
        console.error('Failed to load cart:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCartData();
  }, [isLoggedIn]);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    const saveCartToStorage = async () => {
      if (!isLoggedIn) {
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
      }
    };
    
    saveCartToStorage();
  }, [cart, isLoggedIn]);

  // Add item to cart
  const addItem = async (item: Omit<CartItem, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isLoggedIn) {
        // If logged in, add through API
        const updatedCart = await addToCart(item);
        setCart(updatedCart);
      } else {
        // If not logged in, handle locally
        // Check if item already exists
        const existingItemIndex = cart.findIndex(
          (cartItem) => cartItem.productId === item.productId && cartItem.productType === item.productType
        );
        
        if (existingItemIndex >= 0) {
          // If item exists, update quantity
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += item.quantity;
          setCart(updatedCart);
        } else {
          // If item doesn't exist, add it with a local ID
          const newItem = {
            ...item,
            id: Date.now(), // Use timestamp as temporary ID
          };
          setCart([...cart, newItem]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateItem = async (id: number, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (quantity <= 0) {
        await removeItem(id);
        return;
      }
      
      if (isLoggedIn) {
        // If logged in, update through API
        const updatedCart = await updateCartItem(id, quantity);
        setCart(updatedCart);
      } else {
        // If not logged in, handle locally
        const updatedCart = cart.map((item) => 
          item.id === id ? { ...item, quantity } : item
        );
        setCart(updatedCart);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isLoggedIn) {
        // If logged in, remove through API
        const updatedCart = await removeFromCart(id);
        setCart(updatedCart);
      } else {
        // If not logged in, handle locally
        const updatedCart = cart.filter((item) => item.id !== id);
        setCart(updatedCart);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove item from cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isLoggedIn) {
        // If logged in, clear through API by removing each item
        // This is a simplification - ideally the API would have a clear cart endpoint
        for (const item of cart) {
          await removeFromCart(item.id);
        }
      }
      
      // Clear local cart state
      setCart([]);
      await AsyncStorage.removeItem('cart');
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update shipping address
  const updateShippingAddress = async (address: ShippingAddress) => {
    try {
      setShippingAddress(address);
      await AsyncStorage.setItem('shippingAddress', JSON.stringify(address));
    } catch (err: any) {
      setError(err.message || 'Failed to update shipping address');
      throw err;
    }
  };

  // Proceed to checkout
  const checkout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isLoggedIn) {
        throw new Error('You must be logged in to checkout');
      }
      
      if (!shippingAddress) {
        throw new Error('Shipping address is required');
      }
      
      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }
      
      // Create checkout session through API
      const session = await createCheckoutSession(cart);
      return session;
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Create the value object with all the context data and functions
  const value = {
    cart,
    totalItems,
    subtotal,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    shippingAddress,
    updateShippingAddress,
    checkout,
    clearError,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// Custom hook for using shop context
export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export default ShopContext;