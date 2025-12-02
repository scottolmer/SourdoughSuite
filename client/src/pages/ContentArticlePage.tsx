import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, User, Clock, Tag, ArrowLeft, Share2 } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import ProductRecommendations from "@/components/ProductRecommendations";
import { SEO } from "@/components/SEO";
import { MobileLayout } from "@/components/mobile-layout";

export default function ContentArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['/api/content-articles/by-slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/content-articles/by-slug/${slug}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      return await response.json();
    }
  });

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !article) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || 'Check out this baking article',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  return (
    <MobileLayout>
      <SEO 
        title={article.metaTitle || `${article.title} | Bakehouse Breads`}
        description={article.metaDescription || article.excerpt || `Learn about ${article.title.toLowerCase()} with expert tips from Bakehouse Breads`}
        keywords={article.keywords}
        canonicalUrl={`https://bakehousebreads.com/content-articles/${article.slug}`}
        ogImage={article.featuredImageUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": article.title,
          "description": article.excerpt,
          "image": article.featuredImageUrl,
          "datePublished": article.createdAt,
          "dateModified": article.updatedAt,
          "author": {
            "@type": "Person",
            "name": article.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Bakehouse Breads"
          }
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="capitalize">
              {article.category.replace('-', ' ')}
            </Badge>
            <Button variant="ghost" size="sm" onClick={shareArticle}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {article.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(article.createdAt)}
            </div>
            {article.readingTime && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {article.readingTime} min read
              </div>
            )}
          </div>

          {/* Featured Image */}
          {article.featuredImageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={article.featuredImageUrl} 
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}
        </div>

        {/* Future: Audio Player will be added in Phase 2 */}

        {/* Product Recommendations - Strategic placement before content */}
        <ProductRecommendations
          category={article.category}
          tags={article.tags}
          relatedEntityType={article.relatedEntityType}
          relatedEntityId={article.relatedEntityId}
          maxProducts={2}
        />

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br/>') 
              }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Final Product Recommendations - Larger section for conversion */}
        <div className="mb-8">
          <ProductRecommendations
            category={article.category}
            tags={article.tags}
            relatedEntityType={article.relatedEntityType}
            relatedEntityId={article.relatedEntityId}
            maxProducts={4}
          />
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mb-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Ready to Start Baking?
            </h3>
            <p className="text-green-700 mb-4">
              Get everything you need to put this knowledge into practice with our curated baking essentials.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/shop">
                <Button className="bg-green-600 hover:bg-green-700">
                  Shop Products
                </Button>
              </Link>
              <Link href="/starters">
                <Button variant="outline">
                  Browse Starters
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline">
                Explore More Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}