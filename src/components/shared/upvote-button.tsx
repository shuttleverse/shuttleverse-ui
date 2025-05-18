import React, { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UpvoteButtonProps {
  count: number;
  isUpvoted?: boolean;
  onUpvote: () => void;
}

const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  count,
  isUpvoted = false,
  onUpvote,
}) => {
  const [upvoted, setUpvoted] = useState(isUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(count);
  const { toast } = useToast();

  const handleUpvote = () => {
    if (!upvoted) {
      setUpvoted(true);
      setUpvoteCount((prev) => prev + 1);
      toast({
        title: "Information upvoted",
        description: "Thank you for your contribution!",
      });
    } else {
      setUpvoted(false);
      setUpvoteCount((prev) => prev - 1);
    }
    onUpvote();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center space-x-1 hover:bg-gray-100",
        upvoted && "text-primary"
      )}
      onClick={handleUpvote}
    >
      <ArrowUp className={cn("h-4 w-4", upvoted && "fill-current")} />
      <span className="text-sm font-medium">{upvoteCount}</span>
    </Button>
  );
};

export default UpvoteButton;
