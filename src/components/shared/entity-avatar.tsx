import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createAvatar } from "@dicebear/core";
import { rings, thumbs } from "@dicebear/collection";

interface EntityAvatarProps {
  id: string;
  name: string;
  type: "club" | "court" | "coach" | "stringer";
  size?: "sm" | "md" | "lg";
  className?: string;
  shape?: "circle" | "rectangle";
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const getTypeStyle = (type: EntityAvatarProps["type"]) => {
  switch (type) {
    case "court":
      return "rings";
    case "coach":
      return "thumbs";
    case "stringer":
      return "thumbs";
    case "club":
      return "rings";
    default:
      return "thumbs";
  }
};

const getTypeColor = (type: EntityAvatarProps["type"]) => {
  switch (type) {
    case "court":
      return "10B981";
    case "coach":
      return "3B82F6";
    case "stringer":
      return "F59E0B";
    case "club":
      return "8B5CF6";
    default:
      return "10B981";
  }
};

export function EntityAvatar({
  id,
  name,
  type,
  size = "md",
  className,
  shape = "circle",
}: EntityAvatarProps) {
  const sizeClass = sizeMap[size];
  const style = getTypeStyle(type);
  const color = getTypeColor(type);
  const seed = hashString(id);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const generateAvatar = async () => {
      if (style === "rings") {
        const avatar = await createAvatar(rings, {
          seed,
          backgroundColor: ["transparent"],
          ringColor: [color],
          scale: 90,
          radius: shape === "circle" ? 50 : 0,
          size: 5,
          ringRotation: [0, 360],
          backgroundType: ["solid"],
          translateX: 0,
          translateY: 0,
          clip: true,
          randomizeIds: true,
        });
        setAvatarUrl(await avatar.toDataUri());
      } else {
        const avatar = await createAvatar(thumbs, {
          seed,
          backgroundColor: [color],
          scale: 90,
          radius: shape === "circle" ? 50 : 0,
          eyes: [
            "variant1W10",
            "variant2W10",
            "variant3W10",
            "variant4W10",
            "variant5W10",
          ],
          eyesColor: ["000000"],
          shapeRotation: [0, 360],
          faceOffsetX: [-10, 10],
          faceOffsetY: [-10, 10],
          faceRotation: [-10, 10],
        });
        setAvatarUrl(await avatar.toDataUri());
      }
    };

    generateAvatar();
  }, [style, seed, color, shape]);

  return (
    <img
      src={avatarUrl}
      alt={`${name}'s avatar`}
      className={cn(
        shape === "circle" ? "rounded-full" : "rounded-none",
        "object-cover border-2 border-primary/20",
        sizeClass,
        className
      )}
    />
  );
}
