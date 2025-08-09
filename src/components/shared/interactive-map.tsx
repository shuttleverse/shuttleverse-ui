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
import { MapPinIcon, Maximize2 } from "lucide-react";
import { MapEntity, BoundingBox } from "@/services/map";
import {
  useCourtsByBoundingBox,
  useCoachesByBoundingBox,
  useStringersByBoundingBox,
} from "@/services/map";
import { Link, useNavigate } from "react-router-dom";
import { CustomMarkerIcon } from "./custom-map-marker";
import MarkerCluster from "./marker-cluster";
import MapController from "./map-controller";
import { useIsMobile } from "@/hooks/use-mobile";
import MapSidePanel from "./map-side-panel";
import SelectedEntityDetails from "./selected-entity-details";
import { useLocationContext } from "@/hooks/use-location-context";
import "./interactive-map.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const DEFAULT_LOCATION = {
  lat: 42.3601,
  lng: -71.0589,
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
  overflow: "hidden",
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
  const navigate = useNavigate();

  const handleViewDetails = () => {
    const path = `/${entity.type}s/${entity.id}`;
    navigate(path);
  };

  return (
    <InfoWindow
      position={{
        lat: parseFloat(entity.locationPoint.latitude),
        lng: parseFloat(entity.locationPoint.longitude),
      }}
      onCloseClick={onClose}
    >
      <div className="p-2">
        <h3 className="font-semibold text-gray-900 mb-1">{entity.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{entity.location}</p>
        <button
          onClick={handleViewDetails}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View Details →
        </button>
      </div>
    </InfoWindow>
  );
};

interface InteractiveMapProps {
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
  onEntitiesChange?: (entities: MapEntity[]) => void;
  fullScreen?: boolean;
  defaultZoom?: number;
  selectedEntity?: MapEntity | null;
  onEntitySelect?: (entity: MapEntity | null) => void;
  showSidePanel?: boolean;
  canShowDualPanels?: boolean;
  activeFilters?: Set<string>;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mapRef: externalMapRef,
  onEntitiesChange,
  fullScreen,
  defaultZoom,
  selectedEntity: externalSelectedEntity,
  onEntitySelect,
  showSidePanel = true,
  canShowDualPanels = true,
  activeFilters,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { locationData } = useLocationContext();
  const [internalSelectedEntity, setInternalSelectedEntity] =
    useState<MapEntity | null>(null);
  const selectedEntity =
    externalSelectedEntity !== undefined
      ? externalSelectedEntity
      : internalSelectedEntity;
  const setSelectedEntity = useMemo(
    () =>
      externalSelectedEntity !== undefined
        ? onEntitySelect || (() => {})
        : setInternalSelectedEntity,
    [externalSelectedEntity, onEntitySelect, setInternalSelectedEntity]
  );

  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const internalMapRef = useRef<google.maps.Map | null>(null);
  const mapRef = externalMapRef || internalMapRef;

  const getInitialCenter = () => {
    if (locationData.coordinates) {
      return {
        lat: parseFloat(locationData.coordinates.latitude),
        lng: parseFloat(locationData.coordinates.longitude),
      };
    }
    return DEFAULT_LOCATION;
  };

  const [center, setCenter] = useState(getInitialCenter());

  useEffect(() => {
    if (locationData.coordinates) {
      const newCenter = {
        lat: parseFloat(locationData.coordinates.latitude),
        lng: parseFloat(locationData.coordinates.longitude),
      };
      setCenter(newCenter);
    }
  }, [locationData.coordinates]);

  useEffect(() => {
    if (locationData.coordinates) {
      const newCenter = {
        lat: parseFloat(locationData.coordinates.latitude),
        lng: parseFloat(locationData.coordinates.longitude),
      };
      setCenter(newCenter);

      if (mapRef.current) {
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(12);
      }
    }
  }, [locationData.coordinates, mapRef]);

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

