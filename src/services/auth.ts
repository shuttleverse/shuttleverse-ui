import { useQuery } from "@tanstack/react-query";
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
