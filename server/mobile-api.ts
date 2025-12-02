import { Express, Request, Response } from 'express';
import { chatWithMobileExpert, getTopicInsights, generateSearchSuggestions } from './mobile-chat-service';
import { db } from './db';
import { researchArticles, researchTopics } from '@shared/schema';
import { eq, ilike, and } from 'drizzle-orm';

export function registerMobileAPI(app: Express) {
  // Mobile chat endpoint
  app.post('/api/mobile/chat', async (req: Request, res: Response) => {
    try {
      const { message, context = {} } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get search results if context includes topic or search query
      let searchResults = [];
      if (context.selectedTopic || context.searchQuery) {
        const whereConditions = [eq(researchArticles.status, 'published')];
        
        if (context.selectedTopic) {
          whereConditions.push(ilike(researchArticles.content, `%${context.selectedTopic}%`));
        }
        
        if (context.searchQuery) {
          whereConditions.push(ilike(researchArticles.title, `%${context.searchQuery}%`));
        }

        searchResults = await db.select({
          id: researchArticles.id,
          title: researchArticles.title,
          slug: researchArticles.slug,
          executiveSummary: researchArticles.executiveSummary,
          extractedCitation: researchArticles.extractedCitation
        }).from(researchArticles)
          .where(and(...whereConditions))
          .limit(3);
      }

      const result = await chatWithMobileExpert(message, {
        ...context,
        searchResults
      });

      res.json(result);
    } catch (error) {
      console.error('Error in mobile chat:', error);
      res.status(500).json({ 
        error: 'Chat service temporarily unavailable',
        response: "I'm having trouble right now. Please try again in a moment."
      });
    }
  });

  // Topic insights endpoint
  app.get('/api/mobile/topics/:slug/insights', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const insights = await getTopicInsights(slug);
      res.json({ insights });
    } catch (error) {
      console.error('Error getting topic insights:', error);
      res.status(500).json({ error: 'Unable to load insights' });
    }
  });

  // Search suggestions endpoint
  app.get('/api/mobile/search/suggestions', async (req: Request, res: Response) => {
    try {
      const { q = '' } = req.query;
      const suggestions = await generateSearchSuggestions(q as string);
      res.json({ suggestions });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({ suggestions: [] });
    }
  });

  // Mobile-optimized article endpoint
  app.get('/api/mobile/articles/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const article = await db.select({
        id: researchArticles.id,
        title: researchArticles.title,
        slug: researchArticles.slug,
        executiveSummary: researchArticles.executiveSummary,
        keyFindings: researchArticles.keyFindings,
        practicalApplications: researchArticles.practicalApplications,
        extractedCitation: researchArticles.extractedCitation,
        content: researchArticles.content,
        viewCount: researchArticles.viewCount
      }).from(researchArticles)
        .where(and(
          eq(researchArticles.slug, slug),
          eq(researchArticles.status, 'published')
        ))
        .limit(1);

      if (article.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Increment view count
      await db.update(researchArticles)
        .set({ viewCount: (article[0].viewCount || 0) + 1 })
        .where(eq(researchArticles.id, article[0].id));

      // Return mobile-optimized content
      const mobileArticle = {
        ...article[0],
        // Truncate content for mobile preview
        contentPreview: article[0].content?.substring(0, 500) + '...',
        // Keep full content available
        fullContent: article[0].content
      };

      res.json(mobileArticle);
    } catch (error) {
      console.error('Error fetching mobile article:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  // Quick calculation suggestions based on query
  app.post('/api/mobile/calculate/suggest', async (req: Request, res: Response) => {
    try {
      const { query, context } = req.body;
      
      const suggestions = [];
      
      // Simple keyword matching for calculation suggestions
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('hydration') || lowerQuery.includes('water') || lowerQuery.includes('flour')) {
        suggestions.push({
          type: 'hydration',
          title: 'Hydration Calculator',
          description: 'Calculate water-to-flour ratios',
          relevance: 0.9
        });
      }
      
      if (lowerQuery.includes('time') || lowerQuery.includes('schedule') || lowerQuery.includes('ferment')) {
        suggestions.push({
          type: 'timeline',
          title: 'Timeline Calculator',
          description: 'Plan fermentation schedule',
          relevance: 0.8
        });
      }
      
      if (lowerQuery.includes('ingredient') || lowerQuery.includes('recipe') || lowerQuery.includes('percentage')) {
        suggestions.push({
          type: 'ratios',
          title: 'Baker\'s Percentages',
          description: 'Scale recipe ingredients',
          relevance: 0.7
        });
      }
      
      if (lowerQuery.includes('problem') || lowerQuery.includes('dense') || lowerQuery.includes('issue') || lowerQuery.includes('wrong')) {
        suggestions.push({
          type: 'troubleshooting',
          title: 'Troubleshooting Wizard',
          description: 'Diagnose bread issues',
          relevance: 0.9
        });
      }
      
      // Sort by relevance and return top 2
      suggestions.sort((a, b) => b.relevance - a.relevance);
      
      res.json({ suggestions: suggestions.slice(0, 2) });
    } catch (error) {
      console.error('Error suggesting calculations:', error);
      res.status(500).json({ suggestions: [] });
    }
  });
}