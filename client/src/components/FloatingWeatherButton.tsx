import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import WeatherRadarFull from "./WeatherRadarFull";

import weatherIconDay from "@assets/generated_images/weather_icon_floating.png";
import clearNightIcon from "@assets/generated_images/clear_night_moon_stars_icon_floating.png";
import partlyCloudyNightIcon from "@assets/generated_images/partly_cloudy_night_icon_floating.png";
import cloudyNightIcon from "@assets/generated_images/cloudy_overcast_night_icon_floating.png";
import rainyNightIcon from "@assets/generated_images/rainy_night_icon_floating.png";
import stormyNightIcon from "@assets/generated_images/stormy_night_lightning_icon_floating.png";
import snowyNightIcon from "@assets/generated_images/snowy_night_icon_floating.png";
import foggyNightIcon from "@assets/generated_images/foggy_misty_night_icon_floating.png";

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
    isNight?: boolean;
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

function getWeatherGlow(description: string, isNight: boolean): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('storm')) {
    return isNight 
      ? 'shadow-[0_0_30px_rgba(139,92,246,0.8),0_0_60px_rgba(139,92,246,0.5)]'
      : 'shadow-[0_0_30px_rgba(147,51,234,0.7),0_0_60px_rgba(147,51,234,0.4)]';
  }
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
    return isNight
      ? 'shadow-[0_0_30px_rgba(99,102,241,0.7),0_0_60px_rgba(99,102,241,0.4)]'
      : 'shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_60px_rgba(59,130,246,0.4)]';
  }
  if (desc.includes('snow') || desc.includes('sleet') || desc.includes('ice')) {
    return isNight
      ? 'shadow-[0_0_30px_rgba(203,213,225,0.8),0_0_60px_rgba(203,213,225,0.5)]'
      : 'shadow-[0_0_30px_rgba(226,232,240,0.7),0_0_60px_rgba(226,232,240,0.4)]';
  }
  if (desc.includes('cloud') || desc.includes('overcast')) {
    return isNight
      ? 'shadow-[0_0_30px_rgba(100,116,139,0.6),0_0_60px_rgba(100,116,139,0.3)]'
      : 'shadow-[0_0_30px_rgba(148,163,184,0.6),0_0_60px_rgba(148,163,184,0.3)]';
  }
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) {
    return isNight
      ? 'shadow-[0_0_30px_rgba(71,85,105,0.6),0_0_60px_rgba(71,85,105,0.3)]'
      : 'shadow-[0_0_30px_rgba(100,116,139,0.6),0_0_60px_rgba(100,116,139,0.3)]';
  }
  if (desc.includes('clear') || desc.includes('sunny')) {
    return isNight
      ? 'shadow-[0_0_30px_rgba(129,140,248,0.7),0_0_60px_rgba(129,140,248,0.4)]'
      : 'shadow-[0_0_30px_rgba(250,204,21,0.8),0_0_60px_rgba(250,204,21,0.5)]';
  }
  if (desc.includes('partly')) {
    return isNight
      ? 'shadow-[0_0_30px_rgba(165,180,252,0.6),0_0_60px_rgba(165,180,252,0.3)]'
      : 'shadow-[0_0_30px_rgba(251,191,36,0.6),0_0_60px_rgba(251,191,36,0.3)]';
  }
  
  return isNight
    ? 'shadow-[0_0_30px_rgba(99,102,241,0.6),0_0_60px_rgba(99,102,241,0.3)]'
    : 'shadow-[0_0_30px_rgba(6,182,212,0.6),0_0_60px_rgba(6,182,212,0.3)]';
}

function getGlowColor(description: string, isNight: boolean): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('storm')) {
    return isNight ? 'from-violet-600/40 to-purple-900/30' : 'from-purple-500/30 to-purple-700/20';
  }
  if (desc.includes('rain') || desc.includes('drizzle')) {
    return isNight ? 'from-indigo-600/40 to-blue-900/30' : 'from-blue-500/30 to-blue-700/20';
  }
  if (desc.includes('snow') || desc.includes('sleet')) {
    return isNight ? 'from-slate-400/40 to-slate-700/30' : 'from-slate-300/30 to-slate-500/20';
  }
  if (desc.includes('cloud') || desc.includes('overcast')) {
    return isNight ? 'from-slate-600/40 to-slate-800/30' : 'from-slate-400/30 to-slate-600/20';
  }
  if (desc.includes('fog') || desc.includes('mist')) {
    return isNight ? 'from-slate-500/30 to-slate-700/20' : 'from-gray-400/30 to-gray-600/20';
  }
  if (desc.includes('clear') || desc.includes('sunny')) {
    return isNight ? 'from-indigo-500/40 to-violet-800/30' : 'from-yellow-400/40 to-orange-500/20';
  }
  if (desc.includes('partly')) {
    return isNight ? 'from-indigo-400/30 to-purple-700/20' : 'from-amber-400/30 to-yellow-500/20';
  }
  
  return isNight ? 'from-indigo-500/30 to-violet-700/20' : 'from-cyan-500/30 to-primary/20';
}

function getWeatherIcon(description: string, isNight: boolean): string {
  if (!isNight) return weatherIconDay;
  
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('storm')) return stormyNightIcon;
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return rainyNightIcon;
  if (desc.includes('snow') || desc.includes('sleet') || desc.includes('ice')) return snowyNightIcon;
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return foggyNightIcon;
  if (desc.includes('overcast')) return cloudyNightIcon;
  if (desc.includes('cloud') || desc.includes('partly')) return partlyCloudyNightIcon;
  if (desc.includes('clear') || desc.includes('sunny')) return clearNightIcon;
  
  return clearNightIcon;
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

  const isNight = weather?.current?.isNight ?? false;
  const description = weather?.current?.description ?? '';
  
  const glowClass = useMemo(() => 
    weather ? getWeatherGlow(description, isNight) : '', 
    [weather, description, isNight]
  );
  
  const gradientClass = useMemo(() => 
    weather ? getGlowColor(description, isNight) : 'from-cyan-500/30 to-primary/20',
    [weather, description, isNight]
  );
  
  const currentIcon = useMemo(() => 
    getWeatherIcon(description, isNight),
    [description, isNight]
  );

  return (
    <>
      <motion.button
        onClick={() => setShowWeatherView(true)}
        className="fixed top-[88px] right-4 z-40 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
        style={{ background: 'none', border: 'none', padding: 0 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-floating-weather"
      >
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : (
          <div className="relative">
            <motion.img
              src={currentIcon}
              alt="Weather"
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
              animate={{ 
                y: [0, -2, 0],
                rotate: isNight ? [0, 1, -1, 0] : [0, 2, -2, 0]
              }}
              transition={{ 
                duration: isNight ? 5 : 3.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            {weather && (
              <span 
                className="absolute -bottom-1 -right-1 text-xs md:text-sm font-mono font-black"
                style={{ 
                  color: '#fff',
                  textShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000'
                }}
              >
                {weather.current.temp}°
              </span>
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
