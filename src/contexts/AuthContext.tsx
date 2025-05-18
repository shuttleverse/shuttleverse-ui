import { ReactNode } from "react";
import { useAuthStatus } from "@/services/auth";
import { useUserProfile } from "@/services/user";
import { AuthContext } from "@/contexts/AuthContext.context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: authData, isLoading: isAuthLoading } = useAuthStatus();

  const isAuthenticated = authData?.authenticated || false;

  const { data: userData, isLoading: isUserLoading } =
    useUserProfile(isAuthenticated);

  const isLoading = isAuthLoading || (isAuthenticated && isUserLoading);

  const user = userData?.data || null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};
