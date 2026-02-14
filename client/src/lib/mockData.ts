import { Car, Battery, Disc, Zap, Cog, Wrench, Fuel, Thermometer, Bike, Ship, Truck, Mountain, Waves, Gauge, Crown, Hammer, Sparkles, Lightbulb, Droplets, Navigation, Settings, PaintBucket, Sofa, CircleDot, Flame, Cable, Drill, Fan, Leaf, Gamepad2, Plane, Radio, Trophy, Joystick } from "lucide-react";

// Vendor search URL templates - {query}, {year}, {make}, {model}, {zip} are placeholders
export type VendorCategory = 
  | "Major Auto Parts Chains"
  | "Online Auto Parts"
  | "Powersports & Motorcycle"
  | "Marine & Watercraft"
  | "Performance & Racing"
  | "Diesel & Commercial"
  | "RV & Trailer"
  | "Classic & Restoration"
  | "Off-Road & 4x4"
  | "Tires & Wheels"
  | "Small Engine & Outdoor"
  | "Vehicle Electronics"
  | "Coatings & Detailing"
  | "RC & Hobby"
  | "Drones & FPV"
  | "Travel & Rental"
  | "Tools & Equipment";

export interface VendorInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  vendorCategory: VendorCategory;
  searchTemplate: string;
  storeLocatorUrl?: string;
  hasLocalPickup: boolean;
  categories: string[];
  priority: number;
  supportsOEM: boolean;
  supportsAftermarket: boolean;
  affiliateNetwork?: string;
  logoColor: string;
}

const VENDOR_DOMAINS: Record<string, string> = {
  autozone: "autozone.com",
  oreilly: "oreillyauto.com",
  advanceauto: "advanceautoparts.com",
  napa: "napaonline.com",
  rockauto: "rockauto.com",
  amazon: "amazon.com",
  ebay: "ebay.com",
  carparts: "carparts.com",
  rockymountain: "rockymountainatvmc.com",
  denniskirk: "denniskirk.com",
  partzilla: "partzilla.com",
  revzilla: "revzilla.com",
  vmcchineseparts: "vmcchineseparts.com",
  westmarine: "westmarine.com",
  iboats: "iboats.com",
  boatsnet: "boats.net",
  summit: "summitracing.com",
  jegs: "jegs.com",
  fleetpride: "fleetpride.com",
  findParts: "finditparts.com",
  campingworld: "campingworld.com",
  etrailer: "etrailer.com",
  classicindustries: "classicindustries.com",
  lmctruck: "lmctruck.com",
  jackssmallengines: "jackssmallengines.com",
  tractorsupply: "tractorsupply.com",
  "4wheelparts": "4wheelparts.com",
  extremeterrain: "extremeterrain.com",
  rexing: "rexing.com",
  silazane50: "silazane50usa.com",
  amainhobbies: "amainhobbies.com",
  horizonhobby: "horizonhobby.com",
  towerhobbies: "towerhobbies.com",
  hobbyking: "hobbyking.com",
  getfpv: "getfpv.com",
  redcatracing: "redcatracing.com",
  hosimrc: "hosim.com",
  betafpv: "betafpv.com",
  bezgar: "bezgar.com",
  rcplanet: "rcplanet.com",
  "carla-car-rental": "carlacarrental.com",
  "cj-pony-parts": "cjponyparts.com",
  expedia: "expedia.com",
  "hotels-com": "hotels.com",
  garvee: "garvee.com",
  "mavis-tires": "mavis.com",
  "tire-rack": "tirerack.com",
  dunford: "dunfordinc.com",
  ottocast: "ottocast.com",
  autopartstoys: "autopartstoys.com",
  "seats-aero": "seats.aero",
  tcmt: "tcmtco.com",
};

export function getVendorLogoUrl(vendor: VendorInfo, size: number = 128): string {
  const domain = VENDOR_DOMAINS[vendor.id];
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }
  return "";
}

export function getVendorFaviconUrl(vendor: VendorInfo, size: number = 64): string {
  const domain = VENDOR_DOMAINS[vendor.id];
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  }
  return "";
}

