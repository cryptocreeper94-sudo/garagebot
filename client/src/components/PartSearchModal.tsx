import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Zap, Car, Bike, Ship, Truck, Tractor, Plane, Cog,
  Gamepad2, ChevronRight, Sparkles, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VEHICLE_TYPES } from "@/lib/mockData";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";

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

const TYPE_ICONS: Record<string, any> = {
  cars: Car, classics: Car, exotics: Car, motorcycles: Bike, atvs: Cog,
  boats: Ship, powersports: Cog, rv: Truck, diesel: Truck, tractors: Tractor,
  heavyequip: Tractor, generators: Zap, smallengines: Cog, aviation: Plane,
  rc: Gamepad2, drones: Gamepad2, modelaircraft: Plane, slotcars: Gamepad2,
};

const QUICK_SEARCHES = [
  "Brake Pads", "Oil Filter", "Spark Plugs", "Battery", "Air Filter",
  "Headlight Bulbs", "Wiper Blades", "Serpentine Belt", "Cabin Filter",
  "Alternator", "Starter Motor", "Radiator"
];

const LS_KEY = "gb-search-modal-seen";

function hasSeenModal(): boolean {
  try { return localStorage.getItem(LS_KEY) === "1"; } catch { return false; }
}
function markModalSeen() {
  try { localStorage.setItem(LS_KEY, "1"); } catch {}
}

interface SearchFormProps {
  compact?: boolean;
  onSearch: (params: URLSearchParams) => void;
  isSearching: boolean;
}

