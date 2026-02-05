import crypto from 'crypto';

const TRUST_LAYER_BASE_URL = process.env.TRUST_LAYER_URL || 'https://dwtl.io';
const APP_NAME = process.env.TRUST_LAYER_ENTRY_POINT || 'GarageBot';
const SSO_API_KEY = process.env.TRUST_LAYER_SSO_API_KEY || '';
const SSO_API_SECRET = process.env.TRUST_LAYER_SSO_API_SECRET || '';

interface EcosystemConnection {
  app: {
    id: string;
    name: string;
    slug: string;
  };
  endpoints: Record<string, string>;
  headers: Record<string, string>;
  sites: Array<{ name: string; url: string }>;
}

interface EcosystemStatus {
  connected: boolean;
  appName: string;
  timestamp: string;
}

interface DomainResolution {
  target: string;
  subdomain: string;
}

interface DomainAvailability {
  name: string;
  available: boolean;
  suggestedAlternatives?: string[];
}

interface SSOUser {
  id: string;
  name: string;
  email: string;
  memberTier?: string;
  membershipCard?: string;
  ecosystemApps?: string[];
  createdAt?: string;
  lastLogin?: string;
}

interface SSOVerifyResponse {
  success: boolean;
  user?: SSOUser;
  error?: string;
}

export class TrustLayerClient {
  private baseUrl: string;
  private appName: string;
  private apiKey: string;
  private apiSecret: string;
  private connectionInfo: EcosystemConnection | null = null;

  constructor() {
    this.baseUrl = TRUST_LAYER_BASE_URL;
    this.appName = APP_NAME;
    this.apiKey = SSO_API_KEY;
    this.apiSecret = SSO_API_SECRET;
    console.log(`[TrustLayer] Client initialized: ${this.appName} → ${this.baseUrl}`);
    if (this.apiKey) {
      console.log(`[TrustLayer] SSO configured with API key: ${this.apiKey.substring(0, 10)}...`);
    }
  }

  private generateSignature(data: string): { signature: string; timestamp: string } {
    const timestamp = Date.now().toString();
    const signatureData = data + timestamp;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(signatureData)
      .digest('hex');
    return { signature, timestamp };
  }

  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-App-Name': this.appName,
        ...additionalHeaders,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TrustLayer] API error ${response.status}: ${errorText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('[TrustLayer] Request failed:', error);
      return null;
    }
  }

  // SSO Methods
  
  getLoginUrl(callbackUrl: string, state?: string): string {
    const csrfState = state || crypto.randomBytes(16).toString('hex');
    const params = new URLSearchParams({
      app: 'garagebot',
      redirect: callbackUrl,
      state: csrfState,
    });
    return `${this.baseUrl}/api/auth/sso/login?${params.toString()}`;
  }

  async verifySSOToken(token: string): Promise<SSOVerifyResponse> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('[TrustLayer] SSO not configured - missing API key or secret');
      return { success: false, error: 'SSO not configured' };
    }

    try {
      const { signature, timestamp } = this.generateSignature(token);
      
      const response = await fetch(`${this.baseUrl}/api/auth/sso/verify?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'x-app-key': this.apiKey,
          'x-app-signature': signature,
          'x-app-timestamp': timestamp,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TrustLayer] SSO verify failed: ${response.status} - ${errorText}`);
        return { success: false, error: errorText };
      }

      const data = await response.json();
      console.log('[TrustLayer] SSO token verified successfully');
      return data;
    } catch (error) {
      console.error('[TrustLayer] SSO verify error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  async getSSOUser(userId: string): Promise<SSOUser | null> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('[TrustLayer] SSO not configured - missing API key or secret');
      return null;
    }

    try {
      const { signature, timestamp } = this.generateSignature(userId);
      
      const response = await fetch(`${this.baseUrl}/api/auth/sso/user/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'x-app-key': this.apiKey,
          'x-app-signature': signature,
          'x-app-timestamp': timestamp,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TrustLayer] SSO user lookup failed: ${response.status} - ${errorText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('[TrustLayer] SSO user lookup error:', error);
      return null;
    }
  }

  isSSOConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  // Existing ecosystem methods

  async getConnection(): Promise<EcosystemConnection | null> {
    console.log('[TrustLayer] Fetching ecosystem connection info...');
    const result = await this.request<EcosystemConnection>('/api/ecosystem/connection');
    if (result) {
      this.connectionInfo = result;
    }
    return result;
  }

  async checkStatus(): Promise<EcosystemStatus | null> {
    console.log('[TrustLayer] Checking ecosystem status...');
    return this.request<EcosystemStatus>('/api/ecosystem/status');
  }

  async resolveDomain(subdomain: string): Promise<DomainResolution | null> {
    console.log(`[TrustLayer] Resolving domain: ${subdomain}.tlid`);
    return this.request<DomainResolution>(
      `/api/domains/resolve/${encodeURIComponent(subdomain)}`
    );
  }

  async checkDomainAvailability(name: string): Promise<DomainAvailability | null> {
    console.log(`[TrustLayer] Checking domain availability: ${name}`);
    return this.request<DomainAvailability>(
      `/api/domains/check/${encodeURIComponent(name)}`
    );
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAppName(): string {
    return this.appName;
  }

  getCachedConnection(): EcosystemConnection | null {
    return this.connectionInfo;
  }
}

export const trustLayerClient = new TrustLayerClient();
