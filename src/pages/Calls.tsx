import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Phone, Search, Play, Briefcase, PhoneIncoming, PhoneMissed, PhoneCall, Building2 } from "lucide-react";
import { useCalls } from "@/hooks/useCalls";
import { useBusinessLookup, matchBusiness } from "@/hooks/useBusinessLines";
import { CustomerHistoryDialog } from "@/components/CustomerHistoryDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Calls() {
  const { data: calls, isLoading } = useCalls();
  const businessLookup = useBusinessLookup();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const [historyLead, setHistoryLead] = useState<{ id: string; name: string } | null>(null);

  const filtered = calls?.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.from_number.toLowerCase().includes(q) ||
      c.to_number.toLowerCase().includes(q) ||
      ((c as any).leads?.name || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (!activeFilter) return true;
    if (activeFilter === "missed") return c.status === "missed";
    if (activeFilter === "inbound") return c.direction === "inbound";
    if (activeFilter === "active") return c.status === "ringing" || c.status === "in-progress";
    return true;
  });

  const missedCount = calls?.filter((c) => c.status === "missed").length ?? 0;
  const inboundCount = calls?.filter((c) => c.direction === "inbound").length ?? 0;
  const activeCount = calls?.filter((c) => c.status === "ringing" || c.status === "in-progress").length ?? 0;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const stats = [
    { label: "Missed", key: "missed", count: missedCount, icon: PhoneMissed, color: "text-destructive" },
    { label: "Inbound", key: "inbound", count: inboundCount, icon: PhoneIncoming, color: "text-primary" },
    { label: "Active", key: "active", count: activeCount, icon: PhoneCall, color: "text-green-500" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Log</h1>
          <p className="text-muted-foreground mt-1">View all inbound calls</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === stat.key ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveFilter(activeFilter === stat.key ? null : stat.key)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.count}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {activeFilter && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Filtering by: <span className="font-medium text-foreground capitalize">{activeFilter}</span>
            </p>
            <Button variant="ghost" size="sm" onClick={() => setActiveFilter(null)}>Clear</Button>
          </div>
        )}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls by phone number or name..."
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
              <Phone className="h-5 w-5" />Recent Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : filtered && filtered.length > 0 ? (
              <div className="space-y-2">
                {filtered.map((call) => (
                  <div
                    key={call.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        {(call as any).leads?.name && call.lead_id ? (
                          <button
                            className="font-medium truncate hover:text-primary hover:underline transition-colors text-left"
                            onClick={() => setHistoryLead({ id: call.lead_id!, name: (call as any).leads.name })}
                          >
                            {(call as any).leads.name}
                          </button>
                        ) : (
                          <p className="font-medium truncate">{call.from_number}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{call.from_number} → {call.to_number}</p>
                        {(() => {
                          const biz = matchBusiness(businessLookup, call.to_number);
                          return biz ? (
                            <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {biz.name}
                            </p>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm flex-wrap">
                      <div>
                        <p className="text-muted-foreground">Time</p>
                        <p className="font-medium">{formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium font-mono">{formatDuration(call.duration_seconds)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <StatusBadge status={call.status as any} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {call.recording_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-1" />Play
                          </a>
                        </Button>
                      )}
                      {call.lead_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/jobs?lead_id=${call.lead_id}`)}
                        >
                          <Briefcase className="h-4 w-4 mr-1" />Create Job
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Phone className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium">No calls recorded yet</p>
                <p className="text-sm text-muted-foreground">Incoming calls will appear here once connected.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerHistoryDialog
        leadId={historyLead?.id ?? null}
        leadName={historyLead?.name ?? ""}
        open={!!historyLead}
        onOpenChange={(o) => { if (!o) setHistoryLead(null); }}
      />
    </Layout>
  );
}
