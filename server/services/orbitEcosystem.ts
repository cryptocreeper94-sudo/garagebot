import crypto from 'crypto';

const ORBIT_HUB_URL = process.env.ORBIT_HUB_URL || 'https://orbitstaffing.io';
const ORBIT_API_KEY = process.env.ORBIT_ECOSYSTEM_API_KEY;
const ORBIT_API_SECRET = process.env.ORBIT_ECOSYSTEM_API_SECRET;
const ORBIT_FINANCIAL_HUB_KEY = process.env.ORBIT_FINANCIAL_HUB_KEY;

interface ContractorData {
  externalId: string;
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  status: 'active' | 'inactive';
}

interface TimesheetData {
  externalId: string;
  workerId: string;
  date: string;
  hoursWorked: number;
  jobType?: string;
  notes?: string;
}

interface Payment1099Data {
  contractorId: string;
  contractorName: string;
  totalPaid: number;
  taxWithheld?: number;
}

interface FinancialEvent {
  eventType: 'revenue' | 'expense' | 'payout';
  grossAmount: number;
  description: string;
  metadata?: Record<string, any>;
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
      const response = await fetch(`${ORBIT_HUB_URL}/api/ecosystem${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ORBIT_API_KEY!,
          'X-API-Secret': ORBIT_API_SECRET!,
        },
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

  async syncContractors(contractors: ContractorData[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${contractors.length} contractor(s)`);
    return this.request('/sync/contractors', 'POST', { contractors });
  }

  async syncTimesheets(timesheets: TimesheetData[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${timesheets.length} timesheet(s)`);
    return this.request('/sync/timesheets', 'POST', { timesheets });
  }

  async sync1099Payments(year: number, payments: Payment1099Data[]): Promise<OrbitResponse | null> {
    console.log(`[ORBIT] Syncing ${payments.length} 1099 payment(s) for year ${year}`);
    return this.request('/sync/1099', 'POST', { year, payments });
  }

  async reportFinancialEvent(event: FinancialEvent): Promise<OrbitResponse | null> {
    if (!this.isConfigured) {
      console.log(`[ORBIT Stub] Would report ${event.eventType}: $${event.grossAmount}`);
      return null;
    }

    const financialHubKey = ORBIT_FINANCIAL_HUB_KEY || ORBIT_API_KEY;

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
          'X-Orbit-Api-Key': financialHubKey!,
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

  async logActivity(action: string, details?: Record<string, any>): Promise<OrbitResponse | null> {
    return this.request('/logs', 'POST', { action, details });
  }

  async checkStatus(): Promise<OrbitStatusResponse | null> {
    console.log('[ORBIT] Checking connection status...');
    return this.request<OrbitStatusResponse>('/status', 'GET');
  }

  async pollForUpdates(since?: string): Promise<OrbitResponse | null> {
    const query = since ? `?since=${encodeURIComponent(since)}` : '';
    console.log(`[ORBIT] Polling for updates${since ? ` since ${since}` : ''}...`);
    return this.request(`/logs${query}`, 'GET');
  }

  async syncWorker(worker: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
  }): Promise<OrbitResponse | null> {
    return this.syncContractors([{
      externalId: worker.id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      skills: worker.skills,
      status: 'active',
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
      externalId: job.id,
      workerId: job.mechanicId,
      date: job.completedAt,
      hoursWorked: job.laborHours,
      jobType: job.serviceType,
      notes: job.notes,
    }]);
  }
}

export const orbitClient = new OrbitEcosystemClient();
