import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Store, Users, MessageSquare, Settings, Star, MapPin, Phone, 
  Mail, Clock, Wrench, Send, ChevronRight, Loader2, Building2,
  UserPlus, Calendar, DollarSign, AlertCircle, CheckCircle, Eye,
  ClipboardList, FileText, Timer, Package, BarChart3, Camera,
  Car, Ship, Bike, Truck, Cog, Anchor, Zap, Tractor, Mountain,
  Play, Pause, Receipt, CreditCard, Search, Filter, ArrowUpDown,
  ChevronDown, MoreHorizontal, Edit, Trash2, ExternalLink, 
  CalendarDays, UserCheck, AlertTriangle, CircleDot, X, Link2,
  RefreshCw, ArrowRight, Sparkles, Database, Shield, Globe, Key, Copy, Activity
} from "lucide-react";

const VEHICLE_TYPES = [
  { id: "car", name: "Cars", icon: Car },
  { id: "truck", name: "Trucks", icon: Truck },
  { id: "motorcycle", name: "Motorcycles", icon: Bike },
  { id: "atv", name: "ATVs/UTVs", icon: Mountain },
  { id: "boat", name: "Boats/Marine", icon: Anchor },
  { id: "rv", name: "RVs", icon: Truck },
  { id: "diesel", name: "Diesel/Commercial", icon: Truck },
  { id: "small_engine", name: "Small Engines", icon: Cog },
  { id: "generator", name: "Generators", icon: Zap },
  { id: "tractor", name: "Tractors/Farm", icon: Tractor },
  { id: "classic", name: "Classics", icon: Car },
  { id: "exotic", name: "Exotics", icon: Car },
];

