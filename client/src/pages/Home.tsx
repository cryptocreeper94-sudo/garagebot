import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon, Globe, ExternalLink,
  Wrench, Car, Sparkles, MessageCircle, Bot, TrendingUp, Terminal,
  BookOpen, PlayCircle, CheckCircle2, Images, Shield, Users, Zap, Star, Gift, Crown, X,
  Bike, Ship, Truck, Tractor, Plane, Cog, PlugZap, Snowflake, Trophy, Gamepad2,
  Radio, Navigation, Gauge, Flame, ChevronLeft, Sailboat, Construction
} from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
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
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import TrustLayerReviews from "@/components/TrustLayerReviews";
import NativeProductRecs from "@/components/NativeProductRecs";
import DailyFunFact from "@/components/DailyFunFact";
import VehicleShowcase from "@/components/VehicleShowcase";
import AchievementBadges from "@/components/AchievementBadges";

import useSoundEffects from "@/hooks/useSoundEffects";
import { Volume2, VolumeX } from "lucide-react";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const { soundEnabled, toggleSound, playSound } = useSoundEffects();
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
    
    playSound('search');
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
      
      {/* Main Content - adjusted for 45px header + 32px ticker = 77px, add buffer */}
      <div className="pt-[85px] lg:pt-[80px] min-h-screen pb-16">
        
        {/* DESKTOP BENTO LAYOUT - Only visible on lg+ screens */}
        <div className="hidden lg:block w-full px-2 xl:px-4 2xl:px-8">
          {/* Row 1: Hero + Search (2-column layout) */}
          <div className="grid grid-cols-12 gap-0 mb-0">
            {/* Hero Block - spans 7 columns */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-7 row-span-2"
            >
              <div className="h-full bento-glass rounded-lg p-4 relative overflow-hidden">
                {/* Sparkle decorations */}
                <div className="sparkle-container">
                  <div className="sparkle" style={{ top: '10%', left: '10%' }} />
                  <div className="sparkle" style={{ top: '15%', right: '15%', animationDelay: '0.5s' }} />
                  <div className="sparkle" style={{ bottom: '20%', left: '20%', animationDelay: '1s' }} />
                </div>
                
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-wider mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--color-primary)]" />
                  SYSTEM ONLINE // 50+ RETAILERS
                </div>
                
                {/* Full Welcome Title */}
                <div className="relative py-4">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-base xl:text-lg font-tech text-muted-foreground tracking-widest uppercase mb-2">
                      Welcome to
                    </p>
                    <div className="flex items-end relative">
                      
                      <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-tech font-black uppercase tracking-tight">
                        <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text">G</span>
                        <span className="text-foreground">arage</span>
                        <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text">B</span>
                        <span className="text-foreground">ot</span>
                        <span className="text-primary/70 text-3xl xl:text-4xl">.io</span>
                      </h1>
                    </div>
                    <p className="text-base xl:text-lg text-muted-foreground/80 mt-3">
                      Right Part. First Time. <span className="text-primary font-medium">Every Engine.</span>
                    </p>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex gap-2 mt-4">
                  <Link href="/results">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all group icon-bounce">
                      <Database className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-medium">50+ Retailers</span>
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
              <Card className="bento-glass border-0 p-3 h-full rounded-lg">
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
              <Card className="bento-glass bento-glow border-primary/20 p-2 rounded-lg h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="font-tech text-[10px] uppercase text-primary">Quick Tools</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Dialog open={showVinScanner} onOpenChange={setShowVinScanner}>
                    <DialogTrigger asChild>
                      <button className="relative h-[72px] rounded-lg overflow-hidden border border-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all group" data-testid="button-vin-scanner">
                        <img src="/generated_images/vin_scanner_tool.png" alt="VIN Scanner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-tech uppercase text-white drop-shadow-lg">VIN</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg"><VinScanner /></DialogContent>
                  </Dialog>

                  <Dialog open={showPhotoSearch} onOpenChange={setShowPhotoSearch}>
                    <DialogTrigger asChild>
                      <button className="relative h-[72px] rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all group" data-testid="button-photo-search">
                        <img src="/generated_images/photo_search_tool.png" alt="Photo Search" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-tech uppercase text-white drop-shadow-lg">Photo</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg"><PhotoSearch /></DialogContent>
                  </Dialog>

                  <Dialog open={showVoiceSearch} onOpenChange={setShowVoiceSearch}>
                    <DialogTrigger asChild>
                      <button className="relative h-[72px] rounded-lg overflow-hidden border border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all group" data-testid="button-voice-search">
                        <img src="/generated_images/voice_search_tool.png" alt="Voice Search" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-tech uppercase text-white drop-shadow-lg">Voice</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg"><VoiceSearch /></DialogContent>
                  </Dialog>

                  <button className="relative h-[72px] rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all group" onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()} data-testid="button-buddy-chat">
                    <img src="/generated_images/buddy_ai_assistant.png" alt="Buddy AI" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-tech uppercase text-white drop-shadow-lg">Buddy</span>
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
          
          {/* Row 2: Vehicle Types + Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bento-glass rounded-lg p-3"
          >
            <VehicleTypeSelector />
            <div className="mt-2">
              <CategoryGrid />
            </div>
          </motion.div>
          
          {/* Row 3: DIY Guides + Quick Links (2-column) */}
          <div className="grid grid-cols-12 gap-0 mb-0">
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
                  <div className="relative bento-glass rounded-lg p-4 h-full">
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
              className="col-span-5 space-y-1"
            >
              {/* Go Pro Card */}
              <Link href="/pro">
                <Card className="bento-glass bento-glow rounded-lg p-3 cursor-pointer group border-yellow-500/30">
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
              <div className="grid grid-cols-3 gap-0">
                <Link href="/garage">
                  <Card className="bento-glass p-2 rounded-lg cursor-pointer group hover:border-green-500/50 transition-all h-full">
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Car className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-tech uppercase text-foreground group-hover:text-green-400 transition-colors">Garage</span>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/hallmark">
                  <Card className="bento-glass p-2 rounded-lg cursor-pointer group hover:border-purple-500/50 transition-all h-full">
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-tech uppercase text-foreground group-hover:text-purple-400 transition-colors">Hallmark</span>
                      </div>
                    </div>
                  </Card>
                </Link>
                
                <Link href="/invite">
                  <Card className="bento-glass p-2 rounded-lg cursor-pointer group hover:border-primary/50 transition-all h-full">
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] font-tech uppercase text-foreground group-hover:text-primary transition-colors">Invite</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
              
              {/* Mission Compact */}
              <Card className="bento-glass border-white/10 p-2 rounded-lg">
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
            className=""
          >
            <FeaturedCarousel />
          </motion.div>
          
          {/* Row 5: Trusted Retailers Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bento-glass rounded-lg p-3 overflow-hidden"
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
        
        {/* MOBILE BENTO LAYOUT - Only visible on smaller screens */}
        <div className="lg:hidden w-full px-3 space-y-3">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-glass rounded-lg p-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-mono tracking-wider mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              SYSTEM ONLINE // 50+ RETAILERS
            </div>
            
            {/* Welcome Title */}
            <p className="text-base font-tech text-muted-foreground tracking-widest uppercase mb-3">
              Welcome to
            </p>
            <div className="relative inline-block mb-4">
              <h1 className="text-3xl sm:text-4xl font-tech font-black uppercase tracking-tight">
                <span className="text-primary drop-shadow-[0_0_25px_rgba(6,182,212,0.9)] neon-text">G</span>
                <span className="text-foreground">arage</span>
                <span className="text-primary drop-shadow-[0_0_25px_rgba(6,182,212,0.9)] neon-text">B</span>
                <span className="text-foreground">ot</span>
                <span className="text-primary/70 text-xl sm:text-2xl">.io</span>
              </h1>
            </div>
            <p className="text-base text-muted-foreground/80 mt-3">
              Right Part. First Time. <span className="text-primary font-medium">Every Engine.</span>
            </p>
            
            {/* Stats Badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Link href="/results">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-xs">50+ Retailers</span>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link href="/diy-guides">
              <div className="relative group h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-green-400 to-primary rounded-lg opacity-50 group-hover:opacity-100 blur transition-all animate-pulse" />
                <div className="relative bento-glass rounded-lg p-3 h-full">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bento-glass rounded-lg p-3">
            <VehicleTypeSelector />
            <div className="mt-3">
              <CategoryGrid />
            </div>
          </motion.div>
          
          {/* Search Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bento-glass border-0 p-3">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bento-glass bento-glow border-primary/20 p-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="font-tech text-[10px] uppercase text-primary">Quick Tools</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Dialog open={showVinScanner} onOpenChange={setShowVinScanner}>
                  <DialogTrigger asChild>
                    <button className="relative h-[60px] rounded-lg overflow-hidden border border-primary/20 hover:border-primary/50 transition-all group" data-testid="button-vin-scanner-mobile">
                      <img src="/generated_images/vin_scanner_tool.png" alt="VIN Scanner" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-tech uppercase text-white drop-shadow-lg">VIN</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent><VinScanner /></DialogContent>
                </Dialog>
                <Dialog open={showPhotoSearch} onOpenChange={setShowPhotoSearch}>
                  <DialogTrigger asChild>
                    <button className="relative h-[60px] rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all group" data-testid="button-photo-search-mobile">
                      <img src="/generated_images/photo_search_tool.png" alt="Photo Search" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-tech uppercase text-white drop-shadow-lg">Photo</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent><PhotoSearch /></DialogContent>
                </Dialog>
                <Dialog open={showVoiceSearch} onOpenChange={setShowVoiceSearch}>
                  <DialogTrigger asChild>
                    <button className="relative h-[60px] rounded-lg overflow-hidden border border-green-500/20 hover:border-green-500/50 transition-all group" data-testid="button-voice-search-mobile">
                      <img src="/generated_images/voice_search_tool.png" alt="Voice Search" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-tech uppercase text-white drop-shadow-lg">Voice</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent><VoiceSearch /></DialogContent>
                </Dialog>
                <button className="relative h-[60px] rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all group" onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()} data-testid="button-buddy-chat-mobile">
                  <img src="/generated_images/buddy_ai_assistant.png" alt="Buddy AI" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-tech uppercase text-white drop-shadow-lg">Buddy</span>
                </button>
              </div>
            </Card>
          </motion.div>
          
          {/* Buddy AI Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bento-glass bento-glow border-primary/30 p-3 h-full">
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
                Tell Buddy what you need - he'll find the right part across 50+ retailers.
              </p>
              <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()} className="w-full btn-cyber font-tech uppercase text-xs" data-testid="button-chat-buddy-mobile">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Buddy
              </Button>
            </Card>
          </motion.div>
          
          {/* Featured Carousel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <FeaturedCarousel />
          </motion.div>
          
          {/* Vendor Spotlight - Become a Vendor CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
            <Link href="/vendor-signup">
              <Card className="bento-glass p-4 border-amber-500/20 hover:border-amber-500/40 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-tech font-bold uppercase text-amber-400">Become a Vendor</h3>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">FREE</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Join 50+ retailers. Get featured, earn badges, compete for Vendor of the Month!
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </Card>
            </Link>
          </motion.div>
          
          {/* Trusted Retailers */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="bento-glass rounded-lg p-2 overflow-hidden">
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
          
          {/* Mechanics Garage Competitive Comparison */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link href="/mechanics-garage" data-testid="link-mechanics-garage-comparison">
              <Card className="bento-glass p-4 border-primary/20 hover:border-primary/40 transition-all cursor-pointer overflow-hidden relative" data-testid="card-mechanics-comparison">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-tech font-bold uppercase text-primary">Mechanics Garage</h3>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-primary/20 text-primary border border-primary/30 rounded">PRO</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Professional shop management that rivals AutoLeap, Tekmetric & Shopmonkey at a fraction of the cost.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Digital Vehicle Inspections</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>40+ Parts Vendors</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Integrated Payments</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Multi-Vehicle Types</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground line-through">$179/mo</span>
                      <span className="text-sm font-bold text-green-400">$49/mo</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-xs font-tech">
                      <span>Learn More</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Vehicle Showcase */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <VehicleShowcase />
        </div>
      </section>

      {/* Fun Engagement Row */}
      <section className="py-8 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DailyFunFact />
            <AchievementBadges />
          </div>
        </div>
      </section>

      {/* Recommended Gear */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <NativeProductRecs context="tools" layout="horizontal" title="Top Gear for Your Next Project" maxItems={4} />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">What People Are Saying</h2>
            <p className="text-zinc-400">Real reviews from real DIYers</p>
          </div>
          <TrustLayerReviews layout="carousel" maxReviews={6} />
        </div>
      </section>

      {/* Mission Statement & Founder Story */}
      <section className="py-16 px-4 relative overflow-hidden" data-testid="section-mission">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
              <Terminal className="w-3 h-3" />
              OUR MISSION
            </div>
            <h2 className="text-3xl md:text-4xl font-tech font-bold uppercase tracking-tight text-white mb-6" data-testid="text-mission-title">
              One Search. Every Store.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Every Engine.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              GarageBot exists to make finding parts for anything with a motor simple, fast, and even fun.
              Whether you're rebuilding a classic Mustang, maintaining your family SUV, rigging your bass boat,
              tuning an FPV racing drone, or keeping a fleet of semis on the road — you deserve one place
              that searches everywhere so you don't have to.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-14 relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden">
              <div className="flex animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]" style={{ width: "max-content" }}>
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-3 mr-3">
                    {[
                      { label: "Cars & Trucks", Icon: Car, color: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/10" },
                      { label: "Motorcycles", Icon: Bike, color: "text-orange-400", bg: "from-orange-500/20 to-orange-600/10" },
                      { label: "ATVs & UTVs", Icon: Gauge, color: "text-green-400", bg: "from-green-500/20 to-green-600/10" },
                      { label: "Boats & Marine", Icon: Sailboat, color: "text-blue-400", bg: "from-blue-500/20 to-blue-600/10" },
                      { label: "RVs & Trailers", Icon: Truck, color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" },
                      { label: "Classics & Hot Rods", Icon: Flame, color: "text-red-400", bg: "from-red-500/20 to-red-600/10" },
                      { label: "Exotics", Icon: Star, color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-600/10" },
                      { label: "Diesel & Commercial", Icon: Truck, color: "text-slate-400", bg: "from-slate-500/20 to-slate-600/10" },
                      { label: "Tractors & Farm", Icon: Tractor, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" },
                      { label: "Heavy Equipment", Icon: Construction, color: "text-orange-300", bg: "from-orange-400/20 to-orange-500/10" },
                      { label: "Small Engines", Icon: Cog, color: "text-zinc-400", bg: "from-zinc-500/20 to-zinc-600/10" },
                      { label: "Generators", Icon: PlugZap, color: "text-yellow-300", bg: "from-yellow-400/20 to-yellow-500/10" },
                      { label: "Powersports", Icon: Snowflake, color: "text-sky-400", bg: "from-sky-500/20 to-sky-600/10" },
                      { label: "Aviation", Icon: Plane, color: "text-indigo-400", bg: "from-indigo-500/20 to-indigo-600/10" },
                      { label: "RC & Hobby", Icon: Gamepad2, color: "text-pink-400", bg: "from-pink-500/20 to-pink-600/10" },
                      { label: "Drones & FPV", Icon: Radio, color: "text-violet-400", bg: "from-violet-500/20 to-violet-600/10" },
                      { label: "Model Aircraft", Icon: Navigation, color: "text-teal-400", bg: "from-teal-500/20 to-teal-600/10" },
                      { label: "Slot Cars", Icon: Trophy, color: "text-amber-300", bg: "from-amber-400/20 to-amber-500/10" },
                      { label: "Go-Karts", Icon: Gauge, color: "text-lime-400", bg: "from-lime-500/20 to-lime-600/10" },
                      { label: "Golf Carts", Icon: Car, color: "text-green-300", bg: "from-green-400/20 to-green-500/10" },
                    ].map((item) => (
                      <div
                        key={`${setIndex}-${item.label}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.06] flex-shrink-0 group cursor-default"
                      >
                        <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <item.Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{item.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-xl overflow-hidden" data-testid="card-founder-story">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-xl" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-white/5 rounded-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                      <Wrench className="w-8 h-8 text-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-tech font-bold uppercase text-white" data-testid="text-founder-name">
                        From the Founder
                      </h3>
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-primary/20 text-primary border border-primary/30 rounded">
                        Jason // DarkWave Studios
                      </span>
                    </div>
                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                      <p>
                        I've been searching for parts for over 35 years. From flipping through paper catalogs
                        and calling stores to waiting on hold, to doing the exact same runaround online — and
                        somehow it never got easier. The internet gave us a thousand places to buy parts, but
                        nobody ever bothered to put them all in one place. I got tired of opening fifteen tabs
                        just to compare prices on a set of brake pads. AutoZone, O'Reilly, Amazon, eBay, NAPA,
                        RockAuto, then some specialty site you found on a forum from 2014. Half the time the
                        part numbers don't match, the fitment info is wrong, and you end up ordering the wrong
                        thing anyway. After 35 years of that, I decided if nobody else was going to fix it,
                        I would.
                      </p>
                      <p>
                        And it's not just cars. The fragmentation across the entire motorized industry is
                        massive — and nobody talks about it. Motorcycles, ATVs, UTVs, boats, personal
                        watercraft, RVs, tractors, heavy equipment, generators, chainsaws, dirt bikes,
                        snowmobiles, go-karts, golf carts, aviation, diesel rigs — even RC cars, racing
                        drones, model aircraft, and slot cars. Every single one of these worlds has its own
                        scattered mess of retailers, part numbers, and fitment data with zero cohesion between
                        any of them. A guy rebuilding a Harley is having the exact same frustrating experience
                        as someone rigging a bass boat, maintaining a farm tractor, or building a competition
                        FPV drone. Everyone is doing the same thing: searching site after site, comparing
                        prices manually, and hoping they got the right part.
                      </p>
                      <p>
                        That's what GarageBot fixes. One search. Every store. Real prices side by side. Filtered
                        by your ZIP code so you can see what's available for local pickup or what ships fastest.
                        I built this for real people who work on real machines — not just cars, but{" "}
                        <span className="text-primary font-medium">everything with a motor</span>. If it has an
                        engine, a battery, or a propeller, we've got you covered. This isn't some corporate
                        project built by people who've never turned a wrench. This was built by a guy who got
                        fed up and decided 35 years was long enough to wait.
                      </p>
                      <p className="text-primary font-tech text-base">
                        Right Part. First Time. Every Engine. That's not a slogan — it's the whole point.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <NativeProductRecs context="outdoor" layout="grid" title="Road Trip Ready" maxItems={4} />
        </div>
      </section>

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="fixed bottom-20 left-4 z-40 p-2 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm hover:bg-card transition-all"
        data-testid="button-sound-toggle"
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
      </button>

      
      {/* Footer - Dynamic Version */}
      <Footer />
    </div>
  );
}
