// QuickBooks Online Integration Service
// Requires: QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET secrets
// OAuth flow connects individual shops to their QuickBooks accounts

import crypto from 'crypto';

interface QuickBooksTokens {
  accessToken: string;
  refreshToken: string;
  realmId: string;
  expiresAt: Date;
}

interface QuickBooksCustomer {
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

interface QuickBooksInvoice {
  CustomerRef: { value: string };
  Line: Array<{
    DetailType: string;
    Amount: number;
    SalesItemLineDetail?: {
      ItemRef: { value: string; name: string };
      Qty?: number;
      UnitPrice?: number;
    };
    Description?: string;
  }>;
  DueDate?: string;
  DocNumber?: string;
}

const QUICKBOOKS_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QUICKBOOKS_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QUICKBOOKS_API_BASE = 'https://quickbooks.api.intuit.com/v3/company';
const QUICKBOOKS_SANDBOX_API = 'https://sandbox-quickbooks.api.intuit.com/v3/company';

class QuickBooksService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private useSandbox: boolean;

  constructor() {
    this.clientId = process.env.QUICKBOOKS_CLIENT_ID || '';
    this.clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/api/quickbooks/callback`;
    this.useSandbox = process.env.NODE_ENV !== 'production';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  getApiBase(): string {
    return this.useSandbox ? QUICKBOOKS_SANDBOX_API : QUICKBOOKS_API_BASE;
  }

  generateAuthUrl(shopId: string): string {
    if (!this.isConfigured()) {
      throw new Error('QuickBooks not configured. Add QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET.');
    }

    const state = crypto.randomBytes(16).toString('hex') + ':' + shopId;
    const scopes = 'com.intuit.quickbooks.accounting openid profile email';

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: state
    });

    return `${QUICKBOOKS_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<QuickBooksTokens> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(QUICKBOOKS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[QuickBooks] Token exchange failed:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      realmId: '', // Will be set from callback params
      expiresAt: new Date(Date.now() + (data.expires_in * 1000))
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<QuickBooksTokens> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(QUICKBOOKS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[QuickBooks] Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      realmId: '',
      expiresAt: new Date(Date.now() + (data.expires_in * 1000))
    };
  }

  async makeApiCall(accessToken: string, realmId: string, endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.getApiBase()}/${realmId}/${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[QuickBooks] API call failed: ${endpoint}`, error);
      throw new Error(`QuickBooks API error: ${response.status}`);
    }

    return response.json();
  }

  async getCompanyInfo(accessToken: string, realmId: string): Promise<any> {
    const result = await this.makeApiCall(accessToken, realmId, `companyinfo/${realmId}`);
    return result.CompanyInfo;
  }

  async createCustomer(accessToken: string, realmId: string, customer: QuickBooksCustomer): Promise<any> {
    const result = await this.makeApiCall(accessToken, realmId, 'customer', 'POST', customer);
    return result.Customer;
  }

  async findCustomerByEmail(accessToken: string, realmId: string, email: string): Promise<any | null> {
    const query = encodeURIComponent(`SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email}'`);
    const result = await this.makeApiCall(accessToken, realmId, `query?query=${query}`);
    
    if (result.QueryResponse?.Customer?.length > 0) {
      return result.QueryResponse.Customer[0];
    }
    return null;
  }

  async createInvoice(accessToken: string, realmId: string, invoice: QuickBooksInvoice): Promise<any> {
    const result = await this.makeApiCall(accessToken, realmId, 'invoice', 'POST', invoice);
    return result.Invoice;
  }

  async findOrCreateCustomer(accessToken: string, realmId: string, customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }): Promise<any> {
    if (customerData.email) {
      const existing = await this.findCustomerByEmail(accessToken, realmId, customerData.email);
      if (existing) {
        return existing;
      }
    }

    const customer: QuickBooksCustomer = {
      DisplayName: customerData.name,
      ...(customerData.email && { PrimaryEmailAddr: { Address: customerData.email } }),
      ...(customerData.phone && { PrimaryPhone: { FreeFormNumber: customerData.phone } }),
      ...(customerData.address && {
        BillAddr: {
          Line1: customerData.address,
          City: customerData.city,
          CountrySubDivisionCode: customerData.state,
          PostalCode: customerData.zip
        }
      })
    };

    return this.createCustomer(accessToken, realmId, customer);
  }

  async syncRepairOrderToInvoice(
    accessToken: string,
    realmId: string,
    repairOrder: {
      orderNumber: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        type: 'labor' | 'parts';
      }>;
      dueDate?: Date;
    }
  ): Promise<any> {
    const customer = await this.findOrCreateCustomer(accessToken, realmId, {
      name: repairOrder.customerName,
      email: repairOrder.customerEmail,
      phone: repairOrder.customerPhone
    });

    const invoiceLines = repairOrder.lineItems.map((item, index) => ({
      Id: String(index + 1),
      LineNum: index + 1,
      DetailType: 'SalesItemLineDetail',
      Amount: item.quantity * item.unitPrice,
      Description: item.description,
      SalesItemLineDetail: {
        ItemRef: {
          value: '1',
          name: item.type === 'labor' ? 'Labor' : 'Parts'
        },
        Qty: item.quantity,
        UnitPrice: item.unitPrice
      }
    }));

    const invoice: QuickBooksInvoice = {
      CustomerRef: { value: customer.Id },
      Line: invoiceLines,
      DocNumber: repairOrder.orderNumber,
      ...(repairOrder.dueDate && { DueDate: repairOrder.dueDate.toISOString().split('T')[0] })
    };

    return this.createInvoice(accessToken, realmId, invoice);
  }
}

export const quickbooksService = new QuickBooksService();
export default quickbooksService;
