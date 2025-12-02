import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'recipe';
  structuredData?: object;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: { name: string; url: string }[];
  price?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  recipeData?: {
    ingredients: string[];
    instructions: string[];
    cookTime?: string;
    prepTime?: string;
    difficulty?: string;
    cuisine?: string;
  };
  faqSchema?: {
    question: string;
    answer: string;
  }[];
}

export function SEO({
  title,
  description,
  canonicalUrl,
  keywords = [],
  ogImage = '/images/bakehouse-breads-default.jpg',
  ogType = 'website',
  structuredData,
  author,
  publishedTime,
  modifiedTime,
  breadcrumbs,
  price,
  availability = 'InStock',
  recipeData,
  faqSchema,
}: SEOProps) {
  const siteUrl = 'https://bakehousebreads.com';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : undefined;
  
  // Generate structured data based on content type
  const generateStructuredData = () => {
    if (structuredData) return structuredData;
    
    const baseData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Bakehouse Breads",
      "url": siteUrl,
      "logo": `${siteUrl}/images/logo.png`,
      "description": "Premium sourdough starters and artisanal bread recipes",
    };

    // Recipe structured data
    if (ogType === 'recipe' && recipeData) {
      return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": title,
        "description": description,
        "image": `${siteUrl}${ogImage}`,
        "author": {
          "@type": "Organization",
          "name": "Bakehouse Breads"
        },
        "recipeIngredient": recipeData.ingredients,
        "recipeInstructions": recipeData.instructions.map((step, index) => ({
          "@type": "HowToStep",
          "text": step,
          "position": index + 1
        })),
        "cookTime": recipeData.cookTime,
        "prepTime": recipeData.prepTime,
        "recipeYield": "1 loaf",
        "recipeCuisine": recipeData.cuisine || "American",
        "recipeCategory": "Bread",
        "keywords": keywords.join(', '),
        "nutrition": {
          "@type": "NutritionInformation",
          "calories": "200 per slice"
        }
      };
    }

    // Product structured data
    if (ogType === 'product' && price) {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": title,
        "description": description,
        "image": `${siteUrl}${ogImage}`,
        "brand": {
          "@type": "Brand",
          "name": "Bakehouse Breads"
        },
        "offers": {
          "@type": "Offer",
          "price": price.replace('$', ''),
          "priceCurrency": "USD",
          "availability": `https://schema.org/${availability}`,
          "seller": {
            "@type": "Organization",
            "name": "Bakehouse Breads"
          }
        }
      };
    }

    // Article structured data
    if (ogType === 'article') {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": `${siteUrl}${ogImage}`,
        "author": {
          "@type": "Person",
          "name": author || "Bakehouse Breads Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Bakehouse Breads",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/images/logo.png`
          }
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime
      };
    }

    // Breadcrumb structured data
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": (crumb as any).label || crumb.name, // Support both new and old format
          "item": `${siteUrl}${(crumb as any).href || (crumb as any).url}` // Support both new and old format
        }))
      };
      
      return [baseData, breadcrumbData];
    }

    return baseData;
  };

  // Generate FAQ schema if provided
  const generateFAQSchema = () => {
    if (!faqSchema || faqSchema.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqSchema.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  };

  const finalStructuredData = generateStructuredData();
  const faqStructuredData = generateFAQSchema();
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Enhanced meta tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content={author || "Bakehouse Breads"} />
      {publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl || siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Bakehouse Breads" />
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      <meta name="twitter:site" content="@BakehouseBreads" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* FAQ Schema */}
      {faqStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData, null, 2)}
        </script>
      )}
    </Helmet>
  );
}