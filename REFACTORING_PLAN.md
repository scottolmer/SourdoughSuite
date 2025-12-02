# Routes Refactoring Plan

## Current State
- **File**: `server/routes.ts`
- **Size**: 7,159 lines
- **Routes**: 199 endpoints
- **Status**: Monolithic, difficult to maintain

---

## 🎯 Refactoring Strategy

### Phase 1: Create Module Structure (Quick Win - Do First)
Create the directory structure and extract the easiest, most isolated modules:

```
server/routes/
├── starters.ts       (~600 lines - starters, feeding logs, health logs)
├── videos.ts         (~100 lines - YouTube integration)
├── faqs.ts           (~100 lines - FAQ management)
├── blog.ts           (~300 lines - blog posts)
└── index.ts          (Module registration)
```

**Why start here:**
- These modules are well-defined and isolated
- Minimal dependencies on other routes
- Clear domain boundaries
- Quick wins build momentum

### Phase 2: Extract Complex Domains (Medium Effort)
```
server/routes/
├── recipes.ts        (~800 lines - recipe CRUD, validation, scraping)
├── products.ts       (~200 lines - e-commerce catalog)
├── orders.ts         (~300 lines - order management, payments)
├── users.ts          (~200 lines - user profiles, preferences)
└── content.ts        (~400 lines - content articles)
```

### Phase 3: Extract AI & Calculator Routes (High Complexity)
```
server/routes/
├── ai-services.ts    (~1000 lines - AI generation, analysis, chat)
├── calculators.ts    (~500 lines - all calculator endpoints)
└── recommendations.ts (~300 lines - AI recommendations)
```

### Phase 4: Remaining & Miscellaneous
```
server/routes/
├── timelines.ts      (~300 lines - baking timelines)
├── research.ts       (~500 lines - research articles, topics)
├── settings.ts       (~200 lines - AI settings, quiz settings)
└── legacy.ts         (Any remaining endpoints)
```

---

## 📋 Route Categorization (All 199 Endpoints)

### Starters Domain (~35 endpoints)
```
GET    /api/starters
GET    /api/starters/:id
POST   /api/starters
PUT    /api/starters/:id
DELETE /api/starters/:id
GET    /api/starters/:id/feeding-logs
GET    /api/starters/:id/feeding-log-dates
GET    /api/starters/:id/health-logs
GET    /api/starters/:id/health-logs/latest
GET    /api/starters/:id/baking-logs
GET    /api/starters/:starterId/recipes/:recipeId/baking-logs
GET    /api/starters/:id/recipes

POST   /api/feeding-logs
DELETE /api/feeding-logs/:id

POST   /api/health-logs
GET    /api/health-logs/:id
PATCH  /api/health-logs/:id
DELETE /api/health-logs/:id

GET    /api/baking-logs
GET    /api/baking-logs/:id
POST   /api/baking-logs/:id
PATCH  /api/baking-logs/:id
DELETE /api/baking-logs/:id
```

### Recipes Domain (~25 endpoints)
```
GET    /api/recipes
GET    /api/recipes/public
GET    /api/recipes/:id
GET    /api/recipes/:recipeId/timelines
GET    /api/user/:userId/recipes
POST   /api/recipes
PATCH  /api/recipes/:id
DELETE /api/recipes/:id
POST   /api/recipes/import
POST   /api/recipes/scrape
POST   /api/recipes/validate

POST   /api/recipe-validator/scrape
POST   /api/predict-recipe-success
GET    /api/recipe-validator/user/:userId
GET    /api/recipe-validator/:id
DELETE /api/recipe-validator/:id
```

### AI Services Domain (~20 endpoints)
```
POST   /api/ai/recommend-starter
POST   /api/ai/generate-timeline
POST   /api/ai/analyze-recipe
POST   /api/ai/generate-recipe
POST   /api/ai/troubleshoot-starter
POST   /api/ai/chat
POST   /api/ai/analyze-with-o3
POST   /api/generate-recipe (legacy)
POST   /api/recommendations

GET    /api/ai/settings
POST   /api/ai/settings
GET    /api/quiz-settings
POST   /api/quiz-settings
```

