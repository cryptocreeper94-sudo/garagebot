import { useState } from "react";
import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Shield, Car, DollarSign, Clock, ExternalLink, ChevronRight, 
  Star, CheckCircle, Zap, Users, TrendingDown, ArrowRight,
  Truck, Bike, Anchor, Home
} from "lucide-react";

interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  rating: number;
  features: string[];
  avgSavings: string;
  quoteTime: string;
  affiliateUrl: string;
  commission: string;
  highlight?: string;
}

const insuranceProviders: InsuranceProvider[] = [
  {
    id: "insurify",
    name: "Insurify",
    logo: "🔍",
    tagline: "Compare 100+ carriers instantly",
    rating: 4.8,
    features: ["Compare 100+ carriers", "Real-time quotes", "No obligation", "Save up to $996/year"],
    avgSavings: "$996",
    quoteTime: "2 min",
    affiliateUrl: "#", // Replace with actual affiliate link
    commission: "$15/lead",
    highlight: "BEST FOR COMPARISON"
  },
  {
    id: "liberty-mutual",
    name: "Liberty Mutual",
    logo: "🗽",
    tagline: "Customize your coverage",
    rating: 4.5,
    features: ["Accident forgiveness", "New car replacement", "Lifetime repair guarantee", "24/7 claims"],
    avgSavings: "$725",
    quoteTime: "5 min",
    affiliateUrl: "#",
    commission: "$10/lead"
  },
  {
    id: "aaa",
    name: "AAA Insurance",
    logo: "🅰️",
    tagline: "Trusted roadside + insurance",
    rating: 4.7,
    features: ["Roadside assistance included", "Accident forgiveness", "Multi-policy discounts", "Membership perks"],
    avgSavings: "$850",
    quoteTime: "4 min",
    affiliateUrl: "#",
    commission: "$15/sale",
    highlight: "INCLUDES ROADSIDE"
  },
  {
    id: "usaa",
    name: "USAA",
    logo: "⭐",
    tagline: "Exclusive military benefits",
    rating: 4.9,
    features: ["Military exclusive rates", "Dividend returns", "Excellent service", "Family coverage"],
    avgSavings: "$1,100",
    quoteTime: "3 min",
    affiliateUrl: "#",
    commission: "$10/lead",
    highlight: "MILITARY ONLY"
  },
  {
    id: "esurance",
    name: "Esurance",
    logo: "📱",
    tagline: "100% online, A+ rated",
    rating: 4.4,
    features: ["Fully digital experience", "Photo claims", "DriveSense savings", "A+ rated"],
    avgSavings: "$550",
    quoteTime: "3 min",
    affiliateUrl: "#",
    commission: "$13/action"
  },
  {
    id: "next-insurance",
    name: "Next Insurance",
    logo: "🚀",
    tagline: "Commercial auto specialists",
    rating: 4.6,
    features: ["Commercial coverage", "Fleet discounts", "Fast online quotes", "Business bundles"],
    avgSavings: "$750",
    quoteTime: "4 min",
    affiliateUrl: "#",
    commission: "$25/lead",
    highlight: "COMMERCIAL AUTO"
  }
];

const vehicleTypes = [
  { value: "auto", label: "Car/Truck", icon: Car },
  { value: "motorcycle", label: "Motorcycle", icon: Bike },
  { value: "rv", label: "RV/Motorhome", icon: Truck },
  { value: "boat", label: "Boat/PWC", icon: Anchor },
  { value: "commercial", label: "Commercial", icon: Truck },
];

