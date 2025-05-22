import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  onFilterChange: (filters: unknown) => void;
  entityType: "club" | "court" | "coach" | "stringer";
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFilterChange,
  entityType,
}) => {
  const getMaxRange = (entityType: "club" | "court" | "coach" | "stringer") => {
    switch (entityType) {
      case "club":
        return 200;
      case "court":
        return 150;
      case "coach":
        return 200;
      case "stringer":
        return 50;
      default:
        throw new Error("Invalid entity type: " + entityType);
    }
  };

  const [rating, setRating] = useState([0]);
  const [verified, setVerified] = useState(false);
  const [availability, setAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, getMaxRange(entityType)]);
  const [facilities, setFacilities] = useState<string[]>([]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAvailabilityChange = (day: string) => {
    setAvailability((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleApplyFilters = () => {
    onFilterChange({
      rating: rating[0],
      verified,
      availability,
      priceRange,
      facilities,
    });
  };

  const handleResetFilters = () => {
    setRating([0]);
    setVerified(false);
    setAvailability([]);
    setPriceRange([0, getMaxRange(entityType)]);
    setFacilities([]);
    onFilterChange({});
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-medium text-lg mb-4">Filters</h3>
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={verified}
            onCheckedChange={(checked: boolean) => setVerified(checked)}
          />
          <label
            htmlFor="verified"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Verified Only
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-sm mb-2">Availability</h4>
        <div className="space-y-2">
          {days.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day}`}
                checked={availability.includes(day)}
                onCheckedChange={() => handleAvailabilityChange(day)}
              />
              <label
                htmlFor={`day-${day}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {day}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-sm mb-2">
          {entityType === "club" && "Facilities"}
          {entityType === "court" && "Court Types"}
          {entityType === "coach" && "Specialities"}
          {entityType === "stringer" && "Services"}
        </h4>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-sm mb-2">Price Range</h4>
        <Slider
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-2"
          max={getMaxRange(entityType)}
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={handleResetFilters}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