### Blog & Content Domain (~30 endpoints)
```
GET    /api/blog/articles
GET    /api/blog/posts
GET    /api/blog/posts/published
GET    /api/blog/posts/slug/:slug
GET    /api/blog/posts/:id
GET    /api/blog/categories/:category
GET    /api/blog/author/:authorId
POST   /api/blog/posts
PATCH  /api/blog/posts/:id
DELETE /api/blog/posts/:id

GET    /api/content-articles
GET    /api/content-articles/published
GET    /api/content-articles/category/:category
GET    /api/content-articles/entity-type/:entityType
GET    /api/content-articles/entity/:entityType/:entityId
GET    /api/content-articles/:id
GET    /api/content-articles/by-slug/:slug
GET    /api/content-articles/slug/:slug
POST   /api/content-articles
PATCH  /api/content-articles/:id
DELETE /api/content-articles/:id
```

### Products & Orders Domain (~20 endpoints)
```
GET    /api/store/products
GET    /api/products
GET    /api/products/category/:category
GET    /api/products/featured
GET    /api/products/search
GET    /api/products/:id
GET    /api/products/slug/:slug
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
GET    /api/products/recommendations

GET    /api/orders
GET    /api/user/:userId/orders
GET    /api/orders/:id
POST   /api/orders
PATCH  /api/orders/:id

POST   /api/create-payment-intent
```

### Videos & FAQs Domain (~15 endpoints)
```
GET    /api/videos
GET    /api/videos/featured
GET    /api/videos/:id
GET    /api/videos/category/:category

GET    /api/faqs
GET    /api/faqs/published
GET    /api/faqs/category/:category
GET    /api/faqs/:id
POST   /api/faqs
PATCH  /api/faqs/:id
DELETE /api/faqs/:id
```

### User & Preferences Domain (~10 endpoints)
```
GET    /api/user/preferences/:userId
POST   /api/user/preferences
PATCH  /api/user/preferences/:userId
```

### Timelines Domain (~10 endpoints)
```
GET    /api/timelines
GET    /api/timelines/:id
POST   /api/timelines
PATCH  /api/timelines/:id
POST   /api/timelines/:id/complete
DELETE /api/timelines/:id
```

### Research Domain (~15 endpoints)
```
GET    /api/research/topics
GET    /api/research/articles
GET    /api/research/articles/:id
...
```

---

## 🚀 Quick Start Implementation

### Step 1: Extract Starters Module (Easiest First)

**Create `server/routes/starters.ts`:**
```typescript
import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateBody, starterFeedingSchema } from "../middleware/validation";
import logger from "../config/logger";

export function registerStarterRoutes(app: Express) {
  // GET /api/starters
  app.get("/api/starters", async (req, res) => {
    try {
      const starters = await storage.getAllStarters();
      return successResponse(res, starters);
    } catch (error) {
      logger.error("Error fetching starters", { error });
      return errorResponse(res, "Failed to fetch starters", 500);
    }
  });

  // ... rest of starter routes
}
```

**Update `server/index.ts`:**
```typescript
import { registerStarterRoutes } from "./routes/starters";

// In the async function:
registerStarterRoutes(app);
registerRoutes(app); // Keep existing routes for now
```

**Benefits:**
- ✅ Incremental migration (both old and new work simultaneously)
- ✅ Easy to test each module
- ✅ Can add validation/security as we extract
- ✅ No breaking changes

---

## 📊 Estimated Effort

| Phase | Lines | Routes | Effort | Priority |
|-------|-------|--------|--------|----------|
| **Phase 1** | ~1,100 | 50 | 2-3 hours | **HIGH** |
| **Phase 2** | ~1,900 | 60 | 4-5 hours | **MEDIUM** |
| **Phase 3** | ~1,800 | 45 | 5-6 hours | **MEDIUM** |
| **Phase 4** | ~2,000 | 44 | 4-5 hours | **LOW** |
| **Cleanup** | - | - | 2 hours | **FINAL** |
| **TOTAL** | 7,159 | 199 | **17-21 hours** | - |

