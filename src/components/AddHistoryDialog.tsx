import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessLines } from "@/hooks/useBusinessLines";

export function AddHistoryDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: businesses } = useBusinessLines();

  const [form, setForm] = useState({
    companyPhone: "",
    clientName: "",
    address: "",
    phone: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.clientName.trim() || !form.phone.trim()) {
      toast.error("Client name and phone are required");
      return;
    }

    setLoading(true);
    try {
      // 1. Upsert lead
      const { data: existingLeads } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", form.phone.trim())
        .limit(1);

      let leadId: string;

      if (existingLeads && existingLeads.length > 0) {
        leadId = existingLeads[0].id;
        await supabase
          .from("leads")
          .update({ name: form.clientName.trim(), location: form.address.trim() || null })
          .eq("id", leadId);
      } else {
        const { data: newLead, error: leadErr } = await supabase
          .from("leads")
          .insert({
            name: form.clientName.trim(),
            phone: form.phone.trim(),
            location: form.address.trim() || null,
            status: "new",
          })
          .select("id")
          .single();
        if (leadErr) throw leadErr;
        leadId = newLead.id;
      }

      // 2. Create call record
      const toNumber = form.companyPhone || "unknown";
      const { data: call, error: callErr } = await supabase
        .from("calls")
        .insert({
          from_number: form.phone.trim(),
          to_number: toNumber,
          direction: "inbound",
          status: "answered",
          lead_id: leadId,
          notes: "Manually added history entry",
        })
        .select("id")
        .single();
      if (callErr) throw callErr;

      // 3. Create job if appointment date provided
      if (form.appointmentDate) {
        const scheduledAt = form.appointmentTime
          ? `${form.appointmentDate}T${form.appointmentTime}`
          : `${form.appointmentDate}T09:00`;

        await supabase.from("jobs").insert({
          lead_id: leadId,
          call_id: call.id,
          status: "scheduled",
          scheduled_at: scheduledAt,
          location: form.address.trim() || null,
        });
      }

      toast.success("History entry added");
      queryClient.invalidateQueries({ queryKey: ["client-history"] });
      setForm({ companyPhone: "", clientName: "", address: "", phone: "", appointmentDate: "", appointmentTime: "" });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add History Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={form.companyPhone} onValueChange={(v) => update("companyPhone", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select company (optional)" />
              </SelectTrigger>
              <SelectContent>
                {businesses?.map((b) => (
                  <SelectItem key={b.phone} value={b.phone}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client Name *</Label>
            <Input
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Appointment Date</Label>
              <Input
                type="date"
                value={form.appointmentDate}
                onChange={(e) => update("appointmentDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Appointment Time</Label>
              <Input
                type="time"
                value={form.appointmentTime}
                onChange={(e) => update("appointmentTime", e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
