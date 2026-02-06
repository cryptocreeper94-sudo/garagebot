import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignalChat } from "@/hooks/useSignalChat";
import Nav from "@/components/Nav";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Bot,
  Pin,
  Search,
  SmilePlus,
  Reply,
  Trash2,
  Edit3,
  ChevronLeft,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type {
  ChatCommunity,
  ChatChannel,
  ChatMessage,
  ChatMember,
} from "@shared/chat-types";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function shouldGroupMessages(prev: ChatMessage, curr: ChatMessage) {
  if (prev.userId !== curr.userId) return false;
  const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return diff < 5 * 60 * 1000;
}

function getChannelIcon(name: string) {
  if (name.includes("support")) return <Bot className="w-4 h-4 text-cyan-400" />;
  return <Hash className="w-4 h-4 text-slate-400" />;
}

export default function SignalChat() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, { username: string; timeout: NodeJS.Timeout }>>(new Map());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const prevChannelRef = useRef<string | null>(null);
  const selectedChannelRef = useRef<string | null>(null);
  const chatRef = useRef<ReturnType<typeof useSignalChat> | null>(null);

  selectedChannelRef.current = selectedChannelId;

  const handleWsMessage = useCallback((data: any) => {
    if (data.type === "new_message") {
      setLocalMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } else if (data.type === "message_edited") {
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === data.message.id ? { ...m, ...data.message } : m))
      );
    } else if (data.type === "message_deleted") {
      setLocalMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    }
  }, []);

  const handleWsTyping = useCallback((data: any) => {
    setTypingUsers((prev) => {
      const next = new Map(prev);
      const existing = next.get(data.userId);
      if (existing) clearTimeout(existing.timeout);
      const timeout = setTimeout(() => {
        setTypingUsers((p) => {
          const n = new Map(p);
          n.delete(data.userId);
          return n;
        });
      }, 3000);
      next.set(data.userId, { username: data.username || "Someone", timeout });
      return next;
    });
  }, []);

  const handleWsConnect = useCallback(() => {
    const chId = selectedChannelRef.current;
    if (chId && chatRef.current) {
      chatRef.current.joinChannel(chId);
    }
  }, []);

  const chat = useSignalChat({
    onMessage: handleWsMessage,
    onTyping: handleWsTyping,
    onConnect: handleWsConnect,
  });

  chatRef.current = chat;

  const {
    isConnected,
    userId: wsUserId,
    joinChannel,
    leaveChannel,
    sendTyping,
  } = chat;

  const { data: communities = [] } = useQuery<ChatCommunity[]>({
    queryKey: ["/api/chat/communities"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (communities.length > 0 && !selectedCommunityId) {
      setSelectedCommunityId(communities[0].id);
    }
  }, [communities, selectedCommunityId]);

  const { data: channels = [] } = useQuery<ChatChannel[]>({
    queryKey: [`/api/chat/communities/${selectedCommunityId}/channels`],
    enabled: !!selectedCommunityId,
  });

  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      const general = channels.find((c) => c.name === "general");
      setSelectedChannelId(general?.id || channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const { data: members = [] } = useQuery<ChatMember[]>({
    queryKey: [`/api/chat/communities/${selectedCommunityId}/members`],
    enabled: !!selectedCommunityId,
  });

  const { data: fetchedMessages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/channels/${selectedChannelId}/messages`, { limit: 50 }],
    enabled: !!selectedChannelId,
  });

  useEffect(() => {
    setLocalMessages(fetchedMessages);
  }, [fetchedMessages]);

  useEffect(() => {
    if (prevChannelRef.current && prevChannelRef.current !== selectedChannelId) {
      leaveChannel(prevChannelRef.current);
    }
    if (selectedChannelId) {
      joinChannel(selectedChannelId);
      prevChannelRef.current = selectedChannelId;
    }
  }, [selectedChannelId, joinChannel, leaveChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/chat/channels/${selectedChannelId}/messages`, { content });
      return res.json();
    },
    onSuccess: (newMsg: ChatMessage) => {
      setLocalMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      queryClient.invalidateQueries({ queryKey: [`/api/chat/channels/${selectedChannelId}/messages`] });
    },
  });

  const handleSendMessage = useCallback(() => {
    const content = messageText.trim();
    if (!content || !selectedChannelId) return;
    sendMessageMutation.mutate(content);
    setMessageText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [messageText, selectedChannelId, sendMessageMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageText(e.target.value);
      if (selectedChannelId) sendTyping(selectedChannelId);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    },
    [selectedChannelId, sendTyping]
  );

  const handleChannelSelect = useCallback((channelId: string) => {
    setSelectedChannelId(channelId);
    setLocalMessages([]);
    setTypingUsers(new Map());
    setMobileSidebarOpen(false);
    queryClient.invalidateQueries({ queryKey: [`/api/chat/channels/${channelId}/messages`] });
  }, [queryClient]);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);
  const selectedCommunity = communities.find((c) => c.id === selectedCommunityId);
  const typingList = Array.from(typingUsers.values()).map((t) => t.username);

  let dateHeaders: Set<string> = new Set();

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex h-[calc(100vh-120px)] rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">

          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          <div
            data-testid="chat-sidebar"
            className={`${
              mobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-72" : "hidden"
            } md:relative md:flex md:w-64 flex-col bg-slate-900/80 backdrop-blur-md border-r border-white/10 shrink-0`}
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-rajdhani font-bold text-white text-sm truncate">
                    {selectedCommunity?.name || "Signal Chat"}
                  </h2>
                  <p className="text-xs text-slate-400 truncate">
                    {selectedCommunity?.description || "Community Hub"}
                  </p>
                </div>
                <button
                  className="md:hidden p-1 text-slate-400 hover:text-white"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3" data-testid="channel-list">
              <div className="mb-2 px-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Channels
                </span>
              </div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  data-testid={`channel-${channel.name}`}
                  onClick={() => handleChannelSelect(channel.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-inter transition-all mb-0.5 ${
                    selectedChannelId === channel.id
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  {getChannelIcon(channel.name)}
                  <span className="truncate">{channel.name}</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="ml-auto bg-cyan-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4" />
                <span className="text-xs font-mono">
                  {members.length} member{members.length !== 1 ? "s" : ""} online
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-slate-800/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  className="md:hidden p-1 text-slate-400 hover:text-white"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  {selectedChannel && getChannelIcon(selectedChannel.name)}
                  <h3 className="font-rajdhani font-bold text-white text-lg truncate">
                    {selectedChannel?.name || "Select a channel"}
                  </h3>
                </div>
                {selectedChannel?.description && (
                  <span className="hidden lg:inline text-xs text-slate-400 truncate ml-2 border-l border-white/10 pl-3">
                    {selectedChannel.description}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors">
                  <Pin className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors">
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              data-testid="message-area"
              className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(6,182,212,0.3) transparent",
              }}
            >
              {messagesLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-sm text-slate-400 font-mono">Loading messages...</span>
                  </div>
                </div>
              )}

              {!messagesLoading && localMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h4 className="font-rajdhani font-bold text-white text-lg mb-1">
                      Welcome to #{selectedChannel?.name || "channel"}
                    </h4>
                    <p className="text-sm text-slate-400 max-w-xs">
                      This is the start of the conversation. Say hello!
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {localMessages.map((msg, idx) => {
                  const prev = idx > 0 ? localMessages[idx - 1] : null;
                  const grouped = prev ? shouldGroupMessages(prev, msg) : false;
                  const msgDate = formatDate(msg.createdAt);
                  let showDateHeader = false;
                  if (!dateHeaders.has(msgDate)) {
                    dateHeaders.add(msgDate);
                    showDateHeader = true;
                  }

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateHeader && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="flex-1 h-px bg-white/5" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {msgDate}
                          </span>
                          <div className="flex-1 h-px bg-white/5" />
                        </div>
                      )}

                      <motion.div
                        data-testid={`message-${msg.id}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`group relative px-3 py-1 rounded-lg hover:bg-white/[0.02] transition-colors ${
                          msg.isBot
                            ? "bg-cyan-950/30 border-l-2 border-cyan-400"
                            : ""
                        } ${grouped ? "mt-0" : "mt-3"}`}
                      >
                        {!grouped && (
                          <div className="flex items-center gap-3 mb-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                msg.isBot
                                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                  : "bg-slate-700 text-slate-200"
                              }`}
                            >
                              {msg.isBot ? (
                                <Bot className="w-4 h-4" />
                              ) : (
                                msg.username?.charAt(0).toUpperCase() || "?"
                              )}
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`font-inter font-semibold text-sm ${
                                  msg.isBot ? "text-cyan-400" : "text-white"
                                }`}
                              >
                                {msg.username || "Unknown"}
                              </span>
                              {msg.isBot && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                  🤖 BOT
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500 font-mono">
                                {formatTime(msg.createdAt)}
                              </span>
                              {msg.editedAt && (
                                <span className="text-[10px] text-slate-600 italic">(edited)</span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className={`${grouped ? "pl-11" : "pl-11"}`}>
                          <p className="text-sm text-slate-200 font-inter leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>

                        <div className="absolute top-0 right-2 hidden group-hover:flex items-center gap-0.5 bg-slate-800 border border-white/10 rounded-lg p-0.5 shadow-lg -translate-y-1/2">
                          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded transition-colors">
                            <SmilePlus className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded transition-colors">
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          {msg.userId === wsUserId && (
                            <>
                              <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded transition-colors">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {typingList.length > 0 && (
              <div className="px-4 py-1.5 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-slate-400 font-inter">
                    {typingList.length === 1
                      ? `${typingList[0]} is typing...`
                      : typingList.length === 2
                      ? `${typingList[0]} and ${typingList[1]} are typing...`
                      : `${typingList[0]} and ${typingList.length - 1} others are typing...`}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-white/10 bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-end gap-3 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 focus-within:border-cyan-500/30 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all">
                <textarea
                  ref={textareaRef}
                  data-testid="message-input"
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isConnected
                      ? `Message #${selectedChannel?.name || "channel"}...`
                      : "Connecting..."
                  }
                  disabled={!isConnected || !selectedChannelId}
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm font-inter resize-none outline-none max-h-[120px] disabled:opacity-50"
                />
                <button
                  data-testid="send-button"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !isConnected || !selectedChannelId}
                  className="p-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {!isConnected && (
                <p className="text-[11px] text-amber-400/80 font-mono mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Reconnecting to Signal Chat...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
