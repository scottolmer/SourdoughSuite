import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Upload,
  Brain,
  AlertTriangle
} from "lucide-react";
import type { ResearchArticle, ResearchTopic } from "@shared/schema";

interface ArticleWithTopics extends ResearchArticle {
  suggestedTopicNames?: string[];
  assignedTopicNames?: string[];
}

export default function QualityControlDashboard() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithTopics | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch articles pending review
  const { data: pendingArticles = [], isLoading: articlesLoading } = useQuery<ArticleWithTopics[]>({
    queryKey: ['/api/admin/articles/pending-review'],
  });

  // Fetch all available topics
  const { data: topics = [] } = useQuery<ResearchTopic[]>({
    queryKey: ['/api/research/topics'],
  });

  // Upload PDF mutation
  const uploadPdfMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "PDF Uploaded Successfully",
        description: "Processing will begin automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles/pending-review'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Review actions mutations
  const reviewMutation = useMutation({
    mutationFn: async ({ articleId, action, notes, topicIds, content }: {
      articleId: number;
      action: 'approve' | 'reject';
      notes?: string;
      topicIds?: number[];
      content?: string;
    }) => {
      return await apiRequest(`/api/admin/articles/${articleId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, notes, topicIds, content }),
      });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approve' ? "Article Approved" : "Article Rejected",
        description: action === 'approve' ? "Article is ready for publication." : "Article has been rejected.",
      });
      setSelectedArticle(null);
      setReviewNotes("");
      setEditMode(false);
      setSelectedTopics([]);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles/pending-review'] });
    },
    onError: (error) => {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      uploadPdfMutation.mutate(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
    }
  };

  const handleReview = (action: 'approve' | 'reject') => {
    if (!selectedArticle) return;
    
    reviewMutation.mutate({
      articleId: selectedArticle.id,
      action,
      notes: reviewNotes,
      topicIds: selectedTopics.length > 0 ? selectedTopics : undefined,
      content: editMode ? editedContent : undefined,
    });
  };

  const startEdit = () => {
    if (selectedArticle) {
      setEditedContent(selectedArticle.content);
      setEditMode(true);
    }
  };

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Research Quality Control</h1>
          <p className="text-muted-foreground">
            Review and approve research articles for publication
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Label htmlFor="pdf-upload" className="cursor-pointer">
            <Button asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </span>
            </Button>
          </Label>
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploadPdfMutation.isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending Review ({pendingArticles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {articlesLoading ? (
                <div className="text-center py-4">Loading articles...</div>
              ) : pendingArticles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No articles pending review
                </div>
              ) : (
                pendingArticles.map((article) => (
                  <div
                    key={article.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedArticle?.id === article.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {article.status}
                      </Badge>
                    </div>
                    {article.originalFilename && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📄 {article.originalFilename}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Article Review Panel */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-2">
                      {selectedArticle.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{selectedArticle.status}</Badge>
                      {selectedArticle.originalFilename && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedArticle.originalFilename}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEdit}
                    disabled={editMode}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Content
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4">
                    {editMode ? (
                      <div className="space-y-4">
                        <Label>Edit Article Content:</Label>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="min-h-[400px]"
                          placeholder="Edit the article content..."
                        />
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                          {selectedArticle.content}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="topics" className="space-y-4">
                    {selectedArticle.suggestedTopics && selectedArticle.suggestedTopics.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          AI Suggested Topics:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedArticle.suggestedTopics.map((topic, index) => (
                            <Badge key={index} variant="secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Assign Topics:</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                        {topics.map((topic) => (
                          <div key={topic.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`topic-${topic.id}`}
                              checked={selectedTopics.includes(topic.id)}
                              onCheckedChange={() => handleTopicToggle(topic.id)}
                            />
                            <Label 
                              htmlFor={`topic-${topic.id}`} 
                              className="text-sm cursor-pointer"
                            >
                              {topic.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Created:</Label>
                        <p className="text-muted-foreground">
                          {new Date(selectedArticle.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium">Version:</Label>
                        <p className="text-muted-foreground">v{selectedArticle.version}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Status:</Label>
                        <p className="text-muted-foreground">{selectedArticle.status}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Citation Count:</Label>
                        <p className="text-muted-foreground">{selectedArticle.citationCount}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="review-notes">Review Notes (Optional):</Label>
                    <Textarea
                      id="review-notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes about this review decision..."
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="destructive"
                      onClick={() => handleReview('reject')}
                      disabled={reviewMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleReview('approve')}
                      disabled={reviewMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an article to review</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}