export const VENDORS: VendorInfo[] = [
  {
    id: "autozone",
    name: "AutoZone",
    slug: "autozone",
    description: "America's leading auto parts retailer with 6,000+ stores. Same-day pickup, free battery testing, and a massive inventory of OEM and aftermarket parts for cars, trucks, and SUVs.",
    vendorCategory: "Major Auto Parts Chains",
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
    description: "Trusted nationwide chain with 5,800+ locations. Known for knowledgeable staff, free diagnostics, loaner tool programs, and fast in-store pickup on thousands of parts.",
    vendorCategory: "Major Auto Parts Chains",
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
    description: "Major retailer with 4,700+ stores offering same-day delivery, free in-store services, and a deep catalog of quality replacement parts for domestic and import vehicles.",
    vendorCategory: "Major Auto Parts Chains",
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
    description: "Professional-grade parts supplier trusted by mechanics for 100+ years. 6,000+ stores with commercial delivery, premium brands, and hard-to-find parts for all vehicle types.",
    vendorCategory: "Major Auto Parts Chains",
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
  {
    id: "rockauto",
    name: "RockAuto",
    slug: "rockauto",
    description: "The internet's go-to discount auto parts warehouse. Massive catalog with unbeatable prices, detailed part diagrams, and brands from economy to OE-quality — all shipped direct.",
    vendorCategory: "Online Auto Parts",
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
    description: "World's largest online marketplace with millions of auto parts listings. Prime shipping, easy returns, garage vehicle fit checker, and competitive pricing across every category.",
    vendorCategory: "Online Auto Parts",
    searchTemplate: "https://www.amazon.com/s?k={query}&i=automotive&tag=garagebot0e-20",
    hasLocalPickup: false,
    categories: ["cars", "classics", "motorcycles", "atvs", "boats", "rv", "diesel", "powersports", "rc", "drones", "modelaircraft", "slotcars"],
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
    description: "Massive marketplace for new, used, and hard-to-find parts. Great for rare components, salvage finds, classic car parts, and auction deals across every vehicle type.",
    vendorCategory: "Online Auto Parts",
    searchTemplate: "https://www.ebay.com/sch/i.html?_nkw={query}&_sacat=6000&mkcid=1&mkrid=711-53200-19255-0&campid=5339098888&toolid=10001",
    hasLocalPickup: false,
    categories: ["cars", "classics", "motorcycles", "atvs", "boats", "rv", "diesel", "exotics", "kitcars", "powersports", "rc", "drones", "modelaircraft", "slotcars"],
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
    description: "Fast-growing online retailer focused on affordable OEM-quality replacement parts. Free shipping, easy fitment lookup, and a streamlined shopping experience.",
    vendorCategory: "Online Auto Parts",
    searchTemplate: "https://www.carparts.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["cars", "classics"],
    priority: 80,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#1E90FF"
  },
  {
    id: "autopartstoys",
    name: "AutoPartsToys",
    slug: "autopartstoys",
    description: "Affordable online auto parts retailer with a wide selection covering cars, trucks, motorcycles, and powersports. Known for competitive pricing and broad vehicle coverage.",
    vendorCategory: "Online Auto Parts",
    searchTemplate: "http://www.awin1.com/awclick.php?mid=90763&id=2752166&ued=https%3A%2F%2Fwww.autopartstoys.com%2Fsearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "diesel", "rv", "motorcycles", "atvs", "boats", "powersports"],
    priority: 81,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "AWIN",
    logoColor: "#E63946"
  },
  {
    id: "garvee",
    name: "GARVEE",
    slug: "garvee",
    description: "Online destination for automotive accessories, garage equipment, and vehicle upgrades. From lift kits to air compressors — quality gear at competitive prices.",
    vendorCategory: "Tools & Equipment",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-7305404?url=https%3A%2F%2Fwww.garvee.com%2Fsearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "diesel", "rv", "atvs"],
    priority: 78,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#059669"
  },
  {
    id: "dunford",
    name: "Dunford, Inc.",
    slug: "dunford",
    description: "Specialty supplier of automotive parts, hardware, and accessories. Reliable source for hard-to-find components across cars, trucks, RVs, and diesel applications.",
    vendorCategory: "Online Auto Parts",
    searchTemplate: "https://www.awin1.com/cread.php?awinmid=18794&awinaffid=101643977&ued=https%3A%2F%2Fwww.dunfordinc.com%2Fsearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 82,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "AWIN",
    logoColor: "#7C3AED"
  },
  {
    id: "rockymountain",
    name: "Rocky Mountain ATV/MC",
    slug: "rockymountain",
    description: "Premier powersports parts retailer specializing in dirt bikes, ATVs, and UTVs. Huge selection of OEM and aftermarket parts, gear, and accessories with expert staff.",
    vendorCategory: "Powersports & Motorcycle",
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
    description: "40+ years in powersports. Massive inventory of motorcycle, ATV, and snowmobile parts, riding gear, and accessories from top brands with fast shipping.",
    vendorCategory: "Powersports & Motorcycle",
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
    description: "Largest online OEM powersports parts dealer. Official diagrams and genuine parts for Honda, Yamaha, Kawasaki, Suzuki, Polaris, Sea-Doo, and more.",
    vendorCategory: "Powersports & Motorcycle",
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
    description: "The rider's best friend for motorcycle gear, helmets, jackets, and accessories. Expert video reviews, gear guides, and a passionate community of riders.",
    vendorCategory: "Powersports & Motorcycle",
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
    description: "Specialist in affordable Chinese ATV, dirt bike, and go-kart parts. The go-to source for replacement components on Chinese-made powersports vehicles.",
    vendorCategory: "Powersports & Motorcycle",
    searchTemplate: "https://www.vmcchineseparts.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["atvs", "powersports"],
    priority: 85,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#CC0000"
  },
  {
    id: "tcmt",
    name: "TCMT",
    slug: "tcmt",
    description: "Direct-to-consumer motorcycle and powersports accessories. Fairings, luggage, windshields, and bolt-on upgrades at factory-direct prices.",
    vendorCategory: "Powersports & Motorcycle",
    searchTemplate: "https://tcmtco.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["motorcycles", "atvs", "powersports"],
    priority: 83,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#FF6B00"
  },
  {
    id: "westmarine",
    name: "West Marine",
    slug: "westmarine",
    description: "America's largest boating supply retailer with 240+ stores. Everything from engine parts and electronics to safety gear, with expert advice from boating enthusiasts.",
    vendorCategory: "Marine & Watercraft",
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
    description: "One-stop marine parts shop with OEM parts diagrams, boat covers, propellers, and accessories. Active boating community forum with expert advice.",
    vendorCategory: "Marine & Watercraft",
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
    description: "Genuine OEM marine parts at discounted prices. Official parts diagrams for Mercury, Yamaha, Johnson, Evinrude, and more with fast nationwide shipping.",
    vendorCategory: "Marine & Watercraft",
    searchTemplate: "https://www.boats.net/search?q={query}",
    hasLocalPickup: false,
    categories: ["boats"],
    priority: 88,
    supportsOEM: true,
    supportsAftermarket: false,
    affiliateNetwork: "ShareASale",
    logoColor: "#006699"
  },
  {
    id: "summit",
    name: "Summit Racing",
    slug: "summit",
    description: "The racer's warehouse — legendary supplier of high-performance parts, engines, and racing equipment. From drag strips to circle tracks, Summit has what you need to win.",
    vendorCategory: "Performance & Racing",
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
    description: "Family-owned performance parts powerhouse since 1960. Deep expertise in drag racing, street performance, and restoration with their own line of trusted parts.",
    vendorCategory: "Performance & Racing",
    searchTemplate: "https://www.jegs.com/v/Search/{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "exotics", "kitcars"],
    priority: 94,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FFCC00"
  },
  {
    id: "cj-pony-parts",
    name: "CJ Pony Parts",
    slug: "cj-pony-parts",
    description: "The Mustang specialist — 40+ years as the go-to source for Ford Mustang parts and accessories from 1964 to present. Restoration, performance, and styling.",
    vendorCategory: "Performance & Racing",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-6969901?url=https%3A%2F%2Fwww.cjponyparts.com%2Fsearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics"],
    priority: 82,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#B91C1C"
  },
  {
    id: "fleetpride",
    name: "FleetPride",
    slug: "fleetpride",
    description: "Nation's largest independent distributor of heavy-duty truck and trailer parts. 300+ branches with commercial-grade inventory for fleets and owner-operators.",
    vendorCategory: "Diesel & Commercial",
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
    description: "Online heavy-duty truck parts superstore. Specializing in Class 4-8 commercial vehicle parts with fast delivery and competitive fleet pricing.",
    vendorCategory: "Diesel & Commercial",
    searchTemplate: "https://www.finditparts.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["diesel"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#FF6600"
  },
  {
    id: "campingworld",
    name: "Camping World",
    slug: "campingworld",
    description: "America's largest RV and outdoor retailer with 180+ SuperCenters. Full RV service departments, parts, accessories, and everything for life on the road.",
    vendorCategory: "RV & Trailer",
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
    description: "The trailer and towing experts. Hitches, wiring, cargo carriers, and RV accessories with detailed installation videos and industry-best customer support.",
    vendorCategory: "RV & Trailer",
    searchTemplate: "https://www.etrailer.com/search.aspx?SearchTerm={query}",
    hasLocalPickup: false,
    categories: ["rv", "cars"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "ShareASale",
    logoColor: "#0066CC"
  },
  {
    id: "classicindustries",
    name: "Classic Industries",
    slug: "classicindustries",
    description: "The restoration authority for classic Chevy, Pontiac, Ford, and Mopar vehicles. Comprehensive catalogs with thousands of reproduction and NOS parts.",
    vendorCategory: "Classic & Restoration",
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
    description: "Leading supplier of classic truck restoration parts since 1986. Specializing in Chevy, GMC, Ford, and Dodge trucks from the 1940s to 2000s.",
    vendorCategory: "Classic & Restoration",
    searchTemplate: "https://www.lmctruck.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["classics"],
    priority: 92,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#336699"
  },
  {
    id: "4wheelparts",
    name: "4 Wheel Parts",
    slug: "4wheelparts",
    description: "Off-road specialists with 100+ stores. Lift kits, bumpers, winches, and everything you need to build and outfit your 4x4 for trail or overland adventure.",
    vendorCategory: "Off-Road & 4x4",
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
    description: "Jeep and truck accessory experts. Specializing in Wrangler, Gladiator, and off-road mods with detailed install guides, reviews, and fitment guarantee.",
    vendorCategory: "Off-Road & 4x4",
    searchTemplate: "https://www.extremeterrain.com/search/?q={query}",
    hasLocalPickup: false,
    categories: ["cars"],
    priority: 85,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FF0000"
  },
  {
    id: "mavis-tires",
    name: "Mavis Tires",
    slug: "mavis-tires",
    description: "Full-service tire and auto care chain with 2,100+ locations. Tire installation, alignment, brakes, and oil changes with competitive pricing and appointments online.",
    vendorCategory: "Tires & Wheels",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-6806019?url=https%3A%2F%2Fwww.mavis.com%2Ftires%2Fsearch%3Fq%3D{query}",
    storeLocatorUrl: "https://www.mavis.com/locations",
    hasLocalPickup: true,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 88,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#1D4ED8"
  },
  {
    id: "tire-rack",
    name: "Tire Rack",
    slug: "tire-rack",
    description: "America's premier online tire retailer. Independent testing, expert reviews, and a massive selection of tires and wheels with installer network for easy mounting.",
    vendorCategory: "Tires & Wheels",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-2498?url=https%3A%2F%2Fwww.tirerack.com%2Ftires%2FTireSearchResults.jsp%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "diesel", "rv", "motorcycles"],
    priority: 90,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#991B1B"
  },
  {
    id: "jackssmallengines",
    name: "Jack's Small Engines",
    slug: "jacks",
    description: "Small engine parts authority. Genuine OEM parts for lawn mowers, chainsaws, snow blowers, and outdoor power equipment with interactive parts diagrams.",
    vendorCategory: "Small Engine & Outdoor",
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
    description: "Rural lifestyle retailer with 2,000+ stores. Farm equipment parts, ATV accessories, diesel supplies, tools, and everything for country living and working the land.",
    vendorCategory: "Small Engine & Outdoor",
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
  {
    id: "rexing",
    name: "Rexing",
    slug: "rexing",
    description: "Leading dashcam and vehicle electronics brand. HD dash cameras, backup cameras, and connected car accessories for safety and peace of mind on every drive.",
    vendorCategory: "Vehicle Electronics",
    searchTemplate: "https://rexing.com/?s={query}&post_type=product&ref=5357356",
    hasLocalPickup: false,
    categories: ["cars", "classics", "diesel", "rv", "motorcycles", "atvs", "boats", "powersports"],
    priority: 80,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "Rexing Affiliate",
    logoColor: "#1A1A2E"
  },
  {
    id: "ottocast",
    name: "Ottocast",
    slug: "ottocast",
    description: "Premium wireless CarPlay and Android Auto adapters. Upgrade your vehicle's infotainment system with plug-and-play wireless connectivity solutions.",
    vendorCategory: "Vehicle Electronics",
    searchTemplate: "https://www.awin1.com/cread.php?awinmid=66499&awinaffid=101643977&ued=https%3A%2F%2Fwww.ottocast.com%2Fsearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "diesel", "rv"],
    priority: 80,
    supportsOEM: true,
    supportsAftermarket: false,
    affiliateNetwork: "AWIN",
    logoColor: "#0EA5E9"
  },
  {
    id: "silazane50",
    name: "SILAZANE50",
    slug: "silazane50",
    description: "Professional-grade ceramic coatings and paint protection. Long-lasting nano-ceramic technology for showroom shine and protection on any vehicle surface.",
    vendorCategory: "Coatings & Detailing",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-7675405?url=https%3A%2F%2Fsilazane50usa.com%2Fcollections%2Fall%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "classics", "exotics", "motorcycles", "boats", "rv", "diesel", "atvs"],
    priority: 75,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#C4A35A"
  },
  {
    id: "amainhobbies",
    name: "AMain Hobbies",
    slug: "amainhobbies",
    description: "Top-rated RC hobby shop with an enormous selection of RC cars, trucks, planes, boats, and parts. Same-day shipping, competitive prices, and expert hobbyist support.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://www.amainhobbies.com/search?s={query}",
    hasLocalPickup: false,
    categories: ["rc", "drones", "modelaircraft", "slotcars"],
    priority: 95,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "AvantLink",
    logoColor: "#0066CC"
  },
  {
    id: "horizonhobby",
    name: "Horizon Hobby",
    slug: "horizonhobby",
    description: "Home of Arrma, Losi, E-flite, and Blade brands. Premium RC vehicles, aircraft, and boats with industry-leading innovation and Smart technology.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://www.horizonhobby.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["rc", "drones", "modelaircraft"],
    priority: 94,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#003399"
  },
  {
    id: "towerhobbies",
    name: "Tower Hobbies",
    slug: "towerhobbies",
    description: "Legendary hobby retailer since 1971. Wide selection of RC cars, planes, helicopters, and slot cars with expert product guides and fast shipping.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://www.towerhobbies.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["rc", "drones", "modelaircraft", "slotcars"],
    priority: 93,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "AvantLink",
    logoColor: "#FF6600"
  },
  {
    id: "hobbyking",
    name: "HobbyKing",
    slug: "hobbyking",
    description: "Global RC hobby superstore with warehouse pricing. Batteries, motors, ESCs, and airframes for RC planes, multirotors, and cars at unbeatable prices.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://hobbyking.com/en_us/catalogsearch/result/?q={query}",
    hasLocalPickup: false,
    categories: ["rc", "drones", "modelaircraft"],
    priority: 90,
    supportsOEM: false,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#FF0000"
  },
  {
    id: "redcatracing",
    name: "Redcat Racing",
    slug: "redcatracing",
    description: "Affordable ready-to-run RC trucks, crawlers, and drift cars. Great entry point for hobbyists with durable builds and easy-to-find replacement parts.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://www.redcatracing.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["rc"],
    priority: 88,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "GoAffPro",
    logoColor: "#CC0000"
  },
  {
    id: "hosimrc",
    name: "Hosim RC",
    slug: "hosimrc",
    description: "High-speed RC cars and trucks built for fun. Brushless models reaching 40+ MPH with waterproof electronics and durable construction at budget-friendly prices.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://www.hosim.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["rc"],
    priority: 85,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "ShareASale",
    logoColor: "#0099CC"
  },
  {
    id: "bezgar",
    name: "Bezgar",
    slug: "bezgar",
    description: "Family-friendly RC vehicles designed for beginners and kids. Easy-to-drive cars and trucks with fun designs and responsive customer support.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://bezgar.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["rc"],
    priority: 82,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "ShareASale",
    logoColor: "#FF3300"
  },
  {
    id: "rcplanet",
    name: "RC Planet",
    slug: "rcplanet",
    description: "One of the largest RC hobby shops in the US. Huge selection of RC cars, trucks, slot cars, and parts from Traxxas, Arrma, Team Associated, and more.",
    vendorCategory: "RC & Hobby",
    searchTemplate: "https://www.rcplanet.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["rc", "slotcars"],
    priority: 86,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#3366CC"
  },
  {
    id: "getfpv",
    name: "GetFPV",
    slug: "getfpv",
    description: "The FPV pilot's headquarters. Everything for building and flying FPV racing and freestyle drones — frames, motors, flight controllers, goggles, and more.",
    vendorCategory: "Drones & FPV",
    searchTemplate: "https://www.getfpv.com/catalogsearch/result/?q={query}",
    hasLocalPickup: false,
    categories: ["drones"],
    priority: 92,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#00CC66"
  },
  {
    id: "betafpv",
    name: "BETAFPV",
    slug: "betafpv",
    description: "Pioneering micro FPV drones and whoop-class racing quads. Industry leader in tiny whoops, cinelifters, and beginner-friendly FPV kits.",
    vendorCategory: "Drones & FPV",
    searchTemplate: "https://betafpv.com/search?q={query}",
    hasLocalPickup: false,
    categories: ["drones"],
    priority: 87,
    supportsOEM: true,
    supportsAftermarket: true,
    affiliateNetwork: "Direct",
    logoColor: "#FFD700"
  },
  {
    id: "carla-car-rental",
    name: "Carla Car Rental",
    slug: "carla-car-rental",
    description: "Smart rental car comparison tool that searches 900+ suppliers worldwide. Find the best deals on rental cars, SUVs, and vans in seconds.",
    vendorCategory: "Travel & Rental",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-7466061?url=https%3A%2F%2Fwww.carlacarrental.com%2Fsearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars", "rv"],
    priority: 85,
    supportsOEM: false,
    supportsAftermarket: false,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#2563EB"
  },
  {
    id: "expedia",
    name: "Expedia",
    slug: "expedia",
    description: "World-renowned travel platform with car rentals across 60,000+ locations globally. Bundle deals, flexible cancellations, and loyalty rewards on every booking.",
    vendorCategory: "Travel & Rental",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-5261370?url=https%3A%2F%2Fwww.expedia.com%2FCarSearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars"],
    priority: 80,
    supportsOEM: false,
    supportsAftermarket: false,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#FBBF24"
  },
  {
    id: "hotels-com",
    name: "Hotels.com",
    slug: "hotels-com",
    description: "Trusted travel brand offering car rentals alongside hotel bookings. Earn rewards on every rental and bundle for extra savings on your road trip.",
    vendorCategory: "Travel & Rental",
    searchTemplate: "https://www.anrdoezrs.net/click-101643977-1702763?url=https%3A%2F%2Fwww.hotels.com%2FCarSearch%3Fq%3D{query}",
    hasLocalPickup: false,
    categories: ["cars"],
    priority: 79,
    supportsOEM: false,
    supportsAftermarket: false,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#DC2626"
  },
  {
    id: "seats-aero",
    name: "Seats.aero",
    slug: "seats-aero",
    description: "Award flight search engine that finds the best deals on airline miles and points redemptions. The travel hacker's secret weapon for premium cabin deals.",
    vendorCategory: "Travel & Rental",
    searchTemplate: "https://seats.aero/search?q={query}",
    hasLocalPickup: false,
    categories: ["cars"],
    priority: 70,
    supportsOEM: false,
    supportsAftermarket: false,
    affiliateNetwork: "CJ Affiliate",
    logoColor: "#6366F1"
  },
];

