import { db } from "@db";
import { chatChannels, chatUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, generateTrustLayerId } from "./trustlayer-sso";

const ECOSYSTEM_CHANNELS = [
  { name: "general", description: "General discussion for the DarkWave ecosystem", category: "ecosystem", isDefault: true },
  { name: "announcements", description: "Official announcements from DarkWave Studios", category: "ecosystem", isDefault: true },
];

const APP_SUPPORT_CHANNELS = [
  { name: "darkwavestudios-support", description: "Support for DarkWave Studios", category: "app-support", isDefault: false },
  { name: "garagebot-support", description: "Support for GarageBot", category: "app-support", isDefault: false },
  { name: "tlid-marketing", description: "Trust Layer ID Marketing", category: "app-support", isDefault: false },
  { name: "guardian-ai", description: "Guardian AI Support", category: "app-support", isDefault: false },
];

export async function seedChatChannels(): Promise<void> {
  const allChannels = [...ECOSYSTEM_CHANNELS, ...APP_SUPPORT_CHANNELS];

  for (const channel of allChannels) {
    const existing = await db.select().from(chatChannels)
      .where(eq(chatChannels.name, channel.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(chatChannels).values(channel);
      console.log(`[SeedChat] Created channel: #${channel.name}`);
    }
  }

  const botExists = await db.select().from(chatUsers)
    .where(eq(chatUsers.username, "buddy-bot"))
    .limit(1);

  if (botExists.length === 0) {
    const botHash = await hashPassword("BuddyBot!System2024");
    await db.insert(chatUsers).values({
      username: "buddy-bot",
      email: "buddy@garagebot.io",
      passwordHash: botHash,
      displayName: "Buddy AI",
      avatarColor: "#06b6d4",
      role: "bot",
      trustLayerId: generateTrustLayerId(),
      isOnline: true,
    });
    console.log("[SeedChat] Created Buddy AI bot user");
  }

  console.log("[SeedChat] Chat seeding complete");
}
