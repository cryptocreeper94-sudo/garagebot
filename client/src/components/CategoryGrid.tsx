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
    <section className="py-20 container mx-auto px-4">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-tech font-bold text-foreground uppercase tracking-wider">
            Browse by <span className="text-primary">Category</span>
          </h2>
          <p className="text-muted-foreground mt-2 font-mono text-sm">
            // SYSTEM: ACCESSING COMPONENT DATABASE
          </p>
        </div>
        <Link href="/results">
          <span className="text-primary hover:text-primary/80 cursor-pointer font-mono text-sm border-b border-primary pb-0.5 transition-colors">
            VIEW ALL CATEGORIES &gt;&gt;
          </span>
        </Link>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.id} variants={item}>
            <Link href={`/results?category=${cat.id}`}>
              <Card className="group cursor-pointer bg-card/50 hover:bg-card border-border hover:border-primary/50 transition-all duration-300 backdrop-blur-sm overflow-hidden relative h-40 flex flex-col items-center justify-center gap-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-background border border-border group-hover:border-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10">
                  <cat.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-tech font-bold text-lg tracking-wide uppercase z-10 group-hover:text-primary transition-colors">
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
