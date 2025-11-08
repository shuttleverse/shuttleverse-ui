import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import type { UserDto } from "@/types/chat";

export function useUserProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await api.get("/api/community/v1/user/me");
      return data;
    },
    retry: false,
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { username: string; bio: string }) => {
      const { data } = await api.post("/api/community/v1/user/me", profile);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useSearchUsers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const { data } = await api.get<{
        data: Array<{
          id: string;
          username: string;
          email: string;
          bio?: string;
        }>;
      }>("/api/community/v1/user/search", {
        params: { query },
      });
      return data.data.map(
        (user): UserDto => ({
          id: user.id,
          username: user.username,
          email: user.email,
        })
      );
    },
    enabled: enabled && query.trim().length >= 2,
  });
}
