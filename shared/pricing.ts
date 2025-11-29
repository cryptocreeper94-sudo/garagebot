export const PRICING = {
  edition: "launch" as "launch" | "standard",
  
  pro: {
    launch: {
      monthly: 4.99,
      annual: 39.99,
    },
    standard: {
      monthly: 9.99,
      annual: 79.99,
    },
  },
  
  hallmark: {
    launch: {
      free: 9.99,
      pro: 1.99,
    },
    standard: {
      free: 14.99,
      pro: 2.99,
    },
  },
  
  mechanics: {
    launch: {
      monthly: 29.99,
      annual: 249.99,
    },
    standard: {
      monthly: 49.99,
      annual: 399.99,
    },
  },
} as const;

export function getProPrice(period: "monthly" | "annual"): number {
  return PRICING.pro[PRICING.edition][period];
}

export function getHallmarkPrice(isPro: boolean): number {
  return isPro 
    ? PRICING.hallmark[PRICING.edition].pro 
    : PRICING.hallmark[PRICING.edition].free;
}

export function getMechanicsPrice(period: "monthly" | "annual"): number {
  return PRICING.mechanics[PRICING.edition][period];
}

export function getHallmarkSavings(): { amount: number; percent: number } {
  const freePrice = PRICING.hallmark[PRICING.edition].free;
  const proPrice = PRICING.hallmark[PRICING.edition].pro;
  const amount = freePrice - proPrice;
  const percent = Math.round((amount / freePrice) * 100);
  return { amount, percent };
}

export function getAnnualSavings(): number {
  const monthly = PRICING.pro[PRICING.edition].monthly;
  const annual = PRICING.pro[PRICING.edition].annual;
  return Math.round((monthly * 12 - annual) / (monthly * 12) * 100);
}

export const TIER_LIMITS = {
  free: {
    maxVehicles: 1,
    maxFamilyMembers: 1,
    hallmarkPrice: PRICING.hallmark[PRICING.edition].free,
    features: [
      "Parts search across 40+ retailers",
      "Price comparison",
      "All deals",
      "1 vehicle in garage",
      "VIN decoding",
      "All DIY guides with YouTube",
      "Basic Buddy chat",
      "Full checkout",
    ],
  },
  pro: {
    maxVehicles: Infinity,
    maxFamilyMembers: 10,
    hallmarkPrice: PRICING.hallmark[PRICING.edition].pro,
    features: [
      "Everything in Free",
      "Unlimited vehicles",
      "Genesis Hallmark at 80% off",
      "Saved DIY progress",
      "Price drop alerts",
      "Advanced Buddy AI",
      "Extended recall monitoring",
      "Family sharing (10 people)",
      "Exclusive deals",
    ],
  },
  mechanics: {
    maxVehicles: Infinity,
    maxFamilyMembers: Infinity,
    maxStaff: 25,
    features: [
      "Everything in Pro",
      "Full shop management portal",
      "Customer & vehicle CRM",
      "Service records & reminders",
      "Staff accounts (up to 25)",
      "Messaging templates",
      "Bulk Hallmark issuance",
      "Affiliate revenue analytics",
    ],
  },
} as const;

export type SubscriptionTier = "free" | "pro" | "mechanics";
