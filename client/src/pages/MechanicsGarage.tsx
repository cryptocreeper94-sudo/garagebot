import { useState, useEffect } from "react";
import { Link } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Store, Users, MessageSquare, Settings, Star, MapPin, Phone, 
  Mail, Clock, Wrench, Send, ChevronRight, Loader2, Building2,
  UserPlus, Calendar, DollarSign, AlertCircle, CheckCircle, Eye,
  ClipboardList, FileText, Timer, Package, BarChart3, Camera,
  Car, Ship, Bike, Truck, Cog, Anchor, Zap, Tractor, Mountain,
  Play, Pause, Receipt, CreditCard, Search, Filter, ArrowUpDown,
  ChevronDown, MoreHorizontal, Edit, Trash2, ExternalLink, 
  CalendarDays, UserCheck, AlertTriangle, CircleDot, X, Link2,
  RefreshCw, ArrowRight, Sparkles, Database, Shield, Globe, Key, Copy, Activity
} from "lucide-react";

const VEHICLE_TYPES = [
  { id: "car", name: "Cars", icon: Car },
  { id: "truck", name: "Trucks", icon: Truck },
  { id: "motorcycle", name: "Motorcycles", icon: Bike },
  { id: "atv", name: "ATVs/UTVs", icon: Mountain },
  { id: "boat", name: "Boats/Marine", icon: Anchor },
  { id: "rv", name: "RVs", icon: Truck },
  { id: "diesel", name: "Diesel/Commercial", icon: Truck },
  { id: "small_engine", name: "Small Engines", icon: Cog },
  { id: "generator", name: "Generators", icon: Zap },
  { id: "tractor", name: "Tractors/Farm", icon: Tractor },
  { id: "classic", name: "Classics", icon: Car },
  { id: "exotic", name: "Exotics", icon: Car },
];

