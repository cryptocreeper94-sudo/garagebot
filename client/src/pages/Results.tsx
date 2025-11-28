import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Star, ExternalLink, Filter, Check, AlertCircle, Grid, List, MapPin, Truck, Info, Store, DollarSign, Clock, ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import VehicleFunFacts from "@/components/VehicleFunFacts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string;
  hasAffiliateProgram: boolean;
  hasLocalPickup: boolean;
  priority: number;
}

interface VendorResult {
  vendor: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    hasLocalPickup: boolean;
    hasAffiliateProgram: boolean;
  };
  searchUrl: string;
  directUrl: string;
}

interface SearchResponse {
  query: string;
  vehicle: { year?: number; make?: string; model?: string };
  category?: string;
  vendorResults: VendorResult[];
  resultsCount: number;
}

const SCANNING_STORES = [
  "AutoZone Database...",
  "O'Reilly Inventory...",
  "RockAuto Catalog...",
  "Amazon Automotive...",
  "NAPA Parts...",
  "eBay Motors..."
];

function getVendorColor(slug: string): string {
  const colors: Record<string, string> = {
    'autozone': 'text-orange-500',
    'oreilly': 'text-green-500',
    'advance-auto': 'text-red-500',
    'rockauto': 'text-yellow-500',
    'amazon': 'text-amber-400',
    'napa': 'text-blue-500',
    'vmc': 'text-purple-500',
    'ebay': 'text-blue-400',
    'west-marine': 'text-cyan-500',
    'dennis-kirk': 'text-orange-400',
    'rocky-mountain': 'text-lime-500',
  };
  return colors[slug] || 'text-primary';
}

