import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, ExternalLink, BookOpen, Calculator, Clock, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { ArticleChat } from '@/components/ArticleChat';

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

export default function ResearchArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<ResearchArticle>({
    queryKey: ['/api/research/articles', slug],
    queryFn: async () => {
      const response = await fetch(`/api/research/articles/${slug}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      return response.json();
    },
    enabled: !!slug
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getConfidenceGrade = (score: number | null) => {
    if (!score) return { grade: 'PENDING', color: 'bg-gray-100 text-gray-800' };
    if (score >= 90) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { grade: 'B', color: 'bg-yellow-100 text-yellow-800' };
    return { grade: 'C', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 mt-8">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            The research article you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/research">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const confidenceGrade = getConfidenceGrade(article.confidenceScore);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/research">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Research
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge 
              className={`${confidenceGrade.color} font-medium`}
              variant="secondary"
            >
              Research Grade: {confidenceGrade.grade}
            </Badge>
            {article.researchValidated && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Validated
              </Badge>
            )}
            {article.fullContent && (
              <Badge variant="outline" className="border-green-200 text-green-700">
                <BookOpen className="h-3 w-3 mr-1" />
                Full Article Available
              </Badge>
            )}
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.executiveSummary && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Executive Summary</h2>
            <p className="text-blue-800 leading-relaxed">
              {(() => {
                let summary = article.executiveSummary;
                // Clean up malformed JSON markdown blocks
                if (summary.startsWith('```json\n')) {
                  try {
                    const jsonMatch = summary.match(/```json\n([\s\S]*?)```/);
                    if (jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[1]);
                      return parsed.executiveSummary || summary;
                    }
                  } catch (e) {
                    // If JSON parsing fails, extract text content
                    summary = summary.replace(/```json\n[\s\S]*?```/g, '');
                  }
                }
                return summary;
              })()}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
          </div>
          {article.citationCount && (
            <div>
              {article.citationCount} citations
            </div>
          )}
          {article.confidenceScore && (
            <div>
              Confidence: {article.confidenceScore}%
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none prose-content">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Related Tools Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calculator className="h-5 w-5" />
            Apply This Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Put this research into practice with our scientific calculators and tools:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tools/hydration-calculator">
              <Button variant="outline" className="w-full h-auto p-4 text-left hover:bg-blue-100 border-blue-300">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Hydration Calculator</span>
                  </div>
                  <p className="text-sm text-blue-600">Calculate optimal water ratios</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/tools/timeline-calculator">
              <Button variant="outline" className="w-full h-auto p-4 text-left hover:bg-blue-100 border-blue-300">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Timeline Calculator</span>
                  </div>
                  <p className="text-sm text-blue-600">Plan fermentation schedules</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/tools/recipe-validator">
              <Button variant="outline" className="w-full h-auto p-4 text-left hover:bg-blue-100 border-blue-300">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Recipe Validator</span>
                  </div>
                  <p className="text-sm text-blue-600">Validate your recipes scientifically</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      {article.keyFindings && article.keyFindings.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {article.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Practical Applications */}
      {article.practicalApplications && article.practicalApplications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Practical Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {article.practicalApplications.map((application, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{application}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Common Misconceptions */}
      {article.commonMisconceptions && article.commonMisconceptions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Common Misconceptions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {article.commonMisconceptions.map((misconception, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5 flex-shrink-0">
                    ✗
                  </span>
                  <span className="text-gray-700">{misconception}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Article Chat Component */}
      {article.fullContent && (
        <ArticleChat 
          articleId={article.id} 
          articleTitle={article.title}
        />
      )}
    </div>
  );
}