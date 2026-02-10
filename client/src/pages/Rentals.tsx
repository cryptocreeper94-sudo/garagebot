import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Car, Plane, MapPin, Calendar, Clock, DollarSign, Star,
  ExternalLink, CheckCircle, Shield, Users, Sparkles,
  ChevronRight, Globe, Zap, Award, TrendingDown,
  Truck, ArrowRight, Search, Heart, ThumbsUp,
  CircleDollarSign, Timer, Navigation, Building2,
  Palmtree, Mountain, Waves, Sun
} from "lucide-react";

interface RentalPartner {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  rating: number;
  features: string[];
  highlight?: string;
  highlightColor?: string;
  commission: string;
  cookieDays: number;
  avgBooking: string;
  affiliateUrl: string;
  searchUrl: string;
  vehicleTypes: string[];
}

const rentalPartners: RentalPartner[] = [
  {
    id: "carla",
    name: "Carla Car Rental",
    emoji: "🚗",
    tagline: "Compare 1,000+ rental companies worldwide",
    rating: 4.7,
    features: [
      "Hertz, Avis, Budget, Sixt & more",
      "Best price guarantee",
      "Free cancellation on most bookings",
      "Airport & city pickup locations",
      "Featured in The Guardian & USA TODAY",
      "24/7 customer support"
    ],
    highlight: "BEST VALUE",
    highlightColor: "bg-green-500/20 text-green-400 border-green-500/30",
    commission: "25%",
    cookieDays: 60,
    avgBooking: "$400",
    affiliateUrl: "https://rentcarla.com",
    searchUrl: "https://rentcarla.com",
    vehicleTypes: ["Economy", "Compact", "Midsize", "Full-size", "SUV", "Luxury", "Van", "Convertible"],
  },
  {
    id: "expedia",
    name: "Expedia",
    emoji: "✈️",
    tagline: "World's largest travel platform — cars, hotels, flights",
    rating: 4.6,
    features: [
      "500+ airlines & rental companies",
      "Bundle & save with hotel+car",
      "One Key rewards program",
      "Price match guarantee",
      "3M+ properties worldwide",
      "Mobile app exclusive deals"
    ],
    highlight: "BUNDLE & SAVE",
    highlightColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    commission: "5%",
    cookieDays: 7,
    avgBooking: "$350",
    affiliateUrl: "https://www.expedia.com",
    searchUrl: "https://www.expedia.com/carsearch",
    vehicleTypes: ["Economy", "Compact", "Midsize", "Standard", "Full-size", "Premium", "Luxury", "SUV", "Minivan"],
  },
  {
    id: "hotels-com",
    name: "Hotels.com",
    emoji: "🏨",
    tagline: "Book your stay + rental car together",
    rating: 4.5,
    features: [
      "3M+ properties worldwide",
      "Car rentals available",
      "One Key rewards",
      "Daily deals & discounts",
      "Price match guarantee",
      "Free cancellation options"
    ],
    commission: "5%",
    cookieDays: 7,
    avgBooking: "$300",
    affiliateUrl: "https://www.hotels.com",
    searchUrl: "https://www.hotels.com",
    vehicleTypes: ["Economy", "Compact", "Standard", "Full-size", "SUV", "Premium"],
  },
];

const popularDestinations = [
  { name: "Orlando", emoji: "🎢", desc: "Theme parks & family fun", avgPrice: "$29/day" },
  { name: "Las Vegas", emoji: "🎰", desc: "Strip cruising & desert roads", avgPrice: "$35/day" },
  { name: "Los Angeles", emoji: "🌴", desc: "Pacific Coast Highway", avgPrice: "$38/day" },
  { name: "Miami", emoji: "🌊", desc: "Beach drives & nightlife", avgPrice: "$32/day" },
  { name: "New York", emoji: "🗽", desc: "City breaks & road trips", avgPrice: "$45/day" },
  { name: "Chicago", emoji: "🏙️", desc: "Lake Shore Drive", avgPrice: "$28/day" },
  { name: "Denver", emoji: "🏔️", desc: "Mountain adventures", avgPrice: "$34/day" },
  { name: "San Francisco", emoji: "🌉", desc: "Golden Gate & wine country", avgPrice: "$42/day" },
  { name: "Nashville", emoji: "🎸", desc: "Music city road trips", avgPrice: "$30/day" },
  { name: "Seattle", emoji: "☕", desc: "Pacific Northwest exploring", avgPrice: "$36/day" },
];

