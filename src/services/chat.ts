import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import api from "@/api/axios";
import type {
  ChatResponse,
  ChatListResponse,
  MessageResponse,
  SendMessageRequest,
  CreateDirectChatRequest,
  CreateGroupChatRequest,
  AddParticipantRequest,
  UserDto,
} from "@/types/chat";

export function useChats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await api.get<{ data: ChatListResponse }>(
        "/api/connect/chats"
      );
      return data.data;
    },
    enabled,
  });
}

export function useChat(chatId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const { data } = await api.get<{ data: ChatResponse }>(
        `/api/connect/chats/${chatId}`
      );
      return data.data;
    },
    enabled: enabled && !!chatId,
  });
}

export function useChatMessages(chatId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await api.get<{
        data: {
          content: MessageResponse[];
          totalElements: number;
          totalPages: number;
          size: number;
          number: number;
          last: boolean;
        };
      }>(`/api/connect/chats/${chatId}/messages`, {
        params: {
          page: pageParam,
          size: 50,
        },
      });
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.last) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    enabled: enabled && !!chatId,
  });
}

export function useCreateDirectChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateDirectChatRequest) => {
      const { data } = await api.post<{ data: ChatResponse }>(
        "/api/connect/chats/direct",
        request
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useCreateGroupChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateGroupChatRequest) => {
      const { data } = await api.post<{ data: ChatResponse }>(
        "/api/connect/chats/group",
        request
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      request,
    }: {
      chatId: string;
      request: AddParticipantRequest;
    }) => {
      await api.post(`/api/connect/chats/${chatId}/participants`, request);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      participantId,
    }: {
      chatId: string;
      participantId: string;
    }) => {
      await api.delete(
        `/api/connect/chats/${chatId}/participants/${participantId}`
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.chatId],
      });
    },
  });
}

export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      await api.post(`/api/connect/chats/${chatId}/messages/read`);
    },
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
    },
  });
}

export function useUnreadCount(chatId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["unreadCount", chatId],
    queryFn: async () => {
      const { data } = await api.get<{ data: number }>(
        `/api/connect/chats/${chatId}/messages/unread`
      );
      return data.data;
    },
    enabled: enabled && !!chatId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSendMessageRest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      request,
    }: {
      chatId: string;
      request: SendMessageRequest;
    }) => {
      const { data } = await api.post<{ data: MessageResponse }>(
        `/api/connect/chats/${chatId}/messages`,
        request
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.chatId],
      });
    },
  });
}
