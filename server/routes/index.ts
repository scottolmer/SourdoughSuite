import { Express } from "express";
import { registerStarterRoutes } from "./starters";
import { registerVideoRoutes } from "./videos";
import { registerFaqRoutes } from "./faqs";
import { registerBlogRoutes } from "./blog";
import { registerRecipeRoutes } from "./recipes";
import { registerProductRoutes } from "./products";
import { registerOrderRoutes } from "./orders";
import { registerUserRoutes } from "./users";
import { registerContentRoutes } from "./content";
import { registerTimelineRoutes } from "./timelines";
import { registerAIRoutes } from "./ai";
import { registerCalculatorRoutes } from "./calculators";
import { registerJournalRoutes } from "./journals";
import { registerResearchRoutes } from "./research";
import logger from "../config/logger";

/**
 * Register all modular routes
 * This function imports and registers all route modules
 */
export function registerModularRoutes(app: Express) {
  logger.info("Registering modular routes...");

  // Phase 1: Core content routes
  registerStarterRoutes(app);
  registerVideoRoutes(app);
  registerFaqRoutes(app);
  registerBlogRoutes(app);

  // Phase 2: Business logic routes
  registerRecipeRoutes(app);
  registerProductRoutes(app);
  registerOrderRoutes(app);
  registerUserRoutes(app);
  registerContentRoutes(app);

  // Phase 3: Timeline routes
  registerTimelineRoutes(app);

  // Phase 4: AI Services routes
  registerAIRoutes(app);

  // Phase 5: Calculators, Journals, and Research routes
  registerCalculatorRoutes(app);
  registerJournalRoutes(app);
  registerResearchRoutes(app);

  logger.info("Modular routes registered successfully");
}
