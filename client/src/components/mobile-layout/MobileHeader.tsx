import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

/**
 * Mobile header component with optional back button
 */
export function MobileHeader({ title, showBackButton = false }: MobileHeaderProps) {
  const [_, navigate] = useLocation();

  const handleBack = () => {
    // Use string to navigate back to avoid type error
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-background border-b border-border flex items-center px-4">
      <div className="flex items-center w-full">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        {title && (
          <h1 className="text-lg font-medium truncate">
            {title}
          </h1>
        )}
      </div>
    </header>
  );
}