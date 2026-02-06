import crypto from 'crypto';

export interface IntegrationConfig {
  name: string;
  displayName: string;
  category: 'accounting' | 'payroll' | 'scheduling' | 'crm' | 'parts' | 'communication';
  authUrl: string;
  tokenUrl: string;
  apiBase: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  sandboxApiBase?: string;
  description: string;
  features: string[];
}

const INTEGRATIONS: Record<string, IntegrationConfig> = {
  quickbooks: {
    name: 'quickbooks',
    displayName: 'QuickBooks Online',
    category: 'accounting',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    apiBase: 'https://quickbooks.api.intuit.com/v3/company',
    sandboxApiBase: 'https://sandbox-quickbooks.api.intuit.com/v3/company',
    scopes: ['com.intuit.quickbooks.accounting', 'openid', 'profile', 'email'],
    clientIdEnv: 'QUICKBOOKS_CLIENT_ID',
    clientSecretEnv: 'QUICKBOOKS_CLIENT_SECRET',
    description: 'Sync invoices, payments, and financial reports automatically',
    features: ['Invoice sync', 'Payment tracking', 'Financial reports', 'Customer management'],
  },
  freshbooks: {
    name: 'freshbooks',
    displayName: 'FreshBooks',
    category: 'accounting',
    authUrl: 'https://auth.freshbooks.com/oauth/authorize',
    tokenUrl: 'https://api.freshbooks.com/auth/oauth/token',
    apiBase: 'https://api.freshbooks.com',
    scopes: ['user:profile:read', 'user:invoices:read', 'user:invoices:write', 'user:clients:read', 'user:clients:write', 'user:expenses:read', 'user:expenses:write'],
    clientIdEnv: 'FRESHBOOKS_CLIENT_ID',
    clientSecretEnv: 'FRESHBOOKS_CLIENT_SECRET',
    description: 'Time tracking, invoicing, and expense management',
    features: ['Time tracking', 'Invoicing', 'Expense management', 'Client portal'],
  },
  xero: {
    name: 'xero',
    displayName: 'Xero',
    category: 'accounting',
    authUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    apiBase: 'https://api.xero.com/api.xro/2.0',
    scopes: ['openid', 'profile', 'email', 'accounting.transactions', 'accounting.contacts', 'accounting.settings'],
    clientIdEnv: 'XERO_CLIENT_ID',
    clientSecretEnv: 'XERO_CLIENT_SECRET',
    description: 'Cloud accounting with powerful reporting',
    features: ['Bank reconciliation', 'Invoicing', 'Expense claims', 'Financial reporting'],
  },
  sage: {
    name: 'sage',
    displayName: 'Sage Business Cloud',
    category: 'accounting',
    authUrl: 'https://www.sageone.com/oauth2/auth/central',
    tokenUrl: 'https://oauth.accounting.sage.com/token',
    apiBase: 'https://api.accounting.sage.com/v3.1',
    scopes: ['full_access'],
    clientIdEnv: 'SAGE_CLIENT_ID',
    clientSecretEnv: 'SAGE_CLIENT_SECRET',
    description: 'Complete business management and accounting',
    features: ['Invoicing', 'Cash flow management', 'Tax compliance', 'Inventory tracking'],
  },
  wave: {
    name: 'wave',
    displayName: 'Wave Accounting',
    category: 'accounting',
    authUrl: 'https://api.waveapps.com/oauth2/authorize',
    tokenUrl: 'https://api.waveapps.com/oauth2/token',
    apiBase: 'https://gql.waveapps.com/graphql/public',
    scopes: ['account:read', 'account:write', 'invoice:read', 'invoice:write'],
    clientIdEnv: 'WAVE_CLIENT_ID',
    clientSecretEnv: 'WAVE_CLIENT_SECRET',
    description: 'Free invoicing and accounting for small businesses',
    features: ['Free invoicing', 'Receipt scanning', 'Financial reports', 'Payroll add-on'],
  },
  ukg: {
    name: 'ukg',
    displayName: 'UKG Pro',
    category: 'payroll',
    authUrl: 'https://login.ultipro.com/connect/authorize',
    tokenUrl: 'https://login.ultipro.com/connect/token',
    apiBase: 'https://service5.ultipro.com/api',
    scopes: ['openid', 'profile', 'employee-api'],
    clientIdEnv: 'UKG_CLIENT_ID',
    clientSecretEnv: 'UKG_CLIENT_SECRET',
    description: 'HR, payroll, talent management in one platform',
    features: ['Payroll processing', 'Benefits admin', 'Time & attendance', 'Talent management'],
  },
  adp: {
    name: 'adp',
    displayName: 'ADP Workforce Now',
    category: 'payroll',
    authUrl: 'https://accounts.adp.com/auth/oauth/v2/authorize',
    tokenUrl: 'https://accounts.adp.com/auth/oauth/v2/token',
    apiBase: 'https://api.adp.com',
    scopes: ['openid', 'profile', 'api'],
    clientIdEnv: 'ADP_CLIENT_ID',
    clientSecretEnv: 'ADP_CLIENT_SECRET',
    description: 'Payroll, HR, and workforce management',
    features: ['Payroll processing', 'Tax filing', 'Benefits admin', 'Time tracking'],
  },
  gusto: {
    name: 'gusto',
    displayName: 'Gusto',
    category: 'payroll',
    authUrl: 'https://api.gusto.com/oauth/authorize',
    tokenUrl: 'https://api.gusto.com/oauth/token',
    apiBase: 'https://api.gusto.com/v1',
    scopes: ['payrolls:read', 'payrolls:write', 'employees:read', 'employees:write', 'company:read'],
    clientIdEnv: 'GUSTO_CLIENT_ID',
    clientSecretEnv: 'GUSTO_CLIENT_SECRET',
    description: 'Modern payroll and benefits for small business',
    features: ['Full-service payroll', 'Health insurance', 'Workers comp', 'HR tools'],
  },
  paychex: {
    name: 'paychex',
    displayName: 'Paychex Flex',
    category: 'payroll',
    authUrl: 'https://api.paychex.com/auth/oauth/v2/authorize',
    tokenUrl: 'https://api.paychex.com/auth/oauth/v2/token',
    apiBase: 'https://api.paychex.com',
    scopes: ['openid', 'profile'],
    clientIdEnv: 'PAYCHEX_CLIENT_ID',
    clientSecretEnv: 'PAYCHEX_CLIENT_SECRET',
    description: 'Payroll, HR, and benefits administration',
    features: ['Payroll processing', '401(k) admin', 'Insurance', 'HR services'],
  },
  google_calendar: {
    name: 'google_calendar',
    displayName: 'Google Calendar',
    category: 'scheduling',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiBase: 'https://www.googleapis.com/calendar/v3',
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    description: 'Sync appointments with your Google account',
    features: ['Appointment sync', 'Availability management', 'Customer reminders', 'Team scheduling'],
  },
  twilio: {
    name: 'twilio',
    displayName: 'Twilio',
    category: 'communication',
    authUrl: '',
    tokenUrl: '',
    apiBase: 'https://api.twilio.com/2010-04-01',
    scopes: [],
    clientIdEnv: 'TWILIO_ACCOUNT_SID',
    clientSecretEnv: 'TWILIO_AUTH_TOKEN',
    description: 'SMS notifications and customer messaging',
    features: ['SMS reminders', 'Appointment confirmations', 'Marketing messages', 'Two-way messaging'],
  },
  mailchimp: {
    name: 'mailchimp',
    displayName: 'Mailchimp',
    category: 'communication',
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
    apiBase: 'https://server.api.mailchimp.com/3.0',
    scopes: [],
    clientIdEnv: 'MAILCHIMP_CLIENT_ID',
    clientSecretEnv: 'MAILCHIMP_CLIENT_SECRET',
    description: 'Email marketing and customer outreach',
    features: ['Email campaigns', 'Audience management', 'Automations', 'Analytics'],
  },
  partstech: {
    name: 'partstech',
    displayName: 'PartsTech',
    category: 'parts',
    authUrl: '',
    tokenUrl: '',
    apiBase: 'https://api.partstech.com/v1',
    scopes: [],
    clientIdEnv: 'PARTSTECH_API_KEY',
    clientSecretEnv: 'PARTSTECH_API_SECRET',
    description: 'Search and order from 20+ parts suppliers',
    features: ['Multi-supplier search', 'Real-time pricing', 'VIN lookup', 'Order management'],
  },
  nexpart: {
    name: 'nexpart',
    displayName: 'Nexpart',
    category: 'parts',
    authUrl: '',
    tokenUrl: '',
    apiBase: 'https://api.nexpart.com',
    scopes: [],
    clientIdEnv: 'NEXPART_API_KEY',
    clientSecretEnv: 'NEXPART_API_SECRET',
    description: 'Catalog data and electronic ordering',
    features: ['Electronic catalog', 'Parts ordering', 'Inventory sync', 'Price updates'],
  },
};

