import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * A service to fetch and extract recipe content from various websites
 */
class WebScraperService {
  
  /**
   * Fetches a URL and returns the HTML content
   */
  async fetchUrl(url: string): Promise<string> {
    try {
      // Set a reasonable timeout (10 seconds)
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          // Set a user agent to avoid being blocked by some sites
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching URL:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Request timed out while fetching the recipe page');
      } else if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Failed to fetch recipe: HTTP ${error.response.status}`);
      }
      throw new Error('Failed to fetch recipe from the provided URL');
    }
  }

  /**
   * Extracts recipe data from HTML content
   * Uses heuristics to find recipe-related content
   */
  extractRecipeData(html: string): {
    title?: string;
    ingredients?: string[];
    instructions?: string[];
    fullText: string;
  } {
    const $ = cheerio.load(html);
    let title = '';
    let ingredients: string[] = [];
    let instructions: string[] = [];
    let fullText = '';

    // Try to find the recipe title
    title = $('h1').first().text().trim();
    
    // Extract recipe data using common recipe page patterns
    
    // Look for structured data (JSON-LD)
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript);
        if (jsonLd['@type'] === 'Recipe' || (Array.isArray(jsonLd['@graph']) && 
            jsonLd['@graph'].some((item: any) => item['@type'] === 'Recipe'))) {
          
          // Extract from JSON-LD
          const recipeData = jsonLd['@type'] === 'Recipe' ? 
            jsonLd : 
            jsonLd['@graph'].find((item: any) => item['@type'] === 'Recipe');
          
          if (recipeData) {
            if (!title && recipeData.name) title = recipeData.name;
            
            if (recipeData.recipeIngredient && Array.isArray(recipeData.recipeIngredient)) {
              ingredients = recipeData.recipeIngredient.map((i: string) => i.trim()).filter(Boolean);
            }
            
            if (recipeData.recipeInstructions) {
              if (Array.isArray(recipeData.recipeInstructions)) {
                instructions = recipeData.recipeInstructions
                  .map((i: any) => (typeof i === 'string' ? i : i.text))
                  .filter(Boolean)
                  .map((i: string) => i.trim());
              } else if (typeof recipeData.recipeInstructions === 'string') {
                instructions = recipeData.recipeInstructions
                  .split('\n')
                  .map((i: string) => i.trim())
                  .filter(Boolean);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing JSON-LD:', e);
      }
    }

    // If structured data didn't work, try common HTML patterns
    if (ingredients.length === 0) {
      // Look for ingredient lists
      $('ul li, ol li').each((_, el) => {
        const text = $(el).text().trim();
        // Heuristic: ingredient lines often contain measurements (g, oz, cup, etc.)
        if (
          text.match(/\d+\s*(g|gram|oz|ounce|cup|tbsp|tsp|tablespoon|teaspoon|ml|pound|lb)/) ||
          text.match(/flour|water|salt|sugar|oil|yeast|starter|butter/)
        ) {
          ingredients.push(text);
        }
      });
    }

    // Try to find instructions if we didn't get them from structured data
    if (instructions.length === 0) {
      // Common instruction section identifiers
      const instructionSelectors = [
        '.instructions', 
        '.recipe-directions',
        '.recipe-steps',
        '.directions',
        '.steps',
        '[itemprop="recipeInstructions"]'
      ];
      
      for (const selector of instructionSelectors) {
        const instructionEl = $(selector);
        if (instructionEl.length > 0) {
          instructionEl.find('li').each((_, el) => {
            const step = $(el).text().trim();
            if (step) instructions.push(step);
          });
          
          // If no list items, try paragraphs
          if (instructions.length === 0) {
            instructionEl.find('p').each((_, el) => {
              const step = $(el).text().trim();
              if (step) instructions.push(step);
            });
          }
          
          if (instructions.length > 0) break;
        }
      }
    }

    // Fallback: extract all visible text for full-text analysis
    fullText = $('body').text()
      .replace(/\\s+/g, ' ')
      .replace(/\\n+/g, ' ')
      .trim();

    return {
      title,
      ingredients,
      instructions,
      fullText
    };
  }

  /**
   * Combines fetching and extraction for a complete recipe scraping
   */
  async scrapeRecipe(url: string): Promise<{
    title?: string;
    ingredients?: string[];
    instructions?: string[];
    fullText: string;
    sourceUrl: string;
  }> {
    const html = await this.fetchUrl(url);
    const recipeData = this.extractRecipeData(html);
    
    return {
      ...recipeData,
      sourceUrl: url
    };
  }
}

export const webScraperService = new WebScraperService();