export const VENDOR_CATEGORY_ORDER: VendorCategory[] = [
  "Major Auto Parts Chains",
  "Online Auto Parts",
  "Performance & Racing",
  "Powersports & Motorcycle",
  "Off-Road & 4x4",
  "Marine & Watercraft",
  "Diesel & Commercial",
  "RV & Trailer",
  "Classic & Restoration",
  "Tires & Wheels",
  "Small Engine & Outdoor",
  "Vehicle Electronics",
  "Coatings & Detailing",
  "Tools & Equipment",
  "RC & Hobby",
  "Drones & FPV",
  "Travel & Rental",
];

export const VENDOR_CATEGORY_ICONS: Record<VendorCategory, string> = {
  "Major Auto Parts Chains": "store",
  "Online Auto Parts": "globe",
  "Performance & Racing": "flame",
  "Powersports & Motorcycle": "bike",
  "Off-Road & 4x4": "mountain",
  "Marine & Watercraft": "ship",
  "Diesel & Commercial": "truck",
  "RV & Trailer": "caravan",
  "Classic & Restoration": "sparkles",
  "Tires & Wheels": "circle",
  "Small Engine & Outdoor": "leaf",
  "Vehicle Electronics": "zap",
  "Coatings & Detailing": "paintBucket",
  "Tools & Equipment": "wrench",
  "RC & Hobby": "gamepad",
  "Drones & FPV": "radio",
  "Travel & Rental": "plane",
};