  const onMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
  );

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

    const allEntities = [...courts, ...coaches, ...stringers];

    // Filter entities based on activeFilters if provided
    if (activeFilters) {
      return allEntities.filter((entity) => activeFilters.has(entity.type));
    }

    return allEntities;
  }, [courtsQuery.data, coachesQuery.data, stringersQuery.data, activeFilters]);

  const handleMarkerClick = useCallback(
    (entity: MapEntity) => {
      setSelectedEntity(entity);
    },
    [setSelectedEntity]
  );

  const handleInfoWindowClose = useCallback(() => {
    setSelectedEntity(null);
  }, [setSelectedEntity]);

  const renderRightPanel = () => {
    if (!selectedEntity) {
      return null;
    }

    return (
      <div className="absolute top-4 left-4 w-96 h-[calc(100%-5rem)] bg-transparent overflow-hidden flex flex-col z-10">
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {selectedEntity.name}
                </h3>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SelectedEntityDetails
              entity={
                selectedEntity as MapEntity & {
                  phoneNumber?: string;
                  website?: string;
                  otherContacts?: string;
                  additionalDetails?: string;
                  experience_years?: number;
                  scheduleList?: unknown[];
                  priceList?: unknown[];
                  upvotes?: number;
                }
              }
              fullEntityData={
                selectedEntity as MapEntity & {
                  phoneNumber?: string;
                  website?: string;
                  otherContacts?: string;
                  additionalDetails?: string;
                  experience_years?: number;
                  scheduleList?: unknown[];
                  priceList?: unknown[];
                  upvotes?: number;
                }
              }
              isLoading={false}
              onBack={() => setSelectedEntity(null)}
              onViewDetails={(entity) => {
                const path = `/${entity.type}s/${entity.id}`;
                navigate(path);
              }}
              showBackButton={!canShowDualPanels}
              transparentBackground={true}
            />
          </div>
        </div>
      </div>
    );
  };

  const handlePanToEntity = useCallback(
    (entity: MapEntity) => {
      if (mapRef.current && entity.locationPoint) {
        mapRef.current.panTo({
          lat: parseFloat(entity.locationPoint.latitude),
          lng: parseFloat(entity.locationPoint.longitude),
        });
        mapRef.current.setZoom(14);
        setSelectedEntity(entity);
      }
    },
    [mapRef, setSelectedEntity]
  );

  useEffect(() => {
    if (onEntitiesChange) {
      onEntitiesChange(allEntities);
    }
  }, [allEntities, onEntitiesChange]);

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
      className={fullScreen ? "" : "bg-white rounded-xl shadow-lg p-6"}
      style={
        fullScreen
          ? {
              width: "100vw",
              height: "100vh",
              padding: 0,
              borderRadius: 0,
              boxShadow: "none",
            }
          : {
              width: "100%",
              height: "100%",
            }
      }
    >
      <div
        className={fullScreen ? "" : "responsive-map-container"}
        style={{
          width: "100%",
          position: "relative",
          height: fullScreen ? "100vh" : "calc(100% - 3rem)",
          borderRadius: fullScreen ? "0" : "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!fullScreen && (
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold">Near By</h2>
            <div className="flex items-center gap-4">
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
              <button
                onClick={() => navigate("/map")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                title="Open fullscreen map"
              >
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </button>
            </div>
          </div>
        )}
        <div className="relative w-full flex-1">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              mapId="shuttleverse-map"
              style={mapContainerStyle}
              defaultCenter={center}
              defaultZoom={defaultZoom ?? 12}
              disableDefaultUI={true}
              tilt={30}
              renderingType="VECTOR"
              gestureHandling="greedy"
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

              {showSidePanel && (
                <MapSidePanel
                  entities={allEntities}
                  selectedEntity={selectedEntity}
                  onEntityClick={handlePanToEntity}
                  onLocationClick={() => {
                    if (mapRef.current) {
                      if (locationData.coordinates) {
                        mapRef.current.panTo({
                          lat: parseFloat(locationData.coordinates.latitude),
                          lng: parseFloat(locationData.coordinates.longitude),
                        });
                      } else {
                        mapRef.current.panTo(DEFAULT_LOCATION);
                      }
                      mapRef.current.setZoom(defaultZoom ?? 12);
                    }
                  }}
                />
              )}
            </Map>
          </APIProvider>

          {/* Right Panel - Entity Details */}
          {selectedEntity && !isMobile && renderRightPanel()}
        </div>
      </div>

      {(courtsQuery.isLoading ||
        coachesQuery.isLoading ||
        stringersQuery.isLoading) && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-1">Loading entities...</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
