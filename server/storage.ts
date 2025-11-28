import { db } from "@db";
import { 
  users, vehicles, deals, hallmarks, carts, cartItems, orders, orderItems, 
  vendors, searchHistory, waitlist, shops, shopStaff, shopCustomers, shopReviews,
  serviceRecords, serviceReminders, messageTemplates, messageLog,
  userPreferences, auditLog, vehicleRecalls, scanHistory
} from "@shared/schema";
import type { 
  User, UpsertUser, Vehicle, InsertVehicle, Deal, InsertDeal, Hallmark, InsertHallmark, 
  Cart, InsertCart, CartItem, InsertCartItem, Order, InsertOrder, OrderItem, InsertOrderItem, 
  Vendor, InsertVendor, SearchHistory, InsertSearchHistory, Waitlist, InsertWaitlist,
  Shop, InsertShop, ShopStaff, InsertShopStaff, ShopCustomer, InsertShopCustomer,
  ShopReview, InsertShopReview, ServiceRecord, InsertServiceRecord, ServiceReminder, InsertServiceReminder,
  MessageTemplate, InsertMessageTemplate, MessageLog, InsertMessageLog,
  UserPreferences, InsertUserPreferences, AuditLog, InsertAuditLog,
  VehicleRecall, InsertVehicleRecall, ScanHistory, InsertScanHistory
} from "@shared/schema";
import { eq, and, desc, sql, asc, ilike, or, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Vehicles
  getVehiclesByUserId(userId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleByVin(vin: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  setPrimaryVehicle(userId: string, vehicleId: string): Promise<void>;

  // Service Records
  getServiceRecordsByVehicle(vehicleId: string): Promise<ServiceRecord[]>;
  getServiceRecordsByUser(userId: string): Promise<ServiceRecord[]>;
  createServiceRecord(record: InsertServiceRecord): Promise<ServiceRecord>;
  updateServiceRecord(id: string, updates: Partial<ServiceRecord>): Promise<ServiceRecord | undefined>;

  // Service Reminders
  getServiceRemindersByUser(userId: string): Promise<ServiceReminder[]>;
  getPendingReminders(): Promise<ServiceReminder[]>;
  createServiceReminder(reminder: InsertServiceReminder): Promise<ServiceReminder>;
  markReminderSent(id: string): Promise<void>;
  markReminderCompleted(id: string): Promise<void>;

  // Shops
  getShops(filters?: { city?: string; state?: string; zipCode?: string }): Promise<Shop[]>;
  getShop(id: string): Promise<Shop | undefined>;
  getShopBySlug(slug: string): Promise<Shop | undefined>;
  getShopsByOwner(ownerId: string): Promise<Shop[]>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: string, updates: Partial<Shop>): Promise<Shop | undefined>;

  // Shop Staff
  getShopStaff(shopId: string): Promise<ShopStaff[]>;
  addShopStaff(staff: InsertShopStaff): Promise<ShopStaff>;
  removeShopStaff(id: string): Promise<boolean>;

  // Shop Customers
  getShopCustomers(shopId: string): Promise<ShopCustomer[]>;
  linkCustomerToShop(link: InsertShopCustomer): Promise<ShopCustomer>;
  getCustomerShops(userId: string): Promise<Shop[]>;

  // Shop Reviews
  getShopReviews(shopId: string): Promise<ShopReview[]>;
  createShopReview(review: InsertShopReview): Promise<ShopReview>;

  // Message Templates
  getMessageTemplates(shopId?: string): Promise<MessageTemplate[]>;
  createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate>;

  // Message Log
  logMessage(message: InsertMessageLog): Promise<MessageLog>;
  getMessageHistory(filters: { shopId?: string; userId?: string }): Promise<MessageLog[]>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;

  // Audit Log
  logAudit(entry: InsertAuditLog): Promise<AuditLog>;
  getUserAuditHistory(userId: string, limit?: number): Promise<AuditLog[]>;
  searchAuditLog(filters: { entityType?: string; action?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]>;

  // Vehicle Recalls
  getRecallsByVehicle(vehicleId: string): Promise<VehicleRecall[]>;
  getRecallsByVin(vin: string): Promise<VehicleRecall[]>;
  createRecall(recall: InsertVehicleRecall): Promise<VehicleRecall>;
  markRecallResolved(id: string): Promise<void>;

  // Scan History
  logScan(scan: InsertScanHistory): Promise<ScanHistory>;
  getScanHistory(userId: string): Promise<ScanHistory[]>;

  // Hallmarks
  getHallmarkByUserId(userId: string): Promise<Hallmark | undefined>;
  getHallmarkByAssetNumber(assetNumber: number): Promise<Hallmark | undefined>;
  searchHallmarks(query: string): Promise<Hallmark[]>;
  getAllHallmarks(): Promise<Hallmark[]>;
  getNextAssetNumber(): Promise<number>;
  createHallmark(hallmark: InsertHallmark): Promise<Hallmark>;

  // Deals
  getActiveDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | undefined>;

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
  getVendorsByType(vehicleType: string): Promise<Vendor[]>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
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
    const [user] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
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

  async getVehicleByVin(vin: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.vin, vin));
    return vehicle;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db.update(vehicles).set({ ...updates, updatedAt: new Date() }).where(eq(vehicles.id, id)).returning();
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

  // Service Records
  async getServiceRecordsByVehicle(vehicleId: string): Promise<ServiceRecord[]> {
    return await db.select().from(serviceRecords).where(eq(serviceRecords.vehicleId, vehicleId)).orderBy(desc(serviceRecords.serviceDate));
  }

  async getServiceRecordsByUser(userId: string): Promise<ServiceRecord[]> {
    return await db.select().from(serviceRecords).where(eq(serviceRecords.userId, userId)).orderBy(desc(serviceRecords.serviceDate));
  }

  async createServiceRecord(record: InsertServiceRecord): Promise<ServiceRecord> {
    const [newRecord] = await db.insert(serviceRecords).values(record).returning();
    return newRecord;
  }

  async updateServiceRecord(id: string, updates: Partial<ServiceRecord>): Promise<ServiceRecord | undefined> {
    const [record] = await db.update(serviceRecords).set(updates).where(eq(serviceRecords.id, id)).returning();
    return record;
  }

  // Service Reminders
  async getServiceRemindersByUser(userId: string): Promise<ServiceReminder[]> {
    return await db.select().from(serviceReminders).where(eq(serviceReminders.userId, userId)).orderBy(asc(serviceReminders.dueDate));
  }

  async getPendingReminders(): Promise<ServiceReminder[]> {
    return await db.select().from(serviceReminders)
      .where(and(eq(serviceReminders.isCompleted, false), eq(serviceReminders.isSent, false)))
      .orderBy(asc(serviceReminders.dueDate));
  }

  async createServiceReminder(reminder: InsertServiceReminder): Promise<ServiceReminder> {
    const [newReminder] = await db.insert(serviceReminders).values(reminder).returning();
    return newReminder;
  }

  async markReminderSent(id: string): Promise<void> {
    await db.update(serviceReminders).set({ isSent: true, sentAt: new Date() }).where(eq(serviceReminders.id, id));
  }

  async markReminderCompleted(id: string): Promise<void> {
    await db.update(serviceReminders).set({ isCompleted: true }).where(eq(serviceReminders.id, id));
  }

  // Shops
  async getShops(filters?: { city?: string; state?: string; zipCode?: string }): Promise<Shop[]> {
    let query = db.select().from(shops).where(eq(shops.isActive, true));
    return await query.orderBy(desc(shops.rating), asc(shops.name));
  }

  async getShop(id: string): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async getShopBySlug(slug: string): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.slug, slug));
    return shop;
  }

  async getShopsByOwner(ownerId: string): Promise<Shop[]> {
    return await db.select().from(shops).where(eq(shops.ownerId, ownerId));
  }

  async createShop(shop: InsertShop): Promise<Shop> {
    const [newShop] = await db.insert(shops).values(shop).returning();
    return newShop;
  }

  async updateShop(id: string, updates: Partial<Shop>): Promise<Shop | undefined> {
    const [shop] = await db.update(shops).set({ ...updates, updatedAt: new Date() }).where(eq(shops.id, id)).returning();
    return shop;
  }

  // Shop Staff
  async getShopStaff(shopId: string): Promise<ShopStaff[]> {
    return await db.select().from(shopStaff).where(eq(shopStaff.shopId, shopId));
  }

  async addShopStaff(staff: InsertShopStaff): Promise<ShopStaff> {
    const [newStaff] = await db.insert(shopStaff).values(staff).returning();
    return newStaff;
  }

  async removeShopStaff(id: string): Promise<boolean> {
    const result = await db.delete(shopStaff).where(eq(shopStaff.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Shop Customers
  async getShopCustomers(shopId: string): Promise<ShopCustomer[]> {
    return await db.select().from(shopCustomers).where(eq(shopCustomers.shopId, shopId)).orderBy(desc(shopCustomers.lastVisit));
  }

  async linkCustomerToShop(link: InsertShopCustomer): Promise<ShopCustomer> {
    const [newLink] = await db.insert(shopCustomers).values(link).returning();
    return newLink;
  }

  async getCustomerShops(userId: string): Promise<Shop[]> {
    const links = await db.select().from(shopCustomers).where(eq(shopCustomers.userId, userId));
    const shopIds = links.map(l => l.shopId);
    if (shopIds.length === 0) return [];
    return await db.select().from(shops).where(sql`${shops.id} = ANY(${shopIds})`);
  }

  // Shop Reviews
  async getShopReviews(shopId: string): Promise<ShopReview[]> {
    return await db.select().from(shopReviews).where(eq(shopReviews.shopId, shopId)).orderBy(desc(shopReviews.createdAt));
  }

  async createShopReview(review: InsertShopReview): Promise<ShopReview> {
    const [newReview] = await db.insert(shopReviews).values(review).returning();
    // Update shop rating
    const reviews = await this.getShopReviews(review.shopId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.updateShop(review.shopId, { rating: avgRating.toFixed(2), reviewCount: reviews.length });
    return newReview;
  }

  // Message Templates
  async getMessageTemplates(shopId?: string): Promise<MessageTemplate[]> {
    if (shopId) {
      return await db.select().from(messageTemplates)
        .where(or(eq(messageTemplates.shopId, shopId), eq(messageTemplates.isSystem, true)));
    }
    return await db.select().from(messageTemplates).where(eq(messageTemplates.isSystem, true));
  }

  async createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate> {
    const [newTemplate] = await db.insert(messageTemplates).values(template).returning();
    return newTemplate;
  }

  // Message Log
  async logMessage(message: InsertMessageLog): Promise<MessageLog> {
    const [entry] = await db.insert(messageLog).values(message).returning();
    return entry;
  }

  async getMessageHistory(filters: { shopId?: string; userId?: string }): Promise<MessageLog[]> {
    if (filters.shopId) {
      return await db.select().from(messageLog).where(eq(messageLog.shopId, filters.shopId)).orderBy(desc(messageLog.createdAt));
    }
    if (filters.userId) {
      return await db.select().from(messageLog).where(eq(messageLog.userId, filters.userId)).orderBy(desc(messageLog.createdAt));
    }
    return [];
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values(prefs)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...prefs, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  // Audit Log
  async logAudit(entry: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLog).values(entry).returning();
    return log;
  }

  async getUserAuditHistory(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);
  }

  async searchAuditLog(filters: { entityType?: string; action?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]> {
    let conditions = [];
    if (filters.entityType) conditions.push(eq(auditLog.entityType, filters.entityType));
    if (filters.action) conditions.push(eq(auditLog.action, filters.action));
    if (filters.startDate) conditions.push(gte(auditLog.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(auditLog.createdAt, filters.endDate));
    
    if (conditions.length === 0) {
      return await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(100);
    }
    return await db.select().from(auditLog).where(and(...conditions)).orderBy(desc(auditLog.createdAt)).limit(100);
  }

  // Vehicle Recalls
  async getRecallsByVehicle(vehicleId: string): Promise<VehicleRecall[]> {
    return await db.select().from(vehicleRecalls).where(eq(vehicleRecalls.vehicleId, vehicleId)).orderBy(desc(vehicleRecalls.recallDate));
  }

  async getRecallsByVin(vin: string): Promise<VehicleRecall[]> {
    return await db.select().from(vehicleRecalls).where(eq(vehicleRecalls.vin, vin)).orderBy(desc(vehicleRecalls.recallDate));
  }

  async createRecall(recall: InsertVehicleRecall): Promise<VehicleRecall> {
    const [newRecall] = await db.insert(vehicleRecalls).values(recall).returning();
    return newRecall;
  }

  async markRecallResolved(id: string): Promise<void> {
    await db.update(vehicleRecalls).set({ isResolved: true, resolvedDate: new Date(), updatedAt: new Date() }).where(eq(vehicleRecalls.id, id));
  }

  // Scan History
  async logScan(scan: InsertScanHistory): Promise<ScanHistory> {
    const [entry] = await db.insert(scanHistory).values(scan).returning();
    return entry;
  }

  async getScanHistory(userId: string): Promise<ScanHistory[]> {
    return await db.select().from(scanHistory).where(eq(scanHistory.userId, userId)).orderBy(desc(scanHistory.createdAt));
  }

  // Hallmarks
  async getHallmarkByUserId(userId: string): Promise<Hallmark | undefined> {
    const [hallmark] = await db.select().from(hallmarks).where(eq(hallmarks.userId, userId));
    return hallmark;
  }

  async getHallmarkByAssetNumber(assetNumber: number): Promise<Hallmark | undefined> {
    const [hallmark] = await db.select().from(hallmarks).where(eq(hallmarks.assetNumber, assetNumber));
    return hallmark;
  }

  async searchHallmarks(query: string): Promise<Hallmark[]> {
    return await db.select().from(hallmarks)
      .where(or(
        ilike(hallmarks.displayName, `%${query}%`),
        ilike(hallmarks.walletAddress, `%${query}%`),
        eq(hallmarks.tokenId, query)
      ))
      .orderBy(asc(hallmarks.assetNumber))
      .limit(50);
  }

  async getAllHallmarks(): Promise<Hallmark[]> {
    return await db.select().from(hallmarks).orderBy(asc(hallmarks.assetNumber));
  }

  async getNextAssetNumber(): Promise<number> {
    const result = await db.select({ maxAsset: sql<number>`COALESCE(MAX(${hallmarks.assetNumber}), 1)` }).from(hallmarks);
    return (result[0]?.maxAsset || 1) + 1;
  }

  async createHallmark(insertHallmark: InsertHallmark): Promise<Hallmark> {
    const [hallmark] = await db.insert(hallmarks).values(insertHallmark).returning();
    return hallmark;
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

  async getVendorsByType(vehicleType: string): Promise<Vendor[]> {
    return await db.select().from(vendors)
      .where(and(
        eq(vendors.isActive, true),
        sql`${vehicleType} = ANY(${vendors.vehicleTypes})`
      ))
      .orderBy(asc(vendors.priority), asc(vendors.name));
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
