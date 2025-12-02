import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ArticleChatProps {
  articleId: number;
  articleTitle: string;
}

export function ArticleChat({ articleId, articleTitle }: ArticleChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId] = useState(`session-${Date.now()}-${Math.random()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get existing conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/articles', articleId, 'conversations', sessionId],
    enabled: isOpen
  });

  // Get messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return apiRequest(`/api/articles/${articleId}/chat`, 'POST', {
        message: messageText,
        conversationId,
        sessionId
      });
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      // Refresh messages
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations', data.conversationId, 'messages']
      });
      setMessage('');
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select first conversation if available
  useEffect(() => {
    if (conversations.length > 0 && !conversationId) {
      setConversationId(conversations[0].id);
    }
  }, [conversations, conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-96'
    } w-80`}>
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate">
              Chat about: {articleTitle}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-3 min-h-0">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {messages.length === 0 && !messagesLoading && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start a conversation about this article!</p>
                    <p className="text-xs mt-1">Ask questions, request summaries, or discuss findings.</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div className={`text-xs mt-1 opacity-70 ${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about this article..."
                className="flex-1 text-sm"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="h-9 w-9 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {sendMessageMutation.error && (
              <div className="text-xs text-destructive mt-1">
                Failed to send message. Please try again.
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}