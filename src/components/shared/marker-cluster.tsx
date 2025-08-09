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
            render: ({ count, position, markers }) => {
              const clusterElement = document.createElement("div");
              clusterElement.className = "cluster-marker";

              const clusterEntities = markers
                .map((marker) => {
                  const entityIndex = markersRef.current.indexOf(
                    marker as google.maps.marker.AdvancedMarkerElement
                  );
                  return entities[entityIndex];
                })
                .filter(Boolean);

              const entityBreakdown = getEntityBreakdown(clusterEntities);
              console.log(
                "Cluster breakdown:",
                entityBreakdown,
                "Total:",
                count
              );

              clusterElement.style.cssText = `
                background: conic-gradient(
                  ${createPieChartGradient(entityBreakdown, count)}
                );
                border: 3px solid white;
                border-radius: 50%;
                color: white;
                font-weight: bold;
                font-size: 14px;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
              `;

              const countElement = document.createElement("div");
              countElement.textContent = count.toString();
              countElement.style.cssText = `
                font-size: 16px;
                font-weight: bold;
                line-height: 1;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
              `;

              clusterElement.appendChild(countElement);

              clusterElement.addEventListener("mouseenter", () => {
                clusterElement.style.transform = "scale(1.1)";
                clusterElement.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
              });

              clusterElement.addEventListener("mouseleave", () => {
                clusterElement.style.transform = "scale(1)";
                clusterElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
              });

              clusterElement.addEventListener("click", () => {
                if (count > 1) {
                  const bounds = new google.maps.LatLngBounds();
                  clusterEntities.forEach((entity) => {
                    bounds.extend({
                      lat: parseFloat(entity.locationPoint.latitude),
                      lng: parseFloat(entity.locationPoint.longitude),
                    });
                  });
                  map.fitBounds(bounds, 50);
                }
              });

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

const getEntityBreakdown = (entities: MapEntity[]) => {
  return entities.reduce((acc, entity) => {
    acc[entity.type] = (acc[entity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const createPieChartGradient = (
  breakdown: Record<string, number>,
  total: number
) => {
  const colors = {
    court: "#10b981",
    coach: "#3b82f6",
    stringer: "#f59e0b",
  };

  let currentAngle = 0;
  const segments: string[] = [];

  if (breakdown.court > 0) {
    const percentage = (breakdown.court / total) * 360;
    const endAngle = currentAngle + percentage;
    segments.push(`${colors.court} ${currentAngle}deg ${endAngle}deg`);
    currentAngle = endAngle;
  }

  if (breakdown.coach > 0) {
    const percentage = (breakdown.coach / total) * 360;
    const endAngle = currentAngle + percentage;
    segments.push(`${colors.coach} ${currentAngle}deg ${endAngle}deg`);
    currentAngle = endAngle;
  }

  if (breakdown.stringer > 0) {
    const percentage = (breakdown.stringer / total) * 360;
    const endAngle = currentAngle + percentage;
    segments.push(`${colors.stringer} ${currentAngle}deg ${endAngle}deg`);
  }

  if (segments.length === 0) {
    return "#6b7280";
  }

  if (segments.length === 1) {
    const color = segments[0].split(" ")[0];
    return `${color} 0deg 360deg`;
  }

  return segments.join(", ");
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
  svg.setAttribute("width", "36");
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
