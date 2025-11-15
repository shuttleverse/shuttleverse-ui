import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePushNotification } from "@/contexts/PushNotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { requestNotificationPermission } from "@/services/push";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "push-notification-prompt-dismissed";

export const PushNotificationPrompt = () => {
  const { permission, subscribe, isSubscribing } = usePushNotification();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    if (permission !== "default") {
      setOpen(false);
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, "true");
      return;
    }

    if ("Notification" in window && permission === "default") {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, permission]);

  const handleEnable = async () => {
    setOpen(false);
    setIsDismissed(true);

    try {
      const permissionResult = await requestNotificationPermission();

      if (permissionResult === "granted") {
        await subscribe();
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  const handleDismiss = () => {
    setOpen(false);
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (isDismissed || permission !== "default") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Enable Push Notifications</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Get notified about new messages even when the app is closed. You'll
            receive instant alerts for important updates.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Not Now
          </Button>
          <Button
            onClick={handleEnable}
            disabled={isSubscribing}
            className="w-full sm:w-auto"
          >
            <Bell className="mr-2 h-4 w-4" />
            {isSubscribing ? "Enabling..." : "Enable Notifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
