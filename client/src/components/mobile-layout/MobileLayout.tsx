import { ScrollArea } from "@/components/ui/scroll-area";
import { MobileNavigation } from "./MobileNavigation";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Breadcrumbs, type BreadcrumbItem, useBreadcrumbs } from "@/components/Breadcrumbs";
import { StickyNavigation } from "@/components/StickyNavigation";
import { QuickAccessToolbar } from "@/components/QuickAccessToolbar";
// Will add MobileHeader back after fixing it
// import { MobileHeader } from "./MobileHeader";

// Enhanced Simplified header component with back button and right content support
function SimpleMobileHeader({ 
  title, 
  showBackButton = false, 
  backHref,
  rightContent 
}: { 
  title?: string; 
  showBackButton?: boolean;
  backHref?: string;
  rightContent?: ReactNode;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-background border-b border-border flex items-center px-4">
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center">
          {showBackButton && (
            <Link href={backHref || "/"} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-lg font-medium">{title || "Bakehouse Breads"}</h1>
        </div>
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showHeader?: boolean;
  useBottomNav?: boolean;
  backHref?: string;
  rightContent?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  showQuickTools?: boolean;
  useStickyNav?: boolean;
}

/**
 * Main mobile-first layout component
 * Includes sticky navigation, breadcrumbs, scrollable content area, and quick access toolbar
 */
export function MobileLayout({ 
  children, 
  title, 
  showBackButton = false,
  showHeader = true,
  useBottomNav = true,
  backHref,
  rightContent,
  breadcrumbs,
  showBreadcrumbs = true,
  showQuickTools = true,
  useStickyNav = false
}: MobileLayoutProps) {
  const [location] = useLocation();
  const autoBreadcrumbs = useBreadcrumbs(location);
  const finalBreadcrumbs = breadcrumbs || autoBreadcrumbs;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky Navigation */}
      {useStickyNav && <StickyNavigation />}
      
      {/* Legacy header for backwards compatibility */}
      {showHeader && !useStickyNav && (
        <SimpleMobileHeader 
          title={title} 
          showBackButton={showBackButton} 
          backHref={backHref}
          rightContent={rightContent}
        />
      )}
      
      {/* Main content area - scrollable with padding for sticky nav and bottom nav */}
      <ScrollArea className="flex-1 pb-16 relative z-0" style={{ 
        paddingTop: useStickyNav ? "5rem" : (showHeader ? "4rem" : "0")
      }}>
        <main className="px-3 py-3 w-full overflow-x-hidden relative z-10">
          {/* Breadcrumbs */}
          {showBreadcrumbs && finalBreadcrumbs && finalBreadcrumbs.length > 0 && (
            <div className="mb-4 px-1">
              <Breadcrumbs 
                items={finalBreadcrumbs} 
                className="text-xs md:text-sm opacity-90 hover:opacity-100"
              />
            </div>
          )}
          
          {/* Quick Access Toolbar (embedded variant for certain pages) - Hidden per user request */}
          {/* {showQuickTools && location === '/tools' && (
            <div className="mb-6">
              <QuickAccessToolbar variant="embedded" />
            </div>
          )} */}
          
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </ScrollArea>
      
      {/* Floating Quick Access Toolbar - Hidden per user request */}
      {/* {showQuickTools && location !== '/tools' && (
        <QuickAccessToolbar variant="floating" />
      )} */}
      
      {useBottomNav && <MobileNavigation />}
    </div>
  );
}