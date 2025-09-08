import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export const AnalyticsDashboard = () => {
  const [todayVisits, setTodayVisits] = useState(23);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayVisits(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/dashboard">
      <Button 
        variant="outline" 
        size="sm"
        className="shimmer border-primary/50 text-primary hover:bg-primary/10 hover:scale-105 transition-all duration-200"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Dashboard
        <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
          {todayVisits}
        </Badge>
      </Button>
    </Link>
  );
};