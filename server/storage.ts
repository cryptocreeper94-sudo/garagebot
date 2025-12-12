import { db } from "@db";
import { 
  users, vehicles, deals, hallmarks, carts, cartItems, orders, orderItems, 
  vendors, searchHistory, waitlist, shops, shopStaff, shopCustomers, shopReviews,
  serviceRecords, serviceReminders, messageTemplates, messageLog,
  userPreferences, auditLog, vehicleRecalls, scanHistory, devTasks, vehicleShares,
  affiliateNetworks, affiliatePartners, affiliateClicks, affiliateCommissions, affiliatePayouts,
  repairOrders, repairOrderItems, estimates, estimateItems, appointments, shopInventory,
  technicianTimeEntries, digitalInspections, inspectionItems, shopSettings, integrationCredentials,
  vehicleCategories, repairGuides, guideSteps, guideFitment, partTerminology, guideRatings, guideProgress,
  priceAlerts, blockchainVerifications,
  referralInvites, referralPointTransactions, referralRedemptions,
  releases,
  vendorReviews, wishlists, wishlistItems, projects, projectParts, smsPreferences
} from "@shared/schema";
import type { 
  User, UpsertUser, Vehicle, InsertVehicle, Deal, InsertDeal, Hallmark, InsertHallmark, 
  Cart, InsertCart, CartItem, InsertCartItem, Order, InsertOrder, OrderItem, InsertOrderItem, 
  Vendor, InsertVendor, SearchHistory, InsertSearchHistory, Waitlist, InsertWaitlist,
  Shop, InsertShop, ShopStaff, InsertShopStaff, ShopCustomer, InsertShopCustomer,
  ShopReview, InsertShopReview, ServiceRecord, InsertServiceRecord, ServiceReminder, InsertServiceReminder,
  MessageTemplate, InsertMessageTemplate, MessageLog, InsertMessageLog,
  UserPreferences, InsertUserPreferences, AuditLog, InsertAuditLog,
  VehicleRecall, InsertVehicleRecall, ScanHistory, InsertScanHistory,
  DevTask, InsertDevTask, VehicleShare, InsertVehicleShare,
  AffiliateNetwork, InsertAffiliateNetwork, AffiliatePartner, InsertAffiliatePartner,
  AffiliateClick, InsertAffiliateClick, AffiliateCommission, InsertAffiliateCommission,
  AffiliatePayout, InsertAffiliatePayout,
  RepairOrder, InsertRepairOrder, Estimate, InsertEstimate, Appointment, InsertAppointment,
  ShopInventory, InsertShopInventory, DigitalInspection, InsertDigitalInspection,
  IntegrationCredential, InsertIntegrationCredential,
  VehicleCategory, InsertVehicleCategory, RepairGuide, InsertRepairGuide,
  GuideStep, InsertGuideStep, GuideFitment, InsertGuideFitment,
  PartTerminology, InsertPartTerminology, GuideRating, InsertGuideRating,
  GuideProgress, InsertGuideProgress,
  PriceAlert, InsertPriceAlert,
  BlockchainVerification, InsertBlockchainVerification,
  ReferralInvite, InsertReferralInvite,
  ReferralPointTransaction, InsertReferralPointTransaction,
  ReferralRedemption, InsertReferralRedemption,
  Release, InsertRelease,
  VendorReview, InsertVendorReview,
  Wishlist, InsertWishlist, WishlistItem, InsertWishlistItem,
  Project, InsertProject, ProjectPart, InsertProjectPart,
  SmsPreferences, InsertSmsPreferences
} from "@shared/schema";
import { eq, and, desc, sql, asc, ilike, or, gte, lte, inArray } from "drizzle-orm";

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
  getHallmark(id: string): Promise<Hallmark | undefined>;
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

  // Dev Tasks
  getDevTasks(): Promise<DevTask[]>;
  createDevTask(task: InsertDevTask): Promise<DevTask>;
  updateDevTask(id: string, updates: Partial<DevTask>): Promise<DevTask | undefined>;
  deleteDevTask(id: string): Promise<boolean>;

  // Integration Credentials Vault
  getIntegrationCredentials(): Promise<IntegrationCredential[]>;
  getIntegrationCredential(integrationKey: string): Promise<IntegrationCredential | undefined>;
  upsertIntegrationCredential(credential: InsertIntegrationCredential): Promise<IntegrationCredential>;
  updateIntegrationCredential(integrationKey: string, updates: Partial<IntegrationCredential>): Promise<IntegrationCredential | undefined>;
  deleteIntegrationCredential(integrationKey: string): Promise<boolean>;

  // Vehicle Sharing (Family Garage)
  getVehicleSharesByOwner(ownerId: string): Promise<VehicleShare[]>;
  getVehicleSharesWithUser(userId: string): Promise<VehicleShare[]>;
  createVehicleShare(share: InsertVehicleShare): Promise<VehicleShare>;
  acceptVehicleShare(inviteCode: string, userId: string): Promise<VehicleShare | undefined>;
  deleteVehicleShare(id: string, userId: string): Promise<boolean>;

  // Affiliate Networks
  getAffiliateNetworks(): Promise<AffiliateNetwork[]>;
  getAffiliateNetwork(id: string): Promise<AffiliateNetwork | undefined>;
  getAffiliateNetworkBySlug(slug: string): Promise<AffiliateNetwork | undefined>;
  createAffiliateNetwork(network: InsertAffiliateNetwork): Promise<AffiliateNetwork>;
  updateAffiliateNetwork(id: string, updates: Partial<AffiliateNetwork>): Promise<AffiliateNetwork | undefined>;

  // Affiliate Partners
  getAffiliatePartners(filters?: { category?: string; isActive?: boolean }): Promise<AffiliatePartner[]>;
  getAffiliatePartner(id: string): Promise<AffiliatePartner | undefined>;
  getAffiliatePartnerBySlug(slug: string): Promise<AffiliatePartner | undefined>;
  createAffiliatePartner(partner: InsertAffiliatePartner): Promise<AffiliatePartner>;
  updateAffiliatePartner(id: string, updates: Partial<AffiliatePartner>): Promise<AffiliatePartner | undefined>;

  // Affiliate Click Tracking
  trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick>;
  getAffiliateClicks(filters: { partnerId?: string; startDate?: Date; endDate?: Date }): Promise<AffiliateClick[]>;
  getAffiliateClickStats(partnerId?: string): Promise<{ totalClicks: number; uniqueUsers: number }>;

  // Affiliate Commissions
  createAffiliateCommission(commission: InsertAffiliateCommission): Promise<AffiliateCommission>;
  getAffiliateCommissions(filters: { partnerId?: string; status?: string }): Promise<AffiliateCommission[]>;
  updateCommissionStatus(id: string, status: string): Promise<AffiliateCommission | undefined>;
  getCommissionSummary(): Promise<{ pending: string; approved: string; paid: string }>;

  // Affiliate Payouts
  createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout>;
  getAffiliatePayouts(): Promise<AffiliatePayout[]>;

  // Mechanics Garage - Repair Orders
  getRepairOrders(shopId: string): Promise<RepairOrder[]>;
  getRepairOrder(id: string): Promise<RepairOrder | undefined>;
  getRepairOrderCount(shopId: string): Promise<number>;
  createRepairOrder(order: InsertRepairOrder): Promise<RepairOrder>;
  updateRepairOrder(id: string, updates: Partial<RepairOrder>): Promise<RepairOrder | undefined>;

  // Mechanics Garage - Estimates
  getEstimates(shopId: string): Promise<Estimate[]>;
  getEstimate(id: string): Promise<Estimate | undefined>;
  getEstimateCount(shopId: string): Promise<number>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: string, updates: Partial<Estimate>): Promise<Estimate | undefined>;

  // Mechanics Garage - Appointments
  getAppointments(shopId: string): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentCount(shopId: string): Promise<number>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined>;

  // Mechanics Garage - Inventory
  getShopInventory(shopId: string): Promise<ShopInventory[]>;

  // Mechanics Garage - Digital Inspections
  getDigitalInspections(shopId: string): Promise<DigitalInspection[]>;

  // DIY Repair Guides - Vehicle Categories
  getVehicleCategories(): Promise<VehicleCategory[]>;
  getVehicleCategory(id: string): Promise<VehicleCategory | undefined>;
  getVehicleCategoryBySlug(slug: string): Promise<VehicleCategory | undefined>;
  createVehicleCategory(category: InsertVehicleCategory): Promise<VehicleCategory>;
  
  // DIY Repair Guides - Guides
  getRepairGuides(filters?: { 
    category?: string; 
    difficulty?: string; 
    vehicleCategorySlug?: string;
    systemType?: string;
    status?: string;
    search?: string;
  }): Promise<RepairGuide[]>;
  getRepairGuide(id: string): Promise<RepairGuide | undefined>;
  getRepairGuideBySlug(slug: string): Promise<RepairGuide | undefined>;
  getRepairGuidesForVehicle(vehicleId: string): Promise<RepairGuide[]>;
  createRepairGuide(guide: InsertRepairGuide): Promise<RepairGuide>;
  updateRepairGuide(id: string, updates: Partial<RepairGuide>): Promise<RepairGuide | undefined>;
  incrementGuideViewCount(id: string): Promise<void>;
  
  // DIY Repair Guides - Steps
  getGuideSteps(guideId: string): Promise<GuideStep[]>;
  getGuideStepCount(guideId: string): Promise<number>;
  getMultipleGuideStepCounts(guideIds: string[]): Promise<Map<string, number>>;
  createGuideStep(step: InsertGuideStep): Promise<GuideStep>;
  updateGuideStep(id: string, updates: Partial<GuideStep>): Promise<GuideStep | undefined>;
  
  // DIY Repair Guides - Fitment
  getGuideFitment(guideId: string): Promise<GuideFitment[]>;
  createGuideFitment(fitment: InsertGuideFitment): Promise<GuideFitment>;
  
  // DIY Repair Guides - Terminology
  getPartTerminology(): Promise<PartTerminology[]>;
  searchTerminology(term: string): Promise<PartTerminology[]>;
  createPartTerminology(term: InsertPartTerminology): Promise<PartTerminology>;
  
  // DIY Repair Guides - Ratings
  createGuideRating(rating: InsertGuideRating): Promise<GuideRating>;
  getGuideRatings(guideId: string): Promise<GuideRating[]>;
  
  // DIY Repair Guides - Progress
  getGuideProgress(userId: string, guideId: string): Promise<GuideProgress | undefined>;
  upsertGuideProgress(progress: InsertGuideProgress): Promise<GuideProgress>;
  getUserGuideHistory(userId: string): Promise<GuideProgress[]>;
  
  // Price Alerts (Pro Feature)
  getPriceAlertsByUser(userId: string): Promise<PriceAlert[]>;
  getPriceAlert(id: string): Promise<PriceAlert | undefined>;
  getActivePriceAlerts(): Promise<PriceAlert[]>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert | undefined>;
  deletePriceAlert(id: string): Promise<boolean>;
  
  // Blockchain Verifications (Solana)
  getBlockchainVerification(id: string): Promise<BlockchainVerification | undefined>;
  getBlockchainVerificationsByEntity(entityType: string, entityId: string): Promise<BlockchainVerification[]>;
  getBlockchainVerificationsByUser(userId: string): Promise<BlockchainVerification[]>;
  getAllBlockchainVerifications(): Promise<BlockchainVerification[]>;
  getLatestVerification(entityType: string, entityId: string): Promise<BlockchainVerification | undefined>;
  createBlockchainVerification(verification: InsertBlockchainVerification): Promise<BlockchainVerification>;
  updateBlockchainVerification(id: string, updates: Partial<BlockchainVerification>): Promise<BlockchainVerification | undefined>;
  getPendingVerifications(): Promise<BlockchainVerification[]>;

  // Referral System
  getUserByReferralCode(code: string): Promise<User | undefined>;
  generateReferralCode(userId: string): Promise<string>;
  getReferralSummary(userId: string): Promise<{
    referralCode: string;
    pointsBalance: number;
    totalInvites: number;
    signedUp: number;
    convertedToPro: number;
  }>;
  getReferralInvites(userId: string): Promise<ReferralInvite[]>;
  getPointTransactions(userId: string): Promise<ReferralPointTransaction[]>;
  awardReferralPoints(userId: string, amount: number, type: string, description: string, inviteId?: string): Promise<ReferralPointTransaction>;
  createReferralInvite(invite: InsertReferralInvite): Promise<ReferralInvite>;
  updateReferralInvite(id: string, updates: Partial<ReferralInvite>): Promise<ReferralInvite | undefined>;
  createRedemption(redemption: InsertReferralRedemption): Promise<ReferralRedemption>;
  redeemPoints(userId: string, rewardType: 'pro_month' | 'pro_year' | 'pro_lifetime'): Promise<ReferralRedemption>;
  getRedemptions(userId: string): Promise<ReferralRedemption[]>;

  // Release Version Control
  getReleases(filters?: { status?: string }): Promise<Release[]>;
  getRelease(id: string): Promise<Release | undefined>;
  getReleaseByVersion(version: string): Promise<Release | undefined>;
  getLatestRelease(): Promise<Release | undefined>;
  getNextVersionNumber(): Promise<number>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined>;
  publishRelease(id: string): Promise<Release | undefined>;
  deleteRelease(id: string): Promise<boolean>;
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
  async getHallmark(id: string): Promise<Hallmark | undefined> {
    const [hallmark] = await db.select().from(hallmarks).where(eq(hallmarks.id, id));
    return hallmark;
  }
  
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

  // Dev Tasks
  async getDevTasks(): Promise<DevTask[]> {
    return await db.select().from(devTasks).orderBy(asc(devTasks.category), asc(devTasks.sortOrder));
  }

  async createDevTask(task: InsertDevTask): Promise<DevTask> {
    const [newTask] = await db.insert(devTasks).values(task).returning();
    return newTask;
  }

  async updateDevTask(id: string, updates: Partial<DevTask>): Promise<DevTask | undefined> {
    const [task] = await db.update(devTasks).set({ ...updates, updatedAt: new Date() }).where(eq(devTasks.id, id)).returning();
    return task;
  }

  async deleteDevTask(id: string): Promise<boolean> {
    const result = await db.delete(devTasks).where(eq(devTasks.id, id));
    return true;
  }

  // Integration Credentials Vault
  async getIntegrationCredentials(): Promise<IntegrationCredential[]> {
    return await db.select().from(integrationCredentials).orderBy(asc(integrationCredentials.category), asc(integrationCredentials.integrationKey));
  }

  async getIntegrationCredential(integrationKey: string): Promise<IntegrationCredential | undefined> {
    const [credential] = await db.select().from(integrationCredentials).where(eq(integrationCredentials.integrationKey, integrationKey));
    return credential;
  }

  async upsertIntegrationCredential(credential: InsertIntegrationCredential): Promise<IntegrationCredential> {
    const existing = await this.getIntegrationCredential(credential.integrationKey);
    if (existing) {
      const [updated] = await db.update(integrationCredentials)
        .set({ ...credential, updatedAt: new Date() })
        .where(eq(integrationCredentials.integrationKey, credential.integrationKey))
        .returning();
      return updated;
    }
    const [newCred] = await db.insert(integrationCredentials).values(credential).returning();
    return newCred;
  }

  async updateIntegrationCredential(integrationKey: string, updates: Partial<IntegrationCredential>): Promise<IntegrationCredential | undefined> {
    const [credential] = await db.update(integrationCredentials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrationCredentials.integrationKey, integrationKey))
      .returning();
    return credential;
  }

  async deleteIntegrationCredential(integrationKey: string): Promise<boolean> {
    await db.delete(integrationCredentials).where(eq(integrationCredentials.integrationKey, integrationKey));
    return true;
  }

  // Vehicle Sharing (Family Garage)
  async getVehicleSharesByOwner(ownerId: string): Promise<VehicleShare[]> {
    return await db.select().from(vehicleShares)
      .where(eq(vehicleShares.ownerId, ownerId))
      .orderBy(desc(vehicleShares.createdAt));
  }

  async getVehicleSharesWithUser(userId: string): Promise<VehicleShare[]> {
    return await db.select().from(vehicleShares)
      .where(eq(vehicleShares.sharedWithId, userId))
      .orderBy(desc(vehicleShares.createdAt));
  }

  async createVehicleShare(share: InsertVehicleShare): Promise<VehicleShare> {
    const [newShare] = await db.insert(vehicleShares).values(share).returning();
    return newShare;
  }

  async acceptVehicleShare(inviteCode: string, userId: string): Promise<VehicleShare | undefined> {
    const [share] = await db.select().from(vehicleShares)
      .where(and(
        eq(vehicleShares.inviteCode, inviteCode),
        gte(vehicleShares.inviteExpiresAt, new Date())
      ));
    
    if (!share) return undefined;
    
    const [updated] = await db.update(vehicleShares)
      .set({ 
        sharedWithId: userId, 
        acceptedAt: new Date() 
      })
      .where(eq(vehicleShares.id, share.id))
      .returning();
    
    return updated;
  }

  async deleteVehicleShare(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(vehicleShares)
      .where(and(
        eq(vehicleShares.id, id),
        eq(vehicleShares.ownerId, userId)
      ));
    return true;
  }

  // ============================================
  // AFFILIATE TRACKING SYSTEM
  // ============================================

  // Affiliate Networks
  async getAffiliateNetworks(): Promise<AffiliateNetwork[]> {
    return await db.select().from(affiliateNetworks).orderBy(asc(affiliateNetworks.name));
  }

  async getAffiliateNetwork(id: string): Promise<AffiliateNetwork | undefined> {
    const [network] = await db.select().from(affiliateNetworks).where(eq(affiliateNetworks.id, id));
    return network;
  }

  async getAffiliateNetworkBySlug(slug: string): Promise<AffiliateNetwork | undefined> {
    const [network] = await db.select().from(affiliateNetworks).where(eq(affiliateNetworks.slug, slug));
    return network;
  }

  async createAffiliateNetwork(network: InsertAffiliateNetwork): Promise<AffiliateNetwork> {
    const [newNetwork] = await db.insert(affiliateNetworks).values(network).returning();
    return newNetwork;
  }

  async updateAffiliateNetwork(id: string, updates: Partial<AffiliateNetwork>): Promise<AffiliateNetwork | undefined> {
    const [network] = await db.update(affiliateNetworks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affiliateNetworks.id, id))
      .returning();
    return network;
  }

  // Affiliate Partners
  async getAffiliatePartners(filters?: { category?: string; isActive?: boolean }): Promise<AffiliatePartner[]> {
    let query = db.select().from(affiliatePartners);
    
    if (filters?.category) {
      query = query.where(eq(affiliatePartners.category, filters.category)) as any;
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(affiliatePartners.isActive, filters.isActive)) as any;
    }
    
    return await query.orderBy(desc(affiliatePartners.priority), asc(affiliatePartners.name));
  }

  async getAffiliatePartner(id: string): Promise<AffiliatePartner | undefined> {
    const [partner] = await db.select().from(affiliatePartners).where(eq(affiliatePartners.id, id));
    return partner;
  }

  async getAffiliatePartnerBySlug(slug: string): Promise<AffiliatePartner | undefined> {
    const [partner] = await db.select().from(affiliatePartners).where(eq(affiliatePartners.slug, slug));
    return partner;
  }

  async createAffiliatePartner(partner: InsertAffiliatePartner): Promise<AffiliatePartner> {
    const [newPartner] = await db.insert(affiliatePartners).values(partner).returning();
    return newPartner;
  }

  async updateAffiliatePartner(id: string, updates: Partial<AffiliatePartner>): Promise<AffiliatePartner | undefined> {
    const [partner] = await db.update(affiliatePartners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affiliatePartners.id, id))
      .returning();
    return partner;
  }

  // Affiliate Click Tracking
  async trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick> {
    const [newClick] = await db.insert(affiliateClicks).values(click).returning();
    return newClick;
  }

  async getAffiliateClicks(filters: { partnerId?: string; startDate?: Date; endDate?: Date }): Promise<AffiliateClick[]> {
    let conditions = [];
    
    if (filters.partnerId) {
      conditions.push(eq(affiliateClicks.partnerId, filters.partnerId));
    }
    if (filters.startDate) {
      conditions.push(gte(affiliateClicks.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(affiliateClicks.createdAt, filters.endDate));
    }

    if (conditions.length === 0) {
      return await db.select().from(affiliateClicks).orderBy(desc(affiliateClicks.createdAt)).limit(1000);
    }

    return await db.select().from(affiliateClicks)
      .where(and(...conditions))
      .orderBy(desc(affiliateClicks.createdAt))
      .limit(1000);
  }

  async getAffiliateClickStats(partnerId?: string): Promise<{ totalClicks: number; uniqueUsers: number }> {
    const baseQuery = partnerId 
      ? db.select().from(affiliateClicks).where(eq(affiliateClicks.partnerId, partnerId))
      : db.select().from(affiliateClicks);
    
    const clicks = await baseQuery;
    const uniqueUserIds = new Set(clicks.filter(c => c.userId).map(c => c.userId));
    
    return {
      totalClicks: clicks.length,
      uniqueUsers: uniqueUserIds.size
    };
  }

  // Affiliate Commissions
  async createAffiliateCommission(commission: InsertAffiliateCommission): Promise<AffiliateCommission> {
    const [newCommission] = await db.insert(affiliateCommissions).values(commission).returning();
    return newCommission;
  }

  async getAffiliateCommissions(filters: { partnerId?: string; status?: string }): Promise<AffiliateCommission[]> {
    let conditions = [];
    
    if (filters.partnerId) {
      conditions.push(eq(affiliateCommissions.partnerId, filters.partnerId));
    }
    if (filters.status) {
      conditions.push(eq(affiliateCommissions.status, filters.status));
    }

    if (conditions.length === 0) {
      return await db.select().from(affiliateCommissions).orderBy(desc(affiliateCommissions.createdAt));
    }

    return await db.select().from(affiliateCommissions)
      .where(and(...conditions))
      .orderBy(desc(affiliateCommissions.createdAt));
  }

  async updateCommissionStatus(id: string, status: string): Promise<AffiliateCommission | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === 'approved') updates.approvedAt = new Date();
    if (status === 'paid') updates.paidAt = new Date();
    
    const [commission] = await db.update(affiliateCommissions)
      .set(updates)
      .where(eq(affiliateCommissions.id, id))
      .returning();
    return commission;
  }

  async getCommissionSummary(): Promise<{ pending: string; approved: string; paid: string }> {
    const allCommissions = await db.select().from(affiliateCommissions);
    
    const pending = allCommissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || '0'), 0);
    
    const approved = allCommissions
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || '0'), 0);
    
    const paid = allCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || '0'), 0);
    
    return {
      pending: pending.toFixed(2),
      approved: approved.toFixed(2),
      paid: paid.toFixed(2)
    };
  }

  // Affiliate Payouts
  async createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout> {
    const [newPayout] = await db.insert(affiliatePayouts).values(payout).returning();
    return newPayout;
  }

  async getAffiliatePayouts(): Promise<AffiliatePayout[]> {
    return await db.select().from(affiliatePayouts).orderBy(desc(affiliatePayouts.periodEnd));
  }

  // ============================================
  // MECHANICS GARAGE - REPAIR ORDERS
  // ============================================
  
  async getRepairOrders(shopId: string): Promise<RepairOrder[]> {
    return await db.select().from(repairOrders)
      .where(eq(repairOrders.shopId, shopId))
      .orderBy(desc(repairOrders.createdAt));
  }

  async getRepairOrder(id: string): Promise<RepairOrder | undefined> {
    const [order] = await db.select().from(repairOrders).where(eq(repairOrders.id, id));
    return order;
  }

  async getRepairOrderCount(shopId: string): Promise<number> {
    const orders = await db.select().from(repairOrders).where(eq(repairOrders.shopId, shopId));
    return orders.length;
  }

  async createRepairOrder(order: InsertRepairOrder): Promise<RepairOrder> {
    const [newOrder] = await db.insert(repairOrders).values(order).returning();
    return newOrder;
  }

  async updateRepairOrder(id: string, updates: Partial<RepairOrder>): Promise<RepairOrder | undefined> {
    const [order] = await db.update(repairOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(repairOrders.id, id))
      .returning();
    return order;
  }

  // ============================================
  // MECHANICS GARAGE - ESTIMATES
  // ============================================
  
  async getEstimates(shopId: string): Promise<Estimate[]> {
    return await db.select().from(estimates)
      .where(eq(estimates.shopId, shopId))
      .orderBy(desc(estimates.createdAt));
  }

  async getEstimate(id: string): Promise<Estimate | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    return estimate;
  }

  async getEstimateCount(shopId: string): Promise<number> {
    const ests = await db.select().from(estimates).where(eq(estimates.shopId, shopId));
    return ests.length;
  }

  async createEstimate(estimate: InsertEstimate): Promise<Estimate> {
    const [newEstimate] = await db.insert(estimates).values(estimate).returning();
    return newEstimate;
  }

  async updateEstimate(id: string, updates: Partial<Estimate>): Promise<Estimate | undefined> {
    const [estimate] = await db.update(estimates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(estimates.id, id))
      .returning();
    return estimate;
  }

  // ============================================
  // MECHANICS GARAGE - APPOINTMENTS
  // ============================================
  
  async getAppointments(shopId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.shopId, shopId))
      .orderBy(asc(appointments.scheduledStart));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [apt] = await db.select().from(appointments).where(eq(appointments.id, id));
    return apt;
  }

  async getAppointmentCount(shopId: string): Promise<number> {
    const apts = await db.select().from(appointments).where(eq(appointments.shopId, shopId));
    return apts.length;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newApt] = await db.insert(appointments).values(appointment).returning();
    return newApt;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [apt] = await db.update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return apt;
  }

  // ============================================
  // MECHANICS GARAGE - INVENTORY
  // ============================================
  
  async getShopInventory(shopId: string): Promise<ShopInventory[]> {
    return await db.select().from(shopInventory)
      .where(eq(shopInventory.shopId, shopId))
      .orderBy(asc(shopInventory.name));
  }

  // ============================================
  // MECHANICS GARAGE - DIGITAL INSPECTIONS
  // ============================================
  
  async getDigitalInspections(shopId: string): Promise<DigitalInspection[]> {
    return await db.select().from(digitalInspections)
      .where(eq(digitalInspections.shopId, shopId))
      .orderBy(desc(digitalInspections.createdAt));
  }

  // ============================================
  // DIY REPAIR GUIDES - VEHICLE CATEGORIES
  // ============================================
  
  async getVehicleCategories(): Promise<VehicleCategory[]> {
    return await db.select().from(vehicleCategories)
      .where(eq(vehicleCategories.isActive, true))
      .orderBy(asc(vehicleCategories.sortOrder));
  }
  
  async getVehicleCategory(id: string): Promise<VehicleCategory | undefined> {
    const [category] = await db.select().from(vehicleCategories).where(eq(vehicleCategories.id, id));
    return category;
  }
  
  async getVehicleCategoryBySlug(slug: string): Promise<VehicleCategory | undefined> {
    const [category] = await db.select().from(vehicleCategories).where(eq(vehicleCategories.slug, slug));
    return category;
  }
  
  async createVehicleCategory(category: InsertVehicleCategory): Promise<VehicleCategory> {
    const [newCategory] = await db.insert(vehicleCategories).values(category).returning();
    return newCategory;
  }

  // ============================================
  // DIY REPAIR GUIDES - GUIDES
  // ============================================
  
  async getRepairGuides(filters?: { 
    category?: string; 
    difficulty?: string; 
    vehicleCategorySlug?: string;
    systemType?: string;
    status?: string;
    search?: string;
  }): Promise<RepairGuide[]> {
    let query = db.select().from(repairGuides);
    
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(repairGuides.category, filters.category));
    }
    if (filters?.difficulty) {
      conditions.push(eq(repairGuides.difficulty, filters.difficulty));
    }
    if (filters?.systemType) {
      conditions.push(eq(repairGuides.systemType, filters.systemType));
    }
    if (filters?.status) {
      conditions.push(eq(repairGuides.status, filters.status));
    } else {
      conditions.push(eq(repairGuides.status, 'published'));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(repairGuides.title, `%${filters.search}%`),
          ilike(repairGuides.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(repairGuides.viewCount));
  }
  
  async getRepairGuide(id: string): Promise<RepairGuide | undefined> {
    const [guide] = await db.select().from(repairGuides).where(eq(repairGuides.id, id));
    return guide;
  }
  
  async getRepairGuideBySlug(slug: string): Promise<RepairGuide | undefined> {
    const [guide] = await db.select().from(repairGuides).where(eq(repairGuides.slug, slug));
    return guide;
  }
  
  async getRepairGuidesForVehicle(vehicleId: string): Promise<RepairGuide[]> {
    const vehicle = await this.getVehicle(vehicleId);
    if (!vehicle) return [];
    
    const fitments = await db.select().from(guideFitment)
      .where(
        and(
          or(
            eq(guideFitment.vehicleCategorySlug, vehicle.vehicleType || 'car'),
            sql`${guideFitment.make} IS NULL`
          ),
          or(
            and(
              lte(guideFitment.yearStart, vehicle.year),
              gte(guideFitment.yearEnd, vehicle.year)
            ),
            sql`${guideFitment.yearStart} IS NULL`
          )
        )
      );
    
    const guideIds = [...new Set(fitments.map(f => f.guideId))];
    if (guideIds.length === 0) return [];
    
    return await db.select().from(repairGuides)
      .where(
        and(
          sql`${repairGuides.id} = ANY(${guideIds})`,
          eq(repairGuides.status, 'published')
        )
      )
      .orderBy(desc(repairGuides.viewCount));
  }
  
  async createRepairGuide(guide: InsertRepairGuide): Promise<RepairGuide> {
    const [newGuide] = await db.insert(repairGuides).values(guide).returning();
    return newGuide;
  }
  
  async updateRepairGuide(id: string, updates: Partial<RepairGuide>): Promise<RepairGuide | undefined> {
    const [guide] = await db.update(repairGuides)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(repairGuides.id, id))
      .returning();
    return guide;
  }
  
  async incrementGuideViewCount(id: string): Promise<void> {
    await db.update(repairGuides)
      .set({ viewCount: sql`${repairGuides.viewCount} + 1` })
      .where(eq(repairGuides.id, id));
  }

  // ============================================
  // DIY REPAIR GUIDES - STEPS
  // ============================================
  
  async getGuideSteps(guideId: string): Promise<GuideStep[]> {
    return await db.select().from(guideSteps)
      .where(eq(guideSteps.guideId, guideId))
      .orderBy(asc(guideSteps.stepNumber));
  }
  
  async getGuideStepCount(guideId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)::int` })
      .from(guideSteps)
      .where(eq(guideSteps.guideId, guideId));
    return result[0]?.count || 0;
  }
  
  async getMultipleGuideStepCounts(guideIds: string[]): Promise<Map<string, number>> {
    if (guideIds.length === 0) return new Map();
    
    const result = await db.select({
      guideId: guideSteps.guideId,
      count: sql<number>`COUNT(*)::int`
    })
      .from(guideSteps)
      .where(inArray(guideSteps.guideId, guideIds))
      .groupBy(guideSteps.guideId);
    
    const counts = new Map<string, number>();
    for (const row of result) {
      counts.set(row.guideId, row.count);
    }
    // Ensure all requested IDs have an entry (default 0)
    for (const id of guideIds) {
      if (!counts.has(id)) counts.set(id, 0);
    }
    return counts;
  }
  
  async createGuideStep(step: InsertGuideStep): Promise<GuideStep> {
    const [newStep] = await db.insert(guideSteps).values(step).returning();
    return newStep;
  }
  
  async updateGuideStep(id: string, updates: Partial<GuideStep>): Promise<GuideStep | undefined> {
    const [step] = await db.update(guideSteps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(guideSteps.id, id))
      .returning();
    return step;
  }

  // ============================================
  // DIY REPAIR GUIDES - FITMENT
  // ============================================
  
  async getGuideFitment(guideId: string): Promise<GuideFitment[]> {
    return await db.select().from(guideFitment)
      .where(eq(guideFitment.guideId, guideId));
  }
  
  async createGuideFitment(fitment: InsertGuideFitment): Promise<GuideFitment> {
    const [newFitment] = await db.insert(guideFitment).values(fitment).returning();
    return newFitment;
  }

  // ============================================
  // DIY REPAIR GUIDES - TERMINOLOGY
  // ============================================
  
  async getPartTerminology(): Promise<PartTerminology[]> {
    return await db.select().from(partTerminology)
      .orderBy(asc(partTerminology.displayName));
  }
  
  async searchTerminology(term: string): Promise<PartTerminology[]> {
    return await db.select().from(partTerminology)
      .where(
        or(
          ilike(partTerminology.canonicalName, `%${term}%`),
          ilike(partTerminology.displayName, `%${term}%`),
          sql`${term} = ANY(${partTerminology.allTerms})`
        )
      );
  }
  
  async createPartTerminology(term: InsertPartTerminology): Promise<PartTerminology> {
    const [newTerm] = await db.insert(partTerminology).values(term).returning();
    return newTerm;
  }

  // ============================================
  // DIY REPAIR GUIDES - RATINGS
  // ============================================
  
  async createGuideRating(rating: InsertGuideRating): Promise<GuideRating> {
    const [newRating] = await db.insert(guideRatings).values(rating).returning();
    
    if (rating.isHelpful !== undefined) {
      if (rating.isHelpful) {
        await db.update(repairGuides)
          .set({ helpfulCount: sql`${repairGuides.helpfulCount} + 1` })
          .where(eq(repairGuides.id, rating.guideId));
      } else {
        await db.update(repairGuides)
          .set({ notHelpfulCount: sql`${repairGuides.notHelpfulCount} + 1` })
          .where(eq(repairGuides.id, rating.guideId));
      }
    }
    
    return newRating;
  }
  
  async getGuideRatings(guideId: string): Promise<GuideRating[]> {
    return await db.select().from(guideRatings)
      .where(eq(guideRatings.guideId, guideId))
      .orderBy(desc(guideRatings.createdAt));
  }

  // ============================================
  // DIY REPAIR GUIDES - PROGRESS
  // ============================================
  
  async getGuideProgress(userId: string, guideId: string): Promise<GuideProgress | undefined> {
    const [progress] = await db.select().from(guideProgress)
      .where(and(
        eq(guideProgress.userId, userId),
        eq(guideProgress.guideId, guideId)
      ));
    return progress;
  }
  
  async upsertGuideProgress(progress: InsertGuideProgress): Promise<GuideProgress> {
    const existing = await this.getGuideProgress(progress.userId, progress.guideId);
    
    if (existing) {
      const [updated] = await db.update(guideProgress)
        .set({ 
          ...progress, 
          lastAccessedAt: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(guideProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newProgress] = await db.insert(guideProgress).values(progress).returning();
    return newProgress;
  }
  
  async getUserGuideHistory(userId: string): Promise<GuideProgress[]> {
    return await db.select().from(guideProgress)
      .where(eq(guideProgress.userId, userId))
      .orderBy(desc(guideProgress.lastAccessedAt));
  }
  
  // Price Alerts (Pro Feature)
  async getPriceAlertsByUser(userId: string): Promise<PriceAlert[]> {
    return await db.select().from(priceAlerts)
      .where(eq(priceAlerts.userId, userId))
      .orderBy(desc(priceAlerts.createdAt));
  }
  
  async getPriceAlert(id: string): Promise<PriceAlert | undefined> {
    const [alert] = await db.select().from(priceAlerts).where(eq(priceAlerts.id, id));
    return alert;
  }
  
  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    return await db.select().from(priceAlerts)
      .where(eq(priceAlerts.isActive, true))
      .orderBy(desc(priceAlerts.createdAt));
  }
  
  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [newAlert] = await db.insert(priceAlerts).values(alert).returning();
    return newAlert;
  }
  
  async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert | undefined> {
    const [alert] = await db.update(priceAlerts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(priceAlerts.id, id))
      .returning();
    return alert;
  }
  
  async deletePriceAlert(id: string): Promise<boolean> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
    return true;
  }
  
  // Blockchain Verifications (Solana)
  async getBlockchainVerification(id: string): Promise<BlockchainVerification | undefined> {
    const [verification] = await db.select().from(blockchainVerifications).where(eq(blockchainVerifications.id, id));
    return verification;
  }
  
  async getBlockchainVerificationsByEntity(entityType: string, entityId: string): Promise<BlockchainVerification[]> {
    return await db.select().from(blockchainVerifications)
      .where(and(
        eq(blockchainVerifications.entityType, entityType),
        eq(blockchainVerifications.entityId, entityId)
      ))
      .orderBy(desc(blockchainVerifications.createdAt));
  }
  
  async getBlockchainVerificationsByUser(userId: string): Promise<BlockchainVerification[]> {
    return await db.select().from(blockchainVerifications)
      .where(eq(blockchainVerifications.userId, userId))
      .orderBy(desc(blockchainVerifications.createdAt));
  }
  
  async getAllBlockchainVerifications(): Promise<BlockchainVerification[]> {
    return await db.select().from(blockchainVerifications)
      .orderBy(desc(blockchainVerifications.createdAt));
  }
  
  async getLatestVerification(entityType: string, entityId: string): Promise<BlockchainVerification | undefined> {
    const [verification] = await db.select().from(blockchainVerifications)
      .where(and(
        eq(blockchainVerifications.entityType, entityType),
        eq(blockchainVerifications.entityId, entityId)
      ))
      .orderBy(desc(blockchainVerifications.createdAt))
      .limit(1);
    return verification;
  }
  
  async createBlockchainVerification(verification: InsertBlockchainVerification): Promise<BlockchainVerification> {
    const [newVerification] = await db.insert(blockchainVerifications).values(verification).returning();
    return newVerification;
  }
  
  async updateBlockchainVerification(id: string, updates: Partial<BlockchainVerification>): Promise<BlockchainVerification | undefined> {
    const [verification] = await db.update(blockchainVerifications)
      .set(updates)
      .where(eq(blockchainVerifications.id, id))
      .returning();
    return verification;
  }
  
  async getPendingVerifications(): Promise<BlockchainVerification[]> {
    return await db.select().from(blockchainVerifications)
      .where(or(
        eq(blockchainVerifications.status, 'pending'),
        eq(blockchainVerifications.status, 'submitted')
      ))
      .orderBy(asc(blockchainVerifications.createdAt));
  }

  // Referral System
  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async generateReferralCode(userId: string): Promise<string> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user?.referralCode) {
      return user.referralCode;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existing = await this.getUserByReferralCode(code);
      if (!existing) {
        await db.update(users)
          .set({ referralCode: code })
          .where(eq(users.id, userId));
        return code;
      }
      attempts++;
    }
    
    throw new Error('Failed to generate unique referral code');
  }

  async getReferralSummary(userId: string): Promise<{
    referralCode: string;
    pointsBalance: number;
    totalInvites: number;
    signedUp: number;
    convertedToPro: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user?.referralCode) {
      const code = await this.generateReferralCode(userId);
      user.referralCode = code;
    }

    const invites = await db.select().from(referralInvites)
      .where(eq(referralInvites.referrerId, userId));
    
    const signedUp = invites.filter(i => i.status === 'signed_up' || i.status === 'converted_pro').length;
    const convertedToPro = invites.filter(i => i.status === 'converted_pro').length;

    return {
      referralCode: user?.referralCode || '',
      pointsBalance: user?.referralPointsBalance || 0,
      totalInvites: invites.length,
      signedUp,
      convertedToPro
    };
  }

  async getReferralInvites(userId: string): Promise<ReferralInvite[]> {
    return await db.select().from(referralInvites)
      .where(eq(referralInvites.referrerId, userId))
      .orderBy(desc(referralInvites.createdAt));
  }

  async getPointTransactions(userId: string): Promise<ReferralPointTransaction[]> {
    return await db.select().from(referralPointTransactions)
      .where(eq(referralPointTransactions.userId, userId))
      .orderBy(desc(referralPointTransactions.createdAt));
  }

  async awardReferralPoints(
    userId: string, 
    amount: number, 
    type: string, 
    description: string, 
    inviteId?: string
  ): Promise<ReferralPointTransaction> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const currentBalance = user?.referralPointsBalance || 0;
    const newBalance = currentBalance + amount;

    await db.update(users)
      .set({ referralPointsBalance: newBalance })
      .where(eq(users.id, userId));

    const [transaction] = await db.insert(referralPointTransactions).values({
      userId,
      amount,
      type,
      description,
      referralInviteId: inviteId || null,
      balanceAfter: newBalance
    }).returning();

    return transaction;
  }

  async createReferralInvite(invite: InsertReferralInvite): Promise<ReferralInvite> {
    const [newInvite] = await db.insert(referralInvites).values(invite).returning();
    return newInvite;
  }

  async updateReferralInvite(id: string, updates: Partial<ReferralInvite>): Promise<ReferralInvite | undefined> {
    const [invite] = await db.update(referralInvites)
      .set(updates)
      .where(eq(referralInvites.id, id))
      .returning();
    return invite;
  }

  async createRedemption(redemption: InsertReferralRedemption): Promise<ReferralRedemption> {
    const [newRedemption] = await db.insert(referralRedemptions).values(redemption).returning();
    return newRedemption;
  }

  async redeemPoints(userId: string, rewardType: 'pro_month' | 'pro_year' | 'pro_lifetime'): Promise<ReferralRedemption> {
    const pointsCosts = {
      'pro_month': 500,
      'pro_year': 1000,
      'pro_lifetime': 2500
    };
    
    const durations = {
      'pro_month': 30,
      'pro_year': 365,
      'pro_lifetime': null
    };

    const pointsCost = pointsCosts[rewardType];
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || (user.referralPointsBalance || 0) < pointsCost) {
      throw new Error('Insufficient points');
    }

    const newBalance = (user.referralPointsBalance || 0) - pointsCost;
    
    let subscriptionExtendedTo: Date | null = null;
    if (rewardType === 'pro_lifetime') {
      subscriptionExtendedTo = new Date('2099-12-31');
    } else {
      const currentExpiry = user.subscriptionExpiresAt || new Date();
      const startDate = currentExpiry > new Date() ? currentExpiry : new Date();
      subscriptionExtendedTo = new Date(startDate);
      subscriptionExtendedTo.setDate(subscriptionExtendedTo.getDate() + durations[rewardType]!);
    }

    await db.update(users)
      .set({ 
        referralPointsBalance: newBalance,
        subscriptionTier: 'pro',
        subscriptionExpiresAt: subscriptionExtendedTo,
        isFounder: rewardType === 'pro_lifetime' ? true : user.isFounder
      })
      .where(eq(users.id, userId));

    const [redemption] = await db.insert(referralRedemptions).values({
      userId,
      rewardType,
      pointsCost,
      status: 'fulfilled',
      fulfilledAt: new Date(),
      subscriptionExtendedTo
    }).returning();

    await db.insert(referralPointTransactions).values({
      userId,
      amount: -pointsCost,
      type: 'redemption',
      description: `Redeemed for ${rewardType.replace('_', ' ')}`,
      redemptionId: redemption.id,
      balanceAfter: newBalance
    });

    return redemption;
  }

  async getRedemptions(userId: string): Promise<ReferralRedemption[]> {
    return await db.select().from(referralRedemptions)
      .where(eq(referralRedemptions.userId, userId))
      .orderBy(desc(referralRedemptions.createdAt));
  }

  // Release Version Control
  async getReleases(filters?: { status?: string }): Promise<Release[]> {
    if (filters?.status) {
      return await db.select().from(releases)
        .where(eq(releases.status, filters.status))
        .orderBy(desc(releases.versionNumber));
    }
    return await db.select().from(releases).orderBy(desc(releases.versionNumber));
  }

  async getRelease(id: string): Promise<Release | undefined> {
    const [release] = await db.select().from(releases).where(eq(releases.id, id));
    return release;
  }

  async getReleaseByVersion(version: string): Promise<Release | undefined> {
    const [release] = await db.select().from(releases).where(eq(releases.version, version));
    return release;
  }

  async getLatestRelease(): Promise<Release | undefined> {
    const [release] = await db.select().from(releases)
      .where(eq(releases.status, 'published'))
      .orderBy(desc(releases.versionNumber))
      .limit(1);
    return release;
  }

  async getNextVersionNumber(): Promise<number> {
    const [result] = await db.select({ 
      maxVersion: sql<number>`COALESCE(MAX(${releases.versionNumber}), 0)` 
    }).from(releases);
    return (result?.maxVersion || 0) + 1;
  }

  async createRelease(release: InsertRelease): Promise<Release> {
    const [newRelease] = await db.insert(releases).values(release).returning();
    return newRelease;
  }

  async updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined> {
    const [release] = await db.update(releases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(releases.id, id))
      .returning();
    return release;
  }

  async publishRelease(id: string): Promise<Release | undefined> {
    const [release] = await db.update(releases)
      .set({ 
        status: 'published', 
        publishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(releases.id, id))
      .returning();
    return release;
  }

  async deleteRelease(id: string): Promise<boolean> {
    const result = await db.delete(releases).where(eq(releases.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ============================================
  // COMMUNITY FEATURES - Reviews, Wishlists, Projects
  // ============================================

  // Vendor Reviews
  async getVendorReviews(vendorId: string): Promise<VendorReview[]> {
    return await db.select().from(vendorReviews)
      .where(eq(vendorReviews.vendorId, vendorId))
      .orderBy(desc(vendorReviews.createdAt));
  }

  async createVendorReview(review: InsertVendorReview): Promise<VendorReview> {
    const [newReview] = await db.insert(vendorReviews).values(review).returning();
    return newReview;
  }

  // Wishlists
  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.updatedAt));
  }

  async getWishlistById(id: string): Promise<{ wishlist: Wishlist; items: WishlistItem[] } | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));
    if (!wishlist) return undefined;
    const items = await db.select().from(wishlistItems).where(eq(wishlistItems.wishlistId, id));
    return { wishlist, items };
  }

  async getWishlistByShareCode(shareCode: string): Promise<{ wishlist: Wishlist; items: WishlistItem[] } | undefined> {
    const [wishlist] = await db.select().from(wishlists)
      .where(and(eq(wishlists.shareCode, shareCode), eq(wishlists.isPublic, true)));
    if (!wishlist) return undefined;
    const items = await db.select().from(wishlistItems).where(eq(wishlistItems.wishlistId, wishlist.id));
    return { wishlist, items };
  }

  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlist;
  }

  async incrementWishlistViews(id: string): Promise<void> {
    await db.update(wishlists)
      .set({ viewCount: sql`${wishlists.viewCount} + 1` })
      .where(eq(wishlists.id, id));
  }

  async addWishlistItem(item: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db.insert(wishlistItems).values(item).returning();
    return newItem;
  }

  async deleteWishlistItem(id: string): Promise<boolean> {
    const result = await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Projects
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProjectById(id: string): Promise<{ project: Project; parts: ProjectPart[] } | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) return undefined;
    const parts = await db.select().from(projectParts).where(eq(projectParts.projectId, id));
    return { project, parts };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async addProjectPart(part: InsertProjectPart): Promise<ProjectPart> {
    const [newPart] = await db.insert(projectParts).values(part).returning();
    return newPart;
  }

  async updateProjectPart(id: string, updates: Partial<ProjectPart>): Promise<ProjectPart | undefined> {
    const [part] = await db.update(projectParts)
      .set(updates)
      .where(eq(projectParts.id, id))
      .returning();
    return part;
  }

  async deleteProjectPart(id: string): Promise<boolean> {
    const result = await db.delete(projectParts).where(eq(projectParts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // SMS Preferences
  async getSmsPreferences(userId: string): Promise<SmsPreferences | undefined> {
    const [prefs] = await db.select().from(smsPreferences).where(eq(smsPreferences.userId, userId));
    return prefs;
  }

  async upsertSmsPreferences(prefs: InsertSmsPreferences): Promise<SmsPreferences> {
    const existing = await this.getSmsPreferences(prefs.userId);
    if (existing) {
      const [updated] = await db.update(smsPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(smsPreferences.userId, prefs.userId))
        .returning();
      return updated;
    }
    const [newPrefs] = await db.insert(smsPreferences).values(prefs).returning();
    return newPrefs;
  }
}

export const storage = new DatabaseStorage();
