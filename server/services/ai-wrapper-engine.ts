import * as aiService from './ai-service-switcher';

interface UserContext {
  sessionId: string;
  visitCount: number;
  timeOnSite: number;
  pagesVisited: string[];
  toolsUsed: string[];
  searchQueries: string[];
  skillLevel?: string;
  interests?: string[];
  currentPage: string;
  timeOfDay: string;
  dayOfWeek: string;
  deviceType: string;
}

interface AIPersonalizedContent {
  heroMessage: string;
  recommendedTools: Array<{
    id: string;
    name: string;
    description: string;
    relevanceScore: number;
    aiReason: string;
  }>;
  featuredRecipes: Array<{
    id: string;
    name: string;
    difficulty: string;
    relevanceScore: number;
    aiReason: string;
  }>;
  blogArticles: Array<{
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
    aiReason: string;
  }>;
  smartNotifications: Array<{
    message: string;
    type: 'tip' | 'reminder' | 'suggestion';
    priority: number;
  }>;
  nextActions: Array<{
    action: string;
    description: string;
    link: string;
    confidence: number;
  }>;
}

export class AIWrapperEngine {
  static async generatePersonalizedHomepage(userContext: UserContext): Promise<AIPersonalizedContent> {
    const prompt = `
You are the AI brain of Bakehouse Breads, a specialized sourdough platform. Generate a completely personalized homepage experience for this user.

User Context:
- Session: Visit #${userContext.visitCount}, ${userContext.timeOnSite} minutes on site
- Pages Visited: ${userContext.pagesVisited.join(', ')}
- Tools Used: ${userContext.toolsUsed.join(', ')}
- Search History: ${userContext.searchQueries.join(', ')}
- Current Context: ${userContext.currentPage} at ${userContext.timeOfDay} on ${userContext.dayOfWeek}
- Device: ${userContext.deviceType}

Based on this data, create a highly personalized experience:

1. Hero Message: Craft a personalized welcome that acknowledges their journey
2. Tool Recommendations: Select 3-4 tools most relevant to their current needs
3. Recipe Suggestions: Choose 3 recipes that match their progression
4. Blog Content: Pick 2-3 articles that address their likely questions
5. Smart Actions: Suggest 2-3 immediate next steps

Make everything feel like the AI truly understands their sourdough journey and current needs.

Respond in JSON format:
{
  "heroMessage": "Personalized welcome message",
  "recommendedTools": [
    {
      "id": "tool-id",
      "name": "Tool Name",
      "description": "Why this tool helps them now",
      "relevanceScore": 95,
      "aiReason": "Specific reason why this is perfect for them"
    }
  ],
  "featuredRecipes": [
    {
      "id": "recipe-id", 
      "name": "Recipe Name",
      "difficulty": "beginner|intermediate|advanced",
      "relevanceScore": 90,
      "aiReason": "Why this recipe fits their current skill level"
    }
  ],
  "blogArticles": [
    {
      "id": "article-id",
      "title": "Article Title",
      "excerpt": "Brief description",
      "relevanceScore": 85,
      "aiReason": "How this addresses their current challenges"
    }
  ],
  "smartNotifications": [
    {
      "message": "Helpful, timely message",
      "type": "tip",
      "priority": 1
    }
  ],
  "nextActions": [
    {
      "action": "Specific action name",
      "description": "What they'll accomplish",
      "link": "/path/to/action",
      "confidence": 95
    }
  ]
}
`;

    try {
      const response = await aiService.makeAIRequest({
        messages: [
          { role: "system", content: "You are a helpful AI assistant that personalizes homepage content. IMPORTANT: Respond ONLY with valid JSON. Do not use markdown code blocks, backticks, or any formatting. Start directly with { and end with }." },
          { role: "user", content: prompt + "\n\nIMPORTANT: Return only valid JSON without any markdown formatting or code blocks." }
        ],
        model: "gemini-2.0-flash",
        temperature: 0.7
      });
      
      if (!response.success || !response.data) {
        throw new Error('AI request failed');
      }
      
      // Extract the actual text content from the response
      const content = response.data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error(`No content in AI response. Response structure: ${JSON.stringify(response.data)}`);
      }
      
      // Clean and parse the JSON content
      let cleanContent = content.trim();
      
      // More aggressive markdown removal
      if (cleanContent.includes('```')) {
        // Find the first { and last }
        const startIndex = cleanContent.indexOf('{');
        const lastIndex = cleanContent.lastIndexOf('}');
        
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          cleanContent = cleanContent.substring(startIndex, lastIndex + 1);
        }
      }
      
