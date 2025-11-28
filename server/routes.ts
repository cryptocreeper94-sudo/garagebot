import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVehicleSchema, insertDealSchema, insertHallmarkSchema, insertVendorSchema, insertWaitlistSchema, insertServiceRecordSchema, insertServiceReminderSchema } from "@shared/schema";
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

  // Vendor redirect with affiliate tracking
  app.get("/api/vendors/:slug/redirect", async (req: any, res) => {
    try {
      const { slug } = req.params;
      const { query, partNumber } = req.query;
      
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
      });
      
      // Build the redirect URL
      let redirectUrl = vendor.websiteUrl;
      
      // If vendor has affiliate link template, use it
      if (vendor.hasAffiliateProgram && vendor.affiliateLinkTemplate && vendor.affiliateId) {
        redirectUrl = vendor.affiliateLinkTemplate
          .replace('{affiliateId}', vendor.affiliateId)
          .replace('{query}', encodeURIComponent((query as string) || ''))
          .replace('{partNumber}', encodeURIComponent((partNumber as string) || ''));
      } else {
        // Fallback: just append search query to website
        const searchPath = getVendorSearchPath(slug, query as string, partNumber as string);
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
        searchUrl: `/api/vendors/${vendor.slug}/redirect?query=${encodeURIComponent(query || partNumber || '')}&partNumber=${encodeURIComponent(partNumber || '')}`,
        directUrl: buildVendorSearchUrl(vendor.websiteUrl, vendor.slug, query, partNumber),
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

  // Seed vendors endpoint (for initial setup)
  app.post("/api/admin/seed-vendors", async (req, res) => {
    try {
      const defaultVendors = [
        {
          name: "AutoZone",
          slug: "autozone",
          websiteUrl: "https://www.autozone.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "Impact",
          commissionRate: "1.00",
          hasLocalPickup: true,
          priority: 1,
        },
        {
          name: "O'Reilly Auto Parts",
          slug: "oreilly",
          websiteUrl: "https://www.oreillyauto.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 2,
        },
        {
          name: "Advance Auto Parts",
          slug: "advance-auto",
          websiteUrl: "https://shop.advanceautoparts.com",
          hasAffiliateProgram: true,
          affiliateNetwork: "CJ",
          commissionRate: "3.00",
          hasLocalPickup: true,
          priority: 3,
        },
        {
          name: "RockAuto",
          slug: "rockauto",
          websiteUrl: "https://www.rockauto.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 4,
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
        },
        {
          name: "NAPA Auto Parts",
          slug: "napa",
          websiteUrl: "https://www.napaonline.com",
          hasAffiliateProgram: false,
          hasLocalPickup: true,
          priority: 6,
        },
        {
          name: "VMC Chinese Parts",
          slug: "vmc",
          websiteUrl: "https://www.vmcchineseparts.com",
          hasAffiliateProgram: false,
          hasLocalPickup: false,
          priority: 10,
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
        },
        {
          name: "West Marine",
          slug: "west-marine",
          websiteUrl: "https://www.westmarine.com",
          hasAffiliateProgram: true,
          hasLocalPickup: true,
          priority: 15,
        },
        {
          name: "Dennis Kirk",
          slug: "dennis-kirk",
          websiteUrl: "https://www.denniskirk.com",
          hasAffiliateProgram: true,
          hasLocalPickup: false,
          priority: 12,
        },
        {
          name: "Rocky Mountain ATV/MC",
          slug: "rocky-mountain",
          websiteUrl: "https://www.rockymountainatvmc.com",
          hasAffiliateProgram: true,
          hasLocalPickup: false,
          priority: 11,
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
