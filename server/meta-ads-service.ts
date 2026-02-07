import { db } from '@db';
import { adCampaigns } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

function getConfig() {
  return {
    adAccountId: process.env.META_AD_ACCOUNT_ID || '751302398036834',
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
    pageId: process.env.META_PAGE_ID || '900725646468208',
    instagramAccountId: process.env.META_INSTAGRAM_ACCOUNT_ID || '17841480455608384',
  };
}

function getAccountPath() {
  const { adAccountId } = getConfig();
  return `act_${adAccountId}`;
}

export function getDefaultTargeting() {
  return {
    age_min: 18,
    age_max: 65,
    geo_locations: { countries: ["US"] },
    flexible_spec: [{
      interests: [
        { id: "6003139266461", name: "Automobile" },
        { id: "6003384248805", name: "Auto mechanic" },
        { id: "6003020834610", name: "Automotive industry" },
        { id: "6003271928775", name: "Car tuning" },
        { id: "6003107902433", name: "Motorcycle" },
        { id: "6003346610894", name: "Boating" },
        { id: "6003305057498", name: "Recreational vehicle" },
        { id: "6003598076498", name: "All-terrain vehicle" },
        { id: "6003384293805", name: "Radio-controlled car" },
        { id: "6003352089533", name: "Unmanned aerial vehicle" },
        { id: "6003263791871", name: "Do it yourself" },
        { id: "6003350920893", name: "Classic car" },
        { id: "6003017291433", name: "Truck" },
        { id: "6003298506170", name: "Off-roading" },
        { id: "6003385993805", name: "Auto parts" },
        { id: "6003634619805", name: "Small engine repair" },
        { id: "6003020934405", name: "Fishing boat" },
        { id: "6003327849205", name: "Go-kart" },
        { id: "6003396709805", name: "Slot car" },
        { id: "6003581998498", name: "Model aircraft" },
        { id: "6003236498805", name: "Snowmobile" },
        { id: "6003392175805", name: "Personal watercraft" },
        { id: "6003233418805", name: "Golf cart" },
        { id: "6003107502433", name: "Diesel engine" },
        { id: "6003251468805", name: "Kit car" },
        { id: "6003396109805", name: "Tractor" },
        { id: "6003382348805", name: "Heavy equipment" },
        { id: "6003020834805", name: "Aviation" },
      ]
    }]
  };
}

let customTargeting: any = null;

export function getCurrentTargeting() {
  return customTargeting || getDefaultTargeting();
}

export function setCustomTargeting(targeting: any) {
  customTargeting = targeting;
}

