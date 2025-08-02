import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/layout";
import EntityCard from "@/components/shared/entity-card";
import FilterSidebar from "@/components/shared/filter-sidebar";
import AuthPrompt from "@/components/shared/auth-prompt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EntityData {
  id: string;
  type: "club" | "court" | "coach" | "stringer";
  name: string;
  description?: string;
  location: string;
  website?: string;
  upvotes: number;
  isVerified: boolean;
  [key: string]: unknown;
}

interface PaginatedResponse {
  data: {
    content: EntityData[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface EntityListingProps {
  entityType: "club" | "court" | "coach" | "stringer";
  title: string;
  useEntityData: () => {
    data: { pages: PaginatedResponse[] } | undefined;
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean | undefined;
    fetchNextPage: () => void;
  };
  onAddEntity?: () => void;
}

const EntityListing: React.FC<EntityListingProps> = ({
  entityType,
  title,
  useEntityData,
  onAddEntity,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEntityData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const entities = useMemo(
    () => data?.pages.flatMap((page) => page.data.content) || [],
    [data]
  );
  const [filteredEntities, setFilteredEntities] = useState(entities);

  useEffect(() => {
    setFilteredEntities(entities);
  }, [entities]);

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

  const handleFilterChange = (filters: unknown) => {
    setFilteredEntities(entities);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAddEntityClick = () => {
    if (!isAuthenticated || !user) {
      setShowAuthPrompt(true);
      return;
    }

    if (onAddEntity) {
      onAddEntity();
    } else {
      navigate(`/${entityType}s/add`);
    }
  };

  const getPluralForm = (type: string) => {
    return type === "coach" ? "coaches" : `${type}s`;
  };

  return (
    <Layout>
      {showAuthPrompt && (
        <AuthPrompt
          title="Sign in to Add"
          description={`You need to be signed in to add a new ${entityType}.`}
          action={`Sign in to add ${entityType}`}
          onClose={() => setShowAuthPrompt(false)}
        />
      )}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-0">
            {title}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button
              className="flex items-center gap-2 px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base w-full sm:w-auto"
              onClick={handleAddEntityClick}
            >
              <Plus className="h-4 w-4" />
              <span>Add {entityType}</span>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={`Search for ${getPluralForm(entityType)}...`}
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              type="submit"
              className="absolute right-0 top-0 bottom-0 rounded-l-none"
            >
              Search
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`md:block ${showFilters ? "block" : "hidden"}`}>
            <FilterSidebar
              onFilterChange={handleFilterChange}
              entityType={entityType}
            />
          </div>

          <div className="md:col-span-3">
            {isLoading && (
              <div className="text-center py-8">
                Loading {getPluralForm(entityType)}...
              </div>
            )}

            {!isLoading && filteredEntities.length === 0 && (
              <div className="bg-white rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">
                  No {getPluralForm(entityType)} found
                </h2>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={handleAddEntityClick} className="mr-2">
                  Add {entityType}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilteredEntities(entities);
                    setSearchTerm("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {filteredEntities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                {filteredEntities.map((entity, index) => (
                  <EntityCard
                    key={entity.id || index}
                    id={entity.id}
                    type={entity.type || entityType}
                    {...entity}
                  />
                ))}
              </div>
            )}

            <div ref={loadMoreRef} className="py-4 text-center">
              {isFetchingNextPage && (
                <p>Loading more {getPluralForm(entityType)}...</p>
              )}
              {!hasNextPage && filteredEntities.length > 0 && (
                <p className="text-sm text-gray-500">
                  No more {getPluralForm(entityType)} to load
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EntityListing;
