import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiEndpoint } from '@/lib/subdomain';

function ArticleCard({ article }: { article: any }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {article.featuredImageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(article.createdAt)}
          </div>
        </div>
        <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">
          {article.title}
        </CardTitle>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt || article.content?.substring(0, 150) + '...'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {article.readingTime || '5'} min read
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = `/articles/${article.slug}`}
          >
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BlogCategoryPage() {
  const { category } = useParams();

  // Scroll to top when component mounts or category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  // Fetch articles and filter by category
  const { data: allArticles = [], isLoading, error } = useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      const response = await fetch(getApiEndpoint('/articles'));
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });

  const articles = allArticles.filter((article: any) => article.category === category);

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Articles';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{categoryName} Articles - Bakehouse Blog</title>
        <meta name="description" content={`Browse ${categoryName.toLowerCase()} articles about sourdough baking.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Bakehouse Blog</span>
              </div>
            </div>
          </div>
        </header>

        {/* Category Header */}
        <section className="bg-white border-b py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName} Articles</h1>
            <p className="text-gray-600">
              {articles.length} article{articles.length !== 1 ? 's' : ''} in this category
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Failed to load articles</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 mb-4">No articles found in this category</p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse All Articles
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}