import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BlogAIChatProps {
  articleTitle: string;
  articleContent: string;
  articleCategory?: string;
}

export default function BlogAIChat({ articleTitle, articleContent, articleCategory }: BlogAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm here to help you with questions about "${articleTitle}". I can discuss the content, provide additional insights, suggest related topics, or help with any baking questions related to this article. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom if there's more than the initial welcome message
    // This prevents auto-scroll when the component first loads
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create context-aware message for the AI
      const contextualMessage = `Context: The user is reading an article titled "${articleTitle}"${articleCategory ? ` in the ${articleCategory} category` : ''}. Article content preview: ${articleContent.substring(0, 500)}...

User question: ${userMessage.content}

Please provide a helpful response that takes into account the article context and relates to sourdough baking topics.`;

      const response = await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: contextualMessage })
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to get AI response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts for accessibility
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          sendMessage();
          break;
        case 'k':
          e.preventDefault();
          // Focus the input field
          const input = document.querySelector('.ai-chat-input') as HTMLInputElement;
          input?.focus();
          break;
      }
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
      setInput('');
    }
  };

  return (
    <Card 
      className="h-[600px] flex flex-col ai-chat-container" 
      role="region" 
      aria-label="AI Chat Assistant"
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="pb-3 px-4">
        <CardTitle className="text-lg flex items-center gap-2" id="chat-title">
          <MessageCircle className="h-5 w-5 ai-chat-avatar" aria-hidden="true" />
          <span>AI Assistant</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground" id="chat-description">
          Ask questions about this article or get baking advice
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea 
          className="flex-1 ai-chat-messages" 
          role="log" 
          aria-live="polite" 
          aria-label="Chat conversation"
        >
          <div className="space-y-4 pb-4 px-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                role="article"
                aria-labelledby={`message-${index}-role`}
              >
                <div
                  className={`flex gap-2 ai-chat-message ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`rounded-full p-2 ai-chat-avatar ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`} aria-hidden="true">
                    {message.role === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                    style={{
                      wordBreak: 'break-all',
                      overflowWrap: 'anywhere',
                      hyphens: 'auto',
                      maxWidth: '100%',
                      width: '100%'
                    }}
                    tabIndex={0}
                    role="text"
                  >
                    <span className="sr-only" id={`message-${index}-role`}>
                      {message.role === 'user' ? 'You said:' : 'AI Assistant replied:'}
                    </span>
                    <p 
                      className="break-all overflow-hidden"
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '100%',
                        width: '100%'
                      }}
                    >
                      {message.content}
                    </p>
                    <p 
                      className="text-xs opacity-70 mt-1"
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        maxWidth: '100%',
                        width: '100%'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start" role="status" aria-live="polite">
                <div className="flex gap-2 max-w-[85%] min-w-0">
                  <div className="rounded-full p-2 bg-muted flex-shrink-0" aria-hidden="true">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="rounded-lg px-3 py-2 text-sm bg-muted min-w-0 flex-1">
                    <span className="sr-only">AI is thinking and preparing a response</span>
                    <div className="flex space-x-1" aria-hidden="true">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 w-full">
          <div className="flex gap-2 w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this article..."
              disabled={isLoading}
              className="flex-1 min-w-0"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}