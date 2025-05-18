import React from "react";
import { Star, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  authorName: string;
  authorImage?: string;
  rating: number;
  comment: string;
  date: Date;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  authorName,
  authorImage,
  rating,
  comment,
  date,
}) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-start">
        <Avatar className="h-10 w-10">
          {authorImage ? <AvatarImage src={authorImage} /> : null}
          <AvatarFallback className="bg-gray-200 text-gray-600">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">{authorName}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center mt-1">
            {stars.map((filled, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  filled ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-700">{comment}</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
