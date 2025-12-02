import { db } from './db';
import { sourdoughStarters, products, orders } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function migrateCommerceToLegacy() {
  try {
    console.log('Starting commerce data migration to legacy tables...');
    
    // Create legacy tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS legacy_sourdough_starters AS 
      SELECT * FROM sourdough_starters;
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS legacy_products AS 
      SELECT * FROM products;
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS legacy_orders AS 
      SELECT * FROM orders;
    `);
    
    console.log('Commerce data preserved in legacy tables');
    
    // Note: Not actually dropping the original tables for now
    // This preserves the data while allowing the platform to focus on research
    
  } catch (error) {
    console.error('Error migrating commerce data:', error);
  }
}

// Call this manually when ready to migrate
// migrateCommerceToLegacy();