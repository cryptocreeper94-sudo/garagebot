import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, Wrench, ShoppingCart, Users, Shield, FileText,
  Store, Tag, Heart, FolderOpen, Fuel, DollarSign, Calendar,
  TrendingDown, Phone, MessageCircle, Gamepad2, Coffee, Truck,
  Globe, Crown, ChevronRight, Sparkles, MapPin, Star,
  BookOpen, Blocks, Compass, Layout, Award,
  HeadphonesIcon, Mail, Settings
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  glowColor: string;
  badge?: string;
  badgeColor?: string;
  pro?: boolean;
  subFeatures?: string[];
}

interface FeatureCategory {
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  features: Feature[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: "Parts & Shopping",
    description: "Search, compare, save, and buy parts across 50+ retailers",
    icon: ShoppingCart,
    color: "text-cyan-400",
    gradient: "from-cyan-500 to-blue-600",
    features: [
      {
        name: "Parts Search",
        description: "Search 15M+ parts across 50+ retailers with AI-powered results, price comparison, and local pickup availability.",
        href: "/",
        icon: Search,
        color: "text-cyan-400",
        glowColor: "rgba(6,182,212,0.4)",
        subFeatures: ["50+ Retailers", "Price Comparison", "Local Pickup", "Vehicle-Aware"],
      },
      {
        name: "Parts Marketplace",
        description: "Buy and sell used parts directly with other enthusiasts. List spare parts, search by vehicle fitment, and message sellers.",
        href: "/marketplace",
        icon: Tag,
        color: "text-green-400",
        glowColor: "rgba(74,222,128,0.4)",
        badge: "NEW",
        badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
        subFeatures: ["List Parts", "Fitment Search", "In-App Messaging", "Photo Uploads"],
      },
      {
        name: "Wishlists",
        description: "Save parts you're watching to organized wishlists. Share them with friends or your mechanic, and track price changes.",
        href: "/wishlists",
        icon: Heart,
        color: "text-pink-400",
        glowColor: "rgba(244,114,182,0.4)",
        subFeatures: ["Multiple Lists", "Share Link", "Price Tracking", "Priority Sort"],
      },
      {
        name: "Build Projects",
        description: "Plan and track your vehicle build projects. Create parts lists, track spending vs budget, and mark items as purchased.",
        href: "/projects",
        icon: FolderOpen,
        color: "text-amber-400",
        glowColor: "rgba(251,191,36,0.4)",
        subFeatures: ["Budget Tracking", "Parts Checklist", "Progress", "Cost vs Estimate"],
      },
    ],
  },
  {
    title: "My Garage",
    description: "Complete vehicle fleet management with 7 smart tools built in",
    icon: Car,
    color: "text-purple-400",
    gradient: "from-purple-500 to-pink-500",
    features: [
      {
        name: "Vehicle Fleet",
        description: "Add all your vehicles with VIN decoding, manage details, and get vehicle-specific part recommendations.",
        href: "/garage",
        icon: Car,
        color: "text-purple-400",
        glowColor: "rgba(168,85,247,0.4)",
        subFeatures: ["VIN Decoder", "Multiple Vehicles", "Smart Recs", "Vehicle Passport"],
      },
      {
        name: "Warranty Tracker",
        description: "Track all your warranties in one place. Get alerts before they expire so you never miss a claim.",
        href: "/garage",
        icon: Shield,
        color: "text-blue-400",
        glowColor: "rgba(96,165,250,0.4)",
        subFeatures: ["Expiry Alerts", "Coverage Details", "Provider Info", "Mileage Limits"],
      },
      {
        name: "Maintenance Scheduler",
        description: "Set up service schedules based on mileage and time. Reminders for oil changes, tire rotations, and more.",
        href: "/garage",
        icon: Calendar,
        color: "text-emerald-400",
        glowColor: "rgba(52,211,153,0.4)",
        subFeatures: ["Custom Schedules", "Mileage-Based", "Time-Based", "Service History"],
      },
      {
        name: "Fuel Tracker",
        description: "Log fill-ups, track MPG over time, and see cost trends. Know exactly what you're spending on fuel.",
        href: "/garage",
        icon: Fuel,
        color: "text-orange-400",
        glowColor: "rgba(251,146,60,0.4)",
        subFeatures: ["MPG Tracking", "Cost Per Mile", "Fill-Up Log", "Trends"],
      },
      {
        name: "Expense Tracker",
        description: "Track every dollar on your vehicles. Categorize repairs, maintenance, upgrades, and see spending breakdowns.",
        href: "/garage",
        icon: DollarSign,
        color: "text-green-400",
        glowColor: "rgba(74,222,128,0.4)",
        subFeatures: ["Categories", "Monthly Totals", "Per-Vehicle", "Receipts"],
      },
      {
        name: "Price Watch",
        description: "Set alerts on parts you need. Get notified when prices drop at any of the 50+ retailers we monitor.",
        href: "/garage",
        icon: TrendingDown,
        color: "text-cyan-400",
        glowColor: "rgba(6,182,212,0.4)",
        subFeatures: ["Price Drop Alerts", "Multi-Retailer", "Target Price", "History"],
      },
      {
        name: "Emergency Info",
        description: "Store emergency contacts, roadside assistance numbers, and insurance info for quick access when you need it.",
        href: "/garage",
        icon: Phone,
        color: "text-red-400",
        glowColor: "rgba(248,113,113,0.4)",
        subFeatures: ["Roadside Assist", "Emergency Contacts", "Insurance", "Quick Access"],
      },
    ],
  },
  {
    title: "DIY & Learning",
    description: "Repair guides, community tips, and automotive knowledge",
    icon: BookOpen,
    color: "text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
    features: [
      {
        name: "DIY Repair Guides",
        description: "Step-by-step repair guides for every skill level with video tutorials, tools needed, difficulty ratings, and time estimates.",
        href: "/diy-guides",
        icon: Wrench,
        color: "text-emerald-400",
        glowColor: "rgba(52,211,153,0.4)",
        subFeatures: ["28+ Guides", "Video Tutorials", "Tool Lists", "Difficulty Ratings"],
      },
      {
        name: "Shade Tree Mechanics",
        description: "A community hub for DIY enthusiasts. Browse categorized tips, community tricks, and estimated savings vs shop prices.",
        href: "/shade-tree",
        icon: Star,
        color: "text-yellow-400",
        glowColor: "rgba(250,204,21,0.4)",
        subFeatures: ["Community Tips", "Savings Calculator", "Skill Levels", "Photo Guides"],
      },
      {
        name: "Auto Trivia",
        description: "Test your automotive knowledge with fun trivia questions. Challenge friends and learn cool car facts.",
        href: "/trivia",
        icon: Gamepad2,
        color: "text-pink-400",
        glowColor: "rgba(244,114,182,0.4)",
        subFeatures: ["Multiple Categories", "Score Tracking", "Fun Facts", "Challenge Mode"],
      },
      {
        name: "Blog",
        description: "In-depth articles on maintenance tips, industry news, product reviews, and how-to guides from experts.",
        href: "/blog",
        icon: FileText,
        color: "text-blue-400",
        glowColor: "rgba(96,165,250,0.4)",
        subFeatures: ["Expert Articles", "Product Reviews", "Industry News", "How-To Guides"],
      },
    ],
  },
  {
    title: "Community & Social",
    description: "Connect with fellow enthusiasts, get help, and stay engaged",
    icon: Users,
    color: "text-blue-400",
    gradient: "from-blue-500 to-indigo-500",
    features: [
      {
        name: "Signal Chat",
        description: "Real-time community messaging with channels, DMs, threads, reactions, and polls. Buddy AI bot provides instant support.",
        href: "/chat",
        icon: MessageCircle,
        color: "text-blue-400",
        glowColor: "rgba(96,165,250,0.4)",
        badge: "LIVE",
        badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        subFeatures: ["Channels", "Direct Messages", "Buddy AI Bot", "Threads & Polls"],
      },
      {
        name: "Break Room",
        description: "Your central hub for automotive news, receipt scanner, mileage tracker, speed trap alerts, fuel prices, and more.",
        href: "/break-room",
        icon: Coffee,
        color: "text-amber-400",
        glowColor: "rgba(251,191,36,0.4)",
        badge: "HUB",
        badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        subFeatures: ["News Feed", "Receipt Scanner", "Mileage Tracker", "Fuel Prices"],
      },
      {
        name: "Invite Friends",
        description: "Earn 100 points for every friend who signs up, plus bonus when they go Pro. Redeem for Pro membership time.",
        href: "/invite",
        icon: Users,
        color: "text-green-400",
        glowColor: "rgba(74,222,128,0.4)",
        subFeatures: ["100pts Per Signup", "Pro Bonus", "Referral Link", "Points Rewards"],
      },
      {
        name: "Support Center",
        description: "Submit support tickets, get help from the team, and track your requests. We're here when you need us.",
        href: "/support",
        icon: HeadphonesIcon,
        color: "text-cyan-400",
        glowColor: "rgba(6,182,212,0.4)",
        subFeatures: ["Submit Tickets", "Track Requests", "FAQ", "Live Chat"],
      },
      {
        name: "Contact Us",
        description: "Reach out directly with questions, feedback, partnership inquiries, or just to say hello.",
        href: "/contact",
        icon: Mail,
        color: "text-purple-400",
        glowColor: "rgba(168,85,247,0.4)",
        subFeatures: ["General Inquiries", "Partnerships", "Feedback", "Press"],
      },
    ],
  },
  {
    title: "Business Tools",
    description: "Professional tools for mechanics and shop owners",
    icon: Store,
    color: "text-amber-400",
    gradient: "from-amber-500 to-orange-500",
    features: [
      {
        name: "Mechanics Garage",
        description: "Full business management suite for auto shops. Work orders, customer CRM, invoicing, inventory, scheduling, and more.",
        href: "/mechanics-garage",
        icon: Store,
        color: "text-amber-400",
        glowColor: "rgba(251,191,36,0.4)",
        pro: true,
        subFeatures: ["Work Orders", "Customer CRM", "Invoicing", "Inventory"],
      },
      {
        name: "Shop Portal",
        description: "Set up your shop profile, manage your team, handle customer reviews, and connect with the community.",
        href: "/shop-portal",
        icon: MapPin,
        color: "text-orange-400",
        glowColor: "rgba(251,146,60,0.4)",
        subFeatures: ["Shop Profile", "Team Management", "Reviews", "Community"],
      },
      {
        name: "Become a Vendor",
        description: "Partner with GarageBot to reach thousands of parts seekers. Free signup for retailers, distributors, and manufacturers.",
        href: "/vendor-signup",
        icon: Globe,
        color: "text-cyan-400",
        glowColor: "rgba(6,182,212,0.4)",
        badge: "FREE",
        badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        subFeatures: ["Free Signup", "Reach Thousands", "Analytics", "Promoted Listings"],
      },
      {
        name: "CDL Directory",
        description: "Comprehensive directory of trucking companies and CDL training programs with search, filter, and interest forms.",
        href: "/cdl-directory",
        icon: Truck,
        color: "text-blue-400",
        glowColor: "rgba(96,165,250,0.4)",
        subFeatures: ["Company Listings", "CDL Programs", "Search & Filter", "Interest Forms"],
      },
    ],
  },
  {
    title: "Insurance & Financial",
    description: "Compare rates and manage automotive finances",
    icon: Shield,
    color: "text-green-400",
    gradient: "from-green-500 to-emerald-500",
    features: [
      {
        name: "Insurance Comparison",
        description: "Compare quotes from top insurance providers. Find the best rates for auto, motorcycle, boat, RV, and more.",
        href: "/insurance",
        icon: Shield,
        color: "text-green-400",
        glowColor: "rgba(74,222,128,0.4)",
        subFeatures: ["Multi-Vehicle", "Quote Comparison", "Top Providers", "Savings Estimates"],
      },
    ],
  },
  {
    title: "Identity & Blockchain",
    description: "Verified digital identity and blockchain certificates on Solana",
    icon: Blocks,
    color: "text-purple-400",
    gradient: "from-purple-500 to-violet-500",
    features: [
      {
        name: "Genesis Hallmark",
        description: "Your unique blockchain-verified digital certificate on Solana. Early adopters get exclusive Genesis NFTs with permanent on-chain proof.",
        href: "/hallmark",
        icon: Award,
        color: "text-purple-400",
        glowColor: "rgba(168,85,247,0.5)",
        badge: "NFT",
        badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        subFeatures: ["Solana Blockchain", "QR Verification", "Genesis Certificate", "On-Chain Proof"],
      },
      {
        name: "Mission Control",
        description: "Your personal dashboard with system health, traffic analytics, blockchain assets, and platform metrics.",
        href: "/dashboard",
        icon: Layout,
        color: "text-cyan-400",
        glowColor: "rgba(6,182,212,0.4)",
        subFeatures: ["System Health", "Traffic Analytics", "Blockchain Assets", "Metrics"],
      },
    ],
  },
  {
    title: "Account & Settings",
    description: "Manage your profile, preferences, and account details",
    icon: Settings,
    color: "text-gray-400",
    gradient: "from-gray-500 to-slate-500",
    features: [
      {
        name: "Account Setup",
        description: "Manage your profile information, preferences, notification settings, and connected services.",
        href: "/account",
        icon: Settings,
        color: "text-gray-400",
        glowColor: "rgba(156,163,175,0.3)",
        subFeatures: ["Profile", "Preferences", "Notifications", "Connected Services"],
      },
      {
        name: "About GarageBot",
        description: "Learn about GarageBot's mission, the team behind it, and our vision to revolutionize parts search.",
        href: "/about",
        icon: Sparkles,
        color: "text-cyan-400",
        glowColor: "rgba(6,182,212,0.3)",
        subFeatures: ["Our Mission", "The Team", "DarkWave Studios", "Vision"],
      },
    ],
  },
  {
    title: "Membership & Pro",
    description: "Unlock the full GarageBot experience",
    icon: Crown,
    color: "text-yellow-400",
    gradient: "from-yellow-500 to-amber-500",
    features: [
      {
        name: "Pro Membership",
        description: "Join the Founders Circle starting at $5.99/mo. Unlock marketplace selling, ad-free experience, priority AI, and exclusive features.",
        href: "/pro",
        icon: Crown,
        color: "text-yellow-400",
        glowColor: "rgba(234,179,8,0.5)",
        badge: "FOUNDERS",
        badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        subFeatures: ["Sell on Marketplace", "Ad-Free", "Priority AI", "Founders Badge"],
      },
    ],
  },
];

