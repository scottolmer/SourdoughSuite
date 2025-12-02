import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  onChange: (value: string) => void;
  value: string;
}

export default function SortDropdown({ onChange, value }: SortDropdownProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-stone-500">Sort by:</span>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-[180px] border-amber-200 focus:ring-amber-500">
          <SelectValue placeholder="Sort products by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popularity">Popularity</SelectItem>
          <SelectItem value="price-low-high">Price: Low to High</SelectItem>
          <SelectItem value="price-high-low">Price: High to Low</SelectItem>
          <SelectItem value="name-a-z">Name: A to Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}