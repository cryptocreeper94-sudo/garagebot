import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AdSenseHorizontal } from "@/components/AdSense";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComingSoonCard } from "@/components/ComingSoonBadge";
import { AffiliatesDashboard } from "@/components/AffiliatesDashboard";
import { 
  Activity, 
  Server, 
  DollarSign, 
  Users, 
  Database, 
  Zap, 
  Shield, 
  Cpu,
  Terminal,
  AlertCircle,
  Wrench,
  Star,
  FileText,
  Package,
  Link2,
  Blocks,
  Car,
  ExternalLink,
  Tag,
  Compass,
  Heart,
  FolderOpen,
  Coffee,
  MessageCircle,
  Gamepad2,
  Truck,
  Fuel,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const DATA_TRAFFIC = [
  { time: "00:00", requests: 1200 },
  { time: "04:00", requests: 900 },
  { time: "08:00", requests: 2400 },
  { time: "12:00", requests: 3800 },
  { time: "16:00", requests: 4200 },
  { time: "20:00", requests: 3100 },
  { time: "23:59", requests: 1800 },
];

const SYSTEM_HEALTH = [
  { name: "AutoZone API", status: "Operational", latency: "45ms", color: "text-green-400" },
  { name: "RockAuto API", status: "Operational", latency: "120ms", color: "text-green-400" },
  { name: "Stripe Payments", status: "Standby", latency: "-", color: "text-yellow-400" },
  { name: "Coinbase Commerce", status: "Standby", latency: "-", color: "text-yellow-400" },
  { name: "Geolocation Service", status: "Operational", latency: "20ms", color: "text-green-400" },
];

interface BlockchainAsset {
  id: string;
  entityType: 'hallmark' | 'vehicle' | 'release';
  entityId: string;
  userId: string;
  dataHash: string;
  txSignature: string | null;
  status: string;
  network: string;
  createdAt: string;
  submittedAt: string | null;
  confirmedAt: string | null;
  solscanUrl?: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: myBlockchainAssets = [], isLoading: loadingAssets } = useQuery<BlockchainAsset[]>({
    queryKey: ['myBlockchainVerifications'],
    queryFn: async () => {
      const res = await fetch('/api/blockchain/verifications');
      if (!res.ok) throw new Error('Failed to fetch blockchain assets');
      return res.json();
    },
    enabled: !!user,
  });

  const { data: myHallmarks = [] } = useQuery<any[]>({
    queryKey: ['myHallmarks'],
    queryFn: async () => {
      const res = await fetch('/api/hallmarks/me');
      if (!res.ok) throw new Error('Failed to fetch hallmarks');
      return res.json();
    },
    enabled: !!user,
  });

  const { data: myVehicles = [] } = useQuery<any[]>({
    queryKey: ['myVehicles'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Bento Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
          <div className="md:col-span-8">
            <Card className="glass-ultra rounded-xl shimmer p-4 h-full">
              <h1 className="text-2xl font-tech font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Mission Control
              </h1>
              <p className="text-muted-foreground font-mono text-xs mt-1 flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                SYSTEM STATUS: ONLINE // VERSION 0.1.0-ALPHA
              </p>
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card className="glass-card-accent rounded-xl p-4 h-full flex items-center justify-center gap-3">
              <Badge variant="outline" className="font-mono border-green-500/30 text-green-400 bg-green-500/10 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                LIVE
              </Badge>
              <Button size="sm" variant="outline" className="font-tech uppercase text-xs border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
                <Cpu className="w-3 h-3 mr-1" />
                Logs
              </Button>
            </Card>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="stat-card-premium card-3d p-6 relative overflow-hidden group transition-all" style={{ '--stat-color': 'hsl(190 90% 50%)' } as React.CSSProperties}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
              <Users className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase mb-2">
                <Users className="w-4 h-4" /> Active Users
              </div>
              <div className="text-4xl font-tech font-bold text-white">1,248</div>
              <div className="text-xs text-green-400 mt-1 flex items-center">
                <Activity className="w-3 h-3 mr-1" /> +12% vs last hour
              </div>
            </div>
          </Card>

          <Card className="stat-card-premium card-3d p-6 relative overflow-hidden group transition-all" style={{ '--stat-color': 'hsl(190 90% 60%)' } as React.CSSProperties}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
              <Zap className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase mb-2">
                <Zap className="w-4 h-4" /> API Requests
              </div>
              <div className="text-4xl font-tech font-bold text-white">45.2k</div>
              <div className="text-xs text-green-400 mt-1 flex items-center">
                <Activity className="w-3 h-3 mr-1" /> 99.9% Success Rate
              </div>
            </div>
          </Card>

          <Card className="stat-card-premium card-3d p-6 relative overflow-hidden group transition-all" style={{ '--stat-color': 'hsl(142 70% 45%)' } as React.CSSProperties}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
              <DollarSign className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase mb-2">
                <DollarSign className="w-4 h-4" /> Est. Revenue
              </div>
              <div className="text-4xl font-tech font-bold text-white">$342.50</div>
              <div className="text-xs text-muted-foreground mt-1">
                Daily Projection
              </div>
            </div>
          </Card>

          <Card className="stat-card-premium card-3d p-6 relative overflow-hidden group transition-all" style={{ '--stat-color': 'hsl(250 60% 60%)' } as React.CSSProperties}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
              <Database className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase mb-2">
                <Shield className="w-4 h-4 text-secondary" /> Hallmarks Minted
              </div>
              <div className="text-4xl font-tech font-bold text-white">8,492</div>
              <div className="text-xs text-secondary mt-1 flex items-center">
                 On-Chain Audit Trail Active
              </div>
            </div>
          </Card>
        </div>

        <div className="divider-gradient" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Chart */}
          <div className="lg:col-span-2">
            <Card className="glass-ultra rounded-xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-tech font-bold text-xl uppercase flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Network Traffic
                </h3>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 cursor-pointer">1H</Badge>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 cursor-pointer">24H</Badge>
                  <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 cursor-pointer">7D</Badge>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DATA_TRAFFIC}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(190 90% 50%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(190 90% 50%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(255,255,255,0.5)" 
                      tick={{fontSize: 12, fontFamily: 'JetBrains Mono'}}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)" 
                      tick={{fontSize: 12, fontFamily: 'JetBrains Mono'}}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontFamily: 'Rajdhani' }}
                      labelStyle={{ color: '#aaa', fontFamily: 'JetBrains Mono' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="hsl(190 90% 50%)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRequests)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* System Health Panel */}
          <div className="lg:col-span-1">
            <Card className="glass-ultra rounded-xl p-6 h-full">
              <h3 className="font-tech font-bold text-xl uppercase flex items-center gap-2 mb-6">
                <Server className="w-5 h-5 text-primary" /> Integrations
              </h3>

              <div className="space-y-4">
                {SYSTEM_HEALTH.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 glass-card rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color === 'text-green-400' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-yellow-400'}`} />
                      <span className="font-bold font-tech text-sm tracking-wide group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-mono ${item.color}`}>{item.status}</span>
                      {item.latency !== "-" && (
                        <span className="text-[10px] text-muted-foreground font-mono">{item.latency}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-blue-400 font-bold text-sm flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" /> Security Status
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All systems normal. Production keys for Stripe & Coinbase are securely stored in environment variables.
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="divider-gradient" />

        {/* Parts Marketplace Section */}
        <div className="mt-12 mb-8">
          <Card className="card-3d relative overflow-hidden bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 border-cyan-500/30 p-8">
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Tag className="w-12 h-12 text-cyan-400" />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <h3 className="text-2xl font-tech font-bold uppercase">Parts Marketplace</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
                    LIVE
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  Buy and sell parts from fellow gearheads. Search by make, model, and year to find exactly what you need, 
                  or list your spare parts to reach thousands of enthusiasts.
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <a href="/marketplace" data-testid="link-browse-marketplace">
                    <Button className="font-tech uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <Tag className="w-4 h-4 mr-2" />
                      Browse Marketplace
                    </Button>
                  </a>
                  <a href="/pro" data-testid="link-sell-parts-upgrade">
                    <Button variant="ghost" className="font-mono text-xs text-muted-foreground hover:text-cyan-400">
                      Sell Parts (Basic+) →
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="divider-gradient" />

        {/* Feature Spotlight Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-tech font-bold uppercase text-white">Discover Features</h2>
                <p className="text-xs text-muted-foreground font-mono">30+ tools at your fingertips</p>
              </div>
            </div>
            <a href="/explore">
              <Button variant="outline" size="sm" className="font-tech uppercase text-xs border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary gap-1 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all" data-testid="button-explore-all">
                See All <ChevronRight className="w-3 h-3" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "My Garage", desc: "Vehicles & VIN decode", icon: Car, href: "/garage", color: "text-purple-400", glow: "rgba(168,85,247,0.3)" },
              { name: "Wishlists", desc: "Save & share parts", icon: Heart, href: "/wishlists", color: "text-pink-400", glow: "rgba(244,114,182,0.3)" },
              { name: "Build Projects", desc: "Track your builds", icon: FolderOpen, href: "/projects", color: "text-amber-400", glow: "rgba(251,191,36,0.3)" },
              { name: "DIY Guides", desc: "Step-by-step repairs", icon: Wrench, href: "/diy-guides", color: "text-emerald-400", glow: "rgba(52,211,153,0.3)" },
              { name: "Break Room", desc: "News, tools & more", icon: Coffee, href: "/break-room", color: "text-amber-400", glow: "rgba(251,191,36,0.3)" },
              { name: "Signal Chat", desc: "Community chat", icon: MessageCircle, href: "/chat", color: "text-blue-400", glow: "rgba(96,165,250,0.3)" },
              { name: "Fuel Tracker", desc: "Track MPG & costs", icon: Fuel, href: "/garage", color: "text-orange-400", glow: "rgba(251,146,60,0.3)" },
              { name: "Maintenance", desc: "Service schedules", icon: Calendar, href: "/garage", color: "text-cyan-400", glow: "rgba(6,182,212,0.3)" },
              { name: "Shade Tree", desc: "DIY community", icon: Star, href: "/shade-tree", color: "text-yellow-400", glow: "rgba(250,204,21,0.3)" },
              { name: "CDL Directory", desc: "Trucking & CDL", icon: Truck, href: "/cdl-directory", color: "text-blue-400", glow: "rgba(96,165,250,0.3)" },
              { name: "Rental Cars", desc: "Compare 1,000+ cos", icon: Car, href: "/rentals", color: "text-cyan-400", glow: "rgba(6,182,212,0.3)" },
              { name: "Insurance", desc: "Compare rates", icon: Shield, href: "/insurance", color: "text-green-400", glow: "rgba(74,222,128,0.3)" },
            ].map((feature) => (
              <a key={feature.name} href={feature.href} data-testid={`spotlight-${feature.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <Card
                  className="glass-card card-3d p-3 cursor-pointer group h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${feature.glow}, transparent)` }} />
                  <feature.icon className={`w-6 h-6 ${feature.color} mb-2 group-hover:scale-110 transition-transform duration-300`} />
                  <p className="font-tech text-xs font-bold uppercase tracking-wide group-hover:text-primary transition-colors duration-300">{feature.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{feature.desc}</p>
                </Card>
              </a>
            ))}
          </div>
        </div>

        <div className="divider-gradient" />

        {/* Coming Soon Features Section */}
        <div className="mt-12">
          <div className="section-header-premium">
            <h2 className="text-2xl font-tech font-bold uppercase tracking-wide">
              Upcoming <span className="text-yellow-400">Features</span>
            </h2>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono">
              ROADMAP
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ComingSoonCard
              title="Order Tracking"
              description="Track all your orders from every retailer in one unified dashboard."
              icon={<Package className="w-6 h-6 text-yellow-400" />}
              features={[
                "Real-time shipping updates",
                "Multi-vendor order history",
                "Delivery notifications"
              ]}
              expectedDate="Q1 2026"
            />

            <ComingSoonCard
              title="Service Scheduling"
              description="Book mechanics and service appointments directly through GarageBot."
              icon={<Wrench className="w-6 h-6 text-yellow-400" />}
              features={[
                "Local shop finder by zip",
                "Online appointment booking",
                "Service history tracking"
              ]}
              expectedDate="Q2 2026"
            />

            <ComingSoonCard
              title="Ratings & Reviews"
              description="Community-driven ratings for shops, vendors, and service providers."
              icon={<Star className="w-6 h-6 text-yellow-400" />}
              features={[
                "Verified purchase reviews",
                "Shop response system",
                "AI-powered dispute resolution"
              ]}
              expectedDate="Q2 2026"
            />

            <ComingSoonCard
              title="Insurance Hub"
              description="Compare auto, boat, RV, and commercial vehicle insurance rates."
              icon={<FileText className="w-6 h-6 text-yellow-400" />}
              features={[
                "Multi-carrier comparison",
                "Quote aggregation",
                "Policy management"
              ]}
              expectedDate="Q3 2026"
            />
          </div>
        </div>

        <div className="divider-gradient" />

        {/* Genesis Hallmark Section */}
        <div className="mt-12 mb-8">
          <Card className="card-3d relative overflow-hidden bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 border-secondary/30 p-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
                <Shield className="w-12 h-12 text-secondary" />
              </div>
              
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <h3 className="text-2xl font-tech font-bold uppercase">Genesis Hallmark</h3>
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-[10px] font-mono">
                    BLOCKCHAIN
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  Your on-chain vehicle identity. The Genesis Hallmark NFT system creates an immutable record of your vehicle's complete history - 
                  from parts purchases to service records. Asset #0 is the protocol. Be among the first to mint your unique vehicle identifier.
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Button variant="outline" className="font-tech uppercase border-secondary/50 text-secondary hover:bg-secondary/10" disabled>
                    <Shield className="w-4 h-4 mr-2" />
                    Mint Coming Soon
                  </Button>
                  <Button variant="ghost" className="font-mono text-xs text-muted-foreground hover:text-secondary">
                    Learn More →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="divider-gradient" />

        {/* My Blockchain Assets Section */}
        {user && (
          <div className="mt-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Blocks className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-tech font-bold uppercase text-white">My Blockchain Assets</h2>
                <p className="text-xs text-muted-foreground font-mono">On-chain verified records // Solana mainnet</p>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {myBlockchainAssets.length} verified
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Stats */}
              <Card className="stat-card-premium card-3d p-4" style={{ '--stat-color': 'hsl(190 90% 50%)' } as React.CSSProperties}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary">{myBlockchainAssets.filter(a => a.entityType === 'hallmark').length}</p>
                    <p className="text-xs text-muted-foreground">Hallmarks</p>
                  </div>
                </div>
              </Card>
              <Card className="stat-card-premium card-3d p-4" style={{ '--stat-color': 'hsl(190 90% 60%)' } as React.CSSProperties}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-cyan-400">{myBlockchainAssets.filter(a => a.entityType === 'vehicle').length}</p>
                    <p className="text-xs text-muted-foreground">Vehicle Passports</p>
                  </div>
                </div>
              </Card>
              <Card className="stat-card-premium card-3d p-4" style={{ '--stat-color': 'hsl(142 70% 45%)' } as React.CSSProperties}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-400">{myBlockchainAssets.filter(a => a.status === 'confirmed' || a.status === 'submitted').length}</p>
                    <p className="text-xs text-muted-foreground">On-Chain</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Assets List */}
            {loadingAssets ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="glass-card rounded-xl border border-white/5 p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
                        <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
                      </div>
                      <div className="h-6 w-20 rounded-full bg-green-500/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : myBlockchainAssets.length === 0 ? (
              <Card className="bg-card/30 border-white/10 p-6">
                <div className="text-center py-8">
                  <Blocks className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-2">No blockchain-verified assets yet</p>
                  <p className="text-xs text-muted-foreground/70">Mint a Genesis Hallmark or verify a vehicle to get started</p>
                </div>
              </Card>
            ) : (
              <Card className="bg-card/30 border-white/10 p-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {myBlockchainAssets.map((asset) => {
                    const hallmark = asset.entityType === 'hallmark' 
                      ? myHallmarks.find(h => h.id === asset.entityId) 
                      : null;
                    const vehicle = asset.entityType === 'vehicle' 
                      ? myVehicles.find(v => v.id === asset.entityId) 
                      : null;
                    
                    return (
                      <div key={asset.id} className="bg-background/50 border border-primary/10 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              asset.entityType === 'hallmark' ? 'bg-primary/20' : 'bg-cyan-500/20'
                            }`}>
                              {asset.entityType === 'hallmark' ? (
                                <Shield className="w-5 h-5 text-primary" />
                              ) : (
                                <Car className="w-5 h-5 text-cyan-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-tech text-sm uppercase text-primary">
                                  {asset.entityType === 'hallmark' ? 'Genesis Hallmark' : 'Vehicle Passport'}
                                </span>
                                <Badge className={`text-xs ${
                                  asset.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  asset.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}>
                                  {asset.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {hallmark ? (
                                  <>#{hallmark.assetNumber}: {hallmark.displayName || 'Unnamed Asset'}</>
                                ) : vehicle ? (
                                  <>{vehicle.year} {vehicle.make} {vehicle.model}</>
                                ) : (
                                  asset.entityId
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(asset.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric'
                              })}
                            </p>
                            {asset.txSignature && !asset.txSignature.startsWith('HASH_') && !asset.txSignature.startsWith('DEMO_') && (
                              <a 
                                href={`https://solscan.io/tx/${asset.txSignature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 justify-end text-xs mt-1"
                              >
                                Solscan <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Jason's Dev Task List */}
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-tech font-bold uppercase text-white">Dev Task List</h2>
              <p className="text-xs text-muted-foreground font-mono">Jason's things to do // PIN: 0424</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Tasks */}
            <Card className="glass-ultra rounded-xl p-6">
              <div className="space-y-4">
                {/* High Priority */}
                <div>
                  <h4 className="font-mono text-xs text-red-400 uppercase mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> High Priority
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-red-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Apply for Affiliate Networks</p>
                        <p className="text-xs text-muted-foreground mt-1">CJ Affiliate, ShareASale, AvantLink, Impact Radius</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-red-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Amazon Associates Account</p>
                        <p className="text-xs text-muted-foreground mt-1">4.5% commission on all automotive purchases</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-red-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Verify garagebot.io Domain</p>
                        <p className="text-xs text-muted-foreground mt-1">TXT record added - check DNS propagation</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medium Priority */}
                <div>
                  <h4 className="font-mono text-xs text-yellow-400 uppercase mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Medium Priority
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-yellow-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Direct Partner Outreach</p>
                        <p className="text-xs text-muted-foreground mt-1">Email RockAuto, O'Reilly, NAPA for partnerships</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-yellow-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Stripe Pro Subscription</p>
                        <p className="text-xs text-muted-foreground mt-1">Create $2.99/month Pro plan product</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-yellow-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Insurify Partnership</p>
                        <p className="text-xs text-muted-foreground mt-1">Insurance comparison API integration</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Future Features */}
                <div>
                  <h4 className="font-mono text-xs text-blue-400 uppercase mb-3 flex items-center gap-2">
                    <Star className="w-3 h-3" /> Future Features
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-blue-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Homepage Slideshow</p>
                        <p className="text-xs text-muted-foreground mt-1">Content data prepared - needs implementation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                      <div className="w-4 h-4 rounded border-2 border-blue-400/50 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">PartsTech API Integration</p>
                        <p className="text-xs text-muted-foreground mt-1">Real-time inventory from multiple suppliers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Column - Partner Outreach Info */}
            <Card className="glass-ultra rounded-xl p-6">
              <h4 className="font-mono text-xs text-primary uppercase mb-4 flex items-center gap-2">
                <Link2 className="w-3 h-3" /> Partner Outreach Contacts
              </h4>
              
              <div className="space-y-3 text-xs">
                {/* Affiliate Networks */}
                <div className="p-3 rounded bg-green-500/5 border border-green-500/20">
                  <p className="font-medium text-green-400 mb-2">AFFILIATE NETWORKS (Apply First)</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• CJ Affiliate: cj.com/join - Advance Auto, Summit, JEGS</p>
                    <p>• ShareASale: shareasale.com - Partzilla, Jack's, Classic Ind.</p>
                    <p>• AvantLink: avantlink.com - Rocky Mtn, Dennis Kirk, RevZilla</p>
                    <p>• Impact: impact.com - AutoZone, Camping World</p>
                    <p>• eBay Partner Network: ebaypartnernetwork.com</p>
                  </div>
                </div>

                {/* Direct Outreach Needed */}
                <div className="p-3 rounded bg-orange-500/5 border border-orange-500/20">
                  <p className="font-medium text-orange-400 mb-2">DIRECT OUTREACH (Email Template)</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• RockAuto: info@rockauto.com</p>
                    <p>• O'Reilly: partnerships@oreillyauto.com</p>
                    <p>• NAPA: customerservice@napaonline.com</p>
                    <p>• VMC Chinese: sales@vmcchineseparts.com</p>
                    <p>• Car-Part.com: info@car-part.com</p>
                  </div>
                </div>

                {/* Email Template */}
                <div className="p-3 rounded bg-primary/5 border border-primary/20">
                  <p className="font-medium text-primary mb-2">OUTREACH EMAIL TEMPLATE</p>
                  <div className="text-muted-foreground bg-black/30 p-2 rounded text-[10px] font-mono">
                    Subject: Partnership Inquiry - GarageBot Parts Aggregator<br/><br/>
                    Hi,<br/><br/>
                    I'm the founder of GarageBot (garagebot.io), an auto parts search aggregator covering all vehicle types.<br/><br/>
                    We'd love to feature [Company] on our platform at no cost. We're interested in:<br/>
                    • Affiliate partnership (commission per sale)<br/>
                    • API access for real-time inventory (if available)<br/><br/>
                    We send targeted traffic from vehicle owners searching for specific parts.<br/><br/>
                    Best regards,<br/>
                    Jason - DarkWave Studios, LLC
                  </div>
                </div>

                {/* API Contacts */}
                <div className="p-3 rounded bg-purple-500/5 border border-purple-500/20">
                  <p className="font-medium text-purple-400 mb-2">API INTEGRATION CONTACTS</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• PartsTech: partstech.com/partners - Multi-supplier API</p>
                    <p>• WHI Nexpart: nexpart.com - Catalog data feeds</p>
                    <p>• ACES/PIES: aftermarket.org - Industry standard data</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <AdSenseHorizontal className="my-6" />

        {/* Affiliate Tracking Section */}
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-tech font-bold uppercase text-white">Affiliate Partners</h2>
              <p className="text-xs text-muted-foreground font-mono">Track clicks, conversions, and earnings</p>
            </div>
          </div>
          <AffiliatesDashboard />
        </div>
      </div>
      <Footer />
    </div>
  );
}
