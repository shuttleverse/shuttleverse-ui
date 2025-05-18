import Navbar from "@/components/layout/navbar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const recentAdditions = [
    {
      id: 1,
      type: "court",
      name: "Eagle Center Courts",
      location: "123 Main St, Springfield",
      time: "2 days ago",
    },
    {
      id: 2,
      type: "coach",
      name: "Maria Wong",
      specialization: "Singles Technique",
      time: "3 days ago",
    },
    {
      id: 3,
      type: "stringer",
      name: "Alex Chen",
      experience: "10+ years",
      time: "1 week ago",
    },
  ];

  const featuredCourts = [
    {
      id: 1,
      name: "Eagle Center Courts",
      location: "Springfield",
      facilities: "6 indoor courts, pro shop",
    },
    {
      id: 2,
      name: "Premier Badminton Club",
      location: "Westview",
      facilities: "10 courts, cafeteria",
    },
  ];

  const topCoaches = [
    {
      id: 1,
      name: "David Lee",
      specialization: "Doubles Strategy",
      experience: "15 years",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      specialization: "Youth Training",
      experience: "8 years",
    },
  ];

  const recommendedStringers = [
    {
      id: 1,
      name: "Mike Harrison",
      specialization: "Tournament Stringing",
      location: "Downtown",
    },
    {
      id: 2,
      name: "Jennifer Wu",
      specialization: "Custom Racket Setup",
      location: "Eastside",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Shuttleverse
          </h1>
          <p className="text-gray-600 mb-4">
            Your comprehensive badminton resource hub
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courts"
              className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center"
            >
              <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
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

        {!isAuthenticated && (
          <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Contribute to the Community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/courts/add"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors text-center"
              >
                <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Add a Court</span>
              </Link>

              <Link
                to="/coaches/add"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors text-center"
              >
                <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">
                  Register as Coach
                </span>
              </Link>

              <Link
                to="/stringers/add"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors text-center"
              >
                <div className="bg-emerald-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">
                  Register as Stringer
                </span>
              </Link>
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
                {featuredCourts.map((court) => (
                  <div
                    key={court.id}
                    className="border border-gray-100 rounded-lg p-3 hover:border-emerald-200 transition-colors"
                  >
                    <h3 className="font-medium">{court.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{court.location}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {court.facilities}
                    </p>
                  </div>
                ))}
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
                {topCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center border-b border-gray-100 pb-3 last:border-0"
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
                          {coach.specialization}
                        </span>
                        <span>•</span>
                        <span className="text-gray-600">
                          {coach.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
                {recommendedStringers.map((stringer) => (
                  <div
                    key={stringer.id}
                    className="flex items-center border-b border-gray-100 pb-3 last:border-0"
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
                          {stringer.specialization}
                        </span>
                        <span>•</span>
                        <span className="text-gray-600">
                          {stringer.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Additions</h2>
              </div>
              <div className="space-y-4">
                {recentAdditions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start border-b border-gray-100 pb-3"
                  >
                    <div className="bg-emerald-100 p-2 rounded-full mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
