import { Platform } from 'react-native';

// Base URL for API requests
// In a real app, this would be your production API URL
// For local development, we need to use different URLs for iOS simulator vs Android emulator
const API_URL = Platform.select({
  ios: 'http://localhost:5000', // iOS simulator can use localhost
  android: 'http://10.0.2.2:5000', // Android emulator needs special IP
  default: 'https://your-production-domain.com', // For production
});

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log(`Making API request: ${endpoint}`, options);
  try {
    // Make sure the Content-Type header is set for JSON
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const url = `${API_URL}${endpoint}`;
    
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    
    // For DELETE requests or 204 status, return an empty success response
    if (options.method === 'DELETE' || res.status === 204) {
      return { success: true } as unknown as T;
    }
    
    const jsonData = await res.json();
    console.log(`API response received for ${endpoint}:`, jsonData);
    return jsonData;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Specific API methods
export const API = {
  // Recipes
  getRecipes: () => apiRequest<any[]>('/api/recipes'),
  getRecipeById: (id: number) => apiRequest<any>(`/api/recipes/${id}`),
  createRecipe: (recipe: any) => apiRequest<any>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  }),
  
  // Starters
  getStarters: () => apiRequest<any[]>('/api/starters'),
  getStarterById: (id: number) => apiRequest<any>(`/api/starters/${id}`),
  
  // Products
  getProducts: () => apiRequest<any[]>('/api/products'),
  getProductById: (id: number) => apiRequest<any>(`/api/products/${id}`),
  
  // User-specific
  getUserRecipes: () => apiRequest<any[]>('/api/user/recipes'),
};