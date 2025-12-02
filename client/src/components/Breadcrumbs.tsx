import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export function Breadcrumbs({ items, className, showHomeIcon = true }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {/* Home icon if enabled */}
        {showHomeIcon && (
          <li>
            <Link href="/">
              <div className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </div>
            </Link>
          </li>
        )}

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {(index > 0 || showHomeIcon) && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
              
              {item.href && !isLast ? (
                <Link href={item.href}>
                  <div className="flex items-center space-x-1 hover:text-foreground transition-colors">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              ) : (
                <div className={cn(
                  "flex items-center space-x-1",
                  isLast ? "text-foreground font-semibold" : "text-muted-foreground"
                )}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs based on current route
export function useBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Build breadcrumbs based on route structure
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Map segments to readable labels
    const label = getBreadcrumbLabel(segment, segments, i);
    const isLast = i === segments.length - 1;
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }
  
  return breadcrumbs;
}

function getBreadcrumbLabel(segment: string, allSegments: string[], index: number): string {
  // Handle specific route patterns
  switch (segment) {
    case 'shop':
      return 'Shop';
    case 'blog':
      return 'Blog';
    case 'tools':
      return 'Tools';
    case 'recipes':
      return 'Recipes';
    case 'my-recipes':
      return 'My Recipes';
    case 'starter':
      return 'Starter';
    case 'quiz':
      return 'Quiz';
    case 'maintenance':
      return 'Maintenance';
    case 'baking-journal':
      return 'Baking Journal';
    case 'recipe-generator':
      return 'Recipe Generator';
    case 'timeline-calculator':
      return 'Timeline Calculator';
    case 'bakers-calculator':
      return 'Baker\'s Calculator';
    case 'recipe-validator':
      return 'Recipe Validator';
    case 'ai':
      return 'AI Tools';
    case 'recipe-analysis':
      return 'Recipe Analysis';
    case 'new':
      return 'Create New';
    case 'edit':
      return 'Edit';
    case 'admin':
      return 'Admin';
    case 'checkout':
      return 'Checkout';
    case 'cart':
      return 'Cart';
    case 'learn':
      return 'Learn';
    case 'faq':
      return 'FAQ';
    case 'starter-product':
      return 'Starter Products';
    case 'baking-logs':
      return 'Baking Logs';
    default:
      // Handle dynamic segments (IDs, slugs)
      if (/^\d+$/.test(segment)) {
        // It's a numeric ID, try to infer context
        const prevSegment = allSegments[index - 1];
        switch (prevSegment) {
          case 'recipes':
            return 'Recipe Details';
          case 'starter-product':
            return 'Starter Details';
          case 'baking-logs':
            return 'Baking Log';
          default:
            return 'Details';
        }
      }
      
      // Handle slug-like segments
      if (segment.includes('-')) {
        return segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      // Default: capitalize first letter
      return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}