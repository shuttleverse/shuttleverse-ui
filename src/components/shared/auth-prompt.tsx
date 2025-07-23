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

interface AuthPromptProps {
  title?: string;
  description?: string;
  action?: string;
  onClose?: () => void;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({
  title = "Authentication Required",
  description = "You need to be signed in to perform this action.",
  action = "Sign in to continue",
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Lock className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {action}
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
