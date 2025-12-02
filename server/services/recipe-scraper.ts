// Recipe scraper service for extracting recipe data from external websites
import axios from 'axios';
import * as cheerio from 'cheerio';

import { ScrapedRecipe } from '@shared/schema';

// Error type for scraping failures
export class ScraperError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ScraperError';
    this.statusCode = statusCode;
  }
}

/**
 * Extract recipe data from a URL
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  try {
    console.log(`Scraping recipe from URL: ${url}`);
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new ScraperError('Invalid URL format', 400);
    }
    
    // Fetch HTML content with sophisticated headers and retry logic
    let response: any = null; // Initialize with null to handle TypeScript undefined checks
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        // Randomize user agent to avoid detection
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36'
        ];
        
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
          },
          timeout: 15000, // 15 second timeout
          maxRedirects: 5 // Allow up to 5 redirects
        });
        
        // If we got a response, break out of the retry loop
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          // If we've exhausted our retries, throw the original error
          throw error;
        }
        
        console.log(`Attempt ${attempts} failed, retrying after delay...`);
        
        // Wait for a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }
    
    // Check if we actually got a response
    if (!response) {
      throw new ScraperError('Failed to get any response after multiple attempts', 500);
    }
    
    if (response.status !== 200) {
      throw new ScraperError(`Failed to fetch URL: ${response.status} ${response.statusText}`, response.status);
    }
    
    // Check if we have valid HTML data
    if (!response.data) {
      throw new ScraperError('Response contained no data', 500);
    }
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Initialize the recipe object with default values
    const recipe: ScrapedRecipe = {
      title: '',
      ingredients: [],
      instructions: [],
      fullText: $('body').text().replace(/\s+/g, ' ').trim() // Extract full text for fallback analysis
    };
    
    // General extraction approach
    // Look for structured data (JSON-LD)
    const recipeJson = extractStructuredData($);
    if (recipeJson) {
      console.log('Found structured recipe data');
      return recipeJson;
    }
    
    // Try extracting from common recipe formats
    // 1. Look for Schema.org markup
    console.log('Looking for schema.org markup');
    const schemaRecipe = extractSchemaMarkup($);
    if (schemaRecipe.title && (schemaRecipe.ingredients.length > 0 || schemaRecipe.instructions.length > 0)) {
      return schemaRecipe;
    }
    
    // 2. Look for common recipe patterns in HTML
    console.log('Looking for HTML patterns');
    const htmlRecipe = extractFromHtmlPatterns($, url);
    if (htmlRecipe.title && (htmlRecipe.ingredients.length > 0 || htmlRecipe.instructions.length > 0)) {
      return htmlRecipe;
    }
    
    // 3. Fallback - try advanced content analysis
    console.log('Attempting advanced content extraction...');
    const contentRecipe = extractRecipeFromContent($, url);
    if (contentRecipe.title && (contentRecipe.ingredients.length > 0 || contentRecipe.instructions.length > 0)) {
      return contentRecipe;
    }
    
    // 4. Last resort - extract what we can and return with warning
    console.log('Couldn\'t find proper recipe structure, returning basic content');
    const baseTitle = $('title').text() || new URL(url).hostname;
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Return a minimal recipe object with as much content as we could extract
    return {
      title: baseTitle,
      description: $('meta[name="description"]').attr('content') || '',
      ingredients: [],
      instructions: [],
      fullText: bodyText,
      source: new URL(url).hostname.replace('www.', '')
    };
    
  } catch (error) {
    if (error instanceof ScraperError) {
      throw error;
    }
    
    console.error('Recipe scraping error:', error);
    
    // Safely check for response status if it exists
    let statusCode = 500;
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response) {
      statusCode = error.response.status as number;
    }
    
    throw new ScraperError(
      error instanceof Error ? error.message : 'Failed to scrape recipe',
      statusCode
    );
  }
}

/**
 * Extract recipe data from JSON-LD structured data
 */
