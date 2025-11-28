import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlossaryTerm } from "@/lib/glossary";

import mascotWaving from "@assets/generated_images/robot_mascot_waving_hello.png";
import mascotThinking from "@assets/generated_images/robot_mascot_thinking_pose.png";
import mascotBrakePads from "@assets/generated_images/robot_mascot_holding_brake_pads.png";
import mascotOilFilter from "@assets/generated_images/robot_mascot_holding_oil_filter.png";
import mascotSparkPlugs from "@assets/generated_images/robot_mascot_holding_spark_plugs.png";
import mascotBattery from "@assets/generated_images/robot_mascot_holding_car_battery.png";
import mascotTire from "@assets/generated_images/robot_mascot_holding_tire.png";
import mascotRotor from "@assets/generated_images/robot_mascot_holding_brake_rotor.png";

const mascotImages: Record<string, string> = {
  waving: mascotWaving,
  thinking: mascotThinking,
  brake_pads: mascotBrakePads,
  brake_rotor: mascotRotor,
  oil_filter: mascotOilFilter,
  spark_plugs: mascotSparkPlugs,
  car_battery: mascotBattery,
  tire: mascotTire,
  general: mascotThinking,
};

interface GlossaryTooltipProps {
  term: GlossaryTerm;
  userName?: string;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function GlossaryTooltip({ term, userName, onClose, position }: GlossaryTooltipProps) {
  const mascotImage = mascotImages[term.image || 'general'] || mascotImages.thinking;
  const greeting = userName ? `Hey ${userName}!` : "Hey there!";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
        data-testid="glossary-tooltip-overlay"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="relative max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex flex-col items-center">
            <motion.img
              src={mascotImage}
              alt="Buddy the GarageBot mascot"
              className="w-40 h-40 object-contain drop-shadow-lg"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              data-testid="glossary-mascot-image"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative -mt-4 bg-card border-2 border-primary/50 rounded-2xl p-5 shadow-xl shadow-primary/20 max-w-sm"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border-l-2 border-t-2 border-primary/50 rotate-45" />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={onClose}
                data-testid="glossary-tooltip-close"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="pt-2">
                <p className="text-primary font-tech font-bold text-sm mb-1">
                  {greeting}
                </p>
                <h3 className="text-lg font-bold capitalize mb-2 text-foreground">
                  {term.term}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term.definition}
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-primary/70 font-tech uppercase">
                    Category: {term.category}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface HighlightedTermProps {
  children: string;
  term: GlossaryTerm;
  userName?: string;
}

export function HighlightedTerm({ children, term, userName }: HighlightedTermProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTooltip(true)}
        className="inline-flex items-center gap-0.5 text-primary underline decoration-dotted underline-offset-2 hover:text-primary/80 cursor-help transition-colors"
        data-testid={`glossary-term-${term.term.replace(/\s+/g, '-')}`}
      >
        {children}
        <HelpCircle className="w-3 h-3 opacity-60" />
      </button>
      
      {showTooltip && (
        <GlossaryTooltip
          term={term}
          userName={userName}
          onClose={() => setShowTooltip(false)}
        />
      )}
    </>
  );
}
