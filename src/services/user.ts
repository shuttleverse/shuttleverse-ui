import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

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
  return useMutation({
    mutationFn: async (profile: { username: string; bio: string }) => {
      const { data } = await api.post("/api/community/v1/user/me", profile);
      return data;
    },
  });
}
