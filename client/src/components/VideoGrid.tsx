import React from 'react';
import { Video } from '@shared/schema';
import { VideoPlayer } from './VideoPlayer';
import { Card, CardContent } from '@/components/ui/card';

interface VideoGridProps {
  videos: Video[];
  columns?: 1 | 2 | 3;
  showFullPlayer?: boolean;
}

export function VideoGrid({ videos, columns = 3, showFullPlayer = false }: VideoGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No videos found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridClass[columns]}`}>
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            {showFullPlayer ? (
              <div className="p-4">
                <VideoPlayer
                  youtubeId={video.youtubeId}
                  title={video.title}
                  description={video.description || undefined}
                  duration={video.duration || undefined}
                  difficulty={video.difficulty || undefined}
                  category={video.category}
                  viewCount={video.viewCount || undefined}
                />
              </div>
            ) : (
              <VideoThumbnailCard video={video} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function VideoThumbnailCard({ video }: { video: Video }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  return (
    <div className="cursor-pointer group">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {video.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{video.difficulty}</span>
          <span className="capitalize">{video.category.replace('-', ' ')}</span>
        </div>
      </div>
    </div>
  );
}