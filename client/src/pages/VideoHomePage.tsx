import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { VideoGrid } from '@/components/VideoGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, BookOpen, Users, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import type { Video } from '@shared/schema';

export default function VideoHomePage() {
  // Fetch featured videos for hero section
  const { data: featuredVideos = [], isLoading: featuredLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/featured'],
  });

  // Fetch all videos for content sections
  const { data: allVideos = [], isLoading: allVideosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const heroVideo = featuredVideos[0];
  const starterVideos = allVideos.filter(video => video.category === 'starter-care').slice(0, 3);
  const techniqueVideos = allVideos.filter(video => video.category === 'technique').slice(0, 3);
  const troubleshootingVideos = allVideos.filter(video => video.category === 'troubleshooting').slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section with Featured Video */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Sourdough with
              <span className="text-amber-600 block">Video-First Learning</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Learn from expert bakers through comprehensive video tutorials, 
              step-by-step guidance, and AI-powered personalized recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge className="bg-green-100 text-green-700 px-4 py-2">
                <Play className="h-4 w-4 mr-2" />
                100+ Video Tutorials
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                <BookOpen className="h-4 w-4 mr-2" />
                Expert Techniques
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Community Support
              </Badge>
            </div>
          </div>

          {/* Featured Video Player */}
          {heroVideo && !featuredLoading ? (
            <div className="max-w-4xl mx-auto mb-16">
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <VideoPlayer
                    youtubeId={heroVideo.youtubeId}
                    title={heroVideo.title}
                    description={heroVideo.description || undefined}
                    duration={heroVideo.duration || undefined}
                    difficulty={heroVideo.difficulty || undefined}
                    category={heroVideo.category}
                    showDetails={true}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto mb-16">
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-8">
                  <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start with the basics or dive into advanced techniques. 
              Our video-first approach ensures you see every step clearly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Care Path */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  Starter Care Essentials
                </CardTitle>
                <CardDescription>
                  Master the foundation of sourdough with comprehensive starter care videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {starterVideos.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {starterVideos.map((video) => (
                      <div key={video.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Play className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{video.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
                )}
                <Link href="/videos?category=starter-care">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Technique Mastery Path */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  Technique Mastery
                </CardTitle>
                <CardDescription>
                  Perfect your shaping, scoring, and baking with expert demonstrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {techniqueVideos.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {techniqueVideos.map((video) => (
                      <div key={video.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Play className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{video.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
                )}
                <Link href="/videos?category=technique">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Master Techniques
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Troubleshooting Path */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-bold">3</span>
                  </div>
                  Problem Solving
                </CardTitle>
                <CardDescription>
                  Fix common issues and troubleshoot your baking challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {troubleshootingVideos.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {troubleshootingVideos.map((video) => (
                      <div key={video.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Play className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">{video.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
                )}
                <Link href="/videos?category=troubleshooting">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    Solve Problems
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI-Powered Tools Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Learning Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combine video learning with intelligent AI guidance for personalized sourdough mastery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/ai-recipe-generator">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recipe Generator</h3>
                  <p className="text-sm text-gray-600">AI creates custom recipes with video guides</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tools">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Learning Tools</h3>
                  <p className="text-sm text-gray-600">Calculators and validators with tutorials</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/starters">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Starter Collection</h3>
                  <p className="text-sm text-gray-600">Premium starters with care videos</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/videos">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                    <Play className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Video Library</h3>
                  <p className="text-sm text-gray-600">Complete collection of tutorials</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Videos Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest Video Tutorials
              </h2>
              <p className="text-lg text-gray-600">
                Stay up-to-date with our newest educational content
              </p>
            </div>
            <Link href="/videos">
              <Button variant="outline" className="hidden md:flex">
                View All Videos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {!allVideosLoading && allVideos.length > 0 ? (
            <VideoGrid 
              videos={allVideos.slice(0, 6)} 
              columns={3}
              showFullPlayer={false}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link href="/videos">
              <Button>
                View All Videos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}