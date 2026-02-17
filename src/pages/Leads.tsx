import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, Phone, Mail, MapPin, Plus } from "lucide-react";
import { useLeads, useLeadCounts, useCreateLead } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const { data: counts } = useLeadCounts();
  const createLead = useCreateLead();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", location: "" });

  const handleCreate = async () => {
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      await createLead.mutateAsync({ ...form, email: form.email || null, location: form.location || null });
      toast.success("Lead created");
      setOpen(false);
      setForm({ name: "", phone: "", email: "", location: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const stats = [
    { label: "New", status: "new" as const },
    { label: "Qualified", status: "qualified" as const },
    { label: "Scheduled", status: "scheduled" as const },
    { label: "Won", status: "won" as const },
    { label: "Lost", status: "lost" as const },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-1">Manage your sales pipeline</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Lead</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <Button onClick={handleCreate} disabled={createLead.isPending} className="w-full">
                  {createLead.isPending ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{counts?.[stat.status] ?? 0}</p>
                  <StatusBadge status={stat.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />All Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : leads && leads.length > 0 ? (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{lead.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                          {lead.email && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {lead.location && (
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.location}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <StatusBadge status={lead.status as any} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No leads yet. Add your first lead!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