async function metaApiRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const { pageAccessToken } = getConfig();
  if (!pageAccessToken) {
    throw new Error('META_PAGE_ACCESS_TOKEN is not configured');
  }

  const url = `${META_BASE_URL}/${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {} as Record<string, string>,
  };

  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      options.body = body as any;
    } else {
      (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
      options.body = JSON.stringify({ ...body, access_token: pageAccessToken });
    }
  }

  if (method === 'GET') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${url}${separator}access_token=${pageAccessToken}`);
    const data = await response.json();
    if (data.error) {
      throw new Error(`Meta API Error: ${data.error.message} (code: ${data.error.code})`);
    }
    return data;
  }

  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Meta API Error: ${data.error.message} (code: ${data.error.code})`);
  }
  return data;
}

export async function createMetaCampaign(name: string, objective: string = 'OUTCOME_AWARENESS'): Promise<string> {
  const accountPath = getAccountPath();
  const result = await metaApiRequest(`${accountPath}/campaigns`, 'POST', {
    name,
    objective,
    status: 'PAUSED',
    special_ad_categories: [],
  });
  return result.id;
}

export async function createMetaAdSet(params: {
  name: string;
  campaignId: string;
  dailyBudget: number;
  platform: 'facebook' | 'instagram';
  targeting?: any;
}): Promise<string> {
  const accountPath = getAccountPath();
  const targeting = params.targeting || getCurrentTargeting();

  const targetingSpec: any = { ...targeting };

  if (params.platform === 'facebook') {
    targetingSpec.publisher_platforms = ['facebook'];
    targetingSpec.facebook_positions = ['feed', 'marketplace'];
  } else {
    targetingSpec.publisher_platforms = ['instagram'];
    targetingSpec.instagram_positions = ['stream', 'explore'];
  }

  const budgetInCents = Math.round(params.dailyBudget * 100);

  const result = await metaApiRequest(`${accountPath}/adsets`, 'POST', {
    name: params.name,
    campaign_id: params.campaignId,
    daily_budget: budgetInCents,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'REACH',
    targeting: targetingSpec,
    status: 'PAUSED',
  });
  return result.id;
}

export async function uploadAdImage(imageUrl: string): Promise<string> {
  const { pageAccessToken } = getConfig();
  const accountPath = getAccountPath();

  const isLocalFile = !imageUrl.startsWith('http');
  let imageBuffer: Buffer;
  let filename: string;

  if (isLocalFile) {
    const localPath = imageUrl.startsWith('/') ? 
      path.join(process.cwd(), 'client', 'public', imageUrl) :
      path.join(process.cwd(), 'client', 'public', imageUrl);
    
    if (!fs.existsSync(localPath)) {
      throw new Error(`Image file not found: ${localPath}`);
    }
    imageBuffer = fs.readFileSync(localPath);
    filename = path.basename(localPath);
  } else {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${imageUrl}`);
    }
    imageBuffer = Buffer.from(await response.arrayBuffer());
    filename = imageUrl.split('/').pop() || 'ad_image.png';
  }

  const formData = new FormData();
  formData.append('filename', filename);
  formData.append('bytes', imageBuffer, { filename, contentType: 'image/png' });
  formData.append('access_token', pageAccessToken);

  const url = `${META_BASE_URL}/${accountPath}/adimages`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData as any,
  });
  const data = await response.json();

  if (data.error) {
    throw new Error(`Meta API Image Upload Error: ${data.error.message}`);
  }

  const images = data.images;
  if (images) {
    const firstKey = Object.keys(images)[0];
    return images[firstKey].hash;
  }

  throw new Error('Failed to get image hash from upload response');
}

export async function createAdCreative(params: {
  name: string;
  imageHash: string;
  message: string;
  link: string;
  ctaType: string;
  platform: 'facebook' | 'instagram';
}): Promise<string> {
  const { pageId, instagramAccountId } = getConfig();
  const accountPath = getAccountPath();

  const objectStorySpec: any = {
    page_id: pageId,
    link_data: {
      message: params.message,
      link: params.link,
      image_hash: params.imageHash,
      call_to_action: {
        type: params.ctaType || 'LEARN_MORE',
      },
    },
  };

  if (params.platform === 'instagram') {
    objectStorySpec.instagram_actor_id = instagramAccountId;
  }

  const result = await metaApiRequest(`${accountPath}/adcreatives`, 'POST', {
    name: params.name,
    object_story_spec: objectStorySpec,
  });
  return result.id;
}

export async function createMetaAd(params: {
  name: string;
  adSetId: string;
  creativeId: string;
}): Promise<string> {
  const accountPath = getAccountPath();
  const result = await metaApiRequest(`${accountPath}/ads`, 'POST', {
    name: params.name,
    adset_id: params.adSetId,
    creative: { creative_id: params.creativeId },
    status: 'PAUSED',
  });
  return result.id;
}

export async function activateCampaign(campaignId: string, adSetId?: string, adId?: string): Promise<void> {
  await metaApiRequest(`${campaignId}`, 'POST', { status: 'ACTIVE' });
  if (adSetId) {
    await metaApiRequest(`${adSetId}`, 'POST', { status: 'ACTIVE' });
  }
  if (adId) {
    await metaApiRequest(`${adId}`, 'POST', { status: 'ACTIVE' });
  }
}

