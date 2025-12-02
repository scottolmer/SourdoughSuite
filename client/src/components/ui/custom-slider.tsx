import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CustomSliderProps extends HTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function CustomSlider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  ...props
}: CustomSliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-amber-100",
        "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-amber-600",
        "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-amber-600",
        "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
        className
      )}
      style={{
        // Add custom styles for the track
        background: `linear-gradient(to right, #d97706 0%, #d97706 ${
          ((value ?? 0) - min) / (max - min) * 100
        }%, #fef3c7 ${
          ((value ?? 0) - min) / (max - min) * 100
        }%, #fef3c7 100%)`,
        // Custom styles for webkit browsers
        WebkitAppearance: "none",
      }}
      {...props}
    />
  );
}