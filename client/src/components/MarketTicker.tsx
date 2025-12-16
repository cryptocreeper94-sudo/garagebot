import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const TICKER_ITEMS = [
  { symbol: "MBL1", name: "Mobil 1 5W-30", price: "$29.99", change: "+2.4%", up: true },
  { symbol: "AZ-ALT", name: "Duralast Alt", price: "$149.99", change: "-1.2%", up: false },
  { symbol: "NGK-SP", name: "NGK Iridium", price: "$8.99", change: "+0.5%", up: true },
  { symbol: "BOS-FIL", name: "Bosch Filter", price: "$12.49", change: "+0.0%", up: true },
  { symbol: "BRK-PAD", name: "Ceramic Pads", price: "$45.99", change: "-3.1%", up: false },
  { symbol: "BATT-H6", name: "DieHard AGM", price: "$219.99", change: "+1.8%", up: true },
  { symbol: "WIP-RAIN", name: "Rain-X Latitude", price: "$24.99", change: "-0.5%", up: false },
];

export default function MarketTicker() {
  return (
    <div className="w-full bg-black/80 border-b border-primary/20 h-8 overflow-hidden flex items-center fixed top-[30px] left-0 right-0 z-40 backdrop-blur-md">
      <div className="px-3 h-full flex items-center bg-primary/10 border-r border-primary/20 z-10">
        <Activity className="w-4 h-4 text-primary animate-pulse" />
        <span className="ml-2 font-mono text-[10px] text-primary font-bold hidden md:inline">MARKET FEED</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center">
        <motion.div 
          className="flex items-center gap-8 whitespace-nowrap pl-4"
          animate={{ x: [0, -1000] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 30 
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-muted-foreground font-bold">{item.symbol}</span>
              <span className="text-white">{item.price}</span>
              <span className={`flex items-center ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                {item.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {item.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
