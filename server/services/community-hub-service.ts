import { db } from "@db";
import { eq, desc, and, sql, like, or, asc } from "drizzle-orm";
import {
  communities,
  communityChannels,
  communityMembers,
  communityMessages,
  communityBots,
  messageReactions,
  messageAttachments,
  dmConversations,
  directMessages,
  communityPolls,
  pollVotes,
  pinnedMessages,
  type InsertCommunity,
  type InsertChannel,
  type InsertCommunityMessage,
  type InsertDirectMessage,
} from "@shared/schema";
import crypto from "crypto";

class CommunityHubService {
  async createCommunity(data: InsertCommunity) {
    const [community] = await db.insert(communities).values(data).returning();

    await db.insert(communityChannels).values([
      { communityId: community.id, name: "general", type: "chat", position: 0 },
      { communityId: community.id, name: "announcements", type: "announcement", position: 1, isLocked: true },
    ]);

    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: data.ownerId,
      username: data.ownerId,
      role: "owner",
    });

    await db.update(communities)
      .set({ memberCount: 1 })
      .where(eq(communities.id, community.id));

    return community;
  }

  async getCommunities() {
    return db.select().from(communities).where(eq(communities.isPublic, true)).orderBy(desc(communities.createdAt));
  }

  async getCommunity(id: string) {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community || null;
  }

  async getUserCommunities(userId: string) {
    const memberships = await db.select().from(communityMembers).where(eq(communityMembers.userId, userId));
    if (memberships.length === 0) return [];

    const communityIds = memberships.map((m) => m.communityId);
    const results = await db.select().from(communities).where(
      or(...communityIds.map((cid) => eq(communities.id, cid)))
    );
    return results;
  }

  async getChannels(communityId: string) {
    return db.select().from(communityChannels)
      .where(eq(communityChannels.communityId, communityId))
      .orderBy(asc(communityChannels.position));
  }

  async createChannel(data: InsertChannel) {
    const [channel] = await db.insert(communityChannels).values(data).returning();
    return channel;
  }

  async joinCommunity(communityId: string, userId: string, username: string) {
    const existing = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)));

    if (existing.length > 0) return existing[0];

    const [member] = await db.insert(communityMembers).values({
      communityId,
      userId,
      username,
      role: "member",
    }).returning();

    await db.update(communities)
      .set({ memberCount: sql`${communities.memberCount} + 1` })
      .where(eq(communities.id, communityId));

    return member;
  }

  async leaveCommunity(communityId: string, userId: string) {
    const deleted = await db.delete(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
      .returning();

    if (deleted.length > 0) {
      await db.update(communities)
        .set({ memberCount: sql`GREATEST(${communities.memberCount} - 1, 0)` })
        .where(eq(communities.id, communityId));
    }

    return deleted.length > 0;
  }

  async getMembers(communityId: string) {
    return db.select().from(communityMembers)
      .where(eq(communityMembers.communityId, communityId))
      .orderBy(asc(communityMembers.joinedAt));
  }

  async getMember(communityId: string, userId: string) {
    const [member] = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)));
    return member || null;
  }

  async updateMemberOnline(communityId: string, userId: string, isOnline: boolean) {
    const [updated] = await db.update(communityMembers)
      .set({ isOnline, lastSeenAt: new Date() })
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
      .returning();
    return updated || null;
  }

  async sendMessage(data: InsertCommunityMessage & { attachment?: { type: string; url: string; filename?: string; size?: number } }) {
    const { attachment, ...messageData } = data;

    const [message] = await db.insert(communityMessages).values(messageData).returning();

    if (attachment) {
      await db.insert(messageAttachments).values({
        messageId: message.id,
        type: attachment.type,
        url: attachment.url,
        filename: attachment.filename,
        size: attachment.size,
      });
    }

    return message;
  }

  async getMessages(channelId: string, limit = 50) {
    const messages = await db.select().from(communityMessages)
      .where(eq(communityMessages.channelId, channelId))
      .orderBy(desc(communityMessages.createdAt))
      .limit(limit);

    const messageIds = messages.map((m) => m.id);
    if (messageIds.length === 0) return [];

    const attachments = await db.select().from(messageAttachments)
      .where(or(...messageIds.map((id) => eq(messageAttachments.messageId, id))));

    const attachmentMap = new Map<string, typeof attachments>();
    for (const att of attachments) {
      if (!attachmentMap.has(att.messageId)) attachmentMap.set(att.messageId, []);
      attachmentMap.get(att.messageId)!.push(att);
    }

    return messages.reverse().map((m) => ({
      ...m,
      attachments: attachmentMap.get(m.id) || [],
    }));
  }

  async getMessagesWithReactions(channelId: string, limit = 50) {
    const messages = await this.getMessages(channelId, limit);
    if (messages.length === 0) return [];

    const messageIds = messages.map((m) => m.id);

    const reactions = await db.select().from(messageReactions)
      .where(or(...messageIds.map((id) => eq(messageReactions.messageId, id))));

    const reactionMap = new Map<string, typeof reactions>();
    for (const r of reactions) {
      if (!reactionMap.has(r.messageId)) reactionMap.set(r.messageId, []);
      reactionMap.get(r.messageId)!.push(r);
    }

    const replyToIds = messages.filter((m) => m.replyToId).map((m) => m.replyToId!);
    let replyMap = new Map<string, { id: string; username: string; content: string }>();
    if (replyToIds.length > 0) {
      const replies = await db.select().from(communityMessages)
        .where(or(...replyToIds.map((id) => eq(communityMessages.id, id))));
      for (const r of replies) {
        replyMap.set(r.id, { id: r.id, username: r.username, content: r.content });
      }
    }

    return messages.map((m) => {
      const msgReactions = reactionMap.get(m.id) || [];
      const grouped: Record<string, { emoji: string; count: number; users: string[] }> = {};
      for (const r of msgReactions) {
        if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
        grouped[r.emoji].count++;
        grouped[r.emoji].users.push(r.username);
      }

      return {
        ...m,
        reactions: Object.values(grouped),
        replyTo: m.replyToId ? replyMap.get(m.replyToId) || null : null,
      };
    });
  }

  async getMessageById(messageId: string) {
    const [message] = await db.select().from(communityMessages).where(eq(communityMessages.id, messageId));
    return message || null;
  }

  async deleteMessage(messageId: string, userId: string) {
    const [message] = await db.select().from(communityMessages).where(eq(communityMessages.id, messageId));
    if (!message || message.userId !== userId) return false;

    await db.delete(communityMessages).where(eq(communityMessages.id, messageId));
    return true;
  }

  async editMessage(messageId: string, userId: string, content: string) {
    const [message] = await db.select().from(communityMessages).where(eq(communityMessages.id, messageId));
    if (!message || message.userId !== userId) return null;

    const [updated] = await db.update(communityMessages)
      .set({ content, editedAt: new Date() })
      .where(eq(communityMessages.id, messageId))
      .returning();
    return updated;
  }

  async addReaction(messageId: string, userId: string, username: string, emoji: string) {
    const existing = await db.select().from(messageReactions)
      .where(and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji),
      ));

    if (existing.length > 0) return existing[0];

    const [reaction] = await db.insert(messageReactions).values({
      messageId,
      userId,
      username,
      emoji,
    }).returning();
    return reaction;
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const deleted = await db.delete(messageReactions)
      .where(and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji),
      ))
      .returning();
    return deleted.length > 0;
  }

  async getReactions(messageId: string) {
    const reactions = await db.select().from(messageReactions)
      .where(eq(messageReactions.messageId, messageId));

    const grouped: Record<string, { emoji: string; count: number; users: string[] }> = {};
    for (const r of reactions) {
      if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
      grouped[r.emoji].count++;
      grouped[r.emoji].users.push(r.username);
    }
    return Object.values(grouped);
  }

  async createBot(communityId: string, name: string, description?: string) {
    const apiKey = `bot_${crypto.randomBytes(32).toString("hex")}`;
    const [bot] = await db.insert(communityBots).values({
      communityId,
      name,
      description,
      apiKey,
    }).returning();
    return bot;
  }

  async getBots(communityId: string) {
    return db.select().from(communityBots).where(eq(communityBots.communityId, communityId));
  }

  async sendBotMessage(apiKey: string, channelId: string, content: string) {
    const [bot] = await db.select().from(communityBots).where(eq(communityBots.apiKey, apiKey));
    if (!bot || !bot.isActive) return null;

    const [message] = await db.insert(communityMessages).values({
      channelId,
      userId: bot.id,
      username: bot.name,
      content,
      isBot: true,
    }).returning();
    return message;
  }

  async pinMessage(messageId: string, channelId: string, userId: string) {
    const existing = await db.select().from(pinnedMessages)
      .where(eq(pinnedMessages.messageId, messageId));

    if (existing.length > 0) return existing[0];

    const [pinned] = await db.insert(pinnedMessages).values({
      messageId,
      channelId,
      pinnedById: userId,
    }).returning();
    return pinned;
  }

  async unpinMessage(messageId: string) {
    await db.delete(pinnedMessages).where(eq(pinnedMessages.messageId, messageId));
    return true;
  }

  async getPinnedMessages(channelId: string) {
    const pins = await db.select().from(pinnedMessages)
      .where(eq(pinnedMessages.channelId, channelId))
      .orderBy(desc(pinnedMessages.pinnedAt));

    if (pins.length === 0) return [];

    const messageIds = pins.map((p) => p.messageId);
    const messages = await db.select().from(communityMessages)
      .where(or(...messageIds.map((id) => eq(communityMessages.id, id))));

    const messageMap = new Map(messages.map((m) => [m.id, m]));

    return pins.map((p) => ({
      ...p,
      message: messageMap.get(p.messageId) || null,
    }));
  }

  async searchMessages(channelId: string, query: string, limit = 50) {
    return db.select().from(communityMessages)
      .where(and(
        eq(communityMessages.channelId, channelId),
        like(communityMessages.content, `%${query}%`),
      ))
      .orderBy(desc(communityMessages.createdAt))
      .limit(limit);
  }

  async createPoll(
    channelId: string,
    creatorId: string,
    creatorName: string,
    question: string,
    options: string[],
    allowMultiple = false,
    endsAt?: Date | null,
  ) {
    const [poll] = await db.insert(communityPolls).values({
      channelId,
      creatorId,
      creatorName,
      question,
      options: JSON.stringify(options),
      allowMultiple,
      endsAt,
    }).returning();
    return poll;
  }

  async votePoll(pollId: string, userId: string, optionIndex: number) {
    const [poll] = await db.select().from(communityPolls).where(eq(communityPolls.id, pollId));
    if (!poll) return null;

    if (!poll.allowMultiple) {
      const existing = await db.select().from(pollVotes)
        .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
      if (existing.length > 0) {
        await db.delete(pollVotes)
          .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
      }
    } else {
      const existing = await db.select().from(pollVotes)
        .where(and(
          eq(pollVotes.pollId, pollId),
          eq(pollVotes.userId, userId),
          eq(pollVotes.optionIndex, optionIndex),
        ));
      if (existing.length > 0) return existing[0];
    }

    const [vote] = await db.insert(pollVotes).values({
      pollId,
      userId,
      optionIndex,
    }).returning();
    return vote;
  }

  async getChannelPolls(channelId: string) {
    const polls = await db.select().from(communityPolls)
      .where(eq(communityPolls.channelId, channelId))
      .orderBy(desc(communityPolls.createdAt));

    const pollIds = polls.map((p) => p.id);
    if (pollIds.length === 0) return polls.map((p) => ({ ...p, votes: [] }));

    const votes = await db.select().from(pollVotes)
      .where(or(...pollIds.map((id) => eq(pollVotes.pollId, id))));

    const voteMap = new Map<string, typeof votes>();
    for (const v of votes) {
      if (!voteMap.has(v.pollId)) voteMap.set(v.pollId, []);
      voteMap.get(v.pollId)!.push(v);
    }

    return polls.map((p) => ({
      ...p,
      votes: voteMap.get(p.id) || [],
    }));
  }

  async getOrCreateDmConversation(user1Id: string, user1Name: string, user2Id: string, user2Name: string) {
    const existing = await db.select().from(dmConversations)
      .where(or(
        and(eq(dmConversations.participant1Id, user1Id), eq(dmConversations.participant2Id, user2Id)),
        and(eq(dmConversations.participant1Id, user2Id), eq(dmConversations.participant2Id, user1Id)),
      ));

    if (existing.length > 0) return existing[0];

    const [conversation] = await db.insert(dmConversations).values({
      participant1Id: user1Id,
      participant1Name: user1Name,
      participant2Id: user2Id,
      participant2Name: user2Name,
    }).returning();
    return conversation;
  }

  async sendDirectMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    attachment?: { url: string; name?: string; type?: string },
  ) {
    const [message] = await db.insert(directMessages).values({
      conversationId,
      senderId,
      senderName,
      content,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
    }).returning();

    await db.update(dmConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(dmConversations.id, conversationId));

    return message;
  }

  async getDirectMessages(conversationId: string, limit = 50) {
    return db.select().from(directMessages)
      .where(eq(directMessages.conversationId, conversationId))
      .orderBy(desc(directMessages.createdAt))
      .limit(limit)
      .then((msgs) => msgs.reverse());
  }

  async getUserDmConversations(userId: string) {
    return db.select().from(dmConversations)
      .where(or(
        eq(dmConversations.participant1Id, userId),
        eq(dmConversations.participant2Id, userId),
      ))
      .orderBy(desc(dmConversations.lastMessageAt));
  }

  async hasPermission(communityId: string, userId: string, permission: string) {
    const member = await this.getMember(communityId, userId);
    if (!member) return false;

    const privilegedRoles = ["owner", "admin", "moderator"];
    if (privilegedRoles.includes(member.role)) return true;

    if (permission === "read" || permission === "write") return true;

    return false;
  }

  async seedGarageBotCommunity() {
    const existing = await db.select().from(communities).where(eq(communities.name, "GarageBot"));
    if (existing.length > 0) return existing[0];

    const [community] = await db.insert(communities).values({
      name: "GarageBot",
      description: "Official GarageBot Community - Parts, Vehicles & Support",
      icon: "🔧",
      ownerId: "system",
      isVerified: true,
      isPublic: true,
    }).returning();

    await db.insert(communityChannels).values([
      { communityId: community.id, name: "general", type: "chat", position: 0 },
      { communityId: community.id, name: "garagebot-support", type: "chat", position: 1, description: "Get help from Buddy AI or our team" },
      { communityId: community.id, name: "announcements", type: "announcement", position: 2, isLocked: true },
    ]);

    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: "system",
      username: "system",
      role: "owner",
    });

    await db.update(communities)
      .set({ memberCount: 1 })
      .where(eq(communities.id, community.id));

    return community;
  }
}

export const communityHubService = new CommunityHubService();
