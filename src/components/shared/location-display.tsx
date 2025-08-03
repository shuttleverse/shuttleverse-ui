import { MapPin } from "lucide-react";
import { useLocationContext } from "@/hooks/use-location-context";
import { useToast } from "@/hooks/use-toast";
import LocationPicker from "./location-picker";

interface LocationDisplayProps {
  variant?: "compact" | "full";
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  variant = "compact",
  className = "",
}) => {
  const { locationData, refreshLocation } = useLocationContext();
  const { toast } = useToast();

  const handleLocationClick = async () => {
    const errorMessage = await refreshLocation();
    if (errorMessage) {
      toast({
        title: "Location Error",
        description: String(errorMessage),
        variant: "destructive",
      });
    }
  };

  if (locationData.isLoading) {
    return (
      <div className={`flex items-center gap-1 text-gray-500 ${className}`}>
        <MapPin className="h-3 w-3" />
        <span className="text-xs">Loading location...</span>
      </div>
    );
  }

  if (locationData.error) {
    return (
      <LocationPicker
        trigger={
          <button
            className={`flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ${className}`}
          >
            <MapPin className="h-3 w-3" />
            <span className="text-xs font-medium">Boston, MA</span>
          </button>
        }
      />
    );
  }

  if (variant === "compact") {
    return (
      <LocationPicker
        trigger={
          <button
            className={`flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer ${className}`}
          >
            <MapPin className="h-3 w-3" />
            <span className="text-xs font-medium">
              {locationData.city}, {locationData.state}
            </span>
          </button>
        }
      />
    );
  }

  return (
    <LocationPicker
      trigger={
        <button
          className={`flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer ${className}`}
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">
            {locationData.city}, {locationData.state}
          </span>
        </button>
      }
    />
  );
};

export default LocationDisplay;
