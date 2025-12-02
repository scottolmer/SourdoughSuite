import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, ShoppingBag, BookOpen, Wrench, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function StickyNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { getTotalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems: NavItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag, badge: getTotalItems() },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/tools', label: 'Tools', icon: Wrench },
    { href: '/my-recipes', label: 'Recipes', icon: User },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-lg text-gray-900 hidden sm:block">
                Bakehouse Breads
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = location === item.href || 
                              (item.href !== '/' && location.startsWith(item.href));
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-amber-600 bg-amber-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-amber-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">B</span>
                    </div>
                    <span className="font-semibold text-xl text-gray-900">
                      Bakehouse Breads
                    </span>
                  </div>
                  
                  {navigationItems.map((item) => {
                    const isActive = location === item.href || 
                                    (item.href !== '/' && location.startsWith(item.href));
                    
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          isActive 
                            ? 'text-amber-600 bg-amber-50' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium text-lg">{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <Badge variant="secondary" className="bg-amber-500 text-white">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}