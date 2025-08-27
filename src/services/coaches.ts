import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import api from "@/api/axios";
import { queryClient } from "@/api/query-client";
import type { ScheduleData } from "@/components/forms/schedule-calendar";

export type CoachFormScheduleData = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type CoachFormPriceData = {
  minPrice: number;
  maxPrice: number;
  duration: number;
  durationUnit: string;
  description?: string;
};

export type CoachFormData = {
  name: string;
  location?: string;
  longitude?: string;
  latitude?: string;
  description?: string;
  experienceYears?: number;
  phoneNumber?: string;
  otherContacts: Record<string, string>;
  schedules: CoachFormScheduleData[];
  prices: CoachFormPriceData[];
};

type CoachCreationAPIData = {
  name: string;
  location: string;
  locationPoint: {
    longitude: string;
    latitude: string;
  };
  description?: string;
  experienceYears?: number;
  website?: string;
  phoneNumber?: string;
  otherContacts: Record<string, string>;
};

export type CoachScheduleData = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  upvotes: number;
  submittedBy: {
    id: string;
    username: string;
  };
  updatedAt: string;
};

export type CoachPriceData = {
  id: string;
  minPrice: number;
  maxPrice: number;
  duration: number;
  durationUnit: string;
  description?: string;
  upvotes: number;
  submittedBy: {
    id: string;
    username: string;
  };
  updatedAt: string;
};

export type CoachData = {
  id: string;
  type: "coach";
  name: string;
  location: string;
  locationPoint: {
    longitude: string;
    latitude: string;
  };
  description?: string;
  experienceYears?: number;
  phoneNumber?: string;
  otherContacts: Record<string, string>;
  scheduleList: CoachScheduleData[];
  priceList: CoachPriceData[];
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

export function useCoaches(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["coaches", filters],
    queryFn: async ({ queryKey, pageParam = 0, signal }) => {
      const [_, queryFilters] = queryKey;
      const { data } = await api.get("/api/community/v1/coach", {
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

export function useCreateCoach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coachData: CoachFormData) => {
      const coachAPIData: CoachCreationAPIData = {
        name: coachData.name,
        location: coachData.location,
        ...(coachData.longitude &&
          coachData.latitude && {
            locationPoint: {
              longitude: coachData.longitude,
              latitude: coachData.latitude,
            },
          }),
        description: coachData.description,
        experienceYears: coachData.experienceYears,
        phoneNumber: coachData.phoneNumber,
        otherContacts: coachData.otherContacts,
      };
      const { data } = await api.post("/api/community/v1/coach", coachAPIData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
    },
  });
}

export function useAddCoachSchedule() {
  return useMutation({
    mutationFn: async (params: {
      coachId: string;
      scheduleData: CoachFormScheduleData[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/coach/${params.coachId}/schedule`,
        params.scheduleData
      );
      return data;
    },
  });
}

export function useAddCoachPrice() {
  return useMutation({
    mutationFn: async (params: {
      coachId: string;
      priceData: CoachFormPriceData[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/coach/${params.coachId}/price`,
        params.priceData
      );
      return data;
    },
  });
}

export function useCoach(id: string) {
  return useQuery({
    queryKey: ["coach", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/community/v1/coach/${id}`);
      return {
        ...data.data,
        type: "coach" as const,
        schedules: data.data.scheduleList || [],
        prices: data.data.priceList || [],
      };
    },
  });
}

export function useUpvoteCoachSchedule() {
  return useMutation({
    mutationFn: async (params: { coachId: string; scheduleId: string }) => {
      const { data } = await api.post(
        `/api/community/v1/coach/schedule/${params.scheduleId}/upvote`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
    },
  });
}

export function useUpvoteCoachPrice() {
  return useMutation({
    mutationFn: async (params: { coachId: string; priceId: string }) => {
      const { data } = await api.post(
        `/api/community/v1/coach/price/${params.priceId}/upvote`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
    },
  });
}

export function useUpdateCoach() {
  return useMutation({
    mutationFn: async (params: {
      coachId: string;
      coachData: CoachCreationAPIData;
    }) => {
      const { data } = await api.put(
        `/api/community/v1/coach/${params.coachId}`,
        params.coachData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
    },
  });
}

export function useUpdateCoachSchedules() {
  return useMutation({
    mutationFn: async (params: {
      coachId: string;
      schedules: ScheduleData[];
    }) => {
      const { data } = await api.put(
        `/api/community/v1/coach/${params.coachId}/schedules`,
        params.schedules
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
    },
  });
}

export function useUpdateCoachPrices() {
  return useMutation({
    mutationFn: async (params: {
      coachId: string;
      prices: CoachFormPriceData[];
    }) => {
      const { data } = await api.put(
        `/api/community/v1/coach/${params.coachId}/prices`,
        params.prices
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
    },
  });
}
