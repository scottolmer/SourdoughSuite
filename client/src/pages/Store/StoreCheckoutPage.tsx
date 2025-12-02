import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStoreCart } from './StoreCartContext';

export default function StoreCheckoutPage() {
  const { items, getTotalPrice } = useStoreCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 75 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Items to Checkout</h1>
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Button onClick={() => window.location.href = '/'}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Bakehouse Store</title>
        <meta name="description" content="Complete your purchase securely." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/cart'}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
                <span className="font-semibold">Secure Checkout</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Secure payment processing would be integrated here
                        </p>
                        <p className="text-sm text-gray-500">
                          This is a demo store - no actual payments are processed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                            <img
                              src={item.imageUrl || '/images/placeholder-product.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-sm">
                            {formatPrice(parseFloat(item.price.replace('$', '')) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>
                          {shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 py-3 mt-6"
                      onClick={() => {
                        alert('This is a demo store. In a real implementation, this would process the payment.');
                      }}
                    >
                      Complete Order - {formatPrice(total)}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}