const ORDER_STATUSES = [
  { id: "pending", name: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { id: "checked_in", name: "Checked In", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "in_progress", name: "In Progress", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "waiting_parts", name: "Waiting Parts", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: "waiting_approval", name: "Waiting Approval", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { id: "completed", name: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { id: "picked_up", name: "Picked Up", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: string;
  reviewCount?: number;
  isActive: boolean;
  vehicleTypes?: string[];
  createdAt: string;
}

interface RepairOrder {
  id: string;
  shopId: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  vehicleInfo?: string;
  vehicleType?: string;
  status: string;
  priority?: string;
  grandTotal?: string;
  paymentStatus?: string;
  promisedDate?: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  shopId: string;
  customerName?: string;
  customerPhone?: string;
  vehicleInfo?: string;
  serviceType?: string;
  scheduledStart: string;
  status: string;
}

interface Estimate {
  id: string;
  shopId: string;
  estimateNumber: string;
  customerName?: string;
  vehicleInfo?: string;
  grandTotal?: string;
  status: string;
  createdAt: string;
}

interface ApiCredential {
  id: string;
  shopId: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  environment: string;
  scopes: string[];
  rateLimitPerDay: number;
  requestCount: number;
  requestCountDaily: number;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiLogStats {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  avgResponseTime: number;
}

const API_SCOPES = [
  { id: 'orders:read', name: 'Read Orders', description: 'View repair orders and their status' },
  { id: 'orders:write', name: 'Write Orders', description: 'Create and update repair orders' },
  { id: 'customers:read', name: 'Read Customers', description: 'View customer information' },
  { id: 'customers:write', name: 'Write Customers', description: 'Create and update customers' },
  { id: 'appointments:read', name: 'Read Appointments', description: 'View scheduled appointments' },
  { id: 'appointments:write', name: 'Write Appointments', description: 'Create and update appointments' },
  { id: 'estimates:read', name: 'Read Estimates', description: 'View estimates and quotes' },
  { id: 'estimates:write', name: 'Write Estimates', description: 'Create and update estimates' },
  { id: 'analytics:read', name: 'Read Analytics', description: 'View shop analytics and reports' },
  { id: 'shop:read', name: 'Read Shop', description: 'View shop profile and locations' },
  { id: 'shop:write', name: 'Write Shop', description: 'Update shop profile' },
  { id: 'staff:read', name: 'Read Staff', description: 'View team members' },
  { id: 'staff:write', name: 'Write Staff', description: 'Manage team members' },
];

function PartnerApiTab({ shopId, toast }: { shopId: string; toast: any }) {
  const queryClient = useQueryClient();
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [newCredential, setNewCredential] = useState<ApiCredential | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    environment: 'production',
    scopes: ['orders:read'] as string[],
    rateLimitPerDay: 10000
  });

  const { data: credentials, isLoading } = useQuery<ApiCredential[]>({
    queryKey: ['partner-api-credentials', shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch credentials');
      return res.json();
    }
  });

  const { data: logsData } = useQuery<{ logs: any[]; stats: ApiLogStats }>({
    queryKey: ['partner-api-logs', shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/api-logs?limit=20`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newKeyForm) => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create credential');
      return res.json();
    },
    onSuccess: (data) => {
      setNewCredential(data);
      setCreateKeyOpen(false);
      queryClient.invalidateQueries({ queryKey: ['partner-api-credentials', shopId] });
      toast({ title: 'API Key Created', description: 'Save your credentials securely!' });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error('Failed to update credential');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-api-credentials', shopId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete credential');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-api-credentials', shopId] });
      toast({ title: 'API Key Deleted' });
    }
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleScope = (scope: string) => {
    setNewKeyForm(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-teal-500/20 border-green-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Key className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-tech font-bold uppercase">Partner API</h3>
              <p className="text-muted-foreground">Programmatic access to your shop data</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>RESTful JSON API</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Scoped permissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-purple-500" />
              <span>Usage analytics</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {logsData?.stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground mb-1">Total Requests (30d)</div>
            <div className="text-2xl font-tech font-bold">{logsData.stats.totalRequests.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
            <div className="text-2xl font-tech font-bold text-green-500">
              {logsData.stats.totalRequests > 0 
                ? Math.round((logsData.stats.successRequests / logsData.stats.totalRequests) * 100)
                : 100}%
            </div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground mb-1">Errors (30d)</div>
            <div className="text-2xl font-tech font-bold text-red-500">{logsData.stats.errorRequests}</div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground mb-1">Avg Response</div>
            <div className="text-2xl font-tech font-bold">{logsData.stats.avgResponseTime}ms</div>
          </Card>
        </div>
      )}

      {/* New Credential Modal */}
      {newCredential && (
        <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-tech font-bold text-lg">Save Your Credentials</h4>
              <p className="text-sm text-muted-foreground">The API secret will only be shown once. Save it securely now!</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase">API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 rounded bg-black/30 font-mono text-sm break-all">{newCredential.apiKey}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(newCredential.apiKey, 'key')} data-testid="copy-api-key">
                  {copiedField === 'key' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase">API Secret</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 rounded bg-black/30 font-mono text-sm break-all">{newCredential.apiSecret}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(newCredential.apiSecret, 'secret')} data-testid="copy-api-secret">
                  {copiedField === 'secret' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={() => setNewCredential(null)} className="mt-4" data-testid="dismiss-credentials">
              I've Saved My Credentials
            </Button>
          </div>
        </Card>
      )}

      {/* API Keys */}
      <Card className="p-6 bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-tech font-bold text-lg uppercase">API Keys</h4>
          <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="create-api-key">
                <Plus className="w-4 h-4" /> Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>Generate a new API key with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={newKeyForm.name} 
                    onChange={e => setNewKeyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Production Integration"
                    data-testid="api-key-name"
                  />
                </div>
                <div>
                  <Label>Environment</Label>
                  <Select 
                    value={newKeyForm.environment} 
                    onValueChange={v => setNewKeyForm(prev => ({ ...prev, environment: v }))}
                  >
                    <SelectTrigger data-testid="api-key-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-3 block">Permissions (Scopes)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {API_SCOPES.map(scope => (
                      <div 
                        key={scope.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          newKeyForm.scopes.includes(scope.id)
                            ? 'bg-primary/10 border-primary/50'
                            : 'bg-card/50 border-border hover:border-primary/30'
                        }`}
                        onClick={() => toggleScope(scope.id)}
                        data-testid={`scope-${scope.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={newKeyForm.scopes.includes(scope.id)} 
                            onCheckedChange={() => toggleScope(scope.id)}
                          />
                          <div>
                            <div className="font-medium text-sm">{scope.name}</div>
                            <div className="text-xs text-muted-foreground">{scope.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Daily Rate Limit</Label>
                  <Input 
                    type="number"
                    value={newKeyForm.rateLimitPerDay} 
                    onChange={e => setNewKeyForm(prev => ({ ...prev, rateLimitPerDay: parseInt(e.target.value) || 10000 }))}
                    data-testid="api-key-rate-limit"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createMutation.mutate(newKeyForm)}
                  disabled={!newKeyForm.name || newKeyForm.scopes.length === 0 || createMutation.isPending}
                  data-testid="submit-create-api-key"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                  Generate API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : credentials?.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials?.map(cred => (
              <Card key={cred.id} className={`p-4 ${cred.isActive ? 'bg-card/50' : 'bg-card/20 opacity-60'}`} data-testid={`api-credential-${cred.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cred.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      <Key className={`w-5 h-5 ${cred.isActive ? 'text-green-500' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {cred.name}
                        <Badge variant="outline" className={cred.environment === 'sandbox' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}>
                          {cred.environment}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{cred.apiKey.slice(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm">{cred.requestCountDaily?.toLocaleString() || 0} / {cred.rateLimitPerDay?.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">requests today</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={cred.isActive ? 'destructive' : 'default'}
                        onClick={() => toggleMutation.mutate({ id: cred.id, isActive: !cred.isActive })}
                        data-testid={`toggle-${cred.id}`}
                      >
                        {cred.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(cred.id)}
                        data-testid={`delete-${cred.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {cred.scopes?.map(scope => (
                    <Badge key={scope} variant="outline" className="text-[10px] bg-primary/5">{scope}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* API Documentation Link */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/5 to-transparent border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-tech font-bold text-lg mb-2">API Documentation</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Access your shop data programmatically. Base URL: <code className="bg-black/30 px-2 py-1 rounded text-primary">/api/partner/v1</code>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-card/50 border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/shop</div>
              </div>
              <div className="p-3 rounded bg-card/50 border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/orders</div>
              </div>
              <div className="p-3 rounded bg-card/50 border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/appointments</div>
              </div>
              <div className="p-3 rounded bg-card/50 border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/analytics</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function MechanicsGarage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createShopOpen, setCreateShopOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [createAppointmentOpen, setCreateAppointmentOpen] = useState(false);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  
  const [newShop, setNewShop] = useState({ 
    name: "", 
    description: "", 
    address: "", 
    city: "", 
    state: "", 
    zipCode: "", 
    phone: "", 
    email: "",
    vehicleTypes: [] as string[]
  });

  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    vehicleInfo: "",
    vehicleType: "car",
    notes: "",
    priority: "normal"
  });

  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    customerPhone: "",
    vehicleInfo: "",
    serviceType: "",
    scheduledStart: "",
    notes: ""
  });

  const { data: myShops = [], isLoading: shopsLoading } = useQuery<Shop[]>({
    queryKey: ["/api/my-shops"],
    enabled: !!user,
  });

  const { data: repairOrders = [], isLoading: ordersLoading } = useQuery<RepairOrder[]>({
    queryKey: ["/api/shops", selectedShop?.id, "repair-orders"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/repair-orders`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/shops", selectedShop?.id, "appointments"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/appointments`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/shops", selectedShop?.id, "estimates"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/estimates`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const createShopMutation = useMutation({
    mutationFn: async (shop: typeof newShop) => {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...shop, vehicleTypes: selectedVehicleTypes })
      });
      if (!res.ok) throw new Error("Failed to create shop");
      return res.json();
    },
    onSuccess: (shop) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-shops"] });
      setCreateShopOpen(false);
      setNewShop({ name: "", description: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "", vehicleTypes: [] });
      setSelectedVehicleTypes([]);
      setSelectedShop(shop);
      toast({ title: "Shop Created", description: `${shop.name} is now registered` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create shop", variant: "destructive" });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (order: typeof newOrder) => {
      if (!selectedShop) throw new Error("No shop selected");
      const res = await fetch(`/api/shops/${selectedShop.id}/repair-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (!res.ok) throw new Error("Failed to create order");
      return res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shops", selectedShop?.id, "repair-orders"] });
      setCreateOrderOpen(false);
      setNewOrder({ customerName: "", customerPhone: "", customerEmail: "", vehicleInfo: "", vehicleType: "car", notes: "", priority: "normal" });
      toast({ title: "Repair Order Created", description: `Order #${order.orderNumber} created` });
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (apt: typeof newAppointment) => {
      if (!selectedShop) throw new Error("No shop selected");
      const res = await fetch(`/api/shops/${selectedShop.id}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apt)
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shops", selectedShop?.id, "appointments"] });
      setCreateAppointmentOpen(false);
      setNewAppointment({ customerName: "", customerPhone: "", vehicleInfo: "", serviceType: "", scheduledStart: "", notes: "" });
      toast({ title: "Appointment Scheduled" });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
    return (
      <Badge variant="outline" className={`${statusConfig.color} text-xs font-mono`}>
        {statusConfig.name}
      </Badge>
    );
  };

  const getVehicleIcon = (type: string) => {
    const vehicleType = VEHICLE_TYPES.find(v => v.id === type);
    const IconComponent = vehicleType?.icon || Car;
    return <IconComponent className="w-4 h-4" />;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="max-w-6xl mx-auto px-4 pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="max-w-6xl mx-auto px-4 pt-24 text-center">
          <Wrench className="w-24 h-24 mx-auto mb-6 text-primary/30" />
          <h1 className="text-3xl font-tech font-bold uppercase text-primary mb-4">Mechanics Garage</h1>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Professional shop management for ALL vehicle types - cars, trucks, boats, ATVs, motorcycles, small engines, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {VEHICLE_TYPES.slice(0, 8).map(vt => (
              <Badge key={vt.id} variant="outline" className="gap-1 text-xs">
                <vt.icon className="w-3 h-3" />
                {vt.name}
              </Badge>
            ))}
          </div>
          <Button size="lg" className="font-tech uppercase" onClick={() => window.location.href = "/api/login"} data-testid="button-login">
            Sign In to Get Started
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
              <h1 className="text-2xl font-tech font-bold uppercase text-primary flex items-center gap-2" data-testid="text-page-title">
                <Wrench className="w-5 h-5" />
                Mechanics Garage
              </h1>
              <p className="text-muted-foreground text-xs font-mono">
                REPAIR ORDERS • ESTIMATES • SCHEDULING
              </p>
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card className="bg-card/50 border-primary/20 p-4 h-full flex items-center justify-center">
              <Dialog open={createShopOpen} onOpenChange={setCreateShopOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 font-tech uppercase text-xs" data-testid="button-register-shop">
                    <Plus className="w-3 h-3" /> Register Shop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-tech text-xl uppercase">Register Your Shop</DialogTitle>
                <DialogDescription>Add your repair shop to Mechanics Garage</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Shop Name *</Label>
                    <Input 
                      value={newShop.name} 
                      onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} 
                      placeholder="Mike's Marine & Auto" 
                      data-testid="input-shop-name" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newShop.description} 
                      onChange={(e) => setNewShop({ ...newShop, description: e.target.value })} 
                      placeholder="Full-service repair for boats, cars, trucks, and small engines..." 
                      data-testid="input-shop-description" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="mb-2 block">Vehicle Types Serviced</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {VEHICLE_TYPES.map(vt => (
                        <div 
                          key={vt.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                            selectedVehicleTypes.includes(vt.id) 
                              ? 'bg-primary/20 border-primary' 
                              : 'bg-muted/30 border-muted hover:border-primary/50'
                          }`}
                          onClick={() => {
                            if (selectedVehicleTypes.includes(vt.id)) {
                              setSelectedVehicleTypes(selectedVehicleTypes.filter(v => v !== vt.id));
                            } else {
                              setSelectedVehicleTypes([...selectedVehicleTypes, vt.id]);
                            }
                          }}
                        >
                          <vt.icon className="w-4 h-4 text-primary" />
                          <span className="text-xs font-mono">{vt.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>Street Address</Label>
                    <Input 
                      value={newShop.address} 
                      onChange={(e) => setNewShop({ ...newShop, address: e.target.value })} 
                      placeholder="123 Main Street" 
                      data-testid="input-shop-address" 
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input 
                      value={newShop.city} 
                      onChange={(e) => setNewShop({ ...newShop, city: e.target.value })} 
                      placeholder="Springfield" 
                      data-testid="input-shop-city" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>State</Label>
                      <Input 
                        value={newShop.state} 
                        onChange={(e) => setNewShop({ ...newShop, state: e.target.value })} 
                        placeholder="IL" 
                        maxLength={2} 
                        data-testid="input-shop-state" 
                      />
                    </div>
                    <div>
                      <Label>ZIP</Label>
                      <Input 
                        value={newShop.zipCode} 
                        onChange={(e) => setNewShop({ ...newShop, zipCode: e.target.value })} 
                        placeholder="62701" 
                        data-testid="input-shop-zip" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={newShop.phone} 
                      onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })} 
                      placeholder="(555) 123-4567" 
                      data-testid="input-shop-phone" 
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={newShop.email} 
                      onChange={(e) => setNewShop({ ...newShop, email: e.target.value })} 
                      placeholder="contact@mikesshop.com" 
                      data-testid="input-shop-email" 
                    />
                  </div>
                </div>
                <Button 
                  className="w-full font-tech uppercase"
                  onClick={() => createShopMutation.mutate(newShop)}
                  disabled={!newShop.name || createShopMutation.isPending}
                  data-testid="button-save-shop"
                >
                  {createShopMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Register Shop
                </Button>
              </div>
            </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>

        {shopsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : myShops.length === 0 ? (
          <Card className="bg-card/50 border-dashed border-2 border-muted p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-tech uppercase text-muted-foreground mb-2">No Shops Registered</h3>
            <p className="text-sm text-muted-foreground mb-4">Register your shop to start managing repairs, estimates, and appointments</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {VEHICLE_TYPES.map(vt => (
                <Badge key={vt.id} variant="outline" className="gap-1 text-xs bg-muted/30">
                  <vt.icon className="w-3 h-3" />
                  {vt.name}
                </Badge>
              ))}
            </div>
            <Button onClick={() => setCreateShopOpen(true)} className="font-tech uppercase" data-testid="button-register-first-shop">
              <Plus className="w-4 h-4 mr-2" /> Register Your First Shop
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Shop Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-tech uppercase text-sm text-muted-foreground mb-2">Your Shops ({myShops.length})</h2>
              <AnimatePresence>
                {myShops.map((shop, index) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${selectedShop?.id === shop.id ? 'border-primary bg-primary/5' : 'bg-card'}`}
                      onClick={() => setSelectedShop(shop)}
                      data-testid={`card-shop-${shop.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-tech font-bold truncate text-sm">{shop.name}</h3>
                          {shop.city && <p className="text-xs text-muted-foreground font-mono">{shop.city}, {shop.state}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={shop.isActive ? "default" : "secondary"} className="text-[10px]">
                              {shop.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              {selectedShop ? (
                <motion.div
                  key={selectedShop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card border-primary/30 overflow-hidden">
                    {/* Shop Header */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/20">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h2 className="text-2xl font-tech font-bold uppercase">{selectedShop.name}</h2>
                          {selectedShop.address && (
                            <p className="text-muted-foreground font-mono text-sm flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {selectedShop.address}, {selectedShop.city}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
                            <DialogTrigger asChild>
                              <Button className="gap-2 font-tech text-xs" data-testid="button-new-order">
                                <Plus className="w-3 h-3" /> New Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">New Repair Order</DialogTitle>
                                <DialogDescription>Create a new work order for {selectedShop.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2">
                                    <Label>Customer Name *</Label>
                                    <Input 
                                      value={newOrder.customerName}
                                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                      placeholder="John Smith"
                                    />
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <Input 
                                      value={newOrder.customerPhone}
                                      onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                                      placeholder="(555) 123-4567"
                                    />
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <Input 
                                      value={newOrder.customerEmail}
                                      onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                                      placeholder="john@email.com"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Vehicle Info *</Label>
                                    <Input 
                                      value={newOrder.vehicleInfo}
                                      onChange={(e) => setNewOrder({ ...newOrder, vehicleInfo: e.target.value })}
                                      placeholder="2020 Toyota Camry / 15ft Bass Tracker / Honda EU2200i"
                                    />
                                  </div>
                                  <div>
                                    <Label>Vehicle Type</Label>
                                    <Select value={newOrder.vehicleType} onValueChange={(v) => setNewOrder({ ...newOrder, vehicleType: v })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {VEHICLE_TYPES.map(vt => (
                                          <SelectItem key={vt.id} value={vt.id}>
                                            <span className="flex items-center gap-2">
                                              <vt.icon className="w-4 h-4" />
                                              {vt.name}
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Priority</Label>
                                    <Select value={newOrder.priority} onValueChange={(v) => setNewOrder({ ...newOrder, priority: v })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Notes</Label>
                                    <Textarea 
                                      value={newOrder.notes}
                                      onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                                      placeholder="Customer concerns, symptoms, etc."
                                    />
                                  </div>
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => createOrderMutation.mutate(newOrder)}
                                  disabled={!newOrder.customerName || !newOrder.vehicleInfo || createOrderMutation.isPending}
                                >
                                  {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Create Repair Order
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={createAppointmentOpen} onOpenChange={setCreateAppointmentOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="gap-2 font-tech text-xs" data-testid="button-new-appointment">
                                <Calendar className="w-3 h-3" /> Schedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">Schedule Appointment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Customer Name *</Label>
                                  <Input 
                                    value={newAppointment.customerName}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <Input 
                                    value={newAppointment.customerPhone}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Vehicle</Label>
                                  <Input 
                                    value={newAppointment.vehicleInfo}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, vehicleInfo: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Service Type</Label>
                                  <Input 
                                    value={newAppointment.serviceType}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, serviceType: e.target.value })}
                                    placeholder="Oil Change, Tune Up, etc."
                                  />
                                </div>
                                <div>
                                  <Label>Date & Time *</Label>
                                  <Input 
                                    type="datetime-local"
                                    value={newAppointment.scheduledStart}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, scheduledStart: e.target.value })}
                                  />
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => createAppointmentMutation.mutate(newAppointment)}
                                  disabled={!newAppointment.customerName || !newAppointment.scheduledStart || createAppointmentMutation.isPending}
                                >
                                  Schedule Appointment
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" data-testid="button-shop-settings">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                      <TabsList className="grid grid-cols-8 mb-6 h-auto">
                        <TabsTrigger value="dashboard" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-dashboard">
                          <BarChart3 className="w-4 h-4" />
                          Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-orders">
                          <ClipboardList className="w-4 h-4" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger value="estimates" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-estimates">
                          <FileText className="w-4 h-4" />
                          Estimates
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-schedule">
                          <Calendar className="w-4 h-4" />
                          Schedule
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-inventory">
                          <Package className="w-4 h-4" />
                          Inventory
                        </TabsTrigger>
                        <TabsTrigger value="team" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-team">
                          <Users className="w-4 h-4" />
                          Team
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-integrations">
                          <Link2 className="w-4 h-4" />
                          Integrations
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </TabsTrigger>
                        <TabsTrigger value="partner-api" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-partner-api">
                          <Key className="w-4 h-4" />
                          API
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </TabsTrigger>
                      </TabsList>

                      {/* Dashboard Tab */}
                      <TabsContent value="dashboard">
                        {/* Integration Highlight Banner */}
                        <Card 
                          className="p-4 mb-6 bg-gradient-to-r from-purple-500/10 via-primary/10 to-blue-500/10 border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setActiveTab("integrations")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/20">
                                <Link2 className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-tech font-bold text-sm">Connect Your Business Tools</span>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[8px] font-mono">
                                    NEW
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">QuickBooks • UKG Pro • ADP • Google Calendar & more</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </Card>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/20">
                                <ClipboardList className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{repairOrders.length}</p>
                                <p className="text-xs text-muted-foreground font-mono">Active Orders</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-yellow-500/20">
                                <FileText className="w-5 h-5 text-yellow-500" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{estimates.filter(e => e.status === 'pending').length}</p>
                                <p className="text-xs text-muted-foreground font-mono">Pending Estimates</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Calendar className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{appointments.length}</p>
                                <p className="text-xs text-muted-foreground font-mono">Today's Appts</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-green-500/20">
                                <DollarSign className="w-5 h-5 text-green-500" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">$0</p>
                                <p className="text-xs text-muted-foreground font-mono">Today's Revenue</p>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs" onClick={() => setCreateOrderOpen(true)}>
                            <Plus className="w-5 h-5" />
                            New Repair Order
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs">
                            <FileText className="w-5 h-5" />
                            Create Estimate
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs" onClick={() => setCreateAppointmentOpen(true)}>
                            <Calendar className="w-5 h-5" />
                            Schedule Appointment
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs">
                            <Camera className="w-5 h-5" />
                            Start Inspection
                          </Button>
                        </div>

                        {/* Recent Orders */}
                        <div>
                          <h3 className="font-tech uppercase text-sm text-muted-foreground mb-3">Recent Repair Orders</h3>
                          {ordersLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : repairOrders.length === 0 ? (
                            <Card className="p-8 text-center bg-muted/30 border-dashed">
                              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                              <p className="text-muted-foreground font-mono text-sm">No repair orders yet</p>
                              <Button className="mt-4 font-tech text-xs" onClick={() => setCreateOrderOpen(true)}>
                                <Plus className="w-3 h-3 mr-1" /> Create First Order
                              </Button>
                            </Card>
                          ) : (
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-2">
                                {repairOrders.slice(0, 10).map(order => (
                                  <Card key={order.id} className="p-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                          {getVehicleIcon(order.vehicleType || 'car')}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-bold">#{order.orderNumber}</span>
                                            {getStatusBadge(order.status)}
                                          </div>
                                          <p className="text-sm">{order.customerName || 'Walk-in'}</p>
                                          <p className="text-xs text-muted-foreground">{order.vehicleInfo}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-mono font-bold">${order.grandTotal || '0.00'}</p>
                                        <Badge variant="outline" className={`text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                          {order.paymentStatus || 'unpaid'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </TabsContent>

                      {/* Orders Tab */}
                      <TabsContent value="orders">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Input placeholder="Search orders..." className="w-64" />
                            <Button variant="outline" size="icon">
                              <Filter className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button className="gap-2 font-tech text-xs" onClick={() => setCreateOrderOpen(true)}>
                            <Plus className="w-3 h-3" /> New Order
                          </Button>
                        </div>
                        
                        {ordersLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : repairOrders.length === 0 ? (
                          <Card className="p-12 text-center bg-muted/30 border-dashed">
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="font-tech uppercase text-lg mb-2">No Repair Orders</h3>
                            <p className="text-muted-foreground text-sm mb-4">Create your first repair order to get started</p>
                            <Button onClick={() => setCreateOrderOpen(true)} className="font-tech">
                              <Plus className="w-4 h-4 mr-2" /> Create Repair Order
                            </Button>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {repairOrders.map(order => (
                              <Card key={order.id} className="p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                      {getVehicleIcon(order.vehicleType || 'car')}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">#{order.orderNumber}</span>
                                        {getStatusBadge(order.status)}
                                        {order.priority === 'high' && <Badge variant="destructive" className="text-[10px]">HIGH</Badge>}
                                        {order.priority === 'urgent' && <Badge variant="destructive" className="text-[10px] animate-pulse">URGENT</Badge>}
                                      </div>
                                      <p className="font-medium">{order.customerName || 'Walk-in Customer'}</p>
                                      <p className="text-sm text-muted-foreground">{order.vehicleInfo}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="font-mono font-bold text-lg">${order.grandTotal || '0.00'}</p>
                                      <Badge variant="outline" className={`text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}`}>
                                        {order.paymentStatus || 'unpaid'}
                                      </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Estimates Tab */}
                      <TabsContent value="estimates">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Estimates & Quotes</h3>
                          <Button className="gap-2 font-tech text-xs">
                            <Plus className="w-3 h-3" /> New Estimate
                          </Button>
                        </div>
                        <Card className="p-12 text-center bg-muted/30 border-dashed">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                          <h3 className="font-tech uppercase text-lg mb-2">No Estimates Yet</h3>
                          <p className="text-muted-foreground text-sm">Create estimates to send quotes to customers</p>
                        </Card>
                      </TabsContent>

                      {/* Schedule Tab */}
                      <TabsContent value="schedule">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Appointment Calendar</h3>
                          <Button className="gap-2 font-tech text-xs" onClick={() => setCreateAppointmentOpen(true)}>
                            <Plus className="w-3 h-3" /> Schedule Appointment
                          </Button>
                        </div>
                        {appointments.length === 0 ? (
                          <Card className="p-12 text-center bg-muted/30 border-dashed">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="font-tech uppercase text-lg mb-2">No Appointments</h3>
                            <p className="text-muted-foreground text-sm mb-4">Schedule appointments to manage your workflow</p>
                            <Button onClick={() => setCreateAppointmentOpen(true)} className="font-tech">
                              <Plus className="w-4 h-4 mr-2" /> Schedule Appointment
                            </Button>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {appointments.map(apt => (
                              <Card key={apt.id} className="p-4 bg-muted/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-blue-500/10">
                                      <CalendarDays className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{apt.customerName}</p>
                                      <p className="text-sm text-muted-foreground">{apt.vehicleInfo} - {apt.serviceType}</p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {new Date(apt.scheduledStart).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline">{apt.status}</Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Inventory Tab */}
                      <TabsContent value="inventory">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Parts Inventory</h3>
                          <Button className="gap-2 font-tech text-xs">
                            <Plus className="w-3 h-3" /> Add Part
                          </Button>
                        </div>
                        <Card className="p-12 text-center bg-muted/30 border-dashed">
                          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                          <h3 className="font-tech uppercase text-lg mb-2">Inventory Management</h3>
                          <p className="text-muted-foreground text-sm">Track parts, stock levels, and vendor orders</p>
                        </Card>
                      </TabsContent>

                      {/* Team Tab */}
                      <TabsContent value="team">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Team & Technicians</h3>
                          <Button className="gap-2 font-tech text-xs">
                            <UserPlus className="w-3 h-3" /> Add Technician
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-6 bg-muted/30 border-dashed">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 rounded-lg bg-primary/10">
                                <Timer className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-tech uppercase">Time Clock</h4>
                                <p className="text-sm text-muted-foreground">Track technician hours</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full font-tech text-xs">
                              <Play className="w-3 h-3 mr-2" /> Clock In/Out
                            </Button>
                          </Card>
                          <Card className="p-6 bg-muted/30 border-dashed">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 rounded-lg bg-green-500/10">
                                <UserCheck className="w-6 h-6 text-green-500" />
                              </div>
                              <div>
                                <h4 className="font-tech uppercase">Productivity</h4>
                                <p className="text-sm text-muted-foreground">Track tech efficiency</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full font-tech text-xs">
                              <BarChart3 className="w-3 h-3 mr-2" /> View Reports
                            </Button>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Integrations Tab */}
                      <TabsContent value="integrations">
                        {/* Hero Banner */}
                        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20 border-primary/30 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-3 rounded-xl bg-primary/20">
                                <Link2 className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-tech font-bold uppercase">Unified Business Hub</h3>
                                <p className="text-muted-foreground">Connect your existing tools or use our built-in solutions</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Coexist with current systems</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                                <span>Gradually migrate at your pace</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <span>Full replacement available</span>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Integration Categories */}
                        <div className="space-y-6">
                          {/* Accounting & Invoicing */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" /> Accounting & Invoicing
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-green-500/10">
                                    <Database className="w-6 h-6 text-green-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">QuickBooks</h5>
                                <p className="text-xs text-muted-foreground mb-3">Sync invoices, payments, and financial reports automatically</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-blue-500/10">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">FreshBooks</h5>
                                <p className="text-xs text-muted-foreground mb-3">Time tracking, invoicing, and expense management</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Receipt className="w-6 h-6 text-purple-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Xero</h5>
                                <p className="text-xs text-muted-foreground mb-3">Cloud accounting with powerful reporting</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Workforce & Payroll */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Workforce & Payroll
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-orange-500/10">
                                    <UserCheck className="w-6 h-6 text-orange-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">UKG Pro</h5>
                                <p className="text-xs text-muted-foreground mb-3">HR, payroll, talent management in one platform</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-cyan-500/10">
                                    <Timer className="w-6 h-6 text-cyan-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">ADP</h5>
                                <p className="text-xs text-muted-foreground mb-3">Payroll, HR, and workforce management</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20 hover:border-pink-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-pink-500/10">
                                    <Clock className="w-6 h-6 text-pink-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Gusto</h5>
                                <p className="text-xs text-muted-foreground mb-3">Modern payroll and benefits for small business</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Scheduling & CRM */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Scheduling & Customer Management
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-indigo-500/10">
                                    <CalendarDays className="w-6 h-6 text-indigo-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Google Calendar</h5>
                                <p className="text-xs text-muted-foreground mb-3">Sync appointments with your Google account</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-red-500/10">
                                    <MessageSquare className="w-6 h-6 text-red-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Twilio</h5>
                                <p className="text-xs text-muted-foreground mb-3">SMS notifications and customer messaging</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-teal-500/10">
                                    <Mail className="w-6 h-6 text-teal-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Mailchimp</h5>
                                <p className="text-xs text-muted-foreground mb-3">Email marketing and customer outreach</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Parts & Inventory */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" /> Parts & Inventory
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Wrench className="w-6 h-6 text-amber-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">PartsTech</h5>
                                <p className="text-xs text-muted-foreground mb-3">Search and order from 20+ suppliers</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-lime-500/10">
                                    <Globe className="w-6 h-6 text-lime-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Nexpart</h5>
                                <p className="text-xs text-muted-foreground mb-3">Catalog data and electronic ordering</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Shield className="w-6 h-6 text-emerald-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">AutoZone Pro</h5>
                                <p className="text-xs text-muted-foreground mb-3">Commercial account integration</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Built-in Features Notice */}
                          <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-primary/10">
                                <Sparkles className="w-8 h-8 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-tech font-bold text-lg mb-2">Don't Have These Systems?</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Mechanics Garage includes built-in versions of all these capabilities. Use our integrated tools for invoicing, scheduling, time tracking, and inventory - no additional subscriptions required.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Invoicing</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Time Clock</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Scheduling</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Inventory</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in CRM</Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Partner API Tab */}
                      <TabsContent value="partner-api">
                        <PartnerApiTab shopId={selectedShop.id} toast={toast} />
                      </TabsContent>
                    </Tabs>
                  </Card>
                </motion.div>
              ) : (
                <Card className="p-12 text-center bg-card/50 border-dashed">
                  <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-tech uppercase text-xl mb-2">Select a Shop</h3>
                  <p className="text-muted-foreground">Choose a shop from the sidebar to view its dashboard</p>
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