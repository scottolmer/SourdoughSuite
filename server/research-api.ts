import { Express, Request, Response } from 'express';
import { db } from './db';
import { researchArticles, researchTopics } from '@shared/schema';
import { eq, desc, ilike, and, inArray } from 'drizzle-orm';

export function registerResearchAPI(app: Express) {
  // Get all research topics for sidebar
  app.get('/api/research/topics', async (req: Request, res: Response) => {
    try {
      const topics = await db.select().from(researchTopics).orderBy(researchTopics.name);
      res.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });

  // Get articles by topic or search query (published only)
  app.get('/api/research/articles', async (req: Request, res: Response) => {
    try {
      const { topic, search, featured } = req.query;
      
      let whereConditions = [eq(researchArticles.status, 'published')];

      // Filter by topic if specified
      if (topic && typeof topic === 'string') {
        whereConditions.push(ilike(researchArticles.content, `%${topic}%`));
      }

      // Filter by search term if specified  
      if (search && typeof search === 'string') {
        whereConditions.push(ilike(researchArticles.title, `%${search}%`));
      }

      // For featured articles, prioritize starter-focused
      if (featured === 'true') {
        whereConditions.push(eq(researchArticles.isStarterFocused, true));
      }

      const articles = await db.select({
        id: researchArticles.id,
        title: researchArticles.title,
        slug: researchArticles.slug,
        executiveSummary: researchArticles.executiveSummary,
        extractedCitation: researchArticles.extractedCitation,
        topics: researchArticles.topics,
        viewCount: researchArticles.viewCount,
        isStarterFocused: researchArticles.isStarterFocused
      }).from(researchArticles)
        .where(and(...whereConditions))
        .orderBy(
          desc(researchArticles.isStarterFocused),
          desc(researchArticles.viewCount)
        )
        .limit(20);

      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  // Get single article by slug (published only)
  app.get('/api/research/articles/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const article = await db.select().from(researchArticles).where(
        and(
          eq(researchArticles.slug, slug),
          eq(researchArticles.status, 'published')
        )
      ).limit(1);

      if (article.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Increment view count
      await db.update(researchArticles)
        .set({ viewCount: (article[0].viewCount || 0) + 1 })
        .where(eq(researchArticles.id, article[0].id));

      res.json(article[0]);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  // Basic search endpoint
  app.get('/api/research/search', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      const results = await db.select({
        id: researchArticles.id,
        title: researchArticles.title,
        slug: researchArticles.slug,
        executiveSummary: researchArticles.executiveSummary,
        extractedCitation: researchArticles.extractedCitation,
        relevanceScore: 1 // Basic scoring for now
      }).from(researchArticles).where(
        and(
          eq(researchArticles.status, 'published'),
          ilike(researchArticles.title, `%${q}%`)
        )
      ).orderBy(
        desc(researchArticles.isStarterFocused),
        desc(researchArticles.viewCount)
      ).limit(10);

      res.json(results);
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });
}