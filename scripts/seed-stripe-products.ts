import Stripe from 'stripe';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const connectorName = 'stripe';
  const targetEnvironment = 'development';

  const url = new URL('https://' + hostname + '/api/v2/connection');
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json() as any;
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error('Stripe connection not found');
  }

  return connectionSettings.settings.secret;
}

async function createProducts() {
  const secretKey = await getCredentials();
  const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });

  console.log('Creating GarageBot Stripe products...\n');

  // 1. Pro Subscription Product
  console.log('Creating Pro Subscription product...');
  const proProduct = await stripe.products.create({
    name: 'GarageBot Pro - Founders Circle',
    description: 'Unlimited vehicles, Genesis Hallmarks at 80% off, price alerts, advanced Buddy AI, and exclusive deals. Founders lock in this rate forever.',
    metadata: {
      type: 'subscription',
      edition: 'launch',
      tier: 'pro'
    }
  });
  console.log('  Product ID: ' + proProduct.id);

  // Pro Monthly Price ($4.99)
  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 499,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { period: 'monthly', edition: 'launch' }
  });
  console.log('  Monthly Price ID: ' + proMonthly.id + ' ($4.99/mo)');

  // Pro Annual Price ($39.99)
  const proAnnual = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 3999,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { period: 'annual', edition: 'launch' }
  });
  console.log('  Annual Price ID: ' + proAnnual.id + ' ($39.99/yr)');

  // 2. Genesis Hallmark Product (Free User Price)
  console.log('\nCreating Genesis Hallmark product (Free User)...');
  const hallmarkFree = await stripe.products.create({
    name: 'Genesis Hallmark - Vehicle Passport',
    description: 'Digital certificate for your vehicle. Prove ownership, track history, increase resale value. Lifetime validity.',
    metadata: {
      type: 'hallmark',
      tier: 'free',
      edition: 'launch'
    }
  });
  console.log('  Product ID: ' + hallmarkFree.id);

  const hallmarkFreePrice = await stripe.prices.create({
    product: hallmarkFree.id,
    unit_amount: 999,
    currency: 'usd',
    metadata: { tier: 'free', edition: 'launch' }
  });
  console.log('  Free User Price ID: ' + hallmarkFreePrice.id + ' ($9.99)');

  // 3. Genesis Hallmark Product (Pro User Price)
  console.log('\nCreating Genesis Hallmark product (Pro User)...');
  const hallmarkPro = await stripe.products.create({
    name: 'Genesis Hallmark - Pro Rate',
    description: 'Digital certificate for your vehicle. Pro members get 80% off! Lifetime validity.',
    metadata: {
      type: 'hallmark',
      tier: 'pro',
      edition: 'launch'
    }
  });
  console.log('  Product ID: ' + hallmarkPro.id);

  const hallmarkProPrice = await stripe.prices.create({
    product: hallmarkPro.id,
    unit_amount: 199,
    currency: 'usd',
    metadata: { tier: 'pro', edition: 'launch' }
  });
  console.log('  Pro User Price ID: ' + hallmarkProPrice.id + ' ($1.99)');

  console.log('\n=== SUCCESS ===\n');
  console.log('Price IDs to use in your app:');
  console.log('  STRIPE_PRO_MONTHLY_PRICE_ID=' + proMonthly.id);
  console.log('  STRIPE_PRO_ANNUAL_PRICE_ID=' + proAnnual.id);
  console.log('  STRIPE_HALLMARK_FREE_PRICE_ID=' + hallmarkFreePrice.id);
  console.log('  STRIPE_HALLMARK_PRO_PRICE_ID=' + hallmarkProPrice.id);
}

createProducts().catch(console.error);
