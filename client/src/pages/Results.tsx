import { useState, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, Filter, Check, AlertCircle, MapPin, Truck, Info, Store, DollarSign, Clock, ArrowRight, Search, Package, Wrench, Bell, ChevronDown, ChevronUp, Zap, Shield, Tag, Car, TrendingDown, Award, Globe } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AdSenseHorizontal } from "@/components/AdSense";
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
import { VENDORS, VendorInfo, generateVendorSearchUrl, getVendorsForVehicleType, MOCK_RESULTS } from "@/lib/mockData";
import { useAuthGate } from "@/hooks/useAuthGate";

const AFFILIATE_NETWORKS = ["Amazon Associates", "eBay Partner Network", "CJ Affiliate", "ShareASale", "AvantLink", "Impact"];

function isAffiliatePartner(vendor: VendorInfo): boolean {
  return !!vendor.affiliateNetwork && AFFILIATE_NETWORKS.includes(vendor.affiliateNetwork);
}

const SCANNING_MESSAGES = [
  "Connecting to 58 retailers...",
  "Checking AutoZone inventory...",
  "Scanning Amazon Automotive...",
  "Searching RockAuto catalog...",
  "Querying eBay Motors...",
  "Matching vehicle fitment...",
  "Comparing prices...",
  "Building direct links...",
];

function getVendorColor(slug: string): string {
  const colors: Record<string, string> = {
    'autozone': '#FF6600',
    'oreilly': '#00843D',
    'advance': '#CC0000',
    'rockauto': '#336699',
    'amazon': '#FF9900',
    'napa': '#003DA5',
    'vmc': '#CC0000',
    'ebay': '#E53238',
    'westmarine': '#003399',
    'denniskirk': '#003366',
    'rockymountain': '#FF4500',
    'summit': '#FF0000',
    'jegs': '#FFCC00',
  };
  return colors[slug] || '#06b6d4';
}

function trackClick(vendorId: string, searchQuery: string, url: string, context: string) {
  fetch('/api/affiliates/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      partnerId: vendorId,
      productName: searchQuery,
      searchQuery,
      sourceUrl: window.location.href,
      destinationUrl: url,
      clickContext: context,
    }),
  }).catch(() => {});
}

const STORE_TO_VENDOR: Record<string, string> = {
  "AutoZone": "autozone",
  "O'Reilly": "oreilly",
  "Amazon": "amazon",
  "RockAuto": "rockauto",
  "NAPA": "napa",
  "eBay Motors": "ebay",
  "Advance Auto": "advanceauto",
  "West Marine": "westmarine",
  "Dennis Kirk": "denniskirk",
  "Rocky Mountain ATV": "rockymountain",
  "Summit Racing": "summit",
  "VMC Chinese Parts": "vmcchineseparts",
  "Walmart": "amazon",
  "Camping World": "campingworld",
};

