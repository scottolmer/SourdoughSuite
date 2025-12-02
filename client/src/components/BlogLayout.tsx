import { ReactNode } from "react";
import ScrollToTop from "./ScrollToTop";
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { MobileNavigation } from "./mobile-layout/MobileNavigation";
import { BreadIcon } from "./BreadIcon";

interface BlogLayoutProps {
  children: ReactNode;
  showBlogNavigation?: boolean;
  currentArticle?: {
    title: string;
    slug: string;
  };
}

export default function BlogLayout({ children, showBlogNavigation = false, currentArticle }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <ScrollToTop />
      
      {/* Simple header without hamburger menu */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-sm bg-[#D97706] flex items-center justify-center text-white font-serif">
                BB
              </div>
              <span className="ml-3 text-xl font-serif font-semibold text-[#2B2B2B] tracking-tight">
                Bakehouse Breads
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto w-full overflow-hidden">
          {children}
        </div>
      </main>
      
      {/* Blog Navigation - Now at bottom of page */}
      {showBlogNavigation && (
        <div className="bg-stone-100 border-y border-stone-200 mt-8 mb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-sm text-stone-600">
              <Link href="/" className="flex items-center hover:text-stone-900">
                <Home className="h-4 w-4 mr-1" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              
              <Link href="/blog" className="hover:text-stone-900">Blog</Link>
              
              {currentArticle && (
                <>
                  <ChevronRight className="h-4 w-4 mx-2" />
                  <span className="text-stone-900 truncate max-w-[150px] sm:max-w-xs" title={currentArticle.title}>
                    {currentArticle.title}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation Bar */}
      <MobileNavigation />
    </div>
  );
}