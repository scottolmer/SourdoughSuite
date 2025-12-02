import { ReactNode } from "react";
import { useLocation } from "wouter";
import ScrollToTop from "./ScrollToTop";
import { MobileNavigation } from "./mobile-layout/MobileNavigation";
import { QuickAccessToolbar } from "./QuickAccessToolbar";
import { Breadcrumbs, useBreadcrumbs } from "./Breadcrumbs";

interface ShopLayoutProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  showQuickTools?: boolean;
}

// A specialized layout for shop pages with mobile-first bottom navigation
export default function ShopLayout({ children, showBreadcrumbs = true, showQuickTools = true }: ShopLayoutProps) {
  const [location] = useLocation();
  const breadcrumbs = useBreadcrumbs(location);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <ScrollToTop />
      <div className="bg-blue-600 text-white text-center py-3 px-4 font-medium">
        <p className="text-sm md:text-base">COMING SOON: Our sourdough starters will be available for purchase shortly!</p>
      </div>
      <header className="bg-stone-50 border-b border-stone-200 px-4 py-3">
        <h1 className="text-xl font-semibold">Shop</h1>
      </header>
      
      <main>
        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
          <div className="container mx-auto px-4 py-3">
            <Breadcrumbs 
              items={breadcrumbs} 
              className="text-sm opacity-90 hover:opacity-100"
            />
          </div>
        )}
        
        {children}
      </main>
      
      {/* Floating Quick Access Toolbar */}
      {showQuickTools && (
        <QuickAccessToolbar variant="floating" />
      )}
      
      <MobileNavigation />
    </div>
  );
}