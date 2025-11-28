import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/mockData";

export default function VehicleTypeSelector() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-tech text-xs uppercase tracking-wider text-muted-foreground">
          Select Vehicle Type
        </h3>
        <Link href="/garage">
          <span className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer group">
            My Garage <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
      
      {/* Full-width scrollable container */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-2 lg:gap-3 lg:flex-wrap lg:justify-center xl:justify-start" style={{ minWidth: "max-content" }}>
          {VEHICLE_TYPES.map((type, index) => (
            <Link key={type.id} href={`/results?type=${type.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-[72px] lg:h-[72px] rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm cursor-pointer hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                data-testid={`vehicle-type-${type.id}`}
              >
                <motion.div 
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-1 group-hover:from-primary/30 group-hover:to-primary/15 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <type.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                </motion.div>
                <span className="font-tech text-[8px] md:text-[9px] uppercase tracking-wide text-foreground text-center px-1 leading-tight whitespace-nowrap">
                  {type.name}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
