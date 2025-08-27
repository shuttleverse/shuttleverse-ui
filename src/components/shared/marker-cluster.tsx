import React, { useEffect, useRef } from "react";
import { MarkerClusterer, GridAlgorithm } from "@googlemaps/markerclusterer";
import { MapEntity } from "@/services/map";
import { entityColors } from "@/lib/colors";

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
  const overlappingMarkersRef = useRef<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);
  const markerEntityMapRef = useRef<
    Map<google.maps.marker.AdvancedMarkerElement, MapEntity | MapEntity[]>
  >(new Map());

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

        const locationGroups = new Map<string, MapEntity[]>();

        entities.forEach((entity) => {
          const key = `${entity.locationPoint.latitude},${entity.locationPoint.longitude}`;
          if (!locationGroups.has(key)) {
            locationGroups.set(key, []);
          }
          locationGroups.get(key)!.push(entity);
        });

        const regularMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
        const overlappingMarkers: google.maps.marker.AdvancedMarkerElement[] =
          [];
        const markerEntityMap = new Map<
          google.maps.marker.AdvancedMarkerElement,
          MapEntity | MapEntity[]
        >();

        locationGroups.forEach((entitiesAtLocation, locationKey) => {
          if (entitiesAtLocation.length === 1) {
            const entity = entitiesAtLocation[0];
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

            regularMarkers.push(marker);
            markerEntityMap.set(marker, entity);
          } else {
            const firstEntity = entitiesAtLocation[0];
            const marker = new AdvancedMarkerElement({
              position: {
                lat: parseFloat(firstEntity.locationPoint.latitude),
                lng: parseFloat(firstEntity.locationPoint.longitude),
              },
              title: `${entitiesAtLocation.length} entities at this location`,
              content: createOverlappingMarkerContent(
                entitiesAtLocation,
                false
              ),
            });

            marker.addListener("click", () => {
              const position = marker.position as google.maps.LatLng;
              map.setCenter(position);
              map.setZoom(16);
            });

            overlappingMarkers.push(marker);
            markerEntityMap.set(marker, entitiesAtLocation);
          }
        });

        markersRef.current = regularMarkers;
        overlappingMarkersRef.current = overlappingMarkers;
        markerEntityMapRef.current = markerEntityMap;

        clustererRef.current = new MarkerClusterer({
          map,
          markers: regularMarkers,
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
                  const entity = markerEntityMapRef.current.get(
                    marker as google.maps.marker.AdvancedMarkerElement
                  );
                  // Handle both single entities and overlapping entity arrays
                  if (Array.isArray(entity)) {
                    return entity[0]; // Return the first entity for overlapping groups
                  }
                  return entity;
                })
                .filter(Boolean);

              const entityBreakdown = getEntityBreakdown(clusterEntities);

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
                  let targetZoom = 14;
                  if (count <= 3) {
                    targetZoom = 15;
                  } else if (count <= 8) {
                    targetZoom = 13;
                  } else {
                    targetZoom = 12;
                  }

                  map.setCenter(position);
                  map.setZoom(targetZoom);
                }
              });

              return new AdvancedMarkerElement({
                position,
                content: clusterElement,
              });
            },
          },
        });

        // Add overlapping markers directly to the map (bypassing clusterer)
        overlappingMarkers.forEach((marker) => {
          marker.map = map;
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
      // Clean up overlapping markers
      overlappingMarkersRef.current.forEach((marker) => {
        marker.map = null;
      });
    };
  }, [entities, map, onMarkerClick]);

  useEffect(() => {
    const updateMarkers = async () => {
      try {
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          "marker"
        )) as google.maps.MarkerLibrary;

        // Update regular markers (single entities)
        markersRef.current.forEach((marker) => {
          const entity = markerEntityMapRef.current.get(marker) as MapEntity;
          if (entity) {
            const isSelected = selectedEntity?.id === entity.id;
            marker.content = createMarkerContent(entity, isSelected);
          }
        });

        // Update overlapping markers
        overlappingMarkersRef.current.forEach((marker) => {
          const entitiesAtLocation = markerEntityMapRef.current.get(
            marker
          ) as MapEntity[];
          if (entitiesAtLocation && entitiesAtLocation.length > 1) {
            // Check if any entity in this overlapping group is selected
            const hasSelectedEntity = entitiesAtLocation.some(
              (entity) => selectedEntity?.id === entity.id
            );
            marker.content = createOverlappingMarkerContent(
              entitiesAtLocation,
              hasSelectedEntity
            );
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
    court: entityColors.court.solid,
    coach: entityColors.coach.solid,
    stringer: entityColors.stringer.solid,
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
    return (
      entityColors[type as keyof typeof entityColors]?.gradient ||
      entityColors.default.gradient
    );
  };

  const markerElement = document.createElement("div");
  markerElement.className = "custom-marker";
  markerElement.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${getMarkerColor(entity.type)};
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    ${isSelected ? "transform: scale(1.2); border-color: #fbbf24;" : ""}
  `;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  svg.setAttribute("viewBox", "0 0 28 28");

  const text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", "14");
  text.setAttribute("y", "18");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "12");
  text.setAttribute("font-family", "sans-serif");
  text.setAttribute("fill", "#fff");
  text.textContent = entity.type.charAt(0).toUpperCase();
  svg.appendChild(text);

  markerElement.innerHTML = "";
  markerElement.appendChild(svg);

  return markerElement;
};

const createOverlappingMarkerContent = (
  entities: MapEntity[],
  isSelected: boolean = false
) => {
  const markerElement = document.createElement("div");
  markerElement.className = "overlapping-marker";
  markerElement.style.cssText = `
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: conic-gradient(
      ${createPieChartGradient(getEntityBreakdown(entities), entities.length)}
    );
    border: 3px solid ${isSelected ? "#fbbf24" : "#fff"};
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    ${isSelected ? "transform: scale(1.2);" : ""}
  `;

  const countElement = document.createElement("div");
  countElement.textContent = entities.length.toString();
  countElement.style.cssText = `
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  `;

  markerElement.appendChild(countElement);
  return markerElement;
};

export default MarkerCluster;