---

## ✅ Benefits of Refactoring

### Developer Experience
- **Before**: Find route in 7,159 line file
- **After**: Know which file to look in immediately

### Code Organization
- **Before**: Everything mixed together
- **After**: Clear domain separation

### Testing
- **Before**: Can't test routes in isolation
- **After**: Each module can be tested independently

### Team Collaboration
- **Before**: Constant merge conflicts
- **After**: Different devs work on different modules

### Adding Features
- **Before**: Scroll through massive file
- **After**: Add to appropriate module

---

## 🎓 Best Practices During Refactoring

1. **Extract, Don't Rewrite**
   - Copy-paste routes to new module
   - Update imports
   - Add security middleware while extracting
   - Test that it works
   - Remove from old file

2. **Add Security As You Go**
   ```typescript
   // Old (no security)
   app.post("/api/starters", handler);

   // New (with security)
   app.post("/api/starters",
     requireAuth,
     validateBody(starterSchema),
     handler
   );
   ```

3. **Use Standard Responses**
   ```typescript
   // Old (inconsistent)
   res.json({ starter });

   // New (standardized)
   return successResponse(res, starter);
   ```

4. **Add Logging**
   ```typescript
   // Old
   console.log("Creating starter");

   // New
   logger.info("Creating starter", { userId, starterId });
   ```

5. **Test Incrementally**
   - Extract one module
   - Test all its endpoints
   - Move to next module
   - Don't extract everything at once

---

## 🔧 Migration Checklist Per Module

- [ ] Create new route file in `server/routes/`
- [ ] Copy route handlers from `routes.ts`
- [ ] Update imports (storage, schemas, services)
- [ ] Add authentication middleware where needed
- [ ] Add validation middleware
- [ ] Use standardized responses
- [ ] Replace console.log with logger
- [ ] Export registration function
- [ ] Register in `server/index.ts` or `server/routes/index.ts`
- [ ] Test all endpoints in module
- [ ] Remove routes from old `routes.ts`
- [ ] Update documentation

---

## 📝 Recommended Order

### Week 1: Foundation
1. ✅ Create `server/routes/` directory
2. ✅ Extract `starters.ts` (cleanest module)
3. ✅ Extract `videos.ts` (small, isolated)
4. ✅ Extract `faqs.ts` (simple CRUD)
5. ✅ Test extracted modules

### Week 2: Core Business Logic
1. Extract `recipes.ts` (important but complex)
2. Extract `blog.ts` (content management)
3. Extract `products.ts` and `orders.ts` (e-commerce)
4. Test all modules

### Week 3: Complex AI Features
1. Extract `ai-services.ts` (largest AI routes)
2. Extract `calculators.ts` (calculator endpoints)
3. Extract `users.ts` (user management)
4. Test modules

### Week 4: Cleanup & Polish
1. Extract remaining routes
2. Remove old `routes.ts` file
3. Create `server/routes/index.ts` for clean registration
4. Full integration testing
5. Update documentation

---

## 🎯 Success Metrics

- ✅ All 199 routes still working
- ✅ No breaking changes to API
- ✅ Improved code organization (10+ modules vs 1 file)
- ✅ Security added to critical endpoints
- ✅ Standardized responses across all routes
- ✅ Professional logging throughout
- ✅ Each module < 1000 lines
- ✅ Clear separation of concerns

---

## 💡 Quick Win: Start Today

**Extract just the starters module** (2 hours max):

1. Create `server/routes/starters.ts`
2. Copy ~600 lines of starter-related routes
3. Add `requireAuth` where needed
4. Use `successResponse` / `errorResponse`
5. Register in `server/index.ts`
6. Test the endpoints
7. Keep old routes as backup

**Result**: Immediate improvement, no risk, builds confidence!

---

**Status**: Ready to implement
**Complexity**: Medium (but manageable with incremental approach)
**Value**: Very High (maintainability, scalability, team collaboration)