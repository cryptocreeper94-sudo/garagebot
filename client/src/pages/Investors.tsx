import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp, DollarSign, Users, Zap, Shield, Globe, 
  Target, Rocket, BarChart3, CheckCircle, Mail, Building2,
  Car, Bike, Anchor, Truck, Wrench
} from "lucide-react";

export default function Investors() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = () => {
    toast({ title: "Message Sent", description: "We'll be in touch soon!" });
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Nav />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30 font-mono">
              INVESTMENT OPPORTUNITY
            </Badge>
            <h1 className="text-4xl md:text-6xl font-tech font-bold uppercase mb-4">
              The Future of <span className="text-primary">Vehicle Ownership</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              AutoLedger is building the definitive platform for automotive parts aggregation, 
              vehicle history management, and on-chain vehicle identity. Join us in revolutionizing 
              how 280 million vehicle owners in the US maintain their machines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { icon: DollarSign, value: "$400B+", label: "US Aftermarket Industry" },
              { icon: Users, value: "280M", label: "Vehicles in the US" },
              { icon: Zap, value: "20+", label: "Integrated Retailers" },
              { icon: Shield, value: "100%", label: "On-Chain Verified" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center bg-card/50 border-primary/20">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-tech font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 bg-gradient-to-br from-card to-primary/5 border-primary/30">
              <h2 className="text-2xl font-tech uppercase mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" /> The Problem
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Vehicle owners waste hours searching multiple sites for the best parts prices</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Service history is fragmented across paper records and incompatible systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>No unified platform for all vehicle types (cars, boats, ATVs, RVs, motorcycles)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Insurance comparison is confusing and time-consuming</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-card to-green-500/5 border-green-500/30">
              <h2 className="text-2xl font-tech uppercase mb-6 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-green-400" /> Our Solution
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>One search, 20+ retailers - find the best price with local pickup priority</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Vehicle Passport with VIN-based history, recalls, and maintenance tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Genesis Hallmark - blockchain-verified vehicle identity and history</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI-powered assistant that understands natural language queries</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-tech uppercase mb-8 text-center">
              <BarChart3 className="w-6 h-6 inline mr-2 text-primary" />
              Revenue Streams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Affiliate Commissions", 
                  desc: "3-8% on parts purchases through our platform",
                  projected: "$50K-200K/month at scale"
                },
                { 
                  title: "Pro Subscriptions", 
                  desc: "$2.99/month for unlimited vehicles, alerts, priority AI",
                  projected: "10K subscribers = $30K MRR"
                },
                { 
                  title: "Genesis Hallmark Minting", 
                  desc: "$2 per vehicle digital collectible",
                  projected: "Ongoing revenue stream"
                },
                { 
                  title: "Insurance Affiliates", 
                  desc: "$10-25 per qualified lead to insurance carriers",
                  projected: "High-margin, growing market"
                },
                { 
                  title: "Shop Portal Subscriptions", 
                  desc: "$20-50/month per mechanic shop",
                  projected: "B2B recurring revenue"
                },
                { 
                  title: "Advertising", 
                  desc: "Display ads and sponsored listings from vendors",
                  projected: "At scale, significant revenue"
                },
              ].map((stream, i) => (
                <Card key={i} className="p-6 bg-card/50">
                  <h3 className="font-tech uppercase text-lg mb-2">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{stream.desc}</p>
                  <Badge variant="outline" className="text-xs">{stream.projected}</Badge>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-tech uppercase mb-8 text-center">
              <Globe className="w-6 h-6 inline mr-2 text-primary" />
              All Vehicle Types
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: Car, label: "Cars & Trucks" },
                { icon: Truck, label: "Diesel & Commercial" },
                { icon: Bike, label: "Motorcycles" },
                { icon: Anchor, label: "Boats & PWC" },
                { icon: Truck, label: "RVs & Motorhomes" },
                { icon: Wrench, label: "ATVs & UTVs" },
              ].map((type, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full">
                  <type.icon className="w-5 h-5 text-primary" />
                  <span className="font-tech">{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-card to-primary/5 border-primary/30">
            <h2 className="text-2xl font-tech uppercase mb-6 text-center">
              <Mail className="w-6 h-6 inline mr-2 text-primary" />
              Get in Touch
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="mt-1"
                    data-testid="input-investor-name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="mt-1"
                    data-testid="input-investor-email"
                  />
                </div>
              </div>
              <div>
                <Label>Company / Fund</Label>
                <Input 
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  className="mt-1"
                  data-testid="input-investor-company"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="mt-1"
                  rows={4}
                  placeholder="Tell us about your interest in AutoLedger..."
                  data-testid="input-investor-message"
                />
              </div>
              <Button 
                className="w-full font-tech uppercase glow-primary"
                onClick={handleSubmit}
                data-testid="button-send-investor-message"
              >
                Send Message
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Or email us directly at <a href="mailto:investors@autoledger.io" className="text-primary hover:underline">investors@autoledger.io</a>
            </p>
          </Card>

          <div className="text-center mt-16">
            <Badge className="bg-secondary/20 text-secondary border-secondary/30 font-mono text-sm py-2 px-4">
              <Building2 className="w-4 h-4 inline mr-2" />
              DarkWave Studios LLC — Building the Future of Vehicle Ownership
            </Badge>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
