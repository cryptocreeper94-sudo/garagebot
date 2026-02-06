export interface ChatMember {
  id: string;
  username: string;
  avatarUrl?: string;
  roles?: string[];
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: { userId: string; username: string }[];
}

export interface ChatReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  isBot: boolean;
  replyToId?: string | null;
  replyTo?: ChatMessage | null;
  reactions: ChatReaction[];
  attachment?: { url: string; name: string; type: string } | null;
  createdAt: string;
  editedAt?: string | null;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  communityId: string;
  position: number;
  isLocked: boolean;
  unreadCount?: number;
  muted?: boolean;
}

export interface ChatCommunity {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  ownerId: string;
  isVerified: boolean;
  isPublic: boolean;
  memberCount: number;
}

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface WSMessage {
  type: string;
  [key: string]: any;
}
