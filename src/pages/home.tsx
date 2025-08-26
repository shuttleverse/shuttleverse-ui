import Layout from "@/components/layout/layout";
import { Link } from "react-router-dom";
import { useCourts } from "@/services/courts";
import { useCoaches } from "@/services/coaches";
import { useStringers } from "@/services/stringers";
import { MapPin, Users, Wrench, Plus } from "lucide-react";
import InteractiveMap from "@/components/shared/interactive-map";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocationContext } from "@/hooks/use-location-context";
import { useAuth } from "@/hooks/useAuth";
import LocationPicker from "@/components/shared/location-picker";

const Home = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const {
    locationData: { city, state, isLoading: locationLoading },
  } = useLocationContext();
  const courtsQuery = useCourts();
  const coachesQuery = useCoaches();
  const stringersQuery = useStringers();

  const featuredCourts =
    courtsQuery.data?.pages?.[0]?.data?.content?.slice(0, 3) || [];
  const topCoaches =
    coachesQuery.data?.pages?.[0]?.data?.content?.slice(0, 3) || [];
  const recommendedStringers =
    stringersQuery.data?.pages?.[0]?.data?.content?.slice(0, 3) || [];

  const recentAdditions = [
    ...featuredCourts.slice(0, 2).map((court) => ({
      id: court.id,
      type: "court" as const,
      name: court.name,
      location: court.location,
      time: "Recently added",
    })),
    ...topCoaches.slice(0, 1).map((coach) => ({
      id: coach.id,
      type: "coach" as const,
      name: coach.name,
      specialization: coach.experienceYears
        ? `${coach.experienceYears} Years of Experience`
        : "Professional coach",
      time: "Recently added",
    })),
    ...recommendedStringers.slice(0, 1).map((stringer) => ({
      id: stringer.id,
      type: "stringer" as const,
      name: stringer.name,
      experience: "Professional stringer",
      time: "Recently added",
    })),
  ];

  return (
    <Layout>
      <div className="container mx-auto p-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
              Welcome
              {user?.username
                ? `, ${user.username}`
                : locationLoading
                ? ""
                : city && state
                ? `, ${city}, ${state}`
                : ""}
            </h1>
          </div>
          {!isMobile && (
            <LocationPicker
              trigger={
                <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm shadow-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {locationLoading
                    ? "Getting location..."
                    : city && state
                    ? `${city}, ${state}`
                    : "Set location"}
                </button>
              }
            />
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mt-4 mb-6">
          <p className="text-gray-600 mb-4">
            Your comprehensive badminton resource hub
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courts"
              className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center"
            >
              <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="font-medium text-gray-800">Find Courts</span>
                <p className="text-sm text-gray-600">
                  Locate badminton courts near you
                </p>
              </div>
            </Link>

            <Link
              to="/coaches"
              className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center"
            >
              <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="font-medium text-gray-800">Find Coaches</span>
                <p className="text-sm text-gray-600">
                  Connect with professional instructors
                </p>
              </div>
            </Link>

            <Link
              to="/stringers"
              className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center"
            >
              <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <Wrench className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="font-medium text-gray-800">
                  Find Stringers
                </span>
                <p className="text-sm text-gray-600">
                  Get your racket professionally strung
                </p>
              </div>
            </Link>
          </div>
        </div>

        {!isMobile && (
          <div className="mb-12">
            <div
              className="responsive-map-container"
              style={{ width: "100%", height: "60vh", position: "relative" }}
            >
              <InteractiveMap />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Featured Courts</h2>
                <Link
                  to="/courts"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {courtsQuery.isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading courts...</p>
                  </div>
                ) : featuredCourts.length > 0 ? (
                  featuredCourts.map((court) => (
                    <Link
                      key={court.id}
                      to={`/courts/${court.id}`}
                      className="block border border-gray-100 rounded-lg p-3 hover:border-emerald-200 transition-colors"
                    >
                      <h3 className="font-medium">{court.name}</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{court.location}</span>
                      </div>
                      {court.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {court.description}
                        </p>
                      )}
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No courts available
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Top Coaches</h2>
                <Link
                  to="/coaches"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {coachesQuery.isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading coaches...</p>
                  </div>
                ) : topCoaches.length > 0 ? (
                  topCoaches.map((coach) => (
                    <Link
                      key={coach.id}
                      to={`/coaches/${coach.id}`}
                      className="flex items-center border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        <span className="text-gray-700 font-medium">
                          {coach.name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{coach.name}</h3>
                        <div className="flex text-xs space-x-2">
                          <span className="text-gray-600">
                            {coach.experienceYears
                              ? `${coach.experienceYears} years`
                              : "Professional"}
                          </span>
                          {coach.location && (
                            <>
                              <span>•</span>
                              <span className="text-gray-600">
                                {coach.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No coaches available
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recommended Stringers</h2>
                <Link
                  to="/stringers"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {stringersQuery.isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading stringers...</p>
                  </div>
                ) : recommendedStringers.length > 0 ? (
                  recommendedStringers.map((stringer) => (
                    <Link
                      key={stringer.id}
                      to={`/stringers/${stringer.id}`}
                      className="flex items-center border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        <span className="text-gray-700 font-medium">
                          {stringer.name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{stringer.name}</h3>
                        <div className="flex text-xs space-x-2">
                          <span className="text-gray-600">
                            Professional stringer
                          </span>
                          {stringer.location && (
                            <>
                              <span>•</span>
                              <span className="text-gray-600">
                                {stringer.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No stringers available
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Additions</h2>
              </div>
              <div className="space-y-4">
                {recentAdditions.length > 0 ? (
                  recentAdditions.map((item) => (
                    <Link
                      key={item.id}
                      to={`/${item.type}s/${item.id}`}
                      className="flex items-start border-b border-gray-100 pb-3 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div className="bg-emerald-100 p-2 rounded-full mr-3">
                        <Plus className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.type === "court" && item.location}
                          {item.type === "coach" && item.specialization}
                          {item.type === "stringer" && item.experience}
                        </p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent additions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
