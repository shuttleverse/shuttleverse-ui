import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InteractiveMap from "@/components/shared/interactive-map";
import { MapEntity } from "@/services/map";
import { useIsMobile } from "@/hooks/use-mobile";
import EntityInfo from "@/components/shared/entity-info";
import SelectedEntityDetails from "@/components/shared/selected-entity-details";
import PreventPullToRefresh from "@/components/shared/prevent-pull-to-refresh";
import { useLocationContext } from "@/hooks/use-location-context";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { MapPin } from "lucide-react";
import { entityColors } from "@/lib/colors";

const MIN_HEIGHT = 120;
const DEFAULT_HEIGHT = 0.5;
const MAX_HEIGHT = 1.0;
const BOTTOM_NAV_HEIGHT = 70;

const MapPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { locationData } = useLocationContext();
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

  const isScrollable = sheetHeight >= window.innerHeight * MAX_HEIGHT;
  const showResults = sheetHeight > MIN_HEIGHT + 50;
  const isAtMaxHeight = sheetHeight >= window.innerHeight * MAX_HEIGHT;

  const canShowDualPanels = window.innerWidth >= 1200;

  const getMapOffset = useCallback(() => {
    if (!isMobile) return 0;

    if (sheetHeight <= MIN_HEIGHT) {
      return 0;
    } else {
      const maxOffset = window.innerHeight * 0.25;
      const progress =
        (sheetHeight - MIN_HEIGHT - BOTTOM_NAV_HEIGHT) /
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
  const lastMoveTime = useRef(0);
  const lastMoveY = useRef(0);
  const velocity = useRef(0);

  const handleEntitiesChange = useCallback((entities: MapEntity[]) => {
    setEntities(entities);
  }, []);

  const handlePanToEntity = useCallback(
    (entity: MapEntity) => {
      if (mapRef.current && entity.locationPoint) {
        const entityPosition = {
          lat: parseFloat(entity.locationPoint.latitude),
          lng: parseFloat(entity.locationPoint.longitude),
        };

        mapRef.current.panTo(entityPosition);
        mapRef.current.setZoom(14);

        if (!isMobile && !canShowDualPanels) {
          const leftPanelWidth = 320;
          const mapOffset = leftPanelWidth / 8;

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.panBy(-mapOffset, 0);
            }
          }, 100);
        } else if (isMobile) {
          setTimeout(() => {
            const currentMapOffset = getMapOffset();
            mapRef.current?.panBy(0, sheetHeight / 2 - currentMapOffset);
          }, 400);
          setSheetHeight(window.innerHeight * DEFAULT_HEIGHT);
        }

        setSelectedEntity(entity);
      }
    },
    [getMapOffset, sheetHeight, isMobile, canShowDualPanels]
  );

  const onDragStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (isAtMaxHeight) return;

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
    [sheetHeight, isAtMaxHeight]
  );

  const onDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const currentTime = Date.now();
    const delta = startY.current - clientY;
    let newHeight = startHeight.current + delta;
    const maxH = window.innerHeight * MAX_HEIGHT;

    if (lastMoveTime.current > 0) {
      const timeDelta = currentTime - lastMoveTime.current;
      const yDelta = lastMoveY.current - clientY;
      velocity.current = timeDelta > 0 ? yDelta / timeDelta : 0;
    }
    lastMoveTime.current = currentTime;
    lastMoveY.current = clientY;

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

    const threshold1 = window.innerHeight * 0.3;
    const threshold2 = window.innerHeight * 0.7;
    const velocityThreshold = 0.5;

    let targetHeight;

    if (Math.abs(velocity.current) > velocityThreshold) {
      if (velocity.current > 0) {
        if (sheetHeight < window.innerHeight * DEFAULT_HEIGHT) {
          targetHeight = window.innerHeight * DEFAULT_HEIGHT;
        } else {
          targetHeight = window.innerHeight * MAX_HEIGHT;
        }
      } else {
        if (sheetHeight > window.innerHeight * DEFAULT_HEIGHT) {
          targetHeight = window.innerHeight * DEFAULT_HEIGHT;
        } else {
          targetHeight = MIN_HEIGHT + BOTTOM_NAV_HEIGHT;
        }
      }
    } else {
      if (sheetHeight < threshold1) {
        targetHeight = MIN_HEIGHT + BOTTOM_NAV_HEIGHT;
      } else if (sheetHeight < threshold2) {
        targetHeight = window.innerHeight * DEFAULT_HEIGHT;
      } else {
        targetHeight = window.innerHeight * MAX_HEIGHT;
      }
    }

    setSheetHeight(targetHeight);

    lastMoveTime.current = 0;
    lastMoveY.current = 0;
    velocity.current = 0;
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courtId = urlParams.get("court");
    const coachId = urlParams.get("coach");
    const stringerId = urlParams.get("stringer");

    if (courtId || coachId || stringerId) {
      const entityId = courtId || coachId || stringerId;
      const entityType = courtId ? "court" : coachId ? "coach" : "stringer";

      const targetEntity = entities.find(
        (entity) => entity.id === entityId && entity.type === entityType
      );

      if (targetEntity) {
        setSelectedEntity(targetEntity);
        handlePanToEntity(targetEntity);

        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [entities, handlePanToEntity]);

  const defaultZoom = isMobile ? 11 : 12;

  const renderLeftPanel = () => {
    return (
      <div className="bg-white border-r border-gray-200 shadow-lg w-80 h-full overflow-hidden flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Nearby Places
            </h2>
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back to home"
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
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => toggleFilter("court")}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeFilters.has("court")
                  ? "text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              style={
                activeFilters.has("court")
                  ? {
                      background: entityColors.court.gradient,
                    }
                  : {}
              }
            >
              Courts
            </button>
            <button
              onClick={() => toggleFilter("coach")}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeFilters.has("coach")
                  ? "text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              style={
                activeFilters.has("coach")
                  ? {
                      background: entityColors.coach.gradient,
                    }
                  : {}
              }
            >
              Coaches
            </button>
            <button
              onClick={() => toggleFilter("stringer")}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeFilters.has("stringer")
                  ? "text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              style={
                activeFilters.has("stringer")
                  ? {
                      background: entityColors.stringer.gradient,
                    }
                  : {}
              }
            >
              Stringers
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {(() => {
            const filteredEntities = entities.filter((entity) =>
              activeFilters.has(entity.type)
            );

            if (filteredEntities.length === 0) {
              return (
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
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredEntities.map((entity) => (
                  <EntityInfo
                    key={entity.id}
                    entity={entity}
                    isSelected={selectedEntity?.id === entity.id}
                    onClick={handlePanToEntity}
                    variant="desktop"
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  const handleEntitySelect = useCallback(
    (entity: MapEntity | null) => {
      setSelectedEntity(entity);

      if (entity && mapRef.current && entity.locationPoint) {
        const entityPosition = {
          lat: parseFloat(entity.locationPoint.latitude),
          lng: parseFloat(entity.locationPoint.longitude),
        };

        mapRef.current.panTo(entityPosition);
        mapRef.current.setZoom(14);

        if (!isMobile && !canShowDualPanels) {
          const leftPanelWidth = 320;
          const mapOffset = leftPanelWidth / 2;

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.panBy(-mapOffset, 0);
            }
          }, 100);
        } else if (isMobile) {
          setTimeout(() => {
            setSheetHeight(window.innerHeight * MAX_HEIGHT);
          }, 400);
        }
      } else if (!entity && mapRef.current) {
        if (!isMobile && canShowDualPanels) {
          const rightPanelWidth = 384;
          const mapOffset = rightPanelWidth / 2;

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.panBy(mapOffset, 0);
            }
          }, 100);
        } else if (!isMobile && !canShowDualPanels) {
          const leftPanelWidth = 320;

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.panBy(leftPanelWidth, 0);
            }
          }, 100);
        } else if (isMobile) {
          setSheetHeight(window.innerHeight * DEFAULT_HEIGHT);
        }
      }
    },
    [isMobile, canShowDualPanels, setSheetHeight]
  );

  const handleCurrentLocation = useCallback(() => {
    if (mapRef.current && locationData.coordinates) {
      const currentPosition = {
        lat: parseFloat(locationData.coordinates.latitude),
        lng: parseFloat(locationData.coordinates.longitude),
      };

      mapRef.current.panTo(currentPosition);
      mapRef.current.setZoom(14);
    }
  }, [locationData.coordinates]);

  return (
    <>
      <div
        className="min-h-screen bg-white flex"
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
        {!isMobile && (
          <div className="flex w-full h-full">
            {(!selectedEntity || canShowDualPanels) && renderLeftPanel()}

            <div className="flex-1 relative">
              <InteractiveMap
                fullScreen
                mapRef={mapRef}
                onEntitiesChange={handleEntitiesChange}
                defaultZoom={defaultZoom}
                selectedEntity={selectedEntity}
                onEntitySelect={handleEntitySelect}
                showSidePanel={false}
                canShowDualPanels={canShowDualPanels}
                activeFilters={activeFilters}
              />
            </div>
          </div>
        )}

        {isMobile && (
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
                onEntitySelect={handleEntitySelect}
                showSidePanel={false}
                canShowDualPanels={canShowDualPanels}
                activeFilters={activeFilters}
              />
            </div>

            {sheetHeight < window.innerHeight * MAX_HEIGHT && (
              <button
                onClick={() => navigate(-1)}
                className="fixed z-20 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 p-3 text-gray-700 border border-white/40 hover:border-white/60"
                style={{
                  top: "16px",
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

            <PreventPullToRefresh>
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
                  overscrollBehavior:
                    sheetHeight >= window.innerHeight * MAX_HEIGHT
                      ? "none"
                      : "auto",
                  transition: dragging.current
                    ? "none"
                    : "height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-radius 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: "translateZ(0)",
                }}
                onMouseDown={
                  !isScrollable && !isAtMaxHeight ? onDragStart : undefined
                }
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (!isScrollable && !isAtMaxHeight) {
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
                    <div className="mb-4 flex justify-between items-center">
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
                        <span className="text-sm font-medium">Back</span>
                      </button>
                      <button
                        onClick={() =>
                          setSheetHeight(window.innerHeight * DEFAULT_HEIGHT)
                        }
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
                          <path d="M7 15l5-5 5 5" />
                        </svg>
                        <span className="text-sm font-medium">Collapse</span>
                      </button>
                    </div>
                  )}
                  {!selectedEntity && (
                    <div className="mb-6 pt-2">
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCurrentLocation}
                            className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                            title="Go to current location"
                          >
                            <MapPin className="h-4 w-4" />
                          </button>
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            <button
                              onClick={() => toggleFilter("court")}
                              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                activeFilters.has("court")
                                  ? "text-white shadow-sm"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                              }`}
                              style={
                                activeFilters.has("court")
                                  ? {
                                      background: entityColors.court.gradient,
                                    }
                                  : {}
                              }
                            >
                              Courts
                            </button>
                            <button
                              onClick={() => toggleFilter("coach")}
                              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                activeFilters.has("coach")
                                  ? "text-white shadow-sm"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                              }`}
                              style={
                                activeFilters.has("coach")
                                  ? {
                                      background: entityColors.coach.gradient,
                                    }
                                  : {}
                              }
                            >
                              Coaches
                            </button>
                            <button
                              onClick={() => toggleFilter("stringer")}
                              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                                activeFilters.has("stringer")
                                  ? "text-white shadow-sm"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                              }`}
                              style={
                                activeFilters.has("stringer")
                                  ? {
                                      background:
                                        entityColors.stringer.gradient,
                                    }
                                  : {}
                              }
                            >
                              Stringers
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(showResults || selectedEntity) && (
                    <div className="space-y-3 pb-20">
                      {selectedEntity ? (
                        <SelectedEntityDetails
                          entity={
                            selectedEntity as MapEntity & {
                              phoneNumber?: string;
                              website?: string;
                              otherContacts?: Record<string, string>;
                              additionalDetails?: string;
                              experienceYears?: number;
                              scheduleList?: unknown[];
                              priceList?: unknown[];
                              upvotes?: number;
                            }
                          }
                          fullEntityData={
                            selectedEntity as MapEntity & {
                              phoneNumber?: string;
                              website?: string;
                              otherContacts?: Record<string, string>;
                              additionalDetails?: string;
                              experienceYears?: number;
                              scheduleList?: unknown[];
                              priceList?: unknown[];
                              upvotes?: number;
                            }
                          }
                          isLoading={false}
                          onBack={() => setSelectedEntity(null)}
                          onViewDetails={(entity) => {
                            let path;
                            if (entity.type === "coach") {
                              path = `/coaches/${entity.id}`;
                            } else {
                              path = `/${entity.type}s/${entity.id}`;
                            }
                            navigate(path);
                          }}
                          showBackButton={true}
                          transparentBackground={false}
                        />
                      ) : (
                        (() => {
                          const filteredEntities = entities.filter((entity) =>
                            activeFilters.has(entity.type)
                          );

                          if (filteredEntities.length === 0) {
                            return (
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
                            );
                          }

                          return filteredEntities.map((entity) => (
                            <EntityInfo
                              key={entity.id}
                              entity={entity}
                              onClick={handlePanToEntity}
                              variant="mobile"
                            />
                          ));
                        })()
                      )}
                    </div>
                  )}
                </div>
              </div>
            </PreventPullToRefresh>
          </div>
        )}
      </div>
      {isMobile && <BottomNavigation />}
    </>
  );
};

export default MapPage;
