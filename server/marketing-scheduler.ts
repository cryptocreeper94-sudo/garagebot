import { db } from '@db';
import { marketingPosts, marketingImages, socialIntegrations, scheduledPosts, contentBundles } from '@shared/schema';
import { eq, and, asc, sql, desc, isNotNull } from 'drizzle-orm';
import { TwitterConnector, postToFacebook, postToInstagram } from './social-connectors';

const POSTING_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];
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

async function getNextPost(platform: string, tenantId: string = 'garagebot') {
  const { or } = await import('drizzle-orm');
  const [post] = await db.select().from(marketingPosts)
    .where(and(
      eq(marketingPosts.tenantId, tenantId),
      or(eq(marketingPosts.platform, platform), eq(marketingPosts.platform, 'all')),
      eq(marketingPosts.isActive, true)
    ))
    .orderBy(asc(marketingPosts.usageCount), asc(marketingPosts.lastUsedAt))
    .limit(1);
  return post;
}

async function getNextImage(tenantId: string = 'garagebot') {
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

async function executeScheduledPosts() {
  const now = new Date();
  const hour = now.getHours();
  
  if (!POSTING_HOURS.includes(hour) || hour === lastPostHour) {
    return;
  }
  
  lastPostHour = hour;
  console.log(`[Marketing] Executing scheduled posts for hour ${hour}`);
  
  const integration = await getIntegration();
  const twitter = new TwitterConnector();
  
  const post = await getNextPost('all');
  if (!post) {
    console.log('[Marketing] No active posts available');
    return;
  }
  
  const message = buildMessage(post.content, post.targetSite || 'garagebot', post.hashtags || []);
  const image = await getNextImage();
  const imageUrl = image ? `${getBaseUrl()}${image.filePath}` : undefined;
  
  if (integration?.facebookConnected && integration.facebookPageId && integration.facebookPageAccessToken) {
    const result = await postToFacebook(integration.facebookPageId, integration.facebookPageAccessToken, message, imageUrl);
    await recordPost('facebook', message, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
    console.log(`[Marketing FB] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }
  
  if (integration?.instagramConnected && integration.instagramAccountId && imageUrl) {
    const result = await postToInstagram(integration.instagramAccountId, integration.facebookPageAccessToken!, message, imageUrl);
    await recordPost('instagram', message, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
    console.log(`[Marketing IG] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
  }
  
  if (twitter.isConfigured()) {
    const twitterMessage = message.length > 280 ? message.substring(0, 277) + '...' : message;
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
  console.log('[Marketing] Posts scheduled every 3 hours: 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm');
  
  isRunning = true;

  ensureMetaIntegration().catch(err => console.error('[Marketing] Meta integration error:', err));
  
  setInterval(() => {
    executeScheduledPosts().catch(err => console.error('[Marketing] Error:', err));
  }, 60 * 1000);

  setInterval(() => {
    fetchMetaInsights().catch(err => console.error('[Marketing] Insights fetch error:', err));
  }, 30 * 60 * 1000);
  
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
    postingHours: POSTING_HOURS,
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
