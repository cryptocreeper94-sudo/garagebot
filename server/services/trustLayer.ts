const TRUST_LAYER_BASE_URL = process.env.TRUST_LAYER_URL || 'https://tlid.io';
const APP_NAME = process.env.TRUST_LAYER_ENTRY_POINT || 'GarageBot';

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

export class TrustLayerClient {
  private baseUrl: string;
  private appName: string;
  private connectionInfo: EcosystemConnection | null = null;

  constructor() {
    this.baseUrl = TRUST_LAYER_BASE_URL;
    this.appName = APP_NAME;
    console.log(`[TrustLayer] Client initialized: ${this.appName} → ${this.baseUrl}`);
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
