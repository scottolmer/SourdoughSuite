import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, TrendingUp, Search, BookOpen, Award } from "lucide-react";

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

export default function ResearchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['/api/research/articles'],
  });

  const filteredArticles = (articles as ResearchArticle[]).filter((article: ResearchArticle) => 
    article.isPublished && (
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.executiveSummary?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Evidence-Based Bread Science Research
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Peer-reviewed research and validated scientific findings for professional bakers and culinary institutions
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search research articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Research Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {(articles as ResearchArticle[]).filter((a: ResearchArticle) => a.researchValidated === true).length}
              </div>
              <div className="text-sm text-gray-600">Validated Articles</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {Math.round((articles as ResearchArticle[]).reduce((sum: number, a: ResearchArticle) => sum + (a.confidenceScore || 0), 0) / (articles as ResearchArticle[]).length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">
                {(articles as ResearchArticle[]).reduce((sum: number, a: ResearchArticle) => sum + (a.citationCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Citations</div>
            </CardContent>
          </Card>
        </div>

        {/* Research Articles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Research Articles</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading research articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Research Articles Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms." : "Research articles will appear here as they are published."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredArticles.map((article: ResearchArticle) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                        <CardDescription className="text-base">
                          {article.executiveSummary?.substring(0, 200)}...
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge className={article.researchValidated ? "bg-green-500" : "bg-yellow-500"}>
                          {article.researchValidated ? "VALIDATED" : "PENDING"}
                        </Badge>
                        {article.confidenceScore && (
                          <Badge variant="outline">
                            {article.confidenceScore}% Confidence
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Pending'}</span>
                        {article.citationCount && (
                          <span className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {article.citationCount} citations
                          </span>
                        )}
                      </div>
                      <Link href={`/research/${article.slug}`}>
                        <Button variant="outline" size="sm">
                          Read Article
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}