class BusinessIntegrationService {
  private getRedirectUri(service: string): string {
    const base = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    return `${base}/api/integrations/${service}/callback`;
  }

  getIntegration(service: string): IntegrationConfig | undefined {
    return INTEGRATIONS[service];
  }

  getAllIntegrations(): IntegrationConfig[] {
    return Object.values(INTEGRATIONS);
  }

  getIntegrationsByCategory(category: string): IntegrationConfig[] {
    return Object.values(INTEGRATIONS).filter(i => i.category === category);
  }

  isConfigured(service: string): boolean {
    const config = INTEGRATIONS[service];
    if (!config) return false;
    return !!(process.env[config.clientIdEnv] && process.env[config.clientSecretEnv]);
  }

  generateAuthUrl(service: string, shopId: string): string {
    const config = INTEGRATIONS[service];
    if (!config) throw new Error(`Unknown integration: ${service}`);
    if (!config.authUrl) throw new Error(`${config.displayName} uses API key auth, not OAuth`);

    const clientId = process.env[config.clientIdEnv];
    if (!clientId) throw new Error(`${config.displayName} not configured. Add ${config.clientIdEnv} to secrets.`);

    const state = crypto.randomBytes(16).toString('hex') + ':' + shopId + ':' + service;

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: this.getRedirectUri(service),
      state: state,
    });

    if (config.scopes.length > 0) {
      params.set('scope', config.scopes.join(' '));
    }

    if (service === 'google_calendar') {
      params.set('access_type', 'offline');
      params.set('prompt', 'consent');
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(service: string, code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    realmId?: string;
  }> {
    const config = INTEGRATIONS[service];
    if (!config) throw new Error(`Unknown integration: ${service}`);

    const clientId = process.env[config.clientIdEnv] || '';
    const clientSecret = process.env[config.clientSecretEnv] || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };

    if (['quickbooks', 'freshbooks'].includes(service)) {
      headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }

    const body: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.getRedirectUri(service),
    };

    if (!['quickbooks', 'freshbooks'].includes(service)) {
      body.client_id = clientId;
      body.client_secret = clientSecret;
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[${config.displayName}] Token exchange failed:`, error);
      throw new Error(`Failed to exchange code for ${config.displayName} tokens`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresIn: data.expires_in || 3600,
    };
  }

  async refreshAccessToken(service: string, refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const config = INTEGRATIONS[service];
    if (!config) throw new Error(`Unknown integration: ${service}`);

    const clientId = process.env[config.clientIdEnv] || '';
    const clientSecret = process.env[config.clientSecretEnv] || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };

    if (['quickbooks', 'freshbooks'].includes(service)) {
      headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }

    const body: Record<string, string> = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    if (!['quickbooks', 'freshbooks'].includes(service)) {
      body.client_id = clientId;
      body.client_secret = clientSecret;
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[${config.displayName}] Token refresh failed:`, error);
      throw new Error(`Failed to refresh ${config.displayName} token`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 3600,
    };
  }

  getConnectionStatus(service: string): { configured: boolean; authType: 'oauth' | 'apikey' } {
    const config = INTEGRATIONS[service];
    if (!config) return { configured: false, authType: 'oauth' };

    const isOAuth = !!config.authUrl;
    return {
      configured: this.isConfigured(service),
      authType: isOAuth ? 'oauth' : 'apikey',
    };
  }
}

export const businessIntegrationService = new BusinessIntegrationService();
export { INTEGRATIONS };
export default businessIntegrationService;
