import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Star, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStoreCart } from './StoreCartContext';
import { getApiEndpoint } from '@/lib/subdomain';
import { useState } from 'react';

export default function StoreProductPage() {
  const { slug } = useParams();
  const { addItem } = useStoreCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch all products and find the matching one
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['store-products'],
    queryFn: async () => {
      const response = await fetch(getApiEndpoint('/products'));
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const product = products.find(p => p.slug === slug);

  const formatPrice = (price: string) => {
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    return `$${price}`;
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - Bakehouse Store</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Store
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
                <span className="font-semibold">Sourdough Suite Store</span>
              </div>
            </div>
          </div>
        </header>

        {/* Product Details */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.imageUrl || '/images/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.featured && (
                  <Badge className="mb-2 bg-amber-100 text-amber-800">
                    Featured Product
                  </Badge>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">(4.8) • 124 reviews</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-amber-600">
                {formatPrice(product.price)}
              </div>

              <div className="prose prose-gray">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>

              {/* Product Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.slug.toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}