const ORDER_STATUSES = [
  { id: "pending", name: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { id: "checked_in", name: "Checked In", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "in_progress", name: "In Progress", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "waiting_parts", name: "Waiting Parts", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: "waiting_approval", name: "Waiting Approval", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { id: "completed", name: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { id: "picked_up", name: "Picked Up", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: string;
  reviewCount?: number;
  isActive: boolean;
  vehicleTypes?: string[];
  stripeAccountId?: string;
  stripeAccountStatus?: string;
  stripeOnboardingComplete?: boolean;
  createdAt: string;
}

interface RepairOrder {
  id: string;
  shopId: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  vehicleInfo?: string;
  vehicleType?: string;
  status: string;
  priority?: string;
  grandTotal?: string;
  paymentStatus?: string;
  promisedDate?: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  shopId: string;
  customerName?: string;
  customerPhone?: string;
  vehicleInfo?: string;
  serviceType?: string;
  scheduledStart: string;
  status: string;
}

interface Estimate {
  id: string;
  shopId: string;
  estimateNumber: string;
  customerName?: string;
  vehicleInfo?: string;
  grandTotal?: string;
  status: string;
  createdAt: string;
}

interface ApiCredential {
  id: string;
  shopId: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  environment: string;
  scopes: string[];
  rateLimitPerDay: number;
  requestCount: number;
  requestCountDaily: number;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiLogStats {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  avgResponseTime: number;
}

// Demo sample data for mechanics to explore
const DEMO_ORDERS: RepairOrder[] = [
  { id: "demo-1", shopId: "demo", orderNumber: "RO-00001", customerName: "John Smith", customerPhone: "(555) 123-4567", vehicleInfo: "2020 Toyota Camry", vehicleType: "car", status: "in_progress", priority: "normal", grandTotal: "485.00", paymentStatus: "pending", promisedDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: "demo-2", shopId: "demo", orderNumber: "RO-00002", customerName: "Sarah Johnson", customerPhone: "(555) 234-5678", vehicleInfo: "2018 Honda Civic", vehicleType: "car", status: "waiting_parts", priority: "high", grandTotal: "1,250.00", paymentStatus: "partial", promisedDate: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "demo-3", shopId: "demo", orderNumber: "RO-00003", customerName: "Mike Wilson", customerPhone: "(555) 345-6789", vehicleInfo: "2022 Yamaha WaveRunner", vehicleType: "boat", status: "completed", priority: "normal", grandTotal: "320.00", paymentStatus: "paid", promisedDate: new Date().toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "demo-4", shopId: "demo", orderNumber: "RO-00004", customerName: "Lisa Brown", customerPhone: "(555) 456-7890", vehicleInfo: "2019 Harley Davidson Sportster", vehicleType: "motorcycle", status: "pending", priority: "low", grandTotal: "175.00", paymentStatus: "pending", promisedDate: new Date(Date.now() + 259200000).toISOString(), createdAt: new Date().toISOString() },
];

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", shopId: "demo", customerName: "Tom Davis", customerPhone: "(555) 567-8901", vehicleInfo: "2021 Ford F-150", serviceType: "Oil Change", scheduledStart: new Date(Date.now() + 3600000).toISOString(), status: "confirmed" },
  { id: "apt-2", shopId: "demo", customerName: "Emily Chen", customerPhone: "(555) 678-9012", vehicleInfo: "2020 Tesla Model 3", serviceType: "Tire Rotation", scheduledStart: new Date(Date.now() + 7200000).toISOString(), status: "confirmed" },
  { id: "apt-3", shopId: "demo", customerName: "Robert Garcia", customerPhone: "(555) 789-0123", vehicleInfo: "2017 Polaris RZR", serviceType: "Full Service", scheduledStart: new Date(Date.now() + 86400000).toISOString(), status: "pending" },
];

const DEMO_ESTIMATES: Estimate[] = [
  { id: "est-1", shopId: "demo", estimateNumber: "EST-00001", customerName: "Amanda White", vehicleInfo: "2019 Chevy Tahoe", grandTotal: "2,450.00", status: "sent", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "est-2", shopId: "demo", estimateNumber: "EST-00002", customerName: "David Lee", vehicleInfo: "2021 Sea-Doo Spark", grandTotal: "890.00", status: "approved", createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const DEMO_INVENTORY = [
  { id: "inv-1", partNumber: "OIL-5W30", name: "Synthetic Oil 5W-30 (5qt)", quantity: 24, reorderPoint: 10, cost: "28.99", price: "42.99", category: "Fluids" },
  { id: "inv-2", partNumber: "FLT-OIL-001", name: "Oil Filter (Universal)", quantity: 18, reorderPoint: 12, cost: "8.50", price: "14.99", category: "Filters" },
  { id: "inv-3", partNumber: "BRK-PAD-FR", name: "Brake Pads (Front Set)", quantity: 6, reorderPoint: 4, cost: "45.00", price: "89.99", category: "Brakes" },
  { id: "inv-4", partNumber: "SPK-PLG-4PK", name: "Spark Plugs (4-Pack)", quantity: 15, reorderPoint: 8, cost: "18.00", price: "34.99", category: "Ignition" },
  { id: "inv-5", partNumber: "BELT-SERP", name: "Serpentine Belt", quantity: 8, reorderPoint: 5, cost: "32.00", price: "59.99", category: "Belts" },
];

const API_SCOPES = [
  { id: 'orders:read', name: 'Read Orders', description: 'View repair orders and their status' },
  { id: 'orders:write', name: 'Write Orders', description: 'Create and update repair orders' },
  { id: 'customers:read', name: 'Read Customers', description: 'View customer information' },
  { id: 'customers:write', name: 'Write Customers', description: 'Create and update customers' },
  { id: 'appointments:read', name: 'Read Appointments', description: 'View scheduled appointments' },
  { id: 'appointments:write', name: 'Write Appointments', description: 'Create and update appointments' },
  { id: 'estimates:read', name: 'Read Estimates', description: 'View estimates and quotes' },
  { id: 'estimates:write', name: 'Write Estimates', description: 'Create and update estimates' },
  { id: 'analytics:read', name: 'Read Analytics', description: 'View shop analytics and reports' },
  { id: 'shop:read', name: 'Read Shop', description: 'View shop profile and locations' },
  { id: 'shop:write', name: 'Write Shop', description: 'Update shop profile' },
  { id: 'staff:read', name: 'Read Staff', description: 'View team members' },
  { id: 'staff:write', name: 'Write Staff', description: 'Manage team members' },
];

// Affiliate Partners - We earn commission from these
const AFFILIATE_VENDORS = [
  { id: "amazon", name: "Amazon Automotive", logo: "📦", url: "https://www.amazon.com/s?k=", tag: "garagebot-20", network: "Amazon Associates", isAffiliate: true },
  { id: "ebay", name: "eBay Motors", logo: "🛒", url: "https://www.ebay.com/sch/i.html?_nkw=", campid: "5339140935", network: "eBay Partner Network", isAffiliate: true },
  { id: "advance", name: "Advance Auto Parts", logo: "🚗", url: "https://shop.advanceautoparts.com/web/SearchResults?searchTerm=", network: "CJ Affiliate", isAffiliate: true },
  { id: "partzilla", name: "Partzilla (Powersports)", logo: "🏍️", url: "https://www.partzilla.com/search?q=", network: "ShareASale", isAffiliate: true },
  { id: "guta", name: "Guta Auto Parts", logo: "⚙️", url: "https://www.guta.com/search?q=", awinId: "105913", network: "AWIN", isAffiliate: true },
  { id: "buyautoparts", name: "BuyAutoParts.com", logo: "🔧", url: "https://www.buyautoparts.com/searchresults.html?keywords=", network: "CJ Affiliate", isAffiliate: true },
  { id: "carparts", name: "CarParts.com", logo: "🚘", url: "https://www.carparts.com/search?q=", network: "CJ Affiliate", isAffiliate: true },
  { id: "partsgeek", name: "PartsGeek", logo: "🤓", url: "https://www.partsgeek.com/search/?q=", network: "ShareASale", isAffiliate: true },
  { id: "carid", name: "CARiD", logo: "🏎️", url: "https://www.carid.com/search/?q=", network: "CJ Affiliate", isAffiliate: true },
];

// Direct Search Links - No affiliate yet, but comprehensive coverage
const DIRECT_VENDORS = [
  // National Auto Parts Chains
  { id: "autozone", name: "AutoZone", logo: "🔴", url: "https://www.autozone.com/searchresult?searchText=", category: "National Chain", isAffiliate: false },
  { id: "oreilly", name: "O'Reilly Auto Parts", logo: "🟢", url: "https://www.oreillyauto.com/shop/b/search?q=", category: "National Chain", isAffiliate: false },
  { id: "napa", name: "NAPA Auto Parts", logo: "🔵", url: "https://www.napaonline.com/en/search?q=", category: "National Chain", isAffiliate: false },
  { id: "rockauto", name: "RockAuto", logo: "🪨", url: "https://www.rockauto.com/en/partsearch/?partnum=", category: "Online Discount", isAffiliate: false },
  { id: "pepboys", name: "Pep Boys", logo: "🔶", url: "https://www.pepboys.com/catalogsearch/result/?q=", category: "National Chain", isAffiliate: false },
  
  // Performance & Racing
  { id: "summit", name: "Summit Racing", logo: "🏁", url: "https://www.summitracing.com/search?keyword=", category: "Performance", isAffiliate: false },
  { id: "jegs", name: "JEGS", logo: "🏆", url: "https://www.jegs.com/webapp/wcs/stores/servlet/SearchDisplay?searchTerm=", category: "Performance", isAffiliate: false },
  { id: "speedwaymotors", name: "Speedway Motors", logo: "⚡", url: "https://www.speedwaymotors.com/search/?q=", category: "Performance", isAffiliate: false },
  { id: "holley", name: "Holley Performance", logo: "🔥", url: "https://www.holley.com/search/?q=", category: "Performance", isAffiliate: false },
  
  // Off-Road & 4x4
  { id: "4wheelparts", name: "4 Wheel Parts", logo: "🛻", url: "https://www.4wheelparts.com/search?q=", category: "Off-Road", isAffiliate: false },
  { id: "extremeterrain", name: "ExtremeTerrain (Jeep)", logo: "🚙", url: "https://www.extremeterrain.com/search/?q=", category: "Off-Road", isAffiliate: false },
  { id: "americantrucks", name: "AmericanTrucks", logo: "🛞", url: "https://www.americantrucks.com/search/?q=", category: "Trucks", isAffiliate: false },
  { id: "roughcountry", name: "Rough Country", logo: "🏔️", url: "https://www.roughcountry.com/search?q=", category: "Off-Road", isAffiliate: false },
  
  // Motorcycle & Powersports
  { id: "revzilla", name: "RevZilla (Motorcycle)", logo: "🏍️", url: "https://www.revzilla.com/search?query=", category: "Motorcycle", isAffiliate: false },
  { id: "denniskirk", name: "Dennis Kirk", logo: "🛵", url: "https://www.denniskirk.com/search?q=", category: "Powersports", isAffiliate: false },
  { id: "rockymountainatvmc", name: "Rocky Mountain ATV/MC", logo: "🏕️", url: "https://www.rockymountainatvmc.com/search?q=", category: "Powersports", isAffiliate: false },
  { id: "bikebandit", name: "BikeBandit", logo: "🔩", url: "https://www.bikebandit.com/search?q=", category: "Motorcycle", isAffiliate: false },
  
  // Marine & Boat
  { id: "westmarine", name: "West Marine", logo: "⚓", url: "https://www.westmarine.com/search?q=", category: "Marine", isAffiliate: false },
  { id: "boatid", name: "BOATiD", logo: "🚤", url: "https://www.boatid.com/search/?q=", category: "Marine", isAffiliate: false },
  { id: "marineparts", name: "MarineParts.com", logo: "🌊", url: "https://www.marineparts.com/search?q=", category: "Marine", isAffiliate: false },
  
  // Heavy Duty & Diesel
  { id: "fleetpride", name: "FleetPride (Heavy Duty)", logo: "🚚", url: "https://www.fleetpride.com/parts/search?q=", category: "Heavy Duty", isAffiliate: false },
  { id: "dieselpower", name: "Diesel Power Products", logo: "💨", url: "https://www.dieselpowerproducts.com/catalogsearch/result/?q=", category: "Diesel", isAffiliate: false },
  { id: "xtremediesel", name: "Xtreme Diesel", logo: "🔋", url: "https://www.xtremeoutfitters.com/search?q=", category: "Diesel", isAffiliate: false },
  
  // Tires
  { id: "tirerack", name: "Tire Rack", logo: "⭕", url: "https://www.tirerack.com/tires/TireSearchResults.jsp?search=", category: "Tires", isAffiliate: false },
  { id: "discounttire", name: "Discount Tire", logo: "🛞", url: "https://www.discounttire.com/search?q=", category: "Tires", isAffiliate: false },
  { id: "simpletire", name: "SimpleTire", logo: "🔘", url: "https://simpletire.com/search?q=", category: "Tires", isAffiliate: false },
  
  // RV & Trailer
  { id: "rvpartscountry", name: "RV Parts Country", logo: "🏕️", url: "https://rvpartscountry.com/search?q=", category: "RV", isAffiliate: false },
  { id: "dyersonline", name: "Dyers (RV/Marine)", logo: "🚐", url: "https://www.dyersonline.com/search?q=", category: "RV", isAffiliate: false },
  { id: "etrailer", name: "etrailer", logo: "🚛", url: "https://www.etrailer.com/search?q=", category: "Trailer", isAffiliate: false },
  
  // European & Import
  { id: "fcpeuro", name: "FCP Euro", logo: "🇪🇺", url: "https://www.fcpeuro.com/search?q=", category: "European", isAffiliate: false },
  { id: "pelicanaparts", name: "Pelican Parts", logo: "🐦", url: "https://www.pelicanparts.com/catalog/search.htm?keywords=", category: "European", isAffiliate: false },
  { id: "bavauto", name: "Bavarian Autosport", logo: "🇩🇪", url: "https://www.bavauto.com/catalogsearch/result/?q=", category: "European", isAffiliate: false },
  
  // Classic & Restoration
  { id: "classicind", name: "Classic Industries", logo: "🚗", url: "https://www.classicindustries.com/search/?q=", category: "Classic", isAffiliate: false },
  { id: "yearone", name: "Year One", logo: "📅", url: "https://www.yearone.com/Catalog?SearchTerm=", category: "Classic", isAffiliate: false },
  { id: "opgi", name: "OPGI (GM Restoration)", logo: "🔧", url: "https://www.opgi.com/search/?q=", category: "Classic", isAffiliate: false },
  
  // Specialty & OEM
  { id: "gmpartsdirect", name: "GM Parts Direct", logo: "🔶", url: "https://www.gmpartsdirect.com/search?q=", category: "OEM", isAffiliate: false },
  { id: "fordparts", name: "Ford Parts", logo: "🔵", url: "https://parts.ford.com/search?q=", category: "OEM", isAffiliate: false },
  { id: "moparonlineparts", name: "Mopar Online Parts", logo: "⬛", url: "https://www.moparonlineparts.com/search?q=", category: "OEM", isAffiliate: false },
  { id: "hondapartsonline", name: "Honda Parts Online", logo: "🔴", url: "https://www.hondapartsonline.net/search?q=", category: "OEM", isAffiliate: false },
  { id: "toyotapartsdeal", name: "Toyota Parts Deal", logo: "🟡", url: "https://www.toyotapartsdeal.com/search?q=", category: "OEM", isAffiliate: false },
];

// Local Chains with Store Pickup (BOPIS) - Priority when ZIP provided
const LOCAL_CHAINS = [
  { 
    id: "autozone", 
    name: "AutoZone", 
    logo: "🔴", 
    searchUrl: "https://www.autozone.com/searchresult?searchText=",
    storeLocatorUrl: "https://www.autozone.com/locations?location=",
    bopisNote: "Free Same Day Pickup",
    stores: "6,400+"
  },
  { 
    id: "oreilly", 
    name: "O'Reilly Auto Parts", 
    logo: "🟢", 
    searchUrl: "https://www.oreillyauto.com/shop/b/search?q=",
    storeLocatorUrl: "https://www.oreillyauto.com/store-locator?location=",
    bopisNote: "Free In-Store Pickup",
    stores: "6,100+"
  },
  { 
    id: "napa", 
    name: "NAPA Auto Parts", 
    logo: "🔵", 
    searchUrl: "https://www.napaonline.com/en/search?q=",
    storeLocatorUrl: "https://www.napaonline.com/en/auto-parts-stores-near-me?location=",
    bopisNote: "Pick Up In Store",
    stores: "6,000+"
  },
  { 
    id: "advance", 
    name: "Advance Auto Parts", 
    logo: "🚗", 
    searchUrl: "https://shop.advanceautoparts.com/web/SearchResults?searchTerm=",
    storeLocatorUrl: "https://stores.advanceautoparts.com/search?q=",
    bopisNote: "Free Same Day Delivery*",
    stores: "4,700+",
    isAffiliate: true
  },
  { 
    id: "pepboys", 
    name: "Pep Boys", 
    logo: "🔶", 
    searchUrl: "https://www.pepboys.com/catalogsearch/result/?q=",
    storeLocatorUrl: "https://www.pepboys.com/stores?location=",
    bopisNote: "Store Pickup Available",
    stores: "900+"
  },
];

// Combined for total count display
const PARTS_VENDORS = [...AFFILIATE_VENDORS, ...DIRECT_VENDORS];
const TOTAL_RETAILERS = AFFILIATE_VENDORS.length + DIRECT_VENDORS.length + LOCAL_CHAINS.length;

function PartsOrderingTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [zipCode, setZipCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('garagebot_zip') || "";
    }
    return "";
  });
  const [showZipInput, setShowZipInput] = useState(false);

  // Save ZIP to localStorage
  const handleZipChange = (zip: string) => {
    const cleaned = zip.replace(/\D/g, '').slice(0, 5);
    setZipCode(cleaned);
    if (cleaned.length === 5) {
      localStorage.setItem('garagebot_zip', cleaned);
      setShowZipInput(false);
    }
  };

  const getVehicleKeyword = () => {
    if (!vehicleFilter) return "";
    const vehicleKeywords: Record<string, string> = {
      car: "automotive",
      truck: "truck",
      motorcycle: "motorcycle",
      atv: "atv utv",
      boat: "marine boat",
      rv: "rv motorhome",
      diesel: "diesel heavy duty",
      small_engine: "small engine",
      generator: "generator",
      tractor: "tractor farm",
      classic: "classic vintage",
      exotic: "performance"
    };
    return vehicleKeywords[vehicleFilter] || "";
  };

  const handleSearch = (vendor: typeof PARTS_VENDORS[0]) => {
    const vehicleKeyword = getVehicleKeyword();
    const fullQuery = vehicleKeyword ? `${searchQuery} ${vehicleKeyword}` : searchQuery;
    let url = vendor.url + encodeURIComponent(fullQuery);
    if ('tag' in vendor && vendor.tag) {
      url += `&tag=${vendor.tag}`;
    }
    if ('campid' in vendor && vendor.campid) {
      url += `&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=${vendor.campid}&toolid=10001`;
    }
    window.open(url, "_blank");
  };

  const handleLocalSearch = (chain: typeof LOCAL_CHAINS[0]) => {
    const vehicleKeyword = getVehicleKeyword();
    const fullQuery = vehicleKeyword ? `${searchQuery} ${vehicleKeyword}` : searchQuery;
    // For Advance Auto (affiliate partner), use affiliate link
    if (chain.id === 'advance' && 'isAffiliate' in chain && chain.isAffiliate) {
      const affiliateVendor = AFFILIATE_VENDORS.find(v => v.id === 'advance');
      if (affiliateVendor) {
        handleSearch(affiliateVendor);
        return;
      }
    }
    // Otherwise open direct search results
    const url = chain.searchUrl + encodeURIComponent(fullQuery);
    window.open(url, "_blank");
  };

  const handleFindStores = (chain: typeof LOCAL_CHAINS[0]) => {
    if (zipCode.length === 5) {
      window.open(chain.storeLocatorUrl + zipCode, "_blank");
    } else {
      setShowZipInput(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-teal-500/20 border-green-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Wrench className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-tech font-bold uppercase">Order Parts</h3>
              <p className="text-muted-foreground">Search across {TOTAL_RETAILERS}+ retailers with affiliate savings</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Compare prices instantly</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              <span>Earn affiliate commissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-blue-500" />
              <span>Track order history</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 glass-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for parts... (e.g., brake pads, oil filter, spark plugs)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
              data-testid="input-parts-search"
            />
          </div>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-40" data-testid="select-vehicle-filter">
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Vehicles</SelectItem>
              {VEHICLE_TYPES.map(vt => (
                <SelectItem key={vt.id} value={vt.id}>
                  <span className="flex items-center gap-2">
                    <vt.icon className="w-4 h-4" />
                    {vt.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* ZIP Code for Local Stores */}
          <div className="flex items-center gap-2">
            {showZipInput ? (
              <div className="flex items-center gap-1">
                <Input
                  placeholder="ZIP"
                  value={zipCode}
                  onChange={(e) => handleZipChange(e.target.value)}
                  className="w-20 h-10 text-center"
                  maxLength={5}
                  data-testid="input-zip-code"
                />
                <Button size="sm" variant="ghost" onClick={() => setShowZipInput(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-10"
                onClick={() => setShowZipInput(true)}
                data-testid="button-set-zip"
              >
                <MapPin className="w-4 h-4" />
                {zipCode ? zipCode : "Set ZIP"}
              </Button>
            )}
          </div>
        </div>

        {searchQuery ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <h4 className="font-tech font-bold text-lg">AFFILIATE PARTNERS</h4>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">We Earn Commission</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Search "<span className="text-primary font-medium">{searchQuery}</span>" at our partner retailers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AFFILIATE_VENDORS.map((vendor) => (
                  <Card 
                    key={vendor.id}
                    className="p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border-yellow-500/30 hover:border-yellow-500/50 transition-all cursor-pointer group"
                    onClick={() => handleSearch(vendor)}
                    data-testid={`card-affiliate-${vendor.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{vendor.logo}</span>
                        <div>
                          <h4 className="font-tech font-bold text-sm">{vendor.name}</h4>
                          <p className="text-xs text-yellow-500/80">{vendor.network}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs border-yellow-500/50 hover:bg-yellow-500/20" data-testid={`button-search-${vendor.id}`}>
                        Search <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Local Pickup Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <h4 className="font-tech font-bold text-lg">LOCAL PICKUP</h4>
                <Badge variant="outline" className="text-green-500 border-green-500/50">Same Day Available</Badge>
                {zipCode && (
                  <span className="text-xs text-muted-foreground ml-2">Near {zipCode}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Get parts today from stores near you - search then check local availability:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {LOCAL_CHAINS.map((chain) => (
                  <Card 
                    key={chain.id}
                    className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30 hover:border-green-500/50 transition-all"
                    data-testid={`card-local-${chain.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{chain.logo}</span>
                        <div>
                          <h4 className="font-tech font-bold text-sm">{chain.name}</h4>
                          <p className="text-xs text-green-500/80">{chain.stores} stores</p>
                        </div>
                      </div>
                      {'isAffiliate' in chain && chain.isAffiliate && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 text-xs">Affiliate</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                        {chain.bopisNote}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => handleLocalSearch(chain)}
                        data-testid={`button-search-local-${chain.id}`}
                      >
                        Search Parts <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 h-7 text-xs border-green-500/50 hover:bg-green-500/20"
                        onClick={() => handleFindStores(chain)}
                        data-testid={`button-find-stores-${chain.id}`}
                      >
                        <MapPin className="w-3 h-3" /> Stores
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-tech font-bold text-lg text-muted-foreground">ALSO COMPARE AT</h4>
                <Badge variant="outline" className="text-muted-foreground">{DIRECT_VENDORS.length} More Retailers</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Direct search links to additional retailers (affiliate partnerships pending):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {DIRECT_VENDORS.map((vendor) => (
                  <Card 
                    key={vendor.id}
                    className="p-2 bg-muted/10 hover:bg-muted/20 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => handleSearch(vendor)}
                    data-testid={`card-direct-${vendor.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{vendor.logo}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-tech font-bold text-xs truncate">{vendor.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{vendor.category}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-mono">Enter a part name or number to search across all retailers</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Car className="w-5 h-5 text-blue-500" />
            </div>
            <h4 className="font-tech font-bold">Auto Parts</h4>
          </div>
          <p className="text-xs text-muted-foreground">Cars, trucks, SUVs - OEM and aftermarket</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Bike className="w-5 h-5 text-orange-500" />
            </div>
            <h4 className="font-tech font-bold">Powersports</h4>
          </div>
          <p className="text-xs text-muted-foreground">Motorcycles, ATVs, UTVs, dirt bikes</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Anchor className="w-5 h-5 text-cyan-500" />
            </div>
            <h4 className="font-tech font-bold">Marine</h4>
          </div>
          <p className="text-xs text-muted-foreground">Boats, PWC, outboard motors</p>
        </Card>
      </div>
    </div>
  );
}

function PartnerApiTab({ shopId, toast }: { shopId: string; toast: any }) {
  const queryClient = useQueryClient();
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [newCredential, setNewCredential] = useState<ApiCredential | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    environment: 'production',
    scopes: ['orders:read'] as string[],
    rateLimitPerDay: 10000
  });

  const { data: credentials, isLoading } = useQuery<ApiCredential[]>({
    queryKey: ['partner-api-credentials', shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch credentials');
      return res.json();
    }
  });

  const { data: logsData } = useQuery<{ logs: any[]; stats: ApiLogStats }>({
    queryKey: ['partner-api-logs', shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/api-logs?limit=20`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newKeyForm) => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create credential');
      return res.json();
    },
    onSuccess: (data) => {
      setNewCredential(data);
      setCreateKeyOpen(false);
      queryClient.invalidateQueries({ queryKey: ['partner-api-credentials', shopId] });
      toast({ title: 'API Key Created', description: 'Save your credentials securely!' });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error('Failed to update credential');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-api-credentials', shopId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shops/${shopId}/api-credentials/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete credential');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-api-credentials', shopId] });
      toast({ title: 'API Key Deleted' });
    }
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleScope = (scope: string) => {
    setNewKeyForm(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-teal-500/20 border-green-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Key className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-tech font-bold uppercase">Partner API</h3>
              <p className="text-muted-foreground">Programmatic access to your shop data</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>RESTful JSON API</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Scoped permissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-purple-500" />
              <span>Usage analytics</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {logsData?.stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 glass-card">
            <div className="text-sm text-muted-foreground mb-1">Total Requests (30d)</div>
            <div className="text-2xl font-tech font-bold">{logsData.stats.totalRequests.toLocaleString()}</div>
          </Card>
          <Card className="p-4 glass-card">
            <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
            <div className="text-2xl font-tech font-bold text-green-500">
              {logsData.stats.totalRequests > 0 
                ? Math.round((logsData.stats.successRequests / logsData.stats.totalRequests) * 100)
                : 100}%
            </div>
          </Card>
          <Card className="p-4 glass-card">
            <div className="text-sm text-muted-foreground mb-1">Errors (30d)</div>
            <div className="text-2xl font-tech font-bold text-red-500">{logsData.stats.errorRequests}</div>
          </Card>
          <Card className="p-4 glass-card">
            <div className="text-sm text-muted-foreground mb-1">Avg Response</div>
            <div className="text-2xl font-tech font-bold">{logsData.stats.avgResponseTime}ms</div>
          </Card>
        </div>
      )}

      {/* New Credential Modal */}
      {newCredential && (
        <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-tech font-bold text-lg">Save Your Credentials</h4>
              <p className="text-sm text-muted-foreground">The API secret will only be shown once. Save it securely now!</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase">API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 rounded bg-black/30 font-mono text-sm break-all">{newCredential.apiKey}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(newCredential.apiKey, 'key')} data-testid="copy-api-key">
                  {copiedField === 'key' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase">API Secret</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 rounded bg-black/30 font-mono text-sm break-all">{newCredential.apiSecret}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(newCredential.apiSecret, 'secret')} data-testid="copy-api-secret">
                  {copiedField === 'secret' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={() => setNewCredential(null)} className="mt-4" data-testid="dismiss-credentials">
              I've Saved My Credentials
            </Button>
          </div>
        </Card>
      )}

      {/* API Keys */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-tech font-bold text-lg uppercase">API Keys</h4>
          <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="create-api-key">
                <Plus className="w-4 h-4" /> Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>Generate a new API key with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={newKeyForm.name} 
                    onChange={e => setNewKeyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Production Integration"
                    data-testid="api-key-name"
                  />
                </div>
                <div>
                  <Label>Environment</Label>
                  <Select 
                    value={newKeyForm.environment} 
                    onValueChange={v => setNewKeyForm(prev => ({ ...prev, environment: v }))}
                  >
                    <SelectTrigger data-testid="api-key-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-3 block">Permissions (Scopes)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {API_SCOPES.map(scope => (
                      <div 
                        key={scope.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          newKeyForm.scopes.includes(scope.id)
                            ? 'bg-primary/10 border-primary/50'
                            : 'glass-card border-border hover:border-primary/30'
                        }`}
                        onClick={() => toggleScope(scope.id)}
                        data-testid={`scope-${scope.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={newKeyForm.scopes.includes(scope.id)} 
                            onCheckedChange={() => toggleScope(scope.id)}
                          />
                          <div>
                            <div className="font-medium text-sm">{scope.name}</div>
                            <div className="text-xs text-muted-foreground">{scope.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Daily Rate Limit</Label>
                  <Input 
                    type="number"
                    value={newKeyForm.rateLimitPerDay} 
                    onChange={e => setNewKeyForm(prev => ({ ...prev, rateLimitPerDay: parseInt(e.target.value) || 10000 }))}
                    data-testid="api-key-rate-limit"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createMutation.mutate(newKeyForm)}
                  disabled={!newKeyForm.name || newKeyForm.scopes.length === 0 || createMutation.isPending}
                  data-testid="submit-create-api-key"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                  Generate API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : credentials?.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials?.map(cred => (
              <Card key={cred.id} className={`p-4 ${cred.isActive ? 'glass-card' : 'glass-card opacity-60'}`} data-testid={`api-credential-${cred.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cred.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      <Key className={`w-5 h-5 ${cred.isActive ? 'text-green-500' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {cred.name}
                        <Badge variant="outline" className={cred.environment === 'sandbox' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}>
                          {cred.environment}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{cred.apiKey.slice(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm">{cred.requestCountDaily?.toLocaleString() || 0} / {cred.rateLimitPerDay?.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">requests today</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={cred.isActive ? 'destructive' : 'default'}
                        onClick={() => toggleMutation.mutate({ id: cred.id, isActive: !cred.isActive })}
                        data-testid={`toggle-${cred.id}`}
                      >
                        {cred.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(cred.id)}
                        data-testid={`delete-${cred.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {cred.scopes?.map(scope => (
                    <Badge key={scope} variant="outline" className="text-[10px] bg-primary/5">{scope}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* API Documentation Link */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/5 to-transparent border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-tech font-bold text-lg mb-2">API Documentation</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Access your shop data programmatically. Base URL: <code className="bg-black/30 px-2 py-1 rounded text-primary">/api/partner/v1</code>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded glass-card border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/shop</div>
              </div>
              <div className="p-3 rounded glass-card border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/orders</div>
              </div>
              <div className="p-3 rounded glass-card border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/appointments</div>
              </div>
              <div className="p-3 rounded glass-card border">
                <div className="font-mono text-xs text-muted-foreground">GET</div>
                <div className="font-mono text-sm">/analytics</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function MechanicsGarage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demoMode, setDemoMode] = useState(true); // Default to demo mode
  const [createShopOpen, setCreateShopOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [createAppointmentOpen, setCreateAppointmentOpen] = useState(false);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  
  const [newShop, setNewShop] = useState({ 
    name: "", 
    description: "", 
    address: "", 
    city: "", 
    state: "", 
    zipCode: "", 
    phone: "", 
    email: "",
    vehicleTypes: [] as string[]
  });

  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    vehicleInfo: "",
    vehicleType: "car",
    notes: "",
    priority: "normal"
  });

  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    customerPhone: "",
    vehicleInfo: "",
    serviceType: "",
    scheduledStart: "",
    notes: ""
  });

  const { data: myShops = [], isLoading: shopsLoading } = useQuery<Shop[]>({
    queryKey: ["/api/my-shops"],
    enabled: !!user,
  });

  const { data: repairOrders = [], isLoading: ordersLoading } = useQuery<RepairOrder[]>({
    queryKey: ["/api/shops", selectedShop?.id, "repair-orders"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/repair-orders`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/shops", selectedShop?.id, "appointments"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/appointments`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/shops", selectedShop?.id, "estimates"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/estimates`);
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const createShopMutation = useMutation({
    mutationFn: async (shop: typeof newShop) => {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...shop, vehicleTypes: selectedVehicleTypes })
      });
      if (!res.ok) throw new Error("Failed to create shop");
      return res.json();
    },
    onSuccess: (shop) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-shops"] });
      setCreateShopOpen(false);
      setNewShop({ name: "", description: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "", vehicleTypes: [] });
      setSelectedVehicleTypes([]);
      setSelectedShop(shop);
      setDemoMode(false); // Auto-switch to live mode when shop created
      toast({ title: "Shop Created", description: `${shop.name} is now registered` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create shop", variant: "destructive" });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (order: typeof newOrder) => {
      if (!selectedShop) throw new Error("No shop selected");
      const res = await fetch(`/api/shops/${selectedShop.id}/repair-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (!res.ok) throw new Error("Failed to create order");
      return res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shops", selectedShop?.id, "repair-orders"] });
      setCreateOrderOpen(false);
      setNewOrder({ customerName: "", customerPhone: "", customerEmail: "", vehicleInfo: "", vehicleType: "car", notes: "", priority: "normal" });
      toast({ title: "Repair Order Created", description: `Order #${order.orderNumber} created` });
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (apt: typeof newAppointment) => {
      if (!selectedShop) throw new Error("No shop selected");
      const res = await fetch(`/api/shops/${selectedShop.id}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apt)
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shops", selectedShop?.id, "appointments"] });
      setCreateAppointmentOpen(false);
      setNewAppointment({ customerName: "", customerPhone: "", vehicleInfo: "", serviceType: "", scheduledStart: "", notes: "" });
      toast({ title: "Appointment Scheduled" });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
    return (
      <Badge variant="outline" className={`${statusConfig.color} text-xs font-mono`}>
        {statusConfig.name}
      </Badge>
    );
  };

  const getVehicleIcon = (type: string) => {
    const vehicleType = VEHICLE_TYPES.find(v => v.id === type);
    const IconComponent = vehicleType?.icon || Car;
    return <IconComponent className="w-4 h-4" />;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="max-w-6xl mx-auto px-4 pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-12">
            <Wrench className="w-24 h-24 mx-auto mb-6 text-primary/30" />
            <h1 className="text-3xl font-tech font-bold uppercase text-primary mb-4">Mechanics Garage</h1>
            <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
              Professional shop management for ALL vehicle types - cars, trucks, boats, ATVs, motorcycles, small engines, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {VEHICLE_TYPES.slice(0, 8).map(vt => (
                <Badge key={vt.id} variant="outline" className="gap-1 text-xs">
                  <vt.icon className="w-3 h-3" />
                  {vt.name}
                </Badge>
              ))}
            </div>
            <Button size="lg" className="font-tech uppercase" onClick={() => window.location.href = "/auth"} data-testid="button-login">
              Sign In with PIN
            </Button>
          </div>

          {/* Competitive Comparison Section */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-primary/20 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-tech font-bold uppercase text-primary mb-2">Why Choose Mechanics Garage?</h2>
              <p className="text-sm text-muted-foreground">Compare us to the industry leaders</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-left py-3 px-4 font-tech uppercase text-xs">Feature</th>
                    <th className="text-center py-3 px-4 font-tech uppercase text-xs text-primary">GarageBot</th>
                    <th className="text-center py-3 px-4 font-tech uppercase text-xs text-muted-foreground">AutoLeap</th>
                    <th className="text-center py-3 px-4 font-tech uppercase text-xs text-muted-foreground">Tekmetric</th>
                    <th className="text-center py-3 px-4 font-tech uppercase text-xs text-muted-foreground">Shopmonkey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  <tr>
                    <td className="py-3 px-4 font-medium">Monthly Price</td>
                    <td className="py-3 px-4 text-center font-bold text-green-400">$49/mo</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">$179/mo</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">$179/mo</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">$179/mo</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Parts Vendors Integrated</td>
                    <td className="py-3 px-4 text-center font-bold text-green-400">40+</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">Limited</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">15+</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">10+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Multi-Vehicle Types (Boats, ATVs, RVs)</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Digital Vehicle Inspections (DVI)</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Integrated Payments</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Automated Reminders</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Analytics & Reporting</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">AI-Powered Assistant</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-xs">Add-on</td>
                    <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Partner API Access</td>
                    <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-xs">Enterprise</td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-xs">Enterprise</td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-xs">Enterprise</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-green-500/5 border-green-500/20 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-tech font-bold uppercase text-sm mb-1">Save $130+/month</h3>
              <p className="text-xs text-muted-foreground">Same features, fraction of the cost</p>
            </Card>
            <Card className="p-4 bg-primary/5 border-primary/20 text-center">
              <Wrench className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-tech font-bold uppercase text-sm mb-1">40+ Parts Vendors</h3>
              <p className="text-xs text-muted-foreground">More sources than any competitor</p>
            </Card>
            <Card className="p-4 bg-blue-500/5 border-blue-500/20 text-center">
              <Car className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-tech font-bold uppercase text-sm mb-1">All Vehicle Types</h3>
              <p className="text-xs text-muted-foreground">Cars, boats, ATVs, RVs & more</p>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="font-tech uppercase" onClick={() => window.location.href = "/auth"} data-testid="button-get-started-free">
              Get Started Free
            </Button>
            <p className="text-xs text-muted-foreground mt-2">No credit card required for demo</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Demo Mode Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className={`p-4 ${demoMode ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-yellow-500/20 border-amber-500/30' : 'bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-teal-500/20 border-green-500/30'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${demoMode ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                  {demoMode ? <Play className="w-5 h-5 text-amber-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div>
                  <h3 className="font-tech font-bold uppercase text-sm">
                    {demoMode ? 'Demo Mode Active' : 'Live Shop Connected'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {demoMode ? 'Explore all features with sample data - no account needed' : `Managing: ${selectedShop?.name || 'Your Shop'}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 font-tech text-xs"
                  onClick={() => setDemoMode(!demoMode)}
                  data-testid="button-toggle-demo"
                >
                  {demoMode ? <><Building2 className="w-3 h-3" /> Switch to Live</> : <><Eye className="w-3 h-3" /> Try Demo</>}
                </Button>
                {demoMode && (
                  <Button
                    size="sm"
                    className="gap-1 font-tech text-xs bg-primary"
                    onClick={() => window.location.href = "/auth"}
                    data-testid="button-start-free"
                  >
                    <Sparkles className="w-3 h-3" /> Start Free
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Integration Messaging Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-tech font-bold uppercase text-sm flex items-center gap-2">
                    Sync Your Existing Software
                    <Badge className="bg-primary/20 text-primary text-[9px]">API READY</Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Already using shop software? We can integrate with most POS, inventory, and scheduling systems via our Partner API.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Mitchell1</Badge>
                <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> ShopWare</Badge>
                <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Tekmetric</Badge>
                <Badge variant="outline" className="gap-1"><RefreshCw className="w-3 h-3 text-primary" /> Custom</Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
          <div className="md:col-span-8">
            <Card className="glass-card border-primary/20 p-4 h-full">
              <h1 className="text-2xl font-tech font-bold uppercase text-primary flex items-center gap-2" data-testid="text-page-title">
                <Wrench className="w-5 h-5" />
                Mechanics Garage
              </h1>
              <p className="text-muted-foreground text-xs font-mono">
                REPAIR ORDERS • ESTIMATES • SCHEDULING
              </p>
            </Card>
          </div>
          <div className="md:col-span-4">
            <Card className="glass-card border-primary/20 p-4 h-full flex items-center justify-center">
              <Dialog open={createShopOpen} onOpenChange={setCreateShopOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 font-tech uppercase text-xs" data-testid="button-register-shop">
                    <Plus className="w-3 h-3" /> Register Shop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-tech text-xl uppercase">Register Your Shop</DialogTitle>
                <DialogDescription>Add your repair shop to Mechanics Garage</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Shop Name *</Label>
                    <Input 
                      value={newShop.name} 
                      onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} 
                      placeholder="Mike's Marine & Auto" 
                      data-testid="input-shop-name" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newShop.description} 
                      onChange={(e) => setNewShop({ ...newShop, description: e.target.value })} 
                      placeholder="Full-service repair for boats, cars, trucks, and small engines..." 
                      data-testid="input-shop-description" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="mb-2 block">Vehicle Types Serviced</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {VEHICLE_TYPES.map(vt => (
                        <div 
                          key={vt.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                            selectedVehicleTypes.includes(vt.id) 
                              ? 'bg-primary/20 border-primary' 
                              : 'glass-card border-muted hover:border-primary/50'
                          }`}
                          onClick={() => {
                            if (selectedVehicleTypes.includes(vt.id)) {
                              setSelectedVehicleTypes(selectedVehicleTypes.filter(v => v !== vt.id));
                            } else {
                              setSelectedVehicleTypes([...selectedVehicleTypes, vt.id]);
                            }
                          }}
                        >
                          <vt.icon className="w-4 h-4 text-primary" />
                          <span className="text-xs font-mono">{vt.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>Street Address</Label>
                    <Input 
                      value={newShop.address} 
                      onChange={(e) => setNewShop({ ...newShop, address: e.target.value })} 
                      placeholder="123 Main Street" 
                      data-testid="input-shop-address" 
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input 
                      value={newShop.city} 
                      onChange={(e) => setNewShop({ ...newShop, city: e.target.value })} 
                      placeholder="Springfield" 
                      data-testid="input-shop-city" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>State</Label>
                      <Input 
                        value={newShop.state} 
                        onChange={(e) => setNewShop({ ...newShop, state: e.target.value })} 
                        placeholder="IL" 
                        maxLength={2} 
                        data-testid="input-shop-state" 
                      />
                    </div>
                    <div>
                      <Label>ZIP</Label>
                      <Input 
                        value={newShop.zipCode} 
                        onChange={(e) => setNewShop({ ...newShop, zipCode: e.target.value })} 
                        placeholder="62701" 
                        data-testid="input-shop-zip" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={newShop.phone} 
                      onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })} 
                      placeholder="(555) 123-4567" 
                      data-testid="input-shop-phone" 
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={newShop.email} 
                      onChange={(e) => setNewShop({ ...newShop, email: e.target.value })} 
                      placeholder="contact@mikesshop.com" 
                      data-testid="input-shop-email" 
                    />
                  </div>
                </div>
                <Button 
                  className="w-full font-tech uppercase"
                  onClick={() => createShopMutation.mutate(newShop)}
                  disabled={!newShop.name || createShopMutation.isPending}
                  data-testid="button-save-shop"
                >
                  {createShopMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Register Shop
                </Button>
              </div>
            </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>

        {shopsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : myShops.length === 0 ? (
          <Card className="glass-card border-dashed border-2 border-muted p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-tech uppercase text-muted-foreground mb-2">No Shops Registered</h3>
            <p className="text-sm text-muted-foreground mb-4">Register your shop to start managing repairs, estimates, and appointments</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {VEHICLE_TYPES.map(vt => (
                <Badge key={vt.id} variant="outline" className="gap-1 text-xs bg-white/5">
                  <vt.icon className="w-3 h-3" />
                  {vt.name}
                </Badge>
              ))}
            </div>
            <Button onClick={() => setCreateShopOpen(true)} className="font-tech uppercase" data-testid="button-register-first-shop">
              <Plus className="w-4 h-4 mr-2" /> Register Your First Shop
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Shop Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-tech uppercase text-sm text-muted-foreground mb-2">Your Shops ({myShops.length})</h2>
              <AnimatePresence>
                {myShops.map((shop, index) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${selectedShop?.id === shop.id ? 'border-primary bg-primary/5' : 'glass-card'}`}
                      onClick={() => { setSelectedShop(shop); setDemoMode(false); }}
                      data-testid={`card-shop-${shop.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-tech font-bold truncate text-sm">{shop.name}</h3>
                          {shop.city && <p className="text-xs text-muted-foreground font-mono">{shop.city}, {shop.state}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={shop.isActive ? "default" : "secondary"} className="text-[10px]">
                              {shop.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              {selectedShop ? (
                <motion.div
                  key={selectedShop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-ultra border-primary/30 overflow-hidden">
                    {/* Shop Header */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/20">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h2 className="text-2xl font-tech font-bold uppercase">{selectedShop.name}</h2>
                          {selectedShop.address && (
                            <p className="text-muted-foreground font-mono text-sm flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {selectedShop.address}, {selectedShop.city}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
                            <DialogTrigger asChild>
                              <Button className="gap-2 font-tech text-xs" data-testid="button-new-order">
                                <Plus className="w-3 h-3" /> New Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">New Repair Order</DialogTitle>
                                <DialogDescription>Create a new work order for {selectedShop.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="col-span-2">
                                    <Label>Customer Name *</Label>
                                    <Input 
                                      value={newOrder.customerName}
                                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                      placeholder="John Smith"
                                    />
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <Input 
                                      value={newOrder.customerPhone}
                                      onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                                      placeholder="(555) 123-4567"
                                    />
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <Input 
                                      value={newOrder.customerEmail}
                                      onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                                      placeholder="john@email.com"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Vehicle Info *</Label>
                                    <Input 
                                      value={newOrder.vehicleInfo}
                                      onChange={(e) => setNewOrder({ ...newOrder, vehicleInfo: e.target.value })}
                                      placeholder="2020 Toyota Camry / 15ft Bass Tracker / Honda EU2200i"
                                    />
                                  </div>
                                  <div>
                                    <Label>Vehicle Type</Label>
                                    <Select value={newOrder.vehicleType} onValueChange={(v) => setNewOrder({ ...newOrder, vehicleType: v })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {VEHICLE_TYPES.map(vt => (
                                          <SelectItem key={vt.id} value={vt.id}>
                                            <span className="flex items-center gap-2">
                                              <vt.icon className="w-4 h-4" />
                                              {vt.name}
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Priority</Label>
                                    <Select value={newOrder.priority} onValueChange={(v) => setNewOrder({ ...newOrder, priority: v })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Notes</Label>
                                    <Textarea 
                                      value={newOrder.notes}
                                      onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                                      placeholder="Customer concerns, symptoms, etc."
                                    />
                                  </div>
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => createOrderMutation.mutate(newOrder)}
                                  disabled={!newOrder.customerName || !newOrder.vehicleInfo || createOrderMutation.isPending}
                                >
                                  {createOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Create Repair Order
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={createAppointmentOpen} onOpenChange={setCreateAppointmentOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="gap-2 font-tech text-xs" data-testid="button-new-appointment">
                                <Calendar className="w-3 h-3" /> Schedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">Schedule Appointment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Customer Name *</Label>
                                  <Input 
                                    value={newAppointment.customerName}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <Input 
                                    value={newAppointment.customerPhone}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Vehicle</Label>
                                  <Input 
                                    value={newAppointment.vehicleInfo}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, vehicleInfo: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Service Type</Label>
                                  <Input 
                                    value={newAppointment.serviceType}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, serviceType: e.target.value })}
                                    placeholder="Oil Change, Tune Up, etc."
                                  />
                                </div>
                                <div>
                                  <Label>Date & Time *</Label>
                                  <Input 
                                    type="datetime-local"
                                    value={newAppointment.scheduledStart}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, scheduledStart: e.target.value })}
                                  />
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => createAppointmentMutation.mutate(newAppointment)}
                                  disabled={!newAppointment.customerName || !newAppointment.scheduledStart || createAppointmentMutation.isPending}
                                >
                                  Schedule Appointment
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" data-testid="button-shop-settings">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                      <TabsList className="grid grid-cols-11 mb-6 h-auto">
                        <TabsTrigger value="dashboard" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-dashboard">
                          <BarChart3 className="w-4 h-4" />
                          Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-orders">
                          <ClipboardList className="w-4 h-4" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger value="inspections" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-inspections">
                          <Camera className="w-4 h-4" />
                          DVI
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </TabsTrigger>
                        <TabsTrigger value="parts" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-parts">
                          <Wrench className="w-4 h-4" />
                          Parts
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </TabsTrigger>
                        <TabsTrigger value="estimates" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-estimates">
                          <FileText className="w-4 h-4" />
                          Estimates
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-schedule">
                          <Calendar className="w-4 h-4" />
                          Schedule
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-inventory">
                          <Package className="w-4 h-4" />
                          Inventory
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-analytics">
                          <Activity className="w-4 h-4" />
                          Analytics
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </TabsTrigger>
                        <TabsTrigger value="team" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto" data-testid="tab-team">
                          <Users className="w-4 h-4" />
                          Team
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-integrations">
                          <Link2 className="w-4 h-4" />
                          Integrations
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </TabsTrigger>
                        <TabsTrigger value="partner-api" className="font-tech uppercase text-[10px] py-2 gap-1 flex-col h-auto relative" data-testid="tab-partner-api">
                          <Key className="w-4 h-4" />
                          API
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </TabsTrigger>
                      </TabsList>

                      {/* Dashboard Tab */}
                      <TabsContent value="dashboard">
                        {/* Integration Highlight Banner */}
                        <Card 
                          className="p-4 mb-6 bg-gradient-to-r from-purple-500/10 via-primary/10 to-blue-500/10 border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => setActiveTab("integrations")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/20">
                                <Link2 className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-tech font-bold text-sm">Connect Your Business Tools</span>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[8px] font-mono">
                                    NEW
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">QuickBooks • UKG Pro • ADP • Google Calendar & more</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </Card>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/20">
                                <ClipboardList className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{demoMode ? DEMO_ORDERS.length : repairOrders.length}</p>
                                <p className="text-xs text-muted-foreground font-mono">Active Orders</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-yellow-500/20">
                                <FileText className="w-5 h-5 text-yellow-500" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{demoMode ? DEMO_ESTIMATES.length : estimates.filter(e => e.status === 'pending').length}</p>
                                <p className="text-xs text-muted-foreground font-mono">Pending Estimates</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Calendar className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{demoMode ? DEMO_APPOINTMENTS.length : appointments.length}</p>
                                <p className="text-xs text-muted-foreground font-mono">Today's Appts</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-green-500/20">
                                <DollarSign className="w-5 h-5 text-green-500" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{demoMode ? '$2,230' : '$0'}</p>
                                <p className="text-xs text-muted-foreground font-mono">Today's Revenue</p>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs" onClick={() => setCreateOrderOpen(true)}>
                            <Plus className="w-5 h-5" />
                            New Repair Order
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs">
                            <FileText className="w-5 h-5" />
                            Create Estimate
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs" onClick={() => setCreateAppointmentOpen(true)}>
                            <Calendar className="w-5 h-5" />
                            Schedule Appointment
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-tech text-xs" onClick={() => setActiveTab("inspections")}>
                            <Camera className="w-5 h-5" />
                            Start Inspection
                          </Button>
                        </div>

                        {/* Recent Orders */}
                        <div>
                          <h3 className="font-tech uppercase text-sm text-muted-foreground mb-3">Recent Repair Orders</h3>
                          {!demoMode && ordersLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : (demoMode ? DEMO_ORDERS : repairOrders).length === 0 ? (
                            <Card className="p-8 text-center glass-card border-dashed">
                              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                              <p className="text-muted-foreground font-mono text-sm">No repair orders yet</p>
                              <Button className="mt-4 font-tech text-xs" onClick={() => setCreateOrderOpen(true)}>
                                <Plus className="w-3 h-3 mr-1" /> Create First Order
                              </Button>
                            </Card>
                          ) : (
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-2">
                                {(demoMode ? DEMO_ORDERS : repairOrders).slice(0, 10).map(order => (
                                  <Card key={order.id} className="p-4 glass-card transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                          {getVehicleIcon(order.vehicleType || 'car')}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-bold">#{order.orderNumber}</span>
                                            {getStatusBadge(order.status)}
                                          </div>
                                          <p className="text-sm">{order.customerName || 'Walk-in'}</p>
                                          <p className="text-xs text-muted-foreground">{order.vehicleInfo}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-mono font-bold">${order.grandTotal || '0.00'}</p>
                                        <Badge variant="outline" className={`text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                          {order.paymentStatus || 'unpaid'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </TabsContent>

                      {/* Orders Tab */}
                      <TabsContent value="orders">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Input placeholder="Search orders..." className="w-64" />
                            <Button variant="outline" size="icon">
                              <Filter className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button className="gap-2 font-tech text-xs" onClick={() => setCreateOrderOpen(true)}>
                            <Plus className="w-3 h-3" /> New Order
                          </Button>
                        </div>
                        
                        {!demoMode && ordersLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : (demoMode ? DEMO_ORDERS : repairOrders).length === 0 ? (
                          <Card className="p-12 text-center glass-card border-dashed">
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="font-tech uppercase text-lg mb-2">No Repair Orders</h3>
                            <p className="text-muted-foreground text-sm mb-4">Create your first repair order to get started</p>
                            <Button onClick={() => setCreateOrderOpen(true)} className="font-tech">
                              <Plus className="w-4 h-4 mr-2" /> Create Repair Order
                            </Button>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {(demoMode ? DEMO_ORDERS : repairOrders).map(order => (
                              <Card key={order.id} className="p-4 glass-card transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                      {getVehicleIcon(order.vehicleType || 'car')}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">#{order.orderNumber}</span>
                                        {getStatusBadge(order.status)}
                                        {order.priority === 'high' && <Badge variant="destructive" className="text-[10px]">HIGH</Badge>}
                                        {order.priority === 'urgent' && <Badge variant="destructive" className="text-[10px] animate-pulse">URGENT</Badge>}
                                      </div>
                                      <p className="font-medium">{order.customerName || 'Walk-in Customer'}</p>
                                      <p className="text-sm text-muted-foreground">{order.vehicleInfo}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right mr-2">
                                      <p className="font-mono font-bold text-lg">${order.grandTotal || '0.00'}</p>
                                      <Badge variant="outline" className={`text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}`}>
                                        {order.paymentStatus || 'unpaid'}
                                      </Badge>
                                    </div>
                                    {order.paymentStatus !== 'paid' && (
                                      <Button 
                                        size="sm" 
                                        className="gap-1 font-tech text-xs bg-green-600 hover:bg-green-700"
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(`/api/shops/${selectedShop?.id}/repair-orders/${order.id}/collect-payment`, {
                                              method: 'POST',
                                              credentials: 'include',
                                              headers: { 'Content-Type': 'application/json' }
                                            });
                                            const data = await response.json();
                                            if (data.url) {
                                              window.open(data.url, '_blank');
                                            } else if (data.error) {
                                              alert(data.error);
                                            }
                                          } catch (error) {
                                            console.error('Error collecting payment:', error);
                                          }
                                        }}
                                        data-testid={`button-collect-payment-${order.id}`}
                                      >
                                        <CreditCard className="w-3 h-3" /> Collect Payment
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm" className="gap-1 font-tech text-xs">
                                      <Send className="w-3 h-3" /> Remind
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Digital Vehicle Inspection (DVI) Tab */}
                      <TabsContent value="inspections">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-tech uppercase text-lg">Digital Vehicle Inspections</h3>
                              <p className="text-sm text-muted-foreground">Photo & video documentation for customer transparency</p>
                            </div>
                            <Button className="gap-2 font-tech text-xs">
                              <Camera className="w-3 h-3" /> Start New Inspection
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                              <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-tech uppercase text-xs">Completed Today</span>
                              </div>
                              <p className="text-2xl font-bold">{demoMode ? '12' : '0'}</p>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                              <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                <span className="font-tech uppercase text-xs">Awaiting Approval</span>
                              </div>
                              <p className="text-2xl font-bold">{demoMode ? '3' : '0'}</p>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                              <div className="flex items-center gap-3 mb-2">
                                <Camera className="w-5 h-5 text-primary" />
                                <span className="font-tech uppercase text-xs">Photos This Week</span>
                              </div>
                              <p className="text-2xl font-bold">{demoMode ? '156' : '0'}</p>
                            </Card>
                          </div>

                          {demoMode ? (
                            <div className="space-y-4">
                              {[
                                { id: 1, vehicle: "2020 Toyota Camry", customer: "John Smith", items: 24, status: "sent", urgent: 3, date: "Today 9:15 AM" },
                                { id: 2, vehicle: "2018 Honda Civic", customer: "Sarah Johnson", items: 18, status: "approved", urgent: 1, date: "Today 8:30 AM" },
                                { id: 3, vehicle: "2022 Ford F-150", customer: "Mike Wilson", items: 31, status: "in_progress", urgent: 5, date: "Today 7:45 AM" },
                              ].map((inspection) => (
                                <Card key={inspection.id} className="p-4 glass-card transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="p-3 rounded-lg bg-primary/10">
                                        <Camera className="w-5 h-5 text-primary" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{inspection.vehicle}</span>
                                          <Badge variant="outline" className={
                                            inspection.status === 'approved' ? 'text-green-400 border-green-400/30' :
                                            inspection.status === 'sent' ? 'text-blue-400 border-blue-400/30' :
                                            'text-yellow-400 border-yellow-400/30'
                                          }>
                                            {inspection.status}
                                          </Badge>
                                          {inspection.urgent > 0 && (
                                            <Badge variant="destructive" className="text-[10px]">
                                              {inspection.urgent} URGENT
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{inspection.customer}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Camera className="w-3 h-3" /> {inspection.items} items
                                          </span>
                                          <span>{inspection.date}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" className="font-tech text-xs">
                                        <Eye className="w-3 h-3 mr-1" /> View
                                      </Button>
                                      <Button variant="outline" size="sm" className="font-tech text-xs">
                                        <Send className="w-3 h-3 mr-1" /> Send to Customer
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}

                              <Card className="p-6 border-dashed bg-muted/10">
                                <h4 className="font-tech uppercase text-sm mb-4">Inspection Checklist Templates</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {['Full Vehicle Inspection', 'Oil Change Check', 'Brake Inspection', 'Tire Inspection', 'A/C Service Check', 'Pre-Purchase Inspection', 'Safety Inspection', 'Emissions Check'].map((template) => (
                                    <Button key={template} variant="outline" className="h-auto py-3 text-xs font-tech justify-start">
                                      <ClipboardList className="w-3 h-3 mr-2" />
                                      {template}
                                    </Button>
                                  ))}
                                </div>
                              </Card>
                            </div>
                          ) : (
                            <Card className="p-12 text-center glass-card border-dashed">
                              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                              <h3 className="font-tech uppercase text-lg mb-2">Digital Vehicle Inspections</h3>
                              <p className="text-muted-foreground text-sm mb-4">Document vehicle condition with photos & videos. Send inspection reports directly to customers for transparent approval.</p>
                              <Button className="font-tech">
                                <Camera className="w-4 h-4 mr-2" /> Start First Inspection
                              </Button>
                            </Card>
                          )}
                        </div>
                      </TabsContent>

                      {/* Parts Ordering Tab */}
                      <TabsContent value="parts">
                        <PartsOrderingTab />
                      </TabsContent>

                      {/* Estimates Tab */}
                      <TabsContent value="estimates">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Estimates & Quotes</h3>
                          <Button className="gap-2 font-tech text-xs">
                            <Plus className="w-3 h-3" /> New Estimate
                          </Button>
                        </div>
                        {(demoMode ? DEMO_ESTIMATES : estimates).length === 0 ? (
                          <Card className="p-12 text-center glass-card border-dashed">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="font-tech uppercase text-lg mb-2">No Estimates Yet</h3>
                            <p className="text-muted-foreground text-sm">Create estimates to send quotes to customers</p>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {(demoMode ? DEMO_ESTIMATES : estimates).map(est => (
                              <Card key={est.id} className="p-4 glass-card transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-yellow-500/10">
                                      <FileText className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">#{est.estimateNumber}</span>
                                        <Badge variant="outline" className={est.status === 'approved' ? 'text-green-400' : 'text-yellow-400'}>
                                          {est.status}
                                        </Badge>
                                      </div>
                                      <p className="font-medium">{est.customerName}</p>
                                      <p className="text-sm text-muted-foreground">{est.vehicleInfo}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono font-bold text-lg">${est.grandTotal}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(est.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Schedule Tab */}
                      <TabsContent value="schedule">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Appointment Calendar</h3>
                          <Button className="gap-2 font-tech text-xs" onClick={() => setCreateAppointmentOpen(true)}>
                            <Plus className="w-3 h-3" /> Schedule Appointment
                          </Button>
                        </div>
                        {(demoMode ? DEMO_APPOINTMENTS : appointments).length === 0 ? (
                          <Card className="p-12 text-center glass-card border-dashed">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="font-tech uppercase text-lg mb-2">No Appointments</h3>
                            <p className="text-muted-foreground text-sm mb-4">Schedule appointments to manage your workflow</p>
                            <Button onClick={() => setCreateAppointmentOpen(true)} className="font-tech">
                              <Plus className="w-4 h-4 mr-2" /> Schedule Appointment
                            </Button>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {(demoMode ? DEMO_APPOINTMENTS : appointments).map(apt => (
                              <Card key={apt.id} className="p-4 glass-card">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-blue-500/10">
                                      <CalendarDays className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{apt.customerName}</p>
                                      <p className="text-sm text-muted-foreground">{apt.vehicleInfo} - {apt.serviceType}</p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {new Date(apt.scheduledStart).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline">{apt.status}</Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Automated Reminders Configuration */}
                        <Card className="p-6 mt-6 bg-gradient-to-r from-blue-500/5 to-transparent border-blue-500/20">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                              <Mail className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-tech font-bold text-lg">Automated Reminders</h4>
                                  <p className="text-sm text-muted-foreground">Automatically notify customers about upcoming appointments</p>
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Active
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="p-3 glass-card rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Checkbox id="reminder-24h" defaultChecked />
                                    <Label htmlFor="reminder-24h" className="text-xs font-tech">24 Hours Before</Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground ml-5">Email + SMS</p>
                                </div>
                                <div className="p-3 glass-card rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Checkbox id="reminder-2h" defaultChecked />
                                    <Label htmlFor="reminder-2h" className="text-xs font-tech">2 Hours Before</Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground ml-5">SMS only</p>
                                </div>
                                <div className="p-3 glass-card rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Checkbox id="reminder-ready" defaultChecked />
                                    <Label htmlFor="reminder-ready" className="text-xs font-tech">Vehicle Ready</Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground ml-5">Email + SMS</p>
                                </div>
                                <div className="p-3 glass-card rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Checkbox id="reminder-followup" />
                                    <Label htmlFor="reminder-followup" className="text-xs font-tech">Follow-up (7 days)</Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground ml-5">Email only</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" className="font-tech text-xs">
                                  <Settings className="w-3 h-3 mr-2" /> Configure Templates
                                </Button>
                                <Button variant="outline" size="sm" className="font-tech text-xs">
                                  <Phone className="w-3 h-3 mr-2" /> SMS Settings
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>

                      {/* Inventory Tab */}
                      <TabsContent value="inventory">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Parts Inventory</h3>
                          <Button className="gap-2 font-tech text-xs">
                            <Plus className="w-3 h-3" /> Add Part
                          </Button>
                        </div>
                        {demoMode ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-6 gap-4 p-3 glass-card rounded-lg font-tech text-xs uppercase text-muted-foreground">
                              <span>Part #</span>
                              <span className="col-span-2">Description</span>
                              <span className="text-center">Qty</span>
                              <span className="text-right">Cost</span>
                              <span className="text-right">Price</span>
                            </div>
                            {DEMO_INVENTORY.map(item => (
                              <Card key={item.id} className="p-3 glass-card transition-colors">
                                <div className="grid grid-cols-6 gap-4 items-center">
                                  <span className="font-mono text-sm text-primary">{item.partNumber}</span>
                                  <div className="col-span-2">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                                  </div>
                                  <div className="text-center">
                                    <span className={`font-mono font-bold ${item.quantity <= item.reorderPoint ? 'text-red-400' : 'text-green-400'}`}>
                                      {item.quantity}
                                    </span>
                                    {item.quantity <= item.reorderPoint && (
                                      <AlertTriangle className="w-3 h-3 text-red-400 inline ml-1" />
                                    )}
                                  </div>
                                  <span className="text-right font-mono text-sm text-muted-foreground">${item.cost}</span>
                                  <span className="text-right font-mono font-bold">${item.price}</span>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card className="p-12 text-center glass-card border-dashed">
                            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <h3 className="font-tech uppercase text-lg mb-2">Inventory Management</h3>
                            <p className="text-muted-foreground text-sm">Track parts, stock levels, and vendor orders</p>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Analytics & Reports Tab */}
                      <TabsContent value="analytics">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-tech uppercase text-lg">Analytics & Reports</h3>
                              <p className="text-sm text-muted-foreground">Key performance indicators and business insights</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select defaultValue="month">
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="today">Today</SelectItem>
                                  <SelectItem value="week">This Week</SelectItem>
                                  <SelectItem value="month">This Month</SelectItem>
                                  <SelectItem value="quarter">This Quarter</SelectItem>
                                  <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" className="font-tech text-xs">
                                <FileText className="w-3 h-3 mr-2" /> Export Report
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                              <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <span className="font-tech uppercase text-xs">Total Revenue</span>
                              </div>
                              <p className="text-2xl font-bold">${demoMode ? '47,832' : '0'}</p>
                              <p className="text-xs text-green-400 mt-1">+12.5% from last month</p>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                              <div className="flex items-center gap-3 mb-2">
                                <ClipboardList className="w-5 h-5 text-primary" />
                                <span className="font-tech uppercase text-xs">Avg Repair Order</span>
                              </div>
                              <p className="text-2xl font-bold">${demoMode ? '485' : '0'}</p>
                              <p className="text-xs text-primary mt-1">+8.2% from last month</p>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                              <div className="flex items-center gap-3 mb-2">
                                <Timer className="w-5 h-5 text-blue-500" />
                                <span className="font-tech uppercase text-xs">Bay Utilization</span>
                              </div>
                              <p className="text-2xl font-bold">{demoMode ? '78%' : '0%'}</p>
                              <p className="text-xs text-blue-400 mt-1">Target: 85%</p>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                              <div className="flex items-center gap-3 mb-2">
                                <UserCheck className="w-5 h-5 text-yellow-500" />
                                <span className="font-tech uppercase text-xs">Customer Retention</span>
                              </div>
                              <p className="text-2xl font-bold">{demoMode ? '89%' : '0%'}</p>
                              <p className="text-xs text-yellow-400 mt-1">Industry avg: 65%</p>
                            </Card>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6">
                              <h4 className="font-tech uppercase text-sm mb-4">Revenue Breakdown</h4>
                              {demoMode ? (
                                <div className="space-y-3">
                                  {[
                                    { label: 'Labor', value: 28500, percent: 60 },
                                    { label: 'Parts', value: 14350, percent: 30 },
                                    { label: 'Fluids & Supplies', value: 3500, percent: 7 },
                                    { label: 'Shop Fees', value: 1482, percent: 3 },
                                  ].map((item) => (
                                    <div key={item.label} className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>{item.label}</span>
                                        <span className="font-mono font-bold">${item.value.toLocaleString()}</span>
                                      </div>
                                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary rounded-full transition-all"
                                          style={{ width: `${item.percent}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                  Complete orders to see revenue breakdown
                                </div>
                              )}
                            </Card>

                            <Card className="p-6">
                              <h4 className="font-tech uppercase text-sm mb-4">Technician Performance</h4>
                              {demoMode ? (
                                <div className="space-y-3">
                                  {[
                                    { name: 'Mike Johnson', hours: 42, efficiency: 112, jobs: 28 },
                                    { name: 'Sarah Chen', hours: 38, efficiency: 98, jobs: 24 },
                                    { name: 'Carlos Rodriguez', hours: 40, efficiency: 105, jobs: 26 },
                                  ].map((tech) => (
                                    <div key={tech.name} className="flex items-center justify-between p-3 glass-card rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                          <Wrench className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm">{tech.name}</p>
                                          <p className="text-xs text-muted-foreground">{tech.jobs} jobs completed</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-mono font-bold text-sm">{tech.hours}h</p>
                                        <Badge variant="outline" className={tech.efficiency >= 100 ? 'text-green-400' : 'text-yellow-400'}>
                                          {tech.efficiency}% eff
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                  Add technicians to track performance
                                </div>
                              )}
                            </Card>
                          </div>

                          <Card className="p-6">
                            <h4 className="font-tech uppercase text-sm mb-4">Monthly Trends</h4>
                            <div className="grid grid-cols-6 gap-2">
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                                const heights = demoMode ? [45, 52, 48, 65, 72, 78] : [0, 0, 0, 0, 0, 0];
                                return (
                                  <div key={month} className="text-center">
                                    <div className="h-24 glass-card rounded-lg relative overflow-hidden">
                                      <div 
                                        className="absolute bottom-0 w-full bg-primary/60 rounded-b-lg transition-all"
                                        style={{ height: `${heights[i]}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">{month}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Team Tab */}
                      <TabsContent value="team">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Team & Technicians</h3>
                          <Button className="gap-2 font-tech text-xs">
                            <UserPlus className="w-3 h-3" /> Add Technician
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-6 glass-card border-dashed">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 rounded-lg bg-primary/10">
                                <Timer className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-tech uppercase">Time Clock</h4>
                                <p className="text-sm text-muted-foreground">Track technician hours</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full font-tech text-xs">
                              <Play className="w-3 h-3 mr-2" /> Clock In/Out
                            </Button>
                          </Card>
                          <Card className="p-6 glass-card border-dashed">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 rounded-lg bg-green-500/10">
                                <UserCheck className="w-6 h-6 text-green-500" />
                              </div>
                              <div>
                                <h4 className="font-tech uppercase">Productivity</h4>
                                <p className="text-sm text-muted-foreground">Track tech efficiency</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full font-tech text-xs">
                              <BarChart3 className="w-3 h-3 mr-2" /> View Reports
                            </Button>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Integrations Tab */}
                      <TabsContent value="integrations">
                        {/* Hero Banner */}
                        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20 border-primary/30 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-3 rounded-xl bg-primary/20">
                                <Link2 className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-tech font-bold uppercase">Unified Business Hub</h3>
                                <p className="text-muted-foreground">Connect your existing tools or use our built-in solutions</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Coexist with current systems</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                                <span>Gradually migrate at your pace</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <span>Full replacement available</span>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Integration Categories */}
                        <div className="space-y-6">
                          {/* Payment Processing - Stripe Connect */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" /> Payment Processing
                            </h4>
                            <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                              <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                                      <CreditCard className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <div>
                                      <h5 className="font-tech font-bold text-xl mb-1">Stripe Connect</h5>
                                      <p className="text-sm text-muted-foreground">Receive payments directly to your bank account</p>
                                    </div>
                                  </div>
                                  {selectedShop?.stripeOnboardingComplete ? (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                      <CheckCircle className="w-3 h-3 mr-1" /> Connected
                                    </Badge>
                                  ) : selectedShop?.stripeAccountId ? (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                      <Clock className="w-3 h-3 mr-1" /> Setup Incomplete
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Not Connected
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Accept card payments</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Direct deposit to bank</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Automatic invoicing</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {selectedShop?.stripeOnboardingComplete ? (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        className="font-tech"
                                        onClick={async () => {
                                          try {
                                            const response = await fetch('/api/stripe/connect/dashboard', {
                                              credentials: 'include'
                                            });
                                            const data = await response.json();
                                            if (data.url) {
                                              window.open(data.url, '_blank');
                                            }
                                          } catch (error) {
                                            console.error('Error opening dashboard:', error);
                                          }
                                        }}
                                        data-testid="button-stripe-dashboard"
                                      >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Open Stripe Dashboard
                                      </Button>
                                      <span className="text-xs text-muted-foreground">
                                        Manage payouts, view transactions, and update settings
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Button 
                                        className="font-tech bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                        onClick={async () => {
                                          try {
                                            const response = await fetch('/api/stripe/connect/create-account', {
                                              method: 'POST',
                                              credentials: 'include',
                                              headers: { 'Content-Type': 'application/json' }
                                            });
                                            const data = await response.json();
                                            if (data.onboardingUrl) {
                                              window.location.href = data.onboardingUrl;
                                            } else if (data.error) {
                                              alert(data.error);
                                            }
                                          } catch (error) {
                                            console.error('Error connecting Stripe:', error);
                                          }
                                        }}
                                        data-testid="button-connect-stripe"
                                      >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        {selectedShop?.stripeAccountId ? 'Complete Setup' : 'Connect Stripe Account'}
                                      </Button>
                                      <span className="text-xs text-muted-foreground">
                                        Takes about 5 minutes to set up
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* Accounting & Invoicing */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" /> Accounting & Invoicing
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-green-500/10">
                                    <Database className="w-6 h-6 text-green-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">QuickBooks</h5>
                                <p className="text-xs text-muted-foreground mb-3">Sync invoices, payments, and financial reports automatically</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-blue-500/10">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">FreshBooks</h5>
                                <p className="text-xs text-muted-foreground mb-3">Time tracking, invoicing, and expense management</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20 hover:border-purple-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Receipt className="w-6 h-6 text-purple-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Xero</h5>
                                <p className="text-xs text-muted-foreground mb-3">Cloud accounting with powerful reporting</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Workforce & Payroll */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Workforce & Payroll
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-orange-500/10">
                                    <UserCheck className="w-6 h-6 text-orange-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">UKG Pro</h5>
                                <p className="text-xs text-muted-foreground mb-3">HR, payroll, talent management in one platform</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-cyan-500/10">
                                    <Timer className="w-6 h-6 text-cyan-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">ADP</h5>
                                <p className="text-xs text-muted-foreground mb-3">Payroll, HR, and workforce management</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20 hover:border-pink-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-pink-500/10">
                                    <Clock className="w-6 h-6 text-pink-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Gusto</h5>
                                <p className="text-xs text-muted-foreground mb-3">Modern payroll and benefits for small business</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Scheduling & CRM */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Scheduling & Customer Management
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-indigo-500/10">
                                    <CalendarDays className="w-6 h-6 text-indigo-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Google Calendar</h5>
                                <p className="text-xs text-muted-foreground mb-3">Sync appointments with your Google account</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 hover:border-red-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-red-500/10">
                                    <MessageSquare className="w-6 h-6 text-red-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Twilio</h5>
                                <p className="text-xs text-muted-foreground mb-3">SMS notifications and customer messaging</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-teal-500/10">
                                    <Mail className="w-6 h-6 text-teal-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Mailchimp</h5>
                                <p className="text-xs text-muted-foreground mb-3">Email marketing and customer outreach</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Parts & Inventory */}
                          <div>
                            <h4 className="font-tech uppercase text-sm text-muted-foreground mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4" /> Parts & Inventory
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Wrench className="w-6 h-6 text-amber-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">PartsTech</h5>
                                <p className="text-xs text-muted-foreground mb-3">Search and order from 20+ suppliers</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-lime-500/10">
                                    <Globe className="w-6 h-6 text-lime-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">Nexpart</h5>
                                <p className="text-xs text-muted-foreground mb-3">Catalog data and electronic ordering</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>

                              <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-colors group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Shield className="w-6 h-6 text-emerald-500" />
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[9px] font-mono">
                                    COMING SOON
                                  </Badge>
                                </div>
                                <h5 className="font-tech font-bold text-lg mb-1">AutoZone Pro</h5>
                                <p className="text-xs text-muted-foreground mb-3">Commercial account integration</p>
                                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Connect <ArrowRight className="w-3 h-3" />
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Built-in Features Notice */}
                          <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-primary/10">
                                <Sparkles className="w-8 h-8 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-tech font-bold text-lg mb-2">Don't Have These Systems?</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Mechanics Garage includes built-in versions of all these capabilities. Use our integrated tools for invoicing, scheduling, time tracking, and inventory - no additional subscriptions required.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Invoicing</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Time Clock</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Scheduling</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in Inventory</Badge>
                                  <Badge className="bg-primary/10 text-primary border-primary/30">Built-in CRM</Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Partner API Tab */}
                      <TabsContent value="partner-api">
                        <PartnerApiTab shopId={selectedShop.id} toast={toast} />
                      </TabsContent>
                    </Tabs>
                  </Card>
                </motion.div>
              ) : (
                <Card className="p-12 text-center glass-card border-dashed">
                  <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-tech uppercase text-xl mb-2">Select a Shop</h3>
                  <p className="text-muted-foreground">Choose a shop from the sidebar to view its dashboard</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}