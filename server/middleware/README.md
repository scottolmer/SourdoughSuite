# Middleware Usage Guide

Quick reference for using security middleware in SourdoughSuite.

## Authentication Middleware

### Import
```typescript
import { requireAuth, requireAdmin, requirePremium, optionalAuth } from "./middleware/auth";
```

### Usage

**Require Authentication**
```typescript
app.get("/api/user/profile", requireAuth, async (req, res) => {
  const user = req.user; // Guaranteed to be set
  res.json({ user });
});
```

**Require Admin**
```typescript
app.post("/api/admin/settings", requireAdmin, async (req, res) => {
  // Only master tier users can access
});
```

**Require Premium**
```typescript
app.post("/api/premium/feature", requirePremium, async (req, res) => {
  // Premium or master tier users only
});
```

**Optional Auth**
```typescript
app.get("/api/recipes", optionalAuth, async (req, res) => {
  // req.user will be set if authenticated, undefined otherwise
  const isAuth = !!req.user;
});
```

---

## Rate Limiting Middleware

### Import
```typescript
import {
  apiLimiter,
  aiGenerationLimiter,
  fileUploadLimiter,
  authLimiter,
  searchLimiter,
  recipeLimiter,
} from "./middleware/rate-limit";
```

### Usage

**AI Generation**
```typescript
app.post("/api/ai/generate-recipe", aiGenerationLimiter, async (req, res) => {
  // 20 requests per hour, premium users bypassed
});
```

**File Upload**
```typescript
app.post("/api/upload", fileUploadLimiter, async (req, res) => {
  // 10 uploads per hour
});
```

**Authentication**
```typescript
app.post("/api/auth/login", authLimiter, async (req, res) => {
  // 5 attempts per 15 minutes
});
```

---

## Input Validation Middleware

### Import
```typescript
import { validateBody, validateQuery, validateParams } from "./middleware/validation";
import {
  recipeGenerationSchema,
  userRegistrationSchema,
  // ... other schemas
} from "./middleware/validation";
```

### Usage

**Validate Request Body**
```typescript
app.post("/api/register", validateBody(userRegistrationSchema), async (req, res) => {
  // req.body is validated and typed
  const { username, email, password } = req.body;
});
```

**Validate Query Parameters**
```typescript
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

app.get("/api/search", validateQuery(searchSchema), async (req, res) => {
  const { q, limit } = req.query;
});
```

**Validate Route Parameters**
```typescript
import { idParamSchema } from "./middleware/validation";

app.get("/api/users/:id", validateParams(idParamSchema), async (req, res) => {
  const userId = req.params.id; // Validated and typed as number
});
```

**Custom Schema**
```typescript
import { z } from "zod";

const customSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().positive().max(120),
  email: z.string().email(),
});

app.post("/api/custom", validateBody(customSchema), handler);
```

---

## CSRF Protection Middleware

### Import
```typescript
import { csrfProtection, generateCSRFToken, validateCSRFToken } from "./middleware/csrf";
```

### Usage

**Protect Routes** (automatic with csrfProtection)
```typescript
app.post("/api/sensitive", csrfProtection, async (req, res) => {
  // Origin is validated automatically
});
```

**Token-Based CSRF** (for same-site requests)
```typescript
app.post("/api/form-submit", validateCSRFToken, async (req, res) => {
  // Validates X-CSRF-Token header or body.csrfToken
});
```

---

## Common Patterns

### Secure Admin Endpoint
```typescript
import { requireAdmin } from "./middleware/auth";
import { fileUploadLimiter } from "./middleware/rate-limit";
import { validateBody } from "./middleware/validation";

app.post(
  "/api/admin/upload",
  requireAdmin,           // 1. Check authentication + admin role
  fileUploadLimiter,      // 2. Rate limit uploads
  validateBody(schema),   // 3. Validate input
  async (req, res) => {
    // Handler code
  }
);
```

### Secure AI Endpoint
```typescript
import { requireAuth } from "./middleware/auth";
import { aiGenerationLimiter } from "./middleware/rate-limit";
import { recipeGenerationSchema, validateBody } from "./middleware/validation";

app.post(
  "/api/ai/generate",
  requireAuth,                           // 1. Require authentication
  aiGenerationLimiter,                   // 2. Rate limit AI requests
  validateBody(recipeGenerationSchema),  // 3. Validate input
  async (req, res) => {
    const user = req.user;
    const { prompt, hydration } = req.body;
    // Generate recipe
  }
);
```

### Public Search Endpoint
```typescript
import { searchLimiter } from "./middleware/rate-limit";
import { validateQuery } from "./middleware/validation";
import { z } from "zod";

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  category: z.enum(["recipes", "articles", "starters"]).optional(),
});

app.get(
  "/api/search",
  searchLimiter,                    // 1. Rate limit searches
  validateQuery(searchQuerySchema), // 2. Validate query
  async (req, res) => {
    const { q, category } = req.query;
    // Perform search
  }
);
```

---

## Middleware Order

**Recommended order for route middleware:**

1. **Rate limiting** - Stop abuse early
2. **Authentication** - Identify user
3. **Authorization** - Check permissions
4. **Validation** - Validate input
5. **CSRF protection** - Verify origin (if needed)
6. **Handler** - Your route logic

**Example:**
```typescript
app.post(
  "/api/premium/feature",
  aiGenerationLimiter,              // 1. Rate limit
  requirePremium,                   // 2. Auth + authorization
  validateBody(schema),             // 3. Validate
  csrfProtection,                   // 4. CSRF (optional)
  async (req, res) => {             // 5. Handler
    // Implementation
  }
);
```

---

## Testing Middleware

### Test Authentication
```bash
# Without auth - should fail
curl -X GET http://localhost:5000/api/auth/me

# With auth - should succeed
curl -X GET http://localhost:5000/api/auth/me \
  --cookie "connect.sid=your-session-id"
```

### Test Rate Limiting
```bash
# Make 101 requests quickly - last one should fail
for i in {1..101}; do
  curl http://localhost:5000/api/recipes
done
```

### Test Validation
```bash
# Invalid input - should fail
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "a", "password": "weak"}'

# Valid input - should succeed
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "validuser", "email": "user@example.com", "password": "SecurePass123"}'
```

---

## Error Responses

### Authentication Error (401)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### Authorization Error (403)
```json
{
  "error": "Forbidden",
  "message": "Admin privileges required"
}
```

### Rate Limit Error (429)
```json
{
  "error": "Too many requests",
  "message": "Too many requests from this IP, please try again later."
}
```

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "message": "Validation error: username is required",
  "details": [
    {
      "path": ["username"],
      "message": "Required"
    }
  ]
}
```

### CSRF Error (403)
```json
{
  "error": "Forbidden",
  "message": "Invalid or missing CSRF token"
}
```

---

## Tips

1. **Always validate input** - Even on admin endpoints
2. **Layer security** - Use multiple middleware together
3. **Rate limit expensive operations** - AI, uploads, searches
4. **Check user tier** - Use requirePremium for paid features
5. **Log security events** - Track failed auth, rate limits
6. **Test thoroughly** - Verify all security middleware works

---

For more details, see [SECURITY.md](../../SECURITY.md)
