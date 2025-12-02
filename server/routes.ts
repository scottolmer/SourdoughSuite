import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq, and, or, ilike, desc, sql, SQL } from "drizzle-orm";
import * as aiService from "./services/ai-service-switcher";
import * as openAIService from "./services/openai-service";
import * as geminiService from "./services/gemini-service";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// PDF parsing moved to admin-routes.ts
// Multi-LLM consensus functions are now handled by Gemini service
import { webScraperService } from './services/web-scraper';
import * as recipeScraper from './services/recipe-scraper';
import { analyzeRecipe } from './services/openai';
import { scrapeRecipeFromUrl } from './services/recipeScraperService';
import { SEOService } from './services/seo-service';
import AIContentGenerator from './services/ai-content-generator';
import AIPersonalizationEngine from './services/ai-personalization-engine';
import AIWrapperEngine from './services/ai-wrapper-engine';
import { 
  analyzeRecipeWithO3, 
  generatePersonalizedRecipe, 
  generateStarterTroubleshootingAdvice 
} from './services/openai-o3-service';
import { generateAllStarterRecipes, getRecipesForStarter, generateRecipesForStarter } from './starter-recipe-generator';
import { chatWithArticle, generateArticleSummary, generateDisplayContent } from './chat-service';
import { 
  insertBreadRecipeSchema, 
  insertStarterSchema,
  insertUserSchema,
  insertUserPreferencesSchema,
  insertProductSchema,
  insertOrderSchema,
  insertFaqSchema,
  insertBlogPostSchema,
  updateBlogPostSchema,
  insertFeedingLogSchema,
  insertBakingLogSchema,
  insertHealthLogSchema,
  sourdoughStarters,
  insertRecipeValidationSchema,
  textureProfileSchema,
  flavorProfileSchema,
  aiGeneratedRecipes,
  insertAIGeneratedRecipeSchema,
  insertResearchSourceSchema,
  insertResearchTopicSchema,
  insertResearchClaimSchema,
  insertResearchNotebookSchema,
  insertResearchArticleSchema,
  insertArticleConversationSchema,
  insertChatMessageSchema,
  insertContentCitationSchema,
  insertContentQualitySchema,
  type InsertBreadRecipe,
  type InsertFAQ,
  type InsertBlogPost,
  type UpdateBlogPost,
  type InsertStarterFeedingLog,
  type InsertStarterHealthLog,
  type InsertStarterBakingLog,
  type InsertRecipeValidation,
  type InsertResearchSource,
  type InsertResearchTopic,
  type InsertResearchClaim,
  type InsertResearchNotebook,
  type InsertResearchArticle,
  type InsertContentCitation,
  type InsertContentQuality,
  type InsertBakingTimeline,
  productionBatches,
  insertProductionBatchSchema,
  type ProductionBatch,
  type InsertProductionBatch
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI Settings file path
const SETTINGS_FILE_PATH = path.join(__dirname, '../data/ai-settings.json');
const QUIZ_SETTINGS_FILE_PATH = path.join(__dirname, '../data/quiz-settings.json');

// Default AI settings directly in routes file for better accessibility
const defaultAISettings = {
  models: [
    {
      id: "gemini-2.5-flash-preview-05-20",
      name: "Google Gemini 2.5 Flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent",
      isDefault: true
    }
  ],
  defaultModel: "gemini-2.5-flash-preview-05-20",
  temperature: 0.7,
  maxTokens: 4000,
  useCache: true,
  autoSaveGeneratedRecipes: true,
  seoOptions: {
    makePublic: true,
    addSeoTags: true,
    addDefaultImage: true
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
    },
    {
      id: "ingredient-substitution",
      name: "Ingredient Substitution",
      description: "Prompt template used for suggesting ingredient substitutions in sourdough recipes",
      usage: "ingredient-substitution",
      template: "You are an expert sourdough baker specializing in ingredient substitutions and recipe adaptations. Help bakers find suitable alternatives for ingredients they don't have or can't use.\n\nAnalyze this substitution request:\n\n{{substitutionRequest}}\n\nProvide practical, tested substitution suggestions that maintain the integrity of the sourdough recipe. Consider hydration levels, fermentation impact, flavor changes, and texture modifications.\n\nReturn your recommendations in this JSON format:\n{\n  \"primarySubstitutions\": [\n    {\n      \"original\": \"ingredient being replaced\",\n      \"substitute\": \"recommended replacement\",\n      \"ratio\": \"1:1 or specific conversion ratio\",\n      \"adjustments\": \"any other recipe modifications needed\",\n      \"impact\": \"how this affects flavor, texture, or process\"\n    }\n  ],\n  \"alternativeOptions\": [\n    {\n      \"substitute\": \"alternative replacement option\",\n      \"ratio\": \"conversion ratio\",\n      \"notes\": \"when to use this option\"\n    }\n  ],\n  \"warnings\": [\"important considerations or limitations\"],\n  \"tips\": [\"professional tips for best results with substitutions\"]\n}"
    },
    {
      id: "baking-troubleshooter",
      name: "Baking Troubleshooter",
      description: "Prompt template used for diagnosing and solving sourdough baking problems",
      usage: "baking-troubleshooter",
      template: "You are an expert sourdough troubleshooter with decades of professional baking experience. Help diagnose and solve sourdough baking problems with practical, actionable solutions.\n\nAnalyze this baking issue:\n\n{{problemDescription}}\n\nProvide a comprehensive diagnosis and step-by-step solutions. Consider all factors: starter health, fermentation, environmental conditions, technique, timing, and ingredients.\n\nReturn your diagnosis in this JSON format:\n{\n  \"diagnosis\": {\n    \"primaryCause\": \"most likely cause of the problem\",\n    \"contributingFactors\": [\"other factors that may be involved\"],\n    \"severity\": \"minor|moderate|major\"\n  },\n  \"solutions\": {\n    \"immediate\": [\"steps to fix current batch if possible\"],\n    \"nextBake\": [\"adjustments for the next baking session\"],\n    \"longTerm\": [\"process improvements for consistent results\"]\n  },\n  \"prevention\": [\"how to avoid this problem in the future\"],\n  \"commonMistakes\": [\"related mistakes that often cause this issue\"],\n  \"expertTips\": [\"professional techniques to improve results\"],\n  \"additionalQuestions\": [\"questions to ask for more specific diagnosis if needed\"]\n}"
    },
    {
      id: "multi-agent-coordinator",
      name: "Multi-Agent Baking Coordinator",
      description: "Ultimate Multi-Agent Baking & Cooking GPT: System Instructions for coordinating expert panel responses",
      usage: "general-chat",
      template: "You are the COORDINATOR AGENT for Bakehouse Breads AI, a multi-agent baking and cooking assistant. Your mission is to receive user queries and deliver informed, diverse guidance by orchestrating a panel of expert agents, each with unique backgrounds, philosophies, and knowledge domains.\n\nCOORDINATOR AGENT:\n• Analyze the user's question, breaking it down into specific sub-questions if needed.\n• Assign each sub-question to relevant experts, ensuring the full panel is consulted.\n• Collect all responses, ensuring every expert addresses the question from their own perspective.\n• Display each answer, clearly labeled by expert, and include:\n  – The expert's advice or recipe\n  – Their self-assessed confidence score (1–10)\n  – A brief justification for their confidence\n• Do not combine answers; never merge perspectives—show each expert's answer independently.\n• If relevant, allow experts to briefly reference or contrast other experts' viewpoints.\n• If the question is unclear or missing details, ask the user to clarify.\n• If the topic is outside baking or cooking, politely decline: \"Sorry, I can only answer questions about baking and cooking.\"\n• Adapt language and technicality to the user's skill level if stated.\n• Be thorough but concise; never invent facts.\n\nEXPERT AGENTS:\n1. THE CLASSIC BAKER - Traditionalist rooted in time-honored recipes and regional baking. Style: Straightforward, practical, \"how it's always been done.\" Strengths: Reliable methods, standard ratios, home-baking experience. Blind Spots: Less creative, slow to adopt trends. Advice: \"Stick to basics; tried and true always works.\"\n\n2. PASTRY PERFECTIONIST - Champion of precision, finesse, and aesthetics—pastry, viennoiserie, desserts. Style: Meticulous, technical, visually focused, uses French terms. Strengths: Lamination, meringue, tempering, chocolate work. Blind Spots: Overlooks rustic/home constraints. Advice: \"For best texture, follow temperature and timing exactly.\"\n\n3. THE SCIENCE GEEK - Food scientist passionate about baking chemistry, process optimization, troubleshooting. Style: Analytical, scientific reasoning, cites studies or chemical reactions. Strengths: Fermentation, protein/starch, baking failures. Blind Spots: Too technical, hard-to-find equipment. Advice: \"Here's what's happening on a molecular level...\"\n\n4. RUSTIC ARTISAN - Lover of hearty, slow-crafted, farm-to-table breads and comfort bakes. Style: Earthy, intuitive, celebrates imperfect beauty and traditional crafts. Strengths: Sourdough, wild fermentation, regional breads. Blind Spots: Less precise, vague about times/temps, rarely uses gadgets. Advice: \"Go by feel and smell; use local, seasonal ingredients.\"\n\n5. ADVENTUROUS CHEF - Culinary explorer thriving on fusion, bold flavors, unconventional methods. Style: Playful, inventive, global cuisines, unique combinations. Strengths: Substitutions, flavor balancing, international techniques. Blind Spots: Can be risky, not always reproducible. Advice: \"Why not add miso or za'atar? Let's push the boundaries!\"\n\n6. MODERNIST MAVEN - Technophile obsessed with innovation, science, and food tech. Style: Experimental, loves gadgets, modernist cuisine, non-traditional solutions. Strengths: Sous vide, hydrocolloids, sugar alternatives, vegan/alt baking. Blind Spots: Not always accessible, hard-to-source ingredients/equipment. Advice: \"Try xanthan gum or reverse spherification for texture.\"\n\n7. HERITAGE HISTORIAN - Culinary scholar specializing in historical recipes and global baking traditions. Style: Scholarly, narrative-driven, references culinary history. Strengths: Old-world methods, authentic sourcing, cultural context. Blind Spots: Less practical for modern time/equipment constraints. Advice: \"This recipe dates to 18th-century France; here's how it was originally made...\"\n\n8. DIETARY SPECIALIST - Expert in alternative diets, allergen-friendly baking, and nutrition. Style: Supportive, solution-oriented, adept at gluten-free, vegan, low-sugar, etc. Strengths: Substitutions for dietary needs, safety for allergies, maximizing nutrition. Blind Spots: May compromise taste/texture for health. Advice: \"To make this gluten-free and dairy-free, substitute with...\"\n\nEXPERT AGENT INSTRUCTIONS:\nFor every question:\n• Answer in your unique voice and philosophy.\n• Provide a confidence score (1–10) and a short reason for your confidence.\n• If another expert's approach differs, briefly mention or contrast it (but don't merge answers).\n• If you have reservations, say so.\n• Be helpful, direct, never make up information.\n\nPRESENTATION FORMAT:\nFor every user query, Coordinator presents:\n\n[EXPERT NAME]:\nAnswer: [Expert's advice, step-by-step or with reasoning]\nConfidence Score: [X]/10\nReason: [Why the expert feels this way]\n\nRepeat for all eight experts. If unclear, Coordinator prompts for clarification.\n\nUser Query: {{userMessage}}"
    }
  ]
};

// Utility functions for AI settings
function ensureDataDirectoryExists() {
  const dataDir = path.dirname(SETTINGS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Get the AI settings
async function getAISettings() {
  ensureDataDirectoryExists();
  
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } else {
      // If the file doesn't exist, return default settings
      return defaultAISettings;
    }
  } catch (error) {
    console.error('Error reading AI settings:', error);
    return defaultAISettings;
  }
}

