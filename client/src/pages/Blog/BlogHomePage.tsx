import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Calendar, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiEndpoint } from '@/lib/subdomain';

// Blog header component
function BlogHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bakehouse Blog</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-600 hover:text-gray-900">Latest</a>
            <a href="/category/techniques" className="text-gray-600 hover:text-gray-900">Techniques</a>
            <a href="/category/recipes" className="text-gray-600 hover:text-gray-900">Recipes</a>
            <a href="/category/science" className="text-gray-600 hover:text-gray-900">Science</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Article card component
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
          {article.category && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {article.category}
            </Badge>
          )}
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

export default function BlogHomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch articles from blog API
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      const response = await fetch(getApiEndpoint('/articles'));
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(articles.map(article => article.category).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>Bakehouse Blog - Sourdough Techniques, Recipes & Science</title>
        <meta name="description" content="Expert insights into sourdough baking, from traditional techniques to modern science. Learn from professional bakers and sourdough enthusiasts." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <BlogHeader />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              The Art of Sourdough
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Expert techniques, authentic recipes, and the science behind great bread
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Tag className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : 
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading articles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Failed to load articles</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">
                    {filteredArticles.length} Article{filteredArticles.length !== 1 ? 's' : ''}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                
                {filteredArticles.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-gray-600 mb-4">No articles found matching your criteria</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Bakehouse Blog</h3>
                <p className="text-gray-400">
                  Your source for expert sourdough knowledge and authentic baking techniques.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/category/techniques" className="hover:text-white">Techniques</a></li>
                  <li><a href="/category/recipes" className="hover:text-white">Recipes</a></li>
                  <li><a href="/category/science" className="hover:text-white">Science</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/newsletter" className="hover:text-white">Newsletter</a></li>
                  <li><a href="/about" className="hover:text-white">About</a></li>
                  <li><a href="/contact" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Bakehouse Blog. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}