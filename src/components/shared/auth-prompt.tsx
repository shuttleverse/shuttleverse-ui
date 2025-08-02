import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthPromptProps {
  title?: string;
  description?: string;
  action?: string;
  onClose?: () => void;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const needsProfile = isAuthenticated && !user;

  const defaultTitle = needsProfile
    ? "Complete Your Profile"
    : "Authentication Required";

  const defaultDescription = needsProfile
    ? "You need to complete your profile to continue."
    : "You need to be signed in to perform this action.";

  const defaultAction = needsProfile
    ? "Complete Profile"
    : "Sign in to continue";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            {needsProfile ? (
              <UserPlus className="h-6 w-6 text-emerald-600" />
            ) : (
              <Lock className="h-6 w-6 text-emerald-600" />
            )}
          </div>
          <CardTitle className="text-xl">{defaultTitle}</CardTitle>
          <CardDescription className="text-base">
            {defaultDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link
                to={needsProfile ? "/onboarding" : "/login"}
                className="flex items-center justify-center gap-2"
              >
                {needsProfile ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {defaultAction}
              </Link>
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPrompt;
