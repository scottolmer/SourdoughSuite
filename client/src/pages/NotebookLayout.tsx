import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, BookOpen, MessageCircle, Filter } from "lucide-react";
import { useLocation } from "wouter";

interface Topic {
  id: number;
  name: string;
  description: string;
  slug: string;
  sourceCount: number;
  confidenceScore: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  executiveSummary: string;
  extractedCitation: string;
  topics: string[];
  viewCount: number;
}

export default function NotebookLayout() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string}>>([]);
  const [location, navigate] = useLocation();

  // Fetch topics for left sidebar
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/research/topics"],
  });

  // Fetch articles based on selected topic or search
  const articlesQueryKey = selectedTopic ? 
    ["/api/research/articles", `topic=${selectedTopic}`] : 
    searchQuery ? ["/api/research/articles", `search=${searchQuery}`] : 
    ["/api/research/articles"];
    
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: articlesQueryKey,
    enabled: selectedTopic !== null || searchQuery.length > 0,
  });

  // Handle topic selection
  const handleTopicSelect = (topicSlug: string) => {
    setSelectedTopic(topicSlug);
    setSearchQuery("");
  };

  // Handle article selection
  const handleArticleSelect = (articleSlug: string) => {
    navigate(`/research/${articleSlug}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Topics */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Research Topics</h2>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {topics.map((topic) => (
              <Card 
                key={topic.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  selectedTopic === topic.slug ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleTopicSelect(topic.slug)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900 mb-1">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {topic.sourceCount} sources
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {topic.confidenceScore}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Middle Panel - Search & Articles */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search research articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedTopic && (
            <div className="mt-3">
              <Badge variant="secondary" className="mb-2">
                Topic: {topics.find(t => t.slug === selectedTopic)?.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Articles List */}
        <ScrollArea className="flex-1 p-4">
          {!selectedTopic && !searchQuery ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Research Topic
              </h3>
              <p className="text-gray-600">
                Choose a topic from the sidebar to explore relevant research articles
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card 
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleSelect(article.slug)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-gray-900 leading-tight">
                      {article.title}
                    </CardTitle>
                    {article.extractedCitation && (
                      <p className="text-sm text-gray-600 italic">
                        {article.extractedCitation}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 mb-3">
                      {article.executiveSummary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {article.topics?.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {article.viewCount} views
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Sidebar - AI Chat */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Research Assistant</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">
                Start a Research Discussion
              </h3>
              <p className="text-sm text-gray-600">
                Ask questions about bread science, fermentation, or any research topic
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about research..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // Handle chat message
                }
              }}
            />
            <Button size="sm">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}