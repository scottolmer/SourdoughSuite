import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE_PATH = path.join(__dirname, '../../data/ai-settings.json');

// Default AI settings
const defaultSettings = {
  models: [
    {
      id: "chatgpt-4o-latest",
      name: "ChatGPT-4o",
      endpoint: "https://nano-gpt.com/api/v1/chat/completions",
      isDefault: true
    },
    {
      id: "claude-3-7-sonnet-20250219",
      name: "Claude 3.7 Sonnet",
      endpoint: "https://nano-gpt.com/api/v1/chat/completions",
      isDefault: false
    }
  ],
  defaultModel: "chatgpt-4o-latest",
  temperature: 0.7,
  maxTokens: 4000,
  useCache: true,
  autoSaveGeneratedRecipes: true, // Auto-save AI-generated recipes to database
  seoOptions: {
    makePublic: true, // Make auto-saved recipes public for SEO
    addSeoTags: true, // Add SEO-friendly tags to recipes
    addDefaultImage: true, // Add default image to recipes for better display
  },
  prompts: [
    {
      id: "recipe-analysis",
      name: "Recipe Analysis",
      description: "Prompt template used for analyzing sourdough bread recipes",
      usage: "recipe-analysis",
      template: "Analyze this sourdough bread recipe in detail. Provide insights on:\n\n1. Hydration level assessment\n2. Fermentation approach\n3. Unique techniques\n4. Flavor profile prediction\n5. Difficulty level\n6. Suggestions for improvement\n\nRecipe details:\n{{recipe}}"
    },
    {
      id: "recipe-generator",
      name: "Recipe Generator",
      description: "Prompt template used for generating recipes based on user preferences",
      usage: "recipe-generator",
      template: "Create a detailed sourdough bread recipe with the following characteristics:\n\n{{preferences}}\n\nInclude sections for ingredients (with exact measurements in grams), step-by-step instructions, and baker's notes with professional tips."
    },
    {
      id: "content-generator",
      name: "Blog Content Generator",
      description: "Prompt template used for generating blog posts",
      usage: "content-generator",
      template: "Create an engaging blog post about the topic of {{topic}} for an audience of home bakers interested in sourdough bread. The post should be informative, include a brief introduction, several main sections with valuable information, and a conclusion. Add some technical baking knowledge that would be useful for readers."
    },
    {
      id: "starter-quiz",
      name: "Starter Quiz Recommendation",
      description: "Prompt template used for recommending sourdough starters based on quiz answers",
      usage: "starter-quiz",
      template: "You are a sourdough starter expert helping customers find their perfect starter culture match.\n\nBased on these user preferences and available starter options, recommend the best matching sourdough starter:\n\n{{quizData}}\n\nAnalyze their preferences for flavor, baking frequency, experience level, and environment to find the best match.\n\nReturn your recommendation in this JSON format:\n{\n  \"primaryMatch\": \"starter-id-from-availableStarters\",\n  \"matchScore\": number from 85-98 representing confidence in the match,\n  \"secondaryMatches\": [\"array-of-2-other-starter-ids-that-are-good-matches\"],\n  \"rationale\": {\n    \"flavor\": number from 70-95 representing flavor match score,\n    \"maintenance\": number from 70-95 representing maintenance match score,\n    \"style\": number from 70-95 representing bread style match score,\n    \"experience\": number from 70-95 representing experience level match score\n  }\n}"
    }
  ]
};

// Ensure the data directory exists
function ensureDirectoryExists() {
  const dataDir = path.dirname(SETTINGS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Get the AI settings
export async function getAISettings() {
  ensureDirectoryExists();
  
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } else {
      // If the file doesn't exist, return default settings
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error reading AI settings:', error);
    return defaultSettings;
  }
}

// Save the AI settings
export async function saveAISettings(settings: any) {
  ensureDirectoryExists();
  
  try {
    // Validate settings (basic validation)
    if (!settings || !settings.models || !settings.prompts) {
      throw new Error('Invalid settings format');
    }
    
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving AI settings:', error);
    throw error;
  }
}

// Get a specific prompt template by usage
export async function getPromptTemplate(usage: string) {
  const settings = await getAISettings();
  const prompt = settings.prompts.find((p: any) => p.usage === usage);
  return prompt ? prompt.template : null;
}

// Get current model configuration
export async function getModelConfig() {
  const settings = await getAISettings();
  const defaultModel = settings.models.find((m: any) => m.id === settings.defaultModel) || settings.models[0];
  
  return {
    modelId: defaultModel.id,
    endpoint: defaultModel.endpoint,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    useCache: settings.useCache
  };
}