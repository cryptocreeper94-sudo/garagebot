import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

export default function CategoryGrid() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const updateScrollState = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const itemWidth = scrollWidth / CATEGORIES.length;
        const visibleItems = Math.floor(clientWidth / itemWidth) || 1;
        const pages = Math.ceil(CATEGORIES.length / visibleItems);
        setTotalPages(pages);
        const currentPage = Math.round((scrollLeft / maxScroll) * (pages - 1));
        setActivePageIndex(Math.min(currentPage, pages - 1));
      }
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = carouselRef.current;
    if (el) {
      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);
      return () => resizeObserver.disconnect();
    }
  }, [updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollState, 350);
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (carouselRef.current) {
      const { scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const targetScroll = (pageIndex / (totalPages - 1)) * maxScroll;
      carouselRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setTimeout(updateScrollState, 350);
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

      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={updateScrollState}
          className="overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 lg:gap-4 pb-2" style={{ minWidth: "max-content" }}>
            {CATEGORIES.map((cat, index) => (
              <Link key={cat.id} href={`/results?category=${cat.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-[100px] h-[120px] lg:w-[160px] lg:h-[180px] rounded-xl overflow-hidden cursor-pointer"
                  data-testid={`category-${cat.id}`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-secondary/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 text-center">
                    <span className="font-tech text-[10px] lg:text-xs uppercase tracking-wide text-white drop-shadow-lg">
                      {cat.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 border lg:border-2 border-white/10 rounded-xl group-hover:border-secondary/50 lg:group-hover:border-secondary/60 lg:group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3" data-testid="category-carousel-controls">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full bg-background/80 border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all ${!canScrollLeft ? 'opacity-30' : 'opacity-100'}`}
            data-testid="category-carousel-left"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </Button>

          <div className="flex items-center gap-1.5" data-testid="category-carousel-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activePageIndex
                    ? 'w-6 h-2 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : 'w-2 h-2 bg-cyan-400/30 hover:bg-cyan-400/50'
                }`}
                data-testid={`category-dot-${i}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full bg-background/80 border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all ${!canScrollRight ? 'opacity-30' : 'opacity-100'}`}
            data-testid="category-carousel-right"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </Button>
        </div>
      )}
    </div>
  );
}
