import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedRecipe } from '../../shared/schema';
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Scrape and extract recipe data from a URL
 * Uses a combination of HTML parsing with cheerio and 
 * OpenAI for content extraction when structured data is unavailable
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe | null> {
  try {
    // Fetch the HTML content with proper headers to avoid blocking
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Check if the page contains anti-scraping measures
    const pageTitle = $('title').text().toLowerCase();
    const bodyText = $('body').text().toLowerCase();
    
    if (pageTitle.includes('access denied') || 
        pageTitle.includes('blocked') || 
        pageTitle.includes('403') || 
        pageTitle.includes('cloudflare') ||
        bodyText.includes('access denied') ||
        bodyText.includes('cloudflare') ||
        bodyText.includes('please enable javascript') ||
        bodyText.includes('bot protection') ||
        response.status === 403) {
      throw new Error('SCRAPING_BLOCKED');
    }
    
    // Try to extract basic recipe info
    const title = $('h1').first().text().trim() || 
                 $('title').text().trim() || 
                 'Untitled Recipe';
    
    // Initialize recipe object
    const recipe: ScrapedRecipe = {
      title,
      ingredients: [],
      instructions: [],
      description: '',
      source: url
    };
    
    // Try to extract image URL
    const imgSrc = $('meta[property="og:image"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content');
    if (imgSrc) {
      recipe.imageUrl = imgSrc;
    }
    
    // Try to extract from JSON-LD structured data first
    const jsonLdScripts = $('script[type="application/ld+json"]');
    jsonLdScripts.each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '{}');
        const recipes = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        for (const item of recipes) {
          if (item['@type'] === 'Recipe' || (item['@graph'] && item['@graph'].some((g: any) => g['@type'] === 'Recipe'))) {
            const recipeData = item['@type'] === 'Recipe' ? item : item['@graph'].find((g: any) => g['@type'] === 'Recipe');
            
            if (recipeData) {
              // Extract ingredients
              if (recipeData.recipeIngredient && Array.isArray(recipeData.recipeIngredient)) {
                recipe.ingredients = recipeData.recipeIngredient.map((ing: any) => 
                  typeof ing === 'string' ? ing.trim() : ing.text || ing.name || String(ing)
                ).filter(Boolean);
              }
              
              // Extract instructions
              if (recipeData.recipeInstructions && Array.isArray(recipeData.recipeInstructions)) {
                recipe.instructions = recipeData.recipeInstructions.map((inst: any) => {
                  if (typeof inst === 'string') return inst.trim();
                  if (inst.text) return inst.text.trim();
                  if (inst.name) return inst.name.trim();
                  return String(inst).trim();
                }).filter(Boolean);
              }
              
              // Extract description
              if (recipeData.description) {
                recipe.description = recipeData.description.trim();
              }
              
              // If we found structured data, we can return early
              if (recipe.ingredients.length > 0 || recipe.instructions.length > 0) {
                return recipe;
              }
            }
          }
        }
      } catch (e) {
        // Continue if JSON parsing fails
      }
    });
    
    // Try to extract ingredients from common patterns
    const ingredientSelectors = [
      '.wprm-recipe-ingredients li', // WP Recipe Maker
      '.wprm-recipe-ingredient', // WP Recipe Maker
      '.recipe-ingredients li', '.ingredients li', 
      '[itemprop="recipeIngredient"]', '.ingredient-list li',
      '.ingredient', '#ingredients li',
      '.ingredient-section li', // King Arthur Baking
      '.recipe__ingredients li', // Many recipe sites  
      '.recipe-ingredients__ingredient', // NYT Cooking
      '.recipe-ingredients__list li' // Food Network
    ];
    
    for (const selector of ingredientSelectors) {
      const $ingredients = $(selector);
      if ($ingredients.length > 0) {
        $ingredients.each((_, el) => {
          const text = $(el).text().trim();
          if (text && !recipe.ingredients.includes(text)) {
            recipe.ingredients.push(text);
          }
        });
        break; // Stop after finding ingredients with the first successful selector
      }
    }
    
    // Try to extract instructions from common patterns
    const instructionSelectors = [
      '.wprm-recipe-instructions li', // WP Recipe Maker
      '.wprm-recipe-instruction', // WP Recipe Maker
      '.recipe-directions li', '.instructions li', 
      '[itemprop="recipeInstructions"]', '.instruction-list li',
      '.direction', '#directions li', '.steps li',
      '.recipe__instructions li', // Many recipe sites
      '.directions-section li', // King Arthur Baking
      '.recipe-method__list li', // Food Network
      '.preparation-steps li', // BBC Good Food
      '.recipe-steps li' // Bon Appetit
    ];
    
    for (const selector of instructionSelectors) {
      const $instructions = $(selector);
      if ($instructions.length > 0) {
        $instructions.each((_, el) => {
          const text = $(el).text().trim();
          if (text && !recipe.instructions.includes(text)) {
            recipe.instructions.push(text);
          }
        });
        break; // Stop after finding instructions with the first successful selector
      }
    }
    
    // If structured data wasn't found, extract relevant text for fallback
    // This will be used with AI to parse more complex or non-standard recipe formats
    if (recipe.ingredients.length === 0 || recipe.instructions.length === 0) {
      // First remove iframes, scripts, styles and other non-content elements
      $('iframe, script, style, noscript, svg, form, header, footer, nav, .navbar, .navigation, .ad, .ads, .advertisement').remove();
      
      // Get the main content text (likely to be recipe related)
      let mainContent = '';
      
      // Look for recipe content container first
      const recipeContainers = [
        '.wprm-recipe-container', '.wprm-recipe', // WP Recipe Maker
        '.recipe-content', '.recipe-container', '.recipe', '.recipe-main', 
        '#recipe', '.content-recipe', '.post-content', 'article', '.entry-content',
        '.recipe-body', '.recipe-instructions'
      ];
      
      let foundContent = false;
      for (const container of recipeContainers) {
        if ($(container).length > 0) {
          mainContent = $(container).text().trim();
          foundContent = true;
          break;
        }
      }
      
      // If no recipe container found, use body text
      if (!foundContent) {
        mainContent = $('body').text().trim();
      }
      
      // Clean up the text - remove multiple spaces, line breaks, etc.
      mainContent = mainContent
        .replace(/\s+/g, ' ')         // Replace multiple spaces with a single space
        .replace(/\n\s*\n/g, '\n')    // Remove multiple blank lines
        .trim();
      
      recipe.fullText = mainContent.substring(0, 8000); // Limit to 8000 chars for API limit reasons
      
      // Use OpenAI to extract recipe information from unstructured text
      await enhanceWithAI(recipe);
      
      // If AI extraction also failed, provide the full text for manual analysis
      if (recipe.ingredients.length === 0 && recipe.instructions.length === 0 && recipe.fullText) {
        console.log('Recipe extraction failed for URL:', url);
        console.log('Full text length:', recipe.fullText.length);
        console.log('Full text preview:', recipe.fullText.substring(0, 500));
      }
    }
    
    return recipe;
  } catch (error) {
    console.error('Error scraping recipe:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'SCRAPING_BLOCKED') {
        throw new Error('SCRAPING_BLOCKED');
      }
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('TIMEOUT');
      }
      if (error.response?.status === 403) {
        throw new Error('SCRAPING_BLOCKED');
      }
      if (error.response?.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (error.response?.status >= 500) {
        throw new Error('SERVER_ERROR');
      }
    }
    
    throw new Error('SCRAPING_FAILED');
  }
}

