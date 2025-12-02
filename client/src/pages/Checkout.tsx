import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import { useCreatePaymentIntent } from "@/hooks/use-payment";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, CreditCard, CheckCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import CheckoutLayout from "@/components/CheckoutLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Load the Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Form schema for customer information
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string().min(3, "Address must be at least 3 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    postal_code: z.string().min(5, "Postal code must be at least 5 characters"),
    country: z.string().min(2, "Country must be at least 2 characters").default("US"),
  }),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

// Component for displaying the order summary
function OrderSummary() {
  const { items, getTotalPrice } = useCart();
  const subtotal = getTotalPrice();
  const shipping = subtotal > 7500 ? 0 : 599; // Free shipping over $75
  const tax = Math.round(subtotal * 0.07); // 7% tax
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.name}`} className="flex justify-between">
            <div className="flex">
              <span className="font-medium mr-2">{item.quantity}×</span>
              <span className="truncate">{item.name}</span>
            </div>
            <span className="font-mono ml-4">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="font-mono">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (7%)</span>
          <span className="font-mono">{formatPrice(tax)}</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span className="font-mono text-lg">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

// Checkout Form component with Stripe integration
function CheckoutForm({ clientSecret, customerInfo }: { clientSecret: string, customerInfo: CustomerFormValues }) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { clearCart, items, getTotalPrice } = useCart();
  const { toast } = useToast();
  const { mutateAsync: createOrder } = useCreateOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const subtotal = getTotalPrice();
  const shipping = subtotal > 7500 ? 0 : 599; // Free shipping over $75
  const tax = Math.round(subtotal * 0.07); // 7% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("Processing payment...");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: customerInfo.email,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.address.line1,
                city: customerInfo.address.city,
                state: customerInfo.address.state,
                postal_code: customerInfo.address.postal_code,
                country: customerInfo.address.country,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || "Something went wrong with the payment");
      } 
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful, create an order
        setPaymentStatus("Payment successful! Creating your order...");
        
        // Create the order in our system
        await createOrder({
          userId: 1, // This should come from auth context in a real app
          status: "pending",
          total,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          shippingAddress: customerInfo.address,
          paymentIntentId: paymentIntent.id,
          notes: customerInfo.notes,
        });
        
        // Clear the cart and navigate to confirmation
        clearCart();
        toast({
          title: "Order placed successfully!",
          description: "Thank you for your purchase.",
        });
        
        navigate("/order-confirmation");
      }
    } catch (error: any) {
      setPaymentStatus("");
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong with your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Information
          </h3>
          <PaymentElement />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-6 text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              {paymentStatus || "Processing..."}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Pay {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(total / 100)}
            </div>
          )}
        </Button>

        <div className="flex justify-center text-sm text-muted-foreground">
          <ShieldCheck className="mr-1 h-4 w-4" />
          <span>Secure, encrypted payment processing</span>
        </div>
      </div>
    </form>
  );
}

// Main Checkout Page component
export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const { mutateAsync: createPaymentIntent, isPending } = useCreatePaymentIntent();
  const [customerInfo, setCustomerInfo] = useState<CustomerFormValues | null>(null);
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "US",
      },
      notes: "",
    },
  });

  useEffect(() => {
    // If cart is empty, redirect to shop
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some items to your cart before checkout",
      });
      navigate("/shop");
    }
  }, [items, navigate, toast]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const subtotal = getTotalPrice();
      const shipping = subtotal > 7500 ? 0 : 599; // Free shipping over $75
      const tax = Math.round(subtotal * 0.07); // 7% tax
      const total = subtotal + shipping + tax;

      // Create a payment intent with Stripe
      const response = await createPaymentIntent({
        amount: total,
        items,
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        },
      });

      // Set the client secret from the payment intent
      setClientSecret(response.clientSecret);
      
      // Save customer info for the payment form
      setCustomerInfo(data);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    }
  };

  // Display the appropriate step in the checkout flow
  return (
    <CheckoutLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-serif font-semibold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {clientSecret ? (
              // Step 2: Payment details with Stripe
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-medium mb-6">Payment</h2>
                    {customerInfo && <CheckoutForm clientSecret={clientSecret} customerInfo={customerInfo} />}
                  </CardContent>
                </Card>
              </Elements>
            ) : (
              // Step 1: Customer information form
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-medium mb-6">Shipping Information</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Shipping Address</h3>
                        
                        <FormField
                          control={form.control}
                          name="address.line1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="address.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="San Francisco" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address.state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State / Province</FormLabel>
                                <FormControl>
                                  <Input placeholder="CA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="address.postal_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="94103" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address.country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="US" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Notes (optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special instructions for delivery, etc." 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                          <div className="flex items-center">
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Processing...
                          </div>
                        ) : (
                          "Continue to Payment"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}