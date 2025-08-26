import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

export type OwnershipClaimData = {
  id: string;
  entityType: "COURT" | "COACH" | "STRINGER";
  entityId: string;
  userNotes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
  creator?: {
    id: string;
    username: string;
    email: string;
    bio: string;
  };
};

export type OwnershipClaimFormData = {
  entityType: "COURT" | "COACH" | "STRINGER";
  entityId: string;
  userNotes?: string;
  files: File[];
};

export function useCreateOwnershipClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OwnershipClaimFormData) => {
      const formData = new FormData();
      formData.append("entityType", data.entityType);
      formData.append("entityId", data.entityId);
      if (data.userNotes) {
        formData.append("userNotes", data.userNotes);
      }

      data.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post("/api/community/v1/claim", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownership-claims"] });
    },
  });
}

export function useUserOwnershipClaims() {
  return useQuery({
    queryKey: ["ownership-claims", "user"],
    queryFn: async () => {
      const response = await api.get("/api/community/v1/claim/me");
      return response.data.data || [];
    },
  });
}

export function useAllOwnershipClaims(page = 0, size = 10) {
  return useQuery({
    queryKey: ["ownership-claims", "all", page, size],
    queryFn: async () => {
      const response = await api.get("/api/community/v1/claim/all", {
        params: { page, size },
      });
      return response.data.data;
    },
  });
}

export function useUpdateOwnershipClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      status,
    }: {
      claimId: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const response = await api.put(
        `/api/community/v1/claim/${claimId}/status/${status}`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownership-claims"] });
    },
  });
}
