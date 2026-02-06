import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, CarFront, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VEHICLE_TYPES } from "@/lib/mockData";
import heroBg from "@assets/generated_images/technical_blueprint_style_background_of_automotive_parts.png";

const YEARS = Array.from({ length: 50 }, (_, i) => (2026 - i).toString());

const MAKES_BY_TYPE: Record<string, string[]> = {
  cars: ["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"],
  classics: ["AMC", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "Lincoln", "Mercury", "Oldsmobile", "Plymouth", "Pontiac", "Studebaker"],
  exotics: ["Aston Martin", "Bentley", "Bugatti", "Ferrari", "Lamborghini", "Lotus", "Maserati", "McLaren", "Porsche", "Rolls-Royce"],
  motorcycles: ["BMW", "Ducati", "Harley-Davidson", "Honda", "Indian", "Kawasaki", "KTM", "Suzuki", "Triumph", "Yamaha"],
  atvs: ["Arctic Cat", "Can-Am", "Honda", "Kawasaki", "Polaris", "Suzuki", "Yamaha"],
  boats: ["Bass Cat", "Boston Whaler", "Brunswick", "Chaparral", "Evinrude", "Grady-White", "Honda Marine", "Mercury", "Minn Kota", "Sea-Doo", "Tracker", "Yamaha Marine"],
  powersports: ["Arctic Cat", "Can-Am", "Honda", "Kawasaki", "Polaris", "Ski-Doo", "Suzuki", "Yamaha"],
  rv: ["Airstream", "Coachmen", "Forest River", "Jayco", "Keystone", "Thor", "Winnebago"],
  diesel: ["Caterpillar", "Cummins", "Detroit Diesel", "Ford", "Freightliner", "International", "Kenworth", "Mack", "Peterbilt", "Volvo"],
  tractors: ["Case IH", "Deere", "Kubota", "Massey Ferguson", "New Holland"],
  heavyequip: ["Bobcat", "Case", "Caterpillar", "Deere", "Hitachi", "Komatsu", "Kubota", "Volvo"],
  generators: ["Champion", "Generac", "Honda", "Kohler", "Predator", "Westinghouse", "Yamaha"],
  smallengines: ["Briggs & Stratton", "Honda", "Husqvarna", "Kawasaki", "Kohler", "Stihl", "Toro"],
  aviation: ["Beechcraft", "Cessna", "Cirrus", "Continental", "Diamond", "Garmin", "Lycoming", "Piper", "Robinson"],
  rc: ["Arrma", "Axial", "HPI Racing", "Losi", "Redcat Racing", "Team Associated", "Traxxas"],
  drones: ["BetaFPV", "DJI", "Emax", "GEPRC", "iFlight", "TBS"],
  modelaircraft: ["E-flite", "FMS", "Freewing", "Hangar 9", "Phoenix Model", "Top Flite"],
  slotcars: ["AFX", "Auto World", "Carrera", "NSR", "Scalextric", "Slot.it"],
};

export default function SearchHero() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState("cars");

  const makes = useMemo(() => MAKES_BY_TYPE[vehicleType] || MAKES_BY_TYPE.cars, [vehicleType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    const params = new URLSearchParams();
    params.set("q", searchQuery.trim());
    if (year) params.set("year", year);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (vehicleType) params.set("type", vehicleType);

    setTimeout(() => {
      setLocation(`/results?${params.toString()}`);
    }, 800);
  };

  return (
    <div className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-border">
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />
      <div className="absolute inset-0 bg-grid-pattern z-0 opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SYSTEM ONLINE // AGGREGATING 58 VENDORS
          </div>
          
          <h1 className="text-5xl md:text-7xl font-tech font-bold uppercase tracking-tight mb-6 text-white leading-none">
            Right Part. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">First Time.</span>
            <br />
            Every Engine.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            From RC cars to heavy equipment — compare prices across 58 retailers and go straight to the exact part that fits your vehicle.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-5xl mx-auto glass-panel p-6 md:p-8 rounded-xl shadow-2xl border-primary/20"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">VEHICLE TYPE</label>
                <Select value={vehicleType} onValueChange={(v) => { setVehicleType(v); setMake(""); setModel(""); }}>
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:border-primary font-mono text-xs" data-testid="select-vehicle-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {VEHICLE_TYPES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">YEAR</label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:border-primary font-mono text-xs" data-testid="select-year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {YEARS.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">MAKE</label>
                <Select value={make} onValueChange={(v) => { setMake(v); setModel(""); }}>
                  <SelectTrigger className="h-11 bg-background/50 border-border focus:border-primary font-mono text-xs" data-testid="select-make">
                    <SelectValue placeholder="Make" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {makes.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block ml-1">MODEL</label>
                <Input 
                  className="h-11 bg-background/50 border-border focus:border-primary font-mono text-xs"
                  placeholder="Enter model..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  data-testid="input-model"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-1">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  className="h-14 pl-12 bg-background/50 border-border focus:border-primary text-lg font-medium placeholder:font-light" 
                  placeholder="Search for a part (e.g., 'Brake Pads', 'Oil Filter', 'Servo Motor')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-query"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-tech font-bold text-lg tracking-wide uppercase min-w-[200px]"
                disabled={isSearching || !searchQuery.trim()}
                data-testid="button-find-parts"
              >
                {isSearching ? (
                  <span className="animate-pulse">Scanning 58 Stores...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Find Parts
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Comparing prices from:</span>
            <div className="flex gap-4 flex-wrap opacity-60 hover:opacity-100 transition-all">
              <span className="font-bold text-xs text-orange-500">AutoZone</span>
              <span className="font-bold text-xs text-green-500">O'Reilly</span>
              <span className="font-bold text-xs text-yellow-500">RockAuto</span>
              <span className="font-bold text-xs text-amber-400">Amazon</span>
              <span className="font-bold text-xs text-blue-500">NAPA</span>
              <span className="font-bold text-xs text-red-500">Summit Racing</span>
              <span className="font-bold text-xs text-blue-400">eBay Motors</span>
              <span className="text-xs font-mono text-primary">+ 51 more</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
