import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/api/axios";

export type CourtSchedule = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

export type CourtPrice = {
  price: number;
  duration: number;
};

export type CourtFormData = {
  name: string;
  location: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  schedules: CourtSchedule[];
  prices: CourtPrice[];
};

type CourtAPIData = {
  name: string;
  location: string;
  description: string;
  website: string;
  phoneNumber: string;
};

export function useCourts(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["courts", filters],
    queryFn: async ({ queryKey, pageParam = 0, signal }) => {
      const [_, queryFilters] = queryKey;
      const { data } = await api.get("/api/community/v1/court", {
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
  });
}

export function useCreateCourt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courtData: CourtFormData) => {
      const courtAPIData: CourtAPIData = {
        name: courtData.name,
        location: courtData.location,
        description: courtData.description,
        website: courtData.website,
        phoneNumber: courtData.phoneNumber,
      };
      const { data } = await api.post("/api/community/v1/court", courtAPIData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}

export function useAddCourtSchedule() {
  return useMutation({
    mutationFn: async (params: {
      courtId: string;
      scheduleData: CourtSchedule[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/court/${params.courtId}/schedule`,
        params.scheduleData
      );
      return data;
    },
  });
}

export function useAddCourtPrice() {
  return useMutation({
    mutationFn: async (params: {
      courtId: string;
      priceData: CourtPrice[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/court/${params.courtId}/price`,
        params.priceData
      );
      return data;
    },
  });
}
