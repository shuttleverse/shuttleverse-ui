import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    if (window.opener) {
      const error = searchParams.get("error");
      const success = searchParams.get("success");

      if (error) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: error,
          },
          window.location.origin
        );
        setStatus("error");
        setTimeout(() => {
          window.close();
        }, 1000);
      } else if (success !== "false") {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
          },
          window.location.origin
        );
        setStatus("success");
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
          },
          window.location.origin
        );
        setStatus("success");
        setTimeout(() => {
          window.close();
        }, 500);
      }
    } else {
      const error = searchParams.get("error");
      if (error) {
        window.location.href = "/login?error=" + encodeURIComponent(error);
      } else {
        window.location.href = "/onboarding";
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-800 via-emerald-600 to-emerald-400">
      <div className="bg-white/95 border border-emerald-700/30 shadow-2xl rounded-2xl p-8 text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-emerald-900 font-medium">
              Completing sign in...
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-emerald-900 font-medium">
              Sign in successful! Closing window...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-emerald-900 font-medium">
              Sign in failed. Closing window...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
