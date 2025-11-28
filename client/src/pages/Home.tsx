import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon, Globe, ExternalLink } from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import WeatherWidget from "@/components/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";
import footerWave from "@assets/copilot_image_1764282859449_1764282878495.jpeg";
import MarketTicker from "@/components/MarketTicker";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Build query params
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
      
      {/* Layout Wrapper */}
      <div className="pt-28 min-h-screen container mx-auto px-4 pb-20">
        
        {/* Hero Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-mono mb-4 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
            SYSTEM ONLINE // WEB3 VERIFIED
          </div>
          
          {/* GarageBot Logo Emblem - Featured Large */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-1"
          >
            <img 
              src={gbEmblem} 
              alt="GarageBot Emblem" 
              className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto drop-shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:drop-shadow-[0_0_60px_rgba(6,182,212,0.8)] transition-all duration-500 hover:scale-105"
              data-testid="img-garagebot-logo"
            />
          </motion.div>
          
          <h1 className="text-xl md:text-2xl font-tech font-medium uppercase tracking-widest mb-0 text-muted-foreground -mt-2">
            Garage<span className="text-primary">Bot</span>
          </h1>
          <p className="text-sm md:text-base font-light text-muted-foreground/70 mt-1">
            Right Part. First Time. Every Engine.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-primary/20 p-6 md:p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-tech text-lg md:text-xl uppercase text-primary mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed md:text-lg">
                GarageBot is the only parts platform built for <span className="text-foreground font-medium">every vehicle with an engine</span>. 
                Whether you're fixing a family sedan, building a custom motorcycle, maintaining your fishing boat, 
                or restoring a vintage ATV — we search <span className="text-primary font-medium">20+ retailers</span> to 
                find the right part at the best price, with local pickup when you need it now.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mt-4">
                {["Cars", "Classics", "Exotics", "Kit Cars", "Motorcycles", "ATVs", "Boats", "RVs", "Diesel"].map((type) => (
                  <span key={type} className="px-2 md:px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-mono border border-primary/20 hover:bg-primary/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all cursor-default whitespace-nowrap">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Vehicle Type Selector - Full Width at Top */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <VehicleTypeSelector />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
        
          {/* Left Column: Search Interface */}
          <div className="flex flex-col justify-start py-4 lg:py-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 md:space-y-8 max-w-xl mx-auto lg:mx-0 w-full"
            >
              {/* Mobile Carousel Insertion (Visible only on mobile) */}
              <div className="lg:hidden">
                <FeaturedCarousel />
              </div>

              <Card className="glass-panel border-0 p-1">
                <Tabs defaultValue="standard" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 bg-black/40 h-12 p-1 rounded-lg">
                    <TabsTrigger value="standard" className="font-mono text-xs uppercase rounded-md data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Parts Search</TabsTrigger>
                    <TabsTrigger value="web3" className="font-mono text-xs uppercase rounded-md data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary flex items-center gap-2">
                      <Globe className="w-3 h-3" /> Web Portal
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="p-3 md:p-5 space-y-4">
                    <form onSubmit={handleSearch}>
                      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-year"><SelectValue placeholder="Year" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 35 }, (_, i) => 2025 - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedMake} onValueChange={setSelectedMake}>
                          <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-make"><SelectValue placeholder="Make" /></SelectTrigger>
                          <SelectContent>
                            {["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"].map(make => (
                              <SelectItem key={make} value={make.toLowerCase()}>{make}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-model"><SelectValue placeholder="Model" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="coupe">Coupe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 md:gap-3">
                        <Input 
                          className="h-14 bg-black/20 border-white/5 font-tech text-base md:text-lg placeholder:text-muted-foreground/50 focus:border-primary/50 hover:bg-black/30 transition-colors" 
                          placeholder="SEARCH PARTS, PART NUMBER, OR KEYWORD..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-part-search"
                        />
                        <Button 
                          type="submit"
                          className="h-14 w-14 shrink-0 bg-primary text-black hover:bg-primary/90 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                          disabled={isSearching || !searchQuery.trim()}
                          data-testid="button-search"
                        >
                          {isSearching ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            <ChevronRight className="w-6 h-6" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="web3" className="p-3 md:p-5 space-y-4">
                    {/* Web Address Bar */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Globe className="w-3 h-3 text-secondary" />
                        <span>DIRECT WEB NAVIGATION</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input 
                            className="h-14 bg-black/20 border-white/5 font-mono text-sm pl-4 pr-10 focus:border-secondary/50 hover:bg-black/30 transition-colors" 
                            placeholder="Enter URL (e.g., darkwavestudios.io)"
                            value={webUrl}
                            onChange={(e) => setWebUrl(e.target.value)}
                            onKeyPress={handleWebKeyPress}
                            data-testid="input-web-url"
                          />
                        </div>
                        <Button 
                          className="h-14 px-6 shrink-0 bg-secondary text-black hover:bg-secondary/90 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] font-tech uppercase"
                          onClick={handleWebNavigate}
                          data-testid="button-navigate"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Go
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 font-mono">Opens in new tab • Secure navigation</p>
                    </div>
                    
                    <div className="border-t border-white/5 pt-4">
                      <div className="p-4 border border-dashed border-secondary/30 rounded-lg bg-secondary/5 text-center group hover:bg-secondary/10 transition-colors cursor-pointer">
                        <p className="font-mono text-xs text-secondary mb-3">CONNECT WALLET FOR NFT PARTS</p>
                        <Button size="sm" variant="outline" className="font-tech uppercase border-secondary text-secondary hover:bg-secondary hover:text-black" data-testid="button-connect-wallet">
                          <Hexagon className="w-3 h-3 mr-2" />
                          Connect Wallet
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-mono text-muted-foreground/60 pt-2 justify-center lg:justify-start">
                <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-primary/50" /> 15M+ PARTS INDEXED</span>
                <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-secondary/50" /> AI MATCHING ACTIVE</span>
              </div>

              {/* Mobile Category Grid Insertion */}
              <div className="lg:hidden pt-6">
                <CategoryGrid />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Featured / Visuals (Desktop Only) */}
          <div className="hidden lg:flex flex-col justify-start h-full py-6 pl-12 border-l border-white/5 space-y-6">
            <WeatherWidget />
            <CategoryGrid />
            <FeaturedCarousel />
          </div>
        </div>
      </div>
      
      <footer className="py-12 border-t border-primary/20 mt-0 bg-gradient-to-t from-[#0a0f1e] to-transparent relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-100 pointer-events-none">
           <img 
             src={footerWave} 
             alt="DarkWave Signature" 
             className="w-full h-full object-cover mix-blend-screen"
           />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 space-y-3">
          <p className="font-mono text-xs text-blue-200/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            © 2025 DARKWAVE STUDIOS LLC. ALL RIGHTS RESERVED.
          </p>
          <a 
            href="https://darkwave-studios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block font-mono text-xs text-primary/80 hover:text-primary transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            data-testid="link-darkwave-studios"
          >
            darkwave-studios.io
          </a>
        </div>
      </footer>
    </div>
  );
}