function extractStructuredData($: cheerio.CheerioAPI): ScrapedRecipe | null {
  try {
    const jsonLdScripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < jsonLdScripts.length; i++) {
      const scriptContent = $(jsonLdScripts[i]).html();
      if (!scriptContent) continue;
      
      try {
        const json = JSON.parse(scriptContent);
        
        // Handle single recipe or graph with multiple items
        const recipeData = extractRecipeFromJsonLd(json);
        if (recipeData) {
          return recipeData;
        }
      } catch (parseError) {
        console.error('Error parsing JSON-LD:', parseError);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting structured data:', error);
    return null;
  }
}

/**
 * Extract recipe from JSON-LD data 
 */
function extractRecipeFromJsonLd(json: any): ScrapedRecipe | null {
  // Handle array with @graph
  if (json['@graph'] && Array.isArray(json['@graph'])) {
    for (const item of json['@graph']) {
      if (item['@type'] === 'Recipe' || 
          (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
        return formatJsonLdRecipe(item);
      }
    }
  }
  
  // Handle direct recipe type
  if (json['@type'] === 'Recipe' || 
      (Array.isArray(json['@type']) && json['@type'].includes('Recipe'))) {
    return formatJsonLdRecipe(json);
  }
  
  // Handle nested recipe within article
  if (json.mainEntity && json.mainEntity['@type'] === 'Recipe') {
    return formatJsonLdRecipe(json.mainEntity);
  }
  
  return null;
}

/**
 * Format JSON-LD recipe data into our standard format
 */
function formatJsonLdRecipe(recipeData: any): ScrapedRecipe {
  const ingredients = Array.isArray(recipeData.recipeIngredient) 
    ? recipeData.recipeIngredient 
    : [];
  
  let instructions: string[] = [];
  if (recipeData.recipeInstructions) {
    if (Array.isArray(recipeData.recipeInstructions)) {
      // Handle different instruction formats
      instructions = recipeData.recipeInstructions.map((instruction: any) => {
        if (typeof instruction === 'string') {
          return instruction;
        } else if (instruction.text) {
          return instruction.text;
        } else if (instruction.itemListElement) {
          return Array.isArray(instruction.itemListElement) 
            ? instruction.itemListElement.map((item: any) => item.text).join(' ')
            : '';
        } else {
          return '';
        }
      }).filter(Boolean);
    } else if (typeof recipeData.recipeInstructions === 'string') {
      instructions = [recipeData.recipeInstructions];
    }
  }
  
  return {
    title: recipeData.name || '',
    description: recipeData.description || '',
    ingredients,
    instructions,
    author: recipeData.author?.name || '',
    source: recipeData.publisher?.name || '',
    imageUrl: Array.isArray(recipeData.image) ? recipeData.image[0] : recipeData.image,
    prepTime: recipeData.prepTime || '',
    cookTime: recipeData.cookTime || '',
    totalTime: recipeData.totalTime || '',
    yield: recipeData.recipeYield ? 
      (Array.isArray(recipeData.recipeYield) ? recipeData.recipeYield[0] : recipeData.recipeYield) : '',
    fullText: JSON.stringify(recipeData) // Store JSON data as fullText for fallback
  };
}

/**
 * Extract recipe from Schema.org markup in attributes/itemprop
 */
function extractSchemaMarkup($: cheerio.CheerioAPI): ScrapedRecipe {
  const recipe: ScrapedRecipe = {
    title: '',
    ingredients: [],
    instructions: []
  };
  
  // Look for title
  recipe.title = $('[itemprop="name"]').first().text().trim() ||
                $('h1').first().text().trim();
  
  // Look for description
  recipe.description = $('[itemprop="description"]').first().text().trim();
  
  // Look for ingredients
  $('[itemprop="recipeIngredient"], [itemprop="ingredients"]').each((_, el) => {
    const ingredient = $(el).text().trim();
    if (ingredient) {
      recipe.ingredients.push(ingredient);
    }
  });
  
  // Look for instructions
  $('[itemprop="recipeInstructions"]').each((_, el) => {
    // Check if this element contains list items
    const listItems = $(el).find('li');
    if (listItems.length > 0) {
      listItems.each((_, item) => {
        const step = $(item).text().trim();
        if (step) {
          recipe.instructions.push(step);
        }
      });
    } else {
      // It might be a text block with instructions
      const step = $(el).text().trim();
      if (step) {
        // Try to split by numbers at beginning of lines or by paragraphs
        const parts = step.split(/\s*[\r\n]+\s*|\s*\d+\.\s+/g).filter(Boolean);
        if (parts.length > 1) {
          recipe.instructions = recipe.instructions.concat(parts);
        } else {
          recipe.instructions.push(step);
        }
      }
    }
  });
  
  // Get author
  recipe.author = $('[itemprop="author"]').first().text().trim();
  
  // Get image
  const imageEl = $('[itemprop="image"]');
  recipe.imageUrl = imageEl.is('img') 
    ? imageEl.attr('src') 
    : imageEl.find('img').first().attr('src');
  
  // Get times
  recipe.prepTime = $('[itemprop="prepTime"]').first().text().trim();
  recipe.cookTime = $('[itemprop="cookTime"]').first().text().trim();
  recipe.totalTime = $('[itemprop="totalTime"]').first().text().trim();
  
  // Get yield
  recipe.yield = $('[itemprop="recipeYield"]').first().text().trim();
  
  // Add full text for fallback analysis
  recipe.fullText = $('body').text().replace(/\s+/g, ' ').trim();
  
  return recipe;
}

/**
 * Extract recipe data from common HTML patterns
 */
function extractFromHtmlPatterns($: cheerio.CheerioAPI, url: string): ScrapedRecipe {
  const recipe: ScrapedRecipe = {
    title: '',
    ingredients: [],
    instructions: []
  };
  
  // Extract source and domain
  try {
    const urlObj = new URL(url);
    recipe.source = urlObj.hostname.replace('www.', '');
  } catch (e) {
    // Invalid URL, ignore
  }
  
  // Try to get title
  recipe.title = $('h1').first().text().trim() ||
                $('.recipe-title, .entry-title, .post-title').first().text().trim();
  
  // Look for common ingredient containers
  const ingredientSelectors = [
    '.ingredients',
    '.ingredient-list',
    '.recipe-ingredients',
    '.wprm-recipe-ingredients-container',
    '[class*="ingredient"]',
    'ul:contains("cup"), ul:contains("tablespoon"), ul:contains("teaspoon")'
  ];
  
  for (const selector of ingredientSelectors) {
    const $ingredientContainer = $(selector);
    if ($ingredientContainer.length) {
      // Check if it contains list items
      const $listItems = $ingredientContainer.find('li');
      if ($listItems.length) {
        $listItems.each((_, item) => {
          const ingredient = $(item).text().trim();
          if (ingredient && !recipe.ingredients.includes(ingredient)) {
            recipe.ingredients.push(ingredient);
          }
        });
      } else {
        // Might be paragraphs or other elements
        const $children = $ingredientContainer.children('p, div');
        if ($children.length) {
          $children.each((_, child) => {
            const ingredient = $(child).text().trim();
            if (ingredient && !recipe.ingredients.includes(ingredient)) {
              recipe.ingredients.push(ingredient);
            }
          });
        } else {
          // Get text content and try to split by lines
          const text = $ingredientContainer.text().trim();
          const lines = text.split(/[\r\n]+/).map(line => line.trim()).filter(Boolean);
          for (const line of lines) {
            if (!recipe.ingredients.includes(line)) {
              recipe.ingredients.push(line);
            }
          }
        }
      }
      
      // If we found ingredients, break out
      if (recipe.ingredients.length > 0) break;
    }
  }
  
  // Look for common instruction containers
  const instructionSelectors = [
    '.instructions',
    '.recipe-instructions',
    '.recipe-directions',
    '.wprm-recipe-instructions',
    '.method-steps',
    '.prep-steps',
    '.directions',
    '[class*="instruction"], [class*="direction"]'
  ];
  
  for (const selector of instructionSelectors) {
    const $instructionContainer = $(selector);
    if ($instructionContainer.length) {
      // Check if it contains list items
      const $listItems = $instructionContainer.find('li');
      if ($listItems.length) {
        $listItems.each((_, item) => {
          const step = $(item).text().trim();
          if (step && !recipe.instructions.includes(step)) {
            recipe.instructions.push(step);
          }
        });
      } else {
        // Might be paragraphs or other elements
        const $children = $instructionContainer.children('p, div');
        if ($children.length) {
          $children.each((_, child) => {
            const step = $(child).text().trim();
            if (step && !recipe.instructions.includes(step)) {
              recipe.instructions.push(step);
            }
          });
        } else {
          // Get text content and try to split by numbered lines or paragraphs
          const text = $instructionContainer.text().trim();
          const steps = text
            .split(/[\r\n]+|\d+\.\s+/)
            .map(step => step.trim())
            .filter(Boolean);
          
          for (const step of steps) {
            if (!recipe.instructions.includes(step)) {
              recipe.instructions.push(step);
            }
          }
        }
      }
      
      // If we found instructions, break out
      if (recipe.instructions.length > 0) break;
    }
  }
  
  // Try to extract the description from meta tags or common elements
  const metaDescription = $('meta[name="description"]').attr('content');
  if (metaDescription) {
    recipe.description = metaDescription;
  } else {
    const $description = $('.recipe-summary, .recipe-description, .entry-content p').first();
    if ($description.length) {
      recipe.description = $description.text().trim();
    }
  }
  
  // Try to find image
  const $image = $('.recipe-image img, .wp-post-image, .post-thumbnail img').first();
  if ($image.length) {
    recipe.imageUrl = $image.attr('src') || $image.attr('data-src') || '';
  }
  
  // Add full text for fallback analysis
  recipe.fullText = $('body').text().replace(/\s+/g, ' ').trim();
  
  return recipe;
}

/**
 * Advanced extraction method for content-based recipe detection
 * This method uses heuristics to identify recipe parts in the page content
 */
function extractRecipeFromContent($: cheerio.CheerioAPI, url: string): ScrapedRecipe {
  const recipe: ScrapedRecipe = {
    title: '',
    ingredients: [],
    instructions: []
  };
  
  // Get the page title
  recipe.title = $('title').text().trim();
  
  // Look for h1 elements as potential recipe titles
  const h1s = $('h1');
  if (h1s.length > 0) {
    // Prefer the first h1 in the content area if possible
    recipe.title = h1s.first().text().trim();
  }
  
  // Get source from URL
  try {
    const urlObj = new URL(url);
    recipe.source = urlObj.hostname.replace('www.', '');
  } catch (e) {
    // Invalid URL, ignore
  }
  
  // Find all lists (ul/ol) and analyze them
  const lists = $('ul, ol');
  
  lists.each((_, list) => {
    const listText = $(list).text().toLowerCase();
    
    // Check if this list has ingredient-like content
    const hasIngredientTerms = ['flour', 'water', 'salt', 'sugar', 'cup', 'tbsp', 'tsp', 'tablespoon', 'teaspoon'].some(term => 
      listText.includes(term)
    );
    
    if (hasIngredientTerms) {
      $(list).find('li').each((_, item) => {
        const text = $(item).text().trim();
        if (text && !recipe.ingredients.includes(text)) {
          recipe.ingredients.push(text);
        }
      });
    }
    
    // Check if this list has instruction-like content
    const hasInstructionTerms = ['mix', 'stir', 'fold', 'bake', 'cook', 'add', 'combine', 'knead'].some(term => 
      listText.includes(term)
    );
    
    // If it contains instruction keywords or numbered steps
    if (hasInstructionTerms || $(list).is('ol')) {
      $(list).find('li').each((_, item) => {
        const text = $(item).text().trim();
        if (text && !recipe.instructions.includes(text)) {
          recipe.instructions.push(text);
        }
      });
    }
  });
  
  // If no ingredients found, try extracting from paragraphs
  if (recipe.ingredients.length === 0) {
    // Look for sections that might contain ingredients
    $('p, div').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('ingredient') || text.includes('you will need')) {
        // Found a potential ingredients section
        const nextEl = $(el).next();
        if (nextEl.length) {
          const nextText = nextEl.text().trim();
          if (nextText) {
            // Split by line breaks or commas
            const lines = nextText.split(/[\r\n,]+/).map(line => line.trim()).filter(Boolean);
            for (const line of lines) {
              if (!recipe.ingredients.includes(line)) {
                recipe.ingredients.push(line);
              }
            }
          }
        }
      }
    });
  }
  
  // If no instructions found, try extracting from paragraphs with step-like format
  if (recipe.instructions.length === 0) {
    // Look for sections that might contain steps
    $('p, div').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('step') || text.includes('instruction') || text.includes('method') || text.includes('direction')) {
        // Found a potential instructions section
        const nextElements = [];
        let next = $(el).next();
        // Collect the next few elements
        for (let i = 0; i < 5 && next.length; i++) {
          nextElements.push(next);
          next = next.next();
        }
        
        // Process the next elements
        for (const nextEl of nextElements) {
          const nextText = nextEl.text().trim();
          if (nextText) {
            if (nextText.match(/^\d+\.\s+/)) {
              // Numbered step
              recipe.instructions.push(nextText);
            } else if (nextText.length > 30 && 
                      (nextText.includes(' the ') || nextText.includes(' and ') || nextText.includes(' your '))) {
              // Looks like an instruction paragraph
              recipe.instructions.push(nextText);
            }
          }
        }
      }
    });
  }
  
  // Extract description from meta tags
  recipe.description = $('meta[name="description"]').attr('content') || '';
  
  // Look for the first large image as potential recipe image
  const mainImage = $('img[src*="recipe"], img[src*="food"], img[src*="dish"], img.hero-image, .featured-image img').first();
  if (mainImage.length) {
    recipe.imageUrl = mainImage.attr('src');
  }
  
  // Store the full page text for fallback analysis
  recipe.fullText = $('body').text().replace(/\s+/g, ' ').trim();
  
  return recipe;
}

