import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import ShopLayout from "@/components/ShopLayout";
import { ProductGrid } from "@/components/Shop/ProductGrid";
import { StarterGrid } from "@/components/Shop/StarterGrid";
import { useAllProducts, useFeaturedProducts } from "@/hooks/use-products";
import { useCart } from "@/context/CartContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import { useStarters } from "@/hooks/use-starters";
import { Product } from "@/context/CartContext";
import { SourdoughStarter } from "@shared/schema";

// Function to get starter color based on ID
const getStarterColor = (starterId: number): string => {
  if (starterId === 6) return '#8B4513';   // Koji - brown
  if (starterId === 7) return '#DC143C';   // San Francisco - crimson
  if (starterId === 8) return '#654321';   // Traditional Rye - dark brown
  if (starterId === 10) return '#D2B48C';  // House Blend - tan
  if (starterId === 1) return '#556B2F';   // Homemade - olive
  return '#D2B48C'; // Default - tan
};

// Function to get image filename for a starter
function getImageFilename(starterId: number): string {
  if (starterId === 6) return 'koji-starter.jpg';
  if (starterId === 7) return 'san-francisco-starter.jpg';
  if (starterId === 8) return 'rye-starter.jpg';
  if (starterId === 10) return 'house-blend-starter.jpg';
  if (starterId === 1) return 'homemade-starter.png';
  return 'house-blend-starter.jpg'; // Default
}

