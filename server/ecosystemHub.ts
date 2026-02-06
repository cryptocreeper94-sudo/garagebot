interface EcosystemConfig {
  hubUrl: string;
  apiKey: string;
  apiSecret: string;
  appName: string;
}

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

interface ContractorData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalPaid?: number;
  status?: string;
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

interface Payment1099 {
  payeeId: string;
  payeeName: string;
  amount: number;
  date: string;
  description?: string;
}

interface PayrollW2 {
  workerId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  federalWithholding: number;
  stateWithholding: number;
  socialSecurity: number;
  medicare: number;
  otherDeductions?: number;
  netPay: number;
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

interface CodeSnippet {
  name: string;
  code: string;
  language: string;
  category: string;
  description?: string;
  tags?: string[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
  userId?: string;
  appName: string;
}

export class EcosystemClient {
  private hubUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private appName: string;

  constructor(config: EcosystemConfig) {
    let url = config.hubUrl.replace(/\/$/, "");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    this.hubUrl = url;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.appName = config.appName;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown
  ): Promise<T> {
    const bodyStr = body ? JSON.stringify(body) : undefined;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      "X-API-Secret": this.apiSecret,
      "X-App-Name": this.appName,
    };

    const response = await fetch(`${this.hubUrl}${endpoint}`, {
      method,
      headers,
      body: method !== "GET" ? bodyStr : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async checkConnection(): Promise<{ connected: boolean; hubName?: string; appName?: string; permissions?: string[]; lastSync?: string | null; error?: string }> {
    try {
      const result = await this.request<{ connected: boolean; hubName: string; appName: string; permissions: string[]; lastSync: string | null }>("/api/ecosystem/status");
      return {
        connected: result.connected,
        hubName: result.hubName,
        appName: result.appName,
        permissions: result.permissions,
        lastSync: result.lastSync,
      };
    } catch (error) {
      console.log("[devhub] Connection error:", String(error));
      return { connected: false, error: String(error) };
    }
  }

  async pushSnippet(snippet: CodeSnippet): Promise<{ id: string; created: boolean }> {
    return this.request("/api/ecosystem/snippets", "POST", {
      ...snippet,
      sourceApp: this.appName,
    });
  }

  async getSnippets(category?: string): Promise<CodeSnippet[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.request(`/api/ecosystem/snippets${query}`);
  }

  async syncWorkers(workers: WorkerData[]): Promise<{ synced: number; errors: string[] }> {
    return this.request("/api/ecosystem/sync/workers", "POST", { workers });
  }

  async syncContractors(contractors: ContractorData[]): Promise<{ synced: number; errors: string[] }> {
    return this.request("/api/ecosystem/sync/contractors", "POST", { contractors });
  }

  async syncTimesheets(timesheets: TimesheetData[]): Promise<{ synced: number; totalHours: number }> {
    return this.request("/api/ecosystem/sync/timesheets", "POST", { timesheets });
  }

  async syncCertifications(certifications: CertificationData[]): Promise<{ synced: number; expiringSoon: number }> {
    return this.request("/api/ecosystem/sync/certifications", "POST", { certifications });
  }

  async sync1099Payments(year: number, payments: Payment1099[]): Promise<{ synced: number; totalAmount: number }> {
    return this.request("/api/ecosystem/sync/1099", "POST", { year, payments });
  }

  async syncW2Payroll(year: number, employees: PayrollW2[]): Promise<{ synced: number; totalGross: number }> {
    return this.request("/api/ecosystem/sync/w2", "POST", { year, employees });
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return this.request(`/api/ecosystem/logs?limit=${limit}`);
  }

  async logActivity(action: string, details: Record<string, unknown>): Promise<{ logged: boolean }> {
    return this.request("/api/ecosystem/logs", "POST", {
      action,
      details,
      appName: this.appName,
      timestamp: new Date().toISOString(),
    });
  }

  async getWorkersByShop(shopId: string): Promise<WorkerData[]> {
    return this.request(`/api/ecosystem/shops/${shopId}/workers`);
  }

  async getShopPayrollSummary(shopId: string, limit: number = 50): Promise<{
    success: boolean;
    shopId: string;
    recordCount: number;
    totalPaid: number;
    totalGross: number;
    records: any[];
  }> {
    return this.request(`/api/ecosystem/shops/${shopId}/payroll?limit=${limit}`);
  }
}

export function createDevHubClient(): EcosystemClient | null {
  const hubUrl = process.env.DEV_HUB_URL || process.env.ORBIT_HUB_URL || "https://orbitstaffing.replit.app";
  const apiKey = process.env.ORBIT_ECOSYSTEM_API_KEY;
  const apiSecret = process.env.ORBIT_ECOSYSTEM_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.log("[devhub] DarkWave Developer Hub not configured - skipping initialization");
    return null;
  }

  console.log(`[devhub] DarkWave Developer Hub initialized for ${hubUrl}`);
  return new EcosystemClient({
    hubUrl,
    apiKey,
    apiSecret,
    appName: "GarageBot",
  });
}
