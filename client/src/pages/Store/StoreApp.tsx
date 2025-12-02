import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

// Store-specific pages
import StoreHomePage from './StoreHomePage';
import StoreProductPage from './StoreProductPage';
import StoreCategoryPage from './StoreCategoryPage';
import StoreCheckoutPage from './StoreCheckoutPage';
import StoreCartPage from './StoreCartPage';

// Store-specific providers
import { StoreCartProvider } from './StoreCartContext';

const queryClient = new QueryClient();

export default function StoreApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StoreCartProvider>
            <div className="min-h-screen bg-background">
              <Switch>
                <Route path="/" component={StoreHomePage} />
                <Route path="/products/:slug" component={StoreProductPage} />
                <Route path="/category/:category" component={StoreCategoryPage} />
                <Route path="/cart" component={StoreCartPage} />
                <Route path="/checkout" component={StoreCheckoutPage} />
                <Route>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                      <p className="text-muted-foreground mb-4">
                        The page you're looking for doesn't exist in our store.
                      </p>
                      <a href="/" className="text-primary hover:underline">
                        Return to Store Home
                      </a>
                    </div>
                  </div>
                </Route>
              </Switch>
            </div>
            <Toaster />
          </StoreCartProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}