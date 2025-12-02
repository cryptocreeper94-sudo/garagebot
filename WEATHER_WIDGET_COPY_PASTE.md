# WEATHER WIDGET - COPY/PASTE BLOCK FOR AI AGENTS

Copy this entire block. It contains everything needed to add the GarageBot weather widget to any React/Express app.

---

## GENERATE THESE 8 ICONS FIRST

Save to `attached_assets/generated_images/` (or adjust import paths)

```
ICON 1: weather_icon_floating.png
Prompt: "Friendly cartoon sun with warm rays, 3D render style, floating orb design, bright yellow-orange gradient, soft glow effect, transparent background, weather app icon, 512x512"

ICON 2: clear_night_moon_stars_icon_floating.png
Prompt: "Crescent moon with twinkling stars, soft purple-blue glow, 3D cartoon style, floating orb design, dreamy night sky, transparent background, 512x512"

ICON 3: partly_cloudy_night_icon_floating.png
Prompt: "Crescent moon partially behind fluffy cloud, soft indigo glow, 3D cartoon style, floating design, transparent background, 512x512"

ICON 4: cloudy_overcast_night_icon_floating.png
Prompt: "Dark gray fluffy clouds, subtle moonlight glow behind, 3D cartoon style, moody atmosphere, transparent background, 512x512"

ICON 5: rainy_night_icon_floating.png
Prompt: "Dark cloud with falling rain drops, subtle blue-purple glow, 3D cartoon style, moody rainy night, transparent background, 512x512"

ICON 6: stormy_night_lightning_icon_floating.png
Prompt: "Dark storm cloud with bright lightning bolt, dramatic purple-violet glow, 3D cartoon style, electric atmosphere, transparent background, 512x512"

ICON 7: snowy_night_icon_floating.png
Prompt: "Fluffy cloud with falling snowflakes, soft white-blue glow, 3D cartoon style, winter night feel, transparent background, 512x512"

ICON 8: foggy_misty_night_icon_floating.png
Prompt: "Layered fog/mist clouds, subtle gray-blue glow, mysterious atmosphere, 3D cartoon style, transparent background, 512x512"
```

---

## FILE 1: server/services/weather.ts

