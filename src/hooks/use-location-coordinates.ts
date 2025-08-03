import { useState, useEffect } from "react";

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

const LOCAL_STORAGE_KEY = "shuttleverse_user_location";
const LOCATION_DATA_KEY = "shuttleverse_location_data";
const LOCATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const useLocationCoordinates = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    city: DEFAULT_LOCATION.city,
    state: DEFAULT_LOCATION.state,
    country: DEFAULT_LOCATION.country,
    coordinates: DEFAULT_LOCATION.coordinates,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const getLocationData = async () => {
      // Check for cached location data first
      const cachedLocation = localStorage.getItem(LOCAL_STORAGE_KEY);
      const cachedLocationData = localStorage.getItem(LOCATION_DATA_KEY);

      let cachedCoordinates = null;
      let cachedCityData = null;

      if (cachedLocation) {
        const parsed = JSON.parse(cachedLocation);
        if (parsed && Date.now() - parsed.timestamp < LOCATION_EXPIRY_MS) {
          cachedCoordinates = parsed;
        }
      }

      if (cachedLocationData) {
        const parsed = JSON.parse(cachedLocationData);
        if (parsed && Date.now() - parsed.timestamp < LOCATION_EXPIRY_MS) {
          cachedCityData = parsed;
        }
      }

      // If we have both cached coordinates and city data, use them
      if (cachedCoordinates && cachedCityData) {
        setLocationData({
          city: cachedCityData.city,
          state: cachedCityData.state,
          country: cachedCityData.country,
          coordinates: cachedCoordinates,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        if (!navigator.geolocation) {
          // If no geolocation support, use cached data if available, otherwise use default
          if (cachedCoordinates && cachedCityData) {
            setLocationData({
              city: cachedCityData.city,
              state: cachedCityData.state,
              country: cachedCityData.country,
              coordinates: cachedCoordinates,
              isLoading: false,
              error: null,
            });
          } else {
            setLocationData((prev) => ({
              ...prev,
              isLoading: false,
              error: null,
            }));
          }
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              const coordinates = {
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                timestamp: Date.now(),
              };

              // Save coordinates to localStorage
              try {
                localStorage.setItem(
                  LOCAL_STORAGE_KEY,
                  JSON.stringify(coordinates)
                );
              } catch (e) {
                // Ignore localStorage error
              }

              // Reverse geocode using Google Maps Geocoding API
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

                // Cache the location data
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
                  coordinates,
                  isLoading: false,
                  error: null,
                });
              } else {
                // If geocoding fails, use cached data if available, otherwise use default
                if (cachedCityData) {
                  setLocationData({
                    city: cachedCityData.city,
                    state: cachedCityData.state,
                    country: cachedCityData.country,
                    coordinates,
                    isLoading: false,
                    error: null,
                  });
                } else {
                  setLocationData((prev) => ({
                    ...prev,
                    coordinates,
                    isLoading: false,
                    error: null,
                  }));
                }
              }
            } catch (error) {
              // If geocoding API fails, use cached data if available, otherwise use default
              if (cachedCityData) {
                setLocationData({
                  city: cachedCityData.city,
                  state: cachedCityData.state,
                  country: cachedCityData.country,
                  coordinates:
                    cachedCoordinates || DEFAULT_LOCATION.coordinates,
                  isLoading: false,
                  error: null,
                });
              } else {
                setLocationData((prev) => ({
                  ...prev,
                  coordinates:
                    cachedCoordinates || DEFAULT_LOCATION.coordinates,
                  isLoading: false,
                  error: null,
                }));
              }
            }
          },
          (error) => {
            // If geolocation fails, use cached data if available, otherwise use default
            if (cachedCoordinates && cachedCityData) {
              setLocationData({
                city: cachedCityData.city,
                state: cachedCityData.state,
                country: cachedCityData.country,
                coordinates: cachedCoordinates,
                isLoading: false,
                error: null,
              });
            } else {
              setLocationData((prev) => ({
                ...prev,
                isLoading: false,
                error: null,
              }));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      } catch (error) {
        // If any other error occurs, use cached data if available, otherwise use default
        if (cachedCoordinates && cachedCityData) {
          setLocationData({
            city: cachedCityData.city,
            state: cachedCityData.state,
            country: cachedCityData.country,
            coordinates: cachedCoordinates,
            isLoading: false,
            error: null,
          });
        } else {
          setLocationData((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
        }
      }
    };

    getLocationData();
  }, []);

  return locationData;
};
