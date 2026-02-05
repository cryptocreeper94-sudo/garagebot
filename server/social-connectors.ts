import crypto from 'crypto';

export interface DeployResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

export class TwitterConnector {
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string;
  private accessTokenSecret: string;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret);
  }

  private getOAuthHeader(method: string, url: string): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
    };
    const signature = generateOAuthSignature(method, url, oauthParams, this.apiSecret, this.accessTokenSecret);
    oauthParams.oauth_signature = signature;
    const headerParts = Object.keys(oauthParams)
      .filter(k => k.startsWith('oauth_'))
      .sort()
      .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`);
    return `OAuth ${headerParts.join(', ')}`;
  }

  async post(text: string): Promise<DeployResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Twitter/X not configured - add API credentials in Secrets' };
    }
    try {
      const url = 'https://api.twitter.com/2/tweets';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.getOAuthHeader('POST', url),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (response.ok && data.data?.id) {
        return { success: true, externalId: data.data.id };
      }
      return { success: false, error: JSON.stringify(data) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

export async function postToFacebook(
  pageId: string,
  pageToken: string,
  message: string,
  imageUrl?: string
): Promise<DeployResult> {
  if (!pageId || !pageToken) {
    return { success: false, error: 'Facebook not configured - connect your Page in Marketing Hub' };
  }
  try {
    let url: string;
    let body: any;
    if (imageUrl) {
      url = `https://graph.facebook.com/v21.0/${pageId}/photos`;
      body = { url: imageUrl, message, access_token: pageToken };
    } else {
      url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
      body = { message, access_token: pageToken };
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.id || data.post_id) {
      return { success: true, externalId: data.id || data.post_id };
    }
    return { success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function postToInstagram(
  accountId: string,
  accessToken: string,
  caption: string,
  imageUrl: string
): Promise<DeployResult> {
  if (!accountId || !accessToken) {
    return { success: false, error: 'Instagram not configured - connect your account in Marketing Hub' };
  }
  if (!imageUrl) {
    return { success: false, error: 'Instagram requires an image' };
  }
  try {
    const containerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
      }
    );
    const containerData = await containerResponse.json();
    if (!containerData.id) {
      return { success: false, error: JSON.stringify(containerData) };
    }
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
      }
    );
    const publishData = await publishResponse.json();
    if (publishData.id) {
      return { success: true, externalId: publishData.id };
    }
    return { success: false, error: JSON.stringify(publishData) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export function getConnectorStatus() {
  const twitter = new TwitterConnector();
  return {
    twitter: twitter.isConfigured(),
    facebook: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
    instagram: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
  };
}
