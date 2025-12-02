import { 
  User, 
  InsertUser, 
  UserPreference,
  InsertUserPreference,
  BreadRecipe, 
  InsertBreadRecipe, 
  SourdoughStarter, 
  InsertSourdoughStarter,
  Product,
  InsertProduct,
  Order,
  InsertOrder,
  FAQ,
  InsertFAQ,
  BlogPost,
  InsertBlogPost,
  UpdateBlogPost,
  StarterFeedingLog,
  InsertStarterFeedingLog,
  StarterHealthLog,
  InsertStarterHealthLog,
  StarterBakingLog,
  InsertStarterBakingLog,
  SavedFormula,
  InsertSavedFormula,
  TroubleshootingIssue,
  InsertTroubleshootingIssue,
  StarterReminder,
  InsertStarterReminder,
  RecipeValidation,
  InsertRecipeValidation,
  ContentArticle,
  InsertContentArticle,
  BakingTimeline,
  InsertBakingTimeline,
  Video,
  InsertVideo,
  VideoPlaylist,
  InsertVideoPlaylist,
  ResearchSource,
  InsertResearchSource,
  ResearchTopic,
  InsertResearchTopic,
  ResearchClaim,
  InsertResearchClaim,
  ResearchCollection,
  InsertResearchCollection,
  ResearchArticle,
  InsertResearchArticle,
  ContentCitation,
  InsertContentCitation,
  ContentQuality,
  InsertContentQuality,
  ArticleProcessingJob,
  InsertArticleProcessingJob,
  ArticleConversation,
  InsertArticleConversation,
  ChatMessage,
  InsertChatMessage,
  users,
  userPreferences,
  breadRecipes,
  sourdoughStarters,
  products,
  orders,
  faqs,
  blogPosts,
  starterFeedingLogs,
  starterHealthLogs,
  starterBakingLogs,
  savedFormulas,
  troubleshootingIssues,
  starterReminders,
  videos,
  videoPlaylists,
  recipeValidations,
  contentArticles,
  bakingTimelines,
  researchSources,
  researchTopics,
  researchClaims,
  researchCollections,
  researchArticles,
  contentCitations,
  contentQuality,
  articleProcessingJobs,
  articleConversations,
  chatMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// Interface defining storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // User preferences methods
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreference>): Promise<UserPreference | undefined>;
  
  // Bread recipe methods
  getAllRecipes(): Promise<BreadRecipe[]>;
  getUserRecipes(userId: number): Promise<BreadRecipe[]>;
  getPublicRecipes(): Promise<BreadRecipe[]>;
  getRecipeById(id: number): Promise<BreadRecipe | undefined>;
  createRecipe(recipe: InsertBreadRecipe): Promise<BreadRecipe>;
  updateRecipe(id: number, recipe: Partial<InsertBreadRecipe>): Promise<BreadRecipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Sourdough starter methods
  getAllStarters(): Promise<SourdoughStarter[]>;
  getAllSourdoughStarters(): Promise<SourdoughStarter[]>;
  getStarterById(id: number): Promise<SourdoughStarter | undefined>;
  createStarter(starter: InsertSourdoughStarter): Promise<SourdoughStarter>;
  updateStarter(id: number, starter: Partial<InsertSourdoughStarter>): Promise<SourdoughStarter | undefined>;
  deleteStarter(id: number): Promise<boolean>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getAllOrders(): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, orderUpdates: Partial<InsertOrder>): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // FAQ methods
  getAllFaqs(): Promise<FAQ[]>;
  getFaqById(id: number): Promise<FAQ | undefined>;
  getFaqsByCategory(category: string): Promise<FAQ[]>;
  getPublishedFaqs(): Promise<FAQ[]>;
  createFaq(faq: InsertFAQ): Promise<FAQ>;
  updateFaq(id: number, faq: Partial<InsertFAQ>): Promise<FAQ | undefined>;
  deleteFaq(id: number): Promise<boolean>;
  
  // Blog posts methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostsByCategory(category: string): Promise<BlogPost[]>;
  getBlogPostsByAuthor(authorId: number): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: UpdateBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Starter feeding logs methods
  getUserFeedingLogs(userId: number): Promise<StarterFeedingLog[]>;
  getStarterFeedingLogs(starterId: number): Promise<StarterFeedingLog[]>;
  getStarterFeedingLogsByDate(starterId: number, date: Date): Promise<StarterFeedingLog[]>;
  getStarterFeedingLogDates(starterId: number): Promise<Date[]>;
  createFeedingLog(log: InsertStarterFeedingLog): Promise<StarterFeedingLog>;
  deleteFeedingLog(id: number): Promise<boolean>;
  
  // Starter health logs methods
  getUserHealthLogs(userId: number): Promise<StarterHealthLog[]>;
  getStarterHealthLogs(starterId: number): Promise<StarterHealthLog[]>;
  getHealthLogById(id: number): Promise<StarterHealthLog | undefined>;
  getLatestHealthLog(starterId: number): Promise<StarterHealthLog | undefined>;
  createHealthLog(log: InsertStarterHealthLog): Promise<StarterHealthLog>;
  updateHealthLog(id: number, log: Partial<InsertStarterHealthLog>): Promise<StarterHealthLog | undefined>;
  deleteHealthLog(id: number): Promise<boolean>;
  
  // Starter baking logs methods
  getUserBakingLogs(userId: number): Promise<StarterBakingLog[]>;
  getStarterBakingLogs(starterId: number): Promise<StarterBakingLog[]>;
  getStarterBakingLogsByRecipe(starterId: number, recipeId: number): Promise<StarterBakingLog[]>;
  getBakingLogById(id: number): Promise<StarterBakingLog | undefined>;
  getBakingLogsByRecipeId(recipeId: number): Promise<StarterBakingLog[]>;
  getAllBakingLogs(): Promise<StarterBakingLog[]>;
  createBakingLog(log: InsertStarterBakingLog): Promise<StarterBakingLog>;
  updateBakingLog(id: number, log: Partial<InsertStarterBakingLog>): Promise<StarterBakingLog | undefined>;
  deleteBakingLog(id: number): Promise<boolean>;
  
  // Baking Timeline methods
  getUserTimelines(userId: number): Promise<BakingTimeline[]>;
  getTimelineById(id: number): Promise<BakingTimeline | undefined>;
  getTimelinesByRecipeId(recipeId: number): Promise<BakingTimeline[]>;
  createTimeline(timeline: InsertBakingTimeline): Promise<BakingTimeline>;
  updateTimeline(id: number, timeline: Partial<InsertBakingTimeline>): Promise<BakingTimeline | undefined>;
  deleteTimeline(id: number): Promise<boolean>;
  markTimelineComplete(id: number, bakingLogId: number): Promise<BakingTimeline | undefined>;
  
  // Baker's Percentage Calculator methods
  getAllFormulas(): Promise<SavedFormula[]>;
  getUserFormulas(userId: number): Promise<SavedFormula[]>;
  getPublicFormulas(): Promise<SavedFormula[]>;
  getFormulaById(id: number): Promise<SavedFormula | undefined>;
  createFormula(formula: InsertSavedFormula): Promise<SavedFormula>;
  updateFormula(id: number, formula: Partial<InsertSavedFormula>): Promise<SavedFormula | undefined>;
  deleteFormula(id: number): Promise<boolean>;
  
  // Troubleshooting methods
  getAllTroubleshootingIssues(): Promise<TroubleshootingIssue[]>;
  getTroubleshootingIssuesByCategory(category: string): Promise<TroubleshootingIssue[]>;
  getTroubleshootingIssueById(id: number): Promise<TroubleshootingIssue | undefined>;
  getPublishedTroubleshootingIssues(): Promise<TroubleshootingIssue[]>;
  createTroubleshootingIssue(issue: InsertTroubleshootingIssue): Promise<TroubleshootingIssue>;
  updateTroubleshootingIssue(id: number, issue: Partial<InsertTroubleshootingIssue>): Promise<TroubleshootingIssue | undefined>;
  deleteTroubleshootingIssue(id: number): Promise<boolean>;
  
  // Starter Reminder methods
  getUserReminders(userId: number): Promise<StarterReminder[]>;
  getStarterReminders(starterId: number): Promise<StarterReminder[]>;
  getActiveReminders(): Promise<StarterReminder[]>;
  getReminderById(id: number): Promise<StarterReminder | undefined>;
  createReminder(reminder: InsertStarterReminder): Promise<StarterReminder>;
  updateReminder(id: number, reminder: Partial<InsertStarterReminder>): Promise<StarterReminder | undefined>;
  toggleReminderActive(id: number, isActive: boolean): Promise<StarterReminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Recipe Validation methods
  getUserRecipeValidations(userId: number): Promise<RecipeValidation[]>;
  getRecipeValidationById(id: number): Promise<RecipeValidation | undefined>;
  createRecipeValidation(validation: InsertRecipeValidation): Promise<RecipeValidation>;
  deleteRecipeValidation(id: number): Promise<boolean>;
  
  // Content Articles methods
  getAllContentArticles(): Promise<ContentArticle[]>;
  getContentArticleById(id: number): Promise<ContentArticle | undefined>;
  getContentArticleBySlug(slug: string): Promise<ContentArticle | undefined>;
  getContentArticlesByCategory(category: string): Promise<ContentArticle[]>;
  getContentArticlesByEntityType(entityType: string): Promise<ContentArticle[]>;
  getContentArticlesByEntityId(entityType: string, entityId: number): Promise<ContentArticle[]>;
  getPublishedContentArticles(): Promise<ContentArticle[]>;
  createContentArticle(article: InsertContentArticle): Promise<ContentArticle>;
  updateContentArticle(id: number, articleUpdates: Partial<InsertContentArticle>): Promise<ContentArticle | undefined>;
  deleteContentArticle(id: number): Promise<boolean>;
  
  // Video methods
  getAllVideos(): Promise<Video[]>;
  getFeaturedVideos(): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  getVideosByCategory(category: string): Promise<Video[]>;
  getVideosByDifficulty(difficulty: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Research Source methods
  getAllResearchSources(): Promise<ResearchSource[]>;
  getResearchSourceById(id: number): Promise<ResearchSource | undefined>;
  getResearchSourcesByTopic(topicId: number): Promise<ResearchSource[]>;
  getResearchSourcesByQuality(quality: string): Promise<ResearchSource[]>;
  createResearchSource(source: InsertResearchSource): Promise<ResearchSource>;
  updateResearchSource(id: number, source: Partial<InsertResearchSource>): Promise<ResearchSource | undefined>;
  deleteResearchSource(id: number): Promise<boolean>;
  
  // Research Topic methods
  getAllResearchTopics(): Promise<ResearchTopic[]>;
  getResearchTopicById(id: number): Promise<ResearchTopic | undefined>;
  getResearchTopicBySlug(slug: string): Promise<ResearchTopic | undefined>;
  getTopLevelResearchTopics(): Promise<ResearchTopic[]>;
  getChildTopics(parentId: number): Promise<ResearchTopic[]>;
  createResearchTopic(topic: InsertResearchTopic): Promise<ResearchTopic>;
  updateResearchTopic(id: number, topic: Partial<InsertResearchTopic>): Promise<ResearchTopic | undefined>;
  deleteResearchTopic(id: number): Promise<boolean>;
  
  // Research Claim methods
  getAllResearchClaims(): Promise<ResearchClaim[]>;
  getResearchClaimById(id: number): Promise<ResearchClaim | undefined>;
  getResearchClaimsByTopic(topicId: number): Promise<ResearchClaim[]>;
  getResearchClaimsByConfidence(rating: string): Promise<ResearchClaim[]>;
  createResearchClaim(claim: InsertResearchClaim): Promise<ResearchClaim>;
  updateResearchClaim(id: number, claim: Partial<InsertResearchClaim>): Promise<ResearchClaim | undefined>;
  deleteResearchClaim(id: number): Promise<boolean>;
  
  // Research Collection methods
  getAllResearchCollections(): Promise<ResearchCollection[]>;
  getResearchCollectionById(id: number): Promise<ResearchCollection | undefined>;
  getActiveResearchCollections(): Promise<ResearchCollection[]>;
  createResearchCollection(collection: InsertResearchCollection): Promise<ResearchCollection>;
  updateResearchCollection(id: number, collection: Partial<InsertResearchCollection>): Promise<ResearchCollection | undefined>;
  deleteResearchCollection(id: number): Promise<boolean>;
  
  // Research Article methods
  getAllResearchArticles(): Promise<ResearchArticle[]>;
  getResearchArticleById(id: number): Promise<ResearchArticle | undefined>;
  getResearchArticleBySlug(slug: string): Promise<ResearchArticle | undefined>;
  getPublishedResearchArticles(): Promise<ResearchArticle[]>;
  getResearchArticlesByTopic(topicId: number): Promise<ResearchArticle[]>;
  createResearchArticle(article: InsertResearchArticle): Promise<ResearchArticle>;
  updateResearchArticle(id: number, article: Partial<InsertResearchArticle>): Promise<ResearchArticle | undefined>;
  deleteResearchArticle(id: number): Promise<boolean>;
  
  // Content Citation methods
  getAllContentCitations(): Promise<ContentCitation[]>;
  getContentCitationById(id: number): Promise<ContentCitation | undefined>;
  getCitationsByContent(contentType: string, contentId: number): Promise<ContentCitation[]>;
  getCitationsBySource(sourceId: number): Promise<ContentCitation[]>;
  createContentCitation(citation: InsertContentCitation): Promise<ContentCitation>;
  updateContentCitation(id: number, citation: Partial<InsertContentCitation>): Promise<ContentCitation | undefined>;
  deleteContentCitation(id: number): Promise<boolean>;
  
  // Article Processing Job methods
  getAllProcessingJobs(): Promise<ArticleProcessingJob[]>;
  getProcessingJobById(id: string): Promise<ArticleProcessingJob | undefined>;
  createProcessingJob(job: Partial<ArticleProcessingJob>): Promise<ArticleProcessingJob>;
  updateProcessingJob(id: string, job: Partial<ArticleProcessingJob>): Promise<ArticleProcessingJob | undefined>;
  
  // Content Quality methods
  getAllContentQuality(): Promise<ContentQuality[]>;
  getContentQualityById(id: number): Promise<ContentQuality | undefined>;
  getContentQualityByContent(contentType: string, contentId: number): Promise<ContentQuality | undefined>;
  createContentQuality(quality: InsertContentQuality): Promise<ContentQuality>;
  updateContentQuality(id: number, quality: Partial<InsertContentQuality>): Promise<ContentQuality | undefined>;
  deleteContentQuality(id: number): Promise<boolean>;
}

