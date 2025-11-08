import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";

interface MessageInputProps {
  chatId: string;
  onTyping?: () => void;
}

export const MessageInput = ({ chatId, onTyping }: MessageInputProps) => {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { sendMessage, sendTypingIndicator, isConnected } = useWebSocket();

  const handleSend = () => {
    if (!content.trim() || !isConnected) return;

    sendMessage(chatId, content.trim());
    setContent("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setContent(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      sendTypingIndicator(chatId);
      onTyping?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t bg-white p-4 flex-shrink-0">
      <div className="flex gap-2 items-end">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          rows={1}
          className="resize-none min-h-[44px] max-h-32"
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || !isConnected}
          size="icon"
          className="h-11 w-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {!isConnected && (
        <p className="text-xs text-gray-500 mt-2">Connecting to chat...</p>
      )}
    </div>
  );
};
