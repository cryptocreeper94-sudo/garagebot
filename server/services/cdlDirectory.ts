import { db } from "@db";
import { cdlPrograms, cdlReferrals, type InsertCdlProgram, type CdlProgram, type InsertCdlReferral } from "@shared/schema";
import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";

export type CDLDirectoryFilters = {
  search?: string;
  category?: string;
  companyType?: string;
  experienceRequired?: string;
  freightType?: string;
  state?: string;
  cdlClass?: string;
  homeTime?: string;
  hasTraining?: boolean;
  isHiring?: boolean;
  limit?: number;
  offset?: number;
};

export type CDLDirectoryStats = {
  totalCompanies: number;
  totalHiring: number;
  categoryCounts: Record<string, number>;
  companyTypeCounts: Record<string, number>;
};

export const CDL_COMPANY_TYPES = [
  { value: "mega_carrier", label: "Mega Carrier", description: "Large national carriers with 5,000+ trucks" },
  { value: "large_carrier", label: "Large Carrier", description: "National carriers with 1,000-5,000 trucks" },
  { value: "regional_carrier", label: "Regional Carrier", description: "Regional operations with dedicated routes" },
  { value: "ltl_carrier", label: "LTL Carrier", description: "Less-than-truckload freight carriers" },
  { value: "specialized", label: "Specialized/Heavy Haul", description: "Oversized, heavy haul, and specialized freight" },
  { value: "flatbed", label: "Flatbed Carrier", description: "Open deck and flatbed operations" },
  { value: "tanker", label: "Tanker Carrier", description: "Liquid and dry bulk hauling" },
  { value: "reefer", label: "Refrigerated Carrier", description: "Temperature-controlled freight" },
  { value: "intermodal", label: "Intermodal", description: "Container and intermodal drayage" },
  { value: "owner_operator", label: "Owner-Operator Leasing", description: "Lease-purchase and owner-operator programs" },
  { value: "cdl_school", label: "CDL Training School", description: "Commercial driving schools and programs" },
  { value: "staffing", label: "Trucking Staffing Agency", description: "Driver staffing and placement services" },
] as const;

export const CDL_FREIGHT_TYPES = [
  "Dry Van", "Flatbed", "Reefer", "Tanker", "LTL", "Intermodal",
  "Hazmat", "Oversized", "Auto Transport", "Dedicated", "OTR",
  "Regional", "Local", "Team", "Expedited", "Moving/Household"
] as const;

export const CDL_EXPERIENCE_LEVELS = [
  { value: "none", label: "No Experience / Student Driver" },
  { value: "recent_grad", label: "Recent CDL Graduate" },
  { value: "6_months", label: "6+ Months Experience" },
  { value: "1_year", label: "1+ Year Experience" },
  { value: "2_years", label: "2+ Years Experience" },
  { value: "5_years", label: "5+ Years Experience" },
] as const;

export const CDL_HOME_TIME = [
  { value: "daily", label: "Home Daily" },
  { value: "weekly", label: "Home Weekly" },
  { value: "biweekly", label: "Home Bi-Weekly" },
  { value: "regional", label: "Regional (Home Most Weekends)" },
  { value: "otr", label: "OTR (Out 2-3 Weeks)" },
] as const;

