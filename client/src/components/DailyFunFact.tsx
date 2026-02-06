import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AUTOMOTIVE_FACTS = [
  "The average car has about 30,000 individual parts.",
  "The first speeding ticket was issued in 1902 for going 45 mph in a 12 mph zone.",
  "It would take less than 6 months to drive to the moon at 60 mph.",
  "The world's first automobile was built in 1885 by Karl Benz.",
  "About 80% of a car is recyclable.",
  "The odds of dying in a car crash are around 1 in 5,000 — seatbelts cut that risk in half.",
  "Volkswagen owns Bentley, Bugatti, Lamborghini, Audi, Ducati, and Porsche.",
  "The inventor of cruise control, Ralph Teetor, was completely blind.",
  "In Russia, driving a dirty car is a finable offense.",
  "More people die from donkeys annually than from plane crashes.",
  "The average American spends about 4.3 years of their life sitting in a car.",
  "A Formula 1 car can drive upside down at speeds over 120 mph due to aerodynamic downforce.",
  "Henry Ford's Model T came in any color — as long as it was black.",
  "The first car accident happened in 1891 in Ohio.",
  "An airbag deploys in just 30 milliseconds — faster than the blink of an eye.",
  "White is the most popular car color worldwide, followed by black and silver.",
  "The Bugatti Veyron's engine produces so much heat it needs 10 radiators.",
  "Electric cars were more popular than gasoline cars in the early 1900s.",
  "The average car spends 95% of its lifetime parked.",
  "A modern car has more computing power than the Apollo 11 spacecraft.",
  "It is illegal to drive blindfolded in Alabama.",
  "The first ever car race was in 1895, from Paris to Bordeaux and back — 732 miles.",
  "Toyota produces about 10 million vehicles per year — one every 3 seconds.",
  "The Hennessey Venom GT held the record for fastest production car at 270.49 mph.",
  "Rolls-Royce hand-paints the coach line on every car — it takes a single artist 3 hours.",
  "In 1916, 55% of all cars in the world were Ford Model Ts.",
  "The word 'dashboard' originally referred to a board on horse-drawn carriages that prevented mud from being dashed onto the driver.",
  "Brake dust accounts for 20% of traffic-related particulate matter pollution.",
  "The three-point seatbelt was invented by Volvo in 1959 — they made the patent free to save lives.",
  "There are over 1.4 billion cars on the road worldwide.",
  "The Lamborghini company was started because Ferruccio Lamborghini was insulted by Enzo Ferrari.",
  "A car's steering wheel has more germs than a public toilet seat.",
  "The longest traffic jam in history was 62 miles long and lasted 12 days near Beijing in 2010.",
  "NASCAR drivers can lose up to 10 pounds of weight during a single race due to heat.",
  "The average car horn honks in the key of F.",
  "Japan has more electric vehicle charging stations than gas stations.",
  "A new car smell is actually a cocktail of over 50 volatile organic compounds.",
  "The Porsche 911 has been in continuous production for over 60 years.",
  "In the early 1900s, car headlights used acetylene gas lamps.",
  "Ferrari produces fewer than 15,000 cars per year to maintain exclusivity.",
  "The most expensive car ever sold at auction was a 1955 Mercedes-Benz 300 SLR at $143 million.",
  "Diesel engines are named after Rudolf Diesel, who envisioned them running on peanut oil.",
];

function hashDateString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function DailyFunFact() {
  const todayIndex = useMemo(() => {
    const dateStr = new Date().toDateString();
    return hashDateString(dateStr) % AUTOMOTIVE_FACTS.length;
  }, []);

  const [offset, setOffset] = useState(0);

  const currentIndex = (todayIndex + offset) % AUTOMOTIVE_FACTS.length;
  const currentFact = AUTOMOTIVE_FACTS[currentIndex];

  const handleNext = useCallback(() => {
    setOffset((prev) => prev + 1);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      data-testid="daily-fun-fact"
    >
      <Card className="bento-glass border-primary/20 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-cyan-400 to-purple-500" />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/5 to-transparent" />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Lightbulb className="w-4 h-4 text-primary" data-testid="daily-fun-fact-icon" />
              </div>
              <h3 className="font-tech text-sm font-bold text-primary uppercase tracking-wide" data-testid="daily-fun-fact-title">
                Did You Know?
              </h3>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-7 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              data-testid="daily-fun-fact-next"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span className="text-[10px] font-mono uppercase">Next</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-foreground/90 leading-relaxed"
              data-testid="daily-fun-fact-text"
            >
              {currentFact}
            </motion.p>
          </AnimatePresence>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider">
              Daily Auto Trivia
            </span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-[9px] font-mono text-primary/60">
              {AUTOMOTIVE_FACTS.length} facts
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