```typescript
interface WeatherData {
  location: { city: string; state?: string; country: string; lat: number; lon: number };
  current: { temp: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; description: string; icon: string; visibility: number; pressure: number; isNight: boolean };
  hourly: Array<{ time: string; temp: number; icon: string; description: string; precipitation: number }>;
  daily: Array<{ date: string; tempHigh: number; tempLow: number; icon: string; description: string; precipitation: number }>;
}

interface GeocodingResult { lat: number; lon: number; name: string; state?: string; country: string }

export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  private getWeatherIcon(code: number, isDay: boolean = true): string {
    const icons: Record<number, { day: string; night: string }> = {
      0: { day: '☀️', night: '🌙' }, 1: { day: '🌤️', night: '🌤️' }, 2: { day: '⛅', night: '☁️' }, 3: { day: '☁️', night: '☁️' },
      45: { day: '🌫️', night: '🌫️' }, 48: { day: '🌫️', night: '🌫️' },
      51: { day: '🌧️', night: '🌧️' }, 53: { day: '🌧️', night: '🌧️' }, 55: { day: '🌧️', night: '🌧️' },
      56: { day: '🌨️', night: '🌨️' }, 57: { day: '🌨️', night: '🌨️' },
      61: { day: '🌧️', night: '🌧️' }, 63: { day: '🌧️', night: '🌧️' }, 65: { day: '🌧️', night: '🌧️' },
      66: { day: '🌨️', night: '🌨️' }, 67: { day: '🌨️', night: '🌨️' },
      71: { day: '❄️', night: '❄️' }, 73: { day: '❄️', night: '❄️' }, 75: { day: '❄️', night: '❄️' }, 77: { day: '❄️', night: '❄️' },
      80: { day: '🌦️', night: '🌧️' }, 81: { day: '🌦️', night: '🌧️' }, 82: { day: '⛈️', night: '⛈️' },
      85: { day: '🌨️', night: '🌨️' }, 86: { day: '🌨️', night: '🌨️' },
      95: { day: '⛈️', night: '⛈️' }, 96: { day: '⛈️', night: '⛈️' }, 99: { day: '⛈️', night: '⛈️' },
    };
    const iconSet = icons[code] || icons[0];
    return isDay ? iconSet.day : iconSet.night;
  }

  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      66: 'Light freezing rain', 67: 'Heavy freezing rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
      80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      85: 'Slight snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
    };
    return descriptions[code] || 'Unknown';
  }

  async geocodeZip(zipCode: string): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(`${this.geocodingUrl}/search?name=${zipCode}&count=1&language=en&format=json`);
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.results?.length) return null;
      const r = data.results[0];
      return { lat: r.latitude, lon: r.longitude, name: r.name, state: r.admin1, country: r.country_code };
    } catch { return null; }
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(), longitude: lon.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,is_day',
        hourly: 'temperature_2m,weather_code,precipitation_probability',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        temperature_unit: 'fahrenheit', wind_speed_unit: 'mph', precipitation_unit: 'inch',
        timezone: 'auto', forecast_days: '7', forecast_hours: '24',
      });
      const response = await fetch(`${this.baseUrl}/forecast?${params}`);
      if (!response.ok) throw new Error('Weather API error');
      const data = await response.json();
      const isDay = data.current?.is_day === 1;

      return {
        location: { city: '', country: '', lat, lon },
        current: {
          temp: Math.round(data.current?.temperature_2m || 0),
          feelsLike: Math.round(data.current?.apparent_temperature || 0),
          humidity: data.current?.relative_humidity_2m || 0,
          windSpeed: Math.round(data.current?.wind_speed_10m || 0),
          windDirection: this.getWindDirection(data.current?.wind_direction_10m || 0),
          description: this.getWeatherDescription(data.current?.weather_code || 0),
          icon: this.getWeatherIcon(data.current?.weather_code || 0, isDay),
          visibility: Math.round((data.current?.visibility || 0) / 1609.34),
          pressure: Math.round((data.current?.surface_pressure || 0) * 0.02953),
          isNight: !isDay,
        },
        hourly: (data.hourly?.time || []).slice(0, 24).map((time: string, i: number) => ({
          time: new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }),
          temp: Math.round(data.hourly?.temperature_2m?.[i] || 0),
          icon: this.getWeatherIcon(data.hourly?.weather_code?.[i] || 0, true),
          description: this.getWeatherDescription(data.hourly?.weather_code?.[i] || 0),
          precipitation: data.hourly?.precipitation_probability?.[i] || 0,
        })),
        daily: (data.daily?.time || []).map((date: string, i: number) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          tempHigh: Math.round(data.daily?.temperature_2m_max?.[i] || 0),
          tempLow: Math.round(data.daily?.temperature_2m_min?.[i] || 0),
          icon: this.getWeatherIcon(data.daily?.weather_code?.[i] || 0, true),
          description: this.getWeatherDescription(data.daily?.weather_code?.[i] || 0),
          precipitation: data.daily?.precipitation_probability_max?.[i] || 0,
        })),
      };
    } catch { return null; }
  }

  async getWeatherByZip(zipCode: string): Promise<WeatherData | null> {
    const location = await this.geocodeZip(zipCode);
    if (!location) return null;
    const weather = await this.getWeather(location.lat, location.lon);
    if (!weather) return null;
    weather.location = { ...weather.location, city: location.name, state: location.state, country: location.country };
    return weather;
  }
}

export const weatherService = new WeatherService();
```

---

## FILE 2: Add to server/routes.ts

```typescript
import { weatherService } from "./services/weather";

app.get("/api/weather/zip/:zipCode", async (req, res) => {
  try {
    const weather = await weatherService.getWeatherByZip(req.params.zipCode);
    if (!weather) return res.status(404).json({ error: "Location not found" });
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});
```

---

## FILE 3: client/src/components/FloatingWeatherButton.tsx

```tsx
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import weatherIconDay from "@assets/generated_images/weather_icon_floating.png";
import clearNightIcon from "@assets/generated_images/clear_night_moon_stars_icon_floating.png";
import partlyCloudyNightIcon from "@assets/generated_images/partly_cloudy_night_icon_floating.png";
import cloudyNightIcon from "@assets/generated_images/cloudy_overcast_night_icon_floating.png";
import rainyNightIcon from "@assets/generated_images/rainy_night_icon_floating.png";
import stormyNightIcon from "@assets/generated_images/stormy_night_lightning_icon_floating.png";
import snowyNightIcon from "@assets/generated_images/snowy_night_icon_floating.png";
import foggyNightIcon from "@assets/generated_images/foggy_misty_night_icon_floating.png";

interface WeatherData {
  location: { city: string; state?: string; country: string; lat: number; lon: number };
  current: { temp: number; feelsLike: number; humidity: number; windSpeed: number; windDirection: string; description: string; icon: string; visibility: number; pressure: number; isNight?: boolean };
  hourly: Array<{ time: string; temp: number; icon: string; description: string; precipitation: number }>;
  daily: Array<{ date: string; tempHigh: number; tempLow: number; icon: string; description: string; precipitation: number }>;
}

function getWeatherGlow(description: string, isNight: boolean): string {
  const desc = description.toLowerCase();
  if (desc.includes('thunder') || desc.includes('storm')) return isNight ? 'shadow-[0_0_30px_rgba(139,92,246,0.8),0_0_60px_rgba(139,92,246,0.5)]' : 'shadow-[0_0_30px_rgba(147,51,234,0.7),0_0_60px_rgba(147,51,234,0.4)]';
  if (desc.includes('rain') || desc.includes('drizzle')) return isNight ? 'shadow-[0_0_30px_rgba(99,102,241,0.7),0_0_60px_rgba(99,102,241,0.4)]' : 'shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_60px_rgba(59,130,246,0.4)]';
  if (desc.includes('snow') || desc.includes('sleet')) return isNight ? 'shadow-[0_0_30px_rgba(203,213,225,0.8),0_0_60px_rgba(203,213,225,0.5)]' : 'shadow-[0_0_30px_rgba(226,232,240,0.7),0_0_60px_rgba(226,232,240,0.4)]';
  if (desc.includes('cloud') || desc.includes('overcast')) return isNight ? 'shadow-[0_0_30px_rgba(100,116,139,0.6),0_0_60px_rgba(100,116,139,0.3)]' : 'shadow-[0_0_30px_rgba(148,163,184,0.6),0_0_60px_rgba(148,163,184,0.3)]';
  if (desc.includes('fog') || desc.includes('mist')) return isNight ? 'shadow-[0_0_30px_rgba(71,85,105,0.6),0_0_60px_rgba(71,85,105,0.3)]' : 'shadow-[0_0_30px_rgba(100,116,139,0.6),0_0_60px_rgba(100,116,139,0.3)]';
  if (desc.includes('clear') || desc.includes('sunny')) return isNight ? 'shadow-[0_0_30px_rgba(129,140,248,0.7),0_0_60px_rgba(129,140,248,0.4)]' : 'shadow-[0_0_30px_rgba(250,204,21,0.8),0_0_60px_rgba(250,204,21,0.5)]';
  return isNight ? 'shadow-[0_0_30px_rgba(99,102,241,0.6),0_0_60px_rgba(99,102,241,0.3)]' : 'shadow-[0_0_30px_rgba(6,182,212,0.6),0_0_60px_rgba(6,182,212,0.3)]';
}

function getGlowColor(description: string, isNight: boolean): string {
  const desc = description.toLowerCase();
  if (desc.includes('thunder') || desc.includes('storm')) return isNight ? 'from-violet-600/40 to-purple-900/30' : 'from-purple-500/30 to-purple-700/20';
  if (desc.includes('rain') || desc.includes('drizzle')) return isNight ? 'from-indigo-600/40 to-blue-900/30' : 'from-blue-500/30 to-blue-700/20';
  if (desc.includes('snow') || desc.includes('sleet')) return isNight ? 'from-slate-400/40 to-slate-700/30' : 'from-slate-300/30 to-slate-500/20';
  if (desc.includes('cloud') || desc.includes('overcast')) return isNight ? 'from-slate-600/40 to-slate-800/30' : 'from-slate-400/30 to-slate-600/20';
  if (desc.includes('fog') || desc.includes('mist')) return isNight ? 'from-slate-500/30 to-slate-700/20' : 'from-gray-400/30 to-gray-600/20';
  if (desc.includes('clear') || desc.includes('sunny')) return isNight ? 'from-indigo-500/40 to-violet-800/30' : 'from-yellow-400/40 to-orange-500/20';
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
  return clearNightIcon;
}

export default function FloatingWeatherButton() {
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
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  });

  const isNight = weather?.current?.isNight ?? false;
  const description = weather?.current?.description ?? '';
  const glowClass = useMemo(() => weather ? getWeatherGlow(description, isNight) : '', [weather, description, isNight]);
  const gradientClass = useMemo(() => weather ? getGlowColor(description, isNight) : 'from-cyan-500/30 to-primary/20', [weather, description, isNight]);
  const currentIcon = useMemo(() => getWeatherIcon(description, isNight), [description, isNight]);

  return (
    <motion.button
      onClick={() => console.log('Weather clicked', weather)}
      className={`fixed bottom-24 right-4 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${gradientClass} backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 ${glowClass}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.img
            src={currentIcon}
            alt="Weather"
            className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-lg"
            animate={{ y: [0, -3, 0], rotate: isNight ? [0, 1, -1, 0] : [0, 2, -2, 0] }}
            transition={{ duration: isNight ? 6 : 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {weather && (
            <div className={`absolute -bottom-1 -right-1 backdrop-blur-sm rounded-full px-1.5 py-0.5 border ${isNight ? 'bg-indigo-900/80 border-indigo-400/30' : 'bg-black/80 border-white/20'}`}>
              <span className={`text-[10px] font-mono font-bold ${isNight ? 'text-indigo-100' : 'text-white'}`}>
                {weather.current.temp}°
              </span>
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}
```

---

## FILE 4: Add to App.tsx

```tsx
import FloatingWeatherButton from "./components/FloatingWeatherButton";

// Inside your App component, add:
<FloatingWeatherButton />
```

---

## FILE 5: vite.config.ts alias (if not already present)

```typescript
resolve: {
  alias: {
    "@assets": path.resolve(import.meta.dirname, "attached_assets"),
  },
},
```

---

## DEPENDENCIES

```bash
npm install framer-motion @tanstack/react-query lucide-react
```

---

## HOW IT WORKS

1. Uses FREE Open-Meteo API (no API key needed)
2. Backend geocodes ZIP → coordinates → fetches weather
3. Returns `isNight` boolean based on location's sunrise/sunset
4. Frontend selects icon based on day/night + weather condition
5. Glow colors change dynamically (purple=storm, blue=rain, yellow=sun, etc.)
6. User's ZIP saved to localStorage, defaults to NYC (10001)

---

## TO CUSTOMIZE

- Change default ZIP: Edit `effectiveZip = localZip || "YOUR_ZIP"`
- Change position: Edit `fixed bottom-24 right-4` classes
- Add click handler: Replace `console.log` with modal/navigation
- Change glow intensity: Adjust rgba values in glow functions
