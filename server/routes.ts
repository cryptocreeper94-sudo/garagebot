import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import OpenAI from "openai";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { users, insertVehicleSchema, insertDealSchema, insertHallmarkSchema, insertVendorSchema, insertWaitlistSchema, insertServiceRecordSchema, insertServiceReminderSchema, insertAffiliatePartnerSchema, insertAffiliateNetworkSchema, insertAffiliateCommissionSchema, insertAffiliateClickSchema, insertPriceAlertSchema, insertSeoPageSchema, insertAnalyticsSessionSchema, insertAnalyticsPageViewSchema, insertAnalyticsEventSchema, marketingPosts, marketingImages, socialIntegrations, scheduledPosts, contentBundles, adCampaigns, marketingMessageTemplates, marketingHubSubscriptions, shopSocialCredentials, shopMarketingContent, shops, shopStaff, userBadges, userAchievements, giveawayEntries, giveawayWinners, referralInvites, sponsoredProducts, insertSponsoredProductSchema, mileageEntries, speedTraps, specialtyShops, carEvents, cdlPrograms, cdlReferrals, fuelReports, scannedDocuments, insertMileageEntrySchema, insertSpeedTrapSchema, insertSpecialtyShopSchema, insertCarEventSchema, insertCdlProgramSchema, insertCdlReferralSchema, insertFuelReportSchema, insertScannedDocumentSchema, insertWarrantySchema, insertWarrantyClaimSchema, insertFuelLogSchema, insertVehicleExpenseSchema, insertPriceHistorySchema, insertEmergencyContactSchema, insertMaintenanceScheduleSchema, orbitConnections, orbitEmployees, orbitTimesheets, orbitPayrollRuns, businessIntegrations } from "@shared/schema";
import { getAutoNewsByCategory, getNHTSARecalls, scanDocument } from "./services/breakRoomService";
import { comparePrice } from "./services/price-comparison";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { db } from "@db";
import { eq, desc, and } from "drizzle-orm";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const analyticsSessionRequestSchema = z.object({
  visitorId: z.string().min(1, "visitorId is required"),
  userAgent: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  landingPage: z.string().optional().nullable(),
});

const analyticsPageViewRequestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  visitorId: z.string().min(1, "visitorId is required"),
  route: z.string().min(1, "route is required"),
  title: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  scrollDepth: z.number().optional().nullable(),
});

const analyticsEventRequestSchema = z.object({
  sessionId: z.string().optional().nullable(),
  visitorId: z.string().min(1, "visitorId is required"),
  eventName: z.string().min(1, "eventName is required"),
  eventCategory: z.string().optional().nullable(),
  eventLabel: z.string().optional().nullable(),
  eventValue: z.number().optional().nullable(),
  route: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { nhtsaService } from "./services/nhtsa";
import { weatherService } from "./services/weather";
import * as authService from "./services/auth";
import { orbitClient } from "./services/orbitEcosystem";
import { trustLayerClient } from "./services/trustLayer";
import { sendWelcomeEmail } from "./services/emailService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth middleware
  await setupAuth(app);

  // SEO: Sitemap.xml
  app.get('/sitemap.xml', (_req, res) => {
    const baseUrl = 'https://garagebot.replit.app';
    const pages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/terms', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
      { path: '/affiliate-disclosure', priority: '0.5', changefreq: 'monthly' },
      { path: '/support', priority: '0.6', changefreq: 'monthly' },
      { path: '/blog', priority: '0.8', changefreq: 'weekly' },
      { path: '/diy-guides', priority: '0.8', changefreq: 'weekly' },
      { path: '/pro', priority: '0.7', changefreq: 'monthly' },
      { path: '/mechanics-garage', priority: '0.7', changefreq: 'monthly' },
      { path: '/mechanics-garage/info', priority: '0.6', changefreq: 'monthly' },
      { path: '/shade-tree', priority: '0.6', changefreq: 'weekly' },
      { path: '/break-room', priority: '0.6', changefreq: 'daily' },
      { path: '/hallmark', priority: '0.6', changefreq: 'monthly' },
      { path: '/investors', priority: '0.5', changefreq: 'monthly' },
      { path: '/vendor-signup', priority: '0.5', changefreq: 'monthly' },
      { path: '/insurance', priority: '0.6', changefreq: 'monthly' },
      { path: '/cdl-directory', priority: '0.5', changefreq: 'weekly' },
      { path: '/chat', priority: '0.5', changefreq: 'daily' },
    ];
    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Auth routes (Replit OIDC)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Trust Layer SSO Routes
  app.get('/api/auth/sso/login', (req, res) => {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://garagebot.io';
    const callbackUrl = `${baseUrl}/auth/callback`;
    const state = crypto.randomUUID();
    
    // Store state in session for CSRF protection
    (req.session as any).ssoState = state;
    
    const loginUrl = trustLayerClient.getLoginUrl(callbackUrl, state);
    res.json({ loginUrl, state });
  });

  app.get('/api/auth/sso/callback', async (req: any, res) => {
    const { token, state } = req.query;
    
    // Verify CSRF state
    const expectedState = (req.session as any)?.ssoState;
    if (state !== expectedState) {
      console.error('[SSO] State mismatch - possible CSRF attack');
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }
    
    try {
      const result = await trustLayerClient.verifySSOToken(token as string);
      
      if (!result.success || !result.user) {
        return res.status(401).json({ error: result.error || 'Token verification failed' });
      }
      
      // Find or create user in GarageBot
      let user = await storage.getUserByEmail(result.user.email);
      
      if (!user) {
        // Create new user from Trust Layer data
        user = await storage.upsertUser({
          id: result.user.id,
          email: result.user.email,
          username: result.user.name?.replace(/\s+/g, '_').toLowerCase() || result.user.email.split('@')[0],
          firstName: result.user.name?.split(' ')[0] || '',
          lastName: result.user.name?.split(' ').slice(1).join(' ') || '',
          membershipTier: result.user.memberTier || 'free',
          trustLayerId: result.user.id,
          trustLayerMemberCard: result.user.membershipCard,
        });
        console.log(`[SSO] Created new user from Trust Layer: ${user.email}`);
      } else {
        // Update existing user with Trust Layer data
        await storage.updateUser(user.id, {
          trustLayerId: result.user.id,
          trustLayerMemberCard: result.user.membershipCard,
          lastLoginAt: new Date(),
        });
        console.log(`[SSO] Updated existing user from Trust Layer: ${user.email}`);
      }
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).isCustomAuth = true;
      (req.session as any).ssoState = null;
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      res.json({ success: true, user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
      console.error('[SSO] Callback error:', error);
      res.status(500).json({ error: 'SSO authentication failed' });
    }
  });

  app.get('/api/auth/sso/status', (req, res) => {
    res.json({ 
      configured: trustLayerClient.isSSOConfigured(),
      baseUrl: trustLayerClient.getBaseUrl(),
    });
  });

  // Custom PIN-based Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { username, mainPin, quickPin, firstName, lastName, phone, email, address, city, state, zipCode, enablePersistence, referralCode } = req.body;
      
      // Validate username
      const usernameValidation = authService.validateUsername(username);
      if (!usernameValidation.valid) {
        return res.status(400).json({ error: usernameValidation.error });
      }
      
      // Validate main PIN (8 digits)
      const pinValidation = authService.validateMainPin(mainPin);
      if (!pinValidation.valid) {
        return res.status(400).json({ error: pinValidation.error });
      }
      
      // Validate quick PIN if provided (4 digits)
      if (quickPin) {
        const quickPinValidation = authService.validateQuickPin(quickPin);
        if (!quickPinValidation.valid) {
          return res.status(400).json({ error: quickPinValidation.error });
        }
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Validate referral code if provided
      let referrer = null;
      if (referralCode) {
        referrer = await storage.getUserByReferralCode(referralCode.toUpperCase());
        if (!referrer) {
          return res.status(400).json({ error: "Invalid referral code" });
        }
      }
      
      // Hash passwords
      const passwordHash = authService.hashPassword(mainPin);
      const quickPinHash = quickPin ? authService.hashPin(quickPin) : null;
      
      // Generate recovery codes
      const { codes, hashedCodes } = authService.generateRecoveryCodes();
      
      // Create user with referral info
      const userId = crypto.randomUUID();
      const user = await storage.upsertUser({
        id: userId,
        username,
        passwordHash,
        quickPin: quickPinHash,
        recoveryCodesHash: JSON.stringify(hashedCodes),
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        persistenceEnabled: enablePersistence || false,
        persistenceExpiresAt: enablePersistence ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        referredByUserId: referrer?.id || null,
      });
      
      // Process referral if valid
      if (referrer) {
        // Create invite record
        const invite = await storage.createReferralInvite({
          referrerId: referrer.id,
          referredId: user.id,
          referralCode: referralCode.toUpperCase(),
          status: 'signed_up',
          signedUpAt: new Date(),
        });
        
        // Award 100 points to referrer
        await storage.awardReferralPoints(
          referrer.id,
          100,
          'signup_bonus',
          `${firstName || username} signed up using your referral code`,
          invite.id
        );
      }
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).isCustomAuth = true;
      
      if (enablePersistence) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }
      
      // Send welcome email with Trust Layer membership info
      if (email) {
        sendWelcomeEmail(email, firstName || username).catch(err => {
          console.error('[Signup] Failed to send welcome email:', err);
        });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          firstName: user.firstName,
          subscriptionTier: user.subscriptionTier 
        },
        recoveryCodes: codes,
        referredBy: referrer ? (referrer.firstName || referrer.username) : null,
        message: "Account created successfully. Save your recovery codes!"
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, mainPin, enablePersistence } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid username or PIN" });
      }
      
      const valid = authService.verifyPassword(mainPin, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid username or PIN" });
      }
      
      // Update last login
      await storage.updateUser(user.id, { 
        lastLoginAt: new Date(),
        persistenceEnabled: enablePersistence || false,
        persistenceExpiresAt: enablePersistence ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      });
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).isCustomAuth = true;
      
      if (enablePersistence) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          firstName: user.firstName,
          subscriptionTier: user.subscriptionTier,
          hasQuickPin: !!user.quickPin
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post('/api/auth/quick-login', async (req, res) => {
    try {
      const { username, quickPin } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.quickPin) {
        return res.status(401).json({ error: "Quick PIN not available" });
      }
      
      const valid = authService.verifyPin(quickPin, user.quickPin);
      if (!valid) {
        return res.status(401).json({ error: "Invalid Quick PIN" });
      }
      
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).isCustomAuth = true;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          firstName: user.firstName,
          subscriptionTier: user.subscriptionTier
        }
      });
    } catch (error) {
      console.error("Quick login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          subscriptionTier: user.subscriptionTier,
          hasQuickPin: !!user.quickPin,
          hasGenesisBadge: user.hasGenesisBadge,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Failed to check auth" });
    }
  });

  app.post('/api/auth/setup-quick-pin', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { quickPin } = req.body;
      const validation = authService.validateQuickPin(quickPin);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      const quickPinHash = authService.hashPin(quickPin);
      await storage.updateUser(userId, { quickPin: quickPinHash });
      
      res.json({ success: true, message: "Quick PIN set up successfully" });
    } catch (error) {
      console.error("Quick PIN setup error:", error);
      res.status(500).json({ error: "Failed to set up Quick PIN" });
    }
  });

  app.post('/api/auth/send-recovery-sms', async (req, res) => {
    try {
      const { phone } = req.body;
      
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.json({ success: true }); // Don't reveal if phone exists
      }
      
      const code = authService.generateSmsCode();
      // Store code temporarily (in production, use Redis or similar)
      (req.session as any).recoveryCode = code;
      (req.session as any).recoveryUserId = user.id;
      (req.session as any).recoveryExpires = Date.now() + 10 * 60 * 1000; // 10 min
      
      // TODO: Send via Twilio when approved
      console.log(`Recovery code for ${phone}: ${code}`);
      
      res.json({ success: true, message: "Recovery code sent (pending Twilio)" });
    } catch (error) {
      console.error("Recovery SMS error:", error);
      res.status(500).json({ error: "Failed to send recovery code" });
    }
  });

  app.post('/api/auth/verify-recovery', async (req, res) => {
    try {
      const { code, newPin } = req.body;
      
      const storedCode = (req.session as any)?.recoveryCode;
      const userId = (req.session as any)?.recoveryUserId;
      const expires = (req.session as any)?.recoveryExpires;
      
      if (!storedCode || !userId || Date.now() > expires) {
        return res.status(400).json({ error: "Recovery code expired or invalid" });
      }
      
      if (code !== storedCode) {
        return res.status(400).json({ error: "Invalid recovery code" });
      }
      
      // Validate and set new PIN
      const validation = authService.validateMainPin(newPin);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      const passwordHash = authService.hashPassword(newPin);
      await storage.updateUser(userId, { passwordHash });
      
      // Clear recovery session
      delete (req.session as any).recoveryCode;
      delete (req.session as any).recoveryUserId;
      delete (req.session as any).recoveryExpires;
      
      res.json({ success: true, message: "PIN reset successfully" });
    } catch (error) {
      console.error("Recovery verify error:", error);
      res.status(500).json({ error: "Failed to verify recovery" });
    }
  });

  // Verify backup recovery code (the printable codes)
  app.post('/api/auth/verify-backup-code', async (req, res) => {
    try {
      const { username, code, newPin } = req.body;
      
      if (!username || !code || !newPin) {
        return res.status(400).json({ error: "Username, recovery code, and new PIN are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.recoveryCodesHash) {
        return res.status(400).json({ error: "Invalid username or no recovery codes set" });
      }
      
      const { valid, remainingHashes } = authService.verifyRecoveryCode(code, user.recoveryCodesHash);
      if (!valid) {
        return res.status(400).json({ error: "Invalid recovery code" });
      }
      
      // Validate new PIN
      const validation = authService.validateMainPin(newPin);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      // Update password and remaining recovery codes
      const passwordHash = authService.hashPassword(newPin);
      await storage.updateUser(user.id, { 
        passwordHash,
        recoveryCodesHash: JSON.stringify(remainingHashes)
      });
      
      res.json({ 
        success: true, 
        message: "PIN reset successfully",
        remainingCodes: remainingHashes.length
      });
    } catch (error) {
      console.error("Backup code verify error:", error);
      res.status(500).json({ error: "Failed to verify recovery code" });
    }
  });

  // Forgot Password - sends reset email
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: expiresAt,
      });

      const { sendPasswordResetEmail } = await import('./services/emailService');
      await sendPasswordResetEmail(email, resetToken, user.firstName || user.username || 'there');

      res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset" });
    }
  });

  // Reset Password - verify token and set new password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      const validation = authService.validateMainPin(newPassword);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const allUsers = await db.select().from(users)
        .where(eq(users.passwordResetToken, token))
        .limit(1);

      if (!allUsers.length) {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }

      const user = allUsers[0];
      if (user.passwordResetExpiresAt && new Date() > new Date(user.passwordResetExpiresAt)) {
        return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
      }

      const passwordHash = authService.hashPassword(newPassword);
      await storage.updateUser(user.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      });

      res.json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.post('/api/support/ticket', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }
      console.log('[Support] New ticket:', { name, email, subject, message: message.substring(0, 100) });
      res.json({ success: true, message: "Your support request has been submitted. We'll get back to you soon!" });
    } catch (error) {
      console.error("Support ticket error:", error);
      res.status(500).json({ error: "Failed to submit support ticket" });
    }
  });

  // AI Assistant Routes with sliding window rate limiting
  const aiAssistant = await import("./services/aiAssistant");
  
  // Sliding window rate limiter with cleanup
  interface RateLimitEntry {
    timestamps: number[];
    lastCleanup: number;
  }
  const aiRateLimiter = new Map<string, RateLimitEntry>();
  const AI_RATE_LIMIT_AUTHENTICATED = 60; // requests per window for logged in users
  const AI_RATE_LIMIT_ANONYMOUS = 15; // requests per window for anonymous users
  const AI_RATE_WINDOW = 60000; // 1 minute sliding window
  const CLEANUP_INTERVAL = 300000; // cleanup old entries every 5 minutes
  
  // Periodic cleanup of old entries to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of Array.from(aiRateLimiter.entries())) {
      if (now - entry.lastCleanup > AI_RATE_WINDOW * 2) {
        aiRateLimiter.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  
  const checkAIRateLimit = (req: any, res: any): boolean => {
    const isAuthenticated = !!req.user?.claims?.sub;
    const userId = req.user?.claims?.sub;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const identifier = userId || `ip:${ip}`;
    const limit = isAuthenticated ? AI_RATE_LIMIT_AUTHENTICATED : AI_RATE_LIMIT_ANONYMOUS;
    
    const now = Date.now();
    const windowStart = now - AI_RATE_WINDOW;
    
    let entry = aiRateLimiter.get(identifier);
    if (!entry) {
      entry = { timestamps: [], lastCleanup: now };
      aiRateLimiter.set(identifier, entry);
    }
    
    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
    entry.lastCleanup = now;
    
    if (entry.timestamps.length >= limit) {
      const oldestInWindow = Math.min(...entry.timestamps);
      const retryAfter = Math.ceil((oldestInWindow + AI_RATE_WINDOW - now) / 1000);
      res.status(429).json({ 
        error: isAuthenticated 
          ? `You've made too many requests. Please wait ${retryAfter} seconds before trying again.`
          : `Rate limit reached. Sign in for higher limits, or wait ${retryAfter} seconds.`,
        retryAfter,
        authenticated: isAuthenticated
      });
      return false;
    }
    
    entry.timestamps.push(now);
    return true;
  };
  
  app.post('/api/ai/chat', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }
      const response = await aiAssistant.chat(messages);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.post('/api/ai/parse-search', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query required" });
      }
      const result = await aiAssistant.parsePartSearch(query);
      res.json(result);
    } catch (error) {
      console.error("AI parse error:", error);
      res.status(500).json({ error: "Failed to parse search" });
    }
  });

  app.post('/api/ai/suggestions', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { partType, vehicleInfo } = req.body;
      const suggestions = await aiAssistant.getPartSuggestions(partType || "", vehicleInfo || "");
      res.json({ suggestions });
    } catch (error) {
      console.error("AI suggestions error:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  app.get('/api/ai/greeting', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const context = req.query.context as string | undefined;
      const greeting = await aiAssistant.getMascotGreeting(context);
      res.json({ greeting });
    } catch (error) {
      console.error("AI greeting error:", error);
      res.status(500).json({ error: "Failed to get greeting" });
    }
  });
  
  // AI image analysis for visual part/vehicle identification
  app.post('/api/ai/identify-image', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { imageUrl, imageBase64, context } = req.body;
      if (!imageUrl && !imageBase64) {
        return res.status(400).json({ error: "Image URL or base64 required" });
      }
      const result = await aiAssistant.identifyFromImage(imageUrl || imageBase64, context);
      res.json(result);
    } catch (error) {
      console.error("AI image identify error:", error);
      res.status(500).json({ error: "Failed to identify image" });
    }
  });

  // ============ Enhanced Buddy AI Routes ============

  // Unified chat with conversation memory
  app.post('/api/ai/buddy/chat', async (req: any, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { message, sessionId } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message required" });
      }
      
      const chatSessionId = sessionId || req.session?.id || 'anonymous';
      
      // Build user context
      let userContext: any = {};
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        const vehicles = await storage.getVehiclesByUserId(userId);
        userContext = {
          userId,
          username: user?.username || user?.firstName,
          isPro: false, // Check subscription status
          vehicles: vehicles.map(v => ({
            id: v.id,
            year: v.year?.toString(),
            make: v.make,
            model: v.model,
            mileage: v.currentMileage ?? undefined,
            nickname: v.trim ?? undefined
          }))
        };
      }
      
      const response = await aiAssistant.chatWithMemory(chatSessionId, message, userContext);
      res.json({ response, sessionId: chatSessionId });
    } catch (error) {
      console.error("Buddy chat error:", error);
      res.status(500).json({ error: "Failed to get Buddy response" });
    }
  });

  // Clear conversation history
  app.post('/api/ai/buddy/clear', async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (sessionId) {
        aiAssistant.clearConversation(sessionId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear conversation" });
    }
  });

  // Smart recommendations based on vehicle
  app.post('/api/ai/recommendations', async (req: any, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { vehicleId } = req.body;
      let vehicle = req.body.vehicle;
      
      // If vehicleId provided, fetch from DB
      if (vehicleId && req.user?.claims?.sub) {
        const dbVehicle = await storage.getVehicle(vehicleId);
        if (dbVehicle) {
          vehicle = {
            year: dbVehicle.year?.toString(),
            make: dbVehicle.make,
            model: dbVehicle.model,
            mileage: dbVehicle.currentMileage
          };
        }
      }
      
      if (!vehicle) {
        return res.status(400).json({ error: "Vehicle info required" });
      }
      
      const recommendations = await aiAssistant.getSmartRecommendations(vehicle);
      res.json(recommendations);
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Generate DIY repair guide
  app.post('/api/ai/diy-guide', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { vehicle, repairTask } = req.body;
      if (!vehicle || !repairTask) {
        return res.status(400).json({ error: "Vehicle and repair task required" });
      }
      
      const guide = await aiAssistant.generateDIYGuide(vehicle, repairTask);
      res.json(guide);
    } catch (error) {
      console.error("DIY guide error:", error);
      res.status(500).json({ error: "Failed to generate DIY guide" });
    }
  });

  // Get mechanic repair estimate
  app.post('/api/ai/mechanic-estimate', async (req, res) => {
    if (!checkAIRateLimit(req, res)) return;
    try {
      const { vehicle, repairTask, location } = req.body;
      if (!vehicle || !repairTask) {
        return res.status(400).json({ error: "Vehicle and repair task required" });
      }
      
      const estimate = await aiAssistant.getMechanicEstimate(vehicle, repairTask, location);
      res.json(estimate);
    } catch (error) {
      console.error("Estimate error:", error);
      res.status(500).json({ error: "Failed to get estimate" });
    }
  });

  // Get proactive alerts for user's vehicles
  app.get('/api/ai/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicles = await storage.getVehiclesByUserId(userId);
      
      const vehicleContexts = vehicles.map(v => ({
        id: v.id,
        year: v.year?.toString(),
        make: v.make,
        model: v.model,
        mileage: v.currentMileage ?? undefined
      }));
      
      const alerts = await aiAssistant.getProactiveAlerts(vehicleContexts);
      res.json(alerts);
    } catch (error) {
      console.error("Alerts error:", error);
      res.status(500).json({ error: "Failed to get alerts" });
    }
  });

  // Vehicles API (protected)
  app.get("/api/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertVehicleSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const vehicle = await storage.createVehicle(result.data);
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.updateVehicle(id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  app.post("/api/vehicles/:id/set-primary", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      await storage.setPrimaryVehicle(userId, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to set primary vehicle" });
    }
  });

  // VIN Decoding API (public - no auth required for lookup)
  app.get("/api/vin/decode/:vin", async (req, res) => {
    try {
      const { vin } = req.params;
      const decoded = await nhtsaService.decodeVin(vin);
      res.json(decoded);
    } catch (error) {
      console.error("VIN decode error:", error);
      res.status(500).json({ error: "Failed to decode VIN" });
    }
  });

  app.get("/api/vin/recalls/:vin", async (req, res) => {
    try {
      const { vin } = req.params;
      const recalls = await nhtsaService.getRecallsByVin(vin);
      res.json({ vin, recalls, count: recalls.length });
    } catch (error) {
      console.error("Recalls lookup error:", error);
      res.status(500).json({ error: "Failed to lookup recalls" });
    }
  });

  app.get("/api/vin/safety/:vin", async (req, res) => {
    try {
      const { vin } = req.params;
      const decoded = await nhtsaService.decodeVin(vin);
      
      if (!decoded.year || !decoded.make || !decoded.model) {
        return res.status(400).json({ error: "Could not decode VIN for safety ratings" });
      }
      
      const safety = await nhtsaService.getSafetyRating(decoded.year, decoded.make, decoded.model);
      res.json({ vin, decoded: { year: decoded.year, make: decoded.make, model: decoded.model }, safety });
    } catch (error) {
      console.error("Safety rating error:", error);
      res.status(500).json({ error: "Failed to get safety ratings" });
    }
  });

  // Vehicle lookups by year/make/model
  app.get("/api/vehicle-data/makes", async (req, res) => {
    try {
      const makes = await nhtsaService.getMakes();
      res.json(makes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get makes" });
    }
  });

  app.get("/api/vehicle-data/models/:make", async (req, res) => {
    try {
      const { make } = req.params;
      const { year } = req.query;
      const models = await nhtsaService.getModels(make, year as string);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to get models" });
    }
  });

  app.get("/api/recalls/:year/:make/:model", async (req, res) => {
    try {
      const { year, make, model } = req.params;
      const recalls = await nhtsaService.getRecalls(year, make, model);
      res.json({ year, make, model, recalls, count: recalls.length });
    } catch (error) {
      console.error("Recalls lookup error:", error);
      res.status(500).json({ error: "Failed to lookup recalls" });
    }
  });

  // Service Records API (Vehicle Passport)
  app.get("/api/vehicles/:vehicleId/service-records", isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      const records = await storage.getServiceRecordsByVehicle(vehicleId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service records" });
    }
  });

  app.post("/api/vehicles/:vehicleId/service-records", isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.claims.sub;
      const result = insertServiceRecordSchema.safeParse({ ...req.body, vehicleId, userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const record = await storage.createServiceRecord(result.data);
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service record" });
    }
  });

  // Service Reminders API
  app.get("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getServiceRemindersByUser(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertServiceReminderSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const reminder = await storage.createServiceReminder(result.data);
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ error: "Failed to create reminder" });
    }
  });

  app.patch("/api/reminders/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markReminderCompleted(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete reminder" });
    }
  });

  // Vehicle Recalls API (stored recalls from user vehicles)
  app.get("/api/vehicles/:vehicleId/recalls", isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      const vehicle = await storage.getVehicle(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Get stored recalls
      const storedRecalls = await storage.getRecallsByVehicle(vehicleId);
      
      // Also fetch fresh recalls if we have vehicle info
      let freshRecalls: any[] = [];
      if (vehicle.vin) {
        freshRecalls = await nhtsaService.getRecallsByVin(vehicle.vin);
      } else if (vehicle.year && vehicle.make && vehicle.model) {
        freshRecalls = await nhtsaService.getRecalls(String(vehicle.year), vehicle.make, vehicle.model);
      }
      
      res.json({
        storedRecalls,
        freshRecalls,
        totalCount: storedRecalls.length + freshRecalls.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recalls" });
    }
  });

  // Sync recalls to database
  app.post("/api/vehicles/:vehicleId/sync-recalls", isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      const vehicle = await storage.getVehicle(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      let recalls: any[] = [];
      if (vehicle.vin) {
        recalls = await nhtsaService.getRecallsByVin(vehicle.vin);
      } else if (vehicle.year && vehicle.make && vehicle.model) {
        recalls = await nhtsaService.getRecalls(String(vehicle.year), vehicle.make, vehicle.model);
      }
      
      // Store each recall
      const stored = [];
      for (const recall of recalls) {
        try {
          const existingRecalls = await storage.getRecallsByVehicle(vehicleId);
          const alreadyExists = existingRecalls.some(r => r.campaignNumber === recall.campaignNumber);
          
          if (!alreadyExists) {
            const storedRecall = await storage.createRecall({
              vehicleId,
              vin: vehicle.vin || null,
              campaignNumber: recall.nhtsaCampaignNumber || recall.campaignNumber,
              component: recall.component,
              summary: recall.summary,
              consequence: recall.consequence,
              remedy: recall.remedy,
              manufacturer: recall.manufacturer,
              recallDate: recall.reportReceivedDate ? new Date(recall.reportReceivedDate) : null,
            });
            stored.push(storedRecall);
          }
        } catch (err) {
          console.error("Error storing recall:", err);
        }
      }
      
      res.json({ synced: stored.length, total: recalls.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync recalls" });
    }
  });

  // Weather API (public - uses free Open-Meteo)
  app.get("/api/weather/zip/:zipCode", async (req, res) => {
    try {
      const { zipCode } = req.params;
      const weather = await weatherService.getWeatherByZip(zipCode);
      if (!weather) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(weather);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  app.get("/api/weather/city/:city", async (req, res) => {
    try {
      const { city } = req.params;
      const { state } = req.query;
      const weather = await weatherService.getWeatherByCity(city, state as string);
      if (!weather) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(weather);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  app.get("/api/weather/coords", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      const weather = await weatherService.getWeather(parseFloat(lat as string), parseFloat(lon as string));
      if (!weather) {
        return res.status(500).json({ error: "Failed to fetch weather" });
      }
      res.json(weather);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  // Weather Alerts API (NOAA - free, no API key required)
  app.get("/api/weather/alerts", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      // First get the grid point for the location
      const pointRes = await fetch(
        `https://api.weather.gov/points/${lat},${lon}`,
        { 
          headers: { 
            'User-Agent': 'GarageBot/1.0 (garagebot.io)',
            'Accept': 'application/geo+json'
          }
        }
      );
      
      if (!pointRes.ok) {
        return res.json({ alerts: [] });
      }
      
      const pointData = await pointRes.json();
      const forecastZone = pointData.properties?.forecastZone;
      const county = pointData.properties?.county;
      
      // Fetch active alerts for the area
      const alertsRes = await fetch(
        `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
        { 
          headers: { 
            'User-Agent': 'GarageBot/1.0 (garagebot.io)',
            'Accept': 'application/geo+json'
          }
        }
      );
      
      if (!alertsRes.ok) {
        return res.json({ alerts: [] });
      }
      
      const alertsData = await alertsRes.json();
      
      const alerts = (alertsData.features || []).map((feature: any) => ({
        id: feature.properties?.id || feature.id,
        event: feature.properties?.event,
        severity: feature.properties?.severity,
        headline: feature.properties?.headline,
        description: feature.properties?.description,
        instruction: feature.properties?.instruction,
        effective: feature.properties?.effective,
        expires: feature.properties?.expires,
        areaDesc: feature.properties?.areaDesc,
      }));
      
      res.json({ alerts });
    } catch (error) {
      console.error("Weather alerts API error:", error);
      res.json({ alerts: [] });
    }
  });

  // User preferences for weather (stored ZIP, etc.)
  app.get("/api/user/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.getUserPreferences(userId);
      res.json(prefs || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.post("/api/user/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prefs = await storage.upsertUserPreferences({ userId, ...req.body });
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // Deals API (public)
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getActiveDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.post("/api/deals", isAuthenticated, async (req, res) => {
    try {
      const result = insertDealSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const deal = await storage.createDeal(result.data);
      res.json(deal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create deal" });
    }
  });

  // Hallmarks API (protected)
  app.get("/api/hallmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const hallmark = await storage.getHallmarkByUserId(userId);
      res.json(hallmark || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hallmark" });
    }
  });

  app.get("/api/hallmarks/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const hallmark = await storage.getHallmarkByUserId(userId);
      res.json(hallmark || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hallmark" });
    }
  });

  app.get("/api/hallmarks/recent", async (req, res) => {
    try {
      const hallmarks = await storage.getAllHallmarks();
      res.json(hallmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hallmarks" });
    }
  });

  app.get("/api/hallmarks/app", async (req, res) => {
    try {
      // Get the latest blockchain-verified release as the app hallmark
      const releases = await storage.getReleases();
      const verifiedRelease = releases.find((r: any) => 
        r.isBlockchainVerified && r.blockchainVerificationId
      );
      
      if (verifiedRelease) {
        res.json({ 
          hallmark: {
            id: verifiedRelease.id,
            tokenId: `GB-000001`,
            entityType: 'app',
            solanaSignature: verifiedRelease.blockchainVerificationId,
            blockchainSignature: verifiedRelease.blockchainVerificationId,
            version: verifiedRelease.version,
          }
        });
      } else {
        // Fallback to hallmarks table with assetType
        const hallmarks = await storage.getAllHallmarks();
        const appHallmark = hallmarks.find((h: any) => 
          h.assetType === 'release' || h.assetType === 'app'
        );
        if (appHallmark) {
          res.json({ 
            hallmark: {
              id: appHallmark.id,
              tokenId: appHallmark.tokenId,
              entityType: appHallmark.assetType,
              solanaSignature: appHallmark.transactionHash,
              blockchainSignature: appHallmark.transactionHash,
            }
          });
        } else {
          res.json({ hallmark: null });
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app hallmark" });
    }
  });

  app.post("/api/hallmark/mint", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const { vehicleId } = req.body;
      
      const existingHallmark = await storage.getHallmarkByUserId(userId);
      if (existingHallmark) {
        return res.status(400).json({ error: "User already has a Genesis Hallmark" });
      }
      
      // Get the vehicle info
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Get next asset number
      const assetNumber = await storage.getNextAssetNumber();
      
      // Create VIN hash for privacy
      const vinHash = vehicle.vin 
        ? `0x${Array.from(vehicle.vin).reduce((a, c) => a + c.charCodeAt(0), 0).toString(16).padStart(16, '0')}`
        : `0x${Date.now().toString(16)}`;
      
      const tokenId = `GB-${assetNumber.toString().padStart(6, '0')}`;
      const hallmark = await storage.createHallmark({
        userId,
        tokenId,
        assetNumber,
        transactionHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        metadata: JSON.stringify({
          type: "GENESIS_HALLMARK",
          edition: "Founder's Edition",
          mintedAt: new Date().toISOString(),
          vehicleInfo: {
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
          },
          vinHash,
        }),
      });
      
      await storage.updateUser(userId, { 
        hasGenesisBadge: true,
        hallmarkAssetNumber: assetNumber,
      });
      
      res.json({
        ...hallmark,
        assetNumber,
        vinHash,
        vehicleInfo: {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
        },
      });
    } catch (error) {
      console.error("Hallmark mint error:", error);
      res.status(500).json({ error: "Failed to mint hallmark" });
    }
  });

  app.post("/api/hallmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const existingHallmark = await storage.getHallmarkByUserId(userId);
      if (existingHallmark) {
        return res.status(400).json({ error: "User already has a Genesis Hallmark" });
      }
      
      const assetNumber = await storage.getNextAssetNumber();
      const tokenId = `GB-${assetNumber.toString().padStart(6, '0')}`;
      const hallmark = await storage.createHallmark({
        userId,
        tokenId,
        assetNumber,
        transactionHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        metadata: JSON.stringify({
          type: "GENESIS_HALLMARK",
          edition: "Founder's Edition",
          mintedAt: new Date().toISOString(),
        }),
      });
      
      await storage.updateUser(userId, { 
        hasGenesisBadge: true,
        hallmarkAssetNumber: assetNumber,
      });
      
      res.json(hallmark);
    } catch (error) {
      res.status(500).json({ error: "Failed to mint hallmark" });
    }
  });

  // ============================================
  // REFERRAL SYSTEM
  // ============================================

  // Get referral summary for logged-in user
  app.get("/api/referrals/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const summary = await storage.getReferralSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching referral summary:", error);
      res.status(500).json({ error: "Failed to fetch referral summary" });
    }
  });

  // Get point transaction history
  app.get("/api/referrals/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const transactions = await storage.getPointTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get referral invites
  app.get("/api/referrals/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const invites = await storage.getReferralInvites(userId);
      res.json(invites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  // Redeem points for rewards
  app.post("/api/referrals/redeem", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const { rewardType } = req.body;

      if (!['pro_month', 'pro_year', 'pro_lifetime'].includes(rewardType)) {
        return res.status(400).json({ error: "Invalid reward type" });
      }

      const redemption = await storage.redeemPoints(userId, rewardType);
      res.json({ 
        success: true, 
        redemption,
        message: `Successfully redeemed for ${rewardType.replace('_', ' ')}!`
      });
    } catch (error: any) {
      console.error("Error redeeming points:", error);
      if (error.message === 'Insufficient points') {
        return res.status(400).json({ error: "Insufficient points for this reward" });
      }
      res.status(500).json({ error: "Failed to redeem points" });
    }
  });

  // Get redemption history
  app.get("/api/referrals/redemptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const redemptions = await storage.getRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      res.status(500).json({ error: "Failed to fetch redemptions" });
    }
  });

  // Validate referral code (public - for signup page)
  app.get("/api/referrals/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const referrer = await storage.getUserByReferralCode(code.toUpperCase());
      
      if (referrer) {
        res.json({ 
          valid: true, 
          referrerName: referrer.firstName || referrer.username 
        });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ error: "Failed to validate code" });
    }
  });

  // ============== GAMIFICATION & REWARDS ROUTES ==============

  // Get user's badges
  app.get("/api/rewards/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // Get user's achievement progress
  app.get("/api/rewards/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Get user's giveaway entries for current month
  app.get("/api/rewards/giveaway", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentMonth = new Date().toISOString().slice(0, 7); // '2026-02'
      
      const entries = await db.select().from(giveawayEntries)
        .where(and(eq(giveawayEntries.userId, userId), eq(giveawayEntries.giveawayMonth, currentMonth)));
      
      const totalEntries = entries.reduce((sum, e) => sum + (e.entriesCount || 1), 0);
      
      res.json({
        month: currentMonth,
        entries: totalEntries,
        prize: "$100 AutoZone Gift Card",
        drawingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error fetching giveaway:", error);
      res.status(500).json({ error: "Failed to fetch giveaway info" });
    }
  });

  // Get rewards summary (all stats in one call)
  app.get("/api/rewards/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get referral count
      const invites = await db.select().from(referralInvites)
        .where(and(eq(referralInvites.referrerId, userId), eq(referralInvites.status, "converted")));
      
      // Get points balance from user
      const user = await storage.getUser(userId);
      
      // Get badges count
      const badges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
      
      // Get giveaway entries
      const entries = await db.select().from(giveawayEntries)
        .where(and(eq(giveawayEntries.userId, userId), eq(giveawayEntries.giveawayMonth, currentMonth)));
      
      const totalEntries = entries.reduce((sum, e) => sum + (e.entriesCount || 1), 0);
      
      // Calculate tier
      const referralCount = invites.length;
      const tiers = [
        { referrals: 1, name: "Early Supporter" },
        { referrals: 3, name: "Part Finder" },
        { referrals: 5, name: "Gear Head" },
        { referrals: 10, name: "Crew Chief" },
        { referrals: 25, name: "Shop Foreman" },
        { referrals: 50, name: "Legend" },
      ];
      
      let currentTier = 0;
      for (let i = 0; i < tiers.length; i++) {
        if (referralCount >= tiers[i].referrals) currentTier = i;
      }
      
      res.json({
        referralCount,
        pointsBalance: user?.referralPointsBalance || 0,
        badgesCount: badges.length,
        giveawayEntries: totalEntries,
        currentTier: tiers[currentTier]?.name || "New Member",
        nextTier: tiers[currentTier + 1]?.name || null,
        referralsToNextTier: tiers[currentTier + 1]?.referrals ? tiers[currentTier + 1].referrals - referralCount : 0
      });
    } catch (error) {
      console.error("Error fetching rewards summary:", error);
      res.status(500).json({ error: "Failed to fetch rewards summary" });
    }
  });

  // Add giveaway entry (called when user refers someone)
  app.post("/api/rewards/giveaway/enter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { source } = req.body;
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      await db.insert(giveawayEntries).values({
        userId,
        giveawayMonth: currentMonth,
        entriesCount: 1,
        source: source || "referral"
      });
      
      res.json({ success: true, message: "Giveaway entry added" });
    } catch (error) {
      console.error("Error adding giveaway entry:", error);
      res.status(500).json({ error: "Failed to add giveaway entry" });
    }
  });

  // ============== SPONSORED PRODUCTS & AD MANAGEMENT ==============

  // Get native product recommendations (public)
  app.get("/api/ads/native", async (req, res) => {
    try {
      const { category, vehicleType, placement } = req.query;
      let query = db.select().from(sponsoredProducts)
        .where(eq(sponsoredProducts.isActive, true))
        .orderBy(desc(sponsoredProducts.priority))
        .limit(8);

      const results = await query;

      let filtered = results;
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      if (placement) {
        filtered = filtered.filter(p => p.placement === placement);
      }

      res.json(filtered);
    } catch (error) {
      console.error("Error fetching sponsored products:", error);
      res.status(500).json({ error: "Failed to fetch sponsored products" });
    }
  });

  // Track ad click
  app.post("/api/ads/click/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.select().from(sponsoredProducts).where(eq(sponsoredProducts.id, id)).limit(1);
      if (existing.length > 0) {
        await db.update(sponsoredProducts)
          .set({ clicks: (existing[0].clicks || 0) + 1 })
          .where(eq(sponsoredProducts.id, id));
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking click:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Admin: Create sponsored product
  app.post("/api/ads/sponsored", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertSponsoredProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const [product] = await db.insert(sponsoredProducts).values(parsed.data).returning();
      res.json(product);
    } catch (error) {
      console.error("Error creating sponsored product:", error);
      res.status(500).json({ error: "Failed to create sponsored product" });
    }
  });

  // Admin: Update sponsored product
  app.patch("/api/ads/sponsored/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [product] = await db.update(sponsoredProducts)
        .set(req.body)
        .where(eq(sponsoredProducts.id, id))
        .returning();
      res.json(product);
    } catch (error) {
      console.error("Error updating sponsored product:", error);
      res.status(500).json({ error: "Failed to update sponsored product" });
    }
  });

  // Admin: List all sponsored products
  app.get("/api/ads/sponsored", isAuthenticated, async (req: any, res) => {
    try {
      const products = await db.select().from(sponsoredProducts)
        .orderBy(desc(sponsoredProducts.createdAt));
      res.json(products);
    } catch (error) {
      console.error("Error fetching sponsored products:", error);
      res.status(500).json({ error: "Failed to fetch sponsored products" });
    }
  });

  // Admin: Delete sponsored product
  app.delete("/api/ads/sponsored/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.delete(sponsoredProducts).where(eq(sponsoredProducts.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting sponsored product:", error);
      res.status(500).json({ error: "Failed to delete sponsored product" });
    }
  });

  // Stripe config
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  // Stripe Connect - Create connected account for shop
  app.post("/api/stripe/connect/create-account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Get user's shop
      const shop = await storage.getShopByOwnerId(userId);
      if (!shop) {
        return res.status(400).json({ error: "You need to create a shop first" });
      }

      // If shop already has a Stripe account, return account link for onboarding refresh
      if (shop.stripeAccountId) {
        const stripe = await getUncachableStripeClient();
        const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
        
        const accountLink = await stripe.accountLinks.create({
          account: shop.stripeAccountId,
          refresh_url: `${baseUrl}/mechanics-garage?tab=settings&stripe_refresh=true`,
          return_url: `${baseUrl}/mechanics-garage?tab=settings&stripe_success=true`,
          type: 'account_onboarding',
        });
        
        return res.json({ 
          accountId: shop.stripeAccountId, 
          onboardingUrl: accountLink.url,
          existing: true 
        });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      // Create Express connected account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email || shop.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'company',
        business_profile: {
          name: shop.name,
          mcc: '7538', // Auto repair shops
          url: shop.website || undefined,
        },
        metadata: {
          shopId: shop.id,
          userId: userId,
          platform: 'GarageBot',
        },
      });

      // Update shop with Stripe account ID
      await storage.updateShopStripeAccount(shop.id, account.id, 'pending');

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${baseUrl}/mechanics-garage?tab=settings&stripe_refresh=true`,
        return_url: `${baseUrl}/mechanics-garage?tab=settings&stripe_success=true`,
        type: 'account_onboarding',
      });

      res.json({ 
        accountId: account.id, 
        onboardingUrl: accountLink.url,
        existing: false 
      });
    } catch (error: any) {
      console.error("Stripe Connect error:", error);
      res.status(500).json({ error: error.message || "Failed to create connected account" });
    }
  });

  // Stripe Connect - Get account status
  app.get("/api/stripe/connect/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shop = await storage.getShopByOwnerId(userId);
      
      if (!shop) {
        return res.json({ connected: false, status: 'no_shop' });
      }

      if (!shop.stripeAccountId) {
        return res.json({ connected: false, status: 'not_connected' });
      }

      const stripe = await getUncachableStripeClient();
      const account = await stripe.accounts.retrieve(shop.stripeAccountId);

      const status = account.charges_enabled && account.payouts_enabled 
        ? 'active' 
        : account.details_submitted 
          ? 'pending_verification' 
          : 'onboarding_incomplete';

      // Update shop status if it changed
      if (shop.stripeAccountStatus !== status) {
        await storage.updateShopStripeAccount(
          shop.id, 
          shop.stripeAccountId, 
          status,
          account.charges_enabled && account.payouts_enabled
        );
      }

      res.json({
        connected: true,
        accountId: shop.stripeAccountId,
        status,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        email: account.email,
      });
    } catch (error: any) {
      console.error("Stripe Connect status error:", error);
      res.status(500).json({ error: "Failed to get account status" });
    }
  });

  // Stripe Connect - Create dashboard link
  app.get("/api/stripe/connect/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shop = await storage.getShopByOwnerId(userId);
      
      if (!shop?.stripeAccountId) {
        return res.status(400).json({ error: "No connected Stripe account" });
      }

      const stripe = await getUncachableStripeClient();
      const loginLink = await stripe.accounts.createLoginLink(shop.stripeAccountId);

      res.json({ url: loginLink.url });
    } catch (error: any) {
      console.error("Stripe dashboard link error:", error);
      res.status(500).json({ error: "Failed to create dashboard link" });
    }
  });

  // Products (from Stripe)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getStripeProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Cart API
  app.get("/api/cart", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const items = await storage.getCartItems(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart/items", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      const { productId, priceId, productName, productImage, quantity, unitPrice } = req.body;
      
      if (!productId || !priceId || !productName || !unitPrice) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const item = await storage.addToCart(cart.id, {
        productId,
        priceId,
        productName,
        productImage,
        quantity: quantity || 1,
        unitPrice: unitPrice.toString(),
      });
      
      const items = await storage.getCartItems(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/items/:itemId", async (req: any, res) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      await storage.updateCartItem(itemId, quantity);
      
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const items = await storage.getCartItems(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:itemId", async (req: any, res) => {
    try {
      const { itemId } = req.params;
      await storage.removeCartItem(itemId);
      
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const items = await storage.getCartItems(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Checkout
  app.post("/api/checkout", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessionId = req.sessionID;
      const cart = await storage.getOrCreateCart(userId, sessionId);
      const items = await storage.getCartItems(cart.id);
      
      if (items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      const stripe = await getUncachableStripeClient();
      
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            images: item.productImage ? [item.productImage] : [],
          },
          unit_amount: Math.round(parseFloat(item.unitPrice) * 100),
        },
        quantity: item.quantity,
      }));
      
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
        metadata: {
          cartId: cart.id,
          userId: userId || 'guest',
        },
      });
      
      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Order history
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Vendor Applications API (public submit)
  app.post("/api/vendor-applications", async (req, res) => {
    try {
      const { insertVendorApplicationSchema } = await import("@shared/schema");
      const parseResult = insertVendorApplicationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid application data", 
          details: parseResult.error.flatten().fieldErrors 
        });
      }
      
      const application = await storage.createVendorApplication(parseResult.data);
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Vendor application error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Featured vendors / Vendor of the Month (public)
  app.get("/api/vendors/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const vendors = await storage.getFeaturedVendors(limit);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured vendors" });
    }
  });

  app.get("/api/vendors/vendor-of-month", async (req, res) => {
    try {
      const vendor = await storage.getVendorOfMonth();
      res.json(vendor || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor of the month" });
    }
  });

  // Vendors API (public)
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getActiveVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const vendor = await storage.getVendor(slug);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });

  // Vendor redirect with affiliate tracking - includes vehicle info
  app.get("/api/vendors/:slug/redirect", async (req: any, res) => {
    try {
      const { slug } = req.params;
      const { query, partNumber, year, make, model } = req.query;
      
      const vendor = await storage.getVendor(slug);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      
      // Log the search/click for analytics
      await storage.logSearch({
        userId: req.user?.claims?.sub || null,
        sessionId: req.sessionID,
        query: (query as string) || (partNumber as string) || '',
        clickedVendor: vendor.name,
        vehicleYear: year ? parseInt(year as string) : undefined,
        vehicleMake: make as string,
        vehicleModel: model as string,
      });
      
      // Build the redirect URL with vehicle info where supported
      let redirectUrl = vendor.websiteUrl;
      
      // If vendor has affiliate link template, use it
      if (vendor.hasAffiliateProgram && vendor.affiliateLinkTemplate && vendor.affiliateId) {
        redirectUrl = vendor.affiliateLinkTemplate
          .replace('{affiliateId}', vendor.affiliateId)
          .replace('{query}', encodeURIComponent((query as string) || ''))
          .replace('{partNumber}', encodeURIComponent((partNumber as string) || ''));
      } else {
        // Use vendor-specific search paths with vehicle support
        const searchPath = getVendorSearchPathWithVehicle(
          slug, 
          query as string, 
          partNumber as string,
          year as string,
          make as string,
          model as string
        );
        redirectUrl = vendor.websiteUrl + searchPath;
      }
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Vendor redirect error:", error);
      res.status(500).json({ error: "Failed to redirect" });
    }
  });

  // Waitlist API (public)
  app.post("/api/waitlist", async (req, res) => {
    try {
      const result = insertWaitlistSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const entry = await storage.addToWaitlist(result.data);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  });

  // Shop Inquiry API (public - sends email to Jason)
  app.post("/api/shop-inquiry", async (req, res) => {
    try {
      const { shopName, contactName, email, phone, shopType, currentSoftware, employees, message } = req.body;
      
      if (!shopName || !contactName || !email || !phone || !shopType) {
        return res.status(400).json({ error: "Missing required fields: shopName, contactName, email, phone, shopType" });
      }

      const { sendShopInquiryEmail } = await import("./services/emailService");
      const result = await sendShopInquiryEmail({
        shopName,
        contactName,
        email,
        phone,
        shopType,
        currentSoftware,
        employees,
        message
      });

      if (result.success) {
        res.json({ success: true, message: "Your inquiry has been sent! We'll be in touch soon." });
      } else {
        res.status(500).json({ error: "Failed to send inquiry. Please try again or contact us directly." });
      }
    } catch (error) {
      console.error("[API] Shop inquiry error:", error);
      res.status(500).json({ error: "Failed to process inquiry" });
    }
  });

  // QuickBooks Integration API
  app.get("/api/quickbooks/status", async (req, res) => {
    try {
      const { quickbooksService } = await import("./services/quickbooks");
      res.json({
        configured: quickbooksService.isConfigured(),
        message: quickbooksService.isConfigured() 
          ? "QuickBooks integration is ready" 
          : "Add QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET to enable"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check QuickBooks status" });
    }
  });

  app.get("/api/quickbooks/connect/:shopId", isAuthenticated, async (req: any, res) => {
    try {
      const { quickbooksService } = await import("./services/quickbooks");
      const { shopId } = req.params;
      
      if (!quickbooksService.isConfigured()) {
        return res.status(400).json({ error: "QuickBooks not configured" });
      }

      const authUrl = quickbooksService.generateAuthUrl(shopId);
      res.json({ authUrl });
    } catch (error) {
      console.error("[QuickBooks] Connect error:", error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  app.get("/api/quickbooks/callback", async (req, res) => {
    try {
      const { quickbooksService } = await import("./services/quickbooks");
      const { code, state, realmId } = req.query;
      
      if (!code || !state || !realmId) {
        return res.redirect("/mechanics-garage?qb_error=missing_params");
      }

      const shopId = (state as string).split(':')[1];
      const tokens = await quickbooksService.exchangeCodeForTokens(code as string);
      tokens.realmId = realmId as string;

      // TODO: Store tokens in database for the shop
      // await storage.saveQuickBooksTokens(shopId, tokens);

      console.log("[QuickBooks] Successfully connected shop:", shopId);
      res.redirect(`/mechanics-garage?qb_connected=true&shop=${shopId}`);
    } catch (error) {
      console.error("[QuickBooks] Callback error:", error);
      res.redirect("/mechanics-garage?qb_error=auth_failed");
    }
  });

  // PartsTech Integration API
  app.get("/api/partstech/status", async (req, res) => {
    try {
      const { partsTechService } = await import("./services/partstech");
      res.json({
        configured: partsTechService.isConfigured(),
        message: partsTechService.isConfigured()
          ? "PartsTech integration is ready"
          : "Add PARTSTECH_API_KEY to enable parts ordering"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check PartsTech status" });
    }
  });

  app.post("/api/partstech/search", isAuthenticated, async (req: any, res) => {
    try {
      const { partsTechService } = await import("./services/partstech");
      const { query, vehicle } = req.body;

      if (!partsTechService.isConfigured()) {
        return res.status(400).json({ error: "PartsTech not configured" });
      }

      const results = await partsTechService.searchParts(query, vehicle);
      res.json({ results });
    } catch (error) {
      console.error("[PartsTech] Search error:", error);
      res.status(500).json({ error: "Parts search failed" });
    }
  });

  // Search API - aggregates results from multiple vendors
  app.post("/api/search", async (req: any, res) => {
    try {
      const { query, partNumber, year, make, model, category, vehicleType } = req.body;
      
      // Log the search
      await storage.logSearch({
        userId: req.user?.claims?.sub || null,
        sessionId: req.sessionID,
        query: query || partNumber || '',
        vehicleYear: year,
        vehicleMake: make,
        vehicleModel: model,
        category,
      });
      
      // Get all active vendors
      const vendors = await storage.getActiveVendors();
      
      const vendorResults = vendors.map(vendor => {
        const directUrl = buildVendorSearchUrlWithVehicle(vendor.websiteUrl, vendor.slug, query, partNumber, year, make, model);
        return {
          vendor: {
            id: vendor.id,
            name: vendor.name,
            slug: vendor.slug,
            logoUrl: vendor.logoUrl,
            hasLocalPickup: vendor.hasLocalPickup,
            hasAffiliateProgram: vendor.hasAffiliateProgram,
          },
          searchUrl: directUrl,
          directUrl,
        };
      });
      
      res.json({
        query: query || partNumber,
        vehicle: { year, make, model },
        category,
        vendorResults,
        resultsCount: vendorResults.length,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  const priceCompareSchema = z.object({
    query: z.string().min(1).max(200).trim(),
    year: z.string().max(4).optional(),
    make: z.string().max(50).optional(),
    model: z.string().max(50).optional(),
    vehicleType: z.string().max(30).optional(),
    zipCode: z.string().regex(/^\d{5}$/).optional(),
  });

  app.post("/api/prices/compare", async (req: any, res) => {
    try {
      const parsed = priceCompareSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid search parameters", details: fromZodError(parsed.error).message });
      }
      const { query, year, make, model, vehicleType, zipCode } = parsed.data;

      const vehicle = (year || make || model) ? { year, make, model } : undefined;

      await storage.logSearch({
        userId: req.user?.claims?.sub || null,
        sessionId: req.sessionID,
        query,
        vehicleYear: year,
        vehicleMake: make,
        vehicleModel: model,
        category: vehicleType,
      });

      const results = await comparePrice(query, vehicle, vehicleType, zipCode);
      res.json(results);
    } catch (error) {
      console.error("Price comparison error:", error);
      res.status(500).json({ error: "Failed to compare prices" });
    }
  });

  // Shop Portal API
  app.get("/api/shops", async (req, res) => {
    try {
      const { city, state, zipCode } = req.query;
      const shops = await storage.getShops({ 
        city: city as string, 
        state: state as string, 
        zipCode: zipCode as string 
      });
      res.json(shops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shops" });
    }
  });

  app.get("/api/shops/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const shop = await storage.getShopBySlug(slug);
      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }
      res.json(shop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shop" });
    }
  });

  app.get("/api/shops/:shopId/reviews", async (req, res) => {
    try {
      const { shopId } = req.params;
      const reviews = await storage.getShopReviews(shopId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/shops/:shopId/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      const review = await storage.createShopReview({ ...req.body, shopId, userId });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Shop owner routes
  app.get("/api/my-shops", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shops = await storage.getShopsByOwner(userId);
      res.json(shops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your shops" });
    }
  });

  app.post("/api/shops", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const shop = await storage.createShop({ ...req.body, ownerId: userId, slug });
      
      const user = await storage.getUser(userId);
      if (user) {
        orbitClient.syncWorker({
          id: userId,
          name: user.firstName || user.username || 'Unknown',
          email: user.email || '',
          phone: user.phone || undefined,
          skills: req.body.services || [],
        }).catch(err => console.error('[ORBIT] Failed to sync contractor:', err));
      }
      
      res.json(shop);
    } catch (error) {
      res.status(500).json({ error: "Failed to create shop" });
    }
  });

  app.patch("/api/shops/:shopId", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const updated = await storage.updateShop(shopId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update shop" });
    }
  });

  // Shop customers
  app.get("/api/shops/:shopId/customers", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const customers = await storage.getShopCustomers(shopId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/shops/:shopId/customers", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const customer = await storage.linkCustomerToShop({ shopId, ...req.body });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to add customer" });
    }
  });

  // Shop staff
  app.get("/api/shops/:shopId/staff", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const staff = await storage.getShopStaff(shopId);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.post("/api/shops/:shopId/staff", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const staff = await storage.addShopStaff({ shopId, ...req.body });
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to add staff" });
    }
  });

  // Message templates
  app.get("/api/message-templates", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.query;
      const templates = await storage.getMessageTemplates(shopId as string);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/message-templates", isAuthenticated, async (req: any, res) => {
    try {
      const template = await storage.createMessageTemplate(req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // Message log
  app.post("/api/messages/send", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shopId, recipient, content, messageType } = req.body;
      
      // Log the message (actual sending would be via Twilio)
      const message = await storage.logMessage({
        shopId,
        userId,
        recipient,
        messageType: messageType || 'sms',
        content,
        status: 'pending',
      });
      
      // TODO: Integrate with Twilio when approved
      // For now, just mark as sent (simulated)
      
      res.json({ ...message, note: 'SMS integration pending Twilio approval' });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/messages/history", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.query;
      const userId = req.user.claims.sub;
      const messages = await storage.getMessageHistory({ 
        shopId: shopId as string, 
        userId: !shopId ? userId : undefined 
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch message history" });
    }
  });

  // ============================================
  // MECHANICS GARAGE - REPAIR ORDERS
  // ============================================
  
  app.get("/api/shops/:shopId/repair-orders", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const orders = await storage.getRepairOrders(shopId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repair orders" });
    }
  });

  app.post("/api/shops/:shopId/repair-orders", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Generate order number
      const orderCount = await storage.getRepairOrderCount(shopId);
      const orderNumber = `RO-${String(orderCount + 1).padStart(5, '0')}`;
      
      const order = await storage.createRepairOrder({
        shopId,
        orderNumber,
        ...req.body,
        status: 'pending',
        paymentStatus: 'unpaid'
      });
      
      res.json(order);
    } catch (error) {
      console.error("Error creating repair order:", error);
      res.status(500).json({ error: "Failed to create repair order" });
    }
  });

  app.get("/api/shops/:shopId/repair-orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, orderId } = req.params;
      const userId = req.user.claims.sub;
      
      // Authorization check - verify user owns the shop
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const order = await storage.getRepairOrder(orderId);
      if (!order || order.shopId !== shopId) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repair order" });
    }
  });

  app.patch("/api/shops/:shopId/repair-orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, orderId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const previousOrder = await storage.getRepairOrder(orderId);
      const order = await storage.updateRepairOrder(orderId, req.body);
      
      if (req.body.status === 'completed' && previousOrder?.status !== 'completed' && order) {
        const laborAmount = order.laborTotal ? parseFloat(String(order.laborTotal)) : 0;
        const estimatedHours = laborAmount > 0 ? Math.ceil(laborAmount / 85) : 1;
        
        orbitClient.reportJobCompletion({
          id: orderId,
          mechanicId: userId,
          completedAt: new Date().toISOString(),
          laborHours: estimatedHours,
          serviceType: (order as any).description || 'General Repair',
          notes: (order as any).notes || undefined,
        }).catch(err => console.error('[ORBIT] Failed to report job completion:', err));
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update repair order" });
    }
  });

  // Collect payment for repair order (Stripe Connect)
  app.post("/api/shops/:shopId/repair-orders/:orderId/collect-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, orderId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const order = await storage.getRepairOrder(orderId);
      if (!order || order.shopId !== shopId) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!order.grandTotal || parseFloat(String(order.grandTotal)) <= 0) {
        return res.status(400).json({ error: "Order has no amount to collect" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Get base URL with fallback for production
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = replitDomain 
        ? `https://${replitDomain}` 
        : (process.env.BASE_URL || 'https://garagebot.io');
      
      const amountInCents = Math.round(parseFloat(String(order.grandTotal)) * 100);

      // Build line items for the checkout session
      const lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Repair Order ${order.orderNumber}`,
            description: (order as any).description || `Vehicle: ${(order as any).vehicleInfo || 'N/A'}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }];

      // Build checkout session options
      const sessionOptions: any = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/mechanics-garage?payment_success=true&order=${orderId}`,
        cancel_url: `${baseUrl}/mechanics-garage?payment_cancelled=true&order=${orderId}`,
        metadata: {
          orderId,
          shopId,
          orderNumber: order.orderNumber,
          platform: 'GarageBot',
        },
      };

      // If shop has connected Stripe account, use Stripe Connect
      if (shop.stripeAccountId && shop.stripeOnboardingComplete) {
        // Calculate platform fee (3% of transaction)
        const platformFee = Math.round(amountInCents * 0.03);
        
        sessionOptions.payment_intent_data = {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: shop.stripeAccountId,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionOptions);
      
      res.json({ 
        url: session.url, 
        sessionId: session.id,
        connectedAccount: shop.stripeAccountId ? true : false 
      });
    } catch (error: any) {
      console.error("Error creating payment session:", error);
      res.status(500).json({ error: error.message || "Failed to create payment session" });
    }
  });

  // ============================================
  // MECHANICS GARAGE - ESTIMATES
  // ============================================
  
  app.get("/api/shops/:shopId/estimates", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const estimates = await storage.getEstimates(shopId);
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch estimates" });
    }
  });

  app.post("/api/shops/:shopId/estimates", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Generate estimate number
      const estCount = await storage.getEstimateCount(shopId);
      const estimateNumber = `EST-${String(estCount + 1).padStart(5, '0')}`;
      
      const estimate = await storage.createEstimate({
        shopId,
        estimateNumber,
        ...req.body,
        status: 'draft'
      });
      
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create estimate" });
    }
  });

  // ============================================
  // MECHANICS GARAGE - APPOINTMENTS
  // ============================================
  
  app.get("/api/shops/:shopId/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const appointments = await storage.getAppointments(shopId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/shops/:shopId/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Generate appointment number
      const aptCount = await storage.getAppointmentCount(shopId);
      const appointmentNumber = `APT-${String(aptCount + 1).padStart(5, '0')}`;
      
      const appointment = await storage.createAppointment({
        shopId,
        appointmentNumber,
        ...req.body,
        status: 'scheduled'
      });
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.patch("/api/shops/:shopId/appointments/:appointmentId", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, appointmentId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const appointment = await storage.updateAppointment(appointmentId, req.body);
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // ============================================
  // MECHANICS GARAGE - INVENTORY
  // ============================================
  
  app.get("/api/shops/:shopId/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const inventory = await storage.getShopInventory(shopId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // ============================================
  // MECHANICS GARAGE - DIGITAL INSPECTIONS
  // ============================================
  
  app.get("/api/shops/:shopId/inspections", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user.claims.sub;
      
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const inspections = await storage.getDigitalInspections(shopId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inspections" });
    }
  });

  // Seed vendors endpoint (for initial setup) - COMPREHENSIVE LIST
  app.post("/api/admin/seed-vendors", async (req, res) => {
    try {
      const defaultVendors = [
        // ============ AUTOMOTIVE - MAJOR RETAILERS ============
        {
          name: "AutoZone",
          slug: "autozone",
          websiteUrl: "https://www.autozone.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "Impact",
          commissionRate: "1.00",
          hasLocalPickup: true,
          priority: 1,
          vehicleTypes: ["car", "truck", "suv"],
          contactEmail: "affiliates@autozone.com",
          apiStatus: "Business partnership required",
        },
        {
          name: "O'Reilly Auto Parts",
          slug: "oreilly",
          websiteUrl: "https://www.oreillyauto.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 2,
          vehicleTypes: ["car", "truck", "suv"],
          contactEmail: "partnerships@oreillyauto.com",
          apiStatus: "No public affiliate program",
        },
        {
          name: "Advance Auto Parts",
          slug: "advance-auto",
          websiteUrl: "https://shop.advanceautoparts.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "3.00",
          hasLocalPickup: true,
          priority: 3,
          vehicleTypes: ["car", "truck", "suv"],
          contactEmail: "affiliates@advance-auto.com",
          apiStatus: "CJ Affiliate program available",
        },
        {
          name: "RockAuto",
          slug: "rockauto",
          websiteUrl: "https://www.rockauto.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 4,
          vehicleTypes: ["car", "truck", "suv", "classic"],
          contactEmail: "info@rockauto.com",
          apiStatus: "No affiliate program - massive catalog, warehouse direct",
        },
        {
          name: "Amazon Automotive",
          slug: "amazon",
          websiteUrl: "https://www.amazon.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "Amazon Associates",
          commissionRate: "4.50",
          hasLocalPickup: false,
          priority: 5,
          vehicleTypes: ["car", "truck", "suv", "motorcycle", "atv", "boat"],
          contactEmail: "associates@amazon.com",
          apiStatus: "Amazon Product Advertising API available",
        },
        {
          name: "NAPA Auto Parts",
          slug: "napa",
          websiteUrl: "https://www.napaonline.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 6,
          vehicleTypes: ["car", "truck", "suv", "diesel"],
          contactEmail: "customerservice@napaonline.com",
          apiStatus: "Business account required for API",
        },
        {
          name: "CarParts.com",
          slug: "carparts",
          websiteUrl: "https://www.carparts.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 7,
          vehicleTypes: ["car", "truck", "suv"],
          contactEmail: "affiliates@carparts.com",
          apiStatus: "CJ Affiliate program",
        },
        {
          name: "eBay Motors",
          slug: "ebay",
          websiteUrl: "https://www.ebay.com/motors",
          hasAffiliateProgram: true,
          affiliateNetwork: "eBay Partner Network",
          commissionRate: "3.00",
          hasLocalPickup: false,
          priority: 8,
          vehicleTypes: ["car", "truck", "suv", "motorcycle", "atv", "boat", "classic"],
          contactEmail: "ePN@ebay.com",
          apiStatus: "eBay Browse API available",
        },
        {
          name: "Car-Part.com",
          slug: "car-part",
          websiteUrl: "https://www.car-part.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 9,
          vehicleTypes: ["car", "truck", "suv"],
          contactEmail: "info@car-part.com",
          apiStatus: "Salvage yard network - contact for partnership",
        },
        // ============ POWERSPORTS - ATV/UTV/MOTORCYCLE ============
        {
          name: "Rocky Mountain ATV/MC",
          slug: "rocky-mountain",
          websiteUrl: "https://www.rockymountainatvmc.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "AvantLink",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 11,
          vehicleTypes: ["motorcycle", "atv", "utv", "dirtbike"],
          contactEmail: "affiliates@rockymountainatvmc.com",
          apiStatus: "AvantLink affiliate with product feed",
        },
        {
          name: "Dennis Kirk",
          slug: "dennis-kirk",
          websiteUrl: "https://www.denniskirk.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "AvantLink",
          commissionRate: "6.00",
          hasLocalPickup: false,
          priority: 12,
          vehicleTypes: ["motorcycle", "atv", "utv", "snowmobile"],
          contactEmail: "affiliates@denniskirk.com",
          apiStatus: "AvantLink affiliate with product feed",
        },
        {
          name: "Partzilla",
          slug: "partzilla",
          websiteUrl: "https://www.partzilla.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 13,
          vehicleTypes: ["motorcycle", "atv", "utv", "scooter", "pwc"],
          contactEmail: "affiliates@partzilla.com",
          apiStatus: "ShareASale affiliate program",
        },
        {
          name: "RevZilla",
          slug: "revzilla",
          websiteUrl: "https://www.revzilla.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "AvantLink",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 14,
          vehicleTypes: ["motorcycle"],
          contactEmail: "affiliates@revzilla.com",
          apiStatus: "AvantLink affiliate - gear and parts",
        },
        {
          name: "MotoSport",
          slug: "motosport",
          websiteUrl: "https://www.motosport.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "AvantLink",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 15,
          vehicleTypes: ["motorcycle", "atv", "utv", "dirtbike"],
          contactEmail: "affiliates@motosport.com",
          apiStatus: "AvantLink affiliate program",
        },
        {
          name: "Cycle Gear",
          slug: "cycle-gear",
          websiteUrl: "https://www.cyclegear.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "4.00",
          hasLocalPickup: true,
          priority: 16,
          vehicleTypes: ["motorcycle"],
          contactEmail: "affiliates@cyclegear.com",
          apiStatus: "CJ Affiliate program",
        },
        {
          name: "BikeBandit",
          slug: "bikebandit",
          websiteUrl: "https://www.bikebandit.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 17,
          vehicleTypes: ["motorcycle", "atv", "scooter"],
          contactEmail: "affiliates@bikebandit.com",
          apiStatus: "CJ Affiliate - OEM parts diagrams",
        },
        {
          name: "VMC Chinese Parts",
          slug: "vmc",
          websiteUrl: "https://www.vmcchineseparts.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 18,
          vehicleTypes: ["atv", "dirtbike", "scooter", "gokart"],
          contactEmail: "sales@vmcchineseparts.com",
          apiStatus: "Contact for partnership - Chinese import specialist",
        },
        {
          name: "Chaparral Motorsports",
          slug: "chaparral",
          websiteUrl: "https://www.chapmoto.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "AvantLink",
          commissionRate: "4.00",
          hasLocalPickup: true,
          priority: 19,
          vehicleTypes: ["motorcycle", "atv", "utv"],
          contactEmail: "affiliates@chapmoto.com",
          apiStatus: "AvantLink affiliate",
        },
        // ============ MARINE / BOAT ============
        {
          name: "West Marine",
          slug: "west-marine",
          websiteUrl: "https://www.westmarine.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "5.00",
          hasLocalPickup: true,
          priority: 20,
          vehicleTypes: ["boat", "pwc"],
          contactEmail: "affiliates@westmarine.com",
          apiStatus: "CJ Affiliate program available",
        },
        {
          name: "Defender Marine",
          slug: "defender",
          websiteUrl: "https://www.defender.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "AvantLink",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 21,
          vehicleTypes: ["boat", "sailboat"],
          contactEmail: "affiliates@defender.com",
          apiStatus: "AvantLink affiliate",
        },
        {
          name: "Wholesale Marine",
          slug: "wholesale-marine",
          websiteUrl: "https://www.wholesalemarine.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 22,
          vehicleTypes: ["boat"],
          contactEmail: "affiliates@wholesalemarine.com",
          apiStatus: "ShareASale affiliate",
        },
        {
          name: "iBoats",
          slug: "iboats",
          websiteUrl: "https://www.iboats.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 23,
          vehicleTypes: ["boat", "pwc"],
          contactEmail: "affiliates@iboats.com",
          apiStatus: "CJ Affiliate program",
        },
        {
          name: "Boats.net",
          slug: "boats-net",
          websiteUrl: "https://www.boats.net",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 24,
          vehicleTypes: ["boat", "pwc"],
          contactEmail: "affiliates@boats.net",
          apiStatus: "ShareASale - OEM marine parts",
        },
        {
          name: "MarineEngine.com",
          slug: "marine-engine",
          websiteUrl: "https://www.marineengine.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 25,
          vehicleTypes: ["boat"],
          contactEmail: "info@marineengine.com",
          apiStatus: "Contact for partnership",
        },
        // ============ DIESEL / COMMERCIAL / HEAVY DUTY ============
        {
          name: "TruckPro",
          slug: "truckpro",
          websiteUrl: "https://www.truckpro.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 30,
          vehicleTypes: ["diesel", "commercial", "truck"],
          contactEmail: "sales@truckpro.com",
          apiStatus: "Business account for wholesale",
        },
        {
          name: "FleetPride",
          slug: "fleetpride",
          websiteUrl: "https://www.fleetpride.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 31,
          vehicleTypes: ["diesel", "commercial", "truck"],
          contactEmail: "info@fleetpride.com",
          apiStatus: "Business account required",
        },
        {
          name: "Diesel Parts Direct",
          slug: "diesel-parts-direct",
          websiteUrl: "https://www.dieselpartsdirect.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 32,
          vehicleTypes: ["diesel"],
          contactEmail: "sales@dieselpartsdirect.com",
          apiStatus: "Contact for partnership",
        },
        {
          name: "FinditParts",
          slug: "finditparts",
          websiteUrl: "https://www.finditparts.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 33,
          vehicleTypes: ["diesel", "commercial", "truck"],
          contactEmail: "info@finditparts.com",
          apiStatus: "Heavy duty parts aggregator",
        },
        {
          name: "4 State Trucks",
          slug: "4-state-trucks",
          websiteUrl: "https://www.4statetrucks.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 34,
          vehicleTypes: ["diesel", "commercial", "truck"],
          contactEmail: "sales@4statetrucks.com",
          apiStatus: "Chrome shop - contact for partnership",
        },
        {
          name: "Vander Haags",
          slug: "vander-haags",
          websiteUrl: "https://www.vanderhaags.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 35,
          vehicleTypes: ["diesel", "commercial"],
          contactEmail: "sales@vanderhaags.com",
          apiStatus: "Salvage/used heavy duty parts",
        },
        // ============ RV / MOTORHOME ============
        {
          name: "RV Parts Country",
          slug: "rv-parts-country",
          websiteUrl: "https://www.rvpartscountry.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 40,
          vehicleTypes: ["rv", "motorhome", "trailer"],
          contactEmail: "affiliates@rvpartscountry.com",
          apiStatus: "ShareASale affiliate",
        },
        {
          name: "PPL Motorhomes",
          slug: "ppl-motorhomes",
          websiteUrl: "https://www.pplmotorhomes.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 41,
          vehicleTypes: ["rv", "motorhome"],
          contactEmail: "parts@pplmotorhomes.com",
          apiStatus: "Contact for partnership",
        },
        {
          name: "Camping World",
          slug: "camping-world",
          websiteUrl: "https://www.campingworld.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "4.00",
          hasLocalPickup: true,
          priority: 42,
          vehicleTypes: ["rv", "motorhome", "trailer"],
          contactEmail: "affiliates@campingworld.com",
          apiStatus: "CJ Affiliate program",
        },
        {
          name: "etrailer",
          slug: "etrailer",
          websiteUrl: "https://www.etrailer.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "6.00",
          hasLocalPickup: false,
          priority: 43,
          vehicleTypes: ["trailer", "rv", "truck"],
          contactEmail: "affiliates@etrailer.com",
          apiStatus: "ShareASale affiliate - trailer parts specialist",
        },
        // ============ SMALL ENGINE / OUTDOOR POWER ============
        {
          name: "Jack's Small Engines",
          slug: "jacks-small-engines",
          websiteUrl: "https://www.jackssmallengines.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 50,
          vehicleTypes: ["small_engine", "lawn_mower", "chainsaw"],
          contactEmail: "affiliates@jackssmallengines.com",
          apiStatus: "ShareASale affiliate - OEM parts diagrams",
        },
        {
          name: "Tractor Supply",
          slug: "tractor-supply",
          websiteUrl: "https://www.tractorsupply.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "3.00",
          hasLocalPickup: true,
          priority: 51,
          vehicleTypes: ["tractor", "small_engine", "atv", "utv"],
          contactEmail: "affiliates@tractorsupply.com",
          apiStatus: "CJ Affiliate program",
        },
        {
          name: "Mower Parts Group",
          slug: "mower-parts",
          websiteUrl: "https://www.mowerpartsgroup.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 52,
          vehicleTypes: ["lawn_mower", "small_engine"],
          contactEmail: "info@mowerpartsgroup.com",
          apiStatus: "Contact for partnership",
        },
        {
          name: "Power Mower Sales",
          slug: "power-mower",
          websiteUrl: "https://www.powermowersales.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 53,
          vehicleTypes: ["lawn_mower", "small_engine"],
          contactEmail: "parts@powermowersales.com",
          apiStatus: "Contact for partnership",
        },
        {
          name: "Electric Generators Direct",
          slug: "generators-direct",
          websiteUrl: "https://www.electricgeneratorsdirect.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "3.00",
          hasLocalPickup: false,
          priority: 54,
          vehicleTypes: ["generator"],
          contactEmail: "affiliates@electricgeneratorsdirect.com",
          apiStatus: "ShareASale affiliate",
        },
        // ============ OFF-ROAD / 4X4 ============
        {
          name: "4 Wheel Parts",
          slug: "4-wheel-parts",
          websiteUrl: "https://www.4wheelparts.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "4.00",
          hasLocalPickup: true,
          priority: 60,
          vehicleTypes: ["truck", "suv", "jeep", "offroad"],
          contactEmail: "affiliates@4wheelparts.com",
          apiStatus: "CJ Affiliate program",
        },
        {
          name: "ExtremeTerrain",
          slug: "extreme-terrain",
          websiteUrl: "https://www.extremeterrain.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 61,
          vehicleTypes: ["jeep", "truck"],
          contactEmail: "affiliates@extremeterrain.com",
          apiStatus: "CJ Affiliate - Jeep specialist",
        },
        {
          name: "AmericanTrucks",
          slug: "american-trucks",
          websiteUrl: "https://www.americantrucks.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "5.00",
          hasLocalPickup: false,
          priority: 62,
          vehicleTypes: ["truck"],
          contactEmail: "affiliates@americantrucks.com",
          apiStatus: "CJ Affiliate - Ford/Chevy/RAM specialist",
        },
        // ============ PERFORMANCE / RACING ============
        {
          name: "Summit Racing",
          slug: "summit-racing",
          websiteUrl: "https://www.summitracing.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "3.00",
          hasLocalPickup: true,
          priority: 70,
          vehicleTypes: ["car", "truck", "racing"],
          contactEmail: "affiliates@summitracing.com",
          apiStatus: "CJ Affiliate - performance specialist",
        },
        {
          name: "JEGS",
          slug: "jegs",
          websiteUrl: "https://www.jegs.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "3.00",
          hasLocalPickup: true,
          priority: 71,
          vehicleTypes: ["car", "truck", "racing"],
          contactEmail: "affiliates@jegs.com",
          apiStatus: "CJ Affiliate - performance specialist",
        },
        {
          name: "CARiD",
          slug: "carid",
          websiteUrl: "https://www.carid.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ Affiliate",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 72,
          vehicleTypes: ["car", "truck", "suv"],
          contactEmail: "affiliates@carid.com",
          apiStatus: "CJ Affiliate - styling and accessories",
        },
        // ============ CLASSIC / VINTAGE ============
        {
          name: "Classic Industries",
          slug: "classic-industries",
          websiteUrl: "https://www.classicindustries.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "ShareASale",
          commissionRate: "4.00",
          hasLocalPickup: false,
          priority: 80,
          vehicleTypes: ["classic", "muscle"],
          contactEmail: "affiliates@classicindustries.com",
          apiStatus: "ShareASale affiliate - classic car specialist",
        },
        {
          name: "Year One",
          slug: "year-one",
          websiteUrl: "https://www.yearone.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 81,
          vehicleTypes: ["classic", "muscle"],
          contactEmail: "sales@yearone.com",
          apiStatus: "Contact for partnership",
        },
        {
          name: "NPD",
          slug: "npd",
          websiteUrl: "https://www.npdlink.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 82,
          vehicleTypes: ["classic", "muscle"],
          contactEmail: "info@npdlink.com",
          apiStatus: "National Parts Depot - contact for partnership",
        },
        {
          name: "LMC Truck",
          slug: "lmc-truck",
          websiteUrl: "https://www.lmctruck.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 83,
          vehicleTypes: ["classic", "truck"],
          contactEmail: "info@lmctruck.com",
          apiStatus: "Classic truck specialist - contact for partnership",
        },
        // ============ SNOWMOBILE / WINTER ============
        {
          name: "Snowmobile.com",
          slug: "snowmobile-com",
          websiteUrl: "https://www.snowmobile.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 90,
          vehicleTypes: ["snowmobile"],
          contactEmail: "parts@snowmobile.com",
          apiStatus: "Contact for partnership",
        },
      ];

      const results = [];
      for (const vendorData of defaultVendors) {
        try {
          const existing = await storage.getVendor(vendorData.slug);
          if (!existing) {
            const vendor = await storage.createVendor(vendorData);
            results.push({ action: "created", vendor: vendor.name });
          } else {
            results.push({ action: "exists", vendor: vendorData.name });
          }
        } catch (err) {
          results.push({ action: "error", vendor: vendorData.name, error: String(err) });
        }
      }
      
      res.json({ message: "Vendors seeded", results });
    } catch (error) {
      console.error("Seed vendors error:", error);
      res.status(500).json({ error: "Failed to seed vendors" });
    }
  });

  // ============ Trust Circle ============

  app.get('/api/trust-circle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      // For now, return empty array - trust circle members would be stored in a separate table
      // This is a placeholder for the trust circle feature
      res.json([]);
    } catch (error) {
      console.error("Get trust circle error:", error);
      res.status(500).json({ error: "Failed to get trust circle" });
    }
  });

  app.get('/api/trust-circle/memberships', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      // Return circles the user is a member of
      res.json([]);
    } catch (error) {
      console.error("Get memberships error:", error);
      res.status(500).json({ error: "Failed to get memberships" });
    }
  });

  app.post('/api/trust-circle/invite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const { email, memberType } = req.body;
      
      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // In production, this would save to a trust_circle_members table
      res.json({
        id: `tc-${Date.now()}`,
        userId,
        memberType,
        memberEmail: email,
        inviteCode,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Create invite error:", error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });

  app.delete('/api/trust-circle/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      // In production, delete from trust_circle_members table
      res.json({ success: true });
    } catch (error) {
      console.error("Remove member error:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // ============ Subscription Management ============

  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      const isPro = user?.subscriptionTier === 'pro' && 
        (!user?.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) > new Date());
      const isAdFree = isPro || (user?.adFreeSubscription === true && 
        (!user?.adFreeExpiresAt || new Date(user.adFreeExpiresAt) > new Date()));
      
      res.json({
        isPro,
        isAdFree,
        tier: user?.subscriptionTier || 'free',
        status: isPro ? 'active' : 'inactive',
        expiresAt: user?.subscriptionExpiresAt || null,
        isFounder: user?.isFounder || false,
        adFreeSubscription: user?.adFreeSubscription || false,
        adFreeExpiresAt: user?.adFreeExpiresAt || null,
      });
    } catch (error) {
      console.error("Subscription status error:", error);
      res.status(500).json({ error: "Failed to get subscription status" });
    }
  });

  app.post('/api/subscription/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const { billingPeriod } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      
      const priceId = billingPeriod === 'annual' 
        ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID 
        : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
      
      if (!priceId) {
        return res.status(500).json({ error: "Stripe price not configured" });
      }
      
      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      
      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId, username: user.username }
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }
      
      // Create checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/pro?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pro?canceled=true`,
        metadata: {
          userId,
          billingPeriod,
          isFounder: 'true', // Mark as founder during Launch Edition
        },
        subscription_data: {
          metadata: {
            userId,
            isFounder: 'true',
          }
        }
      });
      
      res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error("Subscription checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post('/api/subscription/ad-free/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      if (user.subscriptionTier === 'pro') {
        return res.status(400).json({ error: "Pro subscribers are already ad-free" });
      }

      if (user.adFreeSubscription) {
        return res.status(400).json({ error: "Already subscribed to ad-free" });
      }

      const priceId = process.env.STRIPE_AD_FREE_PRICE_ID;
      if (!priceId) {
        return res.status(500).json({ error: "Ad-free price not configured" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId, username: user.username }
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/pro?ad_free_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pro?canceled=true`,
        metadata: {
          userId,
          subscriptionType: 'ad-free',
        },
        subscription_data: {
          metadata: {
            userId,
            subscriptionType: 'ad-free',
          }
        }
      });

      res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error("Ad-free checkout error:", error);
      res.status(500).json({ error: "Failed to create ad-free checkout session" });
    }
  });

  // ============ Vehicle Sharing (Family Garage) ============

  app.get('/api/vehicles/shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const shares = await storage.getVehicleSharesByOwner(userId);
      res.json(shares);
    } catch (error) {
      console.error("Get shares error:", error);
      res.status(500).json({ error: "Failed to get shares" });
    }
  });

  app.get('/api/vehicles/shared-with-me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const shares = await storage.getVehicleSharesWithUser(userId);
      res.json(shares);
    } catch (error) {
      console.error("Get shared with me error:", error);
      res.status(500).json({ error: "Failed to get shared vehicles" });
    }
  });

  app.post('/api/vehicles/shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const { vehicleId, email, shareType } = req.body;
      
      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const share = await storage.createVehicleShare({
        vehicleId,
        ownerId: userId,
        sharedWithEmail: email,
        shareType,
        inviteCode,
        inviteExpiresAt,
      });
      
      res.json(share);
    } catch (error) {
      console.error("Create share error:", error);
      res.status(500).json({ error: "Failed to create share" });
    }
  });

  app.post('/api/vehicles/shares/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const { inviteCode } = req.body;
      
      const share = await storage.acceptVehicleShare(inviteCode, userId);
      if (!share) {
        return res.status(404).json({ error: "Invalid or expired invite code" });
      }
      
      res.json(share);
    } catch (error) {
      console.error("Accept share error:", error);
      res.status(500).json({ error: "Failed to accept share" });
    }
  });

  app.delete('/api/vehicles/shares/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      
      await storage.deleteVehicleShare(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete share error:", error);
      res.status(500).json({ error: "Failed to delete share" });
    }
  });

  // ============ AI Part Identification ============

  app.post('/api/ai/identify-part', async (req, res) => {
    try {
      const { image, vehicleContext } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Check for OpenAI API key
      const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      
      if (!openaiKey) {
        // Return mock data for demo purposes when no API key
        return res.json({
          partName: "Brake Rotor",
          partNumber: "BR-12345",
          description: "Front brake disc rotor for passenger vehicles. This component is part of the disc brake system and works with brake pads to slow the vehicle.",
          category: "Brakes",
          confidence: 0.85,
          alternateNames: ["Brake Disc", "Rotor", "Front Rotor"],
          estimatedPrice: "45-120",
          searchQuery: "brake rotor front",
          compatibleVehicles: vehicleContext 
            ? [`${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model}`]
            : ["Most passenger vehicles"]
        });
      }

      // Use OpenAI Vision API to identify the part (uses module-level openai instance)

      const vehicleContextStr = vehicleContext 
        ? `The part is from a ${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model}.`
        : "No specific vehicle context provided.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert automotive parts identifier. Analyze the image and identify the automotive part shown. ${vehicleContextStr}
            
            Respond with a JSON object containing:
            - partName: Common name of the part
            - partNumber: Estimated OEM or aftermarket part number if identifiable (or null)
            - description: Brief description of what the part does (1-2 sentences)
            - category: Category (Engine, Brakes, Suspension, Electrical, Body, Interior, Exhaust, Cooling, Transmission, Fuel System, Steering, Other)
            - confidence: Your confidence level (0.0-1.0)
            - alternateNames: Array of other names this part might be called
            - estimatedPrice: Price range estimate in USD (e.g., "50-150")
            - searchQuery: Best search terms to find this part online
            
            Only respond with valid JSON, no other text.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "high"
                }
              },
              {
                type: "text",
                text: "What automotive part is this? Identify it and provide details in JSON format."
              }
            ]
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const partInfo = JSON.parse(content);
      res.json(partInfo);

    } catch (error) {
      console.error("AI part identification error:", error);
      res.status(500).json({ 
        error: "Failed to identify part",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ============ NHTSA API ============

  // Decode VIN
  app.get('/api/nhtsa/decode/:vin', async (req, res) => {
    try {
      const { vin } = req.params;
      const result = await nhtsaService.decodeVin(vin);
      
      // Map NHTSA fields to our format
      res.json({
        vin: result.vin,
        year: parseInt(result.year) || 0,
        make: result.make,
        model: result.model,
        trim: result.trim,
        bodyStyle: result.bodyClass,
        engineType: result.engineCylinders ? `${result.engineCylinders}-Cylinder` : undefined,
        engineSize: result.engineDisplacement ? `${result.engineDisplacement}L` : undefined,
        fuelType: result.fuelType,
        transmission: result.transmission,
        drivetrain: result.driveType,
        vehicleType: result.vehicleType,
        manufacturer: result.manufacturerName,
        plantCountry: result.plantCountry,
        errorCode: result.errorCode,
        errorText: result.errorText,
      });
    } catch (error) {
      console.error("VIN decode error:", error);
      res.status(500).json({ error: "Failed to decode VIN" });
    }
  });

  // Get recalls for a vehicle
  app.get('/api/nhtsa/recalls/:year/:make/:model', async (req, res) => {
    try {
      const { year, make, model } = req.params;
      const recalls = await nhtsaService.getRecalls(year, make, model);
      res.json(recalls);
    } catch (error) {
      console.error("Get recalls error:", error);
      res.status(500).json({ error: "Failed to fetch recalls" });
    }
  });

  // Get recalls by VIN
  app.get('/api/nhtsa/recalls/vin/:vin', async (req, res) => {
    try {
      const { vin } = req.params;
      const recalls = await nhtsaService.getRecallsByVin(vin);
      res.json(recalls);
    } catch (error) {
      console.error("Get recalls by VIN error:", error);
      res.status(500).json({ error: "Failed to fetch recalls" });
    }
  });

  // Get safety rating
  app.get('/api/nhtsa/safety/:year/:make/:model', async (req, res) => {
    try {
      const { year, make, model } = req.params;
      const rating = await nhtsaService.getSafetyRating(year, make, model);
      res.json(rating || { overallRating: 'Not Rated' });
    } catch (error) {
      console.error("Get safety rating error:", error);
      res.status(500).json({ error: "Failed to fetch safety rating" });
    }
  });

  // Get makes
  app.get('/api/nhtsa/makes', async (req, res) => {
    try {
      const makes = await nhtsaService.getMakes();
      res.json(makes);
    } catch (error) {
      console.error("Get makes error:", error);
      res.status(500).json({ error: "Failed to fetch makes" });
    }
  });

  // Get models for make
  app.get('/api/nhtsa/models/:make', async (req, res) => {
    try {
      const { make } = req.params;
      const year = req.query.year as string | undefined;
      const models = await nhtsaService.getModels(make, year);
      res.json(models);
    } catch (error) {
      console.error("Get models error:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  // ============ Dev Portal Tasks ============
  
  // Get all dev tasks
  app.get('/api/dev/tasks', async (req, res) => {
    try {
      const tasks = await storage.getDevTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Get dev tasks error:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Initialize default tasks
  app.post('/api/dev/tasks/init', async (req, res) => {
    try {
      const { tasks } = req.body;
      const results = [];
      for (const task of tasks) {
        const created = await storage.createDevTask(task);
        results.push(created);
      }
      res.json({ message: "Tasks initialized", count: results.length });
    } catch (error) {
      console.error("Init dev tasks error:", error);
      res.status(500).json({ error: "Failed to initialize tasks" });
    }
  });

  // Create a new dev task
  app.post('/api/dev/tasks', async (req, res) => {
    try {
      const task = await storage.createDevTask(req.body);
      res.json(task);
    } catch (error) {
      console.error("Create dev task error:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Update a dev task
  app.patch('/api/dev/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.updateDevTask(id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Update dev task error:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Delete a dev task
  app.delete('/api/dev/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDevTask(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete dev task error:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // ============================================
  // ORBIT ECOSYSTEM INTEGRATION
  // ============================================

  app.get('/api/orbit/status', async (req, res) => {
    try {
      const status = await orbitClient.checkStatus();
      res.json({
        connected: status?.connected ?? false,
        hubName: status?.hubName || null,
        appName: status?.appName || null,
        permissions: status?.permissions || [],
        lastSync: status?.lastSync || null,
      });
    } catch (error) {
      console.error("ORBIT status check error:", error);
      res.status(500).json({ 
        connected: false, 
        error: "Failed to check ORBIT status" 
      });
    }
  });

  app.post('/api/orbit/test-sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const result = await orbitClient.syncWorker({
        id: userId,
        name: user.firstName || user.username || 'Test User',
        email: user.email || '',
        phone: user.phone || undefined,
        skills: ['GarageBot Test'],
      });
      
      res.json({ 
        success: !!result, 
        result,
        message: result ? 'Successfully synced to ORBIT' : 'ORBIT client not configured'
      });
    } catch (error) {
      console.error("ORBIT test sync error:", error);
      res.status(500).json({ error: "Failed to test ORBIT sync" });
    }
  });

  app.post('/api/orbit/sync-workers', isAuthenticated, async (req: any, res) => {
    try {
      const { workers } = req.body;
      if (!workers || !Array.isArray(workers)) {
        return res.status(400).json({ error: "workers array is required" });
      }
      const result = await orbitClient.syncWorkers(workers);
      res.json({ success: !!result, result });
    } catch (error) {
      console.error("ORBIT sync workers error:", error);
      res.status(500).json({ error: "Failed to sync workers to ORBIT" });
    }
  });

  app.post('/api/orbit/sync-contractors', isAuthenticated, async (req: any, res) => {
    try {
      const { contractors } = req.body;
      if (!contractors || !Array.isArray(contractors)) {
        return res.status(400).json({ error: "contractors array is required" });
      }
      const result = await orbitClient.syncContractors(contractors);
      res.json({ success: !!result, result });
    } catch (error) {
      console.error("ORBIT sync contractors error:", error);
      res.status(500).json({ error: "Failed to sync contractors to ORBIT" });
    }
  });

  app.post('/api/orbit/sync-timesheets', isAuthenticated, async (req: any, res) => {
    try {
      const { timesheets } = req.body;
      if (!timesheets || !Array.isArray(timesheets)) {
        return res.status(400).json({ error: "timesheets array is required" });
      }
      const result = await orbitClient.syncTimesheets(timesheets);
      res.json({ success: !!result, result });
    } catch (error) {
      console.error("ORBIT sync timesheets error:", error);
      res.status(500).json({ error: "Failed to sync timesheets to ORBIT" });
    }
  });

  app.post('/api/orbit/sync-certifications', isAuthenticated, async (req: any, res) => {
    try {
      const { certifications } = req.body;
      if (!certifications || !Array.isArray(certifications)) {
        return res.status(400).json({ error: "certifications array is required" });
      }
      const result = await orbitClient.syncCertifications(certifications);
      res.json({ success: !!result, result });
    } catch (error) {
      console.error("ORBIT sync certifications error:", error);
      res.status(500).json({ error: "Failed to sync certifications to ORBIT" });
    }
  });

  app.post('/api/orbit/sync-1099', isAuthenticated, async (req: any, res) => {
    try {
      const { year, payments } = req.body;
      if (!year || !payments || !Array.isArray(payments)) {
        return res.status(400).json({ error: "year and payments array are required" });
      }
      const result = await orbitClient.sync1099Payments(year, payments);
      res.json({ success: !!result, result });
    } catch (error) {
      console.error("ORBIT sync 1099 error:", error);
      res.status(500).json({ error: "Failed to sync 1099 data to ORBIT" });
    }
  });

  app.post('/api/orbit/sync-w2', isAuthenticated, async (req: any, res) => {
    try {
      const { year, employees } = req.body;
      if (!year || !employees || !Array.isArray(employees)) {
        return res.status(400).json({ error: "year and employees array are required" });
      }
      const result = await orbitClient.syncW2Data(year, employees);
      res.json({ success: !!result, result });
    } catch (error) {
      console.error("ORBIT sync W2 error:", error);
      res.status(500).json({ error: "Failed to sync W-2 data to ORBIT" });
    }
  });

  app.get('/api/orbit/shop/:shopId/workers', isAuthenticated, async (req: any, res) => {
    try {
      const result = await orbitClient.getShopWorkers(req.params.shopId);
      res.json(result || { success: false, workers: [] });
    } catch (error) {
      console.error("ORBIT get shop workers error:", error);
      res.status(500).json({ error: "Failed to get shop workers from ORBIT" });
    }
  });

  app.get('/api/orbit/shop/:shopId/payroll', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await orbitClient.getShopPayroll(req.params.shopId, limit);
      res.json(result || { success: false, records: [] });
    } catch (error) {
      console.error("ORBIT get shop payroll error:", error);
      res.status(500).json({ error: "Failed to get shop payroll from ORBIT" });
    }
  });

  app.get('/api/orbit/payroll/engine-status', async (req, res) => {
    try {
      const result = await orbitClient.getPayrollEngineStatus();
      res.json(result || { error: "Could not reach ORBIT payroll engine" });
    } catch (error) {
      console.error("ORBIT payroll engine status error:", error);
      res.status(500).json({ error: "Failed to get payroll engine status" });
    }
  });

  app.get('/api/orbit/payroll/overtime-rules', async (req, res) => {
    try {
      const result = await orbitClient.getOvertimeRules();
      res.json(result || { error: "Could not fetch overtime rules" });
    } catch (error) {
      console.error("ORBIT overtime rules error:", error);
      res.status(500).json({ error: "Failed to get overtime rules" });
    }
  });

  app.get('/api/orbit/payroll/overtime-rules/:state', async (req, res) => {
    try {
      const result = await orbitClient.getOvertimeRules(req.params.state);
      res.json(result || { error: "Could not fetch overtime rules for state" });
    } catch (error) {
      console.error("ORBIT state overtime rules error:", error);
      res.status(500).json({ error: "Failed to get state overtime rules" });
    }
  });

  app.post('/api/orbit/payroll/calculate-overtime', async (req, res) => {
    try {
      const { dailyHours, hourlyRate, state } = req.body;
      if (!dailyHours || !hourlyRate || !state) {
        return res.status(400).json({ error: "dailyHours, hourlyRate, and state are required" });
      }
      const result = await orbitClient.calculateOvertime({ dailyHours, hourlyRate, state });
      res.json(result || { error: "Could not calculate overtime" });
    } catch (error) {
      console.error("ORBIT calculate overtime error:", error);
      res.status(500).json({ error: "Failed to calculate overtime" });
    }
  });

  app.post('/webhooks/orbit', (req, res) => {
    try {
      const signature = req.headers['x-orbit-signature'] as string;
      const rawPayload = (req as any).rawBody ? (req as any).rawBody.toString() : JSON.stringify(req.body);
      const isValid = orbitClient.verifyWebhookSignature(rawPayload, signature);

      if (!isValid) {
        console.warn('[ORBIT Webhook] Invalid signature - rejecting');
        return res.status(401).json({ error: "Invalid signature" });
      }

      const { event, data } = req.body;
      console.log(`[ORBIT Webhook] Received event: ${event}`);

      switch (event) {
        case 'payroll.completed':
          console.log(`[ORBIT Webhook] Payroll completed for tenant ${data?.tenantId} - total: $${data?.totalNet}`);
          break;
        case 'payroll.payment.sent':
          console.log(`[ORBIT Webhook] Payment sent: ${data?.workerId} - $${data?.amount}`);
          break;
        case 'payroll.payment.failed':
          console.error(`[ORBIT Webhook] Payment FAILED: ${data?.workerId} - ${data?.reason}`);
          break;
        case 'worker.created':
          console.log(`[ORBIT Webhook] Worker created: ${data?.workerId}`);
          break;
        case 'worker.updated':
          console.log(`[ORBIT Webhook] Worker updated: ${data?.workerId}`);
          break;
        case 'document.generated':
          console.log(`[ORBIT Webhook] Document ready: ${data?.type} - hallmark: ${data?.hallmarkId}`);
          break;
        case 'tax.form.ready':
          console.log(`[ORBIT Webhook] Tax form ready: ${data?.formType}`);
          break;
        default:
          console.log(`[ORBIT Webhook] Unknown event: ${event}`, data);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[ORBIT Webhook] Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ============================================
  // ORBIT STAFFING - SHOP MANAGEMENT ROUTES
  // One-click connect + employee/payroll/timesheet management
  // ============================================

  app.get('/api/shops/:shopId/orbit/status', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const connection = await db.select().from(orbitConnections).where(eq(orbitConnections.shopId, shopId)).limit(1);
      if (connection.length === 0) {
        return res.json({ connected: false });
      }
      const employees = await db.select().from(orbitEmployees).where(eq(orbitEmployees.shopId, shopId));
      const payrollRuns = await db.select().from(orbitPayrollRuns).where(eq(orbitPayrollRuns.shopId, shopId));
      res.json({
        connected: true,
        connection: connection[0],
        employeeCount: employees.length,
        payrollRunCount: payrollRuns.length,
      });
    } catch (error) {
      console.error("[ORBIT] Status check error:", error);
      res.status(500).json({ error: "Failed to check ORBIT status" });
    }
  });

  app.post('/api/shops/:shopId/orbit/connect', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user?.claims?.sub;
      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length || shop[0].ownerId !== userId) {
        return res.status(403).json({ error: "Only the shop owner can connect ORBIT" });
      }
      const existing = await db.select().from(orbitConnections).where(eq(orbitConnections.shopId, shopId)).limit(1);
      if (existing.length > 0) {
        return res.json({ success: true, message: "Already connected", connection: existing[0] });
      }
      const shopData = shop[0];
      const orbitResult = await orbitClient.syncWorker({
        id: userId,
        name: shopData.name,
        email: shopData.email || '',
        phone: shopData.phone || undefined,
        payRate: 0,
        workState: shopData.state || undefined,
      });
      const tenantId = `orbit_tenant_${shopId}`;
      const [connection] = await db.insert(orbitConnections).values({
        shopId,
        status: 'active',
        orbitTenantId: tenantId,
        config: { shopName: shopData.name, state: shopData.state, autoSync: true },
      }).returning();
      await orbitClient.logActivity(`Shop "${shopData.name}" connected to ORBIT Staffing`, { type: 'shop_connect' });
      res.json({ success: true, connection });
    } catch (error) {
      console.error("[ORBIT] Connect error:", error);
      res.status(500).json({ error: "Failed to connect to ORBIT Staffing" });
    }
  });

  app.post('/api/shops/:shopId/orbit/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user?.claims?.sub;
      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length || shop[0].ownerId !== userId) {
        return res.status(403).json({ error: "Only the shop owner can disconnect ORBIT" });
      }
      await db.delete(orbitConnections).where(eq(orbitConnections.shopId, shopId));
      res.json({ success: true, message: "ORBIT Staffing disconnected" });
    } catch (error) {
      console.error("[ORBIT] Disconnect error:", error);
      res.status(500).json({ error: "Failed to disconnect ORBIT" });
    }
  });

  app.get('/api/shops/:shopId/orbit/employees', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const employees = await db.select().from(orbitEmployees)
        .where(eq(orbitEmployees.shopId, shopId))
        .orderBy(desc(orbitEmployees.createdAt));
      res.json(employees);
    } catch (error) {
      console.error("[ORBIT] Get employees error:", error);
      res.status(500).json({ error: "Failed to get employees" });
    }
  });

  app.post('/api/shops/:shopId/orbit/employees', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const { firstName, lastName, email, phone, role, employmentType, payRate, payType, workState, certifications } = req.body;
      if (!firstName || !lastName) {
        return res.status(400).json({ error: "First name and last name are required" });
      }
      const [employee] = await db.insert(orbitEmployees).values({
        shopId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        role: role || 'mechanic',
        employmentType: employmentType || 'w2',
        payRate: payRate ? String(payRate) : null,
        payType: payType || 'hourly',
        workState: workState || null,
        startDate: new Date(),
        certifications: certifications || [],
      }).returning();
      const orbitResult = await orbitClient.syncWorker({
        id: employee.id,
        name: `${firstName} ${lastName}`,
        email: email || '',
        phone: phone || undefined,
        payRate: payRate ? Number(payRate) : undefined,
        workState: workState || undefined,
        skills: certifications || [],
      });
      if (orbitResult) {
        await db.update(orbitEmployees)
          .set({ syncedAt: new Date(), orbitWorkerId: employee.id })
          .where(eq(orbitEmployees.id, employee.id));
      }
      res.json(employee);
    } catch (error) {
      console.error("[ORBIT] Add employee error:", error);
      res.status(500).json({ error: "Failed to add employee" });
    }
  });

  app.put('/api/shops/:shopId/orbit/employees/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, employeeId } = req.params;
      const updates = req.body;
      const [updated] = await db.update(orbitEmployees)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(orbitEmployees.id, employeeId), eq(orbitEmployees.shopId, shopId)))
        .returning();
      if (!updated) {
        return res.status(404).json({ error: "Employee not found" });
      }
      await orbitClient.syncWorker({
        id: updated.id,
        name: `${updated.firstName} ${updated.lastName}`,
        email: updated.email || '',
        phone: updated.phone || undefined,
        payRate: updated.payRate ? Number(updated.payRate) : undefined,
        workState: updated.workState || undefined,
      });
      res.json(updated);
    } catch (error) {
      console.error("[ORBIT] Update employee error:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete('/api/shops/:shopId/orbit/employees/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, employeeId } = req.params;
      await db.update(orbitEmployees)
        .set({ status: 'terminated', updatedAt: new Date() })
        .where(and(eq(orbitEmployees.id, employeeId), eq(orbitEmployees.shopId, shopId)));
      res.json({ success: true });
    } catch (error) {
      console.error("[ORBIT] Remove employee error:", error);
      res.status(500).json({ error: "Failed to remove employee" });
    }
  });

  app.get('/api/shops/:shopId/orbit/timesheets', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const timesheets = await db.select().from(orbitTimesheets)
        .where(eq(orbitTimesheets.shopId, shopId))
        .orderBy(desc(orbitTimesheets.date));
      res.json(timesheets);
    } catch (error) {
      console.error("[ORBIT] Get timesheets error:", error);
      res.status(500).json({ error: "Failed to get timesheets" });
    }
  });

  app.post('/api/shops/:shopId/orbit/timesheets', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const { employeeId, date, hoursWorked, overtimeHours, jobId, notes } = req.body;
      if (!employeeId || !date || !hoursWorked) {
        return res.status(400).json({ error: "employeeId, date, and hoursWorked are required" });
      }
      const [timesheet] = await db.insert(orbitTimesheets).values({
        shopId,
        employeeId,
        date: new Date(date),
        hoursWorked: String(hoursWorked),
        overtimeHours: overtimeHours ? String(overtimeHours) : "0",
        jobId: jobId || null,
        notes: notes || null,
        status: 'pending',
      }).returning();
      const employee = await db.select().from(orbitEmployees).where(eq(orbitEmployees.id, employeeId)).limit(1);
      if (employee.length > 0) {
        await orbitClient.syncTimesheets([{
          id: timesheet.id,
          workerId: employeeId,
          date: new Date(date).toISOString().split('T')[0],
          hoursWorked: Number(hoursWorked),
          overtimeHours: overtimeHours ? Number(overtimeHours) : 0,
          jobId: jobId || undefined,
          status: 'submitted',
        }]);
        await db.update(orbitTimesheets)
          .set({ syncedToOrbit: true, status: 'submitted' })
          .where(eq(orbitTimesheets.id, timesheet.id));
      }
      res.json(timesheet);
    } catch (error) {
      console.error("[ORBIT] Submit timesheet error:", error);
      res.status(500).json({ error: "Failed to submit timesheet" });
    }
  });

  app.get('/api/shops/:shopId/orbit/payroll', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const runs = await db.select().from(orbitPayrollRuns)
        .where(eq(orbitPayrollRuns.shopId, shopId))
        .orderBy(desc(orbitPayrollRuns.createdAt));
      const orbitPayroll = await orbitClient.getShopPayroll(shopId);
      res.json({ localRuns: runs, orbitPayroll: orbitPayroll || [] });
    } catch (error) {
      console.error("[ORBIT] Get payroll error:", error);
      res.status(500).json({ error: "Failed to get payroll data" });
    }
  });

  app.post('/api/shops/:shopId/orbit/payroll/run', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const { payPeriodStart, payPeriodEnd } = req.body;
      if (!payPeriodStart || !payPeriodEnd) {
        return res.status(400).json({ error: "payPeriodStart and payPeriodEnd are required" });
      }
      const userId = req.user?.claims?.sub;
      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length || shop[0].ownerId !== userId) {
        return res.status(403).json({ error: "Only the shop owner can run payroll" });
      }
      const employees = await db.select().from(orbitEmployees)
        .where(and(eq(orbitEmployees.shopId, shopId), eq(orbitEmployees.status, 'active')));
      const timesheets = await db.select().from(orbitTimesheets)
        .where(eq(orbitTimesheets.shopId, shopId));
      const periodTimesheets = timesheets.filter(t => {
        const d = new Date(t.date);
        return d >= new Date(payPeriodStart) && d <= new Date(payPeriodEnd);
      });
      let totalGross = 0;
      for (const emp of employees) {
        const empSheets = periodTimesheets.filter(t => t.employeeId === emp.id);
        const totalHours = empSheets.reduce((sum, t) => sum + Number(t.hoursWorked), 0);
        const otHours = empSheets.reduce((sum, t) => sum + Number(t.overtimeHours || 0), 0);
        const rate = Number(emp.payRate || 0);
        totalGross += (totalHours * rate) + (otHours * rate * 0.5);
      }
      const estimatedTaxRate = 0.25;
      const totalTaxes = totalGross * estimatedTaxRate;
      const totalNet = totalGross - totalTaxes;
      const [payrollRun] = await db.insert(orbitPayrollRuns).values({
        shopId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        status: 'processing',
        totalGross: String(totalGross.toFixed(2)),
        totalNet: String(totalNet.toFixed(2)),
        totalTaxes: String(totalTaxes.toFixed(2)),
        employeeCount: employees.length,
      }).returning();
      await orbitClient.logActivity(
        `Payroll run initiated for ${employees.length} employees - Period: ${payPeriodStart} to ${payPeriodEnd}`,
        { type: 'payroll_run', employeeCount: employees.length }
      );
      await db.update(orbitPayrollRuns)
        .set({ status: 'completed', processedAt: new Date() })
        .where(eq(orbitPayrollRuns.id, payrollRun.id));
      res.json({ ...payrollRun, status: 'completed', processedAt: new Date() });
    } catch (error) {
      console.error("[ORBIT] Run payroll error:", error);
      res.status(500).json({ error: "Failed to run payroll" });
    }
  });

  // ============================================
  // BUSINESS INTEGRATIONS (QuickBooks, UKG, ADP, Gusto, etc.)
  // Unified OAuth flow for all business software connections
  // ============================================

  app.get('/api/integrations/available', async (req, res) => {
    try {
      const { businessIntegrationService } = await import('./services/businessIntegrations');
      const all = businessIntegrationService.getAllIntegrations();
      const result = all.map(i => ({
        name: i.name,
        displayName: i.displayName,
        category: i.category,
        description: i.description,
        features: i.features,
        configured: businessIntegrationService.isConfigured(i.name),
        authType: i.authUrl ? 'oauth' : 'apikey',
      }));
      res.json(result);
    } catch (error) {
      console.error("[Integrations] Error listing:", error);
      res.status(500).json({ error: "Failed to list integrations" });
    }
  });

  app.get('/api/shops/:shopId/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const connections = await db.select().from(businessIntegrations)
        .where(eq(businessIntegrations.shopId, shopId));
      res.json(connections.map(c => ({
        id: c.id,
        service: c.service,
        status: c.status,
        companyName: c.companyName,
        connectedAt: c.connectedAt,
        lastSyncAt: c.lastSyncAt,
      })));
    } catch (error) {
      console.error("[Integrations] Error getting shop integrations:", error);
      res.status(500).json({ error: "Failed to get integrations" });
    }
  });

  app.post('/api/shops/:shopId/integrations/:service/connect', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, service } = req.params;
      const { businessIntegrationService } = await import('./services/businessIntegrations');
      const userId = req.user?.claims?.sub;

      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length || shop[0].ownerId !== userId) {
        return res.status(403).json({ error: "Only the shop owner can connect integrations" });
      }

      const config = businessIntegrationService.getIntegration(service);
      if (!config) {
        return res.status(404).json({ error: `Unknown integration: ${service}` });
      }

      if (!businessIntegrationService.isConfigured(service)) {
        return res.status(400).json({
          error: `${config.displayName} is not configured yet. OAuth credentials needed.`,
          credentialsNeeded: [config.clientIdEnv, config.clientSecretEnv],
        });
      }

      if (!config.authUrl) {
        const existing = await db.select().from(businessIntegrations)
          .where(and(
            eq(businessIntegrations.shopId, shopId),
            eq(businessIntegrations.service, service)
          )).limit(1);

        if (existing.length && existing[0].status === 'connected') {
          return res.json({ alreadyConnected: true, integration: existing[0] });
        }

        const [connection] = await db.insert(businessIntegrations).values({
          shopId,
          service,
          status: 'connected',
          connectedAt: new Date(),
        }).onConflictDoNothing().returning();

        return res.json({ connected: true, integration: connection || existing[0] });
      }

      const authUrl = businessIntegrationService.generateAuthUrl(service, shopId);
      res.json({ authUrl });
    } catch (error: any) {
      console.error(`[Integrations] Connect error:`, error);
      res.status(500).json({ error: error.message || "Failed to initiate connection" });
    }
  });

  app.get('/api/integrations/:service/callback', async (req, res) => {
    try {
      const { service } = req.params;
      const { code, state, realmId } = req.query;
      const { businessIntegrationService } = await import('./services/businessIntegrations');

      if (!code || !state) {
        return res.redirect(`/mechanics-garage?integration_error=missing_params&service=${service}`);
      }

      const stateParts = (state as string).split(':');
      const shopId = stateParts[1];

      const tokens = await businessIntegrationService.exchangeCodeForTokens(service, code as string);

      const existing = await db.select().from(businessIntegrations)
        .where(and(
          eq(businessIntegrations.shopId, shopId),
          eq(businessIntegrations.service, service)
        )).limit(1);

      const connectionData = {
        shopId,
        service,
        status: 'connected' as const,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + (tokens.expiresIn * 1000)),
        externalId: (realmId as string) || tokens.realmId || null,
        connectedAt: new Date(),
        updatedAt: new Date(),
      };

      if (existing.length) {
        await db.update(businessIntegrations)
          .set(connectionData)
          .where(eq(businessIntegrations.id, existing[0].id));
      } else {
        await db.insert(businessIntegrations).values(connectionData);
      }

      console.log(`[Integrations] Successfully connected ${service} for shop: ${shopId}`);
      res.redirect(`/mechanics-garage?integration_connected=${service}&shop=${shopId}`);
    } catch (error) {
      const { service } = req.params;
      console.error(`[Integrations] Callback error for ${service}:`, error);
      res.redirect(`/mechanics-garage?integration_error=auth_failed&service=${service}`);
    }
  });

  app.post('/api/shops/:shopId/integrations/:service/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, service } = req.params;
      const userId = req.user?.claims?.sub;

      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length || shop[0].ownerId !== userId) {
        return res.status(403).json({ error: "Only the shop owner can disconnect integrations" });
      }

      await db.update(businessIntegrations)
        .set({
          status: 'disconnected',
          accessToken: null,
          refreshToken: null,
          disconnectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(businessIntegrations.shopId, shopId),
          eq(businessIntegrations.service, service)
        ));

      res.json({ disconnected: true });
    } catch (error) {
      console.error("[Integrations] Disconnect error:", error);
      res.status(500).json({ error: "Failed to disconnect integration" });
    }
  });

  app.get('/api/shops/:shopId/integrations/:service/status', isAuthenticated, async (req: any, res) => {
    try {
      const { shopId, service } = req.params;
      const { businessIntegrationService } = await import('./services/businessIntegrations');

      const config = businessIntegrationService.getIntegration(service);
      if (!config) {
        return res.status(404).json({ error: `Unknown integration: ${service}` });
      }

      const connection = await db.select().from(businessIntegrations)
        .where(and(
          eq(businessIntegrations.shopId, shopId),
          eq(businessIntegrations.service, service)
        )).limit(1);

      res.json({
        service: config.name,
        displayName: config.displayName,
        configured: businessIntegrationService.isConfigured(service),
        connected: connection.length > 0 && connection[0].status === 'connected',
        companyName: connection[0]?.companyName || null,
        connectedAt: connection[0]?.connectedAt || null,
        lastSyncAt: connection[0]?.lastSyncAt || null,
      });
    } catch (error) {
      console.error("[Integrations] Status error:", error);
      res.status(500).json({ error: "Failed to get integration status" });
    }
  });

  // ============================================
  // TRUST LAYER GATEWAY INTEGRATION
  // Self-service ecosystem connection (no credentials needed)
  // ============================================

  app.get('/api/trust-layer/status', async (req, res) => {
    try {
      const status = await trustLayerClient.checkStatus();
      res.json({
        configured: true,
        baseUrl: trustLayerClient.getBaseUrl(),
        appName: trustLayerClient.getAppName(),
        ecosystemStatus: status || { connected: false, message: "Gateway not reachable" },
      });
    } catch (error) {
      console.error("Trust Layer status error:", error);
      res.json({
        configured: true,
        baseUrl: trustLayerClient.getBaseUrl(),
        appName: trustLayerClient.getAppName(),
        ecosystemStatus: { connected: false, error: "Gateway not reachable" },
      });
    }
  });

  app.get('/api/trust-layer/connection', async (req, res) => {
    try {
      const connection = await trustLayerClient.getConnection();
      
      if (!connection) {
        return res.status(502).json({ error: "Failed to fetch ecosystem connection" });
      }
      
      res.json(connection);
    } catch (error) {
      console.error("Trust Layer connection error:", error);
      res.status(500).json({ error: "Failed to get ecosystem connection" });
    }
  });

  app.get('/api/trust-layer/domains/resolve/:subdomain', async (req, res) => {
    try {
      const { subdomain } = req.params;
      
      if (!subdomain || typeof subdomain !== 'string' || subdomain.length < 1 || subdomain.length > 63) {
        return res.status(400).json({ error: "Invalid subdomain" });
      }
      
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(subdomain)) {
        return res.status(400).json({ error: "Invalid subdomain format" });
      }
      
      const result = await trustLayerClient.resolveDomain(subdomain);
      
      if (!result) {
        return res.status(404).json({ error: "Domain not found" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Trust Layer domain resolve error:", error);
      res.status(500).json({ error: "Failed to resolve domain" });
    }
  });

  app.get('/api/trust-layer/domains/check/:name', async (req, res) => {
    try {
      const { name } = req.params;
      
      if (!name || typeof name !== 'string' || name.length < 1 || name.length > 63) {
        return res.status(400).json({ error: "Invalid domain name" });
      }
      
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(name)) {
        return res.status(400).json({ error: "Invalid domain name format" });
      }
      
      const result = await trustLayerClient.checkDomainAvailability(name);
      
      if (!result) {
        return res.status(502).json({ error: "Failed to check domain availability" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Trust Layer domain check error:", error);
      res.status(500).json({ error: "Failed to check domain" });
    }
  });

  // ============================================
  // INTEGRATION CREDENTIALS VAULT (Admin Only)
  // ============================================

  // Get all integration credentials (masks sensitive data)
  app.get('/api/dev/credentials', async (req, res) => {
    try {
      const credentials = await storage.getIntegrationCredentials();
      // Mask actual credentials for display
      const masked = credentials.map(cred => ({
        ...cred,
        clientSecretEncrypted: cred.clientSecretEncrypted ? '********' : null,
        apiKeyEncrypted: cred.apiKeyEncrypted ? '********' : null,
        refreshTokenEncrypted: cred.refreshTokenEncrypted ? '********' : null,
        accessToken: cred.accessToken ? '********' : null,
        webhookSecret: cred.webhookSecret ? '********' : null,
      }));
      res.json(masked);
    } catch (error) {
      console.error("Get integration credentials error:", error);
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  // Get single credential (unmasks data for admin use)
  app.get('/api/dev/credentials/:key', async (req, res) => {
    try {
      const credential = await storage.getIntegrationCredential(req.params.key);
      if (!credential) {
        return res.status(404).json({ error: "Credential not found" });
      }
      res.json(credential);
    } catch (error) {
      console.error("Get integration credential error:", error);
      res.status(500).json({ error: "Failed to fetch credential" });
    }
  });

  // Upsert integration credential
  app.post('/api/dev/credentials', async (req, res) => {
    try {
      const credential = await storage.upsertIntegrationCredential(req.body);
      res.json(credential);
    } catch (error) {
      console.error("Upsert integration credential error:", error);
      res.status(500).json({ error: "Failed to save credential" });
    }
  });

  // Update integration credential
  app.patch('/api/dev/credentials/:key', async (req, res) => {
    try {
      const credential = await storage.updateIntegrationCredential(req.params.key, req.body);
      if (!credential) {
        return res.status(404).json({ error: "Credential not found" });
      }
      res.json(credential);
    } catch (error) {
      console.error("Update integration credential error:", error);
      res.status(500).json({ error: "Failed to update credential" });
    }
  });

  // Delete integration credential
  app.delete('/api/dev/credentials/:key', async (req, res) => {
    try {
      await storage.deleteIntegrationCredential(req.params.key);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete integration credential error:", error);
      res.status(500).json({ error: "Failed to delete credential" });
    }
  });

  // ============================================
  // AFFILIATE TRACKING ROUTES
  // ============================================

  // Get all affiliate networks
  app.get('/api/affiliates/networks', async (req, res) => {
    try {
      const networks = await storage.getAffiliateNetworks();
      res.json(networks);
    } catch (error) {
      console.error("Get affiliate networks error:", error);
      res.status(500).json({ error: "Failed to fetch networks" });
    }
  });

  // Create affiliate network
  app.post('/api/affiliates/networks', async (req, res) => {
    try {
      const result = insertAffiliateNetworkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const network = await storage.createAffiliateNetwork(result.data);
      res.json(network);
    } catch (error) {
      console.error("Create affiliate network error:", error);
      res.status(500).json({ error: "Failed to create network" });
    }
  });

  // Get all affiliate partners
  app.get('/api/affiliates/partners', async (req, res) => {
    try {
      const { category, active } = req.query;
      const filters: { category?: string; isActive?: boolean } = {};
      if (category) filters.category = category as string;
      if (active !== undefined) filters.isActive = active === 'true';
      
      const partners = await storage.getAffiliatePartners(filters);
      res.json(partners);
    } catch (error) {
      console.error("Get affiliate partners error:", error);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  // Get single affiliate partner
  app.get('/api/affiliates/partners/:id', async (req, res) => {
    try {
      const partner = await storage.getAffiliatePartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Get affiliate partner error:", error);
      res.status(500).json({ error: "Failed to fetch partner" });
    }
  });

  // Create affiliate partner
  app.post('/api/affiliates/partners', async (req, res) => {
    try {
      const result = insertAffiliatePartnerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const partner = await storage.createAffiliatePartner(result.data);
      res.json(partner);
    } catch (error) {
      console.error("Create affiliate partner error:", error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  // Update affiliate partner
  app.patch('/api/affiliates/partners/:id', async (req, res) => {
    try {
      const partner = await storage.updateAffiliatePartner(req.params.id, req.body);
      res.json(partner);
    } catch (error) {
      console.error("Update affiliate partner error:", error);
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  // Track affiliate click and redirect
  app.get('/api/affiliates/click/:partnerSlug', async (req, res) => {
    try {
      const { partnerSlug } = req.params;
      const { product, sku, search, source, utm_source, utm_medium, utm_campaign, utm_content, vehicleId } = req.query;
      
      // Find partner
      const partner = await storage.getAffiliatePartnerBySlug(partnerSlug);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }

      // Get user ID if authenticated
      const userId = (req.session as any)?.userId || null;
      const sessionId = req.sessionID;

      // Detect device type from user agent
      const userAgent = req.headers['user-agent'] || '';
      let deviceType = 'desktop';
      if (/mobile/i.test(userAgent)) deviceType = 'mobile';
      else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

      // Track the click
      const click = await storage.trackAffiliateClick({
        partnerId: partner.id,
        userId,
        sessionId,
        vehicleId: vehicleId as string || null,
        productName: product as string || null,
        productSku: sku as string || null,
        searchQuery: search as string || null,
        sourceUrl: req.headers.referer || null,
        destinationUrl: partner.affiliateUrl || partner.websiteUrl,
        clickContext: source as string || 'search_results',
        utmSource: utm_source as string || 'garagebot',
        utmMedium: utm_medium as string || 'affiliate',
        utmCampaign: utm_campaign as string || null,
        utmContent: utm_content as string || null,
        userAgent,
        ipAddress: req.ip || null,
        referrer: req.headers.referer || null,
        deviceType,
      });

      // Build destination URL with tracking
      let destinationUrl = partner.affiliateUrl || partner.websiteUrl;
      
      // Apply tracking template if available
      if (partner.trackingTemplate) {
        destinationUrl = partner.trackingTemplate
          .replace('{clickId}', click.id)
          .replace('{affiliateId}', partner.affiliateId || '')
          .replace('{product}', encodeURIComponent(product as string || ''))
          .replace('{sku}', encodeURIComponent(sku as string || ''))
          .replace('{search}', encodeURIComponent(search as string || ''));
      } else if (search) {
        // Build search URL using the existing helper
        destinationUrl = buildVendorSearchUrl(partner.websiteUrl, partnerSlug, search as string, sku as string);
      }

      // Redirect to affiliate partner
      res.redirect(302, destinationUrl);
    } catch (error) {
      console.error("Affiliate click error:", error);
      res.status(500).json({ error: "Failed to process click" });
    }
  });

  // Track click via POST (for AJAX tracking without redirect)
  app.post('/api/affiliates/track', async (req, res) => {
    try {
      const { partnerId, productName, productSku, searchQuery, vehicleId, sourceUrl, clickContext } = req.body;
      
      const userId = (req.session as any)?.userId || null;
      const sessionId = req.sessionID;
      const userAgent = req.headers['user-agent'] || '';
      
      let deviceType = 'desktop';
      if (/mobile/i.test(userAgent)) deviceType = 'mobile';
      else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

      const click = await storage.trackAffiliateClick({
        partnerId,
        userId,
        sessionId,
        vehicleId,
        productName,
        productSku,
        searchQuery,
        sourceUrl,
        destinationUrl: null,
        clickContext: clickContext || 'button_click',
        utmSource: 'garagebot',
        utmMedium: 'affiliate',
        userAgent,
        ipAddress: req.ip,
        referrer: req.headers.referer || null,
        deviceType,
      });

      res.json({ clickId: click.id, success: true });
    } catch (error) {
      console.error("Track click error:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Get click statistics
  app.get('/api/affiliates/stats/clicks', async (req, res) => {
    try {
      const { partnerId, startDate, endDate } = req.query;
      
      const filters: { partnerId?: string; startDate?: Date; endDate?: Date } = {};
      if (partnerId) filters.partnerId = partnerId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const clicks = await storage.getAffiliateClicks(filters);
      const stats = await storage.getAffiliateClickStats(partnerId as string);
      
      res.json({ clicks, stats });
    } catch (error) {
      console.error("Get click stats error:", error);
      res.status(500).json({ error: "Failed to fetch click statistics" });
    }
  });

  // Get commissions
  app.get('/api/affiliates/commissions', async (req, res) => {
    try {
      const { partnerId, status } = req.query;
      const commissions = await storage.getAffiliateCommissions({
        partnerId: partnerId as string,
        status: status as string,
      });
      res.json(commissions);
    } catch (error) {
      console.error("Get commissions error:", error);
      res.status(500).json({ error: "Failed to fetch commissions" });
    }
  });

  // Create commission (webhook endpoint for networks)
  app.post('/api/affiliates/commissions', async (req, res) => {
    try {
      const result = insertAffiliateCommissionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const commission = await storage.createAffiliateCommission(result.data);
      res.json(commission);
    } catch (error) {
      console.error("Create commission error:", error);
      res.status(500).json({ error: "Failed to create commission" });
    }
  });

  // Update commission status
  app.patch('/api/affiliates/commissions/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const commission = await storage.updateCommissionStatus(req.params.id, status);
      res.json(commission);
    } catch (error) {
      console.error("Update commission status error:", error);
      res.status(500).json({ error: "Failed to update commission status" });
    }
  });

  // Get commission summary
  app.get('/api/affiliates/commissions/summary', async (req, res) => {
    try {
      const summary = await storage.getCommissionSummary();
      res.json(summary);
    } catch (error) {
      console.error("Get commission summary error:", error);
      res.status(500).json({ error: "Failed to fetch commission summary" });
    }
  });

  // Get payouts
  app.get('/api/affiliates/payouts', async (req, res) => {
    try {
      const payouts = await storage.getAffiliatePayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Get payouts error:", error);
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // Seed initial affiliate partners (for development)
  app.post('/api/affiliates/seed', async (req, res) => {
    try {
      // Create default networks
      const amazonNetwork = await storage.createAffiliateNetwork({
        name: "Amazon Associates",
        slug: "amazon-associates",
        websiteUrl: "https://affiliate-program.amazon.com",
        trackingParamName: "tag",
        commissionType: "percentage",
        defaultCommissionRate: "4.00",
        paymentThreshold: "10.00",
        paymentFrequency: "monthly",
        isActive: true,
      });

      const cjNetwork = await storage.createAffiliateNetwork({
        name: "CJ Affiliate",
        slug: "cj-affiliate",
        websiteUrl: "https://www.cj.com",
        trackingParamName: "cjid",
        commissionType: "percentage",
        defaultCommissionRate: "5.00",
        paymentThreshold: "50.00",
        paymentFrequency: "monthly",
        isActive: true,
      });

      // Create sample partners
      const partners = [
        {
          name: "Amazon Automotive",
          slug: "amazon",
          category: "parts",
          websiteUrl: "https://www.amazon.com",
          affiliateUrl: "https://www.amazon.com/?tag=garagebot-20",
          networkId: amazonNetwork.id,
          commissionRate: "4.00",
          commissionType: "percentage",
          cookieDuration: 24,
          vehicleTypes: ["car", "truck", "motorcycle", "atv", "boat"],
          partCategories: ["all"],
          hasLocalPickup: false,
          hasApi: true,
          apiStatus: "planned",
          priority: 90,
          isActive: true,
          isFeatured: true,
        },
        {
          name: "RockAuto",
          slug: "rockauto",
          category: "parts",
          websiteUrl: "https://www.rockauto.com",
          commissionRate: "5.00",
          commissionType: "percentage",
          cookieDuration: 30,
          vehicleTypes: ["car", "truck"],
          partCategories: ["oem", "aftermarket"],
          hasLocalPickup: false,
          hasApi: true,
          apiStatus: "planned",
          priority: 85,
          isActive: true,
          isFeatured: true,
        },
        {
          name: "AutoZone",
          slug: "autozone",
          category: "parts",
          websiteUrl: "https://www.autozone.com",
          commissionRate: "3.00",
          commissionType: "percentage",
          cookieDuration: 7,
          vehicleTypes: ["car", "truck", "motorcycle"],
          partCategories: ["oem", "aftermarket", "accessories"],
          hasLocalPickup: true,
          hasApi: false,
          priority: 80,
          isActive: true,
          isFeatured: true,
        },
        {
          name: "O'Reilly Auto Parts",
          slug: "oreilly",
          category: "parts",
          websiteUrl: "https://www.oreillyauto.com",
          commissionRate: "3.00",
          commissionType: "percentage",
          cookieDuration: 7,
          vehicleTypes: ["car", "truck"],
          partCategories: ["oem", "aftermarket", "accessories"],
          hasLocalPickup: true,
          hasApi: false,
          priority: 75,
          isActive: true,
          isFeatured: true,
        },
        {
          name: "Harbor Freight",
          slug: "harbor-freight",
          category: "tools",
          websiteUrl: "https://www.harborfreight.com",
          commissionRate: "4.00",
          commissionType: "percentage",
          cookieDuration: 14,
          vehicleTypes: ["car", "truck", "motorcycle", "atv", "boat"],
          partCategories: ["tools"],
          hasLocalPickup: true,
          hasApi: false,
          priority: 70,
          isActive: true,
          isFeatured: false,
        },
        {
          name: "Chemical Guys",
          slug: "chemical-guys",
          category: "car_care",
          websiteUrl: "https://www.chemicalguys.com",
          commissionRate: "8.00",
          commissionType: "percentage",
          cookieDuration: 30,
          vehicleTypes: ["car", "truck", "motorcycle", "boat"],
          partCategories: ["car_care", "detailing"],
          hasLocalPickup: false,
          hasApi: false,
          priority: 65,
          isActive: true,
          isFeatured: false,
        },
        {
          name: "VMC Chinese Parts",
          slug: "vmc",
          category: "parts",
          websiteUrl: "https://www.vmcchineseparts.com",
          commissionRate: "6.00",
          commissionType: "percentage",
          cookieDuration: 30,
          vehicleTypes: ["atv", "motorcycle", "scooter"],
          partCategories: ["chinese_parts"],
          hasLocalPickup: false,
          hasApi: false,
          priority: 60,
          isActive: true,
          isFeatured: false,
        },
        {
          name: "West Marine",
          slug: "west-marine",
          category: "parts",
          websiteUrl: "https://www.westmarine.com",
          commissionRate: "5.00",
          commissionType: "percentage",
          cookieDuration: 14,
          vehicleTypes: ["boat"],
          partCategories: ["marine_parts", "accessories"],
          hasLocalPickup: true,
          hasApi: false,
          priority: 55,
          isActive: true,
          isFeatured: false,
        },
      ];

      const createdPartners = [];
      for (const partner of partners) {
        const created = await storage.createAffiliatePartner(partner as any);
        createdPartners.push(created);
      }

      res.json({ 
        message: "Affiliate partners seeded successfully",
        networks: 2,
        partners: createdPartners.length
      });
    } catch (error) {
      console.error("Seed affiliates error:", error);
      res.status(500).json({ error: "Failed to seed affiliates" });
    }
  });

  // ============================================
  // DIY REPAIR GUIDES API ROUTES
  // ============================================
  
  // Get all vehicle categories
  app.get("/api/diy-guides/categories", async (req, res) => {
    try {
      const categories = await storage.getVehicleCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching vehicle categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  
  // Get all repair guides with optional filters
  app.get("/api/diy-guides", async (req, res) => {
    try {
      const { category, difficulty, vehicleCategory, systemType, search } = req.query;
      const guides = await storage.getRepairGuides({
        category: category as string,
        difficulty: difficulty as string,
        vehicleCategorySlug: vehicleCategory as string,
        systemType: systemType as string,
        search: search as string,
      });
      
      // Use efficient batch count query (single SQL statement)
      const guideIds = guides.map(g => g.id);
      const stepCounts = await storage.getMultipleGuideStepCounts(guideIds);
      
      // Return guides with step count only (lightweight for catalog view)
      const guidesWithStepCount = guides.map(guide => ({
        ...guide,
        stepCount: stepCounts.get(guide.id) || 0
      }));
      
      res.json(guidesWithStepCount);
    } catch (error) {
      console.error("Error fetching repair guides:", error);
      res.status(500).json({ error: "Failed to fetch guides" });
    }
  });
  
  // Get single repair guide by slug
  app.get("/api/diy-guides/:slug", async (req, res) => {
    try {
      const guide = await storage.getRepairGuideBySlug(req.params.slug);
      if (!guide) {
        return res.status(404).json({ error: "Guide not found" });
      }
      
      // Increment view count
      await storage.incrementGuideViewCount(guide.id);
      
      // Get steps
      const steps = await storage.getGuideSteps(guide.id);
      
      // Get fitment info
      const fitment = await storage.getGuideFitment(guide.id);
      
      res.json({ ...guide, steps, fitment });
    } catch (error) {
      console.error("Error fetching repair guide:", error);
      res.status(500).json({ error: "Failed to fetch guide" });
    }
  });
  
  // Get guides for a specific vehicle in user's garage
  app.get("/api/diy-guides/vehicle/:vehicleId", isAuthenticated, async (req: any, res) => {
    try {
      const guides = await storage.getRepairGuidesForVehicle(req.params.vehicleId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides for vehicle:", error);
      res.status(500).json({ error: "Failed to fetch guides" });
    }
  });
  
  // Rate a guide
  app.post("/api/diy-guides/:guideId/rate", async (req, res) => {
    try {
      const { isHelpful, rating, comment, vehicleYear, vehicleMake, vehicleModel } = req.body;
      const userId = (req as any).user?.claims?.sub;
      
      const guideRating = await storage.createGuideRating({
        guideId: req.params.guideId,
        userId,
        isHelpful,
        rating,
        comment,
        vehicleYear,
        vehicleMake,
        vehicleModel,
      });
      
      res.json(guideRating);
    } catch (error) {
      console.error("Error rating guide:", error);
      res.status(500).json({ error: "Failed to rate guide" });
    }
  });
  
  // Track guide progress
  app.post("/api/diy-guides/:guideId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { currentStep, completedSteps, isCompleted, vehicleId, userNotes } = req.body;
      
      const progress = await storage.upsertGuideProgress({
        guideId: req.params.guideId,
        userId,
        vehicleId,
        currentStep,
        completedSteps,
        isCompleted,
        userNotes,
        completedAt: isCompleted ? new Date() : undefined,
      });
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating guide progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });
  
  // Get user's guide history
  app.get("/api/diy-guides/user/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserGuideHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching guide history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });
  
  // Search terminology
  app.get("/api/diy-guides/terminology/search", async (req, res) => {
    try {
      const { term } = req.query;
      if (!term) {
        return res.status(400).json({ error: "Search term required" });
      }
      const results = await storage.searchTerminology(term as string);
      res.json(results);
    } catch (error) {
      console.error("Error searching terminology:", error);
      res.status(500).json({ error: "Failed to search terminology" });
    }
  });

  // ============================================
  // ADMIN: SEED VEHICLE CATEGORIES
  // ============================================
  
  app.post("/api/admin/seed-vehicle-categories", async (req, res) => {
    try {
      const categories = [
        {
          slug: "car",
          name: "Cars & Sedans",
          description: "Passenger vehicles including sedans, coupes, hatchbacks, and station wagons from all eras",
          icon: "Car",
          yearRangeStart: 1900,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "transmission", "brakes", "suspension", "electrical", "cooling", "fuel", "exhaust", "steering", "hvac"],
          sortOrder: 1,
        },
        {
          slug: "truck",
          name: "Trucks & Pickups",
          description: "Light and medium duty trucks, pickups, and work vehicles",
          icon: "Truck",
          yearRangeStart: 1900,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "transmission", "brakes", "suspension", "electrical", "cooling", "fuel", "exhaust", "4wd", "towing"],
          sortOrder: 2,
        },
        {
          slug: "diesel",
          name: "Diesel & Commercial",
          description: "Heavy duty diesel trucks, semi trucks, buses, and commercial vehicles",
          icon: "Truck",
          yearRangeStart: 1950,
          yearRangeEnd: 2025,
          commonSystems: ["diesel_engine", "turbo", "def_system", "air_brakes", "transmission", "cooling", "fuel", "exhaust", "electrical"],
          sortOrder: 3,
        },
        {
          slug: "suv",
          name: "SUVs & Crossovers",
          description: "Sport utility vehicles, crossovers, and 4x4 vehicles",
          icon: "Car",
          yearRangeStart: 1970,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "transmission", "brakes", "suspension", "electrical", "cooling", "fuel", "4wd", "awd"],
          sortOrder: 4,
        },
        {
          slug: "motorcycle",
          name: "Motorcycles",
          description: "Street bikes, cruisers, sport bikes, touring, and dual-sport motorcycles",
          icon: "Bike",
          yearRangeStart: 1900,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "transmission", "brakes", "chain_drive", "belt_drive", "electrical", "fuel", "suspension", "exhaust"],
          sortOrder: 5,
        },
        {
          slug: "atv",
          name: "ATVs & Quads",
          description: "All-terrain vehicles, four-wheelers, and recreational quads",
          icon: "Bike",
          yearRangeStart: 1970,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "cvt", "brakes", "suspension", "electrical", "fuel", "4wd", "exhaust"],
          sortOrder: 6,
        },
        {
          slug: "utv",
          name: "UTVs & Side-by-Sides",
          description: "Utility task vehicles, side-by-sides, and recreational off-road vehicles",
          icon: "Truck",
          yearRangeStart: 2000,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "cvt", "brakes", "suspension", "electrical", "fuel", "4wd", "steering", "roll_cage"],
          sortOrder: 7,
        },
        {
          slug: "boat",
          name: "Boats & Marine",
          description: "Outboard motors, inboard engines, sterndrives, and personal watercraft",
          icon: "Anchor",
          yearRangeStart: 1950,
          yearRangeEnd: 2025,
          commonSystems: ["outboard", "inboard", "sterndrive", "fuel", "electrical", "cooling", "lower_unit", "propeller", "trailer"],
          sortOrder: 8,
        },
        {
          slug: "rv",
          name: "RVs & Motorhomes",
          description: "Recreational vehicles, motorhomes, travel trailers, and campers",
          icon: "Truck",
          yearRangeStart: 1960,
          yearRangeEnd: 2025,
          commonSystems: ["chassis", "generator", "plumbing", "electrical", "hvac", "propane", "slideout", "leveling", "awning"],
          sortOrder: 9,
        },
        {
          slug: "small-engine",
          name: "Small Engines",
          description: "Lawn mowers, chainsaws, generators, pressure washers, and outdoor power equipment",
          icon: "Wrench",
          yearRangeStart: 1950,
          yearRangeEnd: 2025,
          commonSystems: ["2stroke", "4stroke", "carburetor", "ignition", "fuel", "starter", "blade", "chain"],
          sortOrder: 10,
        },
        {
          slug: "classic",
          name: "Classics & Vintage",
          description: "Antique, classic, and vintage vehicles from the pre-1980s era",
          icon: "Car",
          yearRangeStart: 1900,
          yearRangeEnd: 1989,
          commonSystems: ["carburetor", "points_ignition", "drum_brakes", "manual_steering", "generator", "fuel", "electrical"],
          sortOrder: 11,
        },
        {
          slug: "hotrod",
          name: "Hot Rods & Customs",
          description: "Custom builds, hot rods, engine swaps, and performance modifications",
          icon: "Zap",
          yearRangeStart: 1920,
          yearRangeEnd: 2025,
          commonSystems: ["engine_swap", "custom_exhaust", "suspension", "brakes", "electrical", "fuel", "transmission"],
          sortOrder: 12,
        },
        {
          slug: "exotic",
          name: "Exotics & Supercars",
          description: "High-performance sports cars, supercars, and exotic vehicles",
          icon: "Zap",
          yearRangeStart: 1960,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "transmission", "brakes", "suspension", "electrical", "cooling", "aero", "electronics"],
          sortOrder: 13,
        },
        {
          slug: "chinese-import",
          name: "Chinese Imports",
          description: "Budget ATVs, scooters, mini bikes, and pit bikes from Chinese manufacturers",
          icon: "Bike",
          yearRangeStart: 2000,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "carburetor", "cdi", "electrical", "fuel", "brakes", "suspension"],
          sortOrder: 14,
        },
        {
          slug: "scooter",
          name: "Scooters & Mopeds",
          description: "Motor scooters, mopeds, and electric scooters",
          icon: "Bike",
          yearRangeStart: 1950,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "cvt", "brakes", "electrical", "fuel", "carburetor", "starter"],
          sortOrder: 15,
        },
        {
          slug: "snowmobile",
          name: "Snowmobiles",
          description: "Snowmobiles and snow machines for winter recreation",
          icon: "Bike",
          yearRangeStart: 1960,
          yearRangeEnd: 2025,
          commonSystems: ["engine", "track", "suspension", "fuel", "electrical", "cooling", "exhaust"],
          sortOrder: 16,
        },
        {
          slug: "jet-ski",
          name: "Jet Skis & PWC",
          description: "Personal watercraft, jet skis, and wave runners",
          icon: "Anchor",
          yearRangeStart: 1970,
          yearRangeEnd: 2025,
          commonSystems: ["jet_pump", "engine", "fuel", "electrical", "hull", "steering", "cooling"],
          sortOrder: 17,
        },
        {
          slug: "golf-cart",
          name: "Golf Carts & LSVs",
          description: "Golf carts, low-speed vehicles, and neighborhood electric vehicles",
          icon: "Car",
          yearRangeStart: 1960,
          yearRangeEnd: 2025,
          commonSystems: ["electric_motor", "batteries", "charger", "controller", "brakes", "steering", "gas_engine"],
          sortOrder: 18,
        },
      ];

      const createdCategories = [];
      for (const category of categories) {
        try {
          const created = await storage.createVehicleCategory(category);
          createdCategories.push(created);
        } catch (e: any) {
          // Skip duplicates
          if (!e.message?.includes('duplicate')) {
            console.error("Error creating category:", category.slug, e);
          }
        }
      }

      res.json({ 
        message: "Vehicle categories seeded successfully",
        count: createdCategories.length
      });
    } catch (error) {
      console.error("Seed vehicle categories error:", error);
      res.status(500).json({ error: "Failed to seed vehicle categories" });
    }
  });

  // ============================================
  // ADMIN: SEED PART TERMINOLOGY
  // ============================================
  
  app.post("/api/admin/seed-terminology", async (req, res) => {
    try {
      const terminology = [
        {
          canonicalName: "differential_fluid",
          displayName: "Differential Fluid / Gear Oil",
          description: "Lubricant for differential gears and bearings",
          autoTerms: ["differential fluid", "diff fluid", "gear oil", "rear end fluid", "pumpkin fluid"],
          marineTerms: ["lower unit oil", "gear lube", "gear case oil", "outboard gear oil"],
          motorcycleTerms: ["final drive oil", "shaft drive fluid", "bevel gear oil"],
          atvTerms: ["differential oil", "front diff fluid", "rear diff fluid"],
          dieselTerms: ["differential lubricant", "axle fluid"],
          allTerms: ["differential fluid", "diff fluid", "gear oil", "lower unit oil", "gear lube", "final drive oil"],
          partCategory: "fluids",
          systemType: "drivetrain",
        },
        {
          canonicalName: "spark_plug",
          displayName: "Spark Plug",
          description: "Ignition component that creates spark to ignite fuel",
          autoTerms: ["spark plug", "sparking plug", "ignition plug"],
          marineTerms: ["marine spark plug", "outboard spark plug", "boat spark plug"],
          motorcycleTerms: ["motorcycle spark plug", "bike plug"],
          smallEngineTerms: ["small engine plug", "lawn mower plug", "chainsaw plug"],
          atvTerms: ["atv spark plug", "quad plug"],
          allTerms: ["spark plug", "sparking plug", "ignition plug", "plug"],
          partCategory: "ignition",
          systemType: "ignition",
        },
        {
          canonicalName: "oil_filter",
          displayName: "Oil Filter",
          description: "Filters contaminants from engine oil",
          autoTerms: ["oil filter", "engine oil filter", "motor oil filter"],
          marineTerms: ["marine oil filter", "boat oil filter", "outboard oil filter"],
          motorcycleTerms: ["motorcycle oil filter", "bike oil filter"],
          smallEngineTerms: ["small engine oil filter"],
          dieselTerms: ["diesel oil filter", "heavy duty oil filter"],
          allTerms: ["oil filter", "engine oil filter", "lube filter"],
          partCategory: "filters",
          systemType: "lubrication",
        },
        {
          canonicalName: "fuel_filter",
          displayName: "Fuel Filter",
          description: "Filters contaminants from fuel before reaching engine",
          autoTerms: ["fuel filter", "gas filter", "inline fuel filter"],
          marineTerms: ["marine fuel filter", "fuel water separator", "boat fuel filter", "racor filter"],
          motorcycleTerms: ["motorcycle fuel filter", "inline fuel filter"],
          smallEngineTerms: ["small engine fuel filter", "carburetor fuel filter"],
          dieselTerms: ["diesel fuel filter", "fuel water separator", "primary fuel filter", "secondary fuel filter"],
          allTerms: ["fuel filter", "gas filter", "fuel water separator", "inline filter"],
          partCategory: "filters",
          systemType: "fuel",
        },
        {
          canonicalName: "belt",
          displayName: "Drive Belt / Serpentine Belt",
          description: "Belt that drives accessories from engine crankshaft",
          autoTerms: ["serpentine belt", "drive belt", "accessory belt", "v-belt", "fan belt"],
          marineTerms: ["raw water pump belt", "alternator belt", "marine drive belt"],
          motorcycleTerms: ["drive belt", "final drive belt"],
          smallEngineTerms: ["deck belt", "drive belt", "mower belt", "auger belt"],
          atvTerms: ["cvt belt", "drive belt", "clutch belt"],
          allTerms: ["serpentine belt", "drive belt", "v-belt", "fan belt", "cvt belt", "deck belt"],
          partCategory: "belts",
          systemType: "accessory_drive",
        },
        {
          canonicalName: "coolant",
          displayName: "Coolant / Antifreeze",
          description: "Liquid that regulates engine temperature",
          autoTerms: ["coolant", "antifreeze", "engine coolant", "radiator fluid"],
          marineTerms: ["marine coolant", "boat antifreeze", "closed cooling fluid"],
          motorcycleTerms: ["motorcycle coolant", "bike coolant"],
          dieselTerms: ["heavy duty coolant", "extended life coolant", "eld coolant"],
          rvTerms: ["rv antifreeze", "non-toxic antifreeze", "potable antifreeze"],
          allTerms: ["coolant", "antifreeze", "radiator fluid", "engine coolant"],
          partCategory: "fluids",
          systemType: "cooling",
        },
        {
          canonicalName: "brake_pads",
          displayName: "Brake Pads",
          description: "Friction material that presses against rotor to slow vehicle",
          autoTerms: ["brake pads", "disc brake pads", "front brake pads", "rear brake pads"],
          motorcycleTerms: ["motorcycle brake pads", "sintered pads", "organic pads"],
          atvTerms: ["atv brake pads", "quad brake pads"],
          dieselTerms: ["heavy duty brake pads", "air disc brake pads"],
          allTerms: ["brake pads", "disc brake pads", "friction pads"],
          partCategory: "brakes",
          systemType: "brakes",
        },
        {
          canonicalName: "air_filter",
          displayName: "Air Filter",
          description: "Filters air entering engine intake",
          autoTerms: ["air filter", "engine air filter", "intake filter"],
          marineTerms: ["marine air filter", "flame arrestor"],
          motorcycleTerms: ["motorcycle air filter", "pod filter", "k&n filter"],
          smallEngineTerms: ["small engine air filter", "foam filter", "pre-filter"],
          dieselTerms: ["diesel air filter", "heavy duty air filter", "intake filter"],
          allTerms: ["air filter", "engine air filter", "intake filter", "foam filter"],
          partCategory: "filters",
          systemType: "intake",
        },
        {
          canonicalName: "impeller",
          displayName: "Impeller / Water Pump Impeller",
          description: "Rotating component that moves water for cooling",
          autoTerms: ["water pump impeller", "coolant pump"],
          marineTerms: ["impeller", "raw water impeller", "outboard impeller", "water pump impeller", "cooling impeller"],
          jetSkiTerms: ["jet pump impeller", "wear ring"],
          dieselTerms: ["water pump impeller", "coolant pump impeller"],
          allTerms: ["impeller", "water pump impeller", "raw water impeller", "cooling impeller"],
          partCategory: "cooling",
          systemType: "cooling",
        },
        {
          canonicalName: "propeller",
          displayName: "Propeller / Prop",
          description: "Rotating blades that propel boat through water",
          marineTerms: ["propeller", "prop", "boat prop", "outboard prop", "stainless prop", "aluminum prop"],
          allTerms: ["propeller", "prop", "boat propeller"],
          partCategory: "propulsion",
          systemType: "drivetrain",
        },
      ];

      const createdTerms = [];
      for (const term of terminology) {
        try {
          const created = await storage.createPartTerminology(term as any);
          createdTerms.push(created);
        } catch (e: any) {
          if (!e.message?.includes('duplicate')) {
            console.error("Error creating terminology:", term.canonicalName, e);
          }
        }
      }

      res.json({ 
        message: "Part terminology seeded successfully",
        count: createdTerms.length
      });
    } catch (error) {
      console.error("Seed terminology error:", error);
      res.status(500).json({ error: "Failed to seed terminology" });
    }
  });

  // ============================================
  // ADMIN: SEED DIY REPAIR GUIDES
  // ============================================
  
  app.post("/api/admin/seed-diy-guides", async (req, res) => {
    try {
      const guides = [
        {
          title: "How to Change Your Engine Oil",
          slug: "change-engine-oil",
          description: "Complete step-by-step guide to changing your engine oil and filter. One of the most important maintenance tasks to extend engine life.",
          category: "car",
          difficulty: "beginner",
          estimatedTimeMinutes: 30,
          partsCost: "25-60",
          toolsRequired: ["Oil drain pan", "Socket wrench set", "Oil filter wrench", "Funnel", "Jack and jack stands", "Gloves", "Rags"],
          partsRequired: ["Engine oil (check owner's manual for quantity)", "Oil filter"],
          safetyWarnings: ["Never work under a vehicle supported only by a jack", "Allow engine to cool before starting", "Dispose of used oil properly at a recycling center"],
          youtubeSearchTerm: "how to change engine oil DIY",
          tags: ["oil change", "maintenance", "beginner", "essential"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Gather Materials", description: "Get the correct oil type and quantity from your owner's manual. Buy a new oil filter that matches your vehicle.", pro_tips: "Check YouTube for your specific year/make/model for oil capacity", warnings: null },
            { stepNumber: 2, title: "Warm Up Engine", description: "Run the engine for 2-3 minutes to warm the oil. Warm oil drains faster and more completely.", pro_tips: "Don't get it too hot - you'll be working near hot components", warnings: "Hot oil and components can cause burns" },
            { stepNumber: 3, title: "Raise Vehicle Safely", description: "Use a jack to raise the front of the vehicle and secure it on jack stands. Never rely on the jack alone.", pro_tips: "Use wheel chocks on the rear tires", warnings: "Ensure vehicle is stable before going underneath" },
            { stepNumber: 4, title: "Locate Drain Plug", description: "Find the oil drain plug on the bottom of the oil pan. It's usually a single bolt at the lowest point.", pro_tips: "Take a photo before you start so you know the original position", warnings: null },
            { stepNumber: 5, title: "Drain the Oil", description: "Place drain pan under plug. Remove plug with socket wrench, letting oil drain completely (5-10 min).", pro_tips: "The oil may spray out initially - position the pan accordingly", warnings: "Oil may be hot" },
            { stepNumber: 6, title: "Replace Oil Filter", description: "Locate and remove old filter. Apply thin layer of new oil to new filter gasket. Install new filter hand-tight.", pro_tips: "Don't over-tighten the filter - hand tight plus 3/4 turn is usually enough", warnings: null },
            { stepNumber: 7, title: "Reinstall Drain Plug", description: "Wipe the drain plug clean. Install with new washer if included. Tighten securely but don't over-torque.", pro_tips: "Many drain plugs are 17mm or 19mm", warnings: "Over-tightening can strip threads" },
            { stepNumber: 8, title: "Add New Oil", description: "Lower vehicle. Remove oil filler cap and add new oil through funnel. Check dipstick for proper level.", pro_tips: "Add about 3/4 of the total capacity, then check and add more as needed", warnings: null },
            { stepNumber: 9, title: "Check for Leaks", description: "Start engine and let idle for 1 minute. Check under vehicle for any leaks at drain plug or filter.", pro_tips: "It's normal for oil pressure light to take a few seconds to go off", warnings: null },
            { stepNumber: 10, title: "Final Check", description: "Turn off engine, wait 2 minutes, recheck oil level. Add more if needed. Record mileage for next change.", pro_tips: "Most vehicles take oil changes every 5,000-7,500 miles with synthetic oil", warnings: null },
          ]
        },
        {
          title: "How to Replace Brake Pads",
          slug: "replace-brake-pads",
          description: "Learn how to safely replace your front disc brake pads. Save money and ensure your brakes are working properly.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 60,
          partsCost: "30-80",
          toolsRequired: ["C-clamp or brake piston tool", "Socket wrench set", "Lug wrench", "Jack and jack stands", "Brake cleaner", "Wire brush", "Gloves"],
          partsRequired: ["Brake pads (axle set)", "Brake pad grease (optional)"],
          safetyWarnings: ["Support vehicle securely on jack stands", "Never use compressed air on brake dust - it may contain asbestos", "Don't let vehicle roll - use parking brake and wheel chocks"],
          youtubeSearchTerm: "how to replace brake pads DIY",
          tags: ["brakes", "safety", "intermediate", "essential"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Loosen Lug Nuts", description: "While vehicle is on the ground, slightly loosen the lug nuts on the wheel you're working on.", pro_tips: "Don't remove them completely yet", warnings: null },
            { stepNumber: 2, title: "Raise and Secure Vehicle", description: "Jack up the vehicle and place it securely on jack stands. Remove the wheel.", pro_tips: "Work on one side at a time so you have a reference", warnings: "Ensure vehicle is stable" },
            { stepNumber: 3, title: "Remove Caliper", description: "Locate the caliper bolts (usually two bolts on the back). Remove them and carefully lift the caliper off the rotor.", pro_tips: "Use a wire or bungee to hang the caliper - don't let it hang by the brake line", warnings: "Never let caliper hang by brake hose" },
            { stepNumber: 4, title: "Remove Old Pads", description: "Slide the old brake pads out of the caliper bracket. Note how they're positioned.", pro_tips: "Take a photo for reference", warnings: null },
            { stepNumber: 5, title: "Compress the Piston", description: "Use a C-clamp or brake piston tool to push the caliper piston back into the housing.", pro_tips: "Open the brake fluid reservoir cap to prevent pressure buildup", warnings: "Watch brake fluid level - it may overflow as you compress" },
            { stepNumber: 6, title: "Install New Pads", description: "Slide the new brake pads into position. Apply brake grease to the back of pads if included.", pro_tips: "Make sure any wear indicators are positioned correctly", warnings: null },
            { stepNumber: 7, title: "Reinstall Caliper", description: "Lower the caliper back over the new pads and rotor. Reinstall and tighten the caliper bolts.", pro_tips: "Torque to manufacturer specs if you have a torque wrench", warnings: null },
            { stepNumber: 8, title: "Reinstall Wheel", description: "Put the wheel back on and hand-tighten the lug nuts in a star pattern.", pro_tips: "Final torque after lowering the vehicle", warnings: null },
            { stepNumber: 9, title: "Pump the Brakes", description: "Before driving, pump the brake pedal several times until it feels firm.", pro_tips: "This seats the pads against the rotor", warnings: "Vehicle will not stop properly until pedal is firm" },
            { stepNumber: 10, title: "Break In New Pads", description: "Drive gently for the first 100-200 miles, avoiding hard braking to properly bed the pads.", pro_tips: "You may hear some squeaking initially - this is normal", warnings: null },
          ]
        },
        {
          title: "How to Replace an Air Filter",
          slug: "replace-air-filter",
          description: "Quick and easy guide to replacing your engine air filter. Improves fuel economy and engine performance.",
          category: "car",
          difficulty: "beginner",
          estimatedTimeMinutes: 10,
          partsCost: "15-40",
          toolsRequired: ["Screwdriver (may not be needed)", "Shop vacuum (optional)"],
          partsRequired: ["Engine air filter"],
          safetyWarnings: ["Make sure engine is off and cool"],
          youtubeSearchTerm: "how to replace engine air filter DIY",
          tags: ["air filter", "maintenance", "beginner", "quick"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Locate Air Filter Box", description: "Find the air filter housing - it's usually a black plastic box near the engine with a large hose attached.", pro_tips: "Check your owner's manual if you can't find it", warnings: null },
            { stepNumber: 2, title: "Open the Housing", description: "Unclip the clips or unscrew the screws holding the air filter housing lid in place.", pro_tips: "Some vehicles have spring clips, others have screws", warnings: null },
            { stepNumber: 3, title: "Remove Old Filter", description: "Lift out the old air filter and note which direction it was installed.", pro_tips: "Check for debris or leaves that may have gotten into the housing", warnings: null },
            { stepNumber: 4, title: "Clean Housing", description: "Wipe out the inside of the housing with a clean cloth. Remove any debris.", pro_tips: "Use a vacuum if there's a lot of dirt", warnings: null },
            { stepNumber: 5, title: "Install New Filter", description: "Place the new filter in the housing, matching the orientation of the old one.", pro_tips: "Make sure it's seated properly with no gaps around the edges", warnings: null },
            { stepNumber: 6, title: "Close Housing", description: "Replace the lid and secure all clips or screws. Make sure it's sealed properly.", pro_tips: "A poor seal lets unfiltered air into your engine", warnings: null },
          ]
        },
        {
          title: "How to Replace Spark Plugs",
          slug: "replace-spark-plugs",
          description: "Step-by-step guide to replacing spark plugs for better fuel economy and engine performance.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 45,
          partsCost: "20-80",
          toolsRequired: ["Spark plug socket", "Ratchet with extensions", "Gap gauge", "Torque wrench (recommended)", "Anti-seize compound", "Dielectric grease"],
          partsRequired: ["Spark plugs (set for your engine)"],
          safetyWarnings: ["Work on a cold engine only", "Don't drop anything into spark plug holes"],
          youtubeSearchTerm: "how to replace spark plugs DIY",
          tags: ["spark plugs", "ignition", "tune-up", "intermediate"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Cool Engine Completely", description: "Make sure the engine is cold. Working on a hot engine can damage threads.", pro_tips: "Wait at least 2 hours after driving", warnings: "Hot engines can cause burns and thread damage" },
            { stepNumber: 2, title: "Remove Engine Cover", description: "If your engine has a plastic cover, remove it to access the spark plugs.", pro_tips: "Take photos of any hose or wire routing", warnings: null },
            { stepNumber: 3, title: "Disconnect Coil/Wire", description: "For each spark plug, disconnect the ignition coil or spark plug wire.", pro_tips: "Work on one plug at a time to avoid mixing up wires", warnings: null },
            { stepNumber: 4, title: "Remove Spark Plug", description: "Use a spark plug socket with extension to unscrew the old spark plug.", pro_tips: "If it's stuck, apply penetrating oil and wait 10 minutes", warnings: "Don't force a stuck plug - you may break it" },
            { stepNumber: 5, title: "Check Gap", description: "Verify the new spark plug gap matches your vehicle's specification.", pro_tips: "Gap is usually on a sticker under the hood or in the manual", warnings: null },
            { stepNumber: 6, title: "Install New Plug", description: "Apply anti-seize to threads. Hand-start the plug, then torque to spec.", pro_tips: "For aluminum heads, torque is usually 12-18 ft-lbs", warnings: "Cross-threading destroys the cylinder head" },
            { stepNumber: 7, title: "Reconnect Coil/Wire", description: "Apply dielectric grease to the boot and reconnect the coil or wire.", pro_tips: "You should feel/hear it click into place", warnings: null },
            { stepNumber: 8, title: "Repeat for All Plugs", description: "Complete the same process for each remaining spark plug.", pro_tips: "Keep track of which plugs you've done", warnings: null },
            { stepNumber: 9, title: "Reinstall Cover", description: "Put the engine cover back on and ensure everything is connected.", pro_tips: "Double-check all connections before starting", warnings: null },
            { stepNumber: 10, title: "Test", description: "Start the engine and check for smooth idle. No misfires should occur.", pro_tips: "If engine runs rough, recheck your work", warnings: null },
          ]
        },
        {
          title: "How to Replace Windshield Wipers",
          slug: "replace-windshield-wipers",
          description: "Quick guide to replacing windshield wiper blades for better visibility in rain and snow.",
          category: "car",
          difficulty: "beginner",
          estimatedTimeMinutes: 5,
          partsCost: "15-40",
          toolsRequired: ["None usually required"],
          partsRequired: ["Wiper blades (pair)", "Rear wiper blade (if applicable)"],
          safetyWarnings: ["Be careful not to let the wiper arm snap back against the windshield"],
          youtubeSearchTerm: "how to replace windshield wipers DIY",
          tags: ["wipers", "visibility", "beginner", "quick"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Lift Wiper Arm", description: "Pull the wiper arm away from the windshield until it stays up on its own.", pro_tips: "Place a towel on the windshield in case the arm snaps back", warnings: "Arm can crack windshield if it snaps down" },
            { stepNumber: 2, title: "Find Release Tab", description: "Locate the release mechanism where the blade attaches to the arm. Usually a tab or button.", pro_tips: "Look at the new blade to understand the attachment type", warnings: null },
            { stepNumber: 3, title: "Remove Old Blade", description: "Press or pull the release and slide the old blade off the arm.", pro_tips: "Different brands use different attachment styles", warnings: null },
            { stepNumber: 4, title: "Attach New Blade", description: "Slide the new blade onto the arm until it clicks into place.", pro_tips: "Most new blades come with adapters for different arm styles", warnings: null },
            { stepNumber: 5, title: "Lower Arm Carefully", description: "Gently lower the wiper arm back to the windshield.", pro_tips: "Don't let it snap down", warnings: null },
            { stepNumber: 6, title: "Test Wipers", description: "Turn on the wipers and spray washer fluid to test for smooth, streak-free operation.", pro_tips: "New blades may squeak initially", warnings: null },
          ]
        },
        {
          title: "How to Change Outboard Lower Unit Oil",
          slug: "change-lower-unit-oil",
          description: "Essential maintenance for outboard motors. Protect your lower unit gears and bearings by changing the gear oil regularly.",
          category: "boat",
          difficulty: "beginner",
          estimatedTimeMinutes: 20,
          partsCost: "10-25",
          toolsRequired: ["Gear lube pump or squeeze bottle", "Drain pan", "Screwdriver or socket set", "Rags"],
          partsRequired: ["Lower unit gear oil (check manufacturer spec)", "Drain/fill plug gaskets"],
          safetyWarnings: ["Check drained oil for water or metal shavings which indicate problems"],
          youtubeSearchTerm: "how to change outboard lower unit oil",
          tags: ["marine", "outboard", "lower unit", "gear oil", "maintenance"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Position Motor", description: "Tilt the outboard to vertical position. Place drain pan underneath lower unit.", pro_tips: "Let motor cool if recently run", warnings: null },
            { stepNumber: 2, title: "Remove Drain Plug", description: "Remove the bottom drain/fill plug on the lower unit. Oil will start draining.", pro_tips: "This is usually on the side, near the prop", warnings: null },
            { stepNumber: 3, title: "Remove Vent Plug", description: "Remove the upper vent plug to allow air in and speed up draining.", pro_tips: "Oil should flow freely now", warnings: null },
            { stepNumber: 4, title: "Inspect Old Oil", description: "Check drained oil for milky color (water intrusion) or metal particles (gear wear).", pro_tips: "Clean oil is normal. Milky oil means seal problems", warnings: "Water in oil requires seal replacement" },
            { stepNumber: 5, title: "Fill with New Oil", description: "Insert gear oil tube into BOTTOM plug hole. Pump oil up until it comes out the top vent hole.", pro_tips: "Filling from bottom pushes air out the top", warnings: null },
            { stepNumber: 6, title: "Install Vent Plug", description: "While oil is still coming out top hole, install the vent plug with new gasket.", pro_tips: "This traps oil in with minimal air", warnings: null },
            { stepNumber: 7, title: "Install Drain Plug", description: "Quickly remove fill tube and install bottom plug with new gasket.", pro_tips: "Some oil loss is normal", warnings: null },
            { stepNumber: 8, title: "Wipe Clean", description: "Clean any spilled oil from the lower unit housing.", pro_tips: "Check for leaks after first use", warnings: null },
          ]
        },
        {
          title: "How to Change Motorcycle Oil",
          slug: "change-motorcycle-oil",
          description: "Complete guide to changing oil in your motorcycle. Includes drain plug and filter replacement.",
          category: "motorcycle",
          difficulty: "beginner",
          estimatedTimeMinutes: 30,
          partsCost: "25-50",
          toolsRequired: ["Socket set or wrenches", "Oil filter wrench", "Drain pan", "Funnel", "Torque wrench (recommended)"],
          partsRequired: ["Motorcycle oil (check manual for type and quantity)", "Oil filter", "Drain plug washer"],
          safetyWarnings: ["Ensure motorcycle is on center stand or securely supported", "Hot oil can cause burns"],
          youtubeSearchTerm: "how to change motorcycle oil DIY",
          tags: ["motorcycle", "oil change", "maintenance", "beginner"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Warm Up Engine", description: "Run the engine for 2-3 minutes to warm the oil. This helps it drain better.", pro_tips: "Don't get it too hot", warnings: "Be careful of hot pipes" },
            { stepNumber: 2, title: "Position Motorcycle", description: "Place bike on center stand or secure on a lift. Ensure it's level.", pro_tips: "Level bike ensures accurate oil level reading later", warnings: null },
            { stepNumber: 3, title: "Locate Drain Plug", description: "Find the oil drain plug on the bottom of the engine. Place drain pan underneath.", pro_tips: "Some bikes have multiple drain plugs", warnings: null },
            { stepNumber: 4, title: "Drain Oil", description: "Remove drain plug and let oil drain completely. This takes 5-10 minutes.", pro_tips: "Tilt bike slightly to get more oil out", warnings: "Oil may be hot" },
            { stepNumber: 5, title: "Replace Oil Filter", description: "Locate and remove old oil filter. Apply thin layer of oil to new filter gasket. Install hand-tight.", pro_tips: "Some filters are internal and require cover removal", warnings: null },
            { stepNumber: 6, title: "Reinstall Drain Plug", description: "Install drain plug with new crush washer. Torque to spec.", pro_tips: "Over-tightening can strip threads", warnings: null },
            { stepNumber: 7, title: "Add New Oil", description: "Remove oil filler cap. Add new oil through funnel. Check level on sight glass or dipstick.", pro_tips: "Add slightly less than full capacity, then check and add more", warnings: null },
            { stepNumber: 8, title: "Check for Leaks", description: "Start engine briefly. Check for leaks at drain plug and filter.", pro_tips: "Oil light should go off within seconds", warnings: null },
            { stepNumber: 9, title: "Final Level Check", description: "Turn off engine. Wait 2 minutes. Recheck oil level and top off if needed.", pro_tips: "Record mileage for next change", warnings: null },
          ]
        },
        {
          title: "How to Change ATV Oil",
          slug: "change-atv-oil",
          description: "Step-by-step guide to changing oil in your ATV or quad. Essential maintenance for off-road reliability.",
          category: "atv",
          difficulty: "beginner",
          estimatedTimeMinutes: 25,
          partsCost: "20-40",
          toolsRequired: ["Socket set", "Oil filter wrench", "Drain pan", "Funnel"],
          partsRequired: ["ATV oil (check manual for type)", "Oil filter", "Drain plug gasket"],
          safetyWarnings: ["Ensure ATV is on level ground and stable", "Dispose of oil properly"],
          youtubeSearchTerm: "how to change ATV oil DIY",
          tags: ["atv", "oil change", "off-road", "maintenance"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Warm Engine", description: "Run the ATV for a few minutes to warm the oil.", pro_tips: "This helps oil drain more completely", warnings: null },
            { stepNumber: 2, title: "Position ATV", description: "Park on level ground. Put in neutral and engage parking brake.", pro_tips: "Use wheel chocks for extra stability", warnings: null },
            { stepNumber: 3, title: "Locate Drain Plug", description: "Find the oil drain plug on the engine. It's usually on the bottom or side.", pro_tips: "Check your manual for exact location", warnings: null },
            { stepNumber: 4, title: "Drain Oil", description: "Place pan under engine. Remove drain plug and let oil drain completely.", pro_tips: "Let it drain for at least 5 minutes", warnings: "Oil may be hot" },
            { stepNumber: 5, title: "Change Oil Filter", description: "Locate and replace the oil filter. Apply oil to new filter gasket.", pro_tips: "Some ATVs have screen filters that just need cleaning", warnings: null },
            { stepNumber: 6, title: "Reinstall Drain Plug", description: "Clean and reinstall drain plug with new gasket if needed.", pro_tips: "Tighten securely but don't over-torque", warnings: null },
            { stepNumber: 7, title: "Add New Oil", description: "Add the correct type and amount of oil. Check your owner's manual.", pro_tips: "ATVs typically take 1.5-2.5 quarts", warnings: null },
            { stepNumber: 8, title: "Check Level", description: "Start briefly, then check dipstick or sight glass. Add more if needed.", pro_tips: "Recheck after first ride", warnings: null },
          ]
        },
        {
          title: "How to Winterize a Lawn Mower",
          slug: "winterize-lawn-mower",
          description: "Prepare your lawn mower for winter storage to ensure it starts easily next spring.",
          category: "small-engine",
          difficulty: "beginner",
          estimatedTimeMinutes: 30,
          partsCost: "10-20",
          toolsRequired: ["Fuel stabilizer", "Drain pan", "Spark plug wrench", "Brush", "Oil for fogging (optional)"],
          partsRequired: ["Fuel stabilizer", "Fresh oil"],
          safetyWarnings: ["Work in well-ventilated area", "Disconnect spark plug before working on blade area"],
          youtubeSearchTerm: "how to winterize lawn mower DIY",
          tags: ["lawn mower", "winterize", "storage", "small engine"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Add Fuel Stabilizer", description: "Add fuel stabilizer to the gas tank according to package directions.", pro_tips: "Run engine for 5 minutes to circulate stabilizer", warnings: null },
            { stepNumber: 2, title: "Change Oil", description: "Drain old oil and replace with fresh oil. Dispose of old oil properly.", pro_tips: "Fresh oil protects during storage", warnings: null },
            { stepNumber: 3, title: "Clean Air Filter", description: "Remove and clean or replace the air filter.", pro_tips: "A clean filter means easier starting in spring", warnings: null },
            { stepNumber: 4, title: "Disconnect Spark Plug", description: "Remove the spark plug wire for safety. Inspect and clean or replace plug.", pro_tips: "Gap new plugs to manufacturer spec", warnings: null },
            { stepNumber: 5, title: "Clean Deck", description: "Scrape grass buildup from under the mower deck.", pro_tips: "A putty knife works well for this", warnings: "Blade can be sharp" },
            { stepNumber: 6, title: "Inspect Blade", description: "Check blade condition. Sharpen or replace if needed.", pro_tips: "A sharp blade makes clean cuts", warnings: null },
            { stepNumber: 7, title: "Fog Engine (Optional)", description: "Spray fogging oil into carburetor while running, then shut off.", pro_tips: "This coats internal parts for rust prevention", warnings: null },
            { stepNumber: 8, title: "Store Properly", description: "Store in a dry location. Cover to protect from dust.", pro_tips: "Don't store where gas fumes could accumulate near ignition sources", warnings: null },
          ]
        },
        {
          title: "How to Flush RV Water Heater",
          slug: "flush-rv-water-heater",
          description: "Annual maintenance to remove sediment and keep your RV water heater working efficiently.",
          category: "rv",
          difficulty: "beginner",
          estimatedTimeMinutes: 30,
          partsCost: "5-15",
          toolsRequired: ["Anode rod wrench", "Garden hose", "Water heater wand (optional)", "Teflon tape"],
          partsRequired: ["Replacement anode rod (if needed)", "Teflon tape"],
          safetyWarnings: ["Turn off water heater and let cool before draining", "Turn off propane and/or electric heating elements"],
          youtubeSearchTerm: "how to flush RV water heater",
          tags: ["rv", "water heater", "maintenance", "flush"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Turn Off Heater", description: "Turn off the water heater - both propane and electric if equipped.", pro_tips: "Do this at least 12 hours before to let water cool", warnings: "Hot water can cause severe burns" },
            { stepNumber: 2, title: "Turn Off Water", description: "Turn off water supply to the RV and relieve pressure by opening a faucet.", pro_tips: "Open both hot and cold to equalize pressure", warnings: null },
            { stepNumber: 3, title: "Remove Drain Plug", description: "Remove the anode rod or drain plug from the water heater tank.", pro_tips: "Have a bucket ready - 6-10 gallons will drain out", warnings: "Stand clear of the drain" },
            { stepNumber: 4, title: "Flush Tank", description: "Use a water heater wand or garden hose to flush sediment from inside the tank.", pro_tips: "Continue until water runs clear", warnings: null },
            { stepNumber: 5, title: "Inspect Anode Rod", description: "Check the anode rod for corrosion. Replace if more than 50% eroded.", pro_tips: "A healthy rod protects the tank from rust", warnings: null },
            { stepNumber: 6, title: "Reinstall Plug", description: "Apply Teflon tape and reinstall anode rod or drain plug.", pro_tips: "Don't over-tighten plastic fittings", warnings: null },
            { stepNumber: 7, title: "Refill Tank", description: "Turn on water supply. Open a hot faucet and wait until water flows steadily.", pro_tips: "This removes air from the system", warnings: null },
            { stepNumber: 8, title: "Turn On Heater", description: "Once tank is full and no air sputters from faucet, turn heater back on.", pro_tips: "Check for leaks at drain plug", warnings: null },
          ]
        },
        {
          title: "How to Check and Add Diesel Exhaust Fluid (DEF)",
          slug: "check-add-def-fluid",
          description: "Quick guide to checking and adding DEF in diesel vehicles. Essential for emissions system operation.",
          category: "diesel",
          difficulty: "beginner",
          estimatedTimeMinutes: 5,
          partsCost: "10-30",
          toolsRequired: ["Funnel (optional)", "Rag"],
          partsRequired: ["DEF fluid (2.5 gallon jug is common)"],
          safetyWarnings: ["DEF is non-toxic but can stain paint if spilled", "Don't mix DEF with diesel fuel"],
          youtubeSearchTerm: "how to add DEF fluid diesel truck",
          tags: ["diesel", "def", "emissions", "maintenance"],
          isPopular: true,
          isPremium: false,
          steps: [
            { stepNumber: 1, title: "Locate DEF Tank", description: "Find the DEF tank filler. It usually has a blue cap, separate from the fuel filler.", pro_tips: "Common locations: next to fuel filler, under hood, or in trunk/bed area", warnings: null },
            { stepNumber: 2, title: "Check Level", description: "Your dashboard will show DEF level. Most vehicles alert you at 1000 miles remaining.", pro_tips: "Don't ignore low DEF warnings - vehicle may not start", warnings: null },
            { stepNumber: 3, title: "Open DEF Cap", description: "Remove the blue DEF filler cap. Some twist off, others pop up.", pro_tips: "Keep cap clean", warnings: null },
            { stepNumber: 4, title: "Add DEF", description: "Pour DEF slowly into the filler. Most tanks hold 4-7 gallons.", pro_tips: "Use a funnel to avoid spills on paint", warnings: "Don't overfill" },
            { stepNumber: 5, title: "Replace Cap", description: "Secure the DEF cap back in place. Check for any spills.", pro_tips: "Rinse any spills with water immediately", warnings: null },
            { stepNumber: 6, title: "Verify Level", description: "Start the vehicle and check that DEF level now shows adequate.", pro_tips: "Level may take a moment to update", warnings: null },
          ]
        },
        // ============================================
        // PRO-TIER INTERMEDIATE/ADVANCED GUIDES
        // ============================================
        
        // CAR - INTERMEDIATE/ADVANCED
        {
          title: "How to Replace O2 Sensors",
          slug: "replace-o2-sensors",
          description: "Fix check engine lights and improve fuel economy by replacing oxygen sensors. A common repair that saves trips to the mechanic.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 45,
          partsCost: "30-150",
          toolsRequired: ["O2 sensor socket", "Ratchet with extensions", "Penetrating oil", "Jack and jack stands", "Safety glasses"],
          partsRequired: ["O2 sensor (upstream or downstream as needed)", "Anti-seize compound"],
          safetyWarnings: ["Work on a cold exhaust system", "O2 sensors are often seized - use penetrating oil", "Support vehicle securely"],
          youtubeSearchTerm: "how to replace O2 sensor DIY",
          tags: ["o2 sensor", "check engine", "emissions", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Identify Which Sensor", description: "Use OBD2 scanner to identify which O2 sensor is failing (Bank 1/2, Sensor 1/2).", pro_tips: "Sensor 1 is upstream (before cat), Sensor 2 is downstream (after cat)", warnings: null },
            { stepNumber: 2, title: "Locate the Sensor", description: "Find the faulty sensor on the exhaust system. It has a wire connector leading to it.", pro_tips: "Upstream sensors are usually on exhaust manifold or downpipe", warnings: null },
            { stepNumber: 3, title: "Apply Penetrating Oil", description: "Spray penetrating oil around the sensor threads. Let it soak for 15-30 minutes.", pro_tips: "Apply multiple times over a few hours for stubborn sensors", warnings: null },
            { stepNumber: 4, title: "Disconnect Wiring", description: "Unplug the electrical connector from the O2 sensor.", pro_tips: "Press the release tab firmly before pulling", warnings: null },
            { stepNumber: 5, title: "Remove Old Sensor", description: "Use O2 sensor socket (slotted for wire) to unscrew the sensor counterclockwise.", pro_tips: "If stuck, try rocking back and forth", warnings: "Excessive force can strip threads - be patient" },
            { stepNumber: 6, title: "Install New Sensor", description: "Apply anti-seize to threads of new sensor. Thread in by hand first, then tighten.", pro_tips: "Torque to about 30-40 ft-lbs", warnings: "Don't over-tighten" },
            { stepNumber: 7, title: "Reconnect Wiring", description: "Plug in the electrical connector until it clicks.", pro_tips: "Route wire away from hot exhaust components", warnings: null },
            { stepNumber: 8, title: "Clear Codes and Test", description: "Clear the check engine light with OBD2 scanner. Drive and verify light stays off.", pro_tips: "May take a drive cycle for monitors to reset", warnings: null },
          ]
        },
        {
          title: "How to Replace CV Axle",
          slug: "replace-cv-axle",
          description: "Stop clicking noises when turning by replacing worn CV axles. A satisfying intermediate repair that saves hundreds in labor.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 90,
          partsCost: "50-150",
          toolsRequired: ["Large socket set", "Breaker bar", "Pry bar", "Dead blow hammer", "Jack and jack stands", "Axle nut socket", "Torque wrench"],
          partsRequired: ["CV axle (complete assembly)", "New axle nut", "Cotter pin"],
          safetyWarnings: ["Support vehicle securely on jack stands", "Wear safety glasses when prying", "Transmission fluid may leak when axle is removed"],
          youtubeSearchTerm: "how to replace CV axle DIY",
          tags: ["cv axle", "clicking noise", "drivetrain", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Loosen Axle Nut", description: "With vehicle on ground, remove cotter pin and loosen the large axle nut (usually 30-36mm).", pro_tips: "Have someone press the brake pedal to hold the hub", warnings: "These nuts are very tight - use a breaker bar" },
            { stepNumber: 2, title: "Raise and Support", description: "Jack up the vehicle and secure on jack stands. Remove the wheel.", pro_tips: "Work on one side at a time", warnings: "Ensure vehicle is stable" },
            { stepNumber: 3, title: "Remove Lower Ball Joint", description: "Disconnect lower ball joint or lower control arm to allow steering knuckle to swing out.", pro_tips: "Some vehicles need tie rod end removed instead", warnings: null },
            { stepNumber: 4, title: "Remove Axle Nut", description: "Fully remove the axle nut and washer.", pro_tips: "Keep track of any spacers", warnings: null },
            { stepNumber: 5, title: "Separate Axle from Hub", description: "Push the axle shaft back through the wheel hub. May need to tap with dead blow hammer.", pro_tips: "Protect threads with the nut threaded on a few turns", warnings: null },
            { stepNumber: 6, title: "Remove Axle from Transmission", description: "Use a pry bar to pop the inner CV joint out of the transmission. Have drain pan ready.", pro_tips: "Pry against the transmission housing, not the axle", warnings: "Transmission fluid will leak out" },
            { stepNumber: 7, title: "Install New Axle", description: "Insert new axle into transmission until the snap ring clicks into place.", pro_tips: "You should feel/hear it pop in", warnings: null },
            { stepNumber: 8, title: "Reassemble Suspension", description: "Guide outer end through hub. Reconnect ball joint and/or tie rod.", pro_tips: "Use new cotter pins", warnings: null },
            { stepNumber: 9, title: "Install New Axle Nut", description: "Install new axle nut and torque to spec (usually 150-200 ft-lbs).", pro_tips: "Always use new axle nut and cotter pin", warnings: null },
            { stepNumber: 10, title: "Check Trans Fluid and Test", description: "Top off transmission fluid if needed. Test drive and verify no clicking.", pro_tips: "Make tight turns both directions to test", warnings: null },
          ]
        },
        {
          title: "How to Replace Brake Rotors",
          slug: "replace-brake-rotors",
          description: "Eliminate brake pulsation and improve stopping power by replacing worn or warped brake rotors.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 75,
          partsCost: "50-200",
          toolsRequired: ["Socket set", "C-clamp or brake piston tool", "Lug wrench", "Jack and jack stands", "Brake cleaner", "Torque wrench", "Wire brush"],
          partsRequired: ["Brake rotors (pair)", "Brake pads (pair)", "Brake hardware kit (optional)"],
          safetyWarnings: ["Support vehicle securely", "Wear eye protection", "Don't breathe brake dust"],
          youtubeSearchTerm: "how to replace brake rotors DIY",
          tags: ["rotors", "brakes", "safety", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Loosen Lug Nuts", description: "With vehicle on ground, loosen but don't remove lug nuts.", pro_tips: "Do both sides if replacing rotor pair", warnings: null },
            { stepNumber: 2, title: "Raise Vehicle", description: "Jack up and secure on jack stands. Remove wheels.", pro_tips: "Work on one side at a time for reference", warnings: "Ensure stability" },
            { stepNumber: 3, title: "Remove Caliper", description: "Remove caliper mounting bolts and hang caliper with wire. Don't let it hang by brake line.", pro_tips: "Use a wire coat hanger", warnings: "Never stress the brake line" },
            { stepNumber: 4, title: "Remove Caliper Bracket", description: "Remove the caliper bracket bolts (usually 2 larger bolts) to access rotor.", pro_tips: "These may require a breaker bar", warnings: null },
            { stepNumber: 5, title: "Remove Old Rotor", description: "Remove any retaining screws. Pull off old rotor. May need to tap with hammer.", pro_tips: "If rusted on, use penetrating oil and patience", warnings: null },
            { stepNumber: 6, title: "Clean Hub", description: "Wire brush the hub surface to remove rust and debris.", pro_tips: "Apply thin coat of anti-seize to hub face", warnings: null },
            { stepNumber: 7, title: "Install New Rotor", description: "Clean new rotor with brake cleaner to remove protective coating. Install on hub.", pro_tips: "Some rotors are directional - check for markings", warnings: null },
            { stepNumber: 8, title: "Install New Pads", description: "Compress caliper piston. Install new pads in bracket.", pro_tips: "Open brake fluid reservoir first", warnings: "Fluid may overflow" },
            { stepNumber: 9, title: "Reassemble Caliper", description: "Reinstall bracket and caliper. Torque bolts to spec.", pro_tips: "Apply brake grease to slide pins", warnings: null },
            { stepNumber: 10, title: "Bed In Brakes", description: "Pump brake pedal. Drive gently, performing gradual stops to bed in new pads and rotors.", pro_tips: "Avoid hard stops for first 100-200 miles", warnings: "Brakes won't be at full effectiveness immediately" },
          ]
        },
        {
          title: "How to Replace Alternator",
          slug: "replace-alternator",
          description: "Fix battery drain and charging issues by replacing a failing alternator. Save hundreds on this common repair.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 60,
          partsCost: "100-300",
          toolsRequired: ["Socket set", "Wrenches", "Serpentine belt tool", "Memory saver (optional)", "Multimeter"],
          partsRequired: ["Alternator", "Serpentine belt (inspect and replace if worn)"],
          safetyWarnings: ["Disconnect battery before starting", "Note belt routing before removal"],
          youtubeSearchTerm: "how to replace alternator DIY",
          tags: ["alternator", "charging", "electrical", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Disconnect Battery", description: "Disconnect negative battery terminal. Consider using memory saver to preserve settings.", pro_tips: "Wait a few minutes for capacitors to discharge", warnings: "Always disconnect negative first" },
            { stepNumber: 2, title: "Document Belt Routing", description: "Take photos of serpentine belt routing for reinstallation reference.", pro_tips: "There's usually a diagram under the hood", warnings: null },
            { stepNumber: 3, title: "Remove Serpentine Belt", description: "Use belt tool to release tension. Slide belt off alternator pulley.", pro_tips: "Some vehicles have auto-tensioners, others manual", warnings: null },
            { stepNumber: 4, title: "Disconnect Wiring", description: "Unplug electrical connector. Remove the large power wire nut.", pro_tips: "Note which wire goes where", warnings: "Make sure battery is disconnected" },
            { stepNumber: 5, title: "Remove Mounting Bolts", description: "Remove alternator mounting bolts (usually 2-3 bolts).", pro_tips: "Some bolts may be accessed from below", warnings: null },
            { stepNumber: 6, title: "Remove Alternator", description: "Maneuver alternator out of engine bay. May need to move other components.", pro_tips: "Compare old and new units before installing", warnings: null },
            { stepNumber: 7, title: "Install New Alternator", description: "Position new alternator and install mounting bolts. Tighten securely.", pro_tips: "Don't fully tighten until all bolts are started", warnings: null },
            { stepNumber: 8, title: "Reconnect Wiring", description: "Attach power wire and plug in connector.", pro_tips: "Ensure connections are tight and secure", warnings: null },
            { stepNumber: 9, title: "Reinstall Belt", description: "Route belt using your photos. Use belt tool to install on alternator.", pro_tips: "Check belt condition - replace if cracked", warnings: null },
            { stepNumber: 10, title: "Reconnect Battery and Test", description: "Reconnect battery. Start engine and verify charging (13.5-14.5V at battery).", pro_tips: "Use multimeter to confirm proper charging", warnings: null },
          ]
        },
        {
          title: "How to Replace Starter Motor",
          slug: "replace-starter-motor",
          description: "Fix no-crank conditions by replacing a worn starter motor. A straightforward repair once you access it.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 60,
          partsCost: "80-250",
          toolsRequired: ["Socket set", "Wrenches", "Jack and jack stands", "Pry bar", "Wire brush"],
          partsRequired: ["Starter motor", "Starter bolts (if worn)"],
          safetyWarnings: ["Disconnect battery first", "Starter may be heavy - support it when removing bolts"],
          youtubeSearchTerm: "how to replace starter motor DIY",
          tags: ["starter", "no crank", "electrical", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Disconnect Battery", description: "Remove negative battery cable and wait a few minutes.", pro_tips: "This prevents accidental engagement", warnings: "Always disconnect battery first" },
            { stepNumber: 2, title: "Locate Starter", description: "Find starter where engine meets transmission. May need to access from below.", pro_tips: "Usually on driver side of engine", warnings: null },
            { stepNumber: 3, title: "Disconnect Wiring", description: "Remove the main power cable and signal wire from starter solenoid.", pro_tips: "Take a photo first for reference", warnings: null },
            { stepNumber: 4, title: "Support Starter", description: "Use one hand to support starter weight as you remove bolts.", pro_tips: "Starters are heavier than they look", warnings: "Don't let it fall" },
            { stepNumber: 5, title: "Remove Mounting Bolts", description: "Remove the 2-3 bolts holding starter to transmission bell housing.", pro_tips: "May need extensions and universal joints", warnings: null },
            { stepNumber: 6, title: "Remove Starter", description: "Lower starter carefully and remove from vehicle.", pro_tips: "Note orientation for reinstallation", warnings: null },
            { stepNumber: 7, title: "Transfer Components", description: "If using a remanufactured starter, transfer any heat shields or shims.", pro_tips: "Compare old and new units", warnings: null },
            { stepNumber: 8, title: "Install New Starter", description: "Position new starter and start mounting bolts by hand.", pro_tips: "Don't fully tighten until all bolts are started", warnings: null },
            { stepNumber: 9, title: "Reconnect Wiring", description: "Attach power cable and signal wire. Tighten connections.", pro_tips: "Clean connections with wire brush if corroded", warnings: null },
            { stepNumber: 10, title: "Reconnect Battery and Test", description: "Reconnect battery. Turn key and listen for smooth engagement.", pro_tips: "Starter should spin engine immediately", warnings: null },
          ]
        },
        {
          title: "How to Replace Thermostat",
          slug: "replace-thermostat",
          description: "Fix overheating or slow warm-up by replacing a stuck thermostat. A quick fix for temperature problems.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 45,
          partsCost: "15-50",
          toolsRequired: ["Socket set", "Drain pan", "Scraper", "RTV sealant or gasket"],
          partsRequired: ["Thermostat", "Thermostat gasket", "Coolant to top off"],
          safetyWarnings: ["Work on cold engine only", "Coolant is toxic - dispose properly", "Coolant system is pressurized when hot"],
          youtubeSearchTerm: "how to replace thermostat DIY",
          tags: ["thermostat", "cooling", "overheating", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Cool Engine Completely", description: "Ensure engine is cold to the touch. Never open cooling system when hot.", pro_tips: "Wait at least 2 hours after driving", warnings: "Hot coolant will spray out if system is hot" },
            { stepNumber: 2, title: "Drain Some Coolant", description: "Drain coolant level below thermostat housing. Use drain pan.", pro_tips: "You don't need to drain entire system", warnings: null },
            { stepNumber: 3, title: "Locate Thermostat Housing", description: "Find thermostat housing where upper radiator hose connects to engine.", pro_tips: "Usually on top of engine near front", warnings: null },
            { stepNumber: 4, title: "Remove Housing", description: "Disconnect hose if needed. Remove housing bolts (usually 2).", pro_tips: "Take photo of orientation", warnings: null },
            { stepNumber: 5, title: "Remove Old Thermostat", description: "Pull out old thermostat. Note which direction it was facing.", pro_tips: "Spring side faces into engine", warnings: null },
            { stepNumber: 6, title: "Clean Surfaces", description: "Scrape old gasket material from both surfaces. Clean thoroughly.", pro_tips: "Ensure surfaces are flat and clean", warnings: null },
            { stepNumber: 7, title: "Install New Thermostat", description: "Place new thermostat in housing with spring toward engine.", pro_tips: "Some thermostats have a jiggle pin - position at top", warnings: "Wrong direction will cause overheating" },
            { stepNumber: 8, title: "Install New Gasket", description: "Apply new gasket or RTV sealant as appropriate for your vehicle.", pro_tips: "Let RTV cure briefly before assembly", warnings: null },
            { stepNumber: 9, title: "Reassemble", description: "Reinstall housing and tighten bolts evenly. Reconnect hose.", pro_tips: "Don't over-tighten", warnings: null },
            { stepNumber: 10, title: "Fill and Bleed", description: "Refill coolant. Start engine and watch for bubbles. Let warm up fully.", pro_tips: "Keep reservoir cap off initially to burp air", warnings: "Watch temperature gauge carefully" },
          ]
        },
        {
          title: "How to Replace Serpentine Belt",
          slug: "replace-serpentine-belt",
          description: "Fix squealing and prevent breakdown by replacing a worn serpentine belt. Quick maintenance with big impact.",
          category: "car",
          difficulty: "beginner",
          estimatedTimeMinutes: 20,
          partsCost: "20-50",
          toolsRequired: ["Serpentine belt tool or large wrench", "Flashlight"],
          partsRequired: ["Serpentine belt (match exact part number)"],
          safetyWarnings: ["Keep hands clear of pulleys", "Engine must be off"],
          youtubeSearchTerm: "how to replace serpentine belt DIY",
          tags: ["serpentine belt", "squealing", "maintenance", "beginner"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Document Belt Routing", description: "Take photos and note exact routing of current belt.", pro_tips: "There's usually a diagram on the radiator support or hood", warnings: null },
            { stepNumber: 2, title: "Locate Tensioner", description: "Find the automatic belt tensioner - it has a pulley and spring mechanism.", pro_tips: "Look for the pulley that pivots", warnings: null },
            { stepNumber: 3, title: "Release Tension", description: "Place tool on tensioner bolt and rotate to release tension.", pro_tips: "Some rotate clockwise, others counterclockwise", warnings: "Tensioner has strong spring - control it" },
            { stepNumber: 4, title: "Remove Belt", description: "Slip belt off pulleys while holding tensioner released.", pro_tips: "Starting with the smooth (flat) side is usually easiest", warnings: null },
            { stepNumber: 5, title: "Inspect Pulleys", description: "While belt is off, spin each pulley and check for noise or wobble.", pro_tips: "Replace any bad pulleys now", warnings: null },
            { stepNumber: 6, title: "Route New Belt", description: "Following your photos/diagram, route new belt around all pulleys EXCEPT tensioner.", pro_tips: "Make sure ribs are in grooves on ribbed pulleys", warnings: null },
            { stepNumber: 7, title: "Install on Tensioner", description: "Release tensioner again and slip belt over tensioner pulley.", pro_tips: "Double-check all pulleys are engaged", warnings: null },
            { stepNumber: 8, title: "Verify Routing", description: "Compare belt routing to diagram. Ensure belt is properly seated on all pulleys.", pro_tips: "A misrouted belt will squeal or be thrown off", warnings: null },
          ]
        },
        {
          title: "How to Replace Fuel Filter",
          slug: "replace-fuel-filter",
          description: "Restore fuel flow and fix hesitation by replacing a clogged fuel filter. Essential maintenance often overlooked.",
          category: "car",
          difficulty: "intermediate",
          estimatedTimeMinutes: 30,
          partsCost: "15-40",
          toolsRequired: ["Fuel line disconnect tools", "Wrenches", "Safety glasses", "Fire extinguisher nearby", "Drain pan"],
          partsRequired: ["Fuel filter"],
          safetyWarnings: ["Work in well-ventilated area", "No smoking or sparks", "Relieve fuel pressure first", "Have fire extinguisher ready"],
          youtubeSearchTerm: "how to replace fuel filter DIY",
          tags: ["fuel filter", "fuel system", "maintenance", "intermediate"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Relieve Fuel Pressure", description: "Remove fuel pump fuse. Start engine and let it stall. Crank briefly to clear lines.", pro_tips: "Check your manual for pressure relief procedure", warnings: "Fuel is under pressure - this step is critical" },
            { stepNumber: 2, title: "Locate Fuel Filter", description: "Find filter along frame rail, under vehicle, or in engine bay.", pro_tips: "Modern cars often have filter in fuel tank", warnings: null },
            { stepNumber: 3, title: "Place Drain Pan", description: "Position pan under filter to catch any fuel.", pro_tips: "Have rags ready", warnings: "Fuel will spill" },
            { stepNumber: 4, title: "Disconnect Fuel Lines", description: "Use fuel line disconnect tools to release quick-connect fittings.", pro_tips: "Different vehicles use different styles", warnings: "Wear safety glasses" },
            { stepNumber: 5, title: "Remove Filter Bracket", description: "If held by a bracket, remove bracket bolt.", pro_tips: "Note filter direction - there's an arrow", warnings: null },
            { stepNumber: 6, title: "Install New Filter", description: "Install new filter with arrow pointing toward engine (flow direction).", pro_tips: "Arrow shows flow direction", warnings: "Wrong direction restricts flow" },
            { stepNumber: 7, title: "Reconnect Lines", description: "Push fuel lines onto filter until they click locked.", pro_tips: "Pull back to verify they're locked", warnings: null },
            { stepNumber: 8, title: "Reinstall Fuse and Test", description: "Reinstall fuel pump fuse. Turn key to ON (not start) several times to pressurize.", pro_tips: "Check for leaks before starting engine", warnings: "Any leak is a fire hazard" },
          ]
        },
        
        // MOTORCYCLE - PRO GUIDES
        {
          title: "How to Replace Motorcycle Chain and Sprockets",
          slug: "replace-motorcycle-chain-sprockets",
          description: "Refresh your drivetrain with new chain and sprockets. Improves acceleration and extends final drive life.",
          category: "motorcycle",
          difficulty: "intermediate",
          estimatedTimeMinutes: 90,
          partsCost: "100-300",
          toolsRequired: ["Chain breaker tool", "Socket set", "Torque wrench", "Rear stand", "Grinder or angle grinder", "Chain riveting tool"],
          partsRequired: ["Chain and sprocket kit", "Master link"],
          safetyWarnings: ["Use rear stand or secure lift", "Wear eye protection when grinding", "Chain under tension - be careful"],
          youtubeSearchTerm: "how to replace motorcycle chain sprockets DIY",
          tags: ["chain", "sprockets", "drivetrain", "motorcycle"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Secure Motorcycle", description: "Put bike on rear stand or center stand. Ensure stability.", pro_tips: "You'll need to spin the wheel freely", warnings: "Bike must be very stable" },
            { stepNumber: 2, title: "Break Old Chain", description: "Use chain breaker or grind off a rivet head to break old chain.", pro_tips: "Grinding is often easier than chain breaker", warnings: "Wear eye protection" },
            { stepNumber: 3, title: "Remove Rear Wheel", description: "Loosen axle nut. Remove axle and slide wheel out.", pro_tips: "Note adjuster positions", warnings: null },
            { stepNumber: 4, title: "Remove Rear Sprocket", description: "Remove bolts holding sprocket to hub. Install new rear sprocket.", pro_tips: "Clean hub surface first", warnings: null },
            { stepNumber: 5, title: "Remove Front Sprocket", description: "Remove cover. Hold rear brake, remove sprocket nut. Replace sprocket.", pro_tips: "Use impact wrench if available", warnings: null },
            { stepNumber: 6, title: "Reinstall Wheel", description: "Reinstall rear wheel. Leave axle loose for chain adjustment.", pro_tips: "Don't tighten axle yet", warnings: null },
            { stepNumber: 7, title: "Route New Chain", description: "Route new chain over front sprocket, through swingarm, over rear sprocket.", pro_tips: "Count links before connecting", warnings: null },
            { stepNumber: 8, title: "Connect Master Link", description: "Connect chain ends with master link. Rivet in place.", pro_tips: "Use riveting tool for press-fit links", warnings: "Clip-type must face correct direction" },
            { stepNumber: 9, title: "Adjust Chain", description: "Set chain slack per manual (usually 1-1.5 inch). Adjust both sides evenly.", pro_tips: "Check alignment marks on swingarm", warnings: null },
            { stepNumber: 10, title: "Final Torque and Lube", description: "Torque axle to spec. Lubricate new chain.", pro_tips: "Break in gently for first 100 miles", warnings: null },
          ]
        },
        {
          title: "How to Replace Motorcycle Fork Seals",
          slug: "replace-motorcycle-fork-seals",
          description: "Stop fork oil leaks and restore suspension performance with new fork seals.",
          category: "motorcycle",
          difficulty: "advanced",
          estimatedTimeMinutes: 180,
          partsCost: "30-100",
          toolsRequired: ["Fork seal driver", "Seal pick", "Socket set", "Fork oil", "Measuring cup", "Torque wrench"],
          partsRequired: ["Fork seal kit (seals and dust covers)", "Fork oil"],
          safetyWarnings: ["Support bike securely", "Forks are under spring pressure", "Work in clean environment"],
          youtubeSearchTerm: "how to replace motorcycle fork seals DIY",
          tags: ["fork seals", "suspension", "oil leak", "advanced"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Secure and Remove Front Wheel", description: "Support bike on center stand or lift. Remove front wheel.", pro_tips: "Loosen axle pinch bolts before axle", warnings: "Ensure bike is very stable" },
            { stepNumber: 2, title: "Remove Forks", description: "Loosen upper and lower triple clamp bolts. Slide forks out.", pro_tips: "Work on one fork at a time", warnings: null },
            { stepNumber: 3, title: "Drain Fork Oil", description: "Remove drain bolt and pump fork to expel oil. Measure and note quantity.", pro_tips: "Pump fully to get all oil out", warnings: null },
            { stepNumber: 4, title: "Disassemble Fork", description: "Remove top cap. Compress spring and remove snap ring. Separate tubes.", pro_tips: "Cap may be under spring tension", warnings: "Be careful of spring pressure" },
            { stepNumber: 5, title: "Remove Old Seals", description: "Pry out dust cover and oil seal with seal pick.", pro_tips: "Be careful not to scratch inner tube", warnings: null },
            { stepNumber: 6, title: "Clean Tubes", description: "Clean all components thoroughly. Inspect for scoring on tubes.", pro_tips: "Any scoring will destroy new seals", warnings: "Scored tubes need replacement" },
            { stepNumber: 7, title: "Install New Seals", description: "Use fork seal driver to install new seal squarely. Install dust cover.", pro_tips: "Lubricate seal lip with fork oil", warnings: null },
            { stepNumber: 8, title: "Reassemble Fork", description: "Reinstall bushings, slide tubes together, install spring and cap.", pro_tips: "Follow service manual for your bike", warnings: null },
            { stepNumber: 9, title: "Add Fork Oil", description: "Add measured amount of correct weight oil.", pro_tips: "Check oil level height, not just volume", warnings: null },
            { stepNumber: 10, title: "Reinstall Forks", description: "Install forks in triple clamp. Tighten in proper sequence. Reinstall wheel.", pro_tips: "Set fork height per manual", warnings: "Tighten sequence matters" },
          ]
        },
        
        // BOAT/MARINE - PRO GUIDES
        {
          title: "How to Replace Outboard Water Pump Impeller",
          slug: "replace-outboard-impeller",
          description: "Restore cooling system function by replacing the water pump impeller. Critical maintenance to prevent overheating.",
          category: "boat",
          difficulty: "intermediate",
          estimatedTimeMinutes: 60,
          partsCost: "30-80",
          toolsRequired: ["Socket set", "Screwdrivers", "Impeller puller (optional)", "Gasket scraper", "Grease"],
          partsRequired: ["Water pump kit (impeller, gaskets, plate)"],
          safetyWarnings: ["Disconnect battery before starting", "Note orientation of all parts", "Don't run motor without water"],
          youtubeSearchTerm: "how to replace outboard water pump impeller",
          tags: ["impeller", "water pump", "cooling", "outboard"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Disconnect Battery", description: "Remove battery cables to prevent accidental starting.", pro_tips: "Safety first", warnings: null },
            { stepNumber: 2, title: "Remove Lower Unit", description: "Remove the bolts connecting lower unit to mid-section. Note shift linkage.", pro_tips: "Take photos of linkage positions", warnings: "Lower unit is heavy" },
            { stepNumber: 3, title: "Remove Water Pump Housing", description: "Remove bolts holding water pump housing. Carefully lift off housing.", pro_tips: "Note how parts stack together", warnings: null },
            { stepNumber: 4, title: "Remove Old Impeller", description: "Pull out old impeller. Note which direction vanes were curved.", pro_tips: "Use impeller puller if stuck", warnings: "Vanes must curve correctly when installed" },
            { stepNumber: 5, title: "Inspect Housing and Plate", description: "Check wear plate and housing for scoring. Replace if worn.", pro_tips: "Kits usually include new plate", warnings: null },
            { stepNumber: 6, title: "Install New Impeller", description: "Coat new impeller with water pump grease. Slide onto drive shaft with vanes curving in rotation direction.", pro_tips: "Twist while pushing to seat vanes", warnings: "Wrong direction will destroy impeller" },
            { stepNumber: 7, title: "Replace Gaskets", description: "Install new gaskets included in kit. Use gasket sealant if recommended.", pro_tips: "Don't over-apply sealant", warnings: null },
            { stepNumber: 8, title: "Reassemble Housing", description: "Reinstall wear plate and housing. Tighten bolts evenly.", pro_tips: "Follow torque specs", warnings: null },
            { stepNumber: 9, title: "Reinstall Lower Unit", description: "Align drive shaft and shift linkage. Slide lower unit up and bolt in place.", pro_tips: "May need to rotate prop to align", warnings: null },
            { stepNumber: 10, title: "Test in Water", description: "Reconnect battery. Run in water and verify good water flow from tell-tale.", pro_tips: "Strong stream indicates good pump", warnings: "Never run outboard without water" },
          ]
        },
        
        // ATV/UTV - PRO GUIDES
        {
          title: "How to Replace ATV/UTV Drive Belt",
          slug: "replace-atv-drive-belt",
          description: "Restore power transfer and eliminate slipping with a new CVT drive belt.",
          category: "atv",
          difficulty: "intermediate",
          estimatedTimeMinutes: 45,
          partsCost: "50-150",
          toolsRequired: ["Socket set", "Clutch tools (if applicable)", "Clean rags", "Belt deflection gauge"],
          partsRequired: ["CVT drive belt"],
          safetyWarnings: ["Work on cool engine", "Belt dust can be harmful - wear mask", "Disconnect battery"],
          youtubeSearchTerm: "how to replace ATV UTV drive belt CVT",
          tags: ["drive belt", "cvt", "clutch", "atv", "utv"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Cool Down and Access", description: "Let engine cool. Remove CVT/clutch cover bolts.", pro_tips: "Mark cover orientation", warnings: "Belt dust may be present" },
            { stepNumber: 2, title: "Remove Cover", description: "Carefully remove clutch cover. Note any seals or gaskets.", pro_tips: "Inspect cover seal condition", warnings: null },
            { stepNumber: 3, title: "Inspect Clutches", description: "Check primary and secondary clutch for wear or damage.", pro_tips: "Look for glazing or cracks", warnings: null },
            { stepNumber: 4, title: "Remove Old Belt", description: "Spread secondary clutch sheaves and remove belt.", pro_tips: "Some require clutch compression tool", warnings: null },
            { stepNumber: 5, title: "Clean Clutches", description: "Clean clutch sheaves with clean rag. Remove all belt dust.", pro_tips: "Never use solvents on sheaves", warnings: "Don't contaminate with oil" },
            { stepNumber: 6, title: "Install New Belt", description: "Route new belt around secondary (driven) clutch first, then primary.", pro_tips: "Arrows on belt indicate rotation direction", warnings: "Wrong direction will cause failure" },
            { stepNumber: 7, title: "Check Deflection", description: "Verify belt deflection meets spec (usually 1-1.5 inch).", pro_tips: "New belts may stretch slightly at first", warnings: null },
            { stepNumber: 8, title: "Reinstall Cover", description: "Install cover with new gasket if needed. Tighten bolts evenly.", pro_tips: "Don't pinch any wires", warnings: null },
          ]
        },
        
        // SMALL ENGINE - PRO GUIDES
        {
          title: "How to Rebuild a Small Engine Carburetor",
          slug: "rebuild-small-engine-carburetor",
          description: "Restore smooth running to lawn mowers, generators, and small engines with a carburetor rebuild.",
          category: "small-engine",
          difficulty: "intermediate",
          estimatedTimeMinutes: 60,
          partsCost: "10-30",
          toolsRequired: ["Screwdrivers", "Carburetor cleaner", "Compressed air", "Small wire or needle", "Clean container"],
          partsRequired: ["Carburetor rebuild kit (gaskets, needle, seat, diaphragm)"],
          safetyWarnings: ["Work in ventilated area", "Carburetor cleaner is harsh - wear gloves", "Keep away from flames"],
          youtubeSearchTerm: "how to rebuild small engine carburetor DIY",
          tags: ["carburetor", "small engine", "rebuild", "lawn mower"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Remove Carburetor", description: "Disconnect fuel line, throttle linkage, and mounting bolts. Remove carb.", pro_tips: "Take photos of all linkages", warnings: "Drain fuel first" },
            { stepNumber: 2, title: "Disassemble Carburetor", description: "Remove bowl, float, needle, jets, and diaphragm (if equipped).", pro_tips: "Work over clean surface to catch small parts", warnings: null },
            { stepNumber: 3, title: "Clean All Parts", description: "Soak metal parts in carburetor cleaner. Clean all passages.", pro_tips: "Use compressed air to blow out passages", warnings: "Don't soak rubber/plastic parts" },
            { stepNumber: 4, title: "Clear Jets and Passages", description: "Use thin wire to clear all jets and passages.", pro_tips: "Carb cleaner spray with straw helps", warnings: "Don't enlarge jet holes" },
            { stepNumber: 5, title: "Inspect Float", description: "Check float for leaks (shake to hear fuel inside). Replace if damaged.", pro_tips: "Floats should be light and not sink", warnings: null },
            { stepNumber: 6, title: "Install New Parts", description: "Install new needle, seat, gaskets, and diaphragm from kit.", pro_tips: "Note orientation of diaphragm", warnings: null },
            { stepNumber: 7, title: "Set Float Height", description: "Adjust float height per spec (usually parallel to carb body when inverted).", pro_tips: "Bend float tang carefully to adjust", warnings: null },
            { stepNumber: 8, title: "Reassemble", description: "Reinstall bowl, primer bulb, and other external components.", pro_tips: "Don't over-tighten bowl screw", warnings: null },
            { stepNumber: 9, title: "Reinstall Carburetor", description: "Mount carb to engine. Reconnect linkages and fuel line.", pro_tips: "Double-check all connections", warnings: null },
            { stepNumber: 10, title: "Adjust and Test", description: "Set initial idle and mixture screws. Start and fine-tune.", pro_tips: "Typical starting point: 1.5 turns out on mixture screw", warnings: null },
          ]
        },
        
        // RV - PRO GUIDES
        {
          title: "How to Replace RV Water Pump",
          slug: "replace-rv-water-pump",
          description: "Restore water pressure in your RV by replacing a worn or noisy water pump.",
          category: "rv",
          difficulty: "intermediate",
          estimatedTimeMinutes: 45,
          partsCost: "50-150",
          toolsRequired: ["Screwdrivers", "Adjustable wrench", "Hose clamps", "Thread tape"],
          partsRequired: ["RV water pump", "Hose if worn"],
          safetyWarnings: ["Turn off and drain water system", "Disconnect shore power and battery"],
          youtubeSearchTerm: "how to replace RV water pump DIY",
          tags: ["water pump", "rv", "plumbing", "12v"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Locate Pump", description: "Find water pump, usually near fresh water tank. May be under dinette or bed.", pro_tips: "Follow the water lines from tank", warnings: null },
            { stepNumber: 2, title: "Turn Off Power", description: "Disconnect 12V power to pump. Switch off at panel or disconnect wires.", pro_tips: "Label wires before disconnecting", warnings: "Pump runs on 12V DC" },
            { stepNumber: 3, title: "Drain System", description: "Open faucets to relieve pressure. Drain water near pump if possible.", pro_tips: "Have towels ready for remaining water", warnings: null },
            { stepNumber: 4, title: "Disconnect Hoses", description: "Remove inlet and outlet hoses. Loosen hose clamps carefully.", pro_tips: "Mark which hose is inlet vs outlet", warnings: null },
            { stepNumber: 5, title: "Remove Old Pump", description: "Remove mounting screws. Note orientation for new pump.", pro_tips: "Some pumps have rubber mounts for vibration", warnings: null },
            { stepNumber: 6, title: "Install New Pump", description: "Mount new pump in same orientation. Use rubber feet if provided.", pro_tips: "Inlet side goes to fresh tank", warnings: null },
            { stepNumber: 7, title: "Connect Hoses", description: "Attach hoses with new clamps if old ones are worn.", pro_tips: "Use thread tape on threaded fittings", warnings: null },
            { stepNumber: 8, title: "Connect Power", description: "Connect 12V wires to pump. Match polarity.", pro_tips: "Red to positive, black to negative", warnings: "Wrong polarity can damage pump" },
            { stepNumber: 9, title: "Prime and Test", description: "Fill fresh tank. Turn on pump and let it prime. Check for leaks.", pro_tips: "Pump should cycle on/off with faucet use", warnings: null },
            { stepNumber: 10, title: "Check All Faucets", description: "Open each faucet to verify flow. Listen for pump operation.", pro_tips: "Pump should only run when faucet is open", warnings: null },
          ]
        },
        
        // DIESEL - PRO GUIDES
        {
          title: "How to Replace Diesel Fuel Filter",
          slug: "replace-diesel-fuel-filter",
          description: "Maintain fuel system health and prevent injector damage with regular fuel filter replacement.",
          category: "diesel",
          difficulty: "intermediate",
          estimatedTimeMinutes: 30,
          partsCost: "20-60",
          toolsRequired: ["Filter wrench", "Drain pan", "Hand primer pump (if not equipped)", "Clean rags"],
          partsRequired: ["Diesel fuel filter", "O-rings if separate"],
          safetyWarnings: ["Work in ventilated area", "Diesel fuel is combustible", "Keep fuel off skin"],
          youtubeSearchTerm: "how to replace diesel fuel filter DIY",
          tags: ["diesel", "fuel filter", "maintenance", "fuel system"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Locate Filter", description: "Find the fuel filter(s). Diesels often have primary and secondary filters.", pro_tips: "Check manual for filter locations", warnings: null },
            { stepNumber: 2, title: "Drain Water Separator", description: "If equipped, open drain valve and drain any water from filter housing.", pro_tips: "Do this regularly as maintenance", warnings: null },
            { stepNumber: 3, title: "Remove Old Filter", description: "Unscrew filter housing or cartridge. Have drain pan ready.", pro_tips: "Filter may be full of fuel", warnings: "Dispose of fuel properly" },
            { stepNumber: 4, title: "Clean Housing", description: "Wipe out filter housing. Check for debris or contamination.", pro_tips: "Any debris indicates tank problems", warnings: null },
            { stepNumber: 5, title: "Install New Filter", description: "Install new filter element. Replace O-rings with light coating of diesel.", pro_tips: "Pre-fill filter with clean diesel if possible", warnings: null },
            { stepNumber: 6, title: "Hand Tighten Housing", description: "Thread housing on and hand tighten. Don't over-tighten.", pro_tips: "Follow manufacturer torque spec", warnings: null },
            { stepNumber: 7, title: "Prime Fuel System", description: "Use hand primer pump to fill filter and remove air from system.", pro_tips: "Pump until resistance increases", warnings: "Air in lines prevents starting" },
            { stepNumber: 8, title: "Start and Bleed", description: "Start engine (may take extra cranking). Watch for leaks.", pro_tips: "Some diesels self-bleed, others need manual bleeding", warnings: "Don't crank more than 15 seconds at a time" },
          ]
        },
        
        // CLASSIC CARS - PRO GUIDES
        {
          title: "How to Tune a Carburetor",
          slug: "tune-carburetor",
          description: "Dial in your classic car's carburetor for smooth idle and optimal performance.",
          category: "classic",
          difficulty: "intermediate",
          estimatedTimeMinutes: 45,
          partsCost: "0-20",
          toolsRequired: ["Screwdrivers", "Tachometer", "Vacuum gauge", "Timing light"],
          partsRequired: ["Air filter (if needed)", "Fuel filter (if needed)"],
          safetyWarnings: ["Work on warm engine", "Keep hands away from fan and belts", "Work in ventilated area"],
          youtubeSearchTerm: "how to tune carburetor classic car DIY",
          tags: ["carburetor", "classic", "tuning", "performance"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Warm Up Engine", description: "Run engine to full operating temperature. Choke should be fully open.", pro_tips: "At least 10-15 minutes of running", warnings: null },
            { stepNumber: 2, title: "Check Timing First", description: "Verify ignition timing is correct before adjusting carb.", pro_tips: "Wrong timing will affect carb tuning", warnings: null },
            { stepNumber: 3, title: "Locate Mixture Screws", description: "Find idle mixture screw(s). Usually on the front or base of carb.", pro_tips: "Some carbs have one, others have two", warnings: null },
            { stepNumber: 4, title: "Set Initial Position", description: "Gently turn mixture screw(s) in until lightly seated, then out 1.5 turns.", pro_tips: "Don't force screws in - just light seat", warnings: "Forcing can damage seats" },
            { stepNumber: 5, title: "Adjust Idle Speed", description: "Set idle speed screw to get approximately 600-800 RPM.", pro_tips: "Use tachometer for accuracy", warnings: null },
            { stepNumber: 6, title: "Lean Best Idle", description: "Slowly turn mixture screw in until RPM drops, then back out until RPM peaks.", pro_tips: "Go 1/4 turn at a time", warnings: null },
            { stepNumber: 7, title: "Final Mixture Setting", description: "From peak RPM, turn mixture screw in slightly (1/8 turn) for best emissions.", pro_tips: "Engine should idle smoothly", warnings: null },
            { stepNumber: 8, title: "Readjust Idle Speed", description: "Set final idle speed with throttle screw.", pro_tips: "Most engines idle best at 650-750 RPM", warnings: null },
            { stepNumber: 9, title: "Check Vacuum", description: "Connect vacuum gauge. Should read steady 15-22 inches at idle.", pro_tips: "Fluctuating vacuum indicates other issues", warnings: null },
            { stepNumber: 10, title: "Road Test", description: "Drive and check for smooth acceleration with no hesitation.", pro_tips: "If hesitation, slight adjustment may be needed", warnings: null },
          ]
        },
        {
          title: "How to Adjust Drum Brakes",
          slug: "adjust-drum-brakes",
          description: "Restore proper braking on classic cars and trucks with rear drum brakes.",
          category: "classic",
          difficulty: "beginner",
          estimatedTimeMinutes: 30,
          partsCost: "0",
          toolsRequired: ["Brake adjuster tool or flat screwdriver", "Jack and jack stands", "Flashlight"],
          partsRequired: ["None (unless hardware is worn)"],
          safetyWarnings: ["Secure vehicle on jack stands", "Ensure parking brake is released before adjusting"],
          youtubeSearchTerm: "how to adjust drum brakes DIY",
          tags: ["drum brakes", "classic", "brakes", "adjustment"],
          isPopular: true,
          isPremium: true,
          steps: [
            { stepNumber: 1, title: "Raise and Secure", description: "Jack up rear of vehicle and secure on jack stands. Remove wheels.", pro_tips: "Work on one side at a time", warnings: "Ensure stability" },
            { stepNumber: 2, title: "Release Parking Brake", description: "Make sure parking brake is fully released.", pro_tips: "Engaged parking brake prevents adjustment", warnings: null },
            { stepNumber: 3, title: "Locate Adjuster", description: "Find adjustment access hole on back of drum or drum edge. May have rubber plug.", pro_tips: "Some are at bottom of backing plate", warnings: null },
            { stepNumber: 4, title: "Turn Adjuster Wheel", description: "Insert tool and rotate star wheel adjuster to expand shoes.", pro_tips: "Direction varies - one way tightens", warnings: null },
            { stepNumber: 5, title: "Adjust Until Drag", description: "Turn adjuster until drum cannot spin freely.", pro_tips: "Spin drum while adjusting to feel drag", warnings: null },
            { stepNumber: 6, title: "Back Off Slightly", description: "Back adjuster off until drum spins freely with slight drag.", pro_tips: "Usually 8-10 clicks back", warnings: "Too tight causes overheating" },
            { stepNumber: 7, title: "Repeat Other Side", description: "Adjust the other drum the same way.", pro_tips: "Try to match feel on both sides", warnings: null },
            { stepNumber: 8, title: "Test Parking Brake", description: "Apply parking brake and verify it holds.", pro_tips: "Should engage within 4-6 clicks", warnings: null },
          ]
        },
      ];

      const createdGuides = [];
      for (const guideData of guides) {
        try {
          const { steps, ...guideInfo } = guideData;
          
          const guide = await storage.createRepairGuide(guideInfo as any);
          createdGuides.push(guide);

          if (steps && steps.length > 0) {
            for (const step of steps) {
              await storage.createGuideStep({
                stepNumber: step.stepNumber,
                title: step.title,
                description: step.description,
                proTips: step.pro_tips ? [step.pro_tips] : null,
                warnings: step.warnings ? [step.warnings] : null,
                guideId: guide.id,
              } as any);
            }
          }
        } catch (e: any) {
          if (!e.message?.includes('duplicate')) {
            console.error("Error creating guide:", guideData.title, e);
          }
        }
      }

      res.json({ 
        message: "DIY repair guides seeded successfully",
        count: createdGuides.length
      });
    } catch (error) {
      console.error("Seed DIY guides error:", error);
      res.status(500).json({ error: "Failed to seed DIY guides" });
    }
  });

  // ============================================
  // PRICE ALERTS (Pro Feature)
  // ============================================
  
  // Get user's price alerts
  app.get('/api/price-alerts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const alerts = await storage.getPriceAlertsByUser(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Get price alerts error:", error);
      res.status(500).json({ error: "Failed to fetch price alerts" });
    }
  });
  
  // Get single price alert
  app.get('/api/price-alerts/:id', isAuthenticated, async (req, res) => {
    try {
      const alert = await storage.getPriceAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      const userId = (req.user as any)?.id;
      if (alert.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Get price alert error:", error);
      res.status(500).json({ error: "Failed to fetch price alert" });
    }
  });
  
  // Create price alert (Pro only)
  app.post('/api/price-alerts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionTier !== 'pro') {
        return res.status(403).json({ error: "Price alerts require a Pro subscription" });
      }
      
      const result = insertPriceAlertSchema.safeParse({
        ...req.body,
        userId
      });
      
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      
      const alert = await storage.createPriceAlert(result.data);
      res.json(alert);
    } catch (error) {
      console.error("Create price alert error:", error);
      res.status(500).json({ error: "Failed to create price alert" });
    }
  });
  
  // Update price alert
  app.patch('/api/price-alerts/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const existingAlert = await storage.getPriceAlert(req.params.id);
      
      if (!existingAlert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      if (existingAlert.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const alert = await storage.updatePriceAlert(req.params.id, req.body);
      res.json(alert);
    } catch (error) {
      console.error("Update price alert error:", error);
      res.status(500).json({ error: "Failed to update price alert" });
    }
  });
  
  // Delete price alert
  app.delete('/api/price-alerts/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const existingAlert = await storage.getPriceAlert(req.params.id);
      
      if (!existingAlert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      if (existingAlert.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await storage.deletePriceAlert(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete price alert error:", error);
      res.status(500).json({ error: "Failed to delete price alert" });
    }
  });

  // ============================================
  // BLOCKCHAIN VERIFICATION ROUTES (Solana)
  // ============================================
  
  const blockchainService = await import('./services/blockchain');
  
  // Get user's blockchain verifications
  app.get('/api/blockchain/verifications', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const verifications = await storage.getBlockchainVerificationsByUser(userId);
      res.json(verifications);
    } catch (error) {
      console.error("Get blockchain verifications error:", error);
      res.status(500).json({ error: "Failed to get verifications" });
    }
  });
  
  // Get verification status for an entity (with ownership check)
  app.get('/api/blockchain/status/:entityType/:entityId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { entityType, entityId } = req.params;
      
      // Verify ownership based on entity type
      if (entityType === 'hallmark') {
        const hallmark = await storage.getHallmark(entityId);
        if (!hallmark) {
          return res.status(404).json({ error: "Hallmark not found" });
        }
        if (hallmark.userId !== userId) {
          return res.status(403).json({ error: "Not authorized to view this verification" });
        }
      } else if (entityType === 'vehicle') {
        const vehicle = await storage.getVehicle(entityId);
        if (!vehicle) {
          return res.status(404).json({ error: "Vehicle not found" });
        }
        if (vehicle.userId !== userId) {
          return res.status(403).json({ error: "Not authorized to view this verification" });
        }
      } else {
        return res.status(400).json({ error: "Invalid entity type" });
      }
      
      const verification = await storage.getLatestVerification(entityType, entityId);
      
      if (!verification) {
        return res.json({ status: 'not_verified', verification: null });
      }
      
      res.json({
        status: verification.status,
        verification: {
          ...verification,
          solscanUrl: verification.txSignature && !verification.txSignature.startsWith('HASH_') && !verification.txSignature.startsWith('DEMO_')
            ? blockchainService.getSolscanUrl(verification.txSignature, verification.network as 'mainnet-beta' | 'devnet')
            : null
        }
      });
    } catch (error) {
      console.error("Get verification status error:", error);
      res.status(500).json({ error: "Failed to get verification status" });
    }
  });
  
  // Verify a hallmark on blockchain
  app.post('/api/blockchain/hallmark/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const hallmarkId = req.params.id;
      
      const hallmark = await storage.getHallmark(hallmarkId);
      if (!hallmark) {
        return res.status(404).json({ error: "Hallmark not found" });
      }
      if (hallmark.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check for existing verification
      const existing = await storage.getLatestVerification('hallmark', hallmarkId);
      if (existing && (existing.status === 'confirmed' || existing.status === 'submitted')) {
        return res.json({ 
          message: "Already verified",
          verification: existing,
          solscanUrl: existing.txSignature && !existing.txSignature.startsWith('HASH_')
            ? blockchainService.getSolscanUrl(existing.txSignature, existing.network as 'mainnet-beta' | 'devnet')
            : null
        });
      }
      
      // Prepare data and create verification
      const blockchainData = blockchainService.prepareHallmarkData(hallmark);
      const result = await blockchainService.createVerification(blockchainData, 'mainnet-beta');
      
      const verification = await storage.createBlockchainVerification({
        entityType: 'hallmark',
        entityId: hallmarkId,
        userId,
        dataHash: result.dataHash,
        txSignature: result.txSignature,
        status: result.status,
        network: 'mainnet-beta',
        errorMessage: result.error,
      });
      
      // Update with timestamps if submitted
      if (result.status === 'submitted' || result.status === 'confirmed') {
        await storage.updateBlockchainVerification(verification.id, {
          submittedAt: new Date(),
          confirmedAt: result.status === 'confirmed' ? new Date() : undefined,
        });
      }
      
      res.json({
        success: result.success,
        verification,
        solscanUrl: result.solscanUrl,
      });
    } catch (error) {
      console.error("Verify hallmark error:", error);
      res.status(500).json({ error: "Failed to verify hallmark on blockchain" });
    }
  });
  
  // Verify a vehicle on blockchain
  app.post('/api/blockchain/vehicle/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const vehicleId = req.params.id;
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      if (vehicle.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Check for existing verification
      const existing = await storage.getLatestVerification('vehicle', vehicleId);
      if (existing && (existing.status === 'confirmed' || existing.status === 'submitted')) {
        return res.json({ 
          message: "Already verified",
          verification: existing,
          solscanUrl: existing.txSignature && !existing.txSignature.startsWith('HASH_')
            ? blockchainService.getSolscanUrl(existing.txSignature, existing.network as 'mainnet-beta' | 'devnet')
            : null
        });
      }
      
      // Prepare data and create verification
      const blockchainData = blockchainService.prepareVehicleData(vehicle);
      const result = await blockchainService.createVerification(blockchainData, 'mainnet-beta');
      
      const verification = await storage.createBlockchainVerification({
        entityType: 'vehicle',
        entityId: vehicleId,
        userId,
        dataHash: result.dataHash,
        txSignature: result.txSignature,
        status: result.status,
        network: 'mainnet-beta',
        errorMessage: result.error,
      });
      
      // Update with timestamps if submitted
      if (result.status === 'submitted' || result.status === 'confirmed') {
        await storage.updateBlockchainVerification(verification.id, {
          submittedAt: new Date(),
          confirmedAt: result.status === 'confirmed' ? new Date() : undefined,
        });
      }
      
      res.json({
        success: result.success,
        verification,
        solscanUrl: result.solscanUrl,
      });
    } catch (error) {
      console.error("Verify vehicle error:", error);
      res.status(500).json({ error: "Failed to verify vehicle on blockchain" });
    }
  });
  
  // Verify a release on blockchain (admin endpoint with PIN)
  app.post('/api/blockchain/release/:id', async (req, res) => {
    try {
      const releaseId = req.params.id;
      const { pin } = req.body;
      const DEV_PORTAL_PIN = '0424';
      
      if (pin !== DEV_PORTAL_PIN) {
        return res.status(403).json({ error: "Access denied. Admin PIN required." });
      }
      
      // Get release
      const release = await storage.getRelease(releaseId);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      
      // Check if already verified
      const existingList = await storage.getBlockchainVerificationsByEntity('release', releaseId);
      const existing = existingList.find(v => v.status === 'submitted' || v.status === 'confirmed');
      if (existing) {
        return res.json({
          success: true,
          alreadyVerified: true,
          verification: existing,
          solscanUrl: existing.txSignature 
            ? blockchainService.getSolscanUrl(existing.txSignature, existing.network as 'mainnet-beta' | 'devnet')
            : null,
        });
      }
      
      // Prepare and submit to blockchain
      const blockchainData = blockchainService.prepareReleaseData(release as any);
      const result = await blockchainService.createVerification(blockchainData, 'mainnet-beta');
      
      // Create hallmark entry for app verification badge using system user
      const hallmark = await storage.createHallmark({
        userId: 'system',
        tokenId: `RELEASE-${release.version}`,
        assetNumber: 0,
        transactionHash: result.txSignature || result.dataHash,
        metadata: JSON.stringify({
          type: 'RELEASE_VERIFICATION',
          version: release.version,
          versionType: release.versionType,
          dataHash: result.dataHash,
          status: result.status,
          network: 'mainnet-beta',
        }),
        displayName: `GarageBot v${release.version}`,
        assetType: 'release',
      } as any);
      
      res.json({
        success: result.success,
        hallmark,
        solscanUrl: result.solscanUrl,
        dataHash: result.dataHash,
        txSignature: result.txSignature,
      });
    } catch (error) {
      console.error("Verify release error:", error);
      res.status(500).json({ error: "Failed to verify release on blockchain" });
    }
  });
  
  // Check blockchain connection and wallet status
  app.get('/api/blockchain/health', async (req, res) => {
    try {
      const status = await blockchainService.checkBlockchainStatus();
      res.json(status);
    } catch (error) {
      console.error("Blockchain health check error:", error);
      res.status(500).json({ connected: false, error: String(error) });
    }
  });
  
  // Get all blockchain verifications (admin/dev portal view - requires PIN)
  app.get('/api/blockchain/all', async (req, res) => {
    try {
      const pin = req.query.pin as string;
      const DEV_PORTAL_PIN = '0424';
      
      if (pin !== DEV_PORTAL_PIN) {
        return res.status(403).json({ error: "Access denied. Admin PIN required." });
      }
      
      const verifications = await storage.getAllBlockchainVerifications();
      
      // Enrich with entity details
      const enrichedVerifications = await Promise.all(
        verifications.map(async (v) => {
          let entityDetails: any = null;
          let ownerInfo: any = null;
          
          if (v.entityType === 'hallmark') {
            const hallmark = await storage.getHallmark(v.entityId);
            if (hallmark) {
              entityDetails = {
                assetNumber: hallmark.assetNumber,
                displayName: hallmark.displayName,
                assetType: hallmark.assetType,
              };
              const user = await storage.getUser(hallmark.userId);
              ownerInfo = user ? { id: user.id, username: user.username, email: user.email } : null;
            }
          } else if (v.entityType === 'vehicle') {
            const vehicle = await storage.getVehicle(v.entityId);
            if (vehicle) {
              entityDetails = {
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                vin: vehicle.vin,
                nickname: (vehicle as any).nickname,
              };
              const user = await storage.getUser(vehicle.userId);
              ownerInfo = user ? { id: user.id, username: user.username, email: user.email } : null;
            }
          } else if (v.entityType === 'release') {
            const release = await storage.getReleaseByVersion(v.entityId);
            if (release) {
              entityDetails = {
                version: release.version,
                versionType: release.versionType,
                status: release.status,
              };
            }
          }
          
          return {
            ...v,
            entityDetails,
            ownerInfo,
            solscanUrl: v.txSignature && !v.txSignature.startsWith('HASH_') && !v.txSignature.startsWith('DEMO_')
              ? blockchainService.getSolscanUrl(v.txSignature, v.network as 'mainnet-beta' | 'devnet')
              : null,
          };
        })
      );
      
      res.json(enrichedVerifications);
    } catch (error) {
      console.error("Get all blockchain verifications error:", error);
      res.status(500).json({ error: "Failed to get all verifications" });
    }
  });

  // ============================================
  // RELEASE VERSION CONTROL ROUTES
  // ============================================

  // Get all releases (optionally filter by status)
  app.get('/api/releases', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const releases = await storage.getReleases(status ? { status } : undefined);
      res.json(releases);
    } catch (error) {
      console.error("Get releases error:", error);
      res.status(500).json({ error: "Failed to get releases" });
    }
  });

  // Get latest published release
  app.get('/api/releases/latest', async (req, res) => {
    try {
      const release = await storage.getLatestRelease();
      res.json(release || null);
    } catch (error) {
      console.error("Get latest release error:", error);
      res.status(500).json({ error: "Failed to get latest release" });
    }
  });

  // Get next version number
  app.get('/api/releases/next-version', async (req, res) => {
    try {
      const nextNumber = await storage.getNextVersionNumber();
      res.json({ nextVersionNumber: nextNumber });
    } catch (error) {
      console.error("Get next version error:", error);
      res.status(500).json({ error: "Failed to get next version number" });
    }
  });

  // Get single release by ID
  app.get('/api/releases/:id', async (req, res) => {
    try {
      const release = await storage.getRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      res.json(release);
    } catch (error) {
      console.error("Get release error:", error);
      res.status(500).json({ error: "Failed to get release" });
    }
  });

  // Create new release (Dev Portal only)
  app.post('/api/releases', async (req, res) => {
    try {
      const { version, versionType, title, changelog, highlights, notes, createdBy } = req.body;
      
      // Check if version already exists
      const existing = await storage.getReleaseByVersion(version);
      if (existing) {
        return res.status(400).json({ error: "Version already exists" });
      }
      
      // Get next version number
      const versionNumber = await storage.getNextVersionNumber();
      
      const release = await storage.createRelease({
        version,
        versionType,
        versionNumber,
        title: title || null,
        changelog: changelog || [],
        highlights: highlights || null,
        notes: notes || null,
        status: 'draft',
        createdBy: createdBy || null,
      });
      
      res.status(201).json(release);
    } catch (error) {
      console.error("Create release error:", error);
      res.status(500).json({ error: "Failed to create release" });
    }
  });

  // Update release
  app.patch('/api/releases/:id', async (req, res) => {
    try {
      const release = await storage.updateRelease(req.params.id, req.body);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      res.json(release);
    } catch (error) {
      console.error("Update release error:", error);
      res.status(500).json({ error: "Failed to update release" });
    }
  });

  // Publish a release
  app.post('/api/releases/:id/publish', async (req, res) => {
    try {
      const release = await storage.publishRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      
      // Auto-verify on Solana blockchain
      try {
        const blockchainService = await import('./services/blockchain');
        const blockchainData = blockchainService.prepareReleaseData({
          id: release.id,
          version: release.version,
          versionType: release.versionType,
          changelog: (release.changelog as Record<string, string[]>) ?? null,
          publishedAt: release.publishedAt ?? null,
        });
        const result = await blockchainService.createVerification(blockchainData, 'mainnet-beta');
        
        if (result.success && result.txSignature) {
          // Update release with blockchain verification
          await storage.updateRelease(release.id, {
            isBlockchainVerified: true,
            blockchainVerificationId: result.txSignature,
          });
          
          console.log(`[blockchain] Auto-verified release ${release.version}: ${result.txSignature}`);
          
          return res.json({
            ...release,
            isBlockchainVerified: true,
            blockchainVerificationId: result.txSignature,
            solscanUrl: result.solscanUrl,
          });
        }
      } catch (blockchainError) {
        console.error("[blockchain] Auto-verification failed:", blockchainError);
        // Still return success - release is published, blockchain is optional
      }
      
      res.json(release);
    } catch (error) {
      console.error("Publish release error:", error);
      res.status(500).json({ error: "Failed to publish release" });
    }
  });

  // Delete release (drafts only)
  app.delete('/api/releases/:id', async (req, res) => {
    try {
      const release = await storage.getRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      if (release.status === 'published') {
        return res.status(400).json({ error: "Cannot delete published releases" });
      }
      
      const deleted = await storage.deleteRelease(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Delete release error:", error);
      res.status(500).json({ error: "Failed to delete release" });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DARKWAVE DEVELOPER HUB INTEGRATION
  // Connects GarageBot to DarkWave ecosystem for cross-app data sync
  // ═══════════════════════════════════════════════════════════════════════════════

  const { createDevHubClient } = await import("./ecosystemHub");
  const devHubClient = createDevHubClient();

  // Test DarkWave Hub connection
  app.get("/api/dev-hub/connect", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured", configured: false });
    }
    try {
      const status = await devHubClient.checkConnection();
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Push code snippet to hub
  app.post("/api/dev-hub/snippet", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { name, code, language, category, description, tags } = req.body;
      const result = await devHubClient.pushSnippet({ name, code, language, category, description, tags });
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Get snippets from hub
  app.get("/api/dev-hub/snippets", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const category = req.query.category as string | undefined;
      const snippets = await devHubClient.getSnippets(category);
      res.json({ success: true, snippets });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Sync W-2 employees and workers
  app.post("/api/dev-hub/sync-workers", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { workers } = req.body;
      const result = await devHubClient.syncWorkers(workers);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Sync 1099 contractors
  app.post("/api/dev-hub/sync-contractors", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { contractors } = req.body;
      const result = await devHubClient.syncContractors(contractors);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Sync 1099 payment data
  app.post("/api/dev-hub/sync-1099", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { year, payments } = req.body;
      const result = await (devHubClient as any).sync1099Data(year, payments);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Sync W-2 payroll data
  app.post("/api/dev-hub/sync-w2", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { year, payrolls } = req.body;
      const result = await devHubClient.syncW2Payroll(year, payrolls);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Sync timesheets
  app.post("/api/dev-hub/sync-timesheets", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { timesheets } = req.body;
      const result = await devHubClient.syncTimesheets(timesheets);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Sync certifications (ASE, EPA 608, etc.)
  app.post("/api/dev-hub/sync-certs", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { certifications } = req.body;
      const result = await devHubClient.syncCertifications(certifications);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Get activity logs from hub
  app.get("/api/dev-hub/logs", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await devHubClient.getActivityLogs(limit);
      res.json({ success: true, logs });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Log activity to hub
  app.post("/api/dev-hub/log", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const { action, details } = req.body;
      const result = await devHubClient.logActivity(action, details);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Get workers for a specific shop (Mechanics Garage integration)
  app.get("/api/dev-hub/shops/:shopId/workers", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const workers = await devHubClient.getWorkersByShop(req.params.shopId);
      res.json({ success: true, workers });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Get payroll summary for a shop
  app.get("/api/dev-hub/shops/:shopId/payroll", async (req, res) => {
    if (!devHubClient) {
      return res.status(503).json({ error: "DarkWave Hub not configured" });
    }
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const summary = await (devHubClient as any).getShopPayrollSummary(req.params.shopId, year, month);
      res.json({ success: true, summary });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ============================================
  // COMMUNITY FEATURES - Reviews, Wishlists, Projects
  // ============================================

  // Vendor Reviews
  app.get("/api/vendors/:vendorId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getVendorReviews(req.params.vendorId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/vendors/:vendorId/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const review = await storage.createVendorReview({
        vendorId: req.params.vendorId,
        userId,
        rating: req.body.rating,
        title: req.body.title,
        content: req.body.content,
        shippingRating: req.body.shippingRating,
        priceRating: req.body.priceRating,
        qualityRating: req.body.qualityRating,
        wouldRecommend: req.body.wouldRecommend,
      });
      res.json(review);
    } catch (err) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Wishlists
  app.get("/api/wishlists", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const wishlists = await storage.getUserWishlists(userId);
      res.json(wishlists);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch wishlists" });
    }
  });

  app.post("/api/wishlists", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const wishlist = await storage.createWishlist({
        userId,
        name: req.body.name,
        description: req.body.description,
        vehicleId: req.body.vehicleId,
        isPublic: req.body.isPublic || false,
        shareCode,
      });
      res.json(wishlist);
    } catch (err) {
      res.status(500).json({ error: "Failed to create wishlist" });
    }
  });

  app.get("/api/wishlists/:id", async (req, res) => {
    try {
      const wishlist = await storage.getWishlistById(req.params.id);
      if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });
      res.json(wishlist);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.get("/api/wishlists/share/:shareCode", async (req, res) => {
    try {
      const result = await storage.getWishlistByShareCode(req.params.shareCode);
      if (!result) return res.status(404).json({ error: "Wishlist not found" });
      await storage.incrementWishlistViews(result.wishlist.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlists/:id/items", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.addWishlistItem({
        wishlistId: req.params.id,
        partName: req.body.partName,
        partNumber: req.body.partNumber,
        vendorSlug: req.body.vendorSlug,
        estimatedPrice: req.body.estimatedPrice,
        quantity: req.body.quantity || 1,
        priority: req.body.priority || "medium",
        notes: req.body.notes,
      });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to add item" });
    }
  });

  app.delete("/api/wishlists/:wishlistId/items/:itemId", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteWishlistItem(req.params.itemId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Projects
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const project = await storage.createProject({
        userId,
        name: req.body.name,
        description: req.body.description,
        vehicleId: req.body.vehicleId,
        status: "planning",
        targetBudget: req.body.targetBudget,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : null,
        isPublic: req.body.isPublic || false,
        shareCode,
      });
      res.json(project);
    } catch (err) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (err) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.post("/api/projects/:id/parts", isAuthenticated, async (req: any, res) => {
    try {
      const part = await storage.addProjectPart({
        projectId: req.params.id,
        partName: req.body.partName,
        partNumber: req.body.partNumber,
        vendorSlug: req.body.vendorSlug,
        purchaseUrl: req.body.purchaseUrl,
        estimatedPrice: req.body.estimatedPrice,
        quantity: req.body.quantity || 1,
        status: "needed",
        notes: req.body.notes,
      });
      res.json(part);
    } catch (err) {
      res.status(500).json({ error: "Failed to add part" });
    }
  });

  app.patch("/api/projects/:projectId/parts/:partId", isAuthenticated, async (req, res) => {
    try {
      const part = await storage.updateProjectPart(req.params.partId, req.body);
      res.json(part);
    } catch (err) {
      res.status(500).json({ error: "Failed to update part" });
    }
  });

  app.delete("/api/projects/:projectId/parts/:partId", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProjectPart(req.params.partId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete part" });
    }
  });

  // ============================================
  // SMS PREFERENCES (Twilio Stub)
  // ============================================

  app.get("/api/sms/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const prefs = await storage.getSmsPreferences(userId);
      res.json(prefs || { serviceReminders: false, priceAlerts: false, orderUpdates: false });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SMS preferences" });
    }
  });

  app.post("/api/sms/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      const prefs = await storage.upsertSmsPreferences({
        userId,
        phoneNumber: req.body.phoneNumber,
        serviceReminders: req.body.serviceReminders,
        priceAlerts: req.body.priceAlerts,
        orderUpdates: req.body.orderUpdates,
        promotions: req.body.promotions,
        quietHoursStart: req.body.quietHoursStart,
        quietHoursEnd: req.body.quietHoursEnd,
        timezone: req.body.timezone,
      });
      res.json(prefs);
    } catch (err) {
      res.status(500).json({ error: "Failed to save SMS preferences" });
    }
  });

  app.post("/api/sms/verify", isAuthenticated, async (req: any, res) => {
    // Stub - would send verification SMS via Twilio
    res.json({ 
      success: true, 
      message: "SMS verification not yet configured. Twilio integration pending.",
      stubbed: true 
    });
  });

  app.post("/api/sms/confirm", isAuthenticated, async (req: any, res) => {
    // Stub - would verify the code
    res.json({ 
      success: false, 
      message: "SMS verification not yet configured. Twilio integration pending.",
      stubbed: true 
    });
  });

  // ============================================
  // ANALYTICS & SEO SYSTEM
  // ============================================

  // SEO Pages CRUD
  app.get("/api/seo/pages", async (req, res) => {
    try {
      const pages = await storage.getSeoPages();
      res.json(pages);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SEO pages" });
    }
  });

  app.get("/api/seo/pages/:id", async (req, res) => {
    try {
      const page = await storage.getSeoPage(req.params.id);
      if (!page) return res.status(404).json({ error: "SEO page not found" });
      res.json(page);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SEO page" });
    }
  });

  app.get("/api/seo/route", async (req, res) => {
    try {
      const route = req.query.route as string;
      if (!route) return res.status(400).json({ error: "Route parameter required" });
      const page = await storage.getSeoPageByRoute(route);
      res.json(page || null);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch SEO settings" });
    }
  });

  app.post("/api/seo/pages", async (req, res) => {
    try {
      const result = insertSeoPageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const page = await storage.createSeoPage(result.data);
      res.json(page);
    } catch (err: any) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "SEO settings already exist for this route" });
      }
      res.status(500).json({ error: "Failed to create SEO page" });
    }
  });

  app.put("/api/seo/pages/:id", async (req, res) => {
    try {
      const result = insertSeoPageSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const page = await storage.updateSeoPage(req.params.id, result.data);
      if (!page) return res.status(404).json({ error: "SEO page not found" });
      res.json(page);
    } catch (err) {
      res.status(500).json({ error: "Failed to update SEO page" });
    }
  });

  app.delete("/api/seo/pages/:id", async (req, res) => {
    try {
      const success = await storage.deleteSeoPage(req.params.id);
      if (!success) return res.status(404).json({ error: "SEO page not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete SEO page" });
    }
  });

  // ============================================
  // BLOG SYSTEM (AI-Powered SEO Content)
  // ============================================

  // Blog Categories
  const BLOG_CATEGORIES = [
    'DIY Guides', 'Maintenance Tips', 'Part Reviews', 'Industry News',
    'Vehicle Spotlights', 'Tech & Tools', 'Safety Tips', 'Money Saving'
  ] as const;

  // Get all published blog posts
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const { category, limit, all } = req.query;
      const options: { published?: boolean; category?: string; limit?: number } = {};
      
      if (all !== 'true') {
        options.published = true;
      }
      if (category && typeof category === 'string') {
        options.category = category;
      }
      if (limit && typeof limit === 'string') {
        options.limit = parseInt(limit);
      }
      
      const posts = await storage.getBlogPosts(options);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get featured posts
  app.get("/api/blog/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const posts = await storage.getFeaturedBlogPosts(limit);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch featured posts" });
    }
  });

  // Get blog categories
  app.get("/api/blog/categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories.length > 0 ? categories : BLOG_CATEGORIES);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get single blog post by slug
  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      
      // Increment view count
      await storage.incrementBlogPostViews(post.id);
      
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Generate AI blog post
  app.post("/api/blog/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { topic, category, vehicleTypes } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const systemPrompt = `You are Buddy, the expert AI assistant for GarageBot - an auto parts aggregator platform. 
Write engaging, SEO-optimized blog posts about automotive topics including cars, trucks, motorcycles, ATVs, boats, RVs, and all vehicles with engines.

Your writing style should be:
- Conversational but authoritative
- Packed with practical, actionable advice
- Include relevant keywords naturally
- Use clear headings and bullet points
- Reference the types of parts or maintenance involved

Format your response as JSON with these fields:
- title: SEO-optimized title (60 chars max)
- excerpt: Engaging summary (150 chars max)
- content: Full article in markdown format
- metaTitle: SEO meta title (60 chars max)
- metaDescription: SEO meta description (155 chars max)
- metaKeywords: Comma-separated keywords
- tags: Array of relevant tags
- readTimeMinutes: Estimated read time`;

      const userPrompt = `Write a blog post about: ${topic}
Category: ${category || 'Maintenance Tips'}
Vehicle types to focus on: ${vehicleTypes?.join(', ') || 'all vehicles'}

Make it helpful for DIY mechanics and vehicle owners looking for parts and maintenance guidance.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content generated");
      }

      const generated = JSON.parse(content);
      
      // Create slug from title
      const slug = generated.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);

      // Save to database
      const post = await storage.createBlogPost({
        slug: `${slug}-${Date.now().toString(36)}`,
        title: generated.title,
        excerpt: generated.excerpt,
        content: generated.content,
        category: category || 'Maintenance Tips',
        tags: generated.tags || [],
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        metaKeywords: generated.metaKeywords,
        vehicleTypes: vehicleTypes || [],
        readTimeMinutes: generated.readTimeMinutes || 5,
        aiGenerated: true,
        isPublished: false,
        author: "Buddy AI"
      });

      res.json(post);
    } catch (err: any) {
      console.error("Blog generation error:", err);
      res.status(500).json({ error: "Failed to generate blog post" });
    }
  });

  // Publish/unpublish blog post
  app.patch("/api/blog/posts/:id/publish", isAuthenticated, async (req: any, res) => {
    try {
      const { publish } = req.body;
      const post = await storage.updateBlogPost(req.params.id, {
        isPublished: publish,
        publishedAt: publish ? new Date() : null
      });
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // Update blog post
  app.put("/api/blog/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // Delete blog post
  app.delete("/api/blog/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) return res.status(404).json({ error: "Blog post not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Feature/unfeature blog post
  app.patch("/api/blog/posts/:id/feature", isAuthenticated, async (req: any, res) => {
    try {
      const { featured } = req.body;
      const post = await storage.updateBlogPost(req.params.id, { isFeatured: featured });
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // ============== SHOP MARKETING HUB ROUTES (TENANT-SPACED) ==============
  
  // Check if shop has Marketing Hub subscription
  app.get("/api/shop/:shopId/marketing/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Verify user has access to this shop
      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length) {
        return res.status(404).json({ error: "Shop not found" });
      }
      
      const isOwner = shop[0].ownerId === userId;
      const staffMember = await db.select().from(shopStaff)
        .where(and(eq(shopStaff.shopId, shopId), eq(shopStaff.userId, userId)))
        .limit(1);
      
      if (!isOwner && !staffMember.length) {
        return res.status(403).json({ error: "Not authorized for this shop" });
      }
      
      // Check for active subscription
      const subscription = await db.select().from(marketingHubSubscriptions)
        .where(and(
          eq(marketingHubSubscriptions.shopId, shopId),
          eq(marketingHubSubscriptions.status, "active")
        ))
        .limit(1);
      
      res.json({
        hasSubscription: subscription.length > 0,
        subscription: subscription[0] || null,
        pricing: {
          basic: { price: 29, features: ["6 platforms", "DAM library", "Basic analytics", "50 posts/month"] },
          pro: { price: 49, features: ["All Basic features", "AI content generation", "Advanced analytics", "Unlimited posts"] },
          enterprise: { price: 99, features: ["All Pro features", "White-label", "Dedicated support", "Custom integrations"] }
        }
      });
    } catch (error) {
      console.error("[Marketing Hub] Subscription check error:", error);
      res.status(500).json({ error: "Failed to check subscription" });
    }
  });
  
  // Helper function to verify shop access
  async function verifyShopAccess(shopId: string, userId: string): Promise<{ authorized: boolean; isOwner: boolean }> {
    const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    if (!shop.length) return { authorized: false, isOwner: false };
    
    const isOwner = shop[0].ownerId === userId;
    if (isOwner) return { authorized: true, isOwner: true };
    
    const staffMember = await db.select().from(shopStaff)
      .where(and(eq(shopStaff.shopId, shopId), eq(shopStaff.userId, userId)))
      .limit(1);
    
    return { authorized: staffMember.length > 0, isOwner: false };
  }
  
  // Get shop's social credentials status
  app.get("/api/shop/:shopId/marketing/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Verify user has access to this shop
      const access = await verifyShopAccess(shopId, userId);
      if (!access.authorized) {
        return res.status(403).json({ error: "Not authorized for this shop" });
      }
      
      const credentials = await db.select({
        platform: shopSocialCredentials.platform,
        isActive: shopSocialCredentials.isActive,
        lastUsedAt: shopSocialCredentials.lastUsedAt
      }).from(shopSocialCredentials)
        .where(eq(shopSocialCredentials.shopId, shopId));
      
      const platforms = ["twitter", "facebook", "instagram", "linkedin", "google", "nextdoor"];
      const status = platforms.map(p => ({
        platform: p,
        connected: credentials.some(c => c.platform === p && c.isActive),
        lastUsed: credentials.find(c => c.platform === p)?.lastUsedAt || null
      }));
      
      res.json(status);
    } catch (error) {
      console.error("[Marketing Hub] Integration status error:", error);
      res.status(500).json({ error: "Failed to get integration status" });
    }
  });
  
  // Get shop's marketing content
  app.get("/api/shop/:shopId/marketing/content", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user?.claims?.sub;
      const { status, platform } = req.query;
      
      // Verify user has access to this shop
      const access = await verifyShopAccess(shopId, userId);
      if (!access.authorized) {
        return res.status(403).json({ error: "Not authorized for this shop" });
      }
      
      let query = db.select().from(shopMarketingContent)
        .where(eq(shopMarketingContent.shopId, shopId))
        .orderBy(desc(shopMarketingContent.createdAt));
      
      const content = await query;
      
      let filtered = content;
      if (status) filtered = filtered.filter(c => c.status === status);
      if (platform) filtered = filtered.filter(c => c.platform === platform);
      
      res.json(filtered);
    } catch (error) {
      console.error("[Marketing Hub] Content fetch error:", error);
      res.status(500).json({ error: "Failed to get marketing content" });
    }
  });
  
  // Create shop marketing content
  app.post("/api/shop/:shopId/marketing/content", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const userId = req.user?.claims?.sub;
      const { type, platform, content, imageUrl, hashtags, scheduledFor } = req.body;
      
      // Verify user has access to this shop
      const access = await verifyShopAccess(shopId, userId);
      if (!access.authorized) {
        return res.status(403).json({ error: "Not authorized for this shop" });
      }
      
      const [newContent] = await db.insert(shopMarketingContent).values({
        shopId,
        type: type || "post",
        platform,
        content,
        imageUrl,
        hashtags: hashtags || [],
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? "scheduled" : "draft"
      }).returning();
      
      res.json(newContent);
    } catch (error) {
      console.error("[Marketing Hub] Content creation error:", error);
      res.status(500).json({ error: "Failed to create content" });
    }
  });
  
  // Subscribe shop to Marketing Hub
  app.post("/api/shop/:shopId/marketing/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const { shopId } = req.params;
      const { tier } = req.body;
      const userId = req.user?.claims?.sub;
      
      // Verify shop ownership
      const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
      if (!shop.length || shop[0].ownerId !== userId) {
        return res.status(403).json({ error: "Only shop owners can subscribe" });
      }
      
      const pricing: Record<string, number> = { basic: 2900, pro: 4900, enterprise: 9900 };
      
      // Create subscription (would integrate with Stripe in production)
      const [subscription] = await db.insert(marketingHubSubscriptions).values({
        shopId,
        tier: tier || "basic",
        monthlyPrice: pricing[tier] || 2900,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }).returning();
      
      res.json({ success: true, subscription });
    } catch (error) {
      console.error("[Marketing Hub] Subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // ============== MARKETING HUB ROUTES (PLATFORM-WIDE) ==============
  
  // Get marketing status and stats
  app.get("/api/marketing/status", isAuthenticated, async (req: any, res) => {
    try {
      const { getMarketingStats } = await import('./marketing-scheduler');
      const { getConnectorStatus } = await import('./social-connectors');
      const stats = await getMarketingStats();
      const connectors = getConnectorStatus();
      res.json({ stats, connectors });
    } catch (err) {
      res.status(500).json({ error: "Failed to get marketing status" });
    }
  });

  // Get all marketing posts
  app.get("/api/marketing/posts", isAuthenticated, async (req: any, res) => {
    try {
      const posts = await db.select().from(marketingPosts).orderBy(desc(marketingPosts.createdAt));
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to get marketing posts" });
    }
  });

  // Create marketing post
  app.post("/api/marketing/posts", isAuthenticated, async (req: any, res) => {
    try {
      const { content, platform, hashtags, targetSite } = req.body;
      const [post] = await db.insert(marketingPosts).values({
        content,
        platform: platform || 'all',
        hashtags: hashtags || [],
        targetSite: targetSite || 'garagebot',
      }).returning();
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to create marketing post" });
    }
  });

  // Update marketing post
  app.put("/api/marketing/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { content, platform, hashtags, targetSite, isActive } = req.body;
      const [post] = await db.update(marketingPosts)
        .set({ content, platform, hashtags, targetSite, isActive })
        .where(eq(marketingPosts.id, req.params.id))
        .returning();
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to update marketing post" });
    }
  });

  // Delete marketing post
  app.delete("/api/marketing/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      await db.delete(marketingPosts).where(eq(marketingPosts.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete marketing post" });
    }
  });

  // Get marketing images
  app.get("/api/marketing/images", isAuthenticated, async (req: any, res) => {
    try {
      const images = await db.select().from(marketingImages).orderBy(desc(marketingImages.createdAt));
      res.json(images);
    } catch (err) {
      res.status(500).json({ error: "Failed to get marketing images" });
    }
  });

  // Get posting history
  app.get("/api/marketing/history", isAuthenticated, async (req: any, res) => {
    try {
      const { getPostingHistory } = await import('./marketing-scheduler');
      const history = await getPostingHistory(100);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Failed to get posting history" });
    }
  });

  // Get social integration status
  app.get("/api/marketing/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const [integration] = await db.select().from(socialIntegrations).limit(1);
      const { socialMediaManager } = await import('./services/socialMedia');
      const status = socialMediaManager.getStatus();
      
      res.json({
        integration: {
          ...(integration || {}),
          linkedinConnected: status.linkedin,
          nextdoorConnected: status.nextdoor,
          googleBusinessConnected: status.google,
        },
        connectors: {
          twitter: status.twitter,
          facebook: status.facebook,
          instagram: status.instagram,
          linkedin: status.linkedin,
          google: status.google,
          nextdoor: status.nextdoor,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to get integrations" });
    }
  });

  // Manual post trigger (for testing)
  app.post("/api/marketing/post-now", isAuthenticated, async (req: any, res) => {
    try {
      const { postId, platforms, imageUrl } = req.body;
      const [post] = await db.select().from(marketingPosts).where(eq(marketingPosts.id, postId));
      if (!post) return res.status(404).json({ error: "Post not found" });
      
      const { socialMediaManager } = await import('./services/socialMedia');
      
      const content = {
        text: post.content,
        hashtags: post.hashtags || [],
        imageUrl: imageUrl || undefined,
      };
      
      const targetPlatforms = platforms.includes('all') 
        ? ['x', 'facebook', 'instagram', 'linkedin', 'google', 'nextdoor']
        : platforms;
      
      const results = await socialMediaManager.postToAll(content, targetPlatforms);
      
      for (const result of results) {
        await db.insert(scheduledPosts).values({
          marketingPostId: post.id,
          platform: result.platform,
          content: post.content,
          status: result.success ? 'posted' : 'failed',
          externalPostId: result.postId || null,
          error: result.error || null,
          postedAt: result.success ? new Date() : null,
        });
      }
      
      if (results.some(r => r.success)) {
        await db.update(marketingPosts)
          .set({ usageCount: (post.usageCount || 0) + 1, lastUsedAt: new Date() })
          .where(eq(marketingPosts.id, postId));
      }
      
      res.json({ 
        results: results.reduce((acc, r) => ({ ...acc, [r.platform]: r }), {}),
        summary: {
          posted: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        }
      });
    } catch (err) {
      console.error("Post-now error:", err);
      res.status(500).json({ error: "Failed to post" });
    }
  });

  // Seed comprehensive marketing content
  app.post("/api/marketing/seed", isAuthenticated, async (req: any, res) => {
    try {
      // Comprehensive hashtag sets for maximum visibility
      const ECOSYSTEM_HASHTAGS = ['#GarageBot', '#DWTL', '#DWSC', '#TrustShield', '#DarkWaveStudios'];
      const AUTO_HASHTAGS = ['#AutoParts', '#CarRepair', '#DIYMechanic', '#AutoRepair', '#CarMaintenance', '#MechanicLife', '#CarParts', '#AutoShop', '#GarageTips', '#CarCare'];
      const VEHICLE_HASHTAGS = ['#Cars', '#Trucks', '#Motorcycles', '#ATV', '#Boats', '#RV', '#ClassicCars', '#CarEnthusiast', '#Automotive', '#VehicleMaintenance'];
      const TECH_HASHTAGS = ['#TechStartup', '#AI', '#SaaS', '#SmallBusiness', '#Entrepreneur', '#Innovation', '#TechNews', '#DigitalTransformation'];
      const DIY_HASHTAGS = ['#DIY', '#Howto', '#Tutorial', '#FixIt', '#SaveMoney', '#WeekendWarrior', '#HomeGarage', '#ProjectCar'];
      const SHOP_HASHTAGS = ['#AutoShopOwner', '#MechanicsGarage', '#ShopManagement', '#AutoBusiness', '#ShopTech', '#RepairShop', '#AutoService'];
      
      const marketingContent = [
        // GarageBot.io focused posts
        {
          content: "Stop overpaying for auto repairs! GarageBot compares prices from 50+ retailers to find you the best deals on parts. Your wallet will thank you.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...AUTO_HASHTAGS.slice(0,5), '#SaveMoney', '#SmartShopping'],
          category: "parts-search",
          tone: "promotional"
        },
        {
          content: "🔧 DIY mechanic tip: Always check multiple retailers before buying parts. GarageBot searches 50+ stores instantly so you never overpay again!",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...DIY_HASHTAGS, ...AUTO_HASHTAGS.slice(0,3)],
          category: "diy-tips",
          tone: "educational"
        },
        {
          content: "Your vehicle deserves the best. GarageBot's AI-powered search finds OEM and aftermarket parts with guaranteed fitment for cars, trucks, motorcycles, boats, ATVs & RVs.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...VEHICLE_HASHTAGS, '#OEMParts', '#AftermarketParts'],
          category: "vehicle-types",
          tone: "professional"
        },
        {
          content: "🚗 Managing a fleet? GarageBot Pro lets you track unlimited vehicles, get AI repair estimates, and access exclusive dealer pricing. Try it free!",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#FleetManagement', '#FleetMaintenance', ...AUTO_HASHTAGS.slice(0,3), ...TECH_HASHTAGS.slice(0,3)],
          category: "pro-features",
          tone: "promotional"
        },
        {
          content: "Auto shop owners: Compete with AutoLeap & Shopmonkey at 1/4 the price! GarageBot's Mechanics Garage portal handles estimates, invoicing, scheduling & more. $49/mo.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...SHOP_HASHTAGS, '#ShopOwner', '#AutoIndustry', '#BusinessTools'],
          category: "mechanics-garage",
          tone: "promotional"
        },
        {
          content: "💡 Did you know? Most people overpay 30-50% on auto parts by only checking one retailer. GarageBot compares 50+ stores in seconds!",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...AUTO_HASHTAGS, '#MoneyTips', '#ConsumerTips'],
          category: "education",
          tone: "educational"
        },
        {
          content: "VIN decoding + instant parts lookup = never order the wrong part again. GarageBot's Vehicle Passport ensures guaranteed fitment every time.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#VIN', '#VehicleHistory', ...AUTO_HASHTAGS.slice(0,4)],
          category: "vin-features",
          tone: "professional"
        },
        {
          content: "🏍️ Motorcycle riders! GarageBot isn't just for cars. Find parts for your bike from 50+ retailers with guaranteed fitment.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#Motorcycles', '#BikerLife', '#MotorcycleParts', '#RideOrDie', '#TwoWheels', '#BikeLife'],
          category: "motorcycles",
          tone: "friendly"
        },
        {
          content: "Weekend project? Get AI-generated repair guides with step-by-step instructions, tool lists, and video tutorials. GarageBot makes DIY repairs easy!",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...DIY_HASHTAGS, '#WeekendProject', '#GarageTime'],
          category: "diy-guides",
          tone: "friendly"
        },
        {
          content: "⛵ Boat owners rejoice! GarageBot searches marine parts from top retailers. Keep your vessel running smooth all season.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#Boating', '#MarineParts', '#BoatLife', '#SailingLife', '#BoatMaintenance', '#MarineRepair'],
          category: "boats",
          tone: "friendly"
        },
        // DWTL.io focused posts
        {
          content: "DWTL.io - The Trust Layer powering secure digital identity across the DarkWave ecosystem. One login. All apps. Zero friction.",
          platform: "all",
          targetSite: "dwtl",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#DigitalIdentity', '#SSO', '#CyberSecurity', '#TechInnovation', '#WebSecurity'],
          category: "identity",
          tone: "professional"
        },
        {
          content: "🔐 Tired of managing 50 different logins? DWTL.io brings single sign-on to the DarkWave ecosystem. Secure, seamless, simple.",
          platform: "all",
          targetSite: "dwtl",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#SSO', '#SingleSignOn', '#PasswordManagement', '#TechLife', '#Security'],
          category: "sso",
          tone: "promotional"
        },
        // DWSC.io focused posts
        {
          content: "DWSC.io - DarkWave Service Cloud. Enterprise-grade infrastructure for the modern web. Reliable. Scalable. Secure.",
          platform: "all",
          targetSite: "dwsc",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#CloudComputing', '#CloudServices', '#WebHosting', '#DevOps', '#CloudInfrastructure'],
          category: "cloud",
          tone: "professional"
        },
        {
          content: "☁️ Building the next big thing? DWSC.io provides the cloud infrastructure you need to scale. Join the DarkWave ecosystem today!",
          platform: "all",
          targetSite: "dwsc",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#Startup', '#CloudNative', '#TechStartup', '#ScaleUp', '#WebDev', '#CloudFirst'],
          category: "startup",
          tone: "promotional"
        },
        // TrustShield.tech focused posts
        {
          content: "TrustShield.tech - Blockchain-verified authenticity for businesses and consumers. Prove what's real in a world of fakes.",
          platform: "all",
          targetSite: "trustshield",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#Blockchain', '#Web3', '#Authenticity', '#NFT', '#CryptoTech', '#Verification'],
          category: "blockchain",
          tone: "professional"
        },
        {
          content: "🛡️ Fight counterfeits with TrustShield.tech! Blockchain verification ensures your products and documents are the real deal.",
          platform: "all",
          targetSite: "trustshield",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#AntiCounterfeit', '#Blockchain', '#ProductAuthenticity', '#BrandProtection', '#Crypto'],
          category: "verification",
          tone: "promotional"
        },
        // Cross-ecosystem posts
        {
          content: "The DarkWave ecosystem: GarageBot for auto parts, DWTL for identity, DWSC for cloud, TrustShield for verification. Building the future, one app at a time.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, ...TECH_HASHTAGS, '#Ecosystem', '#TechPlatform'],
          category: "ecosystem",
          tone: "professional"
        },
        {
          content: "🚀 Entrepreneurs: The DarkWave ecosystem has everything you need. Parts aggregation, cloud hosting, secure identity, blockchain verification. All integrated.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#Entrepreneur', '#StartupLife', '#TechEcosystem', '#BuildInPublic', '#FounderLife'],
          category: "entrepreneurs",
          tone: "promotional"
        },
        // Seasonal/timely posts
        {
          content: "🌧️ Rainy season prep: Check your wipers, tires & brakes! GarageBot helps you find the best prices on safety essentials.",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#RainySeason', '#CarSafety', '#WinterPrep', ...AUTO_HASHTAGS.slice(0,4)],
          category: "seasonal",
          tone: "friendly"
        },
        {
          content: "Road trip ready? ☀️ Use GarageBot to stock up on filters, fluids & belts before you hit the highway. Compare 50+ retailers instantly!",
          platform: "all",
          targetSite: "garagebot",
          hashtags: [...ECOSYSTEM_HASHTAGS, '#RoadTrip', '#SummerDriving', '#CarPrep', ...VEHICLE_HASHTAGS.slice(0,4)],
          category: "seasonal",
          tone: "friendly"
        }
      ];

      // Clear existing and insert new (scoped to garagebot tenant only)
      await db.delete(marketingPosts).where(eq(marketingPosts.tenantId, 'garagebot'));
      for (const post of marketingContent) {
        await db.insert(marketingPosts).values({
          content: post.content,
          platform: post.platform,
          targetSite: post.targetSite,
          hashtags: post.hashtags,
          category: post.category,
          tone: post.tone,
          tenantId: 'garagebot',
          isActive: true,
        });
      }
      
      // Seed marketing images - includes Hatch Show Print style posters
      const marketingImagesList = [
        // Lifestyle/product images
        { filename: 'garagebot-mechanic-hero.png', filePath: '/marketing/garagebot-mechanic-hero.png', category: 'hero', subject: 'mechanic', style: 'product', altText: 'Professional mechanic working on car engine' },
        { filename: 'garagebot-price-compare.png', filePath: '/marketing/garagebot-price-compare.png', category: 'feature', subject: 'comparison', style: 'product', altText: 'Price comparison across 50+ retailers' },
        { filename: 'garagebot-all-vehicles.png', filePath: '/marketing/garagebot-all-vehicles.png', category: 'vehicles', subject: 'all-types', style: 'product', altText: 'Cars trucks motorcycles ATVs boats RVs lineup' },
        { filename: 'garagebot-mobile-app.png', filePath: '/marketing/garagebot-mobile-app.png', category: 'app', subject: 'mobile', style: 'product', altText: 'GarageBot mobile app with retailer logos' },
        { filename: 'garagebot-diy-mechanic.png', filePath: '/marketing/garagebot-diy-mechanic.png', category: 'diy', subject: 'diy', style: 'lifestyle', altText: 'Weekend DIY mechanic in home garage' },
        { filename: 'garagebot-auto-shop.png', filePath: '/marketing/garagebot-auto-shop.png', category: 'shop', subject: 'professional', style: 'product', altText: 'Professional auto repair shop with digital displays' },
        // Hatch Show Print style posters
        { filename: 'hatch-garagebot-main.png', filePath: '/marketing/hatch-garagebot-main.png', category: 'brand', subject: 'garagebot', style: 'hatch-print', altText: 'GarageBot vintage letterpress poster' },
        { filename: 'hatch-garagebot-slogan.png', filePath: '/marketing/hatch-garagebot-slogan.png', category: 'brand', subject: 'slogan', style: 'hatch-print', altText: 'Right Part First Time vintage poster' },
        { filename: 'hatch-trustlayer-main.png', filePath: '/marketing/hatch-trustlayer-main.png', category: 'brand', subject: 'trustlayer', style: 'hatch-print', altText: 'Trust Layer vintage letterpress poster' },
        { filename: 'hatch-garagebot-retailers.png', filePath: '/marketing/hatch-garagebot-retailers.png', category: 'feature', subject: 'retailers', style: 'hatch-print', altText: '50+ Retailers vintage poster' },
        { filename: 'hatch-garagebot-diy.png', filePath: '/marketing/hatch-garagebot-diy.png', category: 'feature', subject: 'diy-guides', style: 'hatch-print', altText: 'DIY Repair Guides vintage poster' },
        { filename: 'hatch-mechanics-garage.png', filePath: '/marketing/hatch-mechanics-garage.png', category: 'brand', subject: 'mechanics', style: 'hatch-print', altText: 'Mechanics Garage vintage poster' },
        { filename: 'hatch-darkwave-studios.png', filePath: '/marketing/hatch-darkwave-studios.png', category: 'brand', subject: 'darkwave', style: 'hatch-print', altText: 'DarkWave Studios vintage poster' },
        { filename: 'hatch-every-engine.png', filePath: '/marketing/hatch-every-engine.png', category: 'feature', subject: 'vehicles', style: 'hatch-print', altText: 'Every Engine vintage poster' },
        { filename: 'hatch-ai-powered.png', filePath: '/marketing/hatch-ai-powered.png', category: 'feature', subject: 'ai', style: 'hatch-print', altText: 'AI Powered vintage poster' },
        { filename: 'hatch-blockchain.png', filePath: '/marketing/hatch-blockchain.png', category: 'feature', subject: 'blockchain', style: 'hatch-print', altText: 'Blockchain Verified vintage poster' },
      ];
      
      await db.delete(marketingImages).where(eq(marketingImages.tenantId, 'garagebot'));
      for (const img of marketingImagesList) {
        await db.insert(marketingImages).values({
          filename: img.filename,
          filePath: img.filePath,
          category: img.category,
          subject: img.subject,
          style: img.style,
          altText: img.altText,
          tenantId: 'garagebot',
          isActive: true,
          quality: 5,
          season: 'all-year',
        });
      }
      
      res.json({ success: true, posts: marketingContent.length, images: marketingImagesList.length, message: "Marketing content and images seeded with comprehensive hashtags" });
    } catch (err) {
      console.error("Seed error:", err);
      res.status(500).json({ error: "Failed to seed marketing content" });
    }
  });

  // Content Bundles API
  app.get("/api/marketing/bundles", async (req, res) => {
    try {
      const allBundles = await db.select().from(contentBundles)
        .where(eq(contentBundles.tenantId, 'garagebot'))
        .orderBy(desc(contentBundles.createdAt));
      res.json(allBundles);
    } catch (err) {
      console.error("Error fetching bundles:", err);
      res.json([]);
    }
  });

  app.post("/api/marketing/bundles", isAuthenticated, async (req: any, res) => {
    try {
      const { imageId, messageId, platform, postType, targetAudience, budgetRange, ctaButton, scheduledDate } = req.body;
      
      // Get image and message details
      const [image] = imageId ? await db.select().from(marketingImages).where(eq(marketingImages.id, imageId)) : [null];
      const [message] = messageId ? await db.select().from(marketingPosts).where(eq(marketingPosts.id, messageId)) : [null];
      
      const bundle = await db.insert(contentBundles).values({
        tenantId: 'garagebot',
        imageId,
        messageId,
        imageUrl: image?.filePath || null,
        message: message?.content || null,
        platform: platform || 'all',
        postType: postType || 'organic',
        targetAudience: targetAudience || null,
        budgetRange: budgetRange || null,
        ctaButton: ctaButton || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: 'suggested',
      }).returning();
      
      res.json(bundle[0]);
    } catch (err) {
      console.error("Error creating bundle:", err);
      res.status(500).json({ error: "Failed to create bundle" });
    }
  });

  // AI Content Generation
  app.post("/api/marketing/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      // Use OpenAI to generate marketing content
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a marketing expert for GarageBot, an auto parts aggregator that searches 50+ retailers. Generate engaging social media posts that:
- Are concise and attention-grabbing
- Include relevant hashtags
- Focus on the benefits (price comparison, time savings, all vehicle types)
- Use action-oriented language
- Are optimized for social media engagement
- Keep posts under 280 characters for X/Twitter compatibility`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
      });
      
      const content = completion.choices[0]?.message?.content || '';
      res.json({ content, success: true });
    } catch (err) {
      console.error("Error generating content:", err);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // Analytics Tracking Endpoints
  app.post("/api/analytics/session", async (req, res) => {
    try {
      const result = analyticsSessionRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      
      const { visitorId, userAgent, referrer, utmSource, utmMedium, utmCampaign, landingPage } = result.data;
      
      // Parse user agent for browser/device info
      const browser = parseUserAgentBrowser(userAgent || '');
      const device = parseUserAgentDevice(userAgent || '');
      const os = parseUserAgentOS(userAgent || '');
      
      // Hash IP for privacy
      const ip = req.ip || req.socket.remoteAddress || '';
      const ipHash = hashIP(ip);
      
      // Check for existing active session
      const existingSession = await storage.getAnalyticsSessionByVisitor(visitorId);
      if (existingSession) {
        return res.json({ sessionId: existingSession.id, existing: true });
      }
      
      const sessionData = {
        visitorId,
        ipHash,
        userAgent: userAgent || null,
        browser: browser || null,
        os: os || null,
        device: device || null,
        referrer: referrer || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        landingPage: landingPage || null,
      };
      
      const insertResult = insertAnalyticsSessionSchema.safeParse(sessionData);
      if (!insertResult.success) {
        console.error("Analytics session insert validation failed:", insertResult.error);
        return res.status(500).json({ error: "Internal data validation error" });
      }
      
      const session = await storage.createAnalyticsSession(insertResult.data);
      
      res.json({ sessionId: session.id, existing: false });
    } catch (err) {
      console.error("Analytics session error:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const result = analyticsPageViewRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      
      const { sessionId, visitorId, route, title, referrer, duration, scrollDepth } = result.data;
      
      const pageViewData = {
        sessionId,
        visitorId,
        route,
        title: title || null,
        referrer: referrer || null,
        duration: duration || null,
        scrollDepth: scrollDepth || null,
      };
      
      const insertResult = insertAnalyticsPageViewSchema.safeParse(pageViewData);
      if (!insertResult.success) {
        console.error("Analytics page view insert validation failed:", insertResult.error);
        return res.status(500).json({ error: "Internal data validation error" });
      }
      
      const pageView = await storage.createAnalyticsPageView(insertResult.data);
      
      res.json({ success: true, id: pageView.id });
    } catch (err) {
      console.error("Page view tracking error:", err);
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  app.post("/api/analytics/event", async (req, res) => {
    try {
      const result = analyticsEventRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      
      const { sessionId, visitorId, eventName, eventCategory, eventLabel, eventValue, route, metadata } = result.data;
      
      const eventData = {
        sessionId: sessionId || null,
        visitorId,
        eventName,
        eventCategory: eventCategory || null,
        eventLabel: eventLabel || null,
        eventValue: eventValue || null,
        route: route || null,
        metadata: metadata || null,
      };
      
      const insertResult = insertAnalyticsEventSchema.safeParse(eventData);
      if (!insertResult.success) {
        console.error("Analytics event insert validation failed:", insertResult.error);
        return res.status(500).json({ error: "Internal data validation error" });
      }
      
      const event = await storage.createAnalyticsEvent(insertResult.data);
      
      res.json({ success: true, id: event.id });
    } catch (err) {
      console.error("Event tracking error:", err);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.post("/api/analytics/session/:id/end", async (req, res) => {
    try {
      await storage.endAnalyticsSession(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Analytics Dashboard Data Endpoints
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const summary = await storage.getAnalyticsSummary(days);
      res.json(summary);
    } catch (err) {
      console.error("Analytics summary error:", err);
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics/realtime", async (req, res) => {
    try {
      const activeCount = await storage.getActiveSessionCount();
      res.json({ activeVisitors: activeCount });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch real-time data" });
    }
  });

  app.get("/api/analytics/traffic", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const traffic = await storage.getTrafficByDate(days);
      res.json(traffic);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch traffic data" });
    }
  });

  app.get("/api/analytics/pages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const pages = await storage.getTopPages(limit);
      res.json(pages);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch top pages" });
    }
  });

  app.get("/api/analytics/referrers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const referrers = await storage.getTopReferrers(limit);
      res.json(referrers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch referrers" });
    }
  });

  app.get("/api/analytics/devices", async (req, res) => {
    try {
      const devices = await storage.getDeviceBreakdown();
      res.json(devices);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch device breakdown" });
    }
  });

  app.get("/api/analytics/browsers", async (req, res) => {
    try {
      const browsers = await storage.getBrowserBreakdown();
      res.json(browsers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch browser breakdown" });
    }
  });

  app.get("/api/analytics/geo", async (req, res) => {
    try {
      const geo = await storage.getGeoBreakdown();
      res.json(geo);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch geo breakdown" });
    }
  });

  app.get("/api/analytics/events", async (req, res) => {
    try {
      const eventName = req.query.event as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const events = await storage.getAnalyticsEvents({ eventName, startDate, endDate });
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // ==================== PARTNER API v1 ====================
  // API Authentication Middleware
  const partnerApiAuth = async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;
    
    if (!apiKey || !apiSecret) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        message: 'Missing API credentials. Provide X-API-Key and X-API-Secret headers.'
      });
    }
    
    try {
      const credential = await storage.getPartnerApiCredentialByApiKey(apiKey);
      
      if (!credential || !credential.isActive) {
        return res.status(401).json({ 
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid or inactive API credentials.'
        });
      }
      
      // Verify secret by comparing hash
      const hashedInputSecret = crypto.createHash('sha256').update(apiSecret).digest('hex');
      if (credential.apiSecret !== hashedInputSecret) {
        return res.status(401).json({ 
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid API credentials.'
        });
      }
      
      // Check expiration
      if (credential.expiresAt && new Date(credential.expiresAt) < new Date()) {
        return res.status(401).json({ 
          error: 'CREDENTIALS_EXPIRED',
          message: 'API credentials have expired.'
        });
      }
      
      // Check rate limits
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastReset = credential.lastResetDate ? new Date(credential.lastResetDate) : null;
      const dailyCount = (!lastReset || lastReset < today) ? 0 : (credential.requestCountDaily || 0);
      
      if (dailyCount >= (credential.rateLimitPerDay || 10000)) {
        return res.status(429).json({ 
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Daily rate limit exceeded. Resets at midnight UTC.'
        });
      }
      
      // Attach credential to request
      req.partnerCredential = credential;
      req.partnerStartTime = startTime;
      
      // Increment request count
      await storage.incrementPartnerApiRequestCount(credential.id);
      
      next();
    } catch (error) {
      console.error('Partner API auth error:', error);
      return res.status(500).json({ 
        error: 'AUTH_ERROR',
        message: 'Authentication error occurred.'
      });
    }
  };
  
  // Scope check middleware factory
  const requireScope = (requiredScope: string) => {
    return (req: any, res: any, next: any) => {
      const scopes = req.partnerCredential?.scopes || [];
      if (!scopes.includes(requiredScope)) {
        return res.status(403).json({
          error: 'INSUFFICIENT_SCOPE',
          message: `This endpoint requires the '${requiredScope}' scope.`
        });
      }
      next();
    };
  };
  
  // Log Partner API request
  const logPartnerApiRequest = async (req: any, statusCode: number, responseBody?: any, error?: { code: string; message: string }) => {
    if (!req.partnerCredential) return;
    
    try {
      await storage.createPartnerApiLog({
        credentialId: req.partnerCredential.id,
        shopId: req.partnerCredential.shopId,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode,
        responseTimeMs: Date.now() - req.partnerStartTime,
        requestBody: req.body || null,
        responseBody: responseBody || null,
        errorCode: error?.code || null,
        errorMessage: error?.message || null,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
        userAgent: req.headers['user-agent'] || null
      });
    } catch (e) {
      console.error('Failed to log Partner API request:', e);
    }
  };

  // Partner API: Get Shop Info
  app.get('/api/partner/v1/shop', partnerApiAuth, requireScope('shop:read'), async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.partnerCredential.shopId);
      if (!shop) {
        await logPartnerApiRequest(req, 404, null, { code: 'SHOP_NOT_FOUND', message: 'Shop not found' });
        return res.status(404).json({ error: 'SHOP_NOT_FOUND', message: 'Shop not found' });
      }
      const response = {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        email: shop.email,
        phone: shop.phone,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        zipCode: shop.zipCode,
        isVerified: shop.isVerified,
        tier: shop.tier,
        rating: shop.rating,
        reviewCount: shop.reviewCount
      };
      await logPartnerApiRequest(req, 200, response);
      res.json(response);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: Get Shop Locations
  app.get('/api/partner/v1/locations', partnerApiAuth, requireScope('shop:read'), async (req: any, res) => {
    try {
      const locations = await storage.getShopLocations(req.partnerCredential.shopId);
      await logPartnerApiRequest(req, 200, { count: locations.length });
      res.json({ data: locations, total: locations.length });
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: Get Shop Analytics
  app.get('/api/partner/v1/analytics', partnerApiAuth, requireScope('analytics:read'), async (req: any, res) => {
    try {
      const range = (req.query.range as string) || '30days';
      const analytics = await storage.getShopAnalytics(req.partnerCredential.shopId, range);
      await logPartnerApiRequest(req, 200, analytics);
      res.json(analytics);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: Get Orders (Repair Orders)
  app.get('/api/partner/v1/orders', partnerApiAuth, requireScope('orders:read'), async (req: any, res) => {
    try {
      const orders = await storage.getRepairOrders(req.partnerCredential.shopId);
      const response = {
        data: orders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          laborTotal: o.laborTotal,
          partsTotal: o.partsTotal,
          taxTotal: o.taxTotal,
          grandTotal: o.grandTotal,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt
        })),
        total: orders.length
      };
      await logPartnerApiRequest(req, 200, { count: orders.length });
      res.json(response);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: Get Appointments
  app.get('/api/partner/v1/appointments', partnerApiAuth, requireScope('appointments:read'), async (req: any, res) => {
    try {
      const appointments = await storage.getAppointments(req.partnerCredential.shopId);
      const response = {
        data: appointments.map(a => ({
          id: a.id,
          appointmentNumber: a.appointmentNumber,
          type: (a as any).appointmentType || a.status,
          status: a.status,
          scheduledDate: (a as any).scheduledDate || a.scheduledStart,
          scheduledTime: (a as any).scheduledTime || a.scheduledEnd,
          notes: a.notes,
          createdAt: a.createdAt
        })),
        total: appointments.length
      };
      await logPartnerApiRequest(req, 200, { count: appointments.length });
      res.json(response);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: Get Customers
  app.get('/api/partner/v1/customers', partnerApiAuth, requireScope('customers:read'), async (req: any, res) => {
    try {
      const customers = await storage.getShopCustomers(req.partnerCredential.shopId);
      const response = {
        data: customers.map(c => ({
          id: c.id,
          userId: c.userId,
          vehicleId: c.vehicleId,
          notes: c.notes,
          lastVisit: c.lastVisit,
          visitCount: c.visitCount,
          createdAt: c.createdAt
        })),
        total: customers.length
      };
      await logPartnerApiRequest(req, 200, { count: customers.length });
      res.json(response);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: Get Estimates
  app.get('/api/partner/v1/estimates', partnerApiAuth, requireScope('estimates:read'), async (req: any, res) => {
    try {
      const estimates = await storage.getEstimates(req.partnerCredential.shopId);
      const response = {
        data: estimates.map(e => ({
          id: e.id,
          estimateNumber: e.estimateNumber,
          status: e.status,
          laborTotal: e.laborTotal,
          partsTotal: e.partsTotal,
          taxTotal: e.taxTotal,
          grandTotal: e.grandTotal,
          validUntil: e.validUntil,
          createdAt: e.createdAt
        })),
        total: estimates.length
      };
      await logPartnerApiRequest(req, 200, { count: estimates.length });
      res.json(response);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Partner API: API Usage Stats
  app.get('/api/partner/v1/usage', partnerApiAuth, async (req: any, res) => {
    try {
      const credential = req.partnerCredential;
      const stats = await storage.getPartnerApiLogStats(credential.shopId, 30);
      const response = {
        credential: {
          name: credential.name,
          environment: credential.environment,
          scopes: credential.scopes,
          rateLimitPerDay: credential.rateLimitPerDay,
          requestCountDaily: credential.requestCountDaily,
          requestCountTotal: credential.requestCount,
          lastUsedAt: credential.lastUsedAt,
          expiresAt: credential.expiresAt
        },
        stats
      };
      await logPartnerApiRequest(req, 200, response);
      res.json(response);
    } catch (err) {
      await logPartnerApiRequest(req, 500, null, { code: 'SERVER_ERROR', message: 'Internal server error' });
      res.status(500).json({ error: 'SERVER_ERROR', message: 'Internal server error' });
    }
  });

  // Shop Portal: Manage API Credentials (requires authenticated shop owner)
  app.get('/api/shops/:shopId/api-credentials', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const credentials = await storage.getPartnerApiCredentials(req.params.shopId);
      // Never expose secrets - they are hashed and cannot be retrieved
      const safeCredentials = credentials.map(c => ({
        id: c.id,
        shopId: c.shopId,
        name: c.name,
        apiKey: c.apiKey,
        environment: c.environment,
        scopes: c.scopes,
        rateLimitPerDay: c.rateLimitPerDay,
        requestCount: c.requestCount,
        requestCountDaily: c.requestCountDaily,
        lastUsedAt: c.lastUsedAt,
        isActive: c.isActive,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt
      }));
      res.json(safeCredentials);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch API credentials' });
    }
  });

  app.post('/api/shops/:shopId/api-credentials', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const { name, scopes, environment, rateLimitPerDay } = req.body;
      
      // Generate API key and secret
      const apiKey = `gb_${environment === 'sandbox' ? 'test_' : ''}${crypto.randomBytes(24).toString('hex')}`;
      const rawSecret = crypto.randomBytes(32).toString('hex');
      
      // Hash the secret before storing (using SHA-256)
      const hashedSecret = crypto.createHash('sha256').update(rawSecret).digest('hex');
      
      const credential = await storage.createPartnerApiCredential({
        shopId: req.params.shopId,
        name: name || 'API Key',
        apiKey,
        apiSecret: hashedSecret, // Store hashed version
        environment: environment || 'production',
        scopes: scopes || ['orders:read'],
        rateLimitPerDay: rateLimitPerDay || 10000,
        createdBy: req.user.claims.sub
      });
      
      // Return the raw secret ONLY at creation time - it cannot be retrieved again
      res.json({
        id: credential.id,
        shopId: credential.shopId,
        name: credential.name,
        apiKey: credential.apiKey,
        apiSecret: rawSecret, // Raw secret shown once
        environment: credential.environment,
        scopes: credential.scopes,
        rateLimitPerDay: credential.rateLimitPerDay,
        isActive: credential.isActive,
        createdAt: credential.createdAt,
        message: 'Save these credentials securely. The API secret will not be shown again.'
      });
    } catch (err) {
      console.error('Failed to create API credential:', err);
      res.status(500).json({ error: 'Failed to create API credentials' });
    }
  });

  app.patch('/api/shops/:shopId/api-credentials/:credentialId', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const credential = await storage.getPartnerApiCredential(req.params.credentialId);
      if (!credential || credential.shopId !== req.params.shopId) {
        return res.status(404).json({ error: 'Credential not found' });
      }
      
      const { name, scopes, isActive, rateLimitPerDay } = req.body;
      const updated = await storage.updatePartnerApiCredential(req.params.credentialId, {
        name: name !== undefined ? name : credential.name,
        scopes: scopes !== undefined ? scopes : credential.scopes,
        isActive: isActive !== undefined ? isActive : credential.isActive,
        rateLimitPerDay: rateLimitPerDay !== undefined ? rateLimitPerDay : credential.rateLimitPerDay
      });
      
      res.json({ ...updated, apiSecret: '••••••••••••••••' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update API credentials' });
    }
  });

  app.delete('/api/shops/:shopId/api-credentials/:credentialId', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const credential = await storage.getPartnerApiCredential(req.params.credentialId);
      if (!credential || credential.shopId !== req.params.shopId) {
        return res.status(404).json({ error: 'Credential not found' });
      }
      
      await storage.deletePartnerApiCredential(req.params.credentialId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete API credentials' });
    }
  });

  // Shop Portal: API Logs
  app.get('/api/shops/:shopId/api-logs', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getPartnerApiLogs(req.params.shopId, limit);
      const stats = await storage.getPartnerApiLogStats(req.params.shopId, 30);
      
      res.json({ logs, stats });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch API logs' });
    }
  });

  // Shop Locations Management
  app.get('/api/shops/:shopId/locations', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const locations = await storage.getShopLocations(req.params.shopId);
      res.json(locations);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  app.post('/api/shops/:shopId/locations', isAuthenticated, async (req: any, res) => {
    try {
      const shop = await storage.getShop(req.params.shopId);
      if (!shop || shop.ownerId !== req.user.claims.sub) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const location = await storage.createShopLocation({
        shopId: req.params.shopId,
        ...req.body
      });
      res.json(location);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create location' });
    }
  });

  // ========== BREAK ROOM API ROUTES ==========

  // Auto News
  app.get("/api/break-room/news", async (req, res) => {
    try {
      const { category } = req.query;
      const articles = getAutoNewsByCategory(category as string);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // NHTSA Recall Checker
  app.get("/api/break-room/recalls", async (req, res) => {
    try {
      const { make, model, year } = req.query;
      if (!make || !model || !year) {
        return res.status(400).json({ error: "make, model, and year are required" });
      }
      const recalls = await getNHTSARecalls(make as string, model as string, parseInt(year as string));
      res.json(recalls);
    } catch (error) {
      console.error("NHTSA recall error:", error);
      res.status(500).json({ error: "Failed to check recalls" });
    }
  });

  // Document Scanner
  app.post("/api/break-room/scan", isAuthenticated, async (req: any, res) => {
    try {
      const { image, documentType } = req.body;
      if (!image || !documentType) {
        return res.status(400).json({ error: "image and documentType are required" });
      }
      const result = await scanDocument(image, documentType);

      if (result.success) {
        const userId = req.user?.claims?.sub || (req.session as any).userId;
        await db.insert(scannedDocuments).values({
          userId,
          documentType,
          title: result.extractedData?.vendor || result.extractedData?.provider || `${documentType} scan`,
          extractedText: result.rawText,
          extractedData: result.extractedData,
          amount: result.extractedData?.total ? String(result.extractedData.total) : null,
          vendor: result.extractedData?.vendor || result.extractedData?.provider,
          date: result.extractedData?.date ? new Date(result.extractedData.date) : new Date(),
          category: documentType,
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Document scan error:", error);
      res.status(500).json({ error: "Failed to scan document" });
    }
  });

  // Mileage Tracker
  app.get("/api/break-room/mileage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const entries = await db.select().from(mileageEntries)
        .where(eq(mileageEntries.userId, userId))
        .orderBy(desc(mileageEntries.date))
        .limit(50);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mileage entries" });
    }
  });

  app.post("/api/break-room/mileage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const result = insertMileageEntrySchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const [entry] = await db.insert(mileageEntries).values(result.data).returning();
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create mileage entry" });
    }
  });

  // Speed Traps
  app.get("/api/break-room/speed-traps", async (req, res) => {
    try {
      const { state, zip } = req.query;
      let query = db.select().from(speedTraps).where(eq(speedTraps.isActive, true));
      if (state) {
        query = db.select().from(speedTraps).where(and(eq(speedTraps.isActive, true), eq(speedTraps.state, state as string)));
      }
      const traps = await query.orderBy(desc(speedTraps.createdAt)).limit(100);
      res.json(traps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch speed traps" });
    }
  });

  app.post("/api/break-room/speed-traps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const result = insertSpeedTrapSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const [trap] = await db.insert(speedTraps).values(result.data).returning();
      res.json(trap);
    } catch (error) {
      res.status(500).json({ error: "Failed to report speed trap" });
    }
  });

  // Specialty Shops
  app.get("/api/break-room/specialty-shops", async (req, res) => {
    try {
      const { state, zip, type } = req.query;
      let results;
      if (state) {
        results = await db.select().from(specialtyShops).where(eq(specialtyShops.state, state as string)).orderBy(specialtyShops.name).limit(100);
      } else if (type) {
        results = await db.select().from(specialtyShops).where(eq(specialtyShops.shopType, type as string)).orderBy(specialtyShops.name).limit(100);
      } else {
        results = await db.select().from(specialtyShops).orderBy(specialtyShops.name).limit(100);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch specialty shops" });
    }
  });

  app.post("/api/break-room/specialty-shops", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const result = insertSpecialtyShopSchema.safeParse({ ...req.body, submittedBy: userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const [shop] = await db.insert(specialtyShops).values(result.data).returning();
      res.json(shop);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit specialty shop" });
    }
  });

  // Car Events
  app.get("/api/break-room/events", async (req, res) => {
    try {
      const { state, type } = req.query;
      let results;
      if (state) {
        results = await db.select().from(carEvents).where(eq(carEvents.state, state as string)).orderBy(carEvents.date).limit(100);
      } else if (type) {
        results = await db.select().from(carEvents).where(eq(carEvents.eventType, type as string)).orderBy(carEvents.date).limit(100);
      } else {
        results = await db.select().from(carEvents).orderBy(carEvents.date).limit(100);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/break-room/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const result = insertCarEventSchema.safeParse({ ...req.body, submittedBy: userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const [event] = await db.insert(carEvents).values(result.data).returning();
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit event" });
    }
  });

  // CDL Programs
  app.get("/api/break-room/cdl-programs", async (req, res) => {
    try {
      const { state, category, type } = req.query;
      let results;
      if (state) {
        results = await db.select().from(cdlPrograms).where(and(eq(cdlPrograms.isActive, true), eq(cdlPrograms.state, state as string))).orderBy(desc(cdlPrograms.isFeatured), cdlPrograms.companyName).limit(100);
      } else if (category) {
        results = await db.select().from(cdlPrograms).where(and(eq(cdlPrograms.isActive, true), eq(cdlPrograms.category, category as string))).orderBy(desc(cdlPrograms.isFeatured), cdlPrograms.companyName).limit(100);
      } else {
        results = await db.select().from(cdlPrograms).where(eq(cdlPrograms.isActive, true)).orderBy(desc(cdlPrograms.isFeatured), cdlPrograms.companyName).limit(100);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CDL programs" });
    }
  });

  // CDL Referrals / Interest Forms (public for lead gen, with anti-spam)
  const cdlRateLimiter = new Map<string, number[]>();
  app.post("/api/break-room/cdl-referrals", async (req, res) => {
    try {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      const ipHash = crypto.createHash('sha256').update(clientIP).digest('hex').substring(0, 16);
      const now = Date.now();
      const submissions = cdlRateLimiter.get(ipHash) || [];
      const recent = submissions.filter(t => now - t < 3600000);
      if (recent.length >= 3) {
        return res.status(429).json({ error: "Too many submissions. Please try again later." });
      }
      cdlRateLimiter.set(ipHash, [...recent, now]);

      const result = insertCdlReferralSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      if (!result.data.email || !result.data.fullName || !result.data.programId) {
        return res.status(400).json({ error: "Name, email, and program are required" });
      }
      const [referral] = await db.insert(cdlReferrals).values(result.data).returning();
      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit interest form" });
    }
  });

  // Fuel Reports
  app.get("/api/break-room/fuel", async (req, res) => {
    try {
      const { zip, state } = req.query;
      let results;
      if (zip) {
        results = await db.select().from(fuelReports).where(eq(fuelReports.zipCode, zip as string)).orderBy(desc(fuelReports.reportedAt)).limit(50);
      } else if (state) {
        results = await db.select().from(fuelReports).where(eq(fuelReports.state, state as string)).orderBy(desc(fuelReports.reportedAt)).limit(50);
      } else {
        results = await db.select().from(fuelReports).orderBy(desc(fuelReports.reportedAt)).limit(50);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel reports" });
    }
  });

  app.post("/api/break-room/fuel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const result = insertFuelReportSchema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      const [report] = await db.insert(fuelReports).values(result.data).returning();
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit fuel report" });
    }
  });

  // Scanned Documents History
  app.get("/api/break-room/scans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || (req.session as any).userId;
      const scans = await db.select().from(scannedDocuments)
        .where(eq(scannedDocuments.userId, userId))
        .orderBy(desc(scannedDocuments.createdAt))
        .limit(50);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan history" });
    }
  });

  // ============================================
  // CDL / TRUCKING COMPANY DIRECTORY
  // Self-contained feature - portable to other apps
  // ============================================

  const { cdlDirectoryService, CDL_COMPANY_TYPES, CDL_FREIGHT_TYPES, CDL_EXPERIENCE_LEVELS, CDL_HOME_TIME } = await import("./services/cdlDirectory");

  (async () => {
    try {
      const { seedCDLDirectory } = await import("./seeds/cdlDirectory");
      await seedCDLDirectory();
    } catch (err: any) {
      console.error("[CDL Directory] Auto-seed error:", err.message);
    }
  })();

  app.get("/api/cdl-directory/search", async (req, res) => {
    try {
      const { search, category, companyType, experienceRequired, freightType, state, cdlClass, homeTime, hasTraining, isHiring, limit, offset } = req.query;
      const results = await cdlDirectoryService.search({
        search: search as string,
        category: category as string,
        companyType: companyType as string,
        experienceRequired: experienceRequired as string,
        freightType: freightType as string,
        state: state as string,
        cdlClass: cdlClass as string,
        homeTime: homeTime as string,
        hasTraining: hasTraining === "true",
        isHiring: isHiring !== undefined ? isHiring === "true" : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(results);
    } catch (error) {
      console.error("CDL directory search error:", error);
      res.status(500).json({ error: "Failed to search directory" });
    }
  });

  app.get("/api/cdl-directory/company/:id", async (req, res) => {
    try {
      const company = await cdlDirectoryService.getById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.get("/api/cdl-directory/featured", async (_req, res) => {
    try {
      const featured = await cdlDirectoryService.getFeatured();
      res.json(featured);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured companies" });
    }
  });

  app.get("/api/cdl-directory/categories", async (_req, res) => {
    try {
      const categories = await cdlDirectoryService.getCategories();
      res.json({ categories, companyTypes: CDL_COMPANY_TYPES, freightTypes: CDL_FREIGHT_TYPES, experienceLevels: CDL_EXPERIENCE_LEVELS, homeTimeOptions: CDL_HOME_TIME });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/cdl-directory/stats", async (_req, res) => {
    try {
      const stats = await cdlDirectoryService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/cdl-directory/states", async (_req, res) => {
    try {
      const states = await cdlDirectoryService.getStates();
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  const cdlDirectoryRateLimiter = new Map<string, number[]>();
  app.post("/api/cdl-directory/interest", async (req, res) => {
    try {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      const ipHash = crypto.createHash('sha256').update(clientIP).digest('hex').substring(0, 16);
      const now = Date.now();
      const submissions = cdlDirectoryRateLimiter.get(ipHash) || [];
      const recent = submissions.filter(t => now - t < 3600000);
      if (recent.length >= 5) {
        return res.status(429).json({ error: "Too many submissions. Please try again later." });
      }
      cdlDirectoryRateLimiter.set(ipHash, [...recent, now]);

      const result = insertCdlReferralSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }
      if (!result.data.email || !result.data.fullName || !result.data.programId) {
        return res.status(400).json({ error: "Name, email, and program selection are required" });
      }
      const referral = await cdlDirectoryService.submitInterest(result.data);
      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit interest form" });
    }
  });

  // ============================================
  // COMPREHENSIVE DRIVER FEATURES
  // ============================================

  // Warranties
  app.get("/api/warranties", isAuthenticated, async (req: any, res) => {
    try {
      const warranties = await storage.getWarrantiesByUser(req.user.id);
      res.json(warranties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warranties" });
    }
  });

  app.get("/api/vehicles/:vehicleId/warranties", isAuthenticated, async (req: any, res) => {
    try {
      const warranties = await storage.getWarrantiesByVehicle(req.params.vehicleId);
      res.json(warranties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warranties" });
    }
  });

  app.post("/api/warranties", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertWarrantySchema.safeParse({ ...req.body, userId: req.user.id });
      if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
      const warranty = await storage.createWarranty(result.data);
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ error: "Failed to create warranty" });
    }
  });

  app.patch("/api/warranties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const warranty = await storage.updateWarranty(req.params.id, req.body);
      if (!warranty) return res.status(404).json({ error: "Warranty not found" });
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ error: "Failed to update warranty" });
    }
  });

  app.delete("/api/warranties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteWarranty(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Warranty not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete warranty" });
    }
  });

  // Warranty Claims
  app.get("/api/warranties/:warrantyId/claims", isAuthenticated, async (req: any, res) => {
    try {
      const claims = await storage.getWarrantyClaimsByWarranty(req.params.warrantyId);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warranty claims" });
    }
  });

  app.post("/api/warranties/:warrantyId/claims", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertWarrantyClaimSchema.safeParse({ ...req.body, warrantyId: req.params.warrantyId, userId: req.user.id });
      if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
      const claim = await storage.createWarrantyClaim(result.data);
      res.json(claim);
    } catch (error) {
      res.status(500).json({ error: "Failed to create warranty claim" });
    }
  });

  // Fuel Logs
  app.get("/api/vehicles/:vehicleId/fuel-logs", isAuthenticated, async (req: any, res) => {
    try {
      const logs = await storage.getFuelLogsByVehicle(req.params.vehicleId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel logs" });
    }
  });

  app.get("/api/fuel-logs", isAuthenticated, async (req: any, res) => {
    try {
      const logs = await storage.getFuelLogsByUser(req.user.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel logs" });
    }
  });

  app.post("/api/vehicles/:vehicleId/fuel-logs", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertFuelLogSchema.safeParse({ ...req.body, vehicleId: req.params.vehicleId, userId: req.user.id });
      if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
      const log = await storage.createFuelLog(result.data);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create fuel log" });
    }
  });

  app.delete("/api/fuel-logs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteFuelLog(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Fuel log not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete fuel log" });
    }
  });

  // Vehicle Expenses
  app.get("/api/vehicles/:vehicleId/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const expenses = await storage.getExpensesByVehicle(req.params.vehicleId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const expenses = await storage.getExpensesByUser(req.user.id);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/vehicles/:vehicleId/expense-summary", isAuthenticated, async (req: any, res) => {
    try {
      const summary = await storage.getExpenseSummaryByVehicle(req.params.vehicleId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense summary" });
    }
  });

  app.post("/api/vehicles/:vehicleId/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertVehicleExpenseSchema.safeParse({ ...req.body, vehicleId: req.params.vehicleId, userId: req.user.id });
      if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
      const expense = await storage.createExpense(result.data);
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteExpense(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Expense not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Price History
  app.get("/api/price-alerts/:alertId/history", isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getPriceHistoryByAlert(req.params.alertId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  app.get("/api/price-history", isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getPriceHistoryByUser(req.user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  // Emergency Contacts
  app.get("/api/emergency-contacts", isAuthenticated, async (req: any, res) => {
    try {
      const contacts = await storage.getEmergencyContactsByUser(req.user.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emergency contacts" });
    }
  });

  app.post("/api/emergency-contacts", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertEmergencyContactSchema.safeParse({ ...req.body, userId: req.user.id });
      if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
      const contact = await storage.createEmergencyContact(result.data);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to create emergency contact" });
    }
  });

  app.patch("/api/emergency-contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const contact = await storage.updateEmergencyContact(req.params.id, req.body);
      if (!contact) return res.status(404).json({ error: "Contact not found" });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/emergency-contacts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteEmergencyContact(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Contact not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Maintenance Schedules
  app.get("/api/vehicles/:vehicleId/maintenance", isAuthenticated, async (req: any, res) => {
    try {
      const schedules = await storage.getMaintenanceSchedulesByVehicle(req.params.vehicleId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch maintenance schedules" });
    }
  });

  app.get("/api/maintenance/overdue", isAuthenticated, async (req: any, res) => {
    try {
      const overdue = await storage.getOverdueMaintenanceByUser(req.user.id);
      res.json(overdue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overdue maintenance" });
    }
  });

  app.post("/api/vehicles/:vehicleId/maintenance", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertMaintenanceScheduleSchema.safeParse({ ...req.body, vehicleId: req.params.vehicleId, userId: req.user.id });
      if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
      const schedule = await storage.createMaintenanceSchedule(result.data);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create maintenance schedule" });
    }
  });

  app.patch("/api/maintenance/:id", isAuthenticated, async (req: any, res) => {
    try {
      const schedule = await storage.updateMaintenanceSchedule(req.params.id, req.body);
      if (!schedule) return res.status(404).json({ error: "Schedule not found" });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update maintenance schedule" });
    }
  });

  app.post("/api/maintenance/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { completedMileage } = req.body;
      if (!completedMileage) return res.status(400).json({ error: "completedMileage is required" });
      const schedule = await storage.completeMaintenanceTask(req.params.id, parseInt(completedMileage));
      if (!schedule) return res.status(404).json({ error: "Schedule not found" });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete maintenance task" });
    }
  });

  app.delete("/api/maintenance/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteMaintenanceSchedule(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Schedule not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete maintenance schedule" });
    }
  });

  app.post("/api/support/rating", isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const userId = req.user?.id || req.user?.claims?.sub || "anonymous";
      console.log(`[Rating] User ${userId} rated ${parsed.rating}/5${parsed.comment ? ` - "${parsed.comment}"` : ""}`);
      res.json({ success: true });
    } catch (error: any) {
      if (error?.issues) {
        res.status(400).json({ error: "Invalid rating data", details: error.issues });
      } else {
        res.status(500).json({ error: "Failed to submit rating" });
      }
    }
  });

  return httpServer;
}

// Helper function to build vendor-specific search URLs
function buildVendorSearchUrl(baseUrl: string, slug: string, query?: string, partNumber?: string): string {
  const searchTerm = partNumber || query || '';
  if (!searchTerm) return baseUrl;
  
  switch (slug) {
    case 'autozone':
      return `${baseUrl}/searchresult?searchText=${encodeURIComponent(searchTerm)}`;
    case 'oreilly':
      return `${baseUrl}/shop/b/search-results?q=${encodeURIComponent(searchTerm)}`;
    case 'advance-auto':
      return `${baseUrl}/web/c3/search?q=${encodeURIComponent(searchTerm)}`;
    case 'rockauto':
      return `${baseUrl}/catalog/moreinfo.php?pk=${encodeURIComponent(searchTerm)}`;
    case 'amazon':
      return `${baseUrl}/s?k=${encodeURIComponent(searchTerm)}&i=automotive`;
    case 'napa':
      return `${baseUrl}/search?text=${encodeURIComponent(searchTerm)}`;
    case 'vmc':
      return `${baseUrl}/search.php?search_query=${encodeURIComponent(searchTerm)}`;
    case 'ebay':
      return `${baseUrl}/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}`;
    case 'west-marine':
      return `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`;
    case 'dennis-kirk':
      return `${baseUrl}/search?term=${encodeURIComponent(searchTerm)}`;
    case 'rocky-mountain':
      return `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`;
    default:
      return `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`;
  }
}

// Helper function for vendor search paths (for non-affiliate redirects)
function getVendorSearchPath(slug: string, query?: string, partNumber?: string): string {
  const searchTerm = partNumber || query || '';
  if (!searchTerm) return '';
  
  switch (slug) {
    case 'autozone':
      return `/searchresult?searchText=${encodeURIComponent(searchTerm)}`;
    case 'oreilly':
      return `/shop/b/search-results?q=${encodeURIComponent(searchTerm)}`;
    case 'advance-auto':
      return `/web/c3/search?q=${encodeURIComponent(searchTerm)}`;
    case 'rockauto':
      return `/catalog/moreinfo.php?pk=${encodeURIComponent(searchTerm)}`;
    case 'amazon':
      return `/s?k=${encodeURIComponent(searchTerm)}&i=automotive`;
    case 'napa':
      return `/search?text=${encodeURIComponent(searchTerm)}`;
    default:
      return `/search?q=${encodeURIComponent(searchTerm)}`;
  }
}

// Helper function for vendor search paths WITH vehicle info
function getVendorSearchPathWithVehicle(
  slug: string, 
  query?: string, 
  partNumber?: string,
  year?: string,
  make?: string,
  model?: string
): string {
  const searchTerm = partNumber || query || '';
  const hasVehicle = year && make && model;
  
  switch (slug) {
    case 'autozone':
      // AutoZone supports year/make/model in URL
      if (hasVehicle) {
        return `/parts/${year}/${encodeURIComponent(make!.toLowerCase())}/${encodeURIComponent(model!.toLowerCase().replace(/\s+/g, '-'))}?searchText=${encodeURIComponent(searchTerm)}`;
      }
      return `/searchresult?searchText=${encodeURIComponent(searchTerm)}`;
      
    case 'oreilly':
      // O'Reilly uses query params for vehicle
      if (hasVehicle) {
        return `/shop/b/search-results?q=${encodeURIComponent(searchTerm)}&year=${year}&make=${encodeURIComponent(make!)}&model=${encodeURIComponent(model!)}`;
      }
      return `/shop/b/search-results?q=${encodeURIComponent(searchTerm)}`;
      
    case 'advance-auto':
      // Advance Auto supports vehicle in URL
      if (hasVehicle) {
        return `/web/c3/search?q=${encodeURIComponent(searchTerm)}&year=${year}&make=${encodeURIComponent(make!)}&model=${encodeURIComponent(model!)}`;
      }
      return `/web/c3/search?q=${encodeURIComponent(searchTerm)}`;
      
    case 'rockauto':
      // RockAuto uses catalog path structure: /catalog/make,model,year
      if (hasVehicle) {
        return `/catalog/${encodeURIComponent(make!.toLowerCase())},${encodeURIComponent(model!.toLowerCase().replace(/\s+/g, '+'))},${year}?q=${encodeURIComponent(searchTerm)}`;
      }
      return `/catalog/moreinfo.php?pk=${encodeURIComponent(searchTerm)}`;
      
    case 'amazon':
      // Amazon uses keywords including vehicle
      if (hasVehicle) {
        return `/s?k=${encodeURIComponent(`${year} ${make} ${model} ${searchTerm}`)}&i=automotive`;
      }
      return `/s?k=${encodeURIComponent(searchTerm)}&i=automotive`;
      
    case 'napa':
      // NAPA supports vehicle params
      if (hasVehicle) {
        return `/search?text=${encodeURIComponent(searchTerm)}&year=${year}&make=${encodeURIComponent(make!)}&model=${encodeURIComponent(model!)}`;
      }
      return `/search?text=${encodeURIComponent(searchTerm)}`;
      
    case 'ebay':
      // eBay Motors with vehicle in search
      if (hasVehicle) {
        return `/sch/i.html?_nkw=${encodeURIComponent(`${year} ${make} ${model} ${searchTerm}`)}&_sacat=6000`;
      }
      return `/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}&_sacat=6000`;
      
    case 'vmc':
      return `/search.php?search_query=${encodeURIComponent(searchTerm)}`;
      
    case 'west-marine':
      return `/search?q=${encodeURIComponent(searchTerm)}`;
      
    case 'dennis-kirk':
      return `/search?term=${encodeURIComponent(searchTerm)}`;
      
    case 'rocky-mountain':
      return `/search?q=${encodeURIComponent(searchTerm)}`;
      
    case 'summit-racing':
      if (hasVehicle) {
        return `/search/parts?keyword=${encodeURIComponent(searchTerm)}&year=${year}&make=${encodeURIComponent(make!)}&model=${encodeURIComponent(model!)}`;
      }
      return `/search/parts?keyword=${encodeURIComponent(searchTerm)}`;
      
    default:
      if (hasVehicle && searchTerm) {
        return `/search?q=${encodeURIComponent(`${year} ${make} ${model} ${searchTerm}`)}`;
      }
      return `/search?q=${encodeURIComponent(searchTerm)}`;
  }
}

// Helper function to build vendor-specific search URLs WITH vehicle info
function buildVendorSearchUrlWithVehicle(
  baseUrl: string, 
  slug: string, 
  query?: string, 
  partNumber?: string,
  year?: number,
  make?: string,
  model?: string
): string {
  const yearStr = year ? year.toString() : undefined;
  const path = getVendorSearchPathWithVehicle(slug, query, partNumber, yearStr, make, model);
  return baseUrl + path;
}

// Analytics helper functions
function parseUserAgentBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Other';
}

function parseUserAgentDevice(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) return 'Tablet';
    return 'Mobile';
  }
  return 'Desktop';
}

function parseUserAgentOS(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Other';
}

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'garagebot-salt').digest('hex').substring(0, 16);
}
