import crypto from 'crypto';

const ORBIT_HUB_URL = (process.env.ORBIT_HUB_URL || 'https://orbitstaffing.replit.app').replace(/\/$/, '');
const ORBIT_API_KEY = process.env.ORBIT_ECOSYSTEM_API_KEY;
const ORBIT_API_SECRET = process.env.ORBIT_ECOSYSTEM_API_SECRET;
const GARAGEBOT_WEBHOOK_SECRET = process.env.GARAGEBOT_WEBHOOK_SECRET;

interface WorkerData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: string;
  payRate?: number;
  workState?: string;
  certifications?: string[];
}

interface TimesheetData {
  id: string;
  workerId: string;
  date: string;
  hoursWorked: number;
  overtimeHours?: number;
  jobId?: string;
  status: string;
}

interface ContractorData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalPaid?: number;
  status?: string;
}

interface CertificationData {
  id: string;
  workerId: string;
  name: string;
  issuedBy?: string;
  issueDate?: string;
  expirationDate?: string;
  status: string;
}

interface Payment1099 {
  payeeId: string;
  payeeName: string;
  amount: number;
  date: string;
  description?: string;
}

interface OvertimeRequest {
  dailyHours: number[] | { date: string; hoursWorked: number; dayOfWeek: number }[];
  hourlyRate: number;
  state: string;
}

interface OvertimeResult {
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  regularPay: number;
  overtimePay: number;
  doubleTimePay: number;
  totalPay: number;
  ruleApplied: string;
  breakdown: any[];
}

interface OrbitStatusResponse {
  connected: boolean;
  hubName: string;
  appName: string;
  permissions: string[];
  lastSync: string | null;
}

interface OrbitResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

interface ShopPayrollResponse {
  success: boolean;
  shopId: string;
  recordCount: number;
  totalPaid: number;
  totalGross: number;
  records: any[];
}

interface ShopWorkersResponse {
  success: boolean;
  shopId: string;
  workerCount: number;
  workers: any[];
}

