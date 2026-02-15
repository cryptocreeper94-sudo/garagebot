import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import {
  Shield, Car, ExternalLink, CheckCircle, Star,
  Sparkles, ChevronRight, Award, Zap, Factory,
  Wrench, ShieldCheck, BadgeCheck, Package, Truck,
  Clock, DollarSign, Globe, ArrowRight, Search,
  AlertTriangle, ThumbsUp, Lock, Cog, CircleDollarSign
} from "lucide-react";

import imgOemHero from "@/assets/images/cc/oem-parts.png";
import imgToyota from "@/assets/images/oem/toyota-parts.png";
import imgFord from "@/assets/images/oem/ford-motorcraft.png";
import imgGm from "@/assets/images/oem/gm-acdelco.png";
import imgMopar from "@/assets/images/oem/mopar-parts.png";
import imgHonda from "@/assets/images/oem/honda-parts.png";
import imgBmw from "@/assets/images/oem/bmw-parts.png";
import imgNissan from "@/assets/images/oem/nissan-parts.png";
import imgMercedes from "@/assets/images/oem/mercedes-parts.png";
import imgHyundai from "@/assets/images/oem/hyundai-parts.png";
import imgSubaru from "@/assets/images/oem/subaru-parts.png";
import imgVw from "@/assets/images/oem/vw-parts.png";
import imgKia from "@/assets/images/oem/kia-parts.png";
import imgOemVsAftermarket from "@/assets/images/oem/oem-vs-aftermarket.png";
import imgOemWarranty from "@/assets/images/oem/oem-warranty.png";

interface OEMRetailer {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  image: string;
  rating: number;
  features: string[];
  highlight?: string;
  highlightColor?: string;
  partsLine: string;
  vehicles: string;
  warrantyInfo: string;
  affiliateUrl: string;
  searchUrl: string;
}

