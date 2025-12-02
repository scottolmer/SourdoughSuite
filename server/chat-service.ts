import { chatWithArticleMoE } from './gemini-moe-service';

// Custom system prompt for article chat
const ARTICLE_CHAT_SYSTEM_PROMPT = `You are an expert bread science researcher and professional baking consultant. You have been provided with a complete research article about bread science. Your role is to:

1. Answer questions ONLY based on the article content provided
2. Provide accurate, detailed responses with specific references to the article
3. Use professional but accessible language suitable for bakers and food scientists
4. When asked about summaries, provide structured, well-organized content
5. For practical questions, focus on actionable insights for professional bakers
6. If asked about something not in the article, clearly state "This topic is not covered in the provided article"

RESPONSE FORMATTING RULES:
- Keep responses concise but comprehensive
- Use bullet points for lists
- Include specific data, percentages, or measurements when mentioned in the article
- Reference study methodology when relevant
- Highlight practical applications for bakers

Remember: You are discussing THIS SPECIFIC ARTICLE only. Do not add external knowledge beyond what's provided in the article content.`;

export async function generateArticleSummary(fullContent: string): Promise<{
  executiveSummary: string;
  keyFindings: string[];
  practicalApplications: string[];
}> {
  try {
    const { analyzePdfWithMoE } = await import('./gemini-moe-service');
    const analysis = await analyzePdfWithMoE(fullContent, 'Manual Article');
    
    return {
      executiveSummary: analysis.summary,
      keyFindings: analysis.keyFindings,
      practicalApplications: analysis.practicalApplications
    };
  } catch (error) {
    console.error("Error generating article summary:", error);
    return {
      executiveSummary: "Summary generation failed",
      keyFindings: [],
      practicalApplications: []
    };
  }
}

export async function chatWithArticle(
  articleContent: string,
  userQuestion: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  try {
    return await chatWithArticleMoE(articleContent, userQuestion, conversationHistory);
  } catch (error) {
    console.error("Error in article chat:", error);
    throw new Error("Failed to process chat message");
  }
}

export async function generateDisplayContent(fullContent: string): Promise<string> {
  try {
    const { analyzePdfWithMoE } = await import('./gemini-moe-service');
    const analysis = await analyzePdfWithMoE(fullContent, 'Display Content');
    
    return analysis.summary;
  } catch (error) {
    console.error("Error generating display content:", error);
    return fullContent; // Fallback to original content
  }
}