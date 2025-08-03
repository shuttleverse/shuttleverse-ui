import { MapPin } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { useToast } from "@/hooks/use-toast";

interface LocationDisplayProps {
  variant?: "compact" | "full";
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  variant = "compact",
  className = "",
}) => {
  const { city, state, isLoading, error, refreshLocation } = useLocation();
  const { toast } = useToast();

  const handleLocationClick = async () => {
    localStorage.removeItem("shuttleverse_user_location");
    localStorage.removeItem("shuttleverse_location_data");
    const errorMessage = await refreshLocation();
    if (errorMessage) {
      toast({
        title: "Location Error",
        description: String(errorMessage),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 text-gray-500 ${className}`}>
        <MapPin className="h-3 w-3" />
        <span className="text-xs">Loading location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={handleLocationClick}
        className={`flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ${className}`}
      >
        <MapPin className="h-3 w-3" />
        <span className="text-xs font-medium">Boston, MA</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleLocationClick}
        className={`flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ${className}`}
      >
        <MapPin className="h-3 w-3" />
        <span className="text-xs font-medium">
          {city}, {state}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLocationClick}
      className={`flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer ${className}`}
    >
      <MapPin className="h-4 w-4" />
      <span className="text-sm font-medium">
        {city}, {state}
      </span>
    </button>
  );
};

export default LocationDisplay;
