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

interface LaunchCard {
  label: string;
  description: string;
  href: string;
  icon: any;
  image: string;
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
      { label: "Analytics Dashboard", description: "Real-time traffic, sessions, devices & geo data", href: "/dev?tab=analytics", icon: BarChart3, image: imgAnalyticsDashboard, badge: "Live", featured: true },
      { label: "System Dashboard", description: "API health, server status & traffic charts", href: "/dashboard", icon: Activity, image: imgSystemHealth },
      { label: "Affiliate Analytics", description: "Click tracking & commission performance reports", href: "/dev?tab=affiliates", icon: TrendingUp, image: imgAffiliateAnalytics },
      { label: "SEO Manager", description: "Page meta tags, Open Graph & crawl optimization", href: "/dev?tab=features", icon: Search, image: imgSeoManager },
    ]
  },
  {
    title: "Marketing & Growth",
    icon: Megaphone,
    gradient: "from-purple-500 to-pink-500",
    description: "Grow your audience and drive engagement. Manage social media auto-posting, schedule content, run Meta ad campaigns, and publish blog content.",
    cards: [
      { label: "Marketing Hub", description: "Meta auto-posting, 60+ posts, 3-hour rotation", href: "/marketing", icon: Megaphone, image: imgMarketingHub, featured: true },
      { label: "Blog Manager", description: "AI-generated posts, publish & feature controls", href: "/blog", icon: FileText, image: imgBlogManager },
      { label: "Newsletter", description: "Subscriber management & email campaigns", href: "/dev?tab=tasks", icon: Mail, image: imgNewsletter, badge: "Roadmap" },
      { label: "Meta Ads Campaigns", description: "Facebook/Instagram ad targeting & management", href: "/marketing", icon: Globe, image: imgMetaAds },
      { label: "Sponsored Products", description: "Featured placements & promoted listings", href: "/dev?tab=tasks", icon: Star, image: imgSponsoredProducts, badge: "Roadmap" },
    ]
  },
  {
    title: "Revenue & Monetization",
    icon: DollarSign,
    gradient: "from-green-500 to-emerald-500",
    description: "Track and optimize every revenue stream. Manage affiliate networks, process payments, handle Pro subscriptions, and mint Genesis Hallmark NFTs.",
    cards: [
      { label: "Affiliate Networks", description: "Amazon, CJ, eBay, ShareASale — 50+ retailers", href: "/dev?tab=affiliates", icon: Link2, image: imgAffiliateNetworks, badge: "Earn", featured: true },
      { label: "Inbound Affiliate Program", description: "GB-XXXXXX referral codes, commissions & payouts", href: "/affiliates", icon: Users, image: imgInboundAffiliate, badge: "New" },
      { label: "Pro Memberships", description: "Founders Circle subscriptions & ad-free tiers", href: "/pro", icon: Crown, image: imgProMembership },
      { label: "Stripe Payments", description: "Payment processing, checkout & subscriptions", href: "/checkout", icon: CreditCard, image: imgStripePayments },
      { label: "Genesis Hallmarks", description: "NFT minting & Solana blockchain verification", href: "/hallmark", icon: Award, image: imgGenesisHallmarks },
      { label: "Referral Program", description: "Points system, invite rewards & Pro bonuses", href: "/invite", icon: Send, image: imgReferralProgram },
    ]
  },
  {
    title: "Mechanics Garage Suite",
    icon: Wrench,
    gradient: "from-orange-500 to-red-500",
    description: "The complete shop management platform. Register shops, manage repair orders, handle inventory, run inspections, and connect business tools.",
    cards: [
      { label: "Shop Portal", description: "Shop registration, settings & management", href: "/shop-portal", icon: Building2, image: imgShopPortal, featured: true },
      { label: "Mechanics Garage", description: "Repair orders, estimates, appointments & POS", href: "/mechanics-garage", icon: Wrench, image: imgMechanicsGarage },
      { label: "Shop Inventory", description: "Parts inventory management & tracking", href: "/mechanics-garage", icon: Package, image: imgShopInventory },
      { label: "Digital Inspections", description: "Vehicle inspection reports & customer sharing", href: "/mechanics-garage", icon: ClipboardList, image: imgDigitalInspections },
      { label: "ORBIT Staffing", description: "Payroll, timesheets, W2/1099 processing", href: "/mechanics-garage", icon: Briefcase, image: imgOrbitStaffing },
      { label: "Business Integrations", description: "QuickBooks, ADP, Gusto, PartsTech & more", href: "/mechanics-garage", icon: Layers, image: imgBusinessIntegrations },
      { label: "Partner API", description: "B2B API keys, scopes & rate limiting", href: "/dev?tab=tasks", icon: Terminal, image: imgPartnerApi },
    ]
  },
  {
    title: "Community & Engagement",
    icon: MessageCircle,
    gradient: "from-blue-500 to-indigo-500",
    description: "Build and nurture your community. Manage Signal Chat, curate Break Room content, support the Shade Tree DIY community, and run trivia games.",
    cards: [
      { label: "Signal Chat", description: "Community messaging, channels, DMs & threads", href: "/chat", icon: MessageCircle, image: imgSignalChat, featured: true },
      { label: "Break Room", description: "News, tools, scanners, speed traps & fuel prices", href: "/break-room", icon: Coffee, image: imgBreakRoom },
      { label: "Shade Tree Mechanics", description: "DIY community hub & repair guides", href: "/shade-tree", icon: Wrench, image: imgShadeTree },
      { label: "Trivia Quiz", description: "Automotive knowledge game", href: "/trivia", icon: Gamepad2, image: imgTriviaQuiz },
      { label: "Giveaways", description: "Prize drawings & winner management", href: "/dev?tab=tasks", icon: Sparkles, image: imgGiveaways, badge: "Roadmap" },
    ]
  },
  {
    title: "Vehicle & Parts",
    icon: Car,
    gradient: "from-red-500 to-orange-500",
    description: "The core product experience. Search parts across 68+ retailers, manage vehicle fleets, follow DIY guides, browse the marketplace, and track wishlists.",
    cards: [
      { label: "Parts Search", description: "68+ retailers, 16 categories, vehicle-aware", href: "/results", icon: Search, image: imgPartsSearch, featured: true },
      { label: "My Garage", description: "Fleet management, VIN decoding & service records", href: "/garage", icon: Car, image: imgMyGarage },
      { label: "DIY Guides", description: "AI repair guides with YouTube integration", href: "/diy-guides", icon: BookOpen, image: imgDiyGuides },
      { label: "Parts Marketplace", description: "Peer-to-peer listings with messaging", href: "/marketplace", icon: ShoppingCart, image: imgPartsMarketplace },
      { label: "Wishlists", description: "Save, organize & share parts lists", href: "/wishlists", icon: Heart, image: imgWishlists },
      { label: "Build Projects", description: "Track custom builds with parts & progress", href: "/projects", icon: GitBranch, image: imgBuildProjects },
      { label: "Price Alerts", description: "Track price changes & get notifications", href: "/garage", icon: Bell, image: imgPriceAlerts },
    ]
  },
  {
    title: "Services & Directories",
    icon: Compass,
    gradient: "from-teal-500 to-cyan-500",
    description: "Extended platform services. Compare insurance quotes, browse rental cars, explore the CDL directory, manage vendors, and monitor weather radar.",
    cards: [
      { label: "Insurance Comparison", description: "Multi-provider quote comparison tool", href: "/insurance", icon: Shield, image: imgInsurance },
      { label: "Rental Cars", description: "Carla, Expedia & Hotels.com comparison", href: "/rentals", icon: Car, image: imgRentalCars },
      { label: "CDL Directory", description: "Trucking companies & CDL programs", href: "/cdl-directory", icon: Truck, image: imgCdlDirectory },
      { label: "Vendor Management", description: "Retailer applications & partnerships", href: "/vendor-signup", icon: Building2, image: imgVendorManagement },
      { label: "Weather Radar", description: "Leaflet map, RainViewer & NOAA alerts", href: "/break-room", icon: Map, image: imgWeatherRadar },
      { label: "Support Center", description: "Help desk & user support", href: "/support", icon: Mail, image: imgSupportCenter },
    ]
  },
  {
    title: "Platform & Development",
    icon: Settings,
    gradient: "from-slate-500 to-zinc-500",
    description: "Under-the-hood tools for platform management. Access the dev portal, manage releases, handle user accounts, and review investor metrics.",
    cards: [
      { label: "Dev Portal", description: "Full admin panel — roadmap, tasks, configs", href: "/dev", icon: Terminal, image: imgDevPortal, featured: true },
      { label: "Release Manager", description: "Version tracking & changelogs", href: "/dev?tab=releases", icon: Rocket, image: imgReleaseManager },
      { label: "Blockchain Verifier", description: "Solana on-chain verification", href: "/dev?tab=blockchain", icon: Blocks, image: imgBlockchainVerifier },
      { label: "User Management", description: "Accounts, roles, waitlist & sessions", href: "/dev?tab=features", icon: Users, image: imgUserManagement },
      { label: "Explore Page", description: "Feature discovery & platform showcase", href: "/explore", icon: Compass, image: imgExplorePage },
      { label: "Investor Portal", description: "Business metrics & investment deck", href: "/investors", icon: PieChart, image: imgInvestorPortal },
    ]
  },
];

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[320px] h-[220px] rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse">
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
      <div className="flex gap-6 overflow-hidden">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

function CardComponent({ card, index, catIndex }: { card: LaunchCard; index: number; catIndex: number }) {
  const [, navigate] = useLocation();

  return (
    <CarouselItem className="pl-6 basis-[320px] sm:basis-[340px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: catIndex * 0.06 + index * 0.04 }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(card.href)}
        className="relative cursor-pointer rounded-2xl overflow-hidden group h-[220px] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 hover:shadow-xl hover:shadow-black/30"
        data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <img
          src={card.image}
          alt={card.label}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        {card.badge && (
          <div className="absolute top-4 right-4 z-20">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white shadow-lg ${
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
            <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border border-yellow-500/40 text-yellow-400 bg-yellow-500/15 backdrop-blur-sm shadow-lg">
              Featured
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <card.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                {card.label}
              </h3>
            </div>
            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-cyan-400/70 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
          <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed pl-12">{card.description}</p>
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

      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-16 space-y-16">
        {!loaded ? (
          [1,2,3,4].map(i => <SkeletonSection key={i} />)
        ) : (
          categories.map((category, catIndex) => (
            <motion.section
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIndex * 0.08 }}
              className="space-y-6"
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
                <CarouselContent className="-ml-6">
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
