export type Platform = "web" | "android" | "ios" | "windows" | "macos";

export type UserStatus = "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: UserStatus;
}

export interface ConversationPreview {
  id: string;
  title: string;
  type: "DIRECT" | "GROUP" | "CHANNEL";
  lastMessage?: string;
  updatedAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface ApiHealth {
  ok: boolean;
  service: string;
  timestamp: string;
  environment: string;
}
