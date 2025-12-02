import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Blog-specific pages
import BlogHomePage from './BlogHomePage';
import BlogArticlePage from './BlogArticlePage';
import BlogCategoryPage from './BlogCategoryPage';

const queryClient = new QueryClient();

export default function BlogApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light" storageKey="blog-ui-theme">
          <div className="min-h-screen bg-background">
            <Switch>
              <Route path="/" component={BlogHomePage} />
              <Route path="/articles/:slug" component={BlogArticlePage} />
              <Route path="/category/:category" component={BlogCategoryPage} />
              <Route>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                    <p className="text-muted-foreground mb-4">
                      The article you're looking for doesn't exist.
                    </p>
                    <a href="/" className="text-primary hover:underline">
                      Return to Blog Home
                    </a>
                  </div>
                </div>
              </Route>
            </Switch>
          </div>
          <Toaster />
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}