import { pgTable, text, serial, integer, boolean, json, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Texture Profile Schema
export const textureProfileSchema = z.object({
  crumbOpenness: z.number().min(1).max(10).default(5),
  holeSize: z.number().min(1).max(10).default(5),
  tenderness: z.number().min(1).max(10).default(5),
  moisture: z.number().min(1).max(10).default(5),
  crustThickness: z.number().min(1).max(10).default(5),
  crustTexture: z.number().min(1).max(10).default(5),
  color: z.number().min(1).max(10).default(5),
  surfaceCharacter: z.number().min(1).max(10).default(5),
  isSmooth: z.boolean().default(true),
  isRustic: z.boolean().default(false)
});

// Flavor Profile Schema
export const flavorProfileSchema = z.object({
  sourness: z.number().min(1).max(10).default(5),
  sweetness: z.number().min(1).max(10).default(5),
  complexity: z.number().min(1).max(10).default(5),
  strength: z.number().min(1).max(10).default(5),
  flavors: z.object({
    nutty: z.boolean().default(false),
    fruity: z.boolean().default(false),
    spicy: z.boolean().default(false),
    earthy: z.boolean().default(false),
    malty: z.boolean().default(false),
    buttery: z.boolean().default(false)
  })
});

// Video content model for YouTube integration
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  youtubeId: varchar("youtube_id", { length: 20 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  category: varchar("category", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("beginner"), // beginner, intermediate, advanced
  tags: text("tags").array().default([]),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  sortOrder: integer("sort_order").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("videos_category_idx").on(table.category),
  difficultyIdx: index("videos_difficulty_idx").on(table.difficulty),
  isFeaturedIdx: index("videos_is_featured_idx").on(table.isFeatured),
  isPublishedIdx: index("videos_is_published_idx").on(table.isPublished),
}));

// Video playlists for organizing learning paths
export const videoPlaylists = pgTable("video_playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("beginner"),
  thumbnailUrl: text("thumbnail_url"),
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Junction table for playlist videos
export const playlistVideos = pgTable("playlist_videos", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => videoPlaylists.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Base user model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  displayName: varchar("display_name", { length: 100 }),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"), // free, premium, master
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive"), // active, inactive, cancelled, past_due
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  bakingFrequency: varchar("baking_frequency", { length: 50 }), // e.g., 'daily', 'weekly', 'monthly'
  skillLevel: integer("skill_level"), // 1-5 scale
  preferredFlours: json("preferred_flours"), // array of preferred flour types
  favoriteTextures: json("favorite_textures"), // texture preferences
  favoriteFlavors: json("favorite_flavors"), // flavor preferences
  dietaryPreferences: json("dietary_preferences"), // dietary restrictions/preferences
  bakewareOwned: json("bakeware_owned"), // list of bakeware the user owns
  preferredUnits: varchar("preferred_units", { length: 20 }).default("metric"), // 'metric' or 'imperial'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  bakingFrequency: true,
  skillLevel: true,
  preferredFlours: true,
  favoriteTextures: true,
  favoriteFlavors: true,
  dietaryPreferences: true,
  bakewareOwned: true,
  preferredUnits: true,
});

// Bread recipes table
export const breadRecipes = pgTable("bread_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: json("ingredients").notNull(),
  instructions: json("instructions").notNull(),
  textureProfile: json("texture_profile"),
  flavorProfile: json("flavor_profile"),
  yields: text("yields"), // e.g., "1kg boule"
  hydration: integer("hydration"), // hydration percentage
  totalTime: text("total_time"), // formatted time string
  activeTime: text("active_time"), // formatted time string
  difficulty: varchar("difficulty", { length: 50 }), // e.g., "Easy", "Intermediate", "Advanced"
  imageUrl: text("image_url"), // URL to recipe image
  tags: json("tags"), // Array of tags for categorization
  notes: json("notes"), // Array of notes about the recipe
  isPublic: boolean("is_public").default(false), // Whether the recipe is publicly accessible
  isFavorite: boolean("is_favorite").default(false), // Whether the recipe is favorited by the user
  rating: integer("rating"), // User's personal rating (1-5)
  // Using varchar for now to avoid type casting issues with existing data
  createdAt: varchar("created_at", { length: 50 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("bread_recipes_user_id_idx").on(table.userId),
  isPublicIdx: index("bread_recipes_is_public_idx").on(table.isPublic),
  isFavoriteIdx: index("bread_recipes_is_favorite_idx").on(table.isFavorite),
  difficultyIdx: index("bread_recipes_difficulty_idx").on(table.difficulty),
  hydrationIdx: index("bread_recipes_hydration_idx").on(table.hydration),
}));

export const insertBreadRecipeSchema = createInsertSchema(breadRecipes).pick({
  userId: true,
  name: true,
  description: true,
  ingredients: true,
  instructions: true,
  textureProfile: true,
  flavorProfile: true,
  yields: true,
  hydration: true,
  totalTime: true,
  activeTime: true,
  difficulty: true,
  imageUrl: true,
  tags: true,
  notes: true,
  isPublic: true,
  isFavorite: true,
  rating: true,
});

// AI-generated recipes table
export const aiGeneratedRecipes = pgTable("ai_generated_recipes", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"), // Track by session for non-authenticated users
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(), // Full AI response content
  ingredients: json("ingredients").default([]),
  instructions: json("instructions").default([]),
  difficulty: varchar("difficulty", { length: 50 }),
  totalTime: text("total_time"),
  activeTime: text("active_time"),
  yields: text("yields"),
  isAIGenerated: boolean("is_ai_generated").default(true),
  isSaved: boolean("is_saved").default(false), // Whether user saved it to their collection
  isPublic: boolean("is_public").default(true), // Public for SEO and discovery
  slug: text("slug"), // SEO-friendly URL slug
  tags: json("tags").default([]), // For categorization and search
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAIGeneratedRecipeSchema = createInsertSchema(aiGeneratedRecipes).pick({
  sessionId: true,
  content: true,
  name: true,
  description: true,
  ingredients: true,
  instructions: true,
  difficulty: true,
  totalTime: true,
  activeTime: true,
  yields: true,
  isSaved: true,
});

// Sourdough starters table
export const sourdoughStarters = pgTable("sourdough_starters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  mainFlour: text("main_flour").notNull(),
  flourMix: json("flour_mix"),
  flavor: json("flavor").notNull(),
  maintenance: json("maintenance").notNull(),
  imageUrl: text("image_url"),
  badge: text("badge"),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("sourdough_starters_slug_idx").on(table.slug),
  inStockIdx: index("sourdough_starters_in_stock_idx").on(table.inStock),
  featuredIdx: index("sourdough_starters_featured_idx").on(table.featured),
}));

