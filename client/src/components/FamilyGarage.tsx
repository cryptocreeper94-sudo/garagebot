import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Plus, Mail, Copy, Check, X, Loader2, Car, Share2,
  UserPlus, Shield, Eye, Edit2, Trash2, Clock, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin?: string;
}

interface VehicleShare {
  id: string;
  vehicleId: string;
  ownerId: string;
  sharedWithId?: string;
  sharedWithEmail?: string;
  shareType: 'view' | 'edit' | 'full';
  inviteCode?: string;
  inviteExpiresAt?: string;
  acceptedAt?: string;
  vehicle?: Vehicle;
  sharedWithUser?: { username: string; firstName?: string };
}

interface FamilyGarageProps {
  vehicles: Vehicle[];
}

export default function FamilyGarage({ vehicles }: FamilyGarageProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [shareType, setShareType] = useState<'view' | 'edit'>('view');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: shares = [], isLoading } = useQuery<VehicleShare[]>({
    queryKey: ['vehicleShares'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles/shares');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: sharedWithMe = [] } = useQuery<VehicleShare[]>({
    queryKey: ['vehiclesSharedWithMe'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles/shared-with-me');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const createShareMutation = useMutation({
    mutationFn: async (data: { vehicleId: string; email?: string; shareType: string }) => {
      const res = await fetch('/api/vehicles/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create share');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicleShares'] });
      setShowInviteDialog(false);
      setInviteEmail("");
      setSelectedVehicle("");
      
      if (data.inviteCode) {
        toast({
          title: "Invite Created",
          description: `Share code: ${data.inviteCode}`,
        });
      } else {
        toast({
          title: "Invite Sent",
          description: "Email invitation sent successfully",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create share invitation",
        variant: "destructive",
      });
    },
  });

  const revokeShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const res = await fetch(`/api/vehicles/shares/${shareId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke share');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleShares'] });
      toast({ title: "Access Revoked" });
    },
  });

  const copyInviteCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Copied!", description: "Invite code copied to clipboard" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getShareTypeLabel = (type: string) => {
    switch (type) {
      case 'view': return 'Can View';
      case 'edit': return 'Can Edit';
      case 'full': return 'Full Access';
      default: return type;
    }
  };

  const getShareTypeColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'edit': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'full': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const myShares = shares.filter(s => s.ownerId === user?.id);
  const pendingInvites = myShares.filter(s => !s.acceptedAt && s.inviteCode);
  const activeShares = myShares.filter(s => s.acceptedAt);

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Family Garage</h3>
              <p className="text-xs text-muted-foreground">Share vehicles with family & trusted contacts</p>
            </div>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="font-tech uppercase gap-1">
                <UserPlus className="w-4 h-4" /> Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-tech uppercase">Share a Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Select Vehicle</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a vehicle to share" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Share Type</Label>
                  <Select value={shareType} onValueChange={(v: 'view' | 'edit') => setShareType(v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" /> View Only - Can see vehicle details
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4" /> Can Edit - Update mileage, add service records
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Invite by Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="family@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to get a shareable invite code
                  </p>
                </div>

                <Button
                  onClick={() => createShareMutation.mutate({
                    vehicleId: selectedVehicle,
                    email: inviteEmail || undefined,
                    shareType,
                  })}
                  disabled={!selectedVehicle || createShareMutation.isPending}
                  className="w-full font-tech uppercase"
                >
                  {createShareMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><Share2 className="w-4 h-4 mr-2" /> Create Invite</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Shared With Me Section */}
        {sharedWithMe.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-tech uppercase text-muted-foreground flex items-center gap-2">
              <Car className="w-4 h-4" /> Vehicles Shared With Me
            </h4>
            {sharedWithMe.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {share.vehicle ? `${share.vehicle.year} ${share.vehicle.make} ${share.vehicle.model}` : 'Vehicle'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Shared by owner
                    </p>
                  </div>
                </div>
                <Badge className={getShareTypeColor(share.shareType)}>
                  {getShareTypeLabel(share.shareType)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Pending Invites Section */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-tech uppercase text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Invites
            </h4>
            {pendingInvites.map((share) => {
              const vehicle = vehicles.find(v => v.id === share.vehicleId);
              return (
                <div
                  key={share.id}
                  className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                    </p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-black/20 rounded font-mono text-sm">
                      {share.inviteCode}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyInviteCode(share.inviteCode!)}
                    >
                      {copiedCode === share.inviteCode ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeShareMutation.mutate(share.id)}
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Share this code with family or paste it into their GarageBot app
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Active Shares Section */}
        {activeShares.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-tech uppercase text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" /> Active Shares
            </h4>
            {activeShares.map((share) => {
              const vehicle = vehicles.find(v => v.id === share.vehicleId);
              return (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Shared with {share.sharedWithUser?.firstName || share.sharedWithEmail || 'user'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getShareTypeColor(share.shareType)}>
                      {getShareTypeLabel(share.shareType)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeShareMutation.mutate(share.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {shares.length === 0 && sharedWithMe.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">No Shared Vehicles</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Invite family members to view your vehicles
            </p>
          </div>
        )}

        {/* Accept Invite Code Section */}
        <div className="border-t border-border/40 pt-4">
          <AcceptInviteSection />
        </div>
      </div>
    </Card>
  );
}

function AcceptInviteSection() {
  const [inviteCode, setInviteCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/vehicles/shares/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      });
      if (!res.ok) throw new Error('Invalid or expired invite code');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiclesSharedWithMe'] });
      setInviteCode("");
      toast({
        title: "Success!",
        description: "Vehicle has been added to your shared garage",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid Code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-2">
      <Label className="text-xs font-tech uppercase text-muted-foreground">
        Have an Invite Code?
      </Label>
      <div className="flex gap-2">
        <Input
          placeholder="Enter code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          className="font-mono"
          maxLength={8}
        />
        <Button
          onClick={() => acceptMutation.mutate(inviteCode)}
          disabled={inviteCode.length < 6 || acceptMutation.isPending}
          className="font-tech uppercase shrink-0"
        >
          {acceptMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><Link2 className="w-4 h-4 mr-2" /> Join</>
          )}
        </Button>
      </div>
    </div>
  );
}
