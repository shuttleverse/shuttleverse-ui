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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${getMarkerColor(entity.type)};
    border: 4px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    ${isSelected ? "transform: scale(1.2); border-color: #fbbf24;" : ""}
  `;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "");
  svg.setAttribute("height", "36");
  svg.setAttribute("viewBox", "0 0 36 36");

  const text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", "18");
  text.setAttribute("y", "23");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "16");
  text.setAttribute("font-family", "sans-serif");
  text.setAttribute("fill", "#fff");
  text.textContent = entity.type.charAt(0).toUpperCase();
  svg.appendChild(text);

  markerElement.innerHTML = "";
  markerElement.appendChild(svg);

  return markerElement;
};

export default MarkerCluster;
