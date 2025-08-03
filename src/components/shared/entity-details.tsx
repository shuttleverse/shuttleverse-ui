import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThumbsUp, MapPin, Globe, Phone, ArrowLeft, Info } from "lucide-react";
import { ScheduleDisplay } from "@/components/shared/schedule-display";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import type { CourtData, CourtPriceData } from "@/services/courts";
import type { CoachData, CoachPriceData } from "@/services/coaches";
import type { StringerData } from "@/services/stringers";
import { useState } from "react";

type EntityData = CourtData | CoachData | StringerData;

interface EntityDetailsProps {
  entity: EntityData;
  onUpvoteSchedule?: (scheduleId: string) => void;
  onUpvotePrice?: (priceId: string) => void;
  hasUpvotedSchedule?: (scheduleId: string) => boolean;
  hasUpvotedPrice?: (priceId: string) => boolean;
  isUpvotesLoading?: boolean;
  onAddInfo?: (tab?: "schedule" | "pricing" | "contact") => void;
}

export function EntityDetails({
  entity,
  onUpvoteSchedule,
  onUpvotePrice,
  hasUpvotedSchedule,
  hasUpvotedPrice,
  isUpvotesLoading = false,
  onAddInfo,
}: EntityDetailsProps) {
  const [selectedPrice, setSelectedPrice] = useState<
    CourtPriceData | CoachPriceData | null
  >(null);
  const [isPriceInfoDialogOpen, setIsPriceInfoDialogOpen] = useState(false);

  const handlePriceClick = (price: CourtPriceData | CoachPriceData) => {
    setSelectedPrice(price);
    setIsPriceInfoDialogOpen(true);
  };

  const handlePriceUpvote = (priceId: string) => {
    if (onUpvotePrice && !hasUpvotedPrice?.(priceId) && !isUpvotesLoading) {
      onUpvotePrice(priceId);

      if (selectedPrice && selectedPrice.id === priceId) {
        setSelectedPrice({
          ...selectedPrice,
          upvotes: (selectedPrice.upvotes || 0) + 1,
        });
      }
    }
  };

  const renderPrices = () => {
    if (!entity.priceList || entity.priceList.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-4">
          No prices available
        </div>
      );
    }

    return entity.priceList.map((price) => {
      if ("stringName" in price) {
        return (
          <div
            key={price.id}
            className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
            onClick={() => handlePriceClick(price)}
          >
            <div>
              <p className="font-medium text-primary-indigo">
                {price.stringName}
              </p>
              <p className="text-sm text-muted-foreground">
                ${price.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">{price.upvotes || 0}</span>
            </div>
          </div>
        );
      } else {
        return (
          <div
            key={price.id}
            className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
            onClick={() => handlePriceClick(price)}
          >
            <div>
              <p className="font-medium text-primary-indigo">
                {entity.type === "court" ? "Open Court" : "Coaching Session"}
              </p>
              <p className="text-sm text-muted-foreground">
                ${price.price.toFixed(2)}
                {price.duration && ` / ${price.duration} minutes`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">{price.upvotes || 0}</span>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-2 sm:px-4">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-6 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="bg-gradient-to-br from-primary/5 to-primary-indigo/5 shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-indigo opacity-10" />
            <div className="relative p-4 sm:p-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                <div className="space-y-6 sm:space-y-8 xl:col-span-1">
                  <div className="flex flex-col items-center md:items-start">
                    <EntityAvatar
                      id={entity.id}
                      name={entity.name}
                      type={entity.type}
                      size="lg"
                      className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-white/20 mb-4 sm:mb-6 shadow-lg"
                    />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                      <div className="text-center md:text-left">
                        <h1 className="text-2xl sm:text-4xl font-bold text-primary-indigo mb-2 sm:mb-3">
                          {entity.name}
                        </h1>
                        {entity.isVerified && (
                          <Badge
                            variant="secondary"
                            className="bg-sky-500/20 text-sky-600 hover:bg-sky-500/30 border border-sky-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    {entity.location && (
                      <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group">
                        <MapPin className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors" />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            entity.location
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm sm:text-base text-primary hover:text-primary-indigo transition-colors cursor-pointer"
                        >
                          {entity.location}
                        </a>
                      </div>
                    )}
                    {entity.type === "court" && entity.website && (
                      <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group">
                        <Globe className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors" />
                        <a
                          href={entity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm sm:text-base text-primary hover:text-primary-indigo transition-colors"
                        >
                          {entity.website}
                        </a>
                      </div>
                    )}
                    {entity.phoneNumber && (
                      <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group">
                        <Phone className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors" />
                        <a
                          href={`tel:${entity.phoneNumber}`}
                          className="text-sm sm:text-base text-primary hover:text-primary-indigo transition-colors cursor-pointer"
                        >
                          {entity.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>

                  {entity.description && (
                    <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-primary/10">
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        {entity.description}
                      </p>
                    </div>
                  )}
                </div>

                {entity.type === "stringer" && entity.additionalDetails && (
                  <div className="bg-white/50 rounded-lg p-3 sm:p-6 shadow-sm xl:col-span-1">
                    <h2 className="text-lg sm:text-2xl font-semibold text-primary-indigo mb-4 sm:mb-6">
                      Additional Details
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {entity.additionalDetails}
                    </p>
                  </div>
                )}

                {entity.type !== "stringer" &&
                  entity.scheduleList &&
                  entity.scheduleList.length > 0 && (
                    <div className="bg-white/50 rounded-lg p-3 sm:p-6 shadow-sm xl:col-span-2 min-h-[700px]">
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-2xl font-semibold text-primary-indigo">
                          Schedules
                        </h2>
                        {onAddInfo && (
                          <Button
                            onClick={() => onAddInfo("schedule")}
                            variant="outline"
                            size="sm"
                            className="text-primary-indigo border-primary-indigo hover:bg-primary-indigo hover:text-white"
                          >
                            Add Schedule
                          </Button>
                        )}
                      </div>
                      <ScheduleDisplay
                        schedules={entity.scheduleList}
                        onUpvote={onUpvoteSchedule}
                        hasUpvotedSchedule={hasUpvotedSchedule}
                        isUpvotesLoading={isUpvotesLoading}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8 border-t border-primary/10">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-indigo">
                Prices
              </h2>
              {onAddInfo && (
                <Button
                  onClick={() => onAddInfo("pricing")}
                  variant="outline"
                  size="sm"
                  className="text-primary-indigo border-primary-indigo hover:bg-primary-indigo hover:text-white"
                >
                  Add Pricing
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {renderPrices()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isPriceInfoDialogOpen}
        onOpenChange={setIsPriceInfoDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Price Details</DialogTitle>
            <DialogDescription>
              Details about the price for this service.
            </DialogDescription>
          </DialogHeader>
          {selectedPrice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Service:</span>
                  <span>
                    {entity.type === "stringer" && "stringName" in selectedPrice
                      ? (selectedPrice as { stringName: string }).stringName
                      : entity.type === "court"
                      ? "Open Court"
                      : "Coaching Session"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="font-bold text-emerald-700">
                    ${selectedPrice.price.toFixed(2)}
                  </span>
                </div>
                {selectedPrice.duration && (
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{selectedPrice.duration} minutes</span>
                  </div>
                )}
                {selectedPrice.submittedBy && (
                  <div className="flex justify-between">
                    <span className="font-medium">Submitted by:</span>
                    <span>
                      {(selectedPrice.submittedBy as { username: string })
                        ?.username || "Unknown"}
                    </span>
                  </div>
                )}
                {selectedPrice.updatedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Last updated:</span>
                    <span>
                      {new Date(selectedPrice.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">
                    {selectedPrice.upvotes || 0} upvotes
                  </span>
                </div>
                {onUpvotePrice && (
                  <Button
                    onClick={() => handlePriceUpvote(selectedPrice.id)}
                    disabled={
                      hasUpvotedPrice?.(selectedPrice.id) || isUpvotesLoading
                    }
                    className={`${
                      hasUpvotedPrice?.(selectedPrice.id)
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {hasUpvotedPrice?.(selectedPrice.id) ? "Upvoted" : "Upvote"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
