import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Hexagon, Shield, Award, CheckCircle, Car, Calendar, FileText,
  Hash, MapPin, Wrench, Clock, Loader2, ArrowRight, Copy, Check,
  Crown, Sparkles
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { BlockchainStatus } from "@/components/BlockchainStatus";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";
import hallmarkBadge from "@assets/generated_images/genesis_hallmark_badge_template.png";

interface Hallmark {
  id: string;
  userId: string;
  vehicleId: string;
  assetNumber: number;
  vinHash: string;
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    vin?: string;
  };
  metadata: {
    mintedAt: string;
    chain: string;
    txHash?: string;
  };
  createdAt: string;
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin?: string;
}

interface Subscription {
  status: 'active' | 'inactive' | 'canceled';
  tier?: string;
  isFounder?: boolean;
}

const HALLMARK_PRICING = {
  free: 9.99,
  pro: 1.99,
};

export default function GenesisHallmark() {
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [copiedAsset, setCopiedAsset] = useState<number | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: hallmark } = useQuery<Hallmark | null>({
    queryKey: ['hallmark', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/hallmark');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: allHallmarks = [] } = useQuery<Hallmark[]>({
    queryKey: ['allHallmarks'],
    queryFn: async () => {
      const res = await fetch('/api/hallmarks/recent');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const mintMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const res = await fetch('/api/hallmark/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId }),
      });
      if (!res.ok) throw new Error('Failed to mint hallmark');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Genesis Hallmark Minted!",
        description: "Your vehicle's digital passport has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Minting Failed",
        description: "Unable to create hallmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyAssetNumber = (num: number) => {
    navigator.clipboard.writeText(`GB-${num.toString().padStart(6, '0')}`);
    setCopiedAsset(num);
    setTimeout(() => setCopiedAsset(null), 2000);
  };

  const isPro = subscription?.status === 'active';
  const currentPrice = isPro ? HALLMARK_PRICING.pro : HALLMARK_PRICING.free;
  const savings = HALLMARK_PRICING.free - HALLMARK_PRICING.pro;
  const savingsPercent = Math.round((savings / HALLMARK_PRICING.free) * 100);

  return (
    <div className="min-h-screen text-foreground font-sans relative">
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      <Nav />
      
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
            <Hexagon className="w-5 h-5 text-purple-500" />
            <span className="font-tech text-sm uppercase text-purple-400">Genesis Hallmark</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-tech font-bold uppercase mb-3">
            Vehicle <span className="text-gradient">Passport</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Mint a unique digital certificate for your vehicle. Prove ownership, track history, 
            and increase resale value with blockchain-verified provenance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: Mint Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-tech text-xl uppercase">Mint Your Hallmark</h2>
                  <p className="text-sm text-muted-foreground">Create a vehicle passport</p>
                </div>
              </div>

              {hallmark ? (
                <div className="space-y-4">
                  {/* Visual Hallmark Badge */}
                  <div className="relative mx-auto w-48 h-48 mb-4">
                    <img 
                      src={hallmarkBadge} 
                      alt="Genesis Hallmark Badge" 
                      className="w-full h-full object-contain rounded-xl shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                      data-testid="img-hallmark-badge"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-tech text-[10px] uppercase tracking-wider text-purple-300/80 mb-1">Genesis Hallmark</span>
                      <span className="font-mono font-bold text-lg text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                        GB-{hallmark.assetNumber.toString().padStart(6, '0')}
                      </span>
                      <span className="font-tech text-[8px] uppercase tracking-wider text-cyan-300/80 mt-1">Verified</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Hallmark Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your Genesis Hallmark was minted on {new Date(hallmark.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-4 border border-border/40 rounded-lg bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Asset Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">
                          GB-{hallmark.assetNumber.toString().padStart(6, '0')}
                        </span>
                        <button 
                          onClick={() => copyAssetNumber(hallmark.assetNumber)}
                          className="text-muted-foreground hover:text-primary"
                          data-testid="button-copy-asset"
                        >
                          {copiedAsset === hallmark.assetNumber ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle</span>
                      <span className="font-medium">
                        {hallmark.vehicleInfo?.year} {hallmark.vehicleInfo?.make} {hallmark.vehicleInfo?.model}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">VIN Hash</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {hallmark.vinHash?.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                  
                  <BlockchainStatus 
                    entityType="hallmark" 
                    entityId={hallmark.id}
                    showVerifyButton={true}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Select Vehicle</Label>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger className="mt-2" data-testid="select-vehicle">
                        <SelectValue placeholder="Choose a vehicle to certify" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id} data-testid={`option-vehicle-${v.id}`}>
                            {v.year} {v.make} {v.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pricing Section with Pro/Free differentiation */}
                  <div className="space-y-3">
                    <div className={`p-4 rounded-lg space-y-2 ${isPro ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Hallmark Price</span>
                          {isPro && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
                              <Crown className="w-3 h-3 mr-1" /> Pro Rate
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          {isPro && (
                            <span className="text-sm text-muted-foreground line-through">${HALLMARK_PRICING.free.toFixed(2)}</span>
                          )}
                          <span className={`font-bold text-lg ${isPro ? 'text-yellow-400' : ''}`}>
                            ${currentPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {isPro && (
                        <p className="text-[11px] text-yellow-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          You're saving ${savings.toFixed(2)} ({savingsPercent}% off) as a Pro member!
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        One-time payment. Valid for vehicle lifetime.
                      </p>
                    </div>

                    {/* Upgrade prompt for free users */}
                    {!isPro && isAuthenticated && (
                      <Link href="/pro">
                        <Card className="p-3 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <div>
                                <p className="text-sm font-medium">Save {savingsPercent}% with Pro</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Hallmarks just ${HALLMARK_PRICING.pro.toFixed(2)} for Pro members
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-yellow-500" />
                          </div>
                        </Card>
                      </Link>
                    )}
                  </div>

                  <Button
                    onClick={() => mintMutation.mutate(selectedVehicle)}
                    disabled={!selectedVehicle || mintMutation.isPending || !isAuthenticated}
                    className={`w-full h-12 font-tech uppercase ${isPro 
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-500/90 hover:to-amber-500/90 text-black' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-500/90 hover:to-pink-500/90 text-white'
                    }`}
                    data-testid="button-mint-hallmark"
                  >
                    {mintMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Minting...</>
                    ) : (
                      <><Award className="w-5 h-5 mr-2" /> Mint Hallmark - ${currentPrice.toFixed(2)}</>
                    )}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-muted-foreground">
                      Please sign in to mint your Genesis Hallmark
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Benefits */}
            <Card className="mt-6 p-6 bg-card border-border/40">
              <h3 className="font-tech uppercase text-primary mb-4">Hallmark Benefits</h3>
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Blockchain-verified ownership proof" },
                  { icon: FileText, text: "Complete service history on-chain" },
                  { icon: Award, text: "Increase resale value by 5-10%" },
                  { icon: Clock, text: "Lifetime validity - never expires" },
                  { icon: MapPin, text: "Chain of custody tracking" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right: Recent Hallmarks / Ledger */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border/40 overflow-hidden">
              <div className="p-4 border-b border-border/40 bg-muted/30">
                <h3 className="font-tech uppercase text-primary flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Genesis Ledger
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Recently minted hallmarks
                </p>
              </div>
              
              <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                {allHallmarks.length > 0 ? (
                  allHallmarks.slice(0, 10).map((h) => (
                    <div 
                      key={h.id}
                      className="p-4 hover:bg-muted/20 transition-colors"
                      data-testid={`hallmark-entry-${h.assetNumber}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-mono">
                          GB-{h.assetNumber.toString().padStart(6, '0')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {h.vehicleInfo?.year} {h.vehicleInfo?.make} {h.vehicleInfo?.model}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Hexagon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hallmarks minted yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Be among the first to create a vehicle passport!
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <Card className="p-4 text-center bg-card border-border/40">
                <p className="text-2xl font-bold text-primary" data-testid="text-total-minted">{allHallmarks.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Minted</p>
              </Card>
              <Card className="p-4 text-center bg-card border-border/40">
                <div className="flex flex-col">
                  <p className="text-2xl font-bold text-green-400">${HALLMARK_PRICING.pro}</p>
                  <p className="text-xs text-muted-foreground">Pro Price</p>
                </div>
              </Card>
              <Card className="p-4 text-center bg-card border-border/40">
                <p className="text-2xl font-bold text-purple-400">∞</p>
                <p className="text-xs text-muted-foreground">Validity</p>
              </Card>
            </div>

            {/* Pricing Comparison */}
            <Card className="mt-6 p-4 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border-yellow-500/20">
              <h3 className="font-tech uppercase text-sm text-yellow-500 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4" /> Hallmark Pricing
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Free users</span>
                  <span className="font-medium">${HALLMARK_PRICING.free.toFixed(2)}/vehicle</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-500 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Pro members
                  </span>
                  <span className="font-bold text-yellow-400">${HALLMARK_PRICING.pro.toFixed(2)}/vehicle</span>
                </div>
                <div className="pt-2 mt-2 border-t border-yellow-500/20">
                  <p className="text-xs text-muted-foreground text-center">
                    Pro members save <span className="text-yellow-400 font-medium">${savings.toFixed(2)}</span> ({savingsPercent}% off) per vehicle
                  </p>
                </div>
              </div>
            </Card>

            {/* How it Works */}
            <Card className="mt-6 p-6 bg-muted/20 border-border/40">
              <h3 className="font-tech uppercase text-sm text-muted-foreground mb-4">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: 1, text: "Add your vehicle to My Garage" },
                  { step: 2, text: `Select vehicle and pay minting fee` },
                  { step: 3, text: "Receive unique asset number (GB-XXXXXX)" },
                  { step: 4, text: "Share hallmark when selling to prove history" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {step}
                    </div>
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