function getStoreUrl(storeName: string, partNumber: string, partName: string): string {
  const slug = STORE_TO_VENDOR[storeName];
  const vendor = slug ? VENDORS.find(v => v.id === slug || v.slug === slug) : null;
  if (vendor) {
    return generateVendorSearchUrl(vendor, partNumber || partName, {});
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${partNumber} ${storeName} buy`)}`;
}

interface PartResult {
  id: number;
  name: string;
  partNumber: string;
  fitment: string;
  image: string;
  prices: { store: string; price: number; shipping: string; inStock: boolean; location: string }[];
  rating: number;
  reviews: number;
}

interface VendorWithUrl {
  vendor: VendorInfo;
  searchUrl: string;
  isAffiliate: boolean;
}

function PartComparisonCard({ part, index, requireAuth }: { part: PartResult; index: number; requireAuth: (action: () => void, featureName?: string) => void }) {
  const [expanded, setExpanded] = useState(index === 0);
  const lowestPrice = Math.min(...part.prices.map(p => p.price));
  const highestPrice = Math.max(...part.prices.map(p => p.price));
  const savings = highestPrice - lowestPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass-card border-border hover:border-primary/30 transition-all overflow-hidden" data-testid={`card-part-${part.id}`}>
        <div className="p-4 md:p-5">
          <div className="flex gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-white/5 shrink-0">
              <img src={part.image} alt={part.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-tech font-bold text-sm md:text-base text-white truncate">{part.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/30 text-primary font-mono">
                      {part.partNumber}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{part.fitment}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg md:text-xl font-bold text-primary font-mono">${lowestPrice.toFixed(2)}</div>
                  {savings > 0 && (
                    <div className="text-[10px] text-green-400 flex items-center gap-1 justify-end">
                      <TrendingDown className="w-3 h-3" />
                      Save ${savings.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(part.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">{part.rating} ({part.reviews.toLocaleString()})</span>
                </div>
                <Badge variant="outline" className="text-[9px] h-4 border-green-500/30 text-green-400">
                  {part.prices.length} stores
                </Badge>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors"
            data-testid={`button-expand-part-${part.id}`}
          >
            <span className="font-mono uppercase">Compare {part.prices.length} Prices</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {part.prices
                    .sort((a, b) => a.price - b.price)
                    .map((price, pi) => (
                    <div
                      key={pi}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                        pi === 0
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                      onClick={() => requireAuth(() => {
                        const storeUrl = getStoreUrl(price.store, part.partNumber, part.name);
                        trackClick(price.store, part.name, storeUrl, 'price_comparison');
                        window.open(storeUrl, '_blank', 'noopener,noreferrer');
                      }, "compare prices across retailers")}
                      data-testid={`price-row-${part.id}-${pi}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-tech font-bold text-sm text-white">{price.store}</span>
                          {pi === 0 && (
                            <Badge className="text-[8px] h-4 px-1.5 bg-primary/20 text-primary border-primary/30">
                              BEST PRICE
                            </Badge>
                          )}
                          {price.inStock && (
                            <Badge variant="outline" className="text-[8px] h-4 px-1 border-green-500/30 text-green-400">
                              IN STOCK
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {price.location.includes("mi") ? <MapPin className="w-2.5 h-2.5 text-green-400" /> : <Globe className="w-2.5 h-2.5 text-blue-400" />}
                            {price.location}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Truck className="w-2.5 h-2.5" /> {price.shipping}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold text-base ${pi === 0 ? 'text-primary' : 'text-white'}`}>
                          ${price.price.toFixed(2)}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

function VendorDirectLink({ vendorWithUrl, displayQuery, requireAuth, index }: { vendorWithUrl: VendorWithUrl; displayQuery: string; requireAuth: (action: () => void, featureName?: string) => void; index: number }) {
  const { vendor, searchUrl, isAffiliate } = vendorWithUrl;
  
  const handleClick = () => {
    trackClick(vendor.id, displayQuery, searchUrl, isAffiliate ? 'affiliate_direct' : 'vendor_direct');
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 group ${
          isAffiliate ? 'bg-primary/[0.03] border-primary/15' : 'bg-white/[0.02] border-white/5'
        }`}
        onClick={() => requireAuth(handleClick, "compare prices across retailers")}
        data-testid={`vendor-link-${vendor.slug}`}
      >
        <div
          className="w-2 h-8 rounded-full shrink-0"
          style={{ backgroundColor: vendor.logoColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-tech font-bold text-sm text-white truncate">{vendor.name}</span>
            {isAffiliate && (
              <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-primary/30 text-primary shrink-0">
                PARTNER
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {vendor.hasLocalPickup ? (
              <span className="text-[9px] text-green-400 flex items-center gap-0.5 font-mono">
                <MapPin className="w-2.5 h-2.5" /> LOCAL PICKUP
              </span>
            ) : (
              <span className="text-[9px] text-blue-400 flex items-center gap-0.5 font-mono">
                <Truck className="w-2.5 h-2.5" /> SHIPS
              </span>
            )}
            {vendor.supportsOEM && (
              <span className="text-[8px] text-blue-400/60">OEM</span>
            )}
            {vendor.supportsAftermarket && (
              <span className="text-[8px] text-purple-400/60">Aftermarket</span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-[10px] font-tech uppercase text-primary hover:bg-primary hover:text-black shrink-0 gap-1"
          data-testid={`button-go-${vendor.slug}`}
        >
          Go to Part <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
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

  const { requireAuth } = useAuthGate();
  const [isLoading, setIsLoading] = useState(true);
  const [scanText, setScanText] = useState(SCANNING_MESSAGES[0]);
  const [showLocalOnly, setShowLocalOnly] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [showOEMOnly, setShowOEMOnly] = useState(false);
  const [showAftermarketOnly, setShowAftermarketOnly] = useState(false);
  const [showAllVendors, setShowAllVendors] = useState(false);

  const { data: searchResults } = useQuery({
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
          vehicleType,
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
      if (step < SCANNING_MESSAGES.length) {
        setScanText(SCANNING_MESSAGES[step]);
      }
    }, 250);
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const displayQuery = query || partNumber || 'Parts Search';
  const vehicleLabel = [year, make, model].filter(Boolean).join(' ');

  const matchingParts = useMemo(() => {
    const searchLower = (query || partNumber || '').toLowerCase();
    return MOCK_RESULTS.filter(part => {
      const nameMatch = part.name.toLowerCase().includes(searchLower);
      const pnMatch = part.partNumber.toLowerCase().includes(searchLower);
      const fitmentMatch = part.fitment.toLowerCase().includes(searchLower);
      const categoryMatch = searchLower.split(' ').some(word =>
        part.name.toLowerCase().includes(word) || part.fitment.toLowerCase().includes(word)
      );
      return nameMatch || pnMatch || fitmentMatch || categoryMatch;
    });
  }, [query, partNumber]);

  const vendorsWithUrls = useMemo((): VendorWithUrl[] => {
    let vendors = vehicleType
      ? VENDORS.filter(v => v.categories.includes(vehicleType) || v.categories.includes('cars'))
      : VENDORS;

    if (showLocalOnly) vendors = vendors.filter(v => v.hasLocalPickup);
    if (showOEMOnly) vendors = vendors.filter(v => v.supportsOEM);
    if (showAftermarketOnly) vendors = vendors.filter(v => v.supportsAftermarket);

    return vendors
      .map(vendor => ({
        vendor,
        searchUrl: generateVendorSearchUrl(vendor, query || partNumber || '', { year, make, model, zip: zipCode }),
        isAffiliate: isAffiliatePartner(vendor),
      }))
      .sort((a, b) => {
        if (a.isAffiliate && !b.isAffiliate) return -1;
        if (!a.isAffiliate && b.isAffiliate) return 1;
        if (a.vendor.hasLocalPickup && !b.vendor.hasLocalPickup) return -1;
        if (!a.vendor.hasLocalPickup && b.vendor.hasLocalPickup) return 1;
        return b.vendor.priority - a.vendor.priority;
      });
  }, [vehicleType, query, partNumber, year, make, model, zipCode, showLocalOnly, showOEMOnly, showAftermarketOnly]);

  const affiliateVendors = vendorsWithUrls.filter(v => v.isAffiliate);
  const otherVendors = vendorsWithUrls.filter(v => !v.isAffiliate);
  const displayedOtherVendors = showAllVendors ? otherVendors : otherVendors.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-[85px] lg:pt-[80px] min-h-[calc(100vh-5rem)] w-full pb-16">
        {/* Vehicle Context Bar */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <span className="font-tech text-sm font-bold text-white uppercase">{displayQuery}</span>
              </div>
              {vehicleLabel && (
                <Badge variant="outline" className="font-mono text-[10px] border-green-500/30 text-green-400">
                  <Shield className="w-3 h-3 mr-1" /> {vehicleLabel}
                </Badge>
              )}
              {vehicleType && (
                <Badge variant="outline" className="font-mono text-[10px] border-blue-500/30 text-blue-400">
                  {vehicleType.toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
                <Zap className="w-3 h-3 mr-1" /> {vendorsWithUrls.length} RETAILERS MATCHED
              </Badge>
              <PriceAlertButton partName={displayQuery} partNumber={partNumber || undefined} />
              <ShareButton partName={displayQuery} vendorName="GarageBot" searchUrl={window.location.href} />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="hidden lg:block col-span-3">
              <div className="sticky top-24 space-y-4">
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-mono text-[10px] uppercase text-muted-foreground mb-3">FILTERS</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="localPickup"
                        className="w-4 h-4"
                        checked={showLocalOnly}
                        onCheckedChange={(checked) => setShowLocalOnly(!!checked)}
                        data-testid="checkbox-local-only"
                      />
                      <label htmlFor="localPickup" className="text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-green-400" /> Local Pickup
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
                      <label htmlFor="oemOnly" className="text-xs font-medium flex items-center gap-1">
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
                      <label htmlFor="aftermarketOnly" className="text-xs font-medium flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-purple-400" /> Aftermarket
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <h3 className="font-mono text-[10px] uppercase text-muted-foreground mb-3">YOUR LOCATION</h3>
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
                      onClick={() => navigator.geolocation?.getCurrentPosition(() => {})}
                      data-testid="button-use-location"
                    >
                      <MapPin className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Accordion type="multiple" defaultValue={["alerts"]}>
                  <AccordionItem value="alerts" className="border border-white/10 rounded-lg overflow-hidden glass-ultra">
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
                </Accordion>

                <div className="mt-4">
                  <VehicleFunFacts query={query} make={make} model={model} vehicleType={vehicleType} />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9">
              {isLoading ? (
                <div className="py-16">
                  <div className="max-w-md mx-auto text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
                      <Search className="absolute inset-0 m-auto w-8 h-8 text-primary/50" />
                    </div>
                    <p className="font-mono text-sm text-primary animate-pulse mb-2">{scanText}</p>
                    <p className="text-[10px] text-muted-foreground">Searching {vehicleLabel ? `parts for ${vehicleLabel}` : 'all retailers'}...</p>
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-24 glass-card rounded-lg border border-white/5 animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Part Comparison Cards - the real value */}
                  {matchingParts.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-primary" />
                        <h2 className="font-tech text-lg font-bold uppercase text-white">Price Comparison</h2>
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary ml-auto">
                          {matchingParts.length} parts found
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {matchingParts.map((part, index) => (
                          <PartComparisonCard key={part.id} part={part} index={index} requireAuth={requireAuth} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Affiliate Partner Retailers - revenue generators at top */}
                  {affiliateVendors.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-5 h-5 text-primary" />
                        <h2 className="font-tech text-lg font-bold uppercase text-white">
                          {matchingParts.length > 0 ? 'Search More Partner Retailers' : 'Partner Retailers'}
                        </h2>
                        <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400 ml-auto">
                          <DollarSign className="w-3 h-3 mr-0.5" /> {affiliateVendors.length} partners
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3 -mt-2">
                        Direct links to "{displayQuery}" {vehicleLabel ? `for ${vehicleLabel}` : ''} — sorted by relevance
                      </p>
                      <div className="space-y-2">
                        {affiliateVendors.map((v, i) => (
                          <VendorDirectLink key={v.vendor.id} vendorWithUrl={v} displayQuery={displayQuery} requireAuth={requireAuth} index={i} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Other Retailers */}
                  {otherVendors.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Store className="w-5 h-5 text-muted-foreground" />
                        <h2 className="font-tech text-base font-bold uppercase text-muted-foreground">More Retailers</h2>
                        <Badge variant="outline" className="text-[9px] border-white/20 text-muted-foreground ml-auto">
                          {otherVendors.length} stores
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {displayedOtherVendors.map((v, i) => (
                          <VendorDirectLink key={v.vendor.id} vendorWithUrl={v} displayQuery={displayQuery} requireAuth={requireAuth} index={i} />
                        ))}
                      </div>
                      {otherVendors.length > 6 && (
                        <Button
                          variant="ghost"
                          className="w-full mt-3 text-xs text-muted-foreground hover:text-primary font-mono"
                          onClick={() => setShowAllVendors(!showAllVendors)}
                          data-testid="button-show-all-vendors"
                        >
                          {showAllVendors ? 'Show Less' : `Show All ${otherVendors.length} Retailers`}
                          {showAllVendors ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </Button>
                      )}
                    </section>
                  )}

                  {/* No Results */}
                  {matchingParts.length === 0 && vendorsWithUrls.length === 0 && (
                    <div className="text-center py-20">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-tech text-xl mb-2">No Retailers Found</h3>
                      <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search terms.</p>
                    </div>
                  )}

                  {/* Mobile Filters */}
                  <div className="lg:hidden p-4 rounded bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-mono text-muted-foreground">FILTERS:</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-1.5">
                          <Checkbox
                            id="localPickupMobile"
                            className="w-4 h-4"
                            checked={showLocalOnly}
                            onCheckedChange={(checked) => setShowLocalOnly(!!checked)}
                            data-testid="checkbox-local-only-mobile"
                          />
                          <label htmlFor="localPickupMobile" className="text-[10px]">Local</label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Checkbox
                            id="oemMobile"
                            className="w-4 h-4"
                            checked={showOEMOnly}
                            onCheckedChange={(checked) => setShowOEMOnly(!!checked)}
                            data-testid="checkbox-oem-mobile"
                          />
                          <label htmlFor="oemMobile" className="text-[10px]">OEM</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Fun Facts */}
                  <div className="lg:hidden">
                    <VehicleFunFacts query={query} make={make} model={model} vehicleType={vehicleType} />
                  </div>

                  {/* Info Banner */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-tech text-sm font-bold mb-1">How GarageBot Saves You Money</h4>
                        <p className="text-xs text-muted-foreground">
                          We compare prices across {vendorsWithUrls.length} retailers and link you directly to "{displayQuery}" 
                          {vehicleLabel ? ` for your ${vehicleLabel}` : ''}.
                          Partner retailers are shown first — some purchases earn us a small commission at no extra cost to you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <AdSenseHorizontal className="my-4" />
      </div>
      <Footer />
    </div>
  );
}
