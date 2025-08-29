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
import {
  ThumbsUp,
  MapPin,
  Globe,
  Phone,
  ArrowLeft,
  Info,
  Navigation,
  Shield,
} from "lucide-react";
import { ScheduleDisplay } from "@/components/shared/schedule-display";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import AuthPrompt from "@/components/shared/auth-prompt";
import type {
  CourtData,
  CourtPriceData,
  CourtFormScheduleData,
} from "@/services/courts";
import type {
  CoachData,
  CoachPriceData,
  CoachFormScheduleData,
} from "@/services/coaches";
import type { StringerData, StringerPriceData } from "@/services/stringers";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Edit, Save, X, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GoogleAutoComplete from "@/components/shared/google-autocomplete";
import {
  useUpdateCourt,
  useUpdateCourtSchedules,
  useUpdateCourtPrices,
} from "@/services/courts";
import {
  useUpdateCoach,
  useUpdateCoachSchedules,
  useUpdateCoachPrices,
} from "@/services/coaches";
import {
  useUpdateStringer,
  useUpdateStringerPrices,
} from "@/services/stringers";
import { EditInfoModal } from "@/components/shared/edit-info-modal";
import type { ScheduleData } from "@/components/forms/schedule-calendar";

type EntityData = CourtData | CoachData | StringerData;

interface EntityDetailsProps {
  entity: EntityData;
  onUpvoteSchedule?: (scheduleId: string) => void;
  onUpvotePrice?: (priceId: string) => void;
  hasUpvotedSchedule?: (scheduleId: string) => boolean;
  hasUpvotedPrice?: (priceId: string) => boolean;
  isUpvotesLoading?: boolean;
  onAddInfo?: (tab?: "schedule" | "pricing" | "contact") => void;
  onRefetch?: () => void;
}

