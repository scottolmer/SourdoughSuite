import { Express, Request, Response } from 'express';
import multer from 'multer';
import { db } from './db';
import { researchArticles, researchTopics } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { analyzePdfWithMoE, generateTopicSuggestions, generateSEOContent } from './gemini-moe-service';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

export function registerAdminRoutes(app: Express) {
  // Get articles pending review (sorted by date)
  app.get('/api/admin/articles/pending-review', async (req: Request, res: Response) => {
    try {
      const pendingArticles = await db
        .select()
        .from(researchArticles)
        .where(eq(researchArticles.status, 'pending_review'))
        .orderBy(desc(researchArticles.createdAt));

      res.json(pendingArticles);
    } catch (error) {
      console.error('Error fetching pending articles:', error);
      res.status(500).json({ error: 'Failed to fetch pending articles' });
    }
  });

  // Upload PDF for processing
  app.post('/api/admin/upload-pdf', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const filename = req.file.originalname;
      
      // Extract text from PDF
      let extractedText: string;
      try {
        const pdfBuffer = req.file.buffer;
        const pdfData = await pdfParse(pdfBuffer);
        extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length < 100) {
          throw new Error('Insufficient text extracted - PDF may be scanned or corrupted');
        }
      } catch (pdfError) {
        console.error('PDF processing failed:', pdfError);
        return res.status(400).json({ 
          error: 'Failed to extract text from PDF. File may be scanned, corrupted, or password-protected.' 
        });
      }

      // Analyze with Gemini MoE system
      const analysis = await analyzePdfWithMoE(extractedText, filename);
      
      // Generate SEO content
      const seoContent = await generateSEOContent({
        title: filename.replace('.pdf', ''),
        content: analysis.summary,
        keyFindings: analysis.keyFindings,
        practicalApplications: analysis.practicalApplications
      });

      // Create article record
      const slug = generateSlug(filename.replace('.pdf', ''));
      
      const [newArticle] = await db.insert(researchArticles).values({
        title: filename.replace('.pdf', '').replace(/[-_]/g, ' '),
        slug: slug,
        content: analysis.summary,
        fullContent: extractedText,
        executiveSummary: seoContent.seoOptimizedExcerpt,
        originalFilename: filename,
        status: 'pending_review',
        suggestedTopics: analysis.suggestedTopics,
        keyFindings: analysis.keyFindings,
        practicalApplications: analysis.practicalApplications,
        version: 1,
        topicIds: [],
      }).returning();

      res.json({
        success: true,
        articleId: newArticle.id,
        message: 'PDF processed successfully and ready for review'
      });

    } catch (error) {
      console.error('PDF upload/processing error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process PDF' 
      });
    }
  });

  // Review article (approve/reject)
  app.post('/api/admin/articles/:id/review', async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const { action, notes, topicIds, content } = req.body;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
      }

      // Get current article
      const [currentArticle] = await db
        .select()
        .from(researchArticles)
        .where(eq(researchArticles.id, articleId));

      if (!currentArticle) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Handle topic creation if needed
      let finalTopicIds = topicIds || [];
      if (topicIds && topicIds.length > 0) {
        // Auto-create topics from suggested ones
        for (const topicName of currentArticle.suggestedTopics || []) {
          try {
            const slug = generateSlug(topicName);
            const [existingTopic] = await db
              .select()
              .from(researchTopics)
              .where(eq(researchTopics.slug, slug));

            if (!existingTopic) {
              const [newTopic] = await db.insert(researchTopics).values({
                name: topicName,
                slug: slug,
                description: `Research topic: ${topicName}`,
              }).returning();
              
              // Add to final topic IDs if it was suggested
              if (!finalTopicIds.includes(newTopic.id)) {
                finalTopicIds.push(newTopic.id);
              }
            } else {
              // Add existing topic ID
              if (!finalTopicIds.includes(existingTopic.id)) {
                finalTopicIds.push(existingTopic.id);
              }
            }
          } catch (topicError) {
            console.error('Error creating topic:', topicError);
            // Continue processing even if topic creation fails
          }
        }
      }

      // Update article based on action
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewNotes: notes,
        topicIds: finalTopicIds,
        updatedAt: new Date(),
      };

      if (action === 'approve') {
        updateData.approvedAt = new Date();
        updateData.isPublished = true;
        updateData.publishedAt = new Date();
        updateData.researchValidated = true;
      }

      // Handle content editing (overwrites as requested)
      if (content && content !== currentArticle.content) {
        updateData.content = content;
        updateData.version = currentArticle.version + 1;
      }

      await db
        .update(researchArticles)
        .set(updateData)
        .where(eq(researchArticles.id, articleId));

      res.json({
        success: true,
        action: action,
        message: action === 'approve' ? 'Article approved and published' : 'Article rejected'
      });

    } catch (error) {
      console.error('Review action error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process review' 
      });
    }
  });

  // Get all topics for admin interface
  app.get('/api/research/topics', async (req: Request, res: Response) => {
    try {
      const topics = await db
        .select()
        .from(researchTopics)
        .orderBy(researchTopics.name);

      res.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });

  // Create new topic manually
  app.post('/api/research/topics', async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Topic name is required' });
      }

      const slug = generateSlug(name);
      
      // Check if topic already exists
      const [existingTopic] = await db
        .select()
        .from(researchTopics)
        .where(eq(researchTopics.slug, slug));

      if (existingTopic) {
        return res.status(400).json({ error: 'Topic already exists' });
      }

      const [newTopic] = await db.insert(researchTopics).values({
        name,
        slug,
        description: description || `Research topic: ${name}`,
      }).returning();

      res.json(newTopic);
    } catch (error) {
      console.error('Topic creation error:', error);
      res.status(500).json({ error: 'Failed to create topic' });
    }
  });

  // Get approved articles for public research page
  app.get('/api/research/articles', async (req: Request, res: Response) => {
    try {
      const publishedArticles = await db
        .select()
        .from(researchArticles)
        .where(eq(researchArticles.isPublished, true))
        .orderBy(desc(researchArticles.publishedAt));

      res.json(publishedArticles);
    } catch (error) {
      console.error('Error fetching published articles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  // Get individual article by slug
  app.get('/api/research/articles/:slug', async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      
      const [article] = await db
        .select()
        .from(researchArticles)
        .where(eq(researchArticles.slug, slug));

      if (!article || !article.isPublished) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });
}