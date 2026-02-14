import { useState, useEffect, useCallback, useRef } from "react";
import { useTorqueTenant } from "@/hooks/useTorqueTenant";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import {
  FileText, Calendar, Users, BarChart3, DollarSign, Shield,
  CheckCircle, ArrowRight, Play, Zap, Star, Download,
  Car, Truck, Bike, Ship, Cog, Anchor, Tractor, Mountain,
  Lock, Database, Coins, Menu, X, Package, ChevronDown,
  ChevronLeft, ChevronRight, Wrench, Clock, MessageSquare,
  Globe, Sparkles, TrendingUp, Award, Settings, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: FileText, title: "Repair Orders & Estimates", description: "Create professional estimates and repair orders in seconds. Convert estimates to work orders with one click.", highlight: "Save 2+ hours daily", color: "#00D9FF" },
  { icon: Calendar, title: "Smart Scheduling", description: "Online booking, automated reminders, and a visual calendar that keeps your bays full and customers happy.", highlight: "Reduce no-shows by 60%", color: "#8B5CF6" },
  { icon: Users, title: "Customer Management", description: "Complete customer history, vehicle records, and communication tools all in one place.", highlight: "Build lasting relationships", color: "#10B981" },
  { icon: BarChart3, title: "Real-Time Analytics", description: "Track revenue, technician productivity, and shop efficiency with live dashboards.", highlight: "Data-driven decisions", color: "#F59E0B" },
  { icon: DollarSign, title: "Integrated Payments", description: "Accept cards, send digital invoices, and get paid faster with built-in Stripe payment processing.", highlight: "Get paid same-day", color: "#EC4899" },
  { icon: Package, title: "68+ Parts Vendors", description: "Search across 68+ parts retailers instantly. Compare prices, find availability, and order directly.", highlight: "Best prices guaranteed", color: "#06B6D4" },
];

const BENTO_ITEMS = [
  { id: "orders", title: "Repair Orders", stat: "∞", desc: "Unlimited", icon: FileText, span: "col-span-1", accent: "#00D9FF" },
  { id: "search", title: "Parts Search", stat: "68+", desc: "Retailers", icon: Package, span: "col-span-1", accent: "#8B5CF6" },
  { id: "analytics", title: "Live Analytics", stat: "24/7", desc: "Real-time", icon: BarChart3, span: "col-span-1", accent: "#10B981" },
  { id: "ai", title: "AI Assistant", stat: "Buddy", desc: "AI-Powered", icon: Sparkles, span: "md:col-span-2", accent: "#F59E0B" },
  { id: "blockchain", title: "Trust Layer", stat: "L1", desc: "Blockchain Verified", icon: Shield, span: "col-span-1", accent: "#EC4899" },
  { id: "payments", title: "Stripe Payments", stat: "$0", desc: "Processing fees", icon: DollarSign, span: "col-span-1", accent: "#06B6D4" },
  { id: "schedule", title: "Smart Scheduling", stat: "60%", desc: "Fewer no-shows", icon: Calendar, span: "col-span-1", accent: "#8B5CF6" },
  { id: "vehicles", title: "Vehicle Types", stat: "12", desc: "Categories", icon: Car, span: "md:col-span-2", accent: "#00D9FF" },
  { id: "api", title: "Partner API", stat: "REST", desc: "Full access", icon: Globe, span: "col-span-1", accent: "#10B981" },
];

const COMPARISON = [
  { feature: "Monthly Price", torque: "$49", autoleap: "$179", tekmetric: "$179", shopmonkey: "$179" },
  { feature: "Unlimited Users", torque: true, autoleap: false, tekmetric: false, shopmonkey: false },
  { feature: "Repair Orders", torque: "Unlimited", autoleap: "Unlimited", tekmetric: "Unlimited", shopmonkey: "Unlimited" },
  { feature: "Parts Search (68+)", torque: true, autoleap: false, tekmetric: false, shopmonkey: false },
  { feature: "AI Assistant", torque: true, autoleap: false, tekmetric: false, shopmonkey: false },
  { feature: "Blockchain Verified", torque: true, autoleap: false, tekmetric: false, shopmonkey: false },
  { feature: "Customer Portal", torque: true, autoleap: true, tekmetric: true, shopmonkey: true },
  { feature: "Mobile Access", torque: true, autoleap: true, tekmetric: true, shopmonkey: true },
  { feature: "DIY Guides Library", torque: true, autoleap: false, tekmetric: false, shopmonkey: false },
  { feature: "Marketing Hub", torque: "Add-on", autoleap: "$345+", tekmetric: false, shopmonkey: false },
];

