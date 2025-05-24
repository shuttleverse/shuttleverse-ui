import React from "react";
import { Link } from "react-router-dom";
import { Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { EntityAvatar } from "@/components/shared/entity-avatar";

interface EntityCardProps {
  id: string;
  type: "club" | "court" | "coach" | "stringer";
  name: string;
  location: string;
  description?: string;
  website?: string;
  upvotes: number;
  isVerified: boolean;
  [key: string]: unknown;
}

const EntityCard: React.FC<EntityCardProps> = ({
  id,
  type,
  name,
  location,
  description,
  website,
  upvotes,
  isVerified,
  ...rest
}) => {
  const displayName = name || `Unnamed ${type}`;

  const getPluralType = (type: EntityCardProps["type"]) => {
    switch (type) {
      case "coach":
        return "coaches";
      case "stringer":
        return "stringers";
      default:
        return `${type}s`;
    }
  };

  return (
    <Link to={`/${getPluralType(type)}/${id}`} className="block">
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative h-48 w-full">
          <EntityAvatar
            id={id}
            name={displayName}
            type={type}
            size="lg"
            shape="rectangle"
            className="w-full h-full object-cover"
          />
          {isVerified && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="bg-sky-500/20 text-sky-600 hover:bg-sky-500/30 border border-sky-500/30"
              >
                <Check className="w-3 h-3 mr-1" /> Verified
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
            {displayName}
          </CardTitle>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4 mr-1" /> {location}
            </div>
          </div>

          {description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description}
            </p>
          )}

          {website && (
            <a
              href={website}
              className="text-sm text-primary hover:underline mt-2 block"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {website}
            </a>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default EntityCard;
