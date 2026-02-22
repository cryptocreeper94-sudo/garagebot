import { db } from "@db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as authService from "../services/auth";

const ECOSYSTEM_MEMBERS = [
  { firstName: "Kathy", lastName: "Nguyen", email: "kathy@happyeats.io", username: "kathy_he",
    password: "HappyEats@2025", pin: "7724", trustLayerId: "tl-kathy-he01", ecosystemApp: "Happy Eats" },
  { firstName: "Marcus", lastName: "Chen", email: "marcus@trusthome.io", username: "marcus_th",
    password: "TrustHome@2025", pin: "4419", trustLayerId: "tl-marc-th01", ecosystemApp: "TrustHome" },
  { firstName: "Devon", lastName: "Park", email: "devon@signal.dw", username: "devon_sg",
    password: "Signal@2025", pin: "8832", trustLayerId: "tl-devn-sg01", ecosystemApp: "Signal" },
];

export async function seedEcosystemMembers() {
  for (const m of ECOSYSTEM_MEMBERS) {
    const [existing] = await db.select().from(users).where(eq(users.trustLayerId, m.trustLayerId));
    if (existing) continue;

    const [byEmail] = await db.select().from(users).where(eq(users.email, m.email));
    if (byEmail) continue;

    const passwordHash = authService.hashPassword(m.password);
    const pinHash = authService.hashPassword(m.pin);

    await db.insert(users).values({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      username: m.username,
      passwordHash,
      trustLayerId: m.trustLayerId,
      ecosystemPinHash: pinHash,
      ecosystemApp: m.ecosystemApp,
    });
    console.log(`[Ecosystem Seed] Created ${m.firstName} ${m.lastName} (${m.ecosystemApp})`);
  }
}
