import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InteractiveMap from "@/components/shared/interactive-map";
import { MapEntity, BoundingBox } from "@/services/map";
import { useIsMobile } from "@/hooks/use-mobile";
import EntityInfo from "@/components/shared/entity-info";

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 0.7;

const MapPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const [sheetHeight, setSheetHeight] = useState(
    () => window.innerHeight * 0.22
  );
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleEntitiesChange = (
    entities: MapEntity[],
    bbox: BoundingBox | null
  ) => {
    setEntities(entities);
    setBoundingBox(bbox);
  };

  const handlePanToEntity = (entity: MapEntity) => {
    if (mapRef.current && entity.locationPoint) {
      mapRef.current.panTo({
        lat: parseFloat(entity.locationPoint.latitude),
        lng: parseFloat(entity.locationPoint.longitude),
      });
      mapRef.current.setZoom(14);
      setTimeout(() => {
        mapRef.current?.panBy(0, sheetHeight / 2);
      }, 400);
      setSheetHeight(window.innerHeight * 0.4);
    }
  };

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    dragging.current = true;
    startY.current = "touches" in e ? e.touches[0].clientY : e.clientY;
    startHeight.current = sheetHeight;
    document.body.style.userSelect = "none";
  };
  const onDragMove = (e: TouchEvent | MouseEvent) => {
    if (!dragging.current) return;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const delta = startY.current - clientY;
    let newHeight = startHeight.current + delta;
    const maxH = window.innerHeight * MAX_HEIGHT;
    if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
    if (newHeight > maxH) newHeight = maxH;
    setSheetHeight(newHeight);
  };
  const onDragEnd = () => {
    dragging.current = false;
    document.body.style.userSelect = "";
  };
  React.useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => onDragMove(e);
    const up = () => onDragEnd();
    if (dragging.current) {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move);
      window.addEventListener("touchend", up);
    }
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const defaultZoom = isMobile ? 11 : 12;

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <div className="p-4 flex items-center gap-2 shadow-sm z-10 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-gray-100 hover:bg-gray-200 p-2 text-gray-700"
          aria-label="Back"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="font-semibold text-lg">Map</span>
      </div>
      <div
        style={{
          flex: 1,
          width: "100vw",
          height: "100vh",
          position: "relative",
        }}
      >
        <InteractiveMap
          fullScreen
          mapRef={mapRef}
          onEntitiesChange={handleEntitiesChange}
          defaultZoom={defaultZoom}
        />
        {isMobile && (
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1002,
              background: "#fff",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
              height: sheetHeight,
              minHeight: MIN_HEIGHT,
              maxHeight: window.innerHeight * MAX_HEIGHT,
              display: "flex",
              flexDirection: "column",
              touchAction: "none",
              transition: dragging.current
                ? "none"
                : "height 0.2s cubic-bezier(.4,1.3,.6,1)",
            }}
          >
            <div
              style={{
                height: 24,
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseDown={onDragStart}
              onTouchStart={onDragStart}
            >
              <div
                style={{
                  height: 6,
                  width: 40,
                  background: "#e5e7eb",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: 12 }}>
              {entities.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No results in this area
                </div>
              ) : (
                entities.map((entity) => (
                  <EntityInfo
                    key={entity.id}
                    entity={entity}
                    onClick={handlePanToEntity}
                    variant="mobile"
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
