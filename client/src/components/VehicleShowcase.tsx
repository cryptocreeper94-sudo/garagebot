import { useState, useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Link } from "wouter";
import {
  Car, Truck, Bike, Ship, Plane, Tractor, Snowflake,
  Waves, Tent, Cog, Leaf, Zap, Mountain, CircleDot, HardHat,
  ChevronRight,
} from "lucide-react";

interface VehicleType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SHOWCASE_VEHICLES: VehicleType[] = [
  { id: "cars", name: "Cars", icon: Car, description: "Sedans, coupes, hatchbacks & more" },
  { id: "trucks", name: "Trucks", icon: Truck, description: "Pickups, flatbeds & haulers" },
  { id: "motorcycles", name: "Motorcycles", icon: Bike, description: "Street, sport & cruiser bikes" },
  { id: "atvs", name: "ATVs", icon: Mountain, description: "All-terrain quads & buggies" },
  { id: "utvs", name: "UTVs", icon: Cog, description: "Side-by-sides & utility vehicles" },
  { id: "rvs", name: "RVs", icon: Tent, description: "Motorhomes, campers & trailers" },
  { id: "boats", name: "Boats", icon: Ship, description: "Fishing, pontoon & speedboats" },
  { id: "jetskis", name: "Jet Skis", icon: Waves, description: "Personal watercraft & wave runners" },
  { id: "snowmobiles", name: "Snowmobiles", icon: Snowflake, description: "Trail, mountain & touring sleds" },
  { id: "golfcarts", name: "Golf Carts", icon: CircleDot, description: "Electric & gas golf vehicles" },
  { id: "gokarts", name: "Go-Karts", icon: Zap, description: "Racing & recreational karts" },
  { id: "smallengines", name: "Small Engines", icon: Leaf, description: "Mowers, chainsaws & trimmers" },
  { id: "aviation", name: "Aviation", icon: Plane, description: "Aircraft, helicopters & ultralights" },
  { id: "tractors", name: "Tractors & Farm", icon: Tractor, description: "Farm equipment & implements" },
  { id: "heavyequipment", name: "Heavy Equipment", icon: HardHat, description: "Excavators, loaders & dozers" },
];

function VehicleCard({ vehicle, index }: { vehicle: VehicleType; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = vehicle.icon;

  return (
    <Link href={`/results?vehicleType=${vehicle.id}`}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.97 }}
        className="relative w-[140px] h-[160px] rounded-xl overflow-hidden cursor-pointer shrink-0 group"
        data-testid={`vehicle-showcase-card-${vehicle.id}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-primary/5" />

        <div className="absolute inset-0 border border-white/10 rounded-xl group-hover:border-primary/60 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>

          <span className="font-tech text-xs uppercase tracking-wide text-foreground" data-testid={`vehicle-showcase-name-${vehicle.id}`}>
            {vehicle.name}
          </span>

          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? "auto" : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-[9px] text-muted-foreground mt-1 leading-tight">
              {vehicle.description}
            </p>
            <span className="inline-flex items-center gap-0.5 text-[9px] text-primary font-mono mt-1.5">
              Search Parts <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function VehicleShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  const doubledVehicles = [...SHOWCASE_VEHICLES, ...SHOWCASE_VEHICLES];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const singleSetWidth = container.scrollWidth / 2;

    const animate = () => {
      if (!isPaused && container) {
        scrollRef.current += 0.5;
        if (scrollRef.current >= singleSetWidth) {
          scrollRef.current = 0;
        }
        container.scrollLeft = scrollRef.current;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="w-full"
      data-testid="vehicle-showcase"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Car className="w-3 h-3 text-primary" />
          </div>
          <h3 className="font-tech text-sm uppercase tracking-wider text-foreground" data-testid="vehicle-showcase-title">
            Every Engine Covered
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground" data-testid="vehicle-showcase-count">
          {SHOWCASE_VEHICLES.length} Types
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-3 overflow-x-hidden py-2 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          data-testid="vehicle-showcase-carousel"
        >
          {doubledVehicles.map((vehicle, index) => (
            <VehicleCard key={`${vehicle.id}-${index}`} vehicle={vehicle} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