      try {
        return JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed content:', cleanContent.substring(0, 500));
        
        // Return a well-structured fallback response
        return {
          heroMessage: "Welcome to Bakehouse Breads! Discover the art of sourdough baking with our expert guidance and tools.",
          recommendedTools: [
            {
              id: "sourdough-starter-guide",
              name: "Sourdough Starter Guide", 
              description: "Learn how to create and maintain a thriving sourdough starter.",
              relevanceScore: 95,
              aiReason: "Essential starting point for sourdough baking"
            },
            {
              id: "hydration-calculator",
              name: "Hydration Calculator",
              description: "Calculate the perfect water-to-flour ratio for consistent results.",
              relevanceScore: 85,
              aiReason: "Understanding hydration is key to sourdough success"
            }
          ],
          featuredRecipes: [
            {
              id: "beginner-sourdough",
              name: "Beginner's Sourdough Loaf",
              difficulty: "beginner",
              relevanceScore: 90,
              aiReason: "Perfect first recipe for new bakers"
            },
            {
              id: "sourdough-pancakes",
              name: "Sourdough Pancakes",
              difficulty: "beginner", 
              relevanceScore: 80,
              aiReason: "Easy way to use discard starter"
            }
          ],
          blogArticles: [
            {
              id: "getting-started",
              title: "Getting Started with Sourdough",
              excerpt: "Everything you need to know to begin your sourdough journey.",
              relevanceScore: 85,
              aiReason: "Foundational knowledge for beginners"
            },
            {
              id: "troubleshooting",
              title: "Troubleshooting Common Sourdough Issues",
              excerpt: "Solutions to common problems beginners face.",
              relevanceScore: 80,
              aiReason: "Helpful for preventing early mistakes"
            }
          ],
          smartNotifications: [
            {
              message: "Welcome to sourdough baking! Start with creating your starter.",
              type: "tip",
              priority: 1
            }
          ],
          nextActions: [
            {
              action: "Create Your Starter",
              description: "Begin your sourdough journey by creating a healthy starter.",
              link: "/starter-guide",
              confidence: 95
            },
            {
              action: "Browse Beginner Recipes",
              description: "Explore recipes designed for new bakers.",
              link: "/recipes?difficulty=beginner",
              confidence: 85
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error generating personalized homepage:', error);
      throw new Error('Failed to generate personalized content');
    }
  }

  static async analyzeUserIntent(searchQuery: string, userContext: UserContext): Promise<any> {
    const prompt = `
Analyze this search query from a sourdough baker and understand their true intent:

Search Query: "${searchQuery}"

User Context:
- Skill Level: ${userContext.skillLevel || 'unknown'}
- Recent Pages: ${userContext.pagesVisited.slice(-3).join(', ')}
- Tools Used: ${userContext.toolsUsed.join(', ')}
- Previous Searches: ${userContext.searchQueries.slice(-3).join(', ')}

Determine:
1. What they're really trying to accomplish
2. Their current knowledge gap
3. The best content type to help them
4. Suggested search refinements
5. Alternative approaches they might not have considered

Respond in JSON:
{
  "intent": "What they're really trying to do",
  "knowledgeGap": "What they need to learn",
  "bestContentType": "recipe|article|tool|video",
  "searchSuggestions": ["refined query 1", "refined query 2"],
  "alternativeApproaches": ["approach 1", "approach 2"],
  "confidenceScore": 85
}
`;

    try {
      const response = await aiService.makeAIRequest({ 
        prompt,
        context: "Analyze user search intent"
      });
      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error analyzing user intent:', error);
      throw new Error('Failed to analyze user intent');
    }
  }

  static async generateDynamicContent(contentType: string, userProfile: any, context: any): Promise<any> {
    const prompt = `
Generate dynamic ${contentType} content tailored to this specific user:

User Profile:
- Experience: ${userProfile.skillLevel}
- Interests: ${userProfile.interests?.join(', ')}
- Recent Activity: ${userProfile.recentActivity?.join(', ')}
- Success Rate: ${userProfile.successRate}%

Context:
- Time: ${context.timeOfDay}
- Season: ${context.season}
- Current Focus: ${context.currentFocus}

Create ${contentType} that is:
1. Perfectly matched to their current skill level
2. Addresses their recent interests
3. Considers the current time/season
4. Provides actionable next steps

For recipe content: Include baker's percentages, timing, and difficulty progression
For article content: Focus on their current challenges with practical solutions
For tool recommendations: Match their workflow and available time

Respond in JSON format appropriate for ${contentType}.
`;

    try {
      const response = await aiService.makeAIRequest({ 
        prompt,
        context: `Generate dynamic ${contentType} content`
      });
      return JSON.parse(response.response);
    } catch (error) {
      console.error(`Error generating dynamic ${contentType}:`, error);
      throw new Error(`Failed to generate dynamic ${contentType}`);
    }
  }

  static async predictUserNeeds(behaviorPattern: any): Promise<any> {
    const prompt = `
Based on this user's behavior pattern, predict what they'll need next in their sourdough journey:

Behavior Pattern:
- Recent Actions: ${behaviorPattern.recentActions?.join(', ')}
- Time Patterns: ${behaviorPattern.timePatterns}
- Success/Failure Rate: ${behaviorPattern.successRate}%
- Learning Velocity: ${behaviorPattern.learningVelocity}
- Challenge Areas: ${behaviorPattern.challengeAreas?.join(', ')}

Predict:
1. What skill they'll want to learn next
2. When they're most likely to bake
3. What tools they'll need soon
4. Potential roadblocks they'll encounter
5. Optimal learning sequence

Use this to proactively suggest content and tools.

Respond in JSON:
{
  "nextSkill": "Predicted next skill to learn",
  "optimalBakeTime": "Best time for them to bake",
  "upcomingNeeds": ["tool1", "ingredient2", "technique3"],
  "potentialChallenges": ["challenge1", "challenge2"],
  "learningPath": [
    {
      "week": 1,
      "focus": "skill focus",
      "content": ["content1", "content2"]
    }
  ],
  "confidence": 85
}
`;

    try {
      const response = await aiService.makeAIRequest({ 
        prompt,
        context: "Predict user needs"
      });
      return JSON.parse(response.response);
    } catch (error) {
      console.error('Error predicting user needs:', error);
      throw new Error('Failed to predict user needs');
    }
  }
}

export default AIWrapperEngine;