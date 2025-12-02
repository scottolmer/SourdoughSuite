import React, { useState } from 'react';
import { Play, Clock, User, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  category?: string;
  viewCount?: number;
  autoplay?: boolean;
  showDetails?: boolean;
}

export function VideoPlayer({
  youtubeId,
  title,
  description,
  duration,
  difficulty,
  category,
  viewCount,
  autoplay = false,
  showDetails = true
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {!isPlaying ? (
          <div 
            className="relative cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center"
              >
                <Play className="h-6 w-6 ml-1" fill="currentColor" />
              </Button>
            </div>
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
                {formatDuration(duration)}
              </div>
            )}
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
            <div className="flex gap-2 flex-shrink-0">
              {difficulty && (
                <Badge className={getDifficultyColor(difficulty)}>
                  {difficulty}
                </Badge>
              )}
              {category && (
                <Badge variant="outline">
                  {category.replace('-', ' ')}
                </Badge>
              )}
            </div>
          </div>

          {description && (
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(duration)}</span>
              </div>
            )}
            {viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{viewCount.toLocaleString()} views</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}