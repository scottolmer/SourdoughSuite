import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Define API base URL based on environment
// For development, we typically use different endpoints for iOS simulator vs Android emulator
const getBaseURL = (): string => {
  // In production, we would use the deployed API URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://bakehouse-breads-api.replit.app';
  }
  
  // For development, use localhost with the correct IP
  // iOS simulator can use localhost, but Android emulator needs the machine's IP
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  } else {
    // Android emulator
    return 'http://10.0.2.2:3000'; // Default Android emulator IP that maps to host machine
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401 errors)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.post('/api/auth/refresh', {
            refresh_token: refreshToken,
          });
          
          // If successful, update tokens and retry the original request
          if (response.data.token) {
            await AsyncStorage.setItem('authToken', response.data.token);
            if (response.data.refreshToken) {
              await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // Update auth header and retry
            apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token', refreshError);
        
        // If refresh fails, log out the user
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        
        // Here you would typically redirect to login screen
        // or use a global state to force logout
      }
    }
    
    return Promise.reject(error);
  }
);

// API functions

// Auth
export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/api/auth/login', { username, password });
  
  // Store auth tokens and user data
  if (response.data.token) {
    await AsyncStorage.setItem('authToken', response.data.token);
    if (response.data.refreshToken) {
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    }
    if (response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
  }
  
  return response.data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    console.error('Error logging out', error);
  } finally {
    // Remove auth tokens and user data regardless of API response
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
  }
};

// Recipes
export const fetchRecipes = async () => {
  const response = await apiClient.get('/api/recipes');
  return response.data;
};

export const fetchRecipeById = async (recipeId: number) => {
  const response = await apiClient.get(`/api/recipes/${recipeId}`);
  return response.data;
};

export const saveRecipe = async (recipeData: any) => {
  const response = await apiClient.post('/api/recipes', recipeData);
  return response.data;
};

export const updateRecipe = async (recipeId: number, recipeData: any) => {
  const response = await apiClient.put(`/api/recipes/${recipeId}`, recipeData);
  return response.data;
};

export const deleteRecipe = async (recipeId: number) => {
  const response = await apiClient.delete(`/api/recipes/${recipeId}`);
  return response.data;
};

// Starters
export const fetchStarters = async () => {
  const response = await apiClient.get('/api/starters');
  return response.data;
};

export const fetchStarterById = async (starterId: number) => {
  const response = await apiClient.get(`/api/starters/${starterId}`);
  return response.data;
};

// User Starters (saved user starters)
export const fetchUserStarters = async () => {
  const response = await apiClient.get('/api/user/starters');
  return response.data;
};

export const saveUserStarter = async (starterData: any) => {
  const response = await apiClient.post('/api/user/starters', starterData);
  return response.data;
};

export const updateUserStarter = async (starterId: number, starterData: any) => {
  const response = await apiClient.put(`/api/user/starters/${starterId}`, starterData);
  return response.data;
};

export const deleteUserStarter = async (starterId: number) => {
  const response = await apiClient.delete(`/api/user/starters/${starterId}`);
  return response.data;
};

export const recordStarterFeeding = async (starterId: number, feedingData: any) => {
  const response = await apiClient.post(`/api/user/starters/${starterId}/feedings`, feedingData);
  return response.data;
};

// Shop
export const fetchProducts = async () => {
  const response = await apiClient.get('/api/products');
  return response.data;
};

export const fetchProductById = async (productId: number) => {
  const response = await apiClient.get(`/api/products/${productId}`);
  return response.data;
};

// Cart
export const fetchCart = async () => {
  const response = await apiClient.get('/api/cart');
  return response.data;
};

export const addToCart = async (productData: any) => {
  const response = await apiClient.post('/api/cart', productData);
  return response.data;
};

export const updateCartItem = async (itemId: number, itemData: any) => {
  const response = await apiClient.put(`/api/cart/${itemId}`, itemData);
  return response.data;
};

export const removeFromCart = async (itemId: number) => {
  const response = await apiClient.delete(`/api/cart/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await apiClient.delete('/api/cart');
  return response.data;
};

// User profile
export const fetchUserProfile = async () => {
  const response = await apiClient.get('/api/user/profile');
  return response.data;
};

export const updateUserProfile = async (profileData: any) => {
  const response = await apiClient.put('/api/user/profile', profileData);
  return response.data;
};

// Recipe validator
export const validateRecipe = async (recipeData: any) => {
  const response = await apiClient.post('/api/tools/recipe-validator', recipeData);
  return response.data;
};

// Recipe generator
export const generateRecipe = async (generatorData: any) => {
  const response = await apiClient.post('/api/tools/recipe-generator', generatorData);
  return response.data;
};

// Orders
export const createOrder = async (orderData: any) => {
  const response = await apiClient.post('/api/orders', orderData);
  return response.data;
};

export const fetchOrders = async () => {
  const response = await apiClient.get('/api/orders');
  return response.data;
};

export const fetchOrderById = async (orderId: number) => {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return response.data;
};

export default apiClient;