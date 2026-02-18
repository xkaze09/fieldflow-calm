import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Briefcase, DollarSign, Clock, User, Plus, History } from "lucide-react";
import { CustomerHistoryDialog } from "@/components/CustomerHistoryDialog";
import { useJobs, useCreateJob } from "@/hooks/useJobs";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { useLeads } from "@/hooks/useLeads";
import { useTechnicians } from "@/hooks/useTechnicians";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { JobPartsSection } from "@/components/JobPartsSection";

export default function Jobs() {
  const { data: jobs, isLoading } = useJobs();
  const { data: leads } = useLeads();
  const { data: technicians } = useTechnicians();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    lead_id: "", technician_id: "", location: "", scheduled_at: "",
    labor_hours: "", total_price: "",
  });
  const [historyLead, setHistoryLead] = useState<{ id: string; name: string; phone?: string; location?: string } | null>(null);

  // Auto-open dialog when navigated with lead_id param
  useEffect(() => {
    const leadId = searchParams.get("lead_id");
    const location = searchParams.get("location");
    if (leadId) {
      setForm((f) => ({ ...f, lead_id: leadId, location: location || "" }));
      setOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreate = async () => {
    try {
      await createJob.mutateAsync({
        lead_id: form.lead_id || null,
        technician_id: form.technician_id || null,
        location: form.location || null,
        scheduled_at: form.scheduled_at || null,
        labor_hours: form.labor_hours ? parseFloat(form.labor_hours) : 0,
        total_price: form.total_price ? parseFloat(form.total_price) : 0,
      });
      toast.success("Job created");
      setOpen(false);
      setForm({ lead_id: "", technician_id: "", location: "", scheduled_at: "", labor_hours: "", total_price: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const todayRevenue = jobs?.reduce((sum, j) => sum + Number(j.total_price || 0), 0) ?? 0;
  const totalProfit = jobs?.reduce((sum, j) => sum + Number(j.profit || 0), 0) ?? 0;
  const scheduled = jobs?.filter((j) => j.status === "scheduled").length ?? 0;
  const completed = jobs?.filter((j) => j.status === "completed").length ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground mt-1">Schedule and track service jobs</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Job</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Job</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                    <SelectContent>
                      {leads?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Technician</Label>
                  <Select value={form.technician_id} onValueChange={(v) => setForm({ ...form, technician_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                    <SelectContent>
                      {technicians?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Scheduled At</Label>
                  <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Labor Hours</Label>
                    <Input type="number" value={form.labor_hours} onChange={(e) => setForm({ ...form, labor_hours: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Price</Label>
                    <Input type="number" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={createJob.isPending} className="w-full">
                  {createJob.isPending ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-success">${todayRevenue.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Total Profit</p><p className="text-2xl font-bold text-accent">${totalProfit.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Scheduled</p><p className="text-2xl font-bold">{scheduled}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completed}</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5" />All Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {(job as any).leads?.name ? (
                                <button
                                  className="font-semibold text-lg hover:text-primary hover:underline transition-colors text-left"
                                  onClick={() => setHistoryLead({
                                    id: job.lead_id!,
                                    name: (job as any).leads.name,
                                    phone: (job as any).leads.phone,
                                    location: (job as any).leads.location || job.location || undefined,
                                  })}
                                >
                                  {(job as any).leads.name}
                                </button>
                              ) : (
                                <h3 className="font-semibold text-lg">No Customer</h3>
                              )}
                              <Select
                                value={job.status}
                                onValueChange={(v) => {
                                  updateJob.mutateAsync({ id: job.id, status: v })
                                    .then(() => toast.success("Job status updated"))
                                    .catch((e: any) => toast.error(e.message));
                                }}
                              >
                                <SelectTrigger className="h-7 w-[130px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-sm text-muted-foreground">{job.location || "No location"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
                            <p className="font-medium text-sm flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {job.scheduled_at ? new Date(job.scheduled_at).toLocaleDateString() : "TBD"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Technician</p>
                            <p className="font-medium text-sm flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {(job as any).technicians?.name || "Unassigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Labor</p>
                            <p className="font-medium text-sm">{Number(job.labor_hours || 0)}h / ${Number(job.labor_cost || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Parts</p>
                            <p className="font-medium text-sm">${Number(job.parts_cost || 0)}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                          <JobPartsSection jobId={job.id} />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border bg-secondary/30 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                          <div className="flex gap-6 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Price</p>
                              <p className="font-bold text-lg">${Number(job.total_price || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Profit</p>
                              <p className="font-bold text-lg text-success flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />{Number(job.profit || 0)}
                              </p>
                            </div>
                          </div>
                          {Number(job.total_price) > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Margin</p>
                              <p className="font-semibold text-accent">
                                {((Number(job.profit || 0) / Number(job.total_price)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No jobs yet. Create your first job!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerHistoryDialog
        leadId={historyLead?.id ?? null}
        leadName={historyLead?.name ?? ""}
        leadPhone={historyLead?.phone}
        leadLocation={historyLead?.location}
        open={!!historyLead}
        onOpenChange={(o) => { if (!o) setHistoryLead(null); }}
      />
    </Layout>
  );
}
