export enum ChatType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export enum MessageStatus {
  SENT = "SENT",
  READ = "READ",
}

export interface UserDto {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

export interface MessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  sender: UserDto;
  content: string;
  createdAt: string;
  editedAt?: string;
  readAt?: string;
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface ChatResponse {
  id: string;
  type: ChatType;
  name?: string;
  participants: UserDto[];
  lastMessage?: MessageResponse;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatListResponse {
  chats: ChatResponse[];
}

export interface SendMessageRequest {
  content: string;
}

export interface CreateDirectChatRequest {
  targetUserId: string;
}

export interface CreateGroupChatRequest {
  name: string;
  participantIds: string[];
}

export interface AddParticipantRequest {
  userId: string;
}

