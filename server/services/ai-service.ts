// AI Service using OpenAI with nano GPT model
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use NanoGPT as requested
const DEFAULT_MODEL = "gpt-4o-mini";

interface RequestOptions {
  messages: Array<{role: string, content: string}>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
}

interface AIServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function makeAIRequest(options: RequestOptions): Promise<AIServiceResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key is not configured"
      };
    }

    console.log(`Making OpenAI request using model ${options.model || DEFAULT_MODEL}`);
    
    const requestParams: any = {
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
    };

    if (options.response_format) {
      requestParams.response_format = options.response_format;
    }

    const completion = await openai.chat.completions.create(requestParams);

    return {
      success: true,
      data: {
        choices: completion.choices.map(choice => ({
          message: {
            role: choice.message.role,
            content: choice.message.content
          },
          finish_reason: choice.finish_reason
        }))
      }
    };

  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function testConnection(): Promise<AIServiceResponse> {
  try {
    const result = await makeAIRequest({
      messages: [
        { role: "user", content: "Hello! Please respond with 'Connection successful'" }
      ]
    });
    
    return {
      success: result.success,
      data: result.data,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection test failed"
    };
  }
}

// Recipe generation is handled by the main /api/ai/generate-recipe route
// This function is kept for compatibility but should not be used
export async function generateRecipe(userProfile: any): Promise<AIServiceResponse> {
  console.warn("Deprecated generateRecipe function called - use /api/ai/generate-recipe instead");
  return {
    success: false,
    error: "Use the main /api/ai/generate-recipe endpoint instead"
  };
}

export async function generateBlogPost(topic: string): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are a blog post writer for a baking website." },
      { role: "user", content: `Write a blog post about: ${topic}` }
    ]
  });
}

export async function generateFaqs(topic: string): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are an FAQ generator for a baking website." },
      { role: "user", content: `Generate FAQs about: ${topic}` }
    ]
  });
}

export async function analyzeRecipe(recipe: any): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are a recipe analyzer." },
      { role: "user", content: `Analyze this recipe: ${JSON.stringify(recipe)}` }
    ]
  });
}

export async function recommendStarter(preferences: any): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are a sourdough starter expert." },
      { role: "user", content: `Recommend a starter for: ${JSON.stringify(preferences)}` }
    ]
  });
}

export async function generateBakingTimeline(recipe: any): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are a baking timeline expert." },
      { role: "user", content: `Create a timeline for: ${JSON.stringify(recipe)}` }
    ]
  });
}

export async function suggestSubstitutions(ingredient: string): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are an ingredient substitution expert." },
      { role: "user", content: `Suggest substitutions for: ${ingredient}` }
    ]
  });
}

export async function troubleshootBaking(issue: string): Promise<AIServiceResponse> {
  return makeAIRequest({
    messages: [
      { role: "system", content: "You are a baking troubleshooting expert." },
      { role: "user", content: `Help troubleshoot this baking issue: ${issue}` }
    ]
  });
}