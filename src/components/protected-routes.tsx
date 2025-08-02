import { Navigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Onboarding from "@/pages/onboarding";
export default function ProtectedRoute() {
  const { user, isAuthenticated, isAuthLoading, isUserLoading, isUserError } =
    useAuth();

  if (isAuthLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-indigo/5">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="flex justify-center">
            <Loader2 className="h-16 w-16 text-primary-indigo animate-spin" />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
            <p className="text-muted-foreground">
              We're getting everything ready for you. This might take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-indigo/5">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Server Error</h1>
            <p className="text-muted-foreground">
              Something went wrong with our servers. Please try again later or
              contact support if the problem persists.
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-primary-indigo hover:bg-primary-indigo/90"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Home Page
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <Onboarding />;
  }

  return <Outlet />;
}
