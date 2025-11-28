import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon, Globe, ExternalLink } from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import VehicleTypeSelector from "@/components/VehicleTypeSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";
import alLogo from "@assets/generated_images/al_gear_logo_emblem.png";
import footerWave from "@assets/copilot_image_1764282859449_1764282878495.jpeg";
import MarketTicker from "@/components/MarketTicker";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [webUrl, setWebUrl] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setLocation("/results"), 800);
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
          
          {/* AL Logo Emblem */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <img 
              src={alLogo} 
              alt="AutoLedger Emblem" 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              data-testid="img-al-logo"
            />
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-tech font-bold uppercase leading-[0.9] mb-2 tracking-tight">
            Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Ledger</span>
          </h1>
          <p className="text-lg md:text-2xl font-light text-muted-foreground">
            Aggregator Protocol
          </p>
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
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <Select>
                        <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-year"><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent><SelectItem value="2024">2024</SelectItem><SelectItem value="2023">2023</SelectItem><SelectItem value="2022">2022</SelectItem></SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-make"><SelectValue placeholder="Make" /></SelectTrigger>
                        <SelectContent><SelectItem value="toyota">Toyota</SelectItem><SelectItem value="honda">Honda</SelectItem><SelectItem value="ford">Ford</SelectItem></SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors" data-testid="select-model"><SelectValue placeholder="Model" /></SelectTrigger>
                        <SelectContent><SelectItem value="tacoma">Tacoma</SelectItem><SelectItem value="camry">Camry</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <Input 
                        className="h-14 bg-black/20 border-white/5 font-tech text-base md:text-lg placeholder:text-muted-foreground/50 focus:border-primary/50 hover:bg-black/30 transition-colors" 
                        placeholder="SEARCH PART NUMBER..." 
                        data-testid="input-part-search"
                      />
                      <Button 
                        className="h-14 w-14 shrink-0 bg-primary text-black hover:bg-primary/90 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                        onClick={handleSearch}
                        data-testid="button-search"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
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
          <div className="hidden lg:flex flex-col justify-start h-full py-6 pl-12 border-l border-white/5 space-y-10">
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
