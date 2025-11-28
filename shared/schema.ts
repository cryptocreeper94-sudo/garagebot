import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session management
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users with password auth support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email"),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash"),
  quickPin: text("quick_pin"),
  recoveryCodesHash: text("recovery_codes_hash"),
  phoneVerified: boolean("phone_verified").default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  profileImageUrl: text("profile_image_url"),
  walletAddress: text("wallet_address"),
  hasGenesisBadge: boolean("has_genesis_badge").default(false),
  hallmarkAssetNumber: integer("hallmark_asset_number"),
  zipCode: text("zip_code"),
  preferredUnits: text("preferred_units").default("imperial"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  smsRemindersEnabled: boolean("sms_reminders_enabled").default(false),
  subscriptionTier: text("subscription_tier").default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  role: text("role").default("user"),
  persistenceEnabled: boolean("persistence_enabled").default(false),
  persistenceExpiresAt: timestamp("persistence_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicles with extended specs
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vin: text("vin"),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  vehicleType: text("vehicle_type").default("car"),
  engineType: text("engine_type"),
  engineSize: text("engine_size"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  bodyStyle: text("body_style"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  currentMileage: integer("current_mileage"),
  oilType: text("oil_type"),
  oilCapacity: text("oil_capacity"),
  tireSize: text("tire_size"),
  licensePlate: text("license_plate"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  isPrimary: boolean("is_primary").default(false),
  imageUrl: text("image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service records for Vehicle Passport
export const serviceRecords = pgTable("service_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  shopId: varchar("shop_id").references(() => shops.id, { onDelete: "set null" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  serviceType: text("service_type").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  mileage: integer("mileage"),
  description: text("description"),
  partsUsed: jsonb("parts_used"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  receiptImageUrl: text("receipt_image_url"),
  notes: text("notes"),
  isVerified: boolean("is_verified").default(false),
  nextServiceDue: timestamp("next_service_due"),
  nextServiceMileage: integer("next_service_mileage"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service reminders
export const serviceReminders = pgTable("service_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceType: text("service_type").notNull(),
  reminderType: text("reminder_type").notNull(),
  dueMileage: integer("due_mileage"),
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").default(false),
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mechanic shops
export const shops = pgTable("shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  services: text("services").array(),
  certifications: text("certifications").array(),
  vehicleTypes: text("vehicle_types").array(),
  hoursOfOperation: jsonb("hours_of_operation"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  tier: text("tier").default("free"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shop staff members
export const shopStaff = pgTable("shop_staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("staff"),
  permissions: text("permissions").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shop-customer connections
export const shopCustomers = pgTable("shop_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  notes: text("notes"),
  lastVisit: timestamp("last_visit"),
  visitCount: integer("visit_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shop reviews
export const shopReviews = pgTable("shop_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceRecordId: varchar("service_record_id").references(() => serviceRecords.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS message templates for shops
export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").references(() => shops.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message log for SMS/notifications
export const messageLog = pgTable("message_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").references(() => shops.id, { onDelete: "set null" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  templateId: varchar("template_id").references(() => messageTemplates.id, { onDelete: "set null" }),
  messageType: text("message_type").notNull(),
  recipient: text("recipient").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending"),
  twilioSid: text("twilio_sid"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences for weather, settings, etc.
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  weatherZipCode: text("weather_zip_code"),
  weatherUnits: text("weather_units").default("imperial"),
  weatherLayers: text("weather_layers").array(),
  dashboardLayout: jsonb("dashboard_layout"),
  theme: text("theme").default("dark"),
  language: text("language").default("en"),
  timezone: text("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit log for complete history tracking
export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  shopId: varchar("shop_id").references(() => shops.id, { onDelete: "set null" }),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  action: text("action").notNull(),
  previousData: jsonb("previous_data"),
  newData: jsonb("new_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_user").on(table.userId),
  index("IDX_audit_entity").on(table.entityType, table.entityId),
  index("IDX_audit_created").on(table.createdAt),
]);

// Vehicle recalls cache
export const vehicleRecalls = pgTable("vehicle_recalls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }),
  vin: text("vin"),
  campaignNumber: text("campaign_number").notNull(),
  manufacturer: text("manufacturer"),
  component: text("component"),
  summary: text("summary"),
  consequence: text("consequence"),
  remedy: text("remedy"),
  recallDate: timestamp("recall_date"),
  isResolved: boolean("is_resolved").default(false),
  resolvedDate: timestamp("resolved_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deals
export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  discount: text("discount").notNull(),
  vendor: text("vendor").notNull(),
  imageUrl: text("image_url"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hallmarks (Genesis NFT system) - Per Vehicle
export const hallmarks = pgTable("hallmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  assetNumber: integer("asset_number").unique(),
  tokenId: text("token_id"),
  transactionHash: text("transaction_hash"),
  walletAddress: text("wallet_address"),
  displayName: text("display_name"),
  assetType: text("asset_type").default("vehicle"),
  customImageUrl: text("custom_image_url"),
  generatedArtUrl: text("generated_art_url"),
  qrCodeData: text("qr_code_data"),
  metadata: jsonb("metadata"),
  isGenesis: boolean("is_genesis").default(true),
  stripePaymentId: text("stripe_payment_id"),
  mintPrice: decimal("mint_price", { precision: 10, scale: 2 }).default("2.00"),
  mintedAt: timestamp("minted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_hallmark_asset").on(table.assetNumber),
  index("IDX_hallmark_wallet").on(table.walletAddress),
  index("IDX_hallmark_name").on(table.displayName),
  index("IDX_hallmark_vehicle").on(table.vehicleId),
]);

// Vendors (parts retailers)
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url").notNull(),
  hasAffiliateProgram: boolean("has_affiliate_program").default(false),
  affiliateNetwork: text("affiliate_network"),
  affiliateId: text("affiliate_id"),
  affiliateLinkTemplate: text("affiliate_link_template"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  hasLocalPickup: boolean("has_local_pickup").default(false),
  vehicleTypes: text("vehicle_types").array(),
  specialties: text("specialties").array(),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Search history
export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"),
  query: text("query").notNull(),
  vehicleYear: integer("vehicle_year"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  category: text("category"),
  resultsCount: integer("results_count"),
  clickedVendor: text("clicked_vendor"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Waitlist for upcoming features
export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  feature: text("feature").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping carts
export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: varchar("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  priceId: text("price_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("usd"),
  customerEmail: text("customer_email"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  priceId: text("price_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scanner history
export const scanHistory = pgTable("scan_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  scanType: text("scan_type").notNull(),
  rawData: text("raw_data"),
  parsedData: jsonb("parsed_data"),
  actionTaken: text("action_taken"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true });
export const insertHallmarkSchema = createInsertSchema(hallmarks).omit({ id: true, mintedAt: true, updatedAt: true });

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export type InsertHallmark = z.infer<typeof insertHallmarkSchema>;
export type Hallmark = typeof hallmarks.$inferSelect;

export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({ id: true, createdAt: true });
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

export const insertCartSchema = createInsertSchema(carts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });

export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Shop types
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shops.$inferSelect;

export const insertShopStaffSchema = createInsertSchema(shopStaff).omit({ id: true, createdAt: true });
export type InsertShopStaff = z.infer<typeof insertShopStaffSchema>;
export type ShopStaff = typeof shopStaff.$inferSelect;

export const insertShopCustomerSchema = createInsertSchema(shopCustomers).omit({ id: true, createdAt: true });
export type InsertShopCustomer = z.infer<typeof insertShopCustomerSchema>;
export type ShopCustomer = typeof shopCustomers.$inferSelect;

export const insertShopReviewSchema = createInsertSchema(shopReviews).omit({ id: true, createdAt: true });
export type InsertShopReview = z.infer<typeof insertShopReviewSchema>;
export type ShopReview = typeof shopReviews.$inferSelect;

// Service record types
export const insertServiceRecordSchema = createInsertSchema(serviceRecords).omit({ id: true, createdAt: true });
export type InsertServiceRecord = z.infer<typeof insertServiceRecordSchema>;
export type ServiceRecord = typeof serviceRecords.$inferSelect;

export const insertServiceReminderSchema = createInsertSchema(serviceReminders).omit({ id: true, createdAt: true });
export type InsertServiceReminder = z.infer<typeof insertServiceReminderSchema>;
export type ServiceReminder = typeof serviceReminders.$inferSelect;

// Message types
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ id: true, createdAt: true });
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;

export const insertMessageLogSchema = createInsertSchema(messageLog).omit({ id: true, createdAt: true });
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;
export type MessageLog = typeof messageLog.$inferSelect;

// User preferences types
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Audit log types
export const insertAuditLogSchema = createInsertSchema(auditLog).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

// Recall types
export const insertVehicleRecallSchema = createInsertSchema(vehicleRecalls).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVehicleRecall = z.infer<typeof insertVehicleRecallSchema>;
export type VehicleRecall = typeof vehicleRecalls.$inferSelect;

// Scan history types
export const insertScanHistorySchema = createInsertSchema(scanHistory).omit({ id: true, createdAt: true });
export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;
export type ScanHistory = typeof scanHistory.$inferSelect;

// Dev Portal Tasks - Daily checklist for owner
export const devTasks = pgTable("dev_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"),
  status: text("status").default("pending"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  link: text("link"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDevTaskSchema = createInsertSchema(devTasks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDevTask = z.infer<typeof insertDevTaskSchema>;
export type DevTask = typeof devTasks.$inferSelect;

// Family/Trust sharing for vehicles
export const vehicleShares = pgTable("vehicle_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedWithId: varchar("shared_with_id").references(() => users.id, { onDelete: "cascade" }),
  sharedWithEmail: text("shared_with_email"),
  shareType: text("share_type").default("view"),
  inviteCode: text("invite_code"),
  inviteExpiresAt: timestamp("invite_expires_at"),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleShareSchema = createInsertSchema(vehicleShares).omit({ id: true, createdAt: true });
export type InsertVehicleShare = z.infer<typeof insertVehicleShareSchema>;
export type VehicleShare = typeof vehicleShares.$inferSelect;

// Part reviews and fitment confirmations
export const partReviews = pgTable("part_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  partNumber: text("part_number").notNull(),
  partName: text("part_name").notNull(),
  vendorSlug: text("vendor_slug"),
  rating: integer("rating").notNull(),
  fitmentConfirmed: boolean("fitment_confirmed").default(false),
  title: text("title"),
  content: text("content"),
  pros: text("pros").array(),
  cons: text("cons").array(),
  imageUrls: text("image_urls").array(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartReviewSchema = createInsertSchema(partReviews).omit({ id: true, createdAt: true });
export type InsertPartReview = z.infer<typeof insertPartReviewSchema>;
export type PartReview = typeof partReviews.$inferSelect;
