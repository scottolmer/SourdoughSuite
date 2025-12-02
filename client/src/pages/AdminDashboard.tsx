import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Link, FileText, Brain, CheckCircle, AlertCircle, Loader2, Eye, Globe, Clock, Edit, PenTool } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ArticleProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  source: string;
  title?: string;
  errorMessage?: string;
  createdAt: string;
  processedArticleId?: number;
  extractedContent?: string;
}

interface ProcessedArticle {
  id: number;
  title: string;
  content: string;
  executiveSummary?: string;
  practicalApplications?: string;
  keyFindings?: any;
  commonMisconceptions?: any;
  isPublished?: boolean;
  publishedAt?: string;
  slug: string;
}

// Publication Manager Component
// Manual Article Creation Component
function SimpleArticleCreator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    executiveSummary: '',
    content: '',
    publishImmediately: true
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
        publishImmediately: true
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
      practicalApplications: [],
      keyFindings: [],
      commonMisconceptions: [],
      isPublished: formData.publishImmediately,
      publishedAt: formData.publishImmediately ? new Date() : null
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
          Create research articles with markdown formatting support
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

  const articles = articlesQuery.data || [];

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
              <div key={article.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate job-title-text">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Slug: /research/{article.slug}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={article.isPublished ? "default" : "secondary"}>
                        {article.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {article.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
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

function PublicationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery<ProcessedArticle[]>({
    queryKey: ['/api/research/articles'],
  });

  const publishMutation = useMutation({
    mutationFn: async (articleId: number) => {
      return apiRequest(`/api/research/articles/${articleId}/publish`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Article Published",
        description: "The article is now live on the research page.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/research/articles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Publication Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (articleId: number) => {
      return apiRequest(`/api/research/articles/${articleId}/unpublish`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Article Unpublished",
        description: "The article has been removed from the public site.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/research/articles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Unpublish Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Publication Management
        </CardTitle>
        <CardDescription>
          Manage which processed articles appear on the public research page
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No processed articles available. Upload and process articles first.
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="border rounded-lg p-3 sm:p-4 max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <h3 className="job-title-text font-semibold text-base sm:text-lg mb-1">{article.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-2 break-words overflow-wrap-anywhere">
                      {article.executiveSummary?.substring(0, 150)}...
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="break-all overflow-wrap-anywhere max-w-full">Slug: /research/{article.slug}</span>
                      {article.publishedAt && (
                        <span className="flex items-center flex-shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          Published {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start space-x-2 flex-shrink-0">
                    <Badge variant={article.isPublished ? "default" : "secondary"} className="text-xs">
                      {article.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {article.isPublished ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unpublishMutation.mutate(article.id)}
                        disabled={unpublishMutation.isPending}
                        className="text-xs sm:text-sm"
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate(article.id)}
                        disabled={publishMutation.isPending}
                        className="text-xs sm:text-sm"
                      >
                        <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Publish
                      </Button>
                    )}
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

// Component to view job details
function JobDetailDialog({ jobId, isOpen, onOpenChange }: { jobId: string; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: jobDetails, isLoading, error } = useQuery<ArticleProcessingJob & { processedArticle?: ProcessedArticle }>({
    queryKey: [`/api/admin/processing-jobs/${jobId}`],
    enabled: isOpen && !!jobId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Analysis Results</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Detailed analysis of your processed document
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading analysis...
          </div>
        ) : jobDetails ? (
          <ScrollArea className="max-h-[50vh] sm:max-h-[60vh] pr-2 sm:pr-4">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold truncate">{jobDetails.title || jobDetails.source}</h3>
                <Badge className="text-xs flex-shrink-0">
                  {jobDetails.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>

              {/* Show processed article content if available */}
              {jobDetails.processedArticle && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-green-800 mb-2 text-sm sm:text-base">✓ AI Analysis Complete</h4>
                    <p className="text-xs sm:text-sm text-green-700">
                      This document has been successfully processed and analyzed using our multi-AI system.
                    </p>
                  </div>

                  {jobDetails.processedArticle?.executiveSummary && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Executive Summary</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-2 sm:p-3 rounded">
                        {jobDetails.processedArticle.executiveSummary}
                      </p>
                    </div>
                  )}

                  {jobDetails.processedArticle?.content && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Research Content</h4>
                      <div className="bg-muted p-2 sm:p-4 rounded text-xs sm:text-sm max-h-48 sm:max-h-96 overflow-y-auto">
                        <ReactMarkdown>{jobDetails.processedArticle.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {jobDetails.processedArticle?.practicalApplications && Array.isArray(jobDetails.processedArticle.practicalApplications) && jobDetails.processedArticle.practicalApplications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Practical Applications</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {jobDetails.processedArticle.practicalApplications.map((app: string, index: number) => (
                          <li key={index}>{app}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {jobDetails.processedArticle?.keyFindings && Array.isArray(jobDetails.processedArticle.keyFindings) && jobDetails.processedArticle.keyFindings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Findings</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {jobDetails.processedArticle.keyFindings.map((finding: string, index: number) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {jobDetails.processedArticle?.commonMisconceptions && Array.isArray(jobDetails.processedArticle.commonMisconceptions) && jobDetails.processedArticle.commonMisconceptions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Common Misconceptions Addressed</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {jobDetails.processedArticle.commonMisconceptions.map((misconception: string, index: number) => (
                          <li key={index}>{misconception}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Article Status:</strong> {jobDetails.processedArticle.isPublished ? 'Published' : 'Draft'} | 
                      <strong> ID:</strong> {jobDetails.processedArticle.id}
                    </p>
                  </div>
                </div>
              )}

              {/* Show extracted content if no processed article */}
              {!jobDetails.processedArticle && jobDetails.extractedContent && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠ Content Extracted Only</h4>
                    <p className="text-sm text-yellow-700">
                      Text was extracted but AI analysis is incomplete or failed.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Extracted Content</h4>
                    <div className="bg-muted p-4 rounded text-sm max-h-96 overflow-y-auto">
                      <ReactMarkdown>{jobDetails.extractedContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Show fallback message only if no content at all */}
              {!jobDetails.processedArticle && !jobDetails.extractedContent && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">❌ Processing Incomplete</h4>
                    <p className="text-sm text-red-700 mb-4">
                      This document was processed with a previous version of the analysis system or processing failed.
                    </p>
                    <div className="text-sm text-red-600 space-y-1">
                      <p><strong>Analysis completed:</strong> {jobDetails.createdAt ? new Date(jobDetails.createdAt).toLocaleString() : 'Unknown date'}</p>
                      <p><strong>Source:</strong> {jobDetails.source || 'Unknown source'}</p>
                      {jobDetails.title && <p><strong>Title:</strong> {jobDetails.title}</p>}
                      {jobDetails.errorMessage && <p><strong>Error:</strong> {jobDetails.errorMessage}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <p>No analysis data available</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch processing jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<ArticleProcessingJob[]>({
    queryKey: ['/api/admin/processing-jobs'],
    refetchInterval: 2000, // Poll every 2 seconds for updates
  });

  // Process URL mutation
  const processUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest('/api/admin/process-url', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    },
    onSuccess: () => {
      toast({
        title: "URL Processing Started",
        description: "The article will be processed automatically.",
      });
      setUrlInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/admin/processing-jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process file mutation
  const processFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      const response = await fetch('/api/admin/process-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Processing Started",
        description: "The article will be processed automatically.",
      });
      setSelectedFile(null);
      setFileContent("");
      setFileName("");
      queryClient.invalidateQueries({ queryKey: ['/api/admin/processing-jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      // Show preview content for display
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content.substring(0, 500)); // First 500 chars for preview
      };
      reader.readAsText(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      processUrlMutation.mutate(urlInput.trim());
    }
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      processFileMutation.mutate(selectedFile);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden admin-dashboard-content">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">Research Article Dashboard</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Upload research articles or provide URLs for automatic processing, grading, and summarization
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium">AI-Powered Processing</span>
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


            <CardContent>
              <form onSubmit={handleFileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>

                {fileContent && (
                  <div className="space-y-2">
                    <Label>File Preview</Label>
                    <Textarea
                      value={fileContent.substring(0, 500) + (fileContent.length > 500 ? "..." : "")}
                      readOnly
                      className="h-32 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Showing first 500 characters of {fileName}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!fileContent || processFileMutation.isPending}
                  className="w-full"
                >
                  {processFileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Process with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Process Article URL
              </CardTitle>
              <CardDescription>
                Provide a URL to a research article. The AI will extract content, validate citations, and generate quality assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Article URL</Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/research-article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={!urlInput.trim() || processUrlMutation.isPending}
                  className="w-full"
                >
                  {processUrlMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Process with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <ManualArticleCreator />
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <PublicationManager />
        </TabsContent>
      </Tabs>

        {/* Processing Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Processing Queue</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track the status of article processing jobs
            </CardDescription>
          </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading jobs...
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No processing jobs yet. Upload an article or provide a URL to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: ArticleProcessingJob) => (
                <div key={job.id} className="border rounded-lg p-3 sm:p-4 max-w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-start space-x-2 min-w-0 flex-1 max-w-full overflow-hidden">
                      <div className="flex-shrink-0 mt-0.5">{getStatusIcon(job.status)}</div>
                      <span className="job-title-text font-medium text-sm sm:text-base">{job.title || job.source}</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {job.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJobId(job.id)}
                          className="text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">View Analysis</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      )}
                      <Badge className={`${getStatusColor(job.status)} text-xs`}>
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="space-y-2">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Processing... {job.progress}% complete
                      </p>
                    </div>
                  )}
                  
                  {job.errorMessage && (
                    <p className="text-sm text-red-600 mt-2">{job.errorMessage}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Started: {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Dialog */}
      {selectedJobId && (
        <JobDetailDialog
          jobId={selectedJobId}
          isOpen={!!selectedJobId}
          onOpenChange={(open) => !open && setSelectedJobId(null)}
        />
      )}
    </div>
    </div>
  );
}