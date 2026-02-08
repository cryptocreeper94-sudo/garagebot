import { getUncachableStripeClient } from '../stripeClient';

async function seedSubscriptionProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('Creating GarageBot subscription products in Stripe...\n');

  const existingProducts = await stripe.products.search({ query: "active:'true'" });
  const existingNames = existingProducts.data.map(p => p.name);

  if (!existingNames.includes('GarageBot Ad-Free')) {
    const adFreeProduct = await stripe.products.create({
      name: 'GarageBot Ad-Free',
      description: 'Remove all ads from GarageBot for a clean, distraction-free experience.',
      metadata: {
        tier: 'ad-free',
        type: 'subscription',
        edition: 'launch',
      },
    });

    const adFreeMonthly = await stripe.prices.create({
      product: adFreeProduct.id,
      unit_amount: 300,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'ad-free', period: 'monthly' },
    });

    const adFreeAnnual = await stripe.prices.create({
      product: adFreeProduct.id,
      unit_amount: 3000,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { tier: 'ad-free', period: 'annual' },
    });

    console.log(`Ad-Free Product: ${adFreeProduct.id}`);
    console.log(`  Monthly Price: ${adFreeMonthly.id} ($3/mo)`);
    console.log(`  Annual Price: ${adFreeAnnual.id} ($30/yr)\n`);
  } else {
    console.log('Ad-Free product already exists, skipping.\n');
  }

  if (!existingNames.includes('GarageBot Basic')) {
    const basicProduct = await stripe.products.create({
      name: 'GarageBot Basic',
      description: 'Ad-free experience plus marketplace selling, enhanced dashboard, and more.',
      metadata: {
        tier: 'basic',
        type: 'subscription',
        edition: 'launch',
      },
    });

    const basicMonthly = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 600,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'basic', period: 'monthly' },
    });

    const basicAnnual = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 6000,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { tier: 'basic', period: 'annual' },
    });

    console.log(`Basic Product: ${basicProduct.id}`);
    console.log(`  Monthly Price: ${basicMonthly.id} ($6/mo)`);
    console.log(`  Annual Price: ${basicAnnual.id} ($60/yr)\n`);
  } else {
    console.log('Basic product already exists, skipping.\n');
  }

  const proProduct = existingProducts.data.find(p => p.name === 'GarageBot Pro - Founders Circle');
  if (proProduct) {
    const existingPrices = await stripe.prices.list({ product: proProduct.id, active: true });
    
    for (const price of existingPrices.data) {
      if (price.unit_amount === 499 || price.unit_amount === 3999) {
        await stripe.prices.update(price.id, { active: false });
        console.log(`Deactivated old Pro price: ${price.id} ($${(price.unit_amount! / 100).toFixed(2)})`);
      }
    }

    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1000,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'pro', period: 'monthly' },
    });

    const proAnnual = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9900,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { tier: 'pro', period: 'annual' },
    });

    console.log(`\nPro Product (updated pricing): ${proProduct.id}`);
    console.log(`  Monthly Price: ${proMonthly.id} ($10/mo)`);
    console.log(`  Annual Price: ${proAnnual.id} ($99/yr)\n`);
  }

  console.log('\n=== IMPORTANT: Update these environment variables ===');
  console.log('Copy the price IDs above and set them as env vars.');
  console.log('Done!');
}

seedSubscriptionProducts().catch(console.error);
