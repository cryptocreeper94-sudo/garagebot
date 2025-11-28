import Nav from "@/components/Nav";
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
  Link2
} from "lucide-react";
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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <Nav />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-tech font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              Mission Control
            </h1>
            <p className="text-muted-foreground font-mono text-sm mt-1 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              SYSTEM STATUS: ONLINE // VERSION 0.1.0-ALPHA
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="font-mono border-green-500/30 text-green-400 bg-green-500/10 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              LIVE
            </Badge>
            <Button size="sm" variant="outline" className="font-tech uppercase border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary">
              <Cpu className="w-4 h-4 mr-2" />
              System Logs
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 border-primary/20 backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
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

          <Card className="bg-card/50 border-primary/20 backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
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

          <Card className="bg-card/50 border-primary/20 backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
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

          <Card className="bg-card/50 border-primary/20 backdrop-blur-sm p-6 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-card/30 border-white/10 backdrop-blur-md p-6 h-full">
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
                        <stop offset="5%" stopColor="hsl(25 95% 53%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(25 95% 53%)" stopOpacity={0}/>
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
                      stroke="hsl(25 95% 53%)" 
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
            <Card className="bg-card/30 border-white/10 backdrop-blur-md p-6 h-full">
              <h3 className="font-tech font-bold text-xl uppercase flex items-center gap-2 mb-6">
                <Server className="w-5 h-5 text-primary" /> Integrations
              </h3>

              <div className="space-y-4">
                {SYSTEM_HEALTH.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
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
                  All systems normal. Mock integration keys active. Production keys for Stripe & Coinbase are securely stored in environment variables.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Coming Soon Features Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
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

        {/* Genesis Hallmark Section */}
        <div className="mt-12 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 border-secondary/30 p-8">
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
          
          <Card className="bg-card/30 border-white/10 backdrop-blur-md p-6">
            <div className="space-y-4">
              {/* High Priority */}
              <div>
                <h4 className="font-mono text-xs text-red-400 uppercase mb-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> High Priority
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded bg-red-500/5 border border-red-500/20">
                    <div className="w-4 h-4 rounded border-2 border-red-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Apply for Retailer API Access</p>
                      <p className="text-xs text-muted-foreground mt-1">AutoZone, O'Reilly, Advance Auto partnerships for real-time inventory</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-red-500/5 border border-red-500/20">
                    <div className="w-4 h-4 rounded border-2 border-red-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Set Up Affiliate Programs</p>
                      <p className="text-xs text-muted-foreground mt-1">Amazon Associates, CJ Affiliate, Impact Radius accounts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-red-500/5 border border-red-500/20">
                    <div className="w-4 h-4 rounded border-2 border-red-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Connect garagebot.io Domain</p>
                      <p className="text-xs text-muted-foreground mt-1">DNS settings in Namecheap → Replit custom domain</p>
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
                  <div className="flex items-start gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
                    <div className="w-4 h-4 rounded border-2 border-yellow-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Insurify Partnership</p>
                      <p className="text-xs text-muted-foreground mt-1">Insurance comparison integration for all vehicle types</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
                    <div className="w-4 h-4 rounded border-2 border-yellow-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Stripe Pro Subscription Product</p>
                      <p className="text-xs text-muted-foreground mt-1">Create $2.99/month Pro plan in Stripe dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
                    <div className="w-4 h-4 rounded border-2 border-yellow-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Coinbase Commerce Integration</p>
                      <p className="text-xs text-muted-foreground mt-1">Crypto payment option for Genesis Hallmark NFTs</p>
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
                  <div className="flex items-start gap-3 p-3 rounded bg-blue-500/5 border border-blue-500/20">
                    <div className="w-4 h-4 rounded border-2 border-blue-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Homepage Slideshow</p>
                      <p className="text-xs text-muted-foreground mt-1">Implement product slideshow with prepared content data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-blue-500/5 border border-blue-500/20">
                    <div className="w-4 h-4 rounded border-2 border-blue-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Mobile App (React Native)</p>
                      <p className="text-xs text-muted-foreground mt-1">Barcode/VIN scanner, voice search with Buddy AI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-blue-500/5 border border-blue-500/20">
                    <div className="w-4 h-4 rounded border-2 border-blue-400/50 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Shop Portal Launch</p>
                      <p className="text-xs text-muted-foreground mt-1">Mechanic shop accounts, bulk ordering, wholesale pricing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

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
    </div>
  );
}
