import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, ShoppingCart, Wrench, Shield, Star, Clock, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const FEATURES = [
  { 
    name: "Parts Search", 
    description: "Search 15M+ parts across all major retailers", 
    icon: Zap, 
    status: "live" 
  },
  { 
    name: "My Garage", 
    description: "Save your vehicles for quick part matching", 
    icon: Car, 
    status: "live" 
  },
  { 
    name: "Cart & Checkout", 
    description: "Secure payments via Stripe", 
    icon: ShoppingCart, 
    status: "live" 
  },
  { 
    name: "Order Tracking", 
    description: "Track all orders in one place", 
    icon: Clock, 
    status: "coming" 
  },
  { 
    name: "Genesis Hallmark", 
    description: "On-chain vehicle identity & history", 
    icon: Shield, 
    status: "coming" 
  },
  { 
    name: "Service Scheduling", 
    description: "Book mechanics & service appointments", 
    icon: Wrench, 
    status: "coming" 
  },
  { 
    name: "Ratings & Reviews", 
    description: "Community ratings for shops & vendors", 
    icon: Star, 
    status: "coming" 
  },
  { 
    name: "Insurance Comparison", 
    description: "Compare auto, boat & RV insurance rates", 
    icon: FileText, 
    status: "coming" 
  },
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("autoledger_onboarding_seen");
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("autoledger_onboarding_seen", "true");
    setIsOpen(false);
  };

  const handleRemindLater = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleRemindLater}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] border border-primary/30 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.2)]"
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-onboarding"
          >
            <div className="relative p-6">
              <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                data-testid="button-close-onboarding"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  WELCOME TO AUTOLEDGER
                </div>
                
                <h2 className="text-2xl md:text-3xl font-tech font-bold uppercase mb-2">
                  Build Your <span className="text-primary">Garage</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  The all-in-one on-chain solution for automotive parts, services & more.
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {FEATURES.map((feature, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      feature.status === "live" 
                        ? "bg-primary/5 border-primary/20 hover:border-primary/40" 
                        : "bg-white/5 border-white/10 opacity-60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      feature.status === "live" ? "bg-primary/20" : "bg-white/10"
                    }`}>
                      <feature.icon className={`w-5 h-5 ${
                        feature.status === "live" ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{feature.name}</span>
                        {feature.status === "live" ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] px-1.5 py-0">
                            LIVE
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] px-1.5 py-0">
                            COMING SOON
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Link href="/garage">
                  <Button 
                    className="w-full h-12 font-tech uppercase bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    onClick={handleDismiss}
                    data-testid="button-create-garage"
                  >
                    <Car className="w-5 h-5 mr-2" />
                    Create Your Garage - It's Free
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full h-10 font-tech uppercase border-white/20 hover:bg-white/5"
                  onClick={handleDismiss}
                  data-testid="button-browse-deals"
                >
                  Browse Deals Instead
                </Button>

                <button 
                  onClick={handleRemindLater}
                  className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors py-2"
                  data-testid="button-remind-later"
                >
                  Remind me later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
