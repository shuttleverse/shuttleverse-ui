import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { MapPinIcon } from "lucide-react";
import { MapEntity, LocationPoint, BoundingBox } from "@/services/map";
import {
  useCourtsByBoundingBox,
  useCoachesByBoundingBox,
  useStringersByBoundingBox,
} from "@/services/map";
import { Link } from "react-router-dom";
import { CustomMarkerIcon } from "./custom-map-marker";
import MarkerCluster from "./marker-cluster";
import MapController from "./map-controller";
import "./interactive-map.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const DEFAULT_LOCATION = {
  lat: 42.3601,
  lng: -71.0589,
};

const LOCAL_STORAGE_KEY = "shuttleverse_user_location";
const LOCATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export const CustomMarker: React.FC<{
  entity: MapEntity;
  onClick: () => void;
  isSelected: boolean;
}> = ({ entity, onClick }) => {
  const getMarkerBackground = (type: string) => {
    switch (type) {
      case "court":
        return "#10b981";
      case "coach":
        return "#3b82f6";
      case "stringer":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <AdvancedMarker
      position={{
        lat: parseFloat(entity.locationPoint.latitude),
        lng: parseFloat(entity.locationPoint.longitude),
      }}
      onClick={onClick}
      title={entity.name}
    >
      <Pin
        background={getMarkerBackground(entity.type)}
        glyphColor="white"
        borderColor="white"
        scale={1.2}
      />
    </AdvancedMarker>
  );
};

const EntityInfoWindow: React.FC<{
  entity: MapEntity;
  onClose: () => void;
}> = ({ entity, onClose }) => {
  const getEntityIcon = (type: string) => {
    return (
      <CustomMarkerIcon
        type={type as "court" | "coach" | "stringer"}
        size={16}
      />
    );
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case "court":
        return "text-emerald-600";
      case "coach":
        return "text-blue-600";
      case "stringer":
        return "text-amber-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <InfoWindow
      position={{
        lat: parseFloat(entity.locationPoint.latitude),
        lng: parseFloat(entity.locationPoint.longitude),
      }}
      onCloseClick={onClose}
    >
      <div className="p-2 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          {getEntityIcon(entity.type)}
          <span
            className={`font-semibold capitalize ${getEntityColor(
              entity.type
            )}`}
          >
            {entity.type}
          </span>
          {entity.isVerified && (
            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              Verified
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-900 mb-1">{entity.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{entity.location}</p>
        {entity.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {entity.description}
          </p>
        )}
        <Link
          to={`/${entity.type}s/${entity.id}`}
          className="inline-block bg-emerald-600 text-white text-sm px-3 py-1 rounded hover:bg-emerald-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </InfoWindow>
  );
};

interface InteractiveMapProps {
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
  onEntitiesChange?: (entities: MapEntity[], bbox: BoundingBox | null) => void;
  fullScreen?: boolean;
  defaultZoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mapRef: externalMapRef,
  onEntitiesChange,
  fullScreen,
  defaultZoom,
}) => {
  const [center, setCenter] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            parsed.latitude &&
            parsed.longitude &&
            parsed.timestamp &&
            Date.now() - parsed.timestamp < LOCATION_EXPIRY_MS
          ) {
            return {
              lat: parseFloat(parsed.latitude),
              lng: parseFloat(parsed.longitude),
            };
          }
        }
      } catch (e) {
        // Ignore JSON parse error
      }
    }
    return DEFAULT_LOCATION;
  });
  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const internalMapRef = useRef<google.maps.Map | null>(null);
  const mapRef = externalMapRef || internalMapRef;

  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setIsLoadingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            timestamp: Date.now(),
          };
          setUserLocation(userLoc);
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
          // Save to localStorage
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userLoc));
          } catch (e) {
            // Ignore localStorage error
          }
        },
        (error) => {
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    };

    getUserLocation();
  }, []);

  const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onBoundsChanged = useCallback(
    (bounds: { west: number; south: number; east: number; north: number }) => {
      if (boundsTimeoutRef.current) {
        clearTimeout(boundsTimeoutRef.current);
      }

      boundsTimeoutRef.current = setTimeout(() => {
        setBoundingBox({
          minLon: bounds.west,
          minLat: bounds.south,
          maxLon: bounds.east,
          maxLat: bounds.north,
        });
      }, 500);
    },
    []
  );

  const onMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    return () => {
      if (boundsTimeoutRef.current) {
        clearTimeout(boundsTimeoutRef.current);
      }
    };
  }, []);

  const courtsQuery = useCourtsByBoundingBox(boundingBox, true);
  const coachesQuery = useCoachesByBoundingBox(boundingBox, true);
  const stringersQuery = useStringersByBoundingBox(boundingBox, true);

  const allEntities = useMemo(() => {
    const courts = courtsQuery.data || [];
    const coaches = coachesQuery.data || [];
    const stringers = stringersQuery.data || [];

    return [...courts, ...coaches, ...stringers];
  }, [courtsQuery.data, coachesQuery.data, stringersQuery.data]);

  const handleMarkerClick = useCallback((entity: MapEntity) => {
    setSelectedEntity(entity);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  useEffect(() => {
    if (onEntitiesChange) {
      onEntitiesChange(allEntities, boundingBox);
    }
  }, [allEntities, boundingBox, onEntitiesChange]);

  if (isLoadingLocation) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Google Maps API key is required</p>
          <p className="text-sm text-gray-400">
            Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={fullScreen ? "" : "bg-white rounded-lg shadow-md p-6"}
      style={
        fullScreen
          ? {
              width: "100vw",
              height: "100vh",
              padding: 0,
              borderRadius: 0,
              boxShadow: "none",
            }
          : {}
      }
    >
      {!fullScreen && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Interactive Map</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Courts</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Coaches</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Stringers</span>
            </div>
          </div>
        </div>
      )}
      <div
        className={fullScreen ? "" : "responsive-map-container"}
        style={{
          width: "100%",
          position: "relative",
          height: fullScreen ? "100vh" : undefined,
        }}
      >
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <button
            type="button"
            aria-label="Go to my location"
            onClick={() => {
              if (mapRef.current) {
                if (userLocation) {
                  mapRef.current.panTo({
                    lat: parseFloat(userLocation.latitude),
                    lng: parseFloat(userLocation.longitude),
                  });
                } else {
                  mapRef.current.panTo(DEFAULT_LOCATION);
                }
                mapRef.current.setZoom(defaultZoom ?? 12);
              }
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 1001,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "box-shadow 0.2s, background 0.2s",
              outline: "none",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f0fdf4";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(16, 185, 129, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(16, 185, 129, 0.15)";
            }}
          >
            {/* Location SVG icon */}
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          </button>
          <Map
            mapId="shuttleverse-map"
            style={mapContainerStyle}
            defaultCenter={center}
            defaultZoom={defaultZoom ?? 12}
            disableDefaultUI={true}
            tilt={30}
            renderingType="VECTOR"
          >
            <MapController
              onMapReady={onMapReady}
              onBoundsChanged={onBoundsChanged}
            />

            <MarkerCluster
              entities={allEntities}
              onMarkerClick={handleMarkerClick}
              selectedEntity={selectedEntity}
              map={mapRef.current}
            />

            {selectedEntity && (
              <EntityInfoWindow
                entity={selectedEntity}
                onClose={handleInfoWindowClose}
              />
            )}
          </Map>
        </APIProvider>
      </div>

      {(courtsQuery.isLoading ||
        coachesQuery.isLoading ||
        stringersQuery.isLoading) && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-1">Loading entities...</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-center">
        Found {allEntities.length} entities in this area
      </div>
    </div>
  );
};

export default InteractiveMap;
