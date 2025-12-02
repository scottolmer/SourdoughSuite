import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileCardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  image?: string;
  imageAlt?: string;
}

/**
 * Touch-optimized card component for mobile interfaces
 */
export function MobileCard({
  title,
  description,
  children,
  footer,
  className,
  onClick,
  image,
  imageAlt = "Card image"
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 touch-manipulation", 
        onClick && "hover:border-primary/50 active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {(title || description) && (
        <CardHeader className="p-3">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      {children && (
        <CardContent className={cn(
          "p-3",
          !title && !description && "pt-4"
        )}>
          <div className="max-w-full overflow-hidden">
            {children}
          </div>
        </CardContent>
      )}
      
      {footer && (
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}