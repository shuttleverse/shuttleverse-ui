import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAutocompleteSuggestions } from "@/hooks/use-autocomplete-suggestions";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GoogleAutoCompleteProps {
  value?: string;
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
  onSelect,
  onClear,
  inputProps,
}: GoogleAutoCompleteProps) => {
  const [displayValue, setDisplayValue] = useState(value || "");
  const [searchValue, setSearchValue] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<google.maps.places.PlacePrediction | null>(null);
  const { suggestions, isLoading, resetSession, fetchPlaceDetails } =
    useAutocompleteSuggestions(searchValue);

  const handleSuggestionSelect = async (
    placePrediction: google.maps.places.PlacePrediction
  ) => {
    setSelectedSuggestion(placePrediction);

    const fullText = placePrediction.text.text;
    const parts = fullText.split(", ");
    let displayText = fullText;

    if (parts.length >= 3) {
      displayText = parts.slice(0, 3).join(", ");
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

  return (
    <div className="autocomplete-container" style={{ position: "relative" }}>
      <input
        value={displayValue}
        onChange={handleInputChange}
        placeholder="Type a place..."
        {...inputProps}
      />
      {isLoading && <div>Loading...</div>}
      {suggestions.length > 0 && searchValue && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            border: "1px solid #eee",
            borderRadius: 4,
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
};

const GoogleAutoComplete = (props: GoogleAutoCompleteProps) => {
  return (
    <APIProvider apiKey={API_KEY} libraries={["places"]}>
      <GoogleAutoCompleteInner {...props} />
    </APIProvider>
  );
};

export default GoogleAutoComplete;
