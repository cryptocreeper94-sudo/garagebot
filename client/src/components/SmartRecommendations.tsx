import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Sparkles, AlertTriangle, Clock, Sun, Wrench, ChevronRight, 
  Search, Loader2, RefreshCw, BookOpen, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  nickname?: string;
}

interface Recommendations {
  urgentParts: string[];
  upcomingMaintenance: string[];
  seasonalSuggestions: string[];
  message: string;
}

interface DIYGuide {
  title: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  estimatedTime: string;
  toolsNeeded: string[];
  partsNeeded: string[];
  steps: { step: number; instruction: string; tip?: string }[];
  warnings: string[];
  costSavings: string;
}

interface MechanicEstimate {
  laborHours: string;
  laborCostRange: string;
  partsEstimate: string;
  totalRange: string;
  diyOption: { possible: boolean; savings: string; difficulty: string };
  tips: string[];
}

interface SmartRecommendationsProps {
  vehicle: Vehicle;
  onSearch?: (query: string) => void;
}

export default function SmartRecommendations({ vehicle, onSearch }: SmartRecommendationsProps) {
  const [showGuide, setShowGuide] = useState<string | null>(null);
  const [showEstimate, setShowEstimate] = useState<string | null>(null);
  const { toast } = useToast();

  const vehicleLabel = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim();

  const { data: recommendations, isLoading, refetch, isFetching } = useQuery<Recommendations>({
    queryKey: ['recommendations', vehicle.id],
    queryFn: async () => {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: vehicle.year?.toString(),
            make: vehicle.make,
            model: vehicle.model,
            mileage: vehicle.mileage
          }
        })
      });
      if (!res.ok) throw new Error('Failed to get recommendations');
      return res.json();
    },
    enabled: !!vehicle.id && !!(vehicle.year || vehicle.make),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const diyGuideMutation = useMutation({
    mutationFn: async (repairTask: string) => {
      const res = await fetch('/api/ai/diy-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: vehicle.year?.toString(),
            make: vehicle.make,
            model: vehicle.model
          },
          repairTask
        })
      });
      if (!res.ok) throw new Error('Failed to generate guide');
      return res.json() as Promise<DIYGuide>;
    }
  });

  const estimateMutation = useMutation({
    mutationFn: async (repairTask: string) => {
      const res = await fetch('/api/ai/mechanic-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: {
            year: vehicle.year?.toString(),
            make: vehicle.make,
            model: vehicle.model
          },
          repairTask
        })
      });
      if (!res.ok) throw new Error('Failed to get estimate');
      return res.json() as Promise<MechanicEstimate>;
    }
  });

  const handleSearch = (item: string) => {
    if (onSearch) {
      onSearch(`${item} ${vehicleLabel}`);
    }
  };

  const handleDIYGuide = async (task: string) => {
    setShowGuide(task);
    diyGuideMutation.mutate(task);
  };

  const handleEstimate = async (task: string) => {
    setShowEstimate(task);
    estimateMutation.mutate(task);
  };

  if (!vehicle.year && !vehicle.make) {
    return null;
  }

  return (
    <>
      <Card className="bg-card border-primary/30 overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-tech text-lg uppercase text-primary">Smart Recommendations</h3>
                <p className="text-xs text-muted-foreground">AI-powered for your {vehicleLabel}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh-recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Analyzing your vehicle...</span>
          </div>
        ) : recommendations ? (
          <div className="p-4 space-y-4">
            {/* Buddy's Message */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm">{recommendations.message}</p>
            </div>

            {/* Urgent Parts */}
            {recommendations.urgentParts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-tech uppercase text-orange-400">Likely Needed Soon</h4>
                </div>
                <div className="space-y-2">
                  {recommendations.urgentParts.map((part, i) => (
                    <RecommendationItem 
                      key={i} 
                      item={part} 
                      priority="high"
                      onSearch={() => handleSearch(part)}
                      onDIY={() => handleDIYGuide(part.includes('change') || part.includes('replace') ? part : `Replace ${part}`)}
                      onEstimate={() => handleEstimate(part.includes('change') || part.includes('replace') ? part : `Replace ${part}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Maintenance */}
            {recommendations.upcomingMaintenance.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-tech uppercase text-blue-400">Upcoming Maintenance</h4>
                </div>
                <div className="space-y-2">
                  {recommendations.upcomingMaintenance.map((item, i) => (
                    <RecommendationItem 
                      key={i} 
                      item={item} 
                      priority="medium"
                      onSearch={() => handleSearch(item)}
                      onDIY={() => handleDIYGuide(item)}
                      onEstimate={() => handleEstimate(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Seasonal */}
            {recommendations.seasonalSuggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-sm font-tech uppercase text-yellow-400">Seasonal Tips</h4>
                </div>
                <div className="space-y-2">
                  {recommendations.seasonalSuggestions.map((item, i) => (
                    <RecommendationItem 
                      key={i} 
                      item={item} 
                      priority="low"
                      onSearch={() => handleSearch(item)}
                      onDIY={() => handleDIYGuide(item)}
                      onEstimate={() => handleEstimate(item)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Wrench className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Add mileage to get personalized recommendations</p>
          </div>
        )}
      </Card>

      {/* DIY Guide Dialog */}
      <Dialog open={!!showGuide} onOpenChange={() => setShowGuide(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-tech uppercase flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              DIY Guide
            </DialogTitle>
          </DialogHeader>
          {diyGuideMutation.isPending ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Generating guide for {vehicleLabel}...</p>
            </div>
          ) : diyGuideMutation.data ? (
            <DIYGuideContent guide={diyGuideMutation.data} />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Estimate Dialog */}
      <Dialog open={!!showEstimate} onOpenChange={() => setShowEstimate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-tech uppercase flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Repair Estimate
            </DialogTitle>
          </DialogHeader>
          {estimateMutation.isPending ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Calculating estimate...</p>
            </div>
          ) : estimateMutation.data ? (
            <EstimateContent estimate={estimateMutation.data} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RecommendationItem({ 
  item, 
  priority,
  onSearch,
  onDIY,
  onEstimate
}: { 
  item: string; 
  priority: 'high' | 'medium' | 'low';
  onSearch: () => void;
  onDIY: () => void;
  onEstimate: () => void;
}) {
  const priorityColors = {
    high: 'border-orange-500/30 bg-orange-500/5',
    medium: 'border-blue-500/30 bg-blue-500/5',
    low: 'border-yellow-500/30 bg-yellow-500/5'
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColors[priority]} flex items-center justify-between`}>
      <span className="text-sm font-medium">{item}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onDIY} className="h-7 px-2 text-xs">
          <BookOpen className="w-3 h-3 mr-1" /> DIY
        </Button>
        <Button variant="ghost" size="sm" onClick={onEstimate} className="h-7 px-2 text-xs">
          <DollarSign className="w-3 h-3 mr-1" /> Cost
        </Button>
        <Button variant="default" size="sm" onClick={onSearch} className="h-7 px-2 text-xs">
          <Search className="w-3 h-3 mr-1" /> Find
        </Button>
      </div>
    </div>
  );
}

function DIYGuideContent({ guide }: { guide: DIYGuide }) {
  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400',
    Moderate: 'bg-yellow-500/20 text-yellow-400',
    Advanced: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{guide.title}</h3>
      
      <div className="flex flex-wrap gap-2">
        <Badge className={difficultyColors[guide.difficulty]}>{guide.difficulty}</Badge>
        <Badge variant="outline">{guide.estimatedTime}</Badge>
        <Badge variant="outline" className="bg-green-500/10 text-green-400">{guide.costSavings}</Badge>
      </div>

      {/* Warnings */}
      {guide.warnings.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-medium text-red-400 text-sm">Safety Warnings</span>
          </div>
          <ul className="text-sm space-y-1">
            {guide.warnings.map((w, i) => (
              <li key={i} className="text-muted-foreground">• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools & Parts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/20 rounded-lg p-3">
          <h4 className="text-xs font-tech uppercase text-muted-foreground mb-2">Tools Needed</h4>
          <ul className="text-sm space-y-1">
            {guide.toolsNeeded.map((t, i) => (
              <li key={i}>• {t}</li>
            ))}
          </ul>
        </div>
        <div className="bg-muted/20 rounded-lg p-3">
          <h4 className="text-xs font-tech uppercase text-muted-foreground mb-2">Parts Needed</h4>
          <ul className="text-sm space-y-1">
            {guide.partsNeeded.length > 0 ? guide.partsNeeded.map((p, i) => (
              <li key={i}>• {p}</li>
            )) : <li className="text-muted-foreground">Depends on task</li>}
          </ul>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="text-sm font-tech uppercase text-muted-foreground mb-3">Instructions</h4>
        <div className="space-y-3">
          {guide.steps.map((step) => (
            <div key={step.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {step.step}
              </div>
              <div>
                <p className="text-sm">{step.instruction}</p>
                {step.tip && (
                  <p className="text-xs text-primary mt-1">💡 Pro tip: {step.tip}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EstimateContent({ estimate }: { estimate: MechanicEstimate }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Labor Time</p>
          <p className="font-tech text-lg">{estimate.laborHours}</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Labor Cost</p>
          <p className="font-tech text-lg text-primary">{estimate.laborCostRange}</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Parts Estimate</p>
          <p className="font-tech text-lg">{estimate.partsEstimate}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/30">
          <p className="text-xs text-green-400 mb-1">Total Range</p>
          <p className="font-tech text-lg text-green-400">{estimate.totalRange}</p>
        </div>
      </div>

      {/* DIY Option */}
      {estimate.diyOption.possible && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">DIY Option</span>
          </div>
          <p className="text-sm text-muted-foreground">{estimate.diyOption.savings}</p>
          <p className="text-xs text-muted-foreground mt-1">Difficulty: {estimate.diyOption.difficulty}</p>
        </div>
      )}

      {/* Tips */}
      {estimate.tips.length > 0 && (
        <div>
          <h4 className="text-xs font-tech uppercase text-muted-foreground mb-2">Pro Tips</h4>
          <ul className="text-sm space-y-1">
            {estimate.tips.map((tip, i) => (
              <li key={i} className="text-muted-foreground">• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
