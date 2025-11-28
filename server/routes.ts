import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVehicleSchema, insertDealSchema, insertHallmarkSchema, insertVendorSchema, insertWaitlistSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
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
  app.get("/api/hallmarks/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const hallmark = await storage.getHallmarkByUserId(userId);
      res.json(hallmark || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hallmark" });
    }
  });

  app.post("/api/hallmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingHallmark = await storage.getHallmarkByUserId(userId);
      if (existingHallmark) {
        return res.status(400).json({ error: "User already has a Genesis Hallmark" });
      }
      
      const tokenId = `GENESIS-${Date.now()}-${userId.slice(-4)}`;
      const hallmark = await storage.createHallmark({
        userId,
        tokenId,
        transactionHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        metadata: JSON.stringify({
          type: "GENESIS_HALLMARK",
          edition: "Founder's Edition",
          mintedAt: new Date().toISOString(),
        }),
      });
      
      await storage.updateUser(userId, { hasGenesisBadge: true });
      
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
