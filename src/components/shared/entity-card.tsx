
import React from "react";
import { Link } from "react-router-dom";
import { Star, Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EntityCardProps {
  id: string;
  type: "club" | "court" | "coach" | "stringer";
  name: string;
  image: string;
  location: string;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  tags?: string[];
}

const EntityCard: React.FC<EntityCardProps> = ({
  id,
  type,
  name,
  image,
  location,
  rating,
  ratingCount,
  isVerified,
  tags,
}) => {
  return (
    <Link 
      to={`/${type}s/${id}`} 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        {isVerified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-court-green hover:bg-court-green">
              <Check className="w-3 h-3 mr-1" /> Verified
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" /> {location}
        </div>
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400 mr-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-gray-700">{rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({ratingCount})</span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default EntityCard;
