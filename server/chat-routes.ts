import { Router } from "express";
import { communityHubService } from "./services/community-hub-service";
import { handleSupportMessage, getSupportChannelId } from "./services/buddy-chat-bot";
import { z } from "zod";
import { storage } from "./storage";

export function createChatRouter(): Router {
  const router = Router();

  router.get("/api/chat/communities", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const communities = await communityHubService.getCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  router.get("/api/chat/communities/user/me", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const communities = await communityHubService.getUserCommunities(userId);
      res.json(communities);
    } catch (error) {
      console.error("Error fetching user communities:", error);
      res.status(500).json({ error: "Failed to fetch user communities" });
    }
  });

  router.get("/api/chat/communities/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const community = await communityHubService.getCommunity(req.params.id);
      if (!community) return res.status(404).json({ error: "Community not found" });

      res.json(community);
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  router.post("/api/chat/communities/:id/join", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const user = await storage.getUser(userId);
      const username = user?.username || userId;

      const member = await communityHubService.joinCommunity(req.params.id, userId, username);
      res.json(member);
    } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ error: "Failed to join community" });
    }
  });

  router.post("/api/chat/communities/:id/leave", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const result = await communityHubService.leaveCommunity(req.params.id, userId);
      res.json({ success: result });
    } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ error: "Failed to leave community" });
    }
  });

  router.get("/api/chat/communities/:communityId/channels", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const channels = await communityHubService.getChannels(req.params.communityId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  router.post("/api/chat/communities/:communityId/channels", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const hasPermission = await communityHubService.hasPermission(req.params.communityId, userId, "manage_channels");
      if (!hasPermission) return res.status(403).json({ error: "Insufficient permissions" });

      const { name, type, description } = req.body;
      const channel = await communityHubService.createChannel({
        communityId: req.params.communityId,
        name,
        type: type || "chat",
        description,
      });
      res.json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ error: "Failed to create channel" });
    }
  });

  router.get("/api/chat/communities/:communityId/members", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const members = await communityHubService.getMembers(req.params.communityId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  router.get("/api/chat/channels/:channelId/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await communityHubService.getMessagesWithReactions(req.params.channelId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  router.post("/api/chat/channels/:channelId/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const user = await storage.getUser(userId);
      const username = user?.username || userId;

      const { content, replyToId, attachment } = req.body;
      const { channelId } = req.params;

      const message = await communityHubService.sendMessage({
        channelId,
        userId,
        username,
        content,
        replyToId: replyToId || null,
        attachment,
      });

      handleSupportMessage(channelId, userId, username, content).catch((err) =>
        console.error("BuddyBot support error:", err)
      );

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  router.patch("/api/chat/messages/:messageId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const { content } = req.body;
      const updated = await communityHubService.editMessage(req.params.messageId, userId, content);
      if (!updated) return res.status(403).json({ error: "Cannot edit this message" });

      res.json(updated);
    } catch (error) {
      console.error("Error editing message:", error);
      res.status(500).json({ error: "Failed to edit message" });
    }
  });

  router.delete("/api/chat/messages/:messageId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const result = await communityHubService.deleteMessage(req.params.messageId, userId);
      if (!result) return res.status(403).json({ error: "Cannot delete this message" });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  router.post("/api/chat/messages/:messageId/reactions", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const user = await storage.getUser(userId);
      const username = user?.username || userId;

      const { emoji } = req.body;
      const reaction = await communityHubService.addReaction(req.params.messageId, userId, username, emoji);
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ error: "Failed to add reaction" });
    }
  });

  router.delete("/api/chat/messages/:messageId/reactions/:emoji", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const result = await communityHubService.removeReaction(req.params.messageId, userId, decodeURIComponent(req.params.emoji));
      res.json({ success: result });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  router.get("/api/chat/channels/:channelId/pinned", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const pinned = await communityHubService.getPinnedMessages(req.params.channelId);
      res.json(pinned);
    } catch (error) {
      console.error("Error fetching pinned messages:", error);
      res.status(500).json({ error: "Failed to fetch pinned messages" });
    }
  });

  router.post("/api/chat/channels/:channelId/pin/:messageId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const pinned = await communityHubService.pinMessage(req.params.messageId, req.params.channelId, userId);
      res.json(pinned);
    } catch (error) {
      console.error("Error pinning message:", error);
      res.status(500).json({ error: "Failed to pin message" });
    }
  });

  router.delete("/api/chat/channels/:channelId/unpin/:messageId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const result = await communityHubService.unpinMessage(req.params.messageId);
      res.json({ success: result });
    } catch (error) {
      console.error("Error unpinning message:", error);
      res.status(500).json({ error: "Failed to unpin message" });
    }
  });

  router.get("/api/chat/channels/:channelId/search", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const q = req.query.q as string;
      if (!q) return res.status(400).json({ error: "Search query is required" });

      const limit = parseInt(req.query.limit as string) || 50;
      const results = await communityHubService.searchMessages(req.params.channelId, q, limit);
      res.json(results);
    } catch (error) {
      console.error("Error searching messages:", error);
      res.status(500).json({ error: "Failed to search messages" });
    }
  });

  router.post("/api/chat/channels/:channelId/polls", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const user = await storage.getUser(userId);
      const username = user?.username || userId;

      const { question, options, allowMultiple, endsAt } = req.body;
      const poll = await communityHubService.createPoll(
        req.params.channelId,
        userId,
        username,
        question,
        options,
        allowMultiple || false,
        endsAt ? new Date(endsAt) : null,
      );
      res.json(poll);
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ error: "Failed to create poll" });
    }
  });

  router.post("/api/chat/polls/:pollId/vote", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const { optionIndex } = req.body;
      const vote = await communityHubService.votePoll(req.params.pollId, userId, optionIndex);
      if (!vote) return res.status(404).json({ error: "Poll not found" });

      res.json(vote);
    } catch (error) {
      console.error("Error voting on poll:", error);
      res.status(500).json({ error: "Failed to vote on poll" });
    }
  });

  router.get("/api/chat/channels/:channelId/polls", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const polls = await communityHubService.getChannelPolls(req.params.channelId);
      res.json(polls);
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ error: "Failed to fetch polls" });
    }
  });

  router.get("/api/chat/dm/conversations", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const conversations = await communityHubService.getUserDmConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching DM conversations:", error);
      res.status(500).json({ error: "Failed to fetch DM conversations" });
    }
  });

  router.post("/api/chat/dm/conversations", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const user = await storage.getUser(userId);
      const username = user?.username || userId;

      const { targetUserId, targetUsername } = req.body;
      const conversation = await communityHubService.getOrCreateDmConversation(
        userId,
        username,
        targetUserId,
        targetUsername,
      );
      res.json(conversation);
    } catch (error) {
      console.error("Error creating DM conversation:", error);
      res.status(500).json({ error: "Failed to create DM conversation" });
    }
  });

  router.get("/api/chat/dm/conversations/:conversationId/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await communityHubService.getDirectMessages(req.params.conversationId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching DM messages:", error);
      res.status(500).json({ error: "Failed to fetch DM messages" });
    }
  });

  router.post("/api/chat/dm/conversations/:conversationId/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      const user = await storage.getUser(userId);
      const username = user?.username || userId;

      const { content, attachment } = req.body;
      const message = await communityHubService.sendDirectMessage(
        req.params.conversationId,
        userId,
        username,
        content,
        attachment,
      );
      res.json(message);
    } catch (error) {
      console.error("Error sending DM:", error);
      res.status(500).json({ error: "Failed to send DM" });
    }
  });

  return router;
}
