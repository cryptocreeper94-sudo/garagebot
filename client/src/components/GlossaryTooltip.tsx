import { useState, useEffect, useCallback } from "react";
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
  autoCloseDelay?: number;
}

export default function GlossaryTooltip({ 
  term, 
  userName, 
  onClose, 
  slideFrom = 'right',
  autoCloseDelay = 8000
}: GlossaryTooltipProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');
  
  const mascotImage = mascotImages[term.image || 'general'] || mascotImages.thinking;
  const greeting = userName ? `Hey ${userName}!` : "Hey there!";
  
  const enterDirection = slideFrom === 'right' ? 1 : -1;
  
  const handleClose = useCallback((direction: 'left' | 'right' = slideFrom === 'right' ? 'left' : 'right') => {
    setExitDirection(direction);
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 400);
  }, [onClose, slideFrom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose(slideFrom === 'right' ? 'left' : 'right');
    }, autoCloseDelay);
    
    return () => clearTimeout(timer);
  }, [autoCloseDelay, handleClose, slideFrom]);

  const getExitX = () => {
    return exitDirection === 'left' ? -500 : 500;
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-8"
          onClick={() => handleClose()}
          data-testid="glossary-tooltip-overlay"
        >
          <motion.div
            initial={{ x: enterDirection * 500, opacity: 0, rotate: enterDirection * -15 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              rotate: 0,
              transition: {
                type: "spring",
                damping: 18,
                stiffness: 350,
                mass: 0.6
              }
            }}
            exit={{ 
              x: getExitX(), 
              opacity: 0,
              rotate: exitDirection === 'left' ? 15 : -15,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 400
              }
            }}
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ 
                scale: 1, 
                y: 0,
                transition: { delay: 0.1, type: "spring", damping: 15 }
              }}
              className="relative mb-[-25px] z-10"
            >
              <svg 
                viewBox="0 0 360 200" 
                className="w-[340px] h-[190px]"
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0, 255, 255, 0.35))' }}
              >
                <ellipse 
                  cx="180" 
                  cy="90" 
                  rx="175" 
                  ry="85" 
                  fill="white" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="3"
                />
                <path 
                  d="M 220 165 Q 200 185 175 195 Q 195 175 205 160" 
                  fill="white" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="3"
                />
                <ellipse 
                  cx="180" 
                  cy="90" 
                  rx="170" 
                  ry="80" 
                  fill="white"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center px-12 py-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-8 h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={() => handleClose()}
                  data-testid="glossary-tooltip-close"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
                
                <p className="text-primary font-bold text-sm mb-1 text-center">
                  {greeting}
                </p>
                <h3 className="text-xl font-bold capitalize mb-2 text-gray-900 text-center">
                  {term.term}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed text-center max-w-[280px]">
                  {term.definition}
                </p>
              </div>
            </motion.div>
            
            <motion.img
              src={mascotImage}
              alt="Buddy the GarageBot mascot"
              className="w-44 h-44 object-contain"
              style={{ 
                filter: 'drop-shadow(0 4px 16px rgba(0, 255, 255, 0.5)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))',
              }}
              initial={{ x: enterDirection * 80, rotate: enterDirection * -20, scale: 0.9 }}
              animate={{ 
                x: 0, 
                rotate: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  damping: 10,
                  stiffness: 180,
                  delay: 0.05
                }
              }}
              data-testid="glossary-mascot-image"
            />
            
            <motion.div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
            >
              <p className="text-xs text-white/60 mt-2">Tap anywhere to close</p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ x: 0, opacity: 1, rotate: 0 }}
            animate={{ 
              x: getExitX(), 
              opacity: 0,
              rotate: exitDirection === 'left' ? 15 : -15,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 300
              }
            }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            <div className="relative mb-[-25px] z-10">
              <svg 
                viewBox="0 0 360 200" 
                className="w-[340px] h-[190px]"
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0, 255, 255, 0.35))' }}
              >
                <ellipse cx="180" cy="90" rx="175" ry="85" fill="white" stroke="hsl(var(--primary))" strokeWidth="3"/>
                <path d="M 220 165 Q 200 185 175 195 Q 195 175 205 160" fill="white" stroke="hsl(var(--primary))" strokeWidth="3"/>
                <ellipse cx="180" cy="90" rx="170" ry="80" fill="white"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-12 py-6">
                <p className="text-primary font-bold text-sm mb-1">{greeting}</p>
                <h3 className="text-xl font-bold capitalize mb-2 text-gray-900">{term.term}</h3>
                <p className="text-sm text-gray-700 text-center max-w-[280px]">{term.definition}</p>
              </div>
            </div>
            <img
              src={mascotImage}
              alt="Buddy"
              className="w-44 h-44 object-contain"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0, 255, 255, 0.5))' }}
            />
          </motion.div>
        </motion.div>
      )}
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
  const [slideFrom, setSlideFrom] = useState<'left' | 'right'>('right');

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const screenMiddle = window.innerWidth / 2;
    setSlideFrom(rect.left < screenMiddle ? 'right' : 'left');
    setShowTooltip(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
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
          slideFrom={slideFrom}
        />
      )}
    </>
  );
}
