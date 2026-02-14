import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Car, Wrench, ShoppingCart, Users, Shield, FileText,
  Store, Tag, Heart, FolderOpen, Fuel, DollarSign, Calendar,
  TrendingDown, Phone, MessageCircle, Gamepad2, Coffee, Truck,
  Globe, Crown, ChevronRight, Sparkles, MapPin, Star,
  BookOpen, Blocks, Compass, Award,
  HeadphonesIcon, Mail, Settings, Rocket, Eye, ArrowRight
} from "lucide-react";

import imgPartsSearch from "@/assets/images/cc/parts-search.png";
import imgPartsMarketplace from "@/assets/images/cc/parts-marketplace.png";
import imgWishlists from "@/assets/images/cc/wishlists.png";
import imgBuildProjects from "@/assets/images/cc/build-projects.png";
import imgMyGarage from "@/assets/images/cc/my-garage.png";
import imgDiyGuides from "@/assets/images/cc/diy-guides.png";
import imgShadeTree from "@/assets/images/cc/shade-tree.png";
import imgTriviaQuiz from "@/assets/images/cc/trivia-quiz.png";
import imgBlogManager from "@/assets/images/cc/blog-manager.png";
import imgSignalChat from "@/assets/images/cc/signal-chat.png";
import imgBreakRoom from "@/assets/images/cc/break-room.png";
import imgSupportCenter from "@/assets/images/cc/support-center.png";
import imgMechanicsGarage from "@/assets/images/cc/mechanics-garage.png";
import imgShopPortal from "@/assets/images/cc/shop-portal.png";
import imgVendorManagement from "@/assets/images/cc/vendor-management.png";
import imgCdlDirectory from "@/assets/images/cc/cdl-directory.png";
import imgRentalCars from "@/assets/images/cc/rental-cars.png";
import imgInsurance from "@/assets/images/cc/insurance.png";
import imgGenesisHallmarks from "@/assets/images/cc/genesis-hallmarks.png";
import imgProMembership from "@/assets/images/cc/pro-membership.png";
import imgPriceAlerts from "@/assets/images/cc/price-alerts.png";
import imgReferralProgram from "@/assets/images/cc/referral-program.png";

import imgWarrantyTracker from "@/assets/images/hub/warranty-tracker.png";
import imgFuelTracker from "@/assets/images/hub/fuel-tracker.png";
import imgExpenseTracker from "@/assets/images/hub/expense-tracker.png";
import imgEmergencyInfo from "@/assets/images/hub/emergency-info.png";
import imgAccountSettings from "@/assets/images/hub/account-settings.png";
import imgAboutGaragebot from "@/assets/images/hub/about-garagebot.png";
import imgMaintenanceScheduler from "@/assets/images/hub/maintenance-scheduler.png";
import imgPriceWatch from "@/assets/images/hub/price-watch.png";
import imgInviteFriends from "@/assets/images/hub/invite-friends.png";
import imgContactUs from "@/assets/images/hub/contact-us.png";

interface Feature {
  name: string;
  description: string;
  href: string;
  icon: any;
  image: string;
  glowColor: string;
  badge?: string;
  badgeVariant?: "new" | "live" | "hot" | "pro" | "free" | "nft" | "founders";
  subFeatures?: string[];
  featured?: boolean;
}

interface FeatureCategory {
  title: string;
  description: string;
  icon: any;
  gradient: string;
  features: Feature[];
}

const GLOW_MAP: Record<string, string> = {
  cyan: "0 0 30px rgba(6,182,212,0.35)",
  green: "0 0 30px rgba(34,197,94,0.35)",
  purple: "0 0 30px rgba(168,85,247,0.35)",
  amber: "0 0 30px rgba(245,158,11,0.35)",
  blue: "0 0 30px rgba(59,130,246,0.35)",
  pink: "0 0 30px rgba(236,72,153,0.35)",
  orange: "0 0 30px rgba(249,115,22,0.35)",
  red: "0 0 30px rgba(239,68,68,0.35)",
  emerald: "0 0 30px rgba(16,185,129,0.35)",
  yellow: "0 0 30px rgba(234,179,8,0.35)",
  teal: "0 0 30px rgba(20,184,166,0.35)",
  indigo: "0 0 30px rgba(99,102,241,0.35)",
};

