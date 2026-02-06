import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { parse as parseCookie } from "cookie";
import pg from "pg";
import { communityHubService } from "./community-hub-service";
import { verifyToken, getChatUserFromToken } from "../trustlayer-sso";

interface AuthenticatedSocket extends WebSocket {
  userId: string;
  username: string;
  avatarColor: string;
  role: string;
  isAlive: boolean;
  isJwtAuth: boolean;
}

interface ChannelSubscription {
  channelId: string;
  sockets: Set<AuthenticatedSocket>;
}

const channels = new Map<string, Set<AuthenticatedSocket>>();
const userSockets = new Map<string, Set<AuthenticatedSocket>>();

const sessionPool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

async function getSessionUser(sid: string): Promise<{ userId: string; username: string } | null> {
  try {
    const result = await sessionPool.query("SELECT sess FROM sessions WHERE sid = $1 AND expire > NOW()", [sid]);
    if (result.rows.length === 0) return null;
    const sess = typeof result.rows[0].sess === "string" ? JSON.parse(result.rows[0].sess) : result.rows[0].sess;
    const userId = sess.userId;
    if (!userId) return null;
    return { userId, username: sess.username || "User" };
  } catch (e) {
    console.error("[ChatWS] Session lookup error:", e);
    return null;
  }
}

function broadcastToChannel(channelId: string, message: any, excludeSocket?: AuthenticatedSocket) {
  const sockets = channels.get(channelId);
  if (!sockets) return;
  const data = JSON.stringify(message);
  Array.from(sockets).forEach((socket) => {
    if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
}

function broadcastToUser(userId: string, message: any) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  const data = JSON.stringify(message);
  Array.from(sockets).forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
}

export function setupChatWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    if (url.pathname !== "/ws/chat") {
      return;
    }

    try {
      const cookies = parseCookie(request.headers.cookie || "");
      const sid = cookies["connect.sid"];

      if (sid) {
        const rawSid = decodeURIComponent(sid);
        const sessionId = rawSid.startsWith("s:") ? rawSid.slice(2).split(".")[0] : rawSid;
        
        const sessionUser = await getSessionUser(sessionId);
        if (!sessionUser) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          const authedWs = ws as AuthenticatedSocket;
          authedWs.userId = sessionUser.userId;
          authedWs.username = sessionUser.username;
          authedWs.avatarColor = "#06b6d4";
          authedWs.role = "member";
          authedWs.isAlive = true;
          authedWs.isJwtAuth = false;

          wss.emit("connection", authedWs, request);
        });
      } else {
        wss.handleUpgrade(request, socket, head, (ws) => {
          const pendingWs = ws as AuthenticatedSocket;
          pendingWs.userId = "";
          pendingWs.username = "";
          pendingWs.avatarColor = "#06b6d4";
          pendingWs.role = "member";
          pendingWs.isAlive = true;
          pendingWs.isJwtAuth = true;

          wss.emit("connection", pendingWs, request);
        });
      }
    } catch (err) {
      console.error("[ChatWS] Upgrade error:", err);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (ws: AuthenticatedSocket) => {
    if (ws.isJwtAuth && !ws.userId) {
      console.log(`[ChatWS] Pending JWT connection - awaiting join message`);
    } else {
      console.log(`[ChatWS] Connected (session): ${ws.userId} (${ws.username})`);
      if (!userSockets.has(ws.userId)) {
        userSockets.set(ws.userId, new Set());
      }
      userSockets.get(ws.userId)!.add(ws);
    }

    ws.on("pong", () => { ws.isAlive = true; });

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "join" && ws.isJwtAuth && !ws.userId) {
          const token = msg.token;
          if (!token) {
            ws.send(JSON.stringify({ type: "error", message: "Token required for JWT auth" }));
            ws.close();
            return;
          }
          const result = await getChatUserFromToken(token);
          if (!result.success || !result.user) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid or expired token" }));
            ws.close();
            return;
          }
          ws.userId = result.user.id;
          ws.username = result.user.username;
          ws.avatarColor = result.user.avatarColor || "#06b6d4";
          ws.role = result.user.role || "member";
          console.log(`[ChatWS] JWT authenticated: ${ws.userId} (${ws.username})`);

          if (!userSockets.has(ws.userId)) {
            userSockets.set(ws.userId, new Set());
          }
          userSockets.get(ws.userId)!.add(ws);

          ws.send(JSON.stringify({
            type: "auth_success",
            userId: ws.userId,
            username: ws.username,
            avatarColor: ws.avatarColor,
            role: ws.role,
          }));

          if (msg.channelId) {
            if (!channels.has(msg.channelId)) channels.set(msg.channelId, new Set());
            channels.get(msg.channelId)!.add(ws);
            broadcastToChannel(msg.channelId, {
              type: "user_joined",
              userId: ws.userId,
              username: ws.username,
            });

            const history = await communityHubService.getMessages(msg.channelId, 50);
            ws.send(JSON.stringify({ type: "history", messages: history }));
          }
          return;
        }

        if (ws.isJwtAuth && !ws.userId) {
          ws.send(JSON.stringify({ type: "error", message: "Must send join message with token first" }));
          return;
        }

        await handleMessage(ws, msg);
      } catch (err) {
        console.error("[ChatWS] Message error:", err);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    ws.on("close", () => {
      console.log(`[ChatWS] Disconnected: ${ws.userId}`);
      Array.from(channels.entries()).forEach(([channelId, sockets]) => {
        if (sockets.has(ws)) {
          sockets.delete(ws);
          if (sockets.size === 0) channels.delete(channelId);
          broadcastToChannel(channelId, {
            type: "user_left",
            userId: ws.userId,
            username: ws.username,
          });
        }
      });
      const uSockets = userSockets.get(ws.userId);
      if (uSockets) {
        uSockets.delete(ws);
        if (uSockets.size === 0) userSockets.delete(ws.userId);
      }
    });

    if (!ws.isJwtAuth && ws.userId) {
      ws.send(JSON.stringify({
        type: "auth_success",
        userId: ws.userId,
        username: ws.username,
        avatarColor: ws.avatarColor,
        role: ws.role,
      }));
    }
  });

  // Heartbeat
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const authedWs = ws as AuthenticatedSocket;
      if (!authedWs.isAlive) {
        authedWs.terminate();
        return;
      }
      authedWs.isAlive = false;
      authedWs.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeatInterval));

  return wss;
}

