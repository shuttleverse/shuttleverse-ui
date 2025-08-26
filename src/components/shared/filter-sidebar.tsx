import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  onFilterChange: (filters: {
    daysOfWeek?: string[];
    isVerified?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
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

  const [verified, setVerified] = useState<boolean | null>(null);
  const [availability, setAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, getMaxRange(entityType)]);

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
      isVerified: verified,
      daysOfWeek: availability,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const handleResetFilters = () => {
    setVerified(null);
    setAvailability([]);
    setPriceRange([0, getMaxRange(entityType)]);
    onFilterChange({
      isVerified: null,
      daysOfWeek: [],
      minPrice: 0,
      maxPrice: getMaxRange(entityType),
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-medium text-lg mb-4">Filters</h3>
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={verified}
            onCheckedChange={(checked: boolean) =>
              setVerified(checked == true ? true : null)
            }
          />
          <label
            htmlFor="verified"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Verified Only
          </label>
        </div>
      </div>

      {entityType !== "stringer" && (
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-2">Availability</h4>
          <div className="grid grid-cols-2 gap-2">
            {days.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={availability.includes(day)}
                  onCheckedChange={() => handleAvailabilityChange(day)}
                />
                <label
                  htmlFor={`day-${day}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {day.slice(0, 3)}
                </label>
              </div>
            ))}
          </div>
          {availability.length > 0 && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Selected days:</p>
              <div className="flex flex-wrap gap-1">
                {availability.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {day.slice(0, 3)}
                    <button
                      type="button"
                      onClick={() => handleAvailabilityChange(day)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-medium text-sm mb-2">Price Range</h4>
        <div className="px-2">
          <Slider
            step={5}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
            max={getMaxRange(entityType)}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Min:</span>
            <span className="text-sm font-medium">${priceRange[0]}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Max:</span>
            <span className="text-sm font-medium">${priceRange[1]}</span>
          </div>
        </div>
        {priceRange[0] === priceRange[1] && priceRange[0] > 0 && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            Exact price: ${priceRange[0]}
          </p>
        )}
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
