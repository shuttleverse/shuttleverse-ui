import { useState, useEffect } from "react";
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAPBOX_OPTIONS } from "@/config/mapbox";

interface LocationSuggestion {
  id: string;
  text: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      // Don't search for empty or very short queries
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`;
        const params = new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          ...DEFAULT_MAPBOX_OPTIONS,
          limit: "5",
        });

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch location suggestions");
        }

        const data = await response.json();

        if (isMounted) {
          setSuggestions(data.features || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching location suggestions:", err);
          setError("Failed to load location suggestions");
          setLoading(false);
        }
      }
    };

    // Debounce API requests
    const timeoutId = setTimeout(fetchSuggestions, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    query,
    setQuery,
    suggestions,
    loading,
    error,
    clearSuggestions,
  };
}
