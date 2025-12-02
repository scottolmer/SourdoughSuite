import * as aiService from './ai-service-switcher';

interface ContentGenerationRequest {
  type: 'blog_article' | 'product_description' | 'faq' | 'recipe_variation';
  topic: string;
  context?: string;
  targetAudience?: 'beginner' | 'intermediate' | 'advanced';
  length?: 'short' | 'medium' | 'long';
}

interface GeneratedContent {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  seoKeywords?: string[];
  category?: string;
}

export class AIContentGenerator {
  static async generateBlogArticle(topic: string, targetAudience: string = 'intermediate'): Promise<GeneratedContent> {
    const prompt = `
You are an expert sourdough bread writer for Bakehouse Breads. Write a comprehensive blog article about "${topic}" for ${targetAudience} bakers.

Requirements:
- Professional, engaging tone
- Include practical tips and specific techniques
- Add troubleshooting advice
- Include baker's percentages where relevant
- Make it actionable and informative
- Length: 1200-1500 words

Format your response as JSON:
{
  "title": "Compelling article title",
  "content": "Full article content in HTML format with proper headings and paragraphs",
  "excerpt": "Brief 2-sentence summary",
  "tags": ["relevant", "tags"],
  "seoKeywords": ["seo", "keywords"],
  "category": "technique" or "troubleshooting" or "ingredients" or "equipment"
}
`;

    try {
      const response = await aiService.makeAIRequest({ 
        prompt,
        context: `Generate blog content for ${targetAudience} sourdough bakers`
      });
      const parsedContent = JSON.parse(response.response);
      return parsedContent;
    } catch (error) {
      console.error('Error generating blog article:', error);
      throw new Error('Failed to generate blog article');
    }
  }

  static async generateProductDescription(productName: string, productType: string, features: string[]): Promise<string> {
    const prompt = `
Write a compelling product description for "${productName}", a ${productType} for sourdough baking.

Features: ${features.join(', ')}

Requirements:
- Highlight unique benefits for sourdough bakers
- Include technical specifications relevant to bread making
- Mention compatibility with different skill levels
- Use persuasive but informative language
- 150-200 words
- Include a clear call-to-action

Return only the product description text.
`;

    try {
      return await aiService.makeAIRequest(prompt);
    } catch (error) {
      console.error('Error generating product description:', error);
      throw new Error('Failed to generate product description');
    }
  }

  static async generateRecipeVariation(baseRecipe: any, variation: string): Promise<any> {
    const prompt = `
Create a recipe variation based on this base sourdough recipe:

Base Recipe:
- Name: ${baseRecipe.name}
- Ingredients: ${JSON.stringify(baseRecipe.ingredients)}
- Instructions: ${baseRecipe.instructions?.join('\n')}
- Hydration: ${baseRecipe.hydration}%

Variation Request: ${variation}

Generate a new recipe with:
- Adjusted ingredients and proportions
- Modified instructions
- Updated timing if needed
- Notes about the changes made

Format as JSON:
{
  "name": "New recipe name",
  "ingredients": [{"name": "ingredient", "amount": "amount", "unit": "unit"}],
  "instructions": ["step 1", "step 2", ...],
  "hydration": number,
  "notes": "Explanation of changes and tips",
  "difficulty": "beginner|intermediate|advanced"
}
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating recipe variation:', error);
      throw new Error('Failed to generate recipe variation');
    }
  }

  static async generateSmartFAQ(userQuestions: string[]): Promise<Array<{question: string, answer: string}>> {
    const prompt = `
Based on these common user questions about sourdough baking, generate comprehensive FAQ entries:

Questions:
${userQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, provide:
- A clear, concise question (refined if needed)
- A detailed, helpful answer with specific guidance
- Include measurements and timing when relevant

Format as JSON array:
[
  {
    "question": "Clear question",
    "answer": "Detailed answer with specific guidance"
  }
]
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating FAQ:', error);
      throw new Error('Failed to generate FAQ');
    }
  }

  static async generatePersonalizedRecommendations(userProfile: any): Promise<any> {
    const prompt = `
Based on this user's baking profile, generate personalized recommendations:

User Profile:
- Experience Level: ${userProfile.experienceLevel}
- Preferred Bread Types: ${userProfile.preferredBreadTypes?.join(', ')}
- Available Time: ${userProfile.availableTime}
- Equipment: ${userProfile.equipment?.join(', ')}
- Previous Recipes: ${userProfile.previousRecipes?.length || 0}
- Success Rate: ${userProfile.successRate || 'Unknown'}

Generate:
1. 3 recommended recipes with difficulty progression
2. Suggested equipment upgrades
3. Technique focus areas
4. Timing recommendations

Format as JSON:
{
  "recommendedRecipes": [
    {
      "name": "Recipe name",
      "reason": "Why this recipe fits",
      "difficulty": "level",
      "estimatedTime": "time"
    }
  ],
  "equipmentSuggestions": ["item 1", "item 2"],
  "techniqueFocus": ["technique 1", "technique 2"],
  "timingTips": "Personalized timing advice"
}
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }
}

export default AIContentGenerator;