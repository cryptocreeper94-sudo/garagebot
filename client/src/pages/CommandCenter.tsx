import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Nav from "@/components/Nav";
import { Badge } from "@/components/ui/badge";
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

import imgAnalyticsDashboard from "@/assets/images/cc/analytics-dashboard.png";
import imgSystemHealth from "@/assets/images/cc/system-health.png";
import imgAffiliateAnalytics from "@/assets/images/cc/affiliate-analytics.png";
import imgSeoManager from "@/assets/images/cc/seo-manager.png";
import imgMarketingHub from "@/assets/images/cc/marketing-hub.png";
import imgBlogManager from "@/assets/images/cc/blog-manager.png";
import imgNewsletter from "@/assets/images/cc/newsletter.png";
import imgMetaAds from "@/assets/images/cc/meta-ads.png";
import imgSponsoredProducts from "@/assets/images/cc/sponsored-products.png";
import imgAffiliateNetworks from "@/assets/images/cc/affiliate-networks.png";
import imgInboundAffiliate from "@/assets/images/cc/inbound-affiliate.png";
import imgProMembership from "@/assets/images/cc/pro-membership.png";
import imgStripePayments from "@/assets/images/cc/stripe-payments.png";
import imgGenesisHallmarks from "@/assets/images/cc/genesis-hallmarks.png";
import imgReferralProgram from "@/assets/images/cc/referral-program.png";
import imgShopPortal from "@/assets/images/cc/shop-portal.png";
import imgMechanicsGarage from "@/assets/images/cc/mechanics-garage.png";
import imgShopInventory from "@/assets/images/cc/shop-inventory.png";
import imgDigitalInspections from "@/assets/images/cc/digital-inspections.png";
import imgOrbitStaffing from "@/assets/images/cc/orbit-staffing.png";
import imgBusinessIntegrations from "@/assets/images/cc/business-integrations.png";
import imgPartnerApi from "@/assets/images/cc/partner-api.png";
import imgSignalChat from "@/assets/images/cc/signal-chat.png";
import imgBreakRoom from "@/assets/images/cc/break-room.png";
import imgShadeTree from "@/assets/images/cc/shade-tree.png";
import imgTriviaQuiz from "@/assets/images/cc/trivia-quiz.png";
import imgGiveaways from "@/assets/images/cc/giveaways.png";
import imgPartsSearch from "@/assets/images/cc/parts-search.png";
import imgMyGarage from "@/assets/images/cc/my-garage.png";
import imgDiyGuides from "@/assets/images/cc/diy-guides.png";
import imgPartsMarketplace from "@/assets/images/cc/parts-marketplace.png";
import imgWishlists from "@/assets/images/cc/wishlists.png";
import imgBuildProjects from "@/assets/images/cc/build-projects.png";
import imgPriceAlerts from "@/assets/images/cc/price-alerts.png";
import imgInsurance from "@/assets/images/cc/insurance.png";
import imgRentalCars from "@/assets/images/cc/rental-cars.png";
import imgCdlDirectory from "@/assets/images/cc/cdl-directory.png";
import imgVendorManagement from "@/assets/images/cc/vendor-management.png";
import imgWeatherRadar from "@/assets/images/cc/weather-radar.png";
import imgSupportCenter from "@/assets/images/cc/support-center.png";
import imgDevPortal from "@/assets/images/cc/dev-portal.png";
import imgReleaseManager from "@/assets/images/cc/release-manager.png";
import imgBlockchainVerifier from "@/assets/images/cc/blockchain-verifier.png";
import imgUserManagement from "@/assets/images/cc/user-management.png";
import imgExplorePage from "@/assets/images/cc/explore-page.png";
import imgInvestorPortal from "@/assets/images/cc/investor-portal.png";