// DatabaseStorage class that implements the IStorage interface
export class DatabaseStorage implements IStorage {
  // Content Articles methods
  async getAllContentArticles(): Promise<ContentArticle[]> {
    return await db.select().from(contentArticles);
  }
  
  async getContentArticleById(id: number): Promise<ContentArticle | undefined> {
    const [article] = await db.select().from(contentArticles).where(eq(contentArticles.id, id));
    return article || undefined;
  }
  
  async getContentArticleBySlug(slug: string): Promise<ContentArticle | undefined> {
    const [article] = await db.select().from(contentArticles).where(eq(contentArticles.slug, slug));
    return article || undefined;
  }
  
  async getContentArticlesByCategory(category: string): Promise<ContentArticle[]> {
    return await db.select().from(contentArticles).where(eq(contentArticles.category, category));
  }
  
  async getContentArticlesByEntityType(entityType: string): Promise<ContentArticle[]> {
    return await db.select().from(contentArticles).where(eq(contentArticles.relatedEntityType, entityType));
  }
  
  async getContentArticlesByEntityId(entityType: string, entityId: number): Promise<ContentArticle[]> {
    return await db.select().from(contentArticles)
      .where(and(
        eq(contentArticles.relatedEntityType, entityType),
        eq(contentArticles.relatedEntityId, entityId)
      ));
  }
  
