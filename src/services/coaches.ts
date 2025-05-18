import { useInfiniteQuery } from "@tanstack/react-query";

const mockCoaches = Array(20)
  .fill(null)
  .map((_, i) => ({
    id: `coach-${i + 1}`,
    type: "coach" as const,
    name: `Coach ${i + 1}`,
    location: `${
      ["New York", "Boston", "Chicago", "Seattle", "San Francisco"][i % 5]
    }, US`,
    description: `Experienced badminton coach with ${
      5 + (i % 10)
    } years of professional coaching experience, specializing in ${
      [
        "singles",
        "doubles",
        "mixed doubles",
        "youth training",
        "advanced techniques",
      ][i % 5]
    }.`,
    website: i % 3 === 0 ? `https://coach${i + 1}.example.com` : undefined,
    upvotes: Math.floor(Math.random() * 100),
    isVerified: i % 4 === 0,
  }));

const getMockCoaches = (page = 0, size = 6) => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = mockCoaches.slice(startIndex, endIndex);

  return {
    data: {
      content,
      number: page,
      size,
      totalElements: mockCoaches.length,
      totalPages: Math.ceil(mockCoaches.length / size),
      last: endIndex >= mockCoaches.length,
    },
  };
};

export function useCoaches(filters = {}) {
  return useInfiniteQuery({
    queryKey: ["coaches", filters],
    queryFn: async ({ pageParam = 0 }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return getMockCoaches(pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.last) return undefined;
      return lastPage.data.number + 1;
    },
    initialPageParam: 0,
  });
}
