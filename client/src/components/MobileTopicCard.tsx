import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface MobileTopicCardProps {
  name: string;
  description: string;
  sourceCount: number;
  onClick: () => void;
}

export function MobileTopicCard({ name, description, sourceCount, onClick }: MobileTopicCardProps) {
  const getTopicIcon = (name: string) => {
    if (name.toLowerCase().includes('fermentation')) return '🦠';
    if (name.toLowerCase().includes('chemistry')) return '⚗️';
    if (name.toLowerCase().includes('gluten')) return '🌾';
    if (name.toLowerCase().includes('temperature')) return '🌡️';
    return '📚';
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-100"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getTopicIcon(name)}</span>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
            </div>
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">{description}</p>
            <Badge variant="secondary" className="text-xs">
              {sourceCount} articles
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}