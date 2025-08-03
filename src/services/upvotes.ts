import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/axios";

export type UpvoteQueryData = {
  entityId?: string;
  entityType: 0 | 1 | 2; // 0: court, 1: stringer, 2: coach
  infoType: 0 | 1; // 0: schedule, 1: price
};

export type UpvoteData = {
  upvoteId: string;
  upvoteCreator: {
    id: string;
    username: string;
    bio?: string;
  };
  entityType: "COURT" | "STRINGER" | "COACH";
  infoType: "SCHEDULE" | "PRICE";
  entity: {
    id: string;
    name: string;
    location?: string;
    locationPoint?: {
      longitude?: string;
      latitude?: string;
    };
    description?: string;
    phoneNumber?: string;
    otherContacts?: string;
  };
  createdAt: string;
};

export function useUpvotes(filters: UpvoteQueryData, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ["upvotes", filters],
    queryFn: async ({ queryKey, pageParam = 0, signal }) => {
      const [_, queryFilters] = queryKey;
      const { data } = await api.get("/api/community/v1/upvote", {
        params: {
          page: pageParam,
          ...(typeof queryFilters === "object" ? queryFilters : {}),
        },
        signal,
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.last) return undefined;
      return lastPage.data.number + 1;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
