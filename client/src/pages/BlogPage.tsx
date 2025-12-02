import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BlogLayout from '@/components/BlogLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowRight, Search, Tag } from 'lucide-react';

const ARTICLE_CATEGORIES = [
  'starter-guides',
  'recipe-context',
  'tools-education',
  'starter-care'
];

export const BlogPage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch all published articles
  const { data: articles, isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/content-articles/published'],
    refetchOnWindowFocus: false,
  });

  const filteredArticles = articles?.filter((article: any) => {
    const matchesCategory = categoryFilter && categoryFilter !== 'all' ? article.category === categoryFilter : true;
    const matchesSearch = searchTerm 
      ? article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <BlogLayout showBlogNavigation={true}>
      <div className="container max-w-5xl mx-auto py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Bakehouse Blog</h1>
          <p className="text-xl text-muted-foreground">
            Discover the art and science of sourdough bread baking
          </p>
        </div>

      <div className="flex items-center space-x-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Tag className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ARTICLE_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load articles</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Something went wrong while loading the articles. Please try again later.</p>
          </CardContent>
        </Card>
      ) : filteredArticles && filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article: any) => (
            <Card key={article.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">
                    {article.category.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(article.updatedAt)}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                {article.excerpt && (
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                {article.featuredImage && (
                  <div className="mb-4">
                    <img 
                      src={article.featuredImage} 
                      alt={article.title} 
                      className="w-full h-auto rounded-md object-cover max-h-48" 
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="ml-auto" asChild>
                  <Link href={`/blog/${article.slug}`}>
                    Read more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-6">
            {categoryFilter 
              ? `No articles found in the "${categoryFilter.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}" category.` 
              : 'No articles match your search criteria.'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setCategoryFilter('all');
              setSearchTerm('');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      </div>
    </BlogLayout>
  );
};

export default BlogPage;