import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import api from "@/api/axios";
import { queryClient } from "@/api/query-client";

export type StringerFormPriceData = {
  stringName: string;
  price: number;
};

export type StringerFormData = {
  name: string;
  location?: string;
  longitude?: string;
  latitude?: string;
  description?: string;
  phoneNumber?: string;
  additionalDetails?: string;
  otherContacts: Record<string, string>;
  prices: StringerFormPriceData[];
};

type StringerCreationAPIData = {
  name: string;
  location: string;
  locationPoint: {
    longitude: string;
    latitude: string;
  };
  description?: string;
  website?: string;
  phoneNumber?: string;
  additionalDetails?: string;
  otherContacts: Record<string, string>;
};

export type StringerPriceData = {
  id: string;
  stringName: string;
  price: number;
  upvotes: number;
};

export type StringerData = {
  id: string;
  type: "stringer";
  name: string;
  location: string;
  locationPoint: {
    longitude: string;
    latitude: string;
  };
  additionalDetails?: string;
  description?: string;
  phoneNumber?: string;
  otherContacts: Record<string, string>;
  priceList: StringerPriceData[];
  upvotes: number;
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
        ...(stringerData.longitude &&
          stringerData.latitude && {
            locationPoint: {
              longitude: stringerData.longitude,
              latitude: stringerData.latitude,
            },
          }),
        description: stringerData.description,
        phoneNumber: stringerData.phoneNumber,
        additionalDetails: stringerData.additionalDetails,
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

export function useStringer(id: string) {
  return useQuery({
    queryKey: ["stringer", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/community/v1/stringer/${id}`);
      return {
        ...data.data,
        type: "stringer" as const,
      };
    },
  });
}

export function useUpvoteStringerPrice() {
  return useMutation({
    mutationFn: async (params: { stringerId: string; priceId: string }) => {
      const { data } = await api.post(
        `/api/community/v1/stringer/price/${params.priceId}/upvote`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["stringer"] });
    },
  });
}

export function useUpdateStringer() {
  return useMutation({
    mutationFn: async (params: {
      stringerId: string;
      stringerData: StringerCreationAPIData;
    }) => {
      const { data } = await api.put(
        `/api/community/v1/stringer/${params.stringerId}`,
        params.stringerData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stringers"] });
      queryClient.invalidateQueries({ queryKey: ["stringer"] });
    },
  });
}

export function useUpdateStringerPrices() {
  return useMutation({
    mutationFn: async (params: {
      stringerId: string;
      prices: StringerFormPriceData[];
    }) => {
      const { data } = await api.put(
        `/api/community/v1/stringer/${params.stringerId}/prices`,
        params.prices
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stringers"] });
      queryClient.invalidateQueries({ queryKey: ["stringer"] });
    },
  });
}
