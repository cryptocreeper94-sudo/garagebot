import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon, Globe, ExternalLink,
  ScanLine, Camera, Mic, Wrench, Car, Sparkles, MessageCircle, Bot, TrendingUp, Terminal,
  BookOpen, PlayCircle, CheckCircle2, Images, Shield, Users, Zap, Star, Gift, Crown
} from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import FloatingWeatherButton from "@/components/FloatingWeatherButton";
import VinScanner from "@/components/VinScanner";
import PhotoSearch from "@/components/PhotoSearch";
import VoiceSearch from "@/components/VoiceSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";
import buddyMascot from "@assets/mascot_transparent/robot_mascot_waving_hello.png";
import MarketTicker from "@/components/MarketTicker";
import footerWave from "@assets/darkwave_footer_transparent.png";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [showPhotoSearch, setShowPhotoSearch] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    const params = new URLSearchParams();
    params.set('q', searchQuery.trim());
    if (selectedYear) params.set('year', selectedYear);
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    
    setTimeout(() => setLocation(`/results?${params.toString()}`), 600);
  };

  const handleWebNavigate = () => {
    if (!webUrl.trim()) return;
    
    let url = webUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWebKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWebNavigate();
    }
  };

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-black overflow-x-hidden relative">
      {/* Fixed GB Watermark Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
          <span className="text-[40vw] font-tech font-black tracking-tighter select-none text-primary">
            GB
          </span>
        </div>
      </div>
      
      <Nav />
      <MarketTicker />
      
      {/* Main Content */}
      <div className="pt-20 min-h-screen pb-8">
        
        {/* Floating Weather Button - visible on all screens */}
        <FloatingWeatherButton />
        
        {/* DESKTOP PUZZLE LAYOUT - Only visible on lg+ screens */}
        <div className="hidden lg:block w-full px-4 xl:px-8 2xl:px-16">
          {/* Row 1: Hero + Search (2-column layout) */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            {/* Hero Block - spans 7 columns */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-7 row-span-2"
            >
              <div className="h-full glass-premium rounded-xl p-6 relative overflow-hidden shimmer">
                {/* Sparkle decorations */}
                <div className="sparkle-container">
                  <div className="sparkle" style={{ top: '10%', left: '10%' }} />
                  <div className="sparkle" style={{ top: '15%', right: '15%', animationDelay: '0.5s' }} />
                  <div className="sparkle" style={{ bottom: '20%', left: '20%', animationDelay: '1s' }} />
                </div>
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-wider mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--color-primary)]" />
                  SYSTEM ONLINE // 40+ RETAILERS
                </div>
                
                {/* Logo + Title + Buddy */}
                <div className="flex items-center gap-3 relative">
                  <img 
                    src={gbEmblem} 
                    alt="GarageBot" 
                    className="w-16 h-16 xl:w-20 xl:h-20 drop-shadow-[0_0_30px_rgba(6,182,212,0.7)] hover:drop-shadow-[0_0_50px_rgba(6,182,212,0.9)] transition-all duration-500 hover:scale-110 float"
                    data-testid="img-garagebot-logo"
                  />
                  <div className="relative">
                    <h1 className="text-2xl xl:text-3xl font-tech font-bold uppercase tracking-wide">
                      <span className="text-primary drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">G</span>
                      <span className="text-foreground">arage</span>
                      <span className="text-primary drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">B</span>
                      <span className="text-foreground">ot</span>
                      <span className="text-primary/60">.io</span>
                    </h1>
                    <p className="text-sm text-muted-foreground/80 mt-1">
                      Right Part. First Time. <span className="text-primary">Every Engine.</span>
                    </p>
                  </div>
                  {/* Buddy leaning against title */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, rotate: -5 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="absolute -right-2 xl:right-0 -top-2"
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()}
                  >
                    <img 
                      src={buddyMascot} 
                      alt="Buddy" 
                      className="w-16 h-16 xl:w-20 xl:h-20 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all duration-300"
                      style={{ transform: 'rotate(-8deg) translateY(-5px)' }}
                      data-testid="img-buddy-hero"
                    />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-tech text-primary/80 whitespace-nowrap">
                      Click me!
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats Row */}
                <div className="flex gap-2 mt-4">
                  <Link href="/results">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all group icon-bounce">
                      <Database className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-medium">40+ Retailers</span>
                    </div>
                  </Link>
                  <Link href="/diy-guides">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 cursor-pointer hover:border-secondary/50 hover:bg-secondary/10 transition-all group icon-bounce">
                      <Cpu className="w-3.5 h-3.5 text-secondary" />
                      <span className="text-[10px] font-medium">AI-Powered</span>
                    </div>
                  </Link>
                  <Link href="/hallmark">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/40 to-primary/10 border border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-all group icon-bounce">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-medium text-purple-300">Blockchain</span>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Search Block - spans 5 columns */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-5"
            >
              <Card className="glass-premium border-0 p-4 h-full card-holo rounded-xl">
                <Tabs defaultValue="standard" className="w-full h-full flex flex-col">
                  <TabsList className="w-full grid grid-cols-2 bg-black/40 h-9 p-1 rounded-lg mb-3">
                    <TabsTrigger value="standard" className="font-mono text-[10px] uppercase rounded-md data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Parts Search</TabsTrigger>
                    <TabsTrigger value="web3" className="font-mono text-[10px] uppercase rounded-md data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Web Portal
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="flex-1 space-y-2 mt-0">
                    <form onSubmit={handleSearch} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="h-9 bg-black/20 border-white/10 font-mono text-[10px] focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-year"><SelectValue placeholder="Year" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 35 }, (_, i) => 2025 - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedMake} onValueChange={setSelectedMake}>
                          <SelectTrigger className="h-9 bg-black/20 border-white/10 font-mono text-[10px] focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-make"><SelectValue placeholder="Make" /></SelectTrigger>
                          <SelectContent>
                            {["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"].map(make => (
                              <SelectItem key={make} value={make.toLowerCase()}>{make}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="h-9 bg-black/20 border-white/10 font-mono text-[10px] focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-model"><SelectValue placeholder="Model" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="coupe">Coupe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          className="h-10 bg-black/20 border-white/10 font-tech text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 hover:bg-black/30 transition-colors" 
                          placeholder="SEARCH PARTS..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-part-search"
                        />
                        <Button 
                          type="submit"
                          className="h-10 w-10 shrink-0 btn-cyber rounded-lg" 
                          disabled={isSearching || !searchQuery.trim()}
                          data-testid="button-search"
                        >
                          {isSearching ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="web3" className="flex-1 space-y-2 mt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <Globe className="w-3 h-3 text-secondary" />
                        <span>DIRECT WEB NAVIGATION</span>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          className="h-9 bg-black/20 border-white/10 font-mono text-xs pl-3 focus:border-secondary/50 hover:bg-black/30 transition-colors" 
                          placeholder="Enter URL..."
                          value={webUrl}
                          onChange={(e) => setWebUrl(e.target.value)}
                          onKeyPress={handleWebKeyPress}
                          data-testid="input-web-url"
                        />
                        <Button 
                          className="h-9 px-3 shrink-0 bg-secondary text-black hover:bg-secondary/90 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                          onClick={handleWebNavigate}
                          data-testid="button-navigate"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 border border-dashed border-secondary/30 rounded-lg bg-secondary/5 text-center">
                      <Button size="sm" variant="outline" className="font-tech uppercase text-[10px] border-secondary text-secondary hover:bg-secondary hover:text-black h-7" data-testid="button-connect-wallet">
                        <Hexagon className="w-3 h-3 mr-1" />
                        Connect Wallet
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
            
            {/* Quick Tools - spans 5 columns (under search) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-5"
            >
              <Card className="glass-premium border-primary/20 p-3 rounded-xl h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="font-tech text-[10px] uppercase text-primary">Quick Tools</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Dialog open={showVinScanner} onOpenChange={setShowVinScanner}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 border-primary/20 hover:bg-primary/10 hover:border-primary/40 btn-glow icon-bounce" data-testid="button-vin-scanner">
                        <ScanLine className="w-5 h-5 text-primary" />
                        <span className="text-[9px] font-tech uppercase">VIN</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg"><VinScanner /></DialogContent>
                  </Dialog>

                  <Dialog open={showPhotoSearch} onOpenChange={setShowPhotoSearch}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 glow-secondary icon-bounce" data-testid="button-photo-search">
                        <Camera className="w-5 h-5 text-purple-400" />
                        <span className="text-[9px] font-tech uppercase">Photo</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg"><PhotoSearch /></DialogContent>
                  </Dialog>

                  <Dialog open={showVoiceSearch} onOpenChange={setShowVoiceSearch}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40 icon-bounce" data-testid="button-voice-search">
                        <Mic className="w-5 h-5 text-green-400" />
                        <span className="text-[9px] font-tech uppercase">Voice</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg"><VoiceSearch /></DialogContent>
                  </Dialog>

                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/40 icon-bounce" onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()} data-testid="button-buddy-chat">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <span className="text-[9px] font-tech uppercase">Buddy</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
          
          {/* Row 2: Vehicle Types + Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-premium rounded-xl p-4 mb-3"
          >
            <VehicleTypeSelector />
            <div className="mt-3">
              <CategoryGrid />
            </div>
          </motion.div>
          
          {/* Row 3: DIY Guides + Quick Links (2-column) */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            {/* DIY Guides Card - spans 7 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-7"
            >
              <Link href="/diy-guides" data-testid="link-diy-guides">
                <div className="relative group cursor-pointer h-full" data-testid="card-diy-guides-hero">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-green-400 to-primary rounded-xl opacity-40 group-hover:opacity-80 blur transition-all duration-500 animate-pulse" />
                  <div className="relative glass-premium rounded-xl p-5 h-full shimmer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-pulse">
                        <BookOpen className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-tech font-bold text-foreground uppercase tracking-wide">DIY Repair Guides</h3>
                        <p className="text-xs text-primary font-medium">Better Than Video Tutorials</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Step-by-step slideshows for YOUR exact vehicle. No more pausing YouTube!
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                      {["Go At Your Pace", "Vehicle-Specific", "Plain English", "Parts Links"].map((feat) => (
                        <div key={feat} className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="btn-cyber font-tech uppercase text-xs gap-2" data-testid="button-explore-guides">
                      <Images className="w-4 h-4" />
                      Explore Guides
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Right Column - spans 5 columns with all quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="col-span-5 space-y-3"
            >
              {/* Go Pro Card */}
              <Link href="/pro">
                <Card className="rainbow-border rounded-xl p-4 cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <h2 className="font-tech text-xs uppercase text-gradient">Founders Circle</h2>
                    <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-mono">$4.99/mo</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Lock in forever pricing. Advanced guides, priority support, exclusive features.
                  </p>
                  <Button size="sm" className="w-full btn-cyber h-7 text-[10px] font-tech uppercase">
                    <Star className="w-3 h-3 mr-1" />
                    Join Founders
                  </Button>
                </Card>
              </Link>
              
              {/* Quick Links Row */}
              <div className="grid grid-cols-3 gap-2">
                <Link href="/garage">
                  <Card className="glass-premium p-3 rounded-xl cursor-pointer group hover:border-green-500/50 transition-all icon-bounce h-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Car className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <span className="text-xs font-tech uppercase text-foreground group-hover:text-green-400 transition-colors">My Garage</span>
                        <p className="text-[9px] text-muted-foreground">Manage fleet</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/hallmark">
                  <Card className="glass-premium p-3 rounded-xl cursor-pointer group hover:border-purple-500/50 transition-all icon-bounce h-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-xs font-tech uppercase text-foreground group-hover:text-purple-400 transition-colors">Hallmark</span>
                        <p className="text-[9px] text-muted-foreground">NFT verify</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/invite">
                  <Card className="glass-premium p-3 rounded-xl cursor-pointer group hover:border-primary/50 transition-all icon-bounce h-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs font-tech uppercase text-foreground group-hover:text-primary transition-colors">Invite</span>
                        <p className="text-[9px] text-muted-foreground">Earn Pro</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
              
              {/* Mission Compact */}
              <Card className="glass-premium border-white/10 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-3.5 h-3.5 text-primary" />
                  <h2 className="font-tech text-[10px] uppercase text-primary">Every Vehicle With An Engine</h2>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["Cars", "Trucks", "Motorcycles", "ATVs", "Boats", "RVs", "Generators"].map((type) => (
                    <span key={type} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-mono border border-primary/20">
                      {type}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
          
          {/* Row 4: Featured Carousel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-3"
          >
            <FeaturedCarousel />
          </motion.div>
          
          {/* Row 5: Trusted Retailers Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-premium rounded-xl p-4 overflow-hidden"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2 text-center">Trusted Retail Partners</p>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10" />
              <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
                {["AutoZone", "O'Reilly", "RockAuto", "Advance Auto", "NAPA", "Summit Racing", "JEGS", "Amazon", "eBay Motors", "CarParts.com", "AutoZone", "O'Reilly", "RockAuto", "Advance Auto", "NAPA", "Summit Racing"].map((name, i) => (
                  <span key={i} className="mx-6 text-sm text-muted-foreground/60 font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* MOBILE LAYOUT - Only visible on smaller screens */}
        <div className="lg:hidden w-full px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              SYSTEM ONLINE // 40+ RETAILERS
            </div>
            
            {/* Logo + Buddy side by side */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src={gbEmblem} 
                alt="GarageBot" 
                className="w-20 h-20 drop-shadow-[0_0_50px_rgba(6,182,212,0.7)]"
                data-testid="img-garagebot-logo-mobile"
              />
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()}
                className="cursor-pointer"
              >
                <img 
                  src={buddyMascot} 
                  alt="Buddy" 
                  className="w-16 h-16 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform"
                  style={{ transform: 'rotate(-8deg)' }}
                  data-testid="img-buddy-hero-mobile"
                />
              </motion.div>
            </div>
            
            <h1 className="text-2xl font-tech font-bold uppercase tracking-wide">
              <span className="text-primary">G</span>arage<span className="text-primary">B</span>ot<span className="text-primary/60">.io</span>
            </h1>
            <p className="text-sm text-muted-foreground/80 mt-2">
              Right Part. First Time. <span className="text-primary">Every Engine.</span>
            </p>
            
            {/* Stats Badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Link href="/results">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-xs">40+ Retailers</span>
                </div>
              </Link>
              <Link href="/diy-guides">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10">
                  <Cpu className="w-4 h-4 text-secondary" />
                  <span className="text-xs">AI-Powered</span>
                </div>
              </Link>
              <Link href="/hallmark">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-900/40 to-primary/20 border border-purple-500/30">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-300">Blockchain</span>
                </div>
              </Link>
            </div>
          </motion.div>
          
          {/* DIY Guides CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
            <Link href="/diy-guides">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-green-400 to-primary rounded-xl opacity-50 group-hover:opacity-100 blur transition-all animate-pulse" />
                <div className="relative bg-black/80 rounded-xl p-4 border border-primary/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-base font-tech font-bold uppercase">DIY Repair Guides</h3>
                      <p className="text-xs text-primary">Better Than Video Tutorials</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Step-by-step slideshows for YOUR exact vehicle.</p>
                  <Button className="w-full btn-cyber text-xs font-tech uppercase">
                    <Images className="w-4 h-4 mr-2" />
                    Explore Guides
                  </Button>
                </div>
              </div>
            </Link>
          </motion.div>
          
          {/* Vehicle Types + Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4 bg-black/20 -mx-4 px-4 py-4 border-y border-white/5">
            <VehicleTypeSelector />
            <div className="mt-3">
              <CategoryGrid />
            </div>
          </motion.div>
          
          {/* Search Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
            <Card className="glass-panel border-0 p-4">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-10 bg-black/20 border-white/5 font-mono text-[10px]" data-testid="select-year-mobile"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 35 }, (_, i) => 2025 - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMake} onValueChange={setSelectedMake}>
                    <SelectTrigger className="h-10 bg-black/20 border-white/5 font-mono text-[10px]" data-testid="select-make-mobile"><SelectValue placeholder="Make" /></SelectTrigger>
                    <SelectContent>
                      {["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"].map(make => (
                        <SelectItem key={make} value={make.toLowerCase()}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-10 bg-black/20 border-white/5 font-mono text-[10px]" data-testid="select-model-mobile"><SelectValue placeholder="Model" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input className="h-12 bg-black/20 border-white/5 font-tech text-sm" placeholder="SEARCH PARTS..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-part-search-mobile" />
                  <Button type="submit" className="h-12 w-12 shrink-0 btn-cyber" disabled={isSearching || !searchQuery.trim()} data-testid="button-search-mobile">
                    {isSearching ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
          
          {/* Quick Tools */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-4">
            <Card className="bg-card/50 border-primary/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="font-tech text-[10px] uppercase text-primary">Quick Tools</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Dialog open={showVinScanner} onOpenChange={setShowVinScanner}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 border-primary/20 hover:bg-primary/10" data-testid="button-vin-scanner-mobile">
                      <ScanLine className="w-4 h-4 text-primary" />
                      <span className="text-[8px] font-tech uppercase">VIN</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent><VinScanner /></DialogContent>
                </Dialog>
                <Dialog open={showPhotoSearch} onOpenChange={setShowPhotoSearch}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 border-purple-500/20 hover:bg-purple-500/10" data-testid="button-photo-search-mobile">
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span className="text-[8px] font-tech uppercase">Photo</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent><PhotoSearch /></DialogContent>
                </Dialog>
                <Dialog open={showVoiceSearch} onOpenChange={setShowVoiceSearch}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 border-green-500/20 hover:bg-green-500/10" data-testid="button-voice-search-mobile">
                      <Mic className="w-4 h-4 text-green-400" />
                      <span className="text-[8px] font-tech uppercase">Voice</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent><VoiceSearch /></DialogContent>
                </Dialog>
                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 border-cyan-500/20 hover:bg-cyan-500/10" onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()} data-testid="button-buddy-chat-mobile">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="text-[8px] font-tech uppercase">Buddy</span>
                </Button>
              </div>
            </Card>
          </motion.div>
          
          {/* Buddy AI Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-4">
            <Card className="bg-gradient-to-br from-primary/10 via-card/80 to-secondary/10 border-primary/30 p-4 neon-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-tech text-sm uppercase text-primary flex items-center gap-1">
                    Meet Buddy
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">AI Parts Expert</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Tell Buddy what you need - he'll find the right part across 40+ retailers.
              </p>
              <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()} className="w-full btn-cyber font-tech uppercase text-xs" data-testid="button-chat-buddy-mobile">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Buddy
              </Button>
            </Card>
          </motion.div>
          
          {/* Featured Carousel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-4">
            <FeaturedCarousel />
          </motion.div>
          
          {/* Trusted Retailers */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="overflow-hidden mb-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2 text-center">Trusted Partners</p>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
              <div className="flex animate-[scroll_20s_linear_infinite] whitespace-nowrap">
                {["AutoZone", "O'Reilly", "RockAuto", "Advance Auto", "NAPA", "Summit", "JEGS", "Amazon", "eBay", "AutoZone", "O'Reilly", "RockAuto"].map((name, i) => (
                  <span key={i} className="mx-4 text-xs text-muted-foreground/60">{name}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-primary/20 bg-[#0a0f1e] relative overflow-hidden min-h-[250px]">
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 flex h-full w-[400%]" style={{ animation: 'waveScroll 120s linear infinite' }}>
            <img src={footerWave} alt="" className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80" />
            <img src={footerWave} alt="" className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80" style={{ transform: 'scaleX(-1)' }} />
            <img src={footerWave} alt="" className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80" />
            <img src={footerWave} alt="" className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80" style={{ transform: 'scaleX(-1)' }} />
          </div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10 py-10 space-y-4">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link href="/mechanics-garage">
              <Button className="font-tech uppercase gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-900/30 btn-glow" data-testid="footer-button-mechanics">
                <Wrench className="w-4 h-4" />
                Mechanics Garage
              </Button>
            </Link>
            <Link href="/investors">
              <Button className="font-tech uppercase gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/30 btn-glow" data-testid="footer-button-investors">
                <TrendingUp className="w-4 h-4" />
                Investors
              </Button>
            </Link>
            <Link href="/dev">
              <Button variant="outline" className="font-tech uppercase gap-2 border-primary/50 text-primary hover:bg-primary/10 shadow-lg" data-testid="footer-button-dev">
                <Terminal className="w-4 h-4" />
                Dev Portal
              </Button>
            </Link>
          </div>
          
          <p className="font-mono text-sm text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            © 2025 DarkWave Studios LLC. All Rights Reserved.
          </p>
          <a href="https://darkwavestudios.io" target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-sm text-primary hover:text-primary/80 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" data-testid="link-darkwave-studios">
            Powered by DarkWave Studios LLC
          </a>
        </div>
        
        <style>{`
          @keyframes waveScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </footer>
    </div>
  );
}
