import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/api/axios";

export type CoachFormScheduleData = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

export type CoachFormPriceData = {
  price: number;
  duration: number;
};

export type CoachFormData = {
  name: string;
  location?: string;
  description?: string;
  experience_years?: number;
  website?: string;
  phoneNumber?: string;
  otherContacts: string;
  schedules: CoachFormScheduleData[];
  prices: CoachFormPriceData[];
};

type CoachCreationAPIData = {
  name: string;
  location?: string;
  description?: string;
  experience_years?: number;
  website?: string;
  phoneNumber?: string;
  otherContacts: string;
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
        description: coachData.description,
        experience_years: coachData.experience_years,
        website: coachData.website,
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
