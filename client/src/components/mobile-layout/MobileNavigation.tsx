import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Beaker, Book, Calculator, TrendingUp, Search, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileSearch } from "./MobileSearch";

/**
 * Mobile-first bottom navigation component
 * Designed for sourdough starter platform
 */
export function MobileNavigation() {
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  
  const navItems = [
    {
      icon: Home,
      label: "Home", 
      href: "/",
      active: location === "/",
      badge: null as string | null
    },
    {
      icon: Calculator,
      label: "Tools", 
      href: "/tools",
      active: location.startsWith("/tools"),
      badge: null as string | null
    },
    {
      icon: GraduationCap,
      label: "Starters", 
      href: "/starter-school",
      active: location.startsWith("/starter-school"),
      badge: null as string | null
    },
    {
      icon: Beaker,
      label: "Research", 
      href: "/research",
      active: location.startsWith("/research"),
      badge: null as string | null
    },

  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          'onClick' in item && item.onClick ? (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs relative transition-all duration-200 group",
                item.active 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Badge indicator */}
              {item.badge && (
                <div className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded-full animate-pulse">
                  {item.badge}
                </div>
              )}
              
              {/* Active indicator */}
              {item.active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              
              <item.icon className={cn(
                "h-5 w-5 mb-1 transition-all duration-200",
                item.active && "scale-110 text-primary",
                "group-hover:scale-105"
              )} />
              <span className={cn(
                "transition-all duration-200",
                item.active && "font-medium"
              )}>
                {item.label}
              </span>
            </button>
          ) : (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs relative transition-all duration-200 group",
                item.active 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Badge indicator */}
              {item.badge && (
                <div className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded-full animate-pulse">
                  {item.badge}
                </div>
              )}
              
              {/* Active indicator */}
              {item.active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
              
              <item.icon className={cn(
                "h-5 w-5 mb-1 transition-all duration-200",
                item.active && "scale-110 text-primary",
                "group-hover:scale-105"
              )} />
              <span className={cn(
                "transition-all duration-200",
                item.active && "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          )
        ))}
      </nav>
      
      {/* Mobile Search Modal */}
      <MobileSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Safe area padding for iOS devices */}
      <div className="h-safe-area-bottom bg-background" />
    </div>
  );
}