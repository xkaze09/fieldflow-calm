import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, Briefcase, DollarSign, Clock, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

// Mock data
const metrics = [
  {
    title: "Total Calls Today",
    value: 47,
    icon: <Phone className="h-6 w-6" />,
    trend: { value: 12, label: "vs yesterday" },
  },
  {
    title: "Active Leads",
    value: 23,
    icon: <Users className="h-6 w-6" />,
    trend: { value: 8, label: "this week" },
  },
  {
    title: "Jobs Scheduled",
    value: 15,
    icon: <Briefcase className="h-6 w-6" />,
    trend: { value: -5, label: "vs last week" },
  },
  {
    title: "Revenue (Today)",
    value: "$8,420",
    icon: <DollarSign className="h-6 w-6" />,
    trend: { value: 24, label: "vs yesterday" },
  },
];

const recentCalls = [
  { id: 1, from: "(555) 123-4567", time: "2 min ago", status: "answered" as const },
  { id: 2, from: "(555) 234-5678", time: "15 min ago", status: "missed" as const },
  { id: 3, from: "(555) 345-6789", time: "32 min ago", status: "answered" as const },
  { id: 4, from: "(555) 456-7890", time: "1 hr ago", status: "answered" as const },
  { id: 5, from: "(555) 567-8901", time: "2 hr ago", status: "missed" as const },
];

const upcomingJobs = [
  { id: 1, customer: "John Smith", time: "9:00 AM", tech: "Mike R.", status: "scheduled" as const },
  { id: 2, customer: "Sarah Johnson", time: "11:30 AM", tech: "Tom L.", status: "scheduled" as const },
  { id: 3, customer: "Bob Williams", time: "2:00 PM", tech: "Mike R.", status: "in-progress" as const },
  { id: 4, customer: "Emma Davis", time: "4:30 PM", tech: "Tom L.", status: "scheduled" as const },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Calls */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Calls</CardTitle>
              <Phone className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
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
                        <p className="font-medium">{call.from}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {call.time}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={call.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{job.customer}</p>
                      <p className="text-sm text-muted-foreground">{job.time} • {job.tech}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