const oemRetailers: OEMRetailer[] = [
  {
    id: "toyota",
    name: "Toyota Parts Direct",
    brand: "Toyota / Lexus",
    tagline: "Genuine Toyota & Lexus OEM parts shipped direct from authorized dealers",
    image: imgToyota,
    rating: 4.9,
    features: ["Factory-spec precision fit", "Full Toyota & Lexus catalog", "VIN-based lookup", "Dealer-direct pricing", "12-month OEM warranty", "Free shipping on $75+"],
    highlight: "#1 SELLING",
    highlightColor: "bg-red-500/20 text-red-400 border-red-500/30",
    partsLine: "Toyota Genuine Parts",
    vehicles: "Toyota, Lexus, Scion",
    warrantyInfo: "12 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://parts.toyota.com",
  },
  {
    id: "ford",
    name: "Ford Motorcraft",
    brand: "Ford / Lincoln",
    tagline: "Motorcraft & Ford Genuine Parts — built to the same specs as your original equipment",
    image: imgFord,
    rating: 4.8,
    features: ["Motorcraft quality line", "Ford Genuine Parts catalog", "Built Ford Tough specs", "Dealer-backed warranty", "Free VIN lookup", "Fleet discounts available"],
    highlight: "MOTORCRAFT",
    highlightColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    partsLine: "Motorcraft / Ford Genuine",
    vehicles: "Ford, Lincoln, Mercury",
    warrantyInfo: "24 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://parts.ford.com",
  },
  {
    id: "gm",
    name: "GM Parts Direct",
    brand: "GM / Chevrolet",
    tagline: "ACDelco & GM Genuine Parts — original equipment for every GM vehicle",
    image: imgGm,
    rating: 4.8,
    features: ["ACDelco Professional line", "GM Genuine Parts catalog", "90,000+ part numbers", "OE exact-fit guarantee", "Competitive dealer pricing", "Professional installer discounts"],
    highlight: "ACDELCO",
    highlightColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    partsLine: "ACDelco / GM Genuine",
    vehicles: "Chevrolet, GMC, Buick, Cadillac",
    warrantyInfo: "24 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://www.gmpartsstore.com",
  },
  {
    id: "mopar",
    name: "Mopar Parts",
    brand: "Stellantis",
    tagline: "Official Mopar parts for Chrysler, Dodge, Jeep & Ram — factory-engineered quality",
    image: imgMopar,
    rating: 4.7,
    features: ["Factory-engineered specs", "Mopar performance line", "Jeep trail-rated parts", "Ram heavy-duty components", "VIN-specific fitment", "HEMI performance parts"],
    highlight: "MOPAR",
    highlightColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    partsLine: "Mopar Genuine",
    vehicles: "Chrysler, Dodge, Jeep, Ram",
    warrantyInfo: "24 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://www.mopar.com/en-us/parts.html",
  },
  {
    id: "honda",
    name: "Honda Parts Now",
    brand: "Honda / Acura",
    tagline: "Genuine Honda & Acura OEM parts — precision-engineered for perfect fit every time",
    image: imgHonda,
    rating: 4.8,
    features: ["Honda Genuine quality", "Acura Genuine catalog", "Precision-fit guarantee", "Full engine & body parts", "OEM electrical components", "Dealer-direct savings"],
    partsLine: "Honda Genuine Parts",
    vehicles: "Honda, Acura",
    warrantyInfo: "12 months / 12,000 miles",
    affiliateUrl: "",
    searchUrl: "https://www.hondapartsnow.com",
  },
  {
    id: "bmw",
    name: "BMW Parts Authority",
    brand: "BMW / MINI",
    tagline: "Genuine BMW & MINI parts — engineered to the highest German standards",
    image: imgBmw,
    rating: 4.9,
    features: ["German-engineered precision", "BMW M Performance parts", "MINI Genuine catalog", "Premium material quality", "OEM electronics & sensors", "European spec components"],
    highlight: "PREMIUM",
    highlightColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    partsLine: "BMW Genuine Parts",
    vehicles: "BMW, MINI, Rolls-Royce",
    warrantyInfo: "24 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://www.bmwpartsauthority.com",
  },
  {
    id: "nissan",
    name: "Nissan Parts Plus",
    brand: "Nissan / Infiniti",
    tagline: "Genuine Nissan & Infiniti OEM parts with Value Advantage pricing options",
    image: imgNissan,
    rating: 4.6,
    features: ["Nissan Genuine catalog", "Infiniti Genuine parts", "Value Advantage line", "NISMO performance parts", "VIN-based fitment tools", "Competitive OEM pricing"],
    partsLine: "Nissan Genuine / Value Advantage",
    vehicles: "Nissan, Infiniti, Datsun",
    warrantyInfo: "12 months / 12,000 miles",
    affiliateUrl: "",
    searchUrl: "https://parts.nissanusa.com",
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz Parts",
    brand: "Mercedes-Benz",
    tagline: "Genuine Mercedes-Benz parts — uncompromising luxury & performance standards",
    image: imgMercedes,
    rating: 4.9,
    features: ["Uncompromising quality", "AMG performance parts", "StarParts value line", "Premium OEM electronics", "German precision engineering", "Factory-sealed components"],
    highlight: "LUXURY",
    highlightColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    partsLine: "Mercedes-Benz Genuine",
    vehicles: "Mercedes-Benz, AMG, Maybach",
    warrantyInfo: "24 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://parts.mbusa.com",
  },
  {
    id: "hyundai",
    name: "Hyundai OEM Parts",
    brand: "Hyundai",
    tagline: "Genuine Hyundai parts with industry-leading warranty backing",
    image: imgHyundai,
    rating: 4.7,
    features: ["Genuine Hyundai catalog", "Industry-best warranty", "EV & hybrid parts", "Full body & mechanical", "Competitive OEM pricing", "Dealer-direct fulfillment"],
    partsLine: "Hyundai Genuine Parts",
    vehicles: "Hyundai, Genesis",
    warrantyInfo: "12 months / 12,000 miles",
    affiliateUrl: "",
    searchUrl: "https://www.hyundaioemparts.com",
  },
  {
    id: "subaru",
    name: "Subaru Parts Online",
    brand: "Subaru",
    tagline: "Genuine Subaru parts engineered for safety, performance & all-wheel-drive excellence",
    image: imgSubaru,
    rating: 4.7,
    features: ["Boxer engine specialists", "AWD drivetrain parts", "STI performance line", "Subaru Genuine quality", "EyeSight system parts", "Adventure-ready components"],
    partsLine: "Subaru Genuine Parts",
    vehicles: "Subaru",
    warrantyInfo: "12 months / 12,000 miles",
    affiliateUrl: "",
    searchUrl: "https://parts.subaru.com",
  },
  {
    id: "vw",
    name: "VW Parts Vortex",
    brand: "Volkswagen / Audi",
    tagline: "Genuine Volkswagen & Audi parts — Das Auto quality, factory-direct pricing",
    image: imgVw,
    rating: 4.7,
    features: ["German engineering specs", "VW Genuine catalog", "Audi Genuine parts", "TDI diesel specialists", "Golf R performance parts", "VAG group compatibility"],
    partsLine: "VW Genuine / Audi Genuine",
    vehicles: "Volkswagen, Audi, Porsche",
    warrantyInfo: "24 months / unlimited miles",
    affiliateUrl: "",
    searchUrl: "https://parts.vw.com",
  },
  {
    id: "kia",
    name: "Kia OEM Parts",
    brand: "Kia",
    tagline: "Genuine Kia parts backed by one of the best warranties in the industry",
    image: imgKia,
    rating: 4.6,
    features: ["Kia Genuine catalog", "Industry-leading warranty", "EV6 & hybrid parts", "Full mechanical catalog", "Body & interior parts", "Dealer-direct pricing"],
    partsLine: "Kia Genuine Parts",
    vehicles: "Kia",
    warrantyInfo: "12 months / 12,000 miles",
    affiliateUrl: "",
    searchUrl: "https://www.kiapartsnow.com",
  },
];

