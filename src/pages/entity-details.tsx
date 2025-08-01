import { useParams, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EntityDetails } from "@/components/shared/entity-details";
import Layout from "@/components/layout/layout";
import AuthPrompt from "@/components/shared/auth-prompt";
import { useAuth } from "@/hooks/useAuth";
import {
  useCourt,
  useUpvoteCourtSchedule,
  useUpvoteCourtPrice,
  useAddCourtSchedule,
  useAddCourtPrice,
} from "@/services/courts";
import {
  useCoach,
  useUpvoteCoachSchedule,
  useUpvoteCoachPrice,
  useAddCoachSchedule,
  useAddCoachPrice,
} from "@/services/coaches";
import {
  useStringer,
  useUpvoteStringerPrice,
  useAddStringerPrice,
} from "@/services/stringers";
import { useUpvotes, type UpvoteData } from "@/services/upvotes";
import { AddInfoModal } from "@/components/shared/add-info-modal";
import type { ScheduleData } from "@/components/forms/schedule-calendar";
import type {
  CourtFormScheduleData,
  CourtFormPriceData,
} from "@/services/courts";
import type {
  CoachFormScheduleData,
  CoachFormPriceData,
} from "@/services/coaches";
import type { StringerFormPriceData } from "@/services/stringers";

type URLPath = "courts" | "coaches" | "stringers";
type APIType = "court" | "coach" | "stringer";

const URL_TO_API_TYPE: Record<URLPath, APIType> = {
  courts: "court",
  coaches: "coach",
  stringers: "stringer",
};

const ENTITY_HOOKS = {
  court: useCourt,
  coach: useCoach,
  stringer: useStringer,
} as const;

