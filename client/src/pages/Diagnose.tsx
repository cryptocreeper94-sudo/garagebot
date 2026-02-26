import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, AlertTriangle, Search, Wrench, DollarSign, Shield,
  ChevronRight, Loader2, Sparkles, Car, ArrowRight, ShoppingCart,
  CheckCircle2, Clock, Gauge, CircleDot, Zap, Info, ExternalLink,
  Send, RotateCcw, ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { trackEvent } from "@/hooks/useAnalytics";

interface DiagnosisCause {
  cause: string;
  likelihood: "high" | "medium" | "low";
  explanation: string;
  partsNeeded: { name: string; searchQuery: string; estimatedCost: string }[];
  diyDifficulty: "easy" | "moderate" | "hard" | "professional";
  urgency: "immediate" | "soon" | "monitor";
}

interface DiagnosisResult {
  symptomSummary: string;
  possibleCauses: DiagnosisCause[];
  safetyWarning?: string;
  nextSteps: string[];
  estimatedDIYSavings?: string;
}

const COMMON_SYMPTOMS = [
  "Engine makes a clicking noise when starting",
  "Car shakes when braking at high speed",
  "Check engine light is on",
  "Squealing noise when turning the steering wheel",
  "White smoke coming from exhaust",
  "Car pulls to one side while driving",
  "AC blowing warm air",
  "Grinding noise when shifting gears",
  "Battery keeps dying overnight",
  "Oil leak under the car",
  "Transmission slipping between gears",
  "Overheating in traffic",
];

const likelihoodConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: Zap, label: "Most Likely" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Gauge, label: "Possible" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: CircleDot, label: "Less Likely" },
};

const difficultyConfig = {
  easy: { color: "text-green-400", label: "Easy DIY" },
  moderate: { color: "text-yellow-400", label: "Moderate DIY" },
  hard: { color: "text-orange-400", label: "Advanced DIY" },
  professional: { color: "text-red-400", label: "Pro Recommended" },
};

const urgencyConfig = {
  immediate: { color: "text-red-400", bg: "bg-red-500/15", label: "Fix Now" },
  soon: { color: "text-yellow-400", bg: "bg-yellow-500/15", label: "Fix Soon" },
  monitor: { color: "text-green-400", bg: "bg-green-500/15", label: "Monitor" },
};

