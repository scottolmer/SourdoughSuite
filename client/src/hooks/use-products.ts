import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

// Get all products
export function useAllProducts() {
  return useQuery({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
  });
}

// Get products by category
export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['/api/products/category', category],
    queryFn: () => apiRequest('GET', `/api/products/category/${category}`).then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!category,
  });
}

// Get featured products
export function useFeaturedProducts(limit: number = 6) {
  return useQuery({
    queryKey: ['/api/products/featured', limit],
    queryFn: () => apiRequest('GET', `/api/products/featured?limit=${limit}`).then(res => res.json()),
    refetchOnWindowFocus: false,
  });
}

// Get product by ID
export function useProduct(id: number) {
  return useQuery({
    queryKey: ['/api/products', id],
    queryFn: () => apiRequest('GET', `/api/products/${id}`).then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}

// Get product by slug
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['/api/products/slug', slug],
    queryFn: () => apiRequest('GET', `/api/products/slug/${slug}`).then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!slug,
  });
}

// Search products
export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['/api/products/search', query],
    queryFn: () => apiRequest('GET', `/api/products/search?query=${encodeURIComponent(query)}`).then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!query && query.length >= 2, // Only search when query is at least 2 characters
  });
}

// Create a product
export function useCreateProduct() {
  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest('POST', '/api/products', product)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to create product');
          }
          return res.json();
        }),
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
}

// Update a product
export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, product }: { id: number, product: Partial<Product> }) => 
      apiRequest('PATCH', `/api/products/${id}`, product)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to update product');
          }
          return res.json();
        }),
    onSuccess: (_, variables) => {
      // Invalidate specific product and all products
      queryClient.invalidateQueries({ queryKey: ['/api/products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
}

// Delete a product
export function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/products/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to delete product');
          }
          return true;
        }),
    onSuccess: (_, id) => {
      // Invalidate specific product and all products
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
}