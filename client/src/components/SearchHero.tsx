import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroBg from "@assets/generated_images/technical_blueprint_style_background_of_automotive_parts.png";

export default function SearchHero() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate aggregator delay
    setTimeout(() => {
      setLocation("/results");
    }, 1000);
  };

  return (
    <div className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-border">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern z-0 opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SYSTEM ONLINE // AGGREGATING 15+ VENDORS
          </div>
          
          <h1 className="text-5xl md:text-7xl font-tech font-bold uppercase tracking-tight mb-6 text-white leading-none">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Exact Part</span>
            <br />
            At the Best Price
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Stop searching 15 different websites. We scan the entire automotive web to find availability and the lowest prices in seconds.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-5xl mx-auto glass-panel p-6 md:p-8 rounded-xl shadow-2xl border-primary/20"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            {/* Vehicle Selector Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">YEAR</label>
                <Select>
                  <SelectTrigger className="h-12 bg-background/50 border-border focus:border-primary font-mono">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-4">
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">MAKE</label>
                <Select>
                  <SelectTrigger className="h-12 bg-background/50 border-border focus:border-primary font-mono">
                    <SelectValue placeholder="Select Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="chevrolet">Chevrolet</SelectItem>
                    <SelectItem value="honda">Honda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-5">
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">MODEL</label>
                <Select>
                  <SelectTrigger className="h-12 bg-background/50 border-border focus:border-primary font-mono">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tacoma">Tacoma</SelectItem>
                    <SelectItem value="f150">F-150</SelectItem>
                    <SelectItem value="silverado">Silverado</SelectItem>
                    <SelectItem value="civic">Civic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Input Row */}
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  className="h-14 pl-12 bg-background/50 border-border focus:border-primary text-lg font-medium placeholder:font-light" 
                  placeholder="What are you looking for? (e.g., 'Brake Pads', 'Alternator')"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-tech font-bold text-lg tracking-wide uppercase min-w-[200px]"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="animate-pulse">Scanning...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    Find Parts <ChevronRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-6 items-center justify-center md:justify-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Searching Inventories From:</span>
            <div className="flex gap-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              {/* Simple Text Logos for Mockup */}
              <span className="font-bold text-sm">AutoZone</span>
              <span className="font-bold text-sm">RockAuto</span>
              <span className="font-bold text-sm">NAPA</span>
              <span className="font-bold text-sm">Amazon</span>
              <span className="font-bold text-sm">Summit Racing</span>
              <span className="text-xs font-mono text-primary">+ 12 Others</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
