import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PenTool, FileText, Loader2, Sparkles } from "lucide-react";

function SimpleArticleCreator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    executiveSummary: '',
    content: '',
    publishImmediately: true,
    generateSummary: false
  });

  const createArticleMutation = useMutation({
    mutationFn: async (articleData: any) => {
      return apiRequest('/api/research/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Article Added Successfully",
        description: formData.publishImmediately ? "Article is now live on the research page." : "Article saved as draft.",
      });
      setFormData({
        title: '',
        slug: '',
        executiveSummary: '',
        content: '',
        publishImmediately: true,
        generateSummary: false
      });
      queryClient.invalidateQueries({ queryKey: ['/api/research/articles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData = {
      title: formData.title,
      slug: formData.slug,
      executiveSummary: formData.executiveSummary,
      content: formData.content,
      fullContent: formData.content, // Store content as fullContent for AI processing
      practicalApplications: [],
      keyFindings: [],
      commonMisconceptions: [],
      isPublished: formData.publishImmediately
    };

    createArticleMutation.mutate(articleData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenTool className="h-5 w-5 mr-2" />
          Add New Article
        </CardTitle>
        <CardDescription>
          Create research articles with markdown formatting support. Articles are automatically processed for AI chat functionality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="article-url-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                Will be available at: /research/{formData.slug || 'your-slug'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="executive-summary">Executive Summary</Label>
            <Textarea
              id="executive-summary"
              value={formData.executiveSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, executiveSummary: e.target.value }))}
              placeholder="Brief overview of the article's key points and findings"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Article Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="# Article Title

## Introduction
Your article content here. You can use markdown formatting:

**Bold text**, *italic text*, and `code blocks`

## Key Points
- Point one
- Point two

## Conclusion
Wrap up your findings..."
              rows={20}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Supports markdown formatting: **bold**, *italic*, ## headings, - lists, etc.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="publish-immediately"
              checked={formData.publishImmediately}
              onChange={(e) => setFormData(prev => ({ ...prev, publishImmediately: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="publish-immediately">Publish immediately (make live on website)</Label>
          </div>

          <Button 
            type="submit" 
            disabled={createArticleMutation.isPending || !formData.title || !formData.content}
            className="w-full"
          >
            {createArticleMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Article...
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4 mr-2" />
                {formData.publishImmediately ? 'Add & Publish Article' : 'Save as Draft'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ArticleManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const articlesQuery = useQuery({
    queryKey: ['/api/research/articles'],
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'publish' | 'unpublish' }) => {
      return apiRequest(`/api/research/articles/${id}/${action}`, {
        method: 'POST',
      });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: `Article ${action === 'publish' ? 'Published' : 'Unpublished'}`,
        description: `Article is now ${action === 'publish' ? 'live on the website' : 'hidden from the website'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/research/articles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/research/articles/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Article Deleted",
        description: "Article has been permanently removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/research/articles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (articlesQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading articles...
          </div>
        </CardContent>
      </Card>
    );
  }

  const articles = (articlesQuery.data as any[]) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Manage Articles ({articles.length})
        </CardTitle>
        <CardDescription>
          Publish, unpublish, or delete research articles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No articles found. Add your first article to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article: any) => (
              <div key={article.id} className="border rounded-lg p-3 sm:p-4 max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <h3 className="font-medium text-sm sm:text-base mb-1 break-words overflow-wrap-anywhere leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all overflow-wrap-anywhere">
                      Slug: /research/{article.slug}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={article.isPublished ? "default" : "secondary"} className="text-xs">
                        {article.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {article.publishedAt && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                      onClick={() => togglePublishMutation.mutate({
                        id: article.id,
                        action: article.isPublished ? 'unpublish' : 'publish'
                      })}
                      disabled={togglePublishMutation.isPending}
                    >
                      {article.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this article? This cannot be undone.')) {
                          deleteArticleMutation.mutate(article.id);
                        }
                      }}
                      disabled={deleteArticleMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SimpleAdminDashboard() {
  return (
    <div className="w-full max-w-full overflow-hidden admin-dashboard-content">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Article Management</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Add and manage research articles for your website
            </p>
          </div>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1">
            <TabsTrigger value="add" className="text-xs sm:text-sm px-2">Add Article</TabsTrigger>
            <TabsTrigger value="manage" className="text-xs sm:text-sm px-2">Manage Articles</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <SimpleArticleCreator />
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <ArticleManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}