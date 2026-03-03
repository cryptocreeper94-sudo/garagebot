import { createHash, randomBytes } from "crypto";
import { db } from "@db";
import { hallmarks, hallmarkCounter, trustStamps } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const APP_PREFIX = "GB";
const APP_NAME = "GarageBot";
const APP_DOMAIN = "garagebot.tlid.io";

export async function getNextSequence(): Promise<number> {
  const result = await db
    .insert(hallmarkCounter)
    .values({ id: "gb-master", currentSequence: "1" })
    .onConflictDoUpdate({
      target: hallmarkCounter.id,
      set: {
        currentSequence: sql`(CAST(${hallmarkCounter.currentSequence} AS INTEGER) + 1)::TEXT`,
      },
    })
    .returning();

  return parseInt(result[0].currentSequence, 10);
}

export function formatHallmarkId(sequence: number): string {
  return `${APP_PREFIX}-${sequence.toString().padStart(8, "0")}`;
}

export function computeDataHash(payload: Record<string, unknown>): string {
  const jsonString = JSON.stringify(payload);
  return createHash("sha256").update(jsonString).digest("hex");
}

function simulateTxHash(): string {
  return "0x" + randomBytes(32).toString("hex");
}

function simulateBlockHeight(): string {
  return (1000000 + Math.floor(Math.random() * 9000000)).toString();
}

export interface GenerateHallmarkOptions {
  userId?: string | null;
  vehicleId?: string | null;
  appId: string;
  productName: string;
  releaseType: string;
  metadata?: Record<string, unknown>;
}

export async function generateHallmark(opts: GenerateHallmarkOptions) {
  const sequence = await getNextSequence();
  const thId = formatHallmarkId(sequence);
  const timestamp = new Date().toISOString();

  const hashPayload = {
    thId,
    userId: opts.userId || null,
    appId: opts.appId,
    appName: APP_NAME,
    productName: opts.productName,
    releaseType: opts.releaseType,
    timestamp,
    ...(opts.metadata || {}),
  };

  const dataHash = computeDataHash(hashPayload);
  const txHash = simulateTxHash();
  const blockHeight = simulateBlockHeight();
  const verificationUrl = `https://${APP_DOMAIN}/api/hallmark/${thId}/verify`;

  const [hallmark] = await db
    .insert(hallmarks)
    .values({
      userId: opts.userId || undefined,
      vehicleId: opts.vehicleId || undefined,
      thId,
      appId: opts.appId,
      appName: APP_NAME,
      productName: opts.productName,
      releaseType: opts.releaseType,
      hallmarkId: sequence,
      assetNumber: sequence,
      tokenId: thId,
      dataHash,
      txHash,
      transactionHash: txHash,
      blockHeight,
      verificationUrl,
      metadata: opts.metadata || {},
      isGenesis: opts.releaseType === "genesis",
    })
    .returning();

  return hallmark;
}

export async function createTrustStamp(
  userId: string | null,
  category: string,
  data: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const payload = {
    category,
    data: {
      ...data,
      appContext: "garagebot",
      timestamp,
    },
  };

  const dataHash = computeDataHash(payload);
  const txHash = simulateTxHash();
  const blockHeight = simulateBlockHeight();

  const [stamp] = await db
    .insert(trustStamps)
    .values({
      userId,
      category,
      data: { ...data, appContext: "garagebot", timestamp },
      dataHash,
      txHash,
      blockHeight,
    })
    .returning();

  return stamp;
}

export async function seedGenesisHallmark() {
  const genesisId = `${APP_PREFIX}-00000001`;

  const [existing] = await db
    .select()
    .from(hallmarks)
    .where(eq(hallmarks.thId, genesisId))
    .limit(1);

  if (existing) {
    console.log(`[Hallmark] Genesis hallmark ${genesisId} already exists.`);
    return existing;
  }

  await db
    .insert(hallmarkCounter)
    .values({ id: "gb-master", currentSequence: "0" })
    .onConflictDoUpdate({
      target: hallmarkCounter.id,
      set: { currentSequence: "0" },
    });

  console.log(`[Hallmark] Creating genesis hallmark ${genesisId}...`);

  const genesis = await generateHallmark({
    userId: null,
    appId: "garagebot-genesis",
    productName: "Genesis Block",
    releaseType: "genesis",
    metadata: {
      ecosystem: "Trust Layer",
      version: "1.0.0",
      domain: APP_DOMAIN,
      operator: "DarkWave Studios LLC",
      chain: "Trust Layer Blockchain",
      consensus: "Proof of Trust",
      launchDate: "2026-08-23T00:00:00.000Z",
      nativeAsset: "SIG",
      utilityToken: "Shells",
      parentApp: "Trust Layer Hub",
      parentGenesis: "TH-00000001",
    },
  });

  console.log(`[Hallmark] Genesis hallmark ${genesisId} created with hash ${genesis.dataHash}`);
  return genesis;
}

export async function verifyHallmark(thId: string) {
  const [hallmark] = await db
    .select()
    .from(hallmarks)
    .where(eq(hallmarks.thId, thId))
    .limit(1);

  if (!hallmark) {
    return { verified: false, error: "Hallmark not found" };
  }

  return {
    verified: true,
    hallmark: {
      thId: hallmark.thId,
      appName: hallmark.appName || APP_NAME,
      productName: hallmark.productName,
      releaseType: hallmark.releaseType,
      dataHash: hallmark.dataHash,
      txHash: hallmark.txHash,
      blockHeight: hallmark.blockHeight,
      createdAt: hallmark.createdAt || hallmark.mintedAt,
      metadata: hallmark.metadata,
    },
  };
}

export async function getGenesisHallmark() {
  const genesisId = `${APP_PREFIX}-00000001`;
  const [genesis] = await db
    .select()
    .from(hallmarks)
    .where(eq(hallmarks.thId, genesisId))
    .limit(1);

  return genesis || null;
}

export function generateUniqueHash(): string {
  return randomBytes(12).toString("hex");
}

export const AFFILIATE_TIERS = {
  base: { minReferrals: 0, rate: 0.1, label: "Base" },
  silver: { minReferrals: 5, rate: 0.125, label: "Silver" },
  gold: { minReferrals: 15, rate: 0.15, label: "Gold" },
  platinum: { minReferrals: 30, rate: 0.175, label: "Platinum" },
  diamond: { minReferrals: 50, rate: 0.2, label: "Diamond" },
} as const;

export function computeAffiliateTier(convertedCount: number): keyof typeof AFFILIATE_TIERS {
  if (convertedCount >= 50) return "diamond";
  if (convertedCount >= 30) return "platinum";
  if (convertedCount >= 15) return "gold";
  if (convertedCount >= 5) return "silver";
  return "base";
}