export function EntityDetails({
  entity,
  onUpvoteSchedule,
  onUpvotePrice,
  hasUpvotedSchedule,
  hasUpvotedPrice,
  isUpvotesLoading = false,
  onAddInfo,
  onRefetch,
}: EntityDetailsProps) {
  const { user } = useAuth();
  const isOwner = user && entity.owner && user.id === entity.owner.id;
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => {
    const baseFormData = {
      name: entity.name,
      location: entity.location,
      longitude: entity.locationPoint.longitude,
      latitude: entity.locationPoint.latitude,
      otherContacts: entity.otherContacts || {},
    };

    if (entity.type === "court") {
      return {
        ...baseFormData,
        description: entity.description || "",
        website: (entity as CourtData).website || "",
        phoneNumber: entity.phoneNumber || "",
      };
    } else if (entity.type === "coach") {
      return {
        ...baseFormData,
        description: entity.description || "",
        website: "",
        phoneNumber: entity.phoneNumber || "",
      };
    } else {
      return {
        ...baseFormData,
        description: entity.description || "",
        website: "",
        phoneNumber: entity.phoneNumber || "",
      };
    }
  });
  const [selectedPrice, setSelectedPrice] = useState<
    CourtPriceData | CoachPriceData | StringerPriceData | null
  >(null);
  const [isPriceInfoDialogOpen, setIsPriceInfoDialogOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [editInfoTab, setEditInfoTab] = useState<"schedule" | "pricing">(
    "schedule"
  );

  const updateCourtMutation = useUpdateCourt();
  const updateCoachMutation = useUpdateCoach();
  const updateStringerMutation = useUpdateStringer();

  const handlePriceClick = (
    price: CourtPriceData | CoachPriceData | StringerPriceData
  ) => {
    setSelectedPrice(price);
    setIsPriceInfoDialogOpen(true);
  };

  const resetFormData = () => {
    const baseFormData = {
      name: entity.name,
      location: entity.location,
      longitude: entity.locationPoint.longitude,
      latitude: entity.locationPoint.latitude,
      otherContacts: entity.otherContacts || {},
    };

    if (entity.type === "court") {
      setFormData({
        ...baseFormData,
        description: entity.description || "",
        website: (entity as CourtData).website || "",
        phoneNumber: entity.phoneNumber || "",
      });
    } else if (entity.type === "coach") {
      setFormData({
        ...baseFormData,
        description: entity.description || "",
        website: "",
        phoneNumber: entity.phoneNumber || "",
      });
    } else if (entity.type === "stringer") {
      setFormData({
        ...baseFormData,
        description: entity.description || "",
        website: "",
        phoneNumber: entity.phoneNumber || "",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    resetFormData();
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetFormData();
  };

  const handleSave = async () => {
    try {
      const baseData = {
        name: formData.name,
        location: formData.location,
        locationPoint: {
          longitude: formData.longitude || "",
          latitude: formData.latitude || "",
        },
      };

      if (entity.type === "court") {
        const courtData = {
          ...baseData,
          description: formData.description || "",
          website: formData.website || "",
          phoneNumber: formData.phoneNumber || "",
          otherContacts: formData.otherContacts,
        };
        await updateCourtMutation.mutateAsync({
          courtId: entity.id,
          courtData,
        });
      } else if (entity.type === "coach") {
        const coachData = {
          ...baseData,
          description: formData.description || "",
          phoneNumber: formData.phoneNumber || "",
          otherContacts: formData.otherContacts,
          experienceYears: (entity as CoachData).experienceYears || 0,
        };
        await updateCoachMutation.mutateAsync({
          coachId: entity.id,
          coachData,
        });
      } else if (entity.type === "stringer") {
        const stringerData = {
          ...baseData,
          description: formData.description || "",
          phoneNumber: formData.phoneNumber || "",
          otherContacts: formData.otherContacts,
          additionalDetails: (entity as StringerData).additionalDetails || "",
        };
        await updateStringerMutation.mutateAsync({
          stringerId: entity.id,
          stringerData,
        });
      }

      toast.success("Entity updated successfully!");
      setIsEditing(false);

      window.location.reload();
    } catch (error) {
      console.error("Error updating entity:", error);
      toast.error("Failed to update entity. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOtherContactsChange = (contacts: Record<string, string>) => {
    setFormData((prev) => ({
      ...prev,
      otherContacts: contacts,
    }));
  };

  const handleEditInfo = (tab: "schedule" | "pricing") => {
    setEditInfoTab(tab);
    setIsEditInfoModalOpen(true);
  };

  const updateCourtSchedulesMutation = useUpdateCourtSchedules();
  const updateCourtPricesMutation = useUpdateCourtPrices();
  const updateCoachSchedulesMutation = useUpdateCoachSchedules();
  const updateCoachPricesMutation = useUpdateCoachPrices();
  const updateStringerPricesMutation = useUpdateStringerPrices();

  const handleUpdateSchedule = async (scheduleData: ScheduleData[]) => {
    try {
      if (entity.type === "court") {
        await updateCourtSchedulesMutation.mutateAsync({
          courtId: entity.id,
          schedules: scheduleData,
        });
      } else if (entity.type === "coach") {
        await updateCoachSchedulesMutation.mutateAsync({
          coachId: entity.id,
          schedules: scheduleData,
        });
      }
      toast.success("Schedules updated successfully!");
      if (onRefetch) {
        onRefetch();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating schedules:", error);
      toast.error("Failed to update schedules. Please try again.");
    }
  };

  const handleUpdatePrice = async (
    priceData: (CourtPriceData | CoachPriceData | StringerPriceData)[]
  ) => {
    try {
      if (entity.type === "court") {
        await updateCourtPricesMutation.mutateAsync({
          courtId: entity.id,
          prices: priceData as CourtPriceData[],
        });
      } else if (entity.type === "coach") {
        await updateCoachPricesMutation.mutateAsync({
          coachId: entity.id,
          prices: priceData as CoachPriceData[],
        });
      } else if (entity.type === "stringer") {
        await updateStringerPricesMutation.mutateAsync({
          stringerId: entity.id,
          prices: priceData as StringerPriceData[],
        });
      }
      toast.success("Prices updated successfully!");
      if (onRefetch) {
        onRefetch();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error("Failed to update prices. Please try again.");
    }
  };

  const handlePriceUpvote = (priceId: string) => {
    if (onUpvotePrice && !hasUpvotedPrice?.(priceId) && !isUpvotesLoading) {
      setIsPriceInfoDialogOpen(false);

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
    if (!entity.priceList || entity.priceList.length === 0 ) {
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
                ${price.minPrice.toFixed(2)}
                {price.maxPrice > price.minPrice &&
                  ` - $${price.maxPrice.toFixed(2)}`}
                {` / ${price.duration} ${price.durationUnit}`}
              </p>
              {price.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {price.description}
                </p>
              )}
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
    <>
      {showAuthPrompt && (
        <AuthPrompt
          title="Sign in to Claim Ownership"
          description="You need to be signed in to claim ownership of this entity."
          action="Sign in to claim ownership"
          onClose={() => setShowAuthPrompt(false)}
        />
      )}
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
                      <div className="relative mb-4 sm:mb-6">
                        <EntityAvatar
                          id={entity.id}
                          name={entity.name}
                          type={entity.type}
                          size="lg"
                          className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-white/20 shadow-lg"
                        />
                        {entity.location && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mapUrl = `/map?${entity.type}=${entity.id}`;
                              if (isMobile) {
                                navigate(mapUrl);
                              } else {
                                window.open(mapUrl, "_blank");
                              }
                            }}
                            className="absolute -top-1 -right-1 flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                          </Button>
                        )}
                        {(isOwner || (user && user.admin)) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="absolute -bottom-1 -left-1 flex items-center gap-2 text-primary-indigo border-primary-indigo hover:bg-primary-indigo hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                        <div className="text-center md:text-left">
                          <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            {isEditing ? (
                              <div className="flex-1">
                                <Input
                                  value={formData.name}
                                  onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                  }
                                  className="text-2xl sm:text-4xl font-bold text-primary-indigo border-primary-indigo focus:border-primary-indigo bg-transparent px-3 py-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:ring-offset-0"
                                  placeholder="Entity name"
                                />
                              </div>
                            ) : (
                              <h1 className="text-2xl sm:text-4xl font-bold text-primary-indigo">
                                {entity.name}
                              </h1>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSave}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancel}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 hover:bg-gray-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                {entity.owner && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-green-700">
                                      Verified Owner
                                    </span>
                                  </div>
                                )}

                                {!entity.owner && (
                                  <Button
                                    onClick={() => {
                                      if (!isAuthenticated) {
                                        setShowAuthPrompt(true);
                                        return;
                                      }
                                      const entityType =
                                        entity.type.toUpperCase() as
                                          | "COURT"
                                          | "COACH"
                                          | "STRINGER";
                                      navigate(`/claim/${entity.id}`, {
                                        state: {
                                          entity,
                                          entityType,
                                        },
                                      });
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Claim Ownership
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                      {(entity.location || isEditing) && (
                        <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group">
                          <MapPin className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors" />
                          {isEditing ? (
                            <GoogleAutoComplete
                              value={formData.location}
                              onSelect={(place) => {
                                handleInputChange("location", place.name);
                                if (place.longitude && place.latitude) {
                                  handleInputChange(
                                    "longitude",
                                    place.longitude.toString()
                                  );
                                  handleInputChange(
                                    "latitude",
                                    place.latitude.toString()
                                  );
                                }
                              }}
                              onClear={() => {
                                handleInputChange("location", "");
                                handleInputChange("longitude", "");
                                handleInputChange("latitude", "");
                              }}
                              inputProps={{
                                placeholder: "Search for a location...",
                                className:
                                  "text-sm sm:text-base text-primary border-primary-indigo focus:border-primary-indigo bg-transparent h-10 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:ring-offset-0",
                              }}
                            />
                          ) : (
                            entity.location && (
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
                            )
                          )}
                        </div>
                      )}
                      {entity.type === "court" &&
                        (entity.website ||
                          (entity.owner &&
                            user &&
                            (entity.owner.id === user.id || user.admin))) && (
                          <div className="flex items-start gap-2 sm:gap-3 text-muted-foreground group">
                            <Globe className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors flex-shrink-0 mt-0.5" />
                            {isEditing ? (
                              <Input
                                value={formData.website}
                                onChange={(e) =>
                                  handleInputChange("website", e.target.value)
                                }
                                placeholder="Website URL"
                                className="text-sm sm:text-base text-primary border-primary-indigo focus:border-primary-indigo bg-transparent h-10 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:ring-offset-0"
                              />
                            ) : (
                              entity.website && (
                                <a
                                  href={entity.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm sm:text-base text-primary hover:text-primary-indigo transition-colors break-all hover:break-words"
                                >
                                  {entity.website}
                                </a>
                              )
                            )}
                          </div>
                        )}
                      {(entity.phoneNumber ||
                        (entity.owner &&
                          user &&
                          (entity.owner.id === user.id || user.admin))) && (
                        <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group">
                          <Phone className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors" />
                          {isEditing ? (
                            <Input
                              value={formData.phoneNumber}
                              onChange={(e) =>
                                handleInputChange("phoneNumber", e.target.value)
                              }
                              placeholder="Phone number"
                              className="text-sm sm:text-base text-primary border-primary-indigo focus:border-primary-indigo bg-transparent h-10 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:ring-offset-0"
                            />
                          ) : (
                            entity.phoneNumber && (
                              <a
                                href={`tel:${entity.phoneNumber}`}
                                className="text-sm sm:text-base text-primary hover:text-primary-indigo transition-colors cursor-pointer"
                              >
                                {entity.phoneNumber}
                              </a>
                            )
                          )}
                        </div>
                      )}

                      {entity.type === "coach" &&
                        entity.experienceYears &&
                        entity.experienceYears !== 0 && (
                          <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground group">
                            <div className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors flex items-center justify-center">
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </div>
                            <span className="text-sm sm:text-base text-primary">
                              {entity.experienceYears} Years of Experience
                            </span>
                          </div>
                        )}
                      {((entity.otherContacts &&
                        Object.keys(entity.otherContacts).length > 0) ||
                        isEditing) && (
                        <div className="space-y-3">
                          {isEditing && (
                            <div className="text-sm font-semibold text-gray-900">
                              Other Contacts
                            </div>
                          )}
                          {isEditing ? (
                            <div className="space-y-3">
                              {formData.otherContacts &&
                                Object.keys(formData.otherContacts).length >
                                  0 && (
                                  <div className="space-y-2">
                                    {Object.entries(formData.otherContacts).map(
                                      ([type, contact]) => (
                                        <div
                                          key={type}
                                          className="flex items-center gap-2"
                                        >
                                          <Select
                                            value={type}
                                            onValueChange={(newType) => {
                                              if (newType && newType !== type) {
                                                const currentContacts = {
                                                  ...formData.otherContacts,
                                                };
                                                delete currentContacts[type];
                                                handleOtherContactsChange({
                                                  ...currentContacts,
                                                  [newType]: contact,
                                                });
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="w-40">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {[
                                                {
                                                  value: "wechat",
                                                  label: "WeChat",
                                                },
                                                {
                                                  value: "xiaohongshu",
                                                  label: "Xiaohongshu",
                                                },
                                                {
                                                  value: "instagram",
                                                  label: "Instagram",
                                                },
                                                {
                                                  value: "facebook",
                                                  label: "Facebook",
                                                },
                                                {
                                                  value: "whatsapp",
                                                  label: "WhatsApp",
                                                },
                                                {
                                                  value: "telegram",
                                                  label: "Telegram",
                                                },
                                                {
                                                  value: "line",
                                                  label: "Line",
                                                },
                                                {
                                                  value: "email",
                                                  label: "Email",
                                                },
                                              ]
                                                .filter(
                                                  (option) =>
                                                    option.value === type ||
                                                    !formData.otherContacts ||
                                                    !formData.otherContacts[
                                                      option.value
                                                    ]
                                                )
                                                .map((option) => (
                                                  <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                          </Select>
                                          <Input
                                            value={contact}
                                            onChange={(e) => {
                                              const currentContacts =
                                                formData.otherContacts || {};
                                              handleOtherContactsChange({
                                                ...currentContacts,
                                                [type]: e.target.value,
                                              });
                                            }}
                                            className="flex-1 h-10 px-3 py-2 rounded-md border border-primary-indigo focus:border-primary-indigo focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:ring-offset-0 bg-transparent"
                                            maxLength={50}
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const currentContacts = {
                                                ...formData.otherContacts,
                                              };
                                              delete currentContacts[type];
                                              handleOtherContactsChange(
                                                currentContacts
                                              );
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              <div className="flex items-center gap-2">
                                <Select
                                  value=""
                                  onValueChange={(contactType) => {
                                    if (contactType) {
                                      const currentContacts =
                                        formData.otherContacts || {};
                                      if (!currentContacts[contactType]) {
                                        handleOtherContactsChange({
                                          ...currentContacts,
                                          [contactType]: "",
                                        });
                                      }
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Add contact" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      { value: "wechat", label: "WeChat" },
                                      {
                                        value: "xiaohongshu",
                                        label: "Xiaohongshu",
                                      },
                                      {
                                        value: "instagram",
                                        label: "Instagram",
                                      },
                                      { value: "facebook", label: "Facebook" },
                                      { value: "whatsapp", label: "WhatsApp" },
                                      { value: "telegram", label: "Telegram" },
                                      { value: "line", label: "Line" },
                                      { value: "email", label: "Email" },
                                    ]
                                      .filter(
                                        (option) =>
                                          !formData.otherContacts ||
                                          !formData.otherContacts[option.value]
                                      )
                                      .map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            entity.otherContacts &&
                            Object.keys(entity.otherContacts).length > 0 && (
                              <div className="space-y-2">
                                {Object.entries(entity.otherContacts).map(
                                  ([type, contact]) => (
                                    <div
                                      key={type}
                                      className="flex items-center gap-2 sm:gap-3 text-muted-foreground group"
                                    >
                                      <span className="w-5 h-5 text-primary group-hover:text-primary-indigo transition-colors flex items-center justify-center">
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
                                        {type === "discord" && (
                                          <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                          >
                                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
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
                                      <span className="text-sm sm:text-base text-primary hover:text-primary-indigo transition-colors capitalize">
                                        {contact}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {(entity.description || isEditing) && (
                      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-primary/10">
                        {isEditing ? (
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Description
                            </label>
                            <Textarea
                              value={formData.description}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                              placeholder="Describe your entity..."
                              rows={4}
                              className="w-full border-primary-indigo bg-transparent focus:border-primary-indigo placeholder:text-gray-500 text-gray-900 resize-none px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:ring-offset-0"
                            />
                          </div>
                        ) : (
                          entity.description && (
                            <MarkdownRenderer className="text-muted-foreground text-sm sm:text-base leading-relaxed prose prose-sm max-w-none">
                              {entity.description}
                            </MarkdownRenderer>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {entity.type === "stringer" && entity.additionalDetails && (
                    <div className="bg-white/50 rounded-lg p-3 sm:p-6 shadow-sm xl:col-span-1">
                      <h2 className="text-lg sm:text-2xl font-semibold text-primary-indigo mb-4 sm:mb-6">
                        Additional Details
                      </h2>
                      <MarkdownRenderer className="text-muted-foreground text-sm sm:text-base leading-relaxed prose prose-sm max-w-none">
                        {entity.additionalDetails}
                      </MarkdownRenderer>
                    </div>
                  )}

                  {entity.type !== "stringer" &&
                    ((entity.scheduleList && entity.scheduleList.length > 0) ||
                      (entity.owner && user && entity.owner.id === user.id) ||
                      (user && user.admin)) && (
                      <div className="bg-white/50 rounded-lg p-3 sm:p-6 shadow-sm xl:col-span-2 min-h-[700px]">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h2 className="text-lg sm:text-2xl font-semibold text-primary-indigo">
                            Schedules
                          </h2>
                          {onAddInfo &&
                            ((entity.owner &&
                              user &&
                              entity.owner.id === user.id) ||
                              !entity.owner ||
                              (user && user.admin)) && (
                              <Button
                                onClick={() => {
                                  if (!isAuthenticated) {
                                    setShowAuthPrompt(true);
                                    return;
                                  }
                                  if (isOwner || (user && user.admin)) {
                                    handleEditInfo("schedule");
                                  } else {
                                    onAddInfo("schedule");
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="text-primary-indigo border-primary-indigo hover:bg-primary-indigo hover:text-white"
                              >
                                {isOwner || (user && user.admin)
                                  ? "Edit Schedule"
                                  : "Add Schedule"}
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
                {onAddInfo &&
                  ((entity.owner && user && entity.owner.id === user.id) ||
                    !entity.owner ||
                    (user && user.admin)) && (
                    <Button
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowAuthPrompt(true);
                          return;
                        }
                        if (isOwner || (user && user.admin)) {
                          handleEditInfo("pricing");
                        } else {
                          onAddInfo("pricing");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-primary-indigo border-primary-indigo hover:bg-primary-indigo hover:text-white"
                    >
                      {isOwner || (user && user.admin)
                        ? "Edit Pricing"
                        : "Add Pricing"}
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
                      {entity.type === "stringer" &&
                      "stringName" in selectedPrice
                        ? (selectedPrice as { stringName: string }).stringName
                        : entity.type === "court"
                        ? "Open Court"
                        : "Coaching Session"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-bold text-emerald-700">
                      {entity.type === "stringer" && "price" in selectedPrice
                        ? `$${selectedPrice.price.toFixed(2)}`
                        : "minPrice" in selectedPrice
                        ? `$${selectedPrice.minPrice.toFixed(2)}${
                            "maxPrice" in selectedPrice &&
                            selectedPrice.maxPrice > selectedPrice.minPrice
                              ? ` - $${selectedPrice.maxPrice.toFixed(2)}`
                              : ""
                          }`
                        : ""}
                    </span>
                  </div>
                  {entity.type !== "stringer" &&
                    "duration" in selectedPrice && (
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>
                          {selectedPrice.duration} {selectedPrice.durationUnit}
                        </span>
                      </div>
                    )}
                  {entity.type !== "stringer" &&
                    "description" in selectedPrice &&
                    selectedPrice.description && (
                      <div className="flex justify-between">
                        <span className="font-medium">Description:</span>
                        <span className="ml-2">
                          {selectedPrice.description}
                        </span>
                      </div>
                    )}
                  {"submittedBy" in selectedPrice &&
                    selectedPrice.submittedBy && (
                      <div className="flex justify-between">
                        <span className="font-medium">Submitted by:</span>
                        <span>
                          {(selectedPrice.submittedBy as { username: string })
                            ?.username || "Unknown"}
                        </span>
                      </div>
                    )}
                  {"updatedAt" in selectedPrice && selectedPrice.updatedAt && (
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
                      {hasUpvotedPrice?.(selectedPrice.id)
                        ? "Upvoted"
                        : "Upvote"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <EditInfoModal
          isOpen={isEditInfoModalOpen}
          onClose={() => setIsEditInfoModalOpen(false)}
          entityType={entity.type}
          entityId={entity.id}
          existingSchedules={
            entity.type === "stringer"
              ? []
              : (entity as CourtData | CoachData).scheduleList || []
          }
          existingPrices={entity.priceList || []}
          onUpdateSchedule={handleUpdateSchedule}
          onUpdatePrice={handleUpdatePrice}
          defaultTab={editInfoTab}
        />
      </div>
    </>
  );
}
