import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, Globe, MapPin, Briefcase } from "lucide-react";
import { PINGER_PROFILES } from "@/data/pingers";

const GuestView = () => {
  const { profileId } = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would fetch from the database
    const foundProfile = PINGER_PROFILES.find(p => p.id === profileId);
    if (foundProfile) {
      setProfile({
        ...foundProfile,
        projects: [
          "Sustainable UI Framework",
          "Community-driven Design System",
          "AI-powered Accessibility Tools"
        ],
        skills: ["React", "TypeScript", "Design Systems", "Accessibility"],
        currentGoals: [
          "Building inclusive design frameworks",
          "Mentoring junior designers",
          "Speaking at design conferences"
        ]
      });
    }
  }, [profileId]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-4">
            <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold iridescent-text mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
          </div>
          <Link to="/">
            <Button className="w-full">
              Explore ping! <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Guest Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Viewing as guest</span>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Join ping!
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <img
              src={profile.avatar}
              alt={`${profile.name} avatar`}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold iridescent-text mb-2">{profile.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.role}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{profile.bio}</p>
              <Badge variant="secondary" className="mb-4">
                Available for opportunities
              </Badge>
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold iridescent-text mb-4">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string, idx: number) => (
              <Badge key={idx} variant="outline">{skill}</Badge>
            ))}
          </div>
        </Card>

        {/* Current Projects */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold iridescent-text mb-4">Current Projects</h2>
          <div className="space-y-3">
            {profile.projects.map((project: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">{project}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold iridescent-text mb-4">Current Goals</h2>
          <div className="space-y-3">
            {profile.currentGoals.map((goal: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span className="text-muted-foreground">{goal}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
          <h3 className="text-xl font-semibold iridescent-text mb-2">Want to Connect?</h3>
          <p className="text-muted-foreground mb-4">
            Join ping! to start conversations and build meaningful connections
          </p>
          <div className="space-y-3">
            <Link to="/signup">
              <Button className="w-full sm:w-auto">
                Start Your Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              7-day free trial • $2.99/mo after • Refer 5 friends for first month free
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuestView;