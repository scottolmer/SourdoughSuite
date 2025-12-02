// Legacy commerce schema - preserved for potential future use
// This content has been moved from the main schema to maintain scientific focus

import { pgTable, serial, text, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Legacy sourdough starters table
export const legacySourdoughStarters = pgTable("legacy_sourdough_starters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  mainFlour: text("main_flour").notNull(),
  flourMix: json("flour_mix"),
  flavor: json("flavor").notNull(),
  maintenance: json("maintenance").notNull(),
  imageUrl: text("image_url"),
  badge: text("badge"),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy products table
export const legacyProducts = pgTable("legacy_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  tags: json("tags"),
  features: json("features"),
  inStock: boolean("in_stock").default(true),
  inventory: integer("inventory").default(0),
  featured: boolean("featured").default(false),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  dimensions: text("dimensions"),
  weight: text("weight"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy orders table
export const legacyOrders = pgTable("legacy_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  status: text("status").notNull(),
  total: integer("total").notNull(),
  items: json("items").notNull(),
  shippingAddress: json("shipping_address").notNull(),
  billingAddress: json("billing_address"),
  paymentIntentId: text("payment_intent_id"),
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});