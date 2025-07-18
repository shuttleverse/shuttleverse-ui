import React, { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface MapControllerProps {
  onMapReady: (map: google.maps.Map) => void;
  onBoundsChanged?: (bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  }) => void;
}

const MapController: React.FC<MapControllerProps> = ({
  onMapReady,
  onBoundsChanged,
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.setOptions({
        gestureHandling: "greedy",
        scrollwheel: true,
        draggable: true,
        disableDoubleClickZoom: false,
      });

      onMapReady(map);

      if (onBoundsChanged) {
        const boundsListener = map.addListener("bounds_changed", () => {
          const bounds = map.getBounds();
          if (bounds) {
            onBoundsChanged({
              west: bounds.getSouthWest().lng(),
              south: bounds.getSouthWest().lat(),
              east: bounds.getNorthEast().lng(),
              north: bounds.getNorthEast().lat(),
            });
          }
        });

        return () => {
          google.maps.event.removeListener(boundsListener);
        };
      }
    }
  }, [map, onMapReady, onBoundsChanged]);

  return null;
};

export default MapController;
