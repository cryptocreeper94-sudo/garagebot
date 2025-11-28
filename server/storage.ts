import { db } from "@db";
import { users, vehicles, deals, hallmarks, carts, cartItems, orders, orderItems, vendors, searchHistory, waitlist } from "@shared/schema";
import type { User, UpsertUser, Vehicle, InsertVehicle, Deal, InsertDeal, Hallmark, InsertHallmark, Cart, InsertCart, CartItem, InsertCartItem, Order, InsertOrder, OrderItem, InsertOrderItem, Vendor, InsertVendor, SearchHistory, InsertSearchHistory, Waitlist, InsertWaitlist } from "@shared/schema";
import { eq, and, desc, sql, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Vehicles
  getVehiclesByUserId(userId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  setPrimaryVehicle(userId: string, vehicleId: string): Promise<void>;

  // Deals
  getActiveDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | undefined>;

  // Hallmarks
  getHallmarkByUserId(userId: string): Promise<Hallmark | undefined>;
  createHallmark(hallmark: InsertHallmark): Promise<Hallmark>;

  // Cart
  getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart>;
  getCartItems(cartId: string): Promise<CartItem[]>;
  addToCart(cartId: string, item: Omit<InsertCartItem, 'cartId'>): Promise<CartItem>;
  updateCartItem(itemId: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(itemId: string): Promise<boolean>;
  clearCart(cartId: string): Promise<boolean>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Stripe data queries
  getStripeProducts(): Promise<any[]>;
  getStripePrices(): Promise<any[]>;

  // Vendors
  getActiveVendors(): Promise<Vendor[]>;
  getVendor(slug: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined>;

  // Search History
  logSearch(search: InsertSearchHistory): Promise<SearchHistory>;

  // Waitlist
  addToWaitlist(entry: InsertWaitlist): Promise<Waitlist>;
  getWaitlistByFeature(feature: string): Promise<Waitlist[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Vehicles
  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId)).orderBy(desc(vehicles.isPrimary));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async setPrimaryVehicle(userId: string, vehicleId: string): Promise<void> {
    await db.update(vehicles).set({ isPrimary: false }).where(eq(vehicles.userId, userId));
    await db.update(vehicles).set({ isPrimary: true }).where(eq(vehicles.id, vehicleId));
  }

  // Deals
  async getActiveDeals(): Promise<Deal[]> {
    return await db.select().from(deals).where(eq(deals.isActive, true)).orderBy(desc(deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | undefined> {
    const [deal] = await db.update(deals).set(updates).where(eq(deals.id, id)).returning();
    return deal;
  }

  // Hallmarks
  async getHallmarkByUserId(userId: string): Promise<Hallmark | undefined> {
    const [hallmark] = await db.select().from(hallmarks).where(eq(hallmarks.userId, userId));
    return hallmark;
  }

  async createHallmark(insertHallmark: InsertHallmark): Promise<Hallmark> {
    const [hallmark] = await db.insert(hallmarks).values(insertHallmark).returning();
    return hallmark;
  }

  // Cart
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let existingCart: Cart | undefined;
    
    if (userId) {
      [existingCart] = await db.select().from(carts).where(eq(carts.userId, userId));
    } else if (sessionId) {
      [existingCart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId));
    }
    
    if (existingCart) {
      return existingCart;
    }
    
    const [newCart] = await db.insert(carts).values({
      userId: userId || null,
      sessionId: sessionId || null,
    }).returning();
    
    return newCart;
  }

  async getCartItems(cartId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId)).orderBy(desc(cartItems.createdAt));
  }

  async addToCart(cartId: string, item: Omit<InsertCartItem, 'cartId'>): Promise<CartItem> {
    const existingItems = await db.select().from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.priceId, item.priceId)));
    
    if (existingItems.length > 0) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existingItems[0].quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existingItems[0].id))
        .returning();
      return updated;
    }
    
    const [cartItem] = await db.insert(cartItems).values({ ...item, cartId }).returning();
    return cartItem;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeCartItem(itemId);
      return undefined;
    }
    const [item] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId)).returning();
    return item;
  }

  async removeCartItem(itemId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async clearCart(cartId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return result.rowCount ? result.rowCount >= 0 : true;
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(items).returning();
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return order;
  }

  // Stripe data queries
  async getStripeProducts(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT p.*, pr.id as price_id, pr.unit_amount, pr.currency
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.created DESC
    `);
    return result.rows;
  }

  async getStripePrices(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM stripe.prices WHERE active = true`);
    return result.rows;
  }

  // Vendors
  async getActiveVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.isActive, true)).orderBy(asc(vendors.priority), asc(vendors.name));
  }

  async getVendor(slug: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.slug, slug));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const [vendor] = await db.update(vendors).set(updates).where(eq(vendors.id, id)).returning();
    return vendor;
  }

  // Search History
  async logSearch(search: InsertSearchHistory): Promise<SearchHistory> {
    const [entry] = await db.insert(searchHistory).values(search).returning();
    return entry;
  }

  // Waitlist
  async addToWaitlist(entry: InsertWaitlist): Promise<Waitlist> {
    const [waitlistEntry] = await db.insert(waitlist).values(entry).returning();
    return waitlistEntry;
  }

  async getWaitlistByFeature(feature: string): Promise<Waitlist[]> {
    return await db.select().from(waitlist).where(eq(waitlist.feature, feature)).orderBy(desc(waitlist.createdAt));
  }
}

export const storage = new DatabaseStorage();