export default function Diagnose() {
  const [symptom, setSymptom] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [expandedCause, setExpandedCause] = useState<number>(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles"],
    enabled: !!user,
  });

  const diagnoseMutation = useMutation({
    mutationFn: async (data: { symptom: string; vehicle?: any }) => {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Diagnosis failed");
      }
      return res.json() as Promise<DiagnosisResult>;
    },
    onSuccess: () => {
      trackEvent("ai_diagnosis", "ai", symptom);
    },
    onError: (err: Error) => {
      toast({ title: "Diagnosis Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleDiagnose = () => {
    if (symptom.trim().length < 5) {
      toast({ title: "Too short", description: "Please describe the symptom in more detail", variant: "destructive" });
      return;
    }

    const selectedVehicle = vehicles?.find((v: any) => v.id === selectedVehicleId);
    const vehicleContext = selectedVehicle
      ? {
          year: selectedVehicle.year?.toString(),
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          trim: selectedVehicle.trim,
          mileage: selectedVehicle.currentMileage,
        }
      : undefined;

    diagnoseMutation.mutate({ symptom: symptom.trim(), vehicle: vehicleContext });
  };

  const handleSearchPart = (searchQuery: string) => {
    trackEvent("diagnosis_part_search", "ai", searchQuery);
    navigate(`/results?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleReset = () => {
    setSymptom("");
    setExpandedCause(0);
    diagnoseMutation.reset();
  };

  const result = diagnoseMutation.data;

  return (
    <div className="min-h-screen bg-background" data-testid="diagnose-page">
      <Nav />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-tech text-2xl sm:text-3xl font-bold text-white" data-testid="text-diagnose-title">
                AI Symptom Diagnosis
              </h1>
              <p className="text-sm text-muted-foreground">
                Describe what's wrong — Buddy will diagnose it and find the parts you need
              </p>
            </div>
          </div>
        </motion.div>

        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/[0.03] border-white/10 p-6 mb-6">
              {user && vehicles && vehicles.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                    Select Your Vehicle (optional but recommended)
                  </label>
                  <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                    <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-vehicle">
                      <SelectValue placeholder="Choose a vehicle from your garage" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model} {v.trim || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                Describe the Problem
              </label>
              <Textarea
                placeholder="e.g. My car makes a grinding noise when I brake, especially at low speeds..."
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="bg-white/5 border-white/10 min-h-[120px] text-white placeholder:text-muted-foreground/50 mb-4 resize-none"
                data-testid="input-symptom"
              />

              <Button
                onClick={handleDiagnose}
                disabled={diagnoseMutation.isPending || symptom.trim().length < 5}
                className="w-full bg-primary hover:bg-primary/90 text-black font-tech uppercase tracking-wider h-12"
                data-testid="button-diagnose"
              >
                {diagnoseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Diagnose My Vehicle
                  </>
                )}
              </Button>
            </Card>

            <div className="mb-6">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Common Symptoms — tap to diagnose
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSymptom(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
                    data-testid={`button-symptom-${i}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {diagnoseMutation.isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <Stethoscope className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground font-tech animate-pulse">
                Buddy is analyzing your symptoms...
              </p>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-tech text-lg font-bold text-white" data-testid="text-diagnosis-summary">
                    Diagnosis Results
                  </h2>
                  <p className="text-sm text-muted-foreground">{result.symptomSummary}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-muted-foreground hover:text-white"
                  data-testid="button-new-diagnosis"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> New Diagnosis
                </Button>
              </div>

              {result.safetyWarning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <Card className="bg-red-500/10 border-red-500/30 p-4" data-testid="safety-warning">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-tech text-sm font-bold text-red-400 uppercase mb-1">Safety Warning</h3>
                        <p className="text-sm text-red-300/80">{result.safetyWarning}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              <div className="space-y-3 mb-8">
                {result.possibleCauses.map((cause, i) => {
                  const lConfig = likelihoodConfig[cause.likelihood];
                  const dConfig = difficultyConfig[cause.diyDifficulty];
                  const uConfig = urgencyConfig[cause.urgency];
                  const LikelihoodIcon = lConfig.icon;
                  const isExpanded = expandedCause === i;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card
                        className={`border overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? "bg-white/[0.04] border-primary/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                        data-testid={`cause-card-${i}`}
                      >
                        <button
                          className="w-full text-left p-4"
                          onClick={() => setExpandedCause(isExpanded ? -1 : i)}
                          data-testid={`button-expand-cause-${i}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${lConfig.bg} border flex items-center justify-center shrink-0`}>
                              <LikelihoodIcon className={`w-4 h-4 ${lConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-tech text-sm font-bold text-white">{cause.cause}</span>
                                <Badge variant="outline" className={`text-[8px] h-4 px-1.5 border-current ${lConfig.color}`}>
                                  {lConfig.label}
                                </Badge>
                                <Badge variant="outline" className={`text-[8px] h-4 px-1.5 ${uConfig.bg} ${uConfig.color} border-current`}>
                                  {uConfig.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[10px] ${dConfig.color}`}>{dConfig.label}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {cause.partsNeeded.length} part{cause.partsNeeded.length !== 1 ? "s" : ""} needed
                                </span>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                <p className="text-sm text-muted-foreground/90 mb-4 leading-relaxed">
                                  {cause.explanation}
                                </p>

                                {cause.partsNeeded.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                      <Wrench className="w-3 h-3" /> Parts Needed
                                    </h4>
                                    <div className="space-y-2">
                                      {cause.partsNeeded.map((part, pi) => (
                                        <div
                                          key={pi}
                                          className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <span className="text-sm text-white font-medium block truncate">{part.name}</span>
                                            <span className="text-[11px] text-green-400 font-mono">{part.estimatedCost}</span>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() => handleSearchPart(part.searchQuery)}
                                            className="h-8 px-3 text-[10px] font-tech uppercase bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 shrink-0"
                                            data-testid={`button-search-part-${i}-${pi}`}
                                          >
                                            <Search className="w-3 h-3 mr-1" /> Find Part
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {result.nextSteps.length > 0 && (
                <Card className="bg-white/[0.03] border-white/10 p-4 mb-6" data-testid="next-steps">
                  <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Recommended Next Steps
                  </h3>
                  <ol className="space-y-2">
                    {result.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-mono text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground/90">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {result.estimatedDIYSavings && (
                <Card className="bg-green-500/5 border-green-500/20 p-4 mb-6" data-testid="diy-savings">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <div>
                      <h3 className="font-tech text-sm font-bold text-green-400">Estimated DIY Savings</h3>
                      <p className="text-sm text-green-300/70">{result.estimatedDIYSavings}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate(`/results?q=${encodeURIComponent(result.possibleCauses[0]?.partsNeeded[0]?.searchQuery || symptom)}`)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-tech uppercase h-11"
                  data-testid="button-shop-parts"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Shop Parts for Top Cause
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/diy-guides`)}
                  className="flex-1 border-white/10 hover:bg-white/5 font-tech uppercase h-11"
                  data-testid="button-diy-guides"
                >
                  <Wrench className="w-4 h-4 mr-2" /> View DIY Repair Guides
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
