import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MobileToolCardProps {
  icon: LucideIcon;
  title: string;
  color: string;
  onClick: () => void;
}

export function MobileToolCard({ icon: Icon, title, color, onClick }: MobileToolCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-100"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="font-medium text-gray-900 text-sm leading-tight">{title}</h3>
      </CardContent>
    </Card>
  );
}