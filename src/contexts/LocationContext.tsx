import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

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
    saveLocationToStorage(locationData);
  }, [locationData]);

  const getLocationData = async (forceRefresh = false) => {
    setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setLocationData((prev) => ({
        ...prev,
        isLoading: false,
        error: "Geolocation not supported by this browser.",
      }));
      return "Geolocation not supported by this browser.";
    }

    return new Promise<string | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              }`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch location data");
            }

            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
              const addressComponents = data.results[0].address_components;

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
              resolve(null);
            } else {
              setLocationData((prev) => ({
                ...prev,
                isLoading: false,
                error: null,
              }));
              resolve(null);
            }
          } catch (error) {
            setLocationData((prev) => ({
              ...prev,
              isLoading: false,
              error: "Failed to get location details. Please try again.",
            }));
            resolve("Failed to get location details. Please try again.");
          }
        },
        (error) => {
          let errorMessage = "Failed to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = error.message || "Failed to get location";
          }

          setLocationData((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
          resolve(errorMessage);
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 300000,
        }
      );
    });
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
