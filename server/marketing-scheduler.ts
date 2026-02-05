import { db } from '@db';
import { marketingPosts, marketingImages, socialIntegrations, scheduledPosts } from '@shared/schema';
import { eq, and, asc, sql, desc } from 'drizzle-orm';
import { TwitterConnector, postToFacebook, postToInstagram } from './social-connectors';

const POSTING_HOURS = [8, 10, 12, 14, 16, 18, 20];
const ECOSYSTEM_URLS = {
  garagebot: 'https://garagebot.io',
  dwtl: 'https://dwtl.io',
  tlid: 'https://tlid.io',
  trustshield: 'https://trustshield.io',
};

function getBaseUrl(): string {
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
  }
  return process.env.BASE_URL || 'https://garagebot.io';
}

let isRunning = false;
let lastPostHour = -1;

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
  
  for (const platform of ['all', 'facebook', 'instagram', 'x']) {
    const post = await getNextPost(platform === 'all' ? 'all' : platform);
    if (!post) continue;
    
    const message = buildMessage(post.content, post.targetSite || 'garagebot', post.hashtags || []);
    const image = await getNextImage();
    const imageUrl = image ? `${getBaseUrl()}${image.filePath}` : undefined;
    
    if (platform === 'all' || platform === 'facebook') {
      if (integration?.facebookConnected && integration.facebookPageId && integration.facebookPageAccessToken) {
        const result = await postToFacebook(integration.facebookPageId, integration.facebookPageAccessToken, message, imageUrl);
        await recordPost('facebook', message, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
        console.log(`[Marketing FB] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
      }
    }
    
    if (platform === 'all' || platform === 'instagram') {
      if (integration?.instagramConnected && integration.instagramAccountId && imageUrl) {
        const result = await postToInstagram(integration.instagramAccountId, integration.facebookPageAccessToken!, message, imageUrl);
        await recordPost('instagram', message, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
        console.log(`[Marketing IG] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
      }
    }
    
    if (platform === 'all' || platform === 'x') {
      if (twitter.isConfigured()) {
        const twitterMessage = message.length > 280 ? message.substring(0, 277) + '...' : message;
        const result = await twitter.post(twitterMessage);
        await recordPost('x', twitterMessage, result.success ? 'posted' : 'failed', result.externalId, result.error, post.id);
        console.log(`[Marketing X] ${result.success ? 'Posted' : 'Failed'}: ${result.externalId || result.error}`);
      }
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
}

export function startMarketingScheduler() {
  if (isRunning) {
    console.log('[Marketing] Scheduler already running');
    return;
  }
  
  console.log('[Marketing] Starting scheduler...');
  console.log('[Marketing] Posts scheduled at: 8am, 10am, 12pm, 2pm, 4pm, 6pm, 8pm');
  
  isRunning = true;
  
  setInterval(() => {
    executeScheduledPosts().catch(err => console.error('[Marketing] Error:', err));
  }, 60 * 1000);
  
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
