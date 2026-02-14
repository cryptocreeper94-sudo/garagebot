import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  BarChart3, Users, DollarSign, ShoppingCart, Search, Settings,
  Shield, Zap, Globe, Megaphone, FileText, Link2, Blocks,
  Car, MessageCircle, Wrench, Star, Package, Tag, Truck,
  Calendar, ChevronRight, Compass, Heart, Coffee,
  Gamepad2, BookOpen, Send, Bot, CreditCard, ClipboardList,
  Activity, Server, Cpu, Terminal, Mail,
  Rocket, GitBranch, TrendingUp, Eye, Lock, Map,
  Award, Building2, Briefcase, PieChart, LayoutDashboard, Layers,
  Crown, Sparkles, Bell, LogOut, ArrowLeft, LayoutGrid
} from "lucide-react";

interface LaunchCard {
  label: string;
  description: string;
  href: string;
  icon: any;
  gradient: string;
  badge?: string;
  featured?: boolean;
}

interface Category {
  title: string;
  icon: any;
  gradient: string;
  description: string;
  cards: LaunchCard[];
}

const categories: Category[] = [
  {
    title: "Analytics & Insights",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-500",
    description: "Monitor your platform's performance in real-time. Track traffic, page views, sessions, device breakdowns, geographic data, and affiliate click-through rates.",
    cards: [
      { label: "Analytics Dashboard", description: "Real-time traffic, sessions, devices & geo data", href: "/dev", icon: BarChart3, gradient: "from-cyan-500 to-blue-600", badge: "Live", featured: true },
      { label: "System Dashboard", description: "API health, server status & traffic charts", href: "/dashboard", icon: Activity, gradient: "from-green-500 to-emerald-600" },
      { label: "Affiliate Analytics", description: "Click tracking & commission performance reports", href: "/dev", icon: TrendingUp, gradient: "from-purple-500 to-violet-600" },
      { label: "SEO Manager", description: "Page meta tags, Open Graph & crawl optimization", href: "/dev", icon: Search, gradient: "from-amber-500 to-orange-600" },
    ]
  },
  {
    title: "Marketing & Growth",
    icon: Megaphone,
    gradient: "from-purple-500 to-pink-500",
    description: "Grow your audience and drive engagement. Manage social media auto-posting, schedule content, run Meta ad campaigns, and publish blog content.",
    cards: [
      { label: "Marketing Hub", description: "Meta auto-posting, 60+ posts, 3-hour rotation", href: "/marketing", icon: Megaphone, gradient: "from-purple-500 to-pink-600", featured: true },
      { label: "Blog Manager", description: "AI-generated posts, publish & feature controls", href: "/blog", icon: FileText, gradient: "from-blue-500 to-indigo-600" },
      { label: "Newsletter", description: "Subscriber management & email campaigns", href: "/dev", icon: Mail, gradient: "from-pink-500 to-rose-600" },
      { label: "Meta Ads Campaigns", description: "Facebook/Instagram ad targeting & management", href: "/marketing", icon: Globe, gradient: "from-indigo-500 to-purple-600" },
      { label: "Sponsored Products", description: "Featured placements & promoted listings", href: "/dev", icon: Star, gradient: "from-yellow-500 to-amber-600" },
    ]
  },
  {
    title: "Revenue & Monetization",
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-500",
    description: "Track and optimize every revenue stream. Manage affiliate networks, process payments, handle Pro subscriptions, and mint Genesis Hallmark NFTs.",
    cards: [
      { label: "Affiliate Networks", description: "Amazon, CJ, eBay, ShareASale — 50+ retailers", href: "/dev", icon: Link2, gradient: "from-green-500 to-emerald-600", badge: "Earn", featured: true },
      { label: "Inbound Affiliate Program", description: "GB-XXXXXX referral codes, commissions & payouts", href: "/affiliates", icon: Users, gradient: "from-cyan-500 to-teal-600", badge: "New" },
      { label: "Pro Memberships", description: "Founders Circle subscriptions & ad-free tiers", href: "/pro", icon: Crown, gradient: "from-yellow-500 to-amber-600" },
      { label: "Stripe Payments", description: "Payment processing, checkout & subscriptions", href: "/dev", icon: CreditCard, gradient: "from-blue-500 to-indigo-600" },
      { label: "Genesis Hallmarks", description: "NFT minting & Solana blockchain verification", href: "/hallmark", icon: Award, gradient: "from-amber-500 to-orange-600" },
      { label: "Referral Program", description: "Points system, invite rewards & Pro bonuses", href: "/invite", icon: Send, gradient: "from-pink-500 to-rose-600" },
    ]
  },
  {
    title: "Mechanics Garage Suite",
    icon: Wrench,
    gradient: "from-orange-500 to-red-500",
    description: "The complete shop management platform. Register shops, manage repair orders, handle inventory, run inspections, and connect business tools.",
    cards: [
      { label: "Shop Portal", description: "Shop registration, settings & management", href: "/shop-portal", icon: Building2, gradient: "from-orange-500 to-red-600", featured: true },
      { label: "Mechanics Garage", description: "Repair orders, estimates, appointments & POS", href: "/mechanics-garage", icon: Wrench, gradient: "from-red-500 to-rose-600" },
      { label: "Shop Inventory", description: "Parts inventory management & tracking", href: "/mechanics-garage", icon: Package, gradient: "from-amber-500 to-orange-600" },
      { label: "Digital Inspections", description: "Vehicle inspection reports & customer sharing", href: "/mechanics-garage", icon: ClipboardList, gradient: "from-teal-500 to-cyan-600" },
      { label: "ORBIT Staffing", description: "Payroll, timesheets, W2/1099 processing", href: "/mechanics-garage", icon: Briefcase, gradient: "from-violet-500 to-purple-600" },
      { label: "Business Integrations", description: "QuickBooks, ADP, Gusto, PartsTech & more", href: "/mechanics-garage", icon: Layers, gradient: "from-sky-500 to-blue-600" },
      { label: "Partner API", description: "B2B API keys, scopes & rate limiting", href: "/dev", icon: Terminal, gradient: "from-lime-500 to-green-600" },
    ]
  },
  {
    title: "Community & Engagement",
    icon: MessageCircle,
    gradient: "from-blue-500 to-indigo-500",
    description: "Build and nurture your community. Manage Signal Chat, curate Break Room content, support the Shade Tree DIY community, and run trivia games.",
    cards: [
      { label: "Signal Chat", description: "Community messaging, channels, DMs & threads", href: "/chat", icon: MessageCircle, gradient: "from-blue-500 to-indigo-600", featured: true },
      { label: "Break Room", description: "News, tools, scanners, speed traps & fuel prices", href: "/break-room", icon: Coffee, gradient: "from-amber-500 to-orange-600" },
      { label: "Shade Tree Mechanics", description: "DIY community hub & repair guides", href: "/shade-tree", icon: Wrench, gradient: "from-emerald-500 to-green-600" },
      { label: "Trivia Quiz", description: "Automotive knowledge game", href: "/trivia", icon: Gamepad2, gradient: "from-pink-500 to-rose-600" },
      { label: "Giveaways", description: "Prize drawings & winner management", href: "/dev", icon: Sparkles, gradient: "from-yellow-500 to-amber-600" },
    ]
  },
  {
    title: "Vehicle & Parts",
    icon: Car,
    gradient: "from-red-500 to-orange-500",
    description: "The core product experience. Search parts across 68+ retailers, manage vehicle fleets, follow DIY guides, browse the marketplace, and track wishlists.",
    cards: [
      { label: "Parts Search", description: "68+ retailers, 16 categories, vehicle-aware", href: "/results", icon: Search, gradient: "from-cyan-500 to-blue-600", featured: true },
      { label: "My Garage", description: "Fleet management, VIN decoding & service records", href: "/garage", icon: Car, gradient: "from-red-500 to-rose-600" },
      { label: "DIY Guides", description: "AI repair guides with YouTube integration", href: "/diy-guides", icon: BookOpen, gradient: "from-green-500 to-emerald-600" },
      { label: "Parts Marketplace", description: "Peer-to-peer listings with messaging", href: "/marketplace", icon: ShoppingCart, gradient: "from-orange-500 to-amber-600" },
      { label: "Wishlists", description: "Save, organize & share parts lists", href: "/wishlists", icon: Heart, gradient: "from-pink-500 to-rose-600" },
      { label: "Build Projects", description: "Track custom builds with parts & progress", href: "/projects", icon: GitBranch, gradient: "from-purple-500 to-violet-600" },
      { label: "Price Alerts", description: "Track price changes & get notifications", href: "/garage", icon: Bell, gradient: "from-yellow-500 to-amber-600" },
    ]
  },
  {
    title: "Services & Directories",
    icon: Compass,
    gradient: "from-teal-500 to-cyan-500",
    description: "Extended platform services. Compare insurance quotes, browse rental cars, explore the CDL directory, manage vendors, and monitor weather radar.",
    cards: [
      { label: "Insurance Comparison", description: "Multi-provider quote comparison tool", href: "/insurance", icon: Shield, gradient: "from-teal-500 to-cyan-600" },
      { label: "Rental Cars", description: "Carla, Expedia & Hotels.com comparison", href: "/rentals", icon: Car, gradient: "from-blue-500 to-indigo-600" },
      { label: "CDL Directory", description: "Trucking companies & CDL programs", href: "/cdl-directory", icon: Truck, gradient: "from-orange-500 to-red-600" },
      { label: "Vendor Management", description: "Retailer applications & partnerships", href: "/vendor-signup", icon: Building2, gradient: "from-indigo-500 to-purple-600" },
      { label: "Weather Radar", description: "Leaflet map, RainViewer & NOAA alerts", href: "/break-room", icon: Map, gradient: "from-sky-500 to-blue-600" },
      { label: "Support Center", description: "Help desk & user support", href: "/support", icon: Mail, gradient: "from-green-500 to-emerald-600" },
    ]
  },
  {
    title: "Platform & Development",
    icon: Settings,
    gradient: "from-slate-500 to-zinc-500",
    description: "Under-the-hood tools for platform management. Access the dev portal, manage releases, handle user accounts, and review investor metrics.",
    cards: [
      { label: "Dev Portal", description: "Full admin panel — roadmap, tasks, configs", href: "/dev", icon: Terminal, gradient: "from-slate-500 to-zinc-600", featured: true },
      { label: "Release Manager", description: "Version tracking & changelogs", href: "/dev", icon: Rocket, gradient: "from-cyan-500 to-blue-600" },
      { label: "Blockchain Verifier", description: "Solana on-chain verification", href: "/dev", icon: Blocks, gradient: "from-purple-500 to-violet-600" },
      { label: "User Management", description: "Accounts, roles, waitlist & sessions", href: "/dev", icon: Users, gradient: "from-blue-500 to-indigo-600" },
      { label: "Explore Page", description: "Feature discovery & platform showcase", href: "/explore", icon: Compass, gradient: "from-emerald-500 to-green-600" },
      { label: "Investor Portal", description: "Business metrics & investment deck", href: "/investors", icon: PieChart, gradient: "from-amber-500 to-orange-600" },
    ]
  },
];

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[300px] h-[140px] rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse">
      <div className="p-6 h-full flex flex-col justify-end">
        <div className="h-4 w-20 bg-white/5 rounded mb-2" />
        <div className="h-3 w-36 bg-white/5 rounded" />
      </div>
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-11 h-11 rounded-xl bg-white/5" />
        <div>
          <div className="h-5 w-32 bg-white/5 rounded mb-2" />
          <div className="h-3 w-64 bg-white/5 rounded" />
        </div>
      </div>
      <div className="flex gap-5 overflow-hidden">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

