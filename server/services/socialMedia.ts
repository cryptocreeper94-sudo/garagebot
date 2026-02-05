import crypto from "crypto";

export interface PostResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
  url?: string;
}

export interface PostContent {
  text: string;
  imageUrl?: string;
  hashtags?: string[];
}

export class TwitterService {
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string;
  private accessTokenSecret: string;
  private configured: boolean;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';
    this.configured = !!(this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret: string
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(tokenSecret)}`;
    
    return crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');
  }

  private generateOAuthHeader(method: string, url: string): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
    };

    const signature = this.generateOAuthSignature(method, url, oauthParams, this.accessTokenSecret);
    oauthParams.oauth_signature = signature;

    const headerParts = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return `OAuth ${headerParts}`;
  }

  async post(content: PostContent): Promise<PostResult> {
    if (!this.configured) {
      return {
        success: false,
        platform: 'x',
        error: 'Twitter API not configured. Add TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET to secrets.',
      };
    }

    try {
      const tweetText = content.hashtags?.length
        ? `${content.text}\n\n${content.hashtags.map(h => `#${h}`).join(' ')}`
        : content.text;

      const url = 'https://api.twitter.com/2/tweets';
      const authHeader = this.generateOAuthHeader('POST', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweetText.slice(0, 280) }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Twitter API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'x',
        postId: data.data?.id,
        url: `https://x.com/i/status/${data.data?.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'x',
        error: error.message,
      };
    }
  }
}

export class FacebookService {
  private pageAccessToken: string;
  private pageId: string;
  private configured: boolean;

  constructor() {
    this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
    this.pageId = process.env.FACEBOOK_PAGE_ID || '';
    this.configured = !!(this.pageAccessToken && this.pageId);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async post(content: PostContent): Promise<PostResult> {
    if (!this.configured) {
      return {
        success: false,
        platform: 'facebook',
        error: 'Facebook API not configured. Add FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID to secrets.',
      };
    }

    try {
      const message = content.hashtags?.length
        ? `${content.text}\n\n${content.hashtags.map(h => `#${h}`).join(' ')}`
        : content.text;

      const url = `https://graph.facebook.com/v18.0/${this.pageId}/feed`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          access_token: this.pageAccessToken,
          ...(content.imageUrl && { link: content.imageUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API error: ${errorData.error?.message || response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'facebook',
        postId: data.id,
        url: `https://facebook.com/${data.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'facebook',
        error: error.message,
      };
    }
  }
}

export class InstagramService {
  private accessToken: string;
  private userId: string;
  private configured: boolean;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    this.userId = process.env.INSTAGRAM_USER_ID || '';
    this.configured = !!(this.accessToken && this.userId);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async post(content: PostContent): Promise<PostResult> {
    if (!this.configured) {
      return {
        success: false,
        platform: 'instagram',
        error: 'Instagram API not configured. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to secrets.',
      };
    }

    if (!content.imageUrl) {
      return {
        success: false,
        platform: 'instagram',
        error: 'Instagram requires an image URL for posts.',
      };
    }

    try {
      const caption = content.hashtags?.length
        ? `${content.text}\n\n${content.hashtags.map(h => `#${h}`).join(' ')}`
        : content.text;

      const containerUrl = `https://graph.facebook.com/v18.0/${this.userId}/media`;
      const containerResponse = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: content.imageUrl,
          caption: caption.slice(0, 2200),
          access_token: this.accessToken,
        }),
      });

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json();
        throw new Error(`Instagram container error: ${errorData.error?.message || containerResponse.status}`);
      }

      const containerData = await containerResponse.json();
      const containerId = containerData.id;

      const publishUrl = `https://graph.facebook.com/v18.0/${this.userId}/media_publish`;
      const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken,
        }),
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`Instagram publish error: ${errorData.error?.message || publishResponse.status}`);
      }

      const publishData = await publishResponse.json();
      return {
        success: true,
        platform: 'instagram',
        postId: publishData.id,
        url: `https://instagram.com/p/${publishData.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'instagram',
        error: error.message,
      };
    }
  }
}

export class LinkedInService {
  private accessToken: string;
  private organizationId: string;
  private configured: boolean;

  constructor() {
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || '';
    this.organizationId = process.env.LINKEDIN_ORGANIZATION_ID || '';
    this.configured = !!(this.accessToken && this.organizationId);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async post(content: PostContent): Promise<PostResult> {
    if (!this.configured) {
      return {
        success: false,
        platform: 'linkedin',
        error: 'LinkedIn API not configured. Add LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORGANIZATION_ID to secrets.',
      };
    }

    try {
      const text = content.hashtags?.length
        ? `${content.text}\n\n${content.hashtags.map(h => `#${h}`).join(' ')}`
        : content.text;

      const url = 'https://api.linkedin.com/v2/ugcPosts';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:organization:${this.organizationId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: text.slice(0, 3000) },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`LinkedIn API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'linkedin',
        postId: data.id,
        url: `https://linkedin.com/feed/update/${data.id}`,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'linkedin',
        error: error.message,
      };
    }
  }
}

