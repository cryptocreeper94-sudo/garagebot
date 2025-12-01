import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";

export default function CategoryGrid() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-tech text-xs uppercase tracking-wider text-muted-foreground">
          Quick Categories
        </h3>
        <Link href="/results">
          <span className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer group">
            View All <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
      
      {/* MOBILE: Horizontal scroll */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {CATEGORIES.slice(0, 12).map((cat, index) => (
            <Link key={cat.id} href={`/results?category=${cat.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col items-center justify-center w-[70px] h-[70px] md:w-20 md:h-20 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm cursor-pointer hover:border-secondary/60 hover:bg-secondary/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                data-testid={`category-${cat.id}`}
              >
                <motion.div 
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-1 group-hover:from-secondary/30 group-hover:to-secondary/15 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <cat.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                </motion.div>
                <span className="font-tech text-[7px] md:text-[9px] uppercase tracking-wide text-foreground text-center leading-tight w-full px-0.5 line-clamp-2">
                  {cat.name}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* DESKTOP: Accordion-style horizontal buttons */}
      <div className="hidden lg:block">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-300 group"
          data-testid="accordion-categories"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {CATEGORIES.slice(0, 4).map((cat, i) => (
                <div 
                  key={cat.id} 
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/20 flex items-center justify-center"
                  style={{ zIndex: 4 - i }}
                >
                  <cat.icon className="w-3 h-3 text-secondary" />
                </div>
              ))}
            </div>
            <span className="font-tech text-xs uppercase tracking-wide text-foreground">
              {CATEGORIES.length} Part Categories
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-5 xl:grid-cols-5 gap-1.5 pt-2">
                {CATEGORIES.map((cat, index) => (
                  <Link key={cat.id} href={`/results?category=${cat.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-black/30 cursor-pointer hover:border-secondary/50 hover:bg-secondary/10 transition-all duration-200"
                      data-testid={`category-desktop-${cat.id}`}
                    >
                      <cat.icon className="w-4 h-4 text-secondary shrink-0 group-hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                      <span className="font-tech text-[10px] uppercase tracking-wide text-foreground truncate">
                        {cat.name}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
