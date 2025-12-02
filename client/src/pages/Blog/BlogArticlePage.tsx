import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiEndpoint } from '@/lib/subdomain';
import { MobileLayout } from '@/components/mobile-layout/MobileLayout';
import { useBreadcrumbs } from '@/components/Breadcrumbs';

export default function BlogArticlePage() {
  const { slug } = useParams();
  const breadcrumbs = useBreadcrumbs(`/blog/${slug}`);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    const scrollToTop = () => {
      // Stop any existing smooth scrolling
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Find and scroll any chat containers or scroll areas to top
      const chatContainers = document.querySelectorAll('[data-chat-container], .chat-container, .messages-container');
      chatContainers.forEach(container => {
        container.scrollTop = 0;
      });
      
      // Disable any auto-scroll behaviors temporarily
      const style = document.createElement('style');
      style.textContent = `
        * {
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      setTimeout(() => {
        document.head.removeChild(style);
      }, 1000);
    };

    // Execute multiple times to override chat scroll behavior
    scrollToTop();
    
    const timeouts = [10, 50, 100, 200, 500, 1000].map(delay => 
      setTimeout(scrollToTop, delay)
    );

    // Also listen for any scroll events and override them initially
    const preventAutoScroll = (e) => {
      if (Date.now() - componentMountTime < 2000) { // Prevent auto-scroll for 2 seconds
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    
    const componentMountTime = Date.now();
    window.addEventListener('scroll', preventAutoScroll, { passive: false });

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener('scroll', preventAutoScroll);
    };
  }, [slug]);

  // Fetch articles and find the matching one
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      const response = await fetch(getApiEndpoint('/articles'));
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });

  const article = articles.find((a: any) => a.slug === slug);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <MobileLayout title="Loading..." breadcrumbs={breadcrumbs} showBreadcrumbs={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !article) {
    return (
      <MobileLayout title="Article Not Found" breadcrumbs={breadcrumbs} showBreadcrumbs={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
            <Button onClick={() => window.location.href = '/blog'}>
              Return to Blog
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title={article.title} 
      breadcrumbs={breadcrumbs} 
      showBreadcrumbs={true}
      showQuickTools={true}
    >
      <Helmet>
        <title>{article.title} - Bakehouse Blog</title>
        <meta name="description" content={article.excerpt || article.content?.substring(0, 160)} />
      </Helmet>

      {/* Article Content */}
      <article className="space-y-6">
        {/* Article Header */}
        <div className="mb-8">
          {article.category && (
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              {article.category}
            </Badge>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-muted-foreground mb-6">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(article.createdAt)}</span>
            <span className="mx-2">•</span>
            <span>{article.readingTime || '5'} min read</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImageUrl && (
          <div className="mb-8">
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article Body */}
        <Card>
          <CardContent className="p-6 lg:p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p className="text-muted-foreground">Article content not available.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/blog'}
            className="w-full sm:w-auto"
          >
            Back to All Articles
          </Button>
          <Button 
            onClick={() => window.location.href = '/blog'}
            className="w-full sm:w-auto"
          >
            Read More Articles
          </Button>
        </div>
      </article>
    </MobileLayout>
  );
}