import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlossaryTerm } from "@/lib/glossary";

import mascotWaving from "@assets/mascot_transparent/robot_mascot_waving_hello.png";
import mascotThinking from "@assets/mascot_transparent/robot_mascot_thinking_pose.png";
import mascotBrakePads from "@assets/mascot_transparent/robot_mascot_holding_brake_pads.png";
import mascotOilFilter from "@assets/mascot_transparent/robot_mascot_holding_oil_filter.png";
import mascotSparkPlugs from "@assets/mascot_transparent/robot_mascot_holding_spark_plugs.png";
import mascotBattery from "@assets/mascot_transparent/robot_mascot_holding_car_battery.png";
import mascotTire from "@assets/mascot_transparent/robot_mascot_holding_tire.png";
import mascotRotor from "@assets/mascot_transparent/robot_mascot_holding_brake_rotor.png";

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
  slideFrom?: 'left' | 'right';
}

export default function GlossaryTooltip({ term, userName, onClose, slideFrom = 'right' }: GlossaryTooltipProps) {
  const mascotImage = mascotImages[term.image || 'general'] || mascotImages.thinking;
  const greeting = userName ? `Hey ${userName}!` : "Hey there!";
  
  const slideDirection = slideFrom === 'right' ? 1 : -1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-8"
        onClick={onClose}
        data-testid="glossary-tooltip-overlay"
      >
        <motion.div
          initial={{ x: slideDirection * 400, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            transition: {
              type: "spring",
              damping: 20,
              stiffness: 300,
              mass: 0.8
            }
          }}
          exit={{ x: slideDirection * 400, opacity: 0 }}
          className="relative flex items-end gap-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                transition: { delay: 0.2, type: "spring", damping: 15 }
              }}
              className="relative mb-[-20px] z-10"
            >
              <svg 
                viewBox="0 0 320 180" 
                className="w-80 h-44 drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 255, 255, 0.3))' }}
              >
                <ellipse 
                  cx="160" 
                  cy="80" 
                  rx="155" 
                  ry="75" 
                  fill="white" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="3"
                />
                <path 
                  d="M 200 145 Q 180 160 160 175 Q 175 155 185 145" 
                  fill="white" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="3"
                />
                <ellipse 
                  cx="160" 
                  cy="80" 
                  rx="150" 
                  ry="70" 
                  fill="white"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center px-10 py-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-6 h-6 w-6 rounded-full bg-muted/50 hover:bg-muted"
                  onClick={onClose}
                  data-testid="glossary-tooltip-close"
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <p className="text-primary font-bold text-sm mb-1 text-center">
                  {greeting}
                </p>
                <h3 className="text-lg font-bold capitalize mb-1 text-gray-900 text-center">
                  {term.term}
                </h3>
                <p className="text-sm text-gray-700 leading-snug text-center max-w-[250px]">
                  {term.definition}
                </p>
              </div>
            </motion.div>
            
            <motion.img
              src={mascotImage}
              alt="Buddy the GarageBot mascot"
              className="w-40 h-40 object-contain"
              style={{ 
                filter: 'drop-shadow(0 4px 12px rgba(0, 255, 255, 0.4)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
              initial={{ x: slideDirection * 100, rotate: slideDirection * -10 }}
              animate={{ 
                x: 0, 
                rotate: 0,
                transition: {
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                }
              }}
              data-testid="glossary-mascot-image"
            />
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
          slideFrom="right"
        />
      )}
    </>
  );
}
