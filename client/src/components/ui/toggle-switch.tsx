import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ToggleSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        {label && <span className="text-sm font-medium flex-grow">{label}</span>}
        <label className="relative inline-block w-12 h-6 cursor-pointer">
          <input
            type="checkbox"
            className="opacity-0 w-0 h-0"
            ref={ref}
            {...props}
          />
          <span className={cn(
            "absolute cursor-pointer inset-0 bg-[#e2d8c9] transition-colors duration-300 rounded-full",
            "before:absolute before:content-[''] before:h-4.5 before:w-4.5 before:rounded-full before:bg-white before:left-0.75 before:bottom-0.75 before:transition-transform before:duration-300",
            props.checked ? "bg-[#B8860B]" : "",
            props.checked ? "before:translate-x-6" : ""
          )} />
        </label>
      </div>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