const vehicleCategories = [
  { type: "Economy", icon: "🚙", desc: "Best gas mileage, lowest price", priceRange: "$20-35/day", passengers: "4-5" },
  { type: "SUV", icon: "🚙", desc: "Room for the whole crew + gear", priceRange: "$40-65/day", passengers: "5-7" },
  { type: "Luxury", icon: "🏎️", desc: "Travel in style and comfort", priceRange: "$75-150/day", passengers: "4-5" },
  { type: "Convertible", icon: "🚗", desc: "Open-air cruising", priceRange: "$50-90/day", passengers: "2-4" },
  { type: "Truck", icon: "🛻", desc: "Hauling & towing capability", priceRange: "$45-70/day", passengers: "3-5" },
  { type: "Van/Minivan", icon: "🚐", desc: "Family trips & group travel", priceRange: "$50-80/day", passengers: "7-12" },
];

const faqItems = [
  {
    q: "How does GarageBot find rental car deals?",
    a: "We partner with top rental aggregators like Carla Car Rental and Expedia who compare prices across 1,000+ rental companies including Hertz, Avis, Budget, Enterprise, Sixt, and many local agencies. You always get the best available price."
  },
  {
    q: "Is there a fee to use GarageBot for car rentals?",
    a: "Absolutely not. GarageBot is 100% free for you to use. We earn a small commission from rental partners when you book — this never affects your price. In fact, our partners often have exclusive deals you won't find anywhere else."
  },
  {
    q: "Can I cancel or modify my rental booking?",
    a: "Most bookings through our partners offer free cancellation up to 24-48 hours before pickup. Cancellation policies vary by rental company and rate type — always check the specific terms when booking."
  },
  {
    q: "What do I need to rent a car?",
    a: "Typically you'll need a valid driver's license, a credit card in the driver's name, and you must be at least 21 years old (25 for some luxury/specialty vehicles). International renters may need an International Driving Permit (IDP)."
  },
  {
    q: "Do rental prices include insurance?",
    a: "Basic rates usually don't include insurance. Most rental companies offer Collision Damage Waiver (CDW), Liability Protection, and Personal Accident Insurance as add-ons. Check if your personal auto insurance or credit card already covers rental cars — you could save $15-25/day."
  },
  {
    q: "Can I rent a truck, van, or specialty vehicle?",
    a: "Yes! Our partners offer everything from economy cars to pickup trucks, cargo vans, luxury vehicles, convertibles, and even exotic cars at select locations. Use the vehicle type filters when searching."
  },
  {
    q: "How do I get the cheapest rental car rate?",
    a: "Book early (2-4 weeks ahead), be flexible with pickup/return times, compare across our partners, avoid airport surcharges by picking up off-site, and look for bundle deals that include hotel+car. Weekday rentals are usually cheaper than weekends."
  },
];

const rentalTips = [
  { icon: CircleDollarSign, title: "Book 2-4 Weeks Early", desc: "Prices jump 30-50% within the last week before pickup" },
  { icon: Timer, title: "Off-Airport Pickup", desc: "Airport locations charge 10-15% more in surcharges and fees" },
  { icon: Navigation, title: "Skip the GPS", desc: "Use your phone — rental GPS units cost $10-15/day extra" },
  { icon: Zap, title: "Prepay for Gas", desc: "Fill up at a nearby station before return — it's always cheaper" },
  { icon: Shield, title: "Check Your Coverage", desc: "Your credit card may include free rental car insurance" },
  { icon: Building2, title: "Consider Off-Peak", desc: "Tues-Thurs rentals can be 20-40% cheaper than weekends" },
];