export default function EntityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptType, setAuthPromptType] = useState<"schedule" | "price">(
    "schedule"
  );
  const [locallyUpvotedSchedules, setLocallyUpvotedSchedules] = useState<
    string[]
  >([]);
  const [locallyUpvotedPrices, setLocallyUpvotedPrices] = useState<string[]>(
    []
  );
  const [showAddInfoModal, setShowAddInfoModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"schedule" | "pricing">(
    "schedule"
  );

  const urlPath = location.pathname.split("/")[1] as URLPath;
  const type = URL_TO_API_TYPE[urlPath];

  const useEntity = ENTITY_HOOKS[type];
  const activeQuery = useEntity(id!);

  const userUpvotesQuery = useUpvotes(
    {
      entityType: type === "court" ? 0 : type === "stringer" ? 1 : 2,
      infoType: 0,
    },
    isAuthenticated
  );

  const userPriceUpvotesQuery = useUpvotes(
    {
      entityType: type === "court" ? 0 : type === "stringer" ? 1 : 2,
      infoType: 1,
    },
    isAuthenticated
  );

  const hasUpvotedSchedule = (scheduleId: string) => {
    if (locallyUpvotedSchedules.includes(scheduleId)) return true;
    if (!userUpvotesQuery.data?.pages) return false;
    return userUpvotesQuery.data.pages.some((page) =>
      page.data?.content?.some(
        (upvote: UpvoteData) =>
          upvote.infoType === "SCHEDULE" && upvote.entity.id === scheduleId
      )
    );
  };

  const hasUpvotedPrice = (priceId: string) => {
    if (locallyUpvotedPrices.includes(priceId)) return true;
    if (!userPriceUpvotesQuery.data?.pages) return false;
    return userPriceUpvotesQuery.data.pages.some((page) =>
      page.data?.content?.some(
        (upvote: UpvoteData) =>
          upvote.infoType === "PRICE" && upvote.entity.id === priceId
      )
    );
  };

  useEffect(() => {
    if (locallyUpvotedSchedules.length === 0) return;
    // If all locally upvoted schedules are now present in the server upvotes, clear local state
    const allConfirmed = locallyUpvotedSchedules.every((scheduleId) =>
      userUpvotesQuery.data?.pages?.some((page) =>
        page.data?.content?.some(
          (upvote: UpvoteData) =>
            upvote.infoType === "SCHEDULE" && upvote.entity.id === scheduleId
        )
      )
    );
    if (allConfirmed) {
      setLocallyUpvotedSchedules([]);
    }
  }, [userUpvotesQuery.data, locallyUpvotedSchedules]);

  useEffect(() => {
    if (locallyUpvotedPrices.length === 0) return;
    // If all locally upvoted prices are now present in the server upvotes, clear local state
    const allConfirmed = locallyUpvotedPrices.every((priceId) =>
      userPriceUpvotesQuery.data?.pages?.some((page) =>
        page.data?.content?.some(
          (upvote: UpvoteData) =>
            upvote.infoType === "PRICE" && upvote.entity.id === priceId
        )
      )
    );
    if (allConfirmed) {
      setLocallyUpvotedPrices([]);
    }
  }, [userPriceUpvotesQuery.data, locallyUpvotedPrices]);

  const upvoteScheduleMutation = {
    court: useUpvoteCourtSchedule(),
    coach: useUpvoteCoachSchedule(),
  }[type];

  const upvotePriceMutation = {
    court: useUpvoteCourtPrice(),
    coach: useUpvoteCoachPrice(),
    stringer: useUpvoteStringerPrice(),
  }[type];

  // Add info mutations
  const addScheduleMutation = {
    court: useAddCourtSchedule(),
    coach: useAddCoachSchedule(),
  }[type];

  const addPriceMutation = {
    court: useAddCourtPrice(),
    coach: useAddCoachPrice(),
    stringer: useAddStringerPrice(),
  }[type];

  const handleUpvoteSchedule = async (scheduleId: string) => {
    if (!isAuthenticated) {
      setAuthPromptType("schedule");
      setShowAuthPrompt(true);
      return;
    }

    try {
      if (type === "court") {
        await (
          upvoteScheduleMutation as ReturnType<typeof useUpvoteCourtSchedule>
        ).mutateAsync({
          courtId: id!,
          scheduleId,
        });
      } else if (type === "coach") {
        await (
          upvoteScheduleMutation as ReturnType<typeof useUpvoteCoachSchedule>
        ).mutateAsync({
          coachId: id!,
          scheduleId,
        });
      }

      setLocallyUpvotedSchedules((prev) => [...prev, scheduleId]);
      toast({
        title: "Success",
        description: "Schedule upvoted successfully",
      });
      if (activeQuery.refetch) activeQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleUpvotePrice = async (priceId: string) => {
    if (!isAuthenticated) {
      setAuthPromptType("price");
      setShowAuthPrompt(true);
      return;
    }

    try {
      if (type === "court") {
        await (
          upvotePriceMutation as ReturnType<typeof useUpvoteCourtPrice>
        ).mutateAsync({
          courtId: id!,
          priceId,
        });
      } else if (type === "coach") {
        await (
          upvotePriceMutation as ReturnType<typeof useUpvoteCoachPrice>
        ).mutateAsync({
          coachId: id!,
          priceId,
        });
      } else {
        await (
          upvotePriceMutation as ReturnType<typeof useUpvoteStringerPrice>
        ).mutateAsync({
          stringerId: id!,
          priceId,
        });
      }

      setLocallyUpvotedPrices((prev) => [...prev, priceId]);
      toast({
        title: "Success",
        description: "Price upvoted successfully",
      });
      if (activeQuery.refetch) activeQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleAddSchedule = async (scheduleData: ScheduleData[]) => {
    if (type === "court") {
      const courtScheduleData: CourtFormScheduleData[] = scheduleData.map(
        (schedule) => {
          if ("openTime" in schedule) {
            return schedule as CourtFormScheduleData;
          } else {
            return {
              dayOfWeek: schedule.dayOfWeek,
              openTime: schedule.startTime,
              closeTime: schedule.endTime,
            };
          }
        }
      );
      await (
        addScheduleMutation as ReturnType<typeof useAddCourtSchedule>
      ).mutateAsync({
        courtId: id!,
        scheduleData: courtScheduleData,
      });
    } else if (type === "coach") {
      const coachScheduleData: CoachFormScheduleData[] = scheduleData.map(
        (schedule) => {
          if ("startTime" in schedule) {
            return schedule as CoachFormScheduleData;
          } else {
            return {
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.openTime,
              endTime: schedule.closeTime,
            };
          }
        }
      );
      await (
        addScheduleMutation as ReturnType<typeof useAddCoachSchedule>
      ).mutateAsync({
        coachId: id!,
        scheduleData: coachScheduleData,
      });
    }
    toast({
      title: "Success",
      description: "Schedule added successfully",
    });
    if (activeQuery.refetch) activeQuery.refetch();
  };

  const handleAddPrice = async (
    priceData: Array<{ price: number; stringName?: string; duration?: number }>
  ) => {
    if (type === "court") {
      const courtPriceData: CourtFormPriceData[] = priceData.map((price) => ({
        price: price.price,
        duration: price.duration || 0,
      }));
      await (
        addPriceMutation as ReturnType<typeof useAddCourtPrice>
      ).mutateAsync({
        courtId: id!,
        priceData: courtPriceData,
      });
    } else if (type === "coach") {
      const coachPriceData: CoachFormPriceData[] = priceData.map((price) => ({
        price: price.price,
        duration: price.duration || 0,
      }));
      await (
        addPriceMutation as ReturnType<typeof useAddCoachPrice>
      ).mutateAsync({
        coachId: id!,
        priceData: coachPriceData,
      });
    } else if (type === "stringer") {
      const stringerPriceData: StringerFormPriceData[] = priceData.map(
        (price) => ({
          stringName: price.stringName || "Service Fee",
          price: price.price,
        })
      );
      await (
        addPriceMutation as ReturnType<typeof useAddStringerPrice>
      ).mutateAsync({
        stringerId: id!,
        priceData: stringerPriceData,
      });
    }
    toast({
      title: "Success",
      description: "Pricing added successfully",
    });
    if (activeQuery.refetch) activeQuery.refetch();
  };

  const handleAddInfo = (tab?: "schedule" | "pricing") => {
    setActiveModalTab(tab || "schedule");
    setShowAddInfoModal(true);
  };

  if (!activeQuery) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Entity Type</h1>
            <p className="text-muted-foreground">
              The entity type "{urlPath}" is not supported.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (activeQuery.isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!activeQuery.data) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Entity not found</h1>
            <p className="text-muted-foreground">
              The {urlPath} you're looking for doesn't exist or has been
              removed.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showAuthPrompt && (
        <AuthPrompt
          title="Sign in to Upvote"
          description={`You need to be signed in to upvote ${
            authPromptType === "schedule" ? "schedules" : "prices"
          }.`}
          action={`Sign in to upvote ${
            authPromptType === "schedule" ? "schedule" : "price"
          }`}
          onClose={() => setShowAuthPrompt(false)}
        />
      )}
      <EntityDetails
        entity={activeQuery.data}
        onUpvoteSchedule={
          type !== "stringer" ? handleUpvoteSchedule : undefined
        }
        onUpvotePrice={handleUpvotePrice}
        hasUpvotedSchedule={hasUpvotedSchedule}
        hasUpvotedPrice={hasUpvotedPrice}
        isUpvotesLoading={
          userUpvotesQuery.isLoading || userPriceUpvotesQuery.isLoading
        }
        onAddInfo={handleAddInfo}
      />
      <AddInfoModal
        isOpen={showAddInfoModal}
        onClose={() => setShowAddInfoModal(false)}
        entityType={type}
        entityId={id!}
        onAddSchedule={handleAddSchedule}
        onAddPrice={handleAddPrice}
        defaultTab={activeModalTab}
      />
    </Layout>
  );
}
