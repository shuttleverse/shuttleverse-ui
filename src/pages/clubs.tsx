import EntityListing from "./entity-listing";

const Clubs = () => {
  const clubs = [
    {
      id: "1",
      type: "club" as const,
      name: "Eagle Badminton Club",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YmFkbWludG9ufGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "New York, NY",
      rating: 4.8,
      ratingCount: 124,
      isVerified: true,
      tags: ["Premium", "24/7"]
    },
    {
      id: "2",
      type: "club" as const,
      name: "Shuttlers Paradise",
      image: "https://images.unsplash.com/photo-1613918431703-aa2b9fee3992?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Los Angeles, CA",
      rating: 4.5,
      ratingCount: 89,
      isVerified: true,
      tags: ["Indoor Courts", "Pro Shop"]
    },
    {
      id: "3",
      type: "club" as const,
      name: "Ace Badminton Center",
      image: "https://images.unsplash.com/photo-1583824349157-5a99322e2a0a?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Chicago, IL",
      rating: 4.2,
      ratingCount: 56,
      isVerified: false,
      tags: ["Coaching", "Tournaments"]
    },
    {
      id: "4",
      type: "club" as const,
      name: "Smash Badminton Hub",
      image: "https://images.unsplash.com/photo-1521080755838-d2311117f767?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Seattle, WA",
      rating: 4.0,
      ratingCount: 42,
      isVerified: true,
      tags: ["Beginner Friendly", "Equipment Rental"]
    },
    {
      id: "5",
      type: "club" as const,
      name: "Clear Shot Badminton",
      image: "https://images.unsplash.com/photo-1612185829728-1963759e8430?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Boston, MA",
      rating: 4.6,
      ratingCount: 67,
      isVerified: false,
      tags: ["Competition", "Pro Training"]
    },
    {
      id: "6",
      type: "club" as const,
      name: "Rally Point Club",
      image: "https://images.unsplash.com/photo-1599154960523-ded28220db0e?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjJ8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Austin, TX",
      rating: 3.9,
      ratingCount: 31,
      isVerified: true,
      tags: ["Family Friendly", "Cafe"]
    },
  ];

  return <EntityListing entityType="club" title="Badminton Clubs" entities={clubs} />;
};

export default Clubs;
