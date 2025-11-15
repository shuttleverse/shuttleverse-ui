import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useVapidPublicKey,
  useSubscribePush,
  useUnsubscribeAllPush,
  requestNotificationPermission,
  createPushSubscription,
  subscriptionToRequest,
} from "@/services/push";

interface PushNotificationContextType {
  isSubscribed: boolean;
  isSubscribing: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  isSubscribed: false,
  isSubscribing: false,
  permission: "default",
  subscribe: async () => {},
  unsubscribe: async () => {},
});

export const usePushNotification = () => useContext(PushNotificationContext);

interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider = ({
  children,
}: PushNotificationProviderProps) => {
  const { isAuthenticated } = useAuth();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const prevAuthenticatedRef = useRef<boolean | undefined>(undefined);
  const hasExplicitlyUnsubscribedRef = useRef<boolean>(false);

  const { data: vapidPublicKey } = useVapidPublicKey();
  const subscribeMutation = useSubscribePush();
  const unsubscribeMutation = useUnsubscribeAllPush();

  useEffect(() => {
    const checkPermission = () => {
      if ("Notification" in window) {
        const currentPermission = Notification.permission;
        setPermission((prev) => {
          if (prev !== currentPermission) {
            return currentPermission;
          }
          return prev;
        });
      }
    };

    checkPermission();

    const handleFocus = () => {
      checkPermission();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkPermission();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !("serviceWorker" in navigator)) {
      return;
    }

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        // Silently handle error
      }
    };

    checkSubscription();
  }, [isAuthenticated]);

  const subscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      return;
    }

    const currentBrowserPermission = Notification.permission;

    if (currentBrowserPermission !== "granted") {
      if (currentBrowserPermission === "denied") {
        setPermission("denied");
        return;
      }
      setPermission(currentBrowserPermission);
      return;
    } else {
      if (permission !== "granted") {
        setPermission("granted");
      }
    }

    setIsSubscribing(true);
    try {
      const subscription = await createPushSubscription(vapidPublicKey);
      if (!subscription) {
        throw new Error("Failed to create push subscription");
      }

      const request = subscriptionToRequest(subscription);
      await subscribeMutation.mutateAsync(request);
      setIsSubscribed(true);
      hasExplicitlyUnsubscribedRef.current = false;
    } catch (error) {
      // Silently handle error
    } finally {
      setIsSubscribing(false);
    }
  }, [vapidPublicKey, permission, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    try {
      await unsubscribeMutation.mutateAsync();
      setIsSubscribed(false);
      hasExplicitlyUnsubscribedRef.current = true;

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
    } catch (error) {
      // Silently handle error
    }
  }, [unsubscribeMutation]);

  useEffect(() => {
    if (!isAuthenticated || !vapidPublicKey || permission === "denied") {
      return;
    }

    if (permission !== "granted") {
      return;
    }

    if (hasExplicitlyUnsubscribedRef.current) {
      return;
    }

    const wasAuthenticated = prevAuthenticatedRef.current;
    if (wasAuthenticated === true) {
      return;
    }

    const autoSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (!existingSubscription) {
          await subscribe();
        } else {
          setIsSubscribed(true);
        }
      } catch (error) {
        // Silently handle error
      }
    };

    const timer = setTimeout(autoSubscribe, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, vapidPublicKey, permission, subscribe]);

  useEffect(() => {
    if (!isAuthenticated || !vapidPublicKey || permission !== "granted") {
      return;
    }

    if (hasExplicitlyUnsubscribedRef.current) {
      return;
    }

    const checkAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (!existingSubscription) {
          await subscribe();
        } else {
          setIsSubscribed(true);
        }
      } catch (error) {
        // Silently handle error
      }
    };

    const wasAuthenticated = prevAuthenticatedRef.current;
    if (wasAuthenticated === true) {
      const timer = setTimeout(checkAndSubscribe, 1000);
      return () => clearTimeout(timer);
    }
  }, [permission, isAuthenticated, vapidPublicKey, subscribe]);

  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current;
    prevAuthenticatedRef.current = isAuthenticated;

    if (wasAuthenticated === true && !isAuthenticated) {
      unsubscribe();
      hasExplicitlyUnsubscribedRef.current = false; // Reset on logout
    } else if (wasAuthenticated === undefined && isAuthenticated) {
      hasExplicitlyUnsubscribedRef.current = false;
    }
  }, [isAuthenticated, unsubscribe]);

  return (
    <PushNotificationContext.Provider
      value={{
        isSubscribed,
        isSubscribing,
        permission,
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};