// Products table for e-commerce
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  imageUrl: text("image_url"),
  category: text("category").notNull(), // e.g., "equipment", "ingredients", "merchandise"
  tags: json("tags"), // Array of tags for filtering and categorization
  features: json("features"), // Array of product features
  inStock: boolean("in_stock").default(true),
  inventory: integer("inventory").default(0), // Current inventory count
  featured: boolean("featured").default(false),
  rating: integer("rating"), // Average rating
  reviewCount: integer("review_count").default(0),
  dimensions: text("dimensions"), // Product dimensions if applicable
  weight: text("weight"), // Product weight if applicable
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("products_category_idx").on(table.category),
  slugIdx: index("products_slug_idx").on(table.slug),
  inStockIdx: index("products_in_stock_idx").on(table.inStock),
  featuredIdx: index("products_featured_idx").on(table.featured),
}));

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(), // e.g., "pending", "processing", "shipped", "delivered", "cancelled"
  total: integer("total").notNull(), // Total price in cents
  items: json("items").notNull(), // Array of order items
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address"),
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
}));

// Starter-Recipe relationship table
export const starterRecipes = pgTable("starter_recipes", {
  id: serial("id").primaryKey(),
  starterId: integer("starter_id").references(() => sourdoughStarters.id).notNull(),
  recipeId: integer("recipe_id").references(() => breadRecipes.id).notNull(),
  recipeType: varchar("recipe_type", { length: 50 }).notNull(), // 'classic', 'specialty'
  isRecommended: boolean("is_recommended").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStarterSchema = createInsertSchema(sourdoughStarters).pick({
  name: true,
  description: true,
  price: true,
  mainFlour: true,
  flourMix: true,
  flavor: true,
  maintenance: true,
  imageUrl: true,
  badge: true,
  inStock: true,
  featured: true,
  slug: true,
});

export const insertStarterRecipeSchema = createInsertSchema(starterRecipes).pick({
  starterId: true,
  recipeId: true,
  recipeType: true,
  isRecommended: true,
});

// Schema for inserting products
export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  category: true,
  tags: true,
  features: true,
  inStock: true,
  inventory: true,
  featured: true,
  rating: true,
  reviewCount: true,
  dimensions: true,
  weight: true,
  slug: true,
});

// Schema for inserting orders
export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  total: true,
  items: true,
  shippingAddress: true,
  billingAddress: true,
  paymentIntentId: true,
  shippingMethod: true,
  trackingNumber: true,
  notes: true,
});

// Recipe Validator schema
export const recipeValidations = pgTable("recipe_validations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  recipeName: text("recipe_name"),
  recipeInput: text("recipe_input").notNull(),
  ingredients: json("ingredients"), // Structured ingredients from user input
  instructions: json("instructions"), // Structured instructions from user input
  analysis: json("analysis").notNull(), // AI analysis of the recipe
  suggestions: json("suggestions").notNull(), // Improvement suggestions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecipeValidationSchema = createInsertSchema(recipeValidations).pick({
  userId: true,
  recipeName: true,
  recipeInput: true,
  ingredients: true,
  instructions: true,
  analysis: true,
  suggestions: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferencesSchema>;

export type BreadRecipe = typeof breadRecipes.$inferSelect;
export type InsertBreadRecipe = z.infer<typeof insertBreadRecipeSchema>;

export type RecipeValidation = typeof recipeValidations.$inferSelect;
export type InsertRecipeValidation = z.infer<typeof insertRecipeValidationSchema>;

export type SourdoughStarter = typeof sourdoughStarters.$inferSelect;
export type InsertSourdoughStarter = z.infer<typeof insertStarterSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Profile Types
export type TextureProfile = z.infer<typeof textureProfileSchema>;
export type FlavorProfile = z.infer<typeof flavorProfileSchema>;

// Recipe scraper interface
export const scrapedRecipeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  author: z.string().optional(),
  source: z.string().optional(),
  imageUrl: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
  yield: z.string().optional(),
  fullText: z.string().optional() // Raw text content for fallback analysis
});

export type ScrapedRecipe = z.infer<typeof scrapedRecipeSchema>;

// Video schemas
export const insertVideoSchema = createInsertSchema(videos).pick({
  youtubeId: true,
  title: true,
  description: true,
  thumbnailUrl: true,
  duration: true,
  category: true,
  difficulty: true,
  tags: true,
  isFeatured: true,
  isPublished: true,
  publishedAt: true,
});

export const insertVideoPlaylistSchema = createInsertSchema(videoPlaylists).pick({
  name: true,
  description: true,
  slug: true,
  category: true,
  difficulty: true,
  thumbnailUrl: true,
  isPublished: true,
  isFeatured: true,
  sortOrder: true,
});

export const insertPlaylistVideoSchema = createInsertSchema(playlistVideos).pick({
  playlistId: true,
  videoId: true,
  sortOrder: true,
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type VideoPlaylist = typeof videoPlaylists.$inferSelect;
export type InsertVideoPlaylist = z.infer<typeof insertVideoPlaylistSchema>;
export type PlaylistVideo = typeof playlistVideos.$inferSelect;
export type InsertPlaylistVideo = z.infer<typeof insertPlaylistVideoSchema>;

// Relations

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));

export const breadRecipesRelations = relations(breadRecipes, ({ one }) => ({
  user: one(users, {
    fields: [breadRecipes.userId],
    references: [users.id]
  })
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  })
}));

export const videoPlaylistsRelations = relations(videoPlaylists, ({ many }) => ({
  playlistVideos: many(playlistVideos)
}));

export const videosRelations = relations(videos, ({ many }) => ({
  playlistVideos: many(playlistVideos)
}));

export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(videoPlaylists, {
    fields: [playlistVideos.playlistId],
    references: [videoPlaylists.id]
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id]
  })
}));

// FAQ schema
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  displayOrder: integer("display_order").default(0),
  isPublished: boolean("is_published").default(true),
});

