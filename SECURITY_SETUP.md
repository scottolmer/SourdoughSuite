# Security Setup Guide

Quick setup guide to get the security features running.

## Prerequisites

- Node.js 20+
- PostgreSQL database (Neon cloud or local)
- All dependencies installed (`npm install`)

## Step 1: Environment Variables

Create or update your `.env` file with the required variables:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Generate a secure session secret (32+ characters)
SESSION_SECRET=$(openssl rand -base64 32)

# Optional but recommended
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# For payments (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NODE_ENV=development
PORT=5000
```

### Generate Session Secret

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use any 32+ character random string:**
```bash
SESSION_SECRET=your-very-secure-random-secret-at-least-32-characters-long
```

## Step 2: Database Setup

The session table will be created automatically on first run, but you can verify:

```sql
-- Check if user_sessions table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'user_sessions';

-- If needed, the table structure is:
-- session (sid, sess, expire) with index on expire
```

## Step 3: Create First Admin User

The security system is now active, so you need to create an admin user. You have two options:

### Option A: Via API (Recommended)

1. Start the server:
```bash
npm run dev
```

2. Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "displayName": "Admin User"
  }'
```

3. Update the user to master tier in the database:
```sql
UPDATE users
SET subscription_tier = 'master'
WHERE username = 'admin';
```

### Option B: Direct Database Insert

```sql
-- Create admin user with hashed password
-- Password: "AdminPass123" (hash shown below, or create your own)
INSERT INTO users (username, email, password, display_name, subscription_tier, subscription_status)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$YourBcryptHashHere',  -- Use bcrypt to hash your password
  'Admin User',
  'master',
  'active'
);
```

To hash a password for direct insert:
```bash
# Install bcrypt CLI
npm install -g bcrypt-cli

# Hash password
bcrypt-cli "YourPassword123" 10
```

Or use Node.js:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('YourPassword123', 10, (err, hash) => {
  console.log(hash);
});
```

## Step 4: Verify Installation

Start the server and test the endpoints:

```bash
# 1. Start server
npm run dev

# 2. Check health
curl http://localhost:5000/api/auth/csrf-token

# Expected response:
# {"csrfToken":"some-random-token"}

# 3. Try login with admin user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourPassword123"
  }' \
  -c cookies.txt

# Expected response:
# {"success":true,"message":"Login successful","user":{...}}

# 4. Test authenticated endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt

# Expected response:
# {"success":true,"user":{...}}

# 5. Test admin endpoint
curl -X GET http://localhost:5000/api/admin/articles/pending-review \
  -b cookies.txt

# Should return articles if authenticated as admin
```

## Step 5: Troubleshooting

### Environment validation fails
**Error:** "DATABASE_URL must be set"
**Solution:** Check your `.env` file exists and DATABASE_URL is set

### Session secret warning
**Warning:** "SESSION_SECRET is not set"
**Solution:** Add SESSION_SECRET to `.env` file (see Step 1)

### Authentication fails
**Error:** "Unauthorized"
**Cause:** Session not persisted or cookies not sent
**Solution:**
- Ensure cookies are enabled
- Check that session table exists in database
- Verify DATABASE_URL is correct

### Rate limiting too strict
**Error:** "Too many requests"
**Solution:** Wait for the time window to expire, or adjust limits in `server/middleware/rate-limit.ts`

### CSRF errors
**Error:** "Invalid or missing CSRF token"
**Solution:**
- For same-origin requests, ensure Origin header is sent
- For API testing, get CSRF token first from `/api/auth/csrf-token`
- Include token in `X-CSRF-Token` header

### Admin routes return 403
**Error:** "Admin privileges required"
**Cause:** User is not master tier
**Solution:** Update user in database:
```sql
UPDATE users SET subscription_tier = 'master' WHERE username = 'youruser';
```

## Step 6: Production Deployment

### Required for Production

1. **Set NODE_ENV:**
```bash
NODE_ENV=production
```

2. **Use strong SESSION_SECRET:**
```bash
# Generate new secret (don't reuse development secret)
SESSION_SECRET=$(openssl rand -base64 64)
```

3. **HTTPS required:**
- Sessions will only work over HTTPS in production
- Replit handles this automatically

4. **Set at least one AI API key:**
```bash
OPENAI_API_KEY=sk-prod-...
# OR
GEMINI_API_KEY=prod-key...
# OR
ANTHROPIC_API_KEY=prod-key...
```

### Production Checklist

- [ ] `NODE_ENV=production` set
- [ ] Strong `SESSION_SECRET` configured (64+ characters)
- [ ] `DATABASE_URL` points to production database
- [ ] HTTPS enabled (automatic on Replit)
- [ ] At least one AI API key configured
- [ ] Admin user created and verified
- [ ] Stripe keys configured (if using payments)
- [ ] Test all authentication flows
- [ ] Test rate limiting
- [ ] Monitor error logs

## Step 7: Optional Configurations

### Adjust Rate Limits

Edit `server/middleware/rate-limit.ts`:

```typescript
// Make AI generation more generous for premium users
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50, // Increased from 20
  // ...
});
```

### Customize Password Requirements

Edit `server/middleware/validation.ts`:

```typescript
export const userRegistrationSchema = z.object({
  // ...
  password: z.string()
    .min(12) // Increase minimum length
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Must contain uppercase, lowercase, number, and special character"
    ),
});
```

### Add Custom Validation Schemas

```typescript
// In server/middleware/validation.ts
export const myCustomSchema = z.object({
  field: z.string().min(1).max(100),
  // Add your fields
});

// In your route
import { validateBody, myCustomSchema } from "./middleware/validation";

app.post("/api/my-endpoint", validateBody(myCustomSchema), handler);
```

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run production
npm start

# Type check
npm run check

# Push database schema changes
npm run db:push
```

## Security Best Practices

1. **Never commit .env file** - Add to .gitignore
2. **Use strong SESSION_SECRET** - 32+ random characters
3. **Rotate secrets regularly** - Change SESSION_SECRET periodically
4. **Monitor failed logins** - Check logs for brute force attempts
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Use HTTPS in production** - Required for secure sessions
7. **Limit admin accounts** - Only create master tier for trusted users
8. **Review rate limits** - Adjust based on usage patterns
9. **Enable logging** - Monitor security events
10. **Backup database** - Regular backups including user_sessions table

## Getting Help

- **Documentation:** See `SECURITY.md` for comprehensive guide
- **Quick Reference:** See `server/middleware/README.md` for usage examples
- **Implementation Details:** See `SECURITY_IMPLEMENTATION_SUMMARY.md`
- **Issues:** Check server logs for error messages

## Next Steps

After setup is complete:

1. ✅ Test user registration and login
2. ✅ Create admin user and verify access
3. ✅ Test rate limiting with multiple requests
4. ✅ Review and customize validation schemas
5. ✅ Configure rate limits for your use case
6. ✅ Set up monitoring for failed auth attempts
7. ✅ Document any custom security configurations
8. ✅ Train team on new authentication requirements

---

**Setup Version:** 1.0.0
**Last Updated:** 2025-12-01
