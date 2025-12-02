import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, FilePenLine, MessageSquareText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AIContentGeneratorPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Blog post state
  const [blogTopic, setBlogTopic] = useState("");
  const [generatedBlogPost, setGeneratedBlogPost] = useState<any>(null);
  
  // FAQ state
  const [faqCategory, setFaqCategory] = useState("");
  const [faqCount, setFaqCount] = useState(5);
  const [generatedFaqs, setGeneratedFaqs] = useState<Array<{
    question: string;
    answer: string;
    category: string;
  }> | null>(null);

  // Generate blog post mutation
  const generateBlogMutation = useMutation({
    mutationFn: (data: {topic: string}) => {
      return apiRequest('/api/ai/generate-blog-post', 'POST', data);
    },
    onSuccess: (data: any) => {
      setGeneratedBlogPost(data);
      toast({
        title: "Blog post generated!",
        description: "Your AI-generated blog post is ready to review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate blog post",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Generate FAQs mutation
  const generateFaqsMutation = useMutation({
    mutationFn: (data: {category: string, count: number}) => {
      return apiRequest('/api/ai/generate-faqs', 'POST', data);
    },
    onSuccess: (data: any) => {
      setGeneratedFaqs(data as Array<{
        question: string;
        answer: string;
        category: string;
      }>);
      toast({
        title: "FAQs generated!",
        description: `${data.length} FAQ entries have been created.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate FAQs",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Save blog post mutation
  const saveBlogPostMutation = useMutation({
    mutationFn: (blogPost: any) => {
      // Transform to match the API expectations
      const post = {
        title: blogPost.title,
        slug: blogPost.slug,
        content: blogPost.content,
        excerpt: blogPost.excerpt,
        coverImage: blogPost.coverImage,
        authorId: 1, // Assuming user ID 1 - in real app, use current user's ID
        published: true,
        tags: blogPost.tags.join(',')
      };

      return apiRequest('/api/blog/posts', 'POST', post);
    },
    onSuccess: () => {
      toast({
        title: "Blog post saved!",
        description: "Your AI-generated blog post has been published.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save blog post",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Save FAQs mutation
  const saveFaqsMutation = useMutation({
    mutationFn: (faqs: any[]) => {
      // Make multiple API calls to save each FAQ
      const promises = faqs.map(faq => {
        return apiRequest('/api/faqs', 'POST', {
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          published: true
        });
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "FAQs saved!",
        description: "Your AI-generated FAQs have been published.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/faqs'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save FAQs",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleGenerateBlogPost = () => {
    if (!blogTopic || blogTopic.length < 5) {
      toast({
        title: "Topic too short",
        description: "Please enter a more detailed blog topic",
        variant: "destructive",
      });
      return;
    }

    generateBlogMutation.mutate({ topic: blogTopic });
  };

  const handleGenerateFaqs = () => {
    if (!faqCategory || faqCategory.length < 3) {
      toast({
        title: "Category too short",
        description: "Please enter a more specific FAQ category",
        variant: "destructive",
      });
      return;
    }

    generateFaqsMutation.mutate({ category: faqCategory, count: faqCount });
  };

  const handleSaveBlogPost = () => {
    if (generatedBlogPost) {
      saveBlogPostMutation.mutate(generatedBlogPost);
    }
  };

  const handleSaveFaqs = () => {
    if (generatedFaqs) {
      saveFaqsMutation.mutate(generatedFaqs);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create professional-quality blog posts and FAQs with AI assistance
          </p>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blog">
              <FilePenLine className="mr-2 h-4 w-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="faq">
              <MessageSquareText className="mr-2 h-4 w-4" />
              FAQ Entries
            </TabsTrigger>
          </TabsList>

          {/* Blog Post Generator */}
          <TabsContent value="blog">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Blog Post</CardTitle>
                  <CardDescription>
                    Create a comprehensive blog post on any sourdough-related topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="blog-topic">Blog Topic</Label>
                      <Input
                        id="blog-topic"
                        value={blogTopic}
                        onChange={(e) => setBlogTopic(e.target.value)}
                        placeholder="e.g., The science behind sourdough fermentation"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerateBlogPost} 
                      disabled={generateBlogMutation.isPending}
                      className="w-full"
                    >
                      {generateBlogMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Blog Post...
                        </>
                      ) : (
                        "Generate Blog Post"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:row-span-2">
                <CardHeader>
                  <CardTitle>Generated Blog Post</CardTitle>
                  <CardDescription>
                    Preview your AI-generated article
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generateBlogMutation.isPending ? (
                    <div className="h-[400px] flex flex-col items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                      <p className="text-center text-muted-foreground">
                        Creating your blog post...
                        <br />
                        This may take a minute.
                      </p>
                    </div>
                  ) : generatedBlogPost ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold">{generatedBlogPost.title}</h2>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {generatedBlogPost.tags.map((tag: string, index: number) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-muted-foreground mt-2 italic">
                            {generatedBlogPost.excerpt}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <div 
                            className="prose prose-stone dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: generatedBlogPost.content.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>') }}
                          />
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center">
                      <p className="text-muted-foreground mb-4">
                        Your blog post will appear here after generation.
                        <br />
                        Enter a topic and click "Generate Blog Post" to start.
                      </p>
                    </div>
                  )}
                </CardContent>
                {generatedBlogPost && (
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={handleSaveBlogPost} 
                      disabled={saveBlogPostMutation.isPending}
                    >
                      {saveBlogPostMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Publish Blog Post"
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Generator */}
          <TabsContent value="faq">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Generate FAQs</CardTitle>
                  <CardDescription>
                    Create frequently asked questions for your sourdough site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="faq-category">FAQ Category</Label>
                    <Input
                      id="faq-category"
                      value={faqCategory}
                      onChange={(e) => setFaqCategory(e.target.value)}
                      placeholder="e.g., Starter maintenance, Baking techniques"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faq-count">Number of FAQs</Label>
                    <Select 
                      value={faqCount.toString()} 
                      onValueChange={(value) => setFaqCount(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of FAQs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 FAQs</SelectItem>
                        <SelectItem value="5">5 FAQs</SelectItem>
                        <SelectItem value="7">7 FAQs</SelectItem>
                        <SelectItem value="10">10 FAQs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerateFaqs} 
                    disabled={generateFaqsMutation.isPending}
                    className="w-full"
                  >
                    {generateFaqsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating FAQs...
                      </>
                    ) : (
                      "Generate FAQs"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated FAQs</CardTitle>
                  <CardDescription>
                    Review your AI-generated FAQ entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generateFaqsMutation.isPending ? (
                    <div className="h-[400px] flex flex-col items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                      <p className="text-center text-muted-foreground">
                        Creating your FAQ entries...
                        <br />
                        This may take a moment.
                      </p>
                    </div>
                  ) : generatedFaqs ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        {generatedFaqs.map((faq, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className="font-semibold text-lg">Q: {faq.question}</h3>
                            <p className="text-muted-foreground">{faq.answer}</p>
                            {index < generatedFaqs.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center">
                      <p className="text-muted-foreground mb-4">
                        Your FAQ entries will appear here after generation.
                        <br />
                        Enter a category and click "Generate FAQs" to start.
                      </p>
                    </div>
                  )}
                </CardContent>
                {generatedFaqs && (
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={handleSaveFaqs} 
                      disabled={saveFaqsMutation.isPending}
                    >
                      {saveFaqsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Publish FAQs"
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}