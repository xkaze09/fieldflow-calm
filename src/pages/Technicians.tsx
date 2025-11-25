import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, Star, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const technicians = [
  {
    id: 1,
    name: "Mike Reynolds",
    team: "HVAC",
    hourlyCost: 35,
    hourlyRate: 70,
    commissionRate: 5,
    rating: 4.8,
    jobsCompleted: 142,
    revenue: 45200,
    contact: "(555) 111-2222",
  },
  {
    id: 2,
    name: "Tom Lopez",
    team: "Plumbing",
    hourlyCost: 32,
    hourlyRate: 65,
    commissionRate: 5,
    rating: 4.9,
    jobsCompleted: 128,
    revenue: 38900,
    contact: "(555) 333-4444",
  },
  {
    id: 3,
    name: "Alex Chen",
    team: "Electrical",
    hourlyCost: 38,
    hourlyRate: 75,
    commissionRate: 5,
    rating: 4.7,
    jobsCompleted: 95,
    revenue: 32100,
    contact: "(555) 555-6666",
  },
  {
    id: 4,
    name: "Sarah Miller",
    team: "HVAC",
    hourlyCost: 33,
    hourlyRate: 68,
    commissionRate: 5,
    rating: 4.9,
    jobsCompleted: 110,
    revenue: 41500,
    contact: "(555) 777-8888",
  },
];

export default function Technicians() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
            <p className="text-muted-foreground mt-1">Manage your field team</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Technician
          </Button>
        </div>

        {/* Team Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Techs</p>
                <p className="text-3xl font-bold">4</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">475</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-success">$157.7K</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold flex items-center gap-1">
                  4.8
                  <Star className="h-6 w-6 fill-warning text-warning" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technicians List */}
        <div className="grid gap-4 lg:grid-cols-2">
          {technicians.map((tech) => (
            <Card key={tech.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                      {tech.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{tech.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{tech.team}</Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-semibold">{tech.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Jobs</p>
                    <p className="font-bold flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {tech.jobsCompleted}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <p className="font-bold text-success flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {(tech.revenue / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg/Job</p>
                    <p className="font-bold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      ${Math.round(tech.revenue / tech.jobsCompleted)}
                    </p>
                  </div>
                </div>

                {/* Rates */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Cost Rate</span>
                    <span className="font-semibold">${tech.hourlyCost}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Bill Rate</span>
                    <span className="font-semibold text-primary">${tech.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Commission</span>
                    <span className="font-semibold text-accent">{tech.commissionRate}%</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium font-mono text-sm">{tech.contact}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Assign Job
                  </Button>
                  <Button size="sm" className="flex-1">Edit Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