const BADGE_STYLES: Record<string, string> = {
  new: "bg-gradient-to-r from-cyan-500 to-blue-500",
  live: "bg-gradient-to-r from-green-500 to-emerald-500",
  hot: "bg-gradient-to-r from-orange-500 to-rose-500",
  pro: "bg-gradient-to-r from-yellow-500 to-amber-500",
  free: "bg-gradient-to-r from-teal-500 to-cyan-500",
  nft: "bg-gradient-to-r from-purple-500 to-pink-500",
  founders: "bg-gradient-to-r from-yellow-500 to-amber-500",
};

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: "Parts & Shopping",
    description: "Search, compare, and save across 68+ retailers",
    icon: ShoppingCart,
    gradient: "from-cyan-500 to-blue-600",
    features: [
      { name: "Parts Search", description: "Search 15M+ parts across 68+ retailers with price comparison and vehicle-aware results.", href: "/", icon: Search, image: imgPartsSearch, glowColor: "cyan", featured: true, subFeatures: ["68+ Retailers", "Price Compare", "Local Pickup", "Vehicle-Aware"] },
      { name: "Parts Marketplace", description: "Buy and sell used parts directly. List spare parts, search by fitment, and message sellers.", href: "/marketplace", icon: Tag, image: imgPartsMarketplace, glowColor: "green", badge: "NEW", badgeVariant: "new", subFeatures: ["List Parts", "Fitment Search", "Messaging", "Photos"] },
      { name: "Wishlists", description: "Save parts to organized lists. Share with friends or your mechanic and track price changes.", href: "/wishlists", icon: Heart, image: imgWishlists, glowColor: "pink", subFeatures: ["Multiple Lists", "Share Link", "Price Tracking", "Priority Sort"] },
      { name: "Build Projects", description: "Plan vehicle builds with parts lists, spending vs budget tracking, and purchase progress.", href: "/projects", icon: FolderOpen, image: imgBuildProjects, glowColor: "amber", subFeatures: ["Budget Tracking", "Parts Checklist", "Progress", "Cost Estimate"] },
      { name: "Price Alerts", description: "Set alerts on parts you need. Get notified when prices drop at any of the 68+ retailers.", href: "/garage", icon: TrendingDown, image: imgPriceAlerts, glowColor: "yellow", subFeatures: ["Price Drops", "Multi-Retailer", "Target Price", "History"] },
    ],
  },
  {
    title: "My Garage",
    description: "Complete vehicle fleet management with 7 smart tools",
    icon: Car,
    gradient: "from-purple-500 to-pink-500",
    features: [
      { name: "Vehicle Fleet", description: "Add all your vehicles with VIN decoding, manage details, and get vehicle-specific recommendations.", href: "/garage", icon: Car, image: imgMyGarage, glowColor: "purple", featured: true, subFeatures: ["VIN Decoder", "Multi-Vehicle", "Smart Recs", "Passport"] },
      { name: "Warranty Tracker", description: "Track all warranties in one place. Get alerts before they expire so you never miss a claim.", href: "/garage", icon: Shield, image: imgWarrantyTracker, glowColor: "blue", subFeatures: ["Expiry Alerts", "Coverage", "Provider Info", "Mileage Limits"] },
      { name: "Maintenance Scheduler", description: "Service schedules based on mileage and time. Reminders for oil changes, tire rotations, and more.", href: "/garage", icon: Calendar, image: imgMaintenanceScheduler, glowColor: "emerald", subFeatures: ["Custom Schedules", "Mileage-Based", "Time-Based", "History"] },
      { name: "Fuel Tracker", description: "Log fill-ups, track MPG over time, and see cost trends. Know exactly what you're spending.", href: "/garage", icon: Fuel, image: imgFuelTracker, glowColor: "orange", subFeatures: ["MPG Tracking", "Cost Per Mile", "Fill-Up Log", "Trends"] },
      { name: "Expense Tracker", description: "Track every dollar spent on your vehicles. Categorize repairs, maintenance, and upgrades.", href: "/garage", icon: DollarSign, image: imgExpenseTracker, glowColor: "green", subFeatures: ["Categories", "Monthly", "Per-Vehicle", "Receipts"] },
      { name: "Price Watch", description: "Monitor parts prices across retailers. Get notified instantly when prices drop.", href: "/garage", icon: Eye, image: imgPriceWatch, glowColor: "cyan", subFeatures: ["Price Drop Alerts", "Multi-Retailer", "Target Price", "History"] },
      { name: "Emergency Info", description: "Store emergency contacts, roadside assistance, and insurance info for quick access.", href: "/garage", icon: Phone, image: imgEmergencyInfo, glowColor: "red", subFeatures: ["Roadside Assist", "Emergency Contacts", "Insurance", "Quick Access"] },
    ],
  },
  {
    title: "DIY & Learning",
    description: "Repair guides, community tips, and automotive knowledge",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-500",
    features: [
      { name: "DIY Repair Guides", description: "Step-by-step guides for every skill level with videos, tools needed, and difficulty ratings.", href: "/diy-guides", icon: Wrench, image: imgDiyGuides, glowColor: "emerald", featured: true, subFeatures: ["28+ Guides", "Video Tutorials", "Tool Lists", "Difficulty"] },
      { name: "Shade Tree Mechanics", description: "Community hub for DIY enthusiasts. Browse tips, tricks, and estimated savings vs shop prices.", href: "/shade-tree", icon: Star, image: imgShadeTree, glowColor: "yellow", subFeatures: ["Community Tips", "Savings Calc", "Skill Levels", "Photo Guides"] },
      { name: "Auto Trivia", description: "Test your automotive knowledge with fun trivia. Challenge friends and learn cool car facts.", href: "/trivia", icon: Gamepad2, image: imgTriviaQuiz, glowColor: "pink", subFeatures: ["Categories", "Score Tracking", "Fun Facts", "Challenge Mode"] },
      { name: "Blog", description: "Expert articles on maintenance, industry news, product reviews, and how-to guides.", href: "/blog", icon: FileText, image: imgBlogManager, glowColor: "blue", subFeatures: ["Expert Articles", "Reviews", "Industry News", "How-To"] },
    ],
  },
  {
    title: "Community & Social",
    description: "Connect with fellow enthusiasts, get help, and stay engaged",
    icon: Users,
    gradient: "from-blue-500 to-indigo-500",
    features: [
      { name: "Signal Chat", description: "Real-time community messaging with channels, DMs, threads, reactions, and Buddy AI bot support.", href: "/chat", icon: MessageCircle, image: imgSignalChat, glowColor: "blue", badge: "LIVE", badgeVariant: "live", featured: true, subFeatures: ["Channels", "DMs", "Buddy AI Bot", "Threads & Polls"] },
      { name: "Break Room", description: "Central hub for automotive news, receipt scanner, mileage tracker, speed trap alerts, and fuel prices.", href: "/break-room", icon: Coffee, image: imgBreakRoom, glowColor: "amber", badge: "HUB", badgeVariant: "hot", subFeatures: ["News Feed", "Receipt Scanner", "Mileage Tracker", "Fuel Prices"] },
      { name: "Invite Friends", description: "Earn 100 points per signup, bonus when they go Pro. Redeem for Pro membership time.", href: "/invite", icon: Users, image: imgInviteFriends, glowColor: "green", subFeatures: ["100pts Per Signup", "Pro Bonus", "Referral Link", "Rewards"] },
      { name: "Support Center", description: "Submit support tickets, get help from the team, and track your requests.", href: "/support", icon: HeadphonesIcon, image: imgSupportCenter, glowColor: "cyan", subFeatures: ["Tickets", "Track Requests", "FAQ", "Live Chat"] },
      { name: "Contact Us", description: "Reach out with questions, feedback, partnership inquiries, or just to say hello.", href: "/contact", icon: Mail, image: imgContactUs, glowColor: "purple", subFeatures: ["Inquiries", "Partnerships", "Feedback", "Press"] },
    ],
  },
  {
    title: "Business Tools",
    description: "Professional tools for mechanics and shop owners",
    icon: Store,
    gradient: "from-amber-500 to-orange-500",
    features: [
      { name: "Mechanics Garage", description: "Full shop management: work orders, customer CRM, invoicing, inventory, scheduling, and more.", href: "/mechanics-garage", icon: Store, image: imgMechanicsGarage, glowColor: "amber", badge: "PRO", badgeVariant: "pro", featured: true, subFeatures: ["Work Orders", "CRM", "Invoicing", "Inventory"] },
      { name: "Shop Portal", description: "Set up your shop profile, manage your team, handle reviews, and connect with the community.", href: "/shop-portal", icon: MapPin, image: imgShopPortal, glowColor: "orange", subFeatures: ["Shop Profile", "Team", "Reviews", "Community"] },
      { name: "Become a Vendor", description: "Partner with GarageBot to reach thousands of parts seekers. Free signup for retailers.", href: "/vendor-signup", icon: Globe, image: imgVendorManagement, glowColor: "cyan", badge: "FREE", badgeVariant: "free", subFeatures: ["Free Signup", "Reach Thousands", "Analytics", "Promoted"] },
      { name: "CDL Directory", description: "Directory of trucking companies and CDL training programs with search and interest forms.", href: "/cdl-directory", icon: Truck, image: imgCdlDirectory, glowColor: "blue", subFeatures: ["Companies", "CDL Programs", "Search", "Interest Forms"] },
    ],
  },
  {
    title: "Insurance & Travel",
    description: "Compare rates, rent cars, and manage automotive finances",
    icon: Shield,
    gradient: "from-green-500 to-emerald-500",
    features: [
      { name: "Rental Cars", description: "Compare prices across 1,000+ rental companies worldwide. Economy to luxury, best deal every time.", href: "/rentals", icon: Car, image: imgRentalCars, glowColor: "cyan", badge: "NEW", badgeVariant: "new", subFeatures: ["1,000+ Companies", "Price Compare", "Free Cancel", "150+ Countries"] },
      { name: "Insurance Comparison", description: "Compare quotes from top providers for auto, motorcycle, boat, RV, and more.", href: "/insurance", icon: Shield, image: imgInsurance, glowColor: "green", subFeatures: ["Multi-Vehicle", "Quote Compare", "Top Providers", "Savings"] },
    ],
  },
  {
    title: "Identity & Blockchain",
    description: "Verified digital identity and blockchain certificates",
    icon: Blocks,
    gradient: "from-purple-500 to-violet-500",
    features: [
      { name: "Genesis Hallmark", description: "Blockchain-verified digital certificate on Solana. Early adopters get exclusive Genesis NFTs.", href: "/hallmark", icon: Award, image: imgGenesisHallmarks, glowColor: "purple", badge: "NFT", badgeVariant: "nft", featured: true, subFeatures: ["Solana Blockchain", "QR Verification", "Genesis Cert", "On-Chain"] },
      { name: "Referral Program", description: "Earn points for every friend who signs up. Redeem for Pro membership and exclusive perks.", href: "/invite", icon: Rocket, image: imgReferralProgram, glowColor: "pink", subFeatures: ["Points System", "Pro Rewards", "Invite Link", "Bonuses"] },
    ],
  },
  {
    title: "Membership & Pro",
    description: "Unlock the full GarageBot experience",
    icon: Crown,
    gradient: "from-yellow-500 to-amber-500",
    features: [
      { name: "Pro Membership", description: "Join the Founders Circle from $5.99/mo. Unlock marketplace selling, ad-free, priority AI, and more.", href: "/pro", icon: Crown, image: imgProMembership, glowColor: "yellow", badge: "FOUNDERS", badgeVariant: "founders", featured: true, subFeatures: ["Sell on Marketplace", "Ad-Free", "Priority AI", "Founders Badge"] },
    ],
  },
  {
    title: "Account & Settings",
    description: "Manage your profile and learn about GarageBot",
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
    features: [
      { name: "Account Setup", description: "Manage your profile, preferences, notification settings, and connected services.", href: "/account", icon: Settings, image: imgAccountSettings, glowColor: "blue", subFeatures: ["Profile", "Preferences", "Notifications", "Services"] },
      { name: "About GarageBot", description: "Learn about our mission, the team behind it, and our vision for the future of parts search.", href: "/about", icon: Sparkles, image: imgAboutGaragebot, glowColor: "cyan", subFeatures: ["Our Mission", "The Team", "DarkWave Studios", "Vision"] },
    ],
  },
];

