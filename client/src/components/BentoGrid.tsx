import { ReactNode, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface BentoCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  glow?: boolean;
  sparkle?: boolean;
  glass?: boolean;
  depth?: "shallow" | "medium" | "deep";
  animate?: boolean;
  onClick?: () => void;
}

export function BentoCell({ 
  children, 
  className = "", 
  colSpan = 1, 
  rowSpan = 1,
  glow = false,
  sparkle = false,
  glass = true,
  depth = "shallow",
  animate = true,
  onClick
}: BentoCellProps) {
  const depthClasses = {
    shallow: "bento-depth-1",
    medium: "bento-depth-2", 
    deep: "bento-depth-3"
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.95 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      whileHover={onClick ? { scale: 1.02, zIndex: 10 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg
        ${glass ? "bento-glass" : "bg-card"}
        ${glow ? "bento-glow" : ""}
        ${depthClasses[depth]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
      data-testid="bento-cell"
    >
      {sparkle && (
        <div className="sparkle-overlay">
          <Sparkles className="sparkle-icon sparkle-1" />
          <Sparkles className="sparkle-icon sparkle-2" />
          <Sparkles className="sparkle-icon sparkle-3" />
        </div>
      )}
      <div className="shine-overlay" />
      {children}
    </motion.div>
  );
}

interface BentoGridProps {
  children: ReactNode;
  cols?: number;
  gap?: number;
  className?: string;
}

export function BentoGrid({ 
  children, 
  cols = 12, 
  gap = 0,
  className = "" 
}: BentoGridProps) {
  return (
    <div 
      className={`bento-grid ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: gap > 0 ? `${gap}px` : 0,
      }}
      data-testid="bento-grid"
    >
      {children}
    </div>
  );
}

interface BentoCarouselProps {
  children: ReactNode[];
  className?: string;
  showArrows?: boolean;
  autoScroll?: boolean;
  itemsPerView?: number;
}

export function BentoCarousel({ 
  children, 
  className = "",
  showArrows = true,
  autoScroll = false,
  itemsPerView = 3
}: BentoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, children.length - itemsPerView);

  const scrollTo = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
    if (scrollRef.current) {
      const itemWidth = scrollRef.current.scrollWidth / children.length;
      scrollRef.current.scrollTo({
        left: itemWidth * newIndex,
        behavior: "smooth"
      });
    }
  };

  const prev = () => scrollTo(currentIndex - 1);
  const next = () => scrollTo(currentIndex + 1);

  return (
    <div className={`bento-carousel relative ${className}`} data-testid="bento-carousel">
      {showArrows && currentIndex > 0 && (
        <button
          onClick={prev}
          className="carousel-arrow carousel-arrow-left"
          data-testid="carousel-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      
      <div 
        ref={scrollRef}
        className="carousel-track"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children.map((child, index) => (
          <div 
            key={index}
            className="carousel-item"
            style={{
              flex: `0 0 calc(${100 / itemsPerView}% - ${8 * (itemsPerView - 1) / itemsPerView}px)`,
              scrollSnapAlign: "start",
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && currentIndex < maxIndex && (
        <button
          onClick={next}
          className="carousel-arrow carousel-arrow-right"
          data-testid="carousel-next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {children.length > itemsPerView && (
        <div className="carousel-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`carousel-dot ${i === currentIndex ? "active" : ""}`}
              data-testid={`carousel-dot-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BentoSectionProps {
  children: ReactNode;
  title?: string;
  className?: string;
  horizontal?: boolean;
}

export function BentoSection({ 
  children, 
  title,
  className = "",
  horizontal = false
}: BentoSectionProps) {
  return (
    <div className={`bento-section ${horizontal ? "bento-section-horizontal" : ""} ${className}`}>
      {title && (
        <h2 className="bento-section-title">{title}</h2>
      )}
      <div className={horizontal ? "bento-horizontal-scroll" : ""}>
        {children}
      </div>
    </div>
  );
}