function CardComponent({ card, index, catIndex }: { card: LaunchCard; index: number; catIndex: number }) {
  const [, navigate] = useLocation();

  return (
    <CarouselItem className="pl-5 basis-[300px] sm:basis-[320px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: catIndex * 0.06 + index * 0.04 }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(card.href)}
        className="relative cursor-pointer rounded-2xl overflow-hidden group h-[150px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:shadow-lg hover:shadow-white/[0.03]"
        data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-125 transition-all duration-500`} />

        {card.badge && (
          <div className="absolute top-4 right-4 z-20">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white ${
              card.badge === "Live" ? "bg-gradient-to-r from-green-500 to-emerald-500" :
              card.badge === "New" ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
              card.badge === "Earn" ? "bg-gradient-to-r from-orange-500 to-rose-500" :
              "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}>
              {card.badge}
            </span>
          </div>
        )}

        {card.featured && !card.badge && (
          <div className="absolute top-4 right-4 z-20">
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 backdrop-blur-sm">
              Featured
            </span>
          </div>
        )}

        <div className="relative h-full p-5 flex flex-col justify-between z-10">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="text-[13px] font-semibold text-white group-hover:text-cyan-300 transition-colors truncate leading-tight">
                {card.label}
              </h3>
              <p className="text-[11px] text-white/40 mt-1 line-clamp-2 leading-relaxed">{card.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1 text-white/20 group-hover:text-cyan-400/60 transition-colors">
              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </CarouselItem>
  );
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, mainPin: pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "admin") {
        setError("Command Center access requires administrator privileges.");
        setLoading(false);
        return;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Command Center</h2>
            <p className="text-sm text-white/40">Enter your credentials to access mission control</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors text-sm"
                placeholder="Enter username"
                data-testid="input-cc-username"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">PIN / Password</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors text-sm"
                placeholder="Enter PIN"
                data-testid="input-cc-pin"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !pin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-cc-login"
            >
              {loading ? "Authenticating..." : "Access Command Center"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function CommandCenter() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const totalFeatures = categories.reduce((sum, c) => sum + c.cards.length, 0);

  useEffect(() => {
    if (user?.role === "admin") {
      setAuthenticated(true);
    }
  }, [user]);

  useEffect(() => {
    if (authenticated) {
      const timer = setTimeout(() => setLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [authenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginGate onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setAuthenticated(true);
      }} />
    );
  }

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-white/40 mb-6">Command Center is limited to administrators.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
            data-testid="button-go-home"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]" data-testid="page-command-center">
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#070b16]/80 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 text-white/60" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">GarageBot Command Center</h1>
                <p className="text-[11px] text-white/40">{totalFeatures} tools across {categories.length} categories</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50 hidden sm:block">
              Welcome, <span className="text-white/80 font-medium">{user?.firstName || user?.username}</span>
            </span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-xs"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-16 space-y-14">
        {!loaded ? (
          [1,2,3,4].map(i => <SkeletonSection key={i} />)
        ) : (
          categories.map((category, catIndex) => (
            <motion.section
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIndex * 0.08 }}
              className="space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                  <category.icon className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{category.title}</h2>
                  <p className="text-sm text-white/35 max-w-2xl leading-relaxed">{category.description}</p>
                </div>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-5">
                  {category.cards.map((card, cardIndex) => (
                    <CardComponent
                      key={card.label}
                      card={card}
                      index={cardIndex}
                      catIndex={catIndex}
                    />
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-3 bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white" />
                <CarouselNext className="hidden md:flex -right-3 bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white" />
              </Carousel>
            </motion.section>
          ))
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 1 }}
          className="text-center pt-4"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white/30 text-xs">
              GarageBot v4.0 — 86,000+ lines — 422 endpoints — 120+ tables
            </span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
