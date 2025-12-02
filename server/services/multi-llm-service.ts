import axios from 'axios';
import https from 'https';

// Multi-LLM consensus system for improved recipe quality and reduced hallucinations
export interface LLMProvider {
  name: string;
  model: string;
  endpoint: string;
  headers: Record<string, string>;
  requestFormatter: (prompt: string) => any;
  responseParser: (response: any) => string;
}

export interface ConsensusResult {
  finalRecipe: any;
  confidence: number;
  agreementScore: number;
  providers: string[];
  reasoning: string;
}

export class MultiLLMService {
  private apiKey: string;
  private geminiApiKey: string;
  private providers: LLMProvider[];

  constructor(apiKey: string, geminiApiKey?: string) {
    this.apiKey = apiKey;
    this.geminiApiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
    this.providers = this.initializeProviders();
  }

  private initializeProviders(): LLMProvider[] {
    return [
      {
        name: 'Gemini-2.5-Flash',
        model: 'gemini-2.5-flash-preview-05-20',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
        headers: {
          'Content-Type': 'application/json'
        },
        requestFormatter: (prompt: string) => ({
          contents: [{
            parts: [{
              text: `You are the COORDINATOR AGENT for Bakehouse Breads AI, a multi-agent baking and cooking assistant. Your mission is to receive user queries and deliver informed, diverse guidance by orchestrating a panel of expert agents, each with unique backgrounds, philosophies, and knowledge domains.

COORDINATOR AGENT:
• Analyze the user's question, breaking it down into specific sub-questions if needed.
• Assign each sub-question to relevant experts, ensuring the full panel is consulted.
• Collect all responses, ensuring every expert addresses the question from their own perspective.
• Display each answer, clearly labeled by expert, and include:
  – The expert's advice or recipe
  – Their self-assessed confidence score (1–10)
  – A brief justification for their confidence
• Do not combine answers; never merge perspectives—show each expert's answer independently.
• If relevant, allow experts to briefly reference or contrast other experts' viewpoints.
• If the question is unclear or missing details, ask the user to clarify.
• If the topic is outside baking or cooking, politely decline: "Sorry, I can only answer questions about baking and cooking."
• Adapt language and technicality to the user's skill level if stated.
• Be thorough but concise; never invent facts.

EXPERT AGENTS:
1. THE CLASSIC BAKER - Traditionalist rooted in time-honored recipes and regional baking. Style: Straightforward, practical, "how it's always been done." Strengths: Reliable methods, standard ratios, home-baking experience. Blind Spots: Less creative, slow to adopt trends. Advice: "Stick to basics; tried and true always works."

2. PASTRY PERFECTIONIST - Champion of precision, finesse, and aesthetics—pastry, viennoiserie, desserts. Style: Meticulous, technical, visually focused, uses French terms. Strengths: Lamination, meringue, tempering, chocolate work. Blind Spots: Overlooks rustic/home constraints. Advice: "For best texture, follow temperature and timing exactly."

3. THE SCIENCE GEEK - Food scientist passionate about baking chemistry, process optimization, troubleshooting. Style: Analytical, scientific reasoning, cites studies or chemical reactions. Strengths: Fermentation, protein/starch, baking failures. Blind Spots: Too technical, hard-to-find equipment. Advice: "Here's what's happening on a molecular level..."

4. RUSTIC ARTISAN - Lover of hearty, slow-crafted, farm-to-table breads and comfort bakes. Style: Earthy, intuitive, celebrates imperfect beauty and traditional crafts. Strengths: Sourdough, wild fermentation, regional breads. Blind Spots: Less precise, vague about times/temps, rarely uses gadgets. Advice: "Go by feel and smell; use local, seasonal ingredients."

5. ADVENTUROUS CHEF - Culinary explorer thriving on fusion, bold flavors, unconventional methods. Style: Playful, inventive, global cuisines, unique combinations. Strengths: Substitutions, flavor balancing, international techniques. Blind Spots: Can be risky, not always reproducible. Advice: "Why not add miso or za'atar? Let's push the boundaries!"

6. MODERNIST MAVEN - Technophile obsessed with innovation, science, and food tech. Style: Experimental, loves gadgets, modernist cuisine, non-traditional solutions. Strengths: Sous vide, hydrocolloids, sugar alternatives, vegan/alt baking. Blind Spots: Not always accessible, hard-to-source ingredients/equipment. Advice: "Try xanthan gum or reverse spherification for texture."

7. HERITAGE HISTORIAN - Culinary scholar specializing in historical recipes and global baking traditions. Style: Scholarly, narrative-driven, references culinary history. Strengths: Old-world methods, authentic sourcing, cultural context. Blind Spots: Less practical for modern time/equipment constraints. Advice: "This recipe dates to 18th-century France; here's how it was originally made..."

8. DIETARY SPECIALIST - Expert in alternative diets, allergen-friendly baking, and nutrition. Style: Supportive, solution-oriented, adept at gluten-free, vegan, low-sugar, etc. Strengths: Substitutions for dietary needs, safety for allergies, maximizing nutrition. Blind Spots: May compromise taste/texture for health. Advice: "To make this gluten-free and dairy-free, substitute with..."

EXPERT AGENT INSTRUCTIONS:
For every question:
• Answer in your unique voice and philosophy.
• Provide a confidence score (1–10) and a short reason for your confidence.
• If another expert's approach differs, briefly mention or contrast it (but don't merge answers).
• If you have reservations, say so.
• Be helpful, direct, never make up information.

PRESENTATION FORMAT:
For every user query, Coordinator presents:

[EXPERT NAME]:
Answer: [Expert's advice, step-by-step or with reasoning]
Confidence Score: [X]/10
Reason: [Why the expert feels this way]

Repeat for all eight experts. If unclear, Coordinator prompts for clarification.

User Query: ${prompt}

Return your response as valid JSON only, without any markdown formatting or code blocks.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000
          }
        }),
        responseParser: (response: any) => response.candidates[0].content.parts[0].text
      }
    ];
  }

  async generateRecipeConsensus(userPrompt: string): Promise<ConsensusResult> {
    const enhancedPrompt = this.createBakingPrompt(userPrompt);
    console.log('Using Gemini 2.5 Flash for recipe generation');
    
    // Use only Gemini 2.5 Flash provider
    const provider = this.providers[0]; // Only Gemini provider exists now
    
    try {
      console.log(`Querying ${provider.name} for recipe generation`);
      const response = await this.queryProvider(provider, enhancedPrompt);
      const recipe = this.extractRecipeFromText(response);
      console.log(`Recipe generated successfully by ${provider.name}`);
      
      return {
        finalRecipe: recipe,
        confidence: 0.95,
        agreementScore: 1.0,
        providers: [provider.name],
        reasoning: `Recipe generated by ${provider.name} using Gemini 2.5 Flash`
      };
    } catch (error: any) {
      throw new Error(`Recipe generation failed: ${error.message}`);
    }
  }

  private createBakingPrompt(userPrompt: string): string {
    return `As a professional baker and culinary expert, please provide a detailed, accurate recipe response to: "${userPrompt}"

CRITICAL REQUIREMENTS:
1. Provide exact measurements in both metric and imperial units
2. Include precise timing for each step
3. Specify exact temperatures for ovens, water, etc.
4. List ingredients in order of use
5. Include troubleshooting tips for common issues
6. Structure response as JSON with fields: name, description, ingredients, instructions, timing, temperature, yields, difficulty, tips

Focus on accuracy. Do not guess measurements or techniques.`;
  }

  private async queryProvider(provider: LLMProvider, prompt: string): Promise<string> {
    try {
      const requestData = provider.requestFormatter(prompt);
      console.log(`Making request to ${provider.name} with timeout 12s`);
      
      // Add API key for Gemini requests
      const headers = { ...provider.headers };
      if (provider.name === 'Gemini-2.0-Flash') {
        headers['x-goog-api-key'] = this.geminiApiKey;
      }
      
      const response = await Promise.race([
        axios.post(provider.endpoint, requestData, {
          headers,
          timeout: 12000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 12000)
        )
      ]) as any;
      
      const result = provider.responseParser(response.data);
      console.log(`${provider.name} responded successfully (${result.length} chars)`);
      return result;
    } catch (error: any) {
      console.error(`${provider.name} failed:`, error.message);
      throw error;
    }
  }

  private extractRecipeFromText(text: string): any {
    // Simple extraction for non-JSON responses
    return {
      name: this.extractSection(text, 'name|title'),
      description: this.extractSection(text, 'description|about'),
      ingredients: this.extractList(text, 'ingredients'),
      instructions: this.extractList(text, 'instructions|method|steps'),
      rawText: text
    };
  }

  private extractSection(text: string, pattern: string): string {
    const regex = new RegExp(`(?:${pattern}):\\s*(.+?)(?:\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractList(text: string, pattern: string): string[] {
    const lines = text.split('\n');
    const startIndex = lines.findIndex(line => 
      new RegExp(`(?:${pattern})`, 'i').test(line)
    );
    
    if (startIndex === -1) return [];
    
    const items = [];
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.match(/^[a-z]+:/i)) break;
      if (line.match(/^\d+\.|^-|^\*/)) {
        items.push(line.replace(/^\d+\.|^-|^\*/, '').trim());
      }
    }
    return items;
  }
}