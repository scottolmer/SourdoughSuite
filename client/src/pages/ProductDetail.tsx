import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import Layout from "@/components/Layout";
import { useProductBySlug } from "@/hooks/use-products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ShoppingCart, 
  PackagePlus, 
  Check,
  Star,
  ShieldCheck,
  Truck
} from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAdding(true);
    
    // Add the product to cart the specified number of times
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      
      setIsAdding(false);
      
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart.`,
      });
    }, 600);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-10 max-w-6xl">
          <div className="w-full h-[500px] rounded-lg bg-muted animate-pulse"></div>
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container py-10 max-w-6xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/shop")}>
            Back to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/shop">Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href={`/shop/category/${product.category}`}>{product.category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-square">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                No Image Available
              </div>
            )}
            
            {product.featured && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Featured
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-serif font-semibold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <span className="text-2xl font-mono font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
              <Badge variant={product.inStock ? "outline" : "secondary"} className="ml-4">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
              {product.featured && (
                <Badge variant="destructive" className="ml-2">
                  Featured
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Category and Tags */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Category: <span className="font-normal">{product.category}</span></p>
              
              {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Add to Cart */}
            {product.inStock ? (
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="rounded-r-none"
                  >
                    -
                  </Button>
                  <div className="flex items-center justify-center w-12 h-10 border-x">
                    {quantity}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setQuantity(q => q + 1)}
                    className="rounded-l-none"
                  >
                    +
                  </Button>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || !product.inStock}
                  className="flex-1"
                >
                  {isAdding ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button disabled variant="secondary" className="w-full">
                Out of Stock
              </Button>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center text-center p-3 rounded-lg border">
                <Truck className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Free Shipping</span>
                <span className="text-xs text-muted-foreground">On orders over $75</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg border">
                <ShieldCheck className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Secure Payment</span>
                <span className="text-xs text-muted-foreground">SSL encrypted checkout</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg border">
                <Star className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Satisfaction Guaranteed</span>
                <span className="text-xs text-muted-foreground">30-day money back</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="features" className="mb-12">
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-medium mb-4">Product Features</h3>
              {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No detailed features available for this product.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-medium mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.dimensions && (
                  <div>
                    <h4 className="text-sm font-medium">Dimensions</h4>
                    <p className="text-muted-foreground">{product.dimensions}</p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <h4 className="text-sm font-medium">Weight</h4>
                    <p className="text-muted-foreground">{product.weight}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium">SKU</h4>
                  <p className="text-muted-foreground font-mono">BAKE-{product.id}</p>
                </div>
                {product.inventory != null && (
                  <div>
                    <h4 className="text-sm font-medium">Inventory</h4>
                    <p className="text-muted-foreground">{product.inventory} in stock</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-medium mb-4">Shipping Information</h3>
              <p>
                All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.
              </p>
              <h4 className="text-lg font-medium mt-4">Shipping Rates</h4>
              <ul className="space-y-2">
                <li><strong>Standard Shipping:</strong> $5.99 (7-10 business days)</li>
                <li><strong>Express Shipping:</strong> $12.99 (3-5 business days)</li>
                <li><strong>Free Shipping:</strong> Orders over $75 qualify for free standard shipping</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}