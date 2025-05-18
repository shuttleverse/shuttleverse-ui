import { useInfiniteQuery } from "@tanstack/react-query";

// Mock data for clubs
const mockClubs = Array(20)
  .fill(null)
  .map((_, i) => ({
    id: `club-${i + 1}`,
    type: "club" as const,
    name: `${
      ["Elite", "Champion", "Victory", "Premier", "Alliance"][i % 5]
    } Badminton Club ${i + 1}`,
    location: `${
      ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][i % 5]
    }, US`,
    description: `A ${
      [
        "competitive",
        "friendly",
        "professional",
        "family-oriented",
        "international",
      ][i % 5]
    } badminton club with ${3 + (i % 10)} courts and active membership.`,
    website: i % 3 === 0 ? `https://club${i + 1}.example.com` : undefined,
    upvotes: Math.floor(Math.random() * 150),
    isVerified: i % 3 === 0,
  }));

// Simulates paginated API response
const getMockClubs = (page = 0, size = 6) => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = mockClubs.slice(startIndex, endIndex);

  return {
    data: {
      content,
      number: page,
      size,
      totalElements: mockClubs.length,
      totalPages: Math.ceil(mockClubs.length / size),
      last: endIndex >= mockClubs.length,
    },
  };
};

export function useClubs(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["clubs", filters],
    queryFn: async ({ pageParam = 0 }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockClubs(pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.last) return undefined;
      return lastPage.data.number + 1;
    },
    initialPageParam: 0,
  });
}
