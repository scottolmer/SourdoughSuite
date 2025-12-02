import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Order } from "@shared/schema";

// Get all orders (admin)
export function useAllOrders() {
  return useQuery({
    queryKey: ['/api/orders'],
    refetchOnWindowFocus: false,
  });
}

// Get user orders
export function useUserOrders(userId: number) {
  return useQuery({
    queryKey: ['/api/user', userId, 'orders'],
    queryFn: () => apiRequest('GET', `/api/user/${userId}/orders`).then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
}

// Get order by ID
export function useOrder(id: number) {
  return useQuery({
    queryKey: ['/api/orders', id],
    queryFn: () => apiRequest('GET', `/api/orders/${id}`).then(res => res.json()),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}

// Create an order
export function useCreateOrder() {
  return useMutation({
    mutationFn: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest('POST', '/api/orders', order)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to create order');
          }
          return res.json();
        }),
    onSuccess: (data, variables) => {
      if (variables.userId) {
        // Invalidate user orders
        queryClient.invalidateQueries({ queryKey: ['/api/user', variables.userId, 'orders'] });
      }
      // Invalidate all orders
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiRequest('PATCH', `/api/orders/${id}/status`, { status })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to update order status');
          }
          return res.json();
        }),
    onSuccess: (data) => {
      // Invalidate specific order and all orders
      queryClient.invalidateQueries({ queryKey: ['/api/orders', data.id] });
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: ['/api/user', data.userId, 'orders'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });
}