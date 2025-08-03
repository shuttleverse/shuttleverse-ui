import React, { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocationContext } from "@/hooks/use-location-context";
import GoogleAutoComplete from "./google-autocomplete";

interface LocationPickerProps {
  trigger?: React.ReactNode;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const {
    locationData,
    setManualLocation,
    setLocationWithCoordinates,
    refreshLocation,
  } = useLocationContext();

  const handleLocationSelect = (place: {
    name: string;
    longitude?: number;
    latitude?: number;
  }) => {
    const description = place.name;
    const parts = description.split(", ");

    let city = "";
    let state = "";
    let country = "US";

    if (parts.length >= 2) {
      city = parts[0];
      state = parts[1];

      if (parts.length >= 3) {
        country = parts[2];
      }
    }

    if (place.longitude && place.latitude) {
      setLocationWithCoordinates(
        city,
        state,
        country,
        place.latitude,
        place.longitude
      );
    } else {
      setManualLocation(city, state, country);
    }

    setIsOpen(false);
    toast({
      title: "Location Updated",
      description: `Set to ${city}, ${state}`,
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              }`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const addressComponents = data.results[0].address_components;
              let city = "";
              let state = "";
              let country = "US";

              for (const component of addressComponents) {
                if (component.types.includes("locality")) {
                  city = component.long_name;
                } else if (
                  component.types.includes("administrative_area_level_1")
                ) {
                  state = component.short_name;
                } else if (component.types.includes("country")) {
                  country = component.short_name;
                }
              }

              if (city && state) {
                setLocationWithCoordinates(
                  city,
                  state,
                  country,
                  latitude,
                  longitude
                );
                setIsOpen(false);
                toast({
                  title: "Location Updated",
                  description: `Set to ${city}, ${state}`,
                });
              } else {
                toast({
                  title: "Location Error",
                  description:
                    "Could not determine city and state from your location",
                  variant: "destructive",
                });
              }
            } else {
              toast({
                title: "Location Error",
                description: "No location data found for your coordinates",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error getting location details:", error);
            toast({
              title: "Location Error",
              description: "Failed to get location details. Please try again.",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          let errorMessage = "Failed to get your current location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }

          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            {locationData.city && locationData.state
              ? `${locationData.city}, ${locationData.state}`
              : "Set Location"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Set Your Location</DialogTitle>
          <DialogDescription>
            Choose your current location or search for a city to see relevant
            results.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <button
            onClick={handleCurrentLocation}
            className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Navigation className="h-5 w-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">
              Use Current Location
            </span>
          </button>

          {/* Divider */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                or search for a city
              </span>
            </div>
          </div>

          {/* Search Input with Flexible Container */}
          <div className="flex-1 flex flex-col min-h-0">
            <GoogleAutoComplete
              searchLevel="city"
              layoutMode="flex"
              onSelect={handleLocationSelect}
              inputProps={{
                placeholder: "Search for a city...",
                className:
                  "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;
