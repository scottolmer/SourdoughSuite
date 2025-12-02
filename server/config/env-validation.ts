import { z } from "zod";

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),

  // API Keys (optional in development, required in production)
  OPENAI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Stripe (optional, only needed for payments)
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),

  // Session secret
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters").optional(),

  // Optional configurations
  PORT: z.string().regex(/^\d+$/).transform(Number).default("5000"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

/**
 * Validate environment variables at startup
 * @throws {Error} If required environment variables are missing or invalid
 */
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);

    // Additional validation for production
    if (parsed.NODE_ENV === "production") {
      const productionRequirements = [];

      if (!parsed.OPENAI_API_KEY && !parsed.GEMINI_API_KEY && !parsed.ANTHROPIC_API_KEY) {
        productionRequirements.push("At least one AI API key (OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY) is required in production");
      }

      if (!parsed.SESSION_SECRET) {
        productionRequirements.push("SESSION_SECRET is required in production");
      }

      if (productionRequirements.length > 0) {
        throw new Error(
          "Missing required environment variables for production:\n" +
          productionRequirements.map(req => `  - ${req}`).join("\n")
        );
      }
    }

    // Warn about missing optional but recommended variables
    const warnings = [];
    if (!parsed.OPENAI_API_KEY) warnings.push("OPENAI_API_KEY is not set - AI features using OpenAI will be disabled");
    if (!parsed.GEMINI_API_KEY) warnings.push("GEMINI_API_KEY is not set - AI features using Gemini will be disabled");
    if (!parsed.ANTHROPIC_API_KEY) warnings.push("ANTHROPIC_API_KEY is not set - AI features using Claude will be disabled");
    if (!parsed.STRIPE_SECRET_KEY) warnings.push("STRIPE_SECRET_KEY is not set - payment features will be disabled");

    if (warnings.length > 0 && parsed.NODE_ENV === "development") {
      console.warn("\n⚠️  Environment warnings:");
      warnings.forEach(warning => console.warn(`  - ${warning}`));
      console.warn("");
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("\n❌ Environment variable validation failed:");
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("");
      throw new Error("Invalid environment configuration. Please check your .env file.");
    }
    throw error;
  }
}

/**
 * Get validated environment configuration
 */
export const env = validateEnv();

/**
 * Check if a specific AI provider is configured
 */
export function hasAIProvider(provider: "openai" | "gemini" | "anthropic"): boolean {
  switch (provider) {
    case "openai":
      return !!env.OPENAI_API_KEY;
    case "gemini":
      return !!env.GEMINI_API_KEY;
    case "anthropic":
      return !!env.ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

/**
 * Check if Stripe is configured
 */
export function hasStripeConfigured(): boolean {
  return !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);
}
