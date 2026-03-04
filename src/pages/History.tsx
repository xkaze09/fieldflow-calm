import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistory } from "@/hooks/useHistory";
import { Search, History as HistoryIcon, Building2, User, MapPin, Phone, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { AddHistoryDialog } from "@/components/AddHistoryDialog";

export default function History() {
  const { data: history, isLoading } = useHistory();
  const [search, setSearch] = useState("");

  const filtered = history?.filter((h) => {
    const q = search.toLowerCase();
    return (
      (h.clientName?.toLowerCase().includes(q) ?? false) ||
      (h.companyName?.toLowerCase().includes(q) ?? false) ||
      (h.address?.toLowerCase().includes(q) ?? false) ||
      h.phone.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer History</h1>
            <p className="text-muted-foreground mt-1">Complete call and appointment history</p>
          </div>
          <AddHistoryDialog />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, address, or phone..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              All History ({filtered?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Company</th>
                      <th className="pb-3 font-medium text-muted-foreground">Client Name</th>
                      <th className="pb-3 font-medium text-muted-foreground">Address</th>
                      <th className="pb-3 font-medium text-muted-foreground">Phone</th>
                      <th className="pb-3 font-medium text-muted-foreground">Appointment Date</th>
                      <th className="pb-3 font-medium text-muted-foreground">Appointment Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            {row.companyName || <span className="text-muted-foreground italic">—</span>}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            {row.clientName || <span className="text-muted-foreground italic">Unknown</span>}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            {row.address || <span className="text-muted-foreground italic">—</span>}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1.5 font-mono text-xs">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            {row.phone}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {row.appointmentDate ? (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              {format(new Date(row.appointmentDate), "MM/dd/yyyy")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">No appt</span>
                          )}
                        </td>
                        <td className="py-3">
                          {row.appointmentDate ? (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              {format(new Date(row.appointmentDate), "h:mm a")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <HistoryIcon className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium">No history found</p>
                <p className="text-sm text-muted-foreground">Client history will appear here as calls come in.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
