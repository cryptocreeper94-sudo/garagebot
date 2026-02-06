import { useState, useEffect, useMemo } from "react";
import { useSearch, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, AlertCircle, MapPin, Truck, Info, Store, DollarSign, Search, Package, Wrench, Bell, ChevronDown, ChevronUp, Zap, Shield, Tag, Car, Award, Globe, ArrowRight, Star, TrendingDown, ShoppingCart, Loader2, BarChart3 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AdSenseHorizontal } from "@/components/AdSense";
import VehicleFunFacts from "@/components/VehicleFunFacts";
import { PriceAlertButton, PriceAlertsPanel } from "@/components/PriceAlerts";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { VENDORS, VendorInfo, generateVendorSearchUrl, CATEGORIES } from "@/lib/mockData";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAuth } from "@/hooks/useAuth";

const AFFILIATE_NETWORKS = ["Amazon Associates", "eBay Partner Network", "CJ Affiliate", "ShareASale", "AvantLink", "Impact", "Rexing Affiliate", "GoAffPro"];

interface PriceProduct {
  id: string;
  name: string;
  price: number | null;
  originalPrice?: number | null;
  imageUrl?: string;
  productUrl: string;
  retailer: string;
  retailerSlug: string;
  retailerColor: string;
  inStock?: boolean;
  shipping?: string;
  rating?: number;
  reviewCount?: number;
  partNumber?: string;
  isAffiliate: boolean;
  affiliateUrl: string;
}

interface PriceComparisonData {
  query: string;
  vehicle?: { year?: string; make?: string; model?: string };
  products: PriceProduct[];
  retailerLinks: { name: string; slug: string; searchUrl: string; color: string; isAffiliate: boolean }[];
  timestamp: number;
}

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

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  cars: "Cars & Trucks",
  trucks: "Trucks",
  motorcycles: "Motorcycles",
  atvs: "ATVs",
  utvs: "UTVs",
  rvs: "RVs & Motorhomes",
  boats: "Boats & Marine",
  jetskis: "Jet Skis & PWC",
  snowmobiles: "Snowmobiles",
  golfcarts: "Golf Carts",
  gokarts: "Go-Karts",
  smallengines: "Small Engines",
  aviation: "Aviation",
  tractors: "Tractors & Farm",
  heavyequipment: "Heavy Equipment",
  classics: "Classic & Hot Rod",
  exotics: "Exotics",
  kitcars: "Kit & Custom",
  powersports: "Powersports",
  rv: "RV & Trailer",
  diesel: "Diesel & Commercial",
  heavyequip: "Heavy Equipment",
  generators: "Generators",
  rc: "RC & Hobby",
  drones: "Drones & FPV",
  modelaircraft: "Model Aircraft",
  slotcars: "Slot Cars",
};

