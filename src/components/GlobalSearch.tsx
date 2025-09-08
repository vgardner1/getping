import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronDown, 
  MapPin, 
  Briefcase, 
  Globe, 
  X, 
  Filter,
  SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  role: string;
  city: string;
  country: string;
  industry: string;
  lat: number;
  lng: number;
  avatar: string;
  bio: string;
}

interface GlobalSearchProps {
  onPersonSelect?: (person: SearchResult) => void;
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onPersonSelect, className }) => {
  const [query, setQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Sample data with more comprehensive profiles
  const allPeople: SearchResult[] = [
    { id: "1", name: "Alex Chen", role: "Product Designer", city: "San Francisco", country: "USA", industry: "Technology", lat: 37.7749, lng: -122.4194, avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png", bio: "Designing delightful human-centered products." },
    { id: "2", name: "Maya Patel", role: "Data Scientist", city: "Boston", country: "USA", industry: "Technology", lat: 42.3601, lng: -71.0589, avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png", bio: "Turning data into decisions with empathy." },
    { id: "3", name: "Sam Rivera", role: "Founder", city: "New York", country: "USA", industry: "Startup", lat: 40.7128, lng: -74.006, avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png", bio: "Building communities around impactful tech." },
    { id: "4", name: "Jordan Kim", role: "Software Engineer", city: "Los Angeles", country: "USA", industry: "Technology", lat: 34.0522, lng: -118.2437, avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png", bio: "Scalable systems and accessible UX." },
    { id: "5", name: "Taylor Swift", role: "Creative Director", city: "London", country: "UK", industry: "Media", lat: 51.5074, lng: -0.1278, avatar: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png", bio: "Storytelling through sound and visuals." },
    { id: "6", name: "Sarah Johnson", role: "Researcher", city: "Tokyo", country: "Japan", industry: "Technology", lat: 35.6762, lng: 139.6503, avatar: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png", bio: "Human-computer interaction and future of work." },
    { id: "7", name: "Emily Davis", role: "Product Manager", city: "Paris", country: "France", industry: "Technology", lat: 48.8566, lng: 2.3522, avatar: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png", bio: "Aligning teams to ship with purpose." },
    { id: "8", name: "David Park", role: "Community Lead", city: "Berlin", country: "Germany", industry: "Technology", lat: 52.52, lng: 13.405, avatar: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png", bio: "Creating spaces where builders thrive." },
    { id: "9", name: "Lisa Wang", role: "Marketing Director", city: "Beijing", country: "China", industry: "Marketing", lat: 39.9042, lng: 116.4074, avatar: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png", bio: "Bridging brands and communities." },
    { id: "10", name: "Tom Wilson", role: "Sustainability Designer", city: "Sydney", country: "Australia", industry: "Design", lat: -33.8688, lng: 151.2093, avatar: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png", bio: "Sustainable design for everyday life." },
    { id: "11", name: "Maria Garcia", role: "AI Researcher", city: "Barcelona", country: "Spain", industry: "Technology", lat: 41.3851, lng: 2.1734, avatar: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png", bio: "Pushing the boundaries of machine learning." },
    { id: "12", name: "Ahmed Hassan", role: "Fintech Founder", city: "Dubai", country: "UAE", industry: "Finance", lat: 25.2048, lng: 55.2708, avatar: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png", bio: "Democratizing financial services in MENA." },
  ];

  const industries = ["Technology", "Design", "Marketing", "Finance", "Media", "Startup", "Healthcare", "Education"];
  const regions = ["North America", "Europe", "Asia", "Middle East", "Australia", "South America"];

  const getRegionFromCountry = (country: string): string => {
    const regionMap: { [key: string]: string } = {
      "USA": "North America",
      "UK": "Europe",
      "France": "Europe",
      "Germany": "Europe",
      "Spain": "Europe",
      "Japan": "Asia",
      "China": "Asia",
      "Australia": "Australia",
      "UAE": "Middle East"
    };
    return regionMap[country] || "Other";
  };

  const filteredResults = allPeople.filter(person => {
    const matchesQuery = !query || 
      person.name.toLowerCase().includes(query.toLowerCase()) ||
      person.role.toLowerCase().includes(query.toLowerCase()) ||
      person.city.toLowerCase().includes(query.toLowerCase()) ||
      person.industry.toLowerCase().includes(query.toLowerCase());
    
    const matchesIndustry = !selectedIndustry || person.industry === selectedIndustry;
    const matchesRegion = !selectedRegion || getRegionFromCountry(person.country) === selectedRegion;
    
    return matchesQuery && matchesIndustry && matchesRegion;
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFiltersDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePersonClick = (person: SearchResult) => {
    setShowResults(false);
    setShowFiltersDropdown(false);
    onPersonSelect?.(person);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedIndustry("");
    setSelectedRegion("");
    setShowResults(false);
    setShowFiltersDropdown(false);
  };

  const hasActiveFilters = query || selectedIndustry || selectedRegion;

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-4", className)}>
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold iridescent-text flex items-center justify-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Find your newest connection
        </h2>
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>Start typing</span>
          <div className="w-2 h-4 bg-primary animate-pulse ml-1" />
        </div>
      </div>

      {/* Search Controls */}
      <div className="flex gap-3">
        {/* Main Search Input */}
        <div className="relative flex-1" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search names, roles, cities..."
              className="pl-10 bg-card border-border hover:border-primary/50 focus:border-primary transition-colors"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && (query || hasActiveFilters) && (
            <Card className="absolute top-full left-0 right-0 mt-1 p-2 bg-card border-border shadow-lg z-50 max-h-80 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="space-y-1">
                  {filteredResults.slice(0, 8).map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handlePersonClick(person)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors"
                    >
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover border border-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium iridescent-text truncate">{person.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{person.role}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{person.city}, {person.country}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {person.industry}
                      </Badge>
                    </div>
                  ))}
                  {filteredResults.length > 8 && (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      +{filteredResults.length - 8} more results
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No connections found</p>
                  <p className="text-xs">Try adjusting your filters</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Filters Dropdown */}
        <div className="relative" ref={filtersRef}>
          <Button
            variant="outline"
            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
            className="flex items-center gap-2 bg-card border-border hover:border-primary/50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFiltersDropdown && "rotate-180")} />
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>

          {showFiltersDropdown && (
            <Card className="absolute top-full right-0 mt-1 p-4 bg-card border-border shadow-lg z-50 min-w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filter Results</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Industry Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Industry
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {industries.map((industry) => (
                      <div
                        key={industry}
                        onClick={() => {
                          setSelectedIndustry(industry === selectedIndustry ? "" : industry);
                          setShowResults(true);
                        }}
                        className={cn(
                          "p-2 text-sm rounded-md cursor-pointer transition-colors text-center",
                          selectedIndustry === industry 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-secondary/20 hover:bg-secondary/30 border border-transparent"
                        )}
                      >
                        {industry}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Region
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {regions.map((region) => (
                      <div
                        key={region}
                        onClick={() => {
                          setSelectedRegion(region === selectedRegion ? "" : region);
                          setShowResults(true);
                        }}
                        className={cn(
                          "p-2 text-sm rounded-md cursor-pointer transition-colors text-center",
                          selectedRegion === region 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-secondary/20 hover:bg-secondary/30 border border-transparent"
                        )}
                      >
                        {region}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Active filters:</span>
          {selectedIndustry && (
            <Badge variant="secondary" className="gap-1">
              {selectedIndustry}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-foreground" 
                onClick={() => setSelectedIndustry("")}
              />
            </Badge>
          )}
          {selectedRegion && (
            <Badge variant="secondary" className="gap-1">
              {selectedRegion}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-foreground" 
                onClick={() => setSelectedRegion("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;