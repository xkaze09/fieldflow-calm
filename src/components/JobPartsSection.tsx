import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useJobParts, useAddJobPart, useRemoveJobPart } from "@/hooks/useJobParts";
import { useParts } from "@/hooks/useParts";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function JobPartsSection({ jobId }: { jobId: string }) {
  const { data: jobParts, isLoading } = useJobParts(jobId);
  const { data: catalog } = useParts();
  const addPart = useAddJobPart();
  const removePart = useRemoveJobPart();
  const [partId, setPartId] = useState("");
  const [qty, setQty] = useState("1");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!partId) return;
    try {
      await addPart.mutateAsync({ job_id: jobId, part_id: partId, qty: parseInt(qty) || 1 });
      setPartId("");
      setQty("1");
      setShowAdd(false);
      toast.success("Part added");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Package className="h-3 w-3" /> Parts
        </p>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>
      {showAdd && (
        <div className="flex items-center gap-2">
          <Select value={partId} onValueChange={setPartId}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Part" />
            </SelectTrigger>
            <SelectContent>
              {catalog?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (${p.unit_price})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="h-8 w-16 text-xs"
          />
          <Button size="sm" className="h-8" onClick={handleAdd} disabled={addPart.isPending}>
            Add
          </Button>
        </div>
      )}
      {isLoading ? null : jobParts && jobParts.length > 0 ? (
        <div className="space-y-1">
          {jobParts.map((jp) => (
            <div key={jp.id} className="flex items-center justify-between text-xs bg-secondary/40 rounded px-2 py-1">
              <span>{(jp as any).parts_catalog?.name} × {jp.qty}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${Number(jp.total_price).toFixed(2)}</span>
                <button
                  onClick={() => removePart.mutate({ id: jp.id, job_id: jobId })}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No parts added</p>
      )}
    </div>
  );
}
