import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ExternalLink, Rocket, ClipboardList } from "lucide-react";

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  status: "complete" | "partial" | "planned";
  route?: string;
}

interface FeatureCategory {
  name: string;
  icon: string;
  color: string;
  features: FeatureItem[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Buddy AI Assistant",
    icon: "🤖",
    color: "cyan",
    features: [
      { id: "buddy-chat", name: "Buddy Chat Panel", description: "Conversational AI assistant for parts help", status: "complete", route: "/" },
      { id: "buddy-hero", name: "Buddy Hero Mascot", description: "Animated mascot in hero section with click interaction", status: "complete", route: "/" },
      { id: "buddy-hideseek", name: "Buddy Hide & Seek", description: "Random popup appearances with tips and comments", status: "complete", route: "/" },
      { id: "buddy-recommendations", name: "Smart Part Recommendations", description: "AI-powered part suggestions based on vehicle", status: "complete" },
      { id: "buddy-diy", name: "AI DIY Repair Guides", description: "Generated step-by-step repair instructions", status: "complete", route: "/guides" },
      { id: "buddy-definitions", name: "Part Definitions", description: "Explain what parts do and why you need them", status: "complete" },
      { id: "buddy-estimates", name: "Mechanic Estimates", description: "Labor cost and time estimates for repairs", status: "complete" },
    ]
  },
  {
    name: "Vehicle Management",
    icon: "🚗",
    color: "blue",
    features: [
      { id: "vin-decoder", name: "VIN Decoder (NHTSA)", description: "Decode VIN to get year/make/model/engine", status: "complete", route: "/garage" },
      { id: "vehicle-passport", name: "Vehicle Passport", description: "Complete vehicle profile with specs and history", status: "complete", route: "/garage" },
      { id: "fleet-garage", name: "My Garage Fleet", description: "Save and manage multiple vehicles", status: "complete", route: "/garage" },
      { id: "vin-scanner", name: "VIN Scanner Camera", description: "Scan VIN with phone camera", status: "partial", route: "/" },
      { id: "recall-alerts", name: "NHTSA Recall Alerts", description: "Automatic recall notifications for your vehicles", status: "partial" },
      { id: "maintenance-reminders", name: "Maintenance Reminders", description: "Mileage-based service alerts", status: "planned" },
    ]
  },
  {
    name: "Parts Search",
    icon: "🔍",
    color: "green",
    features: [
      { id: "universal-search", name: "Universal Parts Search", description: "Search 50+ retailers simultaneously", status: "complete", route: "/" },
      { id: "vehicle-selectors", name: "Year/Make/Model Selectors", description: "Filter parts by vehicle fitment", status: "complete", route: "/" },
      { id: "vehicle-types", name: "16 Vehicle Type Support", description: "Cars, trucks, boats, ATVs, motorcycles, RC, drones, model aircraft, slot cars, & more", status: "complete", route: "/" },
      { id: "category-grid", name: "24+ Part Categories", description: "Organized part category navigation including hobby categories", status: "complete", route: "/" },
      { id: "affiliate-links", name: "Affiliate Search Links", description: "Direct links to retailer search results with tracking", status: "complete" },
      { id: "hobby-section", name: "Motorized Hobby Section", description: "RC cars, drones/FPV, model aircraft, slot cars with 10+ hobby retailers", status: "complete", route: "/" },
      { id: "photo-search", name: "Photo Part Search", description: "Snap photo, AI identifies the part", status: "partial", route: "/" },
      { id: "voice-search", name: "Voice Search (Hey Buddy)", description: "Voice-activated part search", status: "partial", route: "/" },
    ]
  },
  {
    name: "Weather & Radar",
    icon: "🌤️",
    color: "amber",
    features: [
      { id: "weather-widget", name: "Floating Weather Button", description: "Current conditions with temperature badge", status: "complete", route: "/" },
      { id: "weather-daynight", name: "Day/Night Icons", description: "Dynamic icons based on time of day", status: "complete", route: "/" },
      { id: "weather-glow", name: "Weather-Based Glow Effects", description: "Button glow changes with conditions", status: "complete", route: "/" },
      { id: "weather-radar", name: "Live Weather Radar", description: "RainViewer animated precipitation radar", status: "complete", route: "/" },
      { id: "storm-alerts", name: "NOAA Storm Alerts", description: "Severe weather warnings for your area", status: "complete", route: "/" },
      { id: "zip-persistence", name: "ZIP Code Memory", description: "Remembers your location preferences", status: "complete" },
    ]
  },
  {
    name: "User & Subscriptions",
    icon: "👤",
    color: "purple",
    features: [
      { id: "pin-auth", name: "Secure PIN Authentication", description: "Name + Email + strong 8+ character PIN", status: "complete" },
      { id: "pro-subscription", name: "Pro Subscription (Stripe)", description: "Monthly subscription with Stripe billing", status: "complete", route: "/pro" },
      { id: "founders-circle", name: "Founders Circle Tier", description: "Premium Pro tier with extra features", status: "complete", route: "/pro" },
      { id: "referral-program", name: "Member Referral Program", description: "Earn points for referring friends", status: "complete", route: "/invite" },
      { id: "referral-points", name: "Points Redemption", description: "Redeem points for Pro subscription time", status: "complete", route: "/invite" },
      { id: "user-dashboard", name: "User Dashboard", description: "Profile, vehicles, and account management", status: "complete", route: "/dashboard" },
    ]
  },
  {
    name: "Genesis Hallmarks & NFT",
    icon: "🏆",
    color: "orange",
    features: [
      { id: "genesis-hallmark", name: "Genesis Hallmark NFT", description: "Early adopter recognition badges", status: "complete", route: "/hallmark" },
      { id: "solana-verify", name: "Solana Blockchain Verification", description: "On-chain transaction proof via Helius", status: "complete", route: "/hallmark" },
      { id: "hallmark-display", name: "Hallmark Badge Display", description: "Show hallmark status on profile", status: "complete" },
      { id: "blockchain-explorer", name: "Solscan Transaction Links", description: "View transactions on block explorer", status: "complete" },
    ]
  },
  {
    name: "Shop Portal (Mechanics)",
    icon: "🔧",
    color: "red",
    features: [
      { id: "shop-portal", name: "Mechanics Garage Portal", description: "Shop management dashboard", status: "partial", route: "/shop" },
      { id: "shop-auth", name: "Shop Authentication", description: "Separate login for shop accounts", status: "partial" },
      { id: "parts-ordering", name: "Commercial Parts Ordering", description: "B2B pricing and ordering", status: "planned" },
      { id: "shop-customers", name: "Customer Management", description: "Track customers and their vehicles", status: "planned" },
    ]
  },
  {
    name: "Insurance & Services",
    icon: "🛡️",
    color: "teal",
    features: [
      { id: "insurance-compare", name: "Insurance Comparison", description: "Compare auto insurance quotes", status: "partial", route: "/insurance" },
      { id: "insurance-quotes", name: "Quote Request Flow", description: "Get personalized insurance quotes", status: "planned" },
      { id: "extended-warranty", name: "Extended Warranty Referrals", description: "Partner warranty offerings", status: "planned" },
    ]
  },
  {
    name: "UI/UX & Platform",
    icon: "✨",
    color: "pink",
    features: [
      { id: "deep-space-theme", name: "Deep Space Theme", description: "Dark theme with electric cyan accents", status: "complete" },
      { id: "responsive-design", name: "Responsive Mobile/Desktop", description: "Optimized for all screen sizes", status: "complete" },
      { id: "pwa-support", name: "PWA Install Prompt", description: "Add to home screen support", status: "complete" },
      { id: "accordion-nav", name: "Accordion Navigation", description: "Collapsible vehicle/category selectors", status: "complete", route: "/" },
      { id: "market-ticker", name: "Market Feed Ticker", description: "Live parts deals scrolling banner", status: "complete", route: "/" },
      { id: "framer-animations", name: "Framer Motion Animations", description: "Smooth transitions and effects", status: "complete" },
      { id: "onboarding-modal", name: "Onboarding Modal", description: "First-time user welcome flow", status: "complete" },
    ]
  },
  {
    name: "Legal & Compliance",
    icon: "📜",
    color: "indigo",
    features: [
      { id: "terms-of-service", name: "Terms of Service", description: "Legal terms and conditions", status: "complete", route: "/terms" },
      { id: "privacy-policy", name: "Privacy Policy", description: "Data handling and privacy", status: "complete", route: "/privacy" },
      { id: "affiliate-disclosure", name: "Affiliate Disclosure", description: "FTC-compliant disclosure", status: "complete" },
    ]
  },
];

