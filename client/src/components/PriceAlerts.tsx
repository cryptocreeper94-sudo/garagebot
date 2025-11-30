import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, BellRing, X, Crown, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PriceAlert {
  id: string;
  partName: string;
  partNumber: string | null;
  targetPrice: string;
  currentPrice: string | null;
  vendorSlug: string | null;
  isActive: boolean;
  createdAt: string;
  lastCheckedAt: string | null;
  triggeredAt: string | null;
}

interface User {
  id: string;
  subscriptionTier: string;
}

interface PriceAlertButtonProps {
  partName: string;
  partNumber?: string;
  vendorSlug?: string;
  currentPrice?: number;
}

export function PriceAlertButton({ partName, partNumber, vendorSlug, currentPrice }: PriceAlertButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice ? String(Math.floor(currentPrice * 0.9)) : "");
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
    retry: false,
  });

  const createAlert = useMutation({
    mutationFn: async (data: { partName: string; partNumber?: string; targetPrice: number; vendorSlug?: string; currentPrice?: number }) => {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create alert');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success("Price alert created!");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isPro = user?.subscriptionTier === 'pro';

  const handleCreateAlert = () => {
    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      toast.error("Please enter a valid target price");
      return;
    }
    createAlert.mutate({
      partName,
      partNumber,
      targetPrice: parseFloat(targetPrice),
      vendorSlug,
      currentPrice,
    });
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => toast.info("Sign in to set price alerts")}
        data-testid="button-price-alert-login"
      >
        <Bell className="w-4 h-4" />
      </Button>
    );
  }

  if (!isPro) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-400 hover:text-amber-300"
        onClick={() => toast.info("Price alerts are a Pro feature. Upgrade to unlock!", { icon: <Crown className="w-4 h-4" /> })}
        data-testid="button-price-alert-pro"
      >
        <Bell className="w-4 h-4" />
        <Crown className="w-3 h-3 ml-1" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary/80"
        onClick={() => setIsDialogOpen(true)}
        data-testid="button-price-alert-create"
      >
        <Bell className="w-4 h-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-tech">
              <BellRing className="w-5 h-5 text-primary" />
              Set Price Alert
            </DialogTitle>
            <DialogDescription>
              We'll notify you when the price drops to your target.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Part:</p>
              <p className="font-medium">{partName}</p>
              {partNumber && <p className="text-sm text-muted-foreground">#{partNumber}</p>}
            </div>

            {currentPrice && (
              <div>
                <p className="text-sm text-muted-foreground">Current Price:</p>
                <p className="text-lg font-tech text-green-400">${currentPrice.toFixed(2)}</p>
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Target Price:</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-8 bg-background"
                  data-testid="input-target-price"
                />
              </div>
              {currentPrice && targetPrice && parseFloat(targetPrice) < currentPrice && (
                <p className="text-xs text-green-400 mt-1">
                  {Math.round((1 - parseFloat(targetPrice) / currentPrice) * 100)}% off current price
                </p>
              )}
            </div>

            <Button
              onClick={handleCreateAlert}
              disabled={createAlert.isPending}
              className="w-full btn-glow"
              data-testid="button-confirm-price-alert"
            >
              {createAlert.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PriceAlertsPanel() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
    retry: false,
  });

  const { data: alerts = [], isLoading } = useQuery<PriceAlert[]>({
    queryKey: ['price-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/price-alerts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return res.json();
    },
    enabled: !!user && user.subscriptionTier === 'pro',
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/price-alerts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete alert');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast.success("Alert deleted");
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/price-alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  const isPro = user?.subscriptionTier === 'pro';

  if (!user) {
    return null;
  }

  if (!isPro) {
    return (
      <Card className="bg-card/50 border-amber-500/30 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Price Drop Alerts</p>
            <p className="text-sm text-muted-foreground">Upgrade to Pro to get notified when prices drop.</p>
          </div>
          <Button variant="outline" size="sm" className="text-amber-400 border-amber-500/30" data-testid="button-upgrade-pro-alerts">
            Upgrade
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border p-4" data-testid="panel-price-alerts">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-tech font-bold flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          Your Price Alerts
        </h3>
        <Badge variant="secondary" className="text-xs">
          {alerts.length} active
        </Badge>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No price alerts yet</p>
          <p className="text-sm">Click the bell icon on any part to set one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-3 rounded-lg border transition-all ${
                  alert.triggeredAt 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : alert.isActive 
                      ? 'bg-card border-border' 
                      : 'bg-muted/30 border-muted opacity-60'
                }`}
                data-testid={`alert-item-${alert.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{alert.partName}</p>
                    {alert.partNumber && (
                      <p className="text-xs text-muted-foreground">#{alert.partNumber}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-primary font-tech">
                        Target: ${parseFloat(alert.targetPrice).toFixed(2)}
                      </span>
                      {alert.currentPrice && (
                        <span className="text-sm text-muted-foreground">
                          Current: ${parseFloat(alert.currentPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {alert.triggeredAt && (
                      <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400">
                        Price dropped!
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleAlert.mutate({ id: alert.id, isActive: !alert.isActive })}
                      data-testid={`button-toggle-alert-${alert.id}`}
                    >
                      {alert.isActive ? (
                        <Bell className="w-4 h-4 text-primary" />
                      ) : (
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteAlert.mutate(alert.id)}
                      data-testid={`button-delete-alert-${alert.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
