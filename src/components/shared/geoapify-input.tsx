import {
  LocationType,
  SupportedLanguage,
  ByCountryCodeOptions,
  ByCircleOptions,
  ByRectOptions,
  ByProximityOptions,
} from "@geoapify/geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

interface GeoapifyPlace {
  properties: {
    formatted: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GeoapifyInputProps {
  value: string;
  type: string;
  language: string;
  limit: number;
  filterByCountryCode: string[];
  filterByCircle: string[];
  filterByRect: string[];
  filterByPlace: string;
  biasByCountryCode: string[];
  biasByCircle: string;
  biasByRect: string;
  biasByProximity: string;
  placeSelect?: (place: GeoapifyPlace) => void;
  suggestionsChange?: (suggestions: GeoapifyPlace[]) => void;
}

const GeoapifyInput = ({
  value,
  type,
  language,
  limit,
  filterByCountryCode,
  filterByCircle,
  filterByRect,
  filterByPlace,
  biasByCountryCode,
  biasByCircle,
  biasByRect,
  biasByProximity,
  placeSelect,
  suggestionsChange,
}: GeoapifyInputProps) => {
  return (
    <GeoapifyContext apiKey={API_KEY}>
      <GeoapifyGeocoderAutocomplete
        placeholder="Enter address here"
        value={value}
        type={type as LocationType}
        lang={language as SupportedLanguage}
        limit={limit}
        filterByCountryCode={
          filterByCountryCode as unknown as ByCountryCodeOptions
        }
        filterByCircle={filterByCircle as unknown as ByCircleOptions}
        filterByRect={filterByRect as unknown as ByRectOptions}
        filterByPlace={filterByPlace}
        biasByCountryCode={biasByCountryCode as unknown as ByCountryCodeOptions}
        biasByCircle={biasByCircle as unknown as ByCircleOptions}
        biasByRect={biasByRect as unknown as ByRectOptions}
        biasByProximity={biasByProximity as unknown as ByProximityOptions}
        placeSelect={placeSelect}
        suggestionsChange={suggestionsChange}
      />
    </GeoapifyContext>
  );
};

export default GeoapifyInput;