const PUBLISH_LOG = [
  { 
    version: "1.0.0", 
    date: "2024-11-15", 
    time: "14:30 CST", 
    notes: "Initial launch - Core parts search, vehicle garage, Buddy AI chat" 
  },
  { 
    version: "1.1.0", 
    date: "2024-11-20", 
    time: "16:45 CST", 
    notes: "Added Genesis Hallmark NFT system with Solana blockchain verification" 
  },
  { 
    version: "1.2.0", 
    date: "2024-11-25", 
    time: "11:20 CST", 
    notes: "Member referral program, Pro subscription tiers, Founders Circle" 
  },
  { 
    version: "1.3.0", 
    date: "2024-11-28", 
    time: "09:15 CST", 
    notes: "Weather radar with RainViewer tiles, NOAA storm alerts, ZIP persistence" 
  },
  { 
    version: "1.4.0", 
    date: "2024-12-01", 
    time: "10:30 CST", 
    notes: "Nighttime weather icons (7 variants), day/night detection, desktop accordion navigation, guaranteed Buddy first-visit greeting" 
  },
];

export function FeatureInventory() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(FEATURE_CATEGORIES.map(c => c.name));
  const [checkedFeatures, setCheckedFeatures] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('garagebot_feature_checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const toggleFeature = (id: string) => {
    setCheckedFeatures(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('garagebot_feature_checklist', JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  };

  const totalFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.length, 0);
  const completedFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.filter(f => f.status === "complete").length, 0);
  const partialFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.filter(f => f.status === "partial").length, 0);

  const colorMap: Record<string, string> = {
    purple: "from-purple-600 to-purple-800 border-purple-500",
    blue: "from-blue-600 to-blue-800 border-blue-500",
    green: "from-green-600 to-green-800 border-green-500",
    red: "from-red-600 to-red-800 border-red-500",
    amber: "from-amber-600 to-amber-800 border-amber-500",
    cyan: "from-cyan-600 to-cyan-800 border-cyan-500",
    pink: "from-pink-600 to-pink-800 border-pink-500",
    teal: "from-teal-600 to-teal-800 border-teal-500",
    orange: "from-orange-600 to-orange-800 border-orange-500",
    emerald: "from-emerald-600 to-emerald-800 border-emerald-500",
    indigo: "from-indigo-600 to-indigo-800 border-indigo-500",
    violet: "from-violet-600 to-violet-800 border-violet-500",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-500">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-white">{totalFeatures}</div>
            <div className="text-emerald-200 text-xs">Total Features</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-500">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-white">{completedFeatures}</div>
            <div className="text-green-200 text-xs">Built & Ready</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-500">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-white">{partialFeatures}</div>
            <div className="text-yellow-200 text-xs">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-white">{checkedFeatures.length}</div>
            <div className="text-blue-200 text-xs">Verified ✓</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-500">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-white">{PUBLISH_LOG.length}</div>
            <div className="text-purple-200 text-xs">Publishes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 flex items-center gap-2 text-base">
            <Rocket className="h-5 w-5 text-cyan-400" />
            Publish History Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...PUBLISH_LOG].reverse().map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="text-center min-w-[80px]">
                  <div className="text-cyan-400 font-mono text-sm font-bold">{log.version}</div>
                  <div className="text-slate-500 text-[10px]">{log.date}</div>
                  <div className="text-slate-500 text-[10px]">{log.time}</div>
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">{log.notes}</p>
                </div>
                {idx === 0 && <Badge className="bg-green-600 text-white text-[10px] shrink-0">LATEST</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ClipboardList className="h-4 w-4" />
        <span>Click features to mark as personally verified. Progress saves locally.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURE_CATEGORIES.map((category) => (
          <Card key={category.name} className={`bg-gradient-to-br ${colorMap[category.color]} border overflow-hidden h-fit`}>
            <CardHeader className="py-2 px-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleCategory(category.name)}>
              <CardTitle className="text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                  <Badge variant="outline" className="text-white/80 border-white/30 text-[9px] ml-1">
                    {category.features.filter(f => checkedFeatures.includes(f.id)).length}/{category.features.length}
                  </Badge>
                </div>
                {expandedCategories.includes(category.name) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </CardTitle>
            </CardHeader>
            {expandedCategories.includes(category.name) && (
              <CardContent className="pt-0 px-2 pb-2">
                <div className="space-y-1">
                  {category.features.map((feature) => (
                    <div 
                      key={feature.id} 
                      className={`flex items-start gap-1.5 p-1.5 rounded transition-all cursor-pointer ${checkedFeatures.includes(feature.id) ? 'bg-green-900/40 border border-green-500/50' : 'bg-black/20 hover:bg-black/30'}`} 
                      onClick={() => toggleFeature(feature.id)}
                      data-testid={`feature-${feature.id}`}
                    >
                      <div className="mt-0.5">
                        {checkedFeatures.includes(feature.id) ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Circle className="h-3 w-3 text-white/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-xs font-medium ${checkedFeatures.includes(feature.id) ? 'text-green-200' : 'text-white'}`}>{feature.name}</span>
                          {feature.status === "complete" && <Badge className="bg-green-600/80 text-[8px] px-1 py-0">BUILT</Badge>}
                          {feature.status === "partial" && <Badge className="bg-yellow-600/80 text-[8px] px-1 py-0">WIP</Badge>}
                          {feature.status === "planned" && <Badge className="bg-blue-600/80 text-[8px] px-1 py-0">PLAN</Badge>}
                        </div>
                      </div>
                      {feature.route && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-5 w-5 p-0 text-white/60 hover:text-white hover:bg-white/10 shrink-0" 
                          onClick={(e) => { e.stopPropagation(); window.location.href = feature.route!; }}
                          data-testid={`link-${feature.id}`}
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-slate-400 border-slate-600 hover:bg-slate-800" 
          onClick={() => { 
            setCheckedFeatures([]); 
            try {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('garagebot_feature_checklist');
              }
            } catch {}
          }}
          data-testid="button-reset-checklist"
        >
          Reset Checklist
        </Button>
      </div>
    </div>
  );
}