/**
 * Use OpenAI to enhance the recipe extraction when standard HTML parsing fails
 */
async function enhanceWithAI(recipe: ScrapedRecipe): Promise<void> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, skipping AI enhancement');
      return;
    }
    
    // Only proceed with AI extraction if we have fullText and are missing data
    if (!recipe.fullText || (recipe.ingredients.length > 0 && recipe.instructions.length > 0)) {
      return;
    }
    
    // Using GPT-4o for better recipe extraction accuracy
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a recipe extraction expert. Extract the recipe ingredients and instructions from the provided text. Focus on finding the actual recipe content, ignoring advertisements, comments, and navigation elements. Format your response as valid JSON with these keys: ingredients (array of strings), instructions (array of strings), description (string). Only include these keys in your response.",
        },
        {
          role: "user",
          content: `Extract the recipe from this text: ${recipe.fullText || ""}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    
    try {
      // Handle null content by providing a default empty JSON object
      const messageContent = response.choices[0].message.content;
      const content = messageContent !== null ? messageContent : "{}";
      const result = JSON.parse(content);
      
      // Update recipe with AI-extracted content if available
      if (result.ingredients && Array.isArray(result.ingredients) && result.ingredients.length > 0) {
        recipe.ingredients = result.ingredients;
      }
      
      if (result.instructions && Array.isArray(result.instructions) && result.instructions.length > 0) {
        recipe.instructions = result.instructions;
      }
      
      if (result.description) {
        recipe.description = result.description;
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }
  } catch (error) {
    console.error('Error enhancing recipe with AI:', error);
  }
}