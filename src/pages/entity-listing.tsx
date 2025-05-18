import React, { useState } from "react";
import Layout from "../components/layout/layout";
import EntityCard from "../components/shared/entity-card";
import FilterSidebar from "../components/shared/filter-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Plus } from "lucide-react";

interface EntityListingProps {
  entityType: "club" | "court" | "coach" | "stringer";
  title: string;
  entities: Array<{
    id: string;
    type: "club" | "court" | "coach" | "stringer";
    name: string;
    image: string;
    location: string;
    rating: number;
    ratingCount: number;
    isVerified: boolean;
    tags?: string[];
  }>;
}

const EntityListing: React.FC<EntityListingProps> = ({ entityType, title, entities }) => {
  const [filteredEntities, setFilteredEntities] = useState(entities);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (filters: unknown) => {
    console.log("Filters applied:", filters);
    setFilteredEntities(entities);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder={`Search for ${entityType}s...`}
                className="pl-10 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" className="absolute right-0 top-0 bottom-0 rounded-l-none">
                Search
              </Button>
            </form>
            <Button 
              variant="outline" 
              className="md:w-auto w-full flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <Button className="md:w-auto w-full flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add {entityType}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`md:block ${showFilters ? 'block' : 'hidden'}`}>
              <FilterSidebar onFilterChange={handleFilterChange} entityType={entityType} />
            </div>
            
            <div className="md:col-span-3">
              {filteredEntities.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <h2 className="text-xl font-semibold mb-2">No {entityType}s found</h2>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  <Button 
                    onClick={() => {
                      setFilteredEntities(entities);
                      setSearchTerm("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntities.map((entity) => (
                    <EntityCard key={entity.id} {...entity} />
                  ))}
                </div>
              )}

              {filteredEntities.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" className="bg-court-green text-white">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <span className="mx-2">...</span>
                    <Button variant="outline" size="sm">10</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EntityListing;
