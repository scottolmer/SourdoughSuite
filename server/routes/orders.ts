import { Express } from "express";
import { storage } from "../storage";
import { successResponse, errorResponse, notFound } from "../utils/responses";
import { validateParams, idParamSchema } from "../middleware/validation";
import { requireAuth, optionalAuth } from "../middleware/auth";
import logger from "../config/logger";
import { insertOrderSchema } from "../../shared/schema";
import { ZodError, fromZodError } from "zod-validation-error";
import { z } from "zod";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Register all order-related routes
 * Order management and payment processing
 */
export function registerOrderRoutes(app: Express) {

  /**
   * GET /api/orders
   * Get all orders (admin)
   */
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      logger.info("Fetched all orders", { count: orders.length });
      return successResponse(res, orders);
    } catch (error) {
      logger.error("Error fetching orders", { error });
      return errorResponse(res, "Failed to fetch orders", 500);
    }
  });

  /**
   * GET /api/user/:userId/orders
   * Get orders for a specific user
   */
  app.get("/api/user/:userId/orders", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getUserOrders(userId);
      logger.info("Fetched user orders", { userId, count: orders.length });
      return successResponse(res, orders);
    } catch (error) {
      logger.error("Error fetching user orders", { error, userId: req.params.userId });
      return errorResponse(res, "Failed to fetch user orders", 500);
    }
  });

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  app.get("/api/orders/:id", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);

      if (!order) {
        return notFound(res, "Order not found");
      }

      logger.info("Fetched order", { orderId });
      return successResponse(res, order);
    } catch (error) {
      logger.error("Error fetching order", { error, orderId: req.params.id });
      return errorResponse(res, "Failed to fetch order", 500);
    }
  });

  /**
   * POST /api/orders
   * Create a new order
   */
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(order);
      logger.info("Created order", { orderId: newOrder.id, userId: (req.user as any)?.id });
      return successResponse(res, newOrder, "Order created successfully", 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating order", { error });
      return errorResponse(res, "Failed to create order", 500);
    }
  });

  /**
   * PATCH /api/orders/:id/status
   * Update order status
   */
  app.patch("/api/orders/:id/status", requireAuth, validateParams(idParamSchema), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const statusSchema = z.object({
        status: z.string(),
      });
      const { status } = statusSchema.parse(req.body);

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (!updatedOrder) {
        return notFound(res, "Order not found");
      }

      logger.info("Updated order status", { orderId, status, userId: (req.user as any)?.id });
      return successResponse(res, updatedOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error updating order status", { error, orderId: req.params.id });
      return errorResponse(res, "Failed to update order status", 500);
    }
  });

  /**
   * POST /api/create-payment-intent
   * Create a Stripe payment intent
   */
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const paymentSchema = z.object({
        amount: z.number().min(0.5),
        items: z
          .array(
            z.object({
              id: z.union([z.string(), z.number()]),
              quantity: z.number().optional(),
            })
          )
          .optional(),
        customer: z
          .object({
            email: z.string().email().optional(),
            name: z.string().optional(),
            address: z
              .object({
                line1: z.string().optional(),
                city: z.string().optional(),
                state: z.string().optional(),
                postal_code: z.string().optional(),
                country: z.string().optional(),
              })
              .optional(),
            phone: z.string().optional(),
          })
          .optional(),
      });

      const validatedData = paymentSchema.parse(req.body);

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(validatedData.amount * 100);

      logger.info("Creating payment intent", { amount: validatedData.amount, amountInCents });

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          items: validatedData.items ? JSON.stringify(validatedData.items) : "",
        },
        receipt_email: validatedData.customer?.email,
        shipping: validatedData.customer?.address
          ? {
              name: validatedData.customer.name || "",
              address: {
                line1: validatedData.customer.address.line1 || "",
                city: validatedData.customer.address.city || "",
                state: validatedData.customer.address.state || "",
                postal_code: validatedData.customer.address.postal_code || "",
                country: validatedData.customer.address.country || "US",
              },
              phone: validatedData.customer.phone || "",
            }
          : undefined,
      });

      logger.info("Payment intent created", { paymentIntentId: paymentIntent.id });
      return successResponse(res, {
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return errorResponse(res, validationError.message, 400);
      }
      logger.error("Error creating payment intent", { error });
      return errorResponse(res, "Failed to create payment intent", 500);
    }
  });
}
