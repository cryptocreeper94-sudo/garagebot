import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { orbitClient } from './services/orbitEcosystem';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    
    // First, process through stripe-replit-sync which verifies the signature
    // This will throw if signature is invalid
    await sync.processWebhook(payload, signature, uuid);
    
    // Only after signature verification, parse and handle custom events
    try {
      const event = JSON.parse(payload.toString());
      
      // Handle custom events (signature already verified above)
      if (event.type === 'checkout.session.completed') {
        await WebhookHandlers.handleCheckoutComplete(event.data.object);
      } else if (event.type === 'customer.subscription.created' || 
                 event.type === 'customer.subscription.updated') {
        await WebhookHandlers.handleSubscriptionUpdate(event.data.object);
      } else if (event.type === 'customer.subscription.deleted') {
        await WebhookHandlers.handleSubscriptionCanceled(event.data.object);
      } else if (event.type === 'account.updated') {
        await WebhookHandlers.handleConnectedAccountUpdate(event.data.object);
      }
    } catch (error) {
      console.error('Error handling custom webhook event:', error);
    }
  }
  
  static async handleCheckoutComplete(session: any) {
    // Handle repair order payments (Mechanics Garage)
    const orderId = session.metadata?.orderId;
    const shopId = session.metadata?.shopId;
    
    if (orderId && shopId && session.mode === 'payment' && session.payment_status === 'paid') {
      console.log('Repair order payment complete:', orderId, 'shopId:', shopId);
      
      // Verify the order exists and belongs to the shop (security check)
      const order = await storage.getRepairOrder(orderId);
      if (!order || order.shopId !== shopId) {
        console.error('Payment received for unknown or mismatched order:', orderId, shopId);
        return;
      }
      
      // Verify amount matches (within tolerance for rounding)
      const expectedAmount = order.grandTotal ? Math.round(parseFloat(String(order.grandTotal)) * 100) : 0;
      const paidAmount = session.amount_total || 0;
      if (Math.abs(expectedAmount - paidAmount) > 1) { // 1 cent tolerance
        console.error('Payment amount mismatch:', orderId, 'expected:', expectedAmount, 'received:', paidAmount);
        return;
      }
      
      // Check if already paid (idempotency)
      if (order.paymentStatus === 'paid') {
        console.log('Order already marked as paid, skipping:', orderId);
        return;
      }
      
      await storage.updateRepairOrder(orderId, {
        paymentStatus: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent,
      });
      
      console.log('Repair order marked as paid:', orderId);
      return;
    }
    
    // Handle subscription payments
    const userId = session.metadata?.userId;
    if (!userId) return;
    
    const isFounder = session.metadata?.isFounder === 'true';
    const subscriptionId = session.subscription;
    const subscriptionType = session.metadata?.subscriptionType;
    
    if (session.mode === 'subscription' && subscriptionId) {
      if (subscriptionType === 'ad-free') {
        console.log('Ad-free checkout complete:', subscriptionId, 'userId:', userId);
        
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        
        await storage.updateUser(userId, {
          adFreeSubscription: true,
          adFreeExpiresAt: expiresAt,
          adFreeStripeSubscriptionId: subscriptionId,
        });
        
        console.log('User updated to ad-free:', userId);
        
        const amount = session.amount_total ? session.amount_total / 100 : 5;
        orbitClient.reportSubscriptionRevenue(userId, amount, 'ad-free').catch(err => {
          console.error('[ORBIT] Failed to report ad-free subscription revenue:', err);
        });
      } else {
        console.log('Checkout complete for subscription:', subscriptionId, 'userId:', userId, 'isFounder:', isFounder);
        
        const billingPeriod = session.metadata?.billingPeriod || 'monthly';
        const expiresAt = new Date();
        if (billingPeriod === 'annual') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        
        await storage.updateUser(userId, {
          subscriptionTier: 'pro',
          stripeSubscriptionId: subscriptionId,
          subscriptionExpiresAt: expiresAt,
          isFounder: isFounder,
        });
        
        console.log('User updated to Pro:', userId, 'Founder:', isFounder);
        
        const amount = session.amount_total ? session.amount_total / 100 : 
          (billingPeriod === 'annual' ? 299 : 29.99);
        orbitClient.reportSubscriptionRevenue(userId, amount, 'pro').catch(err => {
          console.error('[ORBIT] Failed to report subscription revenue:', err);
        });
      }
    }
  }
  
  static async handleSubscriptionUpdate(subscription: any) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const isFounder = subscription.metadata?.isFounder === 'true';
    const subscriptionType = subscription.metadata?.subscriptionType;
    
    console.log('Subscription update:', subscription.id, 'type:', subscriptionType || 'pro', 'status:', subscription.status, 'userId:', userId);
    
    if (isActive) {
      const periodEnd = new Date(subscription.current_period_end * 1000);
      
      if (subscriptionType === 'ad-free') {
        await storage.updateUser(userId, {
          adFreeSubscription: true,
          adFreeExpiresAt: periodEnd,
          adFreeStripeSubscriptionId: subscription.id,
        });
      } else {
        await storage.updateUser(userId, {
          subscriptionTier: 'pro',
          stripeSubscriptionId: subscription.id,
          subscriptionExpiresAt: periodEnd,
          isFounder: isFounder,
        });
      }
    } else {
      const inactiveStatuses = ['past_due', 'unpaid', 'paused', 'incomplete', 'incomplete_expired'];
      if (inactiveStatuses.includes(subscription.status)) {
        console.log('Subscription inactive:', subscription.id, 'status:', subscription.status);
        if (subscriptionType === 'ad-free') {
          await storage.updateUser(userId, {
            adFreeSubscription: false,
          });
        } else {
          await storage.updateUser(userId, {
            subscriptionTier: 'free',
          });
        }
      }
    }
  }
  
  static async handleSubscriptionCanceled(subscription: any) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    
    const subscriptionType = subscription.metadata?.subscriptionType;
    console.log('Subscription canceled:', subscription.id, 'type:', subscriptionType || 'pro', 'userId:', userId);
    
    if (subscriptionType === 'ad-free') {
      await storage.updateUser(userId, {
        adFreeSubscription: false,
        adFreeStripeSubscriptionId: null,
        adFreeExpiresAt: null,
      });
    } else {
      await storage.updateUser(userId, {
        subscriptionTier: 'free',
        stripeSubscriptionId: null,
        subscriptionExpiresAt: null,
      });
    }
  }
  
  static async handleConnectedAccountUpdate(account: any) {
    const shopId = account.metadata?.shopId;
    if (!shopId) {
      console.log('Connected account update received but no shopId in metadata:', account.id);
      return;
    }
    
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const detailsSubmitted = account.details_submitted;
    
    const status = chargesEnabled && payoutsEnabled 
      ? 'active' 
      : detailsSubmitted 
        ? 'pending_verification' 
        : 'onboarding_incomplete';
    
    const onboardingComplete = chargesEnabled && payoutsEnabled;
    
    console.log('Connected account update:', account.id, 'shopId:', shopId, 'status:', status, 'complete:', onboardingComplete);
    
    await storage.updateShopStripeAccount(shopId, account.id, status, onboardingComplete);
  }
}
