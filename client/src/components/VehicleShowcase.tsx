import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Car, ChevronRight } from "lucide-react";

interface VehicleType {
  id: string;
  name: string;
  image: string;
  description: string;
}

const SHOWCASE_VEHICLES: VehicleType[] = [
  { id: "cars", name: "Cars", image: "/generated_images/cars_and_trucks.png", description: "Sedans, coupes, hatchbacks & more" },
  { id: "trucks", name: "Trucks", image: "/generated_images/pickup_truck.png", description: "Pickups, flatbeds & haulers" },
  { id: "motorcycles", name: "Motorcycles", image: "/generated_images/motorcycle.png", description: "Street, sport & cruiser bikes" },
  { id: "atvs", name: "ATVs", image: "/generated_images/atv_and_utv.png", description: "All-terrain quads & buggies" },
  { id: "utvs", name: "UTVs", image: "/generated_images/atv_and_utv.png", description: "Side-by-sides & utility vehicles" },
  { id: "rvs", name: "RVs", image: "/generated_images/rv_trailer.png", description: "Motorhomes, campers & trailers" },
  { id: "boats", name: "Boats", image: "/generated_images/boat_marine.png", description: "Fishing, pontoon & speedboats" },
  { id: "jetskis", name: "Jet Skis", image: "/generated_images/jet_ski_watercraft.png", description: "Personal watercraft & wave runners" },
  { id: "snowmobiles", name: "Snowmobiles", image: "/generated_images/snowmobile_snow.png", description: "Trail, mountain & touring sleds" },
  { id: "golfcarts", name: "Golf Carts", image: "/generated_images/golf_cart.png", description: "Electric & gas golf vehicles" },
  { id: "gokarts", name: "Go-Karts", image: "/generated_images/go_kart_racing.png", description: "Racing & recreational karts" },
  { id: "smallengines", name: "Small Engines", image: "/generated_images/small_engines_equipment.png", description: "Mowers, chainsaws & trimmers" },
  { id: "aviation", name: "Aviation", image: "/generated_images/aviation_aircraft.png", description: "Aircraft, helicopters & ultralights" },
  { id: "tractors", name: "Tractors & Farm", image: "/generated_images/tractor_farm.png", description: "Farm equipment & implements" },
  { id: "heavyequipment", name: "Heavy Equipment", image: "/generated_images/heavy_equipment.png", description: "Excavators, loaders & dozers" },
];

function VehicleCard({ vehicle, index }: { vehicle: VehicleType; index: number }) {
  return (
    <Link href={`/results?type=${vehicle.id}`}>
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.97 }}
        className="relative w-[140px] h-[160px] rounded-xl overflow-hidden cursor-pointer shrink-0 group"
        data-testid={`vehicle-showcase-card-${vehicle.id}`}
      >
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 border border-white/10 rounded-xl group-hover:border-primary/60 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          <span className="font-tech text-xs uppercase tracking-wide text-white drop-shadow-lg" data-testid={`vehicle-showcase-name-${vehicle.id}`}>
            {vehicle.name}
          </span>
          <p className="text-[8px] text-white/70 mt-0.5 leading-tight line-clamp-1">
            {vehicle.description}
          </p>
          <span className="inline-flex items-center gap-0.5 text-[8px] text-primary font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Search Parts <ChevronRight className="w-2.5 h-2.5" />
          </span>
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
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
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
