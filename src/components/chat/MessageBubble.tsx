import { format } from "date-fns";
import { MessageResponse } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: MessageResponse;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;

  return (
    <div
      className={`flex gap-2 mb-4 ${isOwnMessage ? "flex-row-reverse" : ""}`}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs">
            {message.sender.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {!isOwnMessage && (
          <span className="text-xs text-gray-600 mb-1 px-2">
            {message.sender.username}
          </span>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
          {isOwnMessage && message.status === "READ" && (
            <span className="text-xs text-emerald-600">✓✓</span>
          )}
          {isOwnMessage && message.status === "SENT" && (
            <span className="text-xs text-gray-400">✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