const GLOW_MAP: Record<string, string> = {
  "shadow-cyan-500/30": "0 0 25px rgba(6,182,212,0.3)",
  "shadow-green-500/30": "0 0 25px rgba(34,197,94,0.3)",
  "shadow-purple-500/30": "0 0 25px rgba(168,85,247,0.3)",
  "shadow-amber-500/30": "0 0 25px rgba(245,158,11,0.3)",
  "shadow-blue-500/30": "0 0 25px rgba(59,130,246,0.3)",
  "shadow-pink-500/30": "0 0 25px rgba(236,72,153,0.3)",
  "shadow-indigo-500/30": "0 0 25px rgba(99,102,241,0.3)",
  "shadow-yellow-500/30": "0 0 25px rgba(234,179,8,0.3)",
  "shadow-orange-500/30": "0 0 25px rgba(249,115,22,0.3)",
  "shadow-red-500/30": "0 0 25px rgba(239,68,68,0.3)",
  "shadow-teal-500/30": "0 0 25px rgba(20,184,166,0.3)",
  "shadow-violet-500/30": "0 0 25px rgba(139,92,246,0.3)",
  "shadow-sky-500/30": "0 0 25px rgba(14,165,233,0.3)",
  "shadow-lime-500/30": "0 0 25px rgba(132,204,22,0.3)",
  "shadow-emerald-500/30": "0 0 25px rgba(16,185,129,0.3)",
  "shadow-slate-500/30": "0 0 25px rgba(100,116,139,0.3)",
  "shadow-rose-500/30": "0 0 25px rgba(244,63,94,0.3)",
};

