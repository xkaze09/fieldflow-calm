import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useParts, useCreatePart } from "@/hooks/useParts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Parts() {
  const { data: parts, isLoading } = useParts();
  const createPart = useCreatePart();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", sku: "", unit_cost: "", unit_price: "", stock: "" });

  const handleCreate = async () => {
    if (!form.name || !form.sku) { toast.error("Name and SKU are required"); return; }
    try {
      await createPart.mutateAsync({
        name: form.name,
        sku: form.sku,
        unit_cost: parseFloat(form.unit_cost) || 0,
        unit_price: parseFloat(form.unit_price) || 0,
        stock: parseInt(form.stock) || 0,
      });
      toast.success("Part added");
      setOpen(false);
      setForm({ name: "", sku: "", unit_cost: "", unit_price: "", stock: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = parts?.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const totalStock = parts?.reduce((s, p) => s + (p.stock || 0), 0) ?? 0;
  const totalCostValue = parts?.reduce((s, p) => s + (p.stock || 0) * Number(p.unit_cost), 0) ?? 0;
  const totalSaleValue = parts?.reduce((s, p) => s + (p.stock || 0) * Number(p.unit_price), 0) ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Parts Catalog</h1>
            <p className="text-muted-foreground mt-1">Manage inventory and pricing</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Part</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Part</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>SKU *</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Unit Cost</Label><Input type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Unit Price</Label><Input type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                </div>
                <Button onClick={handleCreate} disabled={createPart.isPending} className="w-full">
                  {createPart.isPending ? "Adding..." : "Add Part"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Input placeholder="Search parts by SKU or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((part) => {
              const margin = Number(part.unit_cost) > 0
                ? Math.round(((Number(part.unit_price) - Number(part.unit_cost)) / Number(part.unit_cost)) * 100)
                : 0;
              return (
                <Card key={part.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">{part.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{part.sku}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Stock</span>
                      </div>
                      <span className={`font-semibold ${(part.stock || 0) < 10 ? 'text-warning' : 'text-success'}`}>
                        {part.stock || 0} units
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cost</p>
                        <p className="font-semibold">${Number(part.unit_cost).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Price</p>
                        <p className="font-semibold text-primary">${Number(part.unit_price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Margin</span>
                      </div>
                      <span className="font-bold text-success">{margin}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><CardContent className="py-8"><p className="text-muted-foreground text-center">No parts found</p></CardContent></Card>
        )}

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{totalStock}</p></div>
              <div><p className="text-sm text-muted-foreground">Total Value (Cost)</p><p className="text-2xl font-bold">${totalCostValue.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Potential Revenue</p><p className="text-2xl font-bold text-primary">${totalSaleValue.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Avg Margin</p><p className="text-2xl font-bold text-success">{totalCostValue > 0 ? Math.round(((totalSaleValue - totalCostValue) / totalCostValue) * 100) : 0}%</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