/**
 * Analyze recipe to extract sourdough-specific information
 */
interface RecipeAnalysis {
  hasStarter: boolean;
  starterAmount: number;
  totalFlour: number;
  totalWater: number;
  hydrationEstimate: number;
  saltAmount: number;
  saltPercentage: number;
  fermentationTime: string;
  technique: string[];
}

export function analyzeRecipe(recipe: ScrapedRecipe): RecipeAnalysis {
  // Initialize analysis object with default values
  const analysis: RecipeAnalysis = {
    hasStarter: false,
    starterAmount: 0,
    totalFlour: 0,
    totalWater: 0,
    hydrationEstimate: 0,
    saltAmount: 0,
    saltPercentage: 0,
    fermentationTime: '',
    technique: []
  };
  
  // Look for sourdough starter in ingredients
  const starterKeywords = ['starter', 'levain', 'mother', 'culture', 'sourdough', 'wild yeast', 'natural leaven'];
  const saltKeywords = ['salt', 'sea salt', 'kosher salt', 'fine salt', 'table salt', 'sel'];
  const flourKeywords = ['flour', 'bread flour', 'all-purpose flour', 'all purpose flour', 'whole wheat', 'rye', 'spelt', 'einkorn', 'semolina', 'tipo 00', 'tipo 0', 'farina'];
  const waterKeywords = ['water', 'h2o', 'liquid', 'filtered water', 'spring water', 'tap water', 'eau'];
  
  let starterLine = '';
  let saltLine = '';
  
  // First pass to identify key ingredients
  for (const ingredient of recipe.ingredients) {
    const lowerIng = ingredient.toLowerCase();
    
    // Check for starter
    if (!starterLine && starterKeywords.some(keyword => lowerIng.includes(keyword))) {
      analysis.hasStarter = true;
      starterLine = ingredient;
    }
    
    // Check for salt
    if (!saltLine && saltKeywords.some(keyword => lowerIng.includes(keyword))) {
      saltLine = ingredient;
    }
  }
  
  // Extract amounts if possible
  if (starterLine) {
    // Try to extract amounts in grams first
    const gramMatch = starterLine.match(/(\d+(?:\.\d+)?)\s*(?:g|grams|gram)/i);
    // Then try ounces if no gram match
    const ozMatch = !gramMatch && starterLine.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/i);
    // Then try cups for volume measurements
    const cupMatch = !gramMatch && !ozMatch && starterLine.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:cup|cups|c\.)/i);
    
    if (gramMatch) {
      analysis.starterAmount = parseFloat(gramMatch[1]);
    } else if (ozMatch) {
      // Convert oz to grams (1 oz ≈ 28.35g)
      analysis.starterAmount = parseFloat(ozMatch[1]) * 28.35;
    } else if (cupMatch) {
      // Handle fractions in cups
      const cupAmount = cupMatch[1];
      let amount = 0;
      
      if (cupAmount.includes('/')) {
        // Handle mixed numbers like "1 1/2" or "1-1/2"
        if (cupAmount.match(/\d+[\s-]\d+\/\d+/)) {
          const parts = cupAmount.split(/[\s-]/);
          const whole = parseFloat(parts[0]);
          const fraction = parts[1].split('/');
          amount = whole + (parseFloat(fraction[0]) / parseFloat(fraction[1]));
        } else {
          // Simple fraction
          const fraction = cupAmount.split('/');
          amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
        }
      } else {
        amount = parseFloat(cupAmount);
      }
      
      // 1 cup starter ≈ 240g
      analysis.starterAmount = amount * 240;
    }
  }
  
  if (saltLine) {
    // Try to extract amounts in grams first
    const gramMatch = saltLine.match(/(\d+(?:\.\d+)?)\s*(?:g|grams|gram)/i);
    // Then try ounces if no gram match
    const ozMatch = !gramMatch && saltLine.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/i);
    // Try teaspoons for salt
    const tspMatch = !gramMatch && !ozMatch && saltLine.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:tsp|teaspoon)/i);
    // Try tablespoons for salt
    const tbspMatch = !gramMatch && !ozMatch && !tspMatch && saltLine.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:tbsp|tablespoon|tbl|tbs)/i);
    
    if (gramMatch) {
      analysis.saltAmount = parseFloat(gramMatch[1]);
    } else if (ozMatch) {
      // Convert oz to grams
      analysis.saltAmount = parseFloat(ozMatch[1]) * 28.35;
    } else if (tspMatch) {
      // Handle possible fractions in teaspoons
      const tspAmount = tspMatch[1];
      let amount = 0;
      
      if (tspAmount.includes('/')) {
        // Handle mixed numbers
        if (tspAmount.match(/\d+[\s-]\d+\/\d+/)) {
          const parts = tspAmount.split(/[\s-]/);
          const whole = parseFloat(parts[0]);
          const fraction = parts[1].split('/');
          amount = whole + (parseFloat(fraction[0]) / parseFloat(fraction[1]));
        } else {
          // Simple fraction
          const fraction = tspAmount.split('/');
          amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
        }
      } else {
        amount = parseFloat(tspAmount);
      }
      
      // 1 tsp salt ≈ 6g
      analysis.saltAmount = amount * 6;
    } else if (tbspMatch) {
      // Handle possible fractions in tablespoons
      const tbspAmount = tbspMatch[1];
      let amount = 0;
      
      if (tbspAmount.includes('/')) {
        // Handle mixed numbers
        if (tbspAmount.match(/\d+[\s-]\d+\/\d+/)) {
          const parts = tbspAmount.split(/[\s-]/);
          const whole = parseFloat(parts[0]);
          const fraction = parts[1].split('/');
          amount = whole + (parseFloat(fraction[0]) / parseFloat(fraction[1]));
        } else {
          // Simple fraction
          const fraction = tbspAmount.split('/');
          amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
        }
      } else {
        amount = parseFloat(tbspAmount);
      }
      
      // 1 tbsp salt ≈ 18g
      analysis.saltAmount = amount * 18;
    }
  }
  
  // If we didn't find salt in a specific line, try to find it in all ingredients
  if (analysis.saltAmount === 0) {
    for (const ingredient of recipe.ingredients) {
      const lowerIng = ingredient.toLowerCase();
      
      if (saltKeywords.some(keyword => lowerIng.includes(keyword))) {
        // Try to extract amounts in grams first
        const gramMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(?:g|grams|gram)/i);
        // Then try ounces if no gram match
        const ozMatch = !gramMatch && ingredient.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/i);
        // Try teaspoons for salt
        const tspMatch = !gramMatch && !ozMatch && ingredient.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:tsp|teaspoon)/i);
        // Try tablespoons for salt
        const tbspMatch = !gramMatch && !ozMatch && !tspMatch && ingredient.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:tbsp|tablespoon|tbl|tbs)/i);
        
        if (gramMatch) {
          analysis.saltAmount = parseFloat(gramMatch[1]);
          break;
        } else if (ozMatch) {
          // Convert oz to grams
          analysis.saltAmount = parseFloat(ozMatch[1]) * 28.35;
          break;
        } else if (tspMatch) {
          // Extract teaspoon amount
          const tspAmount = tspMatch[1];
          let amount = 0;
          
          if (tspAmount.includes('/')) {
            if (tspAmount.match(/\d+[\s-]\d+\/\d+/)) {
              const parts = tspAmount.split(/[\s-]/);
              const whole = parseFloat(parts[0]);
              const fraction = parts[1].split('/');
              amount = whole + (parseFloat(fraction[0]) / parseFloat(fraction[1]));
            } else {
              const fraction = tspAmount.split('/');
              amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
            }
          } else {
            amount = parseFloat(tspAmount);
          }
          
          // 1 tsp salt ≈ 6g
          analysis.saltAmount = amount * 6;
          break;
        } else if (tbspMatch) {
          // Extract tablespoon amount
          const tbspAmount = tbspMatch[1];
          let amount = 0;
          
          if (tbspAmount.includes('/')) {
            if (tbspAmount.match(/\d+[\s-]\d+\/\d+/)) {
              const parts = tbspAmount.split(/[\s-]/);
              const whole = parseFloat(parts[0]);
              const fraction = parts[1].split('/');
              amount = whole + (parseFloat(fraction[0]) / parseFloat(fraction[1]));
            } else {
              const fraction = tbspAmount.split('/');
              amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
            }
          } else {
            amount = parseFloat(tbspAmount);
          }
          
          // 1 tbsp salt ≈ 18g
          analysis.saltAmount = amount * 18;
          break;
        }
      }
    }
  }
  
  // Look for flour and water amounts to calculate hydration
  let totalFlour = 0;
  let totalWater = 0;
  
  for (const ingredient of recipe.ingredients) {
    const lowerIng = ingredient.toLowerCase();
    
    // Try to extract amounts in grams first
    const gramMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(?:g|grams|gram)/i);
    // Then try ounces if no gram match
    const ozMatch = !gramMatch && ingredient.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/i);
    // Then try cups for liquid measurements
    const cupMatch = !gramMatch && !ozMatch && ingredient.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:cup|cups|c\.)/i);
    // Try tablespoons and teaspoons
    const tbspMatch = !gramMatch && !ozMatch && !cupMatch && ingredient.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:tbsp|tablespoon|tbl|tbs)/i);
    const tspMatch = !gramMatch && !ozMatch && !cupMatch && !tbspMatch && ingredient.match(/(\d+(?:[\s-]?\d+\/\d+)?|\d+\.\d+)\s*(?:tsp|teaspoon)/i);
    // Try ml for metric liquid
    const mlMatch = !gramMatch && ingredient.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliter|millilitre)/i);
    
    // Calculate amount based on matched unit
    let amount = 0;
    if (gramMatch) {
      amount = parseFloat(gramMatch[1]);
    } else if (ozMatch) {
      // Convert oz to grams (1 oz ≈ 28.35g)
      amount = parseFloat(ozMatch[1]) * 28.35;
    } else if (mlMatch) {
      // For water, 1ml = 1g
      amount = parseFloat(mlMatch[1]);
    } else if (cupMatch) {
      // Handle fractions in cups
      const cupAmount = cupMatch[1];
      if (cupAmount.includes('/')) {
        // Handle mixed numbers like "1 1/2" or "1-1/2"
        if (cupAmount.match(/\d+[\s-]\d+\/\d+/)) {
          const parts = cupAmount.split(/[\s-]/);
          const whole = parseFloat(parts[0]);
          const fraction = parts[1].split('/');
          amount = whole + (parseFloat(fraction[0]) / parseFloat(fraction[1]));
        } else {
          // Simple fraction
          const fraction = cupAmount.split('/');
          amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
        }
      } else {
        amount = parseFloat(cupAmount);
      }
      
      // Convert cups to grams based on ingredient
      if (flourKeywords.some(keyword => lowerIng.includes(keyword))) {
        // 1 cup flour ≈ 120-130g (using 125g as average)
        amount *= 125;
      } else if (waterKeywords.some(keyword => lowerIng.includes(keyword))) {
        // 1 cup water = 237ml = 237g
        amount *= 237;
      }
    } else if (tbspMatch) {
      // Handle possible fractions in tablespoons
      const tbspAmount = tbspMatch[1];
      if (tbspAmount.includes('/')) {
        const fraction = tbspAmount.split('/');
        amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
      } else {
        amount = parseFloat(tbspAmount);
      }
      
      // 1 tablespoon water = 15ml = 15g
      if (waterKeywords.some(keyword => lowerIng.includes(keyword))) {
        amount *= 15;
      }
    } else if (tspMatch) {
      // Handle possible fractions in teaspoons
      const tspAmount = tspMatch[1];
      if (tspAmount.includes('/')) {
        const fraction = tspAmount.split('/');
        amount = parseFloat(fraction[0]) / parseFloat(fraction[1]);
      } else {
        amount = parseFloat(tspAmount);
      }
      
      // 1 teaspoon water = 5ml = 5g
      if (waterKeywords.some(keyword => lowerIng.includes(keyword))) {
        amount *= 5;
      }
    }
    
    // If we have an amount, categorize the ingredient
    if (amount > 0) {
      // Check if it's flour
      if (flourKeywords.some(keyword => lowerIng.includes(keyword))) {
        totalFlour += amount;
      }
      
      // Check if it's water or liquid that contributes to hydration
      if (waterKeywords.some(keyword => lowerIng.includes(keyword))) {
        totalWater += amount;
      } else if (lowerIng.includes('milk') || lowerIng.includes('buttermilk')) {
        // Milk is about 90% water
        totalWater += amount * 0.9;
      } else if (lowerIng.includes('yogurt') || lowerIng.includes('yoghurt')) {
        // Yogurt is about 85% water
        totalWater += amount * 0.85;
      } else if (lowerIng.includes('egg')) {
        // Eggs are about 75% water
        // Assuming an average egg is about 50g
        totalWater += amount * 0.75;
      }
    }
  }
  
  analysis.totalFlour = totalFlour;
  analysis.totalWater = totalWater;
  
  // Calculate hydration if we have flour and water
  if (totalFlour > 0 && totalWater > 0) {
    analysis.hydrationEstimate = Math.round((totalWater / totalFlour) * 100);
  }
  
  // Calculate salt percentage if we have salt and flour
  if (analysis.saltAmount > 0 && totalFlour > 0) {
    analysis.saltPercentage = Math.round((analysis.saltAmount / totalFlour) * 100 * 10) / 10;
  }
  
  // Look for techniques in the instructions
  const techniques = [
    { name: 'Stretch and fold', keywords: ['stretch', 'fold'] },
    { name: 'Autolyse', keywords: ['autolyse', 'rest', 'hydrate'] },
    { name: 'Cold fermentation', keywords: ['refrigerator', 'fridge', 'cold', 'overnight'] },
    { name: 'Dutch oven', keywords: ['dutch oven', 'covered pot', 'cast iron', 'lid'] },
    { name: 'Scoring', keywords: ['score', 'slash', 'cut', 'pattern'] },
    { name: 'Bulk fermentation', keywords: ['bulk', 'rise', 'ferment'] }
  ];
  
  // Check instructions for techniques
  const instructionText = recipe.instructions.join(' ').toLowerCase();
  
  // Fix the type issues by creating a properly typed array
  const techniquesFound: string[] = [];
  
  for (const technique of techniques) {
    if (technique.keywords.some(keyword => instructionText.includes(keyword))) {
      techniquesFound.push(technique.name);
    }
  }
  
  analysis.technique = techniquesFound;
  
  // Try to estimate total fermentation time from instructions
  if (instructionText.includes('overnight')) {
    analysis.fermentationTime = 'Overnight (8-12 hours)';
  } else if (instructionText.includes('refrigerator') || instructionText.includes('fridge')) {
    analysis.fermentationTime = 'Cold fermentation (12+ hours)';
  } else {
    // Look for specific time mentions
    const hourMatches = instructionText.match(/(\d+)(?:-(\d+))?\s*hours?/g);
    if (hourMatches && hourMatches.length > 0) {
      analysis.fermentationTime = hourMatches.join(', ');
    }
  }
  
  return analysis;
}