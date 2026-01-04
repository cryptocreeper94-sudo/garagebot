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
    
    // Parse the event to handle subscription updates
    try {
      const stripe = await getUncachableStripeClient();
      const event = JSON.parse(payload.toString());
      
      // Handle subscription events
      if (event.type === 'checkout.session.completed') {
        await WebhookHandlers.handleCheckoutComplete(event.data.object);
      } else if (event.type === 'customer.subscription.created' || 
                 event.type === 'customer.subscription.updated') {
        await WebhookHandlers.handleSubscriptionUpdate(event.data.object);
      } else if (event.type === 'customer.subscription.deleted') {
        await WebhookHandlers.handleSubscriptionCanceled(event.data.object);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
    }
    
    // Still process through stripe-replit-sync for database sync
    await sync.processWebhook(payload, signature, uuid);
  }
  
  static async handleCheckoutComplete(session: any) {
    const userId = session.metadata?.userId;
    if (!userId) return;
    
    const isFounder = session.metadata?.isFounder === 'true';
    const subscriptionId = session.subscription;
    
    if (session.mode === 'subscription' && subscriptionId) {
      console.log('Checkout complete for subscription:', subscriptionId, 'userId:', userId, 'isFounder:', isFounder);
      
      // Calculate expiration (1 month or 1 year from now depending on billing period)
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
  
  static async handleSubscriptionUpdate(subscription: any) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const isFounder = subscription.metadata?.isFounder === 'true';
    
    console.log('Subscription update:', subscription.id, 'status:', subscription.status, 'userId:', userId);
    
    if (isActive) {
      const periodEnd = new Date(subscription.current_period_end * 1000);
      
      await storage.updateUser(userId, {
        subscriptionTier: 'pro',
        stripeSubscriptionId: subscription.id,
        subscriptionExpiresAt: periodEnd,
        isFounder: isFounder,
      });
    }
  }
  
  static async handleSubscriptionCanceled(subscription: any) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    
    console.log('Subscription canceled:', subscription.id, 'userId:', userId);
    
    // Keep founder status even if they cancel (grandfathered for future)
    // But remove active subscription
    await storage.updateUser(userId, {
      subscriptionTier: 'free',
      stripeSubscriptionId: null,
      subscriptionExpiresAt: null,
    });
  }
}
