import React from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useAuth } from "@/hooks/useAuth";

interface EntityCardProps {
  id: string;
  type: "club" | "court" | "coach" | "stringer";
  name: string;
  location: string;
  website?: string;
  upvotes: number;
  owner?: { id: string };
  [key: string]: unknown;
}

const EntityCard: React.FC<EntityCardProps> = ({
  id,
  type,
  name,
  location,
  owner,
}) => {
  const { user } = useAuth();
  const isOwner = user && owner && user.id === owner.id;
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
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {owner && (
              <Badge
                variant="secondary"
                className="bg-green-600 text-white hover:bg-green-700 border border-green-600 shadow-sm"
              >
                <Shield className="w-3 h-3 mr-1" /> Verified
              </Badge>
            )}
            {isOwner && (
              <Badge
                variant="secondary"
                className="bg-amber-500 text-white hover:bg-amber-600 border border-amber-600 shadow-sm"
              >
                <Crown className="w-3 h-3 mr-1" /> Owner
              </Badge>
            )}
          </div>
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
        </CardContent>
      </Card>
    </Link>
  );
};

export default EntityCard;
