import { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Lightbulb, FileText, Brain, Sparkles, Clock, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

interface ContentGenerationRequest {
  topic: string;
  contentType: string;
  skillLevel: string;
  length: string;
}

interface GeneratedContent {
  title: string;
  content: string;
  contentType: string;
  estimatedReadTime: string;
  skillLevel: string;
  tags: string[];
  sources?: string[];
}

export default function AIContentGenerator() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("article");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [length, setLength] = useState("medium");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const generateContent = useMutation({
    mutationFn: async (request: ContentGenerationRequest) => {
      const response = await apiRequest("/api/ai/generate-content", {
        method: "POST",
        body: JSON.stringify(request),
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content Generated Successfully",
        description: "Your custom content has been created based on your question.",
      });
    },
    onError: (error: any) => {
      console.error("Content generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic or question for content generation.",
        variant: "destructive",
      });
      return;
    }

    generateContent.mutate({
      topic: topic.trim(),
      contentType,
      skillLevel,
      length,
    });
  };

  const contentTypes = [
    { value: "article", label: "Article", icon: FileText, description: "Comprehensive written guide" },
    { value: "tutorial", label: "Tutorial", icon: BookOpen, description: "Step-by-step instructions" },
    { value: "tips", label: "Tips & Tricks", icon: Lightbulb, description: "Quick actionable advice" },
    { value: "troubleshooting", label: "Troubleshooting", icon: Brain, description: "Problem-solving guide" },
  ];

  const skillLevels = [
    { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-700" },
    { value: "intermediate", label: "Intermediate", color: "bg-blue-100 text-blue-700" },
    { value: "advanced", label: "Advanced", color: "bg-orange-100 text-orange-700" },
    { value: "expert", label: "Expert", color: "bg-red-100 text-red-700" },
  ];

  const lengthOptions = [
    { value: "short", label: "Short (2-3 min read)", description: "Quick overview" },
    { value: "medium", label: "Medium (5-7 min read)", description: "Detailed explanation" },
    { value: "long", label: "Long (10-15 min read)", description: "Comprehensive guide" },
  ];

  return (
    <MobileLayout title="AI Content Generator">
      <SEO
        title="AI Content Generator | Custom Baking Articles & Tutorials"
        description="Generate personalized baking content with AI. Create custom articles, tutorials, and guides based on your specific questions and skill level."
        keywords={['AI content generator', 'custom baking articles', 'personalized tutorials', 'AI writing', 'baking guides', 'AI assistant']}
      />
      
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Content Creation</span>
          </div>
          <h1 className="text-2xl font-bold">AI Content Generator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ask any baking question and get personalized articles, tutorials, and guides created just for you
          </p>
        </div>

        {/* Content Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Create Custom Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Question or Topic</label>
              <Textarea
                placeholder="Example: How do I fix dense sourdough bread? What's the best way to make flaky croissants? How to troubleshoot sticky cookie dough?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Content Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Content Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contentTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      contentType === type.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setContentType(type.value)}
                  >
                    <div className="flex items-center gap-3">
                      <type.icon className={`h-5 w-5 ${contentType === type.value ? "text-blue-600" : "text-gray-500"}`} />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Level Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Target Skill Level</label>
              <div className="flex flex-wrap gap-2">
                {skillLevels.map((level) => (
                  <Badge
                    key={level.value}
                    variant={skillLevel === level.value ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 ${
                      skillLevel === level.value ? level.color : ""
                    }`}
                    onClick={() => setSkillLevel(level.value)}
                  >
                    {level.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Content Length</label>
              <div className="space-y-2">
                {lengthOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      length === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setLength(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      <Clock className={`h-4 w-4 ${length === option.value ? "text-blue-600" : "text-gray-400"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generateContent.isPending || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {generateContent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Custom Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content Display */}
        {generatedContent && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  {generatedContent.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    <User className="h-3 w-3 mr-1" />
                    {generatedContent.skillLevel}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {generatedContent.estimatedReadTime}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: generatedContent.content.replace(/\n/g, '<br>'),
                  }}
                />
              </div>
              
              {generatedContent.tags && generatedContent.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Related Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}