export async function pauseCampaign(campaignId: string, adSetId?: string, adId?: string): Promise<void> {
  await metaApiRequest(`${campaignId}`, 'POST', { status: 'PAUSED' });
  if (adSetId) {
    await metaApiRequest(`${adSetId}`, 'POST', { status: 'PAUSED' });
  }
  if (adId) {
    await metaApiRequest(`${adId}`, 'POST', { status: 'PAUSED' });
  }
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await metaApiRequest(`${campaignId}`, 'POST', { status: 'ARCHIVED' });
}

export async function fetchCampaignInsights(externalCampaignId: string): Promise<any> {
  const data = await metaApiRequest(
    `${externalCampaignId}/insights?fields=impressions,reach,clicks,spend,cpc,actions&date_preset=lifetime`
  );
  return data.data?.[0] || null;
}

export async function refreshAllInsights(): Promise<{ updated: number; errors: string[] }> {
  const campaigns = await db.select().from(adCampaigns)
    .where(and(
      eq(adCampaigns.tenantId, 'garagebot'),
    ));

  let updated = 0;
  const errors: string[] = [];

  for (const campaign of campaigns) {
    if (!campaign.externalCampaignId) continue;

    try {
      const insights = await fetchCampaignInsights(campaign.externalCampaignId);
      if (insights) {
        await db.update(adCampaigns)
          .set({
            impressions: parseInt(insights.impressions || '0'),
            reach: parseInt(insights.reach || '0'),
            clicks: parseInt(insights.clicks || '0'),
            totalSpent: insights.spend || '0',
            costPerClick: insights.cpc || null,
            updatedAt: new Date(),
          })
          .where(eq(adCampaigns.id, campaign.id));
        updated++;
      }
    } catch (err: any) {
      errors.push(`Campaign ${campaign.name}: ${err.message}`);
    }
  }

  return { updated, errors };
}

export async function createFullCampaign(params: {
  name: string;
  platform: 'facebook' | 'instagram';
  dailyBudget: number;
  adCopy: string;
  adImageUrl: string;
  ctaButton: string;
  landingUrl: string;
  objective?: string;
  targeting?: any;
}): Promise<any> {
  const campaignName = `${params.name} - ${params.platform === 'facebook' ? 'FB' : 'IG'}`;
  
  const metaCampaignId = await createMetaCampaign(campaignName, params.objective || 'OUTCOME_AWARENESS');

  const adSetName = `${campaignName} - Ad Set`;
  const adSetId = await createMetaAdSet({
    name: adSetName,
    campaignId: metaCampaignId,
    dailyBudget: params.dailyBudget,
    platform: params.platform,
    targeting: params.targeting,
  });

  const imageHash = await uploadAdImage(params.adImageUrl);

  const creativeName = `${campaignName} - Creative`;
  const creativeId = await createAdCreative({
    name: creativeName,
    imageHash,
    message: params.adCopy,
    link: params.landingUrl,
    ctaType: params.ctaButton || 'LEARN_MORE',
    platform: params.platform,
  });

  const adName = `${campaignName} - Ad`;
  const adId = await createMetaAd({
    name: adName,
    adSetId,
    creativeId,
  });

  const [dbCampaign] = await db.insert(adCampaigns).values({
    tenantId: 'garagebot',
    name: campaignName,
    platform: params.platform,
    status: 'paused',
    objective: params.objective || 'OUTCOME_AWARENESS',
    dailyBudget: params.dailyBudget.toString(),
    targetAudience: params.targeting || getCurrentTargeting(),
    adImageUrl: params.adImageUrl,
    adCopy: params.adCopy,
    ctaButton: params.ctaButton || 'LEARN_MORE',
    landingUrl: params.landingUrl,
    externalCampaignId: metaCampaignId,
    externalAdSetId: adSetId,
    externalAdId: adId,
    startDate: new Date(),
  }).returning();

  return {
    ...dbCampaign,
    meta: {
      campaignId: metaCampaignId,
      adSetId,
      creativeId,
      adId,
      imageHash,
    }
  };
}

