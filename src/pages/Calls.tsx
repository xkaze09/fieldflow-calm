import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone, Search, Filter, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const calls = [
  {
    id: 1,
    from: "(555) 123-4567",
    to: "(800) 555-0199",
    time: "2024-11-25 09:15 AM",
    duration: "5:32",
    status: "answered" as const,
    lead: "John Smith",
    recording: true,
  },
  {
    id: 2,
    from: "(555) 234-5678",
    to: "(800) 555-0199",
    time: "2024-11-25 09:45 AM",
    duration: "0:00",
    status: "missed" as const,
    lead: "New Lead",
    recording: false,
  },
  {
    id: 3,
    from: "(555) 345-6789",
    to: "(800) 555-0199",
    time: "2024-11-25 10:12 AM",
    duration: "8:45",
    status: "answered" as const,
    lead: "Sarah Johnson",
    recording: true,
  },
  {
    id: 4,
    from: "(555) 456-7890",
    to: "(800) 555-0199",
    time: "2024-11-25 11:30 AM",
    duration: "3:21",
    status: "answered" as const,
    lead: "Bob Williams",
    recording: true,
  },
  {
    id: 5,
    from: "(555) 567-8901",
    to: "(800) 555-0199",
    time: "2024-11-25 01:05 PM",
    duration: "0:00",
    status: "missed" as const,
    lead: "New Lead",
    recording: false,
  },
  {
    id: 6,
    from: "(555) 678-9012",
    to: "(800) 555-0199",
    time: "2024-11-25 02:20 PM",
    duration: "12:18",
    status: "answered" as const,
    lead: "Emma Davis",
    recording: true,
  },
];

export default function Calls() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Log</h1>
            <p className="text-muted-foreground mt-1">View and manage all inbound calls</p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search calls by phone number or name..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Calls Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Recent Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{call.lead}</p>
                      <p className="text-sm text-muted-foreground">{call.from}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm flex-wrap">
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{call.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium font-mono">{call.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={call.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {call.recording && (
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    )}
                    <Button size="sm">Create Job</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
