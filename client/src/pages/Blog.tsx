import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { Calendar, Tag, Clock, Loader2 } from "lucide-react";

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

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Get published blog posts
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog/posts/published'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blog/posts/published');
      return await response.json();
    }
  });
  
  // Extract unique categories from blog posts
  const categories = blogPosts 
    ? ['all', ...Array.from(new Set(blogPosts.filter((post: BlogPost) => post.category).map((post: BlogPost) => post.category)))]
    : ['all'];
  
  // Filter posts by the active category
  const filteredPosts = blogPosts 
    ? (activeCategory === 'all' 
        ? blogPosts 
        : blogPosts.filter((post: BlogPost) => post.category === activeCategory))
    : [];
  
  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate reading time helper (rough estimate)
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime === 1 ? "1 min read" : `${readingTime} min read`;
  };
  
  return (
    <Layout>
      <div className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-medium mb-2">The Bakehouse Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Techniques, stories, and insights from our sourdough baking community
          </p>
        </div>
        
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
                <TabsList className="bg-amber-50">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            
            {filteredPosts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-lg text-gray-600">No blog posts found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post: BlogPost) => (
                  <Card key={post.id} className="flex flex-col h-full overflow-hidden">
                    {post.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                        />
                      </div>
                    )}
                    <CardHeader className="flex-grow">
                      {post.category && (
                        <Badge variant="outline" className="mb-2 text-xs capitalize">
                          {post.category}
                        </Badge>
                      )}
                      <CardTitle className="text-xl font-serif">
                        <Link href={`/blog/${post.slug}`} className="hover:text-amber-700 transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs gap-2">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.publishedAt ? post.publishedAt.toString() : post.createdAt.toString())}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getReadingTime(post.content)}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt || post.content.substring(0, 160) + '...'}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="text-xs text-gray-500 flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="outline">Read More</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}