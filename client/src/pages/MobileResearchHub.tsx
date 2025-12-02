import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import MobileChatInterface from "@/components/MobileChatInterface";
import { 
  Search, 
  MessageCircle, 
  BookOpen, 
  Calculator,
  ArrowLeft,
  Send,
  ChevronDown,
  Menu,
  TrendingUp,
  Sparkles
} from "lucide-react";

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
  viewCount: number;
  isStarterFocused: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  calculationSuggestion?: {
    type: 'hydration' | 'timeline' | 'ratios' | 'troubleshooting';
    description?: string;
  };
}

export default function MobileResearchHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // Get URL parameters for initial state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    const search = params.get('search');
    
    if (topic) {
      setSelectedTopic(topic);
      setActiveTab("search");
    } else if (search) {
      setSearchQuery(search);
      setActiveTab("search");
    }
  }, []);

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/research/topics"],
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/research/articles", { topic: selectedTopic, search: searchQuery }],
    enabled: selectedTopic !== null || searchQuery.length > 0,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSelectedTopic(null);
      setActiveTab("search");
    }
  };

  const handleTopicSelect = (topicSlug: string) => {
    setSelectedTopic(topicSlug);
    setSearchQuery("");
    setActiveTab("search");
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      const newMessage: ChatMessage = {
        role: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setCurrentMessage("");
      
      try {
        const response = await fetch('/api/mobile/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            context: {
              selectedTopic,
              searchQuery,
              chatHistory: chatMessages.slice(-4) // Last 2 exchanges
            }
          })
        });
        
        const data = await response.json();
        
        const aiResponse: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          sources: data.sources,
          calculationSuggestion: data.calculationSuggestion
        };
        
        setChatMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorResponse: ChatMessage = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try your question again.",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  const handleAskAIAboutResults = () => {
    setActiveTab("chat");
    if (articles.length > 0) {
      const contextMessage = `I found ${articles.length} research articles about "${searchQuery || selectedTopic}". Can you help me understand the key findings?`;
      setCurrentMessage(contextMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/mobile")}
              className="p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Research Hub</h1>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Global Search Bar */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 text-sm"
              />
            </div>
            <Button onClick={handleSearch} size="sm">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="flex-1 min-h-[calc(100vh-140px)]">
          {/* Topics Panel */}
          <TabsContent value="topics" className="m-0 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Research Topics</h2>
                <Badge variant="secondary">{topics.length} topics</Badge>
              </div>
              
              {topics.map((topic) => (
                <Card key={topic.id} className="cursor-pointer">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start justify-between"
                      onClick={() => {
                        if (expandedTopic === topic.slug) {
                          setExpandedTopic(null);
                        } else {
                          setExpandedTopic(topic.slug);
                        }
                      }}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{topic.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{topic.sourceCount} articles</span>
                          <span>•</span>
                          <span>Updated</span>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expandedTopic === topic.slug ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                    
                    {expandedTopic === topic.slug && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          {topic.description}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleTopicSelect(topic.slug)}
                            className="flex-1"
                          >
                            View Articles
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTopic(topic.slug);
                              setActiveTab("chat");
                            }}
                          >
                            Ask AI
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Search/Results Panel */}
          <TabsContent value="search" className="m-0 p-4">
            {/* Breadcrumb */}
            {(selectedTopic || searchQuery) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>Research</span>
                <span>›</span>
                {selectedTopic && <span>{topics.find(t => t.slug === selectedTopic)?.name}</span>}
                {searchQuery && <span>"{searchQuery}"</span>}
              </div>
            )}

            {articles.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Research Results</h2>
                  <Badge variant="secondary">{articles.length} articles</Badge>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAskAIAboutResults}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask AI
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/mobile-tools")}
                    className="flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    Calculator
                  </Button>
                </div>

                {/* Article Results */}
                <div className="space-y-3">
                  {articles.map((article) => (
                    <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm leading-tight line-clamp-2">
                            {article.title}
                          </h3>
                          {article.isStarterFocused && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Starter
                            </Badge>
                          )}
                        </div>
                        
                        {article.extractedCitation && (
                          <p className="text-xs text-muted-foreground italic mb-2">
                            {article.extractedCitation}
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.executiveSummary}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{article.viewCount} views</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/research/${article.slug}`)}
                          >
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  Try searching for different terms or browse topics
                </p>
                <Button onClick={() => setActiveTab("topics")}>
                  Browse Topics
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Chat Panel */}
          <TabsContent value="chat" className="m-0 h-[calc(100vh-140px)]">
            <MobileChatInterface 
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={false}
              context={{
                selectedTopic,
                searchQuery
              }}
            />
          </TabsContent>

          {/* Tools Panel */}
          <TabsContent value="tools" className="m-0 p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Calculator Tools</h2>
              <p className="text-muted-foreground">
                Professional-grade bread science calculators
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Hydration", icon: Calculator, color: "bg-blue-500" },
                  { name: "Timeline", icon: Calculator, color: "bg-green-500" },
                  { name: "Ratios", icon: Calculator, color: "bg-purple-500" },
                  { name: "Troubleshoot", icon: Calculator, color: "bg-orange-500" }
                ].map((tool) => (
                  <Card key={tool.name} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button 
                className="w-full"
                onClick={() => navigate("/mobile-tools")}
              >
                Open Calculator Tools
              </Button>
            </div>
          </TabsContent>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="bg-white border-t sticky bottom-0 z-10">
          <TabsList className="grid grid-cols-4 w-full h-16 rounded-none bg-transparent">
            <TabsTrigger 
              value="topics" 
              className="flex-col gap-1 h-full data-[state=active]:bg-blue-50"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Topics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex-col gap-1 h-full data-[state=active]:bg-blue-50"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex-col gap-1 h-full data-[state=active]:bg-blue-50"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="flex-col gap-1 h-full data-[state=active]:bg-blue-50"
            >
              <Calculator className="h-5 w-5" />
              <span className="text-xs">Tools</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}