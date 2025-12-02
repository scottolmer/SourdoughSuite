import { Link, useLocation } from "wouter";
import { Menu, ChevronDown, Sparkles, Home, ShoppingBag, Book, Flame, FlaskConical, Settings, Calculator, Wrench, FileText, Plus, FileEdit, FolderPlus, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  // Close mobile menu when location changes (user navigates to a new page)
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location]);

  // Function to close menu and navigate
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" onClick={handleNavClick} className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-sm bg-[#D97706] flex items-center justify-center text-white font-serif">
                BB
              </div>
              <span className="ml-3 text-xl font-serif font-semibold text-[#2B2B2B] tracking-tight">
                Bakehouse Breads
              </span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-[#2B2B2B] hover:text-[#D97706] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link href="/shop" className="text-[#2B2B2B] hover:text-[#D97706] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-1" />
              Shop
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="text-[#2B2B2B] hover:text-[#D97706] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 focus:outline-none">
                <Flame className="h-4 w-4 mr-1" />
                Learn
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/research" className="w-full cursor-pointer flex items-center">
                    <FlaskConical className="h-4 w-4 mr-1.5 text-blue-500" />
                    Research & Evidence
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/learn" className="w-full cursor-pointer">Starter Guide</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blog" className="w-full cursor-pointer">Blog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/learn/faq" className="w-full cursor-pointer">FAQ</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tools/starter-quiz" className="w-full cursor-pointer flex items-center">
                    <FlaskConical className="h-4 w-4 mr-1.5 text-amber-500" />
                    Starter Quiz
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-[#2B2B2B] hover:text-[#D97706] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 focus:outline-none">
                <Wrench className="h-4 w-4 mr-1" />
                Tools
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/tools" className="w-full cursor-pointer flex items-center">
                    <Wrench className="h-4 w-4 mr-1.5 text-amber-500" />
                    All Tools
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tools/recipe-validator" className="w-full cursor-pointer flex items-center">
                    <FileText className="h-4 w-4 mr-1.5 text-amber-500" />
                    Recipe Validator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools/bakers-calculator" className="w-full cursor-pointer flex items-center">
                    <Calculator className="h-4 w-4 mr-1.5 text-amber-500" />
                    Baker's Percentage Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tools/timeline-calculator" className="w-full cursor-pointer">
                    Baking Timeline Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools/dough-temperature-calculator" className="w-full cursor-pointer">
                    Dough Temperature Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/baking-journal" className="w-full cursor-pointer flex items-center">
                    <Book className="h-4 w-4 mr-1.5 text-amber-500" />
                    Baking Journal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools/hydration-converter" className="w-full cursor-pointer">
                    Hydration Converter
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/admin" className="text-[#2B2B2B] hover:text-[#D97706] px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-sm text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              onClick={handleNavClick}
              className="flex items-center px-3 py-3 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link 
              href="/shop" 
              onClick={handleNavClick}
              className="flex items-center px-3 py-3 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shop
            </Link>

                <Link 
                  href="/ai/my-recipes" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <Brain className="h-4 w-4 mr-1.5 text-amber-500" />
                  My AI Recipes
                </Link>
                <Link 
                  href="/ai/recipe-analysis" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 mr-1.5 text-amber-500" />
                  Recipe Validator
                </Link>
              </div>
            </div>
            <div className="px-3 py-3">
              <div className="flex items-center text-base font-medium text-[#2B2B2B] mb-1">
                <Flame className="h-5 w-5 mr-2" />
                Learn
              </div>
              <div className="pl-4 border-l border-gray-200 space-y-2">
                <Link 
                  href="/learn" 
                  onClick={handleNavClick}
                  className="block py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  Starter Guide
                </Link>
                <Link 
                  href="/blog" 
                  onClick={handleNavClick}
                  className="block py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  Blog
                </Link>
                <Link 
                  href="/learn/faq" 
                  onClick={handleNavClick}
                  className="block py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  FAQ
                </Link>
                <Link 
                  href="/tools/starter-quiz" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <FlaskConical className="h-4 w-4 mr-1.5 text-amber-500" />
                  Starter Quiz
                </Link>
              </div>
            </div>
            <div className="px-3 py-3">
              <div className="flex items-center text-base font-medium text-[#2B2B2B] mb-1">
                <Wrench className="h-5 w-5 mr-2" />
                Tools
              </div>
              <div className="pl-4 border-l border-gray-200 space-y-2">
                <Link 
                  href="/tools" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <Wrench className="h-4 w-4 mr-1.5 text-amber-500" />
                  All Tools
                </Link>
                <Link 
                  href="/tools/recipe-validator" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 mr-1.5 text-amber-500" />
                  Recipe Validator
                </Link>
                <Link 
                  href="/tools/bakers-calculator" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <Calculator className="h-4 w-4 mr-1.5 text-amber-500" />
                  Baker's Percentage Calculator
                </Link>
                <Link 
                  href="/tools/timeline-calculator" 
                  onClick={handleNavClick}
                  className="block py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  Baking Timeline Calculator
                </Link>
                <Link 
                  href="/tools/dough-temperature-calculator" 
                  onClick={handleNavClick}
                  className="block py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  Dough Temperature Calculator
                </Link>
                <Link 
                  href="/baking-journal" 
                  onClick={handleNavClick}
                  className="flex items-center py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  <Book className="h-4 w-4 mr-1.5 text-amber-500" />
                  Baking Journal
                </Link>
                <Link 
                  href="/tools/hydration-converter" 
                  onClick={handleNavClick}
                  className="block py-2 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
                >
                  Hydration Converter
                </Link>
              </div>
            </div>
            <Link 
              href="/admin" 
              onClick={handleNavClick}
              className="flex items-center px-3 py-3 text-base font-medium text-[#2B2B2B] hover:text-[#D97706] transition-colors duration-200"
            >
              <Settings className="h-5 w-5 mr-2" />
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
