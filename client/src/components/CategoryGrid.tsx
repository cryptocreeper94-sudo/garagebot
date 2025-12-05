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
      
      {/* MOBILE: Horizontal scroll with images */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {CATEGORIES.slice(0, 12).map((cat, index) => (
            <Link key={cat.id} href={`/results?category=${cat.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-[100px] h-[120px] rounded-xl overflow-hidden cursor-pointer"
                data-testid={`category-${cat.id}`}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary/20" />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                  <span className="font-tech text-[10px] uppercase tracking-wide text-white drop-shadow-lg">
                    {cat.name}
                  </span>
                </div>
                <div className="absolute inset-0 border border-white/10 rounded-xl group-hover:border-secondary/50 transition-colors" />
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
                  className="group relative w-[160px] h-[180px] rounded-xl overflow-hidden cursor-pointer"
                  data-testid={`category-desktop-${cat.id}`}
                >
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <span className="font-tech text-xs uppercase tracking-wide text-white drop-shadow-lg">
                      {cat.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 border-2 border-white/10 rounded-xl group-hover:border-secondary/60 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300" />
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