const oemAdvantages = [
  { icon: BadgeCheck, title: "Perfect Fit Guaranteed", desc: "OEM parts are engineered to the exact specifications of your vehicle — no guessing, no modifications needed", color: "#00D9FF" },
  { icon: Shield, title: "Factory Warranty Backed", desc: "Genuine parts come with manufacturer warranty protection that aftermarket parts simply can't match", color: "#10B981" },
  { icon: Cog, title: "Engineered to Spec", desc: "Tested to the same standards as original equipment — same materials, tolerances, and performance ratings", color: "#8B5CF6" },
  { icon: Clock, title: "Longer Lifespan", desc: "OEM parts consistently outlast aftermarket alternatives, saving you money on replacements over time", color: "#F59E0B" },
  { icon: Lock, title: "Safety Certified", desc: "Genuine parts meet the exact safety standards your vehicle was designed and crash-tested with", color: "#EC4899" },
  { icon: DollarSign, title: "Protects Resale Value", desc: "Vehicles maintained with OEM parts retain higher resale value than those with aftermarket replacements", color: "#06B6D4" },
];

const oemCategories = [
  { type: "Engine & Drivetrain", icon: "⚙️", desc: "Timing chains, gaskets, oil pumps, transmission parts", partCount: "5,000+" },
  { type: "Brake System", icon: "🛑", desc: "Rotors, calipers, pads, brake lines, master cylinders", partCount: "2,500+" },
  { type: "Electrical", icon: "⚡", desc: "Alternators, starters, sensors, wiring harnesses, modules", partCount: "8,000+" },
  { type: "Suspension", icon: "🔧", desc: "Struts, shocks, control arms, ball joints, tie rods", partCount: "3,000+" },
  { type: "Body & Exterior", icon: "🚗", desc: "Bumpers, fenders, mirrors, headlights, trim panels", partCount: "12,000+" },
  { type: "Interior", icon: "🪑", desc: "Seats, dashboards, consoles, switches, climate controls", partCount: "6,000+" },
  { type: "Cooling System", icon: "❄️", desc: "Radiators, water pumps, thermostats, hoses, fans", partCount: "1,500+" },
  { type: "Exhaust & Emissions", icon: "💨", desc: "Catalytic converters, O2 sensors, mufflers, EGR valves", partCount: "2,000+" },
];

