import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  AlertTriangle, Shield, ChevronDown, ChevronRight, ExternalLink, 
  Car, CheckCircle2, Loader2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recall {
  campaignNumber: string;
  nhtsaCampaignNumber?: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  manufacturer: string;
  reportReceivedDate: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin?: string;
}

interface RecallAlertsProps {
  vehicle: Vehicle;
  compact?: boolean;
}

export default function RecallAlerts({ vehicle, compact = false }: RecallAlertsProps) {
  const [expandedRecall, setExpandedRecall] = useState<string | null>(null);

  const { data: recalls = [], isLoading, refetch, isFetching } = useQuery<Recall[]>({
    queryKey: ['recalls', vehicle.year, vehicle.make, vehicle.model],
    queryFn: async () => {
      const res = await fetch(
        `/api/nhtsa/recalls/${vehicle.year}/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}`
      );
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const toggleRecall = (id: string) => {
    setExpandedRecall(prev => prev === id ? null : id);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : recalls.length > 0 ? (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" /> {recalls.length} Recall{recalls.length !== 1 ? 's' : ''}
          </Badge>
        ) : (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Shield className="w-3 h-3 mr-1" /> No Recalls
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              recalls.length > 0 
                ? 'bg-red-500/20 border border-red-500/30'
                : 'bg-green-500/20 border border-green-500/30'
            }`}>
              {recalls.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Shield className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Recall Alerts</h3>
              <p className="text-xs text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
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
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Checking NHTSA database...</p>
            </motion.div>
          ) : recalls.length === 0 ? (
            <motion.div
              key="no-recalls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="font-medium text-green-400">No Open Recalls</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your vehicle has no outstanding safety recalls
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="recalls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">
                  {recalls.length} Active Recall{recalls.length !== 1 ? 's' : ''}
                </span>
              </div>

              {recalls.map((recall) => (
                <div
                  key={recall.campaignNumber}
                  className="border border-red-500/30 rounded-lg overflow-hidden bg-red-500/5"
                >
                  <button
                    onClick={() => toggleRecall(recall.campaignNumber)}
                    className="w-full p-3 flex items-center justify-between hover:bg-red-500/10 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{recall.component}</p>
                      <p className="text-xs text-muted-foreground">
                        Campaign #{recall.campaignNumber}
                      </p>
                    </div>
                    {expandedRecall === recall.campaignNumber ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedRecall === recall.campaignNumber && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Summary</p>
                            <p>{recall.summary}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Consequence</p>
                            <p className="text-red-300">{recall.consequence}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Remedy</p>
                            <p className="text-green-300">{recall.remedy}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-red-500/20">
                            <span className="text-xs text-muted-foreground">
                              Reported: {new Date(recall.reportReceivedDate).toLocaleDateString()}
                            </span>
                            <a
                              href={`https://www.nhtsa.gov/recalls?nhtsaId=${recall.campaignNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
                            >
                              NHTSA Details <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <p className="text-xs text-muted-foreground text-center pt-2">
                Contact your dealer to schedule recall repairs (usually free)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
