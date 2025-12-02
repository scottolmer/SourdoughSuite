import { ReactNode } from "react";
import NavBar from "./NavBar";
import ScrollToTop from "./ScrollToTop";

interface MinimalLayoutProps {
  children: ReactNode;
}

// A layout for pages that don't use the standard Layout but still need ScrollToTop functionality
export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <ScrollToTop />
      <NavBar />
      <main>
        {children}
      </main>
    </div>
  );
}