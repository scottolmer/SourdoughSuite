import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface ChatResponse {
  response: string;
  sources?: string[];
  calculationSuggestion?: {
    type: 'hydration' | 'timeline' | 'ratios' | 'troubleshooting';
    parameters?: any;
  };
}

// Mobile-optimized MoE system with single coordinator
export async function chatWithMobileExpert(
  message: string,
  context: {
    selectedTopic?: string;
    searchResults?: any[];
    chatHistory?: Array<{role: string, content: string}>;
  }
): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build context-aware prompt
    let systemPrompt = `You are a mobile bread science expert assistant. Provide concise, practical answers optimized for mobile users.

MOBILE INTERACTION RULES:
- Keep responses under 150 words for mobile readability
- Suggest relevant calculators when applicable
- Reference research when available but keep citations brief
- Focus on actionable advice for active bakers

CALCULATOR INTEGRATION:
- Hydration: For water-to-flour ratio questions
- Timeline: For fermentation scheduling
- Ratios: For ingredient scaling
- Troubleshooting: For bread problems

EXPERT SPECIALIZATIONS:
- Fermentation: Temperature, timing, starter activity
- Chemistry: Ingredient interactions, pH, enzymatic reactions  
- Process: Mixing, shaping, baking techniques
- Troubleshooting: Dense loaves, gummy texture, flavor issues`;

    // Add context from current session
    if (context.selectedTopic) {
      systemPrompt += `\n\nCURRENT TOPIC: ${context.selectedTopic}`;
    }

    if (context.searchResults && context.searchResults.length > 0) {
      systemPrompt += `\n\nRELEVANT RESEARCH: ${context.searchResults.length} articles available`;
      const topArticle = context.searchResults[0];
      if (topArticle) {
        systemPrompt += `\nTop result: "${topArticle.title}" - ${topArticle.executiveSummary?.substring(0, 200)}...`;
      }
    }

    // Add chat history for context
    let conversationHistory = '';
    if (context.chatHistory && context.chatHistory.length > 0) {
      const recentHistory = context.chatHistory.slice(-4); // Last 2 exchanges
      conversationHistory = recentHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.content}`
      ).join('\n');
    }

    const fullPrompt = `${systemPrompt}

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory}\n` : ''}

USER QUESTION: ${message}

Provide a helpful response. If applicable, suggest a calculator tool using this format:
CALCULATOR_SUGGESTION: [type]|[brief_description]

Example: CALCULATOR_SUGGESTION: hydration|Calculate water needed for 75% hydration`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Parse response for calculator suggestions
    const calculatorMatch = text.match(/CALCULATOR_SUGGESTION:\s*(\w+)\|([^|\n]+)/);
    let calculationSuggestion;
    
    if (calculatorMatch) {
      const [, type, description] = calculatorMatch;
      if (['hydration', 'timeline', 'ratios', 'troubleshooting'].includes(type)) {
        calculationSuggestion = {
          type: type as 'hydration' | 'timeline' | 'ratios' | 'troubleshooting',
          description
        };
      }
    }

    // Clean response text
    const cleanedText = text.replace(/CALCULATOR_SUGGESTION:[^|\n]+\|[^|\n]+/g, '').trim();

    // Extract potential sources
    const sources = context.searchResults?.slice(0, 2).map(article => 
      `${article.title} - ${article.extractedCitation || 'Research Study'}`
    );

    return {
      response: cleanedText,
      sources: sources?.length ? sources : undefined,
      calculationSuggestion
    };

  } catch (error) {
    console.error('Error in mobile chat service:', error);
    return {
      response: "I'm having trouble connecting right now. Please try your question again in a moment."
    };
  }
}

// Quick topic-based responses
export async function getTopicInsights(topicSlug: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const topicPrompts = {
      'fermentation-science': 'Provide 3 key insights about sourdough fermentation science for mobile users',
      'bread-chemistry': 'Explain 3 essential bread chemistry concepts in simple terms',
      'gluten-network-formation': 'Describe 3 important facts about gluten development',
      'flour-science': 'Share 3 crucial flour science insights for bakers',
      'temperature-control': 'Give 3 key temperature control tips for bread baking',
      'starter-maintenance': 'Provide 3 essential starter maintenance insights',
      'hydration-techniques': 'Explain 3 important hydration techniques',
      'artisan-techniques': 'Share 3 professional artisan bread techniques'
    };

    const prompt = topicPrompts[topicSlug as keyof typeof topicPrompts] || 
      `Provide 3 key insights about ${topicSlug.replace('-', ' ')} for bread bakers`;

    const result = await model.generateContent(prompt + '. Keep each insight under 30 words.');
    return result.response.text();

  } catch (error) {
    console.error('Error getting topic insights:', error);
    return 'Unable to load topic insights right now.';
  }
}

// Generate search suggestions
export async function generateSearchSuggestions(currentQuery: string): Promise<string[]> {
  const suggestions = [
    'starter temperature effects',
    'hydration for beginners',
    'bulk fermentation timing',
    'troubleshooting dense bread',
    'flour protein content',
    'autolyse benefits',
    'steam baking techniques',
    'sourdough flavor development'
  ];

  // Filter and return relevant suggestions
  return suggestions
    .filter(suggestion => 
      !currentQuery || suggestion.toLowerCase().includes(currentQuery.toLowerCase().substring(0, 3))
    )
    .slice(0, 4);
}