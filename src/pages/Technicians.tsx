import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTechnicians, useCreateTechnician, useUpdateTechnician } from "@/hooks/useTechnicians";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

const SERVICE_AREAS = [
  "Chicago", "Aurora", "Rockford", "Joliet", "Naperville",
  "Springfield", "Peoria", "Elgin", "Waukegan",
  "Throughout Illinois",
];

const emptyForm = { name: "", team: "", hourly_cost: "", hourly_rate: "", commission_rate: "", contact: "" };

export default function Technicians() {
  const { data: technicians, isLoading } = useTechnicians();
  const createTech = useCreateTechnician();
  const updateTech = useUpdateTechnician();
  const [open, setOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Tables<"technicians"> | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [areaOpen, setAreaOpen] = useState(false);
  const openCreate = () => {
    setEditingTech(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (tech: Tables<"technicians">) => {
    setEditingTech(tech);
    setForm({
      name: tech.name,
      team: tech.team || "",
      hourly_cost: String(tech.hourly_cost),
      hourly_rate: String(tech.hourly_rate),
      commission_rate: String(tech.commission_rate ?? ""),
      contact: tech.contact || "",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    const payload = {
      name: form.name,
      team: form.team || null,
      hourly_cost: parseFloat(form.hourly_cost) || 0,
      hourly_rate: parseFloat(form.hourly_rate) || 0,
      commission_rate: parseFloat(form.commission_rate) || 0,
      contact: form.contact || null,
    };
    try {
      if (editingTech) {
        await updateTech.mutateAsync({ id: editingTech.id, ...payload });
        toast.success("Technician updated");
      } else {
        await createTech.mutateAsync(payload);
        toast.success("Technician added");
      }
      setOpen(false);
      setForm(emptyForm);
      setEditingTech(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const isPending = createTech.isPending || updateTech.isPending;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
            <p className="text-muted-foreground mt-1">Manage your field team</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingTech(null); }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Technician</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingTech ? "Edit Technician" : "Add Technician"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Service Area</Label>
                  <Popover open={areaOpen} onOpenChange={setAreaOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={areaOpen} className="w-full justify-between font-normal">
                        {form.team || "Select service area..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50" align="start">
                      <Command>
                        <CommandInput placeholder="Search or type area..." onValueChange={(v) => setForm({ ...form, team: v })} />
                        <CommandList>
                          <CommandEmpty>
                            {form.team ? (
                              <button className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded" onClick={() => setAreaOpen(false)}>
                                Use "{form.team}"
                              </button>
                            ) : "Type to add a custom area"}
                          </CommandEmpty>
                          <CommandGroup>
                            {SERVICE_AREAS.map((area) => (
                              <CommandItem key={area} value={area} onSelect={(v) => { setForm({ ...form, team: v }); setAreaOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", form.team === area ? "opacity-100" : "opacity-0")} />
                                {area}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Cost Rate ($/hr)</Label><Input type="number" value={form.hourly_cost} onChange={(e) => setForm({ ...form, hourly_cost: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Bill Rate ($/hr)</Label><Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Commission %</Label><Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                </div>
                <Button onClick={handleSubmit} disabled={isPending} className="w-full">
                  {isPending ? "Saving..." : editingTech ? "Save Changes" : "Add Technician"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Active Techs</p><p className="text-3xl font-bold">{technicians?.length ?? 0}</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Avg Cost Rate</p><p className="text-3xl font-bold">${technicians?.length ? Math.round(technicians.reduce((s, t) => s + Number(t.hourly_cost), 0) / technicians.length) : 0}/hr</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="space-y-2"><p className="text-sm text-muted-foreground">Avg Bill Rate</p><p className="text-3xl font-bold text-primary">${technicians?.length ? Math.round(technicians.reduce((s, t) => s + Number(t.hourly_rate), 0) / technicians.length) : 0}/hr</p></div></CardContent></Card>
        </div>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>
        ) : technicians && technicians.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {technicians.map((tech) => (
              <Card key={tech.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openEdit(tech)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                        {tech.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{tech.name}</CardTitle>
                        {tech.team && <Badge variant="secondary" className="mt-1">{tech.team}</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Cost Rate</span>
                      <span className="font-semibold">${Number(tech.hourly_cost)}/hr</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bill Rate</span>
                      <span className="font-semibold text-primary">${Number(tech.hourly_rate)}/hr</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="font-semibold text-accent">{Number(tech.commission_rate)}%</span>
                    </div>
                  </div>
                  {tech.contact && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="font-medium font-mono text-sm">{tech.contact}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-8"><p className="text-muted-foreground text-center">No technicians yet. Add your first team member!</p></CardContent></Card>
        )}
      </div>
    </Layout>
  );
}
