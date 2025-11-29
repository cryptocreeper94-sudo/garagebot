import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVehicleSchema, insertDealSchema, insertHallmarkSchema, insertVendorSchema, insertWaitlistSchema, insertServiceRecordSchema, insertServiceReminderSchema, insertAffiliatePartnerSchema, insertAffiliateNetworkSchema, insertAffiliateCommissionSchema, insertAffiliateClickSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { nhtsaService } from "./services/nhtsa";
import { weatherService } from "./services/weather";
import * as authService from "./services/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth middleware
  await setupAuth(app);

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

  // Custom PIN-based Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { username, mainPin, quickPin, firstName, lastName, phone, email, address, city, state, zipCode, enablePersistence } = req.body;
      
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
      
      // Hash passwords
      const passwordHash = authService.hashPassword(mainPin);
      const quickPinHash = quickPin ? authService.hashPin(quickPin) : null;
      
      // Generate recovery codes
      const { codes, hashedCodes } = authService.generateRecoveryCodes();
      
      // Create user
      const user = await storage.upsertUser({
        id: crypto.randomUUID(),
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
          subscriptionTier: user.subscriptionTier 
        },
        recoveryCodes: codes,
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
    for (const [key, entry] of aiRateLimiter.entries()) {
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

  // Stripe config
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to get Stripe config" });
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
      
      // Build search results with vendor links
      // For now, return vendor redirect URLs - actual product data would come from APIs
      const vendorResults = vendors.map(vendor => ({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
          logoUrl: vendor.logoUrl,
          hasLocalPickup: vendor.hasLocalPickup,
          hasAffiliateProgram: vendor.hasAffiliateProgram,
        },
        searchUrl: `/api/vendors/${vendor.slug}/redirect?query=${encodeURIComponent(query || partNumber || '')}&partNumber=${encodeURIComponent(partNumber || '')}&year=${year || ''}&make=${encodeURIComponent(make || '')}&model=${encodeURIComponent(model || '')}`,
        directUrl: buildVendorSearchUrlWithVehicle(vendor.websiteUrl, vendor.slug, query, partNumber, year, make, model),
      }));
      
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
      
      const order = await storage.updateRepairOrder(orderId, req.body);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update repair order" });
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
      
      res.json({
        isPro,
        tier: user?.subscriptionTier || 'free',
        status: isPro ? 'active' : 'inactive',
        expiresAt: user?.subscriptionExpiresAt || null,
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
      
      // In production, create a Stripe checkout session
      // For now, return a placeholder
      const priceId = billingPeriod === 'annual' 
        ? process.env.STRIPE_ANNUAL_PRICE_ID 
        : process.env.STRIPE_MONTHLY_PRICE_ID;
      
      // Placeholder - in production, create actual Stripe checkout
      res.json({
        message: "Subscription checkout initiated",
        checkoutUrl: `/pro?demo=true`,
        billingPeriod,
      });
    } catch (error) {
      console.error("Subscription checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
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

      // Use OpenAI Vision API to identify the part
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: openaiKey });

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
      res.json(guides);
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
