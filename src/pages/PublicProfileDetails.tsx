import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/StarField";
import { ArrowLeft, MapPin, Building2, ExternalLink, Calendar, Award, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PublicProfile {
  user_id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  company: string;
  job_title: string;
  website_url: string;
  skills: string[];
  interests: string[];
  social_links: any;
  phone_number: string;
   experience?: any[];
   featured_work?: any[];
}

const PublicProfileDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      console.log("Fetching detailed profile for userId:", userId);
      
      // Use SECURITY DEFINER RPC for anonymous public access
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_public_profile_secure',
        { target_user_id: userId }
      );

      console.log("Profile data:", profileData);
      console.log("Profile error:", profileError);

      if (profileError) {
        console.error("Profile error:", profileError);
        setError("Profile not found");
        setLoading(false);
        return;
      }

      if (!profileData || profileData.length === 0) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      const p = profileData[0];
      setProfile({
        user_id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        location: p.location,
        company: p.company,
        job_title: p.job_title,
        website_url: p.website_url,
        skills: p.skills || [],
        interests: p.interests || [],
        social_links: p.social_links || {},
        phone_number: p.phone_number,
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="iridescent-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="text-center relative z-10 max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold iridescent-text mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground iridescent-text mb-6">
            The profile you're looking for doesn't exist or has been made private.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = (profile.display_name?.toLowerCase() === "vgardner") ? "Vaness Gardner" : (profile.display_name || "User");

  // Mock data for detailed profile (this would come from database in real app)
  const detailedProfile = {
    fullBio: "Vanessa \"Reece\" Gardner is a creative technologist blending innovation and technology to craft engaging digital solutions. With a passion for merging design and development, Vanessa seeks collaborative opportunities with forward-thinking professionals and teams. Open to networking, project partnerships, and exploring cutting-edge trends in tech and creativity.",
    experience: [
      {
        company: "Bind Solutions",
        position: "Founder / Creative Technologist", 
        duration: "Unknown - Present",
        description: "Spearheading the design and development of digital solutions, leveraging emerging technologies to solve complex problems for clients and collaborators. Focused on bringing creative ideas to life through technical innovation and user-centric design.",
        skills: ["creative technology", "web development", "digital strategy"]
      }
    ],
    featuredWork: [
      {
        title: "Dam Chair",
        type: "Furniture Design",
        image: "/src/assets/dam-chair.jpg"
      },
      {
        title: "Republic 2.0", 
        type: "Digital Art",
        image: "/src/assets/storm-republic.jpg"
      },
      {
        title: "Roots Table",
        type: "Sustainable Design", 
        image: "/src/assets/roots-table.jpg"
      }
    ],
    coreSkills: ["creative technology", "web development", "digital strategy"],
    interests: ["digital innovation", "collaborative projects", "emerging technology"],
    endorsements: [
      {
        name: "Sarah Johnson",
        timeAgo: "2 days ago",
        message: "Amazing work on the Dam Chair! The AI integration is revolutionary."
      },
      {
        name: "Michael Chen", 
        timeAgo: "1 week ago",
        message: "Love the sustainable design approach. Can't wait to see Republic 2.0 in museums!"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to={`/ping/${userId}`} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold iridescent-text">Back</span>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Join ping!
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 relative z-10">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary overflow-hidden mb-6">
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.display_name || "Profile"}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-4xl font-bold iridescent-text mb-2">
            {displayName}
          </h1>
          
          <p className="text-xl text-muted-foreground iridescent-text mb-4">
            {profile.job_title || "Creative Technologist"}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="iridescent-text">{profile.location}</span>
              </div>
            )}
            {profile.company && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="iridescent-text">{profile.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">About</h2>
          <p className="text-muted-foreground iridescent-text leading-relaxed">
            {detailedProfile.fullBio}
          </p>
        </Card>

        {/* Experience Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">Experience</h2>
          {detailedProfile.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-6 relative">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-2 top-2"></div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold iridescent-text">{exp.company}</h3>
                <p className="text-primary font-medium">{exp.position}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <span className="iridescent-text">{exp.duration}</span>
                </div>
                <p className="text-muted-foreground iridescent-text mb-3">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Featured Work Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">Featured Work</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {detailedProfile.featuredWork.map((work, index) => (
              <div key={index} className="bg-secondary/20 rounded-lg p-4">
                <div className="aspect-square bg-primary/10 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold iridescent-text">{work.title}</h3>
                <p className="text-sm text-muted-foreground iridescent-text">{work.type}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Core Skills Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">Core Skills</h2>
          <div className="flex flex-wrap gap-3">
            {detailedProfile.coreSkills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary/20 text-primary rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>

        {/* Interests Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4">Interests</h2>
          <div className="flex flex-wrap gap-3">
            {detailedProfile.interests.map((interest, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-secondary/20 text-muted-foreground rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </Card>

        {/* Endorsements Section */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-2xl font-bold iridescent-text mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Endorsements
          </h2>
          <div className="space-y-4">
            {detailedProfile.endorsements.map((endorsement, index) => (
              <div key={index} className="bg-secondary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-muted-foreground iridescent-text mb-2">
                      "{endorsement.message}"
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium iridescent-text">{endorsement.name}</span>
                      <span className="text-sm text-muted-foreground iridescent-text">{endorsement.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="bg-card border-border p-6 text-center">
          <h3 className="text-xl font-bold iridescent-text mb-2">Want to connect with {displayName}?</h3>
          <p className="text-muted-foreground iridescent-text mb-4">
            Get ping! to unlock instant networking
          </p>
          <Link to="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started - Free Trial
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
};

export default PublicProfileDetails;