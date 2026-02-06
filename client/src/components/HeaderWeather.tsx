import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import WeatherRadarFull from "./WeatherRadarFull";

import clearNightIcon from "@assets/generated_images/clear_night_moon_stars_icon_floating.png";
import partlyCloudyNightIcon from "@assets/generated_images/partly_cloudy_night_icon_floating.png";
import cloudyNightIcon from "@assets/generated_images/cloudy_overcast_night_icon_floating.png";
import rainyNightIcon from "@assets/generated_images/rainy_night_icon_floating.png";
import stormyNightIcon from "@assets/generated_images/stormy_night_lightning_icon_floating.png";
import snowyNightIcon from "@assets/generated_images/snowy_night_icon_floating.png";
import foggyNightIcon from "@assets/generated_images/foggy_misty_night_icon_floating.png";
import sunnyDayIcon from "@assets/generated_images/sunny_day_icon_solid_background.png";
import cloudyDayIcon from "@assets/generated_images/cloudy_day_icon_solid_background.png";
import partlyCloudyDayIcon from "@assets/generated_images/partly_cloudy_icon_solid_background.png";
import rainyDayIcon from "@assets/generated_images/rainy_day_icon_solid_background.png";
import snowyDayIcon from "@assets/generated_images/snowy_day_icon_solid_background.png";

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

function getWeatherIcon(description: string, isNight: boolean): string {
  const desc = description.toLowerCase();
  
  if (isNight) {
    if (desc.includes('thunder') || desc.includes('storm')) return stormyNightIcon;
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return rainyNightIcon;
    if (desc.includes('snow') || desc.includes('sleet') || desc.includes('ice')) return snowyNightIcon;
    if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return foggyNightIcon;
    if (desc.includes('overcast')) return cloudyNightIcon;
    if (desc.includes('cloud') || desc.includes('partly')) return partlyCloudyNightIcon;
    if (desc.includes('clear') || desc.includes('sunny')) return clearNightIcon;
    return clearNightIcon;
  }
  
  if (desc.includes('thunder') || desc.includes('storm')) return rainyDayIcon;
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return rainyDayIcon;
  if (desc.includes('snow') || desc.includes('sleet') || desc.includes('ice')) return snowyDayIcon;
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return cloudyDayIcon;
  if (desc.includes('overcast')) return cloudyDayIcon;
  if (desc.includes('cloud') && !desc.includes('partly')) return cloudyDayIcon;
  if (desc.includes('partly') || (desc.includes('cloud') && desc.includes('clear'))) return partlyCloudyDayIcon;
  if (desc.includes('clear') || desc.includes('sunny')) return sunnyDayIcon;
  
  return cloudyDayIcon;
}

export default function HeaderWeather() {
  const [showWeatherView, setShowWeatherView] = useState(false);
  const [localZip, setLocalZip] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('weatherZip');
    if (stored) setLocalZip(stored);
  }, []);

  const effectiveZip = localZip || "37201";

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-card/50">
        <Loader2 className="w-3 h-3 animate-spin text-primary" />
      </div>
    );
  }

  if (!weather) return null;

  const weatherIcon = getWeatherIcon(weather.current.description, isNight);

  return (
    <>
      <button
        onClick={() => setShowWeatherView(true)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-card/50 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
        data-testid="header-weather-btn"
      >
        <img 
          src={weatherIcon} 
          alt={weather.current.description}
          className="w-4 h-4 object-contain"
        />
        <span className="text-[10px] font-mono text-foreground">
          {Math.round(weather.current.temp)}°
        </span>
      </button>

      {showWeatherView && weather && (
        <WeatherRadarFull 
          weather={weather}
          onClose={() => setShowWeatherView(false)} 
        />
      )}
    </>
  );
}
