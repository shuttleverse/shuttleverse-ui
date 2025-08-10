export const entityColors = {
  court: {
    solid: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  coach: {
    solid: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  },
  stringer: {
    solid: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  default: {
    solid: "#6b7280",
    gradient: "#6b7280",
  },
} as const;

export const getEntityColor = (
  type: string,
  variant: "solid" | "gradient" = "gradient"
) => {
  return (
    entityColors[type as keyof typeof entityColors]?.[variant] ||
    entityColors.default[variant]
  );
};
