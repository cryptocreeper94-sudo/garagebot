import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

export default function CategoryGrid() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const checkScrollPosition = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollPosition, 300);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-tech text-sm uppercase tracking-wider text-foreground">
          Browse Categories
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

      {/* DESKTOP: Horizontal Carousel with Arrow Navigation */}
      <div className="hidden lg:block relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-primary/30 shadow-lg hover:bg-primary/10 hover:border-primary transition-all ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          data-testid="carousel-left"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </Button>

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          onScroll={checkScrollPosition}
          className="overflow-x-auto scrollbar-hide scroll-smooth mx-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
            {CATEGORIES.map((cat, index) => (
              <Link key={cat.id} href={`/results?category=${cat.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex flex-col items-center justify-center w-[140px] h-[120px] rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm cursor-pointer hover:border-secondary/60 hover:from-secondary/15 hover:to-secondary/5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                  data-testid={`category-desktop-${cat.id}`}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/25 to-secondary/10 flex items-center justify-center mb-3 group-hover:from-secondary/40 group-hover:to-secondary/20 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <cat.icon className="w-6 h-6 text-secondary group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
                  </motion.div>
                  <span className="font-tech text-[11px] uppercase tracking-wide text-foreground text-center leading-tight px-2">
                    {cat.name}
                  </span>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-secondary/30 group-hover:bg-secondary/60 group-hover:w-12 transition-all duration-300" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-primary/30 shadow-lg hover:bg-primary/10 hover:border-primary transition-all ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          data-testid="carousel-right"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </Button>

        {/* Gradient Fade Edges */}
        <div className="absolute left-10 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5]" />
        <div className="absolute right-10 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5]" />
      </div>
    </div>
  );
}
