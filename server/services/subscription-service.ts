import { db } from "../db";
import { users, subscriptionPlans, paymentTransactions, userPurchases, aiUsageLog } from "../../shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

// Subscription tier limits and features
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    aiRequestsPerMonth: 10,
    recipesPerMonth: 5,
    features: [
      "Basic recipe generation",
      "5 AI-generated recipes/month",
      "Community access",
      "Basic baking timeline"
    ],
    limits: {
      aiRequests: 10,
      recipeGeneration: 5,
      starterTracking: 1,
      premiumContent: false
    }
  },
  premium: {
    name: "Premium Baker",
    price: 1999, // $19.99/month
    aiRequestsPerMonth: 100,
    recipesPerMonth: 50,
    features: [
      "Unlimited recipe generation",
      "Advanced AI multi-agent system",
      "Premium recipe collections",
      "Personalized baking timeline",
      "Ingredient substitution engine",
      "Advanced nutrition analysis",
      "Multiple starter tracking",
      "Priority support"
    ],
    limits: {
      aiRequests: 100,
      recipeGeneration: 50,
      starterTracking: 5,
      premiumContent: true
    }
  },
  master: {
    name: "Master Baker",
    price: 4999, // $49.99/month
    aiRequestsPerMonth: -1, // unlimited
    recipesPerMonth: -1, // unlimited
    features: [
      "Everything in Premium",
      "Unlimited AI requests",
      "Exclusive master classes",
      "1-on-1 virtual baking sessions",
      "Commercial recipe licensing",
      "Advanced fermentation tracking",
      "Custom recipe development",
      "Beta feature access",
      "White-label licensing"
    ],
    limits: {
      aiRequests: -1,
      recipeGeneration: -1,
      starterTracking: -1,
      premiumContent: true
    }
  }
};

export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  userId: number
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  // Update user subscription status
  await db
    .update(users)
    .set({
      subscriptionStatus: "active",
      subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.id, userId));

  return subscription;
}

export async function checkSubscriptionLimits(
  userId: number | null,
  sessionId: string | null,
  feature: string
): Promise<{ allowed: boolean; reason?: string; tier: string }> {
  if (!userId && !sessionId) {
    return { allowed: false, reason: "No user or session identified", tier: "none" };
  }

  let userTier = "free";
  let limits = SUBSCRIPTION_TIERS.free.limits;

  if (userId) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user?.subscriptionTier) {
      userTier = user.subscriptionTier;
      limits = SUBSCRIPTION_TIERS[userTier as keyof typeof SUBSCRIPTION_TIERS]?.limits || SUBSCRIPTION_TIERS.free.limits;
    }
  }

  // Check current month usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageQuery = db
    .select()
    .from(aiUsageLog)
    .where(
      and(
        gte(aiUsageLog.createdAt, startOfMonth),
        eq(aiUsageLog.feature, feature),
        userId ? eq(aiUsageLog.userId, userId) : eq(aiUsageLog.sessionId, sessionId!)
      )
    );

  const usage = await usageQuery;
  const currentUsage = usage.reduce((sum, log) => sum + (log.requestCount || 1), 0);

  // Check limits based on feature
  let featureLimit = 0;
  switch (feature) {
    case "recipe_generation":
      featureLimit = limits.recipeGeneration;
      break;
    case "ai_chat":
    case "analysis":
      featureLimit = limits.aiRequests;
      break;
    default:
      featureLimit = limits.aiRequests;
  }

  if (featureLimit === -1) {
    return { allowed: true, tier: userTier };
  }

  if (currentUsage >= featureLimit) {
    return {
      allowed: false,
      reason: `Monthly limit of ${featureLimit} ${feature} requests exceeded. Upgrade to ${userTier === 'free' ? 'Premium' : 'Master Baker'} for more requests.`,
      tier: userTier
    };
  }

  return { allowed: true, tier: userTier };
}

export async function logAiUsage(
  userId: number | null,
  sessionId: string | null,
  feature: string,
  tokensUsed: number = 0
) {
  await db.insert(aiUsageLog).values({
    userId,
    sessionId,
    feature,
    tokensUsed,
    requestCount: 1,
  });
}

export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  customerId?: string
) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;
      await updateUserSubscription(subscription);
      break;

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await cancelUserSubscription(deletedSubscription.customer as string);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;
      await recordPayment(invoice);
      break;

    case "invoice.payment_failed":
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handleFailedPayment(failedInvoice);
      break;
  }
}

async function updateUserSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  let tier = "free";
  if (subscription.status === "active") {
    // Determine tier based on price
    const price = subscription.items.data[0]?.price.unit_amount || 0;
    if (price >= 4999) tier = "master";
    else if (price >= 1999) tier = "premium";
  }

  await db
    .update(users)
    .set({
      subscriptionTier: tier,
      subscriptionStatus: subscription.status,
      subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(users.id, user.id));
}

async function cancelUserSubscription(customerId: string) {
  await db
    .update(users)
    .set({
      subscriptionTier: "free",
      subscriptionStatus: "cancelled",
      subscriptionExpiresAt: null,
    })
    .where(eq(users.stripeCustomerId, customerId));
}

async function recordPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  await db.insert(paymentTransactions).values({
    userId: user.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded",
    description: invoice.description || "Subscription payment",
    productType: "subscription",
    productId: invoice.subscription as string,
  });
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  await db
    .update(users)
    .set({
      subscriptionStatus: "past_due",
    })
    .where(eq(users.stripeCustomerId, customerId));
}

export async function getUserSubscriptionInfo(userId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const tierInfo = SUBSCRIPTION_TIERS[user.subscriptionTier as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.free;

  // Get current month usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await db
    .select()
    .from(aiUsageLog)
    .where(
      and(
        eq(aiUsageLog.userId, userId),
        gte(aiUsageLog.createdAt, startOfMonth)
      )
    );

  const usageByFeature = usage.reduce((acc, log) => {
    acc[log.feature] = (acc[log.feature] || 0) + (log.requestCount || 1);
    return acc;
  }, {} as Record<string, number>);

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    expiresAt: user.subscriptionExpiresAt,
    features: tierInfo.features,
    limits: tierInfo.limits,
    usage: usageByFeature,
  };
}