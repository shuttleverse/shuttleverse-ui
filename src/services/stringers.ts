import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/api/axios";

export type StringerFormScheduleData = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

export type StringerFormPriceData = {
  stringName: string;
  price: number;
};

export type StringerFormData = {
  name: string;
  location?: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  otherContacts: string;
  schedules: StringerFormScheduleData[];
  prices: StringerFormPriceData[];
};

type StringerCreationAPIData = {
  name: string;
  location?: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  otherContacts: string;
};

export function useStringers(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["stringers", filters],
    queryFn: async ({ queryKey, pageParam = 0, signal }) => {
      const [_, queryFilters] = queryKey;
      const { data } = await api.get("/api/community/v1/stringer", {
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

export function useCreateStringer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stringerData: StringerFormData) => {
      const stringerAPIData: StringerCreationAPIData = {
        name: stringerData.name,
        location: stringerData.location,
        description: stringerData.description,
        website: stringerData.website,
        phoneNumber: stringerData.phoneNumber,
        otherContacts: stringerData.otherContacts,
      };
      const { data } = await api.post(
        "/api/community/v1/stringer",
        stringerAPIData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stringers"] });
    },
  });
}

export function useAddStringerSchedule() {
  return useMutation({
    mutationFn: async (params: {
      stringerId: string;
      scheduleData: StringerFormScheduleData[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/stringer/${params.stringerId}/schedule`,
        params.scheduleData
      );
      return data;
    },
  });
}

export function useAddStringerPrice() {
  return useMutation({
    mutationFn: async (params: {
      stringerId: string;
      priceData: StringerFormPriceData[];
    }) => {
      const { data } = await api.post(
        `/api/community/v1/stringer/${params.stringerId}/price`,
        params.priceData
      );
      return data;
    },
  });
}
