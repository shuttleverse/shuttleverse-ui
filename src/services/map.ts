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

        // Debug logging to check coordinate values
        console.log(`Entity ${entityObj.name} coordinates:`, {
          longitude: locationPoint?.longitude,
          latitude: locationPoint?.latitude,
          rawLocationPoint: entityObj.locationPoint,
        });

        return {
          id: entityObj.id as string,
          name: entityObj.name as string,
          location: entityObj.location as string,
          locationPoint: locationPoint,
          description: entityObj.description as string | undefined,
          isVerified: entityObj.isVerified as boolean,
          type: entityType,
        } as MapEntity;
      });
    },
    enabled: enabled && !!location.longitude && !!location.latitude,
  });
}

// Generic function to fetch entities by bounding box
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
          type: entityType,
        } as MapEntity;
      });
    },
    enabled: enabled && !!boundingBox,
  });
}

// Specific hooks for each entity type by location
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

// Specific hooks for each entity type by bounding box
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
