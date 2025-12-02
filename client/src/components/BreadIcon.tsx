import React from "react";

interface BreadIconProps {
  className?: string;
}

export function BreadIcon({ className }: BreadIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 9.5V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.5"></path>
      <path d="M3 11c0-2.8 2.2-5 5-5h8c2.8 0 5 2.2 5 5v3c0 2.8-2.2 5-5 5H8c-2.8 0-5-2.2-5-5v-3z"></path>
      <path d="M9 14H7"></path>
      <path d="M14 17h2"></path>
      <path d="M17 14h-2"></path>
      <path d="M12 14h.01"></path>
    </svg>
  );
}