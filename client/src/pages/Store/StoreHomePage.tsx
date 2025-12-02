import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { 
  ShoppingCart, 
  Star, 
  Badge, 
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge as UIBadge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStoreCart } from './StoreCartContext';

interface StoreProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  slug: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

export default function StoreHomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToCart, cartItems } = useStoreCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/store/products'],
    queryFn: async () => {
      const response = await fetch('/api/store/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as StoreProduct[];
    }
  });

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
        case 'price-high':
          return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  const featuredProducts = products.filter(product => product.featured).slice(0, 3);
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const getItemInCart = (productId: number) => 
    cartItems.find(item => item.id === productId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bakehouse Breads Store - Premium Sourdough Starters & Supplies</title>
        <meta name="description" content="Shop premium sourdough starters, baking tools, and artisan bread supplies. Free shipping on orders over $50." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <h1 className="text-xl font-bold text-amber-800">Bakehouse Breads Store</h1>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/cart">
                  <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-12 lg:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Premium Sourdough Starters</h2>
            <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto">
              Handcrafted starters with generations of flavor. Start your artisan baking journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50">
                Shop Starters
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-amber-700">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <Truck className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Free shipping over $50</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Quality guaranteed</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">30-day returns</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-center mb-8">Featured Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.badge && (
                        <UIBadge className="absolute top-2 left-2 bg-primary">
                          {product.badge}
                        </UIBadge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{product.price}</span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/products/${product.slug}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product, 1)}
                          disabled={!product.inStock}
                          className="flex-1"
                        >
                          {getItemInCart(product.id) ? 'Added' : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter Section */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-4 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={`relative ${
                    viewMode === 'list' ? 'w-48 h-32' : 'aspect-square'
                  }`}>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <UIBadge className="absolute top-2 left-2 bg-primary">
                        {product.badge}
                      </UIBadge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <CardContent className="p-4 flex-1">
                      <h4 className="font-semibold mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{product.price}</span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/products/${product.slug}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product, 1)}
                          disabled={!product.inStock}
                          className="flex-1"
                        >
                          {getItemInCart(product.id) ? 'Added' : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h5 className="font-bold mb-4">Bakehouse Breads Store</h5>
                <p className="text-sm text-gray-400">
                  Premium sourdough starters and artisan baking supplies for passionate bakers.
                </p>
              </div>
              <div>
                <h5 className="font-bold mb-4">Products</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/category/starters">Sourdough Starters</Link></li>
                  <li><Link href="/category/tools">Baking Tools</Link></li>
                  <li><Link href="/category/ingredients">Ingredients</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold mb-4">Support</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/help">Help Center</a></li>
                  <li><a href="/shipping">Shipping Info</a></li>
                  <li><a href="/returns">Returns</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold mb-4">Contact</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>support@bakehousebreads.com</li>
                  <li>1-800-BREADS-1</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 Bakehouse Breads Store. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}