const totalFeatures = FEATURE_CATEGORIES.reduce((acc, cat) => acc + cat.features.length, 0);
const totalSubFeatures = FEATURE_CATEGORIES.reduce(
  (acc, cat) => acc + cat.features.reduce((a, f) => a + (f.subFeatures?.length || 0), 0),
  0
);

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

const categoryVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = FEATURE_CATEGORIES.map((cat) => ({
    ...cat,
    features: cat.features.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.subFeatures?.some((sf) => sf.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter((cat) => cat.features.length > 0);

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-black overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02]">
          <Compass className="w-[60vw] h-[60vw] text-primary" />
        </div>
      </div>

      <Nav />

      <div className="flex-1 max-w-7xl mx-auto px-3 md:px-6 pt-20 pb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-10"
        >
          <div className="sparkle-container relative inline-block">
            <div className="sparkle" style={{ top: '0%', left: '10%' }} />
            <div className="sparkle" style={{ top: '20%', right: '5%', animationDelay: '0.7s' }} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-wider mb-5 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--color-primary)]" />
            FEATURE DISCOVERY HUB
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-tech font-black uppercase tracking-tight mb-4"
            data-testid="heading-explore"
          >
            <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text">E</span>
            <span className="text-foreground">xplore</span>
            <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text"> E</span>
            <span className="text-foreground">verything</span>
          </h1>
          <p className="text-muted-foreground/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            GarageBot is packed with <span className="text-primary font-medium">{totalFeatures} powerful features</span> and{" "}
            <span className="text-primary font-medium">{totalSubFeatures}+ capabilities</span>.
            Here's everything at your fingertips.
          </p>

          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-mono text-primary">{totalFeatures} Features</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              <Blocks className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-mono text-purple-400">{FEATURE_CATEGORIES.length} Categories</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
              <Award className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] font-mono text-green-400">{totalSubFeatures}+ Capabilities</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search features... (warranty, fuel tracker, marketplace...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-black/40 border-white/10 focus:border-primary/50 font-mono text-sm backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg"
                data-testid="input-search-features"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-lg text-xs font-tech uppercase transition-all duration-300 ${
              activeCategory === null
                ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "glass-card text-muted-foreground hover:text-primary"
            }`}
            data-testid="filter-all"
          >
            All Features
          </button>
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat.title}
              onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
              className={`px-3 py-2 rounded-lg text-xs font-tech uppercase transition-all duration-300 flex items-center gap-1.5 ${
                activeCategory === cat.title
                  ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "glass-card text-muted-foreground hover:text-primary"
              }`}
              data-testid={`filter-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.title}
            </button>
          ))}
        </motion.div>

        <div className="space-y-14">
          <AnimatePresence>
            {filteredCategories
              .filter((cat) => !activeCategory || cat.title === activeCategory)
              .map((category) => (
                <motion.div
                  key={category.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={categoryVariants}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg shadow-black/30`}
                      style={{ boxShadow: `0 8px 30px rgba(0,0,0,0.3)` }}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2
                        className="text-xl md:text-2xl font-tech font-bold uppercase tracking-wide"
                        data-testid={`heading-category-${category.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {category.title}
                      </h2>
                      <p className="text-xs text-muted-foreground font-mono">{category.description}</p>
                    </div>
                    <Badge className="bg-white/5 text-muted-foreground border-white/10 font-mono text-[10px]">
                      {category.features.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.features.map((feature, idx) => (
                      <motion.div
                        key={feature.name}
                        custom={idx}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={cardVariants}
                      >
                        <Link href={feature.href}>
                          <div
                            className="glass-card card-3d relative overflow-hidden p-5 rounded-xl cursor-pointer h-full group"
                            data-testid={`card-feature-${feature.name.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <div
                              className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                background: `linear-gradient(90deg, transparent, ${feature.glowColor}, transparent)`,
                              }}
                            />

                            <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                              <feature.icon className="w-full h-full" />
                            </div>

                            <div className="relative z-10">
                              <div className="flex items-start gap-3 mb-3">
                                <div
                                  className="p-2.5 rounded-xl bg-black/40 border border-white/10 group-hover:border-primary/30 transition-all duration-300 flex-shrink-0"
                                  style={{
                                    boxShadow: `0 0 0px ${feature.glowColor}`,
                                    transition: 'box-shadow 0.5s ease, border-color 0.3s ease',
                                  }}
                                >
                                  <feature.icon className={`w-5 h-5 ${feature.color} group-hover:drop-shadow-[0_0_8px_${feature.glowColor}] transition-all`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-tech font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors duration-300">
                                      {feature.name}
                                    </h3>
                                    {feature.badge && (
                                      <Badge className={`${feature.badgeColor} text-[9px] font-mono px-1.5 py-0`}>
                                        {feature.badge}
                                      </Badge>
                                    )}
                                    {feature.pro && (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] font-mono px-1.5 py-0">
                                        PRO
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
                              </div>

                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                {feature.description}
                              </p>

                              {feature.subFeatures && feature.subFeatures.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {feature.subFeatures.map((sf) => (
                                    <span
                                      key={sf}
                                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-muted-foreground/70 border border-white/5 group-hover:border-primary/20 group-hover:text-muted-foreground transition-all duration-300"
                                    >
                                      {sf}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {searchQuery && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-ultra rounded-2xl p-12 max-w-md mx-auto">
              <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-mono text-sm">No features match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary text-xs mt-3 hover:underline font-tech uppercase tracking-wider"
              >
                Clear Search
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <Card className="glass-card-accent card-3d p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-primary/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="font-tech font-bold text-xl uppercase mb-2">More Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-5">
                We're constantly building new features. Have a suggestion? Let us know through Support or Signal Chat!
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link href="/support">
                  <button className="px-5 py-2.5 rounded-lg bg-primary/20 text-primary text-sm font-tech uppercase hover:bg-primary/30 transition-all duration-300 border border-primary/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]" data-testid="button-suggest-feature">
                    Suggest a Feature
                  </button>
                </Link>
                <Link href="/chat">
                  <button className="px-5 py-2.5 rounded-lg glass-card text-muted-foreground text-sm font-tech uppercase hover:text-primary transition-all duration-300" data-testid="button-join-chat">
                    Join the Conversation
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}