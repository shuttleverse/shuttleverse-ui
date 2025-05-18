
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  entityType: "club" | "court" | "coach" | "stringer";
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFilterChange,
  entityType,
}) => {
  const [rating, setRating] = useState([0]);
  const [verified, setVerified] = useState(false);
  const [availability, setAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [facilities, setFacilities] = useState<string[]>([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const clubFacilities = ["Parking", "Showers", "Pro Shop", "Cafe", "Accessibility"];
  const courtTypes = ["Indoor", "Outdoor", "Wood", "Synthetic", "Tournament Standard"];
  const coachSpecialities = ["Beginner", "Intermediate", "Advanced", "Kids", "Adults", "Singles", "Doubles"];
  const stringerServices = ["Restring", "Repair", "Custom", "Same Day", "Premium Strings"];

  const getFacilitiesByType = () => {
    switch (entityType) {
      case "club":
        return clubFacilities;
      case "court":
        return courtTypes;
      case "coach":
        return coachSpecialities;
      case "stringer":
        return stringerServices;
      default:
        return [];
    }
  };

  const handleAvailabilityChange = (day: string) => {
    setAvailability((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleFacilityChange = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
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
    setPriceRange([0, 100]);
    setFacilities([]);
    onFilterChange({});
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-medium text-lg mb-4">Filters</h3>
      
      <div className="mb-6">
        <h4 className="font-medium text-sm mb-2">Rating</h4>
        <Slider
          defaultValue={[0]}
          max={5}
          step={1}
          value={rating}
          onValueChange={setRating}
          className="mb-2"
        />
        <div className="text-sm text-gray-600">
          {rating[0]} star{rating[0] !== 1 && 's'} & above
        </div>
      </div>

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
        <div className="space-y-2">
          {getFacilitiesByType().map((facility) => (
            <div key={facility} className="flex items-center space-x-2">
              <Checkbox
                id={`facility-${facility}`}
                checked={facilities.includes(facility)}
                onCheckedChange={() => handleFacilityChange(facility)}
              />
              <label
                htmlFor={`facility-${facility}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {facility}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-sm mb-2">Price Range</h4>
        <Slider
          defaultValue={[0, 100]}
          min={0}
          max={200}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-2"
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
