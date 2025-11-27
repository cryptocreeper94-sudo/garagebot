import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, Filter, Check, AlertCircle, Grid, List, MapPin, Truck, Info } from "lucide-react";
import Nav from "@/components/Nav";
import { MOCK_RESULTS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SCANNING_STORES = [
  "AutoZone Database...",
  "RockAuto API...",
  "NAPA Inventory...",
  "Amazon Automotive...",
  "VMC Chinese Parts...",
  "eBay Motors..."
];

export default function Results() {
  const [isLoading, setIsLoading] = useState(true);
  const [scanText, setScanText] = useState(SCANNING_STORES[0]);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SCANNING_STORES.length) {
        setScanText(SCANNING_STORES[step]);
      }
    }, 300);

    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-20 h-[calc(100vh-5rem)] container mx-auto px-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Filters (Compact Sidebar) */}
          <div className="hidden lg:block col-span-3 h-full border-r border-white/5 pr-6 overflow-y-auto pb-20">
            <div className="mb-8">
              <h2 className="font-tech font-bold text-2xl uppercase mb-1 text-primary">Results</h2>
              <p className="font-mono text-[10px] text-muted-foreground">4 MATCHES FOUND // 0.45s</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded bg-white/5 border border-white/5">
                <h3 className="font-mono text-xs uppercase text-muted-foreground mb-3">Price Range</h3>
                <Slider defaultValue={[65]} max={100} step={1} className="mb-2" />
                <div className="flex justify-between text-[10px] font-mono">
                  <span>$0</span>
                  <span>$100+</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase text-muted-foreground">Category</h3>
                 <div className="space-y-1">
                  {["Brakes", "Engine", "Suspension", "Powersports"].map(cat => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox id={cat} className="w-3 h-3" />
                      <label htmlFor={cat} className="text-xs font-medium leading-none">{cat}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase text-muted-foreground">Manufacturers</h3>
                <div className="space-y-1">
                  {["Brembo", "Bosch", "Wagner", "TaoTao"].map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox id={brand} className="w-3 h-3" />
                      <label htmlFor={brand} className="text-xs font-medium leading-none">{brand}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grid Results (High Density) */}
          <div className="col-span-12 lg:col-span-9 h-full overflow-y-auto pb-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] border-green-500/30 text-green-400">
                  <Check className="w-3 h-3 mr-1" /> 2022 TACOMA
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] border-yellow-500/30 text-yellow-400 ml-2">
                  <Info className="w-3 h-3 mr-1" /> UNIVERSAL FIT INCLUDED
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="w-8 h-8"><Grid className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground"><List className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                // Loading Skeletons
                [1,2,3,4].map(i => (
                  <div key={i} className="h-64 bg-card/30 rounded border border-white/5 animate-pulse" />
                ))
              ) : (
                MOCK_RESULTS.map((part, index) => (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden h-full flex flex-col">
                      <div className="flex h-32 border-b border-white/5">
                        <div className="w-32 bg-black/20 relative shrink-0">
                           <img src={part.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-tech font-bold text-lg truncate pr-2">{part.name}</h3>
                            <span className="font-mono text-xs text-yellow-500 flex items-center gap-1">
                              {part.rating} <Star className="w-3 h-3 fill-current" />
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground mt-1">#{part.partNumber}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Fitment Verified</Badge>
                            {index === 0 && <Badge className="text-[10px] h-5 px-1.5 bg-primary text-black">Best Value</Badge>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-0 flex-1 bg-background/30">
                        {part.prices.slice(0, 3).map((price, idx) => (
                          <div key={price.store} className="flex items-center justify-between px-3 py-2 border-b border-white/5 last:border-0 text-xs">
                            <div className="flex flex-col">
                              <span className={`font-bold ${idx===0 ? 'text-primary' : 'text-muted-foreground'}`}>{price.store}</span>
                              {price.location && price.location !== "Online Only" ? (
                                <span className="text-[9px] text-green-400 flex items-center gap-1">
                                  <MapPin className="w-2 h-2" /> {price.location}
                                </span>
                              ) : (
                                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
                                  <Truck className="w-2 h-2" /> Shipped
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-muted-foreground hidden sm:block">{price.shipping}</span>
                              <span className="font-mono font-bold text-white">${price.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1 p-2 bg-card border-t border-white/5">
                         <Button variant="outline" className="h-8 text-[10px] font-tech uppercase border-primary/30 text-primary hover:bg-primary hover:text-black">
                           <MapPin className="w-3 h-3 mr-1" /> Reserve at Store
                         </Button>
                         <Button variant="default" className="h-8 text-[10px] font-tech uppercase bg-white/10 hover:bg-white/20" onClick={() => window.location.href = "/checkout"}>
                           <Truck className="w-3 h-3 mr-1" /> Ship to Home
                         </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
