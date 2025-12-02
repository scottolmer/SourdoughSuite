import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface RecommendLayoutProps {
  children: ReactNode;
}

export default function RecommendLayout({ children }: RecommendLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}