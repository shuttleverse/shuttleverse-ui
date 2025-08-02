import { ReactNode } from "react";
import { useUserProfile } from "@/services/user";
import { AuthContext } from "@/contexts/AuthContext.context";
import { useAuthStatus } from "@/services/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: authStatus,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useAuthStatus();

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUserProfile(authStatus?.authenticated === true);

  const isAuthenticated = !isAuthError && authStatus?.authenticated;
  const user = userData?.data || null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        isUserLoading,
        isUserError,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