export function getVendorsByCategory(): { category: VendorCategory; vendors: VendorInfo[] }[] {
  const grouped = new Map<VendorCategory, VendorInfo[]>();
  for (const vendor of VENDORS) {
    const list = grouped.get(vendor.vendorCategory) || [];
    list.push(vendor);
    grouped.set(vendor.vendorCategory, list);
  }
  return VENDOR_CATEGORY_ORDER
    .filter(cat => grouped.has(cat))
    .map(cat => ({ category: cat, vendors: grouped.get(cat)!.sort((a, b) => b.priority - a.priority) }));
}

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
    .filter(v => v.categories.includes(vehicleType))
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
  { id: "tractors", name: "Tractors & Farm", icon: Cog, description: "Farm, Agriculture, Implements", image: "/generated_images/tractor_farm.png" },
  { id: "heavyequip", name: "Heavy Equipment", icon: Hammer, description: "Excavators, Loaders, Dozers", image: "/generated_images/heavy_equipment.png" },
  { id: "generators", name: "Generators", icon: Fan, description: "Portable, Standby, Inverter", image: "/generated_images/generator_power.png" },
  { id: "smallengines", name: "Small Engines", icon: Leaf, description: "Mowers, Chainsaws, Trimmers", image: "/generated_images/small_engines_equipment.png" },
  { id: "aviation", name: "Aviation", icon: Gauge, description: "Aircraft, Helicopter, Ultralight", image: "/generated_images/aviation_aircraft.png" },
  // Motorized Hobby
  { id: "rc", name: "RC & Hobby", icon: Gamepad2, description: "RC Cars, Crawlers, Drift", image: "/generated_images/rc_hobby_vehicles.png" },
  { id: "drones", name: "Drones & FPV", icon: Radio, description: "Racing, Camera, FPV", image: "/generated_images/drones_fpv.png" },
  { id: "modelaircraft", name: "Model Aircraft", icon: Plane, description: "RC Planes, Helis, Gliders", image: "/generated_images/model_aircraft.png" },
  { id: "slotcars", name: "Slot Cars", icon: Trophy, description: "1/32, 1/24, HO Scale", image: "/generated_images/slot_cars.png" },
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
  { id: "rcelectronics", name: "RC Electronics", icon: Radio, image: "/generated_images/rc_hobby_vehicles.png" },
  { id: "propellers", name: "Propellers & Rotors", icon: Fan, image: "/generated_images/drones_fpv.png" },
  { id: "lipobatteries", name: "LiPo Batteries", icon: Battery, image: "/generated_images/rc_hobby_vehicles.png" },
  { id: "rcbodies", name: "Bodies & Shells", icon: PaintBucket, image: "/generated_images/rc_hobby_vehicles.png" },
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
  rc: [
    { name: "AMain Hobbies", url: "https://www.amainhobbies.com", specialty: "RC Cars & Parts" },
    { name: "Horizon Hobby", url: "https://www.horizonhobby.com", specialty: "RC Vehicles & Aircraft" },
    { name: "Tower Hobbies", url: "https://www.towerhobbies.com", specialty: "RC Cars, Planes, Boats" },
    { name: "Redcat Racing", url: "https://www.redcatracing.com", specialty: "RC Trucks & Crawlers" },
    { name: "RC Planet", url: "https://www.rcplanet.com", specialty: "RC Cars & Slot Cars" },
    { name: "Traxxas", url: "https://traxxas.com", specialty: "RC Trucks & Accessories" },
  ],
  drones: [
    { name: "GetFPV", url: "https://www.getfpv.com", specialty: "FPV Drones & Parts" },
    { name: "BETAFPV", url: "https://betafpv.com", specialty: "FPV Racing Drones" },
    { name: "HobbyKing", url: "https://hobbyking.com", specialty: "RC & Drone Electronics" },
    { name: "RaceDayQuads", url: "https://www.racedayquads.com", specialty: "FPV Racing Parts" },
    { name: "Rotor Riot", url: "https://rotorriot.com", specialty: "FPV Gear & Apparel" },
    { name: "ChinaHobbyLine", url: "https://chinahobbyline.com", specialty: "LiPo Batteries" },
  ],
  modelaircraft: [
    { name: "Horizon Hobby", url: "https://www.horizonhobby.com", specialty: "E-flite & Blade Aircraft" },
    { name: "Tower Hobbies", url: "https://www.towerhobbies.com", specialty: "RC Planes & Helis" },
    { name: "Motion RC", url: "https://www.motionrc.com", specialty: "Scale RC Aircraft" },
    { name: "Hobby-Lobby", url: "https://www.hobby-lobby.com", specialty: "Balsa & Scale Kits" },
    { name: "Chief Aircraft", url: "https://www.chiefaircraft.com", specialty: "Giant Scale Planes" },
    { name: "AMain Hobbies", url: "https://www.amainhobbies.com", specialty: "Aircraft & Helicopter Parts" },
  ],
  slotcars: [
    { name: "Carrera Slots", url: "https://www.carreraslots.com", specialty: "Carrera & Scalextric" },
    { name: "LEB Hobbies", url: "https://www.lebhobbies.com", specialty: "NSR, Slot.it, Fly Cars" },
    { name: "Lucky Bob's", url: "https://www.luckybobs.com", specialty: "HO Scale Slot Cars" },
    { name: "Professor Motor", url: "https://www.professormotor.com", specialty: "Slot Car Parts & Track" },
    { name: "Hobby1", url: "https://hobby1.com", specialty: "Carrera & Auto World" },
    { name: "RC Planet", url: "https://www.rcplanet.com", specialty: "Slot Cars & Accessories" },
  ],
};

