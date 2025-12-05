import { Car, Battery, Disc, Zap, Cog, Wrench, Fuel, Thermometer, Bike, Ship, Truck, Mountain, Waves, Gauge, Crown, Hammer, Sparkles, Lightbulb, Droplets, Navigation, Settings, PaintBucket, Sofa, CircleDot, Flame, Cable, Drill, Fan, Leaf } from "lucide-react";

// Vendor search URL templates - {query}, {year}, {make}, {model}, {zip} are placeholders
export interface VendorInfo {
  id: string;
  name: string;
  slug: string;
  searchTemplate: string;
  storeLocatorUrl?: string;
  hasLocalPickup: boolean;
  categories: string[]; // Which vehicle types this vendor serves
  priority: number; // Higher = show first
  supportsOEM: boolean;
  supportsAftermarket: boolean;
  affiliateNetwork?: string;
  logoColor: string; // For UI display
}

export const VENDORS: VendorInfo[] = [
  // Major Auto Parts Retailers - LOCAL PICKUP AVAILABLE
  {
    id: "autozone",
    name: "AutoZone",
    slug: "autozone",
    searchTemplate: "https://www.autozone.com/searchresult?searchText={query}",
    storeLocatorUrl: "https://www.autozone.com/locations",
    hasLocalPickup: true,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 100,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Impact",
    logoColor: "#FF6600"
  },
  {
    id: "oreilly",
    name: "O'Reilly Auto Parts",
    slug: "oreilly",
    searchTemplate: "https://www.oreillyauto.com/shop/b/{query}",
    storeLocatorUrl: "https://www.oreillyauto.com/store-finder",
    hasLocalPickup: true,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 99,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#00843D"
  },
  {
    id: "advanceauto",
    name: "Advance Auto Parts",
    slug: "advance",
    searchTemplate: "https://shop.advanceautoparts.com/web/SearchResults?searchTerm={query}",
    storeLocatorUrl: "https://stores.advanceautoparts.com",
    hasLocalPickup: true,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 98,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#CC0000"
  },
  {
    id: "napa",
    name: "NAPA Auto Parts",
    slug: "napa",
    searchTemplate: "https://www.napaonline.com/en/search?q={query}",
    storeLocatorUrl: "https://www.napaonline.com/en/auto-parts-stores-near-me",
    hasLocalPickup: true,
    categories: ["cars", "classics", "diesel", "rv", "boats"],
    priority: 97,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#003DA5"
  },
  // Online-Only Major Retailers
  {
    id: "rockauto",
    name: "RockAuto",
    slug: "rockauto",
    searchTemplate: "https://www.rockauto.com/en/catalog/?a={query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#336699"
  },
  {
    id: "amazon",
    name: "Amazon Automotive",
    slug: "amazon",
    searchTemplate: "https://www.amazon.com/s?k={query}&i=automotive",
    hasLocalPickup: false,
    categories: ["cars", "classics", "motorcycles", "atvs", "boats", "rv", "diesel", "powersports"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Amazon Associates",
    logoColor: "#FF9900"
  },
  {
    id: "ebay",
    name: "eBay Motors",
    slug: "ebay",
    searchTemplate: "https://www.ebay.com/sch/i.html?_nkw={query}&_sacat=6000",
    hasLocalPickup: false,
    categories: ["cars", "classics", "motorcycles", "atvs", "boats", "rv", "diesel", "exotics", "kitcars", "powersports"],
    priority: 85,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "eBay Partner Network",
    logoColor: "#E53238"
  },
  {
    id: "carparts",
    name: "CarParts.com",
    slug: "carparts",
    searchTemplate: "https://www.carparts.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["cars", "classics"],
    priority: 80,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#1E90FF"
  },
  // Powersports Specialists
  {
    id: "rockymountain",
    name: "Rocky Mountain ATV/MC",
    slug: "rockymountain",
    searchTemplate: "https://www.rockymountainatvmc.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["motorcycles", "atvs", "powersports"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "AvantLink",
    logoColor: "#FF4500"
  },
  {
    id: "denniskirk",
    name: "Dennis Kirk",
    slug: "denniskirk",
    searchTemplate: "https://www.denniskirk.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["motorcycles", "atvs", "powersports"],
    priority: 94,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "AvantLink",
    logoColor: "#003366"
  },
  {
    id: "partzilla",
    name: "Partzilla",
    slug: "partzilla",
    searchTemplate: "https://www.partzilla.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["motorcycles", "atvs", "boats", "powersports"],
    priority: 93,
    supportsOEM: true,
    supportsAftermarket: false,
    affiliateNetwork: "ShareASale",
    logoColor: "#00AA00"
  },
  {
    id: "revzilla",
    name: "RevZilla",
    slug: "revzilla",
    searchTemplate: "https://www.revzilla.com/search?query={query}",
    hasLocalPickup: false,
    categories: ["motorcycles"],
    priority: 92,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "AvantLink",
    logoColor: "#FF0000"
  },
  {
    id: "vmcchineseparts",
    name: "VMC Chinese Parts",
    slug: "vmc",
    searchTemplate: "https://www.vmcchineseparts.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["atvs", "powersports"],
    priority: 85,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#CC0000"
  },
  // Marine / Boat
  {
    id: "westmarine",
    name: "West Marine",
    slug: "westmarine",
    searchTemplate: "https://www.westmarine.com/search?q={query}",
    storeLocatorUrl: "https://www.westmarine.com/stores",
    hasLocalPickup: true,
    categories: ["boats"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#003399"
  },
  {
    id: "iboats",
    name: "iBoats",
    slug: "iboats",
    searchTemplate: "https://www.iboats.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["boats"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#0066CC"
  },
  {
    id: "boatsnet",
    name: "Boats.net",
    slug: "boatsnet",
    searchTemplate: "https://www.boats.net/search?q={query}",
    hasLocalPickup: false,
    categories: ["boats"],
    priority: 88,
    supportsOEM: true,
    supportsAftermarket: false,
    affiliateNetwork: "ShareASale",
    logoColor: "#006699"
  },
  // Performance / Racing
  {
    id: "summit",
    name: "Summit Racing",
    slug: "summit",
    searchTemplate: "https://www.summitracing.com/search?keyword={query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "exotics", "kitcars"],
    priority: 95,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FF0000"
  },
  {
    id: "jegs",
    name: "JEGS",
    slug: "jegs",
    searchTemplate: "https://www.jegs.com/v/Search/{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "exotics", "kitcars"],
    priority: 94,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FFCC00"
  },
  // Diesel / Commercial
  {
    id: "fleetpride",
    name: "FleetPride",
    slug: "fleetpride",
    searchTemplate: "https://www.fleetpride.com/search?q={query}",
    storeLocatorUrl: "https://www.fleetpride.com/branch-locator",
    hasLocalPickup: true,
    categories: ["diesel"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#003366"
  },
  {
    id: "findParts",
    name: "FinditParts",
    slug: "finditparts",
    searchTemplate: "https://www.finditparts.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["diesel"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#FF6600"
  },
  // RV / Trailer
  {
    id: "campingworld",
    name: "Camping World",
    slug: "campingworld",
    searchTemplate: "https://www.campingworld.com/search?q={query}",
    storeLocatorUrl: "https://www.campingworld.com/store-locator",
    hasLocalPickup: true,
    categories: ["rv"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#00AA00"
  },
  {
    id: "etrailer",
    name: "etrailer",
    slug: "etrailer",
    searchTemplate: "https://www.etrailer.com/search.aspx?SearchTerm={query}",
    hasLocalPickup: false,
    categories: ["rv", "cars"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "ShareASale",
    logoColor: "#0066CC"
  },
  // Classic / Vintage
  {
    id: "classicindustries",
    name: "Classic Industries",
    slug: "classicindustries",
    searchTemplate: "https://www.classicindustries.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["classics"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "ShareASale",
    logoColor: "#CC0000"
  },
  {
    id: "lmctruck",
    name: "LMC Truck",
    slug: "lmctruck",
    searchTemplate: "https://www.lmctruck.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["classics"],
    priority: 92,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#336699"
  },
  // Small Engine / Outdoor
  {
    id: "jackssmallengines",
    name: "Jack's Small Engines",
    slug: "jacks",
    searchTemplate: "https://www.jackssmallengines.com/jacks-parts-lookup/search?q={query}",
    hasLocalPickup: false,
    categories: ["powersports"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "ShareASale",
    logoColor: "#009933"
  },
  {
    id: "tractorsupply",
    name: "Tractor Supply",
    slug: "tractorsupply",
    searchTemplate: "https://www.tractorsupply.com/tsc/search/{query}",
    storeLocatorUrl: "https://www.tractorsupply.com/wcs/store/finder",
    hasLocalPickup: true,
    categories: ["powersports", "diesel"],
    priority: 85,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#CC0000"
  },
  // Off-Road / 4x4
  {
    id: "4wheelparts",
    name: "4 Wheel Parts",
    slug: "4wheelparts",
    searchTemplate: "https://www.4wheelparts.com/search?q={query}",
    storeLocatorUrl: "https://www.4wheelparts.com/store-locator",
    hasLocalPickup: true,
    categories: ["cars", "atvs"],
    priority: 90,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FF6600"
  },
  {
    id: "extremeterrain",
    name: "ExtremeTerrain",
    slug: "extremeterrain",
    searchTemplate: "https://www.extremeterrain.com/search/?q={query}",
    hasLocalPickup: false,
    categories: ["cars"],
    priority: 85,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FF0000"
  },
];

// Helper function to generate search URL for a vendor
export function generateVendorSearchUrl(
  vendor: VendorInfo,
  query: string,
  options?: { year?: string; make?: string; model?: string; zip?: string }
): string {
  let url = vendor.searchTemplate;
  
  // Build the full query with vehicle info if available
  let fullQuery = query;
  if (options?.year && options?.make && options?.model) {
    fullQuery = `${options.year} ${options.make} ${options.model} ${query}`;
  } else if (options?.make && options?.model) {
    fullQuery = `${options.make} ${options.model} ${query}`;
  }
  
  // Replace placeholders
  url = url.replace('{query}', encodeURIComponent(fullQuery));
  if (options?.year) url = url.replace('{year}', encodeURIComponent(options.year));
  if (options?.make) url = url.replace('{make}', encodeURIComponent(options.make));
  if (options?.model) url = url.replace('{model}', encodeURIComponent(options.model));
  if (options?.zip) url = url.replace('{zip}', encodeURIComponent(options.zip));
  
  return url;
}

// Get vendors for a specific vehicle type
export function getVendorsForVehicleType(vehicleType: string): VendorInfo[] {
  return VENDORS
    .filter(v => v.categories.includes(vehicleType) || v.categories.includes('cars')) // cars is default
    .sort((a, b) => b.priority - a.priority);
}

// Get vendors with local pickup
export function getLocalPickupVendors(): VendorInfo[] {
  return VENDORS
    .filter(v => v.hasLocalPickup)
    .sort((a, b) => b.priority - a.priority);
}

export const VEHICLE_TYPES = [
  { id: "cars", name: "Cars & Trucks", icon: Car, description: "Sedans, SUVs, Pickups", image: "/generated_images/cars_and_trucks.png" },
  { id: "classics", name: "Classic & Hot Rod", icon: Sparkles, description: "Muscle, Vintage, Resto", image: "/generated_images/classic_hot_rod.png" },
  { id: "exotics", name: "Exotics", icon: Crown, description: "Ferrari, Lambo, Porsche", image: "/generated_images/exotic_supercar.png" },
  { id: "kitcars", name: "Kit & Custom", icon: Hammer, description: "Replicas, Builds, DIY", image: "/generated_images/kit_car_build.png" },
  { id: "motorcycles", name: "Motorcycles", icon: Bike, description: "Street, Sport, Cruiser", image: "/generated_images/motorcycle.png" },
  { id: "atvs", name: "ATVs & UTVs", icon: Mountain, description: "Quads, Side-by-Sides", image: "/generated_images/atv_and_utv.png" },
  { id: "boats", name: "Marine", icon: Ship, description: "Boats, PWC, Outboard", image: "/generated_images/boat_marine.png" },
  { id: "powersports", name: "Powersports", icon: Gauge, description: "Dirt, Snow, Go-Karts", image: "/generated_images/powersports_vehicles.png" },
  { id: "rv", name: "RV & Trailer", icon: Truck, description: "Motorhomes, Campers", image: "/generated_images/rv_trailer.png" },
  { id: "diesel", name: "Diesel & Commercial", icon: Cog, description: "Semi, Fleet, Heavy", image: "/generated_images/diesel_commercial_truck.png" },
  { id: "generators", name: "Generators", icon: Fan, description: "Portable, Standby, Inverter", image: "/generated_images/generator_power.png" },
  { id: "smallengines", name: "Small Engines", icon: Leaf, description: "Mowers, Chainsaws, Trimmers", image: "/generated_images/small_engines_equipment.png" },
];

export const CATEGORIES = [
  { id: "brakes", name: "Brakes", icon: Disc, image: "/generated_images/brake_parts.png" },
  { id: "engine", name: "Engine", icon: Cog, image: "/generated_images/engine_block.png" },
  { id: "suspension", name: "Suspension", icon: Car, image: "/generated_images/suspension_parts.png" },
  { id: "electrical", name: "Electrical", icon: Zap, image: "/generated_images/electrical_parts.png" },
  { id: "exhaust", name: "Exhaust", icon: Fuel, image: "/generated_images/exhaust_system.png" },
  { id: "cooling", name: "Cooling", icon: Thermometer, image: "/generated_images/cooling_system.png" },
  { id: "filters", name: "Filters", icon: Wrench, image: "/generated_images/filters_set.png" },
  { id: "batteries", name: "Batteries", icon: Battery, image: "/generated_images/car_battery.png" },
  { id: "powersports", name: "Powersports", icon: Bike, image: "/generated_images/powersports_parts.png" },
  { id: "marine", name: "Marine", icon: Waves, image: "/generated_images/marine_parts.png" },
  { id: "lighting", name: "Lighting", icon: Lightbulb, image: "/generated_images/lighting_parts.png" },
  { id: "oilfluids", name: "Oil & Fluids", icon: Droplets, image: "/generated_images/oil_and_fluids.png" },
  { id: "steering", name: "Steering", icon: Navigation, image: "/generated_images/steering_parts.png" },
  { id: "transmission", name: "Transmission", icon: Settings, image: "/generated_images/transmission_parts.png" },
  { id: "body", name: "Body & Exterior", icon: PaintBucket, image: "/generated_images/body_exterior_parts.png" },
  { id: "interior", name: "Interior", icon: Sofa, image: "/generated_images/interior_parts.png" },
  { id: "tireswheels", name: "Tires & Wheels", icon: CircleDot, image: "/generated_images/tires_and_wheels.png" },
  { id: "ignition", name: "Ignition", icon: Flame, image: "/generated_images/ignition_parts.png" },
  { id: "beltshoses", name: "Belts & Hoses", icon: Cable, image: "/generated_images/belts_and_hoses.png" },
  { id: "tools", name: "Tools", icon: Drill, image: "/generated_images/mechanic_tools.png" },
];

export const SPECIALTY_RETAILERS = {
  classics: [
    { name: "Summit Racing", url: "https://www.summitracing.com", specialty: "Performance & Restoration" },
    { name: "Classic Industries", url: "https://www.classicindustries.com", specialty: "Restoration Parts" },
    { name: "Year One", url: "https://www.yearone.com", specialty: "Muscle Car Parts" },
    { name: "OPGI", url: "https://www.opgi.com", specialty: "GM Restoration" },
    { name: "Holley", url: "https://www.holley.com", specialty: "Carburetors & EFI" },
    { name: "Speedway Motors", url: "https://www.speedwaymotors.com", specialty: "Hot Rod Parts" },
    { name: "Eckler's", url: "https://www.ecklers.com", specialty: "Corvette & Chevy" },
    { name: "Danchuk", url: "https://www.danchuk.com", specialty: "55-57 Chevy" },
  ],
  exotics: [
    { name: "Scuderia Car Parts", url: "https://www.scuderiacarparts.com", specialty: "Ferrari & Maserati" },
    { name: "Suncoast Parts", url: "https://www.suncoastparts.com", specialty: "Porsche Specialist" },
    { name: "Eurospares", url: "https://www.eurospares.com", specialty: "European Exotics" },
    { name: "Ricambi America", url: "https://www.ricambiamerica.com", specialty: "Italian Supercars" },
    { name: "Vivid Racing", url: "https://www.vividracing.com", specialty: "Performance Upgrades" },
    { name: "Fabspeed", url: "https://www.fabspeed.com", specialty: "Exotic Exhaust" },
  ],
  kitcars: [
    { name: "Factory Five Racing", url: "https://www.factoryfive.com", specialty: "Cobra & GT40 Kits" },
    { name: "Superformance", url: "https://www.superformance.com", specialty: "Licensed Replicas" },
    { name: "Backdraft Racing", url: "https://www.backdraftracing.com", specialty: "Cobra Replicas" },
    { name: "Detroit Speed", url: "https://www.detroitspeed.com", specialty: "Pro-Touring Suspension" },
    { name: "Speedmaster", url: "https://www.speedmaster1.com", specialty: "Engine Components" },
    { name: "Superlite Cars", url: "https://www.superlitecars.com", specialty: "SL-C & Aero Kits" },
  ],
};

export const MOCK_RESULTS = [
  {
    id: 1,
    name: "Brembo Ceramic Brake Pads (Front)",
    partNumber: "P83024N",
    fitment: "2018-2024 Toyota Tacoma",
    image: "https://images.unsplash.com/photo-1600685039239-c72963c4a8a5?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "AutoZone", price: 59.99, shipping: "Free Pickup", inStock: true, location: "0.8 mi • Main St" },
      { store: "Amazon", price: 45.50, shipping: "2-Day Free", inStock: true, location: "Online Only" },
      { store: "RockAuto", price: 38.99, shipping: "+$12.00 Ship", inStock: true, location: "Online Only" },
    ],
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: 2,
    name: "TaoTao 110cc Carburetor PZ19",
    partNumber: "PZ19-CARB",
    fitment: "Universal Chinese ATV / Go-Kart",
    image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "VMC Chinese Parts", price: 18.95, shipping: "+$5.00 Ship", inStock: true, location: "Online Only" },
      { store: "Amazon", price: 14.99, shipping: "Prime", inStock: true, location: "Online Only" },
      { store: "eBay Motors", price: 12.50, shipping: "Free Ship (Slow)", inStock: true, location: "Online Only" },
    ],
    rating: 4.2,
    reviews: 315,
  },
  {
    id: 3,
    name: "Bosch Icon Wiper Blade 26\"",
    partNumber: "26A",
    fitment: "Universal Hook Arm",
    image: "https://images.unsplash.com/photo-1619646972479-6d4e46936635?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "O'Reilly", price: 28.99, shipping: "Free Pickup", inStock: true, location: "1.2 mi • Broadway" },
      { store: "Amazon", price: 24.50, shipping: "Prime", inStock: true, location: "Online Only" },
    ],
    rating: 4.7,
    reviews: 3200,
  },
  {
    id: 4,
    name: "Castrol GTX High Mileage 5W-30 (5qt)",
    partNumber: "1597B1",
    fitment: "Universal",
    image: "https://images.unsplash.com/photo-1563286092-5c4723403b92?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "Walmart", price: 26.44, shipping: "Free Pickup", inStock: true, location: "2.5 mi • Supercenter" },
      { store: "AutoZone", price: 32.99, shipping: "Free Pickup", inStock: true, location: "0.8 mi • Main St" },
    ],
    rating: 4.8,
    reviews: 560,
  },
  {
    id: 5,
    name: "Mercury Outboard Gear Lube",
    partNumber: "92-858064K01",
    fitment: "Mercury / Mariner Outboards",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "West Marine", price: 24.99, shipping: "Free Pickup", inStock: true, location: "5.2 mi • Marina Dr" },
      { store: "Amazon", price: 19.95, shipping: "Prime", inStock: true, location: "Online Only" },
    ],
    rating: 4.9,
    reviews: 890,
  },
  {
    id: 6,
    name: "Can-Am Maverick X3 Belt",
    partNumber: "422280652",
    fitment: "2017-2024 Can-Am Maverick X3",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "Dennis Kirk", price: 189.99, shipping: "Free Ship", inStock: true, location: "Online Only" },
      { store: "Rocky Mountain ATV", price: 179.95, shipping: "+$8.00 Ship", inStock: true, location: "Online Only" },
    ],
    rating: 4.6,
    reviews: 425,
  },
];
