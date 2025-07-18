import React from "react";
import { MapPin, Users, Wrench } from "lucide-react";

export type MarkerType = "court" | "coach" | "stringer";

export interface CustomMarkerProps {
  type: MarkerType;
  customIcon?: string; // URL to custom PNG or SVG
  size?: number;
  color?: string;
}

// Default colors for each entity type
const DEFAULT_COLORS = {
  court: "#10b981", // emerald-500
  coach: "#3b82f6", // blue-500
  stringer: "#f59e0b", // amber-500
};

// Default icons for each entity type
const DEFAULT_ICONS = {
  court: MapPin,
  coach: Users,
  stringer: Wrench,
};

export const createCustomMarkerIcon = (
  type: MarkerType,
  customIcon?: string,
  size: number = 32,
  color?: string
): google.maps.Icon => {
  const defaultColor = color || DEFAULT_COLORS[type];

  // If custom icon is provided, use it
  if (customIcon) {
    return {
      url: customIcon,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
  }

  // Otherwise, create a default SVG icon
  const IconComponent = DEFAULT_ICONS[type];

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 2 - 2
    }" fill="${defaultColor}" stroke="white" stroke-width="2"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="white"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
};

// React component for custom marker (for use in info windows or other UI elements)
export const CustomMarkerIcon: React.FC<CustomMarkerProps> = ({
  type,
  customIcon,
  size = 24,
  color,
}) => {
  const defaultColor = color || DEFAULT_COLORS[type];
  const IconComponent = DEFAULT_ICONS[type];

  if (customIcon) {
    return (
      <img
        src={customIcon}
        alt={`${type} marker`}
        style={{ width: size, height: size }}
        className="inline-block"
      />
    );
  }

  return (
    <div
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: defaultColor,
        color: "white",
      }}
    >
      <IconComponent size={size * 0.5} />
    </div>
  );
};

export default CustomMarkerIcon;
