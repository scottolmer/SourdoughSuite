import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// MoE Coordinator system with 4 specialized bread science experts
const MOE_SYSTEM_PROMPT = `You are the coordinator of a Mixture of Experts (MoE) system specializing in bread science research. You have access to 4 expert specialists:

1. **Fermentation Science Expert**: Specializes in yeast biology, fermentation chemistry, sourdough cultures, timing, temperature effects, and microbial interactions.

2. **Ingredients & Chemistry Expert**: Focuses on flour proteins, gluten development, enzyme activity, salt effects, hydration chemistry, and ingredient interactions.

3. **Process & Technique Expert**: Covers mixing methods, kneading, shaping, proofing techniques, baking temperatures, steam effects, and equipment considerations.

4. **Troubleshooting & Problem-Solving Expert**: Handles bread defects, texture issues, flavor problems, structural failures, and diagnostic approaches.

For each task, you will:
1. Analyze which expert(s) are most relevant
2. Coordinate their responses
3. Synthesize their knowledge into comprehensive, accurate answers
4. Ensure responses are practical for professional bakers

Always maintain scientific accuracy while providing actionable guidance. When multiple experts contribute, integrate their perspectives cohesively.`;

interface MoEResponse {
  coordinatorAnalysis: string;
  expertContributions: {
    fermentation?: string;
    chemistry?: string;
    process?: string;
    troubleshooting?: string;
  };
  synthesizedResponse: string;
}

// Helper function to extract citation from text
function extractCitationFromText(text: string): string | undefined {
  const patterns = [
    /([A-Z][^.]*)\s*[-–—]\s*([A-Z][^,]*),?\s*(\d{4})/,
    /Journal of ([^,]+),?\s*Vol[^,]*,?\s*(\d{4})/i,
    /([^.]+)\.\s*([A-Z][^,]+),?\s*(\d{4})/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return undefined;
}

export async function analyzePdfWithMoE(extractedText: string, filename: string): Promise<{
  summary: string;
  suggestedTopics: string[];
  keyFindings: string[];
  practicalApplications: string[];
  seoOptimizedSummary: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const analysisPrompt = `${MOE_SYSTEM_PROMPT}

TASK: Analyze this research article and provide comprehensive analysis for a bread science research platform.

ARTICLE CONTENT:
${extractedText}

FILENAME: ${filename}

Please provide:

1. COORDINATOR ANALYSIS: Brief assessment of which experts are most relevant and why

2. EXPERT CONTRIBUTIONS:
   - Fermentation Expert: Key fermentation-related findings and insights
   - Chemistry Expert: Important chemical/ingredient interactions and effects  
   - Process Expert: Relevant techniques, methods, and procedural insights
   - Troubleshooting Expert: Common issues addressed and solutions provided

3. SYNTHESIZED OUTPUTS:
   - Executive Summary (3-4 sentences for display)
   - Key Findings (3-5 bullet points of main research conclusions)
   - Practical Applications (3-5 actionable insights for professional bakers)
   - Suggested Topics (5-7 relevant flat category topics like "fermentation", "gluten-development", "sourdough-cultures")
   - SEO Summary (150-160 characters optimized for search engines with key terms)

Format as JSON with this structure:
{
  "coordinatorAnalysis": "string",
  "expertContributions": {
    "fermentation": "string or null",
    "chemistry": "string or null", 
    "process": "string or null",
    "troubleshooting": "string or null"
  },
  "executiveSummary": "string",
  "keyFindings": ["string"],
  "practicalApplications": ["string"],
  "suggestedTopics": ["string"],
  "seoSummary": "string"
}`;

  try {
    const result = await model.generateContent(analysisPrompt);
    const response = result.response.text();
    
    // Parse JSON response
    const parsed = JSON.parse(response);
    
    return {
      summary: parsed.executiveSummary,
      suggestedTopics: parsed.suggestedTopics,
      keyFindings: parsed.keyFindings,
      practicalApplications: parsed.practicalApplications,
      seoOptimizedSummary: parsed.seoSummary
    };
  } catch (error) {
    console.error('Gemini MoE analysis failed:', error);
    throw new Error('Failed to analyze article with AI experts');
  }
}

export async function generateTopicSuggestions(articleContent: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const topicPrompt = `${MOE_SYSTEM_PROMPT}

TASK: Generate flat topic categories for this bread science content.

CONTENT:
${articleContent}

The coordinator should work with relevant experts to suggest 5-7 flat topic categories that best represent this content. Topics should be:
- Single concepts (not hierarchical)
- Professional baker focused
- Consistent with bread science terminology
- Useful for organizing research

Examples: "fermentation", "gluten-development", "sourdough-cultures", "enzyme-activity", "temperature-control", "hydration-effects"

Respond with JSON array of strings:
["topic1", "topic2", "topic3"]`;

  try {
    const result = await model.generateContent(topicPrompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Topic suggestion failed:', error);
    return [];
  }
}

export async function chatWithArticleMoE(
  articleContent: string, 
  userQuestion: string, 
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chatPrompt = `${MOE_SYSTEM_PROMPT}

CONTEXT: You are answering questions about this specific research article. Only use information from the provided article content.

ARTICLE CONTENT:
${articleContent}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
1. Determine which expert(s) should handle this question
2. Provide their analysis/response
3. Synthesize into a comprehensive answer
4. Only reference information from the provided article
5. If the question isn't covered in the article, clearly state this

Respond with a helpful, accurate answer based solely on the article content.`;

  try {
    const result = await model.generateContent(chatPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Article chat failed:', error);
    throw new Error('Failed to process question with AI experts');
  }
}

export async function generateSEOContent(article: {
  title: string;
  content: string;
  keyFindings: string[];
  practicalApplications: string[];
}): Promise<{
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  seoOptimizedExcerpt: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const seoPrompt = `Generate SEO-optimized content for this bread science research article:

TITLE: ${article.title}
CONTENT: ${article.content}
KEY FINDINGS: ${JSON.stringify(article.keyFindings)}
PRACTICAL APPLICATIONS: ${JSON.stringify(article.practicalApplications)}

Generate:
1. Meta Title (50-60 characters, includes "bread science" or "sourdough research")
2. Meta Description (150-160 characters, compelling and informative)
3. Keywords (8-12 relevant SEO terms for bread science/baking)
4. SEO Excerpt (2-3 sentences summarizing value for bakers)

Format as JSON:
{
  "metaTitle": "string",
  "metaDescription": "string", 
  "keywords": ["string"],
  "seoOptimizedExcerpt": "string"
}`;

  try {
    const result = await model.generateContent(seoPrompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('SEO content generation failed:', error);
    return {
      metaTitle: article.title.substring(0, 60),
      metaDescription: article.content.substring(0, 160),
      keywords: ["bread science", "sourdough", "fermentation"],
      seoOptimizedExcerpt: article.content.substring(0, 200)
    };
  }
}