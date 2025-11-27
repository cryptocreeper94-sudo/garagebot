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
        <Link href="/vehicles">
          <span className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer">
            View All <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 pb-4" style={{ width: "max-content" }}>
          {VEHICLE_TYPES.map((type, index) => (
            <Link key={type.id} href={`/search?type=${type.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative flex flex-col items-center justify-center w-28 h-28 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                data-testid={`vehicle-type-${type.id}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="font-tech text-[10px] uppercase tracking-wide text-foreground text-center px-2">
                  {type.name}
                </span>
                <span className="absolute -bottom-4 opacity-0 group-hover:opacity-100 group-hover:bottom-2 text-[8px] text-muted-foreground transition-all duration-300 text-center px-1">
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
