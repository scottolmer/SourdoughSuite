import { useState, useRef, useEffect, useMemo } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { Brain, Send, Copy, RefreshCw, Sparkles, User, Bot, Clock, ChefHat, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Recipe Display Component
const RecipeDisplay = ({ recipe }: { recipe: any }) => {
  if (!recipe) return null;
  
  // Handle different amount formats
  const formatAmount = (ingredient: any) => {
    // Try different amount field variations
    let amount = '';
    let imperialAmount = '';
    
    if (ingredient.amount) {
      if (typeof ingredient.amount === 'object') {
        amount = ingredient.amount.metric || ingredient.amount.amount || '';
        imperialAmount = ingredient.amount.imperial || '';
      } else {
        amount = ingredient.amount;
      }
    } else if (ingredient.amountMetric) {
      amount = ingredient.amountMetric;
      imperialAmount = ingredient.amountImperial || '';
    } else if (ingredient.quantityMetric) {
      amount = ingredient.quantityMetric;
      imperialAmount = ingredient.quantityImperial || '';
    } else if (ingredient.quantity) {
      amount = ingredient.quantity;
    } else if (ingredient.measurement) {
      amount = ingredient.measurement;
    }
    
    if (amount) {
      return (
        <span className="font-medium text-blue-600">
          {amount}
          {imperialAmount && amount !== imperialAmount && (
            <span className="text-gray-500 ml-1">({imperialAmount})</span>
          )}
        </span>
      );
    }
    
    return <span className="font-medium text-blue-600">-</span>;
  };
  
  return (
    <div className="space-y-6 max-w-none">
      {recipe.name && (
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-2">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-gray-600 dark:text-gray-300 italic text-lg">{recipe.description}</p>
          )}
        </div>
      )}
      
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient: any, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 font-bold mr-3 mt-1">•</span>
                <div className="flex-1">
                  <span className="font-medium">
                    {formatAmount(ingredient)}{' '}
                    {ingredient.item || ingredient.name}
                    {ingredient.temperature && (
                      <span className="text-sm text-gray-500 ml-2">({ingredient.temperature})</span>
                    )}
                  </span>
                  {ingredient.notes && (
                    <div className="text-sm text-gray-500 italic mt-1">{ingredient.notes}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {recipe.instructions && recipe.instructions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Instructions</h2>
          <ol className="space-y-3">
            {recipe.instructions.map((instruction: any, index: number) => (
              <li key={index} className="flex items-start">
                <span className="font-bold text-blue-600 mr-3 mt-1">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <p className="leading-relaxed text-gray-800 dark:text-gray-200">
                    {typeof instruction === 'string' ? instruction : instruction.step}
                  </p>
                  {typeof instruction === 'object' && instruction.time && (
                    <p className="text-sm text-blue-600 font-medium mt-1">Time: {instruction.time}</p>
                  )}
                  {typeof instruction === 'object' && instruction.temperature && (
                    <p className="text-sm text-red-600 font-medium mt-1">Temperature: {instruction.temperature}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {(recipe.totalTime || recipe.activeTime || recipe.yield || recipe.servings) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          {recipe.totalTime && (
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Time</p>
              <p className="text-xl font-bold text-blue-600">{recipe.totalTime}</p>
            </div>
          )}
          {recipe.activeTime && (
            <div className="text-center">
              <ChefHat className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Time</p>
              <p className="text-xl font-bold text-blue-600">{recipe.activeTime}</p>
            </div>
          )}
          {(recipe.yield || recipe.servings) && (
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Serves</p>
              <p className="text-xl font-bold text-blue-600">{recipe.yield || recipe.servings}</p>
            </div>
          )}
        </div>
      )}
      
      {recipe.tips && recipe.tips.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tips & Notes</h2>
          <ul className="space-y-3">
            {recipe.tips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <span className="text-yellow-600 font-medium mt-0.5">💡</span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const formatRecipeDisplay = (recipe: any): string => {
  if (!recipe) return "";
  
  let formatted = `# ${recipe.name}\n\n`;
  
  if (recipe.description) {
    formatted += `${recipe.description}\n\n`;
  }
  
  // Add timing and yields info
  if (recipe.totalTime || recipe.activeTime || recipe.yields || recipe.difficulty) {
    formatted += `**Active Time:** ${recipe.activeTime || 'N/A'} | **Total Time:** ${recipe.totalTime || 'N/A'}\n`;
    formatted += `**Yields:** ${recipe.yields || 'N/A'} | **Difficulty:** ${recipe.difficulty || 'Intermediate'}\n\n`;
  }
  
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    formatted += `## Ingredients\n\n`;
    recipe.ingredients.forEach((ingredient: any) => {
      if (typeof ingredient === 'string') {
        formatted += `• ${ingredient}\n`;
      } else if (ingredient.item) {
        const metric = ingredient.amountMetric || '';
        const imperial = ingredient.amountImperial || '';
        const amounts = metric && imperial ? `${metric} (${imperial})` : metric || imperial || '';
        formatted += `• ${amounts} ${ingredient.item}\n`;
      }
    });
    formatted += '\n';
  }
  
  if (recipe.instructions && recipe.instructions.length > 0) {
    formatted += `## Instructions\n\n`;
    recipe.instructions.forEach((instruction: any, index: number) => {
      if (typeof instruction === 'string') {
        formatted += `${index + 1}. ${instruction}\n\n`;
      } else if (instruction.description) {
        const time = instruction.time ? ` (${instruction.time})` : '';
        formatted += `${index + 1}. ${instruction.description}${time}\n\n`;
      }
    });
  }
  
  // Add temperature info
  if (recipe.temperature) {
    formatted += `## Temperature Guidelines\n\n`;
    if (recipe.temperature.oven) {
      formatted += `• **Oven:** ${recipe.temperature.oven}\n`;
    }
    if (recipe.temperature.water) {
      formatted += `• **Water:** ${recipe.temperature.water}\n`;
    }
    formatted += '\n';
  }
  
  // Add specialist agent notes (technique, ingredient, equipment, timing advice)
  if (recipe.notes && recipe.notes.length > 0) {
    formatted += `## Expert Guidance\n\n`;
    recipe.notes.forEach((note: string) => {
      formatted += `• ${note}\n`;
    });
    formatted += '\n';
  }

  if (recipe.tips && recipe.tips.length > 0) {
    formatted += `## Tips for Success\n\n`;
    recipe.tips.forEach((tip: string) => {
      formatted += `• ${tip}\n`;
    });
    formatted += '\n';
  }
  
  if (recipe.safetyConsiderations && recipe.safetyConsiderations.length > 0) {
    formatted += `## Safety Considerations\n\n`;
    recipe.safetyConsiderations.forEach((safety: string) => {
      formatted += `• ${safety}\n`;
    });
    formatted += '\n';
  }
  
  return formatted;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  recipeData?: any;
}

interface RecipeGenerationRequest {
  prompt: string;
  context?: {
    skillLevel: string;
    dietaryRestrictions: string[];
    availableIngredients: string[];
    timeConstraints: string;
    servingSize: number;
  };
  conversationHistory: Message[];
}

let isComponentMounted = false;

export function AIRecipeGenerator() {
  useEffect(() => {
    if (isComponentMounted) {
      return;
    }
    isComponentMounted = true;
    return () => {
      isComponentMounted = false;
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>(() => [{
    id: '1',
    role: 'assistant',
    content: "Hi! I'm your AI baking assistant. I can help you create personalized recipes, troubleshoot baking issues, and provide step-by-step guidance. What would you like to bake today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const recipeGenerationMutation = useMutation({
    mutationFn: async (request: RecipeGenerationRequest) => {
      return apiRequest('/api/ai/generate-recipe', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: (data, variables) => {
      console.log('API response received for /api/ai/generate-recipe:', data);
      
      // Remove loading message and add AI response
      let content = "";
      let recipeData = null;
      
      // The API now returns recipe data directly
      if (data && typeof data === 'object') {
        // Check if this is a direct recipe object
        if (data.name && data.ingredients && data.instructions) {
          recipeData = data;
          console.log('Recipe data ingredients check:', data.ingredients);
          console.log('Recipe data full object:', JSON.stringify(data, null, 2));
          content = formatRecipeDisplay(recipeData);
          console.log('Formatted content:', content);
        } else if (data.content) {
          // Legacy format support
          content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2);
        } else {
          // Fallback
          content = data.response || JSON.stringify(data, null, 2);
        }
      } else if (typeof data === 'string') {
        content = data;
      } else {
        content = "I've generated a recipe for you! Let me know if you'd like any adjustments.";
      }
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        recipeData: recipeData
      }));
    },
    onError: (error) => {
      console.error('Recipe generation failed:', error);
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble generating that recipe right now. Let me help you with a classic approach instead. What type of baking are you most interested in - bread, pastries, cakes, or something else?",
        timestamp: new Date()
      }));
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Generate AI response
    const request: RecipeGenerationRequest = {
      prompt: input.trim(),
      context: {
        skillLevel: localStorage.getItem('skillLevel') || 'intermediate',
        dietaryRestrictions: JSON.parse(localStorage.getItem('dietaryRestrictions') || '[]'),
        availableIngredients: JSON.parse(localStorage.getItem('availableIngredients') || '[]'),
        timeConstraints: localStorage.getItem('timeConstraints') || '',
        servingSize: parseInt(localStorage.getItem('servingSize') || '4')
      },
      conversationHistory: messages
    };

    recipeGenerationMutation.mutate(request);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  }

  const extractRecipeData = (content: string) => {
    // Try multiple extraction methods
    
    // Method 1: JSON code block with better regex
    let jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.name || parsed.ingredients) {
          return parsed;
        }
      } catch (e) {
        console.log('Failed to parse JSON from code block:', e);
      }
    }
    
    // Method 2: Look for JSON objects by finding balanced braces
    let braceDepth = 0;
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') {
        if (braceDepth === 0) {
          startIndex = i;
        }
        braceDepth++;
      } else if (content[i] === '}') {
        braceDepth--;
        if (braceDepth === 0 && startIndex !== -1) {
          endIndex = i;
          break;
        }
      }
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
      try {
        const jsonString = content.substring(startIndex, endIndex + 1);
        const parsed = JSON.parse(jsonString);
        if (parsed.name || parsed.ingredients) {
          return parsed;
        }
      } catch (e) {
        console.log('Failed to parse balanced JSON:', e);
      }
    }
    
    // Method 3: Try to find recipe data in formatted text
    const lines = content.split('\n');
    const recipeData: any = { ingredients: [], instructions: [] };
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('# ') && !recipeData.name) {
        recipeData.name = trimmed.replace('#', '').trim();
      } else if (trimmed.toLowerCase().includes('ingredients')) {
        currentSection = 'ingredients';
      } else if (trimmed.toLowerCase().includes('instructions')) {
        currentSection = 'instructions';
      } else if (trimmed.startsWith('•') && currentSection === 'ingredients') {
        const ingredient = trimmed.substring(1).trim();
        if (ingredient) {
          recipeData.ingredients.push({ item: ingredient, amount: '' });
        }
      } else if (/^\d+\./.test(trimmed) && currentSection === 'instructions') {
        const instruction = trimmed.replace(/^\d+\.\s*/, '');
        if (instruction) {
          recipeData.instructions.push(instruction);
        }
      }
    }
    
    if (recipeData.name && (recipeData.ingredients.length > 0 || recipeData.instructions.length > 0)) {
      return recipeData;
    }
    
    return null;
  };

  const handleOpenRecipeCard = (content: string) => {
    const recipeData = extractRecipeData(content);
    
    if (recipeData) {
      try {
        // Store the recipe data temporarily
        const recipeId = Date.now().toString();
        localStorage.setItem(`recipe_${recipeId}`, JSON.stringify(recipeData));
        // Open in new tab with proper window.open parameters
        const url = `/recipe-card/${recipeId}`;
        const newWindow = window.open(url, '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup blocked, use location.href as fallback
          const confirmed = confirm('Pop-up blocked. Open recipe card in current tab?');
          if (confirmed) {
            window.location.href = url;
          }
        }
      } catch (e) {
        console.error('Failed to open recipe card:', e);
        alert('Unable to open recipe card. Please try again.');
      }
    } else {
      alert('No recipe data found in this message. Please ensure the recipe has been fully generated.');
    }
  };

  const handleRegenerate = () => {
    if (messages.length > 1) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        const loadingMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isLoading: true
        };

        setMessages(prev => [...prev, loadingMessage]);

        const request: RecipeGenerationRequest = {
          prompt: lastUserMessage.content + " (Please provide a different variation)",
          context: {
            skillLevel: localStorage.getItem('skillLevel') || 'intermediate',
            dietaryRestrictions: JSON.parse(localStorage.getItem('dietaryRestrictions') || '[]'),
            availableIngredients: JSON.parse(localStorage.getItem('availableIngredients') || '[]'),
            timeConstraints: localStorage.getItem('timeConstraints') || '',
            servingSize: parseInt(localStorage.getItem('servingSize') || '4')
          },
          conversationHistory: messages
        };

        recipeGenerationMutation.mutate(request);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const suggestions = [
    "Create a sourdough bread recipe for beginners",
    "Help me make chocolate chip cookies that are crispy",
    "I need a gluten-free pizza dough recipe",
    "What can I bake with just flour, eggs, and sugar?",
    "Design a birthday cake for a 6-year-old",
    "I want to make croissants but I'm intermediate level"
  ];

  return (
    <MobileLayout title="AI Recipe Generator" showBackButton showQuickTools={false}>
      <SEO
        title="AI Recipe Generator | Personalized Baking Recipes"
        description="Generate custom baking recipes using advanced AI technology. Get personalized recipes, step-by-step instructions, and real-time baking guidance tailored to your skill level and preferences."
        keywords={['AI recipe generator', 'custom baking recipes', 'personalized recipes', 'AI cooking assistant', 'smart recipe creation']}
      />
      
      <div className="flex flex-col h-[calc(100vh-120px)] relative z-auto bg-white dark:bg-gray-900" key="ai-recipe-main">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">AI Recipe Generator</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Describe what you want to bake and I'll create a personalized recipe for you
          </p>
        </div>

        {/* Messages - with padding for fixed input and mobile nav */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 pb-40 md:pb-24">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 relative z-20 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
              )}
              
              <div className={`${message.role === 'user' ? 'max-w-[80%]' : 'w-full'} relative z-30 ${message.role === 'user' ? 'order-first' : ''}`}>
                <Card className={`p-4 relative z-40 ${message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-muted-foreground">Generating your recipe...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {message.content ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-blue-600">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200">{children}</h2>,
                              p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="mb-3 space-y-1">{children}</ul>,
                              li: ({ children }) => <li className="ml-4">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-blue-600">{children}</strong>,
                              code: ({ className, children, ...props }: any) => {
                                // Check if it's a JSON code block
                                if (className === 'language-json') {
                                  try {
                                    const jsonContent = String(children).replace(/\n$/, '');
                                    const parsed = JSON.parse(jsonContent);
                                    return <RecipeDisplay recipe={parsed} />;
                                  } catch (e) {
                                    // If parsing fails, show as regular code
                                    return (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                }
                                return (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              pre: ({ children }: any) => {
                                // Handle pre blocks that might contain JSON
                                const codeElement = children?.props?.children;
                                if (typeof codeElement === 'string' && codeElement.trim().startsWith('{')) {
                                  try {
                                    const parsed = JSON.parse(codeElement);
                                    return <RecipeDisplay recipe={parsed} />;
                                  } catch (e) {
                                    return <pre>{children}</pre>;
                                  }
                                }
                                return <pre>{children}</pre>;
                              },
                              // Handle direct JSON content that might not be in code blocks
                              text: ({ children }: any) => {
                                const text = String(children);
                                // Check if this is a JSON string that should be parsed
                                if (text.trim().startsWith('{') && text.trim().endsWith('}') && text.length > 100) {
                                  try {
                                    const parsed = JSON.parse(text);
                                    if (parsed.name && parsed.ingredients) {
                                      return <RecipeDisplay recipe={parsed} />;
                                    }
                                  } catch (e) {
                                    // Not valid JSON, render as text
                                  }
                                }
                                return text;
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          "Recipe generated successfully! Check the details above."
                        )}
                      </div>
                      
                      {message.role === 'assistant' && !message.isLoading && (
                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(message.content)}
                            className="h-7 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRegenerate}
                            className="h-7 px-2 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Regenerate
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenRecipeCard(message.content)}
                            className="h-7 px-2 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Recipe Card
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {message.role === 'user' ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Bot className="h-3 w-3" />
                  )}
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>



        {/* Fixed Input at Bottom - account for mobile nav */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 border-t bg-background z-50 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  placeholder="Describe what you want to bake..."
                  className="min-h-[44px] max-h-32 resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || recipeGenerationMutation.isPending}
                  className="absolute right-2 bottom-2 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}