const VEHICLE_TYPE_SEARCHES: Record<string, { label: string; query: string }[]> = {
  cars: [
    { label: "Brake Pads", query: "brake pads" },
    { label: "Oil Filters", query: "oil filter" },
    { label: "Air Filters", query: "air filter" },
    { label: "Spark Plugs", query: "spark plugs" },
    { label: "Headlights", query: "headlight bulb" },
    { label: "Wiper Blades", query: "wiper blade" },
    { label: "Car Battery", query: "car battery" },
    { label: "Serpentine Belt", query: "serpentine belt" },
  ],
  trucks: [
    { label: "Brake Pads", query: "truck brake pads" },
    { label: "Air Filters", query: "truck air filter" },
    { label: "LED Headlights", query: "LED headlight bulb" },
    { label: "Tonneau Cover", query: "tonneau cover" },
    { label: "Lift Kit", query: "lift kit" },
    { label: "Towing Hitch", query: "towing hitch" },
    { label: "Truck Battery", query: "truck battery" },
    { label: "Running Boards", query: "running boards" },
  ],
  motorcycles: [
    { label: "Chain & Sprocket", query: "motorcycle chain sprocket kit" },
    { label: "Brake Pads", query: "motorcycle brake pads" },
    { label: "Oil Filter", query: "motorcycle oil filter" },
    { label: "Air Filter", query: "motorcycle air filter" },
    { label: "Tires", query: "motorcycle tires" },
    { label: "Handlebars", query: "motorcycle handlebars" },
    { label: "Battery", query: "motorcycle battery" },
    { label: "Exhaust", query: "motorcycle exhaust" },
  ],
  atvs: [
    { label: "ATV Tires", query: "ATV tires" },
    { label: "Carburetor", query: "ATV carburetor" },
    { label: "Winch", query: "ATV winch" },
    { label: "CVT Belt", query: "ATV drive belt" },
    { label: "Brake Pads", query: "ATV brake pads" },
    { label: "Air Filter", query: "ATV air filter" },
    { label: "Spark Plug", query: "ATV spark plug" },
    { label: "Bumper", query: "ATV front bumper" },
  ],
  utvs: [
    { label: "UTV Windshield", query: "UTV windshield" },
    { label: "Drive Belt", query: "UTV CVT belt" },
    { label: "UTV Tires", query: "UTV tires" },
    { label: "Roof & Doors", query: "UTV roof doors" },
    { label: "Winch", query: "UTV winch" },
    { label: "Axle", query: "UTV axle" },
    { label: "Light Bar", query: "UTV LED light bar" },
    { label: "Bumper", query: "UTV bumper" },
  ],
  boats: [
    { label: "Propeller", query: "boat propeller" },
    { label: "Gear Lube", query: "marine gear lube" },
    { label: "Fuel Filter", query: "marine fuel filter" },
    { label: "Impeller", query: "outboard impeller" },
    { label: "Spark Plugs", query: "marine spark plug" },
    { label: "Boat Battery", query: "marine battery" },
    { label: "Trim Tab", query: "boat trim tabs" },
    { label: "Anchor", query: "boat anchor" },
  ],
  jetskis: [
    { label: "Wear Ring", query: "jet ski wear ring" },
    { label: "Impeller", query: "jet ski impeller" },
    { label: "Spark Plug", query: "jet ski spark plug" },
    { label: "Battery", query: "jet ski battery" },
    { label: "Oil", query: "jet ski 2-stroke oil" },
    { label: "Fuel Filter", query: "jet ski fuel filter" },
    { label: "Cover", query: "jet ski cover" },
    { label: "Seat", query: "jet ski seat" },
  ],
  snowmobiles: [
    { label: "Drive Belt", query: "snowmobile drive belt" },
    { label: "Ski Runners", query: "snowmobile ski carbide" },
    { label: "Track", query: "snowmobile track" },
    { label: "Spark Plug", query: "snowmobile spark plug" },
    { label: "Windshield", query: "snowmobile windshield" },
    { label: "Slides", query: "snowmobile hyfax slides" },
    { label: "Cover", query: "snowmobile cover" },
    { label: "Battery", query: "snowmobile battery" },
  ],
  golfcarts: [
    { label: "Battery Pack", query: "golf cart batteries" },
    { label: "Tires & Wheels", query: "golf cart tires wheels" },
    { label: "Charger", query: "golf cart battery charger" },
    { label: "Controller", query: "golf cart speed controller" },
    { label: "Seat Cover", query: "golf cart seat cover" },
    { label: "Enclosure", query: "golf cart enclosure" },
    { label: "Lift Kit", query: "golf cart lift kit" },
    { label: "Lights", query: "golf cart LED lights" },
  ],
  gokarts: [
    { label: "Carburetor", query: "go kart carburetor" },
    { label: "Clutch", query: "go kart clutch" },
    { label: "Tires", query: "go kart tires" },
    { label: "Chain", query: "go kart chain" },
    { label: "Throttle Cable", query: "go kart throttle cable" },
    { label: "Brake Pads", query: "go kart brake pads" },
    { label: "Spark Plug", query: "go kart spark plug" },
    { label: "Drive Belt", query: "go kart belt" },
  ],
  smallengines: [
    { label: "Spark Plug", query: "small engine spark plug" },
    { label: "Air Filter", query: "lawn mower air filter" },
    { label: "Carburetor", query: "small engine carburetor" },
    { label: "Pull Cord", query: "recoil starter rope" },
    { label: "Mower Blade", query: "lawn mower blade" },
    { label: "Oil", query: "small engine oil SAE 30" },
    { label: "Fuel Line", query: "small engine fuel line" },
    { label: "Chainsaw Chain", query: "chainsaw chain" },
  ],
  tractors: [
    { label: "Oil Filter", query: "tractor oil filter" },
    { label: "Air Filter", query: "tractor air filter" },
    { label: "Hydraulic Fluid", query: "tractor hydraulic fluid" },
    { label: "Battery", query: "tractor battery" },
    { label: "PTO Shaft", query: "PTO shaft" },
    { label: "3-Point Parts", query: "3 point hitch parts" },
    { label: "Tires", query: "tractor tires" },
    { label: "Seat", query: "tractor seat" },
  ],
  heavyequipment: [
    { label: "Hydraulic Hose", query: "hydraulic hose" },
    { label: "Bucket Teeth", query: "excavator bucket teeth" },
    { label: "Filters", query: "heavy equipment filter kit" },
    { label: "Track Pads", query: "excavator track pads" },
    { label: "Cylinders", query: "hydraulic cylinder" },
    { label: "Battery", query: "heavy equipment battery" },
    { label: "Pins & Bushings", query: "excavator pins bushings" },
    { label: "Cutting Edge", query: "loader cutting edge" },
  ],
  aviation: [
    { label: "Oil", query: "aviation oil" },
    { label: "Spark Plugs", query: "aircraft spark plug" },
    { label: "Tires", query: "aircraft tire" },
    { label: "Battery", query: "aircraft battery" },
    { label: "Air Filter", query: "aircraft air filter" },
    { label: "Fuel Filter", query: "aircraft fuel filter" },
    { label: "Brake Pads", query: "aircraft brake lining" },
    { label: "Pitot Cover", query: "pitot tube cover" },
  ],
  rvs: [
    { label: "Water Pump", query: "RV water pump" },
    { label: "Awning", query: "RV awning" },
    { label: "Holding Tank", query: "RV holding tank chemicals" },
    { label: "Battery", query: "RV deep cycle battery" },
    { label: "Fridge Parts", query: "RV refrigerator parts" },
    { label: "LED Lights", query: "RV LED lights" },
    { label: "Tires", query: "RV tires" },
    { label: "Sewer Hose", query: "RV sewer hose" },
  ],
};

