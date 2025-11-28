import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Lightbulb, Trophy, Zap, Clock, DollarSign, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FunFact {
  fact: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

interface VehicleFacts {
  [key: string]: FunFact[];
}

const VEHICLE_FACTS: VehicleFacts = {
  ferrari: [
    { fact: "Ferrari's iconic prancing horse logo came from a WWII fighter pilot's family crest.", icon: Trophy, category: "History" },
    { fact: "Enzo Ferrari originally envisioned the company only making racing cars, not road cars.", icon: Gauge, category: "Origins" },
    { fact: "Ferrari produces only about 14,000 cars per year to maintain exclusivity.", icon: Sparkles, category: "Production" },
    { fact: "The Ferrari F40 was the last car personally approved by Enzo Ferrari before his death.", icon: Trophy, category: "Legacy" },
    { fact: "Ferrari's signature red color is called 'Rosso Corsa' - Italian racing red.", icon: Zap, category: "Design" },
  ],
  lamborghini: [
    { fact: "Ferruccio Lamborghini started making sports cars after a dispute with Enzo Ferrari!", icon: Zap, category: "Origins" },
    { fact: "Every Lamborghini model is named after a famous fighting bull.", icon: Trophy, category: "Naming" },
    { fact: "The Lamborghini Miura is considered the first true supercar ever made.", icon: Sparkles, category: "History" },
    { fact: "Lamborghini originally made tractors before switching to supercars in 1963.", icon: Lightbulb, category: "Origins" },
    { fact: "The iconic scissor doors were first introduced on the 1974 Countach.", icon: Zap, category: "Design" },
  ],
  porsche: [
    { fact: "The Porsche 911 has been in continuous production for over 60 years.", icon: Clock, category: "Longevity" },
    { fact: "Ferdinand Porsche also designed the original Volkswagen Beetle.", icon: Lightbulb, category: "History" },
    { fact: "Porsche has won Le Mans more times than any other manufacturer - 19 wins!", icon: Trophy, category: "Racing" },
    { fact: "The 911's rear-engine layout was considered unusual but became its signature.", icon: Gauge, category: "Engineering" },
    { fact: "Every Porsche 911 engine is hand-assembled by a single technician.", icon: Sparkles, category: "Craftsmanship" },
  ],
  mustang: [
    { fact: "The Ford Mustang sold 22,000 units on its first day in 1964!", icon: Zap, category: "Sales" },
    { fact: "The Mustang was named after the P-51 Mustang fighter plane, not the horse.", icon: Lightbulb, category: "Naming" },
    { fact: "The Mustang created an entirely new car category: the 'pony car'.", icon: Trophy, category: "Legacy" },
    { fact: "Steve McQueen's Bullitt chase scene made the Mustang GT a legend.", icon: Sparkles, category: "Pop Culture" },
    { fact: "Over 10 million Mustangs have been sold since 1964.", icon: DollarSign, category: "Sales" },
  ],
  camaro: [
    { fact: "When asked what 'Camaro' meant, GM said 'a small, vicious animal that eats Mustangs'!", icon: Zap, category: "Rivalry" },
    { fact: "The first-gen Camaro was designed in just 18 months to compete with Mustang.", icon: Clock, category: "Development" },
    { fact: "Bumblebee from Transformers brought the Camaro back into the spotlight.", icon: Sparkles, category: "Pop Culture" },
    { fact: "The Z/28 package was originally created just for Trans-Am racing.", icon: Trophy, category: "Racing" },
    { fact: "The 2024 Camaro marked the end of production after 6 generations.", icon: Clock, category: "History" },
  ],
  corvette: [
    { fact: "The Corvette is America's longest-running sports car, debuting in 1953.", icon: Clock, category: "Longevity" },
    { fact: "Early Corvettes only came in Polo White with a red interior.", icon: Sparkles, category: "Design" },
    { fact: "The C8 Corvette's mid-engine layout was planned since the 1960s!", icon: Lightbulb, category: "Engineering" },
    { fact: "Every Corvette engine has been assembled by hand in Bowling Green, KY.", icon: Trophy, category: "Craftsmanship" },
    { fact: "The Corvette ZR1 can hit 60 mph in under 2.6 seconds.", icon: Gauge, category: "Performance" },
  ],
  cobra: [
    { fact: "Carroll Shelby built the first Cobra by putting a Ford V8 in a British AC Ace.", icon: Zap, category: "Origins" },
    { fact: "The Cobra 427 could hit 0-60 in 4.2 seconds in 1965 - insane for its time!", icon: Gauge, category: "Performance" },
    { fact: "Original Shelby Cobras now sell for $1-5 million at auction.", icon: DollarSign, category: "Value" },
    { fact: "Factory Five has sold over 12,000 Cobra replica kits worldwide.", icon: Sparkles, category: "Kit Cars" },
    { fact: "The Cobra's iconic shape was designed in just a few weeks.", icon: Clock, category: "Design" },
  ],
  gt40: [
    { fact: "Ford built the GT40 specifically to beat Ferrari at Le Mans - and did!", icon: Trophy, category: "Racing" },
    { fact: "The '40' in GT40 comes from its height of just 40 inches.", icon: Lightbulb, category: "Design" },
    { fact: "The GT40 won Le Mans 4 years in a row from 1966-1969.", icon: Trophy, category: "Dominance" },
    { fact: "Ford v Ferrari (2019) brought the GT40's story to a new generation.", icon: Sparkles, category: "Pop Culture" },
    { fact: "A genuine race-winning GT40 sold for $11 million in 2012.", icon: DollarSign, category: "Value" },
  ],
  harley: [
    { fact: "Harley-Davidson was founded in a 10x15 foot wooden shed in 1903.", icon: Lightbulb, category: "Origins" },
    { fact: "During WWII, Harley produced 90,000 motorcycles for the military.", icon: Trophy, category: "History" },
    { fact: "The iconic V-twin engine sound is actually trademarked by Harley.", icon: Zap, category: "Signature" },
    { fact: "The Sportster has been in production since 1957 - over 65 years!", icon: Clock, category: "Longevity" },
    { fact: "Harley owners ride an average of 4,000 miles per year.", icon: Gauge, category: "Culture" },
  ],
  ducati: [
    { fact: "Ducati started making radio components before switching to motorcycles.", icon: Lightbulb, category: "Origins" },
    { fact: "The Ducati desmodromic valve system uses no valve springs!", icon: Zap, category: "Engineering" },
    { fact: "Ducati has won more World Superbike Championships than any other brand.", icon: Trophy, category: "Racing" },
    { fact: "The Panigale is named after the Bologna factory district.", icon: Sparkles, category: "Naming" },
    { fact: "Ducati's signature dry clutch 'rattle' is beloved by enthusiasts.", icon: Gauge, category: "Character" },
  ],
  classics: [
    { fact: "A 1967 Shelby GT500 sold for $2.2 million at Barrett-Jackson auction.", icon: DollarSign, category: "Value" },
    { fact: "The muscle car era peaked from 1964-1972 before emissions rules changed everything.", icon: Clock, category: "History" },
    { fact: "The 1970 Plymouth Hemi 'Cuda is considered the holy grail of muscle cars.", icon: Trophy, category: "Collectibility" },
    { fact: "Classic car values have outperformed the S&P 500 over the last 25 years.", icon: DollarSign, category: "Investment" },
    { fact: "The term 'muscle car' was first used in 1966 by Car Life magazine.", icon: Lightbulb, category: "Origins" },
    { fact: "Only 1,000 Boss 429 Mustangs were ever made for homologation.", icon: Sparkles, category: "Rarity" },
  ],
  exotics: [
    { fact: "The Bugatti Chiron's quad-turbo W16 engine produces 1,500 horsepower.", icon: Gauge, category: "Power" },
    { fact: "McLaren F1s are appreciating at about 15% per year.", icon: DollarSign, category: "Investment" },
    { fact: "Koenigsegg builds only about 20 cars per year by hand.", icon: Sparkles, category: "Exclusivity" },
    { fact: "The Pagani Huayra's body panels are carbon-titanium weave.", icon: Zap, category: "Materials" },
    { fact: "A LaFerrari sold for $7 million just 3 years after its $1.4M retail price.", icon: DollarSign, category: "Value" },
    { fact: "The Rimac Nevera is the fastest accelerating production car ever made.", icon: Gauge, category: "Performance" },
  ],
  kitcars: [
    { fact: "Kit cars offer supercar looks for 1/10th the price of the real thing.", icon: DollarSign, category: "Value" },
    { fact: "The Caterham Seven is based on the original 1957 Lotus Seven design.", icon: Clock, category: "Heritage" },
    { fact: "Factory Five's Mk4 Roadster can be built in about 200 hours.", icon: Clock, category: "Build Time" },
    { fact: "Kit car builders report 90% satisfaction with their finished builds.", icon: Trophy, category: "Satisfaction" },
    { fact: "The BAC Mono is a road-legal single-seater inspired by F1 cars.", icon: Gauge, category: "Design" },
    { fact: "Superformance makes officially licensed GT40 and Cobra continuations.", icon: Sparkles, category: "Authenticity" },
  ],
  general: [
    { fact: "The average American spends 18 days per year in their car.", icon: Clock, category: "Stats" },
    { fact: "The first speeding ticket was issued in 1902 for going 45 mph!", icon: Zap, category: "History" },
    { fact: "Toyota's Corolla is the best-selling car of all time with 50+ million sold.", icon: Trophy, category: "Sales" },
    { fact: "The automotive industry employs 1 in 10 American workers.", icon: Lightbulb, category: "Economy" },
    { fact: "Electric vehicles were actually popular in the early 1900s before gas cars took over.", icon: Zap, category: "History" },
    { fact: "The Model T came in 'any color you want, as long as it's black'.", icon: Sparkles, category: "Quotes" },
  ],
};

const MAKE_KEYWORDS: Record<string, string> = {
  ferrari: 'ferrari',
  lamborghini: 'lamborghini',
  lambo: 'lamborghini',
  porsche: 'porsche',
  mustang: 'mustang',
  camaro: 'camaro',
  corvette: 'corvette',
  vette: 'corvette',
  cobra: 'cobra',
  shelby: 'cobra',
  gt40: 'gt40',
  harley: 'harley',
  'harley-davidson': 'harley',
  ducati: 'ducati',
};

function getFactsForQuery(query: string, vehicleType?: string): FunFact[] {
  const lowerQuery = query.toLowerCase();
  
  for (const [keyword, factKey] of Object.entries(MAKE_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      return VEHICLE_FACTS[factKey] || [];
    }
  }
  
  if (vehicleType === 'classics') return VEHICLE_FACTS.classics;
  if (vehicleType === 'exotics') return VEHICLE_FACTS.exotics;
  if (vehicleType === 'kitcars') return VEHICLE_FACTS.kitcars;
  
  return VEHICLE_FACTS.general;
}

interface VehicleFunFactsProps {
  query?: string;
  make?: string;
  model?: string;
  vehicleType?: string;
}

export default function VehicleFunFacts({ query = '', make = '', model = '', vehicleType }: VehicleFunFactsProps) {
  const searchTerm = `${make} ${model} ${query}`.trim();
  const facts = getFactsForQuery(searchTerm, vehicleType);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || facts.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [facts.length, isAutoPlaying]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm, vehicleType]);

  if (facts.length === 0) return null;

  const currentFact = facts[currentIndex];
  const IconComponent = currentFact.icon;

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % facts.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 via-card to-purple-500/5 border-primary/30 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cyan-400 to-purple-500" />
        
        <div className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold text-primary uppercase tracking-wide">
                  Did You Know?
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {currentFact.category}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-primary"
                onClick={goToPrev}
                data-testid="fun-facts-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-[10px] font-mono text-muted-foreground min-w-[40px] text-center">
                {currentIndex + 1}/{facts.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-primary"
                onClick={goToNext}
                data-testid="fun-facts-next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <IconComponent className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {currentFact.fact}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-1.5 mt-4">
            {facts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                data-testid={`fun-facts-dot-${idx}`}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
