import React from "react";
import { MapEntity } from "@/services/map";
import EntityInfo from "./entity-info";

interface MapSidePanelProps {
  entities: MapEntity[];
  selectedEntity: MapEntity | null;
  onEntityClick: (entity: MapEntity) => void;
  onLocationClick?: () => void;
}

const MapSidePanel: React.FC<MapSidePanelProps> = ({
  entities,
  selectedEntity,
  onEntityClick,
  onLocationClick,
}) => {
  return (
    <div className="absolute top-4 right-4 w-80 h-[calc(100%-5rem)] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 overflow-hidden flex flex-col z-10">
      <div className="p-3 border-b border-white/20 bg-white/40 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Nearby Places
            </h3>
          </div>
          {onLocationClick && (
            <button
              type="button"
              aria-label="Go to my location"
              onClick={onLocationClick}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-white/40 hover:border-white/60"
            >
              <svg
                width="20"
                height="20"
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
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {entities.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No results in this area
          </div>
        ) : (
          entities.map((entity) => (
            <EntityInfo
              key={entity.id}
              entity={entity}
              isSelected={selectedEntity?.id === entity.id}
              onClick={onEntityClick}
              variant="desktop"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MapSidePanel;
