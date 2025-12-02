import { BlogPost } from "@shared/schema";

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  socialImage: string;
  readingTime: number;
  wordCount: number;
  structuredData: any;
}

export class SEOService {
  private static readonly WORDS_PER_MINUTE = 200;
  private static readonly BASE_URL = process.env.BASE_URL || 'https://sourdoughsuite.com';

  /**
   * Calculate reading time based on word count
   */
  static calculateReadingTime(content: string): number {
    const wordCount = this.calculateWordCount(content);
    return Math.ceil(wordCount / this.WORDS_PER_MINUTE);
  }

  /**
   * Calculate word count from content
   */
  static calculateWordCount(content: string): number {
    // Remove HTML tags and count words
    const plainText = content.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * Generate SEO-optimized title
   */
  static generateSEOTitle(title: string, category?: string): string {
    const maxLength = 60;
    const brandSuffix = " | Sourdough Suite";
    
    // If custom title is short enough, append brand
    if (title.length + brandSuffix.length <= maxLength) {
      return title + brandSuffix;
    }
    
    // Otherwise, truncate and append brand
    const truncatedTitle = title.substring(0, maxLength - brandSuffix.length - 3) + "...";
    return truncatedTitle + brandSuffix;
  }

  /**
   * Generate SEO-optimized meta description
   */
  static generateMetaDescription(excerpt: string | null, content: string): string {
    const maxLength = 160;
    
    // Use excerpt if available and appropriate length
    if (excerpt && excerpt.length <= maxLength) {
      return excerpt;
    }
    
    // Otherwise, generate from content
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // Truncate at word boundary
    const truncated = plainText.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.substring(0, lastSpace) + "...";
  }

  /**
   * Extract keywords from content and tags
   */
  static generateKeywords(content: string, tags: string[] = [], title: string = ""): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 
      'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    // Extract words from title and content
    const allText = `${title} ${content}`.toLowerCase();
    const plainText = allText.replace(/<[^>]*>/g, ' ').replace(/[^\w\s]/g, ' ');
    const words = plainText.split(/\s+/).filter(word => 
      word.length > 3 && 
      !commonWords.has(word) && 
      /^[a-z]+$/.test(word)
    );

    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Get top words by frequency
    const topWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    // Combine with tags and sourdough-specific keywords
    const sourdoughKeywords = ['sourdough', 'bread', 'baking', 'starter', 'fermentation'];
    const combinedKeywords = tags.concat(topWords).concat(sourdoughKeywords);
    const allKeywords = Array.from(new Set(combinedKeywords));

    return allKeywords.slice(0, 10);
  }

  /**
   * Generate canonical URL
   */
  static generateCanonicalUrl(slug: string): string {
    return `${this.BASE_URL}/blog/${slug}`;
  }

  /**
   * Generate structured data for blog post
   */
  static generateStructuredData(blogPost: BlogPost): any {
    const baseUrl = this.BASE_URL;
    
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blogPost.metaTitle || blogPost.title,
      "description": blogPost.metaDescription || blogPost.excerpt,
      "image": blogPost.socialImage || blogPost.featuredImageUrl || `${baseUrl}/images/blog-default.jpg`,
      "datePublished": blogPost.publishedAt?.toISOString(),
      "dateModified": blogPost.updatedAt.toISOString(),
      "author": {
        "@type": "Person",
        "name": "Bakehouse Breads Team",
        "url": `${baseUrl}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": "Bakehouse Breads",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/images/logo.png`,
          "width": 200,
          "height": 60
        },
        "url": baseUrl
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": this.generateCanonicalUrl(blogPost.slug)
      },
      "keywords": blogPost.keywords || [],
      "wordCount": blogPost.wordCount,
      "timeRequired": `PT${blogPost.readingTime}M`,
      "articleSection": blogPost.category,
      "about": {
        "@type": "Thing",
        "name": "Sourdough Baking",
        "description": "Artisanal sourdough bread making techniques and recipes"
      }
    };
  }

  /**
   * Generate complete SEO data for a blog post
   */
  static generateSEOData(blogPost: Partial<BlogPost>): SEOData {
    const wordCount = this.calculateWordCount(blogPost.content || '');
    const readingTime = this.calculateReadingTime(blogPost.content || '');
    
    const seoData: SEOData = {
      title: blogPost.metaTitle || this.generateSEOTitle(blogPost.title || '', blogPost.category || undefined),
      description: blogPost.metaDescription || this.generateMetaDescription(blogPost.excerpt || null, blogPost.content || ''),
      keywords: blogPost.keywords as string[] || this.generateKeywords(
        blogPost.content || '', 
        blogPost.tags as string[] || [], 
        blogPost.title || ''
      ),
      canonicalUrl: blogPost.canonicalUrl || this.generateCanonicalUrl(blogPost.slug || ''),
      socialImage: blogPost.socialImage || blogPost.featuredImageUrl || `${this.BASE_URL}/images/blog-default.jpg`,
      readingTime,
      wordCount,
      structuredData: this.generateStructuredData(blogPost as BlogPost)
    };

    return seoData;
  }

  /**
   * Generate XML sitemap for blog posts
   */
  static generateBlogSitemap(blogPosts: BlogPost[]): string {
    const baseUrl = this.BASE_URL;
    const publishedPosts = blogPosts.filter(post => post.isPublished && post.publishedAt);
    
    const urlEntries = publishedPosts.map(post => {
      const lastmod = post.updatedAt.toISOString().split('T')[0];
      return `
  <url>
    <loc>${this.generateCanonicalUrl(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${urlEntries}
</urlset>`;
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt(): string {
    const baseUrl = this.BASE_URL;
    
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/blog-sitemap.xml

# Crawl delay
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow important pages
Allow: /blog/
Allow: /recipes/
Allow: /shop/
Allow: /starter-product/`;
  }
}