const VEHICLE_TYPE_IMAGES: Record<string, string> = {
  cars: "/generated_images/cars_and_trucks.png",
  trucks: "/generated_images/pickup_truck.png",
  motorcycles: "/generated_images/motorcycle.png",
  atvs: "/generated_images/atv_and_utv.png",
  utvs: "/generated_images/atv_and_utv.png",
  boats: "/generated_images/boat_marine.png",
  jetskis: "/generated_images/jet_ski_watercraft.png",
  snowmobiles: "/generated_images/snowmobile_snow.png",
  golfcarts: "/generated_images/golf_cart.png",
  gokarts: "/generated_images/go_kart_racing.png",
  smallengines: "/generated_images/small_engines_equipment.png",
  aviation: "/generated_images/aviation_aircraft.png",
  tractors: "/generated_images/tractor_farm.png",
  heavyequipment: "/generated_images/heavy_equipment.png",
  rvs: "/generated_images/rv_trailer.png",
  classics: "/generated_images/classic_hot_rod.png",
  exotics: "/generated_images/exotic_supercar.png",
  diesel: "/generated_images/diesel_commercial_truck.png",
  powersports: "/generated_images/atv_and_utv.png",
  generators: "/generated_images/generator_power.png",
  rc: "/generated_images/rc_hobby_vehicles.png",
  drones: "/generated_images/drones_fpv.png",
};

interface VendorWithUrl {
  vendor: VendorInfo;
  searchUrl: string;
  isAffiliate: boolean;
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
          Search Store <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

function ProductCard({ product, index, requireAuth, searchQuery }: { product: PriceProduct; index: number; requireAuth: (action: () => void, featureName?: string) => void; searchQuery: string }) {
  const hasPrice = product.price !== null && product.price > 0;
  const hasSale = product.originalPrice && product.price && product.originalPrice > product.price;
  const savings = hasSale ? Math.round(((product.originalPrice! - product.price!) / product.originalPrice!) * 100) : 0;

  const handleClick = () => {
    trackClick(product.retailerSlug, searchQuery, product.affiliateUrl, product.isAffiliate ? 'affiliate_product' : 'product_direct');
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div
        className={`relative rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 ${
          hasPrice ? 'bg-white/[0.03] border-white/10 hover:border-primary/40' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
        }`}
        onClick={() => requireAuth(handleClick, "compare prices")}
        data-testid={`product-card-${product.id}`}
        data-href={product.affiliateUrl || product.productUrl}
      >
        {index === 0 && hasPrice && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-primary to-green-500" />
        )}

        {hasSale && savings > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 border-0">
              {savings}% OFF
            </Badge>
          </div>
        )}

