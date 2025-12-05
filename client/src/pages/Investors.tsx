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
  Car, Bike, Anchor, Truck, Wrench, Calendar, Flag, Star,
  Sparkles, Database, Brain, Store, Link2, Award
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
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30 font-mono">
              INVESTMENT OPPORTUNITY
            </Badge>
            <h1 className="text-4xl md:text-6xl font-tech font-bold uppercase mb-4">
              The Future of <span className="text-primary">Vehicle Ownership</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              GarageBot is building the definitive platform for automotive parts aggregation, 
              vehicle history management, and on-chain vehicle identity. Join us in revolutionizing 
              how 280 million vehicle owners in the US maintain their machines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { icon: DollarSign, value: "$400B+", label: "US Aftermarket Industry" },
              { icon: Users, value: "280M", label: "Vehicles in the US" },
              { icon: Zap, value: "40+", label: "Integrated Retailers" },
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

          {/* Comprehensive Roadmap Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30 font-mono">
                <Calendar className="w-3 h-3 inline mr-1" /> PRODUCT ROADMAP
              </Badge>
              <h2 className="text-3xl font-tech uppercase mb-4">
                Building the <span className="text-primary">Future</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our phased approach to becoming the definitive platform for vehicle ownership and maintenance.
              </p>
            </div>

            <div className="relative">
              {/* Timeline connector */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-primary to-purple-500" />

              {/* Phase 1 - Foundation (Completed) */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative mb-12"
              >
                <div className="flex items-center gap-4 mb-4 md:justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center z-10">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="md:absolute md:left-[calc(50%+40px)]">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">COMPLETED</Badge>
                    <h3 className="text-xl font-tech uppercase">Phase 1: Foundation</h3>
                    <p className="text-sm text-muted-foreground">Q4 2024</p>
                  </div>
                </div>
                <Card className="ml-20 md:ml-0 md:mr-[calc(50%+30px)] p-6 bg-green-500/5 border-green-500/20">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Parts Aggregator MVP:</strong> 40+ retailers integrated with unified search</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>My Garage:</strong> Vehicle management with VIN decoding & NHTSA recalls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Buddy AI Assistant:</strong> Conversational parts finder with memory</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Genesis Hallmark:</strong> Blockchain-verified vehicle passports on Solana</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>DIY Repair Guides:</strong> AI-generated step-by-step maintenance instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Pro Subscriptions:</strong> Founders Circle pricing with Stripe integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Release Version Control:</strong> Timestamped version tracking with changelogs</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>

              {/* Phase 2 - Growth (Current) */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative mb-12"
              >
                <div className="flex items-center gap-4 mb-4 md:justify-center md:flex-row-reverse">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10 animate-pulse">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                  <div className="md:absolute md:right-[calc(50%+40px)] md:text-right">
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-1">IN PROGRESS</Badge>
                    <h3 className="text-xl font-tech uppercase">Phase 2: Growth</h3>
                    <p className="text-sm text-muted-foreground">Q1-Q2 2025</p>
                  </div>
                </div>
                <Card className="ml-20 md:ml-[calc(50%+30px)] p-6 bg-primary/5 border-primary/20">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Affiliate Network Tier 2:</strong> Product data feeds with real pricing & images</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>SMS Service Reminders:</strong> Twilio-powered maintenance notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Shop Portal V2:</strong> Full mechanic management with estimates & scheduling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Insurance Comparison:</strong> Multi-carrier quotes for auto, boat, RV</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Community Ratings:</strong> User reviews for parts, shops, and vendors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Mobile App (PWA):</strong> Native-like experience on iOS and Android</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>

              {/* Phase 3 - Expansion */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative mb-12"
              >
                <div className="flex items-center gap-4 mb-4 md:justify-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center z-10">
                    <Database className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="md:absolute md:left-[calc(50%+40px)]">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-1">Q3-Q4 2025</Badge>
                    <h3 className="text-xl font-tech uppercase">Phase 3: Expansion</h3>
                    <p className="text-sm text-muted-foreground">Data & Partnerships</p>
                  </div>
                </div>
                <Card className="ml-20 md:ml-0 md:mr-[calc(50%+30px)] p-6 bg-yellow-500/5 border-yellow-500/20">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Direct Retailer APIs:</strong> Real-time inventory & pricing from major retailers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Smartcar Integration:</strong> Live vehicle data from 30+ connected car brands</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span><strong>OBD-II Diagnostics:</strong> Real-time fault code reading and recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Fleet Management:</strong> Multi-vehicle dashboards for businesses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Video Repair Guides:</strong> AI-curated YouTube integration per step</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flag className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Dealership Network:</strong> New car dealer partnerships for service history</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>

              {/* Phase 4 - Scale */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative mb-12"
              >
                <div className="flex items-center gap-4 mb-4 md:justify-center md:flex-row-reverse">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center z-10">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="md:absolute md:right-[calc(50%+40px)] md:text-right">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-1">2026</Badge>
                    <h3 className="text-xl font-tech uppercase">Phase 4: Scale</h3>
                    <p className="text-sm text-muted-foreground">AI & Marketplace</p>
                  </div>
                </div>
                <Card className="ml-20 md:ml-[calc(50%+30px)] p-6 bg-purple-500/5 border-purple-500/20">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>AI Predictive Maintenance:</strong> Machine learning for failure prediction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Parts Marketplace:</strong> P2P used parts marketplace with verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Vehicle Passport NFTs:</strong> Transferable ownership records on-chain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>AR Part Identification:</strong> Point your phone at a part to identify it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Global Expansion:</strong> Launch in Canada, UK, and Australia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Enterprise Solutions:</strong> White-label platform for dealership groups</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>

              {/* Vision */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-purple-500 to-green-500 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                </div>
                <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/10 via-purple-500/10 to-green-500/10 border-primary/30 text-center">
                  <h3 className="text-2xl font-tech uppercase mb-4 text-primary">The Vision</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    By 2027, GarageBot will be the <strong className="text-foreground">definitive platform</strong> for 
                    vehicle ownership — the place every owner goes to find parts, track maintenance, verify history, 
                    and connect with services. A single source of truth for every vehicle on the road.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-tech font-bold text-primary">1M+</div>
                      <div className="text-xs text-muted-foreground uppercase">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-tech font-bold text-green-400">$10M+</div>
                      <div className="text-xs text-muted-foreground uppercase">ARR Target</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-tech font-bold text-purple-400">100+</div>
                      <div className="text-xs text-muted-foreground uppercase">Retail Partners</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
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
                  placeholder="Tell us about your interest in GarageBot..."
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
              Or email us directly at <a href="mailto:investors@garagebot.io" className="text-primary hover:underline">investors@garagebot.io</a>
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
