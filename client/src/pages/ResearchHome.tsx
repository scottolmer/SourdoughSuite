import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  TrendingUp, 
  Clock,
  Star,
  ArrowRight,
  Microscope,
  Calculator
} from "lucide-react";
import { useLocation } from "wouter";

interface Topic {
  id: number;
  name: string;
  description: string;
  slug: string;
  sourceCount: number;
  confidenceScore: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  executiveSummary: string;
  extractedCitation: string;
  viewCount: number;
  isStarterFocused: boolean;
}

export default function ResearchHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/research/topics"],
  });

  const { data: featuredArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/research/articles", { featured: true }],
  });

  const handleTopicSelect = (topicSlug: string) => {
    navigate(`/research-hub?topic=${topicSlug}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/research-hub?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Microscope className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold tracking-tight">Research Hub</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Evidence-based bread science platform with peer-reviewed research, 
          AI-powered analysis, and professional-grade tools
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            onClick={() => navigate("/research-hub")}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Explore Research Hub
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/tools")}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculator Tools
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{featuredArticles.length}+</div>
            <div className="text-sm text-muted-foreground">Research Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{topics.length}</div>
            <div className="text-sm text-muted-foreground">Research Topics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Research Topics */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Research Topics</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate("/research-hub")}
            className="flex items-center gap-2"
          >
            View All Topics
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(0, 6).map((topic) => (
            <Card 
              key={topic.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTopicSelect(topic.slug)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {topic.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {topic.sourceCount} sources
                  </Badge>
                  <Badge variant="outline">
                    {topic.confidenceScore}% confidence
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Research</h2>
          <Button 
            variant="outline"
            onClick={() => navigate("/research-hub")}
            className="flex items-center gap-2"
          >
            Browse All Articles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredArticles.slice(0, 4).map((article) => (
            <Card 
              key={article.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/research/${article.slug}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight">
                    {article.title}
                  </CardTitle>
                  {article.isStarterFocused && (
                    <Badge variant="secondary" className="ml-2">
                      Starter
                    </Badge>
                  )}
                </div>
                {article.extractedCitation && (
                  <p className="text-sm text-muted-foreground italic">
                    {article.extractedCitation}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {article.executiveSummary?.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {article.viewCount} views
                  </div>
                  <Button variant="ghost" size="sm">
                    Read More
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}