import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Car, Trash2, Settings, AlertTriangle, CheckCircle, 
  RefreshCw, FileText, Wrench, Star, Shield, Search, 
  Calendar, DollarSign, MapPin, ChevronRight, Loader2, Brain
} from "lucide-react";
import SmartRecommendations from "@/components/SmartRecommendations";
import { BlockchainStatus } from "@/components/BlockchainStatus";

interface Vehicle {
  id: string;
  userId: string;
  year: string;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
  licensePlate?: string;
  oilType?: string;
  tireSize?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt: string;
}

interface VinDecodeResult {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim?: string;
  bodyClass?: string;
  engineCylinders?: string;
  engineDisplacement?: string;
  engineHP?: string;
  fuelType?: string;
  transmission?: string;
  vehicleType?: string;
  manufacturerName?: string;
  errorCode?: string;
  errorText?: string;
}

interface Recall {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  manufacturer: string;
  reportReceivedDate: string;
}

interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  description?: string;
  mileage?: number;
  cost?: string;
  shopName?: string;
  serviceDate: string;
  createdAt: string;
}

export default function Garage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vinInput, setVinInput] = useState("");
  const [decodedVin, setDecodedVin] = useState<VinDecodeResult | null>(null);
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ year: "", make: "", model: "", trim: "", vin: "", oilType: "", tireSize: "", notes: "" });
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [newService, setNewService] = useState({ serviceType: "", description: "", mileage: "", cost: "", shopName: "", serviceDate: new Date().toISOString().split('T')[0] });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: !!user,
  });

  const { data: recalls = [], isLoading: recallsLoading, refetch: refetchRecalls } = useQuery<Recall[]>({
    queryKey: ["/api/recalls", selectedVehicle?.year, selectedVehicle?.make, selectedVehicle?.model],
    queryFn: async () => {
      if (!selectedVehicle?.year || !selectedVehicle?.make || !selectedVehicle?.model) return [];
      const res = await fetch(`/api/recalls/${selectedVehicle.year}/${encodeURIComponent(selectedVehicle.make)}/${encodeURIComponent(selectedVehicle.model)}`);
      const data = await res.json();
      return data.recalls || [];
    },
    enabled: !!selectedVehicle,
  });

  const { data: serviceRecords = [], isLoading: servicesLoading, refetch: refetchServices } = useQuery<ServiceRecord[]>({
    queryKey: ["/api/vehicles", selectedVehicle?.id, "service-records"],
    queryFn: async () => {
      if (!selectedVehicle?.id) return [];
      const res = await fetch(`/api/vehicles/${selectedVehicle.id}/service-records`);
      return await res.json();
    },
    enabled: !!selectedVehicle,
  });

  const decodeVin = async (vin: string) => {
    if (vin.length !== 17) {
      toast({ title: "Invalid VIN", description: "VIN must be exactly 17 characters", variant: "destructive" });
      return;
    }
    setIsDecodingVin(true);
    try {
      const res = await fetch(`/api/vin/decode/${vin}`);
      const data = await res.json();
      setDecodedVin(data);
      if (data.year && data.make && data.model) {
        setNewVehicle(prev => ({
          ...prev,
          year: data.year,
          make: data.make,
          model: data.model,
          trim: data.trim || "",
          vin: vin.toUpperCase()
        }));
        toast({ title: "VIN Decoded", description: `Found: ${data.year} ${data.make} ${data.model}` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to decode VIN", variant: "destructive" });
    } finally {
      setIsDecodingVin(false);
    }
  };

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicle: typeof newVehicle) => {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicle)
      });
      if (!res.ok) throw new Error("Failed to add vehicle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setAddVehicleOpen(false);
      setNewVehicle({ year: "", make: "", model: "", trim: "", vin: "", oilType: "", tireSize: "", notes: "" });
      setDecodedVin(null);
      setVinInput("");
      toast({ title: "Vehicle Added", description: "Your vehicle has been added to the garage" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add vehicle", variant: "destructive" });
    }
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setSelectedVehicle(null);
      toast({ title: "Vehicle Removed", description: "Vehicle has been removed from your garage" });
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vehicles/${id}/set-primary`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to set primary");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Primary Vehicle Set", description: "This vehicle is now your primary" });
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (service: typeof newService) => {
      if (!selectedVehicle) return;
      const res = await fetch(`/api/vehicles/${selectedVehicle.id}/service-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          mileage: service.mileage ? parseInt(service.mileage) : null,
          cost: service.cost || null
        })
      });
      if (!res.ok) throw new Error("Failed to add service");
      return res.json();
    },
    onSuccess: () => {
      refetchServices();
      setAddServiceOpen(false);
      setNewService({ serviceType: "", description: "", mileage: "", cost: "", shopName: "", serviceDate: new Date().toISOString().split('T')[0] });
      toast({ title: "Service Logged", description: "Service record has been added" });
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="container mx-auto px-4 pt-24 text-center">
          <Car className="w-24 h-24 mx-auto mb-6 text-primary/30" />
          <h1 className="text-3xl font-tech font-bold uppercase text-primary mb-4">Sign In to Access Your Garage</h1>
          <p className="text-muted-foreground mb-8">Keep track of your vehicles, maintenance history, and open recalls</p>
          <Button size="lg" className="font-tech uppercase" onClick={() => window.location.href = "/api/login"} data-testid="button-login">
            Sign In with Replit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
          <div className="md:col-span-8">
            <Card className="bg-card/50 border-primary/20 p-4 h-full">
              <h1 className="text-2xl font-tech font-bold uppercase text-primary" data-testid="text-page-title">My Garage</h1>
              <p className="text-muted-foreground text-xs font-mono">VEHICLE PASSPORT • RECALLS • SERVICE</p>
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card className="bg-card/50 border-primary/20 p-4 h-full flex items-center justify-center">
              <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 font-tech uppercase text-xs glow-primary" data-testid="button-add-vehicle">
                    <Plus className="w-3 h-3" /> Add Vehicle
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-tech text-xl uppercase">Add Vehicle to Garage</DialogTitle>
                <DialogDescription>Scan your VIN to auto-fill vehicle details or enter manually</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <Label className="text-primary font-tech text-sm uppercase mb-2 block">Quick VIN Decode</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter 17-character VIN" 
                      value={vinInput}
                      onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                      maxLength={17}
                      className="font-mono text-lg tracking-wider"
                      data-testid="input-vin"
                    />
                    <Button 
                      onClick={() => decodeVin(vinInput)} 
                      disabled={isDecodingVin || vinInput.length !== 17}
                      className="font-tech"
                      data-testid="button-decode-vin"
                    >
                      {isDecodingVin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {decodedVin && decodedVin.year && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded text-sm"
                    >
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-tech uppercase">VIN Decoded Successfully</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <span>Year: {decodedVin.year}</span>
                        <span>Make: {decodedVin.make}</span>
                        <span>Model: {decodedVin.model}</span>
                        {decodedVin.trim && <span>Trim: {decodedVin.trim}</span>}
                        {decodedVin.engineCylinders && <span>Engine: {decodedVin.engineCylinders}cyl {decodedVin.engineDisplacement}L</span>}
                        {decodedVin.fuelType && <span>Fuel: {decodedVin.fuelType}</span>}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Year *</Label>
                    <Input value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} placeholder="2024" data-testid="input-year" />
                  </div>
                  <div>
                    <Label>Make *</Label>
                    <Input value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Toyota" data-testid="input-make" />
                  </div>
                  <div>
                    <Label>Model *</Label>
                    <Input value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Tacoma" data-testid="input-model" />
                  </div>
                  <div>
                    <Label>Trim</Label>
                    <Input value={newVehicle.trim} onChange={(e) => setNewVehicle({ ...newVehicle, trim: e.target.value })} placeholder="TRD Off-Road" data-testid="input-trim" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Oil Type</Label>
                    <Input value={newVehicle.oilType} onChange={(e) => setNewVehicle({ ...newVehicle, oilType: e.target.value })} placeholder="0W-20 Synthetic" data-testid="input-oil" />
                  </div>
                  <div>
                    <Label>Tire Size</Label>
                    <Input value={newVehicle.tireSize} onChange={(e) => setNewVehicle({ ...newVehicle, tireSize: e.target.value })} placeholder="265/70R16" data-testid="input-tire" />
                  </div>
                </div>

                <div>
                  <Label>VIN</Label>
                  <Input value={newVehicle.vin} onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })} placeholder="1HGCG5659WA047657" className="font-mono" data-testid="input-vin-manual" />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea value={newVehicle.notes} onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })} placeholder="Optional notes about this vehicle..." data-testid="input-notes" />
                </div>

                <Button 
                  className="w-full font-tech uppercase"
                  onClick={() => createVehicleMutation.mutate(newVehicle)}
                  disabled={!newVehicle.year || !newVehicle.make || !newVehicle.model || createVehicleMutation.isPending}
                  data-testid="button-save-vehicle"
                >
                  {createVehicleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add to Garage
                </Button>
              </div>
            </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>

        {vehiclesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="bg-card/50 border-dashed border-2 border-muted p-12 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-tech uppercase text-muted-foreground mb-2">No Vehicles Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Add your first vehicle to track maintenance and check for recalls</p>
            <Button onClick={() => setAddVehicleOpen(true)} className="font-tech uppercase" data-testid="button-add-first-vehicle">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Vehicle
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-tech uppercase text-sm text-muted-foreground mb-2">Your Fleet ({vehicles.length})</h2>
              <AnimatePresence>
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${selectedVehicle?.id === vehicle.id ? 'border-primary bg-primary/5' : 'bg-card'}`}
                      onClick={() => setSelectedVehicle(vehicle)}
                      data-testid={`card-vehicle-${vehicle.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${vehicle.isPrimary ? 'bg-primary/20' : 'bg-muted'}`}>
                            <Car className={`w-5 h-5 ${vehicle.isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h3 className="font-tech font-bold uppercase">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                            {vehicle.trim && <p className="text-xs text-muted-foreground font-mono">{vehicle.trim}</p>}
                          </div>
                        </div>
                        {vehicle.isPrimary && (
                          <Badge variant="outline" className="text-xs border-primary text-primary">
                            <Star className="w-3 h-3 mr-1" /> Primary
                          </Badge>
                        )}
                      </div>
                      {vehicle.vin && (
                        <p className="text-xs font-mono text-muted-foreground mt-2">VIN: ***{vehicle.vin.slice(-4)}</p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-2">
              {selectedVehicle ? (
                <motion.div
                  key={selectedVehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card border-primary/30 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-transparent flex items-end p-6">
                      <div className="flex-1">
                        <h2 className="text-3xl font-tech font-bold uppercase">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h2>
                        {selectedVehicle.trim && <p className="text-muted-foreground font-mono">{selectedVehicle.trim}</p>}
                      </div>
                      <div className="flex gap-2">
                        {!selectedVehicle.isPrimary && (
                          <Button variant="outline" size="sm" onClick={() => setPrimaryMutation.mutate(selectedVehicle.id)} data-testid="button-set-primary">
                            <Star className="w-4 h-4 mr-1" /> Set Primary
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => deleteVehicleMutation.mutate(selectedVehicle.id)} data-testid="button-delete-vehicle">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="passport" className="p-6">
                      <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="passport" className="font-tech uppercase text-xs" data-testid="tab-passport">
                          <Shield className="w-4 h-4 mr-1" /> Passport
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="font-tech uppercase text-xs" data-testid="tab-ai">
                          <Brain className="w-4 h-4 mr-1" /> AI Insights
                        </TabsTrigger>
                        <TabsTrigger value="recalls" className="font-tech uppercase text-xs" data-testid="tab-recalls">
                          <AlertTriangle className="w-4 h-4 mr-1" /> Recalls
                          {recalls.length > 0 && <Badge variant="destructive" className="ml-1 text-xs">{recalls.length}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="service" className="font-tech uppercase text-xs" data-testid="tab-service">
                          <Wrench className="w-4 h-4 mr-1" /> Service
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="passport" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-lg p-4">
                            <Label className="text-xs text-muted-foreground uppercase">VIN</Label>
                            <p className="font-mono text-sm">{selectedVehicle.vin || 'Not provided'}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <Label className="text-xs text-muted-foreground uppercase">Oil Type</Label>
                            <p className="font-mono text-sm">{selectedVehicle.oilType || 'Not specified'}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <Label className="text-xs text-muted-foreground uppercase">Tire Size</Label>
                            <p className="font-mono text-sm">{selectedVehicle.tireSize || 'Not specified'}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <Label className="text-xs text-muted-foreground uppercase">Added</Label>
                            <p className="font-mono text-sm">{new Date(selectedVehicle.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {selectedVehicle.notes && (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <Label className="text-xs text-muted-foreground uppercase">Notes</Label>
                            <p className="text-sm mt-1">{selectedVehicle.notes}</p>
                          </div>
                        )}
                        
                        <BlockchainStatus 
                          entityType="vehicle" 
                          entityId={selectedVehicle.id}
                          showVerifyButton={true}
                        />
                        
                        <Button className="w-full font-tech uppercase" onClick={() => window.location.href = `/results?year=${selectedVehicle.year}&make=${selectedVehicle.make}&model=${selectedVehicle.model}`} data-testid="button-shop-parts">
                          <Search className="w-4 h-4 mr-2" /> Shop Parts for This Vehicle
                        </Button>
                      </TabsContent>

                      <TabsContent value="ai" className="space-y-4">
                        <SmartRecommendations 
                          vehicleId={selectedVehicle.id}
                          vehicleYear={selectedVehicle.year}
                          vehicleMake={selectedVehicle.make}
                          vehicleModel={selectedVehicle.model}
                        />
                      </TabsContent>

                      <TabsContent value="recalls">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Open Recalls</h3>
                          <Button variant="outline" size="sm" onClick={() => refetchRecalls()} className="text-xs" data-testid="button-refresh-recalls">
                            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                          </Button>
                        </div>
                        {recallsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : recalls.length === 0 ? (
                          <div className="text-center py-8 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                            <h4 className="font-tech uppercase text-green-400">No Open Recalls</h4>
                            <p className="text-sm text-muted-foreground mt-1">This vehicle has no outstanding recalls from NHTSA</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-4">
                              {recalls.map((recall, index) => (
                                <Card key={index} className="p-4 bg-destructive/5 border-destructive/20" data-testid={`card-recall-${index}`}>
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="destructive" className="text-xs">{recall.campaignNumber}</Badge>
                                        <span className="text-xs text-muted-foreground">{recall.reportReceivedDate}</span>
                                      </div>
                                      <h4 className="font-bold text-sm mb-2">{recall.component}</h4>
                                      <p className="text-xs text-muted-foreground mb-2">{recall.summary}</p>
                                      <div className="bg-muted/50 rounded p-2 text-xs">
                                        <strong>Remedy:</strong> {recall.remedy}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </TabsContent>

                      <TabsContent value="service">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Service History</h3>
                          <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="text-xs font-tech" data-testid="button-add-service">
                                <Plus className="w-3 h-3 mr-1" /> Log Service
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">Log Service Record</DialogTitle>
                                <DialogDescription>Track maintenance for your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Service Type *</Label>
                                  <Input 
                                    value={newService.serviceType} 
                                    onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })}
                                    placeholder="Oil Change, Brake Pads, etc."
                                    data-testid="input-service-type"
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea 
                                    value={newService.description} 
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    placeholder="Details about the service..."
                                    data-testid="input-service-description"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Mileage</Label>
                                    <Input 
                                      type="number"
                                      value={newService.mileage} 
                                      onChange={(e) => setNewService({ ...newService, mileage: e.target.value })}
                                      placeholder="Current mileage"
                                      data-testid="input-service-mileage"
                                    />
                                  </div>
                                  <div>
                                    <Label>Cost</Label>
                                    <Input 
                                      value={newService.cost} 
                                      onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                                      placeholder="$0.00"
                                      data-testid="input-service-cost"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Shop/Location</Label>
                                    <Input 
                                      value={newService.shopName} 
                                      onChange={(e) => setNewService({ ...newService, shopName: e.target.value })}
                                      placeholder="Where serviced"
                                      data-testid="input-service-shop"
                                    />
                                  </div>
                                  <div>
                                    <Label>Date</Label>
                                    <Input 
                                      type="date"
                                      value={newService.serviceDate} 
                                      onChange={(e) => setNewService({ ...newService, serviceDate: e.target.value })}
                                      data-testid="input-service-date"
                                    />
                                  </div>
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => createServiceMutation.mutate(newService)}
                                  disabled={!newService.serviceType || createServiceMutation.isPending}
                                  data-testid="button-save-service"
                                >
                                  {createServiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Save Service Record
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        {servicesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : serviceRecords.length === 0 ? (
                          <div className="text-center py-8 bg-muted/30 border border-dashed rounded-lg">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            <h4 className="font-tech uppercase text-muted-foreground">No Service Records</h4>
                            <p className="text-sm text-muted-foreground mt-1">Start logging maintenance to build your vehicle history</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {serviceRecords.map((record) => (
                                <Card key={record.id} className="p-4 bg-muted/30" data-testid={`card-service-${record.id}`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded bg-primary/10">
                                        <Wrench className="w-4 h-4 text-primary" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-sm">{record.serviceType}</h4>
                                        {record.description && <p className="text-xs text-muted-foreground mt-1">{record.description}</p>}
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(record.serviceDate).toLocaleDateString()}
                                          </span>
                                          {record.mileage && (
                                            <span className="flex items-center gap-1">
                                              <Settings className="w-3 h-3" /> {record.mileage.toLocaleString()} mi
                                            </span>
                                          )}
                                          {record.shopName && (
                                            <span className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3" /> {record.shopName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {record.cost && (
                                      <Badge variant="outline" className="text-xs">
                                        <DollarSign className="w-3 h-3" />{record.cost}
                                      </Badge>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </TabsContent>
                    </Tabs>
                  </Card>
                </motion.div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <ChevronRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30 rotate-180" />
                    <h3 className="font-tech uppercase text-muted-foreground">Select a Vehicle</h3>
                    <p className="text-sm text-muted-foreground mt-1">Click a vehicle to view its passport</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
