import React from "react";
import { Link } from "react-router-dom";
import {
  Check,
  MapPin,
  ThumbsUp,
  Building,
  MapPinned,
  User,
  Scissors,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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

  const getEntityIcon = () => {
    switch (type) {
      case "club":
        return <Building className="w-12 h-12 text-gray-400" />;
      case "court":
        return <MapPinned className="w-12 h-12 text-gray-400" />;
      case "coach":
        return <User className="w-12 h-12 text-gray-400" />;
      case "stringer":
        return <Scissors className="w-12 h-12 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <Link to={`/${type}s/${id}`} className="block">
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center">
            {getEntityIcon()}
            <div className="text-gray-400 text-5xl font-light uppercase mt-2">
              {displayName.charAt(0)}
            </div>
          </div>
          {isVerified && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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

            <div className="flex items-center text-sm text-gray-500">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{upvotes}</span>
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
