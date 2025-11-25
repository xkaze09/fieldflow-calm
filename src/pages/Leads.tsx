import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, Phone, Mail, MapPin, Plus } from "lucide-react";

const leads = [
  {
    id: 1,
    name: "John Smith",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
    location: "Los Angeles, CA",
    status: "qualified" as const,
    lastContact: "2 hours ago",
    callCount: 3,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    phone: "(555) 234-5678",
    email: "sarah.j@email.com",
    location: "San Diego, CA",
    status: "scheduled" as const,
    lastContact: "1 day ago",
    callCount: 2,
  },
  {
    id: 3,
    name: "Bob Williams",
    phone: "(555) 345-6789",
    email: "bob.w@email.com",
    location: "San Francisco, CA",
    status: "new" as const,
    lastContact: "3 hours ago",
    callCount: 1,
  },
  {
    id: 4,
    name: "Emma Davis",
    phone: "(555) 456-7890",
    email: "emma.davis@email.com",
    location: "Oakland, CA",
    status: "won" as const,
    lastContact: "5 days ago",
    callCount: 5,
  },
  {
    id: 5,
    name: "Mike Thompson",
    phone: "(555) 567-8901",
    email: "mike.t@email.com",
    location: "Sacramento, CA",
    status: "lost" as const,
    lastContact: "2 weeks ago",
    callCount: 2,
  },
];

export default function Leads() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-1">Manage your sales pipeline</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { label: "New", count: 12, status: "new" as const },
            { label: "Qualified", count: 8, status: "qualified" as const },
            { label: "Scheduled", count: 5, status: "scheduled" as const },
            { label: "Won", count: 23, status: "won" as const },
            { label: "Lost", count: 7, status: "lost" as const },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stat.count}</p>
                  <StatusBadge status={stat.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {lead.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{lead.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lead.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Calls</p>
                      <p className="font-medium">{lead.callCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Contact</p>
                      <p className="font-medium">{lead.lastContact}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
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
