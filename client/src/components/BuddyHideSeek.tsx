import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import mascotWaving from "@assets/mascot_transparent/robot_mascot_waving_hello.png";
import mascotThinking from "@assets/mascot_transparent/robot_mascot_thinking_pose.png";
import mascotBrakePads from "@assets/mascot_transparent/robot_mascot_holding_brake_pads.png";
import mascotOilFilter from "@assets/mascot_transparent/robot_mascot_holding_oil_filter.png";
import mascotSparkPlugs from "@assets/mascot_transparent/robot_mascot_holding_spark_plugs.png";
import mascotBattery from "@assets/mascot_transparent/robot_mascot_holding_car_battery.png";
import mascotTire from "@assets/mascot_transparent/robot_mascot_holding_tire.png";

type PageSection = 'home' | 'results' | 'garage' | 'dashboard' | 'checkout' | 'classics' | 'exotics' | 'kitcars' | 'general';

interface BuddyComment {
  text: string;
  mascot: string;
  section: PageSection[];
}

const BUDDY_COMMENTS: BuddyComment[] = [
  { text: "Classic muscle cars never go out of style! Check out Summit Racing for the best restoration parts.", mascot: mascotWaving, section: ['classics', 'home'] },
  { text: "Building a kit car? Factory Five makes some incredible replicas. Let me help you find parts!", mascot: mascotThinking, section: ['kitcars', 'home'] },
  { text: "Exotic car owners know quality matters. I search specialist suppliers like Scuderia for Ferrari parts!", mascot: mascotWaving, section: ['exotics', 'home'] },
  { text: "Did you know? Brake pads should be replaced every 30,000-70,000 miles. Stay safe out there!", mascot: mascotBrakePads, section: ['results', 'general'] },
  { text: "Pro tip: Always check your oil level when the engine is warm but turned off!", mascot: mascotOilFilter, section: ['garage', 'general'] },
  { text: "Spark plugs are easy to check! A healthy one should be light tan or gray colored.", mascot: mascotSparkPlugs, section: ['results', 'general'] },
  { text: "A weak battery can leave you stranded. Most last 3-5 years - when did you last replace yours?", mascot: mascotBattery, section: ['garage', 'dashboard'] },
  { text: "Tire pressure changes with temperature! Check yours monthly for best fuel economy.", mascot: mascotTire, section: ['home', 'general'] },
  { text: "I search 20+ retailers to find you the best price. Local pickup when you need it NOW!", mascot: mascotWaving, section: ['home', 'results'] },
  { text: "Hot rod tip: Holley carburetors are legendary for a reason. Want me to find one?", mascot: mascotThinking, section: ['classics'] },
  { text: "Porsche owners trust Suncoast Parts. I can search their inventory for you!", mascot: mascotWaving, section: ['exotics'] },
  { text: "Building something special? Detroit Speed has incredible suspension upgrades!", mascot: mascotThinking, section: ['kitcars', 'classics'] },
  { text: "Your Garage saves your vehicles so finding parts is always quick and easy!", mascot: mascotWaving, section: ['garage'] },
  { text: "Fun fact: The first muscle car is often considered the 1964 Pontiac GTO!", mascot: mascotThinking, section: ['classics'] },
  { text: "Lamborghini's iconic doors are called 'scissor doors' - first used on the Countach!", mascot: mascotWaving, section: ['exotics'] },
  { text: "The Shelby Cobra replica is one of the most popular kit cars ever built!", mascot: mascotThinking, section: ['kitcars'] },
  { text: "Looking for Chinese ATV parts? VMC Chinese Parts has great prices!", mascot: mascotWaving, section: ['general', 'results'] },
  { text: "West Marine is your go-to for boat parts. I can check their inventory!", mascot: mascotTire, section: ['general'] },
  { text: "RV season coming up? Don't forget to check your roof seals!", mascot: mascotThinking, section: ['general'] },
  { text: "Diesel engines can last 500,000+ miles with proper maintenance!", mascot: mascotOilFilter, section: ['general'] },
  { text: "NEW: Your vehicles can now be verified on the Solana blockchain! Check the Passport tab in your Garage.", mascot: mascotWaving, section: ['garage', 'home'] },
  { text: "Genesis Hallmarks are now blockchain-certified! Tamper-proof ownership on Solana.", mascot: mascotThinking, section: ['home', 'general'] },
];

