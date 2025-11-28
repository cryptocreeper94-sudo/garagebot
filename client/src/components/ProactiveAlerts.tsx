import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, AlertTriangle, Clock, Sun, Milestone, 
  ChevronRight, X, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Alert {
  vehicleId: string;
  alertType: 'maintenance' | 'recall' | 'seasonal' | 'milestone';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
}

interface ProactiveAlertsProps {
  onAction?: (action: string, vehicleId: string) => void;
}

export default function ProactiveAlerts({ onAction }: ProactiveAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const { user } = useAuth();

  const { data: alerts = [], isLoading, refetch, isFetching } = useQuery<Alert[]>({
    queryKey: ['proactiveAlerts'],
    queryFn: async () => {
      const res = await fetch('/api/ai/alerts');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  const visibleAlerts = alerts.filter(a => 
    !dismissedAlerts.includes(`${a.vehicleId}-${a.alertType}-${a.title}`)
  );

  const dismissAlert = (alert: Alert) => {
    setDismissedAlerts([...dismissedAlerts, `${alert.vehicleId}-${alert.alertType}-${alert.title}`]);
  };

  const getAlertIcon = (type: Alert['alertType']) => {
    switch (type) {
      case 'maintenance': return <Clock className="w-4 h-4" />;
      case 'recall': return <AlertTriangle className="w-4 h-4" />;
      case 'seasonal': return <Sun className="w-4 h-4" />;
      case 'milestone': return <Milestone className="w-4 h-4" />;
    }
  };

  const getPriorityStyles = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/5';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low': return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const getPriorityBadge = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Urgent</Badge>;
      case 'medium': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Soon</Badge>;
      case 'low': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Tip</Badge>;
    }
  };

  if (!user) return null;

  if (visibleAlerts.length === 0 && !isLoading) return null;

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-yellow-400" />
              {visibleAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {visibleAlerts.length}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Smart Alerts</h3>
              <p className="text-xs text-muted-foreground">Proactive maintenance reminders</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">Checking your vehicles...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {visibleAlerts.map((alert, index) => (
                <motion.div
                  key={`${alert.vehicleId}-${alert.alertType}-${alert.title}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${getPriorityStyles(alert.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.priority === 'high' ? 'bg-red-500/10' :
                      alert.priority === 'medium' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                    }`}>
                      {getAlertIcon(alert.alertType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{alert.title}</span>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      {alert.action && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAction?.(alert.action!, alert.vehicleId)}
                          className="mt-2 h-7 px-2 text-xs text-primary"
                        >
                          {alert.action} <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                    <button
                      onClick={() => dismissAlert(alert)}
                      className="p-1 hover:bg-muted/30 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
