import { CustomSlider } from "@/components/ui/custom-slider";

interface TextureSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
  tooltip?: string;
}

export default function TextureSlider({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  leftLabel = "Low", 
  rightLabel = "High",
  tooltip
}: TextureSliderProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-[#2B2B2B] uppercase tracking-wide">
          {label}
          {tooltip && (
            <span 
              className="ml-1 inline-block text-[#D97706] cursor-help opacity-70" 
              title={tooltip}
            >
              ⓘ
            </span>
          )}
        </label>
        <span className="text-xs bg-[#F5F5F5] text-[#2B2B2B] px-3 py-1 font-mono border border-gray-200">
          {value}%
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-xs text-[#6E6E6E] min-w-[80px] font-light">{leftLabel}</span>
        <CustomSlider
          min={min}
          max={max} 
          value={value} 
          onChange={e => onChange(Number(e.target.value))}
          className="flex-grow"
          aria-label={label}
        />
        <span className="text-xs text-[#6E6E6E] min-w-[80px] text-right font-light">{rightLabel}</span>
      </div>
      
      <div className="mt-1 pt-1 flex justify-between items-center">
        <div className="h-px bg-gray-100 flex-1"></div>
        <div className="h-px bg-gray-100 flex-1"></div>
      </div>
    </div>
  );
}