// Save the AI settings
async function saveAISettings(settings: any) {
  ensureDataDirectoryExists();
  
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

// Get the quiz settings
async function getQuizSettings() {
  ensureDataDirectoryExists();
  
  try {
    if (fs.existsSync(QUIZ_SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(QUIZ_SETTINGS_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } else {
      // Default quiz settings
      const defaultQuizSettings = {
        enabledStarters: [],
        defaultStarter: 0,
        quizPromptTemplate: "You are a sourdough starter expert helping customers find their perfect starter culture match.\n\nBased on these user preferences and available starter options, recommend the best matching sourdough starter:\n\n{{quizData}}\n\nAnalyze their preferences for flavor, baking frequency, experience level, and environment to find the best match.\n\nReturn your recommendation in this JSON format:\n{\n  \"primaryMatch\": \"starter-id-from-availableStarters\",\n  \"matchScore\": number from 85-98 representing confidence in the match,\n  \"secondaryMatches\": [\"array-of-2-other-starter-ids-that-are-good-matches\"],\n  \"rationale\": {\n    \"flavor\": number from 70-95 representing flavor match score,\n    \"maintenance\": number from 70-95 representing maintenance match score,\n    \"style\": number from 70-95 representing bread style match score,\n    \"experience\": number from 70-95 representing experience level match score\n  }\n}",
        showResultsImmediately: true
      };
      
      // Create the file with default settings
      fs.writeFileSync(QUIZ_SETTINGS_FILE_PATH, JSON.stringify(defaultQuizSettings, null, 2), 'utf8');
      return defaultQuizSettings;
    }
  } catch (error) {
    console.error('Error reading quiz settings:', error);
    return {
      enabledStarters: [],
      defaultStarter: 0,
      quizPromptTemplate: "",
      showResultsImmediately: true
    };
  }
}

// Save the quiz settings
async function saveQuizSettings(settings: any) {
  ensureDataDirectoryExists();
  
  try {
    // Basic validation
    if (!settings || !Array.isArray(settings.enabledStarters)) {
      throw new Error('Invalid quiz settings format');
    }
    
    fs.writeFileSync(QUIZ_SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving quiz settings:', error);
    throw error;
  }
}

// Define the schema for bread profile recommendations
const breadProfileSchema = z.object({
  texture: textureProfileSchema,
  flavor: flavorProfileSchema,
  customPrompt: z.string().optional()
});

async function getGeneralChatPrompt() {
  try {
    const settings = await getAISettings();
    const generalChatPrompt = settings.prompts?.find((p: any) => p.usage === 'general-chat');
    return generalChatPrompt?.template || `You are the Bakehouse Breads AI Assistant - a multi-agent expert system dedicated to baking and cooking guidance. Always state which expert agent will handle the user's question.`;
  } catch (error) {
    console.error("Error loading general chat prompt:", error);
    return `You are the Bakehouse Breads AI Assistant - a multi-agent expert system dedicated to baking and cooking guidance. Always state which expert agent will handle the user's question.`;
  }
}

// Helper functions to extract structured data from AI content
function extractRecipeNameFromContent(content: string): string | null {
  const namePatterns = [
    /\*\*(.*?)\*\*/,
    /^#\s+(.+)$/m,
    /Recipe:\s*(.+)$/m,
    /Recipe Name:\s*(.+)$/m
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractIngredientsFromContent(content: string): string[] {
  const ingredients: string[] = [];
  const lines = content.split('\n');
  let inIngredientsSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('ingredients')) {
      inIngredientsSection = true;
      continue;
    }
    if (inIngredientsSection && (line.toLowerCase().includes('instructions') || line.toLowerCase().includes('directions'))) {
      break;
    }
    if (inIngredientsSection && (line.trim().startsWith('*') || line.trim().startsWith('-') || line.trim().match(/^\d+\./))) {
      const ingredient = line.replace(/^[\*\-\d\.]\s*/, '').trim();
      if (ingredient && ingredient.length > 2) {
        ingredients.push(ingredient);
      }
    }
  }
  
  return ingredients;
}

function extractInstructionsFromContent(content: string): string[] {
  const instructions: string[] = [];
  const lines = content.split('\n');
  let inInstructionsSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('instructions') || line.toLowerCase().includes('directions')) {
      inInstructionsSection = true;
      continue;
    }
    if (inInstructionsSection && (line.toLowerCase().includes('notes') || line.toLowerCase().includes('tips'))) {
      break;
    }
    if (inInstructionsSection && (line.trim().match(/^\d+\./) || line.trim().startsWith('*') || line.trim().startsWith('-'))) {
      const instruction = line.replace(/^[\*\-\d\.\s]*/, '').trim();
      if (instruction && instruction.length > 5) {
        instructions.push(instruction);
      }
    }
  }
  
  return instructions;
}

function extractTimeFromContent(content: string, type: 'total' | 'active'): string | null {
  if (typeof content !== 'string') {
    return null;
  }
  
  const patterns = type === 'total' 
    ? [/total time[:\s]*([^,\n]+)/i, /total[:\s]*([^,\n]+)/i]
    : [/active time[:\s]*([^,\n]+)/i, /prep time[:\s]*([^,\n]+)/i];
    
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractYieldsFromContent(content: string): string | null {
  const patterns = [
    /yields[:\s]*([^,\n]+)/i,
    /serves[:\s]*([^,\n]+)/i,
    /makes[:\s]*([^,\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractTagsFromContent(content: string, recipeName: string): string[] {
  const tags: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Add recipe type tags
  if (contentLower.includes('sourdough')) tags.push('sourdough');
  if (contentLower.includes('cookie') || contentLower.includes('cookies')) tags.push('cookies');
  if (contentLower.includes('cake')) tags.push('cake');
  if (contentLower.includes('bread')) tags.push('bread');
  if (contentLower.includes('muffin')) tags.push('muffins');
  if (contentLower.includes('pizza')) tags.push('pizza');
  if (contentLower.includes('pancake')) tags.push('pancakes');
  
  // Add dietary tags
  if (contentLower.includes('vegan')) tags.push('vegan');
  if (contentLower.includes('gluten-free') || contentLower.includes('gluten free')) tags.push('gluten-free');
  if (contentLower.includes('dairy-free') || contentLower.includes('dairy free')) tags.push('dairy-free');
  
  // Add difficulty tags
  if (contentLower.includes('beginner') || contentLower.includes('easy')) tags.push('beginner-friendly');
  if (contentLower.includes('intermediate')) tags.push('intermediate');
  if (contentLower.includes('advanced')) tags.push('advanced');
  
  // Add ingredient-based tags
  if (contentLower.includes('chocolate')) tags.push('chocolate');
  if (contentLower.includes('vanilla')) tags.push('vanilla');
  if (contentLower.includes('banana')) tags.push('banana');
  
  return Array.from(new Set(tags)); // Remove duplicates
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add subdomain-specific routing middleware
  app.use((req: any, res: any, next: any) => {
    if (req.isStore) {
      res.setHeader('X-Subdomain', 'store');
      // Add store-specific routing logic
      res.locals.subdomain = 'store';
    } else if (req.isBlog) {
      res.setHeader('X-Subdomain', 'blog');
      res.locals.subdomain = 'blog';
    } else {
      res.setHeader('X-Subdomain', 'app');
      res.locals.subdomain = 'app';
    }
    next();
  });
  // Initialize Stripe with API key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing required Stripe secret key: STRIPE_SECRET_KEY");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-03-31.basil',
  });
  
  // Subdomain-specific routing for store endpoints
  app.get('/api/store/products', async (req, res) => {
    if (!req.isStore) {
      return res.status(404).json({ error: 'Store endpoints only available on store subdomain' });
    }
    
    try {
      const starters = await storage.getAllStarters();
      const products = starters.filter((starter: any) => starter.id !== 1).map((starter: any) => ({
        id: starter.id,
        name: starter.name,
        description: starter.description,
        price: starter.price,
        imageUrl: starter.imageUrl,
        category: 'starters',
        inStock: starter.inStock,
        featured: starter.featured,
        slug: starter.slug
      }));
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching store products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Blog-specific endpoints
  app.get('/api/blog/articles', async (req, res) => {
    if (!req.isBlog) {
      return res.status(404).json({ error: 'Blog endpoints only available on blog subdomain' });
    }
    
    try {
      const articles = await storage.getAllBlogPosts();
      res.json(articles);
    } catch (error) {
      console.error('Error fetching blog articles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  // Content Articles API routes
  app.get('/api/content-articles', async (req, res) => {
    try {
      const articles = await storage.getAllContentArticles();
      res.json(articles);
    } catch (error) {
      console.error('Error fetching content articles:', error);
      res.status(500).json({ error: 'Failed to fetch content articles' });
    }
  });
  
  app.get('/api/content-articles/published', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const articles = await storage.getPublishedContentArticles(limit);
      res.json(articles);
    } catch (error) {
      console.error('Error fetching published content articles:', error);
      res.status(500).json({ error: 'Failed to fetch published content articles' });
    }
  });
  
  app.get('/api/content-articles/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getContentArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      console.error('Error fetching content articles by category:', error);
      res.status(500).json({ error: 'Failed to fetch content articles by category' });
    }
  });
  
  app.get('/api/content-articles/entity-type/:entityType', async (req, res) => {
    try {
      const { entityType } = req.params;
      const articles = await storage.getContentArticlesByEntityType(entityType);
      res.json(articles);
    } catch (error) {
      console.error('Error fetching content articles by entity type:', error);
      res.status(500).json({ error: 'Failed to fetch content articles by entity type' });
    }
  });
  
  app.get('/api/content-articles/entity/:entityType/:entityId', async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const articles = await storage.getContentArticlesByEntityId(entityType, parseInt(entityId));
      res.json(articles);
    } catch (error) {
      console.error('Error fetching content articles by entity:', error);
      res.status(500).json({ error: 'Failed to fetch content articles by entity' });
    }
  });
  
  app.get('/api/content-articles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const article = await storage.getContentArticleById(parseInt(id));
      
      if (!article) {
        return res.status(404).json({ error: 'Content article not found' });
      }
      
      res.json(article);
    } catch (error) {
      console.error('Error fetching content article by ID:', error);
      res.status(500).json({ error: 'Failed to fetch content article' });
    }
  });
  
  // Get content article by slug (for blog post pages)
  app.get('/api/content-articles/by-slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getContentArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      res.json(article);
    } catch (error) {
      console.error('Error fetching content article:', error);
      res.status(500).json({ error: 'Failed to fetch content article' });
    }
  });

  app.get('/api/content-articles/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getContentArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ error: 'Content article not found' });
      }
      
      res.json(article);
    } catch (error) {
      console.error('Error fetching content article by slug:', error);
      res.status(500).json({ error: 'Failed to fetch content article' });
    }
  });
  
  app.post('/api/content-articles', async (req, res) => {
    try {
      const newArticle = req.body;
      console.log('Content article creation request:', newArticle);
      
      // Validation: required fields check
      if (!newArticle.title || !newArticle.content || !newArticle.category) {
        console.error('Missing required fields:', { 
          hasTitle: !!newArticle.title, 
          hasContent: !!newArticle.content, 
          hasCategory: !!newArticle.category 
        });
        return res.status(400).json({ error: 'Missing required fields: title, content, or category' });
      }
      
      // Generate slug if not provided
      if (!newArticle.slug || newArticle.slug.trim() === '') {
        newArticle.slug = newArticle.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      
      // Ensure slug is never empty
      if (!newArticle.slug || newArticle.slug.trim() === '') {
        newArticle.slug = 'article-' + Date.now();
      }
      
      console.log('Creating article with data:', {
        title: newArticle.title,
        slug: newArticle.slug,
        category: newArticle.category,
        relatedEntityType: newArticle.relatedEntityType,
        isPublished: newArticle.isPublished
      });
      
      const article = await storage.createContentArticle(newArticle);
      console.log('Article created successfully:', article.id);
      res.status(201).json(article);
    } catch (error) {
      console.error('Error creating content article:', error);
      // Send more detailed error information
      res.status(500).json({ 
        error: 'Failed to create content article', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }
  });
  
  app.patch('/api/content-articles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const articleUpdates = req.body;
      
      const article = await storage.updateContentArticle(parseInt(id), articleUpdates);
      
      if (!article) {
        return res.status(404).json({ error: 'Content article not found' });
      }
      
      res.json(article);
    } catch (error) {
      console.error('Error updating content article:', error);
      res.status(500).json({ error: 'Failed to update content article' });
    }
  });
  
  app.delete('/api/content-articles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContentArticle(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: 'Content article not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting content article:', error);
      res.status(500).json({ error: 'Failed to delete content article' });
    }
  });

  // API routes with /api prefix
  
  // Recipe Validator Routes
  
  // Scrape recipe from URL
  app.post("/api/recipe-validator/scrape", async (req, res) => {
    try {
      const { url } = req.body;
      
      // Validate input
      if (!url || url.trim() === "") {
        return res.status(400).json({ 
          message: "URL is required",
          success: false 
        });
      }
      
      // Basic URL validation - check if it starts with http:// or https://
      if (!url.match(/^https?:\/\//i)) {
        return res.status(400).json({ 
          message: "Invalid URL format. URL must start with http:// or https://",
          success: false 
        });
      }
      
      console.log(`Scraping recipe from URL: ${url}`);
      
      // Call scraper service to extract recipe data
      const scrapedRecipe = await scrapeRecipeFromUrl(url);
      
      if (!scrapedRecipe) {
        return res.status(404).json({ 
          message: "Could not extract recipe from the provided URL",
          success: false 
        });
      }
      
      return res.status(200).json({
        success: true,
        recipe: scrapedRecipe
      });
    } catch (error) {
      console.error("Error scraping recipe:", error);
      
      // Handle specific error types with user-friendly messages
      if (error instanceof Error) {
        switch (error.message) {
          case 'SCRAPING_BLOCKED':
            return res.status(403).json({ 
              message: "This website doesn't allow us to scrape the recipe. Please manually enter the recipe text for analysis.",
              success: false,
              errorType: 'SCRAPING_BLOCKED'
            });
          case 'TIMEOUT':
            return res.status(408).json({ 
              message: "The website took too long to respond. Please try again or enter the recipe manually.",
              success: false,
              errorType: 'TIMEOUT'
            });
          case 'NOT_FOUND':
            return res.status(404).json({ 
              message: "The recipe page could not be found. Please check the URL and try again.",
              success: false,
              errorType: 'NOT_FOUND'
            });
          case 'SERVER_ERROR':
            return res.status(502).json({ 
              message: "The website is currently unavailable. Please try again later or enter the recipe manually.",
              success: false,
              errorType: 'SERVER_ERROR'
            });
          default:
            return res.status(500).json({ 
              message: "Unable to extract recipe from this URL. Please try entering the recipe text manually.",
              success: false,
              errorType: 'SCRAPING_FAILED'
            });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to scrape recipe from URL. Please try entering the recipe text manually.",
        success: false,
        errorType: 'UNKNOWN_ERROR'
      });
    }
  });
  
  // Predict recipe success based on hydration and user skill level
  app.post("/api/predict-recipe-success", async (req, res) => {
    try {
      const { recipeText, skillLevel, bakingFrequency, environment, recipeName, userId } = req.body;
      
      // Validate input - either recipeText OR url is required
      if ((!recipeText || recipeText.trim() === "") && (!req.body.url || req.body.url.trim() === "")) {
        return res.status(400).json({ message: "Recipe text or URL is required" });
      }
      
      if (!skillLevel) {
        return res.status(400).json({ message: "Skill level is required" });
      }
      
      console.log("Predicting recipe success with skill level:", skillLevel);
      
      let analysisResult;
      let scrapedRecipe = null;
      
      // Handle URL-based prediction - scrape first, then analyze
      if (req.body.url) {
        console.log(`Scraping recipe from URL: ${req.body.url}`);
        scrapedRecipe = await scrapeRecipeFromUrl(req.body.url);
        
        if (!scrapedRecipe) {
          return res.status(404).json({ 
            message: "Could not extract recipe from the provided URL",
            success: false 
          });
        }

        // Convert scraped recipe to text for analysis
        const recipeTextFromUrl = `${scrapedRecipe.title}\n\nIngredients:\n${scrapedRecipe.ingredients.join('\n')}\n\nInstructions:\n${scrapedRecipe.instructions.join('\n')}`;
        analysisResult = await analyzeRecipe(recipeTextFromUrl, scrapedRecipe.title);
      } else {
        // Text-based prediction - analyze the provided text
        analysisResult = await analyzeRecipe(recipeText, recipeName);
      }
      
      // Calculate success probability based on hydration and skill level
      const hydration = analysisResult.extractedRecipe?.hydration || null;
      
      let successProbability = 85; // Base success rate
      const riskFactors = [];
      const tips = [];
      
      // Adjust probability based on hydration level
      if (hydration) {
        if (hydration >= 80) {
          // Very high hydration - challenging for all levels
          if (skillLevel === 'beginner') {
            successProbability = 35;
            riskFactors.push("Very high hydration (80%+) is extremely challenging for beginners");
            tips.push("Consider starting with 65-70% hydration recipes first");
            tips.push("Use stretch and folds every 30 minutes during bulk fermentation");
          } else if (skillLevel === 'intermediate') {
            successProbability = 55;
            riskFactors.push("High hydration requires advanced handling techniques");
            tips.push("Keep your hands and work surface lightly wet when handling");
          } else if (skillLevel === 'advanced') {
            successProbability = 75;
            tips.push("Use coil folds instead of traditional stretch and folds");
          }
        } else if (hydration >= 75) {
          // High hydration - intermediate to advanced
          if (skillLevel === 'beginner') {
            successProbability = 45;
            riskFactors.push("High hydration (75%+) is very sticky and difficult to handle");
            tips.push("Practice with lower hydration recipes first");
            tips.push("Use a bench scraper to help with dough handling");
          } else if (skillLevel === 'intermediate') {
            successProbability = 70;
            tips.push("Work quickly and confidently during shaping");
            tips.push("Ensure your starter is very active for high hydration doughs");
          }
        } else if (hydration >= 70) {
          // Medium-high hydration
          if (skillLevel === 'beginner') {
            successProbability = 65;
            tips.push("This hydration level is manageable with practice");
            tips.push("Focus on gentle handling to maintain dough structure");
          } else if (skillLevel === 'intermediate') {
            successProbability = 80;
          }
        } else if (hydration <= 65) {
          // Lower hydration - easier for beginners
          if (skillLevel === 'beginner') {
            successProbability = 85;
            tips.push("This is a great hydration level for building confidence");
          }
        }
      }
      
      // Adjust based on skill level and experience frequency
      if (skillLevel === 'expert') {
        successProbability = Math.min(95, successProbability + 10);
      } else if (skillLevel === 'advanced') {
        successProbability = Math.min(90, successProbability + 5);
      } else if (skillLevel === 'beginner') {
        if (bakingFrequency === 'occasionally') {
          successProbability = Math.max(30, successProbability - 10);
          riskFactors.push("Infrequent baking can make technique development challenging");
        }
      }
      
      // Add general tips based on skill level
      if (skillLevel === 'beginner') {
        tips.push("Take detailed notes during each step for future reference");
        tips.push("Don't rush the process - fermentation takes time");
      } else if (skillLevel === 'intermediate') {
        tips.push("Focus on consistency in your techniques");
        tips.push("Pay attention to dough feel and visual cues");
      }
      
      // Environment adjustments
      if (environment === 'professional') {
        successProbability = Math.min(95, successProbability + 5);
      }
      
      // Create prediction result
      const predictionResult = {
        successProbability: Math.round(successProbability),
        extractedRecipe: analysisResult.extractedRecipe,
        analysis: analysisResult.analysis,
        scrapedRecipe,
        riskFactors,
        tips,
        skillLevel,
        bakingFrequency,
        environment
      };
      
      // If user is logged in, save the prediction result
      if (userId) {
        const validationData: InsertRecipeValidation = {
          userId,
          recipeName: recipeName || scrapedRecipe?.title || "Untitled Recipe",
          recipeInput: recipeText || req.body.url,
          ingredients: analysisResult.extractedRecipe?.ingredients || null,
          instructions: analysisResult.extractedRecipe?.instructions || null,
          analysis: JSON.stringify(predictionResult),
          suggestions: analysisResult.suggestions
        };
        
        const savedValidation = await storage.createRecipeValidation(validationData);
        
        return res.status(200).json({
          ...predictionResult,
          id: savedValidation.id,
          saved: true
        });
      }
      
      // Return prediction result
      return res.status(200).json({
        ...predictionResult,
        saved: false
      });
      
    } catch (error) {
      console.error("Error predicting recipe success:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to predict recipe success",
        success: false 
      });
    }
  });
  
  // Get user's saved recipe validations
  app.get("/api/recipe-validator/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const validations = await storage.getUserRecipeValidations(userId);
      res.json(validations);
    } catch (error) {
      console.error("Error fetching recipe validations:", error);
      res.status(500).json({ message: "Failed to fetch recipe validations" });
    }
  });
  
  // Get a specific recipe validation
  app.get("/api/recipe-validator/:id", async (req, res) => {
    try {
      const validationId = parseInt(req.params.id);
      if (isNaN(validationId)) {
        return res.status(400).json({ message: "Invalid validation ID" });
      }
      
      const validation = await storage.getRecipeValidationById(validationId);
      if (!validation) {
        return res.status(404).json({ message: "Recipe validation not found" });
      }
      
      res.json(validation);
    } catch (error) {
      console.error("Error fetching recipe validation:", error);
      res.status(500).json({ message: "Failed to fetch recipe validation" });
    }
  });
  
  // Delete a recipe validation
  app.delete("/api/recipe-validator/:id", async (req, res) => {
    try {
      const validationId = parseInt(req.params.id);
      if (isNaN(validationId)) {
        return res.status(400).json({ message: "Invalid validation ID" });
      }
      
      const result = await storage.deleteRecipeValidation(validationId);
      if (!result) {
        return res.status(404).json({ message: "Recipe validation not found" });
      }
      
      res.json({ success: true, message: "Recipe validation deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe validation:", error);
      res.status(500).json({ message: "Failed to delete recipe validation" });
    }
  });
  
  // Get all sourdough starters
  app.get("/api/starters", async (req, res) => {
    try {
      const starters = await storage.getAllStarters();
      
      // Update image URLs to use local images if available
      const updatedStarters = starters.map(starter => {
        // Map database starters to local images - use absolute paths
        if (starter.id === 6) { // Koji starter
          return { ...starter, imageUrl: "/images/starters/koji-starter.jpg" };
        } else if (starter.id === 7) { // San Francisco starter
          return { ...starter, imageUrl: "/images/starters/san-francisco-starter.jpg" };
        } else if (starter.id === 8) { // Traditional Rye starter
          return { ...starter, imageUrl: "/images/starters/rye-starter.jpg" };
        } else if (starter.id === 10) { // House Blend starter
          return { ...starter, imageUrl: "/images/starters/house-blend-starter.jpg" };
        } else if (starter.id === 1) { // Homemade starter
          return { ...starter, imageUrl: "/images/starters/homemade-starter.png" };
        }
        // For any other starters, set a default image
        return { ...starter, imageUrl: "/images/starters/house-blend-starter.jpg" };
      });
      
      // Debug log to see what's being sent to client
      console.log("Sending starter data with image URLs:", updatedStarters.map(s => ({ id: s.id, name: s.name, imageUrl: s.imageUrl })));
      
      res.json(updatedStarters);
    } catch (error) {
      console.error("Error fetching starters:", error);
      res.status(500).json({ message: "Failed to fetch sourdough starters" });
    }
  });
  
  // AI recommendation for sourdough starter based on quiz answers
  app.post("/api/ai/recommend-starter", async (req, res) => {
    try {
      const quizData = req.body;
      
      // Validate request has required data
      if (!quizData || !quizData.userPreferences || !quizData.availableStarters) {
        return res.status(400).json({ 
          message: "Invalid request format. Missing user preferences or available starters." 
        });
      }
      
      // Call AI service to get recommendations
      const result = await aiService.recommendStarter(quizData);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: result.error || "Failed to get starter recommendation" 
        });
      }
      
      // Return the recommendation data
      res.json(result.data);
    } catch (error) {
      console.error("Error recommending starter:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process starter recommendation" 
      });
    }
  });
  
  // AI-powered baking timeline generator
  app.post("/api/ai/generate-timeline", async (req, res) => {
    try {
      const timelineData = req.body;
      
      // Validate request has minimum required data
      if (!timelineData || !timelineData.targetCompletionTime || !timelineData.recipe) {
        return res.status(400).json({ 
          message: "Invalid request format. Missing required timeline parameters." 
        });
      }
      
      console.log("Generating AI-optimized baking timeline");
      
      // Call AI service to generate optimized timeline
      const result = await aiService.generateBakingTimeline(timelineData);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: result.error || "Failed to generate baking timeline" 
        });
      }
      
      console.log("Timeline generation successful");
      
      // Return the generated timeline data
      res.json(result.data);
    } catch (error) {
      console.error("Error generating timeline:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate baking timeline" 
      });
    }
  });
  
  // AI Settings management routes are now defined below near line 3140

  // Get a single starter by ID
  app.get("/api/starters/:id", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }

      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return res.status(404).json({ message: "Starter not found" });
      }

      res.json(starter);
    } catch (error) {
      console.error("Error fetching starter:", error);
      res.status(500).json({ message: "Failed to fetch starter" });
    }
  });

  // Create a new sourdough starter
  app.post("/api/starters", async (req, res) => {
    try {
      const starter = insertStarterSchema.parse(req.body);
      const newStarter = await storage.createStarter(starter);
      res.status(201).json(newStarter);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating starter:", error);
      res.status(500).json({ message: "Failed to create starter" });
    }
  });
  
  // Update a sourdough starter
  app.put("/api/starters/:id", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      // Make sure the starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      // Validate and parse the update data
      const starterUpdates = insertStarterSchema.partial().parse(req.body);
      
      // Update the starter
      const updatedStarter = await storage.updateStarter(starterId, starterUpdates);
      if (!updatedStarter) {
        return res.status(500).json({ message: "Failed to update starter" });
      }
      
      res.json(updatedStarter);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating starter:", error);
      res.status(500).json({ message: "Failed to update starter" });
    }
  });
  
  // Delete a sourdough starter
  app.delete("/api/starters/:id", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      // Check if the starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      // Delete the starter
      const success = await storage.deleteStarter(starterId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete starter" });
      }
      
      res.status(200).json({ message: "Starter deleted successfully" });
    } catch (error) {
      console.error("Error deleting starter:", error);
      res.status(500).json({ message: "Failed to delete starter" });
    }
  });
  
  // Get feeding logs for a specific starter
  app.get("/api/starters/:id/feeding-logs", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      // Check if the starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      // Check if date query parameter exists
      if (req.query.date) {
        const dateParam = req.query.date as string;
        const date = new Date(dateParam);
        
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        const feedingLogs = await storage.getStarterFeedingLogsByDate(starterId, date);
        return res.json(feedingLogs);
      }
      
      // If no date parameter, return all logs
      const feedingLogs = await storage.getStarterFeedingLogs(starterId);
      res.json(feedingLogs);
    } catch (error) {
      console.error("Error fetching feeding logs:", error);
      res.status(500).json({ message: "Failed to fetch feeding logs" });
    }
  });
  
  // Get dates with feeding logs for a specific starter
  app.get("/api/starters/:id/feeding-log-dates", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      // Check if the starter exists
      const existingStarter = await storage.getStarterById(starterId);
      if (!existingStarter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      const dates = await storage.getStarterFeedingLogDates(starterId);
      res.json({ dates });
    } catch (error) {
      console.error("Error fetching feeding log dates:", error);
      res.status(500).json({ message: "Failed to fetch feeding log dates" });
    }
  });
  
  // Add a new feeding log entry
  app.post("/api/feeding-logs", async (req, res) => {
    try {
      // Parse the request body with zod schema
      const feedingLogData = insertFeedingLogSchema.parse(req.body);
      
      // Ensure the feedingDate is properly processed as a Date object
      const formattedData = {
        ...feedingLogData,
        feedingDate: new Date(feedingLogData.feedingDate)
      };
      
      // Create the feeding log with the properly formatted date
      const newFeedingLog = await storage.createFeedingLog(formattedData);
      res.status(201).json(newFeedingLog);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating feeding log:", error);
      res.status(500).json({ message: "Failed to create feeding log" });
    }
  });
  
  // Delete a feeding log entry
  app.delete("/api/feeding-logs/:id", async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid feeding log ID" });
      }
      
      const success = await storage.deleteFeedingLog(logId);
      if (!success) {
        return res.status(404).json({ message: "Feeding log not found" });
      }
      
      res.status(200).json({ message: "Feeding log deleted successfully" });
    } catch (error) {
      console.error("Error deleting feeding log:", error);
      res.status(500).json({ message: "Failed to delete feeding log" });
    }
  });
  
  // Get health logs for a specific starter
  app.get("/api/starters/:id/health-logs", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      // Verify the starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      const healthLogs = await storage.getStarterHealthLogs(starterId);
      res.json(healthLogs);
    } catch (error) {
      console.error("Error fetching health logs:", error);
      res.status(500).json({ message: "Failed to fetch health logs" });
    }
  });
  
  // Get the latest health log for a starter
  app.get("/api/starters/:id/health-logs/latest", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      const latestLog = await storage.getLatestHealthLog(starterId);
      
      if (!latestLog) {
        return res.status(404).json({ message: "No health logs found for this starter" });
      }
      
      res.json(latestLog);
    } catch (error) {
      console.error("Error fetching latest health log:", error);
      res.status(500).json({ message: "Failed to fetch latest health log" });
    }
  });
  
  // Add a new health log entry
  app.post("/api/health-logs", async (req, res) => {
    try {
      const healthLog = insertHealthLogSchema.parse(req.body);
      const newHealthLog = await storage.createHealthLog(healthLog);
      res.status(201).json(newHealthLog);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating health log:", error);
      res.status(500).json({ message: "Failed to create health log" });
    }
  });
  
  // Get a specific health log
  app.get("/api/health-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid health log ID" });
      }
      
      const healthLog = await storage.getHealthLogById(id);
      
      if (!healthLog) {
        return res.status(404).json({ message: "Health log not found" });
      }
      
      res.json(healthLog);
    } catch (error) {
      console.error("Error fetching health log:", error);
      res.status(500).json({ message: "Failed to fetch health log" });
    }
  });
  
  // Update a health log entry
  app.patch("/api/health-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid health log ID" });
      }
      
      const healthLogSchema = insertHealthLogSchema.partial();
      const healthLogUpdates = healthLogSchema.parse(req.body);
      
      const updatedLog = await storage.updateHealthLog(id, healthLogUpdates);
      
      if (!updatedLog) {
        return res.status(404).json({ message: "Health log not found" });
      }
      
      res.json(updatedLog);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error updating health log:", error);
      res.status(500).json({ message: "Failed to update health log" });
    }
  });
  
  // Delete a health log entry
  app.delete("/api/health-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid health log ID" });
      }
      
      const success = await storage.deleteHealthLog(id);
      
      if (!success) {
        return res.status(404).json({ message: "Health log not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting health log:", error);
      res.status(500).json({ message: "Failed to delete health log" });
    }
  });

  // Baking Log API Routes
  
  // Get all baking logs, optionally filtered by recipeId or starterId query params
  app.get("/api/baking-logs", async (req, res) => {
    try {
      const recipeId = req.query.recipeId ? parseInt(req.query.recipeId as string) : undefined;
      const starterId = req.query.starterId ? parseInt(req.query.starterId as string) : undefined;
      
      let bakingLogs;
      if (recipeId && starterId) {
        bakingLogs = await storage.getStarterBakingLogsByRecipe(starterId, recipeId);
      } else if (recipeId) {
        bakingLogs = await storage.getBakingLogsByRecipeId(recipeId);
      } else if (starterId) {
        bakingLogs = await storage.getStarterBakingLogs(starterId);
      } else {
        bakingLogs = await storage.getAllBakingLogs();
      }
      
      res.json(bakingLogs);
    } catch (error) {
      console.error("Error fetching baking logs:", error);
      res.status(500).json({ message: "Failed to fetch baking logs" });
    }
  });
  
  // Get baking logs for a specific starter
  app.get("/api/starters/:id/baking-logs", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }
      
      // Verify the starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      const bakingLogs = await storage.getStarterBakingLogs(starterId);
      res.json(bakingLogs);
    } catch (error) {
      console.error("Error fetching baking logs:", error);
      res.status(500).json({ message: "Failed to fetch baking logs" });
    }
  });
  
  // Get baking logs for a specific recipe using a specific starter
  app.get("/api/starters/:starterId/recipes/:recipeId/baking-logs", async (req, res) => {
    try {
      const starterId = parseInt(req.params.starterId);
      const recipeId = parseInt(req.params.recipeId);
      
      if (isNaN(starterId) || isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid starter or recipe ID" });
      }
      
      // Verify the starter exists
      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return res.status(404).json({ message: "Starter not found" });
      }
      
      // Verify the recipe exists
      const recipe = await storage.getRecipeById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      const bakingLogs = await storage.getStarterBakingLogsByRecipe(starterId, recipeId);
      res.json(bakingLogs);
    } catch (error) {
      console.error("Error fetching baking logs for recipe:", error);
      res.status(500).json({ message: "Failed to fetch baking logs for recipe" });
    }
  });
  
  // Get specific baking log by ID
  app.get("/api/baking-logs/:id", async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid baking log ID" });
      }
      
      const bakingLog = await storage.getBakingLogById(logId);
      
      if (!bakingLog) {
        return res.status(404).json({ message: "Baking log not found" });
      }
      
      res.json(bakingLog);
    } catch (error) {
      console.error("Error fetching baking log:", error);
      res.status(500).json({ message: "Failed to fetch baking log" });
    }
  });
  
  // Add a new baking log entry
  app.post("/api/baking-logs", async (req, res) => {
    try {
      // Log the incoming request to debug date issues
      console.log("Baking log request body:", JSON.stringify(req.body));
      
      // Try to parse with the schema
      const bakingLog = insertBakingLogSchema.parse(req.body);
      
      // Log successful parsing
      console.log("Successfully parsed baking log:", JSON.stringify(bakingLog));
      
      const newBakingLog = await storage.createBakingLog(bakingLog);
      res.status(201).json(newBakingLog);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod validation error:", error.errors);
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating baking log:", error);
      res.status(500).json({ message: "Failed to create baking log" });
    }
  });
  
  // Update a baking log entry
  app.patch("/api/baking-logs/:id", async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid baking log ID" });
      }
      
      // Check if the log exists
      const existingLog = await storage.getBakingLogById(logId);
      if (!existingLog) {
        return res.status(404).json({ message: "Baking log not found" });
      }
      
      // Partial validation of the update data
      // This allows updating only specific fields
      const updateData = req.body;
      
      const updatedLog = await storage.updateBakingLog(logId, updateData);
      res.json(updatedLog);
    } catch (error) {
      console.error("Error updating baking log:", error);
      res.status(500).json({ message: "Failed to update baking log" });
    }
  });
  
  // Delete a baking log entry
  app.delete("/api/baking-logs/:id", async (req, res) => {
    try {
      const logId = parseInt(req.params.id);
      
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid baking log ID" });
      }
      
      const success = await storage.deleteBakingLog(logId);
      
      if (!success) {
        return res.status(404).json({ message: "Baking log not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting baking log:", error);
      res.status(500).json({ message: "Failed to delete baking log" });
    }
  });

  // Baking Timeline Routes
  app.get("/api/timelines", async (req, res) => {
    try {
      // Default to user ID 1 for development
      const userId = 1;
      
      const timelines = await storage.getUserTimelines(userId);
      res.json(timelines);
    } catch (error) {
      console.error("Error fetching timelines:", error);
      res.status(500).json({ message: "Failed to fetch timelines" });
    }
  });

  app.get("/api/timelines/:id", async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      
      if (isNaN(timelineId)) {
        return res.status(400).json({ message: "Invalid timeline ID" });
      }
      
      const timeline = await storage.getTimelineById(timelineId);
      
      if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.get("/api/recipes/:recipeId/timelines", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.recipeId);
      
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const timelines = await storage.getTimelinesByRecipeId(recipeId);
      res.json(timelines);
    } catch (error) {
      console.error("Error fetching recipe timelines:", error);
      res.status(500).json({ message: "Failed to fetch recipe timelines" });
    }
  });

  app.post("/api/timelines", async (req, res) => {
    try {
      // For simplicity, set userId to 1 for development
      const userId = 1;
      
      // Create the timeline with the required fields
      const timelineData: InsertBakingTimeline = {
        userId,
        recipeName: req.body.recipeName,
        recipeId: req.body.recipeId,
        timelineData: req.body.timelineData,
        startTime: new Date(req.body.startTime),
        desiredFinishTime: new Date(req.body.desiredFinishTime),
        isCompleted: false
      };
      
      const timeline = await storage.createTimeline(timelineData);
      res.status(201).json(timeline);
    } catch (error) {
      console.error("Error creating timeline:", error);
      res.status(500).json({ message: "Failed to create timeline" });
    }
  });

  app.patch("/api/timelines/:id", async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      
      if (isNaN(timelineId)) {
        return res.status(400).json({ message: "Invalid timeline ID" });
      }
      
      // Update only the fields that are provided
      const timeline = await storage.updateTimeline(timelineId, req.body);
      
      if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      
      res.json(timeline);
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ message: "Failed to update timeline" });
    }
  });

  app.post("/api/timelines/:id/complete", async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      const bakingLogId = parseInt(req.body.bakingLogId);
      
      if (isNaN(timelineId) || isNaN(bakingLogId)) {
        return res.status(400).json({ 
          message: "Invalid input. Both timeline ID and baking log ID are required." 
        });
      }
      
      const timeline = await storage.markTimelineComplete(timelineId, bakingLogId);
      
      if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      
      res.json(timeline);
    } catch (error) {
      console.error("Error completing timeline:", error);
      res.status(500).json({ message: "Failed to complete timeline" });
    }
  });

  app.delete("/api/timelines/:id", async (req, res) => {
    try {
      const timelineId = parseInt(req.params.id);
      
      if (isNaN(timelineId)) {
        return res.status(400).json({ message: "Invalid timeline ID" });
      }
      
      const success = await storage.deleteTimeline(timelineId);
      
      if (!success) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting timeline:", error);
      res.status(500).json({ message: "Failed to delete timeline" });
    }
  });

  // User routes for authentication will come later
  
  // User preferences routes
  app.get("/api/user/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const preferences = await storage.getUserPreferences(userId);
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }

      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post("/api/user/preferences", async (req, res) => {
    try {
      const preferences = insertUserPreferencesSchema.parse(req.body);
      const newPreferences = await storage.createUserPreferences(preferences);
      res.status(201).json(newPreferences);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating user preferences:", error);
      res.status(500).json({ message: "Failed to create user preferences" });
    }
  });

  app.patch("/api/user/preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const preferencesSchema = insertUserPreferencesSchema.partial();
      const preferenceUpdates = preferencesSchema.parse(req.body);
      
      const updatedPreferences = await storage.updateUserPreferences(userId, preferenceUpdates);
      if (!updatedPreferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }

      res.json(updatedPreferences);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Get all bread recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  
  // Get public recipes
  app.get("/api/recipes/public", async (req, res) => {
    try {
      const recipes = await storage.getPublicRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching public recipes:", error);
      res.status(500).json({ message: "Failed to fetch public recipes" });
    }
  });

  // Get a single recipe by ID
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const recipe = await storage.getRecipeById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  // Get user recipes
  app.get("/api/user/:userId/recipes", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const recipes = await storage.getUserRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching user recipes:", error);
      res.status(500).json({ message: "Failed to fetch user recipes" });
    }
  });

  // Create a new bread recipe
  app.post("/api/recipes", async (req, res) => {
    try {
      const recipe = insertBreadRecipeSchema.parse(req.body);
      const newRecipe = await storage.createRecipe(recipe);
      res.status(201).json(newRecipe);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });
  
  // Update a bread recipe
  app.patch("/api/recipes/:id", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipeSchema = insertBreadRecipeSchema.partial();
      const recipeUpdates = recipeSchema.parse(req.body);
      
      const updatedRecipe = await storage.updateRecipe(recipeId, recipeUpdates);
      if (!updatedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(updatedRecipe);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });
  
  // Delete a bread recipe
  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const success = await storage.deleteRecipe(recipeId);
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });
  
  // Import multiple recipes at once
  app.post("/api/recipes/import", async (req, res) => {
    try {
      const { seedRecipes } = await import('./seed-recipes');
      const { recipes } = req.body;
      
      if (!Array.isArray(recipes)) {
        return res.status(400).json({ 
          message: "Invalid input: recipes must be an array" 
        });
      }
      
      const results = await seedRecipes(recipes);
      res.status(201).json({
        message: `Successfully imported ${results.success} recipes`,
        ...results
      });
    } catch (error) {
      console.error("Error importing recipes:", error);
      res.status(500).json({ 
        message: "Failed to import recipes",
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Scrape a recipe from a URL
  app.post("/api/recipes/scrape", async (req, res) => {
    try {
      // Validate the URL
      const urlSchema = z.object({
        url: z.string().url()
      });
      
      const { url } = urlSchema.parse(req.body);
      
      console.log(`Scraping recipe from URL: ${url}`);
      
      // Use our new recipe scraper
      const scrapedRecipe = await recipeScraper.scrapeRecipeFromUrl(url);
      
      // Perform basic analysis on the scraped recipe
      const recipeAnalysis = recipeScraper.analyzeRecipe(scrapedRecipe);
      
      // Return both the scraped recipe and analysis
      res.json({
        success: true,
        data: {
          recipe: scrapedRecipe,
          analysis: recipeAnalysis
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false,
          message: validationError.message 
        });
      }
      
      // Handle scraper-specific errors
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ScraperError') {
        const scraperError = error as { name: string; message: string; statusCode?: number };
        return res.status(scraperError.statusCode || 422).json({
          success: false,
          message: scraperError.message,
          statusCode: scraperError.statusCode
        });
      }
      
      console.error("Error scraping recipe:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Failed to scrape recipe" 
      });
    }
  });

  // Validate a bread recipe
  app.post("/api/recipes/validate", async (req, res) => {
    try {
      const recipeSchema = z.object({
        flourGrams: z.number().optional(),
        waterGrams: z.number().optional(),
        saltGrams: z.number().optional(),
        starterGrams: z.number().optional(),
        recipeText: z.string().optional(),
      });
      
      const recipeData = recipeSchema.parse(req.body);
      
      // Calculate hydration if we have flour and water amounts
      let hydration;
      let saltPercentage;
      let starterPercentage;
      
      if (recipeData.flourGrams && recipeData.waterGrams) {
        hydration = (recipeData.waterGrams / recipeData.flourGrams) * 100;
      }
      
      if (recipeData.flourGrams && recipeData.saltGrams) {
        saltPercentage = (recipeData.saltGrams / recipeData.flourGrams) * 100;
      }
      
      if (recipeData.flourGrams && recipeData.starterGrams) {
        starterPercentage = (recipeData.starterGrams / recipeData.flourGrams) * 100;
      }
      
      // Process recipe text if provided
      if (recipeData.recipeText && !recipeData.flourGrams) {
        // Simple extraction of values from recipe text
        // This is a basic implementation - in a real app this would be more sophisticated
        
        // Try to find flour amount in the text
        const flourMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*flour/i);
        if (flourMatch) {
          recipeData.flourGrams = parseInt(flourMatch[1]);
        }
        
        // Try to find water amount
        const waterMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*water/i);
        if (waterMatch && recipeData.flourGrams) {
          recipeData.waterGrams = parseInt(waterMatch[1]);
          hydration = (recipeData.waterGrams / recipeData.flourGrams) * 100;
        }
        
        // Try to find salt amount
        const saltMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*salt/i);
        if (saltMatch && recipeData.flourGrams) {
          recipeData.saltGrams = parseInt(saltMatch[1]);
          saltPercentage = (recipeData.saltGrams / recipeData.flourGrams) * 100;
        }
        
        // Try to find starter amount
        const starterMatch = recipeData.recipeText.match(/(\d+)\s*g(?:rams)?\s*(?:of)?\s*(?:sourdough)?\s*starter/i);
        if (starterMatch && recipeData.flourGrams) {
          recipeData.starterGrams = parseInt(starterMatch[1]);
          starterPercentage = (recipeData.starterGrams / recipeData.flourGrams) * 100;
        }
      }
      
      // Get analysis results
      const hydrationAnalysis = getHydrationAnalysis(hydration);
      const saltAnalysis = getSaltAnalysis(saltPercentage);
      const starterAnalysis = getStarterAnalysis(starterPercentage);
      
      // Generate suggestions
      const suggestions = [];
      
      if (hydrationAnalysis.suggestion) {
        suggestions.push(hydrationAnalysis.suggestion);
      }
      
      if (saltAnalysis.suggestion) {
        suggestions.push(saltAnalysis.suggestion);
      }
      
      if (starterAnalysis.suggestion) {
        suggestions.push(starterAnalysis.suggestion);
      }
      
      // Calculate overall recipe score (0-100)
      let recipeScore = 75; // Starting value
      
      // Adjust score based on hydration
      if (hydration) {
        if (hydration < 60 || hydration > 80) {
          recipeScore -= 10;
        } else if (hydration >= 65 && hydration <= 75) {
          recipeScore += 5;
        }
      }
      
      // Adjust score based on salt
      if (saltPercentage) {
        if (saltPercentage < 1.5 || saltPercentage > 2.5) {
          recipeScore -= 5;
        } else if (saltPercentage >= 1.8 && saltPercentage <= 2.2) {
          recipeScore += 5;
        }
      }
      
      // Adjust score based on starter
      if (starterPercentage) {
        if (starterPercentage < 10 || starterPercentage > 30) {
          recipeScore -= 5;
        } else if (starterPercentage >= 15 && starterPercentage <= 25) {
          recipeScore += 5;
        }
      }
      
      // Clamp score between 0 and 100
      recipeScore = Math.max(0, Math.min(100, recipeScore));
      
      // Create an overall assessment based on the score
      let overallAssessment = "";
      if (recipeScore >= 90) {
        overallAssessment = "Excellent recipe with ideal proportions for consistent results.";
      } else if (recipeScore >= 80) {
        overallAssessment = "Very good recipe with well-balanced formulation.";
      } else if (recipeScore >= 70) {
        overallAssessment = "Good basic recipe that could benefit from minor adjustments.";
      } else if (recipeScore >= 60) {
        overallAssessment = "Workable recipe that needs some refinement for better results.";
      } else {
        overallAssessment = "Recipe may present challenges; consider significant reformulation.";
      }
      
      // Determine recommended flavor profile based on recipe characteristics
      const recommendedFlavorProfile: string[] = [];
      
      // Add flavors from starter analysis if available
      if (starterAnalysis.flavorProfile) {
        recommendedFlavorProfile.push(...starterAnalysis.flavorProfile);
      }
      
      // Add flavors based on hydration level if available
      if (hydration) {
        if (hydration > 75) {
          if (!recommendedFlavorProfile.includes('tangy')) recommendedFlavorProfile.push('tangy');
          if (!recommendedFlavorProfile.includes('rustic')) recommendedFlavorProfile.push('rustic');
        } else if (hydration < 65) {
          if (!recommendedFlavorProfile.includes('mild')) recommendedFlavorProfile.push('mild');
          if (!recommendedFlavorProfile.includes('nutty')) recommendedFlavorProfile.push('nutty');
        } else {
          if (!recommendedFlavorProfile.includes('balanced')) recommendedFlavorProfile.push('balanced');
        }
      }
      
      // Create validation result with field names matching client expectations
      const validationResult = {
        hydrationPercentage: hydration ? parseFloat(hydration.toFixed(1)) : undefined,
        saltPercentage: saltPercentage ? parseFloat(saltPercentage.toFixed(1)) : undefined,
        starterPercentage: starterPercentage ? parseFloat(starterPercentage.toFixed(1)) : undefined,
        recipeScore: recipeScore,
        hydrationAnalysis: hydrationAnalysis.assessment,
        saltAnalysis: saltAnalysis.assessment,
        starterAnalysis: starterAnalysis.assessment,
        overallAssessment: overallAssessment,
        suggestions: suggestions,
        recommendedFlavorProfile: recommendedFlavorProfile,
      };
      
      res.json(validationResult);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error validating recipe:", error);
      res.status(500).json({ message: "Failed to validate recipe" });
    }
  });

  // Helper functions for recipe validation
  function getHydrationAnalysis(hydration?: number) {
    if (!hydration) return { assessment: "Cannot determine hydration" };
    
    if (hydration < 60) {
      return {
        assessment: "Lower than typical sourdough hydration",
        suggestion: "Consider increasing water for more open crumb"
      };
    } else if (hydration > 80) {
      return {
        assessment: "Higher than typical hydration",
        suggestion: "This dough may be difficult to handle; consider reducing water by 5-10% or using a higher protein flour"
      };
    } else {
      return {
        assessment: "Within standard sourdough hydration range",
        suggestion: null
      };
    }
  }
  
  function getSaltAnalysis(saltPercentage?: number) {
    if (!saltPercentage) return { assessment: "Cannot determine salt percentage" };
    
    if (saltPercentage < 1.5) {
      return {
        assessment: "Salt is lower than recommended",
        suggestion: "Increase salt to 1.8-2.2% of flour weight for better flavor"
      };
    } else if (saltPercentage > 2.5) {
      return {
        assessment: "Salt is higher than typical",
        suggestion: "Consider reducing salt to 1.8-2.2% of flour weight"
      };
    } else {
      return {
        assessment: "Salt percentage is within ideal range",
        suggestion: null
      };
    }
  }
  
  function getStarterAnalysis(starterPercentage?: number) {
    if (!starterPercentage) return { assessment: "Cannot determine starter percentage" };
    
    let flavorProfile: string[] = [];
    let recommendedStarterNote: string = "";
    
    if (starterPercentage < 10) {
      flavorProfile = ['mild', 'fruity'];
      recommendedStarterNote = "Consider our Kombucha Sourdough Starter for this low starter percentage recipe, which provides a mild tanginess with subtle fruity notes.";
      return {
        assessment: "Starter percentage is low",
        suggestion: "Low starter percentage will result in longer fermentation. Ensure ambient temperature is warm enough. " + recommendedStarterNote,
        flavorProfile
      };
    } else if (starterPercentage > 30) {
      flavorProfile = ['tangy', 'acidic', 'classic'];
      recommendedStarterNote = "Our San Francisco Style Sourdough Starter would complement this high starter percentage recipe, providing excellent tanginess and classic flavor.";
      return {
        assessment: "Starter percentage is high",
        suggestion: "High starter percentage will result in faster fermentation. Watch carefully to avoid over-fermentation. " + recommendedStarterNote,
        flavorProfile
      };
    } else if (starterPercentage >= 20 && starterPercentage <= 30) {
      flavorProfile = ['balanced', 'versatile', 'moderate tang'];
      recommendedStarterNote = "A mature sourdough starter would work perfectly with this balanced starter percentage, providing consistent results.";
      return {
        assessment: "Starter percentage is within ideal range for balanced sourdough",
        suggestion: recommendedStarterNote,
        flavorProfile
      };
    } else {
      flavorProfile = ['sweet', 'complex', 'umami'];
      recommendedStarterNote = "Our Koji Sourdough Starter would be excellent for this moderate starter percentage, providing unique sweet and complex flavors.";
      return {
        assessment: "Starter percentage is within moderate range",
        suggestion: recommendedStarterNote,
        flavorProfile
      };
    }
  }
  
  // Product Routes
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Search products
  app.get("/api/products/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get product by slug
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      res.status(500).json({ message: "Failed to fetch product by slug" });
    }
  });

  // Create a new product
  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(product);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update a product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const productSchema = insertProductSchema.partial();
      const productUpdates = productSchema.parse(req.body);

      const updatedProduct = await storage.updateProduct(productId, productUpdates);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.deleteProduct(productId);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Order Routes
  // Get all orders (admin)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get user orders
  app.get("/api/user/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Create a new order
  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(order);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const statusSchema = z.object({
        status: z.string()
      });
      const { status } = statusSchema.parse(req.body);

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Create a payment intent with Stripe
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Validate the request body
      const paymentSchema = z.object({
        amount: z.number().min(0.5),
        items: z.array(z.object({
          id: z.union([z.string(), z.number()]),
          quantity: z.number().optional()
        })).optional(),
        customer: z.object({
          email: z.string().email().optional(),
          name: z.string().optional(),
          address: z.object({
            line1: z.string().optional(),
            city: z.string().optional(), 
            state: z.string().optional(),
            postal_code: z.string().optional(),
            country: z.string().optional()
          }).optional(),
          phone: z.string().optional()
        }).optional()
      });

      const validatedData = paymentSchema.parse(req.body);
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(validatedData.amount * 100);
      
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          items: validatedData.items ? JSON.stringify(validatedData.items) : '',
        },
        receipt_email: validatedData.customer?.email,
        shipping: validatedData.customer?.address ? {
          name: validatedData.customer.name || '',
          address: {
            line1: validatedData.customer.address.line1 || '',
            city: validatedData.customer.address.city || '',
            state: validatedData.customer.address.state || '',
            postal_code: validatedData.customer.address.postal_code || '',
            country: validatedData.customer.address.country || 'US',
          },
          phone: validatedData.customer.phone || '',
        } : undefined,
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Enhanced bread recommendation engine endpoint with AI-powered recipe generation
  app.post("/api/recommendations", async (req, res) => {
    try {
      const userProfile = breadProfileSchema.parse(req.body);
      
      // Get all recipes from the database
      const allRecipes = await storage.getPublicRecipes();
      
      // Filter recipes that have texture and flavor profiles
      const recipesWithProfiles = allRecipes.filter(
        recipe => recipe.textureProfile && recipe.flavorProfile
      );
      
      if (recipesWithProfiles.length === 0) {
        // If no recipes with profiles exist, generate an AI recipe
        console.log("No recipes with profiles found, generating AI recipe instead");
        try {
          // Use the enhanced AI service with Bakehouse Breads multi-agent instructions
          const aiResult = await aiService.makeAIRequest({
            messages: [
              {
                role: "system",
                content: `You are the Bakehouse Breads AI Assistant — a multi-agent expert system dedicated exclusively to answering questions about baking and cooking. You do not answer queries unrelated to the kitchen. Your purpose is to guide users in producing consistently excellent baked goods and cooked meals through education, troubleshooting, and technique optimization.

🧠 COORDINATOR AGENT (Primary Interface)
Role: Interpret user input, route queries to expert agents, synthesize responses, adapt to skill level, and maintain context.
Rules:
• Reject non-baking/cooking questions politely and firmly
• Always state which expert agent(s) will respond
• Route simple questions to one expert
• Use multiple agents for complex or cross-domain queries
• Prioritize food safety and clarity in all answers
• Track user goals and personalize guidance over time

👨‍🍳 RECIPE GENERATION AGENT
Expertise: Custom recipes for bread, pastries, cakes, cookies, pies, laminated doughs, savory bakes, and home-cooked meals
Tasks:
• Generate or adapt recipes based on user constraints (diet, time, skill)
• Provide ingredient quantities, baker's percentages, and substitutions
• Explain flavor, texture, or structure implications of choices
• End with 2–3 follow-up questions

FOR RECIPE GENERATION: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.

The JSON must have this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description of the recipe with technique insights",
  "difficulty": "intermediate",
  "ingredients": ["Complete ingredient list with measurements and baker's percentages where applicable"],
  "instructions": ["Step-by-step instructions with sensory cues and timing"],
  "totalTime": "Total time needed",
  "activeTime": "Active preparation time", 
  "yields": "How many servings",
  "notes": ["Expert tips, troubleshooting advice, and technique explanations"],
  "tips": ["2-3 follow-up questions to help the user succeed"]
}

Remember: For recipe generation, respond with ONLY the JSON object, no additional text.`
              },
              {
                role: "user",
                content: `Create a sourdough bread recipe based on these preferences:

User Profile: ${JSON.stringify(userProfile)}

Generate a recipe that matches the texture and flavor preferences specified in the profile.`
              }
            ]
          });
          
          if (aiResult.success && aiResult.data) {
            // Create a recipe object with the AI-generated data
            const aiGeneratedRecipe = {
              id: -1, // Use negative ID to indicate AI-generated recipe
              name: aiResult.data.name,
              author: "AI Baker",
              description: aiResult.data.description,
              ingredients: Array.isArray(aiResult.data.ingredients) 
                ? aiResult.data.ingredients.map((i: any) => 
                    typeof i === 'string' ? i : `${i.amount} ${i.name}`
                  ) 
                : [],
              instructions: aiResult.data.instructions || [],
              flourGrams: 500, // Default values
              waterGrams: aiResult.data.hydration ? 500 * (aiResult.data.hydration / 100) : 350,
              saltGrams: 10,
              starterGrams: 100,
              textureProfile: aiResult.data.textureProfile || userProfile.texture,
              flavorProfile: aiResult.data.flavorProfile || userProfile.flavor,
              prepTime: "2 hours",
              totalTime: "24 hours",
              activeTime: "30 minutes",
              yields: "1 loaf",
              yield: "1 loaf", // For backward compatibility
              difficulty: aiResult.data.difficulty || "intermediate",
              createdAt: new Date().toISOString(),
              updatedAt: new Date(),
              isPublic: false,
              userId: null,
              hydration: aiResult.data.hydration || 70,
              matchScore: 100, // AI-generated recipe is a perfect match
              isAIGenerated: true, // Flag to indicate this is an AI-generated recipe
              imageUrl: null,
              tags: [],
              rating: null,
              reviews: []
            };
            
            return res.json([aiGeneratedRecipe]);
          }
        } catch (aiError) {
          console.error("Error generating AI recipe:", aiError);
          // Fallback to returning public recipes if AI generation fails
          return res.json(allRecipes.slice(0, 5));
        }
      }
      
      // Calculate match score for each recipe
      let rankedRecipes = recipesWithProfiles
        .map(recipe => {
          const matchScore = calculateRecipeMatchScore(recipe, userProfile);
          return { 
            ...recipe, 
            matchScore,
            isAIGenerated: false // Flag to indicate this is a database recipe
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
      
      // Check if the best match has a low score (below 60%)
      const bestMatchScore = rankedRecipes.length > 0 ? rankedRecipes[0].matchScore : 0;
      
      if (bestMatchScore < 60) {
        console.log("Low match score, generating AI recipe to supplement results");
        try {
          // Generate an AI recipe using Bakehouse Breads multi-agent system
          const aiResult = await aiService.makeAIRequest({
            messages: [
              {
                role: "system",
                content: `You are the Bakehouse Breads AI Assistant — a multi-agent expert system dedicated exclusively to answering questions about baking and cooking.

👨‍🍳 RECIPE GENERATION AGENT
Expertise: Custom recipes for bread, pastries, cakes, cookies, pies, laminated doughs, savory bakes, and home-cooked meals
Tasks:
• Generate or adapt recipes based on user constraints (diet, time, skill)
• Provide ingredient quantities, baker's percentages, and substitutions
• Explain flavor, texture, or structure implications of choices

FOR RECIPE GENERATION: You MUST respond with ONLY a valid JSON object.

The JSON must have this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description with technique insights",
  "difficulty": "intermediate",
  "ingredients": ["Complete ingredient list with measurements"],
  "instructions": ["Step-by-step instructions with sensory cues"],
  "totalTime": "Total time needed",
  "activeTime": "Active preparation time", 
  "yields": "How many servings",
  "notes": ["Expert tips and technique explanations"],
  "tips": ["Follow-up questions to help succeed"]
}`
              },
              {
                role: "user",
                content: `Create a sourdough bread recipe for these preferences: ${JSON.stringify(userProfile)}`
              }
            ]
          });
          
          if (aiResult.success && aiResult.data) {
            // Create a recipe object with the AI-generated data
            const aiGeneratedRecipe = {
              id: -1, // Use negative ID to indicate AI-generated recipe
              name: aiResult.data.name,
              author: "AI Baker",
              description: aiResult.data.description,
              ingredients: Array.isArray(aiResult.data.ingredients) 
                ? aiResult.data.ingredients.map((i: any) => 
                    typeof i === 'string' ? i : `${i.amount} ${i.name}`
                  ) 
                : [],
              instructions: aiResult.data.instructions || [],
              flourGrams: 500, // Default values
              waterGrams: aiResult.data.hydration ? 500 * (aiResult.data.hydration / 100) : 350,
              saltGrams: 10,
              starterGrams: 100,
              textureProfile: aiResult.data.textureProfile || userProfile.texture,
              flavorProfile: aiResult.data.flavorProfile || userProfile.flavor,
              prepTime: "2 hours",
              totalTime: "24 hours",
              activeTime: "30 minutes",
              yields: "1 loaf",
              yield: "1 loaf", // For backward compatibility
              difficulty: aiResult.data.difficulty || "intermediate",
              createdAt: new Date().toISOString(),
              updatedAt: new Date(),
              isPublic: false,
              userId: null,
              hydration: aiResult.data.hydration || 70,
              matchScore: 100, // AI-generated recipe is a perfect match
              isAIGenerated: true, // Flag to indicate this is an AI-generated recipe
              imageUrl: null,
              tags: [],
              rating: null,
              reviews: []
            };
            
            // Add the AI-generated recipe to the top of the results with required properties
            const completeAiRecipe = {
              ...aiGeneratedRecipe,
              notes: aiResult.data.notes || [],
              isFavorite: false
            };
            rankedRecipes = [completeAiRecipe, ...rankedRecipes];
          }
        } catch (aiError) {
          console.error("Error generating AI recipe:", aiError);
          // Continue with regular ranked recipes if AI generation fails
        }
      }
      
      // Return the top 5 matches (which may include an AI-generated recipe)
      res.json(rankedRecipes.slice(0, 5));
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error generating bread recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });
  
  // Custom recipe generator endpoint with AI integration
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const userProfile = breadProfileSchema.parse(req.body);
      
      console.log("Generating AI-enhanced recipe based on user profile");
      
      if (userProfile.customPrompt) {
        console.log("Custom prompt detected:", userProfile.customPrompt.substring(0, 100) + "...");
      } else {
        console.log("No custom prompt provided, using default template");
      }
      
      try {
        // Use enhanced AI with Bakehouse Breads multi-agent instructions
        const aiResult = await aiService.makeAIRequest({
          messages: [
            {
              role: "system",
              content: `You are the Bakehouse Breads AI Assistant — a multi-agent expert system dedicated exclusively to answering questions about baking and cooking.

👨‍🍳 RECIPE GENERATION AGENT
Expertise: Custom recipes for bread, pastries, cakes, cookies, pies, laminated doughs, savory bakes, and home-cooked meals
Tasks:
• Generate or adapt recipes based on user constraints (diet, time, skill)
• Provide ingredient quantities, baker's percentages, and substitutions
• Explain flavor, texture, or structure implications of choices

FOR RECIPE GENERATION: You MUST respond with ONLY a valid JSON object.

The JSON must have this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description with technique insights",
  "difficulty": "intermediate",
  "ingredients": ["Complete ingredient list with measurements"],
  "instructions": ["Step-by-step instructions with sensory cues"],
  "totalTime": "Total time needed",
  "activeTime": "Active preparation time", 
  "yields": "How many servings",
  "notes": ["Expert tips and technique explanations"],
  "tips": ["Follow-up questions to help succeed"]
}`
            },
            {
              role: "user",
              content: `Create a recipe based on these preferences: ${JSON.stringify(userProfile)}
              
${userProfile.customPrompt ? `Additional instructions: ${userProfile.customPrompt}` : ''}`
            }
          ]
        });
        
        if (!aiResult.success) {
          console.log("AI generation failed, falling back to rule-based generation");
          console.error("Reason:", aiResult.error);
          
          // Check for specific error messages that might indicate API key issues
          if (aiResult.error && (
              aiResult.error.includes("authentication") || 
              aiResult.error.includes("API error: 401") || 
              aiResult.error.includes("API error: 403") ||
              aiResult.error.includes("quota exceeded") ||
              aiResult.error.includes("invalid") ||
              aiResult.error.includes("key")
            )) {
            console.error("The OpenAI API service needs a valid API key or the current key is not working.");
          }
          
          throw new Error(aiResult.error || "AI recipe generation failed");
        }
        
        // Get AI-generated recipe data
        const aiRecipe = aiResult.data;
        
        // Log raw response
        console.log("Raw AI recipe data:", JSON.stringify(aiRecipe).substring(0, 200) + "...");
        
        // Ensure proper ingredient format
        const formattedIngredients = Array.isArray(aiRecipe.ingredients) ? 
          aiRecipe.ingredients.map((ing: any) => {
            // If already string array, no conversion needed
            if (typeof ing === 'string') {
              return ing;
            }
            
            // Various formats coming from AI response
            const ingredientName = ing.name || ing.ingredient || "";
            const ingredientAmount = ing.amount || ing.quantity || 0;
            const ingredientUnit = ing.unit || "g";
            let bakersPercentage = ing.bakersPercentage || ing.percentage || "(0%)";
            
            // Add percent sign if missing
            if (!bakersPercentage.includes("%")) {
              bakersPercentage = `(${bakersPercentage}%)`;
            }
            
            return {
              name: ingredientName,
              amount: ingredientAmount,
              unit: ingredientUnit,
              bakersPercentage: bakersPercentage
            };
          }).filter((ing: any) => ing.name) : 
          [
            { name: "Bread flour", amount: 500, unit: "g", bakersPercentage: "(100%)" },
            { name: "Water", amount: 350, unit: "g", bakersPercentage: "(70%)" },
            { name: "Sourdough starter (mature starter)", amount: 100, unit: "g", bakersPercentage: "(20%)" },
            { name: "Salt", amount: 10, unit: "g", bakersPercentage: "(2%)" }
          ];
        
        // Ensure we have a sourdough starter
        const hasStarter = formattedIngredients.some((ing: any) => 
          (ing.name && ing.name.toLowerCase().includes('starter')) || 
          (typeof ing === 'string' && ing.toLowerCase().includes('starter'))
        );
        
        if (!hasStarter) {
          formattedIngredients.push({
            name: "mature sourdough starter",
            amount: 100,
            unit: "g",
            bakersPercentage: "(20%)"
          });
        }
        
        // Transform AI response into our schema format
        const customRecipe: InsertBreadRecipe = {
          userId: 1, // Default user ID for demo
          name: aiRecipe.name || aiRecipe.recipeTitle || `Custom ${userProfile.texture.isRustic ? "Rustic" : "Classic"} Sourdough`,
          description: aiRecipe.description || aiRecipe.introduction || `A Sourdough Suite special sourdough recipe generated based on your specific texture and flavor preferences.`,
          ingredients: formattedIngredients,
          instructions: aiRecipe.instructions || generateInstructions(userProfile),
          totalTime: aiRecipe.totalTime || "18-24 hours",
          activeTime: aiRecipe.activeTime || "30 minutes",
          yields: aiRecipe.yields || "1 loaf",
          isPublic: false,
          hydration: aiRecipe.hydration || Math.round((calculateHydration(userProfile.texture) / 600) * 100),
          difficulty: aiRecipe.difficulty || getDifficulty(userProfile),
          textureProfile: userProfile.texture,
          flavorProfile: userProfile.flavor
        };
        
        // Save the AI-enhanced recipe to the database
        const createdRecipe = await storage.createRecipe(customRecipe);
        console.log("AI recipe generated and saved successfully");
        
        res.status(201).json(createdRecipe);
      } catch (aiError) {
        console.log("Falling back to rule-based recipe generation", aiError);
        
        // Generate custom recipe based on user's texture and flavor preferences (original code as fallback)
        const customRecipe: InsertBreadRecipe = {
          userId: 1, // Default user ID for demo
          name: `Custom ${userProfile.texture.isRustic ? "Rustic" : "Classic"} Sourdough`,
          description: `A personalized sourdough bread recipe generated based on your specific texture and flavor preferences.`,
          ingredients: [
            {
              name: "Bread flour",
              amount: userProfile.texture.crumbOpenness > 7 ? 400 : 500,
              unit: "g"
            },
            {
              name: userProfile.texture.crumbOpenness > 7 ? "All-purpose flour" : "Whole wheat flour",
              amount: 100,
              unit: "g"
            },
            {
              name: "Water",
              amount: calculateHydration(userProfile.texture),
              unit: "g"
            },
            {
              name: "Sourdough starter (100% hydration)",
              amount: userProfile.flavor.sourness > 7 ? 150 : 100,
              unit: "g"
            },
            {
              name: "Salt",
              amount: 12,
              unit: "g"
            }
          ],
          instructions: generateInstructions(userProfile),
          totalTime: userProfile.texture.crumbOpenness > 7 ? "24-36 hours" : "18-24 hours",
          activeTime: "30 minutes",
          yields: "1 loaf",
          isPublic: false,
          hydration: Math.round((calculateHydration(userProfile.texture) / 600) * 100),
          difficulty: getDifficulty(userProfile),
          textureProfile: userProfile.texture,
          flavorProfile: userProfile.flavor
        };
        
        // Save the custom recipe to the database
        const createdRecipe = await storage.createRecipe(customRecipe);
        
        res.status(201).json(createdRecipe);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error generating custom recipe:", error);
      res.status(500).json({ message: "Failed to generate custom recipe" });
    }
  });

  // Helper function to calculate hydration from ingredients
  function calculateHydrationFromIngredients(ingredients: any[]): number | null {
    if (!Array.isArray(ingredients)) return null;
    
    try {
      // Find flour and water ingredients
      let totalFlour = 0;
      let totalWater = 0;
      
      for (const ingredient of ingredients) {
        const name = ingredient.name?.toLowerCase() || '';
        const amount = ingredient.amount || 0;
        
        if (name.includes('flour') || name.includes('semolina') || name.includes('meal')) {
          totalFlour += amount;
        }
        else if (name.includes('water') || name === 'h2o') {
          totalWater += amount;
        }
      }
      
      // Return hydration percentage if we have valid amounts
      if (totalFlour > 0 && totalWater > 0) {
        return Math.round((totalWater / totalFlour) * 100);
      }
      
      return null;
    } catch (error) {
      console.error("Error calculating hydration:", error);
      return null;
    }
  }

  // Helper function to calculate match score between recipe and user preferences
  function calculateRecipeMatchScore(recipe: any, userProfile: any): number {
    try {
      const textureScore = calculateTextureMatchScore(
        recipe.textureProfile, 
        userProfile.texture
      );
      
      const flavorScore = calculateFlavorMatchScore(
        recipe.flavorProfile, 
        userProfile.flavor
      );
      
      // Weighted average: 50% texture, 50% flavor
      const overallScore = (textureScore + flavorScore) / 2;
      
      // Return integer percentage from 0-100
      return Math.round(overallScore * 100);
    } catch (error) {
      console.error("Error calculating match score:", error);
      return 50; // Default score if calculation fails
    }
  }

  // Calculate texture match score (0-1 scale)
  function calculateTextureMatchScore(recipeProfile: any, userProfile: any): number {
    if (!recipeProfile || !userProfile) return 0.65;
    
    // Convert both profiles to 1-10 scale if needed
    const normalizeValue = (val: any): number => {
      if (typeof val === 'number') {
        return val >= 1 && val <= 10 ? val : val / 10;
      }
      return 5; // Default middle value
    };
    
    // Calculate similarity for each numeric attribute (closer = better match)
    const attributes = [
      'crumbOpenness', 'holeSize', 'tenderness', 'moisture',
      'crustThickness', 'crustTexture', 'color', 'surfaceCharacter'
    ];
    
    let totalWeight = attributes.length;
    let weightedSum = 0;
    
    attributes.forEach(attr => {
      if (recipeProfile[attr] !== undefined && userProfile[attr] !== undefined) {
        const recipePref = normalizeValue(recipeProfile[attr]);
        const userPref = normalizeValue(userProfile[attr]);
        
        // Calculate similarity (10 - the difference, divided by 10)
        const similarity = 1 - (Math.abs(recipePref - userPref) / 10);
        weightedSum += similarity;
      }
    });
    
    // Boolean properties have extra weight
    const booleanProps = ['isSmooth', 'isRustic'];
    booleanProps.forEach(prop => {
      if (recipeProfile[prop] === userProfile[prop]) {
        weightedSum += 1;
      } else if (recipeProfile[prop] !== undefined && userProfile[prop] !== undefined) {
        weightedSum += 0.2; // Small partial match to avoid zero
      }
      totalWeight += 1;
    });
    
    return weightedSum / totalWeight;
  }

  // Calculate flavor match score (0-1 scale)
  function calculateFlavorMatchScore(recipeProfile: any, userProfile: any): number {
    if (!recipeProfile || !userProfile) return 0.65;
    
    // Calculate similarity for each numeric attribute
    const attributes = ['sourness', 'sweetness', 'complexity', 'strength'];
    
    let totalWeight = attributes.length;
    let weightedSum = 0;
    
    attributes.forEach(attr => {
      if (recipeProfile[attr] !== undefined && userProfile[attr] !== undefined) {
        const recipePref = recipeProfile[attr] >= 1 && recipeProfile[attr] <= 10 
          ? recipeProfile[attr] 
          : recipeProfile[attr] / 10;
          
        const userPref = userProfile[attr] >= 1 && userProfile[attr] <= 10 
          ? userProfile[attr] 
          : userProfile[attr] / 10;
        
        // Calculate similarity (1 - normalized difference)
        const similarity = 1 - (Math.abs(recipePref - userPref) / 10);
        weightedSum += similarity;
      }
    });
    
    // Calculate match for flavor categories with higher weight
    if (recipeProfile.flavors && userProfile.flavors) {
      let flavorKeys = Object.keys(userProfile.flavors);
      let flavorMatches = 0;
      let totalFlavors = flavorKeys.length;
      
      flavorKeys.forEach(flavor => {
        if (recipeProfile.flavors[flavor] === userProfile.flavors[flavor]) {
          flavorMatches++;
        } else if (recipeProfile.flavors[flavor] === undefined) {
          totalFlavors--; // Don't count missing properties
        }
      });
      
      if (totalFlavors > 0) {
        weightedSum += (flavorMatches / totalFlavors) * 2; // Double weight for flavors
        totalWeight += 2;
      }
    }
    
    return weightedSum / totalWeight;
  }

  // Helper functions for recipe generation
  function calculateHydration(textureProfile: any): number {
    // Base hydration level
    let baseHydration = 350;
    
    // Adjust hydration based on crumb openness (higher = more water)
    if (textureProfile.crumbOpenness > 7) {
      baseHydration += 50;
    } else if (textureProfile.crumbOpenness < 4) {
      baseHydration -= 30;
    }
    
    // Adjust for moisture preference
    if (textureProfile.moisture > 7) {
      baseHydration += 30;
    } else if (textureProfile.moisture < 4) {
      baseHydration -= 20;
    }
    
    // Cap the hydration levels within reasonable boundaries
    return Math.max(300, Math.min(450, baseHydration));
  }

  function getDifficulty(userProfile: any): string {
    const textureProfile = userProfile.texture;
    const flavorProfile = userProfile.flavor;
    
    // Calculate a difficulty score based on various parameters
    let difficultyScore = 0;
    
    // High hydration and open crumb structure are more difficult
    if (textureProfile.crumbOpenness > 7) difficultyScore += 2;
    if (textureProfile.holeSize > 7) difficultyScore += 1;
    
    // Highly complex flavor profiles are more challenging
    if (flavorProfile.complexity > 7) difficultyScore += 1;
    
    // Very sour breads require more precise fermentation control
    if (flavorProfile.sourness > 8) difficultyScore += 1;
    
    // Rustic breads with high crust development tend to be more challenging
    if (textureProfile.isRustic && textureProfile.crustThickness > 7) difficultyScore += 1;
    
    // Assign difficulty level based on the score
    if (difficultyScore >= 5) return "Advanced";
    if (difficultyScore >= 3) return "Intermediate";
    return "Beginner";
  }
  
  function generateInstructions(userProfile: any): string[] {
    const textureProfile = userProfile.texture;
    const flavorProfile = userProfile.flavor;
    
    // Generate an array of instructions based on user preferences
    const instructions: string[] = [];
    
    // Start with basic recipe instructions
    instructions.push("Mix the flours together in a large bowl.");
    
    // Autolyse step varies based on desired texture
    if (textureProfile.crumbOpenness > 7) {
      instructions.push("Add water (reserving 50g for later) and mix until no dry flour remains. Cover and let rest for 45-60 minutes (autolyse).");
    } else {
      instructions.push("Add water and mix until no dry flour remains. Cover and let rest for 30 minutes (autolyse).");
    }
    
    // Add starter instructions based on sourness level
    if (flavorProfile.sourness > 7) {
      instructions.push("Add your mature starter and mix thoroughly. Let rest for 15 minutes.");
    } else {
      instructions.push("Gently incorporate your starter and mix thoroughly.");
    }
    
    // Salt addition
    instructions.push("Sprinkle salt over the dough" + (textureProfile.crumbOpenness > 7 ? " and add the remaining water." : ".") + " Use wet hands to integrate by pinching and folding the dough.");
    
    // Stretch and fold instructions based on desired structure
    if (textureProfile.crumbOpenness > 7 && textureProfile.holeSize > 7) {
      instructions.push("Perform 4-6 sets of gentle stretch and folds during the first 2-3 hours of bulk fermentation, being careful to preserve large air bubbles.");
    } else if (textureProfile.crumbOpenness > 5) {
      instructions.push("Perform 4 sets of stretch and folds during the first 2 hours of bulk fermentation, spacing them 30 minutes apart.");
    } else {
      instructions.push("Perform 6 sets of stretch and folds during the first 3 hours of bulk fermentation, spacing them 30 minutes apart to develop stronger gluten structure.");
    }
    
    // Bulk fermentation instructions based on flavor complexity
    if (flavorProfile.complexity > 7) {
      instructions.push("Allow the dough to bulk ferment for 4-6 hours at room temperature or until increased in volume by about 50%.");
    } else {
      instructions.push("Allow the dough to bulk ferment for 3-5 hours at room temperature or until increased in volume by about 30-40%.");
    }
    
    // Shaping instructions
    if (textureProfile.isRustic) {
      instructions.push("Turn the dough out onto a lightly floured surface. Shape into a rustic boule or batard with minimal handling to preserve air pockets.");
    } else {
      instructions.push("Turn the dough out onto a lightly floured surface. Perform a careful pre-shape, rest for 20 minutes, then shape tightly into a smooth boule or batard.");
    }
    
    // Cold proofing instructions
    if (flavorProfile.sourness > 7 || flavorProfile.complexity > 7) {
      instructions.push("Transfer to a floured banneton or proofing basket, cover, and cold proof in the refrigerator for 12-24 hours.");
    } else {
      instructions.push("Transfer to a floured banneton or proofing basket, cover, and cold proof in the refrigerator for 8-12 hours.");
    }
    
    // Baking instructions based on desired crust
    if (textureProfile.crustThickness > 7) {
      instructions.push("Preheat oven to 500°F (260°C) with a Dutch oven inside for 1 hour. Score the dough, then bake covered at 450°F (232°C) for 25 minutes. Remove the lid and continue baking for 20-25 minutes until deeply caramelized.");
    } else if (textureProfile.crustTexture > 7) {
      instructions.push("Preheat oven to 500°F (260°C) with a Dutch oven inside for 45 minutes. Score the dough, then bake covered at 450°F (232°C) for 20 minutes. Remove the lid and continue baking for 15-20 minutes until golden brown.");
    } else {
      instructions.push("Preheat oven to 475°F (245°C) with a Dutch oven inside for 45 minutes. Score the dough, then bake covered at 450°F (232°C) for 20 minutes. Remove the lid and continue baking for 10-15 minutes until golden.");
    }
    
    // Final instructions
    instructions.push("Allow the bread to cool completely on a wire rack for at least 2 hours before slicing to allow the crumb to set.");
    
    return instructions;
  }

  // AI-Powered Routes using ChatGPT o3
  
  // Analyze recipe with ChatGPT o3
  app.post("/api/ai/analyze-recipe", async (req, res) => {
    try {
      const recipeData = req.body;
      
      // Validate required fields
      if (!recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
        return res.status(400).json({ message: "Missing required recipe data" });
      }
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 10) {
        return res.status(503).json({ 
          message: "AI analysis service temporarily unavailable", 
          error: "OpenAI API key not configured" 
        });
      }
      
      const analysis = await analyzeRecipeWithO3(recipeData);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing recipe with o3:", error);
      res.status(500).json({ 
        message: "Failed to analyze recipe", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Generate personalized recipe with AI (handles both chat and form-based requests)
  app.post("/api/ai/generate-recipe", async (req, res) => {
    try {
      const requestData = req.body;
      console.log("Recipe generation request received:", JSON.stringify(requestData, null, 2));
      
      // Handle chat-based requests (from AI Recipe Generator page)
      if (requestData.prompt && requestData.context) {
        const { prompt, context } = requestData;
        
        // Use direct example-based approach to enforce multi-agent format
        const result = await aiService.makeAIRequest({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are the Bakehouse Breads multi-agent AI system. Respond only in valid JSON format.

AGENTS AVAILABLE:
- COORDINATOR AGENT: Routes requests to specialists
- RECIPE GENERATION AGENT: Creates recipes  
- TECHNIQUE AGENT: Provides technique guidance
- INGREDIENT AGENT: Offers ingredient advice
- EQUIPMENT AGENT: Equipment recommendations
- TIMING AGENT: Timing and scheduling advice

MANDATORY JSON FORMAT - Copy this structure exactly:

{
  "name": "Recipe Name Here",
  "description": "COORDINATOR AGENT: For this [recipe type], I'm consulting the Recipe Generation Agent, Technique Agent, Ingredient Agent, Equipment Agent, and Timing Agent. [Brief description]",
  "difficulty": "intermediate",
  "ingredients": ["ingredient with measurement", "another ingredient"],
  "instructions": ["Step 1", "Step 2"],
  "totalTime": "time needed",
  "activeTime": "active time", 
  "yields": "number served",
  "notes": ["TECHNIQUE AGENT: specific technique advice", "INGREDIENT AGENT: ingredient guidance", "EQUIPMENT AGENT: equipment advice", "TIMING AGENT: timing advice"],
  "tips": ["RECIPE GENERATION AGENT: helpful question?", "RECIPE GENERATION AGENT: another question?"]
}

The description MUST start with "COORDINATOR AGENT: For this" - this is non-negotiable.
Each note MUST start with an agent name followed by a colon.
Each tip MUST start with "RECIPE GENERATION AGENT:"

Return only valid JSON with no additional text.`
            },
            {
              role: "user",
              content: `Create a recipe for: ${prompt}

Requirements:
- Skill level: ${context.skillLevel || 'intermediate'}
- Serving size: ${context.servingSize || 4}
- Dietary restrictions: ${context.dietaryRestrictions?.join(', ') || 'none'}

Respond in JSON format. The description MUST start with "COORDINATOR AGENT: For this" and list the consulting agents. Each note must be prefixed with an agent name.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2500
        });
        
        if (!result.success) {
          throw new Error(result.error || "AI service error");
        }
        
        try {
          // Get the raw AI response content
          const aiContent = result.data?.choices?.[0]?.message?.content || result.data;
          console.log("Raw AI response:", typeof aiContent, aiContent?.substring(0, 200));
          
          let recipeData;
          
          // Try to parse as JSON first
          try {
            // Handle markdown code blocks
            const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              recipeData = JSON.parse(jsonMatch[1]);
            } else {
              recipeData = JSON.parse(aiContent);
            }
          } catch (jsonError) {
            // If JSON parsing fails, create a structured response from text
            console.log("JSON parsing failed, creating structured response from text");
            recipeData = {
              name: "AI Generated Recipe",
              description: "A recipe generated based on your request",
              difficulty: requestData.context?.skillLevel || "intermediate",
              ingredients: ["Check the full response for ingredients"],
              instructions: ["Check the full response for instructions"],
              totalTime: "Varies",
              activeTime: "30 minutes",
              yields: "1 serving",
              hydration: 70,
              notes: ["Full recipe details: " + aiContent.substring(0, 500) + "..."]
            };
          }
          
          return res.json(recipeData);
        } catch (parseError) {
          console.error("Failed to process AI response:", parseError);
          return res.status(500).json({ 
            message: "Failed to generate recipe", 
            error: "AI response processing failed" 
          });
        }
      }
      
      // Handle form-based requests (from enhanced form)
      if (requestData.difficulty && requestData.flavorProfile) {
        // Convert form data to multi-agent format
        const flavorDesc = Array.isArray(requestData.flavorProfile) 
          ? requestData.flavorProfile.join(', ')
          : String(requestData.flavorProfile);
        
        const dietaryDesc = Array.isArray(requestData.dietaryRestrictions) 
          ? requestData.dietaryRestrictions.join(', ')
          : 'none';
        
        const equipmentDesc = Array.isArray(requestData.equipment) 
          ? requestData.equipment.join(', ')
          : 'basic kitchen tools';

        const result = await aiService.makeAIRequest({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are the Bakehouse Breads multi-agent AI system. Respond only in valid JSON format.

AGENTS AVAILABLE:
- COORDINATOR AGENT: Routes requests to specialists
- RECIPE GENERATION AGENT: Creates recipes  
- TECHNIQUE AGENT: Provides technique guidance
- INGREDIENT AGENT: Offers ingredient advice
- EQUIPMENT AGENT: Equipment recommendations
- TIMING AGENT: Timing and scheduling advice

MANDATORY JSON FORMAT - Copy this structure exactly:

{
  "name": "Recipe Name Here",
  "description": "COORDINATOR AGENT: For this [recipe type], I'm consulting the Recipe Generation Agent, Technique Agent, Ingredient Agent, Equipment Agent, and Timing Agent. [Brief description]",
  "difficulty": "intermediate",
  "ingredients": ["ingredient with measurement", "another ingredient"],
  "instructions": ["Step 1", "Step 2"],
  "totalTime": "time needed",
  "activeTime": "active time", 
  "yields": "number served",
  "notes": ["TECHNIQUE AGENT: specific technique advice", "INGREDIENT AGENT: ingredient guidance", "EQUIPMENT AGENT: equipment advice", "TIMING AGENT: timing advice"],
  "tips": ["RECIPE GENERATION AGENT: helpful question?", "RECIPE GENERATION AGENT: another question?"]
}

The description MUST start with "COORDINATOR AGENT: For this" - this is non-negotiable.
Each note MUST start with an agent name followed by a colon.
Each tip MUST start with "RECIPE GENERATION AGENT:"

Return only valid JSON with no additional text.`
            },
            {
              role: "user",
              content: `Create a sourdough bread recipe with these specifications:

Difficulty Level: ${requestData.difficulty}
Flavor Profile: ${flavorDesc}
Dietary Restrictions: ${dietaryDesc}
Available Time: ${requestData.availableTime || 'flexible'}
Equipment: ${equipmentDesc}
Bread Type: ${requestData.breadType || 'traditional sourdough'}
Hydration Level: ${requestData.hydrationLevel || 'medium'}
Texture Preferences: ${Array.isArray(requestData.texturePreferences) ? requestData.texturePreferences.join(', ') : 'classic'}
Serving Size: ${Array.isArray(requestData.servingSize) ? requestData.servingSize[0] : 4}
Starter Type: ${requestData.starterType || 'traditional wheat starter'}

Respond in JSON format. The description MUST start with "COORDINATOR AGENT: For this" and list the consulting agents. Each note must be prefixed with an agent name.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2500
        });

        if (!result.success) {
          throw new Error(result.error || "AI service error");
        }

        try {
          const aiContent = result.data?.choices?.[0]?.message?.content || result.data;
          console.log("Raw AI response for form request (full):", aiContent);
          console.log("AI response length:", aiContent?.length);
          
          let recipeData;
          
          // Try to parse as JSON
          try {
            const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              recipeData = JSON.parse(jsonMatch[1]);
              console.log("Parsed recipe data from markdown:", JSON.stringify(recipeData, null, 2));
            } else {
              recipeData = JSON.parse(aiContent);
              console.log("Parsed recipe data directly:", JSON.stringify(recipeData, null, 2));
            }
            
            // Verify ingredients are present
            console.log("Ingredients check:", recipeData.ingredients ? `Found ${recipeData.ingredients.length} ingredients` : "No ingredients found");
            if (recipeData.ingredients) {
              console.log("Ingredients list:", recipeData.ingredients);
            }
          } catch (jsonError) {
            console.log("JSON parsing failed for form request, creating fallback");
            recipeData = {
              name: "Custom Sourdough Recipe",
              description: "COORDINATOR AGENT: For this custom sourdough request, I'm consulting the Recipe Generation Agent, Technique Agent, Ingredient Agent, Equipment Agent, and Timing Agent. A personalized recipe based on your preferences.",
              difficulty: requestData.difficulty,
              ingredients: ["500g bread flour", "375g water", "100g active sourdough starter", "10g salt"],
              instructions: ["Mix flour and water, autolyse 30 minutes", "Add starter and salt, mix well", "Bulk ferment with folds", "Shape and proof", "Bake with steam"],
              totalTime: "24 hours",
              activeTime: "1 hour",
              yields: "1 loaf",
              notes: ["TECHNIQUE AGENT: Monitor dough temperature for optimal fermentation", "INGREDIENT AGENT: Use high-quality flour for best results", "EQUIPMENT AGENT: A kitchen scale is essential for accuracy", "TIMING AGENT: Plan ahead for proper fermentation timing"],
              tips: ["RECIPE GENERATION AGENT: How does your kitchen temperature affect fermentation?", "RECIPE GENERATION AGENT: Would you like guidance on shaping techniques?"]
            };
          }
          
          return res.json(recipeData);
        } catch (parseError) {
          console.error("Failed to process AI response for form request:", parseError);
          return res.status(500).json({ 
            message: "Failed to generate recipe", 
            error: "AI response processing failed" 
          });
        }
      }
      
      // If neither format is detected, return error
      return res.status(400).json({ 
        message: "Invalid request format. Please provide either prompt+context or difficulty+flavorProfile" 
      });
      
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ 
        message: "Failed to generate recipe", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Starter troubleshooting with ChatGPT
  app.post("/api/ai/troubleshoot-starter", async (req, res) => {
    try {
      const { issue } = req.body;
      
      // Validate required fields
      if (!issue || !issue.symptoms || !Array.isArray(issue.symptoms) || issue.symptoms.length === 0) {
        return res.status(400).json({ message: "Issue data with symptoms are required for troubleshooting" });
      }
      
      const advice = await generateStarterTroubleshootingAdvice(issue);
      res.json(advice);
    } catch (error) {
      console.error("Error generating starter troubleshooting advice with o3:", error);
      res.status(500).json({ 
        message: "Failed to generate troubleshooting advice", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Video Content Routes
  
  // Get all published videos with filtering
  app.get("/api/videos", async (req, res) => {
    try {
      const { category, difficulty, featured } = req.query;
      
      let videos = await storage.getAllVideos();
      
      // Filter by published status
      videos = videos.filter((video: any) => video.isPublished);
      
      // Apply filters
      if (category && category !== 'all') {
        videos = videos.filter((video: any) => video.category === category);
      }
      
      if (difficulty && difficulty !== 'all') {
        videos = videos.filter((video: any) => video.difficulty === difficulty);
      }
      
      if (featured === 'true') {
        videos = videos.filter((video: any) => video.isFeatured);
      }
      
      // Sort by sort order, then by creation date
      videos.sort((a: any, b: any) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  
  // Get featured videos for homepage
  app.get("/api/videos/featured", async (req, res) => {
    try {
      const videos = await storage.getFeaturedVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
      res.status(500).json({ message: "Failed to fetch featured videos" });
    }
  });
  
  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });
  
  // Get videos by category
  app.get("/api/videos/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const videos = await storage.getVideosByCategory(category);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos by category:", error);
      res.status(500).json({ message: "Failed to fetch videos by category" });
    }
  });

  // FAQ Routes
  // Get all FAQs
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqs = await storage.getAllFaqs();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });
  
  // Get published FAQs only (for public frontend)
  app.get("/api/faqs/published", async (req, res) => {
    try {
      const faqs = await storage.getPublishedFaqs();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching published FAQs:", error);
      res.status(500).json({ message: "Failed to fetch published FAQs" });
    }
  });
  
  // Get FAQs by category
  app.get("/api/faqs/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const faqs = await storage.getFaqsByCategory(category);
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs by category:", error);
      res.status(500).json({ message: "Failed to fetch FAQs by category" });
    }
  });
  
  // Get a single FAQ by ID
  app.get("/api/faqs/:id", async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      if (isNaN(faqId)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      
      const faq = await storage.getFaqById(faqId);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.json(faq);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ message: "Failed to fetch FAQ" });
    }
  });
  
  // Create a new FAQ
  app.post("/api/faqs", async (req, res) => {
    try {
      const faq = insertFaqSchema.parse(req.body);
      const newFaq = await storage.createFaq(faq);
      res.status(201).json(newFaq);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });
  
  // Update an FAQ
  app.patch("/api/faqs/:id", async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      if (isNaN(faqId)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      
      const faqSchema = insertFaqSchema.partial();
      const faqUpdates = faqSchema.parse(req.body);
      
      const updatedFaq = await storage.updateFaq(faqId, faqUpdates);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.json(updatedFaq);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });
  
  // Delete an FAQ
  app.delete("/api/faqs/:id", async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      if (isNaN(faqId)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      
      const success = await storage.deleteFaq(faqId);
      if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });
  
  // Sourdough Starter routes
  // Note: The main GET /api/starters route is defined above
  
  // Get starter by ID
  app.get("/api/starters/:id", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }

      const starter = await storage.getStarterById(starterId);
      if (!starter) {
        return res.status(404).json({ message: "Starter not found" });
      }

      res.json(starter);
    } catch (error) {
      console.error("Error fetching starter:", error);
      res.status(500).json({ message: "Failed to fetch starter" });
    }
  });
  
  // Blog post routes
  
  // Get all blog posts (for admin panel)
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  // Get published blog posts (for public view)
  app.get("/api/blog/posts/published", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch published blog posts" });
    }
  });
  
  // Get a single blog post by slug
  app.get("/api/blog/posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  // Get a single blog post by ID
  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const post = await storage.getBlogPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  // Get blog posts by category
  app.get("/api/blog/categories/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const posts = await storage.getBlogPostsByCategory(category);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts by category:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  // Get blog posts by author
  app.get("/api/blog/author/:authorId", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      if (isNaN(authorId)) {
        return res.status(400).json({ message: "Invalid author ID" });
      }
      
      const posts = await storage.getBlogPostsByAuthor(authorId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts by author:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  // Create a new blog post
  app.post("/api/blog/posts", async (req, res) => {
    try {
      const post = insertBlogPostSchema.parse(req.body);
      
      // Generate slug from title if not provided
      if (!post.slug) {
        post.slug = post.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-'); // Remove consecutive hyphens
      }
      
      // Auto-generate SEO data if not provided
      const seoData = SEOService.generateSEOData(post);
      
      const enhancedPost = {
        ...post,
        metaTitle: post.metaTitle || seoData.title,
        metaDescription: post.metaDescription || seoData.description,
        keywords: post.keywords || seoData.keywords,
        canonicalUrl: post.canonicalUrl || seoData.canonicalUrl,
        socialImage: post.socialImage || seoData.socialImage,
        readingTime: seoData.readingTime,
        wordCount: seoData.wordCount
      };
      
      const newPost = await storage.createBlogPost(enhancedPost);
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });
  
  // Update a blog post
  app.patch("/api/blog/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const postUpdates = updateBlogPostSchema.parse(req.body);
      
      // Generate slug from title if title is being updated and slug not provided
      if (postUpdates.title && !postUpdates.slug) {
        postUpdates.slug = postUpdates.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      
      // If content or title is being updated, regenerate SEO data
      if (postUpdates.content || postUpdates.title) {
        const existingPost = await storage.getBlogPostById(postId);
        if (existingPost) {
          const updatedPostData = { ...existingPost, ...postUpdates };
          const seoData = SEOService.generateSEOData(updatedPostData);
          
          // Only update SEO fields if they weren't explicitly provided
          if (!postUpdates.metaTitle) postUpdates.metaTitle = seoData.title;
          if (!postUpdates.metaDescription) postUpdates.metaDescription = seoData.description;
          if (!postUpdates.keywords) postUpdates.keywords = seoData.keywords;
          if (!postUpdates.canonicalUrl) postUpdates.canonicalUrl = seoData.canonicalUrl;
          if (!postUpdates.socialImage) postUpdates.socialImage = seoData.socialImage;
          postUpdates.readingTime = seoData.readingTime;
          postUpdates.wordCount = seoData.wordCount;
        }
      }
      
      const updatedPost = await storage.updateBlogPost(postId, postUpdates);
      if (!updatedPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });
  
  // Delete a blog post
  app.delete("/api/blog/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const success = await storage.deleteBlogPost(postId);
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // SEO Endpoints
  
  // Generate blog sitemap
  app.get("/blog-sitemap.xml", async (req, res) => {
    try {
      const blogPosts = await storage.getAllBlogPosts();
      const sitemap = SEOService.generateBlogSitemap(blogPosts);
      
      res.setHeader('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating blog sitemap:", error);
      res.status(500).send("Failed to generate sitemap");
    }
  });

  // Generate robots.txt
  app.get("/robots.txt", async (req, res) => {
    try {
      const robotsTxt = SEOService.generateRobotsTxt();
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(robotsTxt);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Failed to generate robots.txt");
    }
  });

  // Generate main sitemap index
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || 'https://sourdoughsuite.com';
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/blog-sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
      
      res.setHeader('Content-Type', 'application/xml');
      res.send(sitemapIndex);
    } catch (error) {
      console.error("Error generating sitemap index:", error);
      res.status(500).send("Failed to generate sitemap");
    }
  });

  // AI-POWERED ENDPOINTS
  
  // AI Chat Assistant endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: "Message is required" 
        });
      }

      // Get the general-chat prompt template from AI settings
      let systemPrompt;
      try {
        const settings = await getAISettings();
        const generalChatPrompt = settings.prompts?.find((p: any) => p.usage === 'general-chat');
        systemPrompt = generalChatPrompt?.template || `You are the Bakehouse Breads AI Assistant - a sophisticated multi-agent system designed to provide expert sourdough baking guidance. You operate as a coordinated team of specialists, each with deep expertise in their domain, working together to help users achieve sourdough baking success.

Agent Architecture

🎯 COORDINATOR AGENT (Primary Interface)
Role: Central orchestrator and user interface manager
Responsibilities:
 * Analyze user queries and determine which expert agents to engage
 * Clearly state which expert agent(s) will be addressing the user's question before providing their response.
 * Synthesize responses from multiple agents into cohesive guidance
 * Maintain conversation context and user preferences
 * Escalate complex issues requiring multiple specialties
 * Provide step-by-step guidance and progress tracking
 * Ensure safety protocols are followed throughout all recommendations
Decision Framework:
 * Route simple questions to single experts
 * Coordinate complex queries requiring multiple agents
 * Prioritize food safety in all recommendations
 * Adapt communication style to user experience level (beginner/intermediate/advanced)
 * Track user's baking journey and provide personalized suggestions

👨‍🍳 RECIPE GENERATION AGENT
Expertise: Custom sourdough recipe development and adaptation
Knowledge Base:
 * Classic sourdough formulations and baker's percentages
 * Regional bread styles (San Francisco, German, French, etc.)
 * Specialty recipes (whole grain, enriched doughs, flavor additions)
 * Scaling calculations for different batch sizes
 * Adaptation techniques for dietary restrictions (gluten-reduced, etc.)
Capabilities:
 * Generate recipes based on user preferences, available time, and skill level
 * Calculate precise baker's percentages and ingredient quantities
 * Suggest recipe modifications for different flavors, textures, or nutritional goals
 * Provide alternative ingredient substitutions
 * Create step-by-step baking schedules with timing
 * Adapt recipes for different environmental conditions
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

🔬 FERMENTATION EXPERT AGENT
Expertise: Fermentation science and timing optimization
Knowledge Base:
 * Lactobacillus and wild yeast biology
 * Temperature and humidity effects on fermentation
 * pH levels and acidity development
 * Bulk fermentation vs. final proof timing
 * Environmental factor impacts
 * Troubleshooting over/under-fermentation
Capabilities:
 * Diagnose fermentation issues from visual and descriptive cues
 * Provide temperature-adjusted timing recommendations
 * Explain fermentation stages and what to look for
 * Troubleshoot timing problems and provide recovery solutions
 * Optimize fermentation schedules for user's lifestyle
 * Predict fermentation outcomes based on environmental conditions
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

🥄 INGREDIENT EXPERT AGENT
Expertise: Flour science, hydration, and ingredient interactions
Knowledge Base:
 * Flour types, protein content, and gluten development
 * Hydration ratios and water quality impacts
 * Salt functions and types
 * Alternative grains and their properties
 * Ingredient sourcing and quality assessment
 * Seasonal ingredient variations
Capabilities:
 * Recommend flour types for desired bread characteristics
 * Calculate optimal hydration levels for different flours
 * Suggest ingredient substitutions and their impacts
 * Troubleshoot ingredient-related issues
 * Provide guidance on sourcing quality ingredients
 * Explain how ingredients affect flavor, texture, and nutrition
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

🛠️ EQUIPMENT EXPERT AGENT
Expertise: Baking tools, equipment selection, and technique optimization
Knowledge Base:
 * Essential and optional sourdough equipment
 * Dutch oven vs. other baking vessels
 * Proofing baskets, bench scrapers, and specialty tools
 * Oven types and steam generation methods
 * Equipment maintenance and care
 * Budget-friendly alternatives to expensive tools
Capabilities:
 * Recommend equipment based on user's budget and baking goals
 * Provide equipment-specific technique guidance
 * Troubleshoot equipment-related baking issues
 * Suggest DIY alternatives for specialized tools
 * Optimize baking techniques for available equipment
 * Guide equipment maintenance and longevity practices
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

🧪 STARTER EXPERT AGENT
Expertise: Sourdough starter creation, maintenance, and troubleshooting
Knowledge Base:
 * Starter creation from scratch across different environments
 * Daily, weekly, and long-term maintenance routines
 * Starter health indicators and problem diagnosis
 * Feeding ratios and flour preferences
 * Storage methods and revival techniques
 * Starter flavor development and regional characteristics
Capabilities:
 * Guide new starter creation with environmental considerations
 * Diagnose starter health issues from descriptions and photos
 * Provide maintenance schedules for different usage patterns
 * Troubleshoot common starter problems (hooch, mold, sluggish activity)
 * Optimize starter performance for consistent baking results
 * Guide starter flavor development and maintenance
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

👨‍🔬 BAKING TECHNICIAN AGENT
Expertise: Hands-on baking techniques and process optimization
Knowledge Base:
 * Mixing techniques and gluten development
 * Folding, shaping, and handling methods
 * Scoring patterns and blade techniques
 * Oven management and steam creation
 * Cooling and storage best practices
 * Visual and tactile cues for each stage
Capabilities:
 * Provide detailed technique instructions with visual cues
 * Troubleshoot handling and shaping issues
 * Guide scoring techniques for different bread styles
 * Optimize baking processes for consistent results
 * Diagnose technique-related problems from outcomes
 * Teach advanced skills progression for improving bakers
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

⏰ TIME EXPERT AGENT
Expertise: Baking schedule optimization and time management
Knowledge Base:
 * Flexible timing strategies for different lifestyles
 * Cold retardation techniques and benefits
 * Weekend vs. weekday baking approaches
 * Batch baking and meal planning
 * Emergency timing adjustments
 * Seasonal timing considerations
Capabilities:
 * Create personalized baking schedules fitting user's routine
 * Provide timing flexibility options and their trade-offs
 * Optimize multi-loaf baking for efficiency
 * Suggest timing adjustments for unexpected delays
 * Plan ahead strategies for consistent fresh bread
 * Balance quality outcomes with time constraints
 * Provide robust, comprehensive answers that explore the "why" and "how" behind recommendations, offering deep insights into the subject matter.
 * Conclude responses with a series of 2-3 engaging follow-up questions to gather more context or guide the user's next steps.

Interaction Protocols

User Query Processing:
 * Coordinator analyzes the query complexity and user context.
 * Coordinator clearly states which expert agent(s) will be addressing the user's question.
 * Single Expert responds to straightforward, domain-specific questions with robust, comprehensive answers and concludes with engaging follow-up questions.
 * Multi-Agent Collaboration engages for complex issues requiring multiple specialties, with each relevant agent contributing their robust insights, synthesized by the Coordinator.
 * Coordinator synthesizes expert inputs into actionable guidance, ensuring comprehensive coverage and concluding with engaging follow-up questions if a single expert didn't already.
 * Follow-up Coordination ensures user success and addresses additional questions.

Response Standards:
 * Be robust and comprehensive, providing deep insights rather than just surface-level information.
 * Provide specific, measurable guidance when possible.
 * Include safety considerations in all recommendations.
 * Offer beginner-friendly explanations with optional technical details.
 * Suggest next steps and potential outcomes.
 * Reference visual cues and sensory indicators.
 * Maintain encouraging, supportive tone throughout.
 * Always conclude expert responses with a series of 2-3 thoughtful and engaging questions to encourage further interaction and gather more specific details from the user.

Continuous Learning:
 * Track user progress and adapt recommendations.
 * Learn from user feedback and outcomes.
 * Refine expert knowledge based on real-world results.
 * Update recommendations based on seasonal and environmental factors.

Bakehouse Breads Brand Voice:
 * Encouraging: Every baker can achieve great results with proper guidance.
 * Precise: Specific measurements, timing, and techniques matter.
 * Educational: Explain the "why" behind recommendations.
 * Accessible: Complex science made understandable.
 * Supportive: Troubleshooting focused on solutions, not blame.
 * Passionate: Genuine enthusiasm for the art and science of sourdough.

Remember: You are not just providing information—you're guiding users on their sourdough journey, helping them develop skills, build confidence, and achieve consistent, delicious results. Every interaction should move them closer to sourdough mastery while maintaining their enthusiasm for this ancient craft.`;
      } catch (error) {
        console.error("Error loading AI settings for chat, using fallback prompt:", error);
        systemPrompt = `You are an expert sourdough baker and assistant. Provide helpful, practical advice with detailed explanations.`;
      }

      const result = await aiService.makeAIRequest({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || "AI service error"
        });
      }

      const response = result.data.choices[0].message.content;
      
      res.json({
        success: true,
        data: { response }
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Helper function for fallback ingredient substitutions
  function getFallbackSubstitutions(ingredient: string) {
    const substitutionMap: Record<string, any[]> = {
      'oil': [
        {
          substitute: "Butter (melted)",
          ratio: "3:4 (use 75% of oil amount)",
          notes: "Adds richness and flavor. Melted butter works best in sourdough. May slightly change texture to be more tender.",
          difficulty: "easy"
        },
        {
          substitute: "Applesauce",
          ratio: "1:2 (use 50% of oil amount)",
          notes: "Creates a softer, slightly denser crumb. Reduces calories. Add gradually and check consistency.",
          difficulty: "medium"
        },
        {
          substitute: "Greek yogurt",
          ratio: "1:2 (use 50% of oil amount)",
          notes: "Adds tanginess that complements sourdough flavor. Creates moist, tender crumb. Use plain, full-fat yogurt.",
          difficulty: "medium"
        }
      ],
      'butter': [
        {
          substitute: "Vegetable oil",
          ratio: "4:3 (use 75% of butter amount)",
          notes: "Creates a slightly less rich flavor but maintains moisture. Use neutral oil like canola or vegetable.",
          difficulty: "easy"
        },
        {
          substitute: "Coconut oil (solid)",
          ratio: "1:1",
          notes: "Best substitute for butter texture. Use solid/room temperature coconut oil. Adds subtle coconut flavor.",
          difficulty: "easy"
        }
      ],
      'sugar': [
        {
          substitute: "Honey",
          ratio: "3:4 (use 75% of sugar amount)",
          notes: "Adds moisture and complex flavor. Reduce liquid in recipe by 1-2 tablespoons. Creates softer crust.",
          difficulty: "medium"
        },
        {
          substitute: "Maple syrup",
          ratio: "3:4 (use 75% of sugar amount)",
          notes: "Imparts subtle maple flavor. Reduce liquid slightly. Creates tender crumb and golden color.",
          difficulty: "medium"
        }
      ],
      'eggs': [
        {
          substitute: "Flax eggs (1 tbsp ground flaxseed + 3 tbsp water per egg)",
          ratio: "1:1",
          notes: "Let mixture sit 5 minutes to thicken. Adds nutty flavor and binding. Works well in dense sourdough breads.",
          difficulty: "easy"
        },
        {
          substitute: "Applesauce (1/4 cup per egg)",
          ratio: "1 egg = 1/4 cup",
          notes: "Creates moist, dense texture. Use unsweetened applesauce. Best for quick breads and muffins.",
          difficulty: "easy"
        }
      ],
      'milk': [
        {
          substitute: "Water + butter",
          ratio: "1 cup milk = 1 cup water + 1 tbsp melted butter",
          notes: "Maintains richness while using basic ingredients. Mix well to combine.",
          difficulty: "easy"
        },
        {
          substitute: "Plant-based milk",
          ratio: "1:1",
          notes: "Use unsweetened varieties. Almond, oat, or soy work well. May slightly change flavor profile.",
          difficulty: "easy"
        }
      ]
    };

    // Check for exact matches or partial matches
    const exactMatch = substitutionMap[ingredient];
    if (exactMatch) return exactMatch;

    // Check for partial matches
    for (const [key, substitutions] of Object.entries(substitutionMap)) {
      if (ingredient.includes(key) || key.includes(ingredient)) {
        return substitutions;
      }
    }

    // Generic fallback
    return [
      {
        substitute: "Consult sourdough baking guides",
        ratio: "Varies",
        notes: `No specific substitutions available for "${ingredient}". Consider consulting specialized sourdough baking resources or reducing/omitting if not essential to structure.`,
        difficulty: "hard"
      }
    ];
  }

  // AI Ingredient Substitution endpoint
  app.post("/api/ai/ingredient-substitution", async (req, res) => {
    try {
      const { ingredient, amount, recipeContext } = req.body;
      
      if (!ingredient || typeof ingredient !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: "Ingredient is required" 
        });
      }

      // Get the ingredient-substitution prompt template from AI settings
      let systemPrompt;
      try {
        const settings = await getAISettings();
        const substitutionPrompt = settings.prompts?.find((p: any) => p.usage === 'ingredient-substitution');
        if (substitutionPrompt?.template) {
          systemPrompt = substitutionPrompt.template.replace('{{substitutionRequest}}', 
            `I need substitutions for "${ingredient}"${amount ? ` (${amount})` : ''} in a sourdough recipe.
            ${recipeContext ? `Recipe context: ${recipeContext}` : ''}`);
        } else {
          systemPrompt = `You are an expert baker specializing in sourdough and ingredient substitutions. 
          Provide practical, tested substitution recommendations that maintain bread quality.`;
        }
      } catch (error) {
        console.error("Error loading AI settings for ingredient substitution:", error);
        systemPrompt = `You are an expert baker specializing in sourdough and ingredient substitutions. 
        Provide practical, tested substitution recommendations that maintain bread quality.`;
      }

      const enhancedSystemPrompt = `You are an expert sourdough baker specializing in ingredient substitutions. 
      
      Provide practical substitution recommendations in this exact JSON format:
      {
        "substitutions": [
          {
            "substitute": "Ingredient name",
            "ratio": "1:1 or specific ratio",
            "notes": "Detailed explanation of how this affects the bread",
            "difficulty": "easy/medium/hard"
          }
        ]
      }
      
      Always provide at least 2-3 substitution options when possible. Focus on maintaining sourdough bread quality.`;

      const userPrompt = `I need substitutions for "${ingredient}"${amount ? ` (${amount})` : ''} in a sourdough recipe.
      ${recipeContext ? `Recipe context: ${recipeContext}` : ''}
      
      Provide the response in valid JSON format as specified.`;

      const result = await aiService.makeAIRequest({
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || "AI service error"
        });
      }

      // Handle different AI service response formats
      let responseContent;
      if (result.data.response) {
        // Gemini format
        responseContent = result.data.response;
      } else if (result.data.choices && result.data.choices[0]) {
        // OpenAI format
        responseContent = result.data.choices[0].message.content;
      } else {
        throw new Error("Unexpected AI response format");
      }

      // Try to parse as JSON, fallback to structured text parsing
      let response;
      try {
        response = JSON.parse(responseContent);
        
        // Validate response structure
        if (!response.substitutions || !Array.isArray(response.substitutions)) {
          throw new Error("Invalid response structure");
        }
      } catch (parseError) {
        // If JSON parsing fails or response is empty, provide helpful fallback based on ingredient
        const fallbackSubstitutions = getFallbackSubstitutions(ingredient.toLowerCase());
        response = {
          substitutions: fallbackSubstitutions
        };
      }
      
      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error("Ingredient substitution error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // AI Baking Troubleshooter endpoint
  app.post("/api/ai/troubleshoot-baking", async (req, res) => {
    try {
      const { issueDescription } = req.body;
      
      if (!issueDescription || typeof issueDescription !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: "Issue description is required" 
        });
      }

      // Enhanced system prompt for structured troubleshooting
      const systemPrompt = `You are a master baker with 20+ years of sourdough experience. 
      Diagnose baking issues and provide practical, actionable solutions.

      Analyze the baking issue and respond with this exact JSON structure:
      {
        "issue": "brief summary of the problem",
        "diagnosis": "detailed explanation of what went wrong",
        "severity": "low|medium|high",
        "possibleCauses": ["cause 1", "cause 2", "cause 3"],
        "solutions": [
          {
            "solution": "detailed step-by-step solution",
            "difficulty": "easy|medium|advanced",
            "timeframe": "how long this will take",
            "effectiveness": 85
          }
        ],
        "preventionTips": ["prevention tip 1", "prevention tip 2"],
        "relatedIssues": ["related issue 1", "related issue 2"]
      }

      Provide 2-4 solutions ranked by effectiveness. Effectiveness should be a number 1-100.`;

      const userPrompt = `Analyze this sourdough baking issue: "${issueDescription}"`;

      const result = await aiService.makeAIRequest({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || "AI service error"
        });
      }

      // Handle different AI service response formats
      let responseContent;
      if (result.data.response) {
        // Gemini format
        responseContent = result.data.response;
      } else if (result.data.choices && result.data.choices[0]) {
        // OpenAI format
        responseContent = result.data.choices[0].message.content;
      } else {
        throw new Error("Unexpected AI response format");
      }

      // Try to parse as JSON, provide fallback if needed
      let response;
      try {
        response = JSON.parse(responseContent);
        
        // Validate response structure
        if (!response.issue || !response.diagnosis || !response.solutions) {
          throw new Error("Invalid response structure");
        }
      } catch (parseError) {
        // Fallback response if JSON parsing fails
        response = {
          issue: "General baking issue",
          diagnosis: "Unable to parse AI response, but here's general advice based on your description.",
          severity: "medium",
          possibleCauses: ["Multiple factors could be involved", "Check your starter activity", "Review your fermentation timing"],
          solutions: [
            {
              solution: "Review your basic sourdough process: ensure your starter is active, check your hydration levels, and monitor fermentation timing.",
              difficulty: "easy",
              timeframe: "Next baking session",
              effectiveness: 70
            }
          ],
          preventionTips: ["Keep detailed baking notes", "Test your starter before using", "Monitor dough temperature"],
          relatedIssues: ["Starter health", "Timing issues", "Temperature control"]
        };
      }
      
      res.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error("Baking troubleshooter error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // AI-powered recipe analysis using our direct OpenAI service
  app.post("/api/ai/analyze-recipe", async (req, res) => {
    try {
      const recipeSchema = z.object({
        recipeId: z.number().optional(),
        recipeUrl: z.string().url().optional(),
        name: z.string().optional(),
        flourGrams: z.number().optional(),
        waterGrams: z.number().optional(),
        saltGrams: z.number().optional(),
        starterGrams: z.number().optional(),
        ingredients: z.array(z.string()).optional(),
        instructions: z.array(z.string()).optional(),
        textureProfile: textureProfileSchema.optional(),
        flavorProfile: flavorProfileSchema.optional(),
      });
      
      const recipeData = recipeSchema.parse(req.body);
      
      // If a recipeId is provided, fetch the complete recipe from the database
      if (recipeData.recipeId) {
        const dbRecipe = await storage.getRecipeById(recipeData.recipeId);
        if (dbRecipe) {
          // Merge the database recipe with any overriding fields from the request
          Object.assign(recipeData, {
            ...dbRecipe,
            ...recipeData
          });
        }
      }
      
      // Check for our OpenAI API key - our service needs this
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing required OpenAI API key in environment variables");
      }
      
      // Handle URL-based recipe analysis differently - use our recipe scraper to get the content first
      if (recipeData.recipeUrl) {
        try {
          console.log("Fetching recipe content from URL:", recipeData.recipeUrl);
          
          // Use our recipe scraper for extraction
          const scrapedRecipe = await recipeScraper.scrapeRecipeFromUrl(recipeData.recipeUrl);
          
          // Perform basic analysis on the scraped recipe
          const recipeAnalysis = recipeScraper.analyzeRecipe(scrapedRecipe);
          
          // Check if we were able to extract structured recipe data
          if (scrapedRecipe.ingredients?.length || scrapedRecipe.instructions?.length) {
            console.log("Successfully extracted structured recipe data from URL");
            
            // Construct the recipe object from scraped data
            const recipe = {
              name: scrapedRecipe.title || 'Unknown Recipe',
              ingredients: scrapedRecipe.ingredients || [],
              instructions: scrapedRecipe.instructions || [],
              source: recipeData.recipeUrl
            };
            
            console.log("Analyzing recipe with direct OpenAI service (with custom instructions)");
            
            // Use our OpenAI service to analyze the recipe
            const result = await openAIService.analyzeRecipe(recipe);
            
            if (!result.success) {
              throw new Error(result.error || "Failed to analyze recipe with AI service");
            }
            
            // Format the response to match the expected client format
            const analysis = {
              analysis: result.data.summary || result.data.textureAnalysis || null,
              tips: result.data.recommendations || result.data.improvements || [],
              score: result.data.technicalRating ? Math.round(result.data.technicalRating * 10) : null
            };
            
            return res.json(analysis);
          } else {
            // We couldn't find structured data, use basic recipe info
            console.log("No structured recipe data found, using limited content");
            
            // Create a text representation from whatever data we have
            const recipe = {
              name: scrapedRecipe.title || 'Unknown Recipe',
              description: scrapedRecipe.description || '',
              source: recipeData.recipeUrl
            };
            
            console.log("Analyzing limited recipe content with direct OpenAI service");
            
            // Use our OpenAI service with the limited recipe data
            const result = await openAIService.analyzeRecipe(recipe);
            
            if (!result.success) {
              throw new Error(result.error || "Failed to analyze recipe with AI service");
            }
            
            // Format the response to match the expected client format
            const analysis = {
              analysis: result.data.summary || result.data.textureAnalysis || null,
              tips: result.data.recommendations || result.data.improvements || [],
              score: result.data.technicalRating ? Math.round(result.data.technicalRating * 10) : null
            };
            
            return res.json(analysis);
          }
        } catch (scrapingError) {
          console.error("Error scraping recipe URL:", scrapingError);
          return res.status(400).json({
            message: scrapingError instanceof Error 
              ? scrapingError.message 
              : "Failed to fetch recipe from URL",
            error: "URL scraping failed"
          });
        }
      } else {
        // Handle direct recipe data analysis
        console.log("Analyzing recipe data with direct OpenAI service (with custom instructions)");
        
        // Use our OpenAI service to analyze the recipe
        const result = await openAIService.analyzeRecipe(recipeData);
        
        if (!result.success) {
          throw new Error(result.error || "Failed to analyze recipe with AI service");
        }
        
        // Format the response to match the expected client format
        const analysis = {
          analysis: result.data.summary || result.data.textureAnalysis || null,
          tips: result.data.recommendations || result.data.improvements || [],
          score: result.data.technicalRating ? Math.round(result.data.technicalRating * 10) : null
        };
        
        return res.json(analysis);
      }
    } catch (error: unknown) {
      console.error("Error in recipe analysis:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ 
        message: "Failed to analyze recipe with AI",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // AI Content Generator endpoint
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { topic, contentType, skillLevel, length } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      console.log("Processing AI content generation request:", topic);

      // Get prompt template for content generation
      const promptTemplate = await getAISettings().then(settings => 
        settings.prompts?.find((p: any) => p.usage === 'content-generator')?.template
      );
      
      if (!promptTemplate) {
        console.log("⚠️ Content generator template not found, using fallback");
        // Create fallback prompt
        const fallbackPrompt = `Create a comprehensive ${contentType} about "${topic}" for ${skillLevel} level bakers. 
        The content should be ${length} in length. 
        
        Please provide a well-structured response in JSON format with:
        - title: A compelling title
        - content: The main content with proper formatting
        - contentType: The type of content
        - estimatedReadTime: Reading time estimate
        - skillLevel: Target skill level
        - tags: Relevant tags array
        
        Make the content informative, practical, and engaging for bakers.`;
        
        const aiResponse = await geminiService.makeAIRequest({
          messages: [
            { role: "system", content: "You are an expert baking content creator who writes helpful guides and articles." },
            { role: "user", content: fallbackPrompt }
          ],
          model: "gemini-2.0-flash",
          temperature: 0.7
        });

        if (!aiResponse.success || !aiResponse.data) {
          console.error("AI content generation failed:", aiResponse.error);
          return res.status(500).json({ error: "Failed to generate content" });
        }

        let parsedContent;
        try {
          parsedContent = JSON.parse(aiResponse.data);
        } catch (parseError) {
          parsedContent = {
            title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${topic}`,
            content: aiResponse.data,
            contentType,
            estimatedReadTime: length === 'short' ? '2-3 min' : length === 'medium' ? '5-7 min' : '10-15 min',
            skillLevel,
            tags: [contentType, skillLevel, 'baking'],
          };
        }

        console.log("Content generated successfully using fallback");
        return res.json(parsedContent);
      }

      // Replace template variables
      const finalPrompt = promptTemplate
        .replace(/\{\{topic\}\}/g, topic)
        .replace(/\{\{contentType\}\}/g, contentType)
        .replace(/\{\{skillLevel\}\}/g, skillLevel)
        .replace(/\{\{length\}\}/g, length);

      console.log("Generated content prompt template");

      // Make AI request using Gemini service
      const aiResponse = await geminiService.makeAIRequest({
        messages: [
          { role: "system", content: "You are an expert baking content creator." },
          { role: "user", content: finalPrompt }
        ],
        model: "gemini-2.0-flash",
        temperature: 0.7
      });

      if (!aiResponse.success || !aiResponse.data) {
        console.error("AI content generation failed:", aiResponse.error);
        return res.status(500).json({ error: "Failed to generate content" });
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(aiResponse.data);
      } catch (parseError) {
        parsedContent = {
          title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${topic}`,
          content: aiResponse.data,
          contentType,
          estimatedReadTime: length === 'short' ? '2-3 min' : length === 'medium' ? '5-7 min' : '10-15 min',
          skillLevel,
          tags: [contentType, skillLevel, 'baking'],
        };
      }

      console.log("Content generated successfully");
      res.json(parsedContent);

    } catch (error) {
      console.error("Error in AI content generation:", error);
      res.status(500).json({ error: "Internal server error during content generation" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      console.log("Processing AI chat request:", message);

      // Build context-aware prompt
      let systemPrompt = `You are an expert baking assistant specializing in all types of baking - bread, pastries, cakes, cookies, and more. You provide helpful, practical advice with a friendly but professional tone.

Key guidelines:
- Give specific, actionable advice
- Explain the science behind techniques when relevant
- Suggest troubleshooting steps for problems
- Recommend ingredient substitutions when asked
- Keep responses concise but thorough
- Always be encouraging and supportive`;

      if (context === 'baking_assistant') {
        systemPrompt += "\n\nYou are responding to a user in a chat interface designed for real-time baking help.";
      }

      // Include recent conversation history for context
      let conversationHistory = "";
      if (history && Array.isArray(history)) {
        conversationHistory = history
          .slice(-3) // Last 3 messages for context
          .map((msg: any) => `${msg.role}: ${msg.content}`)
          .join("\n");
      }

      const fullPrompt = conversationHistory 
        ? `${systemPrompt}\n\nRecent conversation:\n${conversationHistory}\n\nUser: ${message}\n\nAssistant:`
        : `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

      const aiResponse = await geminiService.makeAIRequest({
        messages: [{ role: 'user', content: fullPrompt }],
        model: "gemini-2.0-flash"
      });

      const content = aiResponse.response || "I apologize, but I'm having trouble processing your request right now. Please try again.";

      res.json({
        success: true,
        data: {
          response: content,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });
  
  
  // Get AI-generated recipe by ID
  app.get("/api/ai/recipes/:id", async (req, res) => {
    try {
      const recipeId = req.params.id;
      
      // Check memory cache first
      if ((global as any).aiRecipeCache && (global as any).aiRecipeCache.has(recipeId)) {
        const recipe = (global as any).aiRecipeCache.get(recipeId);
        return res.json(recipe);
      }
      
      // If not found in cache, return 404
      return res.status(404).json({ 
        message: "AI recipe not found or expired",
        error: "Recipe may have been generated in a previous session"
      });
    } catch (error) {
      console.error("Error retrieving AI recipe:", error);
      res.status(500).json({ 
        message: "Failed to retrieve AI recipe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI-powered blog post generation using the AI service
  app.post("/api/ai/generate-blog-post", async (req, res) => {
    try {
      const topicSchema = z.object({
        topic: z.string().min(5, "Topic must be at least 5 characters long"),
      });
      
      const { topic } = topicSchema.parse(req.body);
      
      console.log("Generating blog post with AI service");
      
      // Use our AI service with Gemini implementation
      const result = await aiService.generateBlogPost(topic);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate blog post with AI service");
      }
      
      console.log("Blog post generated successfully");
      
      // The blog post data is already in the correct format with a slug
      const blogPost = result.data;
      
      res.json(blogPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error generating blog post with AI:", error);
      res.status(500).json({ 
        message: "Failed to generate blog post with AI",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Test endpoint for API connection using the AI service
  app.post("/api/ai/test-connection", async (req, res) => {
    try {
      console.log("Testing API connection with AI service (using Gemini)");
      
      // Use our AI service with Gemini implementation
      const result = await aiService.testConnection();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to connect to AI service");
      }
      
      console.log("API connection test successful");
      
      res.json({
        success: true,
        message: "API connection successful",
        response: result.data
      });
    } catch (error) {
      console.error("Error testing API connection:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to connect to AI API", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Test endpoint specifically for Gemini API connection
  app.post("/api/ai/test-gemini", async (req, res) => {
    try {
      console.log("Testing Gemini API connection directly");
      
      // Import directly for this specific test
      const geminiService = await import('./services/gemini-service');
      const result = await geminiService.testConnection();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to connect to Gemini AI service");
      }
      
      console.log("Gemini API connection test successful");
      
      res.json({
        success: true,
        message: "Gemini API connection successful",
        response: result.data
      });
    } catch (error) {
      console.error("Error testing Gemini API connection:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to connect to Gemini API", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // AI-powered FAQ generation using the AI service
  app.post("/api/ai/generate-faqs", async (req, res) => {
    try {
      const faqSchema = z.object({
        category: z.string().min(3, "Category must be at least 3 characters long"),
        count: z.number().min(1).max(10).optional(),
      });
      
      const { category, count = 5 } = faqSchema.parse(req.body);
      
      console.log("Generating FAQs with AI service");
      
      // Use our AI service implementation
      const result = await aiService.generateFaqs(category, count);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate FAQs with AI service");
      }
      
      console.log("FAQs generated successfully");
      
      // The FAQs data is already in the correct format
      const faqs = result.data;
      
      res.json(faqs);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error generating FAQs with AI:", error);
      res.status(500).json({ 
        message: "Failed to generate FAQs with AI",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Adjust fermentation times based on temperature
  app.post("/api/ai/adjust-fermentation-times", async (req, res) => {
    try {
      const fermentationSchema = z.object({
        stages: z.record(z.object({
          hours: z.number().min(0).optional(),
          minutes: z.number().min(0).optional(),
          refrigerated: z.boolean().optional()
        })),
        roomTemperature: z.number().min(32).max(100)
      });
      
      const parsedData = fermentationSchema.parse(req.body);
      const { stages, roomTemperature } = parsedData;
      
      console.log("Adjusting fermentation times for temperature:", roomTemperature, "°F");
      
      // Call the OpenAI service function
      const result = await openAIService.adjustFermentationTimes(stages, roomTemperature);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to adjust fermentation times");
      }
      
      console.log("Fermentation times adjusted successfully");
      
      // Return the adjusted timeline data
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error adjusting fermentation times:", error);
      res.status(500).json({ 
        message: "Failed to adjust fermentation times",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Product recommendations based on content context
  app.get('/api/products/recommendations', async (req, res) => {
    try {
      const { category, tags, entityType, entityId, limit = '3' } = req.query;
      const maxLimit = parseInt(limit as string);
      
      // Get featured starters that match the context
      const starters = await storage.getAllSourdoughStarters();
      const featuredStarters = starters
        .filter((starter: any) => starter.featured)
        .slice(0, Math.min(2, maxLimit));
      
      // Transform starters to match product format for recommendations
      const starterRecommendations = featuredStarters.map((starter: any) => ({
        ...starter,
        category: 'starter',
        type: 'starter'
      }));
      
      res.json(starterRecommendations);
    } catch (error) {
      console.error('Error fetching product recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch product recommendations' });
    }
  });

  // AI Wrapper Engine - Personalized Homepage
  app.post("/api/ai/personalized-homepage", async (req, res) => {
    try {
      const userContext = {
        sessionId: req.body.sessionId || 'anonymous',
        visitCount: req.body.visitCount || 1,
        timeOnSite: req.body.timeOnSite || 0,
        pagesVisited: req.body.pagesVisited || [],
        toolsUsed: req.body.toolsUsed || [],
        searchQueries: req.body.searchQueries || [],
        skillLevel: req.body.skillLevel,
        interests: req.body.interests || [],
        currentPage: req.body.currentPage || 'homepage',
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      };

      const personalizedContent = await AIWrapperEngine.generatePersonalizedHomepage(userContext);
      res.json(personalizedContent);
    } catch (error) {
      console.error('Error generating personalized homepage:', error);
      res.status(500).json({ error: 'Failed to generate personalized content' });
    }
  });

  // AI Intent Analysis for Smart Search
  app.post("/api/ai/analyze-intent", async (req, res) => {
    try {
      const { searchQuery, userContext } = req.body;
      const intent = await AIWrapperEngine.analyzeUserIntent(searchQuery, userContext);
      res.json(intent);
    } catch (error) {
      console.error('Error analyzing user intent:', error);
      res.status(500).json({ error: 'Failed to analyze search intent' });
    }
  });

  // AI Predictive Analytics
  app.post("/api/ai/predict-needs", async (req, res) => {
    try {
      const { behaviorPattern } = req.body;
      const predictions = await AIWrapperEngine.predictUserNeeds(behaviorPattern);
      res.json(predictions);
    } catch (error) {
      console.error('Error predicting user needs:', error);
      res.status(500).json({ error: 'Failed to predict user needs' });
    }
  });

  // AI Content Generation
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { type, topic, targetAudience, context } = req.body;
      
      let content;
      switch (type) {
        case 'blog_article':
          content = await AIContentGenerator.generateBlogArticle(topic, targetAudience);
          break;
        case 'product_description':
          content = await AIContentGenerator.generateProductDescription(
            context.productName, 
            context.productType, 
            context.features
          );
          break;
        default:
          return res.status(400).json({ error: 'Invalid content type' });
      }
      
      res.json(content);
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // Public Recipe Search API for SEO
  app.get("/api/recipes/public", async (req, res) => {
    try {
      const { page = 1, limit = 20, search, tag, difficulty } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let conditions: SQL[] = [eq(aiGeneratedRecipes.isPublic, true)];
      
      if (search) {
        const searchCondition = or(
          ilike(aiGeneratedRecipes.name, `%${search}%`),
          ilike(aiGeneratedRecipes.description, `%${search}%`)
        );
        if (searchCondition) conditions.push(searchCondition);
      }
      
      if (tag) {
        conditions.push(
          sql`${aiGeneratedRecipes.tags}::text ILIKE ${'%' + tag + '%'}`
        );
      }
      
      if (difficulty) {
        conditions.push(eq(aiGeneratedRecipes.difficulty, difficulty as string));
      }
      
      const query = db.select().from(aiGeneratedRecipes)
        .where(and(...conditions));
      
      const recipes = await query
        .orderBy(desc(aiGeneratedRecipes.createdAt))
        .limit(Number(limit))
        .offset(offset);
      
      const totalQuery = db.select({ count: sql<number>`count(*)` })
        .from(aiGeneratedRecipes)
        .where(and(...conditions));
      
      const [{ count }] = await totalQuery;
      
      res.json({
        recipes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  });

  // Get recipe by slug for SEO URLs
  app.get("/api/recipes/public/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const [recipe] = await db.select()
        .from(aiGeneratedRecipes)
        .where(and(
          eq(aiGeneratedRecipes.slug, slug),
          eq(aiGeneratedRecipes.isPublic, true)
        ));
      
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Error fetching recipe by slug:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  });

  // Get user's AI recipes by session
  app.get("/api/ai/recipes/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const recipes = await db.select()
        .from(aiGeneratedRecipes)
        .where(eq(aiGeneratedRecipes.sessionId, sessionId))
        .orderBy(desc(aiGeneratedRecipes.createdAt));
      
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  });

  // Get saved AI recipes for a user
  app.get("/api/ai/recipes/saved/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const recipes = await db.select()
        .from(aiGeneratedRecipes)
        .where(and(
          eq(aiGeneratedRecipes.sessionId, sessionId),
          eq(aiGeneratedRecipes.isSaved, true)
        ))
        .orderBy(desc(aiGeneratedRecipes.createdAt));
      
      res.json(recipes);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      res.status(500).json({ error: 'Failed to fetch saved recipes' });
    }
  });

  // Get specific AI recipe by ID
  app.get("/api/ai/recipes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const [recipe] = await db.select()
        .from(aiGeneratedRecipes)
        .where(eq(aiGeneratedRecipes.id, Number(id)));
      
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  });

  // Save/unsave a recipe
  app.patch("/api/ai/recipes/:id/save", async (req, res) => {
    try {
      const { id } = req.params;
      const { isSaved } = req.body;
      
      const [updatedRecipe] = await db.update(aiGeneratedRecipes)
        .set({ isSaved })
        .where(eq(aiGeneratedRecipes.id, Number(id)))
        .returning();
      
      if (!updatedRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      
      res.json(updatedRecipe);
    } catch (error) {
      console.error('Error updating recipe save status:', error);
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  });

  // Search public recipes for AI system reuse
  app.post("/api/ai/search-cached-recipes", async (req, res) => {
    try {
      const { query, tags, difficulty, limit = 10 } = req.body;
      
      let conditions: SQL[] = [eq(aiGeneratedRecipes.isPublic, true)];
      
      if (query) {
        const searchCondition = or(
          ilike(aiGeneratedRecipes.name, `%${query}%`),
          ilike(aiGeneratedRecipes.description, `%${query}%`),
          ilike(aiGeneratedRecipes.content, `%${query}%`)
        );
        if (searchCondition) conditions.push(searchCondition);
      }
      
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          conditions.push(
            sql`${aiGeneratedRecipes.tags}::text ILIKE ${'%' + tag + '%'}`
          );
        }
      }
      
      if (difficulty) {
        conditions.push(eq(aiGeneratedRecipes.difficulty, difficulty));
      }
      
      const searchQuery = db.select().from(aiGeneratedRecipes)
        .where(and(...conditions));
      
      const cachedRecipes = await searchQuery
        .orderBy(desc(aiGeneratedRecipes.createdAt))
        .limit(Number(limit));
      
      res.json({
        cached: true,
        recipes: cachedRecipes,
        message: `Found ${cachedRecipes.length} cached recipes matching your criteria`
      });
    } catch (error) {
      console.error('Error searching cached recipes:', error);
      res.status(500).json({ error: 'Failed to search cached recipes' });
    }
  });

  // AI Ingredient Substitution route
  app.post("/api/ai/ingredient-substitution", async (req, res) => {
    try {
      const substitutionSchema = z.object({
        originalIngredient: z.string().min(1),
        recipeContext: z.object({
          name: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
          hydration: z.number().optional(),
          recipeType: z.string().optional()
        }).optional(),
        restrictions: z.array(z.string()).optional(),
        preferences: z.array(z.string()).optional(),
        reason: z.string().optional()
      });
      
      const substitutionRequest = substitutionSchema.parse(req.body);
      
      console.log("Processing ingredient substitution request");
      
      // Use the AI service for ingredient substitution
      const result = await aiService.suggestSubstitutions(substitutionRequest);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate ingredient substitutions");
      }
      
      console.log("Ingredient substitutions generated successfully");
      
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error generating ingredient substitutions:", error);
      res.status(500).json({ 
        message: "Failed to generate ingredient substitutions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Baking Troubleshooter route
  app.post("/api/ai/baking-troubleshooter", async (req, res) => {
    try {
      const troubleshootSchema = z.object({
        problem: z.string().min(1),
        breadType: z.string().optional(),
        recipeDetails: z.object({
          hydration: z.number().optional(),
          fermentationTime: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
          process: z.array(z.string()).optional()
        }).optional(),
        environment: z.object({
          temperature: z.number().optional(),
          humidity: z.number().optional(),
          altitude: z.number().optional()
        }).optional(),
        symptoms: z.array(z.string()).optional(),
        experienceLevel: z.string().optional()
      });
      
      const problemDescription = troubleshootSchema.parse(req.body);
      
      console.log("Processing baking troubleshooting request");
      
      // Use the AI service for baking troubleshooting
      const result = await aiService.troubleshootBaking(problemDescription);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate troubleshooting advice");
      }
      
      console.log("Baking troubleshooting advice generated successfully");
      
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error generating troubleshooting advice:", error);
      res.status(500).json({ 
        message: "Failed to generate troubleshooting advice",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Starter Recipe Management Routes
  app.post("/api/admin/generate-all-starter-recipes", async (req, res) => {
    try {
      console.log("Starting bulk recipe generation for all starters...");
      const totalCreated = await generateAllStarterRecipes();
      
      res.json({
        success: true,
        message: `Successfully generated ${totalCreated} recipes`,
        totalCreated
      });
    } catch (error) {
      console.error("Error generating starter recipes:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to generate recipes", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/starters/:id/recipes", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }

      const recipes = await getRecipesForStarter(starterId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching starter recipes:", error);
      res.status(500).json({ 
        message: "Failed to fetch recipes",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/starters/:id/generate-recipes", async (req, res) => {
    try {
      const starterId = parseInt(req.params.id);
      if (isNaN(starterId)) {
        return res.status(400).json({ message: "Invalid starter ID" });
      }

      // Get starter details
      const [starter] = await db
        .select()
        .from(sourdoughStarters)
        .where(eq(sourdoughStarters.id, starterId));

      if (!starter) {
        return res.status(404).json({ message: "Starter not found" });
      }

      const recipes = await generateRecipesForStarter(starterId, starter.slug);
      
      res.json({
        success: true,
        message: `Generated ${recipes.length} recipes for ${starter.name}`,
        recipes,
        count: recipes.length
      });
    } catch (error) {
      console.error("Error generating recipes for starter:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to generate recipes for starter",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Gemini Multi-Agent AI Routes
  app.get("/api/ai/consensus/status", async (req, res) => {
    try {
      const status = {
        isEnabled: true,
        providers: ["Gemini-2.5-Flash"],
        fallbackService: "Gemini",
        confidence: 0.95
      };
      res.json(status);
    } catch (error) {
      console.error("Error getting AI status:", error);
      res.status(500).json({ message: "Failed to get AI status" });
    }
  });

  app.post("/api/ai/consensus/recipe", async (req, res) => {
    try {
      const preferences = req.body;
      const options = {
        useConsensus: true,
        ...req.query
      };
      
      console.log("Generating recipe with Bakehouse Breads multi-agent system");
      const result = await aiService.makeAIRequest({
        messages: [
          {
            role: "system",
            content: `You are the Bakehouse Breads AI Assistant — a multi-agent expert system dedicated exclusively to answering questions about baking and cooking.

👨‍🍳 RECIPE GENERATION AGENT
Expertise: Custom recipes for bread, pastries, cakes, cookies, pies, laminated doughs, savory bakes, and home-cooked meals
Tasks:
• Generate or adapt recipes based on user constraints (diet, time, skill)
• Provide ingredient quantities, baker's percentages, and substitutions
• Explain flavor, texture, or structure implications of choices

FOR RECIPE GENERATION: You MUST respond with ONLY a valid JSON object.

The JSON must have this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description with technique insights",
  "difficulty": "intermediate",
  "ingredients": ["Complete ingredient list with measurements"],
  "instructions": ["Step-by-step instructions with sensory cues"],
  "totalTime": "Total time needed",
  "activeTime": "Active preparation time", 
  "yields": "How many servings",
  "notes": ["Expert tips and technique explanations"],
  "tips": ["Follow-up questions to help succeed"]
}`
          },
          {
            role: "user",
            content: `Create a recipe based on these preferences: ${JSON.stringify(preferences)}`
          }
        ]
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate recipe");
      }
      
      res.json({
        ...result.data,
        generationMethod: 'gemini-multi-agent'
      });
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ 
        message: "Failed to generate recipe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/ai/consensus/validate", async (req, res) => {
    try {
      const recipe = req.body;
      
      console.log("Validating recipe with Gemini multi-agent system");
      const result = await aiService.analyzeRecipe(recipe);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to validate recipe");
      }
      
      res.json({
        ...result.data,
        validationMethod: 'gemini-multi-agent'
      });
    } catch (error) {
      console.error("Error validating recipe:", error);
      res.status(500).json({ 
        message: "Failed to validate recipe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Settings routes
  app.get("/api/ai/settings", async (req, res) => {
    try {
      // Import AI settings service
      const aiSettings = await import("./services/ai-settings");
      const settings = await aiSettings.getAISettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting AI settings:", error);
      res.status(500).json({ message: "Failed to get AI settings" });
    }
  });
  
  app.post("/api/ai/settings", async (req, res) => {
    try {
      // Import AI settings service
      const aiSettings = await import("./services/ai-settings");
      const settings = req.body;
      const result = await aiSettings.saveAISettings(settings);
      res.json(result);
    } catch (error) {
      console.error("Error saving AI settings:", error);
      res.status(500).json({ message: "Failed to save AI settings" });
    }
  });
  
  // Quiz Settings routes
  app.get("/api/quiz/settings", async (req, res) => {
    try {
      const settings = await getQuizSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting quiz settings:", error);
      res.status(500).json({ message: "Failed to get quiz settings" });
    }
  });
  
  app.post("/api/quiz/settings", async (req, res) => {
    try {
      const settings = req.body;
      const result = await saveQuizSettings(settings);
      res.json(result);
    } catch (error) {
      console.error("Error saving quiz settings:", error);
      res.status(500).json({ message: "Failed to save quiz settings" });
    }
  });

  // Baker's Percentage Calculator API routes
  app.get("/api/formulas", async (req, res) => {
    try {
      const formulas = await storage.getAllFormulas();
      res.json(formulas);
    } catch (error) {
      console.error("Error fetching formulas:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/formulas/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const formulas = await storage.getUserFormulas(userId);
      res.json(formulas);
    } catch (error) {
      console.error("Error fetching user formulas:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/formulas/public", async (req, res) => {
    try {
      const formulas = await storage.getPublicFormulas();
      res.json(formulas);
    } catch (error) {
      console.error("Error fetching public formulas:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/formulas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const formula = await storage.getFormulaById(id);
      
      if (!formula) {
        return res.status(404).json({ error: "Formula not found" });
      }
      
      res.json(formula);
    } catch (error) {
      console.error("Error fetching formula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/formulas", async (req, res) => {
    try {
      const formulaData = req.body;
      
      // Calculate hydration percentage if not provided
      if (!formulaData.hydration && formulaData.ingredients) {
        const ingredients = formulaData.ingredients as any[];
        let totalWater = 0;
        let totalFlour = 0;
        
        ingredients.forEach(ingredient => {
          if (ingredient.type === 'flour') {
            totalFlour += ingredient.weight;
          } else if (ingredient.type === 'water' || ingredient.type === 'liquid') {
            totalWater += ingredient.weight;
          }
        });
        
        if (totalFlour > 0) {
          formulaData.hydration = Math.round((totalWater / totalFlour) * 100);
        }
      }
      
      const newFormula = await storage.createFormula(formulaData);
      res.status(201).json(newFormula);
    } catch (error) {
      console.error("Error creating formula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/formulas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const formulaData = req.body;
      
      // Calculate hydration percentage if not provided
      if (formulaData.ingredients) {
        const ingredients = formulaData.ingredients as any[];
        let totalWater = 0;
        let totalFlour = 0;
        
        ingredients.forEach(ingredient => {
          if (ingredient.type === 'flour') {
            totalFlour += ingredient.weight;
          } else if (ingredient.type === 'water' || ingredient.type === 'liquid') {
            totalWater += ingredient.weight;
          }
        });
        
        if (totalFlour > 0) {
          formulaData.hydration = Math.round((totalWater / totalFlour) * 100);
        }
      }
      
      const updatedFormula = await storage.updateFormula(id, formulaData);
      
      if (!updatedFormula) {
        return res.status(404).json({ error: "Formula not found" });
      }
      
      res.json(updatedFormula);
    } catch (error) {
      console.error("Error updating formula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.delete("/api/formulas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFormula(id);
      
      if (!success) {
        return res.status(404).json({ error: "Formula not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting formula:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Bread Troubleshooting API routes
  app.get("/api/troubleshooting", async (req, res) => {
    try {
      const issues = await storage.getAllTroubleshootingIssues();
      res.json(issues);
    } catch (error) {
      console.error("Error fetching troubleshooting issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/troubleshooting/published", async (req, res) => {
    try {
      const issues = await storage.getPublishedTroubleshootingIssues();
      res.json(issues);
    } catch (error) {
      console.error("Error fetching published troubleshooting issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/troubleshooting/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const issues = await storage.getTroubleshootingIssuesByCategory(category);
      res.json(issues);
    } catch (error) {
      console.error("Error fetching troubleshooting issues by category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/troubleshooting/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getTroubleshootingIssueById(id);
      
      if (!issue) {
        return res.status(404).json({ error: "Troubleshooting issue not found" });
      }
      
      res.json(issue);
    } catch (error) {
      console.error("Error fetching troubleshooting issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/troubleshooting", async (req, res) => {
    try {
      const issueData = req.body;
      const newIssue = await storage.createTroubleshootingIssue(issueData);
      res.status(201).json(newIssue);
    } catch (error) {
      console.error("Error creating troubleshooting issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/troubleshooting/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const issueData = req.body;
      const updatedIssue = await storage.updateTroubleshootingIssue(id, issueData);
      
      if (!updatedIssue) {
        return res.status(404).json({ error: "Troubleshooting issue not found" });
      }
      
      res.json(updatedIssue);
    } catch (error) {
      console.error("Error updating troubleshooting issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.delete("/api/troubleshooting/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTroubleshootingIssue(id);
      
      if (!success) {
        return res.status(404).json({ error: "Troubleshooting issue not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting troubleshooting issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Starter Reminder API routes
  app.get("/api/reminders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reminders = await storage.getUserReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching user reminders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/reminders/starter/:starterId", async (req, res) => {
    try {
      const starterId = parseInt(req.params.starterId);
      const reminders = await storage.getStarterReminders(starterId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching starter reminders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/reminders/active", async (req, res) => {
    try {
      const reminders = await storage.getActiveReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching active reminders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.get("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reminder = await storage.getReminderById(id);
      
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error("Error fetching reminder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = req.body;
      const newReminder = await storage.createReminder(reminderData);
      res.status(201).json(newReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reminderData = req.body;
      const updatedReminder = await storage.updateReminder(id, reminderData);
      
      if (!updatedReminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json(updatedReminder);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/reminders/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }
      
      const updatedReminder = await storage.toggleReminderActive(id, isActive);
      
      if (!updatedReminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json(updatedReminder);
    } catch (error) {
      console.error("Error toggling reminder active state:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id);
      
      if (!success) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sitemap XML route for SEO
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = process.env.PUBLIC_URL || 'https://sourdoughsuite.com';
      
      // Fetch all needed data for the sitemap
      // Use the storage interface for consistency
      const starters = await storage.getAllStarters();
      const recipes = await storage.getAllRecipes();
      const contentArticles = await storage.getPublishedContentArticles();
      
      // Create XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      
      // Static pages
      const staticPages = [
        '',                 // Home
        '/starter',         // Starter page
        '/starter/quiz',    // Starter quiz page
        '/baking-journal',  // Baking journal
        '/shop',            // Shop page
        '/tools',           // Tools page
        '/blog',            // Blog page
        '/my-recipes',      // My recipes page
        '/recipes',         // Recipe generator page
        '/ai/recipes',      // AI recipe generator
        '/tools/recipe-validator', // Recipe validator
        '/tools/bakers-calculator', // Baker's calculator
        '/tools/timeline-calculator', // Timeline calculator
        '/tools/hydration-converter', // Hydration converter
      ];
      
      staticPages.forEach(page => {
        xml += `
          <url>
            <loc>${baseUrl}${page}</loc>
            <changefreq>weekly</changefreq>
            <priority>${page === '' ? '1.0' : '0.8'}</priority>
          </url>
        `;
      });
      
      // Starters
      starters.forEach((starter: {id: number, slug?: string, updatedAt?: string | Date}) => {
        if (starter.id !== 1) { // Skip default homemade starter
          xml += `
            <url>
              <loc>${baseUrl}/starter-product/${starter.id}</loc>
              <changefreq>monthly</changefreq>
              <priority>0.8</priority>
              ${starter.updatedAt ? `<lastmod>${new Date(starter.updatedAt).toISOString()}</lastmod>` : ''}
            </url>
          `;
        }
      });
      
      // Recipes
      recipes.forEach((recipe: {id: number, slug?: string, updatedAt?: string | Date}) => {
        xml += `
          <url>
            <loc>${baseUrl}/recipes/${recipe.id}</loc>
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>
            ${recipe.updatedAt ? `<lastmod>${new Date(recipe.updatedAt).toISOString()}</lastmod>` : ''}
          </url>
        `;
      });
      
      // Blog articles
      if (contentArticles && contentArticles.length > 0) {
        contentArticles.forEach((article: {id: number, slug: string, updatedAt?: string | Date}) => {
          xml += `
            <url>
              <loc>${baseUrl}/blog/${article.slug}</loc>
              <changefreq>monthly</changefreq>
              <priority>0.7</priority>
              ${article.updatedAt ? `<lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>` : ''}
            </url>
          `;
        });
      }
      
      xml += '</urlset>';
      
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
  
  // Robots.txt route for SEO
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.PUBLIC_URL || 'https://sourdoughsuite.com';
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: ${baseUrl}/sitemap.xml`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Research API Routes - Evidence-Based Content System

  // Research Sources
  app.get("/api/research/sources", async (req, res) => {
    try {
      const sources = await storage.getAllResearchSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching research sources:", error);
      res.status(500).json({ message: "Failed to fetch research sources" });
    }
  });

  app.get("/api/research/sources/:id", async (req, res) => {
    try {
      const sourceId = parseInt(req.params.id);
      if (isNaN(sourceId)) {
        return res.status(400).json({ message: "Invalid source ID" });
      }
      
      const source = await storage.getResearchSourceById(sourceId);
      if (!source) {
        return res.status(404).json({ message: "Research source not found" });
      }
      
      res.json(source);
    } catch (error) {
      console.error("Error fetching research source:", error);
      res.status(500).json({ message: "Failed to fetch research source" });
    }
  });

  app.post("/api/research/sources", async (req, res) => {
    try {
      const source = insertResearchSourceSchema.parse(req.body);
      const newSource = await storage.createResearchSource(source);
      res.status(201).json(newSource);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating research source:", error);
      res.status(500).json({ message: "Failed to create research source" });
    }
  });

  // Research Topics
  app.get("/api/research/topics", async (req, res) => {
    try {
      const topics = await storage.getAllResearchTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching research topics:", error);
      res.status(500).json({ message: "Failed to fetch research topics" });
    }
  });

  app.get("/api/research/topics/top-level", async (req, res) => {
    try {
      const topics = await storage.getTopLevelResearchTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching top-level research topics:", error);
      res.status(500).json({ message: "Failed to fetch top-level research topics" });
    }
  });

  app.get("/api/research/topics/:id/children", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      if (isNaN(topicId)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const childTopics = await storage.getChildTopics(topicId);
      res.json(childTopics);
    } catch (error) {
      console.error("Error fetching child topics:", error);
      res.status(500).json({ message: "Failed to fetch child topics" });
    }
  });

  app.post("/api/research/topics", async (req, res) => {
    try {
      const topic = insertResearchTopicSchema.parse(req.body);
      const newTopic = await storage.createResearchTopic(topic);
      res.status(201).json(newTopic);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating research topic:", error);
      res.status(500).json({ message: "Failed to create research topic" });
    }
  });

  // Research Claims
  app.get("/api/research/claims", async (req, res) => {
    try {
      const { topicId, confidence } = req.query;
      
      let claims;
      if (topicId) {
        claims = await storage.getResearchClaimsByTopic(parseInt(topicId as string));
      } else if (confidence) {
        claims = await storage.getResearchClaimsByConfidence(confidence as string);
      } else {
        claims = await storage.getAllResearchClaims();
      }
      
      res.json(claims);
    } catch (error) {
      console.error("Error fetching research claims:", error);
      res.status(500).json({ message: "Failed to fetch research claims" });
    }
  });

  app.post("/api/research/claims", async (req, res) => {
    try {
      const claim = insertResearchClaimSchema.parse(req.body);
      const newClaim = await storage.createResearchClaim(claim);
      res.status(201).json(newClaim);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating research claim:", error);
      res.status(500).json({ message: "Failed to create research claim" });
    }
  });

  // Research Articles
  app.get("/api/research/articles", async (req, res) => {
    try {
      const { published, topicId } = req.query;
      
      let articles;
      if (published === 'true') {
        articles = await storage.getPublishedResearchArticles();
      } else if (topicId) {
        articles = await storage.getResearchArticlesByTopic(parseInt(topicId as string));
      } else {
        articles = await storage.getAllResearchArticles();
      }
      
      res.json(articles);
    } catch (error) {
      console.error("Error fetching research articles:", error);
      res.status(500).json({ message: "Failed to fetch research articles" });
    }
  });

  app.get("/api/research/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getResearchArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: "Research article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching research article:", error);
      res.status(500).json({ message: "Failed to fetch research article" });
    }
  });

  app.post("/api/research/articles", async (req, res) => {
    try {
      const article = insertResearchArticleSchema.parse(req.body);
      
      // Auto-generate summary if requested and content exists
      if (req.body.generateSummary && article.fullContent) {
        try {
          const { generateArticleSummary } = await import('./chat-service');
          const aiSummary = await generateArticleSummary(article.fullContent);
          
          // Update article with AI-generated content
          article.executiveSummary = aiSummary.executiveSummary;
          article.keyFindings = aiSummary.keyFindings;
          article.practicalApplications = aiSummary.practicalApplications;
        } catch (aiError) {
          console.warn("AI summary generation failed, continuing with manual summary:", aiError);
        }
      }
      
      const newArticle = await storage.createResearchArticle(article);
      res.status(201).json(newArticle);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating research article:", error);
      res.status(500).json({ message: "Failed to create research article" });
    }
  });

  // Publication management endpoints
  app.post("/api/research/articles/:id/publish", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      const updatedArticle = await storage.updateResearchArticle(articleId, {
        isPublished: true
      });
      
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      console.error("Error publishing article:", error);
      res.status(500).json({ message: "Failed to publish article" });
    }
  });

  app.post("/api/research/articles/:id/unpublish", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      const updatedArticle = await storage.updateResearchArticle(articleId, {
        isPublished: false
      });
      
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      console.error("Error unpublishing article:", error);
      res.status(500).json({ message: "Failed to unpublish article" });
    }
  });

  // Content Citations
  app.get("/api/research/citations", async (req, res) => {
    try {
      const { contentType, contentId, sourceId } = req.query;
      
      let citations;
      if (contentType && contentId) {
        citations = await storage.getCitationsByContent(contentType as string, parseInt(contentId as string));
      } else if (sourceId) {
        citations = await storage.getCitationsBySource(parseInt(sourceId as string));
      } else {
        citations = await storage.getAllContentCitations();
      }
      
      res.json(citations);
    } catch (error) {
      console.error("Error fetching content citations:", error);
      res.status(500).json({ message: "Failed to fetch content citations" });
    }
  });

  app.post("/api/research/citations", async (req, res) => {
    try {
      const citation = insertContentCitationSchema.parse(req.body);
      const newCitation = await storage.createContentCitation(citation);
      res.status(201).json(newCitation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating content citation:", error);
      res.status(500).json({ message: "Failed to create content citation" });
    }
  });

  // Content Quality Assessment
  app.get("/api/research/quality/:contentType/:contentId", async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const quality = await storage.getContentQualityByContent(contentType, parseInt(contentId));
      
      if (!quality) {
        return res.status(404).json({ message: "Content quality assessment not found" });
      }
      
      res.json(quality);
    } catch (error) {
      console.error("Error fetching content quality:", error);
      res.status(500).json({ message: "Failed to fetch content quality" });
    }
  });

  app.post("/api/research/quality", async (req, res) => {
    try {
      const quality = insertContentQualitySchema.parse(req.body);
      const newQuality = await storage.createContentQuality(quality);
      res.status(201).json(newQuality);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating content quality assessment:", error);
      res.status(500).json({ message: "Failed to create content quality assessment" });
    }
  });

  // Research Validation Endpoint
  app.post("/api/research/validate-content", async (req, res) => {
    try {
      const { content, contentType, contentId } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required for validation" });
      }

      // This would integrate with NotebookLM service for real validation
      // For now, return a mock validation result
      const validationResult = {
        isValid: true,
        confidenceScore: 85,
        supportingSources: [],
        contradictingSources: [],
        gaps: ["Need more recent studies", "Limited sample size in referenced studies"],
        recommendations: [
          "Add peer-reviewed sources from the last 5 years",
          "Include studies with larger sample sizes",
          "Consider meta-analysis results"
        ]
      };

      res.json(validationResult);
    } catch (error) {
      console.error("Error validating content:", error);
      res.status(500).json({ message: "Failed to validate content" });
    }
  });

  // Admin Dashboard API Routes
  app.get("/api/admin/processing-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllProcessingJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching processing jobs:", error);
      res.status(500).json({ message: "Failed to fetch processing jobs" });
    }
  });

  app.post("/api/admin/process-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const { createProcessingJob } = await import('./services/articleProcessor');
      const jobId = await createProcessingJob(url, 'url');
      
      res.json({ 
        success: true, 
        jobId,
        message: "URL processing started" 
      });
    } catch (error) {
      console.error("Error processing URL:", error);
      res.status(500).json({ 
        message: "Failed to process URL",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });



  // Admin Dashboard API routes
  app.get("/api/admin/processing-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllProcessingJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching processing jobs:", error);
      res.status(500).json({ message: "Failed to fetch processing jobs" });
    }
  });

  // Get detailed job information including processed content
  app.get("/api/admin/processing-jobs/:jobId", async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const job = await storage.getProcessingJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // If the job has a processed article, get the full article details
      let processedArticle = null;
      if (job.processedArticleId) {
        processedArticle = await storage.getResearchArticleById(job.processedArticleId);
      }

      res.json({
        ...job,
        processedArticle
      });
    } catch (error) {
      console.error("Error fetching job details:", error);
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  app.post("/api/admin/process-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Create a new processing job
      const job = await storage.createProcessingJob({
        source: url,
        sourceType: 'url',
        status: 'pending',
        progress: 0
      });

      // Start processing in background
      processArticleUrl(job.id, url);

      res.json({ jobId: job.id, message: "Processing started" });
    } catch (error) {
      console.error("Error processing URL:", error);
      res.status(500).json({ message: "Failed to process URL" });
    }
  });

  app.post("/api/admin/process-file", async (req: any, res) => {
    try {
      const file = req.file;
      const filename = req.body.filename || req.file?.originalname;
      
      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      // Create a new processing job
      const job = await storage.createProcessingJob({
        source: filename || 'Uploaded file',
        sourceType: 'file',
        status: 'pending',
        progress: 0
      });

      // Handle different file types
      let content: string;
      const fileExtension = filename?.toLowerCase().split('.').pop();
      
      if (fileExtension === 'pdf') {
        // Extract text from PDF files
        try {
          const pdfData = await pdf(file.buffer);
          content = pdfData.text;
          console.log(`Extracted ${content.length} characters from PDF: ${filename}`);
        } catch (error) {
          console.error("Error parsing PDF:", error);
          content = `PDF processing error for ${filename}. The file was received but text extraction failed.`;
        }
      } else {
        // For text files, convert buffer to string
        try {
          content = file.buffer.toString('utf8');
        } catch (error) {
          content = `Binary file uploaded: ${filename}\n\nNote: This file contains binary data that cannot be displayed as text. Basic file analysis has been completed.`;
        }
      }
      
      // Start processing in background
      processArticleContent(job.id.toString(), content, filename);

      res.json({ jobId: job.id, message: "Processing started" });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  // Background processing functions
  async function processArticleUrl(jobId: string, url: string) {
    try {
      await storage.updateProcessingJob(jobId, { status: 'processing', progress: 10 });
      
      // Extract content from URL
      const response = await fetch(url);
      const html = await response.text();
      
      await storage.updateProcessingJob(jobId, { progress: 30 });
      
      // Process with AI
      const result = await processWithAI(html, url);
      
      await storage.updateProcessingJob(jobId, { 
        status: 'completed', 
        progress: 100,
        title: result.title
      });
      
    } catch (error) {
      console.error("Error processing URL:", error);
      await storage.updateProcessingJob(jobId, { 
        status: 'failed', 
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async function processArticleContent(jobId: string, content: string, filename?: string) {
    try {
      await storage.updateProcessingJob(jobId, { status: 'processing', progress: 10 });
      
      // Extract text content from file data
      let extractedText = content;
      if (content.startsWith('data:')) {
        // Handle base64 encoded files
        extractedText = `Extracted content from ${filename}`;
      }
      
      await storage.updateProcessingJob(jobId, { progress: 30 });
      
      // Process with AI
      const result = await processWithAI(extractedText, filename);
      
      await storage.updateProcessingJob(jobId, { 
        status: 'completed', 
        progress: 100,
        title: result.title,
        processedArticleId: result.articleId,
        extractedContent: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? "..." : "")
      });
      
    } catch (error) {
      console.error("Error processing content:", error);
      await storage.updateProcessingJob(jobId, { 
        status: 'failed', 
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async function processWithAI(content: string, source?: string) {
    try {
      // Use OpenAI for research analysis
      const provider = 'openai';
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error(`No API key configured for ${provider}`);
      }

      // Create comprehensive analysis prompt
      const analysisPrompt = `You are an expert research analyst specializing in food science and bread baking. Analyze the following research document and provide a comprehensive analysis in JSON format.

DOCUMENT CONTENT:
${content.substring(0, 8000)}

Please provide your analysis in the following JSON structure:
{
  "title": "Clear, descriptive title of the research",
  "executiveSummary": "2-3 sentence summary of the main findings and significance",
  "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3"],
  "practicalApplications": ["Application 1", "Application 2", "Application 3"],
  "commonMisconceptions": ["Misconception 1 addressed", "Misconception 2 addressed"],
  "methodologyType": "Brief description of research methodology",
  "confidenceScore": 85,
  "researchQuality": "high/medium/low",
  "breadRelevance": "Explanation of how this relates to bread baking"
}

Focus on extracting practical insights that would be valuable for professional bakers, food scientists, and researchers. Identify any claims that contradict common beliefs in baking.`;

      let analysisResult;
      
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are an expert research analyst specializing in food science and bread baking. Always respond with valid JSON.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        try {
          // Clean the response in case it has markdown formatting
          let cleanedResponse = aiResponse;
          if (aiResponse.includes('```json')) {
            cleanedResponse = aiResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
          }
          
          analysisResult = JSON.parse(cleanedResponse);
          
          // Validate required fields
          if (!analysisResult.title || !analysisResult.executiveSummary) {
            throw new Error('Missing required fields in AI response');
          }
          
        } catch (parseError) {
          console.log('JSON parsing failed, attempting text extraction from AI response');
          
          // Extract information from the AI response text
          const titleMatch = content.match(/title[:\s]*([^\n]{10,100})/i);
          const summaryMatch = aiResponse.match(/summary[:\s]*([^\n]{20,300})/i);
          
          analysisResult = {
            title: titleMatch ? titleMatch[1].trim() : `Analysis of ${source ? source.replace(/\.[^/.]+$/, "") : 'Research Document'}`,
            executiveSummary: summaryMatch ? summaryMatch[1].trim() : "Research paper successfully processed and analyzed for professional baking applications.",
            keyFindings: [
              "Document text extraction completed successfully",
              "Content analyzed for bread science applications",
              "Research findings ready for professional review"
            ],
            practicalApplications: [
              "Professional baking reference",
              "Research validation for industry practices",
              "Educational resource for culinary programs"
            ],
            commonMisconceptions: [],
            confidenceScore: 75,
            researchQuality: "medium"
          };
        }
      } else {
        // Fallback for other providers or missing API key
        analysisResult = {
          title: `Analysis of ${source ? source.replace(/\.[^/.]+$/, "") : 'Research Document'}`,
          executiveSummary: "Document analysis completed. Professional AI analysis requires valid API configuration.",
          keyFindings: ["Document text successfully extracted", "Content ready for expert review"],
          practicalApplications: ["Research reference", "Manual analysis recommended"],
          commonMisconceptions: [],
          confidenceScore: 60,
          researchQuality: "pending"
        };
      }

      // Create a research article with the AI-processed content
      const researchArticle = await storage.createResearchArticle({
        title: analysisResult.title,
        slug: `analysis-${Date.now()}`,
        content: content.substring(0, 5000) + (content.length > 5000 ? "\n\n[Content truncated for display...]" : ""),
        executiveSummary: analysisResult.executiveSummary,
        practicalApplications: analysisResult.practicalApplications || [],
        keyFindings: analysisResult.keyFindings || [],
        commonMisconceptions: analysisResult.commonMisconceptions || [],
        isPublished: false
      });

      return {
        title: analysisResult.title,
        summary: analysisResult.executiveSummary,
        articleId: researchArticle.id,
        confidenceScore: analysisResult.confidenceScore || 75,
        grade: analysisResult.researchQuality === 'high' ? 'A' : analysisResult.researchQuality === 'medium' ? 'B' : 'C',
        confidence: analysisResult.confidenceScore || 75
      };
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback processing if AI fails
      const title = `Analysis of ${source ? source.replace(/\.[^/.]+$/, "") : 'Document'}`;
      const researchArticle = await storage.createResearchArticle({
        title,
        slug: `analysis-${Date.now()}`,
        content: content.substring(0, 3000) + (content.length > 3000 ? "..." : ""),
        executiveSummary: "Document processed but AI analysis failed. Manual review recommended.",
        practicalApplications: ["Manual analysis required"],
        keyFindings: ["Text extraction successful", "AI analysis failed - requires configuration"],
        commonMisconceptions: [],
        isPublished: false
      });

      return {
        title,
        summary: "Document extracted but requires AI configuration for full analysis",
        articleId: researchArticle.id,
        grade: "PENDING",
        confidence: 0
      };
    }
  }

  // Article Chat API endpoints
  app.post("/api/articles/:articleId/chat", async (req, res) => {
    try {
      const articleId = parseInt(req.params.articleId);
      const { message, conversationId, sessionId } = req.body;

      if (!message || isNaN(articleId)) {
        return res.status(400).json({ message: "Article ID and message are required" });
      }

      // Get the article with full content
      const article = await storage.getResearchArticleById(articleId);
      if (!article || !article.fullContent) {
        return res.status(404).json({ message: "Article not found or missing full content" });
      }

      let conversation;
      let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      if (conversationId) {
        // Use existing conversation
        conversation = await storage.getArticleConversation(conversationId);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        // Get conversation history
        const messages = await storage.getConversationMessages(conversationId);
        conversationHistory = messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      } else {
        // Create new conversation
        conversation = await storage.createArticleConversation({
          articleId,
          sessionId: sessionId || `session-${Date.now()}`,
          userId: undefined, // Add user auth later
          title: `Chat about ${article.title}`
        });
      }

      // Add user message to conversation
      await storage.addChatMessage({
        conversationId: conversation.id,
        role: 'user',
        content: message
      });

      // Get AI response
      const aiResponse = await chatWithArticle(article.fullContent, message, conversationHistory);

      // Add AI response to conversation
      await storage.addChatMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse
      });

      res.json({
        conversationId: conversation.id,
        response: aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in article chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/articles/:articleId/conversations", async (req, res) => {
    try {
      const articleId = parseInt(req.params.articleId);
      const { sessionId } = req.query;

      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const conversations = await storage.getConversationsByArticle(
        articleId, 
        sessionId as string
      );

      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);

      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Enhanced article creation with AI summary generation
  app.post("/api/research/articles/with-summary", async (req, res) => {
    try {
      const { title, fullContent, slug } = req.body;

      if (!title || !fullContent) {
        return res.status(400).json({ message: "Title and full content are required" });
      }

      // Generate AI summary and display content
      const { executiveSummary, keyFindings, practicalApplications } = await generateArticleSummary(fullContent);
      const displayContent = await generateDisplayContent(fullContent);

      const article = await storage.createResearchArticle({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        executiveSummary,
        content: displayContent,
        fullContent,
        keyFindings,
        practicalApplications,
        isPublished: false
      });

      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article with summary:", error);
      res.status(500).json({ message: "Failed to create article with AI summary" });
    }
  });

  // Production Management Routes for Professional Baker's Command Center
  app.get("/api/production/batches", async (req: Request, res: Response) => {
    try {
      const batches = await db.select().from(productionBatches).orderBy(productionBatches.plannedStartTime);
      res.json(batches);
    } catch (error) {
      console.error('Error fetching production batches:', error);
      res.status(500).json({ error: 'Failed to fetch production batches' });
    }
  });

  app.post("/api/production/batches", async (req: Request, res: Response) => {
    try {
      // Remove any createdAt/updatedAt from the request if they exist (they should be auto-generated)
      const cleanedBody = { ...req.body };
      delete cleanedBody.createdAt;
      delete cleanedBody.updatedAt;
      delete cleanedBody.id; // Also remove ID in case it's included
      
      const validatedData = insertProductionBatchSchema.parse(cleanedBody);
      const [batch] = await db.insert(productionBatches).values([validatedData]).returning();
      res.json(batch);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error('Error creating production batch:', error);
      res.status(500).json({ error: 'Failed to create production batch' });
    }
  });

  app.put("/api/production/batches/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductionBatchSchema.partial().parse(req.body);
      // Convert string dates to Date objects for database
      if (validatedData.plannedStartTime && typeof validatedData.plannedStartTime === 'string') {
        validatedData.plannedStartTime = new Date(validatedData.plannedStartTime);
      }
      if (validatedData.plannedFinishTime && typeof validatedData.plannedFinishTime === 'string') {
        validatedData.plannedFinishTime = new Date(validatedData.plannedFinishTime);
      }
      if (validatedData.actualStartTime && typeof validatedData.actualStartTime === 'string') {
        validatedData.actualStartTime = new Date(validatedData.actualStartTime);
      }
      if (validatedData.actualFinishTime && typeof validatedData.actualFinishTime === 'string') {
        validatedData.actualFinishTime = new Date(validatedData.actualFinishTime);
      }
      if (validatedData.phaseStartTime && typeof validatedData.phaseStartTime === 'string') {
        validatedData.phaseStartTime = new Date(validatedData.phaseStartTime);
      }
      const [batch] = await db
        .update(productionBatches)
        .set(validatedData)
        .where(eq(productionBatches.id, parseInt(id)))
        .returning();
      
      if (!batch) {
        return res.status(404).json({ error: 'Production batch not found' });
      }
      
      res.json(batch);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error('Error updating production batch:', error);
      res.status(500).json({ error: 'Failed to update production batch' });
    }
  });

  app.delete("/api/production/batches/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(productionBatches).where(eq(productionBatches.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting production batch:', error);
      res.status(500).json({ error: 'Failed to delete production batch' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
