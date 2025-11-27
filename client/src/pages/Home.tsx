import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Wallet, Database, Cpu, Tag, ArrowRight, Hexagon } from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import bgImage from "@assets/generated_images/futuristic_watermark_background_with_subtle_blue_nebula_and_geometric_lines.png";
import footerWave from "@assets/copilot_image_1764282859449_1764282878495.jpeg";
import MarketTicker from "@/components/MarketTicker";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setLocation("/results"), 800);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
        
          {/* Left Column: Search Interface */}
          <div className="flex flex-col justify-center py-4 lg:py-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 md:space-y-8 max-w-xl mx-auto lg:mx-0 w-full"
            >
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-[10px] font-mono mb-4 md:mb-6 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                  SYSTEM ONLINE // WEB3 VERIFIED
                </div>
                <h1 className="text-4xl md:text-7xl font-tech font-bold uppercase leading-[0.9] mb-2 tracking-tight">
                  Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Ledger</span>
                </h1>
                <p className="text-lg md:text-2xl font-light text-muted-foreground">
                  Aggregator Protocol by <span className="text-white font-bold">DarkWave Studios</span>
                </p>
              </div>

              {/* Mobile Carousel Insertion (Visible only on mobile) */}
              <div className="lg:hidden">
                <FeaturedCarousel />
              </div>

              <Card className="glass-panel border-0 p-1">
                <Tabs defaultValue="standard" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 bg-black/40 h-12 p-1 rounded-lg">
                    <TabsTrigger value="standard" className="font-mono text-xs uppercase rounded-md data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Standard Search</TabsTrigger>
                    <TabsTrigger value="web3" className="font-mono text-xs uppercase rounded-md data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary flex items-center gap-2">
                      <Hexagon className="w-3 h-3" /> Web3 Search
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="standard" className="p-3 md:p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <Select>
                        <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors"><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors"><SelectValue placeholder="Make" /></SelectTrigger>
                        <SelectContent><SelectItem value="toyota">Toyota</SelectItem></SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-primary/50 hover:bg-black/30 transition-colors"><SelectValue placeholder="Model" /></SelectTrigger>
                        <SelectContent><SelectItem value="tacoma">Tacoma</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <Input className="h-14 bg-black/20 border-white/5 font-tech text-base md:text-lg placeholder:text-muted-foreground/50 focus:border-primary/50 hover:bg-black/30 transition-colors" placeholder="SEARCH PART NUMBER..." />
                      <Button className="h-14 w-14 shrink-0 bg-primary text-black hover:bg-primary/90 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]" onClick={handleSearch}>
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="web3" className="p-3 md:p-5 space-y-4">
                    <div className="p-6 border border-dashed border-secondary/30 rounded-lg bg-secondary/5 text-center group hover:bg-secondary/10 transition-colors cursor-pointer">
                      <p className="font-mono text-xs text-secondary mb-3">CONNECT WALLET TO SCAN NFT PARTS</p>
                      <Button size="sm" variant="outline" className="font-tech uppercase border-secondary text-secondary hover:bg-secondary hover:text-black">
                        Connect Wallet
                      </Button>
                    </div>
                    <Input className="h-12 bg-black/20 border-white/5 font-mono text-xs focus:border-secondary/50" placeholder="ENTER CONTRACT ADDRESS OR TOKEN ID..." />
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
          <div className="hidden lg:flex flex-col justify-center h-full py-12 pl-12 border-l border-white/5 space-y-10">
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
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="font-mono text-xs text-blue-200/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            © 2025 DARKWAVE STUDIOS LLC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
