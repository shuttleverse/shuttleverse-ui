
import { useParams } from "react-router-dom";
import Layout from "../components/layout/layout";
import ClubDetails from "../components/entities/club-details";

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const club = {
    id: id || "1",
    name: "Eagle Badminton Club",
    description: "Eagle Badminton Club is a premier badminton facility offering 12 professional-grade courts, expert coaching, and a vibrant community of players. Our club is equipped with state-of-the-art lighting, pro shop, and comfortable viewing areas. We host regular tournaments, social events, and training sessions for all skill levels.",
    address: "123 Main Street, New York, NY 10001",
    phone: "(212) 555-1234",
    website: "https://eaglebadmintonclub.com",
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YmFkbWludG9ufGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1613918431703-aa2b9fee3992?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1583824349157-5a99322e2a0a?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1521080755838-d2311117f767?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      "https://images.unsplash.com/photo-1599154960523-ded28220db0e?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjJ8fGJhZG1pbnRvbnxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    openingHours: {
      Monday: "6:00 AM - 10:00 PM",
      Tuesday: "6:00 AM - 10:00 PM",
      Wednesday: "6:00 AM - 10:00 PM",
      Thursday: "6:00 AM - 10:00 PM",
      Friday: "6:00 AM - 11:00 PM",
      Saturday: "7:00 AM - 11:00 PM",
      Sunday: "7:00 AM - 9:00 PM",
    },
    facilities: [
      "12 Professional Courts",
      "Pro Shop",
      "Showers & Locker Rooms",
      "Parking",
      "Cafe",
      "Coaching Services",
      "Stringing Services",
      "Spectator Seating",
      "Air Conditioning",
      "WiFi"
    ],
    courts: [
      { type: "Premium Court", count: 6, pricePerHour: 25 },
      { type: "Standard Court", count: 4, pricePerHour: 20 },
      { type: "Training Court", count: 2, pricePerHour: 15 },
    ],
    isVerified: true,
    upvotes: 87,
  };

  const reviews = [
    {
      id: "1",
      authorName: "John Smith",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      rating: 5,
      comment: "Excellent facilities and friendly staff. The courts are well-maintained and the lighting is perfect. I particularly enjoy their weekend social events where players of all levels can join in for friendly matches.",
      date: new Date("2023-05-15"),
    },
    {
      id: "2",
      authorName: "Emily Johnson",
      rating: 4,
      comment: "Great club overall. Clean facilities and good equipment rental options. The only downside is that it gets very crowded during peak hours, making it hard to book a court sometimes.",
      date: new Date("2023-04-22"),
    },
    {
      id: "3",
      authorName: "Michael Chen",
      authorImage: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
      rating: 5,
      comment: "The premium courts are absolutely worth the price. I've been a member for over a year and the coaching staff here is top-notch. They offer great programs for players looking to improve their game.",
      date: new Date("2023-06-03"),
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ClubDetails club={club} reviews={reviews} />
      </div>
    </Layout>
  );
};

export default ClubDetail;