        <div className="p-3 sm:p-4">
          <div className="flex gap-3">
            {product.imageUrl && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: product.retailerColor }} />
                <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: product.retailerColor }}>
                  {product.retailer}
                </span>
                {product.isAffiliate && (
                  <Badge variant="outline" className="text-[7px] h-3 px-1 border-primary/30 text-primary">
                    PARTNER
                  </Badge>
                )}
                {product.price !== null && product.price > 0 && (
                  <span className="flex items-center gap-0.5 text-[7px] font-mono text-green-400 uppercase">
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-medium text-white line-clamp-2 leading-snug mb-2 group-hover:text-primary/90 transition-colors">
                {product.name}
              </h4>

              <div className="flex items-end justify-between gap-2">
                <div>
                  {hasPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-bold text-green-400 font-mono" data-testid={`price-${product.id}`}>
                        ${product.price!.toFixed(2)}
                      </span>
                      {hasSale && (
                        <span className="text-xs text-muted-foreground line-through font-mono">
                          ${product.originalPrice!.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground font-mono">Check Price</span>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    {product.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-yellow-400 font-mono">{product.rating.toFixed(1)}</span>
                        {product.reviewCount && (
                          <span className="text-[9px] text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
                        )}
                      </div>
                    )}
                    {product.shipping && (
                      <span className="text-[9px] text-blue-400 font-mono">{product.shipping}</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[9px] font-tech uppercase text-primary hover:bg-primary hover:text-black shrink-0 gap-1"
                  data-testid={`button-buy-${product.id}`}
                >
                  View <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {product.partNumber && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <span className="text-[9px] text-muted-foreground font-mono">Part# {product.partNumber}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PriceComparisonSection({ data, isLoading, searchQuery, requireAuth }: {
  data?: PriceComparisonData;
  isLoading: boolean;
  searchQuery: string;
  requireAuth: (action: () => void, featureName?: string) => void;
}) {
  const [showAllProducts, setShowAllProducts] = useState(false);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h2 className="font-tech text-lg font-bold uppercase text-white">Comparing Prices...</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const productsWithPrices = data.products.filter(p => p.price !== null && p.price > 0);
  const searchOnlyLinks = data.products.filter(p => p.price === null || p.price === 0);
  const displayProducts = showAllProducts ? productsWithPrices : productsWithPrices.slice(0, 8);

  const lowestPrice = productsWithPrices.length > 0 ? productsWithPrices[0].price : null;
  const highestPrice = productsWithPrices.length > 1 ? productsWithPrices[productsWithPrices.length - 1].price : null;
  const potentialSavings = lowestPrice && highestPrice && highestPrice > lowestPrice
    ? (highestPrice - lowestPrice).toFixed(2) : null;

  const retailersChecked = new Set(data.products.map(p => p.retailer)).size;

  return (
    <div className="mb-6 space-y-4">
      {productsWithPrices.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-tech text-lg font-bold uppercase text-white" data-testid="text-price-comparison">
                Price Comparison
              </h2>
              <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">
                {productsWithPrices.length} prices found
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary font-mono">
                {retailersChecked} stores checked
              </Badge>
              {potentialSavings && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] font-mono">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> Save up to ${potentialSavings}
                </Badge>
              )}
            </div>
          </div>

          {lowestPrice && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-tech">BEST PRICE FOUND:</span>
                <span className="text-lg font-bold text-green-400 font-mono">${lowestPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">at {productsWithPrices[0].retailer}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="price-comparison-grid">
            {displayProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                requireAuth={requireAuth}
                searchQuery={searchQuery}
              />
            ))}
          </div>

          {productsWithPrices.length > 8 && (
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-primary font-mono"
              onClick={() => setShowAllProducts(!showAllProducts)}
              data-testid="button-show-all-prices"
            >
              {showAllProducts ? 'Show Less' : `Show All ${productsWithPrices.length} Results`}
              {showAllProducts ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          )}
        </>
      )}

      {productsWithPrices.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10" data-testid="info-live-prices">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground font-tech">
            Prices shown are pulled live from retailer websites. Additional stores are linked below — we're actively building direct price feeds with more retailers to expand real-time comparisons.
          </p>
        </div>
      )}

      {data.retailerLinks.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-tech text-sm font-bold uppercase text-muted-foreground">Search All Retailers Directly</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">Click to check prices directly — live price feeds coming soon for these stores</p>
          <div className="flex flex-wrap gap-2">
            {data.retailerLinks.map((link) => (
              <Button
                key={link.slug}
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-tech uppercase border-white/10 hover:border-primary/40 gap-1.5"
                onClick={() => {
                  requireAuth(() => {
                    trackClick(link.slug, searchQuery, link.searchUrl, link.isAffiliate ? 'affiliate_quick' : 'quick_link');
                    window.open(link.searchUrl, '_blank', 'noopener,noreferrer');
                  }, "search retailers");
                }}
                data-testid={`quick-link-${link.slug}`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />
                {link.name}
                {link.isAffiliate && <Tag className="w-2.5 h-2.5 text-primary" />}
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleTypeBrowse({ vehicleType, onSearch }: { vehicleType: string; onSearch: (query: string) => void }) {
  const typeLabel = VEHICLE_TYPE_LABELS[vehicleType] || vehicleType;
  const searches = VEHICLE_TYPE_SEARCHES[vehicleType] || VEHICLE_TYPE_SEARCHES['cars'] || [];
  const heroImage = VEHICLE_TYPE_IMAGES[vehicleType];

  const relevantCategories = CATEGORIES.filter(cat => {
    const universalCats = ['brakes', 'engine', 'electrical', 'filters', 'oilfluids', 'tools', 'ignition', 'batteries'];
    const boatCats = ['marine', 'propellers'];
    const powersportsCats = ['powersports'];
    
    if (['boats', 'jetskis'].includes(vehicleType)) {
      return [...universalCats, ...boatCats].includes(cat.id);
    }
    if (['atvs', 'utvs', 'motorcycles', 'snowmobiles', 'gokarts'].includes(vehicleType)) {
      return [...universalCats, ...powersportsCats].includes(cat.id);
    }
    if (['rc', 'drones', 'modelaircraft', 'slotcars'].includes(vehicleType)) {
      return ['rcelectronics', 'propellers', 'lipobatteries', 'rcbodies', 'tools'].includes(cat.id);
    }
    return universalCats.includes(cat.id) || ['suspension', 'exhaust', 'cooling', 'steering', 'transmission', 'body', 'tireswheels', 'beltshoses', 'lighting'].includes(cat.id);
  }).slice(0, 8);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl overflow-hidden"
      >
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt={typeLabel} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>
        )}
        <div className="relative p-6 md:p-8">
          <h2 className="font-tech text-2xl md:text-3xl font-bold text-white mb-2" data-testid="text-browse-title">
            {typeLabel} Parts
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Search across {VENDORS.length}+ retailers for {typeLabel.toLowerCase()} parts, accessories, and supplies
          </p>
          <div className="flex gap-2 max-w-lg">
            <Input
              placeholder={`Search ${typeLabel.toLowerCase()} parts...`}
              className="h-11 bg-black/40 border-white/15 focus:border-primary/50 text-sm"
              data-testid="input-browse-search"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                  onSearch((e.target as HTMLInputElement).value.trim());
                }
              }}
            />
            <Button
              className="h-11 px-4 btn-cyber shrink-0"
              onClick={() => {
                const input = document.querySelector('[data-testid="input-browse-search"]') as HTMLInputElement;
                if (input?.value.trim()) onSearch(input.value.trim());
              }}
              data-testid="button-browse-search"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-tech text-lg font-bold uppercase text-white" data-testid="text-popular-parts">Popular {typeLabel} Parts</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {searches.map((s, i) => (
            <motion.div
              key={s.query}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                className="w-full p-3 rounded-lg glass-card border border-white/5 hover:border-primary/40 transition-all text-left group"
                onClick={() => onSearch(s.query)}
                data-testid={`button-popular-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="font-tech text-sm text-white group-hover:text-primary transition-colors">{s.label}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] text-muted-foreground font-mono">SEARCH</span>
                  <ArrowRight className="w-2.5 h-2.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {relevantCategories.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-tech text-base font-bold uppercase text-muted-foreground">Browse by Category</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relevantCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.03 }}
              >
                <Link href={`/results?category=${cat.id}&type=${vehicleType}&q=${encodeURIComponent(cat.name)}`}>
                  <div className="relative rounded-lg overflow-hidden h-24 cursor-pointer group" data-testid={`category-card-${cat.id}`}>
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 border border-white/10 rounded-lg group-hover:border-primary/40 transition-colors" />
                    <div className="absolute bottom-2 left-3">
                      <span className="font-tech text-xs uppercase text-white drop-shadow-lg">{cat.name}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
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
  const urlZip = params.get('zip') || '';

  const { requireAuth } = useAuthGate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [scanText, setScanText] = useState(SCANNING_MESSAGES[0]);
  const [showLocalOnly, setShowLocalOnly] = useState(false);
  const [zipCode, setZipCode] = useState(urlZip);
  const [showOEMOnly, setShowOEMOnly] = useState(false);
  const [showAftermarketOnly, setShowAftermarketOnly] = useState(false);
  const [showAllVendors, setShowAllVendors] = useState(false);

  useEffect(() => {
    if (!zipCode && user?.zipCode) {
      setZipCode(user.zipCode);
    }
  }, [user?.zipCode]);

  const hasSearchQuery = !!(query || partNumber || category);

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
    enabled: hasSearchQuery,
  });

  const { data: priceData, isLoading: priceLoading } = useQuery<PriceComparisonData>({
    queryKey: ['prices', query, partNumber, year, make, model, vehicleType, zipCode],
    queryFn: async () => {
      const res = await fetch('/api/prices/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: query || partNumber || category,
          year,
          make,
          model,
          vehicleType,
          zipCode: zipCode || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to compare prices');
      return res.json();
    },
    enabled: hasSearchQuery,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!hasSearchQuery) {
      setIsLoading(false);
      return;
    }
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SCANNING_MESSAGES.length) {
        setScanText(SCANNING_MESSAGES[step]);
      }
    }, 250);
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [hasSearchQuery]);

  const displayQuery = query || partNumber || category || '';
  const vehicleLabel = [year, make, model].filter(Boolean).join(' ');

  const vendorsWithUrls = useMemo((): VendorWithUrl[] => {
    const searchTerm = displayQuery || (vehicleType ? VEHICLE_TYPE_LABELS[vehicleType] || vehicleType : '');
    let vendors = vehicleType
      ? VENDORS.filter(v => v.categories.includes(vehicleType) || v.categories.includes('cars'))
      : VENDORS;

    if (showLocalOnly) vendors = vendors.filter(v => v.hasLocalPickup);
    if (showOEMOnly) vendors = vendors.filter(v => v.supportsOEM);
    if (showAftermarketOnly) vendors = vendors.filter(v => v.supportsAftermarket);

    return vendors
      .map(vendor => ({
        vendor,
        searchUrl: generateVendorSearchUrl(vendor, searchTerm, { year, make, model, zip: zipCode }),
        isAffiliate: isAffiliatePartner(vendor),
      }))
      .sort((a, b) => {
        if (a.isAffiliate && !b.isAffiliate) return -1;
        if (!a.isAffiliate && b.isAffiliate) return 1;
        if (a.vendor.hasLocalPickup && !b.vendor.hasLocalPickup) return -1;
        if (!a.vendor.hasLocalPickup && b.vendor.hasLocalPickup) return 1;
        return b.vendor.priority - a.vendor.priority;
      });
  }, [vehicleType, displayQuery, year, make, model, zipCode, showLocalOnly, showOEMOnly, showAftermarketOnly]);

  const affiliateVendors = vendorsWithUrls.filter(v => v.isAffiliate);
  const otherVendors = vendorsWithUrls.filter(v => !v.isAffiliate);
  const displayedOtherVendors = showAllVendors ? otherVendors : otherVendors.slice(0, 6);

  const handleBrowseSearch = (searchQuery: string) => {
    const newParams = new URLSearchParams();
    newParams.set('q', searchQuery);
    if (vehicleType) newParams.set('type', vehicleType);
    if (year) newParams.set('year', year);
    if (make) newParams.set('make', make);
    if (model) newParams.set('model', model);
    window.location.href = `/results?${newParams.toString()}`;
  };

  const isBrowseMode = vehicleType && !hasSearchQuery;
  const contextLabel = displayQuery || (VEHICLE_TYPE_LABELS[vehicleType] || vehicleType || 'Parts Search');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-[85px] lg:pt-[80px] min-h-[calc(100vh-5rem)] w-full pb-16">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <span className="font-tech text-sm font-bold text-white uppercase" data-testid="text-context-query">{contextLabel}</span>
              </div>
              {vehicleLabel && (
                <Badge variant="outline" className="font-mono text-[10px] border-green-500/30 text-green-400">
                  <Shield className="w-3 h-3 mr-1" /> {vehicleLabel}
                </Badge>
              )}
              {vehicleType && (
                <Badge variant="outline" className="font-mono text-[10px] border-blue-500/30 text-blue-400">
                  {(VEHICLE_TYPE_LABELS[vehicleType] || vehicleType).toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
                <Zap className="w-3 h-3 mr-1" /> {vendorsWithUrls.length} RETAILERS MATCHED
              </Badge>
              {hasSearchQuery && (
                <>
                  <PriceAlertButton partName={contextLabel} partNumber={partNumber || undefined} />
                  <ShareButton partName={contextLabel} vendorName="GarageBot" searchUrl={window.location.href} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-6">
          <div className="grid grid-cols-12 gap-6">
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
                      onClick={() => {
                        navigator.geolocation?.getCurrentPosition(
                          async (pos) => {
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`, {
                                headers: { 'Accept': 'application/json' }
                              });
                              const data = await res.json();
                              const detectedZip = data?.address?.postcode;
                              if (detectedZip && /^\d{5}/.test(detectedZip)) {
                                setZipCode(detectedZip.slice(0, 5));
                              }
                            } catch (e) {
                              console.error('Geocoding failed:', e);
                            }
                          },
                          () => {},
                          { enableHighAccuracy: false, timeout: 5000 }
                        );
                      }}
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

            <div className="col-span-12 lg:col-span-9">
              {isLoading && hasSearchQuery ? (
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
              ) : isBrowseMode ? (
                <VehicleTypeBrowse vehicleType={vehicleType} onSearch={handleBrowseSearch} />
              ) : (
                <div className="space-y-6">
                  <PriceComparisonSection
                    data={priceData}
                    isLoading={priceLoading && !isLoading}
                    searchQuery={displayQuery}
                    requireAuth={requireAuth}
                  />

                  {affiliateVendors.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-5 h-5 text-primary" />
                        <h2 className="font-tech text-lg font-bold uppercase text-white" data-testid="text-partner-retailers">
                          All {vendorsWithUrls.length} Retailers
                        </h2>
                        <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400 ml-auto">
                          <DollarSign className="w-3 h-3 mr-0.5" /> {affiliateVendors.length} partners
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3 -mt-2">
                        Direct links to "{displayQuery}" {vehicleLabel ? `for ${vehicleLabel}` : ''} across all retailers
                      </p>
                      <div className="space-y-2">
                        {affiliateVendors.map((v, i) => (
                          <VendorDirectLink key={v.vendor.id} vendorWithUrl={v} displayQuery={displayQuery} requireAuth={requireAuth} index={i} />
                        ))}
                      </div>
                    </section>
                  )}

                  {otherVendors.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Store className="w-5 h-5 text-muted-foreground" />
                        <h2 className="font-tech text-base font-bold uppercase text-muted-foreground" data-testid="text-more-retailers">More Retailers</h2>
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

                  {vendorsWithUrls.length === 0 && (
                    <div className="text-center py-20">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-tech text-xl mb-2">No Retailers Found</h3>
                      <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search terms.</p>
                    </div>
                  )}

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

                  <div className="lg:hidden">
                    <VehicleFunFacts query={query} make={make} model={model} vehicleType={vehicleType} />
                  </div>

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
