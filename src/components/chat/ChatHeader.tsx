import { useChat } from "@/services/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  chatId: string;
}

export const ChatHeader = ({ chatId }: ChatHeaderProps) => {
  const { data: chat, isLoading } = useChat(chatId);
  const navigate = useNavigate();

  if (isLoading || !chat) {
    return (
      <div className="h-16 border-b bg-white flex items-center px-4 flex-shrink-0">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const otherParticipant =
    chat.type === "DIRECT"
      ? chat.participants.find((p) => p.id !== chat.participants[0]?.id) ||
        chat.participants[0]
      : null;

  const displayName =
    chat.type === "DIRECT"
      ? otherParticipant?.username || "Unknown"
      : chat.name || "Group Chat";

  return (
    <div className="h-16 border-b bg-white flex items-center px-4 gap-3 flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/chat")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-emerald-100 text-emerald-800">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="font-semibold text-gray-900">{displayName}</h2>
        {chat.type === "GROUP" && (
          <p className="text-xs text-gray-500">
            {chat.participants.length} participants
          </p>
        )}
      </div>
    </div>
  );
};

