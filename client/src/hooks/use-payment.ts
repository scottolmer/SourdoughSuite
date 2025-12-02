import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartItem } from "@/context/CartContext";

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

interface CreatePaymentIntentParams {
  amount: number;
  items?: CartItem[];
  customer?: CustomerInfo;
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (params: CreatePaymentIntentParams) => 
      apiRequest('POST', '/api/create-payment-intent', params)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to create payment intent');
          }
          return res.json();
        }),
  });
}