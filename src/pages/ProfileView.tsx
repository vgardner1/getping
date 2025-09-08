import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarField } from "@/components/StarField";
import { Edit, Eye, MousePointer, Users, TrendingUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const ProfileView = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data (will be real when Supabase is connected)
  const analyticsData = {
    totalViews: 127,
    todayViews: 8,
    uniqueVisitors: 89,
    socialClicks: {
      linkedin: 23,
      instagram: 15,
      twitter: 8,
      venmo: 5
    },
    viewsOverTime: [
      { date: '2024-01-01', views: 12 },
      { date: '2024-01-02', views: 18 },
      { date: '2024-01-03', views: 25 },
      { date: '2024-01-04', views: 15 },
      { date: '2024-01-05', views: 22 },
      { date: '2024-01-06', views: 19 },
      { date: '2024-01-07', views: 16 }
    ]
  };

  const profileData = {
    name: "John Doe",
    bio: "Creative director passionate about design and innovation. Building the future one pixel at a time.",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    linkedin: "https://linkedin.com/in/johndoe",
    instagram: "https://instagram.com/johndoe",
    twitter: "https://x.com/johndoe",
    venmo: "@johndoe"
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Header */}
      <header className="border-b border-border p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold iridescent-text">ping!</Link>
          <Link to="/edit-profile">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-28 relative z-10 space-y-6">
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground iridescent-text">Total Views</p>
                <p className="text-2xl font-bold iridescent-text">{analyticsData.totalViews}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground iridescent-text">Today</p>
                <p className="text-2xl font-bold iridescent-text">{analyticsData.todayViews}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground iridescent-text">Unique Visitors</p>
                <p className="text-2xl font-bold iridescent-text">{analyticsData.uniqueVisitors}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground iridescent-text">Social Clicks</p>
                <p className="text-2xl font-bold iridescent-text">
                  {Object.values(analyticsData.socialClicks).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Preview */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold iridescent-text">Your Profile</h2>
            <Link to="/profile/public" target="_blank">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <img 
              src={profileData.profilePhoto} 
              alt={profileData.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold iridescent-text">{profileData.name}</h3>
              <p className="text-muted-foreground iridescent-text mt-2">{profileData.bio}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <a 
                  href={`mailto:${profileData.email}`}
                  className="flex items-center justify-center space-x-2 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-primary">📧</span>
                  <span className="text-sm iridescent-text">Email</span>
                </a>
                <a 
                  href={`tel:${profileData.phone}`}
                  className="flex items-center justify-center space-x-2 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-primary">📱</span>
                  <span className="text-sm iridescent-text">Phone</span>
                </a>
                <a 
                  href={profileData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-primary">💼</span>
                  <span className="text-sm iridescent-text">LinkedIn</span>
                </a>
                <a 
                  href={profileData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-primary">📷</span>
                  <span className="text-sm iridescent-text">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Link Analytics */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-bold iridescent-text mb-4">Link Performance</h2>
          <div className="space-y-4">
            {Object.entries(analyticsData.socialClicks).map(([platform, clicks]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="capitalize iridescent-text font-medium">{platform}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(clicks / Math.max(...Object.values(analyticsData.socialClicks))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold iridescent-text w-8 text-right">{clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Views Chart */}
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold iridescent-text">Profile Views</h2>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-secondary/20 border border-border rounded px-3 py-1 text-sm iridescent-text"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2 h-32">
            {analyticsData.viewsOverTime.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-primary rounded-t w-full transition-all duration-300 hover:bg-primary/80"
                  style={{ height: `${(day.views / 25) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground mt-2 iridescent-text">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ProfileView;