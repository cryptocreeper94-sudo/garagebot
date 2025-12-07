import crypto from "crypto";

interface EcosystemConfig {
  hubUrl: string;
  apiKey: string;
  apiSecret: string;
  appName: string;
}

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "active" | "inactive" | "terminated";
  employeeType: "w2" | "1099";
  hireDate?: string;
  terminationDate?: string;
  hourlyRate?: number;
  salary?: number;
  department?: string;
  position?: string;
}

interface Contractor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  taxId?: string;
  status: "active" | "inactive";
  contractStart?: string;
  contractEnd?: string;
  hourlyRate?: number;
}

interface Timesheet {
  id: string;
  workerId: string;
  date: string;
  hoursWorked: number;
  overtime?: number;
  notes?: string;
  approved?: boolean;
  approvedBy?: string;
}

interface Payment1099 {
  contractorId: string;
  amount: number;
  date: string;
  description?: string;
  invoiceNumber?: string;
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

interface Certification {
  id: string;
  workerId: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  certificationNumber?: string;
  verified?: boolean;
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
    this.hubUrl = config.hubUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.appName = config.appName;
  }

  private generateSignature(bodyStr: string, timestamp: string): string {
    const message = `${bodyStr}${timestamp}`;
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(message)
      .digest("hex");
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown
  ): Promise<T> {
    const timestamp = Date.now().toString();
    const bodyStr = body ? JSON.stringify(body) : "";
    const signature = this.generateSignature(bodyStr, timestamp);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Api-Key": this.apiKey,
      "X-Api-Secret": this.apiSecret,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
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

  async checkConnection(): Promise<{ connected: boolean; hubVersion?: string; appRegistered?: boolean }> {
    try {
      const result = await this.request<{ version: string; registered: boolean }>("/api/ecosystem/status");
      return { connected: true, hubVersion: result.version, appRegistered: result.registered };
    } catch (error) {
      return { connected: false };
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

  async syncWorkers(workers: Worker[]): Promise<{ synced: number; errors: string[] }> {
    return this.request("/api/ecosystem/sync/workers", "POST", { workers });
  }

  async syncContractors(contractors: Contractor[]): Promise<{ synced: number; errors: string[] }> {
    return this.request("/api/ecosystem/sync/contractors", "POST", { contractors });
  }

  async sync1099Data(year: number, contractors: Payment1099[]): Promise<{ synced: number; totalAmount: number }> {
    return this.request("/api/ecosystem/sync/1099", "POST", { year, contractors });
  }

  async syncW2Payroll(year: number, employees: PayrollW2[]): Promise<{ synced: number; totalGross: number }> {
    return this.request("/api/ecosystem/sync/w2", "POST", { year, employees });
  }

  async syncTimesheets(timesheets: Timesheet[]): Promise<{ synced: number; totalHours: number }> {
    return this.request("/api/ecosystem/sync/timesheets", "POST", { timesheets });
  }

  async syncCertifications(certifications: Certification[]): Promise<{ synced: number; expiringSoon: number }> {
    return this.request("/api/ecosystem/sync/certifications", "POST", { certifications });
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

  async getWorkersByShop(shopId: string): Promise<Worker[]> {
    return this.request(`/api/ecosystem/shops/${shopId}/workers`);
  }

  async getShopPayrollSummary(shopId: string, year: number, month: number): Promise<{
    totalW2Gross: number;
    total1099Payments: number;
    employeeCount: number;
    contractorCount: number;
  }> {
    return this.request(`/api/ecosystem/shops/${shopId}/payroll?year=${year}&month=${month}`);
  }
}

export function createDevHubClient(): EcosystemClient | null {
  const hubUrl = process.env.DEV_HUB_URL || process.env.ORBIT_ECOSYSTEM_URL || "https://darkwavestudios.io";
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