export default function Rentals() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [activeDestIdx, setActiveDestIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDestIdx((prev) => (prev + 1) % popularDestinations.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = useCallback((partner: RentalPartner) => {
    let url = partner.searchUrl;
    if (pickupLocation) {
      url += `?pickup=${encodeURIComponent(pickupLocation)}`;
      if (pickupDate) url += `&pickupDate=${encodeURIComponent(pickupDate)}`;
      if (returnDate) url += `&returnDate=${encodeURIComponent(returnDate)}`;
    }
    window.open(url, "_blank");
  }, [pickupLocation, pickupDate, returnDate]);

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-black overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015]">
          <Car className="w-[50vw] h-[50vw] text-primary" />
        </div>
      </div>

      <Nav />

      <div className="flex-1 max-w-7xl mx-auto px-3 md:px-6 pt-20 pb-12 w-full">

        {/* === BENTO GRID HEADER === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {/* Main Title - spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2"
          >
            <Card className="glass-ultra border-primary/20 p-5 md:p-6 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.03]">
                <Car className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-wider mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--color-primary)]" />
                  NEW FEATURE
                </div>
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-tech font-black uppercase tracking-tight mb-2"
                  data-testid="heading-rentals"
                >
                  <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text">R</span>
                  <span className="text-foreground">ental</span>
                  <span className="text-primary drop-shadow-[0_0_30px_rgba(6,182,212,0.9)] neon-text"> C</span>
                  <span className="text-foreground">ars</span>
                </h1>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Compare prices across 1,000+ rental companies. From economy to luxury,
                  airport to downtown — find the best deal every time.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Stat card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card card-3d border-green-500/30 p-5 h-full flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Globe className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-3xl font-tech font-black text-green-400">1,000+</p>
              <p className="text-xs text-muted-foreground font-mono uppercase">Rental Companies</p>
            </Card>
          </motion.div>

          {/* Stats row - 3 equal cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card card-3d p-4 h-full flex flex-col items-center justify-center gap-1">
              <MapPin className="w-6 h-6 text-cyan-400 mb-1" />
              <p className="text-xl font-tech font-bold text-cyan-400">150+</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Countries</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card card-3d p-4 h-full flex flex-col items-center justify-center gap-1">
              <DollarSign className="w-6 h-6 text-yellow-400 mb-1" />
              <p className="text-xl font-tech font-bold text-yellow-400">$20</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Starting/Day</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="glass-card card-3d p-4 h-full flex flex-col items-center justify-center gap-1">
              <ThumbsUp className="w-6 h-6 text-purple-400 mb-1" />
              <p className="text-xl font-tech font-bold text-purple-400">Free</p>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Cancellation</p>
            </Card>
          </motion.div>
        </div>

        {/* === SEARCH FORM === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="glass-ultra border-primary/30 p-5 md:p-7 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-tech text-lg uppercase font-bold">Find Your Rental</h2>
                  <p className="text-xs text-muted-foreground">Compare prices across all partners instantly</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-mono tracking-wider">Pickup Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="City, airport, or address..."
                      className="pl-10 bg-black/40 border-white/10 focus:border-primary/50"
                      data-testid="input-rental-location"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground font-mono tracking-wider">Pickup Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="pl-10 bg-black/40 border-white/10 focus:border-primary/50"
                      data-testid="input-rental-pickup-date"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground font-mono tracking-wider">Return Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="pl-10 bg-black/40 border-white/10 focus:border-primary/50"
                      data-testid="input-rental-return-date"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {rentalPartners.slice(0, 2).map((partner) => (
                  <Button
                    key={partner.id}
                    onClick={() => handleSearch(partner)}
                    className="font-tech uppercase gap-2 glow-primary"
                    data-testid={`button-search-${partner.id}`}
                  >
                    <span>{partner.emoji}</span>
                    Search {partner.name}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                ))}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground ml-auto">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No fees</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Free cancel</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Best price</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* === POPULAR DESTINATIONS CAROUSEL === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
              <Palmtree className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-popular-destinations">Popular Destinations</h2>
              <p className="text-xs text-muted-foreground font-mono">Top rental car cities across the US</p>
            </div>
          </div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {popularDestinations.map((dest, idx) => (
                <CarouselItem key={dest.name} className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className="glass-card card-3d p-4 cursor-pointer group hover:border-primary/40 transition-all duration-300 h-full"
                      onClick={() => {
                        setPickupLocation(dest.name);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      data-testid={`card-destination-${dest.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{dest.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-tech font-bold text-sm group-hover:text-primary transition-colors">{dest.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{dest.desc}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-mono text-green-400 font-bold">{dest.avgPrice}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
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

        {/* === RENTAL PARTNERS - 3 COLUMN BENTO === */}
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
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-rental-partners">Our Rental Partners</h2>
              <p className="text-xs text-muted-foreground font-mono">Trusted platforms, best prices, no hidden fees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rentalPartners.map((partner, idx) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className="glass-card card-3d p-5 h-full relative overflow-hidden group hover:border-primary/40 transition-all duration-500"
                  data-testid={`card-partner-${partner.id}`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)` }}
                  />
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Car className="w-full h-full" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{partner.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-tech font-bold text-base uppercase">{partner.name}</h3>
                          {partner.highlight && (
                            <Badge className={`${partner.highlightColor} text-[9px] font-mono px-1.5 py-0`}>
                              {partner.highlight}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(partner.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                          ))}
                          <span className="text-[11px] font-mono text-muted-foreground ml-1">{partner.rating}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4">{partner.tagline}</p>

                    <div className="space-y-2 mb-5">
                      {partner.features.slice(0, 4).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] text-muted-foreground">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <div className="bg-black/30 rounded-lg p-2.5 text-center border border-white/5">
                        <p className="text-lg font-tech font-bold text-primary">{partner.avgBooking}</p>
                        <p className="text-[9px] text-muted-foreground font-mono uppercase">Avg Booking</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2.5 text-center border border-white/5">
                        <p className="text-lg font-tech font-bold text-green-400">Best Price</p>
                        <p className="text-[9px] text-muted-foreground font-mono uppercase">Guarantee</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSearch(partner)}
                      className="w-full font-tech uppercase gap-2 glow-primary group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                      data-testid={`button-book-${partner.id}`}
                    >
                      Search {partner.name} <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* === VEHICLE TYPES CAROUSEL === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-vehicle-types">Vehicle Types</h2>
              <p className="text-xs text-muted-foreground font-mono">From economy to exotic — every category available</p>
            </div>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-3">
              {vehicleCategories.map((cat, idx) => (
                <CarouselItem key={cat.type} className="pl-3 basis-full sm:basis-1/2 md:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-card card-3d p-5 h-full group hover:border-primary/40 transition-all duration-300" data-testid={`card-vehicle-${cat.type.toLowerCase()}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{cat.icon}</span>
                        <div>
                          <h3 className="font-tech font-bold uppercase text-sm">{cat.type}</h3>
                          <p className="text-[11px] text-muted-foreground">{cat.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <div>
                          <p className="text-xs text-muted-foreground">Starting at</p>
                          <p className="text-sm font-tech font-bold text-green-400">{cat.priceRange}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Passengers</p>
                          <div className="flex items-center gap-1 justify-end">
                            <Users className="w-3 h-3 text-primary" />
                            <p className="text-sm font-mono text-primary">{cat.passengers}</p>
                          </div>
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

        {/* === MONEY-SAVING TIPS - 3 COL BENTO === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-rental-tips">Money-Saving Tips</h2>
              <p className="text-xs text-muted-foreground font-mono">Save $50-200+ on every rental with these pro tips</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rentalTips.map((tip, idx) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
              >
                <Card className="glass-card card-3d p-4 h-full group hover:border-green-500/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                      <tip.icon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-tech font-bold text-sm uppercase group-hover:text-green-400 transition-colors">{tip.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
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
              <h2 className="font-tech text-lg uppercase font-bold" data-testid="heading-rental-faq">Frequently Asked Questions</h2>
              <p className="text-xs text-muted-foreground font-mono">Everything you need to know about renting through GarageBot</p>
            </div>
          </div>

          <Card className="glass-ultra border-primary/10 p-4 md:p-6">
            <Accordion type="single" collapsible className="space-y-1">
              {faqItems.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border-white/5 rounded-lg overflow-hidden"
                  data-testid={`accordion-faq-${idx}`}
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
                <span className="text-primary neon-text">Right Price.</span> Every Rental.
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md">
                GarageBot doesn't just find parts — we help you hit the road too.
                Compare rental cars, book hotels, and plan your trip all in one place.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="font-tech uppercase gap-2 glow-primary"
                  data-testid="button-start-search"
                >
                  Start Searching <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("https://rentcarla.com", "_blank")}
                  className="font-tech uppercase gap-2 glass-card border-white/10 hover:border-primary/40"
                  data-testid="button-visit-carla"
                >
                  Visit Carla <ExternalLink className="w-3.5 h-3.5" />
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
              GarageBot may receive compensation when you book through our partner links. This never affects your price — you always get the same rate or better.
            </p>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}