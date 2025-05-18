
import React, { useState } from "react";
import { MapPin, Clock, Phone, Globe, Star, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReviewCard from "../shared/review-card";
import UpvoteButton from "../shared/upvote-button";
import VerificationStatus from "../shared/verification-status";
import ClaimOwnershipButton from "../shared/claim-ownership-button";

interface ClubDetailsProps {
  club: {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    website: string;
    images: string[];
    openingHours: { [key: string]: string };
    facilities: string[];
    courts: { type: string; count: number; pricePerHour: number }[];
    isVerified: boolean;
    upvotes: number;
  };
  reviews: Array<{
    id: string;
    authorName: string;
    authorImage?: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
}

const ClubDetails: React.FC<ClubDetailsProps> = ({ club, reviews }) => {
  const [mainImage, setMainImage] = useState(club.images[0]);
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-96">
        <img 
          src={mainImage} 
          alt={club.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-3xl font-bold text-white">{club.name}</h1>
          <div className="flex items-center mt-2">
            <div className="flex items-center text-yellow-400 mr-3">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-1 text-white font-medium">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-white">({reviews.length} reviews)</span>
            <div className="ml-4">
              <VerificationStatus isVerified={club.isVerified} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {club.images.slice(0, 5).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${club.name} ${index + 1}`}
              className={`w-20 h-20 object-cover rounded-md cursor-pointer ${
                mainImage === img ? "ring-2 ring-court-green" : ""
              }`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700">{club.description}</p>
            </div>

            <Tabs defaultValue="facilities" className="mb-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="courts">Courts</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>
              <TabsContent value="facilities" className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {club.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-court-green mr-2" />
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="courts" className="pt-4">
                <div className="space-y-3">
                  {club.courts.map((court, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{court.type}</span> 
                        <span className="text-gray-500 text-sm ml-2">({court.count} available)</span>
                      </div>
                      <div className="text-court-green font-medium">
                        ${court.pricePerHour}/hour
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pricing" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Court Rentals</h3>
                    <ul className="space-y-2">
                      {club.courts.map((court, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{court.type}</span>
                          <span className="font-medium">${court.pricePerHour}/hour</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Membership Options</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Monthly</span>
                        <span className="font-medium">$50/month</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Annual</span>
                        <span className="font-medium">$500/year</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Family</span>
                        <span className="font-medium">$80/month</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                <Button>Write a Review</Button>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    authorName={review.authorName}
                    authorImage={review.authorImage}
                    rating={review.rating}
                    comment={review.comment}
                    date={review.date}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Club Information</h3>
                <UpvoteButton count={club.upvotes} onUpvote={() => {}} />
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                  <span className="text-gray-700">{club.address}</span>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                  <span className="text-gray-700">{club.phone}</span>
                </div>
                <div className="flex items-start">
                  <Globe className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                  <a href={club.website} className="text-blue-600 hover:underline">{club.website}</a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-3">Opening Hours</h3>
              <div className="space-y-2">
                {Object.entries(club.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-700">{day}</span>
                    <span className="text-gray-700">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <ClaimOwnershipButton entityType="club" entityName={club.name} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;
