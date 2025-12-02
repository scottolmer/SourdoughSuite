import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {children}
    </div>
  );
}

interface TimelineItemProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function TimelineItem({ children, className, active = false }: TimelineItemProps) {
  return (
    <div className={cn("relative pl-6 pb-8 last:pb-0", className)}>
      {/* Line connecting timeline items */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-muted-foreground/20" />
      
      {/* Circle marker */}
      <div
        className={cn(
          "absolute left-0 -translate-x-1/2 top-1 h-4 w-4 rounded-full border border-muted-foreground/30", 
          active ? "bg-primary" : "bg-background"
        )}
      />
      
      {/* Content */}
      <div className={cn("py-2", active ? "text-primary" : "")}>
        {children}
      </div>
    </div>
  );
}