export const insertFaqSchema = createInsertSchema(faqs).pick({
  question: true,
  answer: true,
  category: true,
  displayOrder: true,
  isPublished: true,
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: integer("author_id").references(() => users.id),
  featuredImageUrl: text("featured_image_url"),
  tags: json("tags").default([]),
  category: text("category").default("general"),

  // SEO Enhancement Fields
  metaTitle: text("meta_title"), // Custom SEO title (falls back to title)
  metaDescription: text("meta_description"), // Custom meta description (falls back to excerpt)
  keywords: json("keywords").default([]), // SEO keywords array
  canonicalUrl: text("canonical_url"), // Custom canonical URL if needed
  socialImage: text("social_image"), // Custom social sharing image (falls back to featuredImageUrl)
  readingTime: integer("reading_time"), // Estimated reading time in minutes
  wordCount: integer("word_count"), // Article word count

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  isPublished: boolean("is_published").default(false),
}, (table) => ({
  slugIdx: index("blog_posts_slug_idx").on(table.slug),
  authorIdIdx: index("blog_posts_author_id_idx").on(table.authorId),
  categoryIdx: index("blog_posts_category_idx").on(table.category),
  isPublishedIdx: index("blog_posts_is_published_idx").on(table.isPublished),
  publishedAtIdx: index("blog_posts_published_at_idx").on(table.publishedAt),
}));

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  authorId: true,
  featuredImageUrl: true,
  tags: true,
  category: true,
  metaTitle: true,
  metaDescription: true,
  keywords: true,
  canonicalUrl: true,
  socialImage: true,
  readingTime: true,
  wordCount: true,
  isPublished: true,
  publishedAt: true,
});

export const updateBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  authorId: true,
  featuredImageUrl: true,
  tags: true,
  category: true,
  metaTitle: true,
  metaDescription: true,
  keywords: true,
  canonicalUrl: true,
  socialImage: true,
  readingTime: true,
  wordCount: true,
  isPublished: true,
  publishedAt: true,
}).partial();

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;

// Sourdough Starter Feeding Log
export const starterFeedingLogs = pgTable("starter_feeding_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  starterId: integer("starter_id").references(() => sourdoughStarters.id),
  feedingDate: timestamp("feeding_date").defaultNow().notNull(),
  starterAmount: integer("starter_amount").notNull(), // in grams
  flourAmount: integer("flour_amount").notNull(), // in grams
  waterAmount: integer("water_amount").notNull(), // in grams
  flourType: text("flour_type").notNull(), // e.g., "all-purpose", "bread", "whole-wheat"
  ratio: text("ratio").notNull(), // e.g., "1:1:1", "1:2:2"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("starter_feeding_logs_user_id_idx").on(table.userId),
  starterIdIdx: index("starter_feeding_logs_starter_id_idx").on(table.starterId),
  feedingDateIdx: index("starter_feeding_logs_feeding_date_idx").on(table.feedingDate),
}));

export const insertFeedingLogSchema = createInsertSchema(starterFeedingLogs).pick({
  userId: true,
  starterId: true,
  feedingDate: true,
  starterAmount: true,
  flourAmount: true,
  waterAmount: true,
  flourType: true,
  ratio: true,
  notes: true,
}).extend({
  // Override the feedingDate validation to accept Date objects from the frontend
  feedingDate: z.date().or(z.string().datetime()),
});

export type StarterFeedingLog = typeof starterFeedingLogs.$inferSelect;
export type InsertStarterFeedingLog = z.infer<typeof insertFeedingLogSchema>;

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // Free, Premium, Master Baker
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  billingPeriod: varchar("billing_period", { length: 20 }).notNull(), // monthly, yearly
  features: json("features").notNull(), // array of features
  limits: json("limits").notNull(), // usage limits
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: varchar("status", { length: 20 }).notNull(), // pending, succeeded, failed, cancelled
  description: text("description"),
  productType: varchar("product_type", { length: 50 }).notNull(), // subscription, one_time_purchase, course
  productId: text("product_id"), // reference to the purchased item
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("payment_transactions_user_id_idx").on(table.userId),
  statusIdx: index("payment_transactions_status_idx").on(table.status),
  productTypeIdx: index("payment_transactions_product_type_idx").on(table.productType),
  createdAtIdx: index("payment_transactions_created_at_idx").on(table.createdAt),
}));