interface LaunchCard {
  label: string;
  description: string;
  href: string;
  icon: any;
  image: string;
  glowColor: string;
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
    description: "Monitor your platform's performance in real-time. Track traffic, page views, sessions, device breakdowns, geographic data, and affiliate click-through rates. Your data command post for making informed decisions.",
    cards: [
      { label: "Analytics Dashboard", description: "Real-time traffic, sessions, devices & geo data", href: "/dev", icon: BarChart3, image: imgAnalyticsDashboard, glowColor: "shadow-cyan-500/30", badge: "Live", featured: true },
      { label: "System Dashboard", description: "API health, server status & traffic charts", href: "/dashboard", icon: Activity, image: imgSystemHealth, glowColor: "shadow-green-500/30" },
      { label: "Affiliate Analytics", description: "Click tracking & commission performance reports", href: "/dev", icon: TrendingUp, image: imgAffiliateAnalytics, glowColor: "shadow-purple-500/30" },
      { label: "SEO Manager", description: "Page meta tags, Open Graph & crawl optimization", href: "/dev", icon: Search, image: imgSeoManager, glowColor: "shadow-amber-500/30" },
    ]
  },
  {
    title: "Marketing & Growth",
    icon: Megaphone,
    gradient: "from-purple-500 to-pink-500",
    description: "Grow your audience and drive engagement. Manage social media auto-posting to Facebook, schedule content rotations, run Meta ad campaigns, publish blog content, and manage sponsored product placements.",
    cards: [
      { label: "Marketing Hub", description: "Meta auto-posting, 60+ posts, 3-hour rotation", href: "/marketing", icon: Megaphone, image: imgMarketingHub, glowColor: "shadow-purple-500/30", featured: true },
      { label: "Blog Manager", description: "AI-generated posts, publish & feature controls", href: "/blog", icon: FileText, image: imgBlogManager, glowColor: "shadow-blue-500/30" },
      { label: "Newsletter", description: "Subscriber management & email campaigns", href: "/dev", icon: Mail, image: imgNewsletter, glowColor: "shadow-pink-500/30" },
      { label: "Meta Ads Campaigns", description: "Facebook/Instagram ad targeting & management", href: "/marketing", icon: Globe, image: imgMetaAds, glowColor: "shadow-indigo-500/30" },
      { label: "Sponsored Products", description: "Featured placements & promoted listings", href: "/dev", icon: Star, image: imgSponsoredProducts, glowColor: "shadow-yellow-500/30" },
    ]
  },
  {
    title: "Revenue & Monetization",
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-500",
    description: "Track and optimize every revenue stream. Manage affiliate networks across 50+ retailers, run the inbound affiliate program (GB-XXXXXX), process Stripe payments, handle Pro subscriptions, and mint Genesis Hallmark NFTs.",
    cards: [
      { label: "Affiliate Networks", description: "Amazon, CJ, eBay, ShareASale — 50+ retailers", href: "/dev", icon: Link2, image: imgAffiliateNetworks, glowColor: "shadow-green-500/30", badge: "Earn", featured: true },
      { label: "Inbound Affiliate Program", description: "GB-XXXXXX referral codes, commissions & payouts", href: "/affiliates", icon: Users, image: imgInboundAffiliate, glowColor: "shadow-cyan-500/30", badge: "New" },
      { label: "Pro Memberships", description: "Founders Circle subscriptions & ad-free tiers", href: "/pro", icon: Crown, image: imgProMembership, glowColor: "shadow-yellow-500/30" },
      { label: "Stripe Payments", description: "Payment processing, checkout & subscriptions", href: "/dev", icon: CreditCard, image: imgStripePayments, glowColor: "shadow-blue-500/30" },
      { label: "Genesis Hallmarks", description: "NFT minting & Solana blockchain verification", href: "/hallmark", icon: Award, image: imgGenesisHallmarks, glowColor: "shadow-amber-500/30" },
      { label: "Referral Program", description: "Points system, invite rewards & Pro bonuses", href: "/invite", icon: Send, image: imgReferralProgram, glowColor: "shadow-pink-500/30" },
    ]
  },
  {
    title: "Mechanics Garage Suite",
    icon: Wrench,
    gradient: "from-orange-500 to-red-500",
    description: "The complete shop management platform. Register shops, manage repair orders and estimates, handle inventory, run digital inspections, integrate ORBIT for payroll, and connect business tools like QuickBooks and PartsTech.",
    cards: [
      { label: "Shop Portal", description: "Shop registration, settings & management", href: "/shop-portal", icon: Building2, image: imgShopPortal, glowColor: "shadow-orange-500/30", featured: true },
      { label: "Mechanics Garage", description: "Repair orders, estimates, appointments & POS", href: "/mechanics-garage", icon: Wrench, image: imgMechanicsGarage, glowColor: "shadow-red-500/30" },
      { label: "Shop Inventory", description: "Parts inventory management & tracking", href: "/mechanics-garage", icon: Package, image: imgShopInventory, glowColor: "shadow-amber-500/30" },
      { label: "Digital Inspections", description: "Vehicle inspection reports & customer sharing", href: "/mechanics-garage", icon: ClipboardList, image: imgDigitalInspections, glowColor: "shadow-teal-500/30" },
      { label: "ORBIT Staffing", description: "Payroll, timesheets, W2/1099 processing", href: "/mechanics-garage", icon: Briefcase, image: imgOrbitStaffing, glowColor: "shadow-violet-500/30" },
      { label: "Business Integrations", description: "QuickBooks, ADP, Gusto, PartsTech & more", href: "/mechanics-garage", icon: Layers, image: imgBusinessIntegrations, glowColor: "shadow-sky-500/30" },
      { label: "Partner API", description: "B2B API keys, scopes & rate limiting", href: "/dev", icon: Terminal, image: imgPartnerApi, glowColor: "shadow-lime-500/30" },
    ]
  },
  {
    title: "Community & Engagement",
    icon: MessageCircle,
    gradient: "from-blue-500 to-indigo-500",
    description: "Build and nurture your community. Manage Signal Chat channels and DMs, curate Break Room content, support the Shade Tree DIY community, run trivia games, and manage prize giveaways to keep users engaged.",
    cards: [
      { label: "Signal Chat", description: "Community messaging, channels, DMs & threads", href: "/chat", icon: MessageCircle, image: imgSignalChat, glowColor: "shadow-blue-500/30", featured: true },
      { label: "Break Room", description: "News, tools, scanners, speed traps & fuel prices", href: "/break-room", icon: Coffee, image: imgBreakRoom, glowColor: "shadow-amber-500/30" },
      { label: "Shade Tree Mechanics", description: "DIY community hub & repair guides", href: "/shade-tree", icon: Wrench, image: imgShadeTree, glowColor: "shadow-emerald-500/30" },
      { label: "Trivia Quiz", description: "Automotive knowledge game", href: "/trivia", icon: Gamepad2, image: imgTriviaQuiz, glowColor: "shadow-pink-500/30" },
      { label: "Giveaways", description: "Prize drawings & winner management", href: "/dev", icon: Sparkles, image: imgGiveaways, glowColor: "shadow-yellow-500/30" },
    ]
  },
  {
    title: "Vehicle & Parts",
    icon: Car,
    gradient: "from-red-500 to-orange-500",
    description: "The core product experience. Search parts across 68+ retailers, manage vehicle fleets with VIN decoding, follow AI-generated DIY repair guides, browse the peer-to-peer marketplace, track wishlists, and monitor price alerts.",
    cards: [
      { label: "Parts Search", description: "68+ retailers, 16 categories, vehicle-aware", href: "/results", icon: Search, image: imgPartsSearch, glowColor: "shadow-cyan-500/30", featured: true },
      { label: "My Garage", description: "Fleet management, VIN decoding & service records", href: "/garage", icon: Car, image: imgMyGarage, glowColor: "shadow-red-500/30" },
      { label: "DIY Guides", description: "AI repair guides with YouTube integration", href: "/diy-guides", icon: BookOpen, image: imgDiyGuides, glowColor: "shadow-green-500/30" },
      { label: "Parts Marketplace", description: "Peer-to-peer listings with messaging", href: "/marketplace", icon: ShoppingCart, image: imgPartsMarketplace, glowColor: "shadow-orange-500/30" },
      { label: "Wishlists", description: "Save, organize & share parts lists", href: "/wishlists", icon: Heart, image: imgWishlists, glowColor: "shadow-pink-500/30" },
      { label: "Build Projects", description: "Track custom builds with parts & progress", href: "/projects", icon: GitBranch, image: imgBuildProjects, glowColor: "shadow-purple-500/30" },
      { label: "Price Alerts", description: "Track price changes & get notifications", href: "/garage", icon: Bell, image: imgPriceAlerts, glowColor: "shadow-yellow-500/30" },
    ]
  },
  {
    title: "Services & Directories",
    icon: Compass,
    gradient: "from-teal-500 to-cyan-500",
    description: "Extended platform services beyond parts. Compare insurance quotes, browse rental cars, explore the CDL trucking directory, manage vendor partnerships, monitor weather radar, and handle customer support.",
    cards: [
      { label: "Insurance Comparison", description: "Multi-provider quote comparison tool", href: "/insurance", icon: Shield, image: imgInsurance, glowColor: "shadow-teal-500/30" },
      { label: "Rental Cars", description: "Carla, Expedia & Hotels.com comparison", href: "/rentals", icon: Car, image: imgRentalCars, glowColor: "shadow-blue-500/30" },
      { label: "CDL Directory", description: "Trucking companies & CDL programs", href: "/cdl-directory", icon: Truck, image: imgCdlDirectory, glowColor: "shadow-orange-500/30" },
      { label: "Vendor Management", description: "Retailer applications & partnerships", href: "/vendor-signup", icon: Building2, image: imgVendorManagement, glowColor: "shadow-indigo-500/30" },
      { label: "Weather Radar", description: "Leaflet map, RainViewer & NOAA alerts", href: "/break-room", icon: Map, image: imgWeatherRadar, glowColor: "shadow-sky-500/30" },
      { label: "Support Center", description: "Help desk & user support", href: "/support", icon: Mail, image: imgSupportCenter, glowColor: "shadow-green-500/30" },
    ]
  },
  {
    title: "Platform & Development",
    icon: Settings,
    gradient: "from-slate-500 to-zinc-500",
    description: "Under-the-hood tools for platform management. Access the full dev portal, manage release versions with blockchain verification, handle user accounts and roles, explore features, and review investor metrics.",
    cards: [
      { label: "Dev Portal", description: "Full admin panel — roadmap, tasks, configs", href: "/dev", icon: Terminal, image: imgDevPortal, glowColor: "shadow-slate-500/30", featured: true },
      { label: "Release Manager", description: "Version tracking & changelogs", href: "/dev", icon: Rocket, image: imgReleaseManager, glowColor: "shadow-cyan-500/30" },
      { label: "Blockchain Verifier", description: "Solana on-chain verification", href: "/dev", icon: Blocks, image: imgBlockchainVerifier, glowColor: "shadow-purple-500/30" },
      { label: "User Management", description: "Accounts, roles, waitlist & sessions", href: "/dev", icon: Users, image: imgUserManagement, glowColor: "shadow-blue-500/30" },
      { label: "Explore Page", description: "Feature discovery & platform showcase", href: "/explore", icon: Compass, image: imgExplorePage, glowColor: "shadow-emerald-500/30" },
      { label: "Investor Portal", description: "Business metrics & investment deck", href: "/investors", icon: PieChart, image: imgInvestorPortal, glowColor: "shadow-amber-500/30" },
    ]
  },
];

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 basis-[280px] h-[200px] rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse">
      <div className="p-5 h-full flex flex-col justify-end">
        <div className="h-4 w-20 bg-white/5 rounded mb-2" />
        <div className="h-3 w-36 bg-white/5 rounded" />
      </div>
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div>
          <div className="h-5 w-32 bg-white/5 rounded mb-2" />
          <div className="h-3 w-64 bg-white/5 rounded" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

