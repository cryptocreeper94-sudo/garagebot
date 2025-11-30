import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon, Globe, ExternalLink,
  ScanLine, Camera, Mic, Wrench, Car, Sparkles, MessageCircle, Bot, TrendingUp, Terminal,
  BookOpen, PlayCircle, CheckCircle2, Images, Shield
} from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import WeatherWidget from "@/components/WeatherWidget";
import VinScanner from "@/components/VinScanner";
import PhotoSearch from "@/components/PhotoSearch";
import VoiceSearch from "@/components/VoiceSearch";
import AIMascot from "@/components/AIMascot";
import BuddyHideSeek from "@/components/BuddyHideSeek";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";
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
      
      {/* Buddy Hide & Seek - Random pop-ups */}
      <BuddyHideSeek />
      
      {/* Main Content */}
      <div className="pt-20 min-h-screen pb-8">
        
        {/* Hero Section - Full Width with Premium Feel */}
        <div className="w-full px-4 lg:px-8 xl:px-16 mb-4">
          {/* Hero Container with Gradient Border */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-6 md:py-8 lg:py-10"
          >
            {/* Animated glow lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 md:w-64 lg:w-96 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 md:w-48 lg:w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] md:text-xs font-mono tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--color-primary)]" />
              SYSTEM ONLINE // 40+ RETAILERS CONNECTED
            </motion.div>
            
            {/* GarageBot Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <img 
                src={gbEmblem} 
                alt="GarageBot Emblem" 
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto drop-shadow-[0_0_50px_rgba(6,182,212,0.7)] hover:drop-shadow-[0_0_70px_rgba(6,182,212,0.9)] transition-all duration-500 hover:scale-110"
                data-testid="img-garagebot-logo"
              />
              {/* Orbital ring effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 border border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" />
              </div>
            </motion.div>
            
            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4"
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-tech font-bold uppercase tracking-wide">
                <span className="text-muted-foreground">Welcome to </span>
                <span className="text-primary drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">G</span>
                <span className="text-foreground">arage</span>
                <span className="text-primary drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">B</span>
                <span className="text-foreground">ot</span>
                <span className="text-primary/80">.io</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl font-light text-muted-foreground/80 mt-2 tracking-wide">
                Right Part. First Time. <span className="text-primary">Every Engine.</span>
              </p>
            </motion.div>
            
            {/* Stats Badges Row */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-white/10 backdrop-blur-sm">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-xs md:text-sm font-medium text-foreground">40+ Retailers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-white/10 backdrop-blur-sm">
                <Cpu className="w-4 h-4 text-secondary" />
                <span className="text-xs md:text-sm font-medium text-foreground">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 border border-white/10 backdrop-blur-sm">
                <Car className="w-4 h-4 text-green-400" />
                <span className="text-xs md:text-sm font-medium text-foreground">All Vehicle Types</span>
              </div>
              <Link href="/hallmark">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-900/40 to-primary/20 border border-purple-500/30 backdrop-blur-sm cursor-pointer hover:border-purple-400/50 transition-all group">
                  <Shield className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  <span className="text-xs md:text-sm font-medium text-purple-300 group-hover:text-purple-200">Blockchain Verified</span>
                </div>
              </Link>
            </motion.div>
            
            {/* DIY Repair Guides - Hero Feature Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Link href="/diy-guides" data-testid="link-diy-guides">
                <div className="relative mx-auto max-w-2xl group cursor-pointer" data-testid="card-diy-guides-hero">
                  {/* Glowing border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-green-400 to-primary rounded-xl opacity-50 group-hover:opacity-100 blur transition-all duration-500 animate-pulse" />
                  
                  <div className="relative bg-black/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-primary/30">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-black" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg md:text-xl font-tech font-bold text-foreground uppercase tracking-wide">
                          DIY Repair Guides
                        </h3>
                        <p className="text-xs md:text-sm text-primary font-medium">Better Than Video Tutorials</p>
                      </div>
                    </div>
                    
                    <p className="text-sm md:text-base text-muted-foreground text-center mb-4">
                      Step-by-step slideshows for YOUR exact vehicle. No more pausing and rewinding YouTube videos!
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs">
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Go At Your Pace</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Vehicle-Specific</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Plain English</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Parts Links Included</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 text-black font-tech uppercase text-xs md:text-sm gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all" data-testid="button-explore-guides">
                        <Images className="w-4 h-4" />
                        Explore Guides
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Trusted Retailers Ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 overflow-hidden"
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2">Trusted Retail Partners</p>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
                <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
                  {["AutoZone", "O'Reilly", "RockAuto", "Advance Auto", "NAPA", "Summit Racing", "JEGS", "Amazon", "eBay Motors", "CarParts.com", "AutoZone", "O'Reilly", "RockAuto", "Advance Auto", "NAPA", "Summit Racing"].map((name, i) => (
                    <span key={i} className="mx-4 md:mx-6 text-xs md:text-sm text-muted-foreground/60 font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Unified Navigation Section - Vehicle Types + Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-screen relative left-1/2 right-1/2 -mx-[50vw] mb-6 bg-black/20 py-4 border-y border-white/5"
        >
          <div className="px-4 lg:px-8 xl:px-16 space-y-4">
            <VehicleTypeSelector />
            <CategoryGrid />
          </div>
        </motion.div>

        {/* Main 3-Column Layout for Desktop */}
        <div className="w-full px-4 lg:px-8 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            
            {/* Left Column - Search & Tools */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Search Card */}
                <Card className="glass-panel border-0 p-1 card-hover">
                  <Tabs defaultValue="standard" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-black/40 h-10 p-1 rounded-lg">
                      <TabsTrigger value="standard" className="font-mono text-[10px] uppercase rounded-md data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Parts Search</TabsTrigger>
                      <TabsTrigger value="web3" className="font-mono text-[10px] uppercase rounded-md data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Web Portal
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="standard" className="p-3 space-y-3">
                      <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="h-10 bg-black/20 border-white/5 font-mono text-[10px] focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-year"><SelectValue placeholder="Year" /></SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 35 }, (_, i) => 2025 - i).map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={selectedMake} onValueChange={setSelectedMake}>
                            <SelectTrigger className="h-10 bg-black/20 border-white/5 font-mono text-[10px] focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-make"><SelectValue placeholder="Make" /></SelectTrigger>
                            <SelectContent>
                              {["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"].map(make => (
                                <SelectItem key={make} value={make.toLowerCase()}>{make}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger className="h-10 bg-black/20 border-white/5 font-mono text-[10px] focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-model"><SelectValue placeholder="Model" /></SelectTrigger>
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
                            className="h-12 bg-black/20 border-white/5 font-tech text-sm placeholder:text-muted-foreground/50 focus:border-primary/50 hover:bg-black/30 transition-colors" 
                            placeholder="SEARCH PARTS..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="input-part-search"
                          />
                          <Button 
                            type="submit"
                            className="h-12 w-12 shrink-0 bg-primary text-black hover:bg-primary/90 rounded-lg btn-glow" 
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

                    <TabsContent value="web3" className="p-3 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                          <Globe className="w-3 h-3 text-secondary" />
                          <span>DIRECT WEB NAVIGATION</span>
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            className="h-10 bg-black/20 border-white/5 font-mono text-xs pl-3 focus:border-secondary/50 hover:bg-black/30 transition-colors" 
                            placeholder="Enter URL..."
                            value={webUrl}
                            onChange={(e) => setWebUrl(e.target.value)}
                            onKeyPress={handleWebKeyPress}
                            data-testid="input-web-url"
                          />
                          <Button 
                            className="h-10 px-4 shrink-0 bg-secondary text-black hover:bg-secondary/90 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] font-tech uppercase text-xs"
                            onClick={handleWebNavigate}
                            data-testid="button-navigate"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-3 border border-dashed border-secondary/30 rounded-lg bg-secondary/5 text-center">
                        <p className="font-mono text-[10px] text-secondary mb-2">CONNECT WALLET FOR NFT PARTS</p>
                        <Button size="sm" variant="outline" className="font-tech uppercase text-xs border-secondary text-secondary hover:bg-secondary hover:text-black h-8" data-testid="button-connect-wallet">
                          <Hexagon className="w-3 h-3 mr-1" />
                          Connect Wallet
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Quick Tools */}
                <Card className="bg-card/50 border-primary/20 p-3 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="font-tech text-[10px] uppercase text-primary">Quick Tools</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Dialog open={showVinScanner} onOpenChange={setShowVinScanner}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto py-2 flex flex-col gap-1 border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                          data-testid="button-vin-scanner"
                        >
                          <ScanLine className="w-4 h-4 text-primary" />
                          <span className="text-[8px] font-tech uppercase">VIN</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <VinScanner />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showPhotoSearch} onOpenChange={setShowPhotoSearch}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto py-2 flex flex-col gap-1 border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40"
                          data-testid="button-photo-search"
                        >
                          <Camera className="w-4 h-4 text-purple-400" />
                          <span className="text-[8px] font-tech uppercase">Photo</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <PhotoSearch />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showVoiceSearch} onOpenChange={setShowVoiceSearch}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto py-2 flex flex-col gap-1 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40"
                          data-testid="button-voice-search"
                        >
                          <Mic className="w-4 h-4 text-green-400" />
                          <span className="text-[8px] font-tech uppercase">Voice</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <VoiceSearch />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="h-auto py-2 flex flex-col gap-1 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/40"
                      onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()}
                      data-testid="button-buddy-chat"
                    >
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span className="text-[8px] font-tech uppercase">Buddy</span>
                    </Button>
                  </div>
                </Card>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-[9px] font-mono text-muted-foreground/60 mt-3 justify-center lg:justify-start">
                  <span className="flex items-center gap-1"><Database className="w-3 h-3 text-primary/50" /> 15M+ PARTS</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-secondary/50" /> AI ACTIVE</span>
                </div>
              </motion.div>
            </div>

            {/* Center Column - Buddy AI + Mission Side by Side */}
            <div className="lg:col-span-4 xl:col-span-5 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {/* Buddy + Mission in a horizontal grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Buddy AI Card */}
                  <Card className="bg-gradient-to-br from-primary/10 via-card/80 to-secondary/10 border-primary/30 p-4 relative overflow-hidden neon-border">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          <Bot className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h3 className="font-tech text-xs uppercase text-primary flex items-center gap-1">
                            Meet Buddy
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          </h3>
                          <p className="text-[9px] text-muted-foreground">AI Parts Expert</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-3 flex-1">
                        Tell Buddy what you need, snap a photo, or describe your problem. He'll find the right part across 20+ retailers.
                      </p>
                      <Button 
                        onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="ai-mascot-toggle"]')?.click()}
                        className="w-full bg-primary text-black hover:bg-primary/90 font-tech uppercase text-[10px] h-8 btn-glow"
                        data-testid="button-chat-buddy"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Chat with Buddy
                      </Button>
                    </div>
                  </Card>

                  {/* Mission Statement */}
                  <Card className="bg-card/50 border-white/10 p-4 flex flex-col">
                    <h2 className="font-tech text-xs uppercase text-primary mb-2">Our Mission</h2>
                    <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
                      GarageBot is the only parts platform built for <span className="text-foreground font-medium">every vehicle with an engine</span>. 
                      We search <span className="text-primary">20+ retailers</span> to find the right part at the best price.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {["Cars", "Trucks", "Motorcycles", "ATVs", "Boats", "RVs", "Diesel"].map((type) => (
                        <span key={type} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[7px] font-mono border border-primary/20">
                          {type}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>

              </motion.div>
            </div>

            {/* Right Column - Weather & Info */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <WeatherWidget />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Featured Carousel - Full Width */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full px-4 lg:px-8 xl:px-16 mt-6 mb-6"
        >
          <FeaturedCarousel />
        </motion.div>
      </div>
      
      {/* Footer with Animated Wave Background */}
      <footer className="border-t border-primary/20 bg-[#0a0f1e] relative overflow-hidden min-h-[250px]">
        {/* Animated Wave Background - Full width seamless scroll */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 flex h-full w-[400%]"
            style={{ 
              animation: 'waveScroll 120s linear infinite',
            }}
          >
            <img 
              src={footerWave} 
              alt="" 
              className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80"
            />
            <img 
              src={footerWave} 
              alt="" 
              className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80"
              style={{ transform: 'scaleX(-1)' }}
            />
            <img 
              src={footerWave} 
              alt="" 
              className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80"
            />
            <img 
              src={footerWave} 
              alt="" 
              className="h-full w-1/4 object-cover object-bottom flex-shrink-0 opacity-80"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
        
        {/* Footer Content - Positioned over wave */}
        <div className="container mx-auto px-4 text-center relative z-10 py-10 space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link href="/mechanics-garage">
              <Button 
                className="font-tech uppercase gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-900/30"
                data-testid="footer-button-mechanics"
              >
                <Wrench className="w-4 h-4" />
                Mechanics Garage
              </Button>
            </Link>
            <Link href="/investors">
              <Button 
                className="font-tech uppercase gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/30"
                data-testid="footer-button-investors"
              >
                <TrendingUp className="w-4 h-4" />
                Investors
              </Button>
            </Link>
            <Link href="/dev">
              <Button 
                variant="outline"
                className="font-tech uppercase gap-2 border-primary/50 text-primary hover:bg-primary/10 shadow-lg"
                data-testid="footer-button-dev"
              >
                <Terminal className="w-4 h-4" />
                Dev Portal
              </Button>
            </Link>
          </div>
          
          <p className="font-mono text-sm text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            © 2025 DarkWave Studios LLC. All Rights Reserved.
          </p>
          <a 
            href="https://darkwavestudios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block font-mono text-sm text-primary hover:text-primary/80 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            data-testid="link-darkwave-studios"
          >
            Powered by DarkWave Studios LLC
          </a>
        </div>
        
        {/* CSS Animation for wave scroll */}
        <style>{`
          @keyframes waveScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </footer>

      {/* Buddy AI Chat - Always available */}
      <AIMascot />
    </div>
  );
}
