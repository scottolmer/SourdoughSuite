# Security Implementation Guide

## Overview

This document outlines the security measures implemented in SourdoughSuite to protect against common vulnerabilities and ensure safe operation.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Input Validation](#input-validation)
3. [Rate Limiting](#rate-limiting)
4. [CSRF Protection](#csrf-protection)
5. [Environment Configuration](#environment-configuration)
6. [Session Management](#session-management)
7. [Security Best Practices](#security-best-practices)
8. [API Endpoints Security](#api-endpoints-security)

---

## Authentication & Authorization

### Overview
SourdoughSuite uses **Passport.js** with a local strategy for user authentication and role-based access control.

### User Roles
- **free** - Default tier, basic access
- **premium** - Paid subscription, enhanced features
- **master** - Admin access, full system control

### Middleware

#### `requireAuth`
Protects routes requiring any authenticated user.

```typescript
import { requireAuth } from "./middleware/auth";

app.get("/api/user/profile", requireAuth, async (req, res) => {
  // Only authenticated users can access
});
```

#### `requireAdmin`
Protects routes requiring admin privileges (master tier).

```typescript
import { requireAdmin } from "./middleware/auth";

app.post("/api/admin/upload-pdf", requireAdmin, async (req, res) => {
  // Only admin users can access
});
```

#### `requirePremium`
Protects routes requiring premium or master subscription.

```typescript
import { requirePremium } from "./middleware/auth";

app.post("/api/ai/advanced-generation", requirePremium, async (req, res) => {
  // Only premium/master users can access
});
```

### Password Security
- Passwords are hashed using **bcrypt** with 10 salt rounds
- Minimum password requirements:
  - 8 characters minimum
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate and create session |
| `/api/auth/logout` | POST | Destroy session |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/profile` | PUT | Update user profile |
| `/api/auth/csrf-token` | GET | Get CSRF token |

---

## Input Validation

### Overview
All user input is validated using **Zod schemas** to prevent injection attacks and data corruption.

### Validation Middleware

```typescript
import { validateBody, validateQuery, validateParams } from "./middleware/validation";

app.post("/api/recipes", validateBody(recipeSchema), async (req, res) => {
  // req.body is guaranteed to match schema
});
```

### Available Schemas

#### User Schemas
- `userRegistrationSchema` - New user registration
- `userLoginSchema` - User login
- `userUpdateSchema` - Profile updates

#### Recipe Schemas
- `recipeGenerationSchema` - AI recipe generation
- `recipeValidationSchema` - Recipe URL validation
- `timelineGenerationSchema` - Baking timeline

#### Starter Schemas
- `starterFeedingSchema` - Feeding log validation

#### Content Schemas
- `blogPostSchema` - Blog post creation/editing
- `orderSchema` - E-commerce orders

#### Troubleshooting
- `troubleshootingSchema` - Baking issue diagnosis

### Custom Validation

```typescript
import { z } from "zod";
import { validateBody } from "./middleware/validation";

const customSchema = z.object({
  field: z.string().min(1).max(100),
  number: z.number().positive(),
});

app.post("/api/custom", validateBody(customSchema), handler);
```

---

## Rate Limiting

### Overview
Rate limiting prevents API abuse and controls costs for expensive AI operations.

### Available Limiters

#### `apiLimiter` (General API)
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applied to**: All `/api/*` routes

#### `aiGenerationLimiter` (AI Operations)
- **Window**: 1 hour
- **Max Requests**: 20 per IP
- **Exemption**: Premium/Master users bypass limit
- **Applied to**: AI generation endpoints

#### `fileUploadLimiter` (File Uploads)
- **Window**: 1 hour
- **Max Requests**: 10 per IP
- **Applied to**: PDF upload endpoints

#### `authLimiter` (Authentication)
- **Window**: 15 minutes
- **Max Attempts**: 5 per IP
- **Applied to**: Login/register endpoints
- **Feature**: Doesn't count successful requests

#### `searchLimiter` (Search/Query)
- **Window**: 1 minute
- **Max Requests**: 30 per IP
- **Applied to**: Search endpoints

#### `recipeLimiter` (Recipe Operations)
- **Window**: 1 hour
- **Max Requests**: 15 per IP
- **Applied to**: Recipe validation/scraping

### Usage Example

```typescript
import { aiGenerationLimiter, fileUploadLimiter } from "./middleware/rate-limit";

app.post("/api/ai/generate", aiGenerationLimiter, async (req, res) => {
  // Protected by rate limiting
});
```

---

## CSRF Protection

### Overview
Cross-Site Request Forgery (CSRF) protection ensures requests originate from the application.

### Implementation
Two-layer approach:
1. **Origin validation** - Checks Origin/Referer headers
2. **Token-based protection** - Double Submit Cookie pattern

### Middleware

#### `csrfProtection`
Validates origin for all state-changing requests (POST, PUT, DELETE, PATCH).

```typescript
import { csrfProtection } from "./middleware/csrf";

app.post("/api/sensitive-operation", csrfProtection, handler);
```

#### `generateCSRFToken`
Automatically generates and provides CSRF tokens (already applied globally).

### Client Usage

1. Get CSRF token:
```javascript
const response = await fetch("/api/auth/csrf-token");
const { csrfToken } = await response.json();
```

2. Include in requests:
```javascript
fetch("/api/protected-endpoint", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify(data),
});
```

---

## Environment Configuration

### Overview
Environment variables are validated at startup to prevent runtime errors.

### Required Variables

#### Production (Required)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (min 32 chars)
- At least one AI API key:
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `ANTHROPIC_API_KEY`

#### Optional (Recommended)
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `STRIPE_PUBLISHABLE_KEY` - Stripe client key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)
- `LOG_LEVEL` - Logging verbosity

### Validation

Environment validation runs automatically at startup:

```typescript
import { validateEnv, hasAIProvider, hasStripeConfigured } from "./config/env-validation";

// Automatically validates on import
const env = validateEnv();

// Check specific providers
if (hasAIProvider("openai")) {
  // OpenAI is configured
}

if (hasStripeConfigured()) {
  // Stripe payments enabled
}
```

### Example .env File

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session
SESSION_SECRET=your-very-secure-random-secret-at-least-32-characters

# AI Providers (at least one required in production)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...

# Stripe (optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
```

---

## Session Management

### Configuration
- **Store**: PostgreSQL (connect-pg-simple)
- **Table**: `user_sessions` (auto-created)
- **Duration**: 30 days
- **Security**:
  - `httpOnly: true` - No JavaScript access
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'lax'` - CSRF mitigation

### Session Data
Sessions store:
- User ID (serialized)
- CSRF token
- Authentication state

### Cleanup
Sessions are automatically cleaned up by PostgreSQL store based on expiration.

---

## Security Best Practices

### For Developers

1. **Always validate input**
   ```typescript
   app.post("/api/endpoint", validateBody(schema), handler);
   ```

2. **Protect sensitive routes**
   ```typescript
   app.post("/api/admin/*", requireAdmin, handler);
   ```

3. **Apply rate limiting to expensive operations**
   ```typescript
   app.post("/api/ai/*", aiGenerationLimiter, handler);
   ```

4. **Never expose sensitive data**
   ```typescript
   // Remove password before sending user
   const { password, ...safeUser } = user;
   res.json(safeUser);
   ```

5. **Use parameterized queries**
   ```typescript
   // Drizzle ORM handles this automatically
   await db.select().from(users).where(eq(users.id, userId));
   ```

6. **Log security events**
   ```typescript
   console.warn(`Failed login attempt for user: ${username}`);
   ```

### For System Administrators

1. **Set strong SESSION_SECRET** (32+ random characters)
2. **Enable HTTPS in production** (handled by Replit)
3. **Monitor rate limit violations**
4. **Regularly update dependencies**
5. **Review user roles and permissions**
6. **Enable database backups**
7. **Monitor failed authentication attempts**

---

## API Endpoints Security

### Public Endpoints (No Auth)
- `GET /api/recipes` (read-only, with rate limiting)
- `GET /api/starters` (read-only)
- `GET /api/research/*` (read-only)
- `POST /api/auth/register`
- `POST /api/auth/login`

### Authenticated Endpoints (requireAuth)
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/logout`
- `POST /api/user/*` (user-specific operations)
- `POST /api/baking-logs` (create logs)

### Premium Endpoints (requirePremium)
- `POST /api/ai/advanced-*` (advanced AI features)
- Premium calculator features (when implemented)

### Admin Endpoints (requireAdmin)
- `GET /api/admin/articles/pending-review`
- `POST /api/admin/upload-pdf` (with fileUploadLimiter)
- `POST /api/admin/articles/:id/review`
- `POST /api/research/topics`

### Rate Limited Endpoints
All `/api/*` routes have base rate limiting. Additional strict limits on:
- AI generation (`aiGenerationLimiter`)
- File uploads (`fileUploadLimiter`)
- Authentication (`authLimiter`)
- Recipe validation (`recipeLimiter`)

---

## Reporting Security Issues

If you discover a security vulnerability, please email security@sourdoughsuite.com (or create a private GitHub Security Advisory). Do not create public issues for security vulnerabilities.

---

## Security Audit Checklist

- [x] Password hashing with bcrypt
- [x] Session management with secure cookies
- [x] Input validation on all endpoints
- [x] Rate limiting on API routes
- [x] CSRF protection for state-changing operations
- [x] Environment variable validation
- [x] Role-based access control
- [x] Admin route protection
- [x] SQL injection prevention (parameterized queries via Drizzle ORM)
- [x] XSS prevention (input validation + sanitization)
- [ ] HTTPS enforcement (handled by deployment platform)
- [ ] Security headers (Content-Security-Policy, etc.) - TODO
- [ ] Automated security testing - TODO
- [ ] Dependency vulnerability scanning - TODO

---

## Additional Security Enhancements (Future)

1. **Two-Factor Authentication (2FA)**
   - TOTP support
   - Backup codes

2. **API Key Authentication**
   - Alternative to session-based auth
   - Scoped permissions

3. **OAuth Integration**
   - Google Sign-In
   - GitHub OAuth

4. **Security Headers**
   - Content-Security-Policy
   - X-Frame-Options
   - Strict-Transport-Security

5. **Audit Logging**
   - Track sensitive operations
   - Admin action logs
   - Failed authentication tracking

6. **Account Security Features**
   - Password reset via email
   - Email verification
   - Account lockout after failed attempts
   - Security notifications

---

**Last Updated**: 2025-12-01
**Version**: 1.0.0
