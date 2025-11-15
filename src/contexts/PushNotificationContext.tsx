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
  const isSubscribingRef = useRef<boolean>(false);
  const hasAttemptedAutoSubscribeRef = useRef<boolean>(false);

  const { data: vapidPublicKey } = useVapidPublicKey();
  const subscribeMutation = useSubscribePush();
  const unsubscribeMutation = useUnsubscribeAllPush();

  const subscribeMutationRef = useRef(subscribeMutation);
  subscribeMutationRef.current = subscribeMutation;

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
    if (isSubscribingRef.current) {
      return;
    }

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

    if (!isAuthenticated) {
      return;
    }

    isSubscribingRef.current = true;
    setIsSubscribing(true);
    try {
      const subscription = await createPushSubscription(vapidPublicKey);
      if (!subscription) {
        throw new Error("Failed to create push subscription");
      }

      const request = subscriptionToRequest(subscription);
      await subscribeMutationRef.current.mutateAsync(request);
      setIsSubscribed(true);
      hasExplicitlyUnsubscribedRef.current = false;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      setIsSubscribed(false);
    } finally {
      isSubscribingRef.current = false;
      setIsSubscribing(false);
    }
  }, [vapidPublicKey, permission, isAuthenticated]);

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
      setIsSubscribed(false);
      console.error("Failed to unsubscribe:", error);
    }
  }, [unsubscribeMutation]);

  useEffect(() => {
    if (!isAuthenticated || !vapidPublicKey || permission !== "granted") {
      return;
    }

    if (hasExplicitlyUnsubscribedRef.current) {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (hasAttemptedAutoSubscribeRef.current) {
      return;
    }

    const autoSubscribe = async () => {
      if (isSubscribingRef.current) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (!existingSubscription) {
          if (!isSubscribingRef.current && vapidPublicKey) {
            isSubscribingRef.current = true;
            hasAttemptedAutoSubscribeRef.current = true;
            try {
              const newSubscription = await createPushSubscription(
                vapidPublicKey
              );
              if (newSubscription) {
                const request = subscriptionToRequest(newSubscription);
                await subscribeMutationRef.current.mutateAsync(request);
                setIsSubscribed(true);
                hasExplicitlyUnsubscribedRef.current = false;
              }
            } catch (error) {
              console.error("Failed to auto-subscribe:", error);
              hasAttemptedAutoSubscribeRef.current = false;
            } finally {
              isSubscribingRef.current = false;
            }
          }
        } else {
          setIsSubscribed(true);
          if (!isSubscribingRef.current) {
            hasAttemptedAutoSubscribeRef.current = true;
            try {
              const request = subscriptionToRequest(existingSubscription);
              await subscribeMutationRef.current.mutateAsync(request);
            } catch (error) {
              const errorMessage =
                (error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message || "";
              if (!errorMessage.includes("already exists for another user")) {
                hasAttemptedAutoSubscribeRef.current = false;
              }
            }
          }
        }
      } catch (error) {
        // Silently handle error
      }
    };

    const timer = setTimeout(autoSubscribe, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, vapidPublicKey, permission]);

  useEffect(() => {
    const wasAuthenticated = prevAuthenticatedRef.current;
    prevAuthenticatedRef.current = isAuthenticated;

    if (wasAuthenticated === true && !isAuthenticated) {
      unsubscribe();
      hasExplicitlyUnsubscribedRef.current = false;
      hasAttemptedAutoSubscribeRef.current = false;
    } else if (wasAuthenticated === false && isAuthenticated) {
      hasExplicitlyUnsubscribedRef.current = false;
      hasAttemptedAutoSubscribeRef.current = false;
    } else if (wasAuthenticated === undefined && isAuthenticated) {
      hasExplicitlyUnsubscribedRef.current = false;
      hasAttemptedAutoSubscribeRef.current = false;
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
