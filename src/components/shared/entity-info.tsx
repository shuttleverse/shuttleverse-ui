import React from "react";
import { MapEntity } from "@/services/map";
import { MapPin, Star, Shield } from "lucide-react";

interface EntityInfoProps {
  entity: MapEntity;
  isSelected?: boolean;
  onClick?: (entity: MapEntity) => void;
  variant?: "desktop" | "mobile";
}

const EntityInfo: React.FC<EntityInfoProps> = ({
  entity,
  isSelected = false,
  onClick,
  variant = "desktop",
}) => {
  const isClickable = !!onClick;

  const baseClasses = isClickable
    ? "cursor-pointer transition-all duration-300"
    : "";

  const desktopClasses =
    variant === "desktop"
      ? "mb-4 p-4 rounded-2xl shadow-lg border border-white/30 bg-white/70 backdrop-blur-md flex flex-col hover:bg-white/90 hover:shadow-xl hover:border-white/50"
      : "mb-3 p-3 rounded-lg shadow border border-gray-100 bg-white flex flex-col hover:bg-emerald-50";

  const selectedClasses = isSelected
    ? variant === "desktop"
      ? "ring-2 ring-emerald-400/60 bg-emerald-50/80 border-emerald-300/40 shadow-emerald-100/50"
      : "bg-emerald-50"
    : "";

  const handleClick = () => {
    if (onClick) {
      onClick(entity);
    }
  };

  return (
    <div
      className={`${baseClasses} ${desktopClasses} ${selectedClasses}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`font-bold capitalize text-emerald-600 tracking-wide ${
            variant === "desktop" ? "text-sm" : "text-base"
          }`}
        >
          {entity.type}
        </span>
        {entity.isVerified && (
          <span
            className={`text-xs bg-emerald-100/80 text-emerald-800 px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${
              variant === "mobile" ? "bg-green-100 text-green-800" : ""
            }`}
          >
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">Verified</span>
          </span>
        )}
      </div>
      <div
        className={`font-bold text-gray-900 mb-2 tracking-tight ${
          variant === "desktop" ? "text-base" : "text-lg"
        }`}
      >
        {entity.name}
      </div>
      <div
        className={`text-gray-600 flex items-center gap-0.5 ${
          variant === "desktop" ? "text-sm" : "text-base"
        }`}
      >
        <MapPin
          className={`text-gray-400 flex-shrink-0 ${
            variant === "desktop" ? "w-4 h-4" : "w-5 h-5"
          }`}
        />
        <span className="font-medium leading-none">{entity.location}</span>
      </div>
    </div>
  );
};

export default EntityInfo;
