import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/mockData";

export default function VehicleTypeSelector() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-tech text-sm uppercase tracking-wider text-muted-foreground">
          Select Vehicle Type
        </h3>
        <Link href="/garage">
          <span className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer group">
            My Garage <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 md:gap-3 pb-4" style={{ width: "max-content" }}>
          {VEHICLE_TYPES.map((type, index) => (
            <Link key={type.id} href={`/results?type=${type.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm cursor-pointer hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                data-testid={`vehicle-type-${type.id}`}
              >
                <motion.div 
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-1.5 group-hover:from-primary/30 group-hover:to-primary/15 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <type.icon className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                </motion.div>
                <span className="font-tech text-[9px] md:text-[10px] uppercase tracking-wide text-foreground text-center px-1 leading-tight whitespace-nowrap">
                  {type.name}
                </span>
                <span className="text-[7px] md:text-[8px] text-muted-foreground text-center px-1 leading-tight opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {type.description}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
