import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiEndpoint } from '@/lib/subdomain';

function ProductCard({ product }: { product: any }) {
  const formatPrice = (price: string) => {
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    return `$${price}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl || '/images/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {product.featured && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Featured
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-amber-600">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">4.8</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-amber-600 hover:bg-amber-700"
          onClick={() => window.location.href = `/products/${product.slug}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function StoreCategoryPage() {
  const { category } = useParams();

  // Fetch products and filter by category
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['store-products'],
    queryFn: async () => {
      const response = await fetch(getApiEndpoint('/products'));
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const products = allProducts.filter(product => product.category === category);

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Products';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{categoryName} - Bakehouse Store</title>
        <meta name="description" content={`Browse our collection of ${categoryName.toLowerCase()} products for sourdough baking.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Store
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
                <span className="font-semibold">Bakehouse Store</span>
              </div>
            </div>
          </div>
        </header>

        {/* Category Header */}
        <section className="bg-white border-b py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
            <p className="text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Failed to load products</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 mb-4">No products found in this category</p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse All Products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}