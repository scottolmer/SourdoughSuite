import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define product schema
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  inventory: z.coerce.number().min(0, 'Inventory must be a positive number'),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true)
});

type ProductFormValues = z.infer<typeof productSchema>;

// Mode for form - create or edit
type FormMode = 'create' | 'edit';

export default function ProductManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up form with validation
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      description: '',
      imageUrl: '',
      category: 'starter',
      tags: '',
      inventory: 10,
      featured: false,
      inStock: true
    }
  });

  // Load products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log("Fetching products...");
      // Use the correct apiRequest format
      const data = await apiRequest('/api/products');
      console.log("Fetched products response:", data);
      
      // Make sure we have an array before setting
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected array of products but got:', data);
        setProducts([]);
        toast({
          title: 'Warning',
          description: 'Received unexpected data format from server',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Open form for creating a new product
  const handleCreateProduct = () => {
    form.reset({
      name: '',
      slug: '',
      price: 0,
      description: '',
      imageUrl: '',
      category: 'starter',
      tags: '',
      inventory: 10,
      featured: false,
      inStock: true
    });
    setFormMode('create');
    setCurrentProductId(null);
    setFormOpen(true);
  };

  // Open form for editing an existing product
  const handleEditProduct = (product: any) => {
    // Convert product fields to match form expectations
    form.reset({
      name: product.name,
      slug: product.slug,
      // Convert price from cents to dollars for the form
      price: (Number(product.price) / 100),
      description: product.description,
      imageUrl: product.imageUrl || '',
      category: product.category || 'starter',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
      inventory: product.inventory || 0,
      featured: !!product.featured,
      inStock: product.inStock !== false // default to true if undefined
    });
    setFormMode('edit');
    setCurrentProductId(product.id);
    setFormOpen(true);
  };

  // Delete a product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      // apiRequest already throws on error, no need to check .ok
      await apiRequest(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      
      // Refresh product list
      fetchProducts();
      
      // Invalidate cache for shop page
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  // Submit form for either creating or editing a product
  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Convert tags from comma-separated string to array and convert price to cents
      const formattedData = {
        ...data,
        // Store price in cents in the database
        price: Math.round(Number(data.price) * 100),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };
      
      // apiRequest already handles JSON parsing and error throwing
      if (formMode === 'create') {
        await apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify(formattedData)
        });
      } else {
        await apiRequest(`/api/products/${currentProductId}`, {
          method: 'PATCH',
          body: JSON.stringify(formattedData)
        });
      }
      
      // Show success message
      toast({
        title: 'Success',
        description: `Product ${formMode === 'create' ? 'created' : 'updated'} successfully`
      });
      
      // Close form and refresh products
      setFormOpen(false);
      fetchProducts();
      
      // Invalidate cache for shop page
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      console.error(`Error ${formMode === 'create' ? 'creating' : 'updating'} product:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${formMode === 'create' ? 'create' : 'update'} product`,
        variant: 'destructive'
      });
    }
  };

  // Generate a slug from the product name
  const generateSlug = () => {
    const name = form.watch('name');
    if (name) {
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove consecutive hyphens
      
      form.setValue('slug', slug);
    }
  };

  // Render product preview
  const renderProductPreview = () => {
    const formValues = form.watch();
    
    return (
      <div className="border rounded-md p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">Product Preview</h3>
        <div className="space-y-2 text-sm">
          {formValues.imageUrl && (
            <div className="h-40 w-full bg-gray-100 rounded overflow-hidden">
              <img 
                src={formValues.imageUrl} 
                alt={formValues.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Image+Error';
                }}
              />
            </div>
          )}
          <h4 className="font-medium text-base">{formValues.name || 'Product Name'}</h4>
          <p className="text-amber-600 font-medium">
            ${Number(formValues.price || 0).toFixed(2)}
          </p>
          <p className="text-gray-500 line-clamp-3">{formValues.description || 'Product description will appear here...'}</p>
          {formValues.tags && (
            <div className="flex flex-wrap gap-1">
              {formValues.tags.split(',').map((tag, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-xs">
            <span className={`px-2 py-1 rounded ${formValues.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {formValues.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            {formValues.featured && (
              <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif">Product Management</h2>
        <Button onClick={handleCreateProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>
      
      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <Alert>
              <AlertDescription>
                No products found. Click "Add New Product" to create your first product.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${(Number(product.price)/100).toFixed(2)}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell>{product.inventory || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${product.inStock === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {product.inStock === false ? 'Out of Stock' : 'In Stock'}
                        </span>
                        {product.featured && (
                          <span className="ml-2 px-2 py-1 rounded text-xs bg-amber-50 text-amber-600">
                            Featured
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      {/* Product Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Add New Product' : 'Edit Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter product name" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // If this is a new product and slug is empty, generate it
                              if (formMode === 'create' && !form.getValues('slug')) {
                                setTimeout(generateSlug, 100);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="product-url-slug" 
                              {...field}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={generateSlug}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          Used in product URL: /products/your-slug
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0.00" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="inventory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inventory</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="10" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Category (e.g., starter, equipment)" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the product..." 
                            className="h-20" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="organic, artisan, premium" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Separate tags with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>In Stock</FormLabel>
                            <FormDescription>
                              Is this product available?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Featured Product</FormLabel>
                            <FormDescription>
                              Show on homepage?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {formMode === 'create' ? 'Create Product' : 'Update Product'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              {renderProductPreview()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}