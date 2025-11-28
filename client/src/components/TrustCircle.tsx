import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Shield, Wrench, UserPlus, Copy, Check, X, Loader2, 
  Eye, Settings, ExternalLink, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TrustMember {
  id: string;
  userId: string;
  memberId?: string;
  memberEmail?: string;
  memberType: 'family' | 'mechanic' | 'friend';
  accessLevel: 'view' | 'service' | 'full';
  nickname?: string;
  inviteCode?: string;
  acceptedAt?: string;
  user?: { firstName?: string; lastName?: string; username: string };
}

export default function TrustCircle() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<'family' | 'mechanic' | 'friend'>('family');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trustMembers = [], isLoading } = useQuery<TrustMember[]>({
    queryKey: ['trustCircle'],
    queryFn: async () => {
      const res = await fetch('/api/trust-circle');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: myMemberships = [] } = useQuery<TrustMember[]>({
    queryKey: ['myMemberships'],
    queryFn: async () => {
      const res = await fetch('/api/trust-circle/memberships');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email?: string; memberType: string }) => {
      const res = await fetch('/api/trust-circle/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create invite');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trustCircle'] });
      setShowInviteDialog(false);
      setInviteEmail("");
      
      if (data.inviteCode) {
        toast({
          title: "Invite Created",
          description: `Share code: ${data.inviteCode}`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/trust-circle/${memberId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trustCircle'] });
      toast({ title: "Member Removed" });
    },
  });

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Copied!", description: "Invite code copied" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMemberTypeIcon = (type: string) => {
    switch (type) {
      case 'mechanic': return <Wrench className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case 'mechanic': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'family': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'view': return <Badge variant="outline" className="text-xs">View Only</Badge>;
      case 'service': return <Badge variant="outline" className="text-xs bg-yellow-500/10">Add Service</Badge>;
      case 'full': return <Badge variant="outline" className="text-xs bg-green-500/10">Full Access</Badge>;
      default: return null;
    }
  };

  const familyMembers = trustMembers.filter(m => m.memberType === 'family');
  const mechanics = trustMembers.filter(m => m.memberType === 'mechanic');
  const friends = trustMembers.filter(m => m.memberType === 'friend');
  const pendingInvites = trustMembers.filter(m => !m.acceptedAt && m.inviteCode);

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Trust Circle</h3>
              <p className="text-xs text-muted-foreground">Manage who can view your vehicles</p>
            </div>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="font-tech uppercase gap-1">
                <UserPlus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-tech uppercase">Add to Trust Circle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Member Type</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['family', 'mechanic', 'friend'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInviteType(type)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          inviteType === type 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border/40 hover:bg-muted/20'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {getMemberTypeIcon(type)}
                        </div>
                        <span className="text-xs capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="their@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to get a shareable code
                  </p>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="font-medium mb-1">
                    {inviteType === 'mechanic' ? 'Mechanics can:' : inviteType === 'family' ? 'Family can:' : 'Friends can:'}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• View your vehicle details</li>
                    {inviteType === 'mechanic' && <li>• Add service records</li>}
                    {inviteType === 'family' && <li>• View service history</li>}
                    <li>• See recall alerts</li>
                  </ul>
                </div>

                <Button
                  onClick={() => inviteMutation.mutate({
                    email: inviteEmail || undefined,
                    memberType: inviteType,
                  })}
                  disabled={inviteMutation.isPending}
                  className="w-full font-tech uppercase"
                >
                  {inviteMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> Send Invite</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-transparent border-b border-border/40 rounded-none h-auto p-0">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 text-xs">
            All ({trustMembers.length})
          </TabsTrigger>
          <TabsTrigger value="family" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400 py-3 text-xs">
            Family ({familyMembers.length})
          </TabsTrigger>
          <TabsTrigger value="mechanics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 py-3 text-xs">
            Mechanics ({mechanics.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-400 py-3 text-xs">
            Pending ({pendingInvites.length})
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="all" className="mt-0 space-y-3">
            {trustMembers.length === 0 ? (
              <EmptyState message="No one in your trust circle yet" />
            ) : (
              trustMembers.map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={() => removeMutation.mutate(member.id)}
                  onCopyCode={copyCode}
                  copiedCode={copiedCode}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="family" className="mt-0 space-y-3">
            {familyMembers.length === 0 ? (
              <EmptyState message="No family members added" />
            ) : (
              familyMembers.map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={() => removeMutation.mutate(member.id)}
                  onCopyCode={copyCode}
                  copiedCode={copiedCode}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="mechanics" className="mt-0 space-y-3">
            {mechanics.length === 0 ? (
              <EmptyState message="No mechanics added" />
            ) : (
              mechanics.map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={() => removeMutation.mutate(member.id)}
                  onCopyCode={copyCode}
                  copiedCode={copiedCode}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0 space-y-3">
            {pendingInvites.length === 0 ? (
              <EmptyState message="No pending invitations" />
            ) : (
              pendingInvites.map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={() => removeMutation.mutate(member.id)}
                  onCopyCode={copyCode}
                  copiedCode={copiedCode}
                  isPending
                />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* My Memberships */}
      {myMemberships.length > 0 && (
        <div className="p-4 border-t border-border/40">
          <h4 className="text-sm font-tech uppercase text-muted-foreground mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" /> I'm in their Trust Circle
          </h4>
          <div className="space-y-2">
            {myMemberships.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                <span className="text-sm">{m.user?.firstName || m.user?.username || 'User'}</span>
                <Badge className={getMemberTypeColor(m.memberType)} variant="outline">
                  {m.memberType}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function MemberCard({ 
  member, 
  onRemove, 
  onCopyCode, 
  copiedCode,
  isPending = false 
}: { 
  member: TrustMember; 
  onRemove: () => void; 
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
  isPending?: boolean;
}) {
  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case 'mechanic': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'family': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${isPending ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border/40 bg-muted/10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMemberTypeColor(member.memberType)}`}>
            {member.memberType === 'mechanic' ? <Wrench className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-medium text-sm">
              {member.nickname || member.user?.firstName || member.memberEmail || 'Pending'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{member.memberType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPending && member.inviteCode && (
            <button 
              onClick={() => onCopyCode(member.inviteCode!)}
              className="p-1.5 hover:bg-muted/30 rounded"
            >
              {copiedCode === member.inviteCode ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          <button onClick={onRemove} className="p-1.5 hover:bg-red-500/20 rounded text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isPending && member.inviteCode && (
        <div className="mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Code:</span>
            <code className="font-mono bg-black/20 px-2 py-0.5 rounded">{member.inviteCode}</code>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-6">
      <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
