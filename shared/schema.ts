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
  isFounder: boolean("is_founder").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  role: text("role").default("user"),
  persistenceEnabled: boolean("persistence_enabled").default(false),
  persistenceExpiresAt: timestamp("persistence_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  referralCode: text("referral_code").unique(),
  referredByUserId: varchar("referred_by_user_id"),
  referralPointsBalance: integer("referral_points_balance").default(0),
  trustLayerId: text("trust_layer_id"),
  trustLayerMemberCard: text("trust_layer_member_card"),
  membershipTier: text("membership_tier").default("free"),
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
  stripeAccountId: text("stripe_account_id"),
  stripeAccountStatus: text("stripe_account_status").default("not_connected"),
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(false),
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

// Marketing Hub Subscriptions - tenant-spaced add-on for shops
export const marketingHubSubscriptions = pgTable("marketing_hub_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  tier: text("tier").default("basic"), // basic, pro, enterprise
  status: text("status").default("active"), // active, cancelled, suspended
  monthlyPrice: integer("monthly_price").default(2900), // $29/mo in cents
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shop Social Media Credentials - store encrypted per-shop
export const shopSocialCredentials = pgTable("shop_social_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // twitter, facebook, instagram, linkedin, google, nextdoor
  credentialsEncrypted: text("credentials_encrypted").notNull(), // JSON blob encrypted
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shop Marketing Content - bundles and posts specific to each shop
export const shopMarketingContent = pgTable("shop_marketing_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  type: text("type").default("post"), // post, bundle, template
  platform: text("platform"),
  content: text("content"),
  imageUrl: text("image_url"),
  hashtags: text("hashtags").array(),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  status: text("status").default("draft"), // draft, scheduled, posted, failed
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  externalPostId: text("external_post_id"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ORBIT Staffing Connections - track which shops have connected to ORBIT
export const orbitConnections = pgTable("orbit_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  status: text("status").default("active"),
  orbitTenantId: text("orbit_tenant_id"),
  connectedAt: timestamp("connected_at").defaultNow(),
  lastSyncAt: timestamp("last_sync_at"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ORBIT Employees - local cache of workers synced to ORBIT
export const orbitEmployees = pgTable("orbit_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  orbitWorkerId: text("orbit_worker_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").default("mechanic"),
  employmentType: text("employment_type").default("w2"),
  payRate: decimal("pay_rate", { precision: 10, scale: 2 }),
  payType: text("pay_type").default("hourly"),
  workState: text("work_state"),
  startDate: timestamp("start_date"),
  status: text("status").default("active"),
  certifications: text("certifications").array(),
  syncedAt: timestamp("synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ORBIT Timesheets - local record of submitted timesheets
export const orbitTimesheets = pgTable("orbit_timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  employeeId: varchar("employee_id").notNull().references(() => orbitEmployees.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  jobId: text("job_id"),
  notes: text("notes"),
  status: text("status").default("pending"),
  syncedToOrbit: boolean("synced_to_orbit").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ORBIT Payroll Runs - track payroll history
export const orbitPayrollRuns = pgTable("orbit_payroll_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  status: text("status").default("pending"),
  totalGross: decimal("total_gross", { precision: 12, scale: 2 }),
  totalNet: decimal("total_net", { precision: 12, scale: 2 }),
  totalTaxes: decimal("total_taxes", { precision: 12, scale: 2 }),
  employeeCount: integer("employee_count"),
  orbitPayrollId: text("orbit_payroll_id"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business Software Integrations - tracks per-shop OAuth connections to external services
export const businessIntegrations = pgTable("business_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  service: text("service").notNull(),
  status: text("status").default("disconnected"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  externalId: text("external_id"),
  companyName: text("company_name"),
  scopes: text("scopes"),
  config: jsonb("config"),
  lastSyncAt: timestamp("last_sync_at"),
  connectedAt: timestamp("connected_at"),
  disconnectedAt: timestamp("disconnected_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  // Vendor rewards fields
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  location: text("location"),
  description: text("description"),
  businessType: text("business_type"),
  isVerified: boolean("is_verified").default(false),
  isFeatured: boolean("is_featured").default(false),
  vendorOfMonthCount: integer("vendor_of_month_count").default(0),
  lastVendorOfMonth: timestamp("last_vendor_of_month"),
  totalReviews: integer("total_reviews").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  clickCount: integer("click_count").default(0),
  badge: text("badge"),
});

// Vendor Applications (pending approval)
export const vendorApplications = pgTable("vendor_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  businessType: text("business_type"),
  location: text("location"),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorApplicationSchema = createInsertSchema(vendorApplications).omit({ id: true, createdAt: true, status: true, reviewedBy: true, reviewedAt: true, reviewNotes: true });
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type VendorApplication = typeof vendorApplications.$inferSelect;

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

// Integration Credentials Vault - Secure storage for OAuth/API keys
export const integrationCredentials = pgTable("integration_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationKey: text("integration_key").notNull().unique(), // e.g., "quickbooks", "ukg_pro", "partstech"
  displayName: text("display_name").notNull(),
  category: text("category").notNull(), // "accounting", "payroll", "parts", "communication", etc.
  clientId: text("client_id"),
  clientSecretEncrypted: text("client_secret_encrypted"), // Server-side encrypted
  apiKeyEncrypted: text("api_key_encrypted"), // Server-side encrypted
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  accessToken: text("access_token"), // Short-lived, can store temporarily
  tokenExpiresAt: timestamp("token_expires_at"),
  webhookSecret: text("webhook_secret"),
  additionalConfig: jsonb("additional_config"), // For extra settings like scopes, endpoints
  status: text("status").default("pending"), // "pending", "configured", "active", "error", "expired"
  lastValidatedAt: timestamp("last_validated_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIntegrationCredentialSchema = createInsertSchema(integrationCredentials).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastValidatedAt: true,
  lastError: true
});
export type InsertIntegrationCredential = z.infer<typeof insertIntegrationCredentialSchema>;
export type IntegrationCredential = typeof integrationCredentials.$inferSelect;

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

// ============================================
// AFFILIATE TRACKING SYSTEM
// ============================================

// Affiliate Networks (CJ, Impact, Rakuten, Amazon Associates, etc.)
export const affiliateNetworks = pgTable("affiliate_networks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  websiteUrl: text("website_url"),
  apiEndpoint: text("api_endpoint"),
  apiKeyName: text("api_key_name"),
  trackingParamName: text("tracking_param_name").default("ref"),
  commissionType: text("commission_type").default("percentage"),
  defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }),
  paymentThreshold: decimal("payment_threshold", { precision: 10, scale: 2 }),
  paymentFrequency: text("payment_frequency"),
  contactEmail: text("contact_email"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAffiliateNetworkSchema = createInsertSchema(affiliateNetworks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAffiliateNetwork = z.infer<typeof insertAffiliateNetworkSchema>;
export type AffiliateNetwork = typeof affiliateNetworks.$inferSelect;

// Affiliate Partners (individual retailers/brands)
export const affiliatePartners = pgTable("affiliate_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  networkId: varchar("network_id").references(() => affiliateNetworks.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url").notNull(),
  affiliateUrl: text("affiliate_url"),
  affiliateId: text("affiliate_id"),
  trackingTemplate: text("tracking_template"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  commissionType: text("commission_type").default("percentage"),
  cookieDuration: integer("cookie_duration"),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
  vehicleTypes: text("vehicle_types").array(),
  partCategories: text("part_categories").array(),
  hasLocalPickup: boolean("has_local_pickup").default(false),
  hasApi: boolean("has_api").default(false),
  apiStatus: text("api_status").default("none"),
  priority: integer("priority").default(50),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAffiliatePartnerSchema = createInsertSchema(affiliatePartners).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAffiliatePartner = z.infer<typeof insertAffiliatePartnerSchema>;
export type AffiliatePartner = typeof affiliatePartners.$inferSelect;

// Affiliate Click Tracking
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id").notNull().references(() => affiliatePartners.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  productName: text("product_name"),
  productSku: text("product_sku"),
  searchQuery: text("search_query"),
  sourceUrl: text("source_url"),
  destinationUrl: text("destination_url"),
  clickContext: text("click_context"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  deviceType: text("device_type"),
  country: text("country"),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({ id: true, createdAt: true });
export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// Affiliate Commissions/Conversions
export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clickId: varchar("click_id").references(() => affiliateClicks.id, { onDelete: "set null" }),
  partnerId: varchar("partner_id").notNull().references(() => affiliatePartners.id, { onDelete: "cascade" }),
  networkId: varchar("network_id").references(() => affiliateNetworks.id, { onDelete: "set null" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  transactionId: text("transaction_id"),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"),
  productCategory: text("product_category"),
  productName: text("product_name"),
  transactionDate: timestamp("transaction_date"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  payoutBatchId: text("payout_batch_id"),
  networkReferenceId: text("network_reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAffiliateCommissionSchema = createInsertSchema(affiliateCommissions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAffiliateCommission = z.infer<typeof insertAffiliateCommissionSchema>;
export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;

// Affiliate Payouts (monthly summaries)
export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  networkId: varchar("network_id").references(() => affiliateNetworks.id, { onDelete: "set null" }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalClicks: integer("total_clicks").default(0),
  totalConversions: integer("total_conversions").default(0),
  totalOrderValue: decimal("total_order_value", { precision: 12, scale: 2 }).default("0"),
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).default("0"),
  status: text("status").default("pending"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAffiliatePayoutSchema = createInsertSchema(affiliatePayouts).omit({ id: true, createdAt: true });
export type InsertAffiliatePayout = z.infer<typeof insertAffiliatePayoutSchema>;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;

// ============================================
// MECHANICS GARAGE - SHOP MANAGEMENT SYSTEM
// ============================================

// Repair Orders (Work Orders)
export const repairOrders = pgTable("repair_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  technicianId: varchar("technician_id").references(() => users.id, { onDelete: "set null" }),
  estimateId: varchar("estimate_id"),
  orderNumber: text("order_number").notNull(),
  vehicleType: text("vehicle_type").default("car"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  vehicleInfo: text("vehicle_info"),
  vin: text("vin"),
  mileageIn: integer("mileage_in"),
  mileageOut: integer("mileage_out"),
  status: text("status").default("pending"),
  priority: text("priority").default("normal"),
  promisedDate: timestamp("promised_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  pickedUpAt: timestamp("picked_up_at"),
  laborTotal: decimal("labor_total", { precision: 10, scale: 2 }).default("0"),
  partsTotal: decimal("parts_total", { precision: 10, scale: 2 }).default("0"),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
  discountTotal: decimal("discount_total", { precision: 10, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: text("payment_status").default("unpaid"),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_repair_order_shop").on(table.shopId),
  index("IDX_repair_order_status").on(table.status),
  index("IDX_repair_order_number").on(table.orderNumber),
]);

// Repair Order Line Items (Labor and Parts)
export const repairOrderItems = pgTable("repair_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repairOrderId: varchar("repair_order_id").notNull().references(() => repairOrders.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(),
  description: text("description").notNull(),
  partNumber: text("part_number"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  laborRate: decimal("labor_rate", { precision: 10, scale: 2 }),
  taxable: boolean("taxable").default(true),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  technicianId: varchar("technician_id").references(() => users.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Estimates / Quotes
export const estimates = pgTable("estimates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  inspectionId: varchar("inspection_id"),
  estimateNumber: text("estimate_number").notNull(),
  vehicleType: text("vehicle_type").default("car"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  vehicleInfo: text("vehicle_info"),
  vin: text("vin"),
  mileage: integer("mileage"),
  status: text("status").default("draft"),
  validUntil: timestamp("valid_until"),
  laborTotal: decimal("labor_total", { precision: 10, scale: 2 }).default("0"),
  partsTotal: decimal("parts_total", { precision: 10, scale: 2 }).default("0"),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
  discountTotal: decimal("discount_total", { precision: 10, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).default("0"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
  declinedAt: timestamp("declined_at"),
  convertedToOrderId: varchar("converted_to_order_id"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Estimate Line Items
export const estimateItems = pgTable("estimate_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  estimateId: varchar("estimate_id").notNull().references(() => estimates.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(),
  description: text("description").notNull(),
  partNumber: text("part_number"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  laborRate: decimal("labor_rate", { precision: 10, scale: 2 }),
  taxable: boolean("taxable").default(true),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  isApproved: boolean("is_approved").default(false),
  isRequired: boolean("is_required").default(false),
  urgency: text("urgency").default("normal"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments / Scheduling
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  technicianId: varchar("technician_id").references(() => users.id, { onDelete: "set null" }),
  repairOrderId: varchar("repair_order_id"),
  appointmentNumber: text("appointment_number"),
  vehicleType: text("vehicle_type").default("car"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  vehicleInfo: text("vehicle_info"),
  serviceType: text("service_type"),
  description: text("description"),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end"),
  estimatedDuration: integer("estimated_duration"),
  status: text("status").default("scheduled"),
  isDropOff: boolean("is_drop_off").default(false),
  isWaiting: boolean("is_waiting").default(false),
  needsLoaner: boolean("needs_loaner").default(false),
  confirmedAt: timestamp("confirmed_at"),
  checkedInAt: timestamp("checked_in_at"),
  noShowAt: timestamp("no_show_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  reminderSentAt: timestamp("reminder_sent_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_appointment_shop_date").on(table.shopId, table.scheduledStart),
]);

// Shop Parts Inventory
export const shopInventory = pgTable("shop_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  partNumber: text("part_number").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  manufacturer: text("manufacturer"),
  location: text("location"),
  quantityOnHand: integer("quantity_on_hand").default(0),
  quantityReserved: integer("quantity_reserved").default(0),
  reorderLevel: integer("reorder_level").default(5),
  reorderQuantity: integer("reorder_quantity").default(10),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  sellPrice: decimal("sell_price", { precision: 10, scale: 2 }),
  markup: decimal("markup", { precision: 5, scale: 2 }),
  vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  vendorPartNumber: text("vendor_part_number"),
  vehicleTypes: text("vehicle_types").array(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  lastOrderedAt: timestamp("last_ordered_at"),
  lastReceivedAt: timestamp("last_received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_inventory_shop_part").on(table.shopId, table.partNumber),
]);

// Technician Time Clock Entries
export const technicianTimeEntries = pgTable("technician_time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  technicianId: varchar("technician_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  repairOrderId: varchar("repair_order_id").references(() => repairOrders.id, { onDelete: "set null" }),
  repairOrderItemId: varchar("repair_order_item_id").references(() => repairOrderItems.id, { onDelete: "set null" }),
  entryType: text("entry_type").notNull(),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  breakMinutes: integer("break_minutes").default(0),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalPay: decimal("total_pay", { precision: 10, scale: 2 }),
  status: text("status").default("active"),
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Digital Vehicle Inspections (DVI)
export const digitalInspections = pgTable("digital_inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  repairOrderId: varchar("repair_order_id").references(() => repairOrders.id, { onDelete: "set null" }),
  customerId: varchar("customer_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  technicianId: varchar("technician_id").references(() => users.id, { onDelete: "set null" }),
  inspectionNumber: text("inspection_number").notNull(),
  vehicleType: text("vehicle_type").default("car"),
  templateName: text("template_name"),
  customerName: text("customer_name"),
  vehicleInfo: text("vehicle_info"),
  vin: text("vin"),
  mileage: integer("mileage"),
  status: text("status").default("in_progress"),
  overallCondition: text("overall_condition"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedItemsCount: integer("approved_items_count").default(0),
  totalItemsCount: integer("total_items_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inspection Items (Individual checkpoints)
export const inspectionItems = pgTable("inspection_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: varchar("inspection_id").notNull().references(() => digitalInspections.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  condition: text("condition").default("good"),
  urgency: text("urgency").default("none"),
  measurement: text("measurement"),
  notes: text("notes"),
  technicianNotes: text("technician_notes"),
  imageUrls: text("image_urls").array(),
  videoUrl: text("video_url"),
  recommendedService: text("recommended_service"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  isApproved: boolean("is_approved").default(false),
  customerResponse: text("customer_response"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shop Settings
export const shopSettings = pgTable("shop_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }).unique(),
  defaultLaborRate: decimal("default_labor_rate", { precision: 10, scale: 2 }).default("100"),
  defaultPartsMarkup: decimal("default_parts_markup", { precision: 5, scale: 2 }).default("40"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  orderNumberPrefix: text("order_number_prefix").default("RO"),
  estimateNumberPrefix: text("estimate_number_prefix").default("EST"),
  appointmentNumberPrefix: text("appointment_number_prefix").default("APT"),
  inspectionNumberPrefix: text("inspection_number_prefix").default("DVI"),
  defaultPaymentTerms: text("default_payment_terms"),
  autoSendReminders: boolean("auto_send_reminders").default(true),
  reminderHoursBefore: integer("reminder_hours_before").default(24),
  stripeAccountId: text("stripe_account_id"),
  stripeEnabled: boolean("stripe_enabled").default(false),
  vehicleTypesServed: text("vehicle_types_served").array(),
  workingHours: jsonb("working_hours"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for Mechanics Garage
export const insertRepairOrderSchema = createInsertSchema(repairOrders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRepairOrder = z.infer<typeof insertRepairOrderSchema>;
export type RepairOrder = typeof repairOrders.$inferSelect;

export const insertRepairOrderItemSchema = createInsertSchema(repairOrderItems).omit({ id: true, createdAt: true });
export type InsertRepairOrderItem = z.infer<typeof insertRepairOrderItemSchema>;
export type RepairOrderItem = typeof repairOrderItems.$inferSelect;

export const insertEstimateSchema = createInsertSchema(estimates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimates.$inferSelect;

export const insertEstimateItemSchema = createInsertSchema(estimateItems).omit({ id: true, createdAt: true });
export type InsertEstimateItem = z.infer<typeof insertEstimateItemSchema>;
export type EstimateItem = typeof estimateItems.$inferSelect;

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const insertShopInventorySchema = createInsertSchema(shopInventory).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShopInventory = z.infer<typeof insertShopInventorySchema>;
export type ShopInventory = typeof shopInventory.$inferSelect;

export const insertTechnicianTimeEntrySchema = createInsertSchema(technicianTimeEntries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTechnicianTimeEntry = z.infer<typeof insertTechnicianTimeEntrySchema>;
export type TechnicianTimeEntry = typeof technicianTimeEntries.$inferSelect;

export const insertDigitalInspectionSchema = createInsertSchema(digitalInspections).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDigitalInspection = z.infer<typeof insertDigitalInspectionSchema>;
export type DigitalInspection = typeof digitalInspections.$inferSelect;

export const insertInspectionItemSchema = createInsertSchema(inspectionItems).omit({ id: true, createdAt: true });
export type InsertInspectionItem = z.infer<typeof insertInspectionItemSchema>;
export type InspectionItem = typeof inspectionItems.$inferSelect;

export const insertShopSettingsSchema = createInsertSchema(shopSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShopSettings = z.infer<typeof insertShopSettingsSchema>;
export type ShopSettings = typeof shopSettings.$inferSelect;

// ============================================
// DIY REPAIR GUIDES SYSTEM - Comprehensive Vehicle Coverage
// ============================================

// Vehicle Categories - All 12+ types supported
export const vehicleCategories = pgTable("vehicle_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  parentCategoryId: varchar("parent_category_id").references((): any => vehicleCategories.id, { onDelete: "set null" }),
  yearRangeStart: integer("year_range_start"),
  yearRangeEnd: integer("year_range_end"),
  commonSystems: text("common_systems").array(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Repair Guides - Main guide information
export const repairGuides = pgTable("repair_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  summary: text("summary"),
  
  // Categorization
  difficulty: text("difficulty").notNull().default("beginner"),
  category: text("category").notNull(),
  systemType: text("system_type"),
  repairType: text("repair_type"),
  
  // Time and cost
  estimatedTime: text("estimated_time"),
  estimatedTimeMinutes: integer("estimated_time_minutes"),
  estimatedCostMin: decimal("estimated_cost_min", { precision: 10, scale: 2 }),
  estimatedCostMax: decimal("estimated_cost_max", { precision: 10, scale: 2 }),
  laborDifficulty: integer("labor_difficulty").default(1),
  
  // Tools and parts
  toolsRequired: text("tools_required").array(),
  partsRequired: text("parts_required").array(),
  specialToolsRequired: text("special_tools_required").array(),
  consumables: text("consumables").array(),
  
  // Safety and prerequisites
  safetyWarnings: text("safety_warnings").array(),
  prerequisites: text("prerequisites").array(),
  skillsNeeded: text("skills_needed").array(),
  
  // Media
  thumbnailUrl: text("thumbnail_url"),
  headerImageUrl: text("header_image_url"),
  youtubeSearchTerm: text("youtube_search_term"),
  youtubeVideoId: text("youtube_video_id"),
  youtubePlaylistId: text("youtube_playlist_id"),
  
  // Content metadata
  contentSource: text("content_source").default("manual"),
  aiGenerated: boolean("ai_generated").default(false),
  aiPromptUsed: text("ai_prompt_used"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at"),
  
  // Stats
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  completionCount: integer("completion_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  
  // Publishing
  status: text("status").default("draft"),
  publishedAt: timestamp("published_at"),
  lastReviewedAt: timestamp("last_reviewed_at"),
  
  // Pro tier gating
  isPremium: boolean("is_premium").default(false),
  
  // Metadata
  tags: text("tags").array(),
  searchKeywords: text("search_keywords").array(),
  relatedGuideIds: text("related_guide_ids").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_guide_difficulty").on(table.difficulty),
  index("IDX_guide_category").on(table.category),
  index("IDX_guide_status").on(table.status),
  index("IDX_guide_system").on(table.systemType),
]);

// Guide Steps - Individual step-by-step instructions
export const guideSteps = pgTable("guide_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: varchar("guide_id").notNull().references(() => repairGuides.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  detailedInstructions: text("detailed_instructions"),
  
  // Media for this step
  imageUrls: text("image_urls").array(),
  videoUrl: text("video_url"),
  youtubeTimestamp: text("youtube_timestamp"),
  diagramUrl: text("diagram_url"),
  
  // Tips and warnings
  proTips: text("pro_tips").array(),
  warnings: text("warnings").array(),
  commonMistakes: text("common_mistakes").array(),
  
  // Technical specs for this step
  torqueSpecs: jsonb("torque_specs"),
  measurements: jsonb("measurements"),
  toolsForStep: text("tools_for_step").array(),
  partsForStep: text("parts_for_step").array(),
  
  // Time estimate for this specific step
  estimatedMinutes: integer("estimated_minutes"),
  
  // Conditional content
  vehicleSpecificNotes: jsonb("vehicle_specific_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_step_guide").on(table.guideId),
  index("IDX_step_order").on(table.guideId, table.stepNumber),
]);

// Guide Fitment - Links guides to compatible vehicles
export const guideFitment = pgTable("guide_fitment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: varchar("guide_id").notNull().references(() => repairGuides.id, { onDelete: "cascade" }),
  
  // Vehicle category level
  vehicleCategoryId: varchar("vehicle_category_id").references(() => vehicleCategories.id, { onDelete: "set null" }),
  vehicleCategorySlug: text("vehicle_category_slug"),
  
  // Year range
  yearStart: integer("year_start"),
  yearEnd: integer("year_end"),
  
  // Make/Model specifics (optional - for more targeted guides)
  make: text("make"),
  model: text("model"),
  trim: text("trim"),
  submodel: text("submodel"),
  
  // Engine/powertrain specifics
  engineType: text("engine_type"),
  engineSize: text("engine_size"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  
  // System tags for cross-compatibility
  systemTags: text("system_tags").array(),
  
  // Fitment notes
  fitmentNotes: text("fitment_notes"),
  excludedModels: text("excluded_models").array(),
  
  // Priority for search results
  relevanceScore: integer("relevance_score").default(50),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_fitment_guide").on(table.guideId),
  index("IDX_fitment_category").on(table.vehicleCategorySlug),
  index("IDX_fitment_make_model").on(table.make, table.model),
  index("IDX_fitment_years").on(table.yearStart, table.yearEnd),
]);

// Part Terminology - Maps equivalent part names across industries
export const partTerminology = pgTable("part_terminology", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  canonicalName: text("canonical_name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  
  // Alternative names by industry
  autoTerms: text("auto_terms").array(),
  marineTerms: text("marine_terms").array(),
  motorcycleTerms: text("motorcycle_terms").array(),
  smallEngineTerms: text("small_engine_terms").array(),
  dieselTerms: text("diesel_terms").array(),
  atvTerms: text("atv_terms").array(),
  rvTerms: text("rv_terms").array(),
  
  // All searchable terms
  allTerms: text("all_terms").array(),
  
  // Part category
  partCategory: text("part_category"),
  systemType: text("system_type"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_terminology_canonical").on(table.canonicalName),
  index("IDX_terminology_category").on(table.partCategory),
]);

// Guide Ratings - User feedback on guides
export const guideRatings = pgTable("guide_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: varchar("guide_id").notNull().references(() => repairGuides.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  
  rating: integer("rating"),
  isHelpful: boolean("is_helpful"),
  completedRepair: boolean("completed_repair").default(false),
  
  // Feedback details
  difficultyRating: integer("difficulty_rating"),
  timeAccuracyRating: integer("time_accuracy_rating"),
  clarityRating: integer("clarity_rating"),
  
  comment: text("comment"),
  suggestions: text("suggestions"),
  
  // Which vehicle they used the guide for
  vehicleYear: integer("vehicle_year"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_rating_guide").on(table.guideId),
  index("IDX_rating_user").on(table.userId),
]);

// Guide Completion Tracking - Track user progress
export const guideProgress = pgTable("guide_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: varchar("guide_id").notNull().references(() => repairGuides.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  
  currentStep: integer("current_step").default(1),
  completedSteps: integer("completed_steps").array(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  
  startedAt: timestamp("started_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  
  // Notes they took during the repair
  userNotes: text("user_notes"),
  photosUrls: text("photos_urls").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_progress_guide_user").on(table.guideId, table.userId),
  index("IDX_progress_user").on(table.userId),
]);

// Schema exports for DIY Guides
export const insertVehicleCategorySchema = createInsertSchema(vehicleCategories).omit({ id: true, createdAt: true });
export type InsertVehicleCategory = z.infer<typeof insertVehicleCategorySchema>;
export type VehicleCategory = typeof vehicleCategories.$inferSelect;

export const insertRepairGuideSchema = createInsertSchema(repairGuides).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRepairGuide = z.infer<typeof insertRepairGuideSchema>;
export type RepairGuide = typeof repairGuides.$inferSelect;

export const insertGuideStepSchema = createInsertSchema(guideSteps).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGuideStep = z.infer<typeof insertGuideStepSchema>;
export type GuideStep = typeof guideSteps.$inferSelect;

export const insertGuideFitmentSchema = createInsertSchema(guideFitment).omit({ id: true, createdAt: true });
export type InsertGuideFitment = z.infer<typeof insertGuideFitmentSchema>;
export type GuideFitment = typeof guideFitment.$inferSelect;

export const insertPartTerminologySchema = createInsertSchema(partTerminology).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPartTerminology = z.infer<typeof insertPartTerminologySchema>;
export type PartTerminology = typeof partTerminology.$inferSelect;

export const insertGuideRatingSchema = createInsertSchema(guideRatings).omit({ id: true, createdAt: true });
export type InsertGuideRating = z.infer<typeof insertGuideRatingSchema>;
export type GuideRating = typeof guideRatings.$inferSelect;

export const insertGuideProgressSchema = createInsertSchema(guideProgress).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGuideProgress = z.infer<typeof insertGuideProgressSchema>;
export type GuideProgress = typeof guideProgress.$inferSelect;

// ============================================
// PRICE DROP ALERTS (Pro Feature)
// ============================================

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  
  // Part identification
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  searchQuery: text("search_query").notNull(),
  
  // Target price
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  lastCheckedPrice: decimal("last_checked_price", { precision: 10, scale: 2 }),
  
  // Vendor preferences
  preferredVendors: text("preferred_vendors").array(),
  excludedVendors: text("excluded_vendors").array(),
  
  // Alert settings
  alertMethod: text("alert_method").default("email"),
  isActive: boolean("is_active").default(true),
  alertFrequency: text("alert_frequency").default("daily"),
  
  // Tracking
  lastCheckedAt: timestamp("last_checked_at"),
  lastAlertSentAt: timestamp("last_alert_sent_at"),
  alertCount: integer("alert_count").default(0),
  
  // When price dropped
  priceDroppedAt: timestamp("price_dropped_at"),
  droppedToPrice: decimal("dropped_to_price", { precision: 10, scale: 2 }),
  droppedAtVendor: text("dropped_at_vendor"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_price_alerts_user").on(table.userId),
  index("IDX_price_alerts_active").on(table.isActive),
]);

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

// ============================================
// BLOCKCHAIN VERIFICATIONS (Solana)
// ============================================

export const blockchainVerifications = pgTable("blockchain_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Entity being verified
  entityType: text("entity_type").notNull(), // 'hallmark' | 'vehicle'
  entityId: varchar("entity_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Verification data
  dataHash: text("data_hash").notNull(), // SHA-256 hash of the entity data
  txSignature: text("tx_signature"), // Solana transaction signature
  
  // Status tracking
  status: text("status").default("pending"), // 'pending' | 'submitted' | 'confirmed' | 'failed'
  network: text("network").default("mainnet-beta"), // 'mainnet-beta' | 'devnet'
  
  // Error handling
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Timestamps
  submittedAt: timestamp("submitted_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_blockchain_entity").on(table.entityType, table.entityId),
  index("IDX_blockchain_user").on(table.userId),
  index("IDX_blockchain_status").on(table.status),
]);

export const insertBlockchainVerificationSchema = createInsertSchema(blockchainVerifications).omit({ 
  id: true, 
  createdAt: true,
  submittedAt: true,
  confirmedAt: true,
});
export type InsertBlockchainVerification = z.infer<typeof insertBlockchainVerificationSchema>;
export type BlockchainVerification = typeof blockchainVerifications.$inferSelect;

// ============================================
// REFERRAL SYSTEM
// ============================================

// Track referral invites and conversions
export const referralInvites = pgTable("referral_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredId: varchar("referred_id").references(() => users.id, { onDelete: "set null" }),
  referralCode: text("referral_code").notNull(),
  status: text("status").default("pending"), // 'pending' | 'signed_up' | 'converted_pro'
  signedUpAt: timestamp("signed_up_at"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_referral_invites_referrer").on(table.referrerId),
  index("IDX_referral_invites_referred").on(table.referredId),
  index("IDX_referral_invites_code").on(table.referralCode),
]);

// Points transaction ledger
export const referralPointTransactions = pgTable("referral_point_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Positive for earning, negative for spending
  type: text("type").notNull(), // 'signup_bonus' | 'pro_conversion' | 'redemption'
  description: text("description"),
  referralInviteId: varchar("referral_invite_id").references(() => referralInvites.id, { onDelete: "set null" }),
  redemptionId: varchar("redemption_id"),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_point_transactions_user").on(table.userId),
  index("IDX_point_transactions_type").on(table.type),
]);

// Track point redemptions
export const referralRedemptions = pgTable("referral_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rewardType: text("reward_type").notNull(), // 'pro_month' | 'pro_year' | 'pro_lifetime'
  pointsCost: integer("points_cost").notNull(),
  status: text("status").default("pending"), // 'pending' | 'fulfilled' | 'failed'
  fulfilledAt: timestamp("fulfilled_at"),
  subscriptionExtendedTo: timestamp("subscription_extended_to"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_redemptions_user").on(table.userId),
  index("IDX_redemptions_status").on(table.status),
]);

// Schema exports for Referral System
export const insertReferralInviteSchema = createInsertSchema(referralInvites).omit({ id: true, createdAt: true });
export type InsertReferralInvite = z.infer<typeof insertReferralInviteSchema>;
export type ReferralInvite = typeof referralInvites.$inferSelect;

export const insertReferralPointTransactionSchema = createInsertSchema(referralPointTransactions).omit({ id: true, createdAt: true });
export type InsertReferralPointTransaction = z.infer<typeof insertReferralPointTransactionSchema>;
export type ReferralPointTransaction = typeof referralPointTransactions.$inferSelect;

export const insertReferralRedemptionSchema = createInsertSchema(referralRedemptions).omit({ id: true, createdAt: true });
export type InsertReferralRedemption = z.infer<typeof insertReferralRedemptionSchema>;
export type ReferralRedemption = typeof referralRedemptions.$inferSelect;

// ============================================
// GAMIFICATION & REWARDS SYSTEM
// ============================================

// User badges earned through achievements
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeType: text("badge_type").notNull(), // 'early_supporter', 'parts_hunter', 'diy_master', etc.
  badgeTier: text("badge_tier").default("bronze"), // bronze, silver, gold, platinum
  earnedAt: timestamp("earned_at").defaultNow(),
  metadata: jsonb("metadata"), // Store progress data, counts, etc.
}, (table) => [
  index("IDX_user_badges_user").on(table.userId),
  index("IDX_user_badges_type").on(table.badgeType),
]);

// Track user achievements progress
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementType: text("achievement_type").notNull(), // 'parts_searched', 'guides_completed', 'savings_total', etc.
  currentValue: integer("current_value").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  index("IDX_user_achievements_user").on(table.userId),
]);

// Monthly giveaway entries (for referral rewards)
export const giveawayEntries = pgTable("giveaway_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  giveawayMonth: text("giveaway_month").notNull(), // '2026-02', '2026-03', etc.
  entriesCount: integer("entries_count").default(1), // More referrals = more entries
  source: text("source").default("referral"), // 'referral', 'review', 'social_share'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_giveaway_user_month").on(table.userId, table.giveawayMonth),
]);

// Giveaway winners history
export const giveawayWinners = pgTable("giveaway_winners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  giveawayMonth: text("giveaway_month").notNull(),
  prize: text("prize").notNull(), // '$100 AutoZone Gift Card', '3 Months Pro', etc.
  prizeValue: integer("prize_value"), // Value in cents
  status: text("status").default("pending"), // 'pending', 'claimed', 'shipped'
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports for Gamification System
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, lastUpdated: true });
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const insertGiveawayEntrySchema = createInsertSchema(giveawayEntries).omit({ id: true, createdAt: true });
export type InsertGiveawayEntry = z.infer<typeof insertGiveawayEntrySchema>;
export type GiveawayEntry = typeof giveawayEntries.$inferSelect;

export const insertGiveawayWinnerSchema = createInsertSchema(giveawayWinners).omit({ id: true, createdAt: true });
export type InsertGiveawayWinner = z.infer<typeof insertGiveawayWinnerSchema>;
export type GiveawayWinner = typeof giveawayWinners.$inferSelect;

// ============================================
// SPONSORED PRODUCTS & AD MANAGEMENT
// ============================================

export const sponsoredProducts = pgTable("sponsored_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: text("price"),
  originalPrice: text("original_price"),
  rating: decimal("rating"),
  reviewCount: integer("review_count"),
  affiliateUrl: text("affiliate_url").notNull(),
  affiliateNetwork: text("affiliate_network"), // 'cj', 'shareasale', 'amazon', 'adsense', 'direct'
  tag: text("tag"), // 'Best Seller', 'Top Pick', etc.
  category: text("category").notNull(), // 'tools', 'safety', 'garage', 'outdoor', 'marine', 'aviation'
  vehicleTypes: text("vehicle_types").array(), // target specific vehicle types
  placement: text("placement").default("native"), // 'native', 'sidebar', 'inline', 'banner'
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(50),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_sponsored_category").on(table.category),
  index("IDX_sponsored_active").on(table.isActive),
  index("IDX_sponsored_placement").on(table.placement),
]);

export const insertSponsoredProductSchema = createInsertSchema(sponsoredProducts).omit({ id: true, impressions: true, clicks: true, createdAt: true });
export type InsertSponsoredProduct = z.infer<typeof insertSponsoredProductSchema>;
export type SponsoredProduct = typeof sponsoredProducts.$inferSelect;

// ============================================
// RELEASE VERSION CONTROL SYSTEM
// ============================================

// Track app releases with version control
export const releases = pgTable("releases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Version info
  version: text("version").notNull().unique(), // 'beta.0', 'v1.0', 'v1.1', 'v2.0', etc.
  versionType: text("version_type").notNull(), // 'beta' | 'stable' | 'hotfix' | 'major'
  versionNumber: integer("version_number").notNull(), // Sequential for ordering (1, 2, 3...)
  
  // Release details
  title: text("title"), // Optional release title/codename
  changelog: jsonb("changelog").notNull(), // Array of { category: string, changes: string[] }
  highlights: text("highlights").array(), // Key features for marketing
  
  // Status
  status: text("status").default("draft"), // 'draft' | 'published' | 'archived'
  publishedAt: timestamp("published_at"),
  
  // Blockchain verification (ties to hallmark system)
  isBlockchainVerified: boolean("is_blockchain_verified").default(false),
  blockchainVerificationId: varchar("blockchain_verification_id"),
  
  // Metadata
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"), // Internal dev notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_releases_version").on(table.version),
  index("IDX_releases_status").on(table.status),
  index("IDX_releases_published").on(table.publishedAt),
]);

// Schema exports for Release System
export const insertReleaseSchema = createInsertSchema(releases).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  publishedAt: true,
  isBlockchainVerified: true,
  blockchainVerificationId: true,
});
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;

// ============================================
// COMMUNITY FEATURES - Reviews, Wishlists, Projects
// ============================================

// Vendor Reviews - Community ratings for parts retailers
export const vendorReviews = pgTable("vendor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  shippingRating: integer("shipping_rating"),
  priceRating: integer("price_rating"),
  qualityRating: integer("quality_rating"),
  wouldRecommend: boolean("would_recommend").default(true),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_vendor_reviews_vendor").on(table.vendorId),
  index("IDX_vendor_reviews_user").on(table.userId),
  index("IDX_vendor_reviews_rating").on(table.rating),
]);

export const insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVendorReview = z.infer<typeof insertVendorReviewSchema>;
export type VendorReview = typeof vendorReviews.$inferSelect;

// Wishlists - Shareable parts lists
export const wishlists = pgTable("wishlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  shareCode: text("share_code").unique(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_wishlists_user").on(table.userId),
  index("IDX_wishlists_share").on(table.shareCode),
]);

export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wishlistId: varchar("wishlist_id").notNull().references(() => wishlists.id, { onDelete: "cascade" }),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  vendorSlug: text("vendor_slug"),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(1),
  priority: text("priority").default("medium"),
  notes: text("notes"),
  isPurchased: boolean("is_purchased").default(false),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_wishlist_items_wishlist").on(table.wishlistId),
]);

export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ id: true, createdAt: true });
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;

// Projects - Group parts by repair project
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("planning"),
  targetBudget: decimal("target_budget", { precision: 10, scale: 2 }),
  actualSpent: decimal("actual_spent", { precision: 10, scale: 2 }).default("0"),
  targetDate: timestamp("target_date"),
  completedAt: timestamp("completed_at"),
  imageUrl: text("image_url"),
  isPublic: boolean("is_public").default(false),
  shareCode: text("share_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_projects_user").on(table.userId),
  index("IDX_projects_vehicle").on(table.vehicleId),
  index("IDX_projects_status").on(table.status),
]);

export const projectParts = pgTable("project_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  vendorSlug: text("vendor_slug"),
  purchaseUrl: text("purchase_url"),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  actualPrice: decimal("actual_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(1),
  status: text("status").default("needed"),
  notes: text("notes"),
  purchasedAt: timestamp("purchased_at"),
  installedAt: timestamp("installed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_project_parts_project").on(table.projectId),
  index("IDX_project_parts_status").on(table.status),
]);

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const insertProjectPartSchema = createInsertSchema(projectParts).omit({ id: true, createdAt: true });
export type InsertProjectPart = z.infer<typeof insertProjectPartSchema>;
export type ProjectPart = typeof projectParts.$inferSelect;

// ============================================
// SMS SERVICE (Twilio - Stubbed)
// ============================================

// SMS notification preferences
export const smsPreferences = pgTable("sms_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  phoneNumber: text("phone_number"),
  isVerified: boolean("is_verified").default(false),
  verificationCode: text("verification_code"),
  verificationExpiresAt: timestamp("verification_expires_at"),
  serviceReminders: boolean("service_reminders").default(true),
  priceAlerts: boolean("price_alerts").default(true),
  orderUpdates: boolean("order_updates").default(true),
  promotions: boolean("promotions").default(false),
  quietHoursStart: text("quiet_hours_start"),
  quietHoursEnd: text("quiet_hours_end"),
  timezone: text("timezone").default("America/New_York"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_sms_prefs_user").on(table.userId),
]);

export const insertSmsPreferencesSchema = createInsertSchema(smsPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSmsPreferences = z.infer<typeof insertSmsPreferencesSchema>;
export type SmsPreferences = typeof smsPreferences.$inferSelect;

// ============================================
// ANALYTICS & SEO SYSTEM
// ============================================

// SEO settings per page/route
export const seoPages = pgTable("seo_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  route: text("route").notNull().unique(),
  title: text("title"),
  description: text("description"),
  keywords: text("keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),
  canonicalUrl: text("canonical_url"),
  robots: text("robots").default("index, follow"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_seo_pages_route").on(table.route),
]);

export const insertSeoPageSchema = createInsertSchema(seoPages).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSeoPage = z.infer<typeof insertSeoPageSchema>;
export type SeoPage = typeof seoPages.$inferSelect;

// Analytics sessions (visitor sessions)
export const analyticsSessions = pgTable("analytics_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: text("visitor_id").notNull(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  browser: text("browser"),
  os: text("os"),
  device: text("device"),
  country: text("country"),
  city: text("city"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  landingPage: text("landing_page"),
  exitPage: text("exit_page"),
  pageViewCount: integer("page_view_count").default(0),
  duration: integer("duration"),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
}, (table) => [
  index("IDX_analytics_sessions_visitor").on(table.visitorId),
  index("IDX_analytics_sessions_started").on(table.startedAt),
  index("IDX_analytics_sessions_active").on(table.isActive),
]);

export const insertAnalyticsSessionSchema = createInsertSchema(analyticsSessions).omit({ id: true, startedAt: true });
export type InsertAnalyticsSession = z.infer<typeof insertAnalyticsSessionSchema>;
export type AnalyticsSession = typeof analyticsSessions.$inferSelect;

// Analytics page views
export const analyticsPageViews = pgTable("analytics_page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => analyticsSessions.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  route: text("route").notNull(),
  title: text("title"),
  referrer: text("referrer"),
  duration: integer("duration"),
  scrollDepth: integer("scroll_depth"),
  viewedAt: timestamp("viewed_at").defaultNow(),
}, (table) => [
  index("IDX_page_views_session").on(table.sessionId),
  index("IDX_page_views_route").on(table.route),
  index("IDX_page_views_viewed").on(table.viewedAt),
]);

export const insertAnalyticsPageViewSchema = createInsertSchema(analyticsPageViews).omit({ id: true, viewedAt: true });
export type InsertAnalyticsPageView = z.infer<typeof insertAnalyticsPageViewSchema>;
export type AnalyticsPageView = typeof analyticsPageViews.$inferSelect;

// Analytics events (custom event tracking)
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => analyticsSessions.id, { onDelete: "set null" }),
  visitorId: text("visitor_id").notNull(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"),
  eventLabel: text("event_label"),
  eventValue: integer("event_value"),
  route: text("route"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_events_session").on(table.sessionId),
  index("IDX_events_name").on(table.eventName),
  index("IDX_events_created").on(table.createdAt),
]);

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, createdAt: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// Blog Posts for SEO Content
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: varchar("cover_image", { length: 500 }),
  author: varchar("author", { length: 100 }).default("Buddy AI"),
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  metaKeywords: text("meta_keywords"),
  vehicleTypes: text("vehicle_types").array().default(sql`ARRAY[]::text[]`),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  readTimeMinutes: integer("read_time_minutes").default(5),
  aiGenerated: boolean("ai_generated").default(true),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_blog_slug").on(table.slug),
  index("IDX_blog_category").on(table.category),
  index("IDX_blog_published").on(table.isPublished),
  index("IDX_blog_featured").on(table.isFeatured),
]);

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Partner API Scopes
export const PARTNER_API_SCOPES = [
  'orders:read', 'orders:write',
  'customers:read', 'customers:write',
  'appointments:read', 'appointments:write',
  'estimates:read', 'estimates:write',
  'invoices:read', 'invoices:write',
  'analytics:read',
  'shop:read', 'shop:write',
  'staff:read', 'staff:write',
] as const;

export type PartnerApiScope = typeof PARTNER_API_SCOPES[number];

// Partner API credentials for shops
export const partnerApiCredentials = pgTable("partner_api_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
  apiSecret: text("api_secret").notNull(),
  environment: varchar("environment", { length: 20 }).default("production"),
  scopes: text("scopes").array().default(sql`ARRAY['orders:read']::text[]`),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  rateLimitPerDay: integer("rate_limit_per_day").default(10000),
  requestCount: integer("request_count").default(0),
  requestCountDaily: integer("request_count_daily").default(0),
  lastResetDate: timestamp("last_reset_date"),
  lastUsedAt: timestamp("last_used_at"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_partner_credentials_shop").on(table.shopId),
  index("IDX_partner_credentials_api_key").on(table.apiKey),
]);

export const insertPartnerApiCredentialSchema = createInsertSchema(partnerApiCredentials).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPartnerApiCredential = z.infer<typeof insertPartnerApiCredentialSchema>;
export type PartnerApiCredential = typeof partnerApiCredentials.$inferSelect;

// Partner API request logs
export const partnerApiLogs = pgTable("partner_api_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  credentialId: varchar("credential_id").notNull().references(() => partnerApiCredentials.id, { onDelete: "cascade" }),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  method: varchar("method", { length: 10 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  statusCode: integer("status_code"),
  responseTimeMs: integer("response_time_ms"),
  requestBody: jsonb("request_body"),
  responseBody: jsonb("response_body"),
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_partner_logs_credential").on(table.credentialId),
  index("IDX_partner_logs_shop").on(table.shopId),
  index("IDX_partner_logs_created").on(table.createdAt),
]);

export const insertPartnerApiLogSchema = createInsertSchema(partnerApiLogs).omit({ id: true, createdAt: true });
export type InsertPartnerApiLog = z.infer<typeof insertPartnerApiLogSchema>;
export type PartnerApiLog = typeof partnerApiLogs.$inferSelect;

// Shop locations (multi-location support)
export const shopLocations = pgTable("shop_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  locationCode: varchar("location_code", { length: 20 }).notNull(),
  addressLine1: varchar("address_line1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  managerName: varchar("manager_name", { length: 100 }),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  operatingHours: jsonb("operating_hours"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  totalOrders: integer("total_orders").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_shop_locations_shop").on(table.shopId),
]);

export const insertShopLocationSchema = createInsertSchema(shopLocations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShopLocation = z.infer<typeof insertShopLocationSchema>;
export type ShopLocation = typeof shopLocations.$inferSelect;

// Marketing Posts for content library
export const marketingPosts = pgTable("marketing_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot"),
  content: text("content").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  hashtags: text("hashtags").array().default(sql`ARRAY[]::text[]`),
  targetSite: varchar("target_site", { length: 50 }).default("garagebot"),
  imageId: varchar("image_id", { length: 100 }),
  category: varchar("category", { length: 50 }),
  contentType: varchar("content_type", { length: 30 }),
  tone: varchar("tone", { length: 30 }),
  cta: varchar("cta", { length: 30 }),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_marketing_posts_platform").on(table.platform),
  index("IDX_marketing_posts_active").on(table.isActive),
  index("IDX_marketing_posts_tenant").on(table.tenantId),
]);

export const insertMarketingPostSchema = createInsertSchema(marketingPosts).omit({ id: true, createdAt: true });
export type InsertMarketingPost = z.infer<typeof insertMarketingPostSchema>;
export type MarketingPost = typeof marketingPosts.$inferSelect;

// Marketing Images library
export const marketingImages = pgTable("marketing_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot"),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }),
  subject: varchar("subject", { length: 50 }),
  style: varchar("style", { length: 50 }),
  season: varchar("season", { length: 20 }),
  quality: integer("quality").default(5),
  altText: varchar("alt_text", { length: 255 }),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_marketing_images_category").on(table.category),
  index("IDX_marketing_images_active").on(table.isActive),
  index("IDX_marketing_images_tenant").on(table.tenantId),
]);

export const insertMarketingImageSchema = createInsertSchema(marketingImages).omit({ id: true, createdAt: true });
export type InsertMarketingImage = z.infer<typeof insertMarketingImageSchema>;
export type MarketingImage = typeof marketingImages.$inferSelect;

// Social Media Integrations (Facebook/Instagram/X)
export const socialIntegrations = pgTable("social_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot").unique(),
  facebookPageId: varchar("facebook_page_id", { length: 100 }),
  facebookPageName: varchar("facebook_page_name", { length: 255 }),
  facebookPageAccessToken: text("facebook_page_access_token"),
  facebookConnected: boolean("facebook_connected").default(false),
  instagramAccountId: varchar("instagram_account_id", { length: 100 }),
  instagramUsername: varchar("instagram_username", { length: 100 }),
  instagramConnected: boolean("instagram_connected").default(false),
  twitterApiKey: varchar("twitter_api_key", { length: 255 }),
  twitterApiSecret: varchar("twitter_api_secret", { length: 255 }),
  twitterAccessToken: varchar("twitter_access_token", { length: 255 }),
  twitterAccessTokenSecret: varchar("twitter_access_token_secret", { length: 255 }),
  twitterUsername: varchar("twitter_username", { length: 100 }),
  twitterConnected: boolean("twitter_connected").default(false),
  nextdoorConnected: boolean("nextdoor_connected").default(false),
  linkedinConnected: boolean("linkedin_connected").default(false),
  googleBusinessConnected: boolean("google_business_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SocialIntegration = typeof socialIntegrations.$inferSelect;

// Scheduled/Posted Marketing entries
export const scheduledPosts = pgTable("scheduled_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot"),
  marketingPostId: varchar("marketing_post_id", { length: 100 }),
  platform: varchar("platform", { length: 20 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  postType: varchar("post_type", { length: 20 }).default("organic"),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  externalPostId: varchar("external_post_id", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  error: text("error"),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_scheduled_posts_status").on(table.status),
  index("IDX_scheduled_posts_platform").on(table.platform),
  index("IDX_scheduled_posts_tenant").on(table.tenantId),
]);

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).omit({ id: true, createdAt: true });
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;

// Content Bundles - pair images with messages for scheduled posting
export const contentBundles = pgTable("content_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot"),
  imageId: varchar("image_id", { length: 100 }),
  messageId: varchar("message_id", { length: 100 }),
  imageUrl: varchar("image_url", { length: 500 }),
  message: text("message"),
  platform: varchar("platform", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).default("suggested"),
  postType: varchar("post_type", { length: 20 }).default("organic"),
  targetAudience: varchar("target_audience", { length: 100 }),
  budgetRange: varchar("budget_range", { length: 50 }),
  ctaButton: varchar("cta_button", { length: 30 }),
  scheduledDate: timestamp("scheduled_date"),
  postedAt: timestamp("posted_at"),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  leads: integer("leads").default(0),
  conversions: integer("conversions").default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_content_bundles_tenant").on(table.tenantId),
  index("IDX_content_bundles_status").on(table.status),
  index("IDX_content_bundles_platform").on(table.platform),
]);

export const insertContentBundleSchema = createInsertSchema(contentBundles).omit({ id: true, createdAt: true });
export type InsertContentBundle = z.infer<typeof insertContentBundleSchema>;
export type ContentBundle = typeof contentBundles.$inferSelect;

// Ad Campaigns for paid advertising
export const adCampaigns = pgTable("ad_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot"),
  name: varchar("name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  objective: varchar("objective", { length: 50 }),
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  targetAudience: jsonb("target_audience"),
  adImageUrl: varchar("ad_image_url", { length: 500 }),
  adCopy: text("ad_copy"),
  ctaButton: varchar("cta_button", { length: 30 }),
  landingUrl: varchar("landing_url", { length: 500 }),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  costPerClick: decimal("cost_per_click", { precision: 10, scale: 4 }),
  costPerConversion: decimal("cost_per_conversion", { precision: 10, scale: 2 }),
  externalCampaignId: varchar("external_campaign_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ad_campaigns_tenant").on(table.tenantId),
  index("IDX_ad_campaigns_status").on(table.status),
  index("IDX_ad_campaigns_platform").on(table.platform),
]);

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type AdCampaign = typeof adCampaigns.$inferSelect;

// Marketing Message Templates (different from shop SMS templates)
export const marketingMessageTemplates = pgTable("marketing_message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id", { length: 50 }).notNull().default("garagebot"),
  content: text("content").notNull(),
  subject: varchar("subject", { length: 50 }),
  tone: varchar("tone", { length: 30 }),
  cta: varchar("cta", { length: 30 }),
  platform: varchar("platform", { length: 20 }),
  contentType: varchar("content_type", { length: 30 }),
  hashtags: text("hashtags").array().default(sql`ARRAY[]::text[]`),
  charCount: integer("char_count"),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_marketing_templates_tenant").on(table.tenantId),
  index("IDX_marketing_templates_platform").on(table.platform),
]);

export const insertMarketingMessageTemplateSchema = createInsertSchema(marketingMessageTemplates).omit({ id: true, createdAt: true });
export type InsertMarketingMessageTemplate = z.infer<typeof insertMarketingMessageTemplateSchema>;
export type MarketingMessageTemplate = typeof marketingMessageTemplates.$inferSelect;

// ========== BREAK ROOM FEATURES ==========

// Mileage Entries for gig workers / contractors
export const mileageEntries = pgTable("mileage_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  date: timestamp("date").notNull().defaultNow(),
  startOdometer: integer("start_odometer"),
  endOdometer: integer("end_odometer"),
  distance: decimal("distance", { precision: 10, scale: 2 }),
  purpose: text("purpose"),
  isBusinessTrip: boolean("is_business_trip").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_mileage_user").on(table.userId),
  index("IDX_mileage_date").on(table.date),
]);

export const insertMileageEntrySchema = createInsertSchema(mileageEntries).omit({ id: true, createdAt: true });
export type InsertMileageEntry = z.infer<typeof insertMileageEntrySchema>;
export type MileageEntry = typeof mileageEntries.$inferSelect;

// Speed Traps - Community reported
export const speedTraps = pgTable("speed_traps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  description: text("description"),
  trapType: text("trap_type").default("speed_trap"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  verifiedCount: integer("verified_count").default(1),
  reportedCount: integer("reported_count").default(1),
  isActive: boolean("is_active").default(true),
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_speed_traps_location").on(table.latitude, table.longitude),
  index("IDX_speed_traps_state").on(table.state),
  index("IDX_speed_traps_active").on(table.isActive),
]);

export const insertSpeedTrapSchema = createInsertSchema(speedTraps).omit({ id: true, createdAt: true, lastVerified: true });
export type InsertSpeedTrap = z.infer<typeof insertSpeedTrapSchema>;
export type SpeedTrap = typeof speedTraps.$inferSelect;

// Specialty Shops & Salvage Yards
export const specialtyShops = pgTable("specialty_shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  shopType: text("shop_type").notNull(),
  specialties: text("specialties").array().default(sql`ARRAY[]::text[]`),
  vehicleTypes: text("vehicle_types").array().default(sql`ARRAY[]::text[]`),
  makes: text("makes").array().default(sql`ARRAY[]::text[]`),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  website: text("website"),
  email: text("email"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").default(false),
  submittedBy: varchar("submitted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_specialty_shops_type").on(table.shopType),
  index("IDX_specialty_shops_state").on(table.state),
  index("IDX_specialty_shops_zip").on(table.zipCode),
]);

export const insertSpecialtyShopSchema = createInsertSchema(specialtyShops).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSpecialtyShop = z.infer<typeof insertSpecialtyShopSchema>;
export type SpecialtyShop = typeof specialtyShops.$inferSelect;

// Car Events & Shows
export const carEvents = pgTable("car_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(),
  vehicleCategories: text("vehicle_categories").array().default(sql`ARRAY[]::text[]`),
  description: text("description"),
  date: timestamp("date"),
  endDate: timestamp("end_date"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  website: text("website"),
  ticketUrl: text("ticket_url"),
  cost: text("cost"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false),
  submittedBy: varchar("submitted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_car_events_type").on(table.eventType),
  index("IDX_car_events_date").on(table.date),
  index("IDX_car_events_state").on(table.state),
]);

export const insertCarEventSchema = createInsertSchema(carEvents).omit({ id: true, createdAt: true });
export type InsertCarEvent = z.infer<typeof insertCarEventSchema>;
export type CarEvent = typeof carEvents.$inferSelect;

// CDL Programs & Trucking Company Directory
export const cdlPrograms = pgTable("cdl_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  programType: text("program_type").notNull(),
  category: text("category").default("trucking"),
  companyType: text("company_type").default("mega_carrier"),
  description: text("description"),
  shortDescription: text("short_description"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  payRange: text("pay_range"),
  averageCpm: text("average_cpm"),
  trainingLength: text("training_length"),
  tuitionCost: text("tuition_cost"),
  tuitionReimbursement: boolean("tuition_reimbursement").default(false),
  signOnBonus: text("sign_on_bonus"),
  referralBonus: text("referral_bonus"),
  location: text("location"),
  headquarters: text("headquarters"),
  state: text("state"),
  operatingStates: text("operating_states"),
  isNationwide: boolean("is_nationwide").default(false),
  website: text("website"),
  applyUrl: text("apply_url"),
  phone: text("phone"),
  logoUrl: text("logo_url"),
  freightTypes: text("freight_types"),
  cdlClassRequired: text("cdl_class_required").default("Class A"),
  experienceRequired: text("experience_required").default("none"),
  homeTime: text("home_time"),
  soloTeam: text("solo_team").default("both"),
  hazmatRequired: boolean("hazmat_required").default(false),
  endorsementsRequired: text("endorsements_required"),
  fleetSize: text("fleet_size"),
  yearFounded: text("year_founded"),
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  safetyRating: text("safety_rating"),
  equipmentType: text("equipment_type"),
  fuelCardProvided: boolean("fuel_card_provided").default(false),
  healthInsurance: boolean("health_insurance").default(false),
  retirementPlan: boolean("retirement_plan").default(false),
  paidTimeOff: boolean("paid_time_off").default(false),
  petPolicy: boolean("pet_policy").default(false),
  riderPolicy: boolean("rider_policy").default(false),
  tags: text("tags"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  isHiring: boolean("is_hiring").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_cdl_programs_type").on(table.programType),
  index("IDX_cdl_programs_category").on(table.category),
  index("IDX_cdl_programs_state").on(table.state),
  index("IDX_cdl_programs_active").on(table.isActive),
  index("IDX_cdl_programs_company_type").on(table.companyType),
  index("IDX_cdl_programs_experience").on(table.experienceRequired),
]);

export const insertCdlProgramSchema = createInsertSchema(cdlPrograms).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCdlProgram = z.infer<typeof insertCdlProgramSchema>;
export type CdlProgram = typeof cdlPrograms.$inferSelect;

// CDL Referrals / Interest Forms
export const cdlReferrals = pgTable("cdl_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull().references(() => cdlPrograms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  cdlClassInterest: text("cdl_class_interest"),
  experience: text("experience"),
  message: text("message"),
  status: text("status").default("submitted"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_cdl_referrals_program").on(table.programId),
  index("IDX_cdl_referrals_user").on(table.userId),
  index("IDX_cdl_referrals_status").on(table.status),
]);

export const insertCdlReferralSchema = createInsertSchema(cdlReferrals).omit({ id: true, createdAt: true });
export type InsertCdlReferral = z.infer<typeof insertCdlReferralSchema>;
export type CdlReferral = typeof cdlReferrals.$inferSelect;

// Fuel Price Reports - Community reported
export const fuelReports = pgTable("fuel_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  stationName: text("station_name").notNull(),
  stationBrand: text("station_brand"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  priceRegular: decimal("price_regular", { precision: 5, scale: 3 }),
  priceMidgrade: decimal("price_midgrade", { precision: 5, scale: 3 }),
  pricePremium: decimal("price_premium", { precision: 5, scale: 3 }),
  priceDiesel: decimal("price_diesel", { precision: 5, scale: 3 }),
  priceE85: decimal("price_e85", { precision: 5, scale: 3 }),
  reportedAt: timestamp("reported_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_fuel_reports_zip").on(table.zipCode),
  index("IDX_fuel_reports_state").on(table.state),
  index("IDX_fuel_reports_date").on(table.reportedAt),
]);

export const insertFuelReportSchema = createInsertSchema(fuelReports).omit({ id: true, createdAt: true });
export type InsertFuelReport = z.infer<typeof insertFuelReportSchema>;
export type FuelReport = typeof fuelReports.$inferSelect;

// Scanned Documents (receipts, registration, insurance, etc.)
export const scannedDocuments = pgTable("scanned_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  title: text("title"),
  extractedText: text("extracted_text"),
  extractedData: jsonb("extracted_data"),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  vendor: text("vendor"),
  date: timestamp("date"),
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_scanned_docs_user").on(table.userId),
  index("IDX_scanned_docs_type").on(table.documentType),
  index("IDX_scanned_docs_date").on(table.date),
]);

export const insertScannedDocumentSchema = createInsertSchema(scannedDocuments).omit({ id: true, createdAt: true });
export type InsertScannedDocument = z.infer<typeof insertScannedDocumentSchema>;
export type ScannedDocument = typeof scannedDocuments.$inferSelect;

// ============================================
// COMPREHENSIVE DRIVER FEATURES
// ============================================

// Warranty Management
export const warranties = pgTable("warranties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }),
  warrantyType: text("warranty_type").notNull(),
  provider: text("provider").notNull(),
  policyNumber: text("policy_number"),
  coverageDetails: text("coverage_details"),
  deductible: decimal("deductible", { precision: 10, scale: 2 }),
  maxCoverage: decimal("max_coverage", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startMileage: integer("start_mileage"),
  endMileage: integer("end_mileage"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contactWebsite: text("contact_website"),
  status: text("status").default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_warranties_user").on(table.userId),
  index("IDX_warranties_vehicle").on(table.vehicleId),
  index("IDX_warranties_status").on(table.status),
]);

export const insertWarrantySchema = createInsertSchema(warranties).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWarranty = z.infer<typeof insertWarrantySchema>;
export type Warranty = typeof warranties.$inferSelect;

// Warranty Claims
export const warrantyClaims = pgTable("warranty_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  warrantyId: varchar("warranty_id").notNull().references(() => warranties.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  claimDate: timestamp("claim_date").notNull(),
  description: text("description").notNull(),
  repairShop: text("repair_shop"),
  claimAmount: decimal("claim_amount", { precision: 10, scale: 2 }),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  status: text("status").default("submitted"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_warranty_claims_warranty").on(table.warrantyId),
]);

export const insertWarrantyClaimSchema = createInsertSchema(warrantyClaims).omit({ id: true, createdAt: true });
export type InsertWarrantyClaim = z.infer<typeof insertWarrantyClaimSchema>;
export type WarrantyClaim = typeof warrantyClaims.$inferSelect;

// Fuel Logs
export const fuelLogs = pgTable("fuel_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  fillDate: timestamp("fill_date").notNull(),
  odometer: integer("odometer").notNull(),
  gallons: decimal("gallons", { precision: 8, scale: 3 }).notNull(),
  pricePerGallon: decimal("price_per_gallon", { precision: 6, scale: 3 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  fuelType: text("fuel_type").default("regular"),
  station: text("station"),
  location: text("location"),
  fullTank: boolean("full_tank").default(true),
  missedFillUp: boolean("missed_fill_up").default(false),
  mpg: decimal("mpg", { precision: 6, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_fuel_logs_user").on(table.userId),
  index("IDX_fuel_logs_vehicle").on(table.vehicleId),
  index("IDX_fuel_logs_date").on(table.fillDate),
]);

export const insertFuelLogSchema = createInsertSchema(fuelLogs).omit({ id: true, createdAt: true });
export type InsertFuelLog = z.infer<typeof insertFuelLogSchema>;
export type FuelLog = typeof fuelLogs.$inferSelect;

// Vehicle Expenses (comprehensive cost tracking)
export const vehicleExpenses = pgTable("vehicle_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  vendor: text("vendor"),
  odometer: integer("odometer"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_vehicle_expenses_user").on(table.userId),
  index("IDX_vehicle_expenses_vehicle").on(table.vehicleId),
  index("IDX_vehicle_expenses_category").on(table.category),
  index("IDX_vehicle_expenses_date").on(table.expenseDate),
]);

export const insertVehicleExpenseSchema = createInsertSchema(vehicleExpenses).omit({ id: true, createdAt: true });
export type InsertVehicleExpense = z.infer<typeof insertVehicleExpenseSchema>;
export type VehicleExpense = typeof vehicleExpenses.$inferSelect;

// Price History (tracking price changes over time)
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id").references(() => priceAlerts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  vendorSlug: text("vendor_slug"),
  vendorName: text("vendor_name"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }),
  priceChange: decimal("price_change", { precision: 10, scale: 2 }),
  url: text("url"),
  checkedAt: timestamp("checked_at").defaultNow(),
}, (table) => [
  index("IDX_price_history_alert").on(table.alertId),
  index("IDX_price_history_user").on(table.userId),
  index("IDX_price_history_part").on(table.partName),
  index("IDX_price_history_date").on(table.checkedAt),
]);

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true });
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

// Emergency Contacts & Roadside Info
export const emergencyContacts = pgTable("emergency_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }),
  contactType: text("contact_type").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  policyNumber: text("policy_number"),
  membershipId: text("membership_id"),
  notes: text("notes"),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_emergency_contacts_user").on(table.userId),
  index("IDX_emergency_contacts_vehicle").on(table.vehicleId),
]);

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({ id: true, createdAt: true });
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

// Maintenance Schedules (predefined maintenance intervals)
export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  taskName: text("task_name").notNull(),
  intervalMiles: integer("interval_miles"),
  intervalMonths: integer("interval_months"),
  lastCompletedDate: timestamp("last_completed_date"),
  lastCompletedMileage: integer("last_completed_mileage"),
  nextDueDate: timestamp("next_due_date"),
  nextDueMileage: integer("next_due_mileage"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  priority: text("priority").default("normal"),
  status: text("status").default("upcoming"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_maint_schedules_user").on(table.userId),
  index("IDX_maint_schedules_vehicle").on(table.vehicleId),
  index("IDX_maint_schedules_due").on(table.nextDueDate),
]);

export const insertMaintenanceScheduleSchema = createInsertSchema(maintenanceSchedules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMaintenanceSchedule = z.infer<typeof insertMaintenanceScheduleSchema>;
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect;

// ============================================
// Signal Chat - Community Messaging System
// ============================================

export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("⚡"),
  imageUrl: text("image_url"),
  ownerId: text("owner_id").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(true),
  memberCount: integer("member_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityChannels = pgTable("community_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("chat"),
  position: integer("position").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityMembers = pgTable("community_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  role: text("role").notNull().default("member"),
  isOnline: boolean("is_online").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const communityMessages = pgTable("community_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull().references(() => communityChannels.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  isBot: boolean("is_bot").notNull().default(false),
  replyToId: varchar("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
});

export const communityBots = pgTable("community_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("🤖"),
  webhookUrl: text("webhook_url"),
  apiKey: text("api_key"),
  isActive: boolean("is_active").notNull().default(true),
  permissions: text("permissions").default("read,write"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageReactions = pgTable("message_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => communityMessages.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageAttachments = pgTable("message_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => communityMessages.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  filename: text("filename"),
  size: integer("size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dmConversations = pgTable("dm_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: text("participant1_id").notNull(),
  participant1Name: text("participant1_name").notNull(),
  participant2Id: text("participant2_id").notNull(),
  participant2Name: text("participant2_name").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => dmConversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  attachmentType: text("attachment_type"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPolls = pgTable("community_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull().references(() => communityChannels.id, { onDelete: "cascade" }),
  creatorId: text("creator_id").notNull(),
  creatorName: text("creator_name").notNull(),
  question: text("question").notNull(),
  options: text("options").notNull(),
  allowMultiple: boolean("allow_multiple").notNull().default(false),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pollVotes = pgTable("poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => communityPolls.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  optionIndex: integer("option_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledMessages = pgTable("scheduled_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull().references(() => communityChannels.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityRoles = pgTable("community_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#6366f1"),
  position: integer("position").notNull().default(0),
  permissions: text("permissions").notNull().default("read,write"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customEmojis = pgTable("custom_emojis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  uploaderId: text("uploader_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberNotificationSettings = pgTable("member_notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  channelId: varchar("channel_id"),
  level: text("level").notNull().default("all"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pinnedMessages = pgTable("pinned_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => communityMessages.id, { onDelete: "cascade" }),
  channelId: varchar("channel_id").notNull().references(() => communityChannels.id, { onDelete: "cascade" }),
  pinnedById: text("pinned_by_id").notNull(),
  pinnedAt: timestamp("pinned_at").defaultNow().notNull(),
});

export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentMessageId: varchar("parent_message_id").notNull().references(() => communityMessages.id, { onDelete: "cascade" }),
  channelId: varchar("channel_id").notNull().references(() => communityChannels.id, { onDelete: "cascade" }),
  replyCount: integer("reply_count").notNull().default(0),
  lastReplyAt: timestamp("last_reply_at").defaultNow(),
});

// Signal Chat Insert Schemas
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, memberCount: true, createdAt: true, updatedAt: true });
export const insertChannelSchema = createInsertSchema(communityChannels).omit({ id: true, createdAt: true });
export const insertMemberSchema = createInsertSchema(communityMembers).omit({ id: true, isOnline: true, lastSeenAt: true, joinedAt: true });
export const insertCommunityMessageSchema = createInsertSchema(communityMessages).omit({ id: true, createdAt: true, editedAt: true });
export const insertBotSchema = createInsertSchema(communityBots).omit({ id: true, createdAt: true });
export const insertReactionSchema = createInsertSchema(messageReactions).omit({ id: true, createdAt: true });
export const insertAttachmentSchema = createInsertSchema(messageAttachments).omit({ id: true, createdAt: true });
export const insertDmConversationSchema = createInsertSchema(dmConversations).omit({ id: true, lastMessageAt: true, createdAt: true });
export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ id: true, isRead: true, createdAt: true });
export const insertPollSchema = createInsertSchema(communityPolls).omit({ id: true, createdAt: true });
export const insertScheduledMessageSchema = createInsertSchema(scheduledMessages).omit({ id: true, status: true, createdAt: true });
export const insertCommunityRoleSchema = createInsertSchema(communityRoles).omit({ id: true, createdAt: true });
export const insertCustomEmojiSchema = createInsertSchema(customEmojis).omit({ id: true, createdAt: true });
export const insertPinnedMessageSchema = createInsertSchema(pinnedMessages).omit({ id: true, pinnedAt: true });
export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({ id: true, replyCount: true, lastReplyAt: true });

// Signal Chat Types
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type CommunityChannel = typeof communityChannels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type CommunityMessage = typeof communityMessages.$inferSelect;
export type InsertCommunityMessage = z.infer<typeof insertCommunityMessageSchema>;
export type CommunityBot = typeof communityBots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type DmConversation = typeof dmConversations.$inferSelect;
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type CommunityPoll = typeof communityPolls.$inferSelect;
export type PollVote = typeof pollVotes.$inferSelect;
export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type CommunityRole = typeof communityRoles.$inferSelect;
export type CustomEmoji = typeof customEmojis.$inferSelect;
export type PinnedMessage = typeof pinnedMessages.$inferSelect;
export type MessageThread = typeof messageThreads.$inferSelect;

// ============================================
// Trust Layer SSO - Shared Identity Tables
// Cross-app identity matching DarkWave Studios format
// ============================================

export const chatUsers = pgTable("chat_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  avatarColor: text("avatar_color").notNull().default("#06b6d4"),
  role: text("role").notNull().default("member"),
  trustLayerId: text("trust_layer_id").unique(),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatChannels = pgTable("chat_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().default("ecosystem"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  replyToId: varchar("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatUserSchema = createInsertSchema(chatUsers).omit({ id: true, isOnline: true, lastSeen: true, createdAt: true });
export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

export type ChatUser = typeof chatUsers.$inferSelect;
export type InsertChatUser = z.infer<typeof insertChatUserSchema>;
export type ChatChannel = typeof chatChannels.$inferSelect;
export type InsertChatChannel = z.infer<typeof insertChatChannelSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
