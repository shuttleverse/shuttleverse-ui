import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import api from "@/api/axios";
import { queryClient } from "@/api/query-client";
import type { ScheduleData } from "@/components/forms/schedule-calendar";

export type CourtFormScheduleData = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type CourtFormPriceData = {
  minPrice: number;
  maxPrice: number;
  duration: number;
  durationUnit: string;
  description?: string;
};

export type CourtFormData = {
  name: string;
  location: string;
  longitude: string;
  latitude: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  otherContacts?: Record<string, string>;
  schedules: CourtFormScheduleData[];
  prices: CourtFormPriceData[];
};

type CourtCreationAPIData = {
  name: string;
  location: string;
  locationPoint: {
    longitude: string;
    latitude: string;
  };
  description: string;
  website: string;
  phoneNumber: string;
  otherContacts?: Record<string, string>;
};

export type CourtScheduleData = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  upvotes: number;
  submittedBy?: {
    username: string;
  };
  updatedAt?: string;
};

export type CourtPriceData = {
  id: string;
  minPrice: number;
  maxPrice: number;
  duration: number;
  durationUnit: string;
  description?: string;
  upvotes: number;
  submittedBy?: {
    username: string;
  };
  updatedAt?: string;
};

export type CourtData = {
  id: string;
  type: "court";
  name: string;
  location: string;
  locationPoint: {
    longitude: string;
    latitude: string;
  };
  description?: string;
  website?: string;
  phoneNumber?: string;
  otherContacts?: Record<string, string>;
  scheduleList: CourtScheduleData[];
  priceList: CourtPriceData[];
  owner?: {
    id: string;
    username: string;
  };
  creator: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
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
      if (!lastPage?.data?.content || lastPage.data.last) {
        return undefined;
      }

      const currentPage = lastPage.data.page ?? 0;
      return currentPage + 1;
    },
    initialPageParam: 0,
  });
}

export function useCreateCourt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courtData: CourtFormData) => {
      const courtAPIData: CourtCreationAPIData = {
        name: courtData.name,
        location: courtData.location,
        ...(courtData.longitude &&
          courtData.latitude && {
            locationPoint: {
              longitude: courtData.longitude,
              latitude: courtData.latitude,
            },
          }),
        description: courtData.description,
        website: courtData.website,
        phoneNumber: courtData.phoneNumber,
        otherContacts: courtData.otherContacts,
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
      scheduleData: CourtFormScheduleData[];
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
      priceData: CourtFormPriceData[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/court/${params.courtId}/price`,
        params.priceData
      );
      return data;
    },
  });
}

export function useCourt(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["court", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/community/v1/court/${id}`);
      return {
        ...data.data,
        type: "court" as const,
        schedules: data.data.scheduleList || [],
        prices: data.data.priceList || [],
      };
    },
    enabled: options?.enabled !== false && !!id,
  });
}

export function useUpvoteCourtSchedule() {
  return useMutation({
    mutationFn: async (params: { courtId: string; scheduleId: string }) => {
      const { data } = await api.post(
        `/api/community/v1/court/schedule/${params.scheduleId}/upvote`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });
}

export function useUpvoteCourtPrice() {
  return useMutation({
    mutationFn: async (params: { courtId: string; priceId: string }) => {
      const { data } = await api.post(
        `/api/community/v1/court/price/${params.priceId}/upvote`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });
}

export function useUpdateCourt() {
  return useMutation({
    mutationFn: async (params: {
      courtId: string;
      courtData: CourtCreationAPIData;
    }) => {
      const { data } = await api.put(
        `/api/community/v1/court/${params.courtId}`,
        params.courtData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });
}

export function useUpdateCourtSchedules() {
  return useMutation({
    mutationFn: async (params: {
      courtId: string;
      schedules: ScheduleData[];
    }) => {
      const { data } = await api.put(
        `/api/community/v1/court/${params.courtId}/schedules`,
        params.schedules
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });
}

export function useUpdateCourtPrices() {
  return useMutation({
    mutationFn: async (params: {
      courtId: string;
      prices: CourtFormPriceData[];
    }) => {
      const { data } = await api.put(
        `/api/community/v1/court/${params.courtId}/prices`,
        params.prices
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      queryClient.invalidateQueries({ queryKey: ["court"] });
    },
  });
}