export class GoogleBusinessService {
  private accessToken: string;
  private locationId: string;
  private configured: boolean;

  constructor() {
    this.accessToken = process.env.GOOGLE_BUSINESS_ACCESS_TOKEN || '';
    this.locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID || '';
    this.configured = !!(this.accessToken && this.locationId);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async post(content: PostContent): Promise<PostResult> {
    if (!this.configured) {
      return {
        success: false,
        platform: 'google',
        error: 'Google Business API not configured. Add GOOGLE_BUSINESS_ACCESS_TOKEN and GOOGLE_BUSINESS_LOCATION_ID to secrets.',
      };
    }

    try {
      const text = content.hashtags?.length
        ? `${content.text}\n\n${content.hashtags.map(h => `#${h}`).join(' ')}`
        : content.text;

      const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${this.locationId}/localPosts`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          languageCode: 'en-US',
          topicType: 'STANDARD',
          summary: text.slice(0, 1500),
          ...(content.imageUrl && {
            media: [{
              mediaFormat: 'PHOTO',
              sourceUrl: content.imageUrl,
            }],
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Google Business API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'google',
        postId: data.name,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'google',
        error: error.message,
      };
    }
  }
}

export class NextdoorService {
  private apiKey: string;
  private agencyId: string;
  private configured: boolean;

  constructor() {
    this.apiKey = process.env.NEXTDOOR_API_KEY || '';
    this.agencyId = process.env.NEXTDOOR_AGENCY_ID || '';
    this.configured = !!(this.apiKey && this.agencyId);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async post(content: PostContent): Promise<PostResult> {
    if (!this.configured) {
      return {
        success: false,
        platform: 'nextdoor',
        error: 'Nextdoor API not configured. Add NEXTDOOR_API_KEY and NEXTDOOR_AGENCY_ID to secrets.',
      };
    }

    try {
      const text = content.hashtags?.length
        ? `${content.text}\n\n${content.hashtags.map(h => `#${h}`).join(' ')}`
        : content.text;

      const url = `https://api.nextdoor.com/v1/agency/${this.agencyId}/posts`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: text.slice(0, 2000),
          ...(content.imageUrl && { image_url: content.imageUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Nextdoor API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'nextdoor',
        postId: data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        platform: 'nextdoor',
        error: error.message,
      };
    }
  }
}

export class SocialMediaManager {
  private twitter: TwitterService;
  private facebook: FacebookService;
  private instagram: InstagramService;
  private linkedin: LinkedInService;
  private googleBusiness: GoogleBusinessService;
  private nextdoor: NextdoorService;

  constructor() {
    this.twitter = new TwitterService();
    this.facebook = new FacebookService();
    this.instagram = new InstagramService();
    this.linkedin = new LinkedInService();
    this.googleBusiness = new GoogleBusinessService();
    this.nextdoor = new NextdoorService();
  }

  getStatus() {
    return {
      twitter: this.twitter.isConfigured(),
      facebook: this.facebook.isConfigured(),
      instagram: this.instagram.isConfigured(),
      linkedin: this.linkedin.isConfigured(),
      google: this.googleBusiness.isConfigured(),
      nextdoor: this.nextdoor.isConfigured(),
    };
  }

  async postToAll(content: PostContent, platforms?: string[]): Promise<PostResult[]> {
    const targetPlatforms = platforms || ['x', 'facebook', 'instagram', 'linkedin', 'google', 'nextdoor'];
    const results: PostResult[] = [];

    const postPromises = targetPlatforms.map(async (platform) => {
      switch (platform) {
        case 'x':
        case 'twitter':
          return this.twitter.post(content);
        case 'facebook':
          return this.facebook.post(content);
        case 'instagram':
          return this.instagram.post(content);
        case 'linkedin':
          return this.linkedin.post(content);
        case 'google':
          return this.googleBusiness.post(content);
        case 'nextdoor':
          return this.nextdoor.post(content);
        default:
          return {
            success: false,
            platform,
            error: `Unknown platform: ${platform}`,
          };
      }
    });

    const promiseResults = await Promise.allSettled(postPromises);
    
    for (const result of promiseResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          platform: 'unknown',
          error: result.reason?.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  async postTo(platform: string, content: PostContent): Promise<PostResult> {
    switch (platform) {
      case 'x':
      case 'twitter':
        return this.twitter.post(content);
      case 'facebook':
        return this.facebook.post(content);
      case 'instagram':
        return this.instagram.post(content);
      case 'linkedin':
        return this.linkedin.post(content);
      case 'google':
        return this.googleBusiness.post(content);
      case 'nextdoor':
        return this.nextdoor.post(content);
      default:
        return {
          success: false,
          platform,
          error: `Unknown platform: ${platform}`,
        };
    }
  }
}

export const socialMediaManager = new SocialMediaManager();
