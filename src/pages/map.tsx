import React, { useRef, useState, useCallback, useEffect } from "react";
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

  const handleEntitiesChange = useCallback(
    (entities: MapEntity[], bbox: BoundingBox | null) => {
      setEntities(entities);
      setBoundingBox(bbox);
    },
    []
  );

  const handlePanToEntity = useCallback(
    (entity: MapEntity) => {
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
    },
    [sheetHeight]
  );

  const onDragStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      dragging.current = true;
      startY.current = "touches" in e ? e.touches[0].clientY : e.clientY;
      startHeight.current = sheetHeight;
      document.body.style.userSelect = "none";
    },
    [sheetHeight]
  );

  const onContentTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const target = e.currentTarget as HTMLElement;
      // If we're at the top of the scroll and trying to scroll up, allow dragging
      if (target.scrollTop === 0) {
        onDragStart(e);
      }
    },
    [onDragStart]
  );

  const onDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const delta = startY.current - clientY;
    let newHeight = startHeight.current + delta;
    const maxH = window.innerHeight * MAX_HEIGHT;
    if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
    if (newHeight > maxH) newHeight = maxH;
    setSheetHeight(newHeight);
  }, []);

  const onDragEnd = useCallback(() => {
    dragging.current = false;
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => onDragMove(e);
    const up = () => onDragEnd();

    window.addEventListener("mousemove", move, {
      passive: false,
      capture: true,
    });
    window.addEventListener("mouseup", up, { capture: true });
    window.addEventListener("touchmove", move, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchend", up, { capture: true });

    return () => {
      window.removeEventListener("mousemove", move, { capture: true });
      window.removeEventListener("mouseup", up, { capture: true });
      window.removeEventListener("touchmove", move, { capture: true });
      window.removeEventListener("touchend", up, { capture: true });
    };
  }, [onDragMove, onDragEnd]);

  const defaultZoom = isMobile ? 11 : 12;

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ height: "100vh", overflow: "hidden" }}
    >
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

        {/* Back button overlay */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 p-3 text-gray-700 border border-white/40 hover:border-white/60"
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

        {isMobile && (
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1002,
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(16px)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
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
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: 24,
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              <div
                style={{
                  height: 6,
                  width: 40,
                  background: "rgba(229, 231, 235, 0.8)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div
              style={{
                overflowY: "auto",
                flex: 1,
                padding: 24,
                touchAction: "pan-y",
              }}
              onTouchStart={onContentTouchStart}
            >
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