const VEHICLE_TYPES = [
  { id: "car", name: "Cars", icon: Car },
  { id: "truck", name: "Trucks", icon: Truck },
  { id: "motorcycle", name: "Motorcycles", icon: Bike },
  { id: "atv", name: "ATVs/UTVs", icon: Mountain },
  { id: "boat", name: "Boats/Marine", icon: Anchor },
  { id: "rv", name: "RVs", icon: Truck },
  { id: "diesel", name: "Diesel", icon: Truck },
  { id: "small_engine", name: "Small Engines", icon: Cog },
  { id: "generator", name: "Generators", icon: Zap },
  { id: "tractor", name: "Tractors", icon: Tractor },
  { id: "classic", name: "Classics", icon: Car },
  { id: "exotic", name: "Exotics", icon: Car },
];

const TESTIMONIALS = [
  { name: "Mike's Auto Care", location: "Dallas, TX", quote: "Finally, software that doesn't cost more than my rent. The parts search alone saves me hours every week.", rating: 5, vehicles: "Auto, Truck" },
  { name: "Coastal Marine Repair", location: "Tampa, FL", quote: "Works great for our boat repair shop. Other software only handles cars - this handles everything.", rating: 5, vehicles: "Marine, PWC" },
  { name: "Summit Truck Service", location: "Denver, CO", quote: "Switched from AutoLeap. Same features, a third of the price. No brainer.", rating: 5, vehicles: "Diesel, Heavy Duty" },
  { name: "Valley Powersports", location: "Phoenix, AZ", quote: "Managing ATV and motorcycle repairs was a nightmare before TORQUE. Now everything's in one place.", rating: 5, vehicles: "ATV, Motorcycle" },
  { name: "Precision Classics", location: "Nashville, TN", quote: "The blockchain verification gives our customers confidence in our restoration work. Total game-changer.", rating: 5, vehicles: "Classic, Exotic" },
];

