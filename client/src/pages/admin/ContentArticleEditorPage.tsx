import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useContentArticles } from '@/hooks/use-content-articles';
import { insertContentArticleSchema, ContentArticle } from '@shared/schema';

// Extend the schema with additional validation for the form
const formSchema = insertContentArticleSchema.extend({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  slug: z.string()
});

const ARTICLE_CATEGORIES = [
  'starter-guides',
  'recipe-context',
  'tools-education',
  'starter-care'
];

const ENTITY_TYPES = [
  'recipe',
  'starter',
  'tool',
  'product',
  'general'
];

type FormValues = z.infer<typeof formSchema>;

export const ContentArticleEditorPage = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { getArticleById, createArticle, updateArticle } = useContentArticles();
  
  const isEditMode = params.id !== 'new';
  const articleId = isEditMode ? parseInt(params.id!) : undefined;
  
  const { data: existingArticle, isLoading } = getArticleById(articleId || 0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      slug: '',
      excerpt: '',
      category: 'general',
      relatedEntityType: 'general',
      relatedEntityId: null,
      isPublished: false,
      imageUrl: ''
    }
  });

  // Update form when existing article data is loaded
  useEffect(() => {
    if (existingArticle && isEditMode) {
      form.reset({
        title: existingArticle.title,
        content: existingArticle.content,
        slug: existingArticle.slug,
        excerpt: existingArticle.excerpt || '',
        category: existingArticle.category,
        relatedEntityType: existingArticle.relatedEntityType || 'general',
        relatedEntityId: existingArticle.relatedEntityId,
        isPublished: existingArticle.isPublished,
        imageUrl: existingArticle.imageUrl || ''
      });
    }
  }, [existingArticle, form, isEditMode]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Generate slug if not provided or empty
      if (!data.slug || data.slug.trim() === '') {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }

      // Ensure slug is never undefined or empty
      if (!data.slug || data.slug.trim() === '') {
        data.slug = 'article-' + Date.now();
      }

      // Create a complete article object with all required fields
      const articleData = {
        ...data,
        slug: data.slug, // Ensure slug is set
      };

      if (isEditMode && articleId) {
        await updateArticle.mutateAsync({ id: articleId, article: articleData });
        toast({
          title: 'Article updated',
          description: 'The article has been updated successfully.',
        });
      } else {
        await createArticle.mutateAsync(articleData);
        toast({
          title: 'Article created',
          description: 'The article has been created successfully.',
        });
        navigate('/admin/content-articles');
      }
    } catch (error) {
      console.error('Save article error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the article. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  const generatePreviewContent = (content: string) => {
    // Simple conversion of markdown-like elements to HTML
    // In a real application, you might use a proper markdown library
    return content
      .replace(/# (.*)/g, '<h1>$1</h1>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/admin/content-articles')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Content Articles
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Content Article' : 'Create New Content Article'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update your educational content' : 'Add a new educational article for your platform'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/content-articles')}>
            Cancel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="mb-6">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="edit" onClick={() => setIsPreviewMode(false)}>
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" onClick={() => setIsPreviewMode(true)}>
            Preview
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isPreviewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.watch('title') || 'Article Title'}</CardTitle>
            {form.watch('excerpt') && <CardDescription>{form.watch('excerpt')}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: generatePreviewContent(form.watch('content') || 'Article content will appear here.') }}
            />
          </CardContent>
          <CardFooter>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="text-sm font-medium">
                {form.watch('category')?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'General'}
              </span>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
                <CardDescription>
                  Create educational content for your bread baking platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="How to Maintain Your Sourdough Starter" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title of your article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="how-to-maintain-sourdough-starter" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly version of the title. Leave blank to generate automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A brief summary of the article..." 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary that appears in article listings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The main image displayed with the article (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ARTICLE_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The main category for this article
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relatedEntityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an entity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ENTITY_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          What this article is related to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="relatedEntityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity ID (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            field.onChange(value);
                          }} 
                        />
                      </FormControl>
                      <FormDescription>
                        ID of the specific entity this article is related to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your article content here..." 
                          {...field} 
                          rows={15}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        The main article content. Supports basic markdown formatting.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Published
                        </FormLabel>
                        <FormDescription>
                          Enable to make this article visible to users
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/admin/content-articles')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createArticle.isPending || updateArticle.isPending}
                >
                  {isEditMode ? 'Update Article' : 'Create Article'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ContentArticleEditorPage;