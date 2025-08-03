import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import api from "@/api/axios";
import { queryClient } from "@/api/query-client";

export type CourtFormScheduleData = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

export type CourtFormPriceData = {
  price: number;
  duration: number;
};

export type CourtFormData = {
  name: string;
  location: string;
  longitude: string;
  latitude: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  otherContacts?: string;
  schedules: CourtFormScheduleData[];
  prices: CourtFormPriceData[];
};

type CourtCreationAPIData = {
  name: string;
  location: string;
  locationPoint: {
    longitude?: string;
    latitude?: string;
  };
  description: string;
  website: string;
  phoneNumber: string;
  otherContacts?: string;
};

export type CourtScheduleData = {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  upvotes: number;
  submittedBy?: {
    username: string;
  };
  updatedAt?: string;
};

export type CourtPriceData = {
  id: string;
  price: number;
  duration: number;
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
  description?: string;
  website?: string;
  phoneNumber?: string;
  otherContacts?: string;
  isVerified: boolean;
  scheduleList: CourtScheduleData[];
  priceList: CourtPriceData[];
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

export function useCourt(id: string) {
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