const FAQ_ITEMS = [
  { q: "How is TORQUE different from AutoLeap or Tekmetric?", a: "TORQUE offers the same core features — repair orders, scheduling, payments, analytics — at $49/month instead of $179+. Plus we include 68+ parts vendor search, AI assistant, blockchain verification, and support for ALL vehicle types (not just cars)." },
  { q: "What vehicle types does TORQUE support?", a: "Every motorized vehicle: cars, trucks, motorcycles, ATVs/UTVs, boats & marine, RVs, diesel/commercial, small engines, generators, tractors & farm equipment, classic cars, and exotics." },
  { q: "What is Trust Layer blockchain verification?", a: "Trust Layer is a Layer 1 blockchain by DarkWave Studios. When you verify your shop on TORQUE, your identity is recorded on-chain so customers can verify your legitimacy. Repair records are cryptographically signed and tamper-proof." },
  { q: "Can I accept payments through TORQUE?", a: "Yes! TORQUE integrates with Stripe for payment processing. Accept credit/debit cards, send digital invoices, and get paid same-day. Setup takes less than 5 minutes during onboarding." },
  { q: "Is there a free trial?", a: "Absolutely. Start with a 30-day free trial — full access to all features, unlimited repair orders, up to 3 users. No credit card required." },
  { q: "Can I use TORQUE on my phone?", a: "Yes! TORQUE is a Progressive Web App (PWA). Install it directly to your phone's home screen for a native app experience — works offline, sends notifications, and runs full-speed." },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

function AccordionItem({ item, isOpen, onToggle, index }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/10 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
        data-testid={`faq-toggle-${index}`}
      >
        <span className="text-white font-medium pr-4 group-hover:text-[#00D9FF] transition-colors">{item.q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-zinc-400 text-sm pb-5 px-1 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent(prev => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
    startTimer();
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="relative" data-testid="testimonial-carousel">
      <div className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Card className="p-8 md:p-12 bg-gradient-to-br from-[#0f172a] to-[#131c33] border-white/10">
              <div className="flex gap-1 mb-6">
                {[...Array(TESTIMONIALS[current].rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xl md:text-2xl text-white font-light leading-relaxed mb-8 italic">
                "{TESTIMONIALS[current].quote}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{TESTIMONIALS[current].name}</p>
                  <p className="text-zinc-500">{TESTIMONIALS[current].location}</p>
                </div>
                <Badge className="bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]">{TESTIMONIALS[current].vehicles}</Badge>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={() => go(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" data-testid="carousel-prev">
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); startTimer(); }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-[#00D9FF] w-8" : "bg-white/20 hover:bg-white/40"}`}
              data-testid={`carousel-dot-${i}`}
            />
          ))}
        </div>
        <button onClick={() => go(1)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors" data-testid="carousel-next">
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}

function CountUpNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) { setStarted(true); }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function TorqueLanding() {
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredBento, setHoveredBento] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  useTorqueTenant();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
  }, [deferredPrompt]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      {/* SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0a0e1a] flex flex-col items-center justify-center"
            data-testid="splash-screen"
          >
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center">
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto border-2 border-[#00D9FF]/30 rounded-full flex items-center justify-center"
                >
                  <Wrench className="w-10 h-10 text-[#00D9FF]" />
                </motion.div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full" style={{ boxShadow: "0 0 60px rgba(0,217,255,0.3), 0 0 120px rgba(0,217,255,0.1)" }} />
              </div>
              <h1 className="text-5xl sm:text-7xl font-tech font-bold tracking-wider mb-3" style={{ color: "#00D9FF", textShadow: "0 0 40px rgba(0,217,255,0.5), 0 0 80px rgba(0,217,255,0.2)" }}>
                TORQUE
              </h1>
              <p className="text-zinc-500 text-sm font-sans tracking-widest uppercase">Shop Management OS</p>
              <p className="text-zinc-600 text-xs font-sans mt-2">Powered by <span className="text-[#00D9FF]/70">Trust Layer</span></p>
              <div className="mt-8">
                <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2" data-testid="link-logo">
            <Wrench className="w-6 h-6 text-[#00D9FF]" />
            <span className="font-tech text-xl font-bold tracking-wider text-[#00D9FF]">TORQUE</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            {["features", "pricing", "trustlayer", "faq"].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm text-zinc-400 hover:text-white transition-colors capitalize" data-testid={`link-${id}`}>
                {id === "trustlayer" ? "Trust Layer" : id === "faq" ? "FAQ" : id}
              </button>
            ))}
            {showInstall && (
              <Button size="sm" variant="outline" className="border-[#00D9FF]/30 text-[#00D9FF] gap-1" onClick={handleInstall} data-testid="button-install-nav">
                <Download className="w-4 h-4" /> Install
              </Button>
            )}
            <Link href="/torque/onboard">
              <Button size="sm" className="bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold" data-testid="button-get-started-nav">
                Get Started
              </Button>
            </Link>
          </div>
          <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/10">
              <div className="px-4 py-4 flex flex-col gap-3">
                {["features", "pricing", "trustlayer", "faq"].map(id => (
                  <button key={id} onClick={() => scrollTo(id)} className="text-left text-zinc-300 hover:text-white py-2 capitalize" data-testid={`link-${id}-mobile`}>
                    {id === "trustlayer" ? "Trust Layer" : id === "faq" ? "FAQ" : id}
                  </button>
                ))}
                {showInstall && (
                  <Button variant="outline" className="border-[#00D9FF]/30 text-[#00D9FF] gap-1" onClick={handleInstall} data-testid="button-install-mobile">
                    <Download className="w-4 h-4" /> Install App
                  </Button>
                )}
                <Link href="/torque/onboard">
                  <Button className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold" data-testid="button-get-started-mobile">Get Started</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <motion.section ref={heroRef} id="hero" style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-24 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(0,217,255,0.4) 0%, transparent 60%)" }} />
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00D9FF]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,217,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <Badge className="bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF] mb-8 text-sm px-5 py-2 backdrop-blur-sm" data-testid="badge-trust-layer-hero">
              <Shield className="w-4 h-4 mr-2" /> Verified on Trust Layer Blockchain
            </Badge>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            className="font-tech font-bold tracking-wider mb-4 text-7xl sm:text-8xl lg:text-[10rem] leading-none"
            style={{ color: "#00D9FF", textShadow: "0 0 80px rgba(0,217,255,0.4), 0 0 160px rgba(0,217,255,0.1)" }}
            data-testid="text-hero-title"
          >
            TORQUE
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
            className="font-tech text-xl sm:text-3xl text-zinc-300 tracking-[0.3em] uppercase mb-2">
            Shop Management OS
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-zinc-600 text-sm mb-12">
            Powered by <span className="text-[#00D9FF]/60">Trust Layer</span> &middot; A <span className="text-zinc-500">DarkWave Studios</span> Product
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/torque/onboard">
              <Button size="lg" className="bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold px-10 h-14 text-lg w-full sm:w-auto shadow-lg shadow-[#00D9FF]/20 hover:shadow-[#00D9FF]/40 transition-shadow" data-testid="button-start-free-trial">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/torque/app">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 h-14 text-lg w-full sm:w-auto" data-testid="button-watch-demo">
                <Play className="w-5 h-5 mr-2" /> Live Demo
              </Button>
            </Link>
          </motion.div>

          {/* Hero Stats - Animated counters */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: 49, prefix: "$", label: "per month", sub: "vs $179+ competitors" },
              { value: 68, suffix: "+", label: "parts retailers", sub: "instant search" },
              { value: 12, label: "vehicle types", sub: "every category" },
              { value: 24, suffix: "/7", label: "online booking", sub: "customer scheduling" }
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -4, borderColor: "rgba(0,217,255,0.3)" }}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm transition-colors" data-testid={`stat-card-${i}`}>
                <div className="text-3xl font-bold font-tech text-[#00D9FF]">
                  {stat.prefix || ""}<CountUpNumber value={stat.value} suffix={stat.suffix || ""} />
                </div>
                <div className="text-white font-medium text-sm mt-1">{stat.label}</div>
                <div className="text-xs text-zinc-600">{stat.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* BENTO GRID */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge className="bg-white/5 border-white/10 text-zinc-400 mb-4">All-in-One Platform</Badge>
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Professional shop management without the professional price tag</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENTO_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={item.span}
                onMouseEnter={() => setHoveredBento(item.id)}
                onMouseLeave={() => setHoveredBento(null)}
              >
                <Card
                  className={`relative p-6 h-full overflow-hidden border-white/[0.08] transition-all duration-500 cursor-default group ${hoveredBento === item.id ? "border-white/20 bg-[#0f172a]" : "bg-[#0f172a]/60"}`}
                  data-testid={`bento-${item.id}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: `${item.accent}15` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300" style={{ background: `${item.accent}15` }}>
                        <item.icon className="w-6 h-6 transition-colors duration-300" style={{ color: item.accent }} />
                      </div>
                      <motion.div animate={{ scale: hoveredBento === item.id ? 1.1 : 1 }} transition={{ duration: 0.3 }}>
                        <span className="text-3xl font-bold font-tech" style={{ color: item.accent }}>{item.stat}</span>
                      </motion.div>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-zinc-500 text-sm">{item.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES DETAIL - 3 Column Grid */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D9FF]/[0.02] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">Built for Real Shops</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Every feature designed by mechanics, for mechanics</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group p-6 bg-[#0f172a]/60 border-white/[0.08] hover:border-white/20 transition-all duration-500 h-full relative overflow-hidden" data-testid={`card-feature-${i}`}>
                  <div className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 opacity-0 group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110" style={{ background: `${feature.color}15` }}>
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00D9FF] transition-colors">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{feature.description}</p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: feature.color }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {feature.highlight}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VEHICLE TYPES - Scrolling ribbon */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">Every Vehicle Type</h2>
            <p className="text-zinc-500">From sedans to exotics — TORQUE handles all 12 categories</p>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 w-max"
          >
            {[...VEHICLE_TYPES, ...VEHICLE_TYPES, ...VEHICLE_TYPES].map((type, i) => (
              <div key={`${type.id}-${i}`} className="flex-shrink-0 w-40">
                <Card className="p-5 bg-[#0f172a]/60 border-white/[0.08] hover:border-[#00D9FF]/30 transition-all text-center group" data-testid={`card-vehicle-${type.id}-${i}`}>
                  <div className="w-14 h-14 rounded-2xl bg-[#00D9FF]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#00D9FF]/20 transition-colors">
                    <type.icon className="w-7 h-7 text-[#00D9FF]" />
                  </div>
                  <p className="text-white font-medium text-sm">{type.name}</p>
                </Card>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D9FF]/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge className="bg-green-500/10 border-green-500/30 text-green-400 mb-4">Save $130+/month</Badge>
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">How We Compare</h2>
            <p className="text-zinc-500">Same features. Fraction of the cost.</p>
          </motion.div>

          <motion.div {...fadeInUp}>
            <Card className="bg-[#0f172a]/80 border-white/[0.08] overflow-hidden rounded-2xl" data-testid="comparison-table">
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-5 gap-4 p-5 bg-white/[0.03] border-b border-white/[0.08]">
                    <div className="font-bold text-zinc-500 text-sm">Feature</div>
                    <div className="text-center">
                      <div className="font-bold text-[#00D9FF] font-tech text-lg">TORQUE</div>
                      <div className="text-xs text-green-400 font-medium">$49/mo</div>
                    </div>
                    {["AutoLeap", "Tekmetric", "Shopmonkey"].map(name => (
                      <div key={name} className="text-center">
                        <div className="font-medium text-zinc-600 text-sm">{name}</div>
                        <div className="text-xs text-zinc-700">$179/mo</div>
                      </div>
                    ))}
                  </div>
                  {COMPARISON.map((row, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-5 gap-4 p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <div className="text-zinc-300 text-sm font-medium">{row.feature}</div>
                      {[row.torque, row.autoleap, row.tekmetric, row.shopmonkey].map((val, j) => (
                        <div key={j} className="text-center flex items-center justify-center">
                          {typeof val === "boolean" ? (
                            val ? <CheckCircle className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-zinc-700" />
                          ) : (
                            <span className={j === 0 ? (val === "$49" ? "text-green-400 font-bold" : "text-[#00D9FF] font-semibold") : "text-zinc-600 text-sm"}>{val}</span>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* TRUST LAYER */}
      <section id="trustlayer" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <Badge className="bg-purple-500/10 border-purple-500/30 text-purple-400 mb-4 text-sm px-5 py-2" data-testid="badge-trust-layer-section">
              <Shield className="w-4 h-4 mr-2" /> Layer 1 Blockchain
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">Blockchain-Powered Trust</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Trust Layer is the Layer 1 blockchain by DarkWave Studios — bringing verifiable trust to every transaction</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Verified Shop Identity", description: "Your shop's identity is verified and recorded on the Trust Layer blockchain. Customers can verify your legitimacy instantly.", color: "#00D9FF" },
              { icon: Lock, title: "Tamper-Proof Records", description: "Every repair order, estimate, and transaction is cryptographically signed. Records cannot be altered or fabricated.", color: "#8B5CF6" },
              { icon: Coins, title: "Signal Token", description: "Earn and spend Signal (SIG) tokens within the Trust Layer ecosystem. Reward loyal customers and incentivize referrals.", color: "#F59E0B" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="group p-8 bg-[#0f172a]/60 border-white/[0.08] hover:border-white/20 h-full transition-all duration-500 relative overflow-hidden" data-testid={`card-trustlayer-${i}`}>
                  <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }} />
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110" style={{ background: `${item.color}15` }}>
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">What Shop Owners Say</h2>
            <p className="text-zinc-500">Real shops, real results</p>
          </motion.div>
          <motion.div {...fadeInUp}>
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D9FF]/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">Simple Pricing</h2>
            <p className="text-zinc-500">Start free. Upgrade when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="p-8 bg-[#0f172a]/60 border-white/[0.08] h-full rounded-2xl" data-testid="card-pricing-free">
                <h3 className="font-tech text-xl font-bold text-white mb-2">Free Trial</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-zinc-600 ml-2">/ 30 days</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Full access to all features", "Unlimited repair orders", "Up to 3 users", "Email support", "No credit card required"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-zinc-400 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400/70 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/torque/onboard">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 h-12" data-testid="button-pricing-free">
                    Start Free Trial
                  </Button>
                </Link>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="p-8 bg-[#0f172a]/60 border-[#00D9FF]/20 h-full rounded-2xl relative overflow-hidden" data-testid="card-pricing-pro">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D9FF] via-[#8B5CF6] to-[#00D9FF]" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#00D9FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <Badge className="bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF] mb-3">Most Popular</Badge>
                  <h3 className="font-tech text-xl font-bold text-white mb-2">Pro</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">$49</span>
                    <span className="text-zinc-600 ml-2">/ month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {["Everything in Free Trial", "Unlimited users", "68+ parts vendor search", "AI Assistant (Buddy)", "Stripe payment processing", "Blockchain verification", "Priority support", "Marketing Hub add-on"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-zinc-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#00D9FF] flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/torque/onboard">
                    <Button className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold h-12 shadow-lg shadow-[#00D9FF]/20" data-testid="button-pricing-pro">
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-tech font-bold text-white mb-4">FAQ</h2>
            <p className="text-zinc-500">Common questions about TORQUE</p>
          </motion.div>

          <Card className="bg-[#0f172a]/60 border-white/[0.08] rounded-2xl p-6 md:p-8" data-testid="faq-section">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </Card>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,217,255,0.1) 0%, transparent 60%)" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-tech font-bold text-white mb-6">
              Ready to <span className="text-[#00D9FF]">TORQUE</span> Up Your Shop?
            </h2>
            <p className="text-zinc-500 text-lg mb-10 max-w-2xl mx-auto">
              Join shops saving $130+/month with the same tools the big platforms charge 3x for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/torque/onboard">
                <Button size="lg" className="bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold px-10 h-14 text-lg w-full sm:w-auto shadow-lg shadow-[#00D9FF]/20 hover:shadow-[#00D9FF]/40 transition-all" data-testid="button-final-cta">
                  Start Free — No Credit Card <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {showInstall && (
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 h-14 text-lg" onClick={handleInstall} data-testid="button-install-cta">
                  <Download className="w-5 h-5 mr-2" /> Install TORQUE
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#00D9FF]" />
              <span className="font-tech text-lg font-bold text-[#00D9FF]">TORQUE</span>
              <span className="text-zinc-700 text-sm ml-2">by DarkWave Studios</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-600">
              <a href="https://dwsc.io" target="_blank" rel="noopener noreferrer" className="hover:text-[#00D9FF] transition-colors">Trust Layer</a>
              <a href="https://darkwavestudios.io" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">DarkWave Studios</a>
              <Link href="/privacy"><span className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy</span></Link>
              <Link href="/terms"><span className="hover:text-zinc-400 transition-colors cursor-pointer">Terms</span></Link>
            </div>
          </div>
        </div>
      </footer>

      {/* PWA INSTALL BANNER */}
      <AnimatePresence>
        {showInstall && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50" data-testid="install-banner">
            <Card className="p-4 bg-[#0f172a]/95 backdrop-blur-xl border-[#00D9FF]/20 shadow-2xl rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-[#00D9FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Install TORQUE</p>
                  <p className="text-zinc-500 text-xs">Add to home screen for the best experience</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setShowInstall(false)} data-testid="button-dismiss-install">
                    Later
                  </Button>
                  <Button size="sm" className="bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-black font-bold" onClick={handleInstall} data-testid="button-install-pwa">
                    <Download className="w-4 h-4 mr-1" /> Install
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
