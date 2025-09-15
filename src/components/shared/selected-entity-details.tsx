import React from "react";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  DollarSign,
  ThumbsUp,
  Info,
  ArrowLeft,
  Shield,
  ExternalLink,
  X,
  Crown,
} from "lucide-react";
import type { MapEntity } from "@/services/map";
import { EntityAvatar } from "./entity-avatar";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { getEntityColor } from "@/lib/colors";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface SelectedEntityDetailsProps {
  entity: MapEntity & {
    phoneNumber?: string;
    website?: string;
    otherContacts?: Record<string, string>;
    additionalDetails?: string;
    experienceYears?: number;
    scheduleList?: unknown[];
    priceList?: unknown[];
    upvotes?: number;
    owner?: { id: string };
  };
  fullEntityData:
    | (MapEntity & {
        phoneNumber?: string;
        website?: string;
        otherContacts?: Record<string, string>;
        additionalDetails?: string;
        experienceYears?: number;
        scheduleList?: unknown[];
        priceList?: unknown[];
        upvotes?: number;
        owner?: { id: string };
      })
    | null;
  isLoading: boolean;
  onBack: () => void;
  onViewDetails: (entity: MapEntity) => void;
  onUpvotePrice?: (priceId: string) => void;
  hasUpvotedPrice?: (priceId: string) => boolean;
  isPriceUpvotesLoading?: boolean;
  showBackButton?: boolean;
  transparentBackground?: boolean;
}