type EntryDirection = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const getRandomEntryDirection = (): EntryDirection => {
  const directions: EntryDirection[] = ['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
  return directions[Math.floor(Math.random() * directions.length)];
};

const getEntryPosition = (direction: EntryDirection): { x: number; y: number; rotate: number } => {
  const positions: Record<EntryDirection, { x: number; y: number; rotate: number }> = {
    'left': { x: -600, y: 0, rotate: -25 },
    'right': { x: 600, y: 0, rotate: 25 },
    'top': { x: 0, y: -500, rotate: 15 },
    'bottom': { x: 0, y: 500, rotate: -15 },
    'top-left': { x: -500, y: -400, rotate: -30 },
    'top-right': { x: 500, y: -400, rotate: 30 },
    'bottom-left': { x: -500, y: 400, rotate: 25 },
    'bottom-right': { x: 500, y: 400, rotate: -25 },
  };
  return positions[direction];
};

const getExitPosition = (direction: EntryDirection): { x: number; y: number; rotate: number } => {
  const opposites: Record<EntryDirection, EntryDirection> = {
    'left': 'right',
    'right': 'left',
    'top': 'bottom',
    'bottom': 'top',
    'top-left': 'bottom-right',
    'top-right': 'bottom-left',
    'bottom-left': 'top-right',
    'bottom-right': 'top-left',
  };
  return getEntryPosition(opposites[direction]);
};

const getPageSection = (pathname: string): PageSection => {
  if (pathname === '/') return 'home';
  if (pathname.includes('results')) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'classics') return 'classics';
    if (type === 'exotics') return 'exotics';
    if (type === 'kitcars') return 'kitcars';
    return 'results';
  }
  if (pathname.includes('garage')) return 'garage';
  if (pathname.includes('dashboard')) return 'dashboard';
  if (pathname.includes('checkout')) return 'checkout';
  return 'general';
};

export default function BuddyHideSeek() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentComment, setCurrentComment] = useState<BuddyComment | null>(null);
  const [hasShownOnPage, setHasShownOnPage] = useState(false);
  const [entryDirection, setEntryDirection] = useState<EntryDirection>('left');

  const hideWithAnimation = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, 800);
  }, []);

  const showBuddy = useCallback(() => {
    if (hasShownOnPage) return;
    
    const section = getPageSection(location);
    const relevantComments = BUDDY_COMMENTS.filter(c => 
      c.section.includes(section) || c.section.includes('general')
    );
    
    if (relevantComments.length === 0) return;
    
    const randomComment = relevantComments[Math.floor(Math.random() * relevantComments.length)];
    const direction = getRandomEntryDirection();
    
    setCurrentComment(randomComment);
    setEntryDirection(direction);
    setIsVisible(true);
    setHasShownOnPage(true);
    
    setTimeout(hideWithAnimation, 8000);
  }, [location, hasShownOnPage, hideWithAnimation]);

  useEffect(() => {
    setHasShownOnPage(false);
    setIsVisible(false);
    setIsExiting(false);
  }, [location]);

  useEffect(() => {
    if (hasShownOnPage) return;
    
    const isHomePage = location === '/';
    const isFirstVisit = !sessionStorage.getItem('buddyGreeted');
    
    if (isHomePage && isFirstVisit) {
      sessionStorage.setItem('buddyGreeted', 'true');
      const delay = 2000 + Math.random() * 2000;
      const timer = setTimeout(showBuddy, delay);
      return () => clearTimeout(timer);
    }
    
    const shouldShow = Math.random() < 0.5;
    if (!shouldShow) {
      setHasShownOnPage(true);
      return;
    }
    
    const delay = 4000 + Math.random() * 4000;
    const timer = setTimeout(showBuddy, delay);
    
    return () => clearTimeout(timer);
  }, [location, hasShownOnPage, showBuddy]);

  if (!currentComment) return null;

  const entryPos = getEntryPosition(entryDirection);
  const exitPos = getExitPosition(entryDirection);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="buddy-popup"
          initial={{ 
            x: entryPos.x, 
            y: entryPos.y, 
            rotate: entryPos.rotate,
            scale: 0.8
          }}
          animate={{ 
            x: isExiting ? exitPos.x : 0, 
            y: isExiting ? exitPos.y : 0, 
            rotate: isExiting ? exitPos.rotate : 0,
            scale: isExiting ? 0.8 : 1
          }}
          exit={{ 
            x: exitPos.x, 
            y: exitPos.y, 
            rotate: exitPos.rotate,
            scale: 0.8
          }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 80,
            mass: 0.8,
          }}
          className="fixed z-[100] pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-140px',
            marginTop: '-120px',
          }}
          data-testid="buddy-hide-seek"
        >
          <div className="relative flex flex-col items-center pointer-events-auto">
            {/* Speech bubble above Buddy - compact and fitted */}
            <motion.div 
              className="max-w-[260px] mb-1"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
            >
              <div 
                className="relative rounded-xl px-4 py-3"
                style={{
                  background: 'hsl(var(--card))',
                  border: '2px solid hsl(var(--primary))',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
                }}
              >
                <p className="text-xs text-center leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
                  {currentComment.text}
                </p>
                
                {/* Speech bubble tail pointing down to Buddy */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -bottom-2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '10px solid hsl(var(--primary))',
                  }}
                />
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -bottom-1.5"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid hsl(var(--card))',
                  }}
                />
                
                {/* Close button */}
                <button 
                  onClick={hideWithAnimation}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--primary))',
                    color: 'hsl(var(--primary))',
                  }}
                  data-testid="buddy-hide-seek-close"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </motion.div>

            {/* Buddy mascot with wobble animation */}
            <motion.img 
              src={currentComment.mascot}
              alt="Buddy"
              className="w-24 h-24 object-contain"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(6, 182, 212, 0.4))',
              }}
              animate={{ 
                y: [0, -6, 0],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
