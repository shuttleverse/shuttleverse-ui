import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface OAuthMessage {
  type: "OAUTH_SUCCESS";
}

export function useOAuthPopup() {
  const popupRef = useRef<Window | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<OAuthMessage>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === "OAUTH_SUCCESS") {
        try {
          if (popupRef.current) {
            popupRef.current.close();
          }
        } catch (e) {
          // Ignore COOP errors when closing
        }
        popupRef.current = null;
        setIsPopupOpen(false);

        Promise.all([
          queryClient.refetchQueries({ queryKey: ["authStatus"] }),
          queryClient.refetchQueries({ queryKey: ["userProfile"] }),
        ]).then(() => {
          window.location.href = "/onboarding";
        });
      }
    };

    const timeoutId = setTimeout(() => {
      if (popupRef.current) {
        popupRef.current = null;
        setIsPopupOpen(false);
      }
    }, 5 * 60 * 1000);

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeoutId);
      try {
        if (popupRef.current) {
          popupRef.current.close();
        }
      } catch (e) {
        // Ignore COOP errors
      }
    };
  }, [queryClient]);

  const openOAuthPopup = () => {
    if (popupRef.current) {
      try {
        popupRef.current.focus();
        return;
      } catch (e) {
        popupRef.current = null;
      }
    }

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      alert(
        "Please allow popups for this site to sign in. You can enable popups in your browser settings."
      );
      return;
    }

    popupRef.current = popup;
    setIsPopupOpen(true);
  };

  return {
    openOAuthPopup,
    isPopupOpen,
  };
}
