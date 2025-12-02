import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, BookOpen, Filter, Clock, Eye, ExternalLink } from "lucide-react";
import { MobileLayout } from "@/components/mobile-layout";
import { ToolsQuickAccess } from "@/components/ToolsQuickAccess";

interface ResearchArticle {
  id: number;
  title: string;
  slug: string;
  executiveSummary: string | null;
  content: string;
  fullContent: string | null;
  authorId: number | null;
  researchValidated: boolean;
  confidenceScore: number | null;
  citationCount: number | null;
  keyFindings: string[] | null;
  practicalApplications: string[] | null;
  commonMisconceptions: string[] | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  slug: string;
  sourceCount: number;
  confidenceScore: number;
}

export default function ResearchHubNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/research/articles'],
  });

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['/api/research/topics'],
  });

  const publishedArticles = (articles as ResearchArticle[]).filter(
    (article: ResearchArticle) => article.isPublished
  );

  const filteredArticles = publishedArticles.filter((article: ResearchArticle) => {
    const matchesSearch = searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.executiveSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const featuredArticles = filteredArticles.slice(0, 3);
  const recentArticles = filteredArticles
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, 6);

  return (
    <MobileLayout title="Research Hub">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">Research Library</h1>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Curated scientific articles and insights from bread science research. 
            Each summary is manually reviewed for accuracy and practical application.
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{publishedArticles.length}</div>
              <div className="text-sm text-muted-foreground">Published Articles</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{(topics as Topic[]).length}</div>
              <div className="text-sm text-muted-foreground">Research Topics</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold">Manual</div>
              <div className="text-sm text-muted-foreground">Quality Review</div>
            </CardContent>
          </Card>
        </section>

        {/* Content Tabs */}
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Featured Research</h2>
              <Badge variant="outline">Manually Curated</Badge>
            </div>
            
            {articlesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading articles...</p>
              </div>
            ) : featuredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Articles Yet</h3>
                  <p className="text-muted-foreground">
                    Research articles will appear here as they are added to the library.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {featuredArticles.map((article: ResearchArticle) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 leading-tight">
                            {article.title}
                          </CardTitle>
                          {article.executiveSummary && (
                            <CardDescription className="text-sm leading-relaxed">
                              {article.executiveSummary.length > 200 
                                ? `${article.executiveSummary.substring(0, 200)}...`
                                : article.executiveSummary
                              }
                            </CardDescription>
                          )}
                        </div>
                        <Badge className="bg-green-500 text-white ml-4">
                          Reviewed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {article.publishedAt 
                              ? new Date(article.publishedAt).toLocaleDateString()
                              : new Date(article.createdAt).toLocaleDateString()
                            }
                          </span>
                        </div>
                        <Link href={`/research/${article.slug}`}>
                          <Button size="sm" className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Read Article
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Articles</h2>
              <div className="text-sm text-muted-foreground">
                {recentArticles.length} total articles
              </div>
            </div>
            
            <div className="grid gap-4">
              {recentArticles.map((article: ResearchArticle) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1 leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {article.executiveSummary?.substring(0, 120)}...
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Added {new Date(article.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-xs">
                          Manual Review
                        </Badge>
                        <Link href={`/research/${article.slug}`}>
                          <Button size="sm" variant="outline">
                            Read
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="topics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Research Topics</h2>
              <Badge variant="outline">Organized by Subject</Badge>
            </div>
            
            {topicsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading topics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(topics as Topic[]).map((topic: Topic) => (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {topic.sourceCount} articles
                        </Badge>
                        <Button size="sm" variant="outline">
                          Explore Topic
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tools Integration - Hidden per user request */}
        {/* <ToolsQuickAccess 
          title="Apply Research with Tools"
          description="Use our calculators to put scientific insights into practice"
        /> */}
      </div>
    </MobileLayout>
  );
}