const totalFeatures = FEATURE_CATEGORIES.reduce((acc, cat) => acc + cat.features.length, 0);
const totalSubFeatures = FEATURE_CATEGORIES.reduce(
  (acc, cat) => acc + cat.features.reduce((a, f) => a + (f.subFeatures?.length || 0), 0), 0
);

function FeatureCard({ feature, index, catIdx }: { feature: Feature; index: number; catIdx: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const glowShadow = GLOW_MAP[feature.glowColor] || GLOW_MAP.cyan;

  return (
    <Link href={feature.href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: catIdx * 0.05 + index * 0.06 }}
        whileHover={{ scale: 1.02, y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative cursor-pointer rounded-2xl overflow-hidden group ${feature.featured ? "h-[240px]" : "h-[220px]"} border transition-all duration-300 ${isHovered ? "border-white/20" : "border-white/[0.06]"}`}
        style={{ boxShadow: isHovered ? glowShadow : "0 4px 30px rgba(0,0,0,0.3)" }}
        data-testid={`card-feature-${feature.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <img
          src={feature.image}
          alt={feature.name}
          className="absolute inset-0 w-full h-full object-cover brightness-110 group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 group-hover:from-black/90 transition-all duration-500" />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 100%, ${GLOW_MAP[feature.glowColor]?.replace("0 0 30px ", "").replace("0.35", "0.08") || "rgba(6,182,212,0.08)"}, transparent 70%)` }} />

        {feature.badge && (
          <div className="absolute top-3 right-3 z-20">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full text-white shadow-lg ${BADGE_STYLES[feature.badgeVariant || "new"]}`}>
              {feature.badge}
            </span>
          </div>
        )}

        {feature.featured && (
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 backdrop-blur-sm flex items-center gap-1">
              <Star className="w-2.5 h-2.5" />
              Featured
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/15 group-hover:border-white/20 transition-all duration-300">
              <feature.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300 truncate flex-1">
              {feature.name}
            </h3>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
          </div>
          <p className="text-[11px] text-white/45 leading-relaxed mb-2.5 line-clamp-2 group-hover:text-white/60 transition-colors duration-300">{feature.description}</p>
          {feature.subFeatures && (
            <div className="flex flex-wrap gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              {feature.subFeatures.slice(0, 4).map((sf) => (
                <span key={sf} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 border border-white/[0.04] group-hover:bg-white/10 group-hover:text-white/70 group-hover:border-white/10 transition-all duration-300">
                  {sf}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

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
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#0a0f1e] to-[#050810]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <Nav />

      <div className="flex-1 max-w-7xl mx-auto px-3 md:px-6 pt-20 pb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/[0.08] text-cyan-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
            Navigation Hub
          </motion.div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-tech font-black uppercase tracking-tight mb-4"
            data-testid="heading-explore"
          >
            <span className="text-cyan-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.9)]">Explore</span>{" "}
            <span className="text-white/90">Everything</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-6">
            <span className="text-cyan-400 font-medium">{totalFeatures} features</span> and{" "}
            <span className="text-cyan-400 font-medium">{totalSubFeatures}+ capabilities</span> at your fingertips.
            Find exactly what you need in seconds.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono text-cyan-400">{totalFeatures} Features</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <Blocks className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-mono text-purple-400">{FEATURE_CATEGORIES.length} Categories</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] font-mono text-green-400">{totalSubFeatures}+ Capabilities</span>
            </div>
          </div>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-tech text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-shadow duration-300 border border-cyan-400/20"
              data-testid="button-see-full-site"
            >
              <Compass className="w-4.5 h-4.5" />
              See Full Site Experience
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-cyan-500/15 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
              <Input
                placeholder="Search features... (warranty, fuel, marketplace, trivia...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-white/[0.03] border-white/[0.06] focus:border-cyan-500/40 font-mono text-sm backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-xl text-white placeholder:text-white/25"
                data-testid="input-search-features"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-tech uppercase transition-all duration-300 backdrop-blur-sm ${
              activeCategory === null
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                : "bg-white/[0.02] text-white/40 border border-white/[0.06] hover:text-cyan-400 hover:border-cyan-500/20"
            }`}
            data-testid="filter-all"
          >
            All Features
          </button>
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat.title}
              onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
              className={`px-3 py-2 rounded-xl text-xs font-tech uppercase transition-all duration-300 flex items-center gap-1.5 backdrop-blur-sm ${
                activeCategory === cat.title
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  : "bg-white/[0.02] text-white/40 border border-white/[0.06] hover:text-cyan-400 hover:border-cyan-500/20"
              }`}
              data-testid={`filter-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.title}
            </button>
          ))}
        </motion.div>

        <div className="space-y-16">
          <AnimatePresence>
            {filteredCategories
              .filter((cat) => !activeCategory || cat.title === activeCategory)
              .map((category, catIdx) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg`}
                      style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-xl md:text-2xl font-tech font-bold uppercase tracking-wide text-white"
                        data-testid={`heading-category-${category.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {category.title}
                      </h2>
                      <p className="text-xs text-white/35 font-mono">{category.description}</p>
                    </div>
                    <Badge className="bg-white/[0.04] text-white/40 border-white/[0.06] font-mono text-[10px] backdrop-blur-sm">
                      {category.features.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.features.map((feature, idx) => (
                      <FeatureCard
                        key={feature.name}
                        feature={feature}
                        index={idx}
                        catIdx={catIdx}
                      />
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
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 max-w-md mx-auto">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-mono text-sm">No features match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-cyan-400 text-xs mt-3 hover:underline font-tech uppercase tracking-wider"
                data-testid="button-clear-search"
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
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-8 md:p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-purple-500/[0.04]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                  <Compass className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-tech font-bold text-xl uppercase mb-2 text-white">Experience the Full Site</h3>
                <p className="text-sm text-white/40 max-w-lg">
                  This hub gives you quick access to every feature. For the full immersive GarageBot experience with your personalized dashboard, vehicle data, and AI assistant, dive into the main site.
                </p>
              </div>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-tech text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-shadow duration-300 whitespace-nowrap border border-cyan-400/20"
                  data-testid="button-full-site-bottom"
                >
                  <Rocket className="w-4 h-4" />
                  Launch Full Site
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-8">
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="font-tech font-bold text-xl uppercase mb-2 text-white">More Coming Soon</h3>
              <p className="text-sm text-white/40 max-w-lg mx-auto mb-5">
                We're constantly building new features. Have a suggestion? Let us know through Support or Signal Chat!
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link href="/support">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-sm font-tech uppercase border border-cyan-500/20 hover:bg-cyan-500/15 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300"
                    data-testid="button-suggest-feature"
                  >
                    Suggest a Feature
                  </motion.button>
                </Link>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.03] text-white/50 text-sm font-tech uppercase border border-white/[0.06] hover:text-cyan-400 hover:border-cyan-500/20 transition-all duration-300"
                    data-testid="button-join-chat"
                  >
                    Join the Conversation
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
