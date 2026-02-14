import { db } from '@db';
import { marketingPosts, marketingImages, socialIntegrations, scheduledPosts, contentBundles } from '@shared/schema';
import { eq, and, asc, sql, desc, isNotNull, inArray } from 'drizzle-orm';
import { TwitterConnector, postToFacebook, postToInstagram } from './social-connectors';

const GARAGEBOT_POSTING_HOURS_CST = [0, 3, 6, 9, 12, 15, 18, 21];
const ALL_POSTING_HOURS_CST = [0, 3, 6, 8, 9, 12, 15, 16, 18, 21];
const TWITTER_POSTING_HOURS_CST = [0, 6, 12, 18];
const TRUST_LAYER_HOURS_CST = [0, 8, 16];
const CST_TIMEZONE = 'America/Chicago';

function getCSTHour(): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CST_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(new Date()), 10);
}

function getCurrentSeason(): string {
  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CST_TIMEZONE,
    month: 'numeric',
  });
  const month = parseInt(monthFormatter.format(new Date()), 10);
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}
const ECOSYSTEM_URLS = {
  garagebot: 'https://garagebot.io',
  dwtl: 'https://dwtl.io',
  dwsc: 'https://dwsc.io',
  tlid: 'https://tlid.io',
  trustshield: 'https://trustshield.tech',
};

function getBaseUrl(): string {
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
  }
  return process.env.BASE_URL || 'https://garagebot.io';
}

let isRunning = false;
let lastPostHour = -1;
let lastTrustLayerHour = -1;

