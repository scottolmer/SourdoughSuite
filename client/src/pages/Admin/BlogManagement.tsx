import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the blog post type
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  authorId: number;
  category: string | null;
  tags: string[] | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define a schema for the blog post form
const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  slug: z.string().min(5, "Slug must be at least 5 characters long").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use only lowercase letters, numbers, and hyphens"),
  content: z.string().min(20, "Content must be at least 20 characters long"),
  excerpt: z.string().nullable().optional(),
  imageUrl: z.string().url("Please enter a valid URL").nullable().optional(),
  authorId: z.number(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isPublished: z.boolean().default(false),
});

export default function BlogManagement() {
  const [activeTab, setActiveTab] = useState("all-posts");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all blog posts
  const { data: blogPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['/api/blog/posts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blog/posts');
      return await response.json();
    }
  });
  
  // Create a new blog post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/blog/posts', postData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setIsNewDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post created successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog post",
        variant: "destructive",
      });
    }
  });
  
  // Update a blog post
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, postData }: { id: number, postData: any }) => {
      const response = await apiRequest('PATCH', `/api/blog/posts/${id}`, postData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update blog post",
        variant: "destructive",
      });
    }
  });
  
  // Delete a blog post
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/blog/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete blog post",
        variant: "destructive",
      });
    }
  });
  
  // Set up the edit form
  const editForm = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      authorId: 1, // Default to admin user ID
      category: "",
      tags: [],
      isPublished: false,
    }
  });
  
  // Set up the new post form
  const newForm = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      authorId: 1, // Default to admin user ID
      category: "",
      tags: [],
      isPublished: false,
    }
  });
  
  // Handle opening the edit dialog
  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    
    // Reset the form with the post data
    editForm.reset({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      imageUrl: post.imageUrl || "",
      authorId: post.authorId,
      category: post.category || "",
      tags: post.tags || [],
      isPublished: post.isPublished,
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Handle opening the delete confirmation dialog
  const handleDeleteConfirmation = (post: BlogPost) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle submitting the edit form
  const onEditSubmit = editForm.handleSubmit((data) => {
    if (editingPost) {
      // Convert tags string to array if provided
      let processedData = {...data};
      if (typeof processedData.tags === 'string') {
        processedData.tags = (processedData.tags as unknown as string).split(',').map(tag => tag.trim());
      }
      
      updatePostMutation.mutate({ id: editingPost.id, postData: processedData });
    }
  });
  
  // Handle submitting the new post form
  const onNewSubmit = newForm.handleSubmit((data) => {
    // Convert tags string to array if provided
    let processedData = {...data};
    if (typeof processedData.tags === 'string') {
      processedData.tags = (processedData.tags as unknown as string).split(',').map(tag => tag.trim());
    }
    
    createPostMutation.mutate(processedData);
  });
  
  // Generate slug from title automatically
  const handleTitleChange = (titleValue: string, formContext: any) => {
    const slugValue = formContext.getValues('slug');
    // Only update slug automatically if it's empty or hasn't been manually edited
    if (!slugValue) {
      const newSlug = titleValue
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      formContext.setValue('slug', newSlug);
    }
  };
  
  // Render the list of blog posts
  const renderBlogPosts = () => {
    if (isLoadingPosts) {
      return (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Loading blog posts...</p>
        </div>
      );
    }
    
    if (!blogPosts || blogPosts.length === 0) {
      return (
        <div className="py-10 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg">No blog posts found.</p>
          <p className="text-gray-500">Click the "New Post" button to create your first blog post.</p>
        </div>
      );
    }
    
    // Filter posts based on the active tab
    const filteredPosts = blogPosts.filter((post: BlogPost) => {
      if (activeTab === "all-posts") return true;
      if (activeTab === "published" && post.isPublished) return true;
      if (activeTab === "drafts" && !post.isPublished) return true;
      return false;
    });
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post: BlogPost) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-serif truncate">{post.title}</CardTitle>
                  <CardDescription className="truncate">{post.slug}</CardDescription>
                </div>
                <div className="flex shrink-0 space-x-1">
                  {post.isPublished ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Draft
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-gray-500 line-clamp-3">
                {post.excerpt || post.content.substring(0, 120) + '...'}
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <div>
                  {post.category && (
                    <span className="mr-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-1">
                      {post.category}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEditPost(post)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // In a real app, this would navigate to preview
                    toast({
                      title: "Preview",
                      description: `Preview of "${post.title}" would open here`,
                    });
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={() => handleDeleteConfirmation(post)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-medium">Blog Posts</h2>
        <Button onClick={() => setIsNewDialogOpen(true)}>New Post</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all-posts">All Posts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {renderBlogPosts()}
      
      {/* Edit Blog Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Make changes to the blog post. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={onEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Blog post title" 
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value, editForm);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="blog-post-slug" />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly identifier for this post.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Blog post content" 
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="A brief summary of the post (optional)" 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief summary that will be displayed in blog listings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://example.com/image.jpg" 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to the featured image (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. Sourdough, Recipes, Tips" 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="bread, baking, sourdough" 
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of tags.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Published Status</FormLabel>
                      <FormDescription>
                        Toggle to publish or unpublish the post.
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatePostMutation.isPending}
                >
                  {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* New Blog Post Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
            <DialogDescription>
              Fill in the details for your new blog post.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newForm}>
            <form onSubmit={onNewSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={newForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Blog post title" 
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value, newForm);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="blog-post-slug" />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly identifier for this post.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={newForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Blog post content" 
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="A brief summary of the post (optional)" 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief summary that will be displayed in blog listings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={newForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://example.com/image.jpg" 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to the featured image (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. Sourdough, Recipes, Tips" 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={newForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="bread, baking, sourdough" 
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of tags.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newForm.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Published Status</FormLabel>
                      <FormDescription>
                        Toggle to publish or save as draft.
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              {postToDelete && <strong> "{postToDelete.title}"</strong>} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => postToDelete && deletePostMutation.mutate(postToDelete.id)}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}