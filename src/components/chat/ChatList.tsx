import { ChatListItem } from "./ChatListItem";
import { useChats } from "@/services/chat";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, MessageSquare } from "lucide-react";

export const ChatList = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error } = useChats(isAuthenticated === true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data?.chats || data.chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
        <p>No chats yet</p>
        <p className="text-sm mt-2">Start a conversation to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {data.chats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
};
