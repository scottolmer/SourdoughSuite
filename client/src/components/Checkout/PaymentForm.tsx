import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface PaymentFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function PaymentForm({ onSuccess, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message || 'An error occurred with the payment form');
        return;
      }

      // Confirm the payment
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/checkout',
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
      } else {
        // Payment succeeded
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your order!',
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      <div className="flex gap-4">
        <Button 
          type="button" 
          onClick={onBack}
          variant="outline" 
          className="w-1/3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          type="submit"
          disabled={!stripe || loading}
          className="w-2/3 bg-amber-600 hover:bg-amber-700 text-white"
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </Button>
      </div>
    </form>
  );
}