const SelectedEntityDetails: React.FC<SelectedEntityDetailsProps> = ({
  entity,
  isLoading,
  onBack,
  onViewDetails,
  onUpvotePrice,
  hasUpvotedPrice,
  isPriceUpvotesLoading = false,
  showBackButton = true,
  transparentBackground = false,
}) => {
  const { user } = useAuth();
  const isOwner = user && entity.owner && user.id === entity.owner.id;
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "court":
        return "Court";
      case "coach":
        return "Coach";
      case "stringer":
        return "Stringer";
      default:
        return type;
    }
  };

  const getDayName = (dayNumber: number): string => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[dayNumber - 1] || "Unknown";
  };

  const renderPrices = () => {
    if (!entity?.priceList || entity.priceList.length === 0) {
      return (
        <div className="text-center text-gray-500 py-6 text-sm bg-gray-50 rounded-lg">
          <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>No pricing information available</p>
        </div>
      );
    }

    return entity.priceList.map((price: unknown) => {
      const priceObj = price as Record<string, unknown>;
      const hasUpvoted = hasUpvotedPrice?.(priceObj.id as string) || false;

      return (
        <div
          key={priceObj.id as string}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-200"
        >
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  {entity.type === "stringer"
                    ? `$${(priceObj.price as number).toFixed(2)}`
                    : `$${(priceObj.minPrice as number).toFixed(2)}${
                        priceObj.maxPrice &&
                        (priceObj.maxPrice as number) >
                          (priceObj.minPrice as number)
                          ? ` - $${(priceObj.maxPrice as number).toFixed(2)}`
                          : ""
                      }`}
                </span>
                {entity.type !== "stringer" && (
                  <span className="text-md font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {(priceObj.duration as number) || 1}{" "}
                    {(priceObj.durationUnit as string) || "minutes"}
                  </span>
                )}
              </div>
            </div>
            {priceObj.description && (
              <p className="text-sm text-gray-600 mt-1">
                {priceObj.description as string}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-emerald-200">
            <ThumbsUp
              className={`w-4 h-4 ${
                hasUpvoted ? "text-green-600" : "text-emerald-600"
              }`}
            />
            <span className="text-sm font-medium text-emerald-700">
              {(priceObj.upvotes as number) || 0}
            </span>
            {onUpvotePrice && (
              <button
                onClick={() => onUpvotePrice(priceObj.id as string)}
                disabled={hasUpvoted || isPriceUpvotesLoading}
                className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                  hasUpvoted
                    ? "bg-green-500/20 text-green-600 border-green-500/30"
                    : "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/30"
                } ${
                  isPriceUpvotesLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {hasUpvoted ? "Upvoted" : "Upvote"}
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  const renderSchedules = () => {
    if (!entity?.scheduleList || entity.scheduleList.length === 0) {
      return (
        <div className="text-center text-gray-500 py-6 text-sm bg-gray-50 rounded-lg">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>No schedule information available</p>
        </div>
      );
    }

    return entity.scheduleList.map((schedule: unknown, index: number) => {
      const scheduleObj = schedule as Record<string, unknown>;

      return (
        <div
          key={index}
          className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-gray-900 text-base">
              {getDayName(scheduleObj.dayOfWeek as number)}
            </h5>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-blue-200">
              <ThumbsUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {(scheduleObj.upvotes as number) || 0}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            {scheduleObj.startTime && scheduleObj.endTime && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Time:</span>{" "}
                {scheduleObj.startTime as string} -{" "}
                {scheduleObj.endTime as string}
              </p>
            )}
            {scheduleObj.description && (
              <p className="text-sm text-gray-600">
                {scheduleObj.description as string}
              </p>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className={`${
        transparentBackground
          ? "p-6"
          : "rounded-2xl border border-gray-200 p-6 shadow-lg bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Back to list</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-white font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: getEntityColor(entity.type, "solid") }}
          >
            {getEntityTypeLabel(entity.type)}
          </span>
        </div>
        {!showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <EntityAvatar
                  id={entity.id}
                  name={entity.name}
                  type={entity.type as "court" | "coach" | "stringer"}
                  size="lg"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {entity.name}
                  </h3>
                  <div className="flex flex-col gap-1 mt-2">
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
              </div>
            </div>
          </div>

          {entity.description && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <MarkdownRenderer className="text-gray-700 text-base leading-relaxed prose prose-sm max-w-none">
                {entity.description}
              </MarkdownRenderer>
            </div>
          )}

          <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Contact Information
            </h4>
            {entity.location && (
              <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-base font-medium break-words min-w-0 flex-1">
                  {entity.location}
                </span>
              </div>
            )}
            {entity.phoneNumber && (
              <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a
                  href={`tel:${entity.phoneNumber}`}
                  className="text-emerald-600 hover:text-emerald-700 text-base font-medium break-words min-w-0 flex-1"
                >
                  {entity.phoneNumber}
                </a>
              </div>
            )}
            {entity.type === "coach" &&
              entity.experienceYears &&
              entity.experienceYears !== 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
                  <div className="w-5 h-5 text-gray-400 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="text-base font-medium break-words min-w-0 flex-1">
                    {entity.experienceYears} Years of Experience
                  </span>
                </div>
              )}
            {entity.type === "court" && entity.website && (
              <div className="flex items-start gap-3 text-sm text-gray-600 min-w-0">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href={entity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 text-base font-medium break-all hover:break-words min-w-0 flex-1"
                >
                  {entity.website}
                </a>
              </div>
            )}
            {entity.otherContacts &&
              Object.keys(entity.otherContacts).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(entity.otherContacts).map(
                    ([type, contact]) => (
                      <div
                        key={type}
                        className="flex items-center gap-3 text-sm text-gray-600 min-w-0"
                      >
                        <span className="w-5 h-5 text-gray-400 flex-shrink-0 flex items-center justify-center">
                          {type === "instagram" && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          )}
                          {type === "xiaohongshu" && (
                            <img
                              src="/xhs.png"
                              alt="Xiaohongshu"
                              className="w-4 h-4"
                            />
                          )}
                          {type === "facebook" && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          )}
                          {type === "whatsapp" && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                          )}
                          {type === "telegram" && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                          )}
                          {type === "wechat" && (
                            <img
                              src="/wechat.png"
                              alt="WeChat"
                              className="w-4 h-4"
                            />
                          )}
                          {type === "line" && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                          )}
                          {type === "email" && (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                          )}
                        </span>
                        <span className="text-base font-medium capitalize break-words min-w-0 flex-1">
                          {contact}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
          </div>

          {entity.type === "stringer" && entity.additionalDetails && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                Additional Details
              </h4>
              <MarkdownRenderer className="text-base text-gray-700 leading-relaxed prose prose-sm max-w-none">
                {entity.additionalDetails}
              </MarkdownRenderer>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <h4 className="font-semibold text-gray-900 text-lg">Pricing</h4>
            </div>
            <div className="space-y-3">{renderPrices()}</div>
          </div>

          {entity.type !== "stringer" && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-gray-900 text-lg">
                  Schedules
                </h4>
              </div>
              <div className="space-y-3">{renderSchedules()}</div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              onClick={() => onViewDetails(entity)}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <ExternalLink className="w-5 h-5" />
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedEntityDetails;