function SearchForm({ compact, onSearch, isSearching }: SearchFormProps) {
  const [vehicleType, setVehicleType] = useState("cars");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const makes = useMemo(() => MAKES_BY_TYPE[vehicleType] || MAKES_BY_TYPE.cars, [vehicleType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.set("q", searchQuery.trim());
    if (vehicleType) params.set("type", vehicleType);
    if (year) params.set("year", year);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    onSearch(params);
  };

  const handleQuickSearch = (term: string) => {
    const params = new URLSearchParams();
    params.set("q", term);
    if (vehicleType) params.set("type", vehicleType);
    if (year) params.set("year", year);
    if (make) params.set("make", make);
    onSearch(params);
  };

  const selectClasses = compact
    ? "h-9 bg-black/30 border-white/10 font-mono text-[10px] focus:border-cyan-500/50 hover:bg-black/40 transition-colors"
    : "h-11 bg-white/[0.04] border-white/[0.08] font-mono text-xs focus:border-cyan-500/50 hover:bg-white/[0.06] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-5"}`}>
        <div>
          <label className={`font-mono text-muted-foreground mb-1 block ml-1 uppercase ${compact ? "text-[9px]" : "text-[10px]"}`}>Type</label>
          <Select value={vehicleType} onValueChange={(v) => { setVehicleType(v); setMake(""); setModel(""); }}>
            <SelectTrigger className={selectClasses} data-testid="psm-select-type">
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
          <label className={`font-mono text-muted-foreground mb-1 block ml-1 uppercase ${compact ? "text-[9px]" : "text-[10px]"}`}>Year</label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className={selectClasses} data-testid="psm-select-year">
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
          <label className={`font-mono text-muted-foreground mb-1 block ml-1 uppercase ${compact ? "text-[9px]" : "text-[10px]"}`}>Make</label>
          <Select value={make} onValueChange={(v) => { setMake(v); setModel(""); }}>
            <SelectTrigger className={selectClasses} data-testid="psm-select-make">
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
          <label className={`font-mono text-muted-foreground mb-1 block ml-1 uppercase ${compact ? "text-[9px]" : "text-[10px]"}`}>Model</label>
          <Input
            className={compact
              ? "h-9 bg-black/30 border-white/10 font-mono text-[10px] focus:border-cyan-500/50 placeholder:text-white/25"
              : "h-11 bg-white/[0.04] border-white/[0.08] font-mono text-xs focus:border-cyan-500/50 placeholder:text-white/25"
            }
            placeholder="e.g. Camry"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            data-testid="psm-input-model"
          />
        </div>
        {!compact && (
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block ml-1 uppercase">Submodel</label>
            <Input
              className="h-11 bg-white/[0.04] border-white/[0.08] font-mono text-xs focus:border-cyan-500/50 placeholder:text-white/25"
              placeholder="e.g. SE V6"
              data-testid="psm-input-submodel"
            />
          </div>
        )}
      </div>

      <div className={`flex gap-2 ${compact ? "" : "mt-2"}`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
          <Input
            className={compact
              ? "pl-9 h-10 bg-black/30 border-white/10 text-sm font-medium placeholder:text-white/30 focus:border-cyan-500/50"
              : "pl-11 h-14 bg-white/[0.04] border-white/[0.08] text-base sm:text-lg font-medium placeholder:text-white/30 focus:border-cyan-500/50"
            }
            placeholder="What part are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={!compact}
            data-testid="psm-input-search"
          />
        </div>
        <Button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className={compact
            ? "h-10 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-tech text-xs uppercase tracking-wider"
            : "h-14 px-6 sm:px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-tech text-sm uppercase tracking-wider min-w-[140px]"
          }
          data-testid="psm-button-search"
        >
          {isSearching ? (
            <span className="animate-pulse text-xs">Scanning...</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Zap className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
              {compact ? "Search" : "Find Parts"}
            </span>
          )}
        </Button>
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-white/30 uppercase mr-1 self-center">Popular:</span>
          {QUICK_SEARCHES.slice(0, 8).map(term => (
            <button
              key={term}
              type="button"
              onClick={() => handleQuickSearch(term)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/50 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/[0.06] transition-all font-mono"
              data-testid={`psm-quick-${term.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

export function PartSearchBanner() {
  const [_, setLocation] = useLocation();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((params: URLSearchParams) => {
    setIsSearching(true);
    setTimeout(() => setLocation(`/results?${params.toString()}`), 600);
  }, [setLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl mb-8"
      data-testid="part-search-banner"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.06] via-blue-500/[0.04] to-cyan-500/[0.06] backdrop-blur-xl border border-cyan-500/15 rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-purple-500/[0.03] rounded-2xl" />
      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-tech font-bold uppercase text-cyan-400 tracking-wider">Quick Parts Search</span>
          <div className="flex items-center gap-1 ml-auto px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
            <Database className="w-3 h-3 text-cyan-400/60" />
            <span className="text-[9px] font-mono text-white/40">104 Retailers</span>
          </div>
        </div>
        <SearchForm compact onSearch={handleSearch} isSearching={isSearching} />
      </div>
    </motion.div>
  );
}

export function PartSearchModal() {
  const [_, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!hasSeenModal()) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    markModalSeen();
  }, []);

  const handleSearch = useCallback((params: URLSearchParams) => {
    setIsSearching(true);
    markModalSeen();
    setTimeout(() => {
      setIsOpen(false);
      setLocation(`/results?${params.toString()}`);
    }, 600);
  }, [setLocation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleClose}
          data-testid="part-search-modal-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 shadow-[0_0_80px_rgba(6,182,212,0.15),0_0_200px_rgba(6,182,212,0.05)]">
              <div className="absolute inset-0 bg-[#0a0f1e]" />
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.06] via-transparent to-purple-500/[0.04]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-cyan-500/[0.06] rounded-full blur-[100px]" />

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                data-testid="psm-close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <motion.img
                    src={gbEmblem}
                    alt="GarageBot"
                    className="w-14 h-14 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  />
                  <h2 className="text-2xl sm:text-3xl font-tech font-black uppercase tracking-tight text-white mb-2">
                    What Are You <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Working On?</span>
                  </h2>
                  <p className="text-sm text-white/40 max-w-md mx-auto">
                    Tell us your vehicle and the part you need — we'll search 104 retailers and find the best prices instantly.
                  </p>
                </div>

                <SearchForm onSearch={handleSearch} isSearching={isSearching} />

                <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap gap-3 items-center justify-center">
                  <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">Comparing:</span>
                  <div className="flex gap-3 flex-wrap justify-center opacity-50 hover:opacity-80 transition-all">
                    <span className="font-bold text-[11px] text-orange-500">AutoZone</span>
                    <span className="font-bold text-[11px] text-green-500">O'Reilly</span>
                    <span className="font-bold text-[11px] text-yellow-500">RockAuto</span>
                    <span className="font-bold text-[11px] text-amber-400">Amazon</span>
                    <span className="font-bold text-[11px] text-blue-500">NAPA</span>
                    <span className="font-bold text-[11px] text-red-500">Summit Racing</span>
                    <span className="text-[11px] font-mono text-cyan-400">+ 98 more</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="block mx-auto mt-4 text-xs text-white/25 hover:text-white/50 transition-colors font-mono"
                  data-testid="psm-skip"
                >
                  Skip — I'll browse first
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
