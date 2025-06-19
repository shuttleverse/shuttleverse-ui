import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import api from "@/api/axios";

export type CoachFormScheduleData = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type CoachFormPriceData = {
  price: number;
  duration: number;
};

export type CoachFormData = {
  name: string;
  location?: string;
  longitude?: string;
  latitude?: string;
  description?: string;
  experience_years?: number;
  phoneNumber?: string;
  otherContacts: string;
  schedules: CoachFormScheduleData[];
  prices: CoachFormPriceData[];
};

type CoachCreationAPIData = {
  name: string;
  location?: string;
  locationPoint?: {
    longitude?: string;
    latitude?: string;
  };
  description?: string;
  experience_years?: number;
  website?: string;
  phoneNumber?: string;
  otherContacts: string;
};

export type CoachScheduleData = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  upvotes: number;
};

export type CoachPriceData = {
  id: string;
  price: number;
  duration: number;
  upvotes: number;
};

export type CoachData = {
  id: string;
  type: "coach";
  name: string;
  location?: string;
  description?: string;
  experience_years?: number;
  phoneNumber?: string;
  otherContacts: string;
  isVerified: boolean;
  scheduleList: CoachScheduleData[];
  priceList: CoachPriceData[];
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
        experience_years: coachData.experience_years,
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
  });
}
