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
  { text: "Did you know? Blockchain verification creates permanent, cryptographic proof of your vehicle's history!", mascot: mascotWaving, section: ['garage'] },
  { text: "Your Genesis Hallmark can now be verified on-chain. View it on Solscan!", mascot: mascotThinking, section: ['home', 'dashboard'] },
];

const getRandomPosition = (): React.CSSProperties => {
  const positions: React.CSSProperties[] = [
    { bottom: '15%', right: '5%' },
    { bottom: '20%', left: '5%' },
    { top: '30%', right: '3%' },
    { top: '40%', left: '3%' },
    { bottom: '30%', right: '8%' },
    { bottom: '25%', left: '8%' },
  ];
  return positions[Math.floor(Math.random() * positions.length)];
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
  const [position, setPosition] = useState<React.CSSProperties>({});
  const [hasShownOnPage, setHasShownOnPage] = useState(false);
  const [enterFromLeft, setEnterFromLeft] = useState(true);

  const hideWithAnimation = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, 500);
  }, []);

  const showBuddy = useCallback(() => {
    if (hasShownOnPage) return;
    
    const section = getPageSection(location);
    const relevantComments = BUDDY_COMMENTS.filter(c => 
      c.section.includes(section) || c.section.includes('general')
    );
    
    if (relevantComments.length === 0) return;
    
    const randomComment = relevantComments[Math.floor(Math.random() * relevantComments.length)];
    const randomPos = getRandomPosition();
    
    setCurrentComment(randomComment);
    setPosition(randomPos);
    setEnterFromLeft(Math.random() > 0.5);
    setIsVisible(true);
    setHasShownOnPage(true);

    setTimeout(() => {
      hideWithAnimation();
    }, 7000);
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

  const enterX = enterFromLeft ? -300 : 300;
  const exitX = enterFromLeft ? 300 : -300;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: enterX, opacity: 0, rotate: enterFromLeft ? -15 : 15 }}
          animate={{ 
            x: isExiting ? exitX : 0, 
            opacity: isExiting ? 0 : 1,
            rotate: isExiting ? (enterFromLeft ? 15 : -15) : 0
          }}
          exit={{ x: exitX, opacity: 0, rotate: enterFromLeft ? 15 : -15 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            mass: 0.8
          }}
          className="fixed z-40 pointer-events-auto"
          style={position}
          data-testid="buddy-hide-seek"
        >
          <div className="relative">
            <motion.div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 pointer-events-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <svg 
                  viewBox="0 0 280 120" 
                  className="w-full h-auto"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(6, 182, 212, 0.3))' }}
                >
                  <ellipse 
                    cx="140" 
                    cy="50" 
                    rx="135" 
                    ry="45" 
                    fill="hsl(var(--card))" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M 140 90 Q 145 105 150 110 Q 140 100 135 95" 
                    fill="hsl(var(--card))" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="2"
                  />
                  <ellipse 
                    cx="140" 
                    cy="50" 
                    rx="130" 
                    ry="40" 
                    fill="hsl(var(--card))"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center px-6 pb-4">
                  <p className="text-xs text-center text-foreground leading-tight">
                    {currentComment.text}
                  </p>
                </div>
              </div>
            </motion.div>

            <button 
              onClick={hideWithAnimation}
              className="absolute -top-28 -right-2 w-5 h-5 rounded-full bg-card border border-primary/50 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors z-10"
              data-testid="buddy-hide-seek-close"
            >
              <X className="w-3 h-3" />
            </button>

            <motion.img 
              src={currentComment.mascot}
              alt="Buddy"
              className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              animate={{ 
                y: [0, -5, 0],
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