export class CDLDirectoryService {
  async search(filters: CDLDirectoryFilters): Promise<{ results: CdlProgram[]; total: number }> {
    const conditions = [eq(cdlPrograms.isActive, true)];

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(cdlPrograms.companyName, searchTerm),
          ilike(cdlPrograms.description, searchTerm),
          ilike(cdlPrograms.shortDescription, searchTerm),
          ilike(cdlPrograms.freightTypes, searchTerm),
          ilike(cdlPrograms.tags, searchTerm),
          ilike(cdlPrograms.headquarters, searchTerm),
          ilike(cdlPrograms.location, searchTerm)
        )!
      );
    }

    if (filters.category) {
      conditions.push(eq(cdlPrograms.category, filters.category));
    }

    if (filters.companyType) {
      conditions.push(eq(cdlPrograms.companyType, filters.companyType));
    }

    if (filters.experienceRequired) {
      conditions.push(eq(cdlPrograms.experienceRequired, filters.experienceRequired));
    }

    if (filters.state) {
      conditions.push(
        or(
          eq(cdlPrograms.state, filters.state),
          eq(cdlPrograms.isNationwide, true),
          ilike(cdlPrograms.operatingStates, `%${filters.state}%`)
        )!
      );
    }

    if (filters.cdlClass) {
      conditions.push(eq(cdlPrograms.cdlClassRequired, filters.cdlClass));
    }

    if (filters.homeTime) {
      conditions.push(eq(cdlPrograms.homeTime, filters.homeTime));
    }

    if (filters.freightType) {
      conditions.push(ilike(cdlPrograms.freightTypes, `%${filters.freightType}%`));
    }

    if (filters.hasTraining) {
      conditions.push(eq(cdlPrograms.tuitionReimbursement, true));
    }

    if (filters.isHiring !== undefined) {
      conditions.push(eq(cdlPrograms.isHiring, filters.isHiring));
    }

    const where = and(...conditions);
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const [results, countResult] = await Promise.all([
      db.select().from(cdlPrograms)
        .where(where)
        .orderBy(desc(cdlPrograms.isFeatured), desc(cdlPrograms.isHiring), asc(cdlPrograms.sortOrder), asc(cdlPrograms.companyName))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(cdlPrograms).where(where),
    ]);

    return { results, total: countResult[0]?.count || 0 };
  }

  async getById(id: string): Promise<CdlProgram | null> {
    const [result] = await db.select().from(cdlPrograms).where(eq(cdlPrograms.id, id)).limit(1);
    return result || null;
  }

  async getFeatured(): Promise<CdlProgram[]> {
    return db.select().from(cdlPrograms)
      .where(and(eq(cdlPrograms.isActive, true), eq(cdlPrograms.isFeatured, true)))
      .orderBy(asc(cdlPrograms.sortOrder), asc(cdlPrograms.companyName))
      .limit(12);
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const results = await db.select({
      category: cdlPrograms.companyType,
      count: sql<number>`count(*)::int`,
    }).from(cdlPrograms)
      .where(eq(cdlPrograms.isActive, true))
      .groupBy(cdlPrograms.companyType);
    return results.map((r: { category: string | null; count: number }) => ({ category: r.category || "other", count: r.count }));
  }

  async getStats(): Promise<CDLDirectoryStats> {
    const [totalResult, hiringResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(cdlPrograms).where(eq(cdlPrograms.isActive, true)),
      db.select({ count: sql<number>`count(*)::int` }).from(cdlPrograms).where(and(eq(cdlPrograms.isActive, true), eq(cdlPrograms.isHiring, true))),
    ]);

    const [categoryResults, typeResults] = await Promise.all([
      db.select({ val: cdlPrograms.category, count: sql<number>`count(*)::int` }).from(cdlPrograms).where(eq(cdlPrograms.isActive, true)).groupBy(cdlPrograms.category),
      db.select({ val: cdlPrograms.companyType, count: sql<number>`count(*)::int` }).from(cdlPrograms).where(eq(cdlPrograms.isActive, true)).groupBy(cdlPrograms.companyType),
    ]);

    return {
      totalCompanies: totalResult[0]?.count || 0,
      totalHiring: hiringResult[0]?.count || 0,
      categoryCounts: Object.fromEntries(categoryResults.map((r: { val: string | null; count: number }) => [r.val || "other", r.count])),
      companyTypeCounts: Object.fromEntries(typeResults.map((r: { val: string | null; count: number }) => [r.val || "other", r.count])),
    };
  }

  async submitInterest(data: InsertCdlReferral) {
    const [referral] = await db.insert(cdlReferrals).values(data).returning();
    return referral;
  }

  async getStates(): Promise<string[]> {
    const results = await db.selectDistinct({ state: cdlPrograms.state })
      .from(cdlPrograms)
      .where(and(eq(cdlPrograms.isActive, true), sql`${cdlPrograms.state} IS NOT NULL`))
      .orderBy(asc(cdlPrograms.state));
    return results.map((r: { state: string | null }) => r.state!).filter(Boolean);
  }
}

export const cdlDirectoryService = new CDLDirectoryService();