function CardComponent({ card, index, catIndex }: { card: LaunchCard; index: number; catIndex: number }) {
  const [, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const glowShadow = GLOW_MAP[card.glowColor] || "0 0 25px rgba(6,182,212,0.3)";

  return (
    <CarouselItem className={`pl-4 ${card.featured ? "basis-[320px]" : "basis-[280px]"}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: catIndex * 0.08 + index * 0.05 }}
        whileHover={{ scale: 1.03 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => navigate(card.href)}
        className={`relative cursor-pointer rounded-2xl overflow-hidden group ${card.featured ? "h-[220px]" : "h-[200px]"} border transition-all duration-300 ${isHovered ? "border-white/15" : "border-white/5"}`}
        style={{ boxShadow: isHovered ? glowShadow : "none" }}
        data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <img
          src={card.image}
          alt={card.label}
          className="absolute inset-0 w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

        {card.badge && (
          <div className="absolute top-3 right-3 z-20">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full text-white ${
              card.badge === "Live" ? "bg-gradient-to-r from-green-500 to-emerald-500" :
              card.badge === "New" ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
              card.badge === "Earn" ? "bg-gradient-to-r from-orange-500 to-rose-500" :
              "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}>
              {card.badge}
            </span>
          </div>
        )}

        {card.featured && (
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 backdrop-blur-sm">
              Featured
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
              {card.label}
            </h3>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all ml-auto shrink-0" />
          </div>
          <p className="text-xs text-white/50 line-clamp-2">{card.description}</p>
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
  const { user, isLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
        <div className="max-w-[1400px] mx-auto px-6 pt-20 pb-12 space-y-10">
          {[1,2,3].map(i => <SkeletonSection key={i} />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginGate onSuccess={() => queryClient.invalidateQueries({ queryKey: ["auth-user"] })} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] flex items-center justify-center">
        <Nav />
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-white/50">Command Center is available to platform administrators only.</p>
        </div>
      </div>
    );
  }

  const totalFeatures = categories.reduce((sum, cat) => sum + cat.cards.length, 0);

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
              Welcome, <span className="text-white/80 font-medium">{user.firstName || user.username}</span>
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

      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-16 space-y-12">
        {!loaded ? (
          [1,2,3,4].map(i => <SkeletonSection key={i} />)
        ) : (
          categories.map((category, catIndex) => (
            <motion.section
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              className="space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shrink-0`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{category.title}</h2>
                  <p className="text-sm text-white/40 max-w-2xl leading-relaxed">{category.description}</p>
                </div>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  dragFree: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
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