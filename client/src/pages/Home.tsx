import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Wallet, Database, Cpu } from "lucide-react";
import Nav from "@/components/Nav";
import CategoryGrid from "@/components/CategoryGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setLocation("/results"), 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white overflow-hidden">
      <Nav />
      
      {/* Split Layout: High Density */}
      <div className="pt-20 h-[calc(100vh)] container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
        
        {/* Left Column: Search Interface */}
        <div className="flex flex-col justify-center py-8 lg:py-0 h-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-xl"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                SYSTEM ONLINE // WEB3 ENABLED
              </div>
              <h1 className="text-5xl md:text-6xl font-tech font-bold uppercase leading-[0.9] mb-4">
                Part<span className="text-primary">Scout</span>
                <br />
                <span className="text-muted-foreground text-3xl md:text-4xl">Aggregator Protocol</span>
              </h1>
            </div>

            <Card className="bg-card/50 border-border p-1 backdrop-blur-sm">
              <Tabs defaultValue="standard" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-black/20 h-10 p-1">
                  <TabsTrigger value="standard" className="font-mono text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black">Standard Search</TabsTrigger>
                  <TabsTrigger value="web3" className="font-mono text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-black flex items-center gap-2">
                    <Wallet className="w-3 h-3" /> Web3 Search
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard" className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Select>
                      <SelectTrigger className="h-10 bg-background border-white/10 font-mono text-xs"><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-10 bg-background border-white/10 font-mono text-xs"><SelectValue placeholder="Make" /></SelectTrigger>
                      <SelectContent><SelectItem value="toyota">Toyota</SelectItem></SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-10 bg-background border-white/10 font-mono text-xs"><SelectValue placeholder="Model" /></SelectTrigger>
                      <SelectContent><SelectItem value="tacoma">Tacoma</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input className="h-12 bg-background border-white/10 font-tech text-lg" placeholder="SEARCH PART NUMBER OR NAME..." />
                    <Button className="h-12 w-12 shrink-0 bg-primary text-black hover:bg-primary/90" onClick={handleSearch}>
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="web3" className="p-4 space-y-4">
                  <div className="p-4 border border-dashed border-primary/30 rounded bg-primary/5 text-center">
                    <p className="font-mono text-xs text-primary mb-2">CONNECT WALLET TO SCAN NFT PARTS</p>
                    <Button size="sm" variant="outline" className="font-tech uppercase border-primary text-primary hover:bg-primary hover:text-black">
                      Connect Wallet
                    </Button>
                  </div>
                  <Input className="h-10 bg-background border-white/10 font-mono text-xs" placeholder="ENTER CONTRACT ADDRESS OR TOKEN ID..." />
                </TabsContent>
              </Tabs>
            </Card>

            <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 15M+ PARTS INDEXED</span>
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> AI MATCHING ACTIVE</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Featured / Visuals (No wasted space) */}
        <div className="hidden lg:flex flex-col justify-center h-full py-12 pl-8 border-l border-white/5">
          <CategoryGrid />
        </div>
      </div>
    </div>
  );
}
