
import React from "react";
import EntityListing from "./entity-listing";

const Coaches = () => {
  const coaches = [
    {
      id: "1",
      type: "coach" as const,
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      location: "New York, NY",
      rating: 4.9,
      ratingCount: 78,
      isVerified: true,
      tags: ["National Champion", "BWF Certified"]
    },
    {
      id: "2",
      type: "coach" as const,
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      location: "San Francisco, CA",
      rating: 4.7,
      ratingCount: 62,
      isVerified: true,
      tags: ["Junior Development", "15+ Years Exp"]
    },
    {
      id: "3",
      type: "coach" as const,
      name: "Emma Williams",
      image: "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y29hY2h8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
      location: "Chicago, IL",
      rating: 4.5,
      ratingCount: 45,
      isVerified: false,
      tags: ["Doubles Specialist", "Online Training"]
    },
    {
      id: "4",
      type: "coach" as const,
      name: "David Park",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      location: "Los Angeles, CA",
      rating: 4.6,
      ratingCount: 38,
      isVerified: true,
      tags: ["Former Olympic", "All Levels"]
    },
    {
      id: "5",
      type: "coach" as const,
      name: "Lisa Wong",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      location: "Seattle, WA",
      rating: 4.8,
      ratingCount: 55,
      isVerified: true,
      tags: ["Kids Specialist", "Group Lessons"]
    },
  ];

  return <EntityListing entityType="coach" title="Badminton Coaches" entities={coaches} />;
};

export default Coaches;
