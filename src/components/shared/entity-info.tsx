import React from "react";
import { MapEntity } from "@/services/map";
import { MapPin, Shield, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface EntityInfoProps {
  entity: MapEntity & {
    owner?: { id: string };
  };
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
  const { user } = useAuth();
  const isOwner = user && entity.owner && user.id === entity.owner.id;
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
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col">
          <span
            className={`font-bold capitalize tracking-wide ${
              variant === "desktop" ? "text-sm" : "text-base"
            } ${
              entity.type === "court"
                ? "text-emerald-600"
                : entity.type === "coach"
                ? "text-blue-600"
                : "text-amber-600"
            }`}
          >
            {entity.type}
          </span>
        </div>
        <div className="flex flex-row gap-1">
          {entity.owner && (
            <Badge
              variant="secondary"
              className="bg-green-600 text-white hover:bg-green-700 border border-green-600 shadow-sm w-fit"
            >
              <Shield className="w-3 h-3 mr-1" /> Verified
            </Badge>
          )}
          {isOwner && (
            <Badge
              variant="secondary"
              className="bg-amber-500 text-white hover:bg-amber-600 border border-amber-600 shadow-sm w-fit"
            >
              <Crown className="w-3 h-3 mr-1" /> Owner
            </Badge>
          )}
        </div>
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
