/**
 * Schema.org utility functions for generating structured data
 * https://schema.org/
 */

// Generate Product schema for sourdough starters
export function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Bakehouse Breads"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://bakehousebreads.com/products/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    },
    "keywords": product.keywords || `sourdough starter, ${product.name.toLowerCase()}, artisan bread`
  };
}

// Generate Recipe schema for bread recipes
export function generateRecipeSchema(recipe: any) {
  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": recipe.name,
    "author": {
      "@type": "Person",
      "name": recipe.author || "Bakehouse Breads"
    },
    "datePublished": recipe.createdAt,
    "description": recipe.description,
    "prepTime": `PT${recipe.prepTimeMinutes || 0}M`,
    "cookTime": `PT${recipe.cookTimeMinutes || 0}M`,
    "totalTime": `PT${recipe.totalTimeMinutes || 0}M`,
    "recipeYield": recipe.yield || "1 loaf",
    "recipeCategory": "Bread",
    "recipeCuisine": "Artisan",
    "recipeIngredient": recipe.ingredients?.map((ing: any) => 
      `${ing.amount} ${ing.unit} ${ing.name}`
    ) || [],
    "recipeInstructions": recipe.instructions?.map((step: any, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": step
    })) || [],
    "aggregateRating": recipe.ratings ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.ratings.average,
      "reviewCount": recipe.ratings.count
    } : undefined
  };
}

// Generate Organization schema for Bakehouse Breads
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bakehouse Breads",
    "url": "https://bakehousebreads.com",
    "logo": "https://bakehousebreads.com/images/logo.png",
    "description": "Specialty sourdough starters and baking tools for artisan bread enthusiasts.",
    "sameAs": [
      "https://twitter.com/bakehousebreads",
      "https://www.instagram.com/bakehousebreads",
      "https://www.facebook.com/bakehousebreads"
    ]
  };
}

// Generate FAQ schema for FAQ pages
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  const breadcrumbSchema: any = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://bakehousebreads.com${item.url}`
    }))
  };
  
  return breadcrumbSchema;
}

// Generate Article schema for blog posts
export function generateArticleSchema(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.description,
    "image": article.featuredImage,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author || "Bakehouse Breads"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bakehouse Breads",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bakehousebreads.com/images/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://bakehousebreads.com/blog/${article.slug}`
    },
    "keywords": article.keywords || article.tags || []
  };
}

// Generate WebApplication schema for app features
export interface WebAppFeature {
  name: string;
  description: string;
  slug: string;
  screenshots?: string[];
  category?: string;
  features?: string[];
  ratings?: {
    average: number;
    count: number;
  };
}

export function generateWebApplicationSchema(appFeature: WebAppFeature) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": appFeature.name,
    "description": appFeature.description,
    "applicationCategory": appFeature.category || "FoodAndDrinkApplication",
    "operatingSystem": "Web",
    "url": `https://bakehousebreads.com/app/${appFeature.slug}`,
    "featureList": appFeature.features?.join(", ") || "",
    "screenshot": appFeature.screenshots?.map(screenshot => ({
      "@type": "ImageObject",
      "url": screenshot.startsWith("http") ? screenshot : `https://bakehousebreads.com${screenshot}`
    })) || [],
    "aggregateRating": appFeature.ratings ? {
      "@type": "AggregateRating",
      "ratingValue": appFeature.ratings.average,
      "reviewCount": appFeature.ratings.count 
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}

/**
 * Generates a complete webpage SEO structure including all needed schemas
 * @param meta Basic metadata for the page
 * @param schemas Additional structured data schemas to include
 */
export type PageSEOProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  keywords?: string[];
  breadcrumbs?: Array<{name: string, url: string}>;
};

export function generateWebpageSEO(meta: PageSEOProps, ...schemas: any[]) {
  // Base website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bakehouse Breads",
    "url": "https://bakehousebreads.com",
    "description": "Specialty sourdough starters and baking tools for artisan bread enthusiasts.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bakehousebreads.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  
  // Add organization schema
  const orgSchema = generateOrganizationSchema();
  
  // Create schema array with website and organization schemas
  const schemaArray: any[] = [websiteSchema, orgSchema];
  
  // Add breadcrumb schema if breadcrumbs are provided
  if (meta.breadcrumbs) {
    schemaArray.push(generateBreadcrumbSchema(meta.breadcrumbs));
  }
  
  // Add any additional schemas
  schemaArray.push(...schemas);
  
  return schemaArray;
}