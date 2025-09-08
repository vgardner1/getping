import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NetworkField } from "@/components/NetworkField";
import { PingerCarousel } from "@/components/PingerCarousel";
import { ArrowLeft, Compass, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Globe3D, { type GlobePin } from "@/components/Globe3D";
import GlobalSearch from "@/components/GlobalSearch";
const Community = () => {
  const [selectedSearchPerson, setSelectedSearchPerson] = useState<any>(null);
  
  const handlePersonSelect = (person: any) => {
    console.log("Selected person:", person);
    setSelectedSearchPerson(person);
  };

  const handlePinClick = (pin: GlobePin) => {
    console.log("Pin clicked:", pin);
    // Handle pin interactions - could open profiles, chat, etc.
  };

  // Sample pins for the globe
  const globePins: GlobePin[] = [
    { lng: -71.094, lat: 42.3601, label: "MIT", id: "mit" },
    { lng: -71.119, lat: 42.377, label: "Harvard", id: "harvard" },
    { lng: -71.089, lat: 42.339, label: "Northeastern", id: "neu" },
    { lng: -122.4194, lat: 37.7749, label: "San Francisco", id: "sf" },
    { lng: -74.0059, lat: 40.7128, label: "New York", id: "nyc" },
    { lng: 2.3522, lat: 48.8566, label: "Paris", id: "paris" },
    { lng: 139.6917, lat: 35.6895, label: "Tokyo", id: "tokyo" }
  ];
  return <div className="min-h-screen bg-background relative">
      <NetworkField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">ping!</span>
          </Link>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="text-sm iridescent-text">Community</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 space-y-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-4">
              Connect Like Nature
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-[5px] px-[23px] py-[9px]">Discover and connect with people in a brand new way. 


We just reimagined networking.</p>
          </div>
        </section>

        {/* Search Section */}
        <section className="px-4">
          <GlobalSearch onPersonSelect={handlePersonSelect} />
        </section>

        {/* Globe Section */}
        <section className="relative min-h-[520px] h-[68vh] rounded-xl overflow-hidden border">
          <Globe3D 
            className="absolute inset-0" 
            showPins={globePins}
            onPinClick={handlePinClick}
            start={{ lng: -71.09, lat: 42.36, height: 20000000 }}
            apiKey={(window as any).GOOGLE_MAPS_API_KEY}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-background/20 rounded-lg" />
        </section>

        {/* Featured Pings */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-500 mb-2">
              Recommended Pings
            </h2>
            <p className="text-muted-foreground">
              Connect with professionals in your network
            </p>
          </div>
          
          <PingerCarousel />
        </section>

        {/* Stats Section */}
        <section>
          <Card className="bg-card border-border p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-green-500">1,247</h3>
                <p className="text-sm text-muted-foreground">Active Pingers</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-green-500">52</h3>
                <p className="text-sm text-muted-foreground">Cities Connected</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-green-500">3,891</h3>
                <p className="text-sm text-muted-foreground">Connections Made</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Nearby Pingers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-green-500 text-center">
            Pingers Near You
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[{
            name: "Sarah Johnson",
            title: "Software Engineer",
            location: "0.5 mi away",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
          }, {
            name: "Mike Chen",
            title: "Product Designer",
            location: "1.2 mi away",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
          }, {
            name: "Emily Davis",
            title: "Marketing Manager",
            location: "2.1 mi away",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
          }, {
            name: "David Park",
            title: "Data Analyst",
            location: "3.0 mi away",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
          }, {
            name: "Lisa Wang",
            title: "UX Researcher",
            location: "3.5 mi away",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face"
          }, {
            name: "Tom Wilson",
            title: "Tech Lead",
            location: "4.2 mi away",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face"
          }].map((pinger, index) => <Card key={index} className="bg-card border-border p-4 hover:border-primary/50 transition-colors cursor-pointer shimmer hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img src={pinger.avatar} alt={pinger.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-green-500 truncate">{pinger.name}</h3>
                    <p className="text-sm text-primary truncate">{pinger.title}</p>
                    <p className="text-xs text-muted-foreground">{pinger.location}</p>
                  </div>
                </div>
              </Card>)}
          </div>
        </section>
      </main>
    </div>;
};
export default Community;