import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, Send, Sparkles, Clock, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

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

interface MobileChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  context?: {
    selectedTopic?: string;
    searchQuery?: string;
  };
}

export default function MobileChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  context 
}: MobileChatInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [, navigate] = useLocation();

  const handleSend = async () => {
    if (currentMessage.trim() && !isLoading) {
      await onSendMessage(currentMessage);
      setCurrentMessage("");
    }
  };

  const quickPrompts = [
    "What's the optimal starter temperature?",
    "My bread is too dense, what went wrong?",
    "How do I improve fermentation timing?",
    "What hydration should I use for beginners?"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium">AI Bread Science Expert</h3>
        </div>
        {context?.selectedTopic && (
          <Badge variant="secondary" className="text-xs">
            Topic: {context.selectedTopic.replace('-', ' ')}
          </Badge>
        )}
        {context?.searchQuery && (
          <Badge variant="outline" className="text-xs ml-2">
            Search: "{context.searchQuery}"
          </Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="font-medium mb-2">Start a conversation</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Ask about fermentation, recipes, troubleshooting, and more
            </p>
            <div className="space-y-2">
              {quickPrompts.slice(0, 2).map((prompt, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentMessage(prompt)}
                  className="text-xs w-full"
                >
                  "{prompt}"
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-300/50">
                    <p className="text-xs font-medium mb-1 opacity-90">Sources:</p>
                    {message.sources.map((source, idx) => (
                      <p key={idx} className="text-xs opacity-80 mb-1">• {source}</p>
                    ))}
                  </div>
                )}
                
                {/* Calculator Suggestion */}
                {message.calculationSuggestion && (
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs bg-white/20 hover:bg-white/30 border-white/30"
                      onClick={() => navigate(`/mobile-tools#${message.calculationSuggestion?.type}`)}
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      {message.calculationSuggestion.description || 'Open Calculator'}
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {message.role === 'assistant' && (
                    <Badge variant="secondary" className="text-xs bg-white/20">
                      AI
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about bread science..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="sm"
            disabled={!currentMessage.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick suggestions when empty */}
        {messages.length === 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {quickPrompts.slice(2, 4).map((prompt, index) => (
              <Button 
                key={index}
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentMessage(prompt)}
                className="text-xs whitespace-nowrap flex-shrink-0"
              >
                {prompt.split(' ').slice(0, 3).join(' ')}...
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}