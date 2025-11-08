import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ChatResponse } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface ChatListItemProps {
  chat: ChatResponse;
}

export const ChatListItem = ({ chat }: ChatListItemProps) => {
  const { user } = useAuth();
  const otherParticipant =
    chat.type === "DIRECT"
      ? chat.participants.find((p) => p.id !== user?.id) || chat.participants[0]
      : null;

  const displayName =
    chat.type === "DIRECT"
      ? otherParticipant?.username || "Unknown"
      : chat.name || "Group Chat";

  const lastMessageTime = chat.lastMessage
    ? format(new Date(chat.lastMessage.createdAt), "MMM d")
    : format(new Date(chat.updatedAt), "MMM d");

  return (
    <Link
      to={`/chat/${chat.id}`}
      className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b transition-colors"
    >
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-emerald-100 text-emerald-800">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 truncate">{displayName}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">
            {chat.lastMessage?.content || "No messages yet"}
          </p>
          {chat.unreadCount > 0 && (
            <Badge className="bg-emerald-600 text-white flex-shrink-0 ml-2">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};
