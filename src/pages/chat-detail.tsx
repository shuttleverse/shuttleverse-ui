import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChatMessages, useMarkMessagesAsRead } from "@/services/chat";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { MessageResponse } from "@/types/chat";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsViewingChat } from "@/hooks/useIsViewingChat";
import Navbar from "@/components/layout/navbar";
import BottomNavigation from "@/components/layout/bottom-navigation";

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [localMessages, setLocalMessages] = useState<MessageResponse[]>([]);
  const markAsRead = useMarkMessagesAsRead();
  const isViewing = useIsViewingChat();

  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedMarkAsRead = useCallback(
    (chatId: string) => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }

      markAsReadTimeoutRef.current = setTimeout(() => {
        markAsRead.mutate(chatId);
      }, 500);
    },
    [markAsRead]
  );

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(chatId || "", !!chatId);

  const { subscribeToChat, subscribeToUserQueue, isConnected } = useWebSocket();

  const allMessages = useMemo(
    () => messagesData?.pages.flatMap((page) => page.content).reverse() || [],
    [messagesData]
  );

  const allMessageIds = useMemo(
    () => new Set(allMessages.map((m) => m.id)),
    [allMessages]
  );
  const uniqueLocalMessages = useMemo(
    () => localMessages.filter((m) => !allMessageIds.has(m.id)),
    [localMessages, allMessageIds]
  );
  const displayMessages = useMemo(
    () =>
      [...allMessages, ...uniqueLocalMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [allMessages, uniqueLocalMessages]
  );

  useEffect(() => {
    if (chatId) {
      markAsRead.mutate(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !isConnected) return;

    const unsubscribeChat = subscribeToChat(
      chatId,
      (message: MessageResponse) => {
        setLocalMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
        queryClient.invalidateQueries({ queryKey: ["chats"] });

        if (isViewing) {
          debouncedMarkAsRead(chatId);
        }
      }
    );

    const unsubscribeUserQueue = subscribeToUserQueue(
      (message: MessageResponse) => {
        if (message.chatId === chatId) {
          setLocalMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
          queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });

          if (isViewing) {
            debouncedMarkAsRead(chatId);
          }
        }
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    );

    return () => {
      unsubscribeChat();
      unsubscribeUserQueue();
    };
  }, [
    chatId,
    isConnected,
    subscribeToChat,
    subscribeToUserQueue,
    queryClient,
    isViewing,
    debouncedMarkAsRead,
  ]);

  useEffect(() => {
    setLocalMessages([]);
  }, [chatId]);

  useEffect(() => {
    if (allMessages.length > 0) {
      setLocalMessages((prev) => {
        const allMessageIds = new Set(allMessages.map((m) => m.id));
        return prev.filter((m) => !allMessageIds.has(m.id));
      });
    }
  }, [allMessages]);

  useEffect(() => {
    if (isViewing && chatId) {
      debouncedMarkAsRead(chatId);
    }
  }, [isViewing, chatId, debouncedMarkAsRead]);

  useEffect(() => {
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, []);

  if (!chatId) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <p>Chat not found</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col fixed inset-0 bg-white"
        style={{ top: "5rem", bottom: isMobile ? "3.5rem" : "0" }}
      >
        <ChatHeader chatId={chatId} />
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full ">
          <MessageList
            messages={displayMessages}
            isLoading={isFetchingNextPage}
            hasNextPage={hasNextPage || false}
            onLoadMore={() => fetchNextPage()}
          />
          <MessageInput chatId={chatId} />
        </div>
      </div>
      {isMobile && <BottomNavigation />}
    </>
  );
};

export default ChatPage;
