import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useServiceHistory, useCreateServiceHistory } from "@/hooks/useServiceHistory";
import { History, Plus, DollarSign, Star, Tag } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  leadId: string | null;
  leadName: string;
  leadPhone?: string;
  leadLocation?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerHistoryDialog({ leadId, leadName, leadPhone, leadLocation, open, onOpenChange }: Props) {
  const { data: history, isLoading } = useServiceHistory(leadId);
  const createEntry = useCreateServiceHistory();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    service_date: "",
    description: "",
    total_price: "",
    parts_summary: "",
    labor_summary: "",
    discount: "",
    discount_reason: "",
    membership: false,
    membership_note: "",
    notes: "",
  });

  const handleCreate = async () => {
    if (!leadId) return;
    try {
      await createEntry.mutateAsync({
        lead_id: leadId,
        service_date: form.service_date || new Date().toISOString(),
        description: form.description || null,
        total_price: form.total_price ? parseFloat(form.total_price) : 0,
        parts_summary: form.parts_summary || null,
        labor_summary: form.labor_summary || null,
        discount: form.discount ? parseFloat(form.discount) : 0,
        discount_reason: form.discount_reason || null,
        membership: form.membership,
        membership_note: form.membership_note || null,
        notes: form.notes || null,
      });
      toast.success("Service entry added");
      setAdding(false);
      setForm({ service_date: "", description: "", total_price: "", parts_summary: "", labor_summary: "", discount: "", discount_reason: "", membership: false, membership_note: "", notes: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Customer History — {leadName}
          </DialogTitle>
          <div className="text-sm text-muted-foreground space-y-0.5 pt-1">
            {leadPhone && <p>{leadPhone}</p>}
            {leadLocation && <p>{leadLocation}</p>}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {history?.length ?? 0} service record{(history?.length ?? 0) !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={() => setAdding(!adding)}>
              <Plus className="h-4 w-4 mr-1" />{adding ? "Cancel" : "Add Entry"}
            </Button>
          </div>

          {adding && (
            <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/30">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Service Date</Label>
                  <Input type="datetime-local" value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Total Price</Label>
                  <Input type="number" placeholder="0" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description (e.g. "Springs are broken")</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Parts Summary</Label>
                  <Input placeholder="Springs 243, Drums..." value={form.parts_summary} onChange={(e) => setForm({ ...form, parts_summary: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Labor Summary</Label>
                  <Input placeholder="2h install" value={form.labor_summary} onChange={(e) => setForm({ ...form, labor_summary: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Discount Amount</Label>
                  <Input type="number" placeholder="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Discount Reason</Label>
                  <Input placeholder="New membership" value={form.discount_reason} onChange={(e) => setForm({ ...form, discount_reason: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.membership} onCheckedChange={(v) => setForm({ ...form, membership: v })} />
                <Label className="text-xs">Membership</Label>
                {form.membership && (
                  <Input className="flex-1" placeholder="Membership note" value={form.membership_note} onChange={(e) => setForm({ ...form, membership_note: e.target.value })} />
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea placeholder="Review, follow-up notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={handleCreate} disabled={createEntry.isPending} className="w-full" size="sm">
                {createEntry.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="border border-border rounded-lg p-4 space-y-2 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{entry.description || "Service"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.service_date), "EEEE, MM/dd/yy")}
                        {(entry as any).jobs?.technicians?.name && ` — ${(entry as any).jobs.technicians.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />{Number(entry.total_price || 0).toLocaleString()}
                      </p>
                      {entry.job_id && (
                        <span className="text-xs text-muted-foreground">from job</span>
                      )}
                    </div>
                  </div>

                  {(entry.parts_summary || entry.labor_summary) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {entry.parts_summary && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{entry.parts_summary}</span>}
                      {entry.labor_summary && <span className="bg-accent/10 text-accent px-2 py-0.5 rounded">{entry.labor_summary}</span>}
                    </div>
                  )}

                  {Number(entry.discount) > 0 && (
                    <p className="text-sm flex items-center gap-1">
                      <Tag className="h-3 w-3 text-destructive" />
                      <span className="text-destructive font-medium">-${Number(entry.discount)}</span>
                      {entry.discount_reason && <span className="text-muted-foreground">({entry.discount_reason})</span>}
                    </p>
                  )}

                  {entry.membership && (
                    <p className="text-sm flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="font-medium">Membership</span>
                      {entry.membership_note && <span className="text-muted-foreground">— {entry.membership_note}</span>}
                    </p>
                  )}

                  {entry.notes && (
                    <p className="text-sm text-muted-foreground italic">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 text-sm">No service history yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
