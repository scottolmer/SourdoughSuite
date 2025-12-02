import * as React from "react";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export interface BreadcrumbItem {
  name: string;
  url: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  maxItems?: number;
  separator?: React.ReactNode;
  homeIcon?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  maxItems = 3,
  separator = <ChevronRight className="h-3 w-3 text-muted-foreground" />,
  homeIcon = true,
  className,
  ...props
}: BreadcrumbsProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(items.length > maxItems);
  const displayItems = React.useMemo(() => {
    if (!isCollapsed || items.length <= maxItems) return items;
    
    // Always show first and last items, collapse the middle
    return [
      items[0],
      { name: "...", url: "#", icon: <MoreHorizontal className="h-4 w-4" /> },
      ...items.slice(items.length - (maxItems - 2))
    ];
  }, [items, isCollapsed, maxItems]);

  return (
    <nav className={cn("flex flex-wrap items-center text-sm", className)} {...props}>
      <ol className="flex items-center space-x-1 flex-wrap">
        {displayItems.map((item, index) => {
          const isLastItem = index === displayItems.length - 1;
          const isHomeItem = index === 0 && homeIcon;
          const isCollapseItem = item.url === "#" && item.name === "...";

          return (
            <li key={index} className="flex items-center">
              {isCollapseItem ? (
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="flex items-center text-muted-foreground hover:text-primary"
                  aria-label="Expand breadcrumbs"
                >
                  {item.icon}
                </button>
              ) : (
                <Link
                  href={item.url}
                  className={cn(
                    "flex items-center hover:text-primary transition-colors",
                    isLastItem ? "font-medium text-primary" : "text-muted-foreground"
                  )}
                >
                  {isHomeItem ? (
                    <Home className="h-3 w-3 mr-1" />
                  ) : item.icon ? (
                    <span className="mr-1">{item.icon}</span>
                  ) : null}
                  <span className={cn(
                    "truncate max-w-[100px] md:max-w-[200px]",
                    isLastItem && "text-primary"
                  )}>
                    {item.name}
                  </span>
                </Link>
              )}
              
              {!isLastItem && (
                <span className="mx-1 text-muted-foreground">{separator}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}