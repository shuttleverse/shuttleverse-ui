import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from "@/services/auth";
import { useUserProfile } from "@/services/user";
import React from "react";

export default function ProtectedRoute() {
  const {
    data: auth,
    isLoading: authLoading,
    isError: authError,
  } = useAuthStatus();

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile(!!auth?.authenticated);

  React.useEffect(() => {
    if (auth?.authenticated) {
      refetchProfile();
    }
  }, [auth?.authenticated, refetchProfile]);

  if (authLoading || (auth?.authenticated && profileLoading)) return null;

  if (authError || !auth?.authenticated) {
    return <Navigate to="/login" />;
  }

  if (!profile?.data) {
    return <Navigate to="/onboarding" />;
  }

  return <Outlet />;
}
