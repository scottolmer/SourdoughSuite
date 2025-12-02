import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Plus, Trash2, ArrowUpRight, Tag, Search, ArrowLeft } from 'lucide-react';
import { useContentArticles } from '@/hooks/use-content-articles';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

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

export const ContentArticlesAdminPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { getAllArticles, deleteArticle } = useContentArticles();
  const { data: articles = [], isLoading } = getAllArticles;
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this article? This cannot be undone.')) {
      try {
        await deleteArticle.mutateAsync(id);
        toast({
          title: 'Article deleted',
          description: 'The content article has been deleted successfully.',
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete the article. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Make sure articles is always an array to avoid TypeScript errors
  const articlesArray = Array.isArray(articles) ? articles : [];

  const filteredArticles = articlesArray.filter((article: any) => {
    // Filter by publishing status
    if (activeTab === 'published' && !article.isPublished) return false;
    if (activeTab === 'drafts' && article.isPublished) return false;
    
    // Filter by category
    const matchesCategory = categoryFilter && categoryFilter !== 'all' ? article.category === categoryFilter : true;
    
    // Filter by search term
    const matchesSearch = searchTerm 
      ? article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.slug.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container max-w-7xl mx-auto py-10 admin-content">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage educational SEO content articles for your bread baking platform
          </p>
        </div>
        <Button onClick={() => navigate('/admin/content-articles/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-4 mb-6">
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
              <SelectValue placeholder="Filter by category" />
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

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : filteredArticles?.length === 0 ? (
              <div className="text-center p-10">
                <p className="text-muted-foreground mb-4">No articles found matching your criteria</p>
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles?.map((article: any) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{article.title}</span>
                          <span className="text-xs text-muted-foreground">/blog/{article.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {article.category.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {article.relatedEntityType ? (
                          <Badge variant="secondary">
                            {article.relatedEntityType.charAt(0).toUpperCase() + article.relatedEntityType.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">General</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {article.isPublished ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="ghost" 
                            size="icon"
                            asChild
                          >
                            <Link href={`/blog/${article.slug}`}>
                              <ArrowUpRight className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/admin/content-articles/${article.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(article.id)}
                            disabled={deleteArticle.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ContentArticlesAdminPage;