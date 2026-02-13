import OpenAI from "openai";
import { communityHubService } from "./community-hub-service";
import { broadcastToChannel } from "./chat-websocket";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const BUDDY_USER_ID = "buddy-ai-bot";
const BUDDY_USERNAME = "Buddy AI";
const SUPPORT_CHANNEL_NAME = "garagebot-support";

const BUDDY_SYSTEM_PROMPT = `You are Buddy, the friendly and knowledgeable AI support assistant for GarageBot - a parts aggregator platform for ALL motorized vehicles and equipment. You help users with:

1. Finding parts across 68+ retailers
2. Vehicle management and VIN decoding  
3. DIY repair guides and maintenance tips
4. Account and subscription questions (Free, Pro Founders Circle)
5. Genesis Hallmark NFT system
6. Mechanics Garage shop management features
7. Break Room Hub tools (mileage tracker, receipt scanner, etc.)

Guidelines:
- Be helpful, concise, and friendly. Use a warm but professional tone.
- If you can answer the question confidently, do so directly.
- If the question requires accessing the user's account, specific order details, or involves billing/refund issues, tell them you'll escalate to a human team member.
- If you're unsure about something, be honest and offer to escalate.
- Keep responses under 200 words unless more detail is genuinely needed.
- Don't make up specific part numbers, prices, or availability - suggest using the search feature.
- For urgent safety concerns (recalls, brake issues, etc.), always suggest professional inspection.`;

let buddyBotApiKey: string | null = null;
let supportChannelId: string | null = null;

export async function initBuddyBot() {
  try {
    const communities = await communityHubService.getCommunities();
    const garageBotCommunity = communities.find(c => c.name === "GarageBot");
    if (!garageBotCommunity) {
      console.log("[BuddyBot] GarageBot community not found, skipping bot init");
      return;
    }

    const channels = await communityHubService.getChannels(garageBotCommunity.id);
    const supportChannel = channels.find(c => c.name === SUPPORT_CHANNEL_NAME);
    if (supportChannel) {
      supportChannelId = supportChannel.id;
    }

    const bots = await communityHubService.getBots(garageBotCommunity.id);
    let buddyBot = bots.find(b => b.name === BUDDY_USERNAME);
    
    if (!buddyBot) {
      buddyBot = await communityHubService.createBot(
        garageBotCommunity.id,
        BUDDY_USERNAME,
        "GarageBot's AI support assistant - here to help with parts, vehicles, and repairs!"
      );
      console.log("[BuddyBot] Created Buddy AI bot");
    }

    buddyBotApiKey = buddyBot.apiKey;
    console.log("[BuddyBot] Buddy AI bot initialized for support channel");
  } catch (err) {
    console.error("[BuddyBot] Init error:", err);
  }
}

export async function handleSupportMessage(channelId: string, userId: string, username: string, content: string): Promise<boolean> {
  if (channelId !== supportChannelId) return false;
  if (userId === BUDDY_USER_ID) return false;

  try {
    const shouldEscalate = needsHumanEscalation(content);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BUDDY_SYSTEM_PROMPT },
        { role: "user", content: `User "${username}" asks: ${content}` },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I'm having trouble processing that right now. Let me get a team member to help you.";

    const botMessage = await communityHubService.sendMessage({
      channelId,
      userId: BUDDY_USER_ID,
      username: BUDDY_USERNAME,
      content: shouldEscalate 
        ? `${reply}\n\n🔔 *I've flagged this for our support team. A human will follow up shortly.*`
        : reply,
      isBot: true,
      replyToId: null,
    });

    broadcastToChannel(channelId, {
      type: "new_message",
      message: {
        ...botMessage,
        reactions: [],
        attachment: null,
      },
    });

    return true;
  } catch (err) {
    console.error("[BuddyBot] Response error:", err);
    
    const fallbackMessage = await communityHubService.sendMessage({
      channelId,
      userId: BUDDY_USER_ID,
      username: BUDDY_USERNAME,
      content: "I'm experiencing a temporary issue. A team member will be notified to assist you. 🔧",
      isBot: true,
      replyToId: null,
    });

    broadcastToChannel(channelId, {
      type: "new_message",
      message: {
        ...fallbackMessage,
        reactions: [],
        attachment: null,
      },
    });

    return true;
  }
}

function needsHumanEscalation(content: string): boolean {
  const escalationKeywords = [
    "refund", "billing", "charge", "payment issue", "cancel subscription",
    "account locked", "can't login", "hacked", "security",
    "speak to human", "talk to someone", "real person", "agent",
    "complaint", "lawyer", "legal", "sue",
    "urgent", "emergency",
  ];
  
  const lowerContent = content.toLowerCase();
  return escalationKeywords.some(keyword => lowerContent.includes(keyword));
}

export function getSupportChannelId() {
  return supportChannelId;
}
