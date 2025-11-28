import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Search, Zap, Shield, Truck, Clock, Star, 
  CheckCircle2, ArrowRight, Sparkles, Crown,
  Package, DollarSign, Users, Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || hasStarted.current) return;
    hasStarted.current = true;
    
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

export function AnimatedStats() {
  const stats = [
    { value: 15, suffix: "M+", label: "Parts Indexed", icon: Package, color: "text-primary" },
    { value: 2.3, suffix: "M", label: "Saved by Users", icon: DollarSign, color: "text-green-400", prefix: "$" },
    { value: 40, suffix: "+", label: "Retail Partners", icon: Store, color: "text-purple-400" },
    { value: 50, suffix: "K+", label: "Happy Users", icon: Users, color: "text-yellow-400" },
  ];

  return (
    <section className="w-full py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {stats.map((stat, i) => {
          const { count, ref } = useCountUp(stat.value * (stat.suffix.includes("M") ? 10 : 1), 2000);
          const displayValue = stat.suffix.includes("M") 
            ? (count / 10).toFixed(stat.value % 1 !== 0 ? 1 : 0)
            : count;
          
          return (
            <motion.div
              key={stat.label}
              ref={ref}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <Card className="p-3 bg-gradient-to-br from-card/80 to-black/40 border-white/10 hover:border-primary/30 transition-all text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1 drop-shadow-[0_0_8px_currentColor]`} />
                <div className={`font-tech text-xl md:text-2xl font-bold ${stat.color}`}>
                  {stat.prefix}{displayValue}{stat.suffix}
                </div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export function RetailerLogos() {
  const retailers = [
    "AutoZone", "O'Reilly", "Advance Auto", "RockAuto", "Amazon", "eBay Motors",
    "NAPA", "Summit Racing", "JEGS", "4 Wheel Parts", "CarParts.com", "Partzilla",
    "Rocky Mountain ATV", "Dennis Kirk", "RevZilla", "West Marine", "Camping World",
    "Jack's Small Engines", "Classic Industries", "LMC Truck"
  ];

  return (
    <section className="w-full py-4 overflow-hidden">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Store className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-tech uppercase tracking-wider text-muted-foreground">
          Searching <span className="text-primary">40+</span> Retailers
        </h3>
      </div>
      
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div 
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 25
          }}
        >
          {[...retailers, ...retailers, ...retailers].map((name, i) => (
            <div 
              key={i}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-default"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Tell Us What You Need",
      desc: "Search by part name, upload a photo, or chat with Buddy AI",
      icon: Search,
      color: "from-primary to-cyan-600"
    },
    {
      num: "02", 
      title: "We Search 40+ Retailers",
      desc: "Compare prices across AutoZone, O'Reilly, Amazon & more instantly",
      icon: Zap,
      color: "from-yellow-500 to-orange-500"
    },
    {
      num: "03",
      title: "Get the Right Part, Fast",
      desc: "Guaranteed fitment with local pickup or fast shipping options",
      icon: Truck,
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section className="w-full py-6">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-4"
      >
        <h2 className="text-lg font-tech font-bold uppercase tracking-wide">
          How <span className="text-primary">GarageBot</span> Works
        </h2>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          THREE SIMPLE STEPS TO THE RIGHT PART
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <Card className="p-4 bg-card/50 border-white/10 hover:border-primary/30 transition-all h-full relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 text-6xl font-tech font-bold text-white/5 group-hover:text-primary/10 transition-colors">
                {step.num}
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}>
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-tech text-sm font-bold mb-1">{step.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const testimonials = [
    {
      name: "Mike R.",
      role: "Diesel Mechanic",
      text: "Found a turbo for my Cummins $400 cheaper than the dealer. GarageBot is a game changer!",
      rating: 5,
      vehicle: "Ram 2500"
    },
    {
      name: "Sarah K.",
      role: "DIY Enthusiast",
      text: "Buddy helped me identify the exact brake pads I needed just from a photo. Amazing!",
      rating: 5,
      vehicle: "Honda Accord"
    },
    {
      name: "Carlos M.",
      role: "ATV Rider",
      text: "Finally a site that actually knows powersports parts. Found my carburetor in seconds.",
      rating: 5,
      vehicle: "Polaris Sportsman"
    },
    {
      name: "Jim T.",
      role: "Classic Car Owner",
      text: "Restored my '69 Camaro with parts found through GarageBot. Summit, JEGS, all in one place.",
      rating: 5,
      vehicle: "Chevy Camaro"
    }
  ];

  return (
    <section className="w-full py-6">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-2">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-mono text-yellow-400">4.9/5 FROM 2,500+ REVIEWS</span>
        </div>
        <h2 className="text-lg font-tech font-bold uppercase tracking-wide">
          What <span className="text-primary">Gearheads</span> Say
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-3 bg-card/50 border-white/10 hover:border-primary/20 transition-all h-full">
              <div className="flex gap-0.5 mb-2">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-3 italic">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[8px] text-muted-foreground">{t.role}</p>
                </div>
                <Badge variant="outline" className="text-[7px] border-primary/20 text-primary">
                  {t.vehicle}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="w-full py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-card to-secondary/20 border-primary/30 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.15),transparent_50%)]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-tech text-xs uppercase text-yellow-400">GarageBot Pro</span>
              </div>
              <h3 className="font-tech text-lg font-bold mb-1">
                Unlock <span className="text-primary">Premium</span> Features
              </h3>
              <p className="text-[10px] text-muted-foreground max-w-md">
                Price alerts, unlimited garage vehicles, exclusive deals, and priority Buddy AI support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="text-center">
                <div className="font-tech text-2xl font-bold text-primary">$2.99</div>
                <div className="text-[9px] text-muted-foreground font-mono">/MONTH</div>
              </div>
              <Link href="/account">
                <Button className="bg-primary text-black hover:bg-primary/90 font-tech uppercase text-xs px-6 btn-glow group">
                  <Sparkles className="w-4 h-4 mr-1 group-hover:animate-pulse" />
                  Go Pro
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

export function TrustBadges() {
  const badges = [
    { icon: Shield, label: "Secure Checkout", desc: "256-bit SSL" },
    { icon: CheckCircle2, label: "Fitment Guarantee", desc: "Right Part Every Time" },
    { icon: Clock, label: "Fast Support", desc: "Buddy AI 24/7" },
    { icon: Truck, label: "Free Shipping", desc: "On Orders $50+" },
  ];

  return (
    <section className="w-full py-4">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <badge.icon className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] font-bold text-foreground">{badge.label}</p>
              <p className="text-[8px]">{badge.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
