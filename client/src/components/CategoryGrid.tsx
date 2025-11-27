import { motion } from "framer-motion";
import { Link } from "wouter";
import { CATEGORIES } from "@/lib/mockData";
import { Card } from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function CategoryGrid() {
  return (
    <section className="w-full">
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-tech font-bold text-foreground uppercase tracking-wide">
            <span className="text-primary">Quick</span> Categories
          </h2>
          <p className="text-muted-foreground mt-1 font-mono text-[10px] md:text-xs opacity-60">
            // SELECT MODULE TO INITIATE SCAN
          </p>
        </div>
        <Link href="/results">
          <span className="text-primary hover:text-secondary cursor-pointer font-mono text-[10px] border-b border-primary/30 pb-0.5 transition-colors hover:border-secondary">
            VIEW ALL &gt;&gt;
          </span>
        </Link>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-4 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none"
      >
        {CATEGORIES.slice(0, 6).map((cat) => (
          <motion.div key={cat.id} variants={item} className="flex-shrink-0 w-36 md:w-auto snap-start">
            <Link href={`/results?category=${cat.id}`}>
              <Card className="group cursor-pointer bg-white/5 hover:bg-white/10 border-white/5 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm overflow-hidden relative h-32 flex flex-col items-center justify-center gap-3 rounded-xl">
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 group-hover:border-primary/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <cat.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-tech font-bold text-xs md:text-sm tracking-wide uppercase z-10 group-hover:text-white transition-colors text-center px-2">
                  {cat.name}
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
