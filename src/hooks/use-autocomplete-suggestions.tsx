import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export type UseAutocompleteSuggestionsReturn = {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading: boolean;
  resetSession: () => void;
  fetchPlaceDetails: (placeId: string) => Promise<{
    name: string;
    longitude: number;
    latitude: number;
  } | null>;
  debug?: {
    placesLib: unknown;
    lastRequest: unknown;
    error?: string;
  };
};

export type SearchLevel = "city";

export function useAutocompleteSuggestions(
  inputString: string,
  searchLevel: SearchLevel | null = null,
  requestOptions: Partial<google.maps.places.AutocompleteRequest> = {}
): UseAutocompleteSuggestionsReturn {
  const placesLib = useMapsLibrary("places");

  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<unknown>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchPlaceDetails = async (placeId: string) => {
    if (!placesLib) return null;

    try {
      const { Place } = placesLib;
      const place = new Place({ id: placeId });
      const result = await place.fetchFields({
        fields: ["displayName", "location"],
      });

      if (result && result.place.location) {
        return {
          name: result.place.displayName || "",
          longitude: result.place.location.lng(),
          latitude: result.place.location.lat(),
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching place details:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!placesLib) return;

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const levelSpecificOptions: Partial<google.maps.places.AutocompleteRequest> =
      {};

    switch (searchLevel) {
      case "city":
        levelSpecificOptions.includedPrimaryTypes = [
          "locality",
          "administrative_area_level_1",
        ];
        break;
      default:
        levelSpecificOptions.includedPrimaryTypes = [
          "establishment",
          "street_address",
        ];
        break;
    }

    const request: google.maps.places.AutocompleteRequest = {
      ...levelSpecificOptions,
      ...requestOptions,
      input: inputString,
      sessionToken: sessionTokenRef.current,
    };
    setLastRequest(request);
    setError(undefined);

    if (inputString === "") {
      if (suggestions.length > 0) setSuggestions([]);
      return;
    }

    setIsLoading(true);
    AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then((res) => {
        setSuggestions(res.suggestions);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e?.message || String(e));
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib, inputString, searchLevel]);

  return {
    suggestions,
    isLoading,
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    },
    fetchPlaceDetails,
    debug: {
      placesLib,
      lastRequest,
      error,
    },
  };
}
