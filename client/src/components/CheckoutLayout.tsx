import { ReactNode } from "react";
import { ScrollToTop } from "./ScrollToTop";
import { Link } from "wouter";
import { BreadIcon } from "./BreadIcon";

interface CheckoutLayoutProps {
  children: ReactNode;
}

// A layout specifically for checkout pages that doesn't include NavBar
export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <ScrollToTop />
      <header className="border-b py-4">
        <div className="container flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2">
            <BreadIcon className="h-8 w-8" />
            <span className="text-xl font-serif font-medium">Bakehouse Breads</span>
          </Link>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}