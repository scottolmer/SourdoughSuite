import { ReactNode } from "react";
import NavBar from "./NavBar";
import ScrollToTop from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <ScrollToTop />
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}
