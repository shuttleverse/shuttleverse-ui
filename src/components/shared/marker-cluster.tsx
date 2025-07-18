import React, { useEffect, useRef } from "react";
import { MarkerClusterer, GridAlgorithm } from "@googlemaps/markerclusterer";
import { MapEntity } from "@/services/map";

interface MarkerClusterProps {
  entities: MapEntity[];
  onMarkerClick: (entity: MapEntity) => void;
  selectedEntity: MapEntity | null;
  map: google.maps.Map | null;
}

const MarkerCluster: React.FC<MarkerClusterProps> = ({
  entities,
  onMarkerClick,
  selectedEntity,
  map,
}) => {
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!map) return;

    const loadAdvancedMarkers = async () => {
      try {
        // Load the advanced markers library dynamically
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          "marker"
        )) as google.maps.MarkerLibrary;

        if (clustererRef.current) {
          clustererRef.current.clearMarkers();
        }

        const markers = entities.map((entity) => {
          const marker = new AdvancedMarkerElement({
            position: {
              lat: parseFloat(entity.locationPoint.latitude),
              lng: parseFloat(entity.locationPoint.longitude),
            },
            title: entity.name,
            content: createMarkerContent(entity),
          });

          marker.addListener("click", () => {
            onMarkerClick(entity);
          });

          return marker;
        });

        markersRef.current = markers;

        clustererRef.current = new MarkerClusterer({
          map,
          markers,
          algorithm: new GridAlgorithm({
            maxZoom: 15,
            gridSize: 40,
          }),
          renderer: {
            render: ({ count, position }) => {
              const clusterElement = document.createElement("div");
              clusterElement.className = "cluster-marker";
              clusterElement.style.cssText = `
                background: #10b981;
                border: 2px solid white;
                border-radius: 50%;
                color: white;
                font-weight: bold;
                font-size: 14px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              `;
              clusterElement.textContent = count.toString();

              return new AdvancedMarkerElement({
                position,
                content: clusterElement,
              });
            },
          },
        });
      } catch (error) {
        console.error("Failed to load advanced markers:", error);
      }
    };

    loadAdvancedMarkers();

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, [entities, map, onMarkerClick]);

  // Update marker selection
  useEffect(() => {
    const updateMarkers = async () => {
      try {
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          "marker"
        )) as google.maps.MarkerLibrary;

        markersRef.current.forEach((marker, index) => {
          const entity = entities[index];
          if (entity) {
            const isSelected = selectedEntity?.id === entity.id;
            marker.content = createMarkerContent(entity, isSelected);
          }
        });
      } catch (error) {
        console.error("Failed to update markers:", error);
      }
    };

    updateMarkers();
  }, [selectedEntity, entities]);

  return null;
};

const createMarkerContent = (
  entity: MapEntity,
  isSelected: boolean = false
) => {
  const getMarkerColor = (type: string) => {
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

  const markerElement = document.createElement("div");
  markerElement.className = "custom-marker";
  markerElement.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${getMarkerColor(entity.type)};
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    ${isSelected ? "transform: scale(1.2); border-color: #fbbf24;" : ""}
  `;

  const iconElement = document.createElement("div");
  iconElement.textContent = entity.type.charAt(0).toUpperCase();
  markerElement.appendChild(iconElement);

  return markerElement;
};

export default MarkerCluster;
