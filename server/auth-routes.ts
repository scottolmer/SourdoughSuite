import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./config/passport";
import { authLimiter } from "./middleware/rate-limit";
import { validateBody } from "./middleware/validation";
import { userRegistrationSchema, userLoginSchema, userUpdateSchema } from "./middleware/validation";

export function registerAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register
   * Register a new user account
   */
  app.post(
    "/api/auth/register",
    authLimiter,
    validateBody(userRegistrationSchema),
    async (req: Request, res: Response) => {
      try {
        const { username, email, password, displayName } = req.body;

        // Check if username already exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (existingUser) {
          return res.status(409).json({
            error: "Conflict",
            message: "Username already exists",
          });
        }

        // Check if email already exists (if provided)
        if (email) {
          const [existingEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (existingEmail) {
            return res.status(409).json({
              error: "Conflict",
              message: "Email already registered",
            });
          }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            username,
            email: email || null,
            password: hashedPassword,
            displayName: displayName || username,
            subscriptionTier: "free",
            subscriptionStatus: "inactive",
          })
          .returning();

        // Auto-login after registration
        req.login(newUser, (err) => {
          if (err) {
            console.error("Auto-login failed after registration:", err);
            return res.status(201).json({
              success: true,
              message: "User created successfully. Please log in.",
            });
          }

          // Return user without password
          const { password: _, ...userWithoutPassword } = newUser;
          return res.status(201).json({
            success: true,
            message: "User created and logged in successfully",
            user: userWithoutPassword,
          });
        });
      } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to create user account",
        });
      }
    }
  );

  /**
   * POST /api/auth/login
   * Authenticate user and create session
   */
  app.post(
    "/api/auth/login",
    authLimiter,
    validateBody(userLoginSchema),
    (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({
            error: "Internal Server Error",
            message: "Authentication failed",
          });
        }

        if (!user) {
          return res.status(401).json({
            error: "Unauthorized",
            message: info?.message || "Invalid credentials",
          });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            return res.status(500).json({
              error: "Internal Server Error",
              message: "Failed to create session",
            });
          }

          return res.json({
            success: true,
            message: "Login successful",
            user,
          });
        });
      })(req, res, next);
    }
  );

  /**
   * POST /api/auth/logout
   * Destroy user session
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to logout",
        });
      }

      req.session?.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destruction error:", destroyErr);
        }

        res.clearCookie("connect.sid");
        return res.json({
          success: true,
          message: "Logged out successfully",
        });
      });
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Not authenticated",
      });
    }

    return res.json({
      success: true,
      user: req.user,
    });
  });

  /**
   * GET /api/auth/csrf-token
   * Get CSRF token for client
   */
  app.get("/api/auth/csrf-token", (req: Request, res: Response) => {
    return res.json({
      csrfToken: res.locals.csrfToken || req.session?.csrfToken,
    });
  });

  /**
   * PUT /api/auth/profile
   * Update user profile
   */
  app.put(
    "/api/auth/profile",
    validateBody(userUpdateSchema),
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      try {
        const user = req.user as any;
        const { email, displayName, currentPassword, newPassword } = req.body;

        // If changing password, verify current password
        if (newPassword) {
          if (!currentPassword) {
            return res.status(400).json({
              error: "Bad Request",
              message: "Current password required to set new password",
            });
          }

          // Verify current password
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

          const bcrypt = await import("bcrypt");
          const isValid = await bcrypt.compare(currentPassword, dbUser.password);

          if (!isValid) {
            return res.status(401).json({
              error: "Unauthorized",
              message: "Current password is incorrect",
            });
          }
        }

        // Build update object
        const updates: any = {};
        if (email !== undefined) updates.email = email;
        if (displayName !== undefined) updates.displayName = displayName;
        if (newPassword) {
          updates.password = await hashPassword(newPassword);
        }

        // Update user
        const [updatedUser] = await db
          .update(users)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(users.id, user.id))
          .returning();

        // Return updated user without password
        const { password: _, ...userWithoutPassword } = updatedUser;

        return res.json({
          success: true,
          message: "Profile updated successfully",
          user: userWithoutPassword,
        });
      } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to update profile",
        });
      }
    }
  );
}
