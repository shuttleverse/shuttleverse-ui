import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InteractiveMap from "@/components/shared/interactive-map";
import { MapEntity } from "@/services/map";
import { useIsMobile } from "@/hooks/use-mobile";
import EntityInfo from "@/components/shared/entity-info";
import SelectedEntityDetails from "@/components/shared/selected-entity-details";

const MIN_HEIGHT = 120;
const DEFAULT_HEIGHT = 0.5;
const MAX_HEIGHT = 1.0;

const MapPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(["court", "coach", "stringer"])
  );

  const toggleFilter = (entityType: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(entityType)) {
      newFilters.delete(entityType);
    } else {
      newFilters.add(entityType);
    }
    setActiveFilters(newFilters);
  };

  const [sheetHeight, setSheetHeight] = useState(
    () => window.innerHeight * DEFAULT_HEIGHT
  );

  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);

  const filteredEntities = entities.filter((entity) =>
    activeFilters.has(entity.type)
  );

  const isScrollable = sheetHeight >= window.innerHeight * MAX_HEIGHT;
  const showResults = sheetHeight > MIN_HEIGHT + 50;

  const getMapOffset = useCallback(() => {
    if (!isMobile) return 0;

    if (sheetHeight <= MIN_HEIGHT) {
      return 0;
    } else {
      const maxOffset = window.innerHeight * 0.25;
      const progress =
        (sheetHeight - MIN_HEIGHT) /
        (window.innerHeight * DEFAULT_HEIGHT - MIN_HEIGHT);
      return Math.min(maxOffset, maxOffset * progress);
    }
  }, [isMobile, sheetHeight]);

  const mapOffset = getMapOffset();
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const scrollStartY = useRef(0);
  const isDraggingSheet = useRef(false);

  const handleEntitiesChange = useCallback((entities: MapEntity[]) => {
    setEntities(entities);
  }, []);

  const handlePanToEntity = useCallback(
    (entity: MapEntity) => {
      if (mapRef.current && entity.locationPoint) {
        mapRef.current.panTo({
          lat: parseFloat(entity.locationPoint.latitude),
          lng: parseFloat(entity.locationPoint.longitude),
        });
        mapRef.current.setZoom(14);
        setTimeout(() => {
          const currentMapOffset = getMapOffset();
          mapRef.current?.panBy(0, sheetHeight / 2 - currentMapOffset);
        }, 400);
        setSheetHeight(window.innerHeight * DEFAULT_HEIGHT);
        setSelectedEntity(entity);
      }
    },
    [getMapOffset, sheetHeight]
  );

  const handleViewDetails = useCallback(
    (entity: MapEntity) => {
      const entityType = entity.type;
      const entityId = entity.id;

      switch (entityType) {
        case "court":
          navigate(`/courts/${entityId}`);
          break;
        case "coach":
          navigate(`/coaches/${entityId}`);
          break;
        case "stringer":
          navigate(`/stringers/${entityId}`);
          break;
        default:
          navigate(`/entity/${entityId}`);
      }
    },
    [navigate]
  );

  const handleBackToList = useCallback(() => {
    setSelectedEntity(null);
  }, []);

  const onDragStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      dragging.current = true;
      startY.current = "touches" in e ? e.touches[0].clientY : e.clientY;
      startHeight.current = sheetHeight;
      document.body.style.userSelect = "none";
      document.body.style.overflow = "hidden";

      if (mapRef.current) {
        mapRef.current.setOptions({ gestureHandling: "none" });
      }

      document.body.classList.add("map-dragging");
    },
    [sheetHeight]
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

    if (newHeight < MIN_HEIGHT) {
      newHeight = MIN_HEIGHT + (newHeight - MIN_HEIGHT) * 0.3;
    }
    if (newHeight > maxH) {
      newHeight = maxH + (newHeight - maxH) * 0.3;
    }

    setSheetHeight(newHeight);
  }, []);

  const onDragEnd = useCallback(() => {
    dragging.current = false;
    document.body.style.userSelect = "";
    document.body.style.overflow = "";

    if (mapRef.current) {
      mapRef.current.setOptions({ gestureHandling: "greedy" });
    }

    document.body.classList.remove("map-dragging");

    const threshold1 = window.innerHeight * 0.35;
    const threshold2 = window.innerHeight * 0.75;

    if (sheetHeight < threshold1) {
      setSheetHeight(MIN_HEIGHT);
    } else if (sheetHeight < threshold2) {
      setSheetHeight(window.innerHeight * DEFAULT_HEIGHT);
    } else {
      setSheetHeight(window.innerHeight * MAX_HEIGHT);
    }
  }, [sheetHeight]);

  const handleContentTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isScrollable) return;

      const target = e.currentTarget as HTMLElement;
      scrollStartY.current = e.touches[0].clientY;

      if (target.scrollTop === 0) {
        isDraggingSheet.current = true;
      }
    },
    [isScrollable]
  );

  const handleContentTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isScrollable) return;

      const target = e.currentTarget as HTMLElement;
      const currentY = e.touches[0].clientY;
      const deltaY = scrollStartY.current - currentY;

      if (isDraggingSheet.current && target.scrollTop === 0 && deltaY < 0) {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging.current) {
          onDragStart(e);
        }
      } else if (isDraggingSheet.current && target.scrollTop > 0) {
        isDraggingSheet.current = false;
      }
    },
    [isScrollable, onDragStart]
  );

  const handleContentTouchEnd = useCallback(() => {
    isDraggingSheet.current = false;
  }, []);

  const handleContentMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isScrollable) return;

      const target = e.currentTarget as HTMLElement;
      scrollStartY.current = e.clientY;

      if (target.scrollTop === 0) {
        isDraggingSheet.current = true;
      }
    },
    [isScrollable]
  );

  const handleContentMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isScrollable) return;

      const target = e.currentTarget as HTMLElement;
      const currentY = e.clientY;
      const deltaY = scrollStartY.current - currentY;

      if (isDraggingSheet.current && target.scrollTop === 0 && deltaY < 0) {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging.current) {
          onDragStart(e);
        }
      } else if (isDraggingSheet.current && target.scrollTop > 0) {
        isDraggingSheet.current = false;
      }
    },
    [isScrollable, onDragStart]
  );

  const handleContentMouseUp = useCallback(() => {
    isDraggingSheet.current = false;
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
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          width: "100vw",
          height: "100vh",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translateY(-${mapOffset}px)`,
            transition: dragging.current
              ? "none"
              : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <InteractiveMap
            fullScreen
            mapRef={mapRef}
            onEntitiesChange={handleEntitiesChange}
            defaultZoom={defaultZoom}
            selectedEntity={selectedEntity}
            onEntitySelect={setSelectedEntity}
          />

          {sheetHeight < window.innerHeight * MAX_HEIGHT && (
            <button
              onClick={() => navigate(-1)}
              className="absolute z-20 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 p-3 text-gray-700 border border-white/40 hover:border-white/60"
              style={{
                top: `${16 + mapOffset}px`,
                left: "16px",
              }}
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
          )}
        </div>

        {isMobile && (
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1002,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderTopLeftRadius:
                sheetHeight >= window.innerHeight * MAX_HEIGHT ? 0 : 20,
              borderTopRightRadius:
                sheetHeight >= window.innerHeight * MAX_HEIGHT ? 0 : 20,
              boxShadow:
                sheetHeight >= window.innerHeight * MAX_HEIGHT
                  ? "none"
                  : "0 -8px 32px rgba(0,0,0,0.12)",
              border:
                sheetHeight >= window.innerHeight * MAX_HEIGHT
                  ? "none"
                  : "1px solid rgba(255, 255, 255, 0.3)",
              height: sheetHeight,
              minHeight: MIN_HEIGHT,
              maxHeight: window.innerHeight * MAX_HEIGHT,
              display: "flex",
              flexDirection: "column",
              touchAction: "none",
              transition: dragging.current
                ? "none"
                : "height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-radius 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              transform: "translateZ(0)",
            }}
            onMouseDown={!isScrollable ? onDragStart : undefined}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!isScrollable) {
                onDragStart(e);
              }
            }}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {sheetHeight < window.innerHeight * MAX_HEIGHT && (
              <div
                style={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  touchAction: "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  cursor: isScrollable ? "grab" : "default",
                }}
                onMouseDown={isScrollable ? onDragStart : undefined}
                onTouchStart={isScrollable ? onDragStart : undefined}
                onTouchMove={(e) => e.preventDefault()}
                onTouchEnd={(e) => e.preventDefault()}
              >
                <div
                  style={{
                    height: 4,
                    width: 36,
                    background: "rgba(156, 163, 175, 0.6)",
                    borderRadius: 2,
                  }}
                />
              </div>
            )}

            <div
              style={{
                overflowY: isScrollable ? "auto" : "hidden",
                flex: 1,
                padding:
                  sheetHeight >= window.innerHeight * MAX_HEIGHT
                    ? "40px 20px 20px 20px"
                    : "0 20px 20px 20px",
                touchAction: isScrollable ? "pan-y" : "none",
                WebkitOverflowScrolling: isScrollable ? "touch" : "auto",
              }}
              onTouchStart={handleContentTouchStart}
              onTouchMove={handleContentTouchMove}
              onTouchEnd={handleContentTouchEnd}
              onMouseDown={handleContentMouseDown}
              onMouseMove={handleContentMouseMove}
              onMouseUp={handleContentMouseUp}
            >
              {sheetHeight >= window.innerHeight * MAX_HEIGHT && (
                <div className="mb-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span className="text-sm font-medium">Back to Home</span>
                  </button>
                </div>
              )}
              {!selectedEntity && (
                <div className="mb-6 pt-2">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => toggleFilter("court")}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                          activeFilters.has("court")
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        Courts
                      </button>
                      <button
                        onClick={() => toggleFilter("coach")}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                          activeFilters.has("coach")
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        Coaches
                      </button>
                      <button
                        onClick={() => toggleFilter("stringer")}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                          activeFilters.has("stringer")
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        Stringers
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(showResults || selectedEntity) && (
                <div className="space-y-3">
                  {selectedEntity ? (
                    <SelectedEntityDetails
                      entity={
                        selectedEntity as MapEntity & {
                          phoneNumber?: string;
                          website?: string;
                          otherContacts?: string;
                          additionalDetails?: string;
                          experience_years?: number;
                          scheduleList?: unknown[];
                          priceList?: unknown[];
                          upvotes?: number;
                        }
                      }
                      fullEntityData={
                        selectedEntity as MapEntity & {
                          phoneNumber?: string;
                          website?: string;
                          otherContacts?: string;
                          additionalDetails?: string;
                          experience_years?: number;
                          scheduleList?: unknown[];
                          priceList?: unknown[];
                          upvotes?: number;
                        }
                      }
                      isLoading={false}
                      onBack={handleBackToList}
                      onViewDetails={handleViewDetails}
                    />
                  ) : (
                    <>
                      {filteredEntities.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          {activeFilters.size === 0 ? (
                            <div>
                              <p>No filters selected</p>
                              <p className="text-sm mt-1">
                                Select at least one filter to see results
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p>No results for selected filters</p>
                              <p className="text-sm mt-1">
                                Try adjusting your filters
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        filteredEntities.map((entity) => (
                          <EntityInfo
                            key={entity.id}
                            entity={entity}
                            onClick={handlePanToEntity}
                            variant="mobile"
                          />
                        ))
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
