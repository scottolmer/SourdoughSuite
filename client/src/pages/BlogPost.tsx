import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tag, Clock, User, ArrowLeft, Loader2 } from "lucide-react";

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

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  
  // Fetch the blog post by slug
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['/api/blog/posts/slug', slug],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/blog/posts/slug/${slug}`);
      return await response.json();
    }
  });
  
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
  
  // Render content with line breaks and paragraphs
  const renderContent = (content: string) => {
    return content.split('\n').filter(Boolean).map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="py-10 px-4 md:px-6 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/5 mb-2" />
          <div className="flex gap-2 mb-8">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="w-full h-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (isError || !post) {
    return (
      <Layout>
        <div className="py-20 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif mb-4">Blog Post Not Found</h1>
          <p className="mb-6 text-gray-600">The blog post you're looking for doesn't exist or isn't published yet.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <article className="py-10 px-4 md:px-6 max-w-4xl mx-auto">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
        
        {post.category && (
          <Badge variant="outline" className="mb-3">
            {post.category}
          </Badge>
        )}
        
        <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            Admin
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {getReadingTime(post.content)}
          </span>
        </div>
        
        {post.imageUrl && (
          <div className="my-8 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-auto" 
            />
          </div>
        )}
        
        <div className="prose prose-amber max-w-none mb-8">
          {renderContent(post.content)}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-6 mt-8">
            <span className="font-medium text-gray-700">Tags:</span>
            {post.tags.map((tag, index) => (
              <span key={index} className="flex items-center text-gray-600 text-sm">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Layout>
  );
}