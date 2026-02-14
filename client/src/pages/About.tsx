import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Wrench, Users, Target, Sparkles, Car, Heart, Globe, ChevronLeft } from "lucide-react";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-tech font-bold uppercase text-primary" data-testid="heading-about">About GarageBot</h1>
              <p className="text-muted-foreground text-sm font-mono">Last Updated: February 2026</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            DarkWave Studios LLC
          </Badge>
        </motion.div>

        <div className="space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Our Mission</h2>
                  <div className="space-y-3 text-muted-foreground" data-testid="text-mission">
                    <p className="text-2xl font-tech text-primary font-bold">"Right Part. First Time. Every Engine."</p>
                    <p>GarageBot exists to eliminate the frustration of searching for parts across dozens of websites. We believe every vehicle owner — whether you drive a car, ride a motorcycle, pilot a boat, or fly a drone — deserves a single place to find the right part at the best price.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Heart className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Our Story</h2>
                  <div className="space-y-3 text-muted-foreground" data-testid="text-story">
                    <p>GarageBot was born from <strong className="text-foreground">35+ years of frustration</strong> searching multiple retailer websites for automotive parts. The founder, a lifelong gearhead and mechanic, spent countless hours jumping between AutoZone, O'Reilly, Amazon, RockAuto, and dozens of other sites just to compare prices on a single brake pad set.</p>
                    <p>The idea was simple: <strong className="text-foreground">what if one platform could search them all?</strong> Not just cars and trucks, but every motorized vehicle imaginable — from motorcycles and ATVs to boats, RVs, and even drones.</p>
                    <p>Founded by <strong className="text-foreground">DarkWave Studios LLC</strong>, GarageBot launched with a mission to be the ultimate parts aggregator for every engine, every vehicle, every rider, driver, and builder.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Car className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">What GarageBot Does</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>GarageBot aggregates <strong className="text-foreground">68+ retailers</strong> into a single, powerful search platform with real-time price comparison. We cover <strong className="text-foreground">ALL motorized vehicles</strong>:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                      {[
                        "Cars", "Trucks", "Motorcycles", "ATVs",
                        "Boats", "RVs", "Tractors", "Heavy Equipment",
                        "Generators", "Small Engines", "Aviation", "RC Cars",
                        "Drones", "Model Aircraft", "Go-Karts", "Golf Carts"
                      ].map((vehicle) => (
                        <Badge key={vehicle} variant="outline" className="justify-center py-1.5 bg-card border-border/50 text-muted-foreground">
                          {vehicle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Key Features</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Buddy AI Assistant</strong> — Your personal parts-finding companion powered by AI. Ask Buddy anything about parts, fitment, or repairs.</li>
                      <li><strong className="text-foreground">Vehicle Passport with VIN Decoding</strong> — Decode any VIN to get full vehicle specs, recall alerts, and personalized part recommendations.</li>
                      <li><strong className="text-foreground">Genesis Hallmark NFTs</strong> — Blockchain-verified digital certificates for your vehicles, creating an immutable ownership and identity record.</li>
                      <li><strong className="text-foreground">TORQUE</strong> — A complete shop management OS for professional mechanics and DIY enthusiasts.</li>
                      <li><strong className="text-foreground">DIY Repair Guides</strong> — AI-generated step-by-step maintenance and repair instructions tailored to your specific vehicle.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">The DarkWave Studios Ecosystem</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>GarageBot is part of the <strong className="text-foreground">DarkWave Studios</strong> ecosystem — a suite of interconnected platforms built on trust, transparency, and cutting-edge technology:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Trust Layer</strong> — Decentralized identity and authentication layer for secure cross-platform access</li>
                      <li><strong className="text-foreground">ORBIT</strong> — Staffing and operations management platform</li>
                      <li><strong className="text-foreground">TrustShield</strong> — Reputation and trust verification system for businesses and individuals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Our Team</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>GarageBot is built by a <strong className="text-foreground">small, dedicated team of automotive enthusiasts and engineers</strong>. We're gearheads, shade-tree mechanics, off-roaders, boat builders, and drone pilots who understand the struggle of finding the right part.</p>
                    <p>Every feature we build comes from real-world experience working on vehicles. We don't just build software — we use it in our own garages, shops, and projects.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
            <Card className="p-6 bg-card/50 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-tech uppercase mb-3">Get In Touch</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>We'd love to hear from you — whether you have feedback, partnership ideas, or just want to talk shop.</p>
                    <p>Email: <a href="mailto:support@garagebot.io" className="text-primary hover:underline">support@garagebot.io</a></p>
                    <p className="text-sm mt-4">GarageBot is operated by <strong className="text-foreground">DarkWave Studios LLC</strong>.</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
