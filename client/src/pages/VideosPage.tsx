import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VideoGrid } from '@/components/VideoGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Play, Clock, TrendingUp } from 'lucide-react';
import type { Video } from '@shared/schema';

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const { data: featuredVideos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos/featured'],
  });

  // Filter videos based on search and selections
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'starter-care', label: 'Starter Care' },
    { value: 'technique', label: 'Techniques' },
    { value: 'fermentation', label: 'Fermentation' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const totalVideos = videos.length;
  const totalDuration = videos.reduce((acc, video) => acc + (video.duration || 0), 0);
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Video Learning Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Master sourdough baking through our comprehensive collection of expert video tutorials, 
              from beginner basics to advanced artisan techniques.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold">{totalVideos} Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold">{formatTotalDuration(totalDuration)} Content</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-lg font-semibold">Expert-Led</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search videos by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTerm && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {categories.find(c => c.value === selectedCategory)?.label}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedDifficulty !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Level: {difficulties.find(d => d.value === selectedDifficulty)?.label}
                  <button 
                    onClick={() => setSelectedDifficulty('all')}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      {featuredVideos.length > 0 && selectedCategory === 'all' && selectedDifficulty === 'all' && !searchTerm && (
        <section className="py-12 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Featured Tutorials
            </h2>
            <VideoGrid 
              videos={featuredVideos.slice(0, 3)} 
              columns={3}
              showFullPlayer={false}
            />
          </div>
        </section>
      )}

      {/* Main Video Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {filteredVideos.length === videos.length 
                ? 'All Videos' 
                : `${filteredVideos.length} Video${filteredVideos.length !== 1 ? 's' : ''} Found`}
            </h2>
            {filteredVideos.length > 0 && (
              <p className="text-gray-600">
                Showing {filteredVideos.length} of {totalVideos} videos
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16" />
                      <div className="h-6 bg-gray-100 rounded-full animate-pulse w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <VideoGrid 
              videos={filteredVideos} 
              columns={3}
              showFullPlayer={false}
            />
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No videos found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find more content.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Learning Tips Section */}
      <section className="py-16 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Get the Most from Video Learning
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Watch & Practice</h3>
              <p className="text-sm text-gray-600">
                Follow along with each video step-by-step for hands-on learning
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Take Your Time</h3>
              <p className="text-sm text-gray-600">
                Pause, rewind, and repeat sections until you master each technique
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Gradually</h3>
              <p className="text-sm text-gray-600">
                Start with beginner videos and work your way up to advanced techniques
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}