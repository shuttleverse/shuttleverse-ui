
import React from "react";
import EntityListing from "./entity-listing";

const Stringers = () => {
  const stringers = [
    {
      id: "1",
      type: "stringer" as const,
      name: "Pro String Services",
      image: "https://images.unsplash.com/photo-1593766821287-e31d4a7ee0bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      location: "New York, NY",
      rating: 4.8,
      ratingCount: 65,
      isVerified: true,
      tags: ["Same Day", "Premium Strings"]
    },
    {
      id: "2",
      type: "stringer" as const,
      name: "Fast Restring Co.",
      image: "https://images.unsplash.com/photo-1612185829728-1963759e8430?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Los Angeles, CA",
      rating: 4.2,
      ratingCount: 48,
      isVerified: false,
      tags: ["Budget Friendly", "Repairs"]
    },
    {
      id: "3",
      type: "stringer" as const,
      name: "Master Stringer Dave",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      location: "Chicago, IL",
      rating: 5.0,
      ratingCount: 72,
      isVerified: true,
      tags: ["Pro Quality", "Custom Tension"]
    },
    {
      id: "4",
      type: "stringer" as const,
      name: "Racket Workshop",
      image: "https://images.unsplash.com/photo-1613918431703-aa2b9fee3992?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: "Seattle, WA",
      rating: 4.6,
      ratingCount: 35,
      isVerified: true,
      tags: ["Mobile Service", "Premium Brands"]
    },
  ];

  return <EntityListing entityType="stringer" title="Badminton Stringers" entities={stringers} />;
};

export default Stringers;