export async function createInitialCampaigns(): Promise<any[]> {
  const results: any[] = [];

  const existingCampaigns = await db.select().from(adCampaigns)
    .where(eq(adCampaigns.tenantId, 'garagebot'));
  
  if (existingCampaigns.length > 0) {
    console.log('[Meta Ads] Initial campaigns already exist, skipping creation');
    return existingCampaigns;
  }

  try {
    const fbCampaign = await createFullCampaign({
      name: 'GarageBot Awareness',
      platform: 'facebook',
      dailyBudget: 10,
      adCopy: '🔧 Find the right part for ANY vehicle — cars, trucks, motorcycles, boats, RVs, ATVs & more! GarageBot searches 50+ retailers to get you the best price. Try it free at garagebot.io',
      adImageUrl: '/generated_images/hatch_garagebot_right_part.png',
      ctaButton: 'LEARN_MORE',
      landingUrl: 'https://garagebot.io',
    });
    results.push(fbCampaign);
    console.log('[Meta Ads] Created Facebook awareness campaign');
  } catch (err: any) {
    console.error('[Meta Ads] Failed to create FB campaign:', err.message);
    const [dbOnly] = await db.insert(adCampaigns).values({
      tenantId: 'garagebot',
      name: 'GarageBot Awareness - FB',
      platform: 'facebook',
      status: 'draft',
      objective: 'OUTCOME_AWARENESS',
      dailyBudget: '10',
      targetAudience: getDefaultTargeting(),
      adImageUrl: '/generated_images/hatch_garagebot_right_part.png',
      adCopy: '🔧 Find the right part for ANY vehicle — cars, trucks, motorcycles, boats, RVs, ATVs & more! GarageBot searches 50+ retailers to get you the best price. Try it free at garagebot.io',
      ctaButton: 'LEARN_MORE',
      landingUrl: 'https://garagebot.io',
    }).returning();
    results.push({ ...dbOnly, error: err.message });
  }

  try {
    const igCampaign = await createFullCampaign({
      name: 'GarageBot Awareness',
      platform: 'instagram',
      dailyBudget: 10,
      adCopy: '🚗 Stop overpaying for parts! GarageBot compares prices from 50+ retailers for cars, trucks, boats, motorcycles & everything in between. Free to use! 🔗 garagebot.io #AutoParts #DIYMechanic #GarageBot',
      adImageUrl: '/generated_images/hatch_garagebot_search.png',
      ctaButton: 'LEARN_MORE',
      landingUrl: 'https://garagebot.io',
    });
    results.push(igCampaign);
    console.log('[Meta Ads] Created Instagram awareness campaign');
  } catch (err: any) {
    console.error('[Meta Ads] Failed to create IG campaign:', err.message);
    const [dbOnly] = await db.insert(adCampaigns).values({
      tenantId: 'garagebot',
      name: 'GarageBot Awareness - IG',
      platform: 'instagram',
      status: 'draft',
      objective: 'OUTCOME_AWARENESS',
      dailyBudget: '10',
      targetAudience: getDefaultTargeting(),
      adImageUrl: '/generated_images/hatch_garagebot_search.png',
      adCopy: '🚗 Stop overpaying for parts! GarageBot compares prices from 50+ retailers for cars, trucks, boats, motorcycles & everything in between. Free to use! 🔗 garagebot.io #AutoParts #DIYMechanic #GarageBot',
      ctaButton: 'LEARN_MORE',
      landingUrl: 'https://garagebot.io',
    }).returning();
    results.push({ ...dbOnly, error: err.message });
  }

  return results;
}