export default function Insurance() {
  const [zipCode, setZipCode] = useState("");
  const [vehicleType, setVehicleType] = useState("auto");
  const [currentInsurer, setCurrentInsurer] = useState("");

  const handleGetQuote = (provider: InsuranceProvider) => {
    // Track click for analytics
    console.log(`Affiliate click: ${provider.name}`);
    // In production, this would open the affiliate URL
    if (provider.affiliateUrl !== "#") {
      window.open(provider.affiliateUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30 font-mono">
            COMPARE & SAVE
          </Badge>
          <h1 className="text-4xl md:text-6xl font-tech font-bold uppercase mb-4">
            <span className="text-primary">Insurance</span> Comparison
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-mono">
            COMPARE RATES FROM 100+ CARRIERS • SAVE UP TO $996/YEAR • FREE QUOTES IN MINUTES
          </p>
        </div>

        {/* Quick Quote Form */}
        <Card className="max-w-4xl mx-auto mb-12 p-6 md:p-8 bg-gradient-to-br from-card to-primary/5 border-primary/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/20">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-tech text-xl uppercase font-bold">Quick Compare</h2>
              <p className="text-sm text-muted-foreground">Get matched with the best rates in seconds</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">ZIP Code</Label>
              <Input 
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZIP"
                className="mt-1"
                maxLength={5}
                data-testid="input-insurance-zip"
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="mt-1" data-testid="select-vehicle-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" /> {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Current Insurer</Label>
              <Select value={currentInsurer} onValueChange={setCurrentInsurer}>
                <SelectTrigger className="mt-1" data-testid="select-current-insurer">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No current insurance</SelectItem>
                  <SelectItem value="geico">GEICO</SelectItem>
                  <SelectItem value="progressive">Progressive</SelectItem>
                  <SelectItem value="statefarm">State Farm</SelectItem>
                  <SelectItem value="allstate">Allstate</SelectItem>
                  <SelectItem value="farmers">Farmers</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full font-tech uppercase glow-primary gap-2" data-testid="button-compare-all">
                Compare All <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> No obligation</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Free quotes</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Compare 100+ carriers</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 2-minute process</span>
          </div>
        </Card>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {[
            { icon: Users, value: "2M+", label: "Users Compared" },
            { icon: DollarSign, value: "$996", label: "Avg Savings" },
            { icon: Shield, value: "100+", label: "Carriers" },
            { icon: Clock, value: "2 min", label: "Quote Time" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 text-center bg-card/50 border-muted">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-tech font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Provider Cards */}
        <div className="max-w-5xl mx-auto">
          <h2 className="font-tech text-xl uppercase mb-6 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-500" />
            Top Rated Insurance Providers
          </h2>
          
          <div className="space-y-4">
            {insuranceProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-4 md:p-6 bg-card hover:border-primary/50 transition-all cursor-pointer group ${provider.highlight ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent' : ''}`}
                  onClick={() => handleGetQuote(provider)}
                  data-testid={`card-insurance-${provider.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Logo & Name */}
                    <div className="flex items-center gap-4 md:w-1/4">
                      <div className="text-4xl">{provider.logo}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-tech font-bold text-lg">{provider.name}</h3>
                          {provider.highlight && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-mono">
                              {provider.highlight}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{provider.tagline}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-mono">{provider.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="md:w-2/5 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {provider.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="text-xs bg-muted/50 px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" /> {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats & CTA */}
                    <div className="flex items-center gap-6 md:w-1/3 justify-between md:justify-end">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase">Avg Savings</div>
                        <div className="text-xl font-tech font-bold text-green-400">{provider.avgSavings}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase">Quote Time</div>
                        <div className="text-lg font-mono text-primary">{provider.quoteTime}</div>
                      </div>
                      <Button 
                        className="font-tech uppercase gap-1 group-hover:glow-primary"
                        data-testid={`button-quote-${provider.id}`}
                      >
                        Get Quote <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Insurance Types */}
        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="font-tech text-xl uppercase mb-6">More Coverage Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Home, label: "Home Insurance", desc: "Protect your property" },
              { icon: Bike, label: "Motorcycle", desc: "Two-wheel coverage" },
              { icon: Anchor, label: "Boat & PWC", desc: "Watercraft protection" },
              { icon: Truck, label: "Commercial", desc: "Business vehicles" },
            ].map((type, i) => (
              <Card key={i} className="p-4 text-center hover:border-primary/50 cursor-pointer transition-all group" data-testid={`card-coverage-${type.label.toLowerCase().replace(' ', '-')}`}>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-tech font-bold">{type.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            <Shield className="w-3 h-3 inline mr-1" />
            AutoLedger may receive compensation when you click on provider links. This does not influence our rankings.
            All quotes are provided directly by insurance carriers. Your information is secure and never sold.
          </p>
        </div>
      </div>
    </div>
  );
}
