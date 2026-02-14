import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Users, DollarSign, ShoppingCart, Search, Settings,
  Shield, Zap, Globe, Megaphone, FileText, Link2, Blocks,
  Car, MessageCircle, Wrench, Star, Package, Tag, Truck,
  Fuel, Calendar, ChevronRight, Compass, Heart, Coffee,
  Gamepad2, BookOpen, Send, Bot, CreditCard, ClipboardList,
  Database, Activity, Server, Cpu, Terminal, AlertCircle,
  ExternalLink, Mail, Phone, User, Rocket, Archive, GitBranch,
  TrendingUp, Eye, Lock, Map, Radio, Newspaper, Award,
  Building2, Briefcase, PieChart, LayoutDashboard, Layers,
  Crown, Sparkles, MonitorSmartphone, Receipt, Bell
} from "lucide-react";

interface CommandItem {
  title: string;
  description: string;
  route: string;
  icon: any;
  color: string;
  glow: string;
  badge?: string;
  badgeColor?: string;
}

interface CommandCategory {
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  items: CommandItem[];
}

const COMMAND_CATEGORIES: CommandCategory[] = [
  {
    title: "Analytics & Insights",
    description: "Traffic, performance, and business intelligence",
    icon: BarChart3,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-500/20",
    items: [
      { title: "Analytics Dashboard", description: "Real-time traffic, pageviews, sessions, devices, geo data", route: "/dev", icon: BarChart3, color: "text-cyan-400", glow: "rgba(0,229,255,0.2)" },
      { title: "System Dashboard", description: "API health, server status, blockchain assets, traffic charts", route: "/dashboard", icon: Activity, color: "text-green-400", glow: "rgba(74,222,128,0.2)" },
      { title: "Affiliate Analytics", description: "Click tracking, commission reports, network performance", route: "/dev", icon: TrendingUp, color: "text-purple-400", glow: "rgba(168,85,247,0.2)" },
      { title: "SEO Manager", description: "Page meta tags, Open Graph, crawl optimization", route: "/dev", icon: Search, color: "text-amber-400", glow: "rgba(251,191,36,0.2)" },
    ]
  },
  {
    title: "Marketing & Growth",
    description: "Social media, campaigns, content, and outreach",
    icon: Megaphone,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-pink-500/20",
    items: [
      { title: "Marketing Hub", description: "Meta auto-posting, scheduled content, 60+ posts rotation", route: "/marketing", icon: Megaphone, color: "text-purple-400", glow: "rgba(168,85,247,0.2)" },
      { title: "Blog Manager", description: "AI-generated posts, publish/feature controls, content calendar", route: "/blog", icon: FileText, color: "text-blue-400", glow: "rgba(96,165,250,0.2)" },
      { title: "Newsletter", description: "Subscriber management and email campaigns", route: "/dev", icon: Mail, color: "text-pink-400", glow: "rgba(244,114,182,0.2)" },
      { title: "Meta Ads Campaigns", description: "Facebook/Instagram ad management with targeting", route: "/marketing", icon: Globe, color: "text-indigo-400", glow: "rgba(129,140,248,0.2)" },
      { title: "Sponsored Products", description: "Featured product placements and promoted listings", route: "/dev", icon: Star, color: "text-yellow-400", glow: "rgba(250,204,21,0.2)" },
    ]
  },
  {
    title: "Revenue & Monetization",
    description: "Payments, affiliates, subscriptions, and earnings",
    icon: DollarSign,
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-500/20",
    items: [
      { title: "Affiliate Networks", description: "Amazon, CJ, eBay, ShareASale — 50+ retailer connections", route: "/dev", icon: Link2, color: "text-green-400", glow: "rgba(74,222,128,0.2)" },
      { title: "Inbound Affiliate Program", description: "GB-XXXXXX codes, referrals, commissions, payouts", route: "/affiliates", icon: Users, color: "text-cyan-400", glow: "rgba(0,229,255,0.2)", badge: "NEW", badgeColor: "bg-cyan-500" },
      { title: "Pro Memberships", description: "Founders Circle subscriptions and ad-free tiers", route: "/pro", icon: Crown, color: "text-yellow-400", glow: "rgba(250,204,21,0.2)" },
      { title: "Stripe Payments", description: "Payment processing, checkout, subscriptions", route: "/dev", icon: CreditCard, color: "text-blue-400", glow: "rgba(96,165,250,0.2)" },
      { title: "Genesis Hallmarks", description: "NFT minting, Solana blockchain verification", route: "/hallmark", icon: Award, color: "text-amber-400", glow: "rgba(251,191,36,0.2)" },
      { title: "Referral Program", description: "Points system, invite rewards, Pro conversion bonuses", route: "/invite", icon: Send, color: "text-pink-400", glow: "rgba(244,114,182,0.2)" },
    ]
  },
  {
    title: "Mechanics Garage Suite",
    description: "Shop management, POS, inventory, and workforce",
    icon: Wrench,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-red-500/20",
    items: [
      { title: "Shop Portal", description: "Shop registration, settings, and management console", route: "/shop-portal", icon: Building2, color: "text-orange-400", glow: "rgba(251,146,60,0.2)" },
      { title: "Mechanics Garage", description: "Repair orders, estimates, appointments, POS system", route: "/mechanics-garage", icon: Wrench, color: "text-red-400", glow: "rgba(248,113,113,0.2)" },
      { title: "Shop Inventory", description: "Parts inventory management and tracking", route: "/mechanics-garage", icon: Package, color: "text-amber-400", glow: "rgba(251,191,36,0.2)" },
      { title: "Digital Inspections", description: "Vehicle inspection reports and customer sharing", route: "/mechanics-garage", icon: ClipboardList, color: "text-teal-400", glow: "rgba(45,212,191,0.2)" },
      { title: "ORBIT Staffing", description: "Payroll, timesheets, employees, W2/1099 processing", route: "/mechanics-garage", icon: Briefcase, color: "text-violet-400", glow: "rgba(139,92,246,0.2)" },
      { title: "Business Integrations", description: "QuickBooks, ADP, Gusto, Google Calendar, PartsTech", route: "/mechanics-garage", icon: Layers, color: "text-sky-400", glow: "rgba(56,189,248,0.2)" },
      { title: "Partner API", description: "B2B API keys, scopes, rate limiting, usage logs", route: "/dev", icon: Terminal, color: "text-lime-400", glow: "rgba(163,230,53,0.2)" },
    ]
  },
  {
    title: "Community & Engagement",
    description: "Chat, forums, events, and user interaction",
    icon: MessageCircle,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-indigo-500/20",
    items: [
      { title: "Signal Chat", description: "Community messaging, channels, DMs, reactions, threads", route: "/chat", icon: MessageCircle, color: "text-blue-400", glow: "rgba(96,165,250,0.2)" },
      { title: "Break Room", description: "News, tools, scanners, mileage tracker, speed traps, fuel prices", route: "/break-room", icon: Coffee, color: "text-amber-400", glow: "rgba(251,191,36,0.2)" },
      { title: "Shade Tree Mechanics", description: "DIY community hub, repair guides, savings estimates", route: "/shade-tree", icon: Wrench, color: "text-emerald-400", glow: "rgba(52,211,153,0.2)" },
      { title: "Trivia Quiz", description: "Automotive knowledge game for engagement", route: "/trivia", icon: Gamepad2, color: "text-pink-400", glow: "rgba(244,114,182,0.2)" },
      { title: "Giveaways", description: "Prize drawings and winner management", route: "/dev", icon: Sparkles, color: "text-yellow-400", glow: "rgba(250,204,21,0.2)" },
    ]
  },
  {
    title: "Vehicle & Parts",
    description: "Search, garage, guides, marketplace, and alerts",
    icon: Car,
    color: "text-red-400",
    gradient: "from-red-500/20 to-orange-500/20",
    items: [
      { title: "Parts Search", description: "68+ retailers, 16 categories, vehicle-aware filtering", route: "/results", icon: Search, color: "text-cyan-400", glow: "rgba(0,229,255,0.2)" },
      { title: "My Garage", description: "Fleet management, VIN decoding, service records, expenses", route: "/garage", icon: Car, color: "text-red-400", glow: "rgba(248,113,113,0.2)" },
      { title: "DIY Guides", description: "AI-generated repair guides with YouTube integration", route: "/diy-guides", icon: BookOpen, color: "text-green-400", glow: "rgba(74,222,128,0.2)" },
      { title: "Parts Marketplace", description: "Peer-to-peer listings with messaging", route: "/marketplace", icon: ShoppingCart, color: "text-orange-400", glow: "rgba(251,146,60,0.2)" },
      { title: "Wishlists", description: "Save, organize, and share parts lists", route: "/wishlists", icon: Heart, color: "text-pink-400", glow: "rgba(244,114,182,0.2)" },
      { title: "Build Projects", description: "Track custom builds with parts and progress", route: "/projects", icon: GitBranch, color: "text-purple-400", glow: "rgba(168,85,247,0.2)" },
      { title: "Price Alerts", description: "Track price changes and get notifications", route: "/garage", icon: Bell, color: "text-yellow-400", glow: "rgba(250,204,21,0.2)" },
    ]
  },
  {
    title: "Services & Directories",
    description: "Insurance, rentals, CDL, vendors, and support",
    icon: Compass,
    color: "text-teal-400",
    gradient: "from-teal-500/20 to-cyan-500/20",
    items: [
      { title: "Insurance Comparison", description: "Multi-provider quote comparison tool", route: "/insurance", icon: Shield, color: "text-teal-400", glow: "rgba(45,212,191,0.2)" },
      { title: "Rental Cars", description: "Carla, Expedia, Hotels.com comparison", route: "/rentals", icon: Car, color: "text-blue-400", glow: "rgba(96,165,250,0.2)" },
      { title: "CDL Directory", description: "Trucking companies and CDL programs", route: "/cdl-directory", icon: Truck, color: "text-orange-400", glow: "rgba(251,146,60,0.2)" },
      { title: "Vendor Management", description: "Retailer applications, featured vendors, partnerships", route: "/vendor-signup", icon: Building2, color: "text-indigo-400", glow: "rgba(129,140,248,0.2)" },
      { title: "Weather Radar", description: "Leaflet map, RainViewer, NOAA alerts", route: "/break-room", icon: Map, color: "text-sky-400", glow: "rgba(56,189,248,0.2)" },
      { title: "Support Center", description: "Help desk, contact, and user support", route: "/support", icon: Phone, color: "text-green-400", glow: "rgba(74,222,128,0.2)" },
    ]
  },
  {
    title: "Platform & Development",
    description: "Roadmap, releases, users, and system config",
    icon: Settings,
    color: "text-slate-400",
    gradient: "from-slate-500/20 to-zinc-500/20",
    items: [
      { title: "Dev Portal", description: "Full admin panel — roadmap, tasks, releases, seed data, configs", route: "/dev", icon: Terminal, color: "text-slate-400", glow: "rgba(148,163,184,0.2)" },
      { title: "Release Manager", description: "Version tracking, changelogs, blockchain verification", route: "/dev", icon: Rocket, color: "text-cyan-400", glow: "rgba(0,229,255,0.2)" },
      { title: "Blockchain Verifier", description: "Solana on-chain transaction submission and verification", route: "/dev", icon: Blocks, color: "text-purple-400", glow: "rgba(168,85,247,0.2)" },
      { title: "User Management", description: "Accounts, roles, waitlist, sessions", route: "/dev", icon: Users, color: "text-blue-400", glow: "rgba(96,165,250,0.2)" },
      { title: "Explore Page", description: "Feature discovery and platform showcase", route: "/explore", icon: Compass, color: "text-emerald-400", glow: "rgba(52,211,153,0.2)" },
      { title: "Investor Portal", description: "Business metrics and investment deck", route: "/investors", icon: PieChart, color: "text-amber-400", glow: "rgba(251,191,36,0.2)" },
    ]
  },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-white/5 rounded mb-2" />
          <div className="h-3 w-40 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCategory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-white/5" />
        <div>
          <div className="h-5 w-32 bg-white/5 rounded mb-2" />
          <div className="h-3 w-48 bg-white/5 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

export default function CommandCenter() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a]">
        <Nav />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 space-y-8">
          {[1,2,3].map(i => <SkeletonCategory key={i} />)}
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Nav />
        <Card className="bg-black/40 backdrop-blur-xl border border-red-500/30 p-8 text-center max-w-md">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">Command Center is available to platform administrators only.</p>
        </Card>
      </div>
    );
  }

  const filteredCategories = searchQuery
    ? COMMAND_CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : activeCategory
      ? COMMAND_CATEGORIES.filter(cat => cat.title === activeCategory)
      : COMMAND_CATEGORIES;

  const totalFeatures = COMMAND_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a1a]" data-testid="page-command-center">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-5">
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Mission Control
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {totalFeatures} features across {COMMAND_CATEGORIES.length} categories — everything in one place
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search all features..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-cyan-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all"
              data-testid="input-search-features"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { setActiveCategory(null); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !activeCategory && !searchQuery
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  : "bg-black/20 text-gray-400 border border-white/5 hover:border-white/15 hover:text-white"
              }`}
              data-testid="button-filter-all"
            >
              All ({totalFeatures})
            </button>
            {COMMAND_CATEGORIES.map((cat) => (
              <button
                key={cat.title}
                onClick={() => { setActiveCategory(activeCategory === cat.title ? null : cat.title); setSearchQuery(""); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.title
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                    : "bg-black/20 text-gray-400 border border-white/5 hover:border-white/15 hover:text-white"
                }`}
                data-testid={`button-filter-${cat.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.title.split(" ")[0]}
                <span className="text-xs opacity-60">({cat.items.length})</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory || searchQuery || "all"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {!loaded ? (
              [1,2,3].map(i => <SkeletonCategory key={i} />)
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No features match "{searchQuery}"</p>
              </div>
            ) : (
              filteredCategories.map((category, catIndex) => (
                <motion.section
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: catIndex * 0.08 }}
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.gradient} border border-white/10 flex items-center justify-center`}>
                      <category.icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{category.title}</h2>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto border-white/10 text-gray-500 text-xs">
                      {category.items.length} tools
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.items.map((item, itemIndex) => {
                      const itemKey = `${category.title}-${item.title}`;
                      const isHovered = hoveredItem === itemKey;

                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: catIndex * 0.05 + itemIndex * 0.03 }}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          onHoverStart={() => setHoveredItem(itemKey)}
                          onHoverEnd={() => setHoveredItem(null)}
                          onClick={() => navigate(item.route)}
                          className="cursor-pointer group"
                          data-testid={`card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div
                            className={`relative rounded-2xl p-5 h-full transition-all duration-300 overflow-hidden ${
                              isHovered
                                ? "bg-black/50 border border-cyan-500/30"
                                : "bg-black/20 border border-white/5"
                            }`}
                            style={{
                              backdropFilter: "blur(20px)",
                              boxShadow: isHovered
                                ? `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${item.glow}`
                                : "0 4px 16px rgba(0,0,0,0.2)",
                            }}
                          >
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  background: `radial-gradient(circle at 50% 0%, ${item.glow}, transparent 70%)`,
                                }}
                              />
                            )}

                            <div className="relative z-10 flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                  isHovered ? "scale-110" : ""
                                }`}
                                style={{
                                  background: `linear-gradient(135deg, ${item.glow}, transparent)`,
                                  border: `1px solid ${item.glow.replace("0.2", "0.3")}`,
                                }}
                              >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                                    {item.title}
                                  </h3>
                                  {item.badge && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${item.badgeColor} text-white uppercase`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 group-hover:text-gray-400 transition-colors">
                                  {item.description}
                                </p>
                              </div>
                              <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-all duration-300 ${
                                isHovered ? "text-cyan-400 translate-x-1" : "text-gray-600"
                              }`} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-500 text-sm">
              GarageBot v4.0 — 86,000+ lines of code — 422 API endpoints — 120+ database tables
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}