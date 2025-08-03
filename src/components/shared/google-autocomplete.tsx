import { useState } from "react";
import { Search } from "lucide-react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAutocompleteSuggestions } from "@/hooks/use-autocomplete-suggestions";
import { SearchLevel } from "@/hooks/use-autocomplete-suggestions";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GoogleAutoCompleteProps {
  value?: string;
  searchLevel?: SearchLevel;
  layoutMode?: "default" | "flex";
  onSelect?: (place: {
    name: string;
    longitude?: number;
    latitude?: number;
  }) => void;
  onClear?: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const GoogleAutoCompleteInner = ({
  value,
  searchLevel,
  layoutMode = "default",
  onSelect,
  onClear,
  inputProps,
}: GoogleAutoCompleteProps) => {
  const [displayValue, setDisplayValue] = useState(value || "");
  const [searchValue, setSearchValue] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<google.maps.places.PlacePrediction | null>(null);
  const { suggestions, isLoading, resetSession, fetchPlaceDetails } =
    useAutocompleteSuggestions(searchValue, searchLevel);

  const handleSuggestionSelect = async (
    placePrediction: google.maps.places.PlacePrediction
  ) => {
    setSelectedSuggestion(placePrediction);

    const fullText = placePrediction.text.text;
    const parts = fullText.split(", ");
    let displayText = fullText;

    if (parts.length > 1) {
      displayText = parts.slice(0, -1).join(", ");
    }

    setDisplayValue(displayText);
    setSearchValue("");
    resetSession();

    if (onSelect) {
      onSelect({
        name: displayText,
        longitude: undefined,
        latitude: undefined,
      });

      if (placePrediction.placeId) {
        const placeDetails = await fetchPlaceDetails(placePrediction.placeId);
        if (placeDetails) {
          onSelect({
            name: displayText,
            longitude: placeDetails.longitude,
            latitude: placeDetails.latitude,
          });
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setSearchValue(newValue);
    setSelectedSuggestion(null);

    if (newValue === "") {
      setSearchValue("");
      setDisplayValue("");
      setSelectedSuggestion(null);
      if (onClear) {
        onClear();
      }
    }
  };

  if (layoutMode === "default") {
    return (
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <input
          value={displayValue}
          onChange={handleInputChange}
          placeholder="Type a place..."
          className="flex w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          {...inputProps}
        />
        {isLoading && <div>Loading...</div>}
        {suggestions.length > 0 && searchValue && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              background: "#fff",
              position: "absolute",
              zIndex: 10,
              width: "100%",
              top: "100%",
            }}
          >
            {suggestions.map(({ placePrediction }, idx) => (
              <li
                key={placePrediction.placeId}
                style={{ padding: 8, cursor: "pointer" }}
                onClick={() => handleSuggestionSelect(placePrediction)}
              >
                {placePrediction.text.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <input
          value={displayValue}
          onChange={handleInputChange}
          placeholder="Type a place..."
          className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          {...inputProps}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && searchValue && (
        <div className="flex-1 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto min-h-0">
          {suggestions.map(({ placePrediction }, idx) => (
            <button
              key={placePrediction.placeId}
              className="w-full px-4 py-3 text-left cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors focus:outline-none focus:bg-gray-50"
              onClick={() => handleSuggestionSelect(placePrediction)}
            >
              <div className="text-sm font-medium text-gray-900">
                {placePrediction.text.text}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GoogleAutoComplete = (props: GoogleAutoCompleteProps) => {
  return (
    <APIProvider apiKey={API_KEY} libraries={["places"]}>
      <GoogleAutoCompleteInner {...props} />
    </APIProvider>
  );
};

export default GoogleAutoComplete;
