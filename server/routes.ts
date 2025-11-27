import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVehicleSchema, insertDealSchema, insertHallmarkSchema } from "@shared/schema";
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

  return httpServer;
}