// Premium Recipe Collections
export const premiumCollections = pgTable("premium_collections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  price: integer("price").notNull(), // in cents
  requiredTier: varchar("required_tier", { length: 20 }).default("premium"), // premium, master
  recipeIds: json("recipe_ids").notNull(), // array of recipe IDs
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Premium Courses
export const premiumCourses = pgTable("premium_courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  price: integer("price").notNull(), // in cents
  requiredTier: varchar("required_tier", { length: 20 }).default("premium"),
  lessons: json("lessons").notNull(), // array of lesson objects
  difficulty: varchar("difficulty", { length: 20 }).default("intermediate"),
  estimatedHours: integer("estimated_hours"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Purchases (for one-time purchases)
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productType: varchar("product_type", { length: 50 }).notNull(), // collection, course, starter_kit
  productId: integer("product_id").notNull(),
  transactionId: integer("transaction_id").references(() => paymentTransactions.id),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

// AI Usage Tracking (for rate limiting)
export const aiUsageLog = pgTable("ai_usage_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  feature: varchar("feature", { length: 50 }).notNull(), // recipe_generation, analysis, chat
  tokensUsed: integer("tokens_used").default(0),
  requestCount: integer("request_count").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Affiliate Program
export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productName: text("product_name").notNull(),
  productUrl: text("product_url").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  commission: integer("commission"), // percentage or fixed amount in cents
  category: varchar("category", { length: 50 }), // tools, ingredients, books
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions);
export const insertPremiumCollectionSchema = createInsertSchema(premiumCollections);
export const insertPremiumCourseSchema = createInsertSchema(premiumCourses);
export const insertUserPurchaseSchema = createInsertSchema(userPurchases);
export const insertAiUsageLogSchema = createInsertSchema(aiUsageLog);
export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks);

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type PremiumCollection = typeof premiumCollections.$inferSelect;
export type PremiumCourse = typeof premiumCourses.$inferSelect;
export type UserPurchase = typeof userPurchases.$inferSelect;
export type AiUsageLog = typeof aiUsageLog.$inferSelect;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const starterFeedingLogsRelations = relations(starterFeedingLogs, ({ one }) => ({
  user: one(users, {
    fields: [starterFeedingLogs.userId],
    references: [users.id],
  }),
  starter: one(sourdoughStarters, {
    fields: [starterFeedingLogs.starterId],
    references: [sourdoughStarters.id],
  }),
}));

export const sourdoughStartersRelations = relations(sourdoughStarters, ({ many }) => ({
  feedingLogs: many(starterFeedingLogs),
  healthLogs: many(starterHealthLogs),
  reminders: many(starterReminders),
}));

// Baker's Percentage Calculator
export const savedFormulas = pgTable("saved_formulas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  ingredients: json("ingredients").notNull(), // Array of ingredients with weights and percentages
  totalWeight: integer("total_weight").notNull(), // Total dough weight in grams
  flourWeight: integer("flour_weight").notNull(), // Total flour weight in grams
  hydration: integer("hydration"), // Calculated hydration percentage
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSavedFormulaSchema = createInsertSchema(savedFormulas).pick({
  userId: true,
  name: true,
  description: true,
  ingredients: true,
  totalWeight: true,
  flourWeight: true,
  hydration: true,
  isPublic: true,
});

export type SavedFormula = typeof savedFormulas.$inferSelect;
export type InsertSavedFormula = z.infer<typeof insertSavedFormulaSchema>;

// Bread Troubleshooting
export const troubleshootingIssues = pgTable("troubleshooting_issues", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // e.g., "crumb", "crust", "shape", "fermentation"
  title: text("title").notNull(),
  description: text("description").notNull(),
  possibleCauses: json("possible_causes").notNull(), // Array of possible causes
  solutions: json("solutions").notNull(), // Array of solutions
  imageUrl: text("image_url"), // Example image of the issue
  relatedIssues: json("related_issues"), // Array of related issue IDs
  displayOrder: integer("display_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTroubleshootingIssueSchema = createInsertSchema(troubleshootingIssues).pick({
  category: true,
  title: true,
  description: true,
  possibleCauses: true,
  solutions: true,
  imageUrl: true,
  relatedIssues: true,
  displayOrder: true,
  isPublished: true,
});

export type TroubleshootingIssue = typeof troubleshootingIssues.$inferSelect;
export type InsertTroubleshootingIssue = z.infer<typeof insertTroubleshootingIssueSchema>;

// Starter Feeding Reminders
export const starterReminders = pgTable("starter_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  starterId: integer("starter_id").references(() => sourdoughStarters.id),
  reminderName: text("reminder_name").notNull(),
  reminderTime: timestamp("reminder_time").notNull(), // When the reminder should trigger
  frequency: text("frequency").notNull(), // daily, weekly, custom
  daysOfWeek: json("days_of_week"), // Array of days for weekly reminders [0-6]
  feedingAmount: json("feeding_amount"), // Suggested feeding ratio and amounts
  isActive: boolean("is_active").default(true),
  emailNotification: boolean("email_notification").default(true),
  pushNotification: boolean("push_notification").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReminderSchema = createInsertSchema(starterReminders).pick({
  userId: true,
  starterId: true,
  reminderName: true,
  reminderTime: true,
  frequency: true,
  daysOfWeek: true,
  feedingAmount: true,
  isActive: true,
  emailNotification: true,
  pushNotification: true,
}).extend({
  reminderTime: z.date().or(z.string().datetime()),
});

export type StarterReminder = typeof starterReminders.$inferSelect;
export type InsertStarterReminder = z.infer<typeof insertReminderSchema>;

// Relations for new tables
export const savedFormulasRelations = relations(savedFormulas, ({ one }) => ({
  user: one(users, {
    fields: [savedFormulas.userId],
    references: [users.id],
  }),
}));

// Starter Health Tracking
export const starterHealthLogs = pgTable("starter_health_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  starterId: integer("starter_id").references(() => sourdoughStarters.id),
  logDate: timestamp("log_date").defaultNow().notNull(),
  activityRating: integer("activity_rating"), // 1-10 scale of bubbliness
  riseHeight: integer("rise_height"), // Rise in mm or % of container
  smell: text("smell"), // Description of smell
  appearance: text("appearance"), // Description of appearance
  temperature: integer("temperature"), // Ambient temperature
  lastFedTimestamp: timestamp("last_fed_timestamp"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  consistency: text("consistency"), // e.g., "liquid", "thick", "stretchy"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHealthLogSchema = createInsertSchema(starterHealthLogs).pick({
  userId: true,
  starterId: true,
  logDate: true,
  activityRating: true,
  riseHeight: true,
  smell: true,
  appearance: true,
  temperature: true,
  lastFedTimestamp: true,
  photoUrl: true,
  notes: true,
  consistency: true,
}).extend({
  logDate: z.date().or(z.string().datetime()),
  lastFedTimestamp: z.date().or(z.string().datetime()).optional(),
});

export type StarterHealthLog = typeof starterHealthLogs.$inferSelect;
export type InsertStarterHealthLog = z.infer<typeof insertHealthLogSchema>;

export const starterHealthLogsRelations = relations(starterHealthLogs, ({ one }) => ({
  user: one(users, {
    fields: [starterHealthLogs.userId],
    references: [users.id],
  }),
  starter: one(sourdoughStarters, {
    fields: [starterHealthLogs.starterId],
    references: [sourdoughStarters.id],
  }),
}));

export const starterRemindersRelations = relations(starterReminders, ({ one }) => ({
  user: one(users, {
    fields: [starterReminders.userId],
    references: [users.id],
  }),
  starter: one(sourdoughStarters, {
    fields: [starterReminders.starterId],
    references: [sourdoughStarters.id],
  }),
}));

// Declare tables first to resolve circular reference
export const bakingTimelinesTable = "baking_timelines";
export const starterBakingLogsTable = "starter_baking_logs";

// Starter Baking History first (no references to timeline yet)
export const starterBakingLogs = pgTable(starterBakingLogsTable, {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  starterId: integer("starter_id").references(() => sourdoughStarters.id),
  recipeId: integer("recipe_id").references(() => breadRecipes.id),
  bakeDate: timestamp("bake_date").defaultNow().notNull(),
  recipeName: text("recipe_name").notNull(),
  ovenSpringRating: integer("oven_spring_rating"), // 1-10 scale
  crumbStructureRating: integer("crumb_structure_rating"), // 1-10 scale 
  crustQualityRating: integer("crust_quality_rating"), // 1-10 scale
  flavorRating: integer("flavor_rating"), // 1-10 scale
  overallRating: integer("overall_rating"), // 1-10 scale
  starterPerformanceNotes: text("starter_performance_notes"),
  bakeNotes: text("bake_notes"),
  roomTemperature: integer("room_temperature"),
  bulkFermentationTime: integer("bulk_fermentation_time"), // in minutes
  proofingMethod: text("proofing_method"), // e.g. "room temperature", "refrigerator"
  proofingTime: integer("proofing_time"), // in minutes
  bakingTemperature: integer("baking_temperature"),
  bakingMethod: text("baking_method"), // e.g. "dutch oven", "baking stone"
  futureAdjustments: text("future_adjustments"),
  photoUrl: text("photo_url"),
  // We'll add the timeline ID in an alter table operation
  actualTimes: json("actual_times"), // Stores actual times for comparison with planned times
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Baking Timelines
export const bakingTimelines = pgTable(bakingTimelinesTable, {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  recipeId: integer("recipe_id").references(() => breadRecipes.id),
  recipeName: text("recipe_name").notNull(),
  timelineData: json("timeline_data").notNull(), // Stores all timeline steps and times
  desiredFinishTime: timestamp("desired_finish_time").notNull(),
  startTime: timestamp("start_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
  bakingLogId: integer("baking_log_id").references(() => starterBakingLogs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create schemas for timeline
export const insertBakingTimelineSchema = createInsertSchema(bakingTimelines).pick({
  userId: true,
  recipeId: true,
  recipeName: true,
  timelineData: true,
  desiredFinishTime: true,
  startTime: true,
  isCompleted: true,
  bakingLogId: true,
}).extend({
  desiredFinishTime: z.date().or(z.string().datetime()),
  startTime: z.date().or(z.string().datetime()),
  timelineData: z.any(),
  bakingLogId: z.number().optional(),
  isCompleted: z.boolean().default(false),
});

// Update the baking log schema to include the timeline fields
export const insertBakingLogSchema = createInsertSchema(starterBakingLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  bakeDate: z.date().or(z.string().datetime()),
  actualTimes: z.any().optional(),
});

export type BakingTimeline = typeof bakingTimelines.$inferSelect;
export type InsertBakingTimeline = z.infer<typeof insertBakingTimelineSchema>;
export type StarterBakingLog = typeof starterBakingLogs.$inferSelect;
export type InsertStarterBakingLog = z.infer<typeof insertBakingLogSchema>;

// Recipe validations relations
export const recipeValidationsRelations = relations(recipeValidations, ({ one }) => ({
  user: one(users, {
    fields: [recipeValidations.userId],
    references: [users.id],
  }),
}));

// Baking logs relations
export const starterBakingLogsRelations = relations(starterBakingLogs, ({ one }) => ({
  user: one(users, {
    fields: [starterBakingLogs.userId],
    references: [users.id],
  }),
  starter: one(sourdoughStarters, {
    fields: [starterBakingLogs.starterId],
    references: [sourdoughStarters.id],
  }),
  recipe: one(breadRecipes, {
    fields: [starterBakingLogs.recipeId],
    references: [breadRecipes.id],
  }),
}));

// Define the relations for baking timelines
export const bakingTimelinesRelations = relations(bakingTimelines, ({ one }) => ({
  user: one(users, {
    fields: [bakingTimelines.userId],
    references: [users.id],
  }),
  recipe: one(breadRecipes, {
    fields: [bakingTimelines.recipeId],
    references: [breadRecipes.id],
  }),
  bakingLog: one(starterBakingLogs, {
    fields: [bakingTimelines.bakingLogId],
    references: [starterBakingLogs.id],
  }),
}));

// Content Articles for SEO and education
export const contentArticles = pgTable("content_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: text("category").notNull(), // e.g., "starter-guide", "tool-education", "recipe-context", "ingredient-companion"
  relatedEntityType: text("related_entity_type"), // e.g., "starter", "recipe", "tool", "product"
  relatedEntityId: integer("related_entity_id"), // ID of the related entity (starter, recipe, tool, etc.)
  imageUrl: text("image_url"),
  author: text("author").default("Bakehouse Breads"),
  tags: json("tags").default([]),
  
  // Audio content fields
  audioUrl: text("audio_url"), // URL to audio file (MP3, etc.)
  audioDuration: integer("audio_duration"), // Duration in seconds
  audioTranscript: text("audio_transcript"), // Full transcript of audio content
  hasAudio: boolean("has_audio").default(false), // Flag to indicate if article has audio
  audioType: text("audio_type"), // e.g., "podcast", "narration", "interview", "tutorial"
  
  // SEO fields for audio content
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: json("keywords").default([]),
  readingTime: integer("reading_time"), // Estimated reading time in minutes
  wordCount: integer("word_count"), // Article word count
  featuredImageUrl: text("featured_image_url"), // For social sharing
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true),
  slug: text("slug").notNull().unique(),
});

export const insertContentArticleSchema = createInsertSchema(contentArticles).pick({
  title: true,
  content: true,
  excerpt: true,
  category: true,
  relatedEntityType: true,
  relatedEntityId: true,
  imageUrl: true,
  author: true,
  tags: true,
  audioUrl: true,
  audioDuration: true,
  audioTranscript: true,
  hasAudio: true,
  audioType: true,
  metaTitle: true,
  metaDescription: true,
  keywords: true,
  readingTime: true,
  wordCount: true,
  featuredImageUrl: true,
  isPublished: true,
  slug: true,
});

// Production Planning for Professional Baker's Command Center
export const productionBatches = pgTable("production_batches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  batchName: text("batch_name").notNull(),
  recipeId: integer("recipe_id").references(() => breadRecipes.id),
  recipeName: text("recipe_name").notNull(),
  plannedQuantity: integer("planned_quantity").notNull(), // Number of loaves
  actualQuantity: integer("actual_quantity"),
  
  // Timeline information
  plannedStartTime: timestamp("planned_start_time", { mode: 'string' }).notNull(),
  actualStartTime: timestamp("actual_start_time", { mode: 'string' }),
  plannedFinishTime: timestamp("planned_finish_time", { mode: 'string' }).notNull(),
  actualFinishTime: timestamp("actual_finish_time", { mode: 'string' }),
  
  // Status tracking
  status: varchar("status", { length: 20 }).notNull().default("planned"), // planned, active, proofing, baking, completed, cancelled
  currentPhase: varchar("current_phase", { length: 30 }), // mixing, bulk_fermentation, shaping, final_proof, baking
  phaseStartTime: timestamp("phase_start_time", { mode: 'string' }),
  
  // Resource allocation
  ovenSlot: integer("oven_slot"), // Which oven position (1, 2, 3, etc.)
  assignedBaker: text("assigned_baker"),
  priority: integer("priority").default(1), // 1 = highest, 5 = lowest
  
  // Business metrics
  costPerUnit: integer("cost_per_unit"), // Cost in cents per loaf
  sellingPrice: integer("selling_price"), // Price in cents per loaf
  estimatedProfit: integer("estimated_profit"), // Profit in cents per loaf
  
  // Production notes
  notes: text("notes"),
  qualityIssues: json("quality_issues"), // Array of issues encountered
  yieldNotes: text("yield_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productionSchedule = pgTable("production_schedule", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scheduleDate: timestamp("schedule_date").notNull(),
  shiftStart: timestamp("shift_start").notNull(),
  shiftEnd: timestamp("shift_end").notNull(),
  
  // Oven capacity management
  totalOvenSlots: integer("total_oven_slots").default(4),
  availableSlots: json("available_slots").default([]), // Array of available time slots
  
  // Staff assignments
  staffAssignments: json("staff_assignments"), // Array of {baker, shift, skills}
  maxConcurrentBatches: integer("max_concurrent_batches").default(6),
  
  // Daily targets
  targetRevenue: integer("target_revenue"), // Daily revenue target in cents
  actualRevenue: integer("actual_revenue"),
  targetProduction: integer("target_production"), // Total loaves target
  actualProduction: integer("actual_production"),
  
  // Efficiency metrics  
  ovenUtilization: integer("oven_utilization"), // Percentage
  laborHours: integer("labor_hours"), // Total labor hours scheduled
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredientInventory = pgTable("ingredient_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  ingredientName: text("ingredient_name").notNull(),
  currentStock: integer("current_stock").notNull(), // In grams
  reorderPoint: integer("reorder_point").notNull(), // Minimum stock level
  maxStock: integer("max_stock"), // Maximum storage capacity
  
  // Cost tracking
  costPerUnit: integer("cost_per_unit"), // Cost in cents per gram
  lastPurchasePrice: integer("last_purchase_price"),
  lastPurchaseDate: timestamp("last_purchase_date"),
  supplier: text("supplier"),
  
  // Quality tracking
  expirationDate: timestamp("expiration_date"),
  batchNumber: text("batch_number"),
  qualityGrade: varchar("quality_grade", { length: 10 }), // A, B, C grade
  
  // Usage patterns
  averageDailyUsage: integer("average_daily_usage"), // Grams per day
  lastUsedDate: timestamp("last_used_date"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema creation functions
export const insertProductionBatchSchema = createInsertSchema(productionBatches).pick({
  userId: true,
  batchName: true,
  recipeId: true,
  recipeName: true,
  plannedQuantity: true,
  actualQuantity: true,
  plannedStartTime: true,
  actualStartTime: true,
  plannedFinishTime: true,
  actualFinishTime: true,
  status: true,
  currentPhase: true,
  phaseStartTime: true,
  ovenSlot: true,
  assignedBaker: true,
  priority: true,
  costPerUnit: true,
  sellingPrice: true,
  estimatedProfit: true,
  notes: true,
  qualityIssues: true,
  yieldNotes: true,
}).extend({
  plannedStartTime: z.date().or(z.string().datetime()),
  actualStartTime: z.date().or(z.string().datetime()).optional(),
  plannedFinishTime: z.date().or(z.string().datetime()),
  actualFinishTime: z.date().or(z.string().datetime()).optional(),
  phaseStartTime: z.date().or(z.string().datetime()).optional(),
});

export const insertProductionScheduleSchema = createInsertSchema(productionSchedule).pick({
  userId: true,
  scheduleDate: true,
  shiftStart: true,
  shiftEnd: true,
  totalOvenSlots: true,
  availableSlots: true,
  staffAssignments: true,
  maxConcurrentBatches: true,
  targetRevenue: true,
  actualRevenue: true,
  targetProduction: true,
  actualProduction: true,
  ovenUtilization: true,
  laborHours: true,
}).extend({
  scheduleDate: z.date().or(z.string().datetime()),
  shiftStart: z.date().or(z.string().datetime()),
  shiftEnd: z.date().or(z.string().datetime()),
});

export const insertIngredientInventorySchema = createInsertSchema(ingredientInventory).pick({
  userId: true,
  ingredientName: true,
  currentStock: true,
  reorderPoint: true,
  maxStock: true,
  costPerUnit: true,
  lastPurchasePrice: true,
  lastPurchaseDate: true,
  supplier: true,
  expirationDate: true,
  batchNumber: true,
  qualityGrade: true,
  averageDailyUsage: true,
  lastUsedDate: true,
  isActive: true,
}).extend({
  lastPurchaseDate: z.date().or(z.string().datetime()).optional(),
  expirationDate: z.date().or(z.string().datetime()).optional(),
  lastUsedDate: z.date().or(z.string().datetime()).optional(),
});

// Type exports
export type ProductionBatch = typeof productionBatches.$inferSelect;
export type InsertProductionBatch = z.infer<typeof insertProductionBatchSchema>;
export type ProductionSchedule = typeof productionSchedule.$inferSelect;
export type InsertProductionSchedule = z.infer<typeof insertProductionScheduleSchema>;
export type IngredientInventory = typeof ingredientInventory.$inferSelect;
export type InsertIngredientInventory = z.infer<typeof insertIngredientInventorySchema>;

// Relations
export const productionBatchesRelations = relations(productionBatches, ({ one }) => ({
  user: one(users, {
    fields: [productionBatches.userId],
    references: [users.id],
  }),
  recipe: one(breadRecipes, {
    fields: [productionBatches.recipeId],
    references: [breadRecipes.id],
  }),
}));

export const productionScheduleRelations = relations(productionSchedule, ({ one }) => ({
  user: one(users, {
    fields: [productionSchedule.userId],
    references: [users.id],
  }),
}));

export const ingredientInventoryRelations = relations(ingredientInventory, ({ one }) => ({
  user: one(users, {
    fields: [ingredientInventory.userId],
    references: [users.id],
  }),
}));

export type ContentArticle = typeof contentArticles.$inferSelect;
export type InsertContentArticle = z.infer<typeof insertContentArticleSchema>;

// Update user relations to include new tables
export const usersRelations = relations(users, ({ many, one }) => ({
  recipes: many(breadRecipes),
  blogPosts: many(blogPosts),
  recipeValidations: many(recipeValidations),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId]
  }),
  orders: many(orders),
  feedingLogs: many(starterFeedingLogs),
  healthLogs: many(starterHealthLogs),
  reminders: many(starterReminders),
  formulas: many(savedFormulas),
}));

// Using the ScrapedRecipe type already defined above with Zod schema

// Content article relations
export const contentArticlesRelations = relations(contentArticles, ({ one }) => ({
  // One-way relationships are defined in the entities that reference the content
}));

// Update the relations for existing entities to include content articles
export const sourdoughStartersContentRelations = relations(sourdoughStarters, ({ many }) => ({
  contentArticles: many(contentArticles, {
    relationName: "starter_content"
  })
}));

export const breadRecipesContentRelations = relations(breadRecipes, ({ many }) => ({
  contentArticles: many(contentArticles, {
    relationName: "recipe_content"
  })
}));

export const productsContentRelations = relations(products, ({ many }) => ({
  contentArticles: many(contentArticles, {
    relationName: "product_content"
  })
}));

// Research Platform Tables

// Research Sources - peer-reviewed papers and studies
export const researchSources = pgTable("research_sources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").array().default([]),
  journal: varchar("journal", { length: 255 }),
  publicationDate: timestamp("publication_date"),
  doi: varchar("doi", { length: 255 }),
  pmid: varchar("pmid", { length: 50 }),
  url: text("url"),
  pdfPath: text("pdf_path"),
  abstract: text("abstract"),
  methodologyType: varchar("methodology_type", { length: 100 }),
  sampleSize: integer("sample_size"),
  confidenceLevel: varchar("confidence_level", { length: 50 }),
  fundingSource: text("funding_source"),
  conflictsOfInterest: text("conflicts_of_interest"),
  peerReviewed: boolean("peer_reviewed").default(false),
  impactFactor: integer("impact_factor"), // stored as integer to avoid decimal issues
  citationCount: integer("citation_count"),
  notebookLmId: varchar("notebook_lm_id", { length: 255 }),
  sourceQuality: varchar("source_quality", { length: 50 }).default("pending"), // gold_standard, high, medium, low, pending
  biasRisk: varchar("bias_risk", { length: 50 }).default("unknown"), // low, medium, high, unknown
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Research Topics/Categories for organizing knowledge
export const researchTopics = pgTable("research_topics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  notebookLmId: varchar("notebook_lm_id", { length: 255 }),
  parentTopicId: integer("parent_topic_id"),
  sourceCount: integer("source_count").default(0),
  confidenceScore: integer("confidence_score"), // stored as integer (0-100)
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content Citations - link content to research sources
export const contentCitations = pgTable("content_citations", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'article', 'claim', 'recipe_step'
  contentId: integer("content_id").notNull(),
  researchSourceId: integer("research_source_id").references(() => researchSources.id).notNull(),
  claimText: text("claim_text"),
  supportingQuote: text("supporting_quote"),
  pageNumber: integer("page_number"),
  confidenceRating: varchar("confidence_rating", { length: 20 }).default("pending"), // gold_standard, well_supported, preliminary, controversial
  validationStatus: varchar("validation_status", { length: 20 }).default("pending"), // verified, pending, disputed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Research Claims - validated statements with evidence
export const researchClaims = pgTable("research_claims", {
  id: serial("id").primaryKey(),
  claimText: text("claim_text").notNull(),
  topicId: integer("topic_id").references(() => researchTopics.id),
  confidenceRating: varchar("confidence_rating", { length: 20 }).default("pending"),
  sourceCount: integer("source_count").default(0),
  consensusLevel: varchar("consensus_level", { length: 20 }).default("unknown"), // strong, moderate, weak, conflicted
  lastValidated: timestamp("last_validated"),
  supportingSources: integer("supporting_sources").array().default([]),
  contradictingSources: integer("contradicting_sources").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Article Processing Jobs - track AI processing status
export const articleProcessingJobs = pgTable("article_processing_jobs", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  source: text("source").notNull(), // URL or filename
  sourceType: varchar("source_type", { length: 20 }).notNull(), // 'url' or 'file'
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, processing, completed, failed
  progress: integer("progress").default(0), // 0-100
  title: text("title"),
  extractedContent: text("extracted_content"),
  processedArticleId: integer("processed_article_id").references(() => researchArticles.id),
  errorMessage: text("error_message"),
  processingSteps: jsonb("processing_steps").default({}), // track which AI steps completed
  aiProviders: text("ai_providers").array().default([]), // which AI providers were used
  qualityScores: jsonb("quality_scores").default({}), // store grading results
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Article Chat Conversations
export const articleConversations = pgTable("article_conversations", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => researchArticles.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(), // For anonymous users
  userId: integer("user_id").references(() => users.id), // For logged-in users
  title: text("title"), // Optional conversation title
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => articleConversations.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Research Collections - organize related articles and documents
export const researchCollections = pgTable("research_collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  topicFocus: varchar("topic_focus", { length: 255 }),
  articleCount: integer("article_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Research Articles - evidence-based content with enhanced review workflow
export const researchArticles = pgTable("research_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  executiveSummary: text("executive_summary"), // AI-generated summary for display
  content: text("content").notNull(), // Display content (can be summary)
  fullContent: text("full_content"), // Complete article content for chat/RAG
  
  // Enhanced review workflow fields
  status: varchar("status", { length: 20 }).notNull().default("pending_review"), // pending_review, approved, rejected, published
  reviewNotes: text("review_notes"), // Admin notes during review
  originalFilename: text("original_filename"), // PDF filename for reference
  version: integer("version").default(1), // Version control for edits
  
  // Topic system (multi-topic support)
  topicIds: json("topic_ids").default([]), // Array of topic IDs for multi-topic assignment
  suggestedTopics: json("suggested_topics").default([]), // AI-suggested topics for admin review
  
  // Legacy fields (maintain compatibility)
  topicId: integer("topic_id").references(() => researchTopics.id),
  authorId: integer("author_id").references(() => users.id),
  researchValidated: boolean("research_validated").default(false),
  confidenceScore: integer("confidence_score"), // 0-100
  lastFactCheck: timestamp("last_fact_check"),
  citationCount: integer("citation_count").default(0),
  researchQueries: json("research_queries").default([]),
  practicalApplications: json("practical_applications").default([]),
  commonMisconceptions: json("common_misconceptions").default([]),
  keyFindings: json("key_findings").default([]),
  
  // Publication control
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  approvedAt: timestamp("approved_at"), // When admin approved
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content Quality Tracking
export const contentQuality = pgTable("content_quality", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  qualityScore: integer("quality_score"), // 0-100
  citationAccuracy: integer("citation_accuracy"), // 0-100
  sourceDiversity: integer("source_diversity"), // 0-100
  expertReviewed: boolean("expert_reviewed").default(false),
  expertReviewerId: integer("expert_reviewer_id").references(() => users.id),
  lastQualityCheck: timestamp("last_quality_check"),
  issues: json("issues").default([]), // Array of quality issues found
  improvements: json("improvements").default([]), // Array of suggested improvements
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for research tables
export const insertResearchSourceSchema = createInsertSchema(researchSources).pick({
  title: true,
  authors: true,
  journal: true,
  publicationDate: true,
  doi: true,
  pmid: true,
  url: true,
  abstract: true,
  methodologyType: true,
  sampleSize: true,
  confidenceLevel: true,
  fundingSource: true,
  conflictsOfInterest: true,
  peerReviewed: true,
  impactFactor: true,
  citationCount: true,
  notebookLmId: true,
  sourceQuality: true,
  biasRisk: true,
});

export const insertResearchTopicSchema = createInsertSchema(researchTopics).pick({
  name: true,
  description: true,
  slug: true,
  notebookLmId: true,
  parentTopicId: true,
});

export const insertContentCitationSchema = createInsertSchema(contentCitations).pick({
  contentType: true,
  contentId: true,
  researchSourceId: true,
  claimText: true,
  supportingQuote: true,
  pageNumber: true,
  confidenceRating: true,
  validationStatus: true,
});

export const insertResearchClaimSchema = createInsertSchema(researchClaims).pick({
  claimText: true,
  topicId: true,
  confidenceRating: true,
  consensusLevel: true,
  supportingSources: true,
  contradictingSources: true,
});

export const insertResearchCollectionSchema = createInsertSchema(researchCollections).pick({
  name: true,
  description: true,
  topicFocus: true,
});

export const insertResearchArticleSchema = createInsertSchema(researchArticles).pick({
  title: true,
  slug: true,
  executiveSummary: true,
  content: true,
  fullContent: true,
  status: true,
  reviewNotes: true,
  originalFilename: true,
  version: true,
  topicIds: true,
  suggestedTopics: true,
  topicId: true,
  authorId: true,
  researchValidated: true,
  confidenceScore: true,
  lastFactCheck: true,
  citationCount: true,
  researchQueries: true,
  practicalApplications: true,
  commonMisconceptions: true,
  keyFindings: true,
  isPublished: true,
  publishedAt: true,
  approvedAt: true,
});

export const insertArticleConversationSchema = createInsertSchema(articleConversations).pick({
  articleId: true,
  sessionId: true,
  userId: true,
  title: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  conversationId: true,
  role: true,
  content: true,
});

export const insertContentQualitySchema = createInsertSchema(contentQuality).pick({
  contentType: true,
  contentId: true,
  qualityScore: true,
  citationAccuracy: true,
  sourceDiversity: true,
  expertReviewed: true,
  expertReviewerId: true,
  issues: true,
  improvements: true,
});



// Research types
export type ResearchSource = typeof researchSources.$inferSelect;
export type InsertResearchSource = z.infer<typeof insertResearchSourceSchema>;

export type ResearchTopic = typeof researchTopics.$inferSelect;
export type InsertResearchTopic = z.infer<typeof insertResearchTopicSchema>;

export type ContentCitation = typeof contentCitations.$inferSelect;
export type InsertContentCitation = z.infer<typeof insertContentCitationSchema>;

export type ResearchClaim = typeof researchClaims.$inferSelect;
export type InsertResearchClaim = z.infer<typeof insertResearchClaimSchema>;

export type ResearchCollection = typeof researchCollections.$inferSelect;
export type InsertResearchCollection = z.infer<typeof insertResearchCollectionSchema>;

export type ResearchArticle = typeof researchArticles.$inferSelect;
export type InsertResearchArticle = z.infer<typeof insertResearchArticleSchema>;

export type ContentQuality = typeof contentQuality.$inferSelect;
export type InsertContentQuality = z.infer<typeof insertContentQualitySchema>;

export type ArticleProcessingJob = typeof articleProcessingJobs.$inferSelect;
export type InsertArticleProcessingJob = typeof articleProcessingJobs.$inferInsert;

export type ArticleConversation = typeof articleConversations.$inferSelect;
export type InsertArticleConversation = z.infer<typeof insertArticleConversationSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export const insertArticleProcessingJobSchema = createInsertSchema(articleProcessingJobs);

// Research Relations
export const researchSourcesRelations = relations(researchSources, ({ many }) => ({
  citations: many(contentCitations),
}));

export const researchTopicsRelations = relations(researchTopics, ({ one, many }) => ({
  parentTopic: one(researchTopics, {
    fields: [researchTopics.parentTopicId],
    references: [researchTopics.id],
  }),
  childTopics: many(researchTopics),
  claims: many(researchClaims),
  articles: many(researchArticles),
}));

export const contentCitationsRelations = relations(contentCitations, ({ one }) => ({
  researchSource: one(researchSources, {
    fields: [contentCitations.researchSourceId],
    references: [researchSources.id],
  }),
}));

export const researchClaimsRelations = relations(researchClaims, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [researchClaims.topicId],
    references: [researchTopics.id],
  }),
}));

export const researchArticlesRelations = relations(researchArticles, ({ one }) => ({
  topic: one(researchTopics, {
    fields: [researchArticles.topicId],
    references: [researchTopics.id],
  }),
  author: one(users, {
    fields: [researchArticles.authorId],
    references: [users.id],
  }),
}));

export const contentQualityRelations = relations(contentQuality, ({ one }) => ({
  expertReviewer: one(users, {
    fields: [contentQuality.expertReviewerId],
    references: [users.id],
  }),
}));

export const articleProcessingJobsRelations = relations(articleProcessingJobs, ({ one }) => ({
  processedArticle: one(researchArticles, {
    fields: [articleProcessingJobs.processedArticleId],
    references: [researchArticles.id],
  }),
}));
