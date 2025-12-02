import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from '../storage';
import { ArticleProcessingJob, InsertResearchArticle } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

interface QualityScores {
  peerReviewScore: number;
  citationQualityScore: number;
  methodologyScore: number;
  sampleSizeScore: number;
  overallGrade: string;
  overallScore: number;
}

export class ArticleProcessor {
  private jobId: string;
  private steps: ProcessingStep[] = [
    { name: 'Content Extraction', status: 'pending', progress: 0 },
    { name: 'Title & Metadata Extraction', status: 'pending', progress: 0 },
    { name: 'Content Formatting', status: 'pending', progress: 0 },
    { name: 'Citation Analysis', status: 'pending', progress: 0 },
    { name: 'Quality Assessment', status: 'pending', progress: 0 },
    { name: 'Summary Generation', status: 'pending', progress: 0 },
    { name: 'Database Storage', status: 'pending', progress: 0 },
  ];

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  async processUrl(url: string): Promise<void> {
    try {
      await this.updateJobStatus('processing', 0);
      
      // Step 1: Extract content from URL
      await this.updateStep('Content Extraction', 'processing');
      const rawContent = await this.extractFromUrl(url);
      await this.updateStep('Content Extraction', 'completed', { content: rawContent });

      await this.processContent(rawContent, url);
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  async processFile(content: string, filename: string): Promise<void> {
    try {
      await this.updateJobStatus('processing', 0);
      
      // Step 1: Use provided file content
      await this.updateStep('Content Extraction', 'completed', { content });

      await this.processContent(content, filename);
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  private async processContent(content: string, source: string): Promise<void> {
    // Step 2: Extract title and metadata
    await this.updateStep('Title & Metadata Extraction', 'processing');
    const metadata = await this.extractMetadata(content);
    await this.updateStep('Title & Metadata Extraction', 'completed', metadata);

    // Step 3: Format content
    await this.updateStep('Content Formatting', 'processing');
    const formattedContent = await this.formatContent(content, metadata.title);
    await this.updateStep('Content Formatting', 'completed', { formattedContent });

    // Step 4: Analyze citations
    await this.updateStep('Citation Analysis', 'processing');
    const citationAnalysis = await this.analyzeCitations(content);
    await this.updateStep('Citation Analysis', 'completed', citationAnalysis);

    // Step 5: Generate quality scores
    await this.updateStep('Quality Assessment', 'processing');
    const qualityScores = await this.assessQuality(content, citationAnalysis);
    await this.updateStep('Quality Assessment', 'completed', qualityScores);

    // Step 6: Generate summary
    await this.updateStep('Summary Generation', 'processing');
    const summary = await this.generateSummary(formattedContent);
    await this.updateStep('Summary Generation', 'completed', { summary });

    // Step 7: Store in database
    await this.updateStep('Database Storage', 'processing');
    const article = await this.storeArticle({
      title: metadata.title,
      content: formattedContent,
      summary,
      qualityScores,
      source
    });
    await this.updateStep('Database Storage', 'completed', { articleId: article.id });

    await this.updateJobStatus('completed', 100, article.id);
  }

  private async extractFromUrl(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BakehouseBreads Research Bot/1.0)'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    
    // Remove scripts, styles, and navigation elements
    $('script, style, nav, header, footer, aside, .navigation, .sidebar').remove();
    
    // Extract main content
    const content = $('main, article, .content, .post, #content, .article-body')
      .first()
      .text() || $('body').text();

    return content.trim();
  }

  private async extractMetadata(content: string): Promise<{ title: string; authors?: string[] }> {
    try {
      const prompt = `Extract the title and authors from this research article content. Return JSON format:
      {
        "title": "Article Title",
        "authors": ["Author 1", "Author 2"]
      }
      
      Content:
      ${content.substring(0, 2000)}...`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content || '{"title": "Untitled Article"}');
    } catch (error) {
      return { title: "Untitled Article" };
    }
  }

  private async formatContent(content: string, title: string): Promise<string> {
    try {
      const prompt = `Format this research article content into proper markdown with academic structure. Include:
      - Proper headings (##, ###)
      - Abstract section
      - Introduction
      - Main findings/methodology
      - Conclusion
      - References (if available)
      
      Title: ${title}
      
      Content:
      ${content}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000
      });

      return response.choices[0].message.content || content;
    } catch (error) {
      return content;
    }
  }

  private async analyzeCitations(content: string): Promise<{ citationCount: number; sources: string[] }> {
    try {
      const prompt = `Analyze this research content and extract:
      1. Number of citations/references
      2. List of cited sources (journals, papers, etc.)
      
      Return JSON format:
      {
        "citationCount": number,
        "sources": ["source1", "source2", ...]
      }
      
      Content:
      ${content.substring(0, 3000)}...`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content || '{"citationCount": 0, "sources": []}');
    } catch (error) {
      return { citationCount: 0, sources: [] };
    }
  }

  private async assessQuality(content: string, citationAnalysis: any): Promise<QualityScores> {
    try {
      const prompt = `Assess the research quality of this content and provide scores (0-100) for:
      1. Peer review indicators
      2. Citation quality
      3. Methodology strength
      4. Sample size adequacy
      
      Also provide an overall letter grade (A+, A, A-, B+, B, B-, C+, C, F) and numerical score.
      
      Citation count: ${citationAnalysis.citationCount}
      Sources: ${citationAnalysis.sources.slice(0, 5).join(', ')}
      
      Return JSON format:
      {
        "peerReviewScore": number,
        "citationQualityScore": number,
        "methodologyScore": number,
        "sampleSizeScore": number,
        "overallGrade": "letter",
        "overallScore": number
      }
      
      Content:
      ${content.substring(0, 2000)}...`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const scores = JSON.parse(response.choices[0].message.content || '{}');
      return {
        peerReviewScore: scores.peerReviewScore || 70,
        citationQualityScore: scores.citationQualityScore || 70,
        methodologyScore: scores.methodologyScore || 70,
        sampleSizeScore: scores.sampleSizeScore || 70,
        overallGrade: scores.overallGrade || 'B',
        overallScore: scores.overallScore || 70
      };
    } catch (error) {
      return {
        peerReviewScore: 70,
        citationQualityScore: 70,
        methodologyScore: 70,
        sampleSizeScore: 70,
        overallGrade: 'B',
        overallScore: 70
      };
    }
  }

  private async generateSummary(content: string): Promise<string> {
    try {
      const prompt = `Generate a concise executive summary (2-3 sentences) for this research article that highlights:
      - Key findings
      - Practical applications for professional bakers
      - Scientific parameters (temperatures, percentages, etc.)
      
      Content:
      ${content.substring(0, 2000)}...`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      });

      return response.choices[0].message.content || "Research summary not available.";
    } catch (error) {
      return "Research summary not available.";
    }
  }

  private async storeArticle(data: {
    title: string;
    content: string;
    summary: string;
    qualityScores: QualityScores;
    source: string;
  }): Promise<{ id: number }> {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    const articleData: InsertResearchArticle = {
      title: data.title,
      slug,
      executiveSummary: data.summary,
      content: data.content,
      isPublished: true
    };

    return await storage.createResearchArticle(articleData);
  }

  private async updateStep(stepName: string, status: 'processing' | 'completed' | 'failed', result?: any): Promise<void> {
    const stepIndex = this.steps.findIndex(s => s.name === stepName);
    if (stepIndex >= 0) {
      this.steps[stepIndex].status = status;
      this.steps[stepIndex].progress = status === 'completed' ? 100 : status === 'processing' ? 50 : 0;
      if (result) this.steps[stepIndex].result = result;

      // Calculate overall progress
      const completedSteps = this.steps.filter(s => s.status === 'completed').length;
      const overallProgress = Math.round((completedSteps / this.steps.length) * 100);

      await this.updateJobStatus('processing', overallProgress);
    }
  }

  private async updateJobStatus(status: string, progress: number, articleId?: number): Promise<void> {
    const job = await storage.getProcessingJobById(this.jobId);
    if (job) {
      await storage.updateProcessingJob(this.jobId, {
        status,
        progress,
        processingSteps: JSON.stringify(this.steps),
        processedArticleId: articleId,
        ...(status === 'completed' && { completedAt: new Date() })
      });
    }
  }

  private async handleError(error: Error): Promise<void> {
    await storage.updateProcessingJob(this.jobId, {
      status: 'failed',
      errorMessage: error.message
    });
  }
}

export async function createProcessingJob(source: string, sourceType: 'url' | 'file'): Promise<string> {
  const jobId = uuidv4();
  
  await storage.createProcessingJob({
    id: jobId,
    source,
    sourceType,
    status: 'pending',
    progress: 0
  });

  // Start processing in background
  const processor = new ArticleProcessor(jobId);
  if (sourceType === 'url') {
    processor.processUrl(source).catch(console.error);
  }

  return jobId;
}

export async function processFileContent(content: string, filename: string): Promise<string> {
  const jobId = uuidv4();
  
  await storage.createProcessingJob({
    id: jobId,
    source: filename,
    sourceType: 'file',
    status: 'pending',
    progress: 0
  });

  // Start processing in background
  const processor = new ArticleProcessor(jobId);
  processor.processFile(content, filename).catch(console.error);

  return jobId;
}