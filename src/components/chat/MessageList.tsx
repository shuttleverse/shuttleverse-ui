import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageResponse } from "@/types/chat";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: MessageResponse[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export const MessageList = ({
  messages,
  isLoading,
  hasNextPage,
  onLoadMore,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      scrollToBottom();
    }
  }, [messages.length, isLoading]);

  const handleScroll = () => {
    if (!messagesContainerRef.current || !hasNextPage || isLoading) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100) {
      onLoadMore?.();
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2"
    >
      {hasNextPage && (
        <div className="flex justify-center py-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <button
              onClick={onLoadMore}
              className="text-xs text-emerald-600 hover:underline"
            >
              Load older messages
            </button>
          )}
        </div>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
