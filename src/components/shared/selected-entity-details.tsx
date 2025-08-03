import React from "react";
import { MapEntity } from "@/services/map";
import {
  MapPin,
  Shield,
  ArrowLeft,
  ExternalLink,
  Phone,
  Globe,
  ThumbsUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { EntityAvatar } from "@/components/shared/entity-avatar";

interface SelectedEntityDetailsProps {
  entity: MapEntity & {
    phoneNumber?: string;
    website?: string;
    otherContacts?: string;
    additionalDetails?: string;
    experience_years?: number;
    scheduleList?: unknown[];
    priceList?: unknown[];
    upvotes?: number;
  };
  fullEntityData:
    | (MapEntity & {
        phoneNumber?: string;
        website?: string;
        otherContacts?: string;
        additionalDetails?: string;
        experience_years?: number;
        scheduleList?: unknown[];
        priceList?: unknown[];
        upvotes?: number;
      })
    | null;
  isLoading: boolean;
  onBack: () => void;
  onViewDetails: (entity: MapEntity) => void;
}

const SelectedEntityDetails: React.FC<SelectedEntityDetailsProps> = ({
  entity,
  fullEntityData,
  isLoading,
  onBack,
  onViewDetails,
}) => {
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "court":
        return "Badminton Court";
      case "coach":
        return "Badminton Coach";
      case "stringer":
        return "Racket Stringer";
      default:
        return type;
    }
  };

  const renderPrices = () => {
    if (!fullEntityData?.priceList || fullEntityData.priceList.length === 0) {
      return (
        <div className="text-center text-gray-500 py-6 text-sm bg-gray-50 rounded-lg">
          <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>No pricing information available</p>
        </div>
      );
    }

    return fullEntityData.priceList.map((price: unknown) => {
      const priceObj = price as Record<string, unknown>;

      if ("stringName" in priceObj) {
        // Stringer price
        return (
          <div
            key={priceObj.id as string}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-base">
                {priceObj.stringName as string}
              </p>
              <p className="text-lg font-bold text-amber-700">
                ${(priceObj.price as number).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-amber-200">
              <ThumbsUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {(priceObj.upvotes as number) || 0}
              </span>
            </div>
          </div>
        );
      } else {
        // Court/Coach price
        return (
          <div
            key={priceObj.id as string}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-base">
                {entity.type === "court" ? "Open Court" : "Coaching Session"}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-emerald-700">
                  ${(priceObj.price as number).toFixed(2)}
                </p>
                {priceObj.duration && (
                  <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full border border-emerald-200">
                    {priceObj.duration as number} min
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-emerald-200">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                {(priceObj.upvotes as number) || 0}
              </span>
            </div>
          </div>
        );
      }
    });
  };

  const renderSchedules = () => {
    if (
      !fullEntityData?.scheduleList ||
      fullEntityData.scheduleList.length === 0
    ) {
      return (
        <div className="text-center text-gray-500 py-6 text-sm bg-gray-50 rounded-lg">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>No schedule information available</p>
        </div>
      );
    }

    return fullEntityData.scheduleList.map(
      (schedule: unknown, index: number) => {
        const scheduleObj = schedule as Record<string, unknown>;

        return (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-gray-900 text-base">
                {scheduleObj.dayOfWeek as string}
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
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back to list</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
            {getEntityTypeLabel(entity.type)}
          </span>
        </div>
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
          {/* Entity Avatar and Basic Info */}
          <div className="flex items-center gap-5">
            <EntityAvatar
              id={entity.id}
              name={entity.name}
              type={entity.type}
              size="lg"
              className="w-24 h-24 border-4 border-gray-200 shadow-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {entity.name}
                </h3>
                {entity.isVerified && (
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    <Shield className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
              <p className="text-base text-gray-600 font-medium">
                {getEntityTypeLabel(entity.type)}
              </p>
            </div>
          </div>

          {/* Description */}
          {entity.description && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <p className="text-gray-700 text-base leading-relaxed">
                {entity.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {fullEntityData && (
            <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                Contact Information
              </h4>
              {fullEntityData.location && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-base font-medium">
                    {fullEntityData.location}
                  </span>
                </div>
              )}
              {fullEntityData.phoneNumber && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${fullEntityData.phoneNumber}`}
                    className="text-emerald-600 hover:text-emerald-700 text-base font-medium"
                  >
                    {fullEntityData.phoneNumber}
                  </a>
                </div>
              )}
              {fullEntityData.type === "court" && fullEntityData.website && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a
                    href={fullEntityData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 text-base font-medium"
                  >
                    {fullEntityData.website}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Additional Details for Stringers */}
          {fullEntityData?.type === "stringer" &&
            fullEntityData.additionalDetails && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  Additional Details
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {fullEntityData.additionalDetails}
                </p>
              </div>
            )}

          {/* Prices Section */}
          {fullEntityData && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <h4 className="font-semibold text-gray-900 text-lg">Pricing</h4>
              </div>
              <div className="space-y-3">{renderPrices()}</div>
            </div>
          )}

          {/* Schedules Section (for Courts and Coaches) */}
          {fullEntityData && fullEntityData.type !== "stringer" && (
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

          {/* Action Buttons */}
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
