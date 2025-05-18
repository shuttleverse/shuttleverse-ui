import { useInfiniteQuery } from "@tanstack/react-query";

// Mock data for stringers
const mockStringers = Array(20)
  .fill(null)
  .map((_, i) => ({
    id: `stringer-${i + 1}`,
    type: "stringer" as const,
    name: `${
      [
        "Pro String",
        "Fast Restring",
        "Master Stringer",
        "Racket Workshop",
        "String Master",
      ][i % 5]
    } ${i + 1}`,
    location: `${
      ["New York", "Los Angeles", "Chicago", "Seattle", "Boston"][i % 5]
    }, US`,
    description: `Professional stringer with expertise in ${
      [
        "high tension stringing",
        "string customization",
        "racket repairs",
        "premium strings",
        "bespoke service",
      ][i % 5]
    }.`,
    website: i % 3 === 0 ? `https://stringer${i + 1}.example.com` : undefined,
    upvotes: Math.floor(Math.random() * 120),
    isVerified: i % 3 === 0,
  }));

// Simulates paginated API response
const getMockStringers = (page = 0, size = 6) => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = mockStringers.slice(startIndex, endIndex);

  return {
    data: {
      content,
      number: page,
      size,
      totalElements: mockStringers.length,
      totalPages: Math.ceil(mockStringers.length / size),
      last: endIndex >= mockStringers.length,
    },
  };
};

export function useStringers(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["stringers", filters],
    queryFn: async ({ pageParam = 0 }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockStringers(pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.last) return undefined;
      return lastPage.data.number + 1;
    },
    initialPageParam: 0,
  });
}
