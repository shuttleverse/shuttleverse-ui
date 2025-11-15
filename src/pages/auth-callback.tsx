import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setTimeout(() => {
        window.location.href = "/login?error=" + encodeURIComponent(error);
      }, 1000);
    } else {
      setStatus("success");
      Promise.all([
        queryClient.refetchQueries({ queryKey: ["authStatus"] }),
        queryClient.refetchQueries({ queryKey: ["userProfile"] }),
      ]).then(() => {
        window.location.href = "/onboarding";
      });
    }
  }, [searchParams, queryClient]);

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
              Sign in successful! Redirecting...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-emerald-900 font-medium">
              Sign in failed. Redirecting...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
