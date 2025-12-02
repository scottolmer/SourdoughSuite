import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReactNode } from "react";

interface MobileBottomSheetProps {
  children: ReactNode;
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footer?: ReactNode;
}

/**
 * Mobile-optimized bottom sheet component
 * Used for displaying content that slides up from the bottom of the screen
 */
export function MobileBottomSheet({
  children,
  title,
  description,
  open,
  onOpenChange,
  footer
}: MobileBottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-xl">
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        
        <div className="py-4">
          {children}
        </div>
        
        {footer && (
          <SheetFooter>
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}