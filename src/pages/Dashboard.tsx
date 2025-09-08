import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BarChart3, Eye, Users, Download, MousePointer, Calendar, TrendingUp, Activity, Globe, Smartphone, Monitor, Tablet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  totalVisits: number;
  profileViews: number;
  linkedinClicks: number;
  instagramClicks: number;
  resumeDownloads: number;
  projectClicks: {
    damChair: number;
    rootsTable: number;
    storm: number;
    lucid: number;
  };
  communityClicks: number;
  checkoutClicks: number;
  todayVisits: number;
  weeklyGrowth: number;
  topReferrers: Array<{ source: string; visits: number }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  timeData: Array<{ time: string; visits: number }>;
  geographicData: Array<{ country: string; visits: number }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 2847,
    profileViews: 1923,
    linkedinClicks: 342,
    instagramClicks: 178,
    resumeDownloads: 89,
    projectClicks: {
      damChair: 234,
      rootsTable: 189,
      storm: 156,
      lucid: 98
    },
    communityClicks: 67,
    checkoutClicks: 45,
    todayVisits: 23,
    weeklyGrowth: 12.5,
    topReferrers: [
      { source: "LinkedIn", visits: 892 },
      { source: "Direct", visits: 743 },
      { source: "Instagram", visits: 456 },
      { source: "Google", visits: 298 },
      { source: "Referral", visits: 145 }
    ],
    deviceBreakdown: {
      desktop: 1598,
      mobile: 987,
      tablet: 262
    },
    timeData: [
      { time: "00:00", visits: 12 },
      { time: "04:00", visits: 8 },
      { time: "08:00", visits: 45 },
      { time: "12:00", visits: 78 },
      { time: "16:00", visits: 92 },
      { time: "20:00", visits: 67 },
    ],
    geographicData: [
      { country: "United States", visits: 1423 },
      { country: "United Kingdom", visits: 234 },
      { country: "Canada", visits: 189 },
      { country: "Germany", visits: 156 },
      { country: "France", visits: 98 },
      { country: "Australia", visits: 76 },
    ]
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        todayVisits: prev.todayVisits + Math.floor(Math.random() * 3),
        totalVisits: prev.totalVisits + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, description, className = "" }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: number;
    description?: string;
    className?: string;
  }) => (
    <Card className={`relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend > 0 ? '+' : ''}{trend}% from last week
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="shimmer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold iridescent-text flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Real-time insights into your portfolio performance</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary px-3 py-1">
            Live
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 pb-28 space-y-8">
        
        {/* Key Metrics Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-foreground">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Visits"
              value={analytics.totalVisits.toLocaleString()}
              icon={Eye}
              trend={analytics.weeklyGrowth}
              className="lg:col-span-1"
            />
            <StatCard
              title="Today's Visits"
              value={analytics.todayVisits}
              icon={Users}
              description="Live updates every 5 seconds"
              className="lg:col-span-1"
            />
            <StatCard
              title="Profile Views"
              value={analytics.profileViews.toLocaleString()}
              icon={MousePointer}
              trend={8.2}
              className="lg:col-span-1"
            />
            <StatCard
              title="Resume Downloads"
              value={analytics.resumeDownloads}
              icon={Download}
              trend={15.3}
              className="lg:col-span-1"
            />
          </div>
        </section>

        {/* Social Media & Project Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Social Media Analytics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Social Media Engagement</h3>
            <div className="space-y-4">
              <Card className="border-border/40 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    LinkedIn Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500 mb-2">{analytics.linkedinClicks}</div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${(analytics.linkedinClicks / 400) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">85% of target (400)</p>
                </CardContent>
              </Card>
              
              <Card className="border-border/40 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                    Instagram Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-500 mb-2">{analytics.instagramClicks}</div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${(analytics.instagramClicks / 200) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">89% of target (200)</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Project Analytics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Project Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(analytics.projectClicks).map(([project, clicks]) => (
                <Card key={project} className="border-border/40 bg-card/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      {project === 'damChair' ? 'Dam Chair' : 
                       project === 'rootsTable' ? 'Roots Table' : 
                       project.charAt(0).toUpperCase() + project.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{clicks}</div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(clicks / 250) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Traffic Sources & Device Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Traffic Sources */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Traffic Sources
              </CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.topReferrers.map((referrer, index) => (
                <div key={referrer.source} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-pink-500' : 
                      index === 3 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-sm font-medium">{referrer.source}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {referrer.visits}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Device Types
              </CardTitle>
              <CardDescription>How users access your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Desktop</span>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  {analytics.deviceBreakdown.desktop}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Mobile</span>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  {analytics.deviceBreakdown.mobile}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tablet className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Tablet</span>
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                  {analytics.deviceBreakdown.tablet}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Data */}
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Visitors by country</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.geographicData.slice(0, 6).map((geo, index) => (
                <div key={geo.country} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{geo.country}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {geo.visits}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* User Actions & Engagement */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-foreground">User Actions & Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Community Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{analytics.communityClicks}</div>
                <div className="text-xs text-muted-foreground">clicks</div>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Checkout Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{analytics.checkoutClicks}</div>
                <div className="text-xs text-muted-foreground">potential sales</div>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Learn More</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">142</div>
                <div className="text-xs text-muted-foreground">information requests</div>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3.2%</div>
                <div className="text-xs text-muted-foreground">visit to action</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Time-based Analytics */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Visit Patterns</h3>
          <Card className="border-border/40 bg-card/60">
            <CardHeader>
              <CardTitle>Daily Traffic Pattern</CardTitle>
              <CardDescription>Visits throughout the day (last 24 hours)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-32 gap-2">
                {analytics.timeData.map((data, index) => (
                  <div key={data.time} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary rounded-t-sm transition-all duration-300 min-h-[4px]"
                      style={{ height: `${(data.visits / 100) * 100}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground mt-2">{data.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;