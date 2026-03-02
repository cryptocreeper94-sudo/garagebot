import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Layers, Search, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Sparkles, ShoppingCart, Zap, Wrench, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AssemblyPart {
  name: string;
  partNumber?: string;
  description: string;
  searchQuery: string;
  isBasePart: boolean;
  estimatedPrice?: string;
  importance: "required" | "recommended" | "optional";
}

interface AssemblyResult {
  assemblyName: string;
  description: string;
  totalParts: number;
  parts: AssemblyPart[];
  tips: string;
  vehicleInfo?: string;
}

interface CompleteAssemblyProps {
  partName: string;
  vehicle?: { year?: string; make?: string; model?: string; type?: string };
}

const IMPORTANCE_STYLES = {
  required: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Required" },
  recommended: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", label: "Recommended" },
  optional: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "Optional" },
};

export default function CompleteAssembly({ partName, vehicle }: CompleteAssemblyProps) {
  const [_, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedParts, setSelectedParts] = useState<Set<number>>(new Set());

  const { data: assembly, isLoading, error } = useQuery<AssemblyResult>({
    queryKey: ["assembly-parts", partName, vehicle?.year, vehicle?.make, vehicle?.model],
    queryFn: async () => {
      const res = await fetch("/api/ai/assembly-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partName, vehicle }),
      });
      if (!res.ok) throw new Error("Failed to get assembly parts");
      return res.json();
    },
    enabled: !!partName && partName.length > 2,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-cyan-500/[0.04] via-purple-500/[0.03] to-cyan-500/[0.04] border-cyan-500/15 p-4" data-testid="assembly-loading">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-tech text-cyan-400 uppercase tracking-wider">Analyzing Assembly</p>
            <p className="text-xs text-muted-foreground">Finding related parts you may need...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !assembly || assembly.parts.length <= 1) {
    return null;
  }

  const companionParts = assembly.parts.filter(p => !p.isBasePart);
  if (companionParts.length === 0) return null;

  const allSelected = companionParts.every((_, i) => selectedParts.has(i));

  const togglePart = (index: number) => {
    setSelectedParts(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (allSelected) {
      setSelectedParts(new Set());
    } else {
      setSelectedParts(new Set(companionParts.map((_, i) => i)));
    }
  };

  const searchForPart = (part: AssemblyPart) => {
    const params = new URLSearchParams();
    params.set("q", part.searchQuery);
    if (vehicle?.year) params.set("year", vehicle.year);
    if (vehicle?.make) params.set("make", vehicle.make);
    if (vehicle?.model) params.set("model", vehicle.model);
    if (vehicle?.type) params.set("type", vehicle.type);
    setLocation(`/results?${params.toString()}`);
  };

  const searchAllSelected = () => {
    const selected = companionParts.filter((_, i) => selectedParts.has(i));
    if (selected.length === 1) {
      searchForPart(selected[0]);
    } else if (selected.length > 1) {
      const combinedQuery = selected.map(p => p.name).join(", ");
      const params = new URLSearchParams();
      params.set("q", combinedQuery);
      if (vehicle?.year) params.set("year", vehicle.year);
      if (vehicle?.make) params.set("make", vehicle.make);
      if (vehicle?.model) params.set("model", vehicle.model);
      setLocation(`/results?${params.toString()}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      data-testid="complete-assembly"
    >
      <Card className="overflow-hidden border-cyan-500/15 bg-gradient-to-br from-[#0a0f1e] via-[#0d1225] to-[#0a0f1e]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 sm:p-5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
          data-testid="assembly-toggle"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-tech font-bold text-sm sm:text-base uppercase tracking-wider text-white">
                Complete This Assembly
              </h3>
              <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/25 text-[10px] font-mono">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Detected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {assembly.assemblyName} — {companionParts.length} additional part{companionParts.length !== 1 ? "s" : ""} you may need
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground font-mono">
              {assembly.totalParts} total
            </Badge>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                {assembly.description && (
                  <p className="text-xs text-white/40 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]">
                    {assembly.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={selectAll}
                    className="text-[11px] font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors uppercase tracking-wider"
                    data-testid="assembly-select-all"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                  {selectedParts.size > 0 && (
                    <Button
                      size="sm"
                      onClick={searchAllSelected}
                      className="h-7 px-3 text-[11px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-tech uppercase tracking-wider"
                      data-testid="assembly-search-selected"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Search {selectedParts.size} Part{selectedParts.size !== 1 ? "s" : ""}
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {companionParts.map((part, idx) => {
                    const style = IMPORTANCE_STYLES[part.importance];
                    const isSelected = selectedParts.has(idx);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`relative rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-cyan-500/30 bg-cyan-500/[0.06] shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                        }`}
                        data-testid={`assembly-part-${idx}`}
                      >
                        <div className="flex items-start gap-3 p-3">
                          <button
                            onClick={() => togglePart(idx)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-cyan-500 border-cyan-500 text-white"
                                : "border-white/20 hover:border-cyan-500/50"
                            }`}
                            data-testid={`assembly-check-${idx}`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium text-sm text-white">{part.name}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${style.bg} ${style.text} border ${style.border} uppercase`}>
                                {style.label}
                              </span>
                              {part.partNumber && (
                                <span className="text-[10px] font-mono text-muted-foreground bg-white/[0.03] px-1.5 py-0.5 rounded">
                                  #{part.partNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-white/40 leading-relaxed">{part.description}</p>
                            {part.estimatedPrice && (
                              <span className="text-[11px] font-mono text-green-400/70 mt-1 inline-block">
                                Est. {part.estimatedPrice}
                              </span>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => searchForPart(part)}
                            className="h-8 px-2.5 text-[10px] text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 shrink-0"
                            data-testid={`assembly-search-${idx}`}
                          >
                            <Search className="w-3 h-3 mr-1" />
                            Search
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {assembly.tips && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/15">
                    <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-300/70 leading-relaxed">
                      <span className="font-medium text-amber-400">Pro Tip:</span> {assembly.tips}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <Info className="w-3.5 h-3.5 text-cyan-400/50 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    Assembly detected by AI. Search each part to compare prices across 104 retailers and find the best deal for every component.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
