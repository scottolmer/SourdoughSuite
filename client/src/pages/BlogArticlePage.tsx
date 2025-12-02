import React, { useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlogLayout from '@/components/BlogLayout';
import BlogAIChat from '@/components/BlogAIChat';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { generateArticleSchema, generateWebpageSEO } from '@/lib/schema';

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams();

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Execute immediately and with delays to override chat scroll behavior
    scrollToTop();
    const timeouts = [10, 50, 100, 200, 500].map(delay => 
      setTimeout(scrollToTop, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [slug]);

  const { data: article, isLoading, error } = useQuery({
    queryKey: [`/api/content-articles/slug/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/content-articles/slug/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <BlogLayout showBlogNavigation={true}>
        <div className="container max-w-4xl mx-auto py-10">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </BlogLayout>
    );
  }

  if (error || !article) {
    return (
      <>
        <SEO 
          title="Article Not Found - Bakehouse Breads Blog"
          description="Sorry, we couldn't find the article you're looking for."
          canonicalUrl="/blog"
        />
        <BlogLayout showBlogNavigation={true}>
          <div className="container max-w-4xl mx-auto py-10">
            <Card>
              <CardHeader>
                <CardTitle>Article Not Found</CardTitle>
                <CardDescription>
                  Sorry, we couldn't find the article you're looking for.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>The article may have been removed or the URL might be incorrect.</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/blog">Browse All Articles</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </BlogLayout>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${article.title} | Bakehouse Breads Blog`}
        description={article.excerpt || article.title}
        canonicalUrl={`/blog/${slug}`}
        ogType="article"
        ogImage={article.featuredImage}
        author={article.author || "Bakehouse Breads Team"}
        publishedTime={article.createdAt}
        modifiedTime={article.updatedAt}
        keywords={article.keywords || [article.category?.split('-').join(' '), "sourdough", "baking", "bread"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: article.title, url: `/blog/${slug}` }
        ]}
      />
      <BlogLayout showBlogNavigation={true} currentArticle={{ title: article.title, slug: slug as string }}>
        <div className="w-full py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
            {/* Main article content */}
            <div className="lg:col-span-3 min-w-0 w-full">
              <article className="prose prose-stone prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert"
                       style={{ 
                         wordBreak: 'break-word', 
                         overflowWrap: 'anywhere',
                         hyphens: 'auto' 
                       }}>
            <div className="mb-6">
              <Button variant="ghost" asChild className="pl-0">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>

            <div className="mb-8 not-prose">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 break-words leading-tight hyphens-auto"
                  style={{ 
                    wordBreak: 'break-word', 
                    overflowWrap: 'anywhere',
                    hyphens: 'auto' 
                  }}>{article.title}</h1>

              {article.excerpt && (
                <p className="text-lg sm:text-xl text-muted-foreground mb-6 break-words hyphens-auto"
                   style={{ 
                     wordBreak: 'break-word', 
                     overflowWrap: 'anywhere',
                     hyphens: 'auto' 
                   }}>{article.excerpt}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <time dateTime={article.updatedAt}>
                    {formatDate(article.updatedAt)}
                  </time>
                </div>

                {article.category && (
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    <Badge variant="outline">
                      {article.category.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {article.featuredImage && (
              <div className="mb-8">
                <img 
                  src={article.featuredImage} 
                  alt={article.title} 
                  className="w-full h-auto rounded-lg object-cover aspect-video"
                />
              </div>
            )}

            <div 
              className="prose prose-stone prose-lg max-w-none dark:prose-invert mt-8"
              style={{ 
                wordBreak: 'break-word', 
                overflowWrap: 'anywhere',
                hyphens: 'auto'
              }}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-stone-900">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-stone-800">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-stone-800">{children}</h3>,
                  p: ({children}) => <p className="mb-4 text-stone-700 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="mb-4 space-y-2 ml-6 list-disc">{children}</ul>,
                  ol: ({children}) => <ol className="mb-4 space-y-2 ml-6 list-decimal">{children}</ol>,
                  li: ({children}) => <li className="text-stone-700">{children}</li>,
                  strong: ({children}) => <strong className="font-semibold text-stone-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-stone-700">{children}</em>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-stone-300 pl-4 my-4 italic text-stone-600">{children}</blockquote>,
                  code: ({children}) => <code className="bg-stone-100 px-2 py-1 rounded text-sm font-mono text-stone-800">{children}</code>,
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

                <div className="mt-12 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Last updated: {formatDate(article.updatedAt)}
                    </div>

                    {article.entityType && article.entityType !== 'general' && (
                      <Badge variant="secondary">
                        Related to: {article.entityType.charAt(0).toUpperCase() + article.entityType.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </article>
            </div>

            {/* AI Chat Sidebar */}
            <div className="lg:col-span-1 min-w-0 w-full max-w-full overflow-hidden">
              <div className="lg:sticky lg:top-6 w-full max-w-full overflow-hidden">
                <BlogAIChat 
                  articleTitle={article.title}
                  articleContent={article.content}
                  articleCategory={article.category}
                />
              </div>
            </div>
          </div>
        </div>
      </BlogLayout>
    </>
  );
};

export { BlogArticlePage };
export default BlogArticlePage;