  async getPublishedContentArticles(limit?: number): Promise<ContentArticle[]> {
    const baseQuery = db.select().from(contentArticles).where(eq(contentArticles.isPublished, true));
    if (limit) {
      return await baseQuery.limit(limit);
    }
    return await baseQuery;
  }


  
  async createContentArticle(insertArticle: InsertContentArticle): Promise<ContentArticle> {
    const now = new Date();
    
    const [article] = await db
      .insert(contentArticles)
      .values({
        ...insertArticle,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return article;
  }
  
  async updateContentArticle(id: number, articleUpdates: Partial<InsertContentArticle>): Promise<ContentArticle | undefined> {
    const now = new Date();
    
    const [updatedArticle] = await db
      .update(contentArticles)
      .set({
        ...articleUpdates,
        updatedAt: now
      } as any)
      .where(eq(contentArticles.id, id))
      .returning();
    return updatedArticle || undefined;
  }
  
  async deleteContentArticle(id: number): Promise<boolean> {
    const result = await db
      .delete(contentArticles)
      .where(eq(contentArticles.id, id))
      .returning({ id: contentArticles.id });
    return result.length > 0;
  }

  // Recipe Validation methods
  async getUserRecipeValidations(userId: number): Promise<RecipeValidation[]> {
    return await db.select().from(recipeValidations).where(eq(recipeValidations.userId, userId));
  }
  
  async getRecipeValidationById(id: number): Promise<RecipeValidation | undefined> {
    const [validation] = await db.select().from(recipeValidations).where(eq(recipeValidations.id, id));
    return validation || undefined;
  }
  
  async createRecipeValidation(insertValidation: InsertRecipeValidation): Promise<RecipeValidation> {
    const now = new Date();
    
    const [validation] = await db
      .insert(recipeValidations)
      .values({
        ...insertValidation,
        createdAt: now
      } as any)
      .returning();
    return validation;
  }
  
  async deleteRecipeValidation(id: number): Promise<boolean> {
    const result = await db
      .delete(recipeValidations)
      .where(eq(recipeValidations.id, id))
      .returning({ id: recipeValidations.id });
    return result.length > 0;
  }
  
  // Starter Baking Logs methods
  async getUserBakingLogs(userId: number): Promise<StarterBakingLog[]> {
    return await db
      .select()
      .from(starterBakingLogs)
      .where(eq(starterBakingLogs.userId, userId))
      .orderBy(desc(starterBakingLogs.bakeDate));
  }
  
  async getStarterBakingLogs(starterId: number): Promise<StarterBakingLog[]> {
    return await db
      .select()
      .from(starterBakingLogs)
      .where(eq(starterBakingLogs.starterId, starterId))
      .orderBy(desc(starterBakingLogs.bakeDate));
  }
  
  async getStarterBakingLogsByRecipe(starterId: number, recipeId: number): Promise<StarterBakingLog[]> {
    return await db
      .select()
      .from(starterBakingLogs)
      .where(and(
        eq(starterBakingLogs.starterId, starterId),
        eq(starterBakingLogs.recipeId, recipeId)
      ))
      .orderBy(desc(starterBakingLogs.bakeDate));
  }
  
  async getBakingLogById(id: number): Promise<StarterBakingLog | undefined> {
    const [log] = await db
      .select()
      .from(starterBakingLogs)
      .where(eq(starterBakingLogs.id, id));
    return log || undefined;
  }
  
  async getBakingLogsByRecipeId(recipeId: number): Promise<StarterBakingLog[]> {
    return await db
      .select()
      .from(starterBakingLogs)
      .where(eq(starterBakingLogs.recipeId, recipeId))
      .orderBy(desc(starterBakingLogs.bakeDate));
  }
  
  async getAllBakingLogs(): Promise<StarterBakingLog[]> {
    return await db
      .select()
      .from(starterBakingLogs)
      .orderBy(desc(starterBakingLogs.bakeDate));
  }
  
  async createBakingLog(insertLog: InsertStarterBakingLog): Promise<StarterBakingLog> {
    const now = new Date();
    
    // Ensure bakeDate is a proper Date object
    const preparedLog = {
      ...insertLog,
      bakeDate: insertLog.bakeDate instanceof Date 
        ? insertLog.bakeDate 
        : new Date(insertLog.bakeDate),
      createdAt: now
    };
    
    const [log] = await db
      .insert(starterBakingLogs)
      .values(preparedLog as any)
      .returning();
    return log;
  }
  
  async updateBakingLog(id: number, logUpdates: Partial<InsertStarterBakingLog>): Promise<StarterBakingLog | undefined> {
    // Handle date conversion if bakeDate is included in the updates
    const preparedUpdates = { ...logUpdates };
    if (preparedUpdates.bakeDate) {
      preparedUpdates.bakeDate = preparedUpdates.bakeDate instanceof Date 
        ? preparedUpdates.bakeDate 
        : new Date(preparedUpdates.bakeDate);
    }
    
    const [updatedLog] = await db
      .update(starterBakingLogs)
      .set(preparedUpdates as any)
      .where(eq(starterBakingLogs.id, id))
      .returning();
    return updatedLog || undefined;
  }
  
  async deleteBakingLog(id: number): Promise<boolean> {
    const result = await db
      .delete(starterBakingLogs)
      .where(eq(starterBakingLogs.id, id))
      .returning({ id: starterBakingLogs.id });
    return result.length > 0;
  }
  
  // Baking Timeline methods
  async getUserTimelines(userId: number): Promise<BakingTimeline[]> {
    return await db
      .select()
      .from(bakingTimelines)
      .where(eq(bakingTimelines.userId, userId))
      .orderBy(desc(bakingTimelines.createdAt));
  }
  
  async getTimelineById(id: number): Promise<BakingTimeline | undefined> {
    const [timeline] = await db
      .select()
      .from(bakingTimelines)
      .where(eq(bakingTimelines.id, id));
    return timeline || undefined;
  }
  
  async getTimelinesByRecipeId(recipeId: number): Promise<BakingTimeline[]> {
    return await db
      .select()
      .from(bakingTimelines)
      .where(eq(bakingTimelines.recipeId, recipeId))
      .orderBy(desc(bakingTimelines.createdAt));
  }
  
  async createTimeline(insertTimeline: InsertBakingTimeline): Promise<BakingTimeline> {
    const now = new Date();
    
    // Ensure date fields are properly formatted
    const preparedTimeline = {
      ...insertTimeline,
      desiredFinishTime: insertTimeline.desiredFinishTime instanceof Date 
        ? insertTimeline.desiredFinishTime 
        : new Date(insertTimeline.desiredFinishTime),
      startTime: insertTimeline.startTime instanceof Date 
        ? insertTimeline.startTime 
        : new Date(insertTimeline.startTime),
      createdAt: now
    };
    
    const [timeline] = await db
      .insert(bakingTimelines)
      .values(preparedTimeline as any)
      .returning();
    return timeline;
  }
  
  async updateTimeline(id: number, timelineUpdates: Partial<InsertBakingTimeline>): Promise<BakingTimeline | undefined> {
    // Handle date conversions if included in the updates
    const preparedUpdates = { ...timelineUpdates };
    
    if (preparedUpdates.desiredFinishTime) {
      preparedUpdates.desiredFinishTime = preparedUpdates.desiredFinishTime instanceof Date 
        ? preparedUpdates.desiredFinishTime 
        : new Date(preparedUpdates.desiredFinishTime);
    }
    
    if (preparedUpdates.startTime) {
      preparedUpdates.startTime = preparedUpdates.startTime instanceof Date 
        ? preparedUpdates.startTime 
        : new Date(preparedUpdates.startTime);
    }
    
    const [updatedTimeline] = await db
      .update(bakingTimelines)
      .set(preparedUpdates as any)
      .where(eq(bakingTimelines.id, id))
      .returning();
    return updatedTimeline || undefined;
  }
  
  async deleteTimeline(id: number): Promise<boolean> {
    const result = await db
      .delete(bakingTimelines)
      .where(eq(bakingTimelines.id, id))
      .returning({ id: bakingTimelines.id });
    return result.length > 0;
  }
  
  async markTimelineComplete(id: number, bakingLogId: number): Promise<BakingTimeline | undefined> {
    const [updatedTimeline] = await db
      .update(bakingTimelines)
      .set({ 
        isCompleted: true,
        bakingLogId
      })
      .where(eq(bakingTimelines.id, id))
      .returning();
    return updatedTimeline || undefined;
  }
  
  // Baker's Percentage Calculator methods
  async getAllFormulas(): Promise<SavedFormula[]> {
    return await db.select().from(savedFormulas);
  }
  
  async getUserFormulas(userId: number): Promise<SavedFormula[]> {
    return await db.select().from(savedFormulas).where(eq(savedFormulas.userId, userId));
  }
  
  async getPublicFormulas(): Promise<SavedFormula[]> {
    return await db.select().from(savedFormulas).where(eq(savedFormulas.isPublic, true));
  }
  
  async getFormulaById(id: number): Promise<SavedFormula | undefined> {
    const [formula] = await db.select().from(savedFormulas).where(eq(savedFormulas.id, id));
    return formula || undefined;
  }
  
  async createFormula(insertFormula: InsertSavedFormula): Promise<SavedFormula> {
    const now = new Date();
    
    const [formula] = await db
      .insert(savedFormulas)
      .values({
        ...insertFormula,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return formula;
  }
  
  async updateFormula(id: number, formulaUpdates: Partial<InsertSavedFormula>): Promise<SavedFormula | undefined> {
    const now = new Date();
    
    const [updatedFormula] = await db
      .update(savedFormulas)
      .set({
        ...formulaUpdates,
        updatedAt: now
      } as any)
      .where(eq(savedFormulas.id, id))
      .returning();
    return updatedFormula || undefined;
  }
  
  async deleteFormula(id: number): Promise<boolean> {
    const result = await db
      .delete(savedFormulas)
      .where(eq(savedFormulas.id, id))
      .returning({ id: savedFormulas.id });
    return result.length > 0;
  }
  
  // Troubleshooting methods
  async getAllTroubleshootingIssues(): Promise<TroubleshootingIssue[]> {
    return await db.select().from(troubleshootingIssues);
  }
  
  async getTroubleshootingIssuesByCategory(category: string): Promise<TroubleshootingIssue[]> {
    return await db.select().from(troubleshootingIssues).where(eq(troubleshootingIssues.category, category));
  }
  
  async getTroubleshootingIssueById(id: number): Promise<TroubleshootingIssue | undefined> {
    const [issue] = await db.select().from(troubleshootingIssues).where(eq(troubleshootingIssues.id, id));
    return issue || undefined;
  }
  
  async getPublishedTroubleshootingIssues(): Promise<TroubleshootingIssue[]> {
    return await db.select().from(troubleshootingIssues).where(eq(troubleshootingIssues.isPublished, true));
  }
  
  async createTroubleshootingIssue(insertIssue: InsertTroubleshootingIssue): Promise<TroubleshootingIssue> {
    const now = new Date();
    
    const [issue] = await db
      .insert(troubleshootingIssues)
      .values({
        ...insertIssue,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return issue;
  }
  
  async updateTroubleshootingIssue(id: number, issueUpdates: Partial<InsertTroubleshootingIssue>): Promise<TroubleshootingIssue | undefined> {
    const now = new Date();
    
    const [updatedIssue] = await db
      .update(troubleshootingIssues)
      .set({
        ...issueUpdates,
        updatedAt: now
      } as any)
      .where(eq(troubleshootingIssues.id, id))
      .returning();
    return updatedIssue || undefined;
  }
  
  async deleteTroubleshootingIssue(id: number): Promise<boolean> {
    const result = await db
      .delete(troubleshootingIssues)
      .where(eq(troubleshootingIssues.id, id))
      .returning({ id: troubleshootingIssues.id });
    return result.length > 0;
  }
  
  // Starter Reminder methods
  async getUserReminders(userId: number): Promise<StarterReminder[]> {
    return await db.select().from(starterReminders).where(eq(starterReminders.userId, userId));
  }
  
  async getStarterReminders(starterId: number): Promise<StarterReminder[]> {
    return await db.select().from(starterReminders).where(eq(starterReminders.starterId, starterId));
  }
  
  async getActiveReminders(): Promise<StarterReminder[]> {
    return await db.select().from(starterReminders).where(eq(starterReminders.isActive, true));
  }
  
  async getReminderById(id: number): Promise<StarterReminder | undefined> {
    const [reminder] = await db.select().from(starterReminders).where(eq(starterReminders.id, id));
    return reminder || undefined;
  }
  
  async createReminder(insertReminder: InsertStarterReminder): Promise<StarterReminder> {
    const now = new Date();
    
    const [reminder] = await db
      .insert(starterReminders)
      .values({
        ...insertReminder,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return reminder;
  }
  
  async updateReminder(id: number, reminderUpdates: Partial<InsertStarterReminder>): Promise<StarterReminder | undefined> {
    const now = new Date();
    
    const [updatedReminder] = await db
      .update(starterReminders)
      .set({
        ...reminderUpdates,
        updatedAt: now
      } as any)
      .where(eq(starterReminders.id, id))
      .returning();
    return updatedReminder || undefined;
  }
  
  async toggleReminderActive(id: number, isActive: boolean): Promise<StarterReminder | undefined> {
    const now = new Date();
    
    const [updatedReminder] = await db
      .update(starterReminders)
      .set({
        isActive,
        updatedAt: now
      } as any)
      .where(eq(starterReminders.id, id))
      .returning();
    return updatedReminder || undefined;
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    const result = await db
      .delete(starterReminders)
      .where(eq(starterReminders.id, id))
      .returning({ id: starterReminders.id });
    return result.length > 0;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userUpdates: Partial<InsertUser>): Promise<User | undefined> {
    const now = new Date().toISOString();
    
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userUpdates,
        updatedAt: now
      } as any)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference> {
    const now = new Date().toISOString();
    
    const [userPrefs] = await db
      .insert(userPreferences)
      .values({
        ...preferences,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return userPrefs;
  }

  async updateUserPreferences(userId: number, preferenceUpdates: Partial<InsertUserPreference>): Promise<UserPreference | undefined> {
    const now = new Date().toISOString();
    
    const [updatedPrefs] = await db
      .update(userPreferences)
      .set({
        ...preferenceUpdates,
        updatedAt: now
      } as any)
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updatedPrefs || undefined;
  }
  
  // Bread recipe methods
  async getAllRecipes(): Promise<BreadRecipe[]> {
    return await db.select().from(breadRecipes);
  }
  
  async getUserRecipes(userId: number): Promise<BreadRecipe[]> {
    return await db.select().from(breadRecipes).where(eq(breadRecipes.userId, userId));
  }
  
  async getPublicRecipes(): Promise<BreadRecipe[]> {
    return await db.select().from(breadRecipes).where(eq(breadRecipes.isPublic, true));
  }
  
  async getRecipeById(id: number): Promise<BreadRecipe | undefined> {
    const [recipe] = await db.select().from(breadRecipes).where(eq(breadRecipes.id, id));
    return recipe || undefined;
  }
  
  async createRecipe(insertRecipe: InsertBreadRecipe): Promise<BreadRecipe> {
    // Always use a new Date object directly for database timestamp fields
    const now = new Date();
    const nowString = now.toISOString();
    
    // Create a safe copy of data by removing any time-related fields
    // createdAt is varchar in the schema, so we use a string
    // updatedAt is timestamp, so we use a Date object
    const { 
      updatedAt, 
      createdAt, 
      ...safeRecipe 
    } = insertRecipe as any;
    
    // Using type assertion to fix the type incompatibility
    const [recipe] = await db
      .insert(breadRecipes)
      .values({
        ...safeRecipe,
        createdAt: nowString, // varchar field
        updatedAt: now // timestamp field
      } as any)
      .returning();
    return recipe;
  }
  
  async updateRecipe(id: number, recipeUpdates: Partial<InsertBreadRecipe>): Promise<BreadRecipe | undefined> {
    // Always use a new Date object directly for database timestamp fields
    const now = new Date();
    
    // Create a safe copy of data by removing all time-related fields
    // We'll handle them properly to avoid type conversion issues
    const { 
      updatedAt, 
      createdAt, 
      ...safeUpdates 
    } = recipeUpdates as any;
    
    // Explicitly set updatedAt as a Date object for the database
    const [updatedRecipe] = await db
      .update(breadRecipes)
      .set({
        ...safeUpdates,
        updatedAt: now
      })
      .where(eq(breadRecipes.id, id))
      .returning();
    return updatedRecipe || undefined;
  }
  
  async deleteRecipe(id: number): Promise<boolean> {
    try {
      // First, delete any related baking logs
      await db
        .delete(starterBakingLogs)
        .where(eq(starterBakingLogs.recipeId, id));
      
      // Then delete the recipe
      const result = await db
        .delete(breadRecipes)
        .where(eq(breadRecipes.id, id))
        .returning({ id: breadRecipes.id });
      
      return result.length > 0;
    } catch (error) {
      console.error("Error in deleteRecipe:", error);
      throw error;
    }
  }
  
  // Sourdough starter methods
  async getAllStarters(): Promise<SourdoughStarter[]> {
    return await db.select().from(sourdoughStarters);
  }

  async getAllSourdoughStarters(): Promise<SourdoughStarter[]> {
    return await db.select().from(sourdoughStarters);
  }
  
  async getStarterById(id: number): Promise<SourdoughStarter | undefined> {
    const [starter] = await db.select().from(sourdoughStarters).where(eq(sourdoughStarters.id, id));
    return starter || undefined;
  }
  
  async createStarter(insertStarter: InsertSourdoughStarter): Promise<SourdoughStarter> {
    const now = new Date();
    
    const [starter] = await db
      .insert(sourdoughStarters)
      .values({
        ...insertStarter,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return starter;
  }
  
  async updateStarter(id: number, starterUpdates: Partial<InsertSourdoughStarter>): Promise<SourdoughStarter | undefined> {
    const now = new Date();
    
    const [updatedStarter] = await db
      .update(sourdoughStarters)
      .set({
        ...starterUpdates,
        updatedAt: now
      } as any)
      .where(eq(sourdoughStarters.id, id))
      .returning();
    return updatedStarter || undefined;
  }
  
  async deleteStarter(id: number): Promise<boolean> {
    const result = await db
      .delete(sourdoughStarters)
      .where(eq(sourdoughStarters.id, id))
      .returning({ id: sourdoughStarters.id });
    return result.length > 0;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product || undefined;
  }
  
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const baseQuery = db.select().from(products).where(eq(products.featured, true));
    
    if (limit) {
      return await baseQuery.limit(limit);
    }
    
    return await baseQuery;
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        sql`${products.name} ILIKE ${'%' + query + '%'} OR ${products.description} ILIKE ${'%' + query + '%'}`
      );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const now = new Date();
    
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return product;
  }
  
  async updateProduct(id: number, productUpdates: Partial<InsertProduct>): Promise<Product | undefined> {
    const now = new Date();
    
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...productUpdates,
        updatedAt: now
      } as any)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return result.length > 0;
  }
  
  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const now = new Date();
    
    const [order] = await db
      .insert(orders)
      .values({
        ...insertOrder,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return order;
  }
  
  async updateOrder(id: number, orderUpdates: Partial<InsertOrder>): Promise<Order | undefined> {
    const now = new Date();
    
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...orderUpdates,
        updatedAt: now
      } as any)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const now = new Date();
    
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: now
      } as any)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  // FAQ methods
  async getAllFaqs(): Promise<FAQ[]> {
    return await db.select().from(faqs).orderBy(faqs.displayOrder);
  }
  
  async getFaqById(id: number): Promise<FAQ | undefined> {
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
    return faq || undefined;
  }
  
  async getFaqsByCategory(category: string): Promise<FAQ[]> {
    return await db.select().from(faqs).where(eq(faqs.category, category)).orderBy(faqs.displayOrder);
  }
  
  async getPublishedFaqs(): Promise<FAQ[]> {
    return await db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(faqs.displayOrder);
  }
  
  async createFaq(insertFaq: InsertFAQ): Promise<FAQ> {
    const now = new Date();
    
    const [faq] = await db
      .insert(faqs)
      .values({
        ...insertFaq,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return faq;
  }
  
  async updateFaq(id: number, faqUpdates: Partial<InsertFAQ>): Promise<FAQ | undefined> {
    const now = new Date();
    
    const [updatedFaq] = await db
      .update(faqs)
      .set({
        ...faqUpdates,
        updatedAt: now
      } as any)
      .where(eq(faqs.id, id))
      .returning();
    return updatedFaq || undefined;
  }
  
  async deleteFaq(id: number): Promise<boolean> {
    const result = await db
      .delete(faqs)
      .where(eq(faqs.id, id))
      .returning({ id: faqs.id });
    return result.length > 0;
  }
  
  // Blog posts methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }
  
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  }
  
  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }
  
  async getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.category, category))
      .orderBy(desc(blogPosts.publishedAt));
  }
  
  async getBlogPostsByAuthor(authorId: number): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.authorId, authorId))
      .orderBy(desc(blogPosts.publishedAt));
  }
  
  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const now = new Date();
    
    const [post] = await db
      .insert(blogPosts)
      .values({
        ...insertPost,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return post;
  }
  
  async updateBlogPost(id: number, postUpdates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const now = new Date();
    
    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        ...postUpdates,
        updatedAt: now
      } as any)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost || undefined;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    return result.length > 0;
  }
  
  // Starter feeding logs methods
  async getUserFeedingLogs(userId: number): Promise<StarterFeedingLog[]> {
    return await db
      .select()
      .from(starterFeedingLogs)
      .where(eq(starterFeedingLogs.userId, userId))
      .orderBy(desc(starterFeedingLogs.feedingDate));
  }
  
  async getStarterFeedingLogs(starterId: number): Promise<StarterFeedingLog[]> {
    return await db
      .select()
      .from(starterFeedingLogs)
      .where(eq(starterFeedingLogs.starterId, starterId))
      .orderBy(desc(starterFeedingLogs.feedingDate));
  }
  
  async getStarterFeedingLogsByDate(starterId: number, date: Date): Promise<StarterFeedingLog[]> {
    // Convert the date to an ISO string without the time part
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(starterFeedingLogs)
      .where(
        and(
          eq(starterFeedingLogs.starterId, starterId),
          sql`${starterFeedingLogs.feedingDate} >= ${startDate} AND ${starterFeedingLogs.feedingDate} <= ${endDate}`
        )
      )
      .orderBy(starterFeedingLogs.feedingDate);
  }
  
  async getStarterFeedingLogDates(starterId: number): Promise<Date[]> {
    const result = await db
      .select({ date: sql`DATE(${starterFeedingLogs.feedingDate})` })
      .from(starterFeedingLogs)
      .where(eq(starterFeedingLogs.starterId, starterId))
      .groupBy(sql`DATE(${starterFeedingLogs.feedingDate})`)
      .orderBy(desc(sql`DATE(${starterFeedingLogs.feedingDate})`));
      
    return result.map(r => new Date(String(r.date)));
  }
  
  async createFeedingLog(insertLog: InsertStarterFeedingLog): Promise<StarterFeedingLog> {
    const now = new Date();
    
    const [log] = await db
      .insert(starterFeedingLogs)
      .values({
        ...insertLog,
        createdAt: now
      } as any)
      .returning();
    return log;
  }
  
  async deleteFeedingLog(id: number): Promise<boolean> {
    const result = await db
      .delete(starterFeedingLogs)
      .where(eq(starterFeedingLogs.id, id))
      .returning({ id: starterFeedingLogs.id });
    return result.length > 0;
  }
  
  // Starter health logs methods
  async getUserHealthLogs(userId: number): Promise<StarterHealthLog[]> {
    return await db
      .select()
      .from(starterHealthLogs)
      .where(eq(starterHealthLogs.userId, userId))
      .orderBy(desc(starterHealthLogs.logDate));
  }
  
  async getStarterHealthLogs(starterId: number): Promise<StarterHealthLog[]> {
    return await db
      .select()
      .from(starterHealthLogs)
      .where(eq(starterHealthLogs.starterId, starterId))
      .orderBy(desc(starterHealthLogs.logDate));
  }
  
  async getHealthLogById(id: number): Promise<StarterHealthLog | undefined> {
    const [log] = await db.select().from(starterHealthLogs).where(eq(starterHealthLogs.id, id));
    return log || undefined;
  }
  
  async getLatestHealthLog(starterId: number): Promise<StarterHealthLog | undefined> {
    const [log] = await db
      .select()
      .from(starterHealthLogs)
      .where(eq(starterHealthLogs.starterId, starterId))
      .orderBy(desc(starterHealthLogs.logDate))
      .limit(1);
    return log || undefined;
  }
  
  async createHealthLog(insertLog: InsertStarterHealthLog): Promise<StarterHealthLog> {
    const now = new Date();
    
    const [log] = await db
      .insert(starterHealthLogs)
      .values({
        ...insertLog,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return log;
  }
  
  async updateHealthLog(id: number, logUpdates: Partial<InsertStarterHealthLog>): Promise<StarterHealthLog | undefined> {
    const now = new Date();
    
    const [updatedLog] = await db
      .update(starterHealthLogs)
      .set({
        ...logUpdates,
        updatedAt: now
      } as any)
      .where(eq(starterHealthLogs.id, id))
      .returning();
    return updatedLog || undefined;
  }
  
  async deleteHealthLog(id: number): Promise<boolean> {
    const result = await db
      .delete(starterHealthLogs)
      .where(eq(starterHealthLogs.id, id))
      .returning({ id: starterHealthLogs.id });
    return result.length > 0;
  }

  // Video methods implementation
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getFeaturedVideos(): Promise<Video[]> {
    return await db.select().from(videos)
      .where(and(eq(videos.isFeatured, true), eq(videos.isPublished, true)))
      .orderBy(videos.sortOrder);
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return await db.select().from(videos)
      .where(and(eq(videos.category, category), eq(videos.isPublished, true)))
      .orderBy(videos.sortOrder);
  }

  async getVideosByDifficulty(difficulty: string): Promise<Video[]> {
    return await db.select().from(videos)
      .where(and(eq(videos.difficulty, difficulty), eq(videos.isPublished, true)))
      .orderBy(videos.sortOrder);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const now = new Date();
    const [video] = await db
      .insert(videos)
      .values({
        ...insertVideo,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return video;
  }

  async updateVideo(id: number, videoUpdates: Partial<InsertVideo>): Promise<Video | undefined> {
    const now = new Date();
    const [updatedVideo] = await db
      .update(videos)
      .set({
        ...videoUpdates,
        updatedAt: now
      } as any)
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo || undefined;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const result = await db
      .delete(videos)
      .where(eq(videos.id, id))
      .returning({ id: videos.id });
    return result.length > 0;
  }

  // Research Source methods
  async getAllResearchSources(): Promise<ResearchSource[]> {
    return await db.select().from(researchSources).orderBy(desc(researchSources.createdAt));
  }

  async getResearchSourceById(id: number): Promise<ResearchSource | undefined> {
    const [source] = await db.select().from(researchSources).where(eq(researchSources.id, id));
    return source || undefined;
  }

  async getResearchSourcesByTopic(topicId: number): Promise<ResearchSource[]> {
    // This would require a join with content_citations table to find sources by topic
    return await db.select().from(researchSources).orderBy(desc(researchSources.createdAt));
  }

  async getResearchSourcesByQuality(quality: string): Promise<ResearchSource[]> {
    return await db.select().from(researchSources)
      .where(eq(researchSources.sourceQuality, quality))
      .orderBy(desc(researchSources.createdAt));
  }

  async createResearchSource(insertSource: InsertResearchSource): Promise<ResearchSource> {
    const now = new Date();
    const [source] = await db
      .insert(researchSources)
      .values({
        ...insertSource,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return source;
  }

  async updateResearchSource(id: number, sourceUpdates: Partial<InsertResearchSource>): Promise<ResearchSource | undefined> {
    const now = new Date();
    const [updatedSource] = await db
      .update(researchSources)
      .set({
        ...sourceUpdates,
        updatedAt: now
      } as any)
      .where(eq(researchSources.id, id))
      .returning();
    return updatedSource || undefined;
  }

  async deleteResearchSource(id: number): Promise<boolean> {
    const result = await db
      .delete(researchSources)
      .where(eq(researchSources.id, id))
      .returning({ id: researchSources.id });
    return result.length > 0;
  }

  // Research Topic methods
  async getAllResearchTopics(): Promise<ResearchTopic[]> {
    return await db.select().from(researchTopics).orderBy(researchTopics.name);
  }

  async getResearchTopicById(id: number): Promise<ResearchTopic | undefined> {
    const [topic] = await db.select().from(researchTopics).where(eq(researchTopics.id, id));
    return topic || undefined;
  }

  async getResearchTopicBySlug(slug: string): Promise<ResearchTopic | undefined> {
    const [topic] = await db.select().from(researchTopics).where(eq(researchTopics.slug, slug));
    return topic || undefined;
  }

  async getTopLevelResearchTopics(): Promise<ResearchTopic[]> {
    return await db.select().from(researchTopics)
      .where(sql`${researchTopics.parentTopicId} IS NULL`)
      .orderBy(researchTopics.name);
  }

  async getChildTopics(parentId: number): Promise<ResearchTopic[]> {
    return await db.select().from(researchTopics)
      .where(eq(researchTopics.parentTopicId, parentId))
      .orderBy(researchTopics.name);
  }

  async createResearchTopic(insertTopic: InsertResearchTopic): Promise<ResearchTopic> {
    const now = new Date();
    const [topic] = await db
      .insert(researchTopics)
      .values({
        ...insertTopic,
        createdAt: now,
        lastUpdated: now
      } as any)
      .returning();
    return topic;
  }

  async updateResearchTopic(id: number, topicUpdates: Partial<InsertResearchTopic>): Promise<ResearchTopic | undefined> {
    const now = new Date();
    const [updatedTopic] = await db
      .update(researchTopics)
      .set({
        ...topicUpdates,
        lastUpdated: now
      } as any)
      .where(eq(researchTopics.id, id))
      .returning();
    return updatedTopic || undefined;
  }

  async deleteResearchTopic(id: number): Promise<boolean> {
    const result = await db
      .delete(researchTopics)
      .where(eq(researchTopics.id, id))
      .returning({ id: researchTopics.id });
    return result.length > 0;
  }

  // Research Claim methods
  async getAllResearchClaims(): Promise<ResearchClaim[]> {
    return await db.select().from(researchClaims).orderBy(desc(researchClaims.createdAt));
  }

  async getResearchClaimById(id: number): Promise<ResearchClaim | undefined> {
    const [claim] = await db.select().from(researchClaims).where(eq(researchClaims.id, id));
    return claim || undefined;
  }

  async getResearchClaimsByTopic(topicId: number): Promise<ResearchClaim[]> {
    return await db.select().from(researchClaims)
      .where(eq(researchClaims.topicId, topicId))
      .orderBy(desc(researchClaims.createdAt));
  }

  async getResearchClaimsByConfidence(rating: string): Promise<ResearchClaim[]> {
    return await db.select().from(researchClaims)
      .where(eq(researchClaims.confidenceRating, rating))
      .orderBy(desc(researchClaims.createdAt));
  }

  async createResearchClaim(insertClaim: InsertResearchClaim): Promise<ResearchClaim> {
    const now = new Date();
    const [claim] = await db
      .insert(researchClaims)
      .values({
        ...insertClaim,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return claim;
  }

  async updateResearchClaim(id: number, claimUpdates: Partial<InsertResearchClaim>): Promise<ResearchClaim | undefined> {
    const now = new Date();
    const [updatedClaim] = await db
      .update(researchClaims)
      .set({
        ...claimUpdates,
        updatedAt: now
      } as any)
      .where(eq(researchClaims.id, id))
      .returning();
    return updatedClaim || undefined;
  }

  async deleteResearchClaim(id: number): Promise<boolean> {
    const result = await db
      .delete(researchClaims)
      .where(eq(researchClaims.id, id))
      .returning({ id: researchClaims.id });
    return result.length > 0;
  }

  // Research Collection methods
  async getAllResearchCollections(): Promise<ResearchCollection[]> {
    return await db.select().from(researchCollections).orderBy(desc(researchCollections.createdAt));
  }

  async getResearchCollectionById(id: number): Promise<ResearchCollection | undefined> {
    const [collection] = await db.select().from(researchCollections).where(eq(researchCollections.id, id));
    return collection || undefined;
  }

  async getActiveResearchCollections(): Promise<ResearchCollection[]> {
    return await db.select().from(researchCollections)
      .where(eq(researchCollections.isActive, true))
      .orderBy(desc(researchCollections.createdAt));
  }

  async createResearchCollection(insertCollection: InsertResearchCollection): Promise<ResearchCollection> {
    const now = new Date();
    const [collection] = await db
      .insert(researchCollections)
      .values({
        ...insertCollection,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return collection;
  }

  async updateResearchCollection(id: number, collectionUpdates: Partial<InsertResearchCollection>): Promise<ResearchCollection | undefined> {
    const now = new Date();
    const [updatedCollection] = await db
      .update(researchCollections)
      .set({
        ...collectionUpdates,
        updatedAt: now
      })
      .where(eq(researchCollections.id, id))
      .returning();
    return updatedCollection || undefined;
  }

  async deleteResearchCollection(id: number): Promise<boolean> {
    const result = await db
      .delete(researchCollections)
      .where(eq(researchCollections.id, id))
      .returning({ id: researchCollections.id });
    return result.length > 0;
  }

  // Research Article methods
  async getAllResearchArticles(): Promise<ResearchArticle[]> {
    return await db.select().from(researchArticles).orderBy(desc(researchArticles.createdAt));
  }

  async getResearchArticleById(id: number): Promise<ResearchArticle | undefined> {
    const [article] = await db.select().from(researchArticles).where(eq(researchArticles.id, id));
    return article || undefined;
  }

  async getResearchArticleBySlug(slug: string): Promise<ResearchArticle | undefined> {
    const [article] = await db.select().from(researchArticles).where(eq(researchArticles.slug, slug));
    return article || undefined;
  }

  async getPublishedResearchArticles(): Promise<ResearchArticle[]> {
    return await db.select().from(researchArticles)
      .where(eq(researchArticles.isPublished, true))
      .orderBy(desc(researchArticles.publishedAt));
  }

  async getResearchArticlesByTopic(topicId: number): Promise<ResearchArticle[]> {
    return await db.select().from(researchArticles)
      .where(eq(researchArticles.topicId, topicId))
      .orderBy(desc(researchArticles.createdAt));
  }

  async createResearchArticle(insertArticle: InsertResearchArticle): Promise<ResearchArticle> {
    const now = new Date();
    const [article] = await db
      .insert(researchArticles)
      .values({
        ...insertArticle,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return article;
  }

  async updateResearchArticle(id: number, articleUpdates: Partial<InsertResearchArticle>): Promise<ResearchArticle | undefined> {
    const now = new Date();
    const [updatedArticle] = await db
      .update(researchArticles)
      .set({
        ...articleUpdates,
        updatedAt: now
      } as any)
      .where(eq(researchArticles.id, id))
      .returning();
    return updatedArticle || undefined;
  }

  async deleteResearchArticle(id: number): Promise<boolean> {
    const result = await db
      .delete(researchArticles)
      .where(eq(researchArticles.id, id))
      .returning({ id: researchArticles.id });
    return result.length > 0;
  }

  // Content Citation methods
  async getAllContentCitations(): Promise<ContentCitation[]> {
    return await db.select().from(contentCitations).orderBy(desc(contentCitations.createdAt));
  }

  async getContentCitationById(id: number): Promise<ContentCitation | undefined> {
    const [citation] = await db.select().from(contentCitations).where(eq(contentCitations.id, id));
    return citation || undefined;
  }

  async getCitationsByContent(contentType: string, contentId: number): Promise<ContentCitation[]> {
    return await db.select().from(contentCitations)
      .where(and(
        eq(contentCitations.contentType, contentType),
        eq(contentCitations.contentId, contentId)
      ))
      .orderBy(desc(contentCitations.createdAt));
  }

  async getCitationsBySource(sourceId: number): Promise<ContentCitation[]> {
    return await db.select().from(contentCitations)
      .where(eq(contentCitations.researchSourceId, sourceId))
      .orderBy(desc(contentCitations.createdAt));
  }

  async createContentCitation(insertCitation: InsertContentCitation): Promise<ContentCitation> {
    const now = new Date();
    const [citation] = await db
      .insert(contentCitations)
      .values({
        ...insertCitation,
        createdAt: now
      } as any)
      .returning();
    return citation;
  }

  async updateContentCitation(id: number, citationUpdates: Partial<InsertContentCitation>): Promise<ContentCitation | undefined> {
    const [updatedCitation] = await db
      .update(contentCitations)
      .set(citationUpdates as any)
      .where(eq(contentCitations.id, id))
      .returning();
    return updatedCitation || undefined;
  }

  async deleteContentCitation(id: number): Promise<boolean> {
    const result = await db
      .delete(contentCitations)
      .where(eq(contentCitations.id, id))
      .returning({ id: contentCitations.id });
    return result.length > 0;
  }

  // Content Quality methods
  async getAllContentQuality(): Promise<ContentQuality[]> {
    return await db.select().from(contentQuality).orderBy(desc(contentQuality.createdAt));
  }

  async getContentQualityById(id: number): Promise<ContentQuality | undefined> {
    const [quality] = await db.select().from(contentQuality).where(eq(contentQuality.id, id));
    return quality || undefined;
  }

  async getContentQualityByContent(contentType: string, contentId: number): Promise<ContentQuality | undefined> {
    const [quality] = await db.select().from(contentQuality)
      .where(and(
        eq(contentQuality.contentType, contentType),
        eq(contentQuality.contentId, contentId)
      ));
    return quality || undefined;
  }

  async createContentQuality(insertQuality: InsertContentQuality): Promise<ContentQuality> {
    const now = new Date();
    const [quality] = await db
      .insert(contentQuality)
      .values({
        ...insertQuality,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return quality;
  }

  async updateContentQuality(id: number, qualityUpdates: Partial<InsertContentQuality>): Promise<ContentQuality | undefined> {
    const now = new Date();
    const [updatedQuality] = await db
      .update(contentQuality)
      .set({
        ...qualityUpdates,
        updatedAt: now
      } as any)
      .where(eq(contentQuality.id, id))
      .returning();
    return updatedQuality || undefined;
  }

  async deleteContentQuality(id: number): Promise<boolean> {
    const result = await db
      .delete(contentQuality)
      .where(eq(contentQuality.id, id))
      .returning({ id: contentQuality.id });
    return result.length > 0;
  }

  // Article Processing Job methods
  async getAllProcessingJobs(): Promise<ArticleProcessingJob[]> {
    return await db.select().from(articleProcessingJobs).orderBy(desc(articleProcessingJobs.createdAt));
  }

  async getProcessingJobById(id: string): Promise<ArticleProcessingJob | undefined> {
    const [job] = await db.select().from(articleProcessingJobs).where(eq(articleProcessingJobs.id, id));
    return job || undefined;
  }

  async createProcessingJob(insertJob: Partial<ArticleProcessingJob>): Promise<ArticleProcessingJob> {
    const now = new Date();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [job] = await db
      .insert(articleProcessingJobs)
      .values({
        id: jobId,
        source: insertJob.source || '',
        sourceType: 'file',
        status: insertJob.status || 'pending',
        progress: insertJob.progress || 0,
        title: insertJob.title,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return job;
  }

  async updateProcessingJob(id: string, jobUpdates: Partial<ArticleProcessingJob>): Promise<ArticleProcessingJob | undefined> {
    const now = new Date();
    const [updatedJob] = await db
      .update(articleProcessingJobs)
      .set({
        ...jobUpdates,
        updatedAt: now
      } as any)
      .where(eq(articleProcessingJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }

  // Article Chat methods
  async createArticleConversation(insertConversation: InsertArticleConversation): Promise<ArticleConversation> {
    const now = new Date();
    const [conversation] = await db
      .insert(articleConversations)
      .values({
        ...insertConversation,
        createdAt: now,
        updatedAt: now
      } as any)
      .returning();
    return conversation;
  }

  async getArticleConversation(id: number): Promise<ArticleConversation | undefined> {
    const [conversation] = await db.select().from(articleConversations).where(eq(articleConversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByArticle(articleId: number, sessionId?: string, userId?: number): Promise<ArticleConversation[]> {
    const conditions = [eq(articleConversations.articleId, articleId)];
    
    if (userId) {
      conditions.push(eq(articleConversations.userId, userId));
    } else if (sessionId) {
      conditions.push(eq(articleConversations.sessionId, sessionId));
    }
    
    return await db.select().from(articleConversations)
      .where(and(...conditions))
      .orderBy(desc(articleConversations.createdAt));
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...insertMessage,
        timestamp: new Date()
      } as any)
      .returning();
    return message;
  }

  async getConversationMessages(conversationId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.timestamp));
  }

  async deleteConversation(id: number): Promise<boolean> {
    const result = await db
      .delete(articleConversations)
      .where(eq(articleConversations.id, id))
      .returning({ id: articleConversations.id });
    return result.length > 0;
  }
}

// Export an instance of DatabaseStorage
export const storage = new DatabaseStorage();