const TRUST_LAYER_BASE_URL = process.env.TRUST_LAYER_URL || 'https://tlid.io';
const APP_DOMAIN = process.env.TRUST_LAYER_ENTRY_POINT || 'garagebot.io';

interface TrustLayerUser {
  trustLayerId: string;
  memberNumber?: string;
  email?: string;
  displayName?: string;
}

interface MembershipStatus {
  trustLayerId: string;
  status: 'active' | 'inactive' | 'pending';
  tier?: string;
  expiresAt?: string;
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
  private entryPoint: string;

  constructor() {
    this.baseUrl = TRUST_LAYER_BASE_URL;
    this.entryPoint = APP_DOMAIN;
    console.log(`[TrustLayer] Client initialized for ${this.entryPoint} → ${this.baseUrl}`);
  }

  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any,
    firebaseToken?: string
  ): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-entry-point': this.entryPoint,
      };

      if (firebaseToken) {
        headers['Authorization'] = `Bearer ${firebaseToken}`;
      }

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

  async syncFirebaseUser(firebaseToken: string): Promise<TrustLayerUser | null> {
    console.log('[TrustLayer] Syncing Firebase user...');
    return this.request<TrustLayerUser>(
      '/api/auth/firebase-sync',
      'POST',
      {},
      firebaseToken
    );
  }

  async registerUser(email: string, password: string, displayName?: string): Promise<TrustLayerUser | null> {
    console.log('[TrustLayer] Registering new user...');
    return this.request<TrustLayerUser>(
      '/api/auth/register',
      'POST',
      { email, password, displayName }
    );
  }

  async loginUser(email: string, password: string): Promise<TrustLayerUser | null> {
    console.log('[TrustLayer] Logging in user...');
    return this.request<TrustLayerUser>(
      '/api/auth/login',
      'POST',
      { email, password }
    );
  }

  async getMembership(firebaseToken: string): Promise<MembershipStatus | null> {
    console.log('[TrustLayer] Checking membership status...');
    return this.request<MembershipStatus>(
      '/api/user/membership',
      'GET',
      undefined,
      firebaseToken
    );
  }

  async resolveDomain(subdomain: string): Promise<DomainResolution | null> {
    console.log(`[TrustLayer] Resolving domain: ${subdomain}.tlid`);
    return this.request<DomainResolution>(
      `/api/domains/resolve/${encodeURIComponent(subdomain)}`,
      'GET'
    );
  }

  async checkDomainAvailability(name: string): Promise<DomainAvailability | null> {
    console.log(`[TrustLayer] Checking domain availability: ${name}`);
    return this.request<DomainAvailability>(
      `/api/domains/check/${encodeURIComponent(name)}`,
      'GET'
    );
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getEntryPoint(): string {
    return this.entryPoint;
  }
}

export const trustLayerClient = new TrustLayerClient();
