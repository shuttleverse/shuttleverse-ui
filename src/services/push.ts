import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRequest {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
}

export interface PushSubscriptionResponse {
  id: string;
  userId: string;
  endpoint: string;
  deviceType: string;
  createdAt: string;
  updatedAt: string;
}

export function useVapidPublicKey() {
  return useQuery({
    queryKey: ["vapidPublicKey"],
    queryFn: async () => {
      const { data } = await api.get<{ data: string }>(
        "/api/connect/push/vapid-public-key"
      );
      return data.data;
    },
    staleTime: Infinity,
    retry: 2,
  });
}

export function useSubscribePush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PushSubscriptionRequest) => {
      const { data } = await api.post<{ data: PushSubscriptionResponse }>(
        "/api/connect/push/subscribe",
        request
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pushSubscriptions"] });
    },
  });
}

export function useUnsubscribePush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endpoint: string) => {
      await api.delete("/api/connect/push/unsubscribe", {
        params: { endpoint },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pushSubscriptions"] });
    },
  });
}

export function useUnsubscribeAllPush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete("/api/connect/push/unsubscribe-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pushSubscriptions"] });
    },
  });
}

export function usePushSubscriptions(enabled: boolean = true) {
  return useQuery({
    queryKey: ["pushSubscriptions"],
    queryFn: async () => {
      const { data } = await api.get<{ data: PushSubscriptionResponse[] }>(
        "/api/connect/push/subscriptions"
      );
      return data.data;
    },
    enabled,
  });
}

/**
 * Convert VAPID public key from base64url to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications");
  }

  const currentPermission = Notification.permission;

  if (currentPermission === "granted") {
    return "granted";
  }

  if (currentPermission === "denied") {
    return "denied";
  }

  return await Notification.requestPermission();
}

export async function createPushSubscription(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push messaging is not supported");
  }

  const registration = await navigator.serviceWorker.ready;

  const key = urlBase64ToUint8Array(vapidPublicKey);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key as BufferSource,
  });

  return subscription;
}

export function subscriptionToRequest(
  subscription: PushSubscription,
  userAgent?: string
): PushSubscriptionRequest {
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  if (!key || !auth) {
    throw new Error("Subscription keys are missing");
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64Url(key),
      auth: arrayBufferToBase64Url(auth),
    },
    userAgent: userAgent || navigator.userAgent,
  };
}

/**
 * Convert ArrayBuffer to base64url string
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer | ArrayBufferView): string {
  const bytes =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
