import { useParams, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { EntityDetails } from "@/components/shared/entity-details";
import Layout from "@/components/layout/layout";
import {
  useCourt,
  useUpvoteCourtSchedule,
  useUpvoteCourtPrice,
} from "@/services/courts";
import {
  useCoach,
  useUpvoteCoachSchedule,
  useUpvoteCoachPrice,
} from "@/services/coaches";
import { useStringer, useUpvoteStringerPrice } from "@/services/stringers";

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

  const urlPath = location.pathname.split("/")[1] as URLPath;
  const type = URL_TO_API_TYPE[urlPath];

  const useEntity = ENTITY_HOOKS[type];
  const activeQuery = useEntity(id!);

  const upvoteScheduleMutation = {
    court: useUpvoteCourtSchedule(),
    coach: useUpvoteCoachSchedule(),
  }[type];

  const upvotePriceMutation = {
    court: useUpvoteCourtPrice(),
    coach: useUpvoteCoachPrice(),
    stringer: useUpvoteStringerPrice(),
  }[type];

  const handleUpvoteSchedule = async (scheduleId: string) => {
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
      toast({
        title: "Success",
        description: "Schedule upvoted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote schedule",
        variant: "destructive",
      });
    }
  };

  const handleUpvotePrice = async (priceId: string) => {
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
      toast({
        title: "Success",
        description: "Price upvoted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote price",
        variant: "destructive",
      });
    }
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
      <EntityDetails
        entity={activeQuery.data}
        onUpvoteSchedule={
          type !== "stringer" ? handleUpvoteSchedule : undefined
        }
        onUpvotePrice={handleUpvotePrice}
      />
    </Layout>
  );
}
