import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";

export type LocationPoint = {
  longitude: string;
  latitude: string;
};

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export type MapEntity = {
  id: string;
  type: "court" | "coach" | "stringer";
  name: string;
  location: string;
  locationPoint: LocationPoint;
  description?: string;
  isVerified: boolean;
  owner?: { id: string };
  scheduleList?: unknown[];
  priceList?: unknown[];
  phoneNumber?: string;
  website?: string;
  otherContacts?: Record<string, string>;
  additionalDetails?: string;
  experienceYears?: number;
};

export function useEntitiesByLocation(
  entityType: "court" | "coach" | "stringer",
  location: LocationPoint,
  radiusInMeters: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [`${entityType}s-by-location`, location, radiusInMeters],
    queryFn: async () => {
      const { data } = await api.get(`/api/community/v1/${entityType}/within`, {
        params: {
          point: location,
          radius: radiusInMeters,
        },
      });
      return data.data.content.map((entity: unknown) => {
        const entityObj = entity as Record<string, unknown>;
        const locationPoint = entityObj.locationPoint as LocationPoint;

        return {
          id: entityObj.id as string,
          name: entityObj.name as string,
          location: entityObj.location as string,
          locationPoint: locationPoint,
          description: entityObj.description as string | undefined,
          isVerified: entityObj.isVerified as boolean,
          owner: entityObj.owner as { id: string } | undefined,
          type: entityType,
          scheduleList: entityObj.scheduleList as unknown[] | undefined,
          priceList: entityObj.priceList as unknown[] | undefined,
          phoneNumber: entityObj.phoneNumber as string | undefined,
          website: entityObj.website as string | undefined,
          otherContacts: entityObj.otherContacts as
            | Record<string, string>
            | undefined,
          additionalDetails: entityObj.additionalDetails as string | undefined,
          experienceYears: entityObj.experienceYears as number | undefined,
        } as MapEntity;
      });
    },
    enabled: enabled && !!location.longitude && !!location.latitude,
  });
}

export function useEntitiesByBoundingBox(
  entityType: "court" | "coach" | "stringer",
  boundingBox: BoundingBox,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [`${entityType}s-by-bbox`, boundingBox],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/community/v1/${entityType}/bbox?minLat=${boundingBox.minLat}&minLon=${boundingBox.minLon}&maxLat=${boundingBox.maxLat}&maxLon=${boundingBox.maxLon}`
      );
      return data.data.content.map((entity: unknown) => {
        const entityObj = entity as Record<string, unknown>;
        return {
          id: entityObj.id as string,
          name: entityObj.name as string,
          location: entityObj.location as string,
          locationPoint: entityObj.locationPoint as LocationPoint,
          description: entityObj.description as string | undefined,
          isVerified: entityObj.isVerified as boolean,
          owner: entityObj.owner as { id: string } | undefined,
          type: entityType,
          scheduleList: entityObj.scheduleList as unknown[] | undefined,
          priceList: entityObj.priceList as unknown[] | undefined,
          phoneNumber: entityObj.phoneNumber as string | undefined,
          website: entityObj.website as string | undefined,
          otherContacts: entityObj.otherContacts as
            | Record<string, string>
            | undefined,
          additionalDetails: entityObj.additionalDetails as string | undefined,
          experienceYears: entityObj.experienceYears as number | undefined,
        } as MapEntity;
      });
    },
    enabled: enabled && !!boundingBox,
  });
}

export function useCourtsByLocation(
  location: LocationPoint,
  radiusInMeters: number,
  enabled: boolean = true
) {
  return useEntitiesByLocation("court", location, radiusInMeters, enabled);
}

export function useCoachesByLocation(
  location: LocationPoint,
  radiusInMeters: number,
  enabled: boolean = true
) {
  return useEntitiesByLocation("coach", location, radiusInMeters, enabled);
}

export function useStringersByLocation(
  location: LocationPoint,
  radiusInMeters: number,
  enabled: boolean = true
) {
  return useEntitiesByLocation("stringer", location, radiusInMeters, enabled);
}

export function useCourtsByBoundingBox(
  boundingBox: BoundingBox,
  enabled: boolean = true
) {
  return useEntitiesByBoundingBox("court", boundingBox, enabled);
}

export function useCoachesByBoundingBox(
  boundingBox: BoundingBox,
  enabled: boolean = true
) {
  return useEntitiesByBoundingBox("coach", boundingBox, enabled);
}

export function useStringersByBoundingBox(
  boundingBox: BoundingBox,
  enabled: boolean = true
) {
  return useEntitiesByBoundingBox("stringer", boundingBox, enabled);
}
