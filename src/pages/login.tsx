import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useOAuthPopup } from "@/hooks/useOAuthPopup";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const Login = () => {
  const { openOAuthPopup } = useOAuthPopup();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleGoogleLogin = () => {
    setError(null);
    openOAuthPopup();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-600 to-emerald-400">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
      </div>

      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <Link to="/" className="inline-block">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Shuttleverse
          </h1>
        </Link>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 border border-emerald-700/30 shadow-2xl hover:shadow-[0_8px_40px_8px_rgba(16,64,32,0.18)] transition-all duration-200 rounded-2xl p-8 scale-100 hover:scale-[1.025] backdrop-blur-md text-center">
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">
              Welcome to Shuttleverse
            </h2>
            <p className="text-base text-emerald-800 mb-6">
              Sign in with Google to access your account and connect with the
              badminton community.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  {error || "Authentication failed. Please try again."}
                </p>
              </div>
            )}
            <Button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 h-14 text-lg shadow-md"
              size="lg"
            >
              <FcGoogle className="w-6 h-6" />
              <span>Continue with Google</span>
            </Button>
            <p className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary hover:text-primary/80 underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80 underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
