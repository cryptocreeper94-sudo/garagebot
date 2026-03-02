import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Layers, Search, ChevronDown, ChevronUp, Check,
  Sparkles, Shield, Star, CircleDot,
  ArrowRight, Package, Zap, Lightbulb
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

const IMPORTANCE_CONFIG = {
  required: {
    icon: Shield,
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    text: "text-red-400",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.1)]",
    label: "Required",
    dot: "bg-red-400",
  },
  recommended: {
    icon: Star,
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.1)]",
    label: "Recommended",
    dot: "bg-amber-400",
  },
  optional: {
    icon: CircleDot,
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    text: "text-sky-400",
    glow: "shadow-[0_0_8px_rgba(14,165,233,0.1)]",
    label: "Optional",
    dot: "bg-sky-400",
  },
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        data-testid="assembly-loading"
      >
        <Card className="overflow-hidden border-cyan-500/15 bg-gradient-to-br from-[#0a0f1e] via-[#0d1225] to-[#0a0f1e]">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-ping opacity-30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs sm:text-sm font-tech text-cyan-400 uppercase tracking-wider">Analyzing Assembly</p>
                  <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/25 text-[8px] sm:text-[9px] font-mono animate-pulse h-4">
                    <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                    AI
                  </Badge>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Finding companion parts for "{partName}"...</p>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.015] animate-pulse p-3 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-white/[0.06] shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3 w-2/5 rounded bg-white/[0.06]" />
                    <div className="h-2 w-3/5 rounded bg-white/[0.03]" />
                  </div>
                  <div className="h-6 w-12 rounded-md bg-cyan-500/[0.08] shrink-0" />
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/[0.03] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500/40 via-purple-500/30 to-cyan-500/40 rounded-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </Card>
      </motion.div>
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

  const requiredCount = companionParts.filter(p => p.importance === "required").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      data-testid="complete-assembly"
    >
      <Card className="overflow-hidden relative border-cyan-500/15 bg-gradient-to-br from-[#0a0f1e] via-[#0d1225] to-[#0a0f1e] shadow-[0_0_40px_rgba(6,182,212,0.06)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3.5 sm:p-5 flex items-center gap-2.5 sm:gap-4 active:bg-white/[0.03] sm:hover:bg-white/[0.015] transition-all duration-300 group relative"
          data-testid="assembly-toggle"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.15)] sm:group-hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-shadow duration-300">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
          </div>

          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="font-tech font-bold text-[13px] sm:text-base uppercase tracking-wider text-white sm:group-hover:text-cyan-50 transition-colors">
                Complete Assembly
              </h3>
              <Badge className="bg-gradient-to-r from-cyan-500/15 to-purple-500/15 text-cyan-400 border-cyan-500/25 text-[8px] sm:text-[9px] font-mono h-4 sm:h-5 px-1.5">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                AI
              </Badge>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
              <span className="text-white/50 font-medium">{assembly.assemblyName}</span>
              <span className="mx-1 sm:mx-1.5 text-white/15">|</span>
              <span>{companionParts.length} part{companionParts.length !== 1 ? "s" : ""}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {requiredCount > 0 && (
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[8px] sm:text-[9px] font-mono h-4 sm:h-5 px-1 sm:px-1.5 hidden xs:flex">
                <Shield className="w-2.5 h-2.5 mr-0.5" />
                {requiredCount}
              </Badge>
            )}
            <Badge variant="outline" className="text-[8px] sm:text-[9px] border-white/10 text-muted-foreground font-mono h-4 sm:h-5 px-1 sm:px-1.5">
              <Package className="w-2.5 h-2.5 mr-0.5" />
              {assembly.totalParts}
            </Badge>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? "bg-white/[0.06]" : "bg-white/[0.03]"}`}>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                {assembly.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-[10px] sm:text-[11px] text-white/35 bg-white/[0.02] rounded-lg px-3 py-2 sm:py-2.5 border border-white/[0.04] leading-relaxed"
                  >
                    {assembly.description}
                  </motion.p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/60 hover:text-cyan-400 active:text-cyan-300 transition-colors uppercase tracking-widest group/sel py-1"
                    data-testid="assembly-select-all"
                  >
                    <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${allSelected ? "bg-cyan-500 border-cyan-500" : "border-white/20 group-hover/sel:border-cyan-500/50"}`}>
                      {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {allSelected ? "Deselect" : "Select All"}
                    {selectedParts.size > 0 && !allSelected && (
                      <span className="text-white/25 ml-0.5">({selectedParts.size})</span>
                    )}
                  </button>

                  <AnimatePresence>
                    {selectedParts.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Button
                          size="sm"
                          onClick={searchAllSelected}
                          className="h-8 sm:h-8 px-3 sm:px-4 text-[10px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:from-cyan-600 active:to-blue-700 font-tech uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300"
                          data-testid="assembly-search-selected"
                        >
                          <Search className="w-3 h-3 mr-1" />
                          <span className="hidden xs:inline">Search </span>{selectedParts.size} Part{selectedParts.size !== 1 ? "s" : ""}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  {companionParts.map((part, idx) => {
                    const config = IMPORTANCE_CONFIG[part.importance];
                    const ImportanceIcon = config.icon;
                    const isSelected = selectedParts.has(idx);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + idx * 0.07, type: "spring", stiffness: 300, damping: 30 }}
                        className={`relative rounded-xl border transition-all duration-200 cursor-pointer group/part active:scale-[0.99] ${
                          isSelected
                            ? `border-cyan-500/30 bg-cyan-500/[0.05] ${config.glow}`
                            : "border-white/[0.05] bg-white/[0.015] sm:hover:border-white/[0.12] sm:hover:bg-white/[0.025] active:bg-white/[0.04]"
                        }`}
                        onClick={() => togglePart(idx)}
                        data-testid={`assembly-part-${idx}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                        )}

                        <div className="p-3 sm:p-3.5">
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            <div
                              className={`w-6 h-6 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                                isSelected
                                  ? "bg-cyan-500 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                  : "border-white/15 sm:group-hover/part:border-cyan-500/40"
                              }`}
                              data-testid={`assembly-check-${idx}`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>

                            <div className={`w-7 h-7 sm:w-7 sm:h-7 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                              <ImportanceIcon className={`w-3.5 h-3.5 ${config.text}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-medium text-[12px] sm:text-[13px] text-white leading-tight">{part.name}</span>
                                <span className={`text-[7px] sm:text-[8px] font-mono px-1 sm:px-1.5 py-px sm:py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border} uppercase tracking-wider font-semibold whitespace-nowrap`}>
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/30 leading-relaxed mt-0.5 line-clamp-2">{part.description}</p>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); searchForPart(part); }}
                              className="h-8 w-8 sm:h-8 sm:w-8 p-0 text-cyan-400/50 hover:text-cyan-400 active:text-cyan-300 hover:bg-cyan-500/10 active:bg-cyan-500/15 rounded-lg transition-all duration-200 shrink-0 -mr-1"
                              data-testid={`assembly-search-${idx}`}
                            >
                              <Search className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mt-2 ml-[3.25rem] sm:ml-[3.5rem] flex-wrap">
                            {part.estimatedPrice && (
                              <span className="text-[10px] sm:text-[11px] font-mono text-green-400/80 bg-green-500/[0.06] border border-green-500/15 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1">
                                {part.estimatedPrice}
                              </span>
                            )}
                            {part.partNumber && (
                              <span className="text-[9px] font-mono text-white/20 bg-white/[0.03] px-1.5 py-0.5 rounded">
                                #{part.partNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {assembly.tips && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/[0.06] to-amber-500/[0.02] border border-amber-500/15"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-tech text-amber-400 uppercase tracking-wider mb-0.5 font-semibold">Pro Tip</p>
                      <p className="text-[10px] sm:text-[11px] text-amber-200/50 leading-relaxed">
                        {assembly.tips}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center gap-2 px-0.5 pt-0.5 sm:pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400/40" />
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/20 uppercase tracking-wider">
                      AI-detected
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-white/[0.03]" />
                  <span className="text-[8px] sm:text-[9px] font-mono text-white/15">
                    104 retailers
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
