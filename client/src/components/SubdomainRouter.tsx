import { useEffect, useState } from 'react';
import { getSubdomain, isStoreSubdomain, isBlogSubdomain, isAppSubdomain } from '@/lib/subdomain';

// Store-specific components
import StoreApp from '@/pages/Store/StoreApp';
import BlogApp from '@/pages/Blog/BlogApp';

interface SubdomainRouterProps {
  children: React.ReactNode;
}

export function SubdomainRouter({ children }: SubdomainRouterProps) {
  const [subdomain, setSubdomain] = useState<string>('app');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSubdomain = getSubdomain();
    setSubdomain(currentSubdomain);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Render store-specific app
  if (isStoreSubdomain()) {
    return <StoreApp />;
  }

  // Render blog-specific app
  if (isBlogSubdomain()) {
    return <BlogApp />;
  }

  // Render main app for app.* or root domain
  return <>{children}</>;
}

export default SubdomainRouter;