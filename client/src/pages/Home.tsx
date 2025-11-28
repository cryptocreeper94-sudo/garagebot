import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon, Globe, ExternalLink,
  ScanLine, Camera, Mic, Wrench, Car, Sparkles, MessageCircle, Bot
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
import { 
  AnimatedStats, 
  RetailerLogos, 
  HowItWorks, 
  Testimonials, 
  CTABanner,
  TrustBadges
} from "@/components/LandingPageSections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";
import MarketTicker from "@/components/MarketTicker";
import footerWave from "@assets/copilot_image_1764282859449_1764282878495.jpeg";

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
      {/* Global Watermark Background */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      <Nav />
      <MarketTicker />
      
      {/* Buddy Hide & Seek - Random pop-ups */}
      <BuddyHideSeek />
      
      {/* Main Content */}
      <div className="pt-28 min-h-screen pb-8">
        
        {/* Hero Section - Full Width */}
        <div className="w-full px-4 lg:px-8 xl:px-16 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
              SYSTEM ONLINE // WEB3 VERIFIED
            </div>
            
            {/* GarageBot Logo - Larger on desktop */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-2"
            >
              <img 
                src={gbEmblem} 
                alt="GarageBot Emblem" 
                className="w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 xl:w-60 xl:h-60 mx-auto drop-shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:drop-shadow-[0_0_60px_rgba(6,182,212,0.8)] transition-all duration-500 hover:scale-105"
                data-testid="img-garagebot-logo"
              />
            </motion.div>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-tech font-medium uppercase tracking-widest text-muted-foreground -mt-6 lg:-mt-8">
              Garage<span className="text-primary">Bot</span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg font-light text-muted-foreground/70 mt-1">
              Right Part. First Time. Every Engine.
            </p>
          </motion.div>
        </div>

        {/* Vehicle Type Selector - True Full Width Edge-to-Edge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-screen relative left-1/2 right-1/2 -mx-[50vw] mb-6 bg-black/20 py-4 border-y border-white/5"
        >
          <div className="px-4 lg:px-8 xl:px-16">
            <VehicleTypeSelector />
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

                {/* Weather Widget */}
                <div className="hidden lg:block">
                  <WeatherWidget />
                </div>
              </motion.div>
            </div>

            {/* Right Column - Categories & Deals */}
            <div className="lg:col-span-3 space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <CategoryGrid />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Featured Carousel - Full Width */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full px-4 lg:px-8 xl:px-16 mt-4"
        >
          <FeaturedCarousel />
        </motion.div>

        {/* Animated Stats */}
        <div className="w-full px-4 lg:px-8 xl:px-16">
          <AnimatedStats />
        </div>

        {/* Retailer Logo Parade */}
        <div className="w-full px-4 lg:px-8 xl:px-16">
          <RetailerLogos />
        </div>

        {/* How It Works */}
        <div className="w-full px-4 lg:px-8 xl:px-16">
          <HowItWorks />
        </div>

        {/* CTA Banner */}
        <div className="w-full px-4 lg:px-8 xl:px-16">
          <CTABanner />
        </div>

        {/* Testimonials */}
        <div className="w-full px-4 lg:px-8 xl:px-16">
          <Testimonials />
        </div>

        {/* Trust Badges */}
        <div className="w-full px-4 lg:px-8 xl:px-16 mb-6">
          <TrustBadges />
        </div>
      </div>
      
      {/* Footer with Wave Background */}
      <footer className="py-10 border-t border-primary/20 bg-gradient-to-t from-[#0a0f1e] to-transparent relative overflow-hidden">
        {/* Wave Background - Fixed aspect ratio */}
        <div className="absolute inset-0 w-full pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-32 max-h-full">
            <img 
              src={footerWave} 
              alt="" 
              className="w-full h-full object-cover object-top opacity-40 mix-blend-screen"
            />
          </div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 space-y-2">
          <p className="font-mono text-[10px] text-muted-foreground/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            © 2025 DARKWAVE STUDIOS LLC. ALL RIGHTS RESERVED.
          </p>
          <a 
            href="https://darkwave-studios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block font-mono text-[10px] text-primary/80 hover:text-primary transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            data-testid="link-darkwave-studios"
          >
            darkwave-studios.io
          </a>
        </div>
      </footer>

      {/* Buddy AI Chat - Always available */}
      <AIMascot />
    </div>
  );
}