const faqItems = [
  {
    q: "What are OEM parts and why should I use them?",
    a: "OEM stands for Original Equipment Manufacturer. These are the exact same parts that were installed in your vehicle at the factory — same materials, same tolerances, same quality. Using OEM parts ensures perfect fit, maintains your warranty, and preserves the safety and performance standards your vehicle was designed with."
  },
  {
    q: "Are OEM parts more expensive than aftermarket?",
    a: "OEM parts typically cost 20-60% more upfront than budget aftermarket alternatives. However, they last significantly longer, fit perfectly without modifications, and come with manufacturer warranty. When you factor in the cost of failed aftermarket parts, repeat labor charges, and potential damage from poor fitment, OEM parts often cost LESS over the lifetime of your vehicle."
  },
  {
    q: "How do I know if a part is genuine OEM?",
    a: "Genuine OEM parts come in manufacturer-branded packaging with part numbers that match your vehicle's specifications. They're sold through authorized dealers and verified retailers. GarageBot only links to authorized OEM parts sources — never knockoff or counterfeit distributors."
  },
  {
    q: "Will aftermarket parts void my warranty?",
    a: "While the Magnuson-Moss Warranty Act prevents dealers from voiding your entire warranty for using aftermarket parts, if an aftermarket part causes damage, that specific repair won't be covered. Using OEM parts eliminates this risk entirely and keeps your full factory warranty intact."
  },
  {
    q: "Can I use OEM parts from a different year or model?",
    a: "Some OEM parts are shared across model years and even different models on the same platform. However, always verify using VIN-based lookup tools available at each OEM retailer. Even slight differences in year or trim level can affect fitment, especially for electrical components and body panels."
  },
  {
    q: "Does GarageBot charge a fee for OEM parts links?",
    a: "GarageBot is completely free for you to use. We may earn a small affiliate commission when you purchase through our partner links — this never affects your price. We only partner with authorized OEM retailers to ensure you're always getting genuine parts."
  },
  {
    q: "What's the difference between OEM and OES parts?",
    a: "OEM (Original Equipment Manufacturer) parts come in the vehicle manufacturer's branded packaging. OES (Original Equipment Supplier) parts are made by the same company that supplies the manufacturer, but sold under the supplier's own brand (like Bosch, Denso, or Continental). Both offer the same quality — OES parts are often 10-20% cheaper since you're not paying for the brand name packaging."
  },
];

const comparisonData = [
  { aspect: "Fit & Compatibility", oem: "Perfect factory fit — no modifications", aftermarket: "May require trimming, adapting, or improvisation" },
  { aspect: "Materials & Quality", oem: "Same materials, coatings, and tolerances as original", aftermarket: "Varies wildly — some great, many subpar" },
  { aspect: "Warranty Coverage", oem: "Full manufacturer warranty — 12-24 months", aftermarket: "Limited or no warranty — 30-90 days typical" },
  { aspect: "Safety Testing", oem: "Crash-tested and certified to OEM safety standards", aftermarket: "Rarely tested to original safety specifications" },
  { aspect: "Longevity", oem: "Designed to match vehicle lifespan expectations", aftermarket: "Often fails 30-50% sooner than OEM equivalent" },
  { aspect: "Resale Impact", oem: "Maintains or increases vehicle resale value", aftermarket: "Can reduce resale value — buyers notice" },
  { aspect: "Installation", oem: "Drop-in fit — correct bolt pattern, connectors, mounts", aftermarket: "May need spacers, adapters, or fabrication work" },
];

