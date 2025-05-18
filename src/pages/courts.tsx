import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
import { useCourts } from "@/services/courts";

const Courts = () => {
  const navigate = useNavigate();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCourts();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const courts = data?.pages.flatMap((page) => page.data.content) || [];

  const handleAddCourt = () => {
    navigate("/courts/add");
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-800">Courts</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
              Filter
            </button>
            <button
              onClick={handleAddCourt}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Court
            </button>
          </div>
        </div>

        {isLoading && <div className="text-center py-8">Loading courts...</div>}

        {!isLoading && courts.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No courts found</p>
            <button
              onClick={handleAddCourt}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add The First Court!
            </button>
          </div>
        )}

        {courts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courts.map((court, index) => (
              <div
                key={court.id || index}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg">
                  {court.name || "Unnamed Court"}
                </h3>
                {court.location && (
                  <p className="text-gray-600">{court.location}</p>
                )}
                {court.description && (
                  <p className="mt-2 text-sm">{court.description}</p>
                )}
                {court.website && (
                  <p className="mt-2 text-sm text-emerald-600">
                    <a
                      href={court.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {court.website}
                    </a>
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => navigate(`/courts/${court.id}`)}
                    className="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="py-4 text-center">
          {isFetchingNextPage && <p>Loading more courts...</p>}
          {!hasNextPage && courts.length > 0 && (
            <p className="text-sm text-gray-500">No more courts to load</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Courts;
