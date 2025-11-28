import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, Car, Plus, 
  ChevronRight, Calendar, Gauge, Bell, Settings, X, Droplet,
  RotateCcw, Zap, Filter, CircleDot, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ServiceInterval {
  type: string;
  name: string;
  icon: any;
  intervalMiles: number;
  intervalMonths: number;
  description: string;
  estimatedCost: string;
  priority: 'critical' | 'important' | 'routine';
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  currentMileage?: number;
  oilType?: string;
}

interface ServiceReminder {
  id: string;
  vehicleId: string;
  serviceType: string;
  dueMileage?: number;
  dueDate?: string;
  isCompleted: boolean;
}

const SERVICE_INTERVALS: ServiceInterval[] = [
  { type: 'oil_change', name: 'Oil Change', icon: Droplet, intervalMiles: 5000, intervalMonths: 6, description: 'Replace engine oil and filter', estimatedCost: '30-80', priority: 'critical' },
  { type: 'tire_rotation', name: 'Tire Rotation', icon: RotateCcw, intervalMiles: 7500, intervalMonths: 6, description: 'Rotate tires for even wear', estimatedCost: '25-50', priority: 'important' },
  { type: 'air_filter', name: 'Air Filter', icon: Filter, intervalMiles: 15000, intervalMonths: 12, description: 'Replace engine air filter', estimatedCost: '15-40', priority: 'routine' },
  { type: 'cabin_filter', name: 'Cabin Air Filter', icon: Filter, intervalMiles: 15000, intervalMonths: 12, description: 'Replace cabin air filter', estimatedCost: '15-35', priority: 'routine' },
  { type: 'brake_inspection', name: 'Brake Inspection', icon: CircleDot, intervalMiles: 20000, intervalMonths: 12, description: 'Inspect brake pads and rotors', estimatedCost: '0-50', priority: 'critical' },
  { type: 'spark_plugs', name: 'Spark Plugs', icon: Zap, intervalMiles: 30000, intervalMonths: 36, description: 'Replace spark plugs', estimatedCost: '50-150', priority: 'important' },
  { type: 'transmission_fluid', name: 'Transmission Fluid', icon: Droplet, intervalMiles: 30000, intervalMonths: 36, description: 'Replace transmission fluid', estimatedCost: '100-200', priority: 'important' },
  { type: 'coolant_flush', name: 'Coolant Flush', icon: RefreshCw, intervalMiles: 30000, intervalMonths: 36, description: 'Flush and replace coolant', estimatedCost: '100-150', priority: 'important' },
  { type: 'timing_belt', name: 'Timing Belt', icon: Settings, intervalMiles: 60000, intervalMonths: 60, description: 'Replace timing belt (if applicable)', estimatedCost: '500-1000', priority: 'critical' },
];

interface MaintenanceTrackerProps {
  vehicle: Vehicle;
  onUpdateMileage?: (mileage: number) => void;
}