function SkeletonCard() {
  return (
    <Card className="glass-card p-5 h-full animate-pulse">
      <div className="w-full h-40 bg-white/5 rounded-xl mb-4" />
      <div className="h-5 bg-white/5 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/5 rounded w-full mb-1" />
      <div className="h-3 bg-white/5 rounded w-5/6 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
      <div className="mt-5 h-10 bg-white/5 rounded-lg" />
    </Card>
  );
}

export default function OEMParts() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-black overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015]">
          <Factory className="w-[50vw] h-[50vw] text-primary" />
        </div>
      </div>

      <Nav />

      <div className="flex-1 max-w-7xl mx-auto px-3 md:px-6 pt-20 pb-12 w-full">

        {/* === BENTO GRID HEADER === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2"
          >
            <Card className="glass-ultra border-primary/20 p-0 h-full relative overflow-hidden">
              <img src={imgOemHero} alt="OEM Parts" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
              <div className="relative z-10 p-5 md:p-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-[10px] font-mono tracking-wider mb-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                  FACTORY GENUINE
                </div>
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-tech font-black uppercase tracking-tight mb-2"
                  data-testid="heading-oem-parts"
                >
                  <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text">OEM</span>{" "}
                  <span className="text-foreground">Parts</span>
                </h1>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Genuine manufacturer parts from every major brand. Same quality that
                  came on your vehicle from the factory — perfect fit, full warranty, zero compromises.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card card-3d border-green-500/30 p-5 h-full flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Factory className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-3xl font-tech font-black text-green-400">12+</p>
              <p className="text-xs text-muted-foreground font-mono uppercase">OEM Brands</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card card-3d p-4 h-full flex flex-col items-center justify-center gap-1">
              <ShieldCheck className="w-6 h-6 text-cyan-400 mb-1" />
              <p className="text-xl font-tech font-bold text-cyan-400">100%</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Genuine Parts</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card card-3d p-4 h-full flex flex-col items-center justify-center gap-1">
              <BadgeCheck className="w-6 h-6 text-yellow-400 mb-1" />
              <p className="text-xl font-tech font-bold text-yellow-400">24mo</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Warranty (up to)</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="glass-card card-3d p-4 h-full flex flex-col items-center justify-center gap-1">
              <ThumbsUp className="w-6 h-6 text-purple-400 mb-1" />
              <p className="text-xl font-tech font-bold text-purple-400">Perfect</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Factory Fit</p>
            </Card>
          </motion.div>
        </div>

        {/* === OEM vs AFTERMARKET CALLOUT === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="glass-ultra border-yellow-500/20 p-0 relative overflow-hidden">
            <img src={imgOemVsAftermarket} alt="OEM vs Aftermarket" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60" />
            <div className="relative z-10 p-5 md:p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="p-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-oem-vs-aftermarket">Why OEM? Because "You Get What You Pay For"</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">The real cost of cheap aftermarket parts — it's more than just money</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
                <div className="bg-green-500/5 p-3 md:p-4 flex items-center gap-3 border-b border-white/5 md:border-b-0">
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-sm font-tech font-bold text-green-400 uppercase">OEM Genuine</span>
                </div>
                <div className="bg-red-500/5 p-3 md:p-4 flex items-center gap-3 border-b border-white/5">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-sm font-tech font-bold text-red-400 uppercase">Cheap Aftermarket</span>
                </div>
                {comparisonData.map((row, idx) => (
                  <div key={idx} className="contents">
                    <div className="bg-black/30 p-3 md:p-4 border-b border-white/5">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{row.aspect}</p>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-white/80">{row.oem}</p>
                      </div>
                    </div>
                    <div className="bg-black/20 p-3 md:p-4 border-b border-white/5">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1 opacity-0 md:opacity-100">{row.aspect}</p>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-white/50">{row.aftermarket}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* === WHY OEM - 3 COL BENTO === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-oem-advantages">The OEM Advantage</h2>
              <p className="text-xs text-muted-foreground font-mono">Six reasons factory-genuine parts are worth every penny</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {oemAdvantages.map((adv, idx) => (
              <motion.div
                key={adv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
              >
                <Card className="glass-card card-3d p-5 h-full group hover:border-green-500/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${adv.color}66, transparent)` }} />
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl border flex-shrink-0 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${adv.color}15`, borderColor: `${adv.color}25` }}>
                      <adv.icon className="w-5 h-5" style={{ color: adv.color }} />
                    </div>
                    <div>
                      <h3 className="font-tech font-bold text-sm uppercase group-hover:text-green-400 transition-colors">{adv.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* === OEM RETAILERS - MAIN GRID === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-oem-retailers">Authorized OEM Retailers</h2>
              <p className="text-xs text-muted-foreground font-mono">{oemRetailers.length} manufacturer-authorized parts sources — 100% genuine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!loaded ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              oemRetailers.map((retailer, idx) => (
                <motion.div
                  key={retailer.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Card
                    className="glass-card card-3d h-full relative overflow-hidden group hover:border-primary/40 transition-all duration-500"
                    data-testid={`card-oem-${retailer.id}`}
                  >
                    <div className="relative w-full h-44 overflow-hidden">
                      <img
                        src={retailer.image}
                        alt={retailer.name}
                        className="w-full h-full object-cover brightness-90 group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      {retailer.highlight && (
                        <Badge className={`absolute top-3 right-3 ${retailer.highlightColor} text-[9px] font-mono px-2 py-0.5 border`}>
                          {retailer.highlight}
                        </Badge>
                      )}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-tech font-bold text-base uppercase text-white">{retailer.name}</h3>
                        <p className="text-[10px] text-white/60 font-mono">{retailer.brand}</p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(retailer.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                        ))}
                        <span className="text-[11px] font-mono text-muted-foreground ml-1">{retailer.rating}</span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{retailer.tagline}</p>

                      <div className="space-y-1.5 mb-4">
                        {retailer.features.slice(0, 4).map((feat, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[11px] text-muted-foreground">{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-black/30 rounded-lg p-2.5 text-center border border-white/5">
                          <p className="text-xs font-tech font-bold text-primary truncate">{retailer.partsLine}</p>
                          <p className="text-[9px] text-muted-foreground font-mono uppercase">Parts Line</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-2.5 text-center border border-white/5">
                          <p className="text-xs font-tech font-bold text-green-400">{retailer.warrantyInfo.split(" /")[0]}</p>
                          <p className="text-[9px] text-muted-foreground font-mono uppercase">Warranty</p>
                        </div>
                      </div>

                      <div className="bg-white/[0.03] rounded-lg p-2.5 mb-4 border border-white/5">
                        <p className="text-[10px] text-muted-foreground font-mono">
                          <span className="text-white/70 font-medium">Vehicles:</span> {retailer.vehicles}
                        </p>
                      </div>

                      <Button
                        onClick={() => window.open(retailer.searchUrl, "_blank")}
                        className="w-full font-tech uppercase gap-2 glow-primary group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                        data-testid={`button-shop-${retailer.id}`}
                      >
                        <Search className="w-3.5 h-3.5" />
                        Shop {retailer.brand.split(" /")[0]} Parts
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* === PARTS CATEGORIES CAROUSEL === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-oem-categories">OEM Parts Categories</h2>
              <p className="text-xs text-muted-foreground font-mono">Every system covered — engine to exhaust, bumper to bumper</p>
            </div>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3">
              {oemCategories.map((cat, idx) => (
                <CarouselItem key={cat.type} className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-card card-3d p-5 h-full group hover:border-primary/40 transition-all duration-300" data-testid={`card-category-${cat.type.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{cat.icon}</span>
                        <div>
                          <h3 className="font-tech font-bold uppercase text-sm group-hover:text-primary transition-colors">{cat.type}</h3>
                          <p className="text-[11px] text-muted-foreground">{cat.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <div>
                          <p className="text-xs text-muted-foreground">Available</p>
                          <p className="text-sm font-tech font-bold text-primary">{cat.partCount}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
                          <CheckCircle className="w-3 h-3" />
                          OEM Only
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="glass-card border-white/10 hover:border-primary/40 -left-4" />
              <CarouselNext className="glass-card border-white/10 hover:border-primary/40 -right-4" />
            </div>
          </Carousel>
        </motion.div>

        {/* === WARRANTY INFO SECTION === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-oem-warranty">Warranty Protection</h2>
              <p className="text-xs text-muted-foreground font-mono">Every genuine part backed by the manufacturer's warranty</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="glass-card card-3d p-0 md:col-span-2 relative overflow-hidden">
              <img src={imgOemWarranty} alt="OEM Warranty" className="absolute inset-0 w-full h-full object-cover opacity-15" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60" />
              <div className="relative z-10 p-5 md:p-6">
                <h3 className="font-tech font-bold text-base uppercase text-yellow-400 mb-3">Factory Warranty vs Aftermarket "Guarantee"</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70"><span className="text-white font-medium">OEM parts</span> come with 12-24 month manufacturer warranties that cover defects in materials and workmanship</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70"><span className="text-white font-medium">Warranty claims</span> are handled directly by the manufacturer's dealer network — no runaround</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70"><span className="text-white font-medium">Vehicle warranty</span> stays fully intact — OEM parts can't void your factory coverage</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/50">Cheap aftermarket "warranties" are typically 30-90 days, don't cover labor, and often require you to ship the part back at your expense</p>
                  </div>
                </div>
              </div>
            </Card>
            <div className="flex flex-col gap-3">
              <Card className="glass-card card-3d p-4 flex-1 flex flex-col items-center justify-center text-center">
                <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-2xl font-tech font-black text-yellow-400">24</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">Month Warranty (max)</p>
              </Card>
              <Card className="glass-card card-3d p-4 flex-1 flex flex-col items-center justify-center text-center">
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 mb-2">
                  <Globe className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-tech font-black text-green-400">100%</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">Dealer Network Backed</p>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* === FAQ ACCORDION === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-oem-faq">Frequently Asked Questions</h2>
              <p className="text-xs text-muted-foreground font-mono">Everything you need to know about OEM parts</p>
            </div>
          </div>

          <Card className="glass-ultra border-primary/10 p-4 md:p-6">
            <Accordion type="single" collapsible className="space-y-1">
              {faqItems.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border-white/5 rounded-lg overflow-hidden"
                  data-testid={`accordion-oem-faq-${idx}`}
                >
                  <AccordionTrigger className="px-4 py-3.5 text-sm font-tech uppercase tracking-wide hover:text-primary hover:no-underline transition-colors data-[state=open]:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>

        {/* === BOTTOM CTA BENTO === */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <Card className="glass-card-accent card-3d p-6 md:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative z-10">
              <h3 className="font-tech font-bold text-xl uppercase mb-2">
                <span className="text-primary neon-text">Right Part.</span> First Time. <span className="text-green-400">Every Engine.</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md">
                Don't gamble with your vehicle. GarageBot connects you directly to authorized
                OEM retailers — genuine parts, factory warranty, perfect fit guaranteed.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="font-tech uppercase gap-2 glow-primary"
                  data-testid="button-browse-oem"
                >
                  Browse OEM Parts <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("/home", "_self")}
                  className="font-tech uppercase gap-2 glass-card border-white/10 hover:border-primary/40"
                  data-testid="button-search-parts"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search All Parts
                </Button>
              </div>
            </div>
          </Card>

          <Card className="glass-card card-3d p-5 flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h4 className="font-tech font-bold text-sm uppercase mb-1">Affiliate Disclosure</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              GarageBot may receive compensation when you purchase through our partner links.
              This never affects your price — you always get the same dealer pricing.
            </p>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}