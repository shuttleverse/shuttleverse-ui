import React, { createContext, useState, ReactNode, useEffect } from "react";

interface LocationCoordinates {
  latitude: string;
  longitude: string;
  timestamp: number;
}

interface LocationData {
  city: string;
  state: string;
  country: string;
  coordinates: LocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_LOCATION = {
  city: "Boston",
  state: "MA",
  country: "US",
  coordinates: {
    latitude: "42.3601",
    longitude: "-71.0589",
    timestamp: Date.now(),
  },
};

const LOCATION_STORAGE_KEY = "shuttleverse_location_data";

let geocoder: google.maps.Geocoder | null = null;

const getGeocoder = () => {
  if (!geocoder) {
    geocoder = new google.maps.Geocoder();
  }
  return geocoder;
};

interface LocationContextType {
  locationData: LocationData;
  setManualLocation: (city: string, state: string, country?: string) => void;
  setLocationWithCoordinates: (
    city: string,
    state: string,
    country: string,
    latitude: number,
    longitude: number
  ) => void;
  refreshLocation: () => Promise<string | null>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export { LocationContext };
export type { LocationContextType, LocationData, LocationCoordinates };

interface LocationProviderProps {
  children: ReactNode;
}

const saveLocationToStorage = (locationData: LocationData) => {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.warn("Failed to save location to localStorage:", error);
  }
};

const loadLocationFromStorage = (): LocationData | null => {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load location from localStorage:", error);
  }
  return null;
};

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [locationData, setLocationData] = useState<LocationData>(() => {
    const stored = loadLocationFromStorage();
    return (
      stored || {
        city: DEFAULT_LOCATION.city,
        state: DEFAULT_LOCATION.state,
        country: DEFAULT_LOCATION.country,
        coordinates: DEFAULT_LOCATION.coordinates,
        isLoading: false,
        error: null,
      }
    );
  });

  useEffect(() => {
    const stored = loadLocationFromStorage();
    if (!stored && navigator.geolocation) {
      const askForLocation = async () => {
        const userConsent = window.confirm(
          "This app would like to access your location to show nearby places. Allow location access?"
        );

        if (userConsent) {
          await getLocationData(true);
        } else {
          setLocationData(() => ({
            city: DEFAULT_LOCATION.city,
            state: DEFAULT_LOCATION.state,
            country: DEFAULT_LOCATION.country,
            coordinates: DEFAULT_LOCATION.coordinates,
            isLoading: false,
            error: null,
          }));
        }
      };

      setTimeout(askForLocation, 1000);
    }
  }, []);

  useEffect(() => {
    saveLocationToStorage(locationData);
  }, [locationData]);

  const getLocationData = async (forceRefresh = false) => {
    setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            considerIp: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get location from Google Geolocation API");
      }

      const data = await response.json();

      if (data.location) {
        const { lat: latitude, lng: longitude } = data.location;

        const result = await new Promise<google.maps.GeocoderResult[]>(
          (resolve, reject) => {
            getGeocoder()?.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results) {
                  resolve(results);
                } else {
                  reject(new Error(`Geocoding failed: ${status}`));
                }
              }
            );
          }
        );

        if (result && result.length > 0) {
          const addressComponents = result[0].address_components;

          let city = "";
          let state = "";
          let country = "";

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

          setLocationData({
            city,
            state,
            country,
            coordinates: {
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              timestamp: Date.now(),
            },
            isLoading: false,
            error: null,
          });
          return null;
        } else {
          setLocationData((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
          return null;
        }
      } else {
        throw new Error(
          "No location data received from Google Geolocation API"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get location details. Please try again.";
      setLocationData((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return errorMessage;
    }
  };

  const setManualLocation = (
    city: string,
    state: string,
    country: string = "US"
  ) => {
    setLocationData((prev) => ({
      ...prev,
      city,
      state,
      country,
      isLoading: false,
      error: null,
    }));
  };

  const setLocationWithCoordinates = (
    city: string,
    state: string,
    country: string,
    latitude: number,
    longitude: number
  ) => {
    setLocationData({
      city,
      state,
      country,
      coordinates: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        timestamp: Date.now(),
      },
      isLoading: false,
      error: null,
    });
  };

  const refreshLocation = async () => {
    const errorMessage = await getLocationData(true);
    return errorMessage;
  };

  const clearLocation = () => {
    setLocationData({
      city: DEFAULT_LOCATION.city,
      state: DEFAULT_LOCATION.state,
      country: DEFAULT_LOCATION.country,
      coordinates: DEFAULT_LOCATION.coordinates,
      isLoading: false,
      error: null,
    });
  };

  const value: LocationContextType = {
    locationData,
    setManualLocation,
    setLocationWithCoordinates,
    refreshLocation,
    clearLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
