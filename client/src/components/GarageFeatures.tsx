import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Shield, Fuel, DollarSign, Calendar, TrendingDown, TrendingUp,
  Phone, Plus, Trash2, Loader2, CheckCircle, AlertTriangle,
  FileCheck, ArrowDown, ArrowUp, Clock
} from "lucide-react";

function getWarrantyStatus(endDate: string): { label: string; variant: "default" | "destructive" | "secondary" | "outline" } {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return { label: "Expired", variant: "destructive" };
  if (diffDays <= 30) return { label: "Expiring Soon", variant: "secondary" };
  return { label: "Active", variant: "default" };
}

export function WarrantyManager({ vehicleId }: { vehicleId: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId,
    warrantyType: "",
    provider: "",
    policyNumber: "",
    coverageDetails: "",
    deductible: "",
    maxCoverage: "",
    startDate: "",
    endDate: "",
    startMileage: "",
    endMileage: "",
    contactPhone: "",
  });

  const { data = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["warranties", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/warranties`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vehicleId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/warranties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setForm({ vehicleId, warrantyType: "", provider: "", policyNumber: "", coverageDetails: "", deductible: "", maxCoverage: "", startDate: "", endDate: "", startMileage: "", endMileage: "", contactPhone: "" });
      toast({ title: "Warranty Added", description: "Warranty has been saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add warranty", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/warranties/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Removed", description: "Warranty deleted" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-tech uppercase text-sm">Warranties</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-tech" data-testid="button-add-warranty">
              <Plus className="w-3 h-3 mr-1" /> Add Warranty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-tech uppercase">Add Warranty</DialogTitle>
              <DialogDescription>Track warranty coverage for your vehicle</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <Label>Warranty Type *</Label>
                <Select value={form.warrantyType} onValueChange={(v) => setForm({ ...form, warrantyType: v })}>
                  <SelectTrigger data-testid="input-warranty-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["Manufacturer", "Extended", "Powertrain", "Bumper-to-Bumper", "Tire", "Battery"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider *</Label>
                <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Warranty provider" data-testid="input-warranty-provider" />
              </div>
              <div>
                <Label>Policy Number</Label>
                <Input value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} placeholder="Policy #" data-testid="input-warranty-policy" />
              </div>
              <div>
                <Label>Coverage Details</Label>
                <Input value={form.coverageDetails} onChange={(e) => setForm({ ...form, coverageDetails: e.target.value })} placeholder="What's covered" data-testid="input-warranty-coverage" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Deductible</Label>
                  <Input type="number" value={form.deductible} onChange={(e) => setForm({ ...form, deductible: e.target.value })} placeholder="$0" data-testid="input-warranty-deductible" />
                </div>
                <div>
                  <Label>Max Coverage</Label>
                  <Input type="number" value={form.maxCoverage} onChange={(e) => setForm({ ...form, maxCoverage: e.target.value })} placeholder="$0" data-testid="input-warranty-max-coverage" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start Date *</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} data-testid="input-warranty-start-date" />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} data-testid="input-warranty-end-date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start Mileage</Label>
                  <Input type="number" value={form.startMileage} onChange={(e) => setForm({ ...form, startMileage: e.target.value })} placeholder="0" data-testid="input-warranty-start-mileage" />
                </div>
                <div>
                  <Label>End Mileage</Label>
                  <Input type="number" value={form.endMileage} onChange={(e) => setForm({ ...form, endMileage: e.target.value })} placeholder="100000" data-testid="input-warranty-end-mileage" />
                </div>
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="1-800-XXX-XXXX" data-testid="input-warranty-phone" />
              </div>
              <Button
                className="w-full font-tech uppercase"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.warrantyType || !form.provider || !form.startDate || !form.endDate || createMutation.isPending}
                data-testid="button-save-warranty"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Warranty
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h4 className="font-tech uppercase text-muted-foreground">No Warranties Tracked</h4>
          <p className="text-xs text-muted-foreground mt-1">Add warranty info to keep track of coverage</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {data.map((w: any) => {
              const status = getWarrantyStatus(w.endDate);
              return (
                <Card key={w.id} className="p-4 bg-card/50" data-testid={`card-warranty-${w.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="font-tech uppercase text-sm">{w.warrantyType}</span>
                        <Badge
                          variant={status.variant}
                          className={`text-[10px] ${status.label === "Expiring Soon" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : ""}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{w.provider}</p>
                      {w.policyNumber && <p className="text-xs font-mono text-muted-foreground">Policy: {w.policyNumber}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(w.startDate).toLocaleDateString()} — {new Date(w.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(w.id)} data-testid={`button-delete-warranty-${w.id}`}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function FuelTracker({ vehicleId }: { vehicleId: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId,
    fillDate: new Date().toISOString().split("T")[0],
    odometer: "",
    gallons: "",
    pricePerGallon: "",
    totalCost: "",
    fuelType: "Regular",
    station: "",
    fullTank: true,
  });

  useEffect(() => {
    const g = parseFloat(form.gallons);
    const p = parseFloat(form.pricePerGallon);
    if (g > 0 && p > 0) {
      setForm((prev) => ({ ...prev, totalCost: (g * p).toFixed(2) }));
    }
  }, [form.gallons, form.pricePerGallon]);

  const { data = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["fuel-logs", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/fuel-logs`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vehicleId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/vehicles/${vehicleId}/fuel-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setForm({ vehicleId, fillDate: new Date().toISOString().split("T")[0], odometer: "", gallons: "", pricePerGallon: "", totalCost: "", fuelType: "Regular", station: "", fullTank: true });
      toast({ title: "Fill-Up Logged", description: "Fuel entry saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log fuel", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/fuel-logs/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Removed", description: "Fuel log deleted" });
    },
  });

  const totalGallons = data.reduce((s: number, l: any) => s + (parseFloat(l.gallons) || 0), 0);
  const totalCost = data.reduce((s: number, l: any) => s + (parseFloat(l.totalCost) || 0), 0);
  const mpgEntries = data.filter((l: any) => l.mpg && parseFloat(l.mpg) > 0);
  const avgMpg = mpgEntries.length > 0 ? mpgEntries.reduce((s: number, l: any) => s + parseFloat(l.mpg), 0) / mpgEntries.length : 0;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-tech uppercase text-sm">Fuel Tracker</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-tech" data-testid="button-add-fuel">
              <Plus className="w-3 h-3 mr-1" /> Add Fill-Up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-tech uppercase">Log Fill-Up</DialogTitle>
              <DialogDescription>Record fuel purchase details</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Fill Date *</Label>
                  <Input type="date" value={form.fillDate} onChange={(e) => setForm({ ...form, fillDate: e.target.value })} data-testid="input-fuel-date" />
                </div>
                <div>
                  <Label>Odometer *</Label>
                  <Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="Miles" data-testid="input-fuel-odometer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Gallons *</Label>
                  <Input type="number" step="0.01" value={form.gallons} onChange={(e) => setForm({ ...form, gallons: e.target.value })} placeholder="0.00" data-testid="input-fuel-gallons" />
                </div>
                <div>
                  <Label>Price/Gallon *</Label>
                  <Input type="number" step="0.01" value={form.pricePerGallon} onChange={(e) => setForm({ ...form, pricePerGallon: e.target.value })} placeholder="$0.00" data-testid="input-fuel-price" />
                </div>
              </div>
              <div>
                <Label>Total Cost</Label>
                <Input type="number" step="0.01" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} placeholder="Auto-calculated" data-testid="input-fuel-total" />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v })}>
                  <SelectTrigger data-testid="input-fuel-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Regular", "Mid-Grade", "Premium", "Diesel", "E85", "Electric"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Station</Label>
                <Input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="Gas station name" data-testid="input-fuel-station" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="fullTank"
                  checked={form.fullTank}
                  onCheckedChange={(checked) => setForm({ ...form, fullTank: !!checked })}
                  data-testid="input-fuel-full-tank"
                />
                <Label htmlFor="fullTank" className="text-sm cursor-pointer">Full tank fill-up</Label>
              </div>
              <Button
                className="w-full font-tech uppercase"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.odometer || !form.gallons || !form.pricePerGallon || createMutation.isPending}
                data-testid="button-save-fuel"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Log Fill-Up
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 bg-muted/30 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-tech">Avg MPG</p>
            <p className="text-lg font-mono font-bold text-primary">{avgMpg > 0 ? avgMpg.toFixed(1) : "—"}</p>
          </Card>
          <Card className="p-3 bg-muted/30 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-tech">Total Gallons</p>
            <p className="text-lg font-mono font-bold">{totalGallons.toFixed(1)}</p>
          </Card>
          <Card className="p-3 bg-muted/30 text-center">
            <p className="text-[10px] uppercase text-muted-foreground font-tech">Total Cost</p>
            <p className="text-lg font-mono font-bold">${totalCost.toFixed(2)}</p>
          </Card>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Fuel className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h4 className="font-tech uppercase text-muted-foreground">No Fuel Logs</h4>
          <p className="text-xs text-muted-foreground mt-1">Start tracking your fuel economy</p>
        </div>
      ) : (
        <ScrollArea className="h-[350px]">
          <div className="space-y-2">
            {data.map((l: any) => (
              <Card key={l.id} className="p-3 bg-card/50" data-testid={`card-fuel-${l.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Fuel className="w-3 h-3 text-primary" />
                      <span className="text-xs font-mono">{new Date(l.fillDate).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-[10px]">{l.fuelType || "Regular"}</Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                      <span>{parseFloat(l.gallons).toFixed(2)} gal</span>
                      <span>${parseFloat(l.pricePerGallon).toFixed(2)}/gal</span>
                      <span className="font-bold">${parseFloat(l.totalCost).toFixed(2)}</span>
                      {l.mpg && parseFloat(l.mpg) > 0 && <span className="text-primary">{parseFloat(l.mpg).toFixed(1)} MPG</span>}
                    </div>
                    {l.odometer && <p className="text-[10px] text-muted-foreground font-mono mt-1">{parseInt(l.odometer).toLocaleString()} mi</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(l.id)} data-testid={`button-delete-fuel-${l.id}`}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

const EXPENSE_CATEGORIES = ["Fuel", "Maintenance", "Repairs", "Insurance", "Registration", "Tires", "Modifications", "Parking", "Tolls", "Other"];

export function ExpenseTracker({ vehicleId }: { vehicleId: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId,
    category: "",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    vendor: "",
    odometer: "",
    notes: "",
  });

  const { data: expenses = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["expenses", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/expenses`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vehicleId,
  });

  const { data: summary = {} } = useQuery<any>({
    queryKey: ["expense-summary", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/expense-summary`, { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !!vehicleId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/vehicles/${vehicleId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setForm({ vehicleId, category: "", description: "", amount: "", expenseDate: new Date().toISOString().split("T")[0], vendor: "", odometer: "", notes: "" });
      toast({ title: "Expense Added", description: "Expense has been recorded" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add expense", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Removed", description: "Expense deleted" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-tech uppercase text-sm">Expenses</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-tech" data-testid="button-add-expense">
              <Plus className="w-3 h-3 mr-1" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-tech uppercase">Add Expense</DialogTitle>
              <DialogDescription>Record a vehicle expense</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="input-expense-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was the expense?" data-testid="input-expense-description" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Amount *</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="$0.00" data-testid="input-expense-amount" />
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} data-testid="input-expense-date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Vendor</Label>
                  <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Store/Shop" data-testid="input-expense-vendor" />
                </div>
                <div>
                  <Label>Odometer</Label>
                  <Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="Miles" data-testid="input-expense-odometer" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" data-testid="input-expense-notes" />
              </div>
              <Button
                className="w-full font-tech uppercase"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.category || !form.description || !form.amount || createMutation.isPending}
                data-testid="button-save-expense"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {summary && Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(summary).map(([cat, amt]: [string, any]) => (
            <Badge key={cat} variant="outline" className="text-[10px] font-mono">
              {cat}: ${parseFloat(amt).toFixed(0)}
            </Badge>
          ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h4 className="font-tech uppercase text-muted-foreground">No Expenses Tracked</h4>
          <p className="text-xs text-muted-foreground mt-1">Record expenses to see spending breakdown</p>
        </div>
      ) : (
        <ScrollArea className="h-[350px]">
          <div className="space-y-2">
            {expenses.map((e: any) => (
              <Card key={e.id} className="p-3 bg-card/50" data-testid={`card-expense-${e.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">{e.category}</Badge>
                      <span className="text-xs font-mono text-muted-foreground">{new Date(e.expenseDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{e.description}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      {e.vendor && <span>{e.vendor}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">${parseFloat(e.amount).toFixed(2)}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-expense-${e.id}`}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

const TASK_PRESETS = ["Oil Change", "Tire Rotation", "Air Filter", "Brake Inspection", "Transmission Fluid", "Coolant Flush", "Spark Plugs", "Timing Belt", "Battery Check", "Wheel Alignment"];

export function MaintenanceScheduler({ vehicleId }: { vehicleId: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedMileage, setCompletedMileage] = useState("");
  const [form, setForm] = useState({
    vehicleId,
    taskName: "",
    customTask: "",
    intervalMiles: "",
    intervalMonths: "",
    nextDueDate: "",
    nextDueMileage: "",
    estimatedCost: "",
    priority: "Normal",
  });

  const { data = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["maintenance", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/maintenance`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vehicleId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, taskName: data.taskName === "Custom" ? data.customTask : data.taskName };
      const res = await fetch(`/api/vehicles/${vehicleId}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setForm({ vehicleId, taskName: "", customTask: "", intervalMiles: "", intervalMonths: "", nextDueDate: "", nextDueMileage: "", estimatedCost: "", priority: "Normal" });
      toast({ title: "Schedule Added", description: "Maintenance task scheduled" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add schedule", variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, completedMileage }: { id: string; completedMileage: string }) => {
      const res = await fetch(`/api/maintenance/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedMileage }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setCompleteDialogOpen(false);
      setCompletingId(null);
      setCompletedMileage("");
      toast({ title: "Completed", description: "Maintenance marked as done" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Removed", description: "Schedule deleted" });
    },
  });

  const now = new Date();
  const overdue = data.filter((m: any) => m.status === "overdue" || (m.nextDueDate && new Date(m.nextDueDate) < now && m.status !== "completed"));
  const upcoming = data.filter((m: any) => m.status !== "completed" && !overdue.includes(m));
  const completed = data.filter((m: any) => m.status === "completed");

  const priorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-tech uppercase text-sm">Maintenance Schedule</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-tech" data-testid="button-add-maintenance">
              <Plus className="w-3 h-3 mr-1" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-tech uppercase">Schedule Maintenance</DialogTitle>
              <DialogDescription>Set up recurring maintenance reminders</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <Label>Task *</Label>
                <Select value={form.taskName} onValueChange={(v) => setForm({ ...form, taskName: v })}>
                  <SelectTrigger data-testid="input-maintenance-task"><SelectValue placeholder="Select task" /></SelectTrigger>
                  <SelectContent>
                    {TASK_PRESETS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom Task...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.taskName === "Custom" && (
                <div>
                  <Label>Custom Task Name *</Label>
                  <Input value={form.customTask} onChange={(e) => setForm({ ...form, customTask: e.target.value })} placeholder="Task name" data-testid="input-maintenance-custom" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Every X Miles</Label>
                  <Input type="number" value={form.intervalMiles} onChange={(e) => setForm({ ...form, intervalMiles: e.target.value })} placeholder="5000" data-testid="input-maintenance-interval-miles" />
                </div>
                <div>
                  <Label>Every X Months</Label>
                  <Input type="number" value={form.intervalMonths} onChange={(e) => setForm({ ...form, intervalMonths: e.target.value })} placeholder="6" data-testid="input-maintenance-interval-months" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Next Due Date</Label>
                  <Input type="date" value={form.nextDueDate} onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })} data-testid="input-maintenance-due-date" />
                </div>
                <div>
                  <Label>Next Due Mileage</Label>
                  <Input type="number" value={form.nextDueMileage} onChange={(e) => setForm({ ...form, nextDueMileage: e.target.value })} placeholder="50000" data-testid="input-maintenance-due-mileage" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Estimated Cost</Label>
                  <Input type="number" step="0.01" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="$0.00" data-testid="input-maintenance-cost" />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger data-testid="input-maintenance-priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Low", "Normal", "High", "Critical"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full font-tech uppercase"
                onClick={() => createMutation.mutate(form)}
                disabled={(!form.taskName || (form.taskName === "Custom" && !form.customTask)) || createMutation.isPending}
                data-testid="button-save-maintenance"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Schedule Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-tech uppercase">Complete Maintenance</DialogTitle>
            <DialogDescription>Enter the mileage when this was completed</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label>Completed Mileage</Label>
              <Input type="number" value={completedMileage} onChange={(e) => setCompletedMileage(e.target.value)} placeholder="Current mileage" data-testid="input-completed-mileage" />
            </div>
            <Button
              className="w-full font-tech uppercase"
              onClick={() => completingId && completeMutation.mutate({ id: completingId, completedMileage })}
              disabled={completeMutation.isPending}
              data-testid="button-confirm-complete"
            >
              {completeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Mark Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h4 className="font-tech uppercase text-muted-foreground">No Maintenance Scheduled</h4>
          <p className="text-xs text-muted-foreground mt-1">Set up maintenance reminders for your vehicle</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {overdue.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-tech text-destructive mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Overdue</p>
                <div className="space-y-2">
                  {overdue.map((m: any) => (
                    <Card key={m.id} className="p-3 bg-destructive/5 border-destructive/20" data-testid={`card-maintenance-${m.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-tech uppercase text-sm">{m.taskName}</span>
                            <Badge variant={priorityColor(m.priority)} className="text-[10px]">{m.priority}</Badge>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                            {m.intervalMiles && <span>Every {parseInt(m.intervalMiles).toLocaleString()} mi</span>}
                            {m.intervalMonths && <span>Every {m.intervalMonths} mo</span>}
                            {m.nextDueDate && <span>Due: {new Date(m.nextDueDate).toLocaleDateString()}</span>}
                            {m.estimatedCost && <span>${parseFloat(m.estimatedCost).toFixed(0)}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => { setCompletingId(m.id); setCompleteDialogOpen(true); }} data-testid={`button-complete-${m.id}`}>
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-maintenance-${m.id}`}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-tech text-primary mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Upcoming</p>
                <div className="space-y-2">
                  {upcoming.map((m: any) => (
                    <Card key={m.id} className="p-3 bg-card/50" data-testid={`card-maintenance-${m.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-tech uppercase text-sm">{m.taskName}</span>
                            <Badge variant={priorityColor(m.priority)} className="text-[10px]">{m.priority}</Badge>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                            {m.intervalMiles && <span>Every {parseInt(m.intervalMiles).toLocaleString()} mi</span>}
                            {m.intervalMonths && <span>Every {m.intervalMonths} mo</span>}
                            {m.nextDueDate && <span>Due: {new Date(m.nextDueDate).toLocaleDateString()}</span>}
                            {m.nextDueMileage && <span>@ {parseInt(m.nextDueMileage).toLocaleString()} mi</span>}
                            {m.estimatedCost && <span>${parseFloat(m.estimatedCost).toFixed(0)}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => { setCompletingId(m.id); setCompleteDialogOpen(true); }} data-testid={`button-complete-${m.id}`}>
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-maintenance-${m.id}`}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-tech text-green-400 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</p>
                <div className="space-y-2">
                  {completed.map((m: any) => (
                    <Card key={m.id} className="p-3 bg-card/50 opacity-60" data-testid={`card-maintenance-${m.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-tech uppercase text-sm line-through">{m.taskName}</span>
                          {m.completedAt && <p className="text-[10px] text-muted-foreground font-mono">Done: {new Date(m.completedAt).toLocaleDateString()}</p>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-maintenance-${m.id}`}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function PriceWatch({ vehicleId, userId }: { vehicleId: string; userId: string }) {
  const { data: alerts = [], isLoading } = useQuery<any[]>({
    queryKey: ["price-alerts", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/price-alerts`, { credentials: "include" });
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((a: any) => a.vehicleId === vehicleId || !a.vehicleId);
    },
    enabled: !!vehicleId,
  });

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["price-history", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/price-history`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vehicleId,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="font-tech uppercase text-sm">Price Watch</h3>

      {alerts.length === 0 && history.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <TrendingDown className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h4 className="font-tech uppercase text-muted-foreground">No Price Alerts Set</h4>
          <p className="text-xs text-muted-foreground mt-1">Set price alerts from the search results page</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {alerts.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-tech text-primary mb-2">Active Alerts</p>
                <div className="space-y-2">
                  {alerts.map((a: any) => {
                    const current = parseFloat(a.currentPrice || 0);
                    const target = parseFloat(a.targetPrice || 0);
                    const pct = target > 0 ? ((current - target) / target * 100).toFixed(0) : "—";
                    return (
                      <Card key={a.id} className="p-3 bg-card/50" data-testid={`card-price-alert-${a.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-tech">{a.productName || a.partName || "Part"}</p>
                            <div className="flex gap-3 text-xs font-mono mt-1">
                              <span>Current: <span className="text-primary">${current.toFixed(2)}</span></span>
                              <span>Target: <span className="text-green-400">${target.toFixed(2)}</span></span>
                            </div>
                          </div>
                          <Badge variant={current <= target ? "default" : "outline"} className="text-[10px] font-mono">
                            {current <= target ? "Target Hit!" : `${pct}% away`}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-tech text-muted-foreground mb-2">Recent Price History</p>
                <div className="space-y-2">
                  {history.slice(0, 20).map((h: any, i: number) => {
                    const prev = history[i + 1];
                    const change = prev ? parseFloat(h.price) - parseFloat(prev.price) : 0;
                    return (
                      <Card key={h.id || i} className="p-2 bg-card/50" data-testid={`card-price-history-${h.id || i}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {change < 0 ? (
                              <ArrowDown className="w-3 h-3 text-green-400" />
                            ) : change > 0 ? (
                              <ArrowUp className="w-3 h-3 text-red-400" />
                            ) : null}
                            <span className="text-xs">{h.productName || "Part"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold">${parseFloat(h.price).toFixed(2)}</span>
                            {change !== 0 && (
                              <span className={`text-[10px] font-mono ${change < 0 ? "text-green-400" : "text-red-400"}`}>
                                {change > 0 ? "+" : ""}{change.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

const CONTACT_TYPES = ["Roadside Assistance", "Insurance", "Tow Service", "Mechanic", "Emergency Contact", "Other"];

export function EmergencyInfo({ vehicleId, vehicleVin, vehicleOilType, vehicleTireSize }: { vehicleId: string; vehicleVin: string; vehicleOilType: string; vehicleTireSize: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId,
    contactType: "",
    name: "",
    phone: "",
    policyNumber: "",
    membershipId: "",
    notes: "",
  });

  const { data = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["emergency-contacts", vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/emergency-contacts`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vehicleId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setDialogOpen(false);
      setForm({ vehicleId, contactType: "", name: "", phone: "", policyNumber: "", membershipId: "", notes: "" });
      toast({ title: "Contact Added", description: "Emergency contact saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add contact", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/emergency-contacts/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Removed", description: "Contact deleted" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-tech uppercase text-sm">Emergency Info</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-tech" data-testid="button-add-emergency">
              <Plus className="w-3 h-3 mr-1" /> Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-tech uppercase">Add Emergency Contact</DialogTitle>
              <DialogDescription>Save important contacts for roadside emergencies</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <Label>Contact Type *</Label>
                <Select value={form.contactType} onValueChange={(v) => setForm({ ...form, contactType: v })}>
                  <SelectTrigger data-testid="input-emergency-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact name" data-testid="input-emergency-name" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" data-testid="input-emergency-phone" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Policy Number</Label>
                  <Input value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} placeholder="Policy #" data-testid="input-emergency-policy" />
                </div>
                <div>
                  <Label>Membership ID</Label>
                  <Input value={form.membershipId} onChange={(e) => setForm({ ...form, membershipId: e.target.value })} placeholder="Member ID" data-testid="input-emergency-membership" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional info" data-testid="input-emergency-notes" />
              </div>
              <Button
                className="w-full font-tech uppercase"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.contactType || !form.name || !form.phone || createMutation.isPending}
                data-testid="button-save-emergency"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-3 bg-primary/5 border-primary/20">
        <p className="text-[10px] uppercase font-tech text-primary mb-2">Vehicle Quick Reference</p>
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <span className="text-muted-foreground block text-[10px]">VIN</span>
            <span className="text-xs">{vehicleVin || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Oil Type</span>
            <span>{vehicleOilType || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Tire Size</span>
            <span>{vehicleTireSize || "N/A"}</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <a href="tel:911" className="flex-1">
          <Button variant="destructive" className="w-full text-xs font-tech uppercase" data-testid="button-call-911">
            <Phone className="w-3 h-3 mr-1" /> 911
          </Button>
        </a>
        <a href="tel:1-800-222-4357" className="flex-1">
          <Button variant="outline" className="w-full text-xs font-tech uppercase" data-testid="button-call-roadside">
            <Phone className="w-3 h-3 mr-1" /> Roadside
          </Button>
        </a>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Phone className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h4 className="font-tech uppercase text-muted-foreground">No Emergency Contacts</h4>
          <p className="text-xs text-muted-foreground mt-1">Add emergency contacts for quick access</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {data.map((c: any) => (
              <Card key={c.id} className="p-3 bg-card/50" data-testid={`card-emergency-${c.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">{c.contactType}</Badge>
                      <span className="font-tech text-sm">{c.name}</span>
                    </div>
                    <a href={`tel:${c.phone}`} className="text-xs font-mono text-primary hover:underline" data-testid={`link-call-${c.id}`}>
                      {c.phone}
                    </a>
                    {c.policyNumber && <p className="text-[10px] text-muted-foreground font-mono mt-1">Policy: {c.policyNumber}</p>}
                    {c.membershipId && <p className="text-[10px] text-muted-foreground font-mono">Member: {c.membershipId}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-emergency-${c.id}`}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}