export default function Results() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get('q') || params.get('query') || '';
  const partNumber = params.get('pn') || params.get('partNumber') || '';
  const year = params.get('year') || '';
  const make = params.get('make') || '';
  const model = params.get('model') || '';
  const category = params.get('category') || '';
  const vehicleType = params.get('type') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [scanText, setScanText] = useState(SCANNING_STORES[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showLocalOnly, setShowLocalOnly] = useState(false);

  // Fetch vendors
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');
      return res.json();
    },
  });

  // Perform search
  const { data: searchResults } = useQuery<SearchResponse>({
    queryKey: ['search', query, partNumber, year, make, model, category],
    queryFn: async () => {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query || partNumber,
          partNumber,
          year: year ? parseInt(year) : undefined,
          make,
          model,
          category,
        }),
      });
      if (!res.ok) throw new Error('Failed to search');
      return res.json();
    },
    enabled: !!(query || partNumber),
  });

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SCANNING_STORES.length) {
        setScanText(SCANNING_STORES[step]);
      }
    }, 300);

    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const displayQuery = query || partNumber || 'Parts Search';
  const vendorResults = searchResults?.vendorResults || [];
  const filteredResults = showLocalOnly 
    ? vendorResults.filter(r => r.vendor.hasLocalPickup)
    : vendorResults;

  // Sort: local pickup first, then by affiliate status
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (a.vendor.hasLocalPickup && !b.vendor.hasLocalPickup) return -1;
    if (!a.vendor.hasLocalPickup && b.vendor.hasLocalPickup) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-20 min-h-[calc(100vh-5rem)] container mx-auto px-4 pb-20">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Filters (Compact Sidebar) */}
          <div className="hidden lg:block col-span-3 border-r border-white/5 pr-6">
            <div className="mb-8">
              <h2 className="font-tech font-bold text-2xl uppercase mb-1 text-primary">Search Retailers</h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                {sortedResults.length} RETAILERS // AGGREGATOR ACTIVE
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded bg-white/5 border border-white/5">
                <h3 className="font-mono text-xs uppercase text-muted-foreground mb-3">Search Query</h3>
                <p className="text-sm font-tech text-primary truncate">{displayQuery}</p>
                {(year || make || model) && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {[year, make, model].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase text-muted-foreground">Filters</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="localPickup" 
                      className="w-4 h-4"
                      checked={showLocalOnly}
                      onCheckedChange={(checked) => setShowLocalOnly(!!checked)}
                      data-testid="checkbox-local-only"
                    />
                    <label htmlFor="localPickup" className="text-xs font-medium leading-none flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-green-400" /> Local Pickup Only
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase text-muted-foreground">Retailer Types</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-green-400" /> With Local Stores
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {vendorResults.filter(v => v.vendor.hasLocalPickup).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-400" /> Online Only
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {vendorResults.filter(v => !v.vendor.hasLocalPickup).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded bg-primary/5 border border-primary/20">
                <h3 className="font-mono text-xs uppercase text-primary mb-2">How It Works</h3>
                <ul className="space-y-1 text-[10px] text-muted-foreground">
                  <li>1. Click any retailer to search their site</li>
                  <li>2. Compare prices across all vendors</li>
                  <li>3. Local pickup prioritized for speed</li>
                  <li>4. We earn commissions on some purchases</li>
                </ul>
              </div>

              {/* Fun Facts Section */}
              <div className="mt-6">
                <VehicleFunFacts 
                  query={query} 
                  make={make} 
                  model={model} 
                  vehicleType={vehicleType} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="col-span-12 lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary" data-testid="badge-search-query">
                  <Check className="w-3 h-3 mr-1" /> {displayQuery.toUpperCase()}
                </Badge>
                {(year || make || model) && (
                  <Badge variant="outline" className="font-mono text-[10px] border-green-500/30 text-green-400">
                    {[year, make, model].filter(Boolean).join(' ')}
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-[10px] border-yellow-500/30 text-yellow-400">
                  <Info className="w-3 h-3 mr-1" /> {sortedResults.length} RETAILERS
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`w-8 h-8 ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('grid')}
                  data-testid="button-view-grid"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`w-8 h-8 ${viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('list')}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-mono text-sm text-primary animate-pulse">{scanText}</p>
                </div>
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-32 bg-card/30 rounded border border-white/5 animate-pulse" />
                  ))}
                </div>
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-tech text-xl mb-2">No Retailers Found</h3>
                <p className="text-muted-foreground text-sm">Try searching for a specific part number or name</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
                {sortedResults.map((result, index) => (
                  <motion.div
                    key={result.vendor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden cursor-pointer"
                      onClick={() => window.open(result.searchUrl, '_blank', 'noopener,noreferrer')}
                      data-testid={`card-vendor-${result.vendor.slug}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-tech font-bold text-lg truncate ${getVendorColor(result.vendor.slug)}`}>
                              {result.vendor.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {result.vendor.hasLocalPickup ? (
                                <span className="text-[10px] text-green-400 flex items-center gap-1 font-mono">
                                  <MapPin className="w-3 h-3" /> LOCAL PICKUP
                                </span>
                              ) : (
                                <span className="text-[10px] text-blue-400 flex items-center gap-1 font-mono">
                                  <Truck className="w-3 h-3" /> SHIPS TO YOU
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {result.vendor.hasLocalPickup && (
                            <Badge variant="secondary" className="text-[9px] h-5 px-1.5 bg-green-500/10 text-green-400 border-green-500/20">
                              <Store className="w-2.5 h-2.5 mr-1" /> In-Store
                            </Badge>
                          )}
                          {result.vendor.hasAffiliateProgram && (
                            <Badge variant="secondary" className="text-[9px] h-5 px-1.5 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                              <DollarSign className="w-2.5 h-2.5 mr-1" /> Partner
                            </Badge>
                          )}
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full font-tech uppercase text-xs border-primary/30 text-primary hover:bg-primary hover:text-black group-hover:border-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(result.searchUrl, '_blank', 'noopener,noreferrer');
                          }}
                          data-testid={`button-search-${result.vendor.slug}`}
                        >
                          Search {result.vendor.name} <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mobile Filters */}
            <div className="lg:hidden mt-6 p-4 rounded bg-white/5 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">FILTER:</span>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="localPickupMobile" 
                    className="w-4 h-4"
                    checked={showLocalOnly}
                    onCheckedChange={(checked) => setShowLocalOnly(!!checked)}
                    data-testid="checkbox-local-only-mobile"
                  />
                  <label htmlFor="localPickupMobile" className="text-xs font-medium leading-none flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-400" /> Local Only
                  </label>
                </div>
              </div>
            </div>

            {/* Mobile Fun Facts */}
            <div className="lg:hidden mt-6">
              <VehicleFunFacts 
                query={query} 
                make={make} 
                model={model} 
                vehicleType={vehicleType} 
              />
            </div>

            {/* Info Banner */}
            <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-tech text-sm font-bold mb-1">How GarageBot Works</h4>
                  <p className="text-xs text-muted-foreground">
                    We search across major auto parts retailers to help you find the best prices. 
                    Click any retailer card to search their inventory for "{displayQuery}". 
                    Some purchases may earn us a small commission at no extra cost to you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
