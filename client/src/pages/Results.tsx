import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, ExternalLink, Filter, Check, AlertCircle } from "lucide-react";
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
  "Summit Racing...",
  "CarParts.com...",
  "Advance Auto Parts...",
  "O'Reilly Auto Parts..."
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
    }, 200);

    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-20 pb-10 container mx-auto px-4">
        {/* Breadcrumb / Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-tech font-bold uppercase">
              Search Results: <span className="text-primary">"Brake Pads"</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm mt-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              VEHICLE: 2022 TOYOTA TACOMA TRD OFF-ROAD
            </p>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="font-mono border-primary/50 text-primary bg-primary/10">
               15 SOURCES SCANNED
             </Badge>
             <Badge variant="outline" className="font-mono border-border text-muted-foreground">
               4 MATCHES FOUND
             </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8">
            <div className="glass-panel p-6 rounded-lg border border-border sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Filter className="w-4 h-4" />
                <span className="font-tech font-bold uppercase tracking-wider">Smart Filters</span>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold mb-3 uppercase tracking-wide">Price Range</h4>
                  <Slider defaultValue={[65]} max={100} step={1} className="mb-2" />
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>$0</span>
                    <span>$100+</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide">Brand</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="brembo" />
                    <label htmlFor="brembo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Brembo</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bosch" />
                    <label htmlFor="bosch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Bosch</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="wagner" />
                    <label htmlFor="wagner" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Wagner</label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide">Availability</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="instock" defaultChecked />
                    <label htmlFor="instock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">In Stock Only</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sameday" />
                    <label htmlFor="sameday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Same Day Pickup</label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 space-y-6 bg-card/30 rounded-xl border border-white/5"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/30 rounded-full animate-spin" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-tech text-xl font-bold text-primary uppercase tracking-widest animate-pulse">
                      AGGREGATING DATA
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">
                      {scanText}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Best Match Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/30 p-4 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-bold text-primary uppercase text-sm">Smart Recommendation</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on your 2022 Tacoma, the Brembo Ceramic pads offer the best balance of price and performance.
                      </p>
                    </div>
                  </motion.div>

                  {MOCK_RESULTS.map((part, index) => (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors group relative">
                        <div className="flex flex-col md:flex-row h-full">
                          {/* Image Section */}
                          <div className="w-full md:w-56 h-56 md:h-auto bg-black/20 relative shrink-0 overflow-hidden">
                            <img 
                              src={part.image} 
                              alt={part.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="bg-black/80 backdrop-blur font-mono text-[10px] text-white border-primary/30">
                                FITMENT VERIFIED
                              </Badge>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-bold text-xl font-tech uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
                                    {part.name}
                                  </h3>
                                  <p className="text-sm font-mono text-muted-foreground mt-1">PART #: {part.partNumber} // {part.fitment}</p>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span className="text-sm font-bold">{part.rating}</span>
                                  <span className="text-xs text-muted-foreground ml-1">({part.reviews})</span>
                                </div>
                              </div>
                              
                              {/* Vendor Comparison Table */}
                              <div className="mt-6 bg-background/50 rounded-md border border-white/5 p-1">
                                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-mono text-muted-foreground uppercase border-b border-white/5 mb-1">
                                  <div className="col-span-3">Seller</div>
                                  <div className="col-span-3">Shipping</div>
                                  <div className="col-span-3">Availability</div>
                                  <div className="col-span-3 text-right">Total Price</div>
                                </div>
                                {part.prices.map((price, idx) => (
                                  <div 
                                    key={price.store} 
                                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'}`}
                                  >
                                    <div className="col-span-3 flex items-center gap-2">
                                      {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                      <span className={`font-bold text-sm ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {price.store}
                                      </span>
                                    </div>
                                    <div className="col-span-3">
                                      <span className="text-xs font-mono text-muted-foreground">
                                        {price.shipping}
                                      </span>
                                    </div>
                                    <div className="col-span-3">
                                      <span className={`text-xs font-mono ${price.inStock ? 'text-green-400' : 'text-red-400'}`}>
                                        {price.inStock ? 'In Stock' : 'Out of Stock'}
                                      </span>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end gap-3">
                                      <span className={`font-mono font-bold ${idx === 0 ? 'text-white' : 'text-muted-foreground'}`}>
                                        ${price.price}
                                      </span>
                                      <Button size="icon" variant={idx === 0 ? "default" : "outline"} className="h-6 w-6 md:h-8 md:w-8 text-xs">
                                        <ExternalLink className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
