import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const parts = [
  {
    id: 1,
    sku: "PT-001",
    name: "HVAC Filter 16x25",
    category: "Filters",
    unitCost: 12.50,
    unitPrice: 35.00,
    stock: 48,
    margin: 180,
  },
  {
    id: 2,
    sku: "PT-002",
    name: "Thermostat Digital",
    category: "Controls",
    unitCost: 45.00,
    unitPrice: 120.00,
    stock: 15,
    margin: 167,
  },
  {
    id: 3,
    sku: "PT-003",
    name: "Refrigerant R-410A (25lb)",
    category: "Refrigerants",
    unitCost: 180.00,
    unitPrice: 425.00,
    stock: 8,
    margin: 136,
  },
  {
    id: 4,
    sku: "PT-004",
    name: "Capacitor 35/5 MFD",
    category: "Electrical",
    unitCost: 8.00,
    unitPrice: 25.00,
    stock: 62,
    margin: 213,
  },
  {
    id: 5,
    sku: "PT-005",
    name: "Contactor 40A",
    category: "Electrical",
    unitCost: 22.00,
    unitPrice: 65.00,
    stock: 24,
    margin: 195,
  },
  {
    id: 6,
    sku: "PT-006",
    name: "Condensate Pump",
    category: "Pumps",
    unitCost: 35.00,
    unitPrice: 95.00,
    stock: 12,
    margin: 171,
  },
];

export default function Parts() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Parts Catalog</h1>
            <p className="text-muted-foreground mt-1">Manage inventory and pricing</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input placeholder="Search parts by SKU or name..." className="flex-1" />
              <Button variant="outline">Filter by Category</Button>
            </div>
          </CardContent>
        </Card>

        {/* Parts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <Card key={part.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{part.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{part.sku}</p>
                  </div>
                  <Badge variant="secondary">{part.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stock Status */}
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Stock</span>
                  </div>
                  <span className={`font-semibold ${part.stock < 10 ? 'text-warning' : 'text-success'}`}>
                    {part.stock} units
                  </span>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cost</p>
                    <p className="font-semibold">${part.unitCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-semibold text-primary">${part.unitPrice.toFixed(2)}</p>
                  </div>
                </div>

                {/* Margin */}
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Margin</span>
                  </div>
                  <span className="font-bold text-success">{part.margin}%</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button size="sm" className="flex-1">Use in Job</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">169</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value (Cost)</p>
                <p className="text-2xl font-bold">$8,245</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Revenue</p>
                <p className="text-2xl font-bold text-primary">$21,380</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Margin</p>
                <p className="text-2xl font-bold text-success">177%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
