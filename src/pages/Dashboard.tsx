import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, Briefcase, DollarSign, Clock, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useRecentCalls } from "@/hooks/useCalls";
import { useTodayJobs } from "@/hooks/useJobs";
import { useLeadCounts } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: recentCalls, isLoading: callsLoading } = useRecentCalls(5);
  const { data: todayJobs, isLoading: jobsLoading } = useTodayJobs();
  const { data: leadCounts } = useLeadCounts();

  const totalLeads = leadCounts
    ? Object.values(leadCounts).reduce((a, b) => a + b, 0)
    : 0;

  const metrics = [
    {
      title: "Calls Today",
      value: recentCalls?.length ?? 0,
      icon: <Phone className="h-6 w-6" />,
    },
    {
      title: "Active Leads",
      value: totalLeads,
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Jobs Scheduled",
      value: todayJobs?.filter((j) => j.status === "scheduled").length ?? 0,
      icon: <Briefcase className="h-6 w-6" />,
    },
    {
      title: "Revenue (Today)",
      value: `$${(todayJobs?.reduce((sum, j) => sum + Number(j.total_price || 0), 0) ?? 0).toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Calls */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Calls</CardTitle>
              <Phone className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : recentCalls && recentCalls.length > 0 ? (
                <div className="space-y-4">
                  {recentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{(call as any).leads?.name || call.from_number}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={call.status as any} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No calls yet</p>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : todayJobs && todayJobs.length > 0 ? (
                <div className="space-y-4">
                  {todayJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{(job as any).leads?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.scheduled_at
                            ? new Date(job.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "TBD"}{" "}
                          • {(job as any).technicians?.name || "Unassigned"}
                        </p>
                      </div>
                      <StatusBadge status={job.status as any} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No jobs scheduled today</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
