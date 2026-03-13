import Stripe from 'stripe';

// Direct Stripe client using environment variables (no Replit connectors)
const secretKey = process.env.STRIPE_SECRET_KEY || '';
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';

export async function getUncachableStripeClient() {
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not found in environment');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function getStripePublishableKey() {
  return publishableKey;
}

export async function getStripeSecretKey() {
  return secretKey;
}

// Stub for getStripeSync — stripe-replit-sync removed for Render compatibility
export async function getStripeSync(): Promise<any> {
  // Return a stub that provides no-op sync operations
  return {
    syncBackfill: async () => { /* no-op on Render */ },
    findOrCreateManagedWebhook: async (url: string, opts: any) => ({
      webhook: { url },
      uuid: 'render-managed',
    }),
  };
}
