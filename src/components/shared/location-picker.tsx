import React, { useState, useEffect, useRef } from "react";
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
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const previousLocation = useRef<string>("");
  const { toast } = useToast();
  const {
    locationData,
    setManualLocation,
    setLocationWithCoordinates,
    refreshLocation,
  } = useLocationContext();

  useEffect(() => {
    const currentLocation = `${locationData.city}, ${locationData.state}`;
    if (
      isUpdatingLocation &&
      locationData.city &&
      locationData.state &&
      currentLocation !== previousLocation.current
    ) {
      setIsUpdatingLocation(false);
      previousLocation.current = currentLocation;
      toast({
        title: "Location Updated",
      });
    }
  }, [locationData.city, locationData.state, isUpdatingLocation, toast]);

  const handleLocationSelect = (place: {
    name: string;
    longitude?: number;
    latitude?: number;
  }) => {
    setIsUpdatingLocation(true);
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
  };

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }
    const userConsent = window.confirm(
      "This app would like to access your location to show nearby places. Allow location access?"
    );

    if (!userConsent) {
      toast({
        title: "Location Access Cancelled",
        description:
          "Location access was cancelled. You can still search for locations manually.",
      });
      return;
    }

    setIsUpdatingLocation(true);
    const errorMessage = await refreshLocation();

    if (errorMessage) {
      setIsUpdatingLocation(false);
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      setIsOpen(false);
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
