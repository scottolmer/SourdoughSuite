import { Helmet } from "react-helmet-async";
import { BlogPost } from "@shared/schema";

interface BlogPostSEOProps {
  blogPost: BlogPost;
  baseUrl?: string;
}

export default function BlogPostSEO({ blogPost, baseUrl = "https://bakehousebreads.com" }: BlogPostSEOProps) {
  const {
    title,
    slug,
    excerpt,
    metaTitle,
    metaDescription,
    keywords,
    canonicalUrl,
    socialImage,
    featuredImageUrl,
    readingTime,
    wordCount,
    publishedAt,
    updatedAt,
    category,
    tags
  } = blogPost;

  const seoTitle = metaTitle || `${title} | Bakehouse Breads`;
  const seoDescription = metaDescription || excerpt || `Learn about ${title.toLowerCase()} with expert tips from Bakehouse Breads`;
  const fullCanonicalUrl = canonicalUrl || `${baseUrl}/blog/${slug}`;
  const ogImage = socialImage || featuredImageUrl || `${baseUrl}/images/blog-default.jpg`;
  const publishDate = publishedAt ? new Date(publishedAt).toISOString() : new Date(updatedAt).toISOString();
  const modifiedDate = new Date(updatedAt).toISOString();

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": seoDescription,
    "image": {
      "@type": "ImageObject",
      "url": ogImage,
      "width": 1200,
      "height": 630
    },
    "datePublished": publishDate,
    "dateModified": modifiedDate,
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
      "@id": fullCanonicalUrl
    },
    "articleSection": category || "Sourdough Baking",
    "keywords": keywords || tags || ["sourdough", "bread", "baking"],
    "wordCount": wordCount,
    "timeRequired": `PT${readingTime || 5}M`,
    "about": {
      "@type": "Thing",
      "name": "Sourdough Baking",
      "description": "Artisanal sourdough bread making techniques and recipes"
    },
    "isAccessibleForFree": true,
    "hasPart": {
      "@type": "WebPageElement",
      "@id": `${fullCanonicalUrl}#article-body`
    }
  };

  // Generate breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": fullCanonicalUrl
      }
    ]
  };

  // Combine all structured data
  const allStructuredData = {
    "@context": "https://schema.org",
    "@graph": [structuredData, breadcrumbData]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {keywords && Array.isArray(keywords) && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Bakehouse Breads" />
      <meta property="article:published_time" content={publishDate} />
      <meta property="article:modified_time" content={modifiedDate} />
      {category && <meta property="article:section" content={category} />}
      {tags && Array.isArray(tags) && tags.map((tag: string) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Reading Time */}
      {readingTime && (
        <meta name="reading-time" content={`${readingTime} minutes`} />
      )}

      {/* Article Specific */}
      <meta name="article:author" content="Bakehouse Breads Team" />
      {readingTime && (
        <meta name="estimated-reading-time" content={`${readingTime}`} />
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(allStructuredData)}
      </script>
    </Helmet>
  );
}