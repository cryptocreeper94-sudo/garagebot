import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, MapPin, Loader2 } from "lucide-react";
import weatherIcon from "@assets/generated_images/weather_icon_floating.png";
import WeatherRadarFull from "./WeatherRadarFull";

interface WeatherData {
  location: {
    city: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    description: string;
    icon: string;
    visibility: number;
    pressure: number;
  };
  hourly: Array<{
    time: string;
    temp: number;
    icon: string;
    description: string;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    tempHigh: number;
    tempLow: number;
    icon: string;
    description: string;
    precipitation: number;
  }>;
}

function getWeatherGlow(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('storm')) {
    return 'shadow-[0_0_30px_rgba(147,51,234,0.7),0_0_60px_rgba(147,51,234,0.4)]';
  }
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
    return 'shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_60px_rgba(59,130,246,0.4)]';
  }
  if (desc.includes('snow') || desc.includes('sleet') || desc.includes('ice')) {
    return 'shadow-[0_0_30px_rgba(226,232,240,0.7),0_0_60px_rgba(226,232,240,0.4)]';
  }
  if (desc.includes('cloud') || desc.includes('overcast')) {
    return 'shadow-[0_0_30px_rgba(148,163,184,0.6),0_0_60px_rgba(148,163,184,0.3)]';
  }
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) {
    return 'shadow-[0_0_30px_rgba(100,116,139,0.6),0_0_60px_rgba(100,116,139,0.3)]';
  }
  if (desc.includes('clear') || desc.includes('sunny')) {
    return 'shadow-[0_0_30px_rgba(250,204,21,0.8),0_0_60px_rgba(250,204,21,0.5)]';
  }
  if (desc.includes('partly')) {
    return 'shadow-[0_0_30px_rgba(251,191,36,0.6),0_0_60px_rgba(251,191,36,0.3)]';
  }
  
  return 'shadow-[0_0_30px_rgba(6,182,212,0.6),0_0_60px_rgba(6,182,212,0.3)]';
}

function getGlowColor(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('storm')) return 'from-purple-500/30 to-purple-700/20';
  if (desc.includes('rain') || desc.includes('drizzle')) return 'from-blue-500/30 to-blue-700/20';
  if (desc.includes('snow') || desc.includes('sleet')) return 'from-slate-300/30 to-slate-500/20';
  if (desc.includes('cloud') || desc.includes('overcast')) return 'from-slate-400/30 to-slate-600/20';
  if (desc.includes('clear') || desc.includes('sunny')) return 'from-yellow-400/40 to-orange-500/20';
  if (desc.includes('partly')) return 'from-amber-400/30 to-yellow-500/20';
  
  return 'from-cyan-500/30 to-primary/20';
}

export default function FloatingWeatherButton() {
  const [showWeatherView, setShowWeatherView] = useState(false);
  const [localZip, setLocalZip] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('weatherZip');
    if (stored) setLocalZip(stored);
  }, []);

  const effectiveZip = localZip || "10001";

  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather/zip", effectiveZip],
    queryFn: async () => {
      const res = await fetch(`/api/weather/zip/${effectiveZip}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    },
    enabled: !!effectiveZip,
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  });

  const glowClass = weather ? getWeatherGlow(weather.current.description) : '';
  const gradientClass = weather ? getGlowColor(weather.current.description) : 'from-cyan-500/30 to-primary/20';

  return (
    <>
      <motion.button
        onClick={() => setShowWeatherView(true)}
        className={`fixed bottom-24 right-4 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${gradientClass} backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${glowClass}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-floating-weather"
      >
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.img
              src={weatherIcon}
              alt="Weather"
              className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-lg"
              animate={{ 
                y: [0, -3, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            {weather && (
              <div className="absolute -bottom-1 -right-1 bg-black/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 border border-white/20">
                <span className="text-[10px] font-mono font-bold text-white">{weather.current.temp}°</span>
              </div>
            )}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {showWeatherView && weather && (
          <WeatherRadarFull
            weather={weather}
            onClose={() => setShowWeatherView(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}