export default function MaintenanceTracker({ vehicle, onUpdateMileage }: MaintenanceTrackerProps) {
  const [showMileageDialog, setShowMileageDialog] = useState(false);
  const [newMileage, setNewMileage] = useState(vehicle.currentMileage?.toString() || "");
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery<ServiceReminder[]>({
    queryKey: ['serviceReminders', vehicle.id],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicle.id}/reminders`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateMileageMutation = useMutation({
    mutationFn: async (mileage: number) => {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMileage: mileage }),
      });
      if (!res.ok) throw new Error('Failed to update mileage');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowMileageDialog(false);
      onUpdateMileage?.(parseInt(newMileage));
      toast({ title: "Mileage Updated", description: `Current mileage: ${parseInt(newMileage).toLocaleString()} miles` });
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: { serviceType: string; dueMileage?: number }) => {
      const res = await fetch(`/api/vehicles/${vehicle.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create reminder');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceReminders', vehicle.id] });
      setShowServiceDialog(false);
      setSelectedServiceType("");
      toast({ title: "Reminder Created", description: "Service reminder has been set" });
    },
  });

  const currentMileage = vehicle.currentMileage || 0;

  const getServiceStatus = (service: ServiceInterval) => {
    const lastServiceMileage = 0; // In real app, this would come from service history
    const milesSinceService = currentMileage - lastServiceMileage;
    const percentUsed = (milesSinceService / service.intervalMiles) * 100;
    const milesRemaining = service.intervalMiles - milesSinceService;
    
    let status: 'good' | 'upcoming' | 'due' | 'overdue' = 'good';
    if (percentUsed >= 100) status = 'overdue';
    else if (percentUsed >= 90) status = 'due';
    else if (percentUsed >= 75) status = 'upcoming';

    return { percentUsed: Math.min(percentUsed, 100), milesRemaining, status };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'due': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'upcoming': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'due': return 'bg-orange-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const upcomingServices = SERVICE_INTERVALS
    .map(service => ({ service, ...getServiceStatus(service) }))
    .filter(item => item.status !== 'good')
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { overdue: 0, due: 1, upcoming: 2, good: 3 };
      return (priorityOrder[a.status] ?? 3) - (priorityOrder[b.status] ?? 3);
    });

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Maintenance Tracker</h3>
              <p className="text-xs text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
          {upcomingServices.length > 0 && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {upcomingServices.length} Due
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Current Mileage</p>
              <p className="text-xl font-bold">
                {currentMileage > 0 ? currentMileage.toLocaleString() : '---'} 
                <span className="text-sm font-normal text-muted-foreground ml-1">miles</span>
              </p>
            </div>
          </div>
          <Dialog open={showMileageDialog} onOpenChange={setShowMileageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="font-tech">
                Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-tech uppercase">Update Mileage</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Current Odometer Reading</Label>
                  <Input
                    type="number"
                    placeholder="Enter current mileage"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button 
                  onClick={() => updateMileageMutation.mutate(parseInt(newMileage))}
                  disabled={!newMileage || updateMileageMutation.isPending}
                  className="w-full font-tech"
                >
                  Save Mileage
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {upcomingServices.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-tech uppercase text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" /> Service Alerts
            </h4>
            {upcomingServices.slice(0, 5).map((item) => {
              const IconComponent = item.service.icon;
              return (
                <div
                  key={item.service.type}
                  className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{item.service.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(item.status)}`}>
                      {item.status === 'overdue' ? 'OVERDUE' : 
                       item.status === 'due' ? 'DUE NOW' : 
                       item.status === 'upcoming' ? 'UPCOMING' : 'OK'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Progress 
                      value={item.percentUsed} 
                      className="h-1.5 bg-white/10" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {item.milesRemaining > 0 
                          ? `${item.milesRemaining.toLocaleString()} miles remaining`
                          : `${Math.abs(item.milesRemaining).toLocaleString()} miles overdue`}
                      </span>
                      <span>Est. ${item.service.estimatedCost}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-medium text-green-400">All Services Up to Date</p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentMileage > 0 
                ? "Your vehicle maintenance is current"
                : "Update your mileage to see service recommendations"}
            </p>
          </div>
        )}

        <div className="border-t border-border/40 pt-4">
          <h4 className="text-sm font-tech uppercase text-muted-foreground mb-3">All Services</h4>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_INTERVALS.map((service) => {
              const IconComponent = service.icon;
              const { status } = getServiceStatus(service);
              return (
                <button
                  key={service.type}
                  className={`p-2 rounded-lg border text-left hover:bg-white/5 transition-colors ${
                    status !== 'good' 
                      ? getStatusColor(status) 
                      : 'border-border/40 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium truncate">{service.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Every {service.intervalMiles.toLocaleString()} mi
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full font-tech uppercase gap-2">
              <Plus className="w-4 h-4" /> Log Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-tech uppercase">Log Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Service Type</Label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_INTERVALS.map((service) => (
                      <SelectItem key={service.type} value={service.type}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => createReminderMutation.mutate({ 
                  serviceType: selectedServiceType,
                  dueMileage: currentMileage + (SERVICE_INTERVALS.find(s => s.type === selectedServiceType)?.intervalMiles || 5000)
                })}
                disabled={!selectedServiceType || createReminderMutation.isPending}
                className="w-full font-tech"
              >
                Log Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
