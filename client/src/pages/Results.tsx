import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Star, ExternalLink, Filter, Check, AlertCircle, Grid, List, MapPin, Truck, Info, Store, DollarSign, Clock, ArrowRight, Navigation, Search, Package, Wrench, Bell, ChevronDown } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import VehicleFunFacts from "@/components/VehicleFunFacts";
import { PriceAlertButton, PriceAlertsPanel } from "@/components/PriceAlerts";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { VENDORS, VendorInfo, generateVendorSearchUrl, getVendorsForVehicleType } from "@/lib/mockData";

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

interface EnhancedVendorResult {
  vendor: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    hasLocalPickup: boolean;
    hasAffiliateProgram: boolean;
    supportsOEM?: boolean;
    supportsAftermarket?: boolean;
    storeLocatorUrl?: string;
    logoColor?: string;
  };
  searchUrl: string;
  directUrl: string;
}

function VendorCard({ result, index, displayQuery }: { result: EnhancedVendorResult; index: number; displayQuery: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex-shrink-0 w-[280px]"
    >
      <Card 
        className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden cursor-pointer h-full"
        onClick={() => window.open(result.searchUrl, '_blank', 'noopener,noreferrer')}
        data-testid={`card-vendor-${result.vendor.slug}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-tech font-bold text-base truncate ${getVendorColor(result.vendor.slug)}`}>
                {result.vendor.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {result.vendor.hasLocalPickup ? (
                  <span className="text-[9px] text-green-400 flex items-center gap-1 font-mono">
                    <MapPin className="w-2.5 h-2.5" /> LOCAL
                  </span>
                ) : (
                  <span className="text-[9px] text-blue-400 flex items-center gap-1 font-mono">
                    <Truck className="w-2.5 h-2.5" /> SHIPS
                  </span>
                )}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {result.vendor.supportsOEM && (
              <Badge variant="secondary" className="text-[8px] h-4 px-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
                OEM
              </Badge>
            )}
            {result.vendor.supportsAftermarket && (
              <Badge variant="secondary" className="text-[8px] h-4 px-1 bg-purple-500/10 text-purple-400 border-purple-500/20">
                Aftermarket
              </Badge>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full font-tech uppercase text-xs border-primary/30 text-primary hover:bg-primary hover:text-black"
            onClick={(e) => {
              e.stopPropagation();
              window.open(result.searchUrl, '_blank', 'noopener,noreferrer');
            }}
            data-testid={`button-search-${result.vendor.slug}`}
          >
            <Search className="w-3 h-3 mr-1" /> Check Price
          </Button>
        </div>
      </Card>
    </motion.div>
  );
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
  const [zipCode, setZipCode] = useState('');
  const [showOEMOnly, setShowOEMOnly] = useState(false);
  const [showAftermarketOnly, setShowAftermarketOnly] = useState(false);

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
  
  // Get backend vendor results
  const backendResults = searchResults?.vendorResults || [];
  
  // Get local vendor metadata to enrich results
  const localVendorMap = new Map(VENDORS.map(v => [v.id, v]));
  
  // Combine backend results with local vendor metadata, or use local vendors as fallback
  const enhancedVendorResults = backendResults.length > 0
    ? backendResults.map(result => {
        const localVendor = localVendorMap.get(result.vendor.id) || VENDORS.find(v => v.slug === result.vendor.slug);
        
        // Preserve backend URL by default - it may contain deep links or product-specific paths
        let finalSearchUrl = result.searchUrl;
        
        // Only consider adding ZIP if: we have a ZIP, local vendor has a ZIP template
        if (zipCode && localVendor?.searchTemplate?.includes('{zip}')) {
          // Generate the baseline template URL (without ZIP)
          const templateBaselineUrl = generateVendorSearchUrl(localVendor, query || partNumber || '', { year, make, model });
          
          // Only augment with ZIP if the backend URL matches our template baseline
          // (meaning it's not a custom deep link or product-specific URL)
          if (result.searchUrl === templateBaselineUrl) {
            finalSearchUrl = generateVendorSearchUrl(localVendor, query || partNumber || '', { year, make, model, zip: zipCode });
          }
          // Otherwise, backend has a custom/deep link - preserve it
        }
        
        return {
          vendor: {
            id: result.vendor.id,
            name: result.vendor.name,
            slug: result.vendor.slug,
            logoUrl: result.vendor.logoUrl,
            // Merge: use backend value if defined, otherwise fall back to local vendor data
            hasLocalPickup: result.vendor.hasLocalPickup ?? localVendor?.hasLocalPickup ?? false,
            hasAffiliateProgram: result.vendor.hasAffiliateProgram ?? (localVendor ? !!localVendor.affiliateNetwork : false),
            // Preserve backend OEM/aftermarket flags if provided, otherwise use local data (default false if unknown)
            supportsOEM: (result.vendor as any).supportsOEM ?? localVendor?.supportsOEM ?? false,
            supportsAftermarket: (result.vendor as any).supportsAftermarket ?? localVendor?.supportsAftermarket ?? false,
            storeLocatorUrl: localVendor?.storeLocatorUrl,
            logoColor: localVendor?.logoColor || '#06b6d4',
          },
          searchUrl: finalSearchUrl,
          directUrl: result.directUrl,
        };
      })
    : VENDORS
        .filter(v => !vehicleType || v.categories.includes(vehicleType) || v.categories.includes('cars'))
        .sort((a, b) => b.priority - a.priority)
        .map(vendor => ({
          vendor: {
            id: vendor.id,
            name: vendor.name,
            slug: vendor.slug,
            logoUrl: null,
            hasLocalPickup: vendor.hasLocalPickup,
            hasAffiliateProgram: !!vendor.affiliateNetwork,
            supportsOEM: vendor.supportsOEM,
            supportsAftermarket: vendor.supportsAftermarket,
            storeLocatorUrl: vendor.storeLocatorUrl,
            logoColor: vendor.logoColor,
          },
          searchUrl: generateVendorSearchUrl(vendor, query || partNumber || '', { year, make, model, zip: zipCode }),
          directUrl: generateVendorSearchUrl(vendor, query || partNumber || '', { year, make, model, zip: zipCode }),
        }));

  // Apply filters
  let filteredResults = enhancedVendorResults;
  
  if (showLocalOnly) {
    filteredResults = filteredResults.filter(r => r.vendor.hasLocalPickup);
  }
  if (showOEMOnly) {
    filteredResults = filteredResults.filter(r => r.vendor.supportsOEM);
  }
  if (showAftermarketOnly) {
    filteredResults = filteredResults.filter(r => r.vendor.supportsAftermarket);
  }

  // Sort: local pickup first, then by priority
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (a.vendor.hasLocalPickup && !b.vendor.hasLocalPickup) return -1;
    if (!a.vendor.hasLocalPickup && b.vendor.hasLocalPickup) return 1;
    return 0;
  });
  
  // Generate Google Maps direction URL for a store's location finder
  const getDirectionsUrl = (storeLocatorUrl?: string) => {
    if (!storeLocatorUrl) return null;
    return storeLocatorUrl;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-12 min-h-[calc(100vh-5rem)] w-full px-2 pb-16">
        <div className="grid grid-cols-12 gap-0">
          
          {/* Left Column: Filters (Compact Sidebar) */}
          <div className="hidden lg:block col-span-3 border-r border-white/5 pr-6">
            <div className="mb-8">
              <h2 className="font-tech font-bold text-2xl uppercase mb-1 text-primary">Search Retailers</h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                {sortedResults.length} RETAILERS // AGGREGATOR ACTIVE
              </p>
            </div>

            <div className="p-4 rounded bg-white/5 border border-white/5 mb-4">
              <h3 className="font-mono text-xs uppercase text-muted-foreground mb-2">Search Query</h3>
              <p className="text-sm font-tech text-primary truncate">{displayQuery}</p>
              {(year || make || model) && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {[year, make, model].filter(Boolean).join(' ')}
                </p>
              )}
            </div>

            <Accordion type="multiple" defaultValue={["filters", "location"]} className="space-y-2">
              <AccordionItem value="location" className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="font-tech uppercase text-xs">Location</span>
                    {zipCode && <Badge variant="outline" className="text-[9px] h-4 px-1 border-green-500/30 text-green-400">{zipCode}</Badge>}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className="h-8 text-xs bg-black/20 border-white/10"
                      data-testid="input-zipcode"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-2 text-xs border-primary/30"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(() => {});
                        }
                      }}
                      data-testid="button-use-location"
                    >
                      <MapPin className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">Enter ZIP for local stores</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filters" className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="font-tech uppercase text-xs">Filters</span>
                    {(showLocalOnly || showOEMOnly || showAftermarketOnly) && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/30 text-primary">
                        {[showLocalOnly, showOEMOnly, showAftermarketOnly].filter(Boolean).length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-2">
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
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="oemOnly" 
                      className="w-4 h-4"
                      checked={showOEMOnly}
                      onCheckedChange={(checked) => setShowOEMOnly(!!checked)}
                      data-testid="checkbox-oem-only"
                    />
                    <label htmlFor="oemOnly" className="text-xs font-medium leading-none flex items-center gap-1">
                      <Package className="w-3 h-3 text-blue-400" /> OEM Parts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="aftermarketOnly" 
                      className="w-4 h-4"
                      checked={showAftermarketOnly}
                      onCheckedChange={(checked) => setShowAftermarketOnly(!!checked)}
                      data-testid="checkbox-aftermarket-only"
                    />
                    <label htmlFor="aftermarketOnly" className="text-xs font-medium leading-none flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-purple-400" /> Aftermarket
                    </label>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="retailers" className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span className="font-tech uppercase text-xs">Retailer Types</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-white/20">{enhancedVendorResults.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-green-400" /> With Local Stores
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {enhancedVendorResults.filter(v => v.vendor.hasLocalPickup).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-400" /> Online Only
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {enhancedVendorResults.filter(v => !v.vendor.hasLocalPickup).length}
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="alerts" className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="font-tech uppercase text-xs">Price Alerts</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/30 text-primary">PRO</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <PriceAlertsPanel />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="howit" className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="font-tech uppercase text-xs">How It Works</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <ul className="space-y-1 text-[10px] text-muted-foreground">
                    <li>1. Click any retailer to search their site</li>
                    <li>2. Compare prices across all vendors</li>
                    <li>3. Local pickup prioritized for speed</li>
                    <li>4. We earn commissions on some purchases</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-4">
              <VehicleFunFacts 
                query={query} 
                make={make} 
                model={model} 
                vehicleType={vehicleType} 
              />
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
                <PriceAlertButton 
                  partName={displayQuery} 
                  partNumber={partNumber || undefined}
                />
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-[9px] text-muted-foreground font-mono mr-1 hidden sm:inline">VIEW:</span>
                <Button 
                  size="sm" 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  className={`h-7 px-2 text-[10px] gap-1 ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('grid')}
                  data-testid="button-view-grid"
                >
                  <Grid className="w-3 h-3" />
                  <span className="hidden sm:inline">Carousel</span>
                </Button>
                <Button 
                  size="sm" 
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  className={`h-7 px-2 text-[10px] gap-1 ${viewMode === 'list' ? 'bg-primary text-black' : 'text-muted-foreground'}`}
                  onClick={() => setViewMode('list')}
                  data-testid="button-view-list"
                >
                  <List className="w-3 h-3" />
                  <span className="hidden sm:inline">List</span>
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
                <p className="text-muted-foreground text-sm mb-4">This part may not be available through our current search network.</p>
                <p className="text-[10px] text-muted-foreground/70">Try removing filters or searching for a different part name.</p>
              </div>
            ) : (
              <>
              {/* Limited Results Disclaimer */}
              {sortedResults.length <= 3 && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-yellow-400 font-medium">Limited Options Available</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {sortedResults.length === 1 
                          ? "This is the only retailer available for this search through our network."
                          : `Only ${sortedResults.length} retailers found. This part may have limited availability.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {viewMode === 'grid' ? (
                /* Horizontal Carousel View - Always horizontal scroll */
                <div className="space-y-6">
                  {/* Single horizontal carousel with all results */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Store className="w-4 h-4 text-primary" />
                      <h3 className="font-tech text-sm uppercase text-primary">Compare Retailers</h3>
                      <Badge variant="outline" className="text-[9px] border-primary/30 text-primary ml-auto">
                        {sortedResults.length} stores
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">← Swipe →</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
                      {sortedResults.map((result, index) => (
                        <VendorCard key={result.vendor.id} result={result} index={index} displayQuery={displayQuery} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* List View - Compact two-column grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sortedResults.map((result, index) => (
                    <motion.div
                      key={result.vendor.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card 
                        className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer"
                        onClick={() => window.open(result.searchUrl, '_blank', 'noopener,noreferrer')}
                        data-testid={`list-vendor-${result.vendor.slug}`}
                      >
                        <div className="p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-tech font-bold text-xs truncate ${getVendorColor(result.vendor.slug)}`}>
                              {result.vendor.name}
                            </h3>
                            <span className={`text-[8px] ${result.vendor.hasLocalPickup ? 'text-green-400' : 'text-blue-400'}`}>
                              {result.vendor.hasLocalPickup ? '● Local' : '○ Ships'}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              </>
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
      <Footer />
    </div>
  );
}