export class OrbitEcosystemClient {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(ORBIT_API_KEY && ORBIT_API_SECRET);
    if (!this.isConfigured) {
      console.log('[ORBIT] Client not fully configured - missing ORBIT_ECOSYSTEM_API_KEY or ORBIT_ECOSYSTEM_API_SECRET');
    }
  }

  private async request<T>(endpoint: string, method: string, body?: any): Promise<T | null> {
    if (!this.isConfigured) {
      console.log(`[ORBIT Stub] Would call ${method} ${endpoint}`);
      return null;
    }

    try {
      const url = endpoint.startsWith('/api/')
        ? `${ORBIT_HUB_URL}${endpoint}`
        : `${ORBIT_HUB_URL}/api/ecosystem${endpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Key': ORBIT_API_KEY!,
        'X-API-Secret': ORBIT_API_SECRET!,
        'X-App-Name': 'GarageBot',
      };

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ORBIT] API error ${response.status}: ${errorText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('[ORBIT] Request failed:', error);
      return null;
    }
  }

  private async publicRequest<T>(endpoint: string, method: string, body?: any): Promise<T | null> {
    try {
      const response = await fetch(`${ORBIT_HUB_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ORBIT] Public API error ${response.status}: ${errorText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('[ORBIT] Public request failed:', error);
      return null;
    }
  }

  async checkStatus(): Promise<OrbitStatusResponse | null> {
    console.log('[ORBIT] Checking connection status...');
    return this.request<OrbitStatusResponse>('/status', 'GET');
  }

  async syncWorkers(workers: WorkerData[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${workers.length} worker(s)`);
    return this.request('/sync/workers', 'POST', { workers });
  }

  async syncContractors(contractors: ContractorData[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${contractors.length} contractor(s)`);
    return this.request('/sync/contractors', 'POST', { contractors });
  }

  async syncTimesheets(timesheets: TimesheetData[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${timesheets.length} timesheet(s)`);
    return this.request('/sync/timesheets', 'POST', { timesheets });
  }

  async syncCertifications(certifications: CertificationData[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${certifications.length} certification(s)`);
    return this.request('/sync/certifications', 'POST', { certifications });
  }

  async sync1099Payments(year: number, payments: Payment1099[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${payments.length} 1099 payment(s) for year ${year}`);
    return this.request('/sync/1099', 'POST', { year, payments });
  }

  async syncW2Data(year: number, employees: { id: string; name: string }[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${employees.length} W-2 employee(s) for year ${year}`);
    return this.request('/sync/w2', 'POST', { year, employees });
  }

  async getShopWorkers(shopId: string): Promise<ShopWorkersResponse | null> {
    console.log(`[ORBIT] Getting workers for shop ${shopId}`);
    return this.request(`/shops/${shopId}/workers`, 'GET');
  }

  async getShopPayroll(shopId: string, limit: number = 50): Promise<ShopPayrollResponse | null> {
    console.log(`[ORBIT] Getting payroll for shop ${shopId}`);
    return this.request(`/shops/${shopId}/payroll?limit=${limit}`, 'GET');
  }

  async logActivity(action: string, details?: Record<string, any>): Promise<OrbitResponse | null> {
    return this.request('/logs', 'POST', { action, details });
  }

  async getActivityLogs(limit: number = 50): Promise<any[] | null> {
    return this.request(`/logs?limit=${limit}`, 'GET');
  }

  async pushSnippet(snippet: { name: string; code: string; language: string; category: string; description?: string; tags?: string[] }): Promise<OrbitResponse | null> {
    return this.request('/snippets', 'POST', { ...snippet, sourceApp: 'GarageBot' });
  }

  async getSnippets(category?: string): Promise<any[] | null> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/snippets${query}`, 'GET');
  }

  async calculateOvertime(overtimeReq: OvertimeRequest): Promise<OvertimeResult | null> {
    console.log(`[ORBIT] Calculating overtime for state: ${overtimeReq.state}`);
    return this.publicRequest<OvertimeResult>('/api/payroll/overtime/calculate', 'POST', overtimeReq);
  }

  async getOvertimeRules(state?: string): Promise<any | null> {
    const endpoint = state
      ? `/api/payroll/overtime/rules/${state.toUpperCase()}`
      : '/api/payroll/overtime/rules';
    return this.publicRequest(endpoint, 'GET');
  }

  async getPayrollEngineStatus(): Promise<any | null> {
    return this.publicRequest('/api/payroll/engine/status', 'GET');
  }

  async reportFinancialEvent(event: {
    eventType: 'revenue' | 'expense' | 'payout';
    grossAmount: number;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<OrbitResponse | null> {
    if (!this.isConfigured) {
      console.log(`[ORBIT Stub] Would report ${event.eventType}: $${event.grossAmount}`);
      return null;
    }

    try {
      const bodyPayload = JSON.stringify({
        sourceSystem: 'garagebot',
        sourceAppId: 'dw_app_garagebot',
        ...event,
      });

      const signature = crypto
        .createHmac('sha256', ORBIT_API_SECRET!)
        .update(bodyPayload)
        .digest('hex');

      const response = await fetch(`${ORBIT_HUB_URL}/api/financial-hub/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Orbit-Api-Key': ORBIT_API_KEY!,
          'X-Orbit-Signature': signature,
        },
        body: bodyPayload,
      });

      if (!response.ok) {
        console.error(`[ORBIT] Financial event error: ${response.status}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('[ORBIT] Financial event failed:', error);
      return null;
    }
  }

  async syncWorker(worker: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
    payRate?: number;
    workState?: string;
  }): Promise<OrbitResponse | null> {
    const nameParts = worker.name.split(' ');
    const firstName = nameParts[0] || worker.name;
    const lastName = nameParts.slice(1).join(' ') || '';
    return this.syncWorkers([{
      id: worker.id,
      firstName,
      lastName,
      email: worker.email,
      phone: worker.phone,
      status: 'active',
      payRate: worker.payRate,
      workState: worker.workState,
      certifications: worker.skills,
    }]);
  }

  async reportSubscriptionRevenue(
    customerId: string,
    amount: number,
    plan: string
  ): Promise<OrbitResponse | null> {
    return this.reportFinancialEvent({
      eventType: 'revenue',
      grossAmount: amount,
      description: `GarageBot ${plan} subscription`,
      metadata: { customerId, plan },
    });
  }

  async reportJobCompletion(job: {
    id: string;
    mechanicId: string;
    completedAt: string;
    laborHours: number;
    serviceType: string;
    notes?: string;
  }): Promise<OrbitResponse | null> {
    return this.syncTimesheets([{
      id: job.id,
      workerId: job.mechanicId,
      date: job.completedAt,
      hoursWorked: job.laborHours,
      overtimeHours: 0,
      jobId: job.id,
      status: 'approved',
    }]);
  }

  getWebhookSecret(): string {
    return GARAGEBOT_WEBHOOK_SECRET || '';
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!GARAGEBOT_WEBHOOK_SECRET || !signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', GARAGEBOT_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    if (signature.length !== expectedSignature.length) return false;
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }
}

export const orbitClient = new OrbitEcosystemClient();
