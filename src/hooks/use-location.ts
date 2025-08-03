import { useState, useEffect } from "react";

interface LocationData {
  city: string;
  state: string;
  country: string;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_LOCATION = {
  city: "Boston",
  state: "MA",
  country: "US",
};

const LOCAL_STORAGE_KEY = "shuttleverse_user_location";
const LOCATION_DATA_KEY = "shuttleverse_location_data";
const LOCATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const useLocation = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    city: DEFAULT_LOCATION.city,
    state: DEFAULT_LOCATION.state,
    country: DEFAULT_LOCATION.country,
    isLoading: true,
    error: null,
  });

  const getLocationData = async (forceRefresh = false) => {
    setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

    const cached = localStorage.getItem(LOCATION_DATA_KEY);
    let cachedData = null;
    if (cached && !forceRefresh) {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed.timestamp < LOCATION_EXPIRY_MS) {
        cachedData = parsed;
        setLocationData({
          city: parsed.city,
          state: parsed.state,
          country: parsed.country,
          isLoading: false,
          error: null,
        });
        return null;
      }
    }

    if (!navigator.geolocation) {
      if (cachedData) {
        setLocationData({
          city: cachedData.city,
          state: cachedData.state,
          country: cachedData.country,
          isLoading: false,
          error: null,
        });
        return null;
      } else {
        setLocationData((prev) => ({
          ...prev,
          isLoading: false,
          error: "Geolocation not supported by this browser.",
        }));
        return "Geolocation not supported by this browser.";
      }
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const coordinates = {
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              timestamp: Date.now(),
            };

            try {
              localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(coordinates)
              );
            } catch (e) {
              // Ignore localStorage error
            }

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

              const locationInfo = {
                city,
                state,
                country,
                timestamp: Date.now(),
              };

              try {
                localStorage.setItem(
                  LOCATION_DATA_KEY,
                  JSON.stringify(locationInfo)
                );
              } catch (e) {
                // Ignore localStorage error
              }

              setLocationData({
                city,
                state,
                country,
                isLoading: false,
                error: null,
              });
              resolve(null);
            } else {
              if (cachedData) {
                setLocationData({
                  city: cachedData.city,
                  state: cachedData.state,
                  country: cachedData.country,
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
            }
          } catch (error) {
            if (cachedData) {
              setLocationData({
                city: cachedData.city,
                state: cachedData.state,
                country: cachedData.country,
                isLoading: false,
                error: null,
              });
              resolve(null);
            } else {
              setLocationData((prev) => ({
                ...prev,
                isLoading: false,
                error: "Failed to get location details. Please try again.",
              }));
              resolve("Failed to get location details. Please try again.");
            }
          }
        },
        (error) => {
          if (cachedData) {
            setLocationData({
              city: cachedData.city,
              state: cachedData.state,
              country: cachedData.country,
              isLoading: false,
              error: null,
            });
            resolve(null);
          } else {
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
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    });
  };

  useEffect(() => {
    getLocationData();
  }, []);

  const refreshLocationWithToast = async () => {
    const errorMessage = await getLocationData(true);
    return errorMessage;
  };

  return { ...locationData, refreshLocation: refreshLocationWithToast };
};
