import { useEffect, useRef, useCallback, useState } from "react";

type MessageHandler = (data: any) => void;

interface ChatSocketOptions {
  onMessage?: MessageHandler;
  onPresence?: MessageHandler;
  onTyping?: MessageHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSignalChat(options: ChatSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "auth_success":
            setIsConnected(true);
            setUserId(data.userId);
            setUsername(data.username);
            optionsRef.current.onConnect?.();
            break;
          case "new_message":
          case "message_edited":
          case "message_deleted":
          case "reaction_added":
          case "reaction_removed":
          case "new_dm":
            optionsRef.current.onMessage?.(data);
            break;
          case "user_typing":
            optionsRef.current.onTyping?.(data);
            break;
          case "presence_update":
            optionsRef.current.onPresence?.(data);
            break;
        }
      } catch (err) {
        console.error("[SignalChat] Parse error:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      optionsRef.current.onDisconnect?.();
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = (err) => {
      console.error("[SignalChat] WS error:", err);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const joinChannel = useCallback((channelId: string) => {
    send({ type: "join_channel", channelId });
  }, [send]);

  const leaveChannel = useCallback((channelId: string) => {
    send({ type: "leave_channel", channelId });
  }, [send]);

  const sendMessage = useCallback((channelId: string, content: string, replyToId?: string) => {
    send({ type: "send_message", channelId, content, replyToId });
  }, [send]);

  const editMessage = useCallback((messageId: string, content: string) => {
    send({ type: "edit_message", messageId, content });
  }, [send]);

  const deleteMessage = useCallback((messageId: string, channelId: string) => {
    send({ type: "delete_message", messageId, channelId });
  }, [send]);

  const addReaction = useCallback((messageId: string, emoji: string, channelId: string) => {
    send({ type: "add_reaction", messageId, emoji, channelId });
  }, [send]);

  const removeReaction = useCallback((messageId: string, emoji: string, channelId: string) => {
    send({ type: "remove_reaction", messageId, emoji, channelId });
  }, [send]);

  const sendTyping = useCallback((channelId: string) => {
    send({ type: "typing", channelId });
  }, [send]);

  const sendDm = useCallback((conversationId: string, content: string) => {
    send({ type: "send_dm", conversationId, content });
  }, [send]);

  return {
    isConnected,
    userId,
    username,
    joinChannel,
    leaveChannel,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    sendTyping,
    sendDm,
  };
}
