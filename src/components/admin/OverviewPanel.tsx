import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, TrendingUp, TrendingDown, Bot, Play, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  trend?: "up" | "down" | "neutral";
}

export function OverviewPanel() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("");
  const [botSeeding, setBotSeeding] = useState(false);
  const [botSimulating, setBotSimulating] = useState(false);

  useEffect(() => {
    loadMetrics();
    // Only load AI insights if not already loaded
    if (!aiInsight) loadAIInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seedBots = async () => {
    setBotSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-bot-users');
      if (error) throw error;
      toast.success(data.message || 'Bots seeded successfully!');
    } catch (error) {
      console.error('Error seeding bots:', error);
      toast.error('Failed to seed bots');
    } finally {
      setBotSeeding(false);
    }
  };

  const simulateBotActivity = async () => {
    setBotSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-bot-activity');
      if (error) throw error;
      const successCount = data.results?.filter((r: any) => r.pointsAwarded > 0).length || 0;
      toast.success(`Bot simulation complete! ${successCount} bots earned points.`);
    } catch (error) {
      console.error('Error simulating bots:', error);
      toast.error('Failed to simulate bot activity');
    } finally {
      setBotSimulating(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Calculate date ranges
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Fetch total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch users from this week
      const { count: usersThisWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      // Fetch users from last week
      const { count: usersLastWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", twoWeeksAgo.toISOString())
        .lt("created_at", oneWeekAgo.toISOString());

      // Fetch course enrollments
      const { count: enrollmentCount } = await supabase
        .from("user_purchases")
        .select("*", { count: "exact", head: true });

      // Fetch enrollments this week
      const { count: enrollmentsThisWeek } = await supabase
        .from("user_purchases")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      // Fetch enrollments last week
      const { count: enrollmentsLastWeek } = await supabase
        .from("user_purchases")
        .select("*", { count: "exact", head: true })
        .gte("created_at", twoWeeksAgo.toISOString())
        .lt("created_at", oneWeekAgo.toISOString());

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number): { change: number; trend: "up" | "down" | "neutral" } => {
        if (previous === 0) {
          return { change: current > 0 ? 100 : 0, trend: current > 0 ? "up" : "neutral" };
        }
        const change = Math.round(((current - previous) / previous) * 100);
        return {
          change: Math.abs(change),
          trend: change > 0 ? "up" : change < 0 ? "down" : "neutral"
        };
      };

      const userChange = calculateChange(usersThisWeek || 0, usersLastWeek || 0);
      const enrollmentChange = calculateChange(enrollmentsThisWeek || 0, enrollmentsLastWeek || 0);

      setMetrics([
        {
          title: "Active Users",
          value: userCount || 0,
          change: userChange.change,
          icon: Users,
          trend: userChange.trend
        },
        {
          title: "Course Enrollments",
          value: enrollmentCount || 0,
          change: enrollmentChange.change,
          icon: BookOpen,
          trend: enrollmentChange.trend
        }
      ]);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-command', {
        body: { command: "generate weekly summary" }
      });

      if (!error && data?.data?.insight) {
        setAiInsight(data.data.insight);
      } else if (!error && data?.insight) {
        setAiInsight(data.insight);
      }
    } catch (error) {
      console.error("Error loading AI insights:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      {/* Bot Control Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 font-consciousness">
            <Bot className="h-5 w-5" />
            Bot Management
          </CardTitle>
          <CardDescription className="font-body">Control leaderboard bots for social proof</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button 
            onClick={seedBots} 
            disabled={botSeeding}
            variant="outline"
            className="font-body"
          >
            {botSeeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
            Seed Bots
          </Button>
          <Button 
            onClick={simulateBotActivity} 
            disabled={botSimulating}
            className="font-body"
          >
            {botSimulating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Simulation
          </Button>
        </CardContent>
      </Card>


      {aiInsight && (
        <Card className="border-primary/20 bg-gradient-to-br from-cosmic-deep to-cosmic-void">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-consciousness">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-body">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-consciousness">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-consciousness">{metric.value}</div>
              {metric.change !== undefined && metric.trend !== "neutral" && (
                <p className={`text-xs ${metric.trend === "up" ? "text-green-500" : "text-red-500"} flex items-center gap-1 mt-1 font-body`}>
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {metric.change}% from last week
                </p>
              )}
              {metric.trend === "neutral" && (
                <p className="text-xs text-muted-foreground mt-1 font-body">No change from last week</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