// Cart button component
function CartButton() {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="relative h-10 px-4"
      asChild
    >
      <Link href="/checkout">
        <ShoppingCart className="h-5 w-5 mr-2" />
        <span className="font-medium">Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#D97706] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
}

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { data: allProducts = [], isLoading: isLoadingAll } = useAllProducts();
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } = useFeaturedProducts();
  const [location] = useLocation();
  
  // Check URL for tab parameter
  const params = new URLSearchParams(location.split('?')[1] || '');
  const tabParam = params.get('tab');
  // Use state to manage starters data directly fetched
  const [starters, setStarters] = useState<SourdoughStarter[]>([]);
  const [isLoadingStarters, setIsLoadingStarters] = useState(true);
  
  // Fetch starters directly
  useEffect(() => {
    const fetchStarters = async () => {
      try {
        console.log("Starting to fetch starters data...");
        setIsLoadingStarters(true);
        const response = await fetch('/api/starters');
        if (!response.ok) {
          throw new Error('Failed to fetch starters');
        }
        const data = await response.json();
        console.log("Direct fetch starters response:", data);
        
        // Ensure data is an array and filter out homemade starter (id: 1)
        if (Array.isArray(data)) {
          // Filter out homemade starter
          const filtered = data.filter(starter => starter.id !== 1);
          
          // Update the image URLs to use absolute URLs
          const processedStarters = filtered.map(starter => ({
            ...starter,
            // Keep imageUrl as a simple relative path
            imageUrl: starter.imageUrl
          }));
          
          console.log(`Setting ${processedStarters.length} starters to state with absolute image URLs:`);
          processedStarters.forEach((starter, index) => {
            console.log(`Starter ${index + 1}:`, {
              id: starter.id,
              name: starter.name,
              price: starter.price,
              imageUrl: starter.imageUrl,
              inStock: starter.inStock,
              featured: starter.featured
            });
          });
          
          setStarters(processedStarters);
        } else {
          console.error("Starters data is not an array:", data);
          setStarters([]);
        }
      } catch (error) {
        console.error("Error fetching starters:", error);
        setStarters([]);
      } finally {
        setIsLoadingStarters(false);
      }
    };
    
    fetchStarters();
  }, []);
  
  // Extract unique categories from products
  const categories = Array.from(new Set(
    allProducts?.map(product => product.category).filter(Boolean) || []
  ));

  // Filter products based on search query and category
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Filter starters based on search query
  const filteredStarters = starters.filter(starter => {
    const matchesSearch = searchQuery === "" || 
      starter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (starter.description && starter.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });
  
  // Get featured starters
  const featuredStarters = starters.filter(starter => starter.featured);
  
  // Track the active tab - make starters the default tab
  const [activeTab, setActiveTab] = useState(
    tabParam === "all" ? "all" : "starters"
  );
  
  // Debug - log tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);

  return (
    <ShopLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <header className="mb-10 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 lg:gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
                Sourdough Suite Shop
              </h1>
              <p className="text-muted-foreground text-lg lg:text-xl xl:text-2xl max-w-3xl leading-relaxed">
                Explore our curated selection of artisanal bread-making tools, ingredients, and premium sourdough starters crafted by master bakers.
              </p>
            </div>
            <div className="flex-shrink-0">
              <CartButton />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 lg:gap-6 mb-8 lg:mb-10">
          <div>
            <Input
              placeholder="Search starters and products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 text-lg"
            />
          </div>
          <div className="w-full">
            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full h-12 text-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(searchQuery || categoryFilter) && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-[#6E6E6E] pt-0.5">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button 
                  onClick={() => setSearchQuery("")}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X size={14} />
                </button>
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categoryFilter}
                <button 
                  onClick={() => setCategoryFilter(null)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X size={14} />
                </button>
              </Badge>
            )}
          </div>
        )}

        <Tabs defaultValue="starters" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 lg:mb-10 grid w-full grid-cols-2 lg:w-auto lg:inline-flex h-12 lg:h-10">
            <TabsTrigger value="starters" className="text-lg lg:text-base">Sourdough Starters</TabsTrigger>
            <TabsTrigger value="all" className="text-lg lg:text-base">All Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {searchQuery || categoryFilter ? (
              <>
                <h2 className="text-xl font-medium mb-6">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </h2>
                <ProductGrid 
                  products={filteredProducts} 
                  isLoading={isLoadingAll} 
                  className="mb-12"
                />
              </>
            ) : (
              <ProductGrid 
                products={allProducts} 
                isLoading={isLoadingAll}
                className="mb-12"
              />
            )}
          </TabsContent>
          
          <TabsContent value="starters" className="mt-0">
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-2">Sourdough Starters</h2>
              <p className="text-[#6E6E6E]">
                Explore our unique collection of carefully maintained sourdough cultures from around the world.
                Each starter has its own distinctive flavor profile and character.
              </p>
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium mb-4">
                  {filteredStarters.length} {filteredStarters.length === 1 ? 'starter' : 'starters'} found
                </h3>
                <div className="mb-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredStarters.map(starter => (
                      <div 
                        key={starter.id} 
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          let productId = 'house-blend-starter';
                          if (starter.id === 6) productId = 'koji-starter';
                          else if (starter.id === 7) productId = 'san-francisco-starter';
                          else if (starter.id === 8) productId = 'traditional-rye-starter';
                          else if (starter.id === 10) productId = 'house-blend-starter';
                          window.location.href = `/starter-product/${productId}`;
                        }}
                      >
                        <div className="h-48 overflow-hidden relative">
                          {isLoadingStarters ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="animate-pulse rounded-full h-10 w-10 bg-amber-500 opacity-75"></div>
                            </div>
                          ) : (
                            <img
                              src={`/images/starters/${getImageFilename(starter.id)}`}
                              alt={starter.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Error loading image for ${starter.name}`);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerHTML = `
                                  <div class="w-full h-full flex flex-col items-center justify-center"
                                    style="background-color: ${starter.id === 6 ? '#8B4513' : 
                                     starter.id === 7 ? '#DC143C' : 
                                     starter.id === 8 ? '#DAA520' : 
                                     starter.id === 10 ? '#D2B48C' : 
                                     '#D2B48C'}">
                                    <span class="text-white text-xl font-semibold mb-2">
                                      ${starter.name.split(' ').map(word => word[0]).join('')}
                                    </span>
                                    <span class="text-white text-sm px-4 text-center">
                                      ${starter.name}
                                    </span>
                                  </div>
                                `;
                              }}
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold">{starter.name}</h3>
                            {starter.badge && (
                              <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                                {starter.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{starter.description}</p>
                          <div className="mt-4 flex justify-between items-center">
                            <p className="font-mono text-amber-600 font-bold">{starter.price}</p>
                            <button 
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent navigation when clicking the button
                                alert(`${starter.name} added to cart!`);
                              }}
                            >
                              Add to Cart
                            </button>
                          </div>
                          {starter.featured && (
                            <div className="mt-2">
                              <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                                Featured
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {starters.map(starter => (
                    <div 
                      key={starter.id} 
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                          let productId = 'house-blend-starter';
                          if (starter.id === 6) productId = 'koji-starter';
                          else if (starter.id === 7) productId = 'san-francisco-starter';
                          else if (starter.id === 8) productId = 'traditional-rye-starter';
                          else if (starter.id === 10) productId = 'house-blend-starter';
                          window.location.href = `/starter-product/${productId}`;
                        }}
                    >
                      <div className="h-72 overflow-hidden relative rounded-t-lg bg-[#F8F8F8]">
                        {isLoadingStarters ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="animate-pulse rounded-full h-10 w-10 bg-amber-500 opacity-75"></div>
                          </div>
                        ) : (
                          <img
                            src={`/images/starters/${getImageFilename(starter.id)}`}
                            alt={starter.name}
                            className="w-full h-full object-contain p-4 pb-8"
                            onError={(e) => {
                              console.error(`Error loading image for ${starter.name}`);
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = `
                                <div class="w-full h-full flex flex-col items-center justify-center"
                                  style="background-color: ${getStarterColor(starter.id)}">
                                  <span class="text-white text-xl font-semibold mb-2">
                                    ${starter.name.split(' ').map(word => word[0]).join('')}
                                  </span>
                                  <span class="text-white text-sm px-4 text-center">
                                    ${starter.name}
                                  </span>
                                </div>
                              `;
                              }
                            }}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold">{starter.name}</h3>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            COMING SOON
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{starter.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <p className="font-mono text-amber-600 font-bold">{starter.price}</p>
                          <button 
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                            disabled
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent navigation when clicking the button
                            }}
                          >
                            Coming Soon
                          </button>
                        </div>
                        {starter.featured && (
                          <div className="mt-2">
                            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ShopLayout>
  );
}