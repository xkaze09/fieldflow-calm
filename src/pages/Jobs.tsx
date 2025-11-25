import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Briefcase, DollarSign, Clock, User, Plus } from "lucide-react";

const jobs = [
  {
    id: 1,
    customer: "John Smith",
    technician: "Mike Reynolds",
    date: "Nov 25, 2024",
    time: "9:00 AM",
    location: "1234 Main St, Los Angeles",
    laborHours: 3.5,
    laborCost: 245,
    partsCost: 180,
    totalPrice: 650,
    profit: 225,
    status: "in-progress" as const,
  },
  {
    id: 2,
    customer: "Sarah Johnson",
    technician: "Tom Lopez",
    date: "Nov 25, 2024",
    time: "11:30 AM",
    location: "5678 Oak Ave, San Diego",
    laborHours: 2,
    laborCost: 140,
    partsCost: 95,
    totalPrice: 350,
    profit: 115,
    status: "scheduled" as const,
  },
  {
    id: 3,
    customer: "Bob Williams",
    technician: "Mike Reynolds",
    date: "Nov 24, 2024",
    time: "2:00 PM",
    location: "9012 Pine Rd, San Francisco",
    laborHours: 4,
    laborCost: 280,
    partsCost: 220,
    totalPrice: 750,
    profit: 250,
    status: "completed" as const,
  },
  {
    id: 4,
    customer: "Emma Davis",
    technician: "Tom Lopez",
    date: "Nov 25, 2024",
    time: "4:30 PM",
    location: "3456 Elm St, Oakland",
    laborHours: 1.5,
    laborCost: 105,
    partsCost: 60,
    totalPrice: 250,
    profit: 85,
    status: "scheduled" as const,
  },
];

export default function Jobs() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground mt-1">Schedule and track service jobs</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-success">$2,000</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-accent">$675</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              All Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{job.customer}</h3>
                            <StatusBadge status={job.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                          <p className="font-medium text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.date}
                          </p>
                          <p className="text-sm text-muted-foreground">{job.time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Technician</p>
                          <p className="font-medium text-sm flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {job.technician}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Labor</p>
                          <p className="font-medium text-sm">{job.laborHours}h / ${job.laborCost}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Parts</p>
                          <p className="font-medium text-sm">${job.partsCost}</p>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="flex items-center justify-between pt-4 border-t border-border bg-secondary/30 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                        <div className="flex gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Price</p>
                            <p className="font-bold text-lg">${job.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit</p>
                            <p className="font-bold text-lg text-success flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.profit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Margin</p>
                          <p className="font-semibold text-accent">
                            {((job.profit / job.totalPrice) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