async function handleMessage(ws: AuthenticatedSocket, msg: any) {
  switch (msg.type) {
    case "join_channel": {
      const { channelId } = msg;
      if (!channelId) return;
      if (!channels.has(channelId)) channels.set(channelId, new Set());
      channels.get(channelId)!.add(ws);
      
      broadcastToChannel(channelId, {
        type: "presence_update",
        userId: ws.userId,
        username: ws.username,
        status: "online",
        channelId,
      });
      
      ws.send(JSON.stringify({ type: "joined_channel", channelId }));
      break;
    }

    case "leave_channel": {
      const { channelId } = msg;
      if (!channelId) return;
      const sockets = channels.get(channelId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) channels.delete(channelId);
      }
      broadcastToChannel(channelId, {
        type: "presence_update",
        userId: ws.userId,
        username: ws.username,
        status: "offline",
        channelId,
      });
      break;
    }

    case "send_message": {
      const { channelId, content, replyToId } = msg;
      if (!channelId || !content) return;
      
      const message = await communityHubService.sendMessage({
        channelId,
        userId: ws.userId,
        username: ws.username,
        content,
        isBot: false,
        replyToId: replyToId || null,
      });
      
      broadcastToChannel(channelId, {
        type: "new_message",
        message: {
          ...message,
          reactions: [],
          attachment: null,
        },
      });
      break;
    }

    case "edit_message": {
      const { messageId, content } = msg;
      if (!messageId || !content) return;
      
      const edited = await communityHubService.editMessage(messageId, ws.userId, content);
      if (!edited) return;
      
      // Find channelId from edited message
      const editedMsg = await communityHubService.getMessageById(messageId);
      if (editedMsg) {
        broadcastToChannel(editedMsg.channelId, {
          type: "message_edited",
          messageId,
          content,
          editedAt: editedMsg.editedAt,
        });
      }
      break;
    }

    case "delete_message": {
      const { messageId, channelId } = msg;
      if (!messageId || !channelId) return;
      
      await communityHubService.deleteMessage(messageId, ws.userId);
      broadcastToChannel(channelId, {
        type: "message_deleted",
        messageId,
        channelId,
      });
      break;
    }

    case "add_reaction": {
      const { messageId, emoji, channelId } = msg;
      if (!messageId || !emoji) return;
      
      await communityHubService.addReaction(messageId, ws.userId, ws.username, emoji);
      if (channelId) {
        broadcastToChannel(channelId, {
          type: "reaction_added",
          messageId,
          userId: ws.userId,
          username: ws.username,
          emoji,
        });
      }
      break;
    }

    case "remove_reaction": {
      const { messageId, emoji, channelId } = msg;
      if (!messageId || !emoji) return;
      
      await communityHubService.removeReaction(messageId, ws.userId, emoji);
      if (channelId) {
        broadcastToChannel(channelId, {
          type: "reaction_removed",
          messageId,
          userId: ws.userId,
          emoji,
        });
      }
      break;
    }

    case "typing": {
      const { channelId } = msg;
      if (!channelId) return;
      broadcastToChannel(channelId, {
        type: "typing",
        userId: ws.userId,
        username: ws.username,
      }, ws);
      break;
    }

    case "switch_channel": {
      const { channelId } = msg;
      if (!channelId) return;
      Array.from(channels.entries()).forEach(([cId, sockets]) => {
        if (sockets.has(ws)) {
          sockets.delete(ws);
          if (sockets.size === 0) channels.delete(cId);
        }
      });
      if (!channels.has(channelId)) channels.set(channelId, new Set());
      channels.get(channelId)!.add(ws);

      const switchHistory = await communityHubService.getMessages(channelId, 50);
      ws.send(JSON.stringify({ type: "history", messages: switchHistory }));

      broadcastToChannel(channelId, {
        type: "user_joined",
        userId: ws.userId,
        username: ws.username,
      });
      break;
    }

    case "message": {
      const { content, replyToId } = msg;
      if (!content) return;
      const trimmed = content.trim().substring(0, 2000);
      if (!trimmed) return;
      let targetChannelId: string | null = null;
      Array.from(channels.entries()).forEach(([cId, sockets]) => {
        if (sockets.has(ws)) targetChannelId = cId;
      });
      if (!targetChannelId) return;
      const sentMsg = await communityHubService.sendMessage({
        channelId: targetChannelId,
        userId: ws.userId,
        username: ws.username,
        content: trimmed,
        isBot: false,
        replyToId: replyToId || null,
      });
      broadcastToChannel(targetChannelId, {
        type: "message",
        id: sentMsg.id,
        channelId: targetChannelId,
        userId: ws.userId,
        username: ws.username,
        avatarColor: ws.avatarColor,
        role: ws.role,
        content: trimmed,
        replyToId: replyToId || null,
        createdAt: sentMsg.createdAt,
      });
      break;
    }

    case "send_dm": {
      const { conversationId, content } = msg;
      if (!conversationId || !content) return;
      
      const dm = await communityHubService.sendDirectMessage(
        conversationId,
        ws.userId,
        ws.username,
        content
      );
      
      // Broadcast to both participants
      broadcastToUser(ws.userId, { type: "new_dm", message: dm });
      // Find the other participant
      const convos = await communityHubService.getUserDmConversations(ws.userId);
      const convo = convos.find(c => c.id === conversationId);
      if (convo) {
        const otherId = convo.participant1Id === ws.userId ? convo.participant2Id : convo.participant1Id;
        broadcastToUser(otherId, { type: "new_dm", message: dm });
      }
      break;
    }

    default:
      ws.send(JSON.stringify({ type: "error", message: `Unknown message type: ${msg.type}` }));
  }
}

export { broadcastToChannel, broadcastToUser };
