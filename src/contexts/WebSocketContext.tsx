import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "@/hooks/useAuth";

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | null;
  sendMessage: (chatId: string, content: string) => void;
  sendTypingIndicator: (chatId: string) => void;
  subscribeToChat: (
    chatId: string,
    callback: (message: any) => void
  ) => () => void;
  subscribeToUserQueue: (callback: (message: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
        setIsConnected(false);
      }
      retryCountRef.current = 0;
      setConnectionError(null);
      return;
    }

    // If we've exceeded max retries, don't try again
    if (retryCountRef.current >= maxRetries) {
      setConnectionError(
        new Error(
          "Failed to connect to chat service after multiple attempts. Please refresh the page."
        )
      );
      setIsConnecting(false);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    const wsUrl = apiUrl + "/api/connect/ws";

    const client = new Client({
      webSocketFactory: () => {
        const sock = new SockJS(wsUrl, undefined, {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
        });
        return sock as any;
      },
      connectHeaders: {},
      reconnectDelay: retryCountRef.current >= maxRetries ? 0 : 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        retryCountRef.current = 0;
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        retryCountRef.current += 1;
        if (retryCountRef.current >= maxRetries) {
          setConnectionError(
            new Error(
              "Failed to connect to chat service after multiple attempts. Please refresh the page."
            )
          );
          setIsConnecting(false);
          setIsConnected(false);
          if (clientRef.current?.connected) {
            clientRef.current.deactivate();
          }
        } else {
          setConnectionError(
            new Error(frame.headers["message"] || "STOMP error")
          );
          setIsConnected(false);
        }
      },
      onWebSocketClose: () => {
        setIsConnected(false);
        retryCountRef.current += 1;
        if (retryCountRef.current >= maxRetries) {
          setConnectionError(
            new Error(
              "Failed to connect to chat service after multiple attempts. Please refresh the page."
            )
          );
          setIsConnecting(false);
        }
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
        retryCountRef.current += 1;
        if (retryCountRef.current >= maxRetries) {
          setConnectionError(
            new Error(
              "Failed to connect to chat service after multiple attempts. Please refresh the page."
            )
          );
          setIsConnecting(false);
          setIsConnected(false);
          if (clientRef.current?.connected) {
            clientRef.current.deactivate();
          }
        } else {
          setConnectionError(new Error("WebSocket connection error"));
          setIsConnected(false);
        }
      },
    });

    clientRef.current = client;

    setIsConnecting(true);
    client.activate();

    return () => {
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, user]);

  const sendMessage = (chatId: string, content: string) => {
    if (!clientRef.current?.connected) {
      console.error("WebSocket not connected");
      return;
    }

    clientRef.current.publish({
      destination: `/app/chat/${chatId}/send`,
      body: JSON.stringify({ content }),
    });
  };

  const sendTypingIndicator = (chatId: string) => {
    if (!clientRef.current?.connected) {
      return;
    }

    clientRef.current.publish({
      destination: `/app/chat/${chatId}/typing`,
      body: JSON.stringify({}),
    });
  };

  const subscribeToChat = (
    chatId: string,
    callback: (message: any) => void
  ) => {
    if (!clientRef.current?.connected) {
      console.warn("Cannot subscribe: WebSocket not connected");
      return () => {};
    }

    const subscription = clientRef.current.subscribe(
      `/topic/chat/${chatId}`,
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    );

    const key = `chat-${chatId}`;
    subscriptionsRef.current.set(key, subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(key);
    };
  };

  const subscribeToUserQueue = (callback: (message: any) => void) => {
    if (!clientRef.current?.connected || !user) {
      console.warn(
        "Cannot subscribe: WebSocket not connected or user not available"
      );
      return () => {};
    }

    const subscription = clientRef.current.subscribe(
      `/user/${user.id}/queue/messages`,
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    );

    const key = "user-queue";
    subscriptionsRef.current.set(key, subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(key);
    };
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isConnecting,
        connectionError,
        sendMessage,
        sendTypingIndicator,
        subscribeToChat,
        subscribeToUserQueue,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
