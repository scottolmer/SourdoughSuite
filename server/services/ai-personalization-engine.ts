import * as aiService from './ai-service-switcher';
import { storage } from '../storage';

interface UserBehaviorData {
  userId?: string;
  sessionId: string;
  recipesViewed: string[];
  toolsUsed: string[];
  searchQueries: string[];
  timeSpent: number;
  successfulBakes: number;
  failedBakes: number;
  preferredDifficulty: string;
  equipmentOwned: string[];
}

interface PersonalizationContext {
  currentPage: string;
  timeOfDay: string;
  seasonality: string;
  userExperienceLevel: string;
  recentActivity: string[];
}

export class AIPersonalizationEngine {
  static async analyzeUserBehavior(behaviorData: UserBehaviorData): Promise<any> {
    const prompt = `
Analyze this sourdough baker's behavior data and create a comprehensive user profile:

Behavior Data:
- Recipes Viewed: ${behaviorData.recipesViewed.join(', ')}
- Tools Used: ${behaviorData.toolsUsed.join(', ')}
- Search Queries: ${behaviorData.searchQueries.join(', ')}
- Time Spent: ${behaviorData.timeSpent} minutes
- Successful Bakes: ${behaviorData.successfulBakes}
- Failed Bakes: ${behaviorData.failedBakes}
- Preferred Difficulty: ${behaviorData.preferredDifficulty}
- Equipment: ${behaviorData.equipmentOwned.join(', ')}

Generate insights about:
1. Skill level progression
2. Interest areas and preferences
3. Learning patterns
4. Pain points and challenges
5. Recommended next steps

Format as JSON:
{
  "skillLevel": "beginner|intermediate|advanced",
  "primaryInterests": ["interest1", "interest2"],
  "learningStyle": "visual|hands-on|theoretical",
  "challengeAreas": ["area1", "area2"],
  "recommendedContent": ["content1", "content2"],
  "nextSkillToLearn": "specific skill",
  "confidenceScore": 0-100
}
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      throw new Error('Failed to analyze user behavior');
    }
  }

  static async generateContextualRecommendations(context: PersonalizationContext, userProfile: any): Promise<any> {
    const prompt = `
Based on the user's context and profile, generate intelligent recommendations:

Context:
- Current Page: ${context.currentPage}
- Time of Day: ${context.timeOfDay}
- Season: ${context.seasonality}
- User Level: ${context.userExperienceLevel}
- Recent Activity: ${context.recentActivity.join(', ')}

User Profile:
- Skill Level: ${userProfile.skillLevel}
- Interests: ${userProfile.primaryInterests?.join(', ')}
- Challenge Areas: ${userProfile.challengeAreas?.join(', ')}

Generate contextually relevant recommendations:
1. Immediate action suggestions
2. Content to explore next
3. Tools that would help
4. Learning opportunities
5. Community features to engage with

Format as JSON:
{
  "immediateActions": [
    {
      "action": "action description",
      "reason": "why it's relevant now",
      "link": "/path/to/action"
    }
  ],
  "suggestedContent": [
    {
      "title": "content title",
      "type": "recipe|article|tool",
      "relevanceScore": 0-100,
      "reason": "why it's suggested"
    }
  ],
  "smartNotifications": [
    {
      "message": "helpful tip or reminder",
      "timing": "when to show",
      "priority": "high|medium|low"
    }
  ]
}
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating contextual recommendations:', error);
      throw new Error('Failed to generate contextual recommendations');
    }
  }

  static async predictOptimalBakingSchedule(userProfile: any, preferences: any): Promise<any> {
    const prompt = `
Create an AI-optimized baking schedule for this user:

User Profile:
- Experience Level: ${userProfile.skillLevel}
- Available Time: ${preferences.availableTime}
- Work Schedule: ${preferences.workSchedule}
- Family Size: ${preferences.familySize}
- Preferred Bread Types: ${preferences.preferredBreadTypes?.join(', ')}
- Equipment: ${preferences.equipment?.join(', ')}

Generate a personalized baking schedule that includes:
1. Optimal starter feeding times
2. Recipe timing recommendations
3. Batch baking suggestions
4. Seasonal adjustments
5. Skill-building progression

Format as JSON:
{
  "weeklySchedule": {
    "starterMaintenance": {
      "feedingTimes": ["time1", "time2"],
      "frequency": "daily|every-other-day",
      "reminders": ["reminder1", "reminder2"]
    },
    "bakingDays": [
      {
        "day": "day of week",
        "recipes": ["recipe1", "recipe2"],
        "startTime": "suggested start time",
        "reasoning": "why this timing works"
      }
    ]
  },
  "monthlyProgression": [
    {
      "week": 1,
      "focus": "skill or technique",
      "recipes": ["recipe1", "recipe2"],
      "goals": ["goal1", "goal2"]
    }
  ],
  "adaptiveAdjustments": {
    "busyWeeks": "alternative schedule",
    "seasonalChanges": "how to adjust for temperature",
    "skillProgression": "when to increase difficulty"
  }
}
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error predicting baking schedule:', error);
      throw new Error('Failed to predict optimal baking schedule');
    }
  }

  static async generateSmartSearchSuggestions(query: string, userContext: any): Promise<string[]> {
    const prompt = `
User searched for: "${query}"

User Context:
- Skill Level: ${userContext.skillLevel}
- Recent Activity: ${userContext.recentActivity?.join(', ')}
- Current Challenges: ${userContext.challengeAreas?.join(', ')}

Generate 5 intelligent search suggestions that:
1. Refine the original query
2. Suggest related topics they might find helpful
3. Include skill-appropriate alternatives
4. Address potential underlying questions

Return as JSON array of strings:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return []; // Return empty array on error
    }
  }

  static async analyzeRecipeSuccess(recipeData: any, userFeedback: any): Promise<any> {
    const prompt = `
Analyze this baking attempt and provide intelligent feedback:

Recipe Details:
- Name: ${recipeData.name}
- Hydration: ${recipeData.hydration}%
- Difficulty: ${recipeData.difficulty}
- Techniques Used: ${recipeData.techniques?.join(', ')}

User Feedback:
- Success Rating: ${userFeedback.rating}/10
- Issues Encountered: ${userFeedback.issues?.join(', ')}
- Photos: ${userFeedback.hasPhotos ? 'Yes' : 'No'}
- Notes: ${userFeedback.notes}

Provide:
1. Diagnosis of what went well/wrong
2. Specific improvement suggestions
3. Technique refinements
4. Next recipe recommendations
5. Skill progression insights

Format as JSON:
{
  "diagnosis": {
    "successes": ["what worked well"],
    "challenges": ["what needs improvement"],
    "rootCauses": ["underlying issues"]
  },
  "improvements": [
    {
      "area": "specific area",
      "suggestion": "concrete action",
      "difficulty": "easy|medium|hard"
    }
  ],
  "nextSteps": {
    "immediateActions": ["action1", "action2"],
    "skillFocus": "specific skill to work on",
    "recommendedRecipes": ["recipe1", "recipe2"]
  },
  "learningPath": {
    "currentLevel": "assessment of current skill",
    "nextMilestone": "what to achieve next",
    "timeframe": "estimated time to improve"
  }
}
`;

    try {
      const response = await aiService.generateText(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing recipe success:', error);
      throw new Error('Failed to analyze recipe success');
    }
  }
}

export default AIPersonalizationEngine;