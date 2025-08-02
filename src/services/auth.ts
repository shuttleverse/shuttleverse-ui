import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

export function useAuthStatus() {
  return useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const { data } = await api.get("/api/auth/status", {
        withCredentials: true,
      });
      return data;
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/home";
    },
    onError: () => {
      queryClient.clear();
      window.location.href = "/home";
    },
  });
}
