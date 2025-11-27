import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Wallet, Mail, ArrowRight, Shield, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Nav from "@/components/Nav";

export default function AccountSetup() {
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="container mx-auto px-4 pt-24 pb-12 h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl h-full max-h-[800px]">
          
          {/* Left Column: Action */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-8 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
            
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/30 bg-secondary/5 text-secondary text-[10px] font-mono mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                GENESIS BLOCK OPEN // EARLY ACCESS
              </div>
              <h1 className="font-tech text-4xl font-bold uppercase tracking-wide mb-2">
                Initialize <span className="text-primary">AutoLedger</span> ID
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                JOIN THE FIRST ON-CHAIN AUTO PARTS CONSORTIUM
              </p>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-4 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Shield className="w-16 h-16 text-primary" />
              </div>
              <h3 className="font-tech font-bold text-lg uppercase text-foreground flex items-center gap-2">
                Claim Genesis Hallmark
                <span className="text-[10px] bg-primary text-black px-1.5 py-0.5 rounded font-bold">FREE</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3 max-w-[80%]">
                Mint your "Founder's Edition" Hallmark. Permanently records your early support on the AutoLedger Audit Trail.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-primary">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>0.00 ETH Gas (Sponsored)</span>
              </div>
            </Card>

            <div className="space-y-6">
              <Button variant="outline" className="w-full h-14 text-lg font-tech uppercase tracking-wider border-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all group">
                <Wallet className="w-6 h-6 mr-3 group-hover:text-primary transition-colors" />
                Connect Wallet (Web3)
                <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-mono">Or continue with email</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">First Name</label>
                    <Input className="bg-background/50 border-border focus:border-primary h-12" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">Last Name</label>
                    <Input className="bg-background/50 border-border focus:border-primary h-12" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Email Address</label>
                  <Input className="bg-background/50 border-border focus:border-primary h-12" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase">Password</label>
                  <Input type="password" className="bg-background/50 border-border focus:border-primary h-12" placeholder="••••••••" />
                </div>
              </div>

              <Button className="w-full h-14 text-lg font-tech uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 mt-4" onClick={() => setLocation('/')}>
                Create Account
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Benefits (Visual) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex flex-col justify-center space-y-6 p-8"
          >
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-xl uppercase mb-1">Decentralized Identity</h3>
                  <p className="text-sm text-muted-foreground">Your garage data belongs to you. Encrypted locally or on-chain.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-xl uppercase mb-1">Instant Checkout</h3>
                  <p className="text-sm text-muted-foreground">One-click payments with Stripe or Crypto. No more form filling.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-xl uppercase mb-1">Verified Parts</h3>
                  <p className="text-sm text-muted-foreground">NFT-backed authenticity certificates for high-value components.</p>
                </div>
              </div>
            </div>

            <Card className="mt-12 bg-black/40 border-primary/20 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-muted-foreground">CURRENT GAS FEE</span>
                <span className="font-mono text-xs text-green-400">LOW (12 Gwei)</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary/50" />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