async function fetchPageAccessToken(userToken: string, targetPageId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${encodeURIComponent(userToken)}`
    );
    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      const page = data.data.find((p: any) => p.id === targetPageId);
      if (page && page.access_token) {
        console.log(`[Marketing] Obtained Page Access Token for "${page.name}" (${page.id})`);
        return page.access_token;
      }
      console.log(`[Marketing] Page ${targetPageId} not found in /me/accounts (${data.data.length} pages available)`);
    } else if (data.error) {
      console.error('[Marketing] Error fetching page token:', data.error.message);
    }
  } catch (err) {
    console.error('[Marketing] Failed to fetch page access token:', err);
  }
  return null;
}

async function ensureMetaIntegration() {
  const pageId = process.env.META_PAGE_ID;
  const userAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const instagramAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;
  const instagramUsername = process.env.META_INSTAGRAM_USERNAME;

  if (!pageId || !userAccessToken) {
    console.log('[Marketing] META_PAGE_ID or META_PAGE_ACCESS_TOKEN not set, skipping Meta integration setup');
    return;
  }

  const pageAccessToken = await fetchPageAccessToken(userAccessToken, pageId);
  if (!pageAccessToken) {
    console.log('[Marketing] Could not obtain Page Access Token, falling back to stored token');
  }

  const tokenToUse = pageAccessToken || userAccessToken;

  const integrationData: any = {
    facebookPageId: pageId,
    facebookPageAccessToken: tokenToUse,
    facebookConnected: true,
    facebookPageName: 'GarageBot.io',
    updatedAt: new Date(),
  };

  if (instagramAccountId) {
    integrationData.instagramAccountId = instagramAccountId;
    integrationData.instagramConnected = true;
    integrationData.instagramUsername = instagramUsername || 'garagebot.io';
  }

  const [existing] = await db.select().from(socialIntegrations)
    .where(eq(socialIntegrations.tenantId, 'garagebot')).limit(1);

  if (existing) {
    await db.update(socialIntegrations)
      .set(integrationData)
      .where(eq(socialIntegrations.tenantId, 'garagebot'));
    console.log('[Marketing] Updated Meta integration for garagebot (FB + IG)');
  } else {
    await db.insert(socialIntegrations).values({
      tenantId: 'garagebot',
      ...integrationData,
    });
    console.log('[Marketing] Created Meta integration for garagebot (FB + IG)');
  }
}

async function getIntegration(tenantId: string = 'garagebot') {
  const [integration] = await db.select().from(socialIntegrations)
    .where(eq(socialIntegrations.tenantId, tenantId)).limit(1);
  return integration;
}

async function getNextPost(platform: string, tenantId: string = 'garagebot', category?: string) {
  const { or } = await import('drizzle-orm');
  const season = getCurrentSeason();
  const conditions = [
    eq(marketingPosts.tenantId, tenantId),
    or(eq(marketingPosts.platform, platform), eq(marketingPosts.platform, 'all')),
    or(eq(marketingPosts.season, season), eq(marketingPosts.season, 'all')),
    eq(marketingPosts.isActive, true),
  ];
  if (category) {
    conditions.push(eq(marketingPosts.category, category));
  }
  const [post] = await db.select().from(marketingPosts)
    .where(and(...conditions))
    .orderBy(asc(marketingPosts.usageCount), asc(marketingPosts.lastUsedAt))
    .limit(1);
  return post;
}

const POST_CATEGORY_TO_IMAGE_FILENAMES: Record<string, string[]> = {
  'cars': ['cars_and_trucks.png', 'engine_block.png', 'brake_parts.png', 'suspension_parts.png', 'exhaust_system.png', 'tires_and_wheels.png', 'car_battery.png'],
  'trucks': ['cars_and_trucks.png', 'diesel_commercial_truck.png', 'engine_block.png', 'tires_and_wheels.png', 'brake_parts.png'],
  'diy': ['hatch_garagebot_diy.png', 'engine_block.png', 'brake_parts.png', 'cars_and_trucks.png'],
  'gamified': ['hatch_garagebot_quiz.png', 'hatch_garagebot_name_that_part.png', 'hatch_garagebot_search.png', 'hatch_garagebot_buddy.png', 'engine_block.png', 'cars_and_trucks.png'],
  'marine': ['boat_marine.png', 'marine_parts.png'],
  'atv': ['atv_and_utv.png'],
  'rv': ['rv_trailer.png'],
  'small-engines': ['small_engines_equipment.png'],
  'generator': ['generator_power.png'],
  'tractor': ['hatch_garagebot_all_vehicles.png'],
  'heavy-equipment': ['hatch_garagebot_right_part.png'],
  'motorcycle': ['motorcycle.png'],
  'drones': ['drones_fpv.png'],
  'rc-cars': ['rc_hobby_vehicles.png'],
  'model-aircraft': ['model_aircraft.png'],
  'slot-cars': ['slot_cars.png'],
  'aviation': ['aviation_aircraft.png'],
  'exotic': ['exotic_supercar.png'],
  'classic': ['classic_hot_rod.png'],
  'diesel': ['diesel_commercial_truck.png'],
  'kit-car': ['kit_car_build.png'],
  'go-kart': ['go_kart_racing.png'],
  'golf-cart': ['golf_cart.png'],
  'snowmobile': ['snowmobile_snow.png'],
  'jet-ski': ['jet_ski_watercraft.png'],
  'brand': ['hatch_garagebot_right_part_v2.png', 'hatch_garagebot_50_stores.png', 'hatch_garagebot_buddy.png', 'hatch_garagebot_search.png', 'hatch_garagebot_nashville.png', 'garagebot_facebook_cover_16x9.png'],
  'ai': ['buddy_ai_assistant.png'],
  'blockchain': ['hatch_garagebot_search.png'],
  'darkwave': ['darkwave_disrupt_signal.jpeg', 'trustlayer_robot_shield.jpeg', 'darkwave_trustlayer_wave.jpeg'],
  'mechanics': ['hatch_garagebot_diy.png', 'engine_block.png', 'brake_parts.png'],
};

async function getNextImage(postCategory?: string, tenantId: string = 'garagebot') {
  if (postCategory) {
    const matchingFilenames = POST_CATEGORY_TO_IMAGE_FILENAMES[postCategory];
    if (matchingFilenames && matchingFilenames.length > 0) {
      const [matchedImage] = await db.select().from(marketingImages)
        .where(and(
          eq(marketingImages.tenantId, tenantId),
          eq(marketingImages.isActive, true),
          inArray(marketingImages.filename, matchingFilenames)
        ))
        .orderBy(asc(marketingImages.usageCount), asc(marketingImages.lastUsedAt))
        .limit(1);
      if (matchedImage) return matchedImage;
    }
  }

  const [image] = await db.select().from(marketingImages)
    .where(and(eq(marketingImages.tenantId, tenantId), eq(marketingImages.isActive, true)))
    .orderBy(asc(marketingImages.usageCount), asc(marketingImages.lastUsedAt))
    .limit(1);
  return image;
}

function buildMessage(content: string, targetSite: string, hashtags: string[] = []): string {
  const url = ECOSYSTEM_URLS[targetSite as keyof typeof ECOSYSTEM_URLS] || ECOSYSTEM_URLS.garagebot;
  const hashtagStr = hashtags.length > 0 ? '\n\n' + hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ') : '';
  return `${content}\n\n${url}${hashtagStr}`;
}

async function recordPost(
  platform: string,
  content: string,
  status: string,
  externalId?: string,
  error?: string,
  marketingPostId?: string,
  tenantId: string = 'garagebot'
) {
  await db.insert(scheduledPosts).values({
    tenantId,
    platform,
    content,
    status,
    externalPostId: externalId,
    error,
    marketingPostId,
    postedAt: status === 'posted' ? new Date() : null,
  });
}

async function postToAllPlatforms(
  post: any,
  integration: any,
  twitter: TwitterConnector,
  hour: number,
  forceTwitter: boolean = false
) {
  const message = buildMessage(post.content, post.targetSite || 'garagebot', post.hashtags || []);
  const image = await getNextImage(post.category || undefined);
  const imageUrl = image ? `${getBaseUrl()}${image.filePath}` : undefined;

  if (integration?.facebookConnected && integration.facebookPageId && integration.facebookPageAccessToken) {
    const result = await postToFacebook(integration.facebookPageId, integration.facebookPageAccessToken, message, imageUrl);
    await recordPost('facebook', message, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
    console.log(`[Marketing FB] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }

  if (integration?.instagramConnected && integration.instagramAccountId && imageUrl) {
    const igMessage = message.length > 2200 ? message.substring(0, 2197) + '...' : message;
    const result = await postToInstagram(integration.instagramAccountId, integration.facebookPageAccessToken!, igMessage, imageUrl);
    await recordPost('instagram', igMessage, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
    console.log(`[Marketing IG] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }

  if (twitter.isConfigured() && (TWITTER_POSTING_HOURS_CST.includes(hour) || forceTwitter)) {
    const twitterMessage = message.length > 4000 ? message.substring(0, 3997) + '...' : message;
    const result = await twitter.post(twitterMessage);
    await recordPost('x', twitterMessage, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
    console.log(`[Marketing X] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }

  await db.update(marketingPosts)
    .set({ usageCount: sql`${marketingPosts.usageCount} + 1`, lastUsedAt: new Date() })
    .where(eq(marketingPosts.id, post.id));

  if (image) {
    await db.update(marketingImages)
      .set({ usageCount: sql`${marketingImages.usageCount} + 1`, lastUsedAt: new Date() })
      .where(eq(marketingImages.id, image.id));
  }
}

async function executeScheduledPosts() {
  const hour = getCSTHour();
  
  if (!ALL_POSTING_HOURS_CST.includes(hour) || hour === lastPostHour) {
    return;
  }
  
  lastPostHour = hour;
  console.log(`[Marketing] Executing scheduled posts for CST hour ${hour}`);
  
  const integration = await getIntegration();
  const twitter = new TwitterConnector();
  
  if (GARAGEBOT_POSTING_HOURS_CST.includes(hour)) {
    const post = await getNextPost('all');
    if (!post) {
      console.log('[Marketing] No active GarageBot posts available');
    } else {
      await postToAllPlatforms(post, integration, twitter, hour);
    }
  }

  if (TRUST_LAYER_HOURS_CST.includes(hour) && hour !== lastTrustLayerHour) {
    lastTrustLayerHour = hour;
    const tlPost = await getNextPost('all', 'garagebot', 'darkwave');
    if (tlPost) {
      console.log(`[Marketing] Posting dedicated Trust Layer content at CST hour ${hour}`);
      await postToAllPlatforms(tlPost, integration, twitter, hour, true);
    } else {
      console.log('[Marketing] No active Trust Layer posts available for dedicated slot');
    }
  }
}

async function fetchFacebookInsights(post: any, accessToken: string) {
  const insightsUrl = `https://graph.facebook.com/v21.0/${post.externalPostId}/insights?metric=post_impressions,post_reach,post_clicks&access_token=${accessToken}`;
  const insightsRes = await fetch(insightsUrl);
  const insightsData = await insightsRes.json();

  let impressions = post.impressions || 0;
  let reach = post.reach || 0;
  let clicks = post.clicks || 0;

  if (insightsData.data && Array.isArray(insightsData.data)) {
    for (const metric of insightsData.data) {
      const value = metric.values?.[0]?.value || 0;
      if (metric.name === 'post_impressions') impressions = value;
      if (metric.name === 'post_reach') reach = value;
      if (metric.name === 'post_clicks') clicks = value;
    }
  }

  const engagementUrl = `https://graph.facebook.com/v21.0/${post.externalPostId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`;
  const engagementRes = await fetch(engagementUrl);
  const engagementData = await engagementRes.json();

  const likes = engagementData.likes?.summary?.total_count || post.likes || 0;
  const comments = engagementData.comments?.summary?.total_count || post.comments || 0;
  const shares = engagementData.shares?.count || post.shares || 0;

  await db.update(scheduledPosts)
    .set({ impressions, reach, clicks, likes, comments, shares })
    .where(eq(scheduledPosts.id, post.id));
}

async function fetchInstagramInsights(post: any, accessToken: string) {
  let impressions = post.impressions || 0;
  let reach = post.reach || 0;
  let likes = post.likes || 0;
  let comments = post.comments || 0;

  try {
    const insightsUrl = `https://graph.facebook.com/v21.0/${post.externalPostId}/insights?metric=impressions,reach&access_token=${accessToken}`;
    const insightsRes = await fetch(insightsUrl);
    const insightsData = await insightsRes.json();

    if (insightsData.data && Array.isArray(insightsData.data)) {
      for (const metric of insightsData.data) {
        const value = metric.values?.[0]?.value || 0;
        if (metric.name === 'impressions') impressions = value;
        if (metric.name === 'reach') reach = value;
      }
    }
  } catch (err) {
    console.error(`[Marketing IG] Insights API error for ${post.externalPostId}:`, err);
  }

  try {
    const fieldsUrl = `https://graph.facebook.com/v21.0/${post.externalPostId}?fields=like_count,comments_count&access_token=${accessToken}`;
    const fieldsRes = await fetch(fieldsUrl);
    const fieldsData = await fieldsRes.json();

    if (fieldsData.like_count !== undefined) likes = fieldsData.like_count;
    if (fieldsData.comments_count !== undefined) comments = fieldsData.comments_count;
  } catch (err) {
    console.error(`[Marketing IG] Fields API error for ${post.externalPostId}:`, err);
  }

  await db.update(scheduledPosts)
    .set({ impressions, reach, likes, comments })
    .where(eq(scheduledPosts.id, post.id));
}

async function fetchMetaInsights() {
  const integration = await getIntegration();
  const accessToken = integration?.facebookPageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;
  if (!accessToken) {
    return;
  }

  const postedPosts = await db.select().from(scheduledPosts)
    .where(and(
      eq(scheduledPosts.status, 'posted'),
      isNotNull(scheduledPosts.externalPostId)
    ));

  let fbCount = 0;
  let igCount = 0;

  for (const post of postedPosts) {
    try {
      if (post.platform === 'instagram') {
        await fetchInstagramInsights(post, accessToken);
        igCount++;
      } else {
        await fetchFacebookInsights(post, accessToken);
        fbCount++;
      }
    } catch (err) {
      console.error(`[Marketing] Failed to fetch insights for ${post.platform} post ${post.externalPostId}:`, err);
    }
  }

  console.log(`[Marketing] Fetched insights: ${fbCount} FB, ${igCount} IG posts`);
}

export function startMarketingScheduler() {
  if (isRunning) {
    console.log('[Marketing] Scheduler already running');
    return;
  }
  
  console.log('[Marketing] Starting scheduler...');
  console.log('[Marketing] GarageBot posts: FB/IG every 3 hours CST (12am,3am,6am,9am,12pm,3pm,6pm,9pm), X every 6 hours (12am,6am,12pm,6pm)');
  console.log('[Marketing] Trust Layer posts: All platforms 3x daily every 8 hours at 12am, 8am & 4pm CST');
  
  isRunning = true;

  ensureMetaIntegration()
    .then(async () => {
      try {
        const { createInitialCampaigns } = await import('./meta-ads-service');
        await createInitialCampaigns();
      } catch (err) {
        console.error('[Meta Ads] Auto-init campaigns error:', err);
      }
    })
    .catch(err => console.error('[Marketing] Meta integration error:', err));
  
  setInterval(() => {
    executeScheduledPosts().catch(err => console.error('[Marketing] Error:', err));
  }, 60 * 1000);

  setInterval(() => {
    fetchMetaInsights().catch(err => console.error('[Marketing] Insights fetch error:', err));
  }, 30 * 60 * 1000);

  setInterval(async () => {
    try {
      const { createInitialCampaigns } = await import('./meta-ads-service');
      await createInitialCampaigns();
    } catch {}
  }, 3 * 60 * 60 * 1000);
  
  executeScheduledPosts().catch(err => console.error('[Marketing] Initial run error:', err));
}

export async function getPostingHistory(limit = 50) {
  return await db.select().from(scheduledPosts)
    .orderBy(desc(scheduledPosts.createdAt))
    .limit(limit);
}

export async function getMarketingStats() {
  const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(marketingPosts).where(eq(marketingPosts.isActive, true));
  const [imagesCount] = await db.select({ count: sql<number>`count(*)` }).from(marketingImages).where(eq(marketingImages.isActive, true));
  const [postedCount] = await db.select({ count: sql<number>`count(*)` }).from(scheduledPosts).where(eq(scheduledPosts.status, 'posted'));
  const [failedCount] = await db.select({ count: sql<number>`count(*)` }).from(scheduledPosts).where(eq(scheduledPosts.status, 'failed'));
  
  return {
    activePosts: Number(postsCount.count),
    activeImages: Number(imagesCount.count),
    totalPosted: Number(postedCount.count),
    totalFailed: Number(failedCount.count),
    postingHours: ALL_POSTING_HOURS_CST,
  };
}

export async function getTopPerformingContent() {
  const results = await db.select({
    marketingPostId: scheduledPosts.marketingPostId,
    totalLikes: sql<number>`coalesce(sum(${scheduledPosts.likes}), 0)`,
    totalComments: sql<number>`coalesce(sum(${scheduledPosts.comments}), 0)`,
    totalShares: sql<number>`coalesce(sum(${scheduledPosts.shares}), 0)`,
    totalEngagement: sql<number>`coalesce(sum(${scheduledPosts.likes}), 0) + coalesce(sum(${scheduledPosts.comments}), 0) + coalesce(sum(${scheduledPosts.shares}), 0)`,
    totalImpressions: sql<number>`coalesce(sum(${scheduledPosts.impressions}), 0)`,
    totalReach: sql<number>`coalesce(sum(${scheduledPosts.reach}), 0)`,
    postCount: sql<number>`count(*)`,
  })
    .from(scheduledPosts)
    .where(and(
      eq(scheduledPosts.status, 'posted'),
      isNotNull(scheduledPosts.marketingPostId)
    ))
    .groupBy(scheduledPosts.marketingPostId)
    .orderBy(sql`coalesce(sum(${scheduledPosts.likes}), 0) + coalesce(sum(${scheduledPosts.comments}), 0) + coalesce(sum(${scheduledPosts.shares}), 0) desc`);

  return results;
}

export async function getTopPerformingImages() {
  const results = await db.select({
    imageUrl: scheduledPosts.imageUrl,
    totalLikes: sql<number>`coalesce(sum(${scheduledPosts.likes}), 0)`,
    totalComments: sql<number>`coalesce(sum(${scheduledPosts.comments}), 0)`,
    totalShares: sql<number>`coalesce(sum(${scheduledPosts.shares}), 0)`,
    totalEngagement: sql<number>`coalesce(sum(${scheduledPosts.likes}), 0) + coalesce(sum(${scheduledPosts.comments}), 0) + coalesce(sum(${scheduledPosts.shares}), 0)`,
    totalImpressions: sql<number>`coalesce(sum(${scheduledPosts.impressions}), 0)`,
    totalReach: sql<number>`coalesce(sum(${scheduledPosts.reach}), 0)`,
    postCount: sql<number>`count(*)`,
  })
    .from(scheduledPosts)
    .where(and(
      eq(scheduledPosts.status, 'posted'),
      isNotNull(scheduledPosts.imageUrl)
    ))
    .groupBy(scheduledPosts.imageUrl)
    .orderBy(sql`coalesce(sum(${scheduledPosts.likes}), 0) + coalesce(sum(${scheduledPosts.comments}), 0) + coalesce(sum(${scheduledPosts.shares}), 0) desc`);

  return results;
}

export async function getTopPerformingCombinations() {
  const results = await db.select({
    id: contentBundles.id,
    imageUrl: contentBundles.imageUrl,
    message: contentBundles.message,
    platform: contentBundles.platform,
    status: contentBundles.status,
    impressions: contentBundles.impressions,
    reach: contentBundles.reach,
    clicks: contentBundles.clicks,
    likes: contentBundles.likes,
    comments: contentBundles.comments,
    shares: contentBundles.shares,
    saves: contentBundles.saves,
    engagementScore: sql<number>`coalesce(${contentBundles.likes}, 0) + coalesce(${contentBundles.comments}, 0) + coalesce(${contentBundles.shares}, 0)`,
  })
    .from(contentBundles)
    .where(eq(contentBundles.tenantId, 'garagebot'))
    .orderBy(sql`coalesce(${contentBundles.likes}, 0) + coalesce(${contentBundles.comments}, 0) + coalesce(${contentBundles.shares}, 0) desc`);

  return results;
}

export async function getPerformanceByTimeSlot() {
  const results = await db.select({
    hour: sql<number>`extract(hour from ${scheduledPosts.postedAt})`,
    avgLikes: sql<number>`coalesce(avg(${scheduledPosts.likes}), 0)`,
    avgComments: sql<number>`coalesce(avg(${scheduledPosts.comments}), 0)`,
    avgShares: sql<number>`coalesce(avg(${scheduledPosts.shares}), 0)`,
    avgEngagement: sql<number>`coalesce(avg(${scheduledPosts.likes}), 0) + coalesce(avg(${scheduledPosts.comments}), 0) + coalesce(avg(${scheduledPosts.shares}), 0)`,
    avgImpressions: sql<number>`coalesce(avg(${scheduledPosts.impressions}), 0)`,
    avgReach: sql<number>`coalesce(avg(${scheduledPosts.reach}), 0)`,
    postCount: sql<number>`count(*)`,
  })
    .from(scheduledPosts)
    .where(and(
      eq(scheduledPosts.status, 'posted'),
      isNotNull(scheduledPosts.postedAt)
    ))
    .groupBy(sql`extract(hour from ${scheduledPosts.postedAt})`)
    .orderBy(sql`extract(hour from ${scheduledPosts